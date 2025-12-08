/**
 * Profile Controller
 * Handles voice profile CRUD operations
 */

const { v4: uuidv4 } = require('uuid');
const { db, FieldValue } = require('../config/firebase');
const geminiService = require('../services/gemini.service');
const analysisService = require('../services/analysis.service');
const cacheService = require('../services/cache.service');
const logger = require('../utils/logger');
const { validateText, validateProfileId, validateUserId } = require('../utils/validation');
const { FREE_CREDITS } = require('../config/pricing');
const realtimeController = require('./realtime.controller');
const activityLogService = require('../services/activityLog.service');
const { createLocalizer } = require('../utils/localized-messages.util');
const autoNotification = require('../services/autoNotification.service');

// ============================================================================
// CREATE PROFILE
// ============================================================================

exports.createProfile = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { user_id, profile_name = 'Default Profile', email, name = 'User', theme = 'work' } = req.body;

    const userId = validateUserId(user_id);

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      await db.collection('users').doc(userId).set({
        email: email || userId,
        name,
        tier: 'free',
        credits: {
          balance: FREE_CREDITS,
          purchased: 0,
          used: 0,
          free: FREE_CREDITS
        },
        usage: { profilesCount: 0, analysesCount: 0, rewritesCount: 0 },
        createdAt: new Date()
      });
      logger.info('Auto-created user with free credits', { userId, freeCredits: FREE_CREDITS });
    }

    const profileId = uuidv4();

    await db.collection('voice_profiles').doc(profileId).set({
      userId,
      name: profile_name,
      theme,
      status: 'pending',
      samplesCount: 0,
      createdAt: new Date()
    });

    await db.collection('users').doc(userId).update({
      'usage.profilesCount': FieldValue.increment(1)
    });

    logger.info('Profile created', { profileId, userId });
    
    // Log activity with credits info from middleware
    activityLogService.logFeatureUsage(userId, 'profile_create', {
      profileId,
      profileName: profile_name,
      theme,
      creditsUsed: req.creditCost || 0,
      creditsBefore: req.creditsBefore,
      creditsAfter: req.creditsAfter
    });

    // Broadcast profile update via SSE
    realtimeController.broadcastProfileUpdate(userId, {
      type: 'created',
      profile: { profile_id: profileId, profile_name, theme, status: 'pending' }
    });

    res.status(201).json({
      success: true,
      profile_id: profileId,
      profile: { userId, name: profile_name, theme, status: 'pending', samplesCount: 0 },
      message: l.t('voice_profile.created')
    });
  } catch (error) {
    logger.error('Create profile error', { error: error.message });
    res.status(500).json({ success: false, ...l.error('profile_creation_failed'), details: String(error) });
  }
};

// ============================================================================
// ADD SAMPLE
// ============================================================================

exports.addSample = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { profile_id, text } = req.body;

    const profileId = validateProfileId(profile_id);
    const validText = validateText(text, 10, 10000);

    const profileDoc = await db.collection('voice_profiles').doc(profileId).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ success: false, ...l.error('not_found') });
    }

    const vector = await geminiService.createEmbedding(validText, 'RETRIEVAL_DOCUMENT');
    const sampleId = uuidv4();

    await db.collection('voice_profiles').doc(profileId).collection('samples').doc(sampleId).set({
      text: validText,
      vector,
      createdAt: new Date()
    });

    await db.collection('voice_profiles').doc(profileId).update({
      samplesCount: FieldValue.increment(1)
    });

    cacheService.invalidateProfileCache(profileId);

    logger.info('Sample added', { profileId, sampleId });
    
    // Log activity with credits info from middleware
    const userId = profileDoc.data().userId;
    if (userId) {
      activityLogService.logFeatureUsage(userId, 'profile_sample_add', {
        profileId,
        sampleId,
        wordCount: validText.split(/\s+/).length,
        creditsUsed: req.creditCost || 0,
        creditsBefore: req.creditsBefore,
        creditsAfter: req.creditsAfter
      });
    }

    res.status(201).json({
      success: true,
      sample_id: sampleId,
      sample: { text: validText, vector_length: vector.length },
      message: l.t('voice_profile.sample_added')
    });
  } catch (error) {
    logger.error('Add sample error', { error: error.message });
    res.status(500).json({ success: false, ...l.error('server_error'), details: String(error) });
  }
};

// ============================================================================
// ADD SAMPLES BATCH
// ============================================================================

exports.addSamplesBatch = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { profile_id, samples } = req.body;

    if (!profile_id || !samples || !Array.isArray(samples)) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    if (samples.length === 0 || samples.length > 20) {
      return res.status(400).json({ success: false, ...l.error('invalid_input'), details: 'Samples must be between 1 and 20' });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ success: false, ...l.error('not_found') });
    }

    const texts = samples.map(s => s.text);
    const embeddings = await geminiService.createBatchEmbeddings(texts, 'RETRIEVAL_DOCUMENT');

    const batch = db.batch();
    const sampleIds = [];

    samples.forEach((sample, idx) => {
      const sampleId = uuidv4();
      sampleIds.push(sampleId);

      const sampleRef = db.collection('voice_profiles')
        .doc(profile_id)
        .collection('samples')
        .doc(sampleId);

      batch.set(sampleRef, {
        text: sample.text,
        type: sample.type || 'unknown',
        vector: embeddings[idx],
        vectorModel: 'text-embedding-004',
        taskType: 'RETRIEVAL_DOCUMENT',
        createdAt: new Date()
      });
    });

    const profileRef = db.collection('voice_profiles').doc(profile_id);
    batch.update(profileRef, {
      samplesCount: FieldValue.increment(samples.length),
      updatedAt: new Date()
    });

    await batch.commit();
    cacheService.invalidateProfileCache(profile_id);
    
    // Log activity with credits info from middleware
    const userId = profileDoc.data().userId;
    if (userId) {
      activityLogService.logFeatureUsage(userId, 'profile_sample_add', {
        profileId: profile_id,
        sampleCount: samples.length,
        creditsUsed: req.creditCost || 0,
        creditsBefore: req.creditsBefore,
        creditsAfter: req.creditsAfter
      });
    }

    res.status(201).json({
      success: true,
      profile_id,
      samples_added: samples.length,
      sample_ids: sampleIds,
      message: l.t('voice_profile.sample_added')
    });
  } catch (error) {
    console.error('[ERROR] Batch add samples error:', error);
    res.status(500).json({ success: false, ...l.error('server_error'), details: String(error) });
  }
};

// ============================================================================
// FINALIZE PROFILE
// ============================================================================

exports.finalizeProfile = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { profile_id } = req.body;

    if (!profile_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ success: false, ...l.error('not_found') });
    }

    const samplesSnapshot = await db.collection('voice_profiles').doc(profile_id).collection('samples').get();
    const samples = samplesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (samples.length < 3) {
      return res.status(400).json({ success: false, ...l.error('invalid_input'), details: l.t('voice_profile.insufficient_samples', { min: 3 }) });
    }

    const allText = samples.map(s => s.text).join(' ');
    const statisticalFeatures = analysisService.calculateStatistics(allText);

    const sampleTexts = samples.map(s => s.text);
    const voiceProfile = await geminiService.generateVoiceSummary(sampleTexts, statisticalFeatures);

    const promptableSummary = `
Tone: ${voiceProfile.tone}
Formality Level: ${voiceProfile.formality_level}/10
Characteristics: ${voiceProfile.key_characteristics.join(', ')}
`.trim();

    await db.collection('voice_profiles').doc(profile_id).update({
      status: 'ready',
      statisticalFeatures,
      voiceProfile,
      promptableSummary,
      embeddingModel: 'text-embedding-004',
      updatedAt: new Date()
    });

    cacheService.invalidateProfileCache(profile_id);

    // Send notification for profile creation
    const profileData = profileDoc.data();
    try {
      await autoNotification.sendProfileCreatedNotification(profileData.userId, profileData.name);
    } catch (notifError) {
      console.warn('[WARN] Failed to send profile created notification:', notifError.message);
    }
    
    // Log activity with credits info from middleware
    if (profileData.userId) {
      activityLogService.logFeatureUsage(profileData.userId, 'profile_finalize', {
        profileId: profile_id,
        profileName: profileData.name,
        sampleCount: samples.length,
        creditsUsed: req.creditCost || 0,
        creditsBefore: req.creditsBefore,
        creditsAfter: req.creditsAfter
      });
    }

    res.json({
      success: true,
      profile_id,
      status: 'ready',
      samples_count: samples.length,
      statistical_features: statisticalFeatures,
      voice_profile: voiceProfile,
      message: l.t('voice_profile.updated')
    });
  } catch (error) {
    console.error('[ERROR] Finalize profile error:', error);
    res.status(500).json({ success: false, ...l.error('server_error'), details: String(error) });
  }
};

// ============================================================================
// CREATE PROFILE COMPLETE (Optimized - One API Call with Progress)
// ============================================================================

// Rate limit constants
const PROFILE_RATE_LIMIT_HOURS = 24;
const PROFILE_RATE_LIMIT_COUNT = 5;

// Similarity thresholds for detecting duplicate samples
// Uses dual-check: embedding similarity AND text similarity must both be high
const EMBEDDING_SIMILARITY_THRESHOLD = 0.92; // Semantic similarity via embeddings
const TEXT_SIMILARITY_THRESHOLD = 0.60; // Lexical similarity via text comparison

/**
 * Calculate text similarity using Jaccard coefficient on word n-grams
 * More accurate than pure embedding similarity for detecting actual duplicates
 * @param {string} text1 
 * @param {string} text2 
 * @returns {number} Similarity score 0-1
 */
function calculateTextSimilarity(text1, text2) {
  // Normalize texts
  const normalize = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').trim();
  const t1 = normalize(text1);
  const t2 = normalize(text2);
  
  // Get words
  const words1 = t1.split(/\s+/).filter(w => w.length > 0);
  const words2 = t2.split(/\s+/).filter(w => w.length > 0);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  // Create word bigrams for better accuracy
  const getBigrams = (words) => {
    const bigrams = new Set();
    for (let i = 0; i < words.length - 1; i++) {
      bigrams.add(`${words[i]} ${words[i + 1]}`);
    }
    // Also add individual words
    words.forEach(w => bigrams.add(w));
    return bigrams;
  };
  
  const set1 = getBigrams(words1);
  const set2 = getBigrams(words2);
  
  // Calculate Jaccard similarity
  let intersection = 0;
  set1.forEach(item => {
    if (set2.has(item)) intersection++;
  });
  
  const union = set1.size + set2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

exports.createProfileComplete = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { user_id, profile_name = 'Default Profile', email, name = 'User', theme = 'work', samples } = req.body;

    logger.info('createProfileComplete started', { 
      user_id: user_id ? 'present' : 'missing',
      profile_name,
      samplesCount: samples?.length || 0,
      theme
    });

    // Validate inputs
    if (!samples || !Array.isArray(samples) || samples.length < 3) {
      return res.status(400).json({ 
        success: false,
        ...l.error('invalid_input'),
        details: l.t('voice_profile.insufficient_samples', { min: 3 }),
        error_code: 'INSUFFICIENT_SAMPLES'
      });
    }

    if (samples.length > 20) {
      return res.status(400).json({ 
        success: false,
        ...l.error('invalid_input'),
        details: 'Maximum 20 text samples allowed',
        error_code: 'TOO_MANY_SAMPLES'
      });
    }

    // Validate each sample content
    for (let i = 0; i < samples.length; i++) {
      try {
        validateText(samples[i].text, 20, 20000);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: `Sample #${i + 1}: ${error.message}`,
          error_code: 'INVALID_SAMPLE_CONTENT'
        });
      }
    }

    logger.info('Validating user_id', { user_id: user_id ? 'present' : 'missing' });
    const userId = validateUserId(user_id);
    logger.info('User validated', { userId });

    // Rate limiting: Check profiles created in last 24 hours
    // Note: This query requires a composite index on voice_profiles (userId ASC, createdAt ASC)
    const rateLimitTime = new Date(Date.now() - PROFILE_RATE_LIMIT_HOURS * 60 * 60 * 1000);
    try {
      const recentProfilesSnapshot = await db.collection('voice_profiles')
        .where('userId', '==', userId)
        .where('createdAt', '>', rateLimitTime)
        .get();

      if (recentProfilesSnapshot.size >= PROFILE_RATE_LIMIT_COUNT) {
        logger.warn('Rate limit exceeded', { userId, count: recentProfilesSnapshot.size });
        return res.status(429).json({
          success: false,
          error: `Reached limit of creating ${PROFILE_RATE_LIMIT_COUNT} profiles in ${PROFILE_RATE_LIMIT_HOURS} hours. Please try again later.`,
          error_code: 'RATE_LIMIT_EXCEEDED'
        });
      }
    } catch (rateLimitError) {
      // If index doesn't exist yet, log warning and continue
      // The index should be created via: firebase deploy --only firestore:indexes
      if (rateLimitError.code === 9 || rateLimitError.message?.includes('index')) {
        logger.warn('Rate limit check skipped - Firestore index not ready', { 
          userId,
          error: rateLimitError.message 
        });
      } else {
        throw rateLimitError;
      }
    }

    // Check for duplicate profile name
    const existingProfileSnapshot = await db.collection('voice_profiles')
      .where('userId', '==', userId)
      .where('name', '==', profile_name.trim())
      .get();

    if (!existingProfileSnapshot.empty) {
      return res.status(400).json({
        success: false,
        error: `Profile name "${profile_name}" already exists. Please choose a different name.`,
        error_code: 'DUPLICATE_PROFILE_NAME'
      });
    }

    // Calculate profile quality score
    const { calculateProfileScore } = require('../utils/validation');
    const qualityScore = calculateProfileScore(samples);
    
    logger.info('Profile quality score', { 
      score: qualityScore.score, 
      rating: qualityScore.rating,
      sampleCount: samples.length 
    });

    // Step 1: Create or get user
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      await db.collection('users').doc(userId).set({
        email: email || userId,
        name,
        tier: 'free',
        credits: {
          balance: FREE_CREDITS,
          purchased: 0,
          used: 0,
          free: FREE_CREDITS
        },
        usage: { profilesCount: 0, analysesCount: 0, rewritesCount: 0 },
        createdAt: new Date()
      });
      logger.info('Auto-created user with free credits', { userId, freeCredits: FREE_CREDITS });
    }

    const profileId = uuidv4();

    // Step 2: Create embeddings for all samples
    logger.info('Creating embeddings', { count: samples.length, profileId });
    const texts = samples.map(s => s.text);
    let embeddings;
    try {
      embeddings = await geminiService.createBatchEmbeddings(texts, 'RETRIEVAL_DOCUMENT');
      logger.info('Embeddings created', { count: embeddings.length, profileId });
    } catch (embeddingError) {
      logger.error('Embedding creation failed', { 
        error: embeddingError.message, 
        profileId,
        samplesCount: texts.length 
      });
      throw embeddingError;
    }

    // Step 2.5: Cross-sample similarity check (prevent duplicate/near-duplicate samples)
    // Uses DUAL-CHECK: both embedding similarity AND text similarity must be high
    // This prevents false positives where texts have same style but different content
    const similarPairs = [];
    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        const embeddingSimilarity = analysisService.calculateCosineSimilarity(embeddings[i], embeddings[j]);
        
        // Only check text similarity if embedding similarity is high
        if (embeddingSimilarity > EMBEDDING_SIMILARITY_THRESHOLD) {
          const textSimilarity = calculateTextSimilarity(samples[i].text, samples[j].text);
          
          // Both must be high to be considered duplicate
          if (textSimilarity > TEXT_SIMILARITY_THRESHOLD) {
            const sampleI = samples[i];
            const sampleJ = samples[j];
            const typeI = sampleI.type === 'long' ? 'Long Text' : 'Short Sample';
            const typeJ = sampleJ.type === 'long' ? 'Long Text' : 'Short Sample';
            
            similarPairs.push({ 
              i: i + 1, 
              j: j + 1, 
              embeddingSimilarity: Math.round(embeddingSimilarity * 100),
              textSimilarity: Math.round(textSimilarity * 100),
              typeI,
              typeJ
            });
            
            logger.info('Duplicate detected', {
              pair: `${i + 1}-${j + 1}`,
              embeddingSim: Math.round(embeddingSimilarity * 100),
              textSim: Math.round(textSimilarity * 100)
            });
          } else {
            // High embedding but low text similarity = different content, same style (OK)
            logger.info('High embedding but different text content (allowed)', {
              pair: `${i + 1}-${j + 1}`,
              embeddingSim: Math.round(embeddingSimilarity * 100),
              textSim: Math.round(textSimilarity * 100)
            });
          }
        }
      }
    }

    if (similarPairs.length > 0) {
      const firstPair = similarPairs[0];
      logger.warn('Similar samples detected', { userId, similarPairs });
      
      // Build descriptive error message
      let errorMsg;
      if (firstPair.typeI === firstPair.typeJ) {
        errorMsg = `Two ${firstPair.typeI}s (#${firstPair.i} and #${firstPair.j}) are too similar (${firstPair.embeddingSimilarity}% semantic, ${firstPair.textSimilarity}% text). Please provide more diverse content.`;
      } else {
        errorMsg = `${firstPair.typeI} #${firstPair.i} and ${firstPair.typeJ} #${firstPair.j} are too similar (${firstPair.embeddingSimilarity}% semantic, ${firstPair.textSimilarity}% text). Please provide more diverse content.`;
      }
      
      return res.status(400).json({
        success: false,
        error: errorMsg,
        error_code: 'SIMILAR_SAMPLES',
        similar_pairs: similarPairs
      });
    }

    // Step 3: Calculate statistics
    logger.info('Calculating statistics');
    const allText = texts.join(' ');
    const statisticalFeatures = analysisService.calculateStatistics(allText);

    // Step 4: Generate voice summary with timeout
    logger.info('Generating voice profile', { profileId, textsCount: texts.length });
    const VOICE_SUMMARY_TIMEOUT = 30000; // 30 seconds
    
    let voiceProfile;
    try {
      const voicePromise = geminiService.generateVoiceSummary(texts, statisticalFeatures);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('VOICE_SUMMARY_TIMEOUT')), VOICE_SUMMARY_TIMEOUT)
      );
      
      voiceProfile = await Promise.race([voicePromise, timeoutPromise]);
      logger.info('Voice profile generated', { profileId, tone: voiceProfile?.tone });
    } catch (voiceError) {
      logger.error('Voice profile generation failed', { 
        error: voiceError.message, 
        profileId 
      });
      if (voiceError.message === 'VOICE_SUMMARY_TIMEOUT') {
        logger.warn('Voice summary generation timed out, using fallback');
        // Use fallback voice profile
        voiceProfile = {
          tone: 'neutral',
          formality_level: 5,
          key_characteristics: [
            'Natural writing style',
            'Uses simple language',
            'Clear sentence structure'
          ],
          vocabulary_preferences: {
            common_phrases: [],
            avoid_words: [],
            preferred_connectors: ['and', 'but', 'because']
          },
          sentence_patterns: {
            typical_length: 'medium',
            structure_preference: 'simple',
            opening_style: 'Start with clear subject'
          },
          rewrite_instructions: 'Rewrite text while preserving meaning, using natural language.'
        };
      } else {
        throw voiceError;
      }
    }

    const promptableSummary = `
Tone: ${voiceProfile.tone}
Formality Level: ${voiceProfile.formality_level}/10
Characteristics: ${voiceProfile.key_characteristics.join(', ')}
`.trim();

    // Step 5: Write everything in a batch
    logger.info('Writing to database');
    const batch = db.batch();

    // Create profile document with quality score
    const profileRef = db.collection('voice_profiles').doc(profileId);
    batch.set(profileRef, {
      userId,
      name: profile_name,
      theme,
      status: 'ready',
      samplesCount: samples.length,
      statisticalFeatures,
      voiceProfile,
      promptableSummary,
      embeddingModel: 'text-embedding-004',
      qualityScore: qualityScore.score,
      qualityRating: qualityScore.rating,
      qualityFeedback: qualityScore.feedback,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Add all samples
    samples.forEach((sample, idx) => {
      const sampleId = uuidv4();
      const sampleRef = db.collection('voice_profiles')
        .doc(profileId)
        .collection('samples')
        .doc(sampleId);

      batch.set(sampleRef, {
        text: sample.text,
        type: sample.type || 'unknown',
        vector: embeddings[idx],
        vectorModel: 'text-embedding-004',
        taskType: 'RETRIEVAL_DOCUMENT',
        createdAt: new Date()
      });
    });

    // Update user profile count
    const userRef = db.collection('users').doc(userId);
    batch.update(userRef, {
      'usage.profilesCount': FieldValue.increment(1)
    });

    // Commit batch with retry logic
    logger.info('Committing batch to Firestore', { profileId, samplesCount: samples.length });
    const MAX_BATCH_RETRIES = 3;
    let batchCommitted = false;
    let lastBatchError = null;

    for (let attempt = 1; attempt <= MAX_BATCH_RETRIES && !batchCommitted; attempt++) {
      try {
        await batch.commit();
        batchCommitted = true;
        logger.info('Batch committed successfully', { profileId, attempt });
      } catch (batchError) {
        lastBatchError = batchError;
        logger.warn(`Batch commit attempt ${attempt} failed`, { 
          error: batchError.message,
          code: batchError.code,
          profileId 
        });
        
        if (attempt < MAX_BATCH_RETRIES) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    if (!batchCommitted) {
      logger.error('All batch commit attempts failed', { 
        error: lastBatchError?.message,
        code: lastBatchError?.code,
        profileId 
      });
      throw new Error('DATABASE_WRITE_FAILED: Unable to save profile. Please try again.');
    }

    logger.info('Profile created complete', { 
      profileId, 
      userId, 
      samplesCount: samples.length,
      qualityScore: qualityScore.score
    });

    // Broadcast profile update via SSE
    realtimeController.broadcastProfileUpdate(userId, {
      type: 'created',
      profile: { profile_id: profileId, profile_name, theme, status: 'ready', samples_count: samples.length }
    });

    // Send notification for profile creation
    try {
      await autoNotification.sendProfileCreatedNotification(userId, profile_name);
    } catch (notifError) {
      console.warn('[WARN] Failed to send profile created notification:', notifError.message);
    }

    res.status(201).json({
      success: true,
      profile_id: profileId,
      status: 'ready',
      samples_count: samples.length,
      statistical_features: statisticalFeatures,
      voice_profile: voiceProfile,
      quality_score: qualityScore
    });
  } catch (error) {
    // Log full error details for debugging
    logger.error('Create profile complete error', { 
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return user-friendly error messages
    let errorMessage = 'Unable to create profile. Please try again.';
    let errorCode = 'UNKNOWN_ERROR';
    let statusCode = 500;
    
    const errMsg = error.message || '';
    
    if (errMsg.includes('INVALID_CONTENT')) {
      errorMessage = errMsg.replace('INVALID_CONTENT: ', '');
      errorCode = 'INVALID_CONTENT';
      statusCode = 400;
    } else if (errMsg.includes('INVALID_INPUT')) {
      errorMessage = errMsg.replace('INVALID_INPUT: ', '');
      errorCode = 'INVALID_INPUT';
      statusCode = 400;
    } else if (errMsg.includes('QUOTA_EXCEEDED')) {
      errorMessage = 'System is overloaded. Please try again in a few minutes.';
      errorCode = 'QUOTA_EXCEEDED';
      statusCode = 503;
    } else if (errMsg.includes('BATCH_EMBEDDING_FAILED') || errMsg.includes('EMBEDDING_FAILED')) {
      errorMessage = 'Text processing error. Please check content and try again.';
      errorCode = 'EMBEDDING_FAILED';
      statusCode = 500;
    } else if (errMsg.includes('DATABASE_WRITE_FAILED')) {
      errorMessage = errMsg.replace('DATABASE_WRITE_FAILED: ', '');
      errorCode = 'DATABASE_WRITE_FAILED';
      statusCode = 503;
    } else if (errMsg.includes('VOICE_SUMMARY_TIMEOUT')) {
      errorMessage = 'Voice analysis took too long. Please try again.';
      errorCode = 'VOICE_SUMMARY_TIMEOUT';
      statusCode = 504;
    } else if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
      errorMessage = 'AI service quota exceeded. Please try again later.';
      errorCode = 'QUOTA_EXCEEDED';
      statusCode = 503;
    } else if (errMsg.includes('PERMISSION_DENIED')) {
      errorMessage = 'AI service permission error. Please contact support.';
      errorCode = 'PERMISSION_DENIED';
      statusCode = 503;
    } else if (errMsg.includes('UNAVAILABLE') || errMsg.includes('unavailable')) {
      errorMessage = 'AI service temporarily unavailable. Please try again.';
      errorCode = 'SERVICE_UNAVAILABLE';
      statusCode = 503;
    }
    
    res.status(statusCode).json({ 
      success: false,
      error: errorMessage,
      error_code: errorCode,
      error_detail: process.env.NODE_ENV === 'development' ? errMsg : undefined
    });
  }
};

// ============================================================================
// GET PROFILE
// ============================================================================

exports.getProfile = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { profile_id } = req.query;

    if (!profile_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();

    if (!profileDoc.exists) {
      return res.status(404).json({ success: false, ...l.error('not_found') });
    }

    const profileData = profileDoc.data();
    const samplesSnapshot = await db.collection('voice_profiles').doc(profile_id).collection('samples').get();

    res.json({
      success: true,
      profile: {
        profile_id: profileDoc.id,
        profile_name: profileData.name,
        theme: profileData.theme || 'work',
        status: profileData.status,
        sample_count: samplesSnapshot.size,
        created_at: profileData.createdAt?.toDate().toISOString(),
        statistics: profileData.statisticalFeatures || null,
        voice_profile: profileData.voiceProfile || null
      }
    });
  } catch (error) {
    console.error('[ERROR] Get profile error:', error);
    res.status(500).json({ success: false, ...l.error('server_error'), details: String(error) });
  }
};

// ============================================================================
// GET PROFILES
// ============================================================================

exports.getProfiles = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    // Optimized: Use samplesCount stored in profile document instead of N+1 queries
    const profilesSnapshot = await db.collection('voice_profiles')
      .where('userId', '==', user_id)
      .orderBy('createdAt', 'desc')
      .get();

    const profiles = profilesSnapshot.docs.map(doc => {
      const profileData = doc.data();
      return {
        profile_id: doc.id,
        profile_name: profileData.name,
        theme: profileData.theme || 'work',
        status: profileData.status,
        sample_count: profileData.samplesCount || 0, // Use stored count instead of querying
        quality_score: profileData.qualityScore || null,
        quality_rating: profileData.qualityRating || null,
        voice_profile: profileData.voiceProfile || null, // Include voice profile for UI display
        created_at: profileData.createdAt?.toDate().toISOString()
      };
    });

    res.json({
      success: true,
      profiles,
      count: profiles.length
    });
  } catch (error) {
    console.error('[ERROR] Get profiles error:', error);
    res.status(500).json({ success: false, ...l.error('server_error'), details: String(error) });
  }
};

// ============================================================================
// DELETE PROFILE
// ============================================================================

exports.deleteProfile = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    // Support both body and params for flexibility
    const profile_id = req.body.profile_id || req.params.id;

    if (!profile_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();

    if (!profileDoc.exists) {
      return res.status(404).json({ success: false, ...l.error('not_found') });
    }

    const samplesSnapshot = await db.collection('voice_profiles')
      .doc(profile_id)
      .collection('samples')
      .get();
    
    const batch = db.batch();
    samplesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    const profileData = profileDoc.data();
    await db.collection('voice_profiles').doc(profile_id).delete();

    cacheService.invalidateProfileCache(profile_id);

    // Broadcast profile deletion via SSE
    if (profileData.userId) {
      realtimeController.broadcastProfileUpdate(profileData.userId, {
        type: 'deleted',
        profile: { profile_id }
      });
    }

    res.json({
      success: true,
      message: l.t('voice_profile.deleted')
    });
  } catch (error) {
    console.error('[ERROR] Delete profile error:', error);
    res.status(500).json({ success: false, ...l.error('server_error'), details: String(error) });
  }
};
