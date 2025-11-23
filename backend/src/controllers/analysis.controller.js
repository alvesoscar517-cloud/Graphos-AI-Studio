/**
 * Analysis Controller
 * Handles text analysis, AI detection, rewriting
 */

const { db, FieldValue } = require('../config/firebase');
const geminiService = require('../services/gemini.service');
const analysisService = require('../services/analysis.service');
const cacheService = require('../services/cache.service');
const logger = require('../utils/logger');
const { validateText, validateProfileId } = require('../utils/validation');

// ============================================================================
// AUTHENTICATE CONTENT (AI DETECTION)
// ============================================================================

exports.authenticateContent = async (req, res) => {
  try {
    const { text, user_id } = req.body;

    const validText = validateText(text, 50, 20000);

    const { aiProbability, evidence } = await geminiService.detectAIContent(validText);
    const textFeatures = analysisService.calculateStatistics(text);

    const isAuthentic = aiProbability < 50;
    const confidence = Math.abs(aiProbability - 50) * 2;

    const result = {
      success: true,
      is_authentic: isAuthentic,
      ai_probability: parseFloat(aiProbability.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(2)),
      evidence,
      text_statistics: textFeatures,
      verdict: isAuthentic
        ? 'Nội dung có vẻ do con người viết'
        : 'Nội dung có thể do AI tạo ra'
    };

    if (user_id) {
      await db.collection('users').doc(user_id).update({
        'usage.analysesCount': FieldValue.increment(1)
      });
    }

    logger.info('Content authenticated', { aiProbability, isAuthentic });

    res.json(result);
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    res.status(500).json({ error: String(error) });
  }
};

// ============================================================================
// ANALYZE TEXT
// ============================================================================

exports.analyzeText = async (req, res) => {
  try {
    const { profile_id, text, user_id, use_cache = true } = req.body;

    const profileId = validateProfileId(profile_id);
    const validText = validateText(text, 10, 20000);

    if (use_cache) {
      const cachedResult = cacheService.getCachedAnalysis(profileId, validText);
      if (cachedResult) {
        logger.info('Analysis cache hit', { profileId });
        return res.json({ ...cachedResult, cache_hit: true });
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
        return res.status(404).json({ error: 'Profile not found' });
      }

      profileData = profileDoc.data();

      if (profileData.status !== 'ready') {
        return res.status(400).json({ error: 'Profile is not ready for analysis' });
      }

      const samplesSnapshot = await db.collection('voice_profiles')
        .doc(profileId)
        .collection('samples')
        .limit(50)
        .get();
      
      const samples = samplesSnapshot.docs.map(doc => doc.data());
      sampleVectors = samples.map(s => s.vector).filter(v => v && v.length > 0);

      if (sampleVectors.length === 0) {
        return res.status(400).json({ error: 'Profile samples have no embeddings' });
      }

      centroid = analysisService.calculateCentroid(sampleVectors);
      
      cacheService.setCachedProfile(profileId, {
        profileData,
        sampleVectors,
        centroid
      });
    }

    const sentences = analysisService.splitIntoSentences(validText);
    const validSentences = sentences.filter(s => s.split(/\s+/).length >= 3);

    if (validSentences.length === 0) {
      return res.status(400).json({ error: 'Text must contain at least 1 sentence with 3+ words' });
    }

    const [sentenceVectors, textFeatures] = await Promise.all([
      geminiService.createBatchEmbeddings(validSentences, 'RETRIEVAL_QUERY'),
      Promise.resolve(analysisService.calculateStatistics(validText))
    ]);

    const sentenceAnalyses = [];
    const allSimilarities = [];
    const centroidSimilarities = [];

    for (let idx = 0; idx < validSentences.length; idx++) {
      const sentence = validSentences[idx];
      const sentenceVector = sentenceVectors[idx];

      const centroidSimilarity = analysisService.calculateCosineSimilarity(sentenceVector, centroid);
      centroidSimilarities.push(centroidSimilarity);

      const similarities = sampleVectors
        .map(sampleVec => analysisService.calculateCosineSimilarity(sentenceVector, sampleVec))
        .sort((a, b) => b - a)
        .slice(0, 10);

      const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
      allSimilarities.push(avgSimilarity);

      const threshold = analysisService.calculateDynamicThreshold(similarities);
      const isDeviant = avgSimilarity < threshold;

      sentenceAnalyses.push({
        sentence,
        index: idx,
        similarityScore: parseFloat(avgSimilarity.toFixed(3)),
        centroidSimilarity: parseFloat(centroidSimilarity.toFixed(3)),
        isDeviant
      });
    }

    const vectorScore = centroidSimilarities.length > 0
      ? (centroidSimilarities.reduce((a, b) => a + b, 0) / centroidSimilarities.length) * 100
      : 0;

    const statisticalScore = analysisService.compareStatisticalFeatures(textFeatures, profileData.statisticalFeatures);

    const sampleCount = sampleVectors.length;
    const embeddingWeight = Math.min(0.8, 0.5 + (sampleCount / 100) * 0.3);
    const statisticalWeight = 1 - embeddingWeight;

    const voiceCompatibility = vectorScore * embeddingWeight + statisticalScore * statisticalWeight;

    const processingTime = Date.now() - startTime;

    const result = {
      success: true,
      voice_compatibility_score: parseFloat(voiceCompatibility.toFixed(2)),
      vector_score: parseFloat(vectorScore.toFixed(2)),
      statistical_score: parseFloat(statisticalScore.toFixed(2)),
      sentence_analysis: sentenceAnalyses,
      statistics: textFeatures,
      profile_name: profileData.name,
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
    }

    logger.info('Text analyzed', { profileId, voiceCompatibility, processingTime });

    res.json(result);
  } catch (error) {
    logger.error('Analysis error', { error: error.message });
    res.status(500).json({ error: String(error) });
  }
};

// ============================================================================
// SUGGEST IMPROVEMENTS
// ============================================================================

exports.suggestImprovements = async (req, res) => {
  try {
    const { profile_id, sentence, sentence_score } = req.body;

    if (!profile_id || !sentence) {
      return res.status(400).json({ error: 'profile_id and sentence are required' });
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
      return res.status(404).json({ error: 'Profile not found' });
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
    console.error('❌ Suggestion generation error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// ============================================================================
// REWRITE TEXT
// ============================================================================

exports.rewriteText = async (req, res) => {
  try {
    const { profile_id, text, user_id, context, model = 'gemini-2.5-flash', writing_preferences } = req.body;

    if (!profile_id || !text) {
      return res.status(400).json({ error: 'profile_id and text are required' });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profileData = profileDoc.data();

    if (profileData.status !== 'ready') {
      return res.status(400).json({ error: 'Profile is not ready for rewriting' });
    }

    const voiceProfile = profileData.voiceProfile || profileData.promptableSummary;

    if (!voiceProfile) {
      return res.status(400).json({
        error: 'Profile does not have voice profile. Please finalize profile first.'
      });
    }

    // Enhance context with writing preferences (based on profile data)
    let enhancedContext = { ...context };
    if (writing_preferences) {
      enhancedContext.writingPreferences = {
        useVocabularyPreferences: writing_preferences.useVocabularyPreferences,
        useKeyCharacteristics: writing_preferences.useKeyCharacteristics,
        useSentencePatterns: writing_preferences.useSentencePatterns,
        useRewriteInstructions: writing_preferences.useRewriteInstructions
      };
    }

    const rewrittenText = await geminiService.rewriteWithVoice(text, voiceProfile, enhancedContext, model);

    if (user_id) {
      await db.collection('users').doc(user_id).update({
        'usage.rewritesCount': FieldValue.increment(1)
      });
    }

    res.json({
      success: true,
      original_text: text,
      rewritten_text: rewrittenText,
      profile_name: profileData.name,
      tone: profileData.voiceProfile?.tone || 'neutral'
    });
  } catch (error) {
    console.error('❌ Rewrite error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// ============================================================================
// REWRITE TEXT STREAM
// ============================================================================

exports.rewriteTextStream = async (req, res) => {
  try {
    const { profile_id, text, model, user_id, writing_preferences } = req.body;

    if (!profile_id || !text) {
      return res.status(400).json({ error: 'profile_id and text are required' });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profileData = profileDoc.data();
    const voiceProfile = profileData.voiceProfile || profileData.promptableSummary;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let voiceDescription = '';
    if (typeof voiceProfile === 'object' && voiceProfile.tone) {
      voiceDescription = `TONE: ${voiceProfile.tone}, FORMALITY: ${voiceProfile.formality_level}/10`;
    } else {
      voiceDescription = String(voiceProfile);
    }

    let prompt = `Viết lại văn bản theo văn phong: ${voiceDescription}\n\nVăn bản gốc: ${text}`;

    // Add writing preferences to prompt (based on profile data)
    if (writing_preferences && voiceProfile) {
      let preferencesText = '';
      
      // Vocabulary Preferences
      if (writing_preferences.useVocabularyPreferences && voiceProfile.vocabulary_preferences) {
        const vocabPrefs = voiceProfile.vocabulary_preferences;
        if (vocabPrefs.common_phrases?.length > 0 || vocabPrefs.preferred_connectors?.length > 0 || vocabPrefs.avoid_words?.length > 0) {
          preferencesText += '\n\nTỪ VỰNG ƯA THÍCH:';
          if (vocabPrefs.common_phrases?.length > 0) {
            preferencesText += '\nCỤM TỪ THƯỜNG DÙNG: ' + vocabPrefs.common_phrases.join(', ');
          }
          if (vocabPrefs.preferred_connectors?.length > 0) {
            preferencesText += '\nTỪ NỐI ƯA THÍCH: ' + vocabPrefs.preferred_connectors.join(', ');
          }
          if (vocabPrefs.avoid_words?.length > 0) {
            preferencesText += '\nTỪ NÊN TRÁNH: ' + vocabPrefs.avoid_words.join(', ');
          }
        }
      }
      
      // Key characteristics
      if (writing_preferences.useKeyCharacteristics && voiceProfile.key_characteristics?.length > 0) {
        preferencesText += '\n\nĐẶC ĐIỂM CHÍNH: ' + voiceProfile.key_characteristics.join(', ');
      }
      
      // Sentence Patterns
      if (writing_preferences.useSentencePatterns && voiceProfile.sentence_patterns) {
        const sentencePatterns = voiceProfile.sentence_patterns;
        if (sentencePatterns.opening_style || sentencePatterns.structure_preference) {
          preferencesText += '\n\nCẤU TRÚC CÂU:';
          if (sentencePatterns.opening_style) {
            preferencesText += '\nPHONG CÁCH MỞ ĐẦU: ' + sentencePatterns.opening_style;
          }
          if (sentencePatterns.structure_preference) {
            preferencesText += '\nCẤU TRÚC: ' + sentencePatterns.structure_preference;
          }
        }
      }
      
      // Rewrite instructions
      if (writing_preferences.useRewriteInstructions && voiceProfile.rewrite_instructions) {
        preferencesText += '\n\nHƯỚNG DẪN VIẾT LẠI: ' + voiceProfile.rewrite_instructions;
      }
      
      if (preferencesText) {
        prompt += preferencesText;
      }
    }

    prompt += '\n\nVăn bản đã viết lại:';

    const modelName = model || 'gemini-2.5-flash';
    const generativeModel = geminiService.vertexAI.getGenerativeModel({ model: modelName });

    const result = await generativeModel.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();

    if (user_id) {
      await db.collection('users').doc(user_id).update({
        'usage.rewritesCount': FieldValue.increment(1)
      });
    }
  } catch (error) {
    console.error('❌ Streaming rewrite error:', error);
    res.write(`data: ${JSON.stringify({ error: String(error) })}\n\n`);
    res.end();
  }
};

// ============================================================================
// TRANSLATE TEXT
// ============================================================================

exports.translateText = async (req, res) => {
  try {
    const { text, source_lang = 'vi', target_lang = 'en' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const model = geminiService.vertexAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Translate from ${source_lang} to ${target_lang}. Return ONLY the translated text.\n\n${text}`;

    const result = await model.generateContent(prompt);
    const translatedText = result.response.candidates[0].content.parts[0].text.trim();

    res.json({
      success: true,
      translated_text: translatedText,
      source_lang,
      target_lang
    });
  } catch (error) {
    console.error('❌ Translation error:', error);
    res.status(500).json({ error: String(error) });
  }
};
