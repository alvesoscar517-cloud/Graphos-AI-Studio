/**
 * Analysis Controller
 * Handles text analysis, AI detection, rewriting
 */

const { db, FieldValue } = require('../config/firebase');
const geminiService = require('../services/gemini.service');
const analysisService = require('../services/analysis.service');
const cacheService = require('../services/cache.service');
const logger = require('../utils/logger');
const { validateText, validateProfileId, validateModel } = require('../utils/validation');
const activityLogService = require('../services/activityLog.service');
const { createLocalizer } = require('../utils/localized-messages.util');
const localization = require('../services/localization.service');

// ============================================================================
// AUTHENTICATE CONTENT (AI DETECTION)
// ============================================================================

exports.authenticateContent = async (req, res) => {
  try {
    const { text, user_id, enhanced = true } = req.body;

    const validText = validateText(text, 50, 20000);

    // Use enhanced detection by default for better accuracy
    const detectionResult = enhanced 
      ? await geminiService.detectAIContentEnhanced(validText)
      : await geminiService.detectAIContent(validText);
    
    const { 
      aiProbability, 
      confidence: detectionConfidence, 
      evidence, 
      humanIndicators = [], 
      aiIndicators = [],
      multiPass = false,
      keyFactor = null
    } = detectionResult;

    const textFeatures = analysisService.calculateStatistics(text);

    const isAuthentic = aiProbability < 50;
    
    // Use detection confidence if available, otherwise calculate from probability
    const confidence = detectionConfidence || Math.abs(aiProbability - 50) * 2;

    // Get language from request
    const l = createLocalizer(req);
    const language = req.body.language || textFeatures.detectedLanguage || l.lang;

    // Generate localized verdict based on probability ranges
    const verdict = l.verdict(aiProbability);
    const confidenceInfo = l.confidence(confidence);

    const result = {
      success: true,
      is_authentic: isAuthentic,
      ai_probability: parseFloat(aiProbability.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(2)),
      confidence_level: confidenceInfo.level,
      confidence_message: confidenceInfo.message,
      evidence,
      human_indicators: humanIndicators,
      ai_indicators: aiIndicators,
      text_statistics: textFeatures,
      verdict,
      language,
      analysis_details: {
        multi_pass: multiPass,
        key_factor: keyFactor,
        text_length: validText.length,
        word_count: textFeatures.totalWords
      }
    };

    if (user_id) {
      await db.collection('users').doc(user_id).update({
        'usage.analysesCount': FieldValue.increment(1)
      });
      
      // Log activity
      activityLogService.logFeatureUsage(user_id, 'ai_detection', {
        wordCount: textFeatures.totalWords,
        aiProbability,
        isAuthentic
      });
    }

    logger.info('Content authenticated', { 
      aiProbability, 
      confidence, 
      isAuthentic, 
      multiPass,
      wordCount: textFeatures.totalWords 
    });

    res.json(result);
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    const l = createLocalizer(req);
    res.status(500).json({ 
      success: false,
      ...l.error('analysis_failed'),
      details: String(error)
    });
  }
};

// ============================================================================
// ANALYZE TEXT
// ============================================================================

exports.analyzeText = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { profile_id, text, user_id, use_cache = true } = req.body;

    const profileId = validateProfileId(profile_id);
    const validText = validateText(text, 10, 20000);

    if (use_cache) {
      const cachedResult = cacheService.getCachedAnalysis(profileId, validText);
      if (cachedResult) {
        logger.info('Analysis cache hit', { profileId });
        // Localize cached result
        const localizedResult = l.localizeResult(cachedResult);
        return res.json({ ...localizedResult, cache_hit: true });
      }
    }

    const startTime = Date.now();

    let cachedData = cacheService.getCachedProfile(profileId);
    let profileData, sampleVectors, centroid;

    if (cachedData) {
      profileData = cachedData.profileData;
      sampleVectors = cachedData.sampleVectors;
      centroid = cachedData.centroid;
    } else {
      const profileDoc = await db.collection('voice_profiles').doc(profileId).get();
      if (!profileDoc.exists) {
        return res.status(404).json({ success: false, ...l.error('not_found') });
      }

      profileData = profileDoc.data();

      if (profileData.status !== 'ready') {
        return res.status(400).json({ success: false, ...l.error('invalid_input'), details: l.t('voice_profile.not_found') });
      }

      const samplesSnapshot = await db.collection('voice_profiles')
        .doc(profileId)
        .collection('samples')
        .limit(50)
        .get();
      
      const samples = samplesSnapshot.docs.map(doc => doc.data());
      
      // Prepare samples with type info for weighted centroid
      const samplesWithType = samples
        .filter(s => s.vector && s.vector.length > 0)
        .map(s => ({
          vector: s.vector,
          type: s.type || (s.wordCount >= 800 ? 'long' : 'short')
        }));
      
      sampleVectors = samplesWithType.map(s => s.vector);

      if (sampleVectors.length === 0) {
        return res.status(400).json({ success: false, ...l.error('invalid_input'), details: 'Profile samples have no embeddings' });
      }

      // Use weighted centroid - long samples have higher weight
      centroid = analysisService.calculateWeightedCentroid(samplesWithType);
      
      cacheService.setCachedProfile(profileId, {
        profileData,
        sampleVectors,
        centroid
      });
    }

    const sentences = analysisService.splitIntoSentences(validText);
    const validSentences = sentences.filter(s => s.split(/\s+/).length >= 3);

    if (validSentences.length === 0) {
      return res.status(400).json({ success: false, ...l.error('text_too_short', { min: 3 }) });
    }

    // Use multi-language aware statistics
    const [sentenceVectors, textFeatures] = await Promise.all([
      geminiService.createBatchEmbeddings(validSentences, 'RETRIEVAL_QUERY'),
      Promise.resolve(analysisService.calculateStatisticsMultiLang(validText))
    ]);

    const sentenceAnalyses = [];
    const allSimilarities = [];
    const centroidSimilarities = [];

    // Calculate threshold once for all sentences
    const allCentroidSims = [];
    for (let idx = 0; idx < validSentences.length; idx++) {
      const sentenceVector = sentenceVectors[idx];
      const centroidSim = analysisService.calculateCosineSimilarity(sentenceVector, centroid);
      allCentroidSims.push(centroidSim);
    }
    
    const thresholdData = analysisService.calculateDynamicThreshold(allCentroidSims);

    for (let idx = 0; idx < validSentences.length; idx++) {
      const sentence = validSentences[idx];
      const sentenceVector = sentenceVectors[idx];

      const centroidSimilarity = allCentroidSims[idx];
      centroidSimilarities.push(centroidSimilarity);

      const similarities = sampleVectors
        .map(sampleVec => analysisService.calculateCosineSimilarity(sentenceVector, sampleVec))
        .sort((a, b) => b - a)
        .slice(0, 10);

      const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
      allSimilarities.push(avgSimilarity);

      // Use new severity-based deviation detection
      const severity = analysisService.getDeviationSeverity(centroidSimilarity, thresholdData);
      const isDeviant = severity !== null;

      sentenceAnalyses.push({
        sentence,
        index: idx,
        similarityScore: parseFloat(avgSimilarity.toFixed(3)),
        centroidSimilarity: parseFloat(centroidSimilarity.toFixed(3)),
        isDeviant,
        deviationSeverity: severity // 'mild', 'moderate', 'severe', or null
      });
    }

    const vectorScore = centroidSimilarities.length > 0
      ? (centroidSimilarities.reduce((a, b) => a + b, 0) / centroidSimilarities.length) * 100
      : 0;

    // Use enhanced statistical comparison
    const statisticalResult = analysisService.compareStatisticalFeatures(textFeatures, profileData.statisticalFeatures);
    const statisticalScore = typeof statisticalResult === 'object' ? statisticalResult.score : statisticalResult;
    const statisticalBreakdown = typeof statisticalResult === 'object' ? statisticalResult.breakdown : null;

    const sampleCount = sampleVectors.length;
    const embeddingWeight = Math.min(0.8, 0.5 + (sampleCount / 100) * 0.3);
    const statisticalWeight = 1 - embeddingWeight;

    const voiceCompatibility = vectorScore * embeddingWeight + statisticalScore * statisticalWeight;

    // Calculate confidence score
    const confidenceResult = analysisService.calculateAnalysisConfidence(centroidSimilarities, sampleCount);

    const processingTime = Date.now() - startTime;

    // Count deviations by severity
    const deviationCounts = {
      mild: sentenceAnalyses.filter(s => s.deviationSeverity === 'mild').length,
      moderate: sentenceAnalyses.filter(s => s.deviationSeverity === 'moderate').length,
      severe: sentenceAnalyses.filter(s => s.deviationSeverity === 'severe').length
    };

    // Get deviant sentences for batch suggestion analysis
    const deviantSentences = sentenceAnalyses
      .filter(s => s.isDeviant)
      .map(s => ({
        sentence: s.sentence,
        score: s.centroidSimilarity,
        index: s.index,
        severity: s.deviationSeverity
      }));

    // Batch analyze issues for deviant sentences (with caching)
    const sentenceSuggestions = {};
    if (deviantSentences.length > 0) {
      const batchResults = analysisService.batchAnalyzeSentenceIssues(
        deviantSentences,
        profileId,
        profileData.statisticalFeatures,
        profileData.voiceProfile
      );
      
      // Generate AI suggestions and rewrites for top deviant sentences (limit to 5 for performance)
      const topDeviant = deviantSentences
        .sort((a, b) => {
          const severityOrder = { severe: 0, moderate: 1, mild: 2 };
          return (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3);
        })
        .slice(0, 5);

      // Generate AI suggestions in parallel
      const aiSuggestionsPromises = topDeviant.map(async (item) => {
        const issues = batchResults[item.index]?.issues || [];
        if (issues.length === 0) return null;
        
        try {
          const [aiSuggestions, rewritten] = await Promise.all([
            geminiService.generateImprovementSuggestions(
              item.sentence,
              issues,
              profileData.voiceProfile,
              {},
              profileId
            ),
            geminiService.rewriteWithVoice(item.sentence, profileData.voiceProfile, {})
          ]);
          
          return {
            index: item.index,
            sentence: item.sentence,
            suggestions: aiSuggestions,
            rewritten
          };
        } catch (err) {
          console.error(`[WARN] Failed to generate AI suggestions for sentence ${item.index}:`, err.message);
          return null;
        }
      });

      const aiResults = await Promise.all(aiSuggestionsPromises);
      
      // Convert to sentence-keyed object for frontend
      Object.entries(batchResults).forEach(([index, data]) => {
        const deviant = deviantSentences.find(s => s.index === parseInt(index));
        if (!deviant) return;
        
        const sentence = deviant.sentence;
        const aiResult = aiResults.find(r => r && r.index === parseInt(index));
        
        sentenceSuggestions[sentence] = {
          ...data,
          severity: deviant.severity,
          suggestions: aiResult?.suggestions || data.issues?.map(i => ({ 
            type: i.type, 
            severity: i.severity, 
            suggestion: i.detail 
          })) || [],
          rewritten: aiResult?.rewritten || null
        };
      });
    }

    // Determine style type from profile voice
    const styleType = profileData.voiceProfile?.tone === 'academic' ? 'academic' 
      : profileData.voiceProfile?.tone === 'casual' ? 'casual'
      : profileData.voiceProfile?.tone === 'professional' ? 'professional'
      : 'blog';

    // Compare with benchmark and profile
    const benchmarkComparison = analysisService.compareWithBenchmark(
      textFeatures, 
      profileData.statisticalFeatures,
      styleType
    );

    // Get voice match info
    const voiceMatchInfo = l.voiceMatch(voiceCompatibility);
    const confidenceInfo = l.confidence(confidenceResult.confidence);

    // Localize deviant sentences with severity messages
    const localizedDeviantSentences = deviantSentences.map(s => ({
      ...s,
      severity_message: l.deviation(s.severity)
    }));

    // Localize benchmark comparison
    const localizedBenchmark = l.localizeBenchmark(benchmarkComparison);

    const result = {
      success: true,
      voice_compatibility_score: parseFloat(voiceCompatibility.toFixed(2)),
      voice_match_level: voiceMatchInfo.level,
      voice_match_message: voiceMatchInfo.message,
      vector_score: parseFloat(vectorScore.toFixed(2)),
      statistical_score: parseFloat(statisticalScore.toFixed(2)),
      statistical_breakdown: statisticalBreakdown,
      confidence: confidenceResult.confidence,
      confidence_level: confidenceInfo.level,
      confidence_message: confidenceInfo.message,
      confidence_factors: confidenceResult.factors,
      sentence_analysis: sentenceAnalyses,
      sentence_suggestions: sentenceSuggestions,
      deviant_sentences: localizedDeviantSentences,
      deviation_summary: {
        total: deviationCounts.mild + deviationCounts.moderate + deviationCounts.severe,
        by_severity: deviationCounts
      },
      threshold_info: {
        base: thresholdData.threshold,
        severity_thresholds: thresholdData.severityThresholds,
        stats: thresholdData.stats
      },
      statistics: textFeatures,
      detected_language: textFeatures.detectedLanguage,
      language: l.lang,
      // Localized benchmark comparison with suggestions
      benchmark_comparison: localizedBenchmark,
      improvement_suggestions: localizedBenchmark.suggestions,
      benchmark_score: benchmarkComparison.overallBenchmarkScore,
      profile_name: profileData.name,
      samples_used: sampleCount,
      embedding_weight: embeddingWeight,
      statistical_weight: statisticalWeight,
      processing_time_ms: processingTime,
      cache_hit: cachedData !== null
    };

    if (use_cache) {
      cacheService.setCachedAnalysis(profileId, validText, result);
    }

    if (user_id) {
      await db.collection('users').doc(user_id).update({
        'usage.analysesCount': FieldValue.increment(1)
      });
      
      // Log activity
      activityLogService.logFeatureUsage(user_id, 'text_analysis', {
        profileId,
        wordCount: textFeatures.totalWords,
        voiceCompatibility: parseFloat(voiceCompatibility.toFixed(2)),
        duration: processingTime
      });
    }

    logger.info('Text analyzed', { profileId, voiceCompatibility, processingTime });

    res.json(result);
  } catch (error) {
    logger.error('Analysis error', { error: error.message });
    res.status(500).json({ 
      success: false,
      ...l.error('analysis_failed'),
      details: String(error)
    });
  }
};

// ============================================================================
// SUGGEST IMPROVEMENTS
// ============================================================================

exports.suggestImprovements = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { profile_id, sentence, sentence_score } = req.body;

    if (!profile_id || !sentence) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    if (sentence_score >= 0.8) {
      return res.json({
        success: true,
        suggestions: [],
        rewritten: sentence,
        confidence: 100,
        skipped: true
      });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ success: false, ...l.error('not_found') });
    }

    const profileData = profileDoc.data();

    const issues = analysisService.analyzeSentenceIssues(
      sentence,
      profileData.statisticalFeatures,
      profileData.voiceProfile
    );

    const voiceProfile = profileData.voiceProfile || profileData.promptableSummary;
    
    // Generate AI-powered suggestions
    const suggestions = await geminiService.generateImprovementSuggestions(
      sentence,
      issues,
      voiceProfile,
      {}
    );

    const rewritten = await geminiService.rewriteWithVoice(sentence, voiceProfile, {});

    const confidence = analysisService.calculateSuggestionConfidence(issues, sentence_score || 0.5);

    res.json({
      success: true,
      suggestions,
      rewritten,
      confidence,
      issues_found: issues.length
    });
  } catch (error) {
    console.error('[ERROR] Suggestion generation error:', error);
    res.status(500).json({ success: false, ...l.error('server_error'), details: String(error) });
  }
};

// ============================================================================
// REWRITE TEXT (Enhanced with Anti-AI Detection)
// ============================================================================

exports.rewriteText = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { 
      profile_id, 
      text, 
      user_id, 
      context, 
      model: requestedModel = 'gemini-2.5-flash', 
      writing_preferences,
      // New options for enhanced humanization
      use_iterative_refinement = false,
      max_iterations = 2,
      target_ai_probability = 40,
      check_ai_after = true
    } = req.body;

    // Validate model
    const model = validateModel(requestedModel, 'gemini-2.5-flash');

    if (!profile_id || !text) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ success: false, ...l.error('not_found') });
    }

    const profileData = profileDoc.data();

    if (profileData.status !== 'ready') {
      return res.status(400).json({ success: false, ...l.error('invalid_input'), details: l.t('voice_profile.not_found') });
    }

    const voiceProfile = profileData.voiceProfile || profileData.promptableSummary;

    if (!voiceProfile) {
      return res.status(400).json({
        success: false,
        ...l.error('invalid_input'),
        details: l.t('voice_profile.not_found')
      });
    }

    // Get a sample text from profile for few-shot learning
    let sampleText = null;
    try {
      const samplesSnapshot = await db.collection('voice_profiles')
        .doc(profile_id)
        .collection('samples')
        .where('type', '==', 'long')
        .limit(1)
        .get();
      
      if (!samplesSnapshot.empty) {
        sampleText = samplesSnapshot.docs[0].data().text;
      }
    } catch (e) {
      console.log('[WARN] Could not fetch sample text for few-shot:', e.message);
    }

    // Enhance context with writing preferences and new options
    let enhancedContext = { ...context, sampleText };
    if (writing_preferences) {
      enhancedContext.writingPreferences = {
        useVocabularyPreferences: writing_preferences.useVocabularyPreferences,
        useKeyCharacteristics: writing_preferences.useKeyCharacteristics,
        useSentencePatterns: writing_preferences.useSentencePatterns,
        useRewriteInstructions: writing_preferences.useRewriteInstructions
      };
    }

    // Add iterative refinement options
    if (use_iterative_refinement) {
      enhancedContext.useIterativeRefinement = true;
      enhancedContext.maxIterations = max_iterations;
      enhancedContext.targetProbability = target_ai_probability;
    }

    const startTime = Date.now();
    const rewrittenText = await geminiService.rewriteWithVoice(text, voiceProfile, enhancedContext, model);
    const processingTime = Date.now() - startTime;

    // Optionally check AI probability after rewrite
    let aiCheck = null;
    if (check_ai_after) {
      try {
        aiCheck = await geminiService.detectAIContentEnhanced(rewrittenText);
        logger.info('Post-rewrite AI check', { 
          aiProbability: aiCheck.aiProbability,
          confidence: aiCheck.confidence 
        });
      } catch (e) {
        console.log('[WARN] Post-rewrite AI check failed:', e.message);
      }
    }

    if (user_id) {
      await db.collection('users').doc(user_id).update({
        'usage.rewritesCount': FieldValue.increment(1)
      });
      
      // Log activity
      activityLogService.logFeatureUsage(user_id, 'text_rewrite', {
        profileId: profile_id,
        inputLength: text.length,
        outputLength: rewrittenText.length,
        duration: processingTime,
        model
      });
    }

    // Localize AI check results
    const localizedAiCheck = aiCheck ? {
      ai_probability: aiCheck.aiProbability,
      confidence: aiCheck.confidence,
      verdict: l.verdict(aiCheck.aiProbability),
      confidence_info: l.confidence(aiCheck.confidence),
      human_indicators: aiCheck.humanIndicators || [],
      ai_indicators: aiCheck.aiIndicators || []
    } : null;

    res.json({
      success: true,
      original_text: text,
      rewritten_text: rewrittenText,
      profile_name: profileData.name,
      tone: profileData.voiceProfile?.tone || 'neutral',
      processing_time_ms: processingTime,
      language: l.lang,
      ai_check: localizedAiCheck,
      humanization_applied: true,
      message: l.t('humanize.complete')
    });
  } catch (error) {
    console.error('[ERROR] Rewrite error:', error);
    res.status(500).json({ success: false, ...l.error('server_error'), details: String(error) });
  }
};

// ============================================================================
// REWRITE TEXT STREAM (Enhanced with Anti-AI Detection)
// ============================================================================

exports.rewriteTextStream = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { profile_id, text, model: requestedModel, user_id, writing_preferences } = req.body;

    // Validate model
    const model = validateModel(requestedModel, 'gemini-2.5-flash');

    if (!profile_id || !text) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ success: false, ...l.error('not_found') });
    }

    const profileData = profileDoc.data();
    const voiceProfile = profileData.voiceProfile || profileData.promptableSummary;

    // Get sample text for few-shot learning
    let sampleText = null;
    try {
      const samplesSnapshot = await db.collection('voice_profiles')
        .doc(profile_id)
        .collection('samples')
        .where('type', '==', 'long')
        .limit(1)
        .get();
      
      if (!samplesSnapshot.empty) {
        sampleText = samplesSnapshot.docs[0].data().text?.substring(0, 1000);
      }
    } catch (e) {
      console.log('[WARN] Could not fetch sample text:', e.message);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Import humanize service for enhanced prompt
    const humanizeService = require('../services/humanize.service');
    
    // Build enhanced prompt with anti-AI detection rules
    const prompt = humanizeService.buildEnhancedRewritePrompt(
      text,
      voiceProfile,
      sampleText,
      {}
    );

    const modelName = model || 'gemini-2.5-flash';
    const generativeModel = geminiService.vertexAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.8, // Higher for more natural variation
        topP: 0.9,
        topK: 40
      }
    });

    const result = await generativeModel.generateContentStream(prompt);

    let fullText = '';
    for await (const chunk of result.stream) {
      try {
        // Try different ways to extract text from chunk
        let chunkText = null;
        
        if (typeof chunk.text === 'function') {
          chunkText = chunk.text();
        } else if (chunk.candidates && chunk.candidates[0]) {
          const candidate = chunk.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
            chunkText = candidate.content.parts[0].text;
          }
        } else if (chunk.text) {
          chunkText = chunk.text;
        }
        
        if (chunkText) {
          fullText += chunkText;
          res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
        }
      } catch (chunkError) {
        console.error('Error processing chunk:', chunkError);
      }
    }

    // Apply human imperfections to final text (post-processing)
    // Note: For streaming, we apply lighter post-processing
    const formalityLevel = voiceProfile?.formality_level || 5;
    if (formalityLevel < 7 && fullText.length > 0) {
      // Apply contractions if needed (light touch for streaming)
      const processedText = humanizeService.addContractions(fullText, 0.3);
      if (processedText !== fullText) {
        // Send a final correction chunk
        const correction = processedText.substring(fullText.length - 50);
        // Note: In streaming mode, we can't easily replace text
        // The main humanization happens in the prompt
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();

    if (user_id) {
      await db.collection('users').doc(user_id).update({
        'usage.rewritesCount': FieldValue.increment(1)
      });
      
      // Log activity
      activityLogService.logFeatureUsage(user_id, 'text_rewrite', {
        profileId: profile_id,
        inputLength: text.length,
        outputLength: fullText.length,
        model,
        streaming: true
      });
    }
  } catch (error) {
    console.error('[ERROR] Streaming rewrite error:', error);
    res.write(`data: ${JSON.stringify({ error: String(error) })}\n\n`);
    res.end();
  }
};

// ============================================================================
// HUMANIZATION CHECK - Get suggestions to make text more human-like
// ============================================================================

exports.checkHumanization = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, ...l.error('text_required') });
    }

    const humanizeService = require('../services/humanize.service');
    
    // Get humanization suggestions
    const suggestions = await humanizeService.getHumanizationSuggestions(text);
    
    // Also run AI detection
    const aiDetection = await geminiService.detectAIContentEnhanced(text);

    // Localized recommendation
    const recommendation = l.t(
      aiDetection.aiProbability > 60 
        ? 'humanize.changes_applied'
        : aiDetection.aiProbability > 40
        ? 'ai_detection.result_mixed'
        : 'humanize.no_changes_needed',
      { count: suggestions.suggestions?.length || 0 }
    );

    res.json({
      success: true,
      ai_probability: aiDetection.aiProbability,
      ai_confidence: aiDetection.confidence,
      verdict: l.verdict(aiDetection.aiProbability),
      confidence_info: l.confidence(aiDetection.confidence),
      humanization_suggestions: suggestions.suggestions,
      overall_risk: suggestions.overallRisk,
      ai_indicators: aiDetection.aiIndicators || [],
      human_indicators: aiDetection.humanIndicators || [],
      recommendation,
      language: l.lang
    });
  } catch (error) {
    console.error('[ERROR] Humanization check error:', error);
    res.status(500).json({ success: false, ...l.error('server_error'), details: String(error) });
  }
};

// ============================================================================
// ITERATIVE HUMANIZE - Rewrite with AI detection feedback loop
// ============================================================================

exports.iterativeHumanize = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { 
      profile_id, 
      text, 
      user_id,
      max_iterations = 3,
      target_probability = 35,
      model: requestedModel = 'gemini-2.0-flash-exp'
    } = req.body;

    // Validate model
    const model = validateModel(requestedModel, 'gemini-2.0-flash-exp');

    if (!profile_id || !text) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ success: false, ...l.error('not_found') });
    }

    const profileData = profileDoc.data();
    const voiceProfile = profileData.voiceProfile || profileData.promptableSummary;

    if (!voiceProfile) {
      return res.status(400).json({
        success: false,
        ...l.error('invalid_input'),
        details: l.t('voice_profile.not_found')
      });
    }

    // Get sample text for few-shot learning
    let sampleText = null;
    try {
      const samplesSnapshot = await db.collection('voice_profiles')
        .doc(profile_id)
        .collection('samples')
        .where('type', '==', 'long')
        .limit(1)
        .get();
      
      if (!samplesSnapshot.empty) {
        sampleText = samplesSnapshot.docs[0].data().text;
      }
    } catch (e) {
      console.log('[WARN] Could not fetch sample text:', e.message);
    }

    const humanizeService = require('../services/humanize.service');
    const startTime = Date.now();

    // Run iterative refinement
    const result = await humanizeService.rewriteWithIterativeRefinement(
      text,
      voiceProfile,
      { sampleText },
      {
        maxIterations: Math.min(max_iterations, 5), // Cap at 5 iterations
        targetProbability: Math.max(target_probability, 20), // Min 20%
        model
      }
    );

    const processingTime = Date.now() - startTime;

    if (user_id) {
      await db.collection('users').doc(user_id).update({
        'usage.rewritesCount': FieldValue.increment(result.iterations)
      });
      
      // Log activity
      activityLogService.logFeatureUsage(user_id, 'iterative_humanize', {
        profileId: profile_id,
        inputLength: text.length,
        outputLength: result.text.length,
        iterations: result.iterations,
        aiProbability: result.aiProbability,
        reachedTarget: result.reachedTarget,
        duration: processingTime,
        model
      });
    }

    logger.info('Iterative humanization complete', {
      iterations: result.iterations,
      aiProbability: result.aiProbability,
      reachedTarget: result.reachedTarget,
      processingTime
    });

    // Localized response
    const confidenceInfo = l.confidence(result.confidence);

    res.json({
      success: true,
      original_text: text,
      rewritten_text: result.text,
      iterations_used: result.iterations,
      final_ai_probability: result.aiProbability,
      verdict: l.verdict(result.aiProbability),
      confidence: result.confidence,
      confidence_level: confidenceInfo.level,
      confidence_message: confidenceInfo.message,
      reached_target: result.reachedTarget,
      target_probability: target_probability,
      improved: result.improved,
      warning: result.warning || null,
      profile_name: profileData.name,
      processing_time_ms: processingTime,
      language: l.lang,
      message: l.t('humanize.complete')
    });
  } catch (error) {
    console.error('[ERROR] Iterative humanize error:', error);
    res.status(500).json({ success: false, ...l.error('server_error'), details: String(error) });
  }
};

// ============================================================================
// TRANSLATE TEXT
// ============================================================================

exports.translateText = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { text, source_lang = 'vi', target_lang = 'en' } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, ...l.error('text_required') });
    }

    const model = geminiService.vertexAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Translate from ${source_lang} to ${target_lang}. Return ONLY the translated text.\n\n${text}`;

    const result = await model.generateContent(prompt);
    const translatedText = result.response.candidates[0].content.parts[0].text.trim();

    res.json({
      success: true,
      translated_text: translatedText,
      source_lang,
      target_lang,
      language: l.lang
    });
  } catch (error) {
    console.error('[ERROR] Translation error:', error);
    res.status(500).json({ success: false, ...l.error('server_error'), details: String(error) });
  }
};
