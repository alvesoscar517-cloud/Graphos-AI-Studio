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

// ============================================================================
// CREATE PROFILE
// ============================================================================

exports.createProfile = async (req, res) => {
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
    
    // Log activity
    activityLogService.logFeatureUsage(userId, 'profile_create', {
      profileId,
      profileName: profile_name,
      theme
    });

    // Broadcast profile update via SSE
    realtimeController.broadcastProfileUpdate(userId, {
      type: 'created',
      profile: { profile_id: profileId, profile_name, theme, status: 'pending' }
    });

    res.status(201).json({
      success: true,
      profile_id: profileId,
      profile: { userId, name: profile_name, theme, status: 'pending', samplesCount: 0 }
    });
  } catch (error) {
    logger.error('Create profile error', { error: error.message });
    res.status(500).json({ error: String(error) });
  }
};

// ============================================================================
// ADD SAMPLE
// ============================================================================

exports.addSample = async (req, res) => {
  try {
    const { profile_id, text } = req.body;

    const profileId = validateProfileId(profile_id);
    const validText = validateText(text, 10, 10000);

    const profileDoc = await db.collection('voice_profiles').doc(profileId).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
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

    res.status(201).json({
      success: true,
      sample_id: sampleId,
      sample: { text: validText, vector_length: vector.length }
    });
  } catch (error) {
    logger.error('Add sample error', { error: error.message });
    res.status(500).json({ error: String(error) });
  }
};

// ============================================================================
// ADD SAMPLES BATCH
// ============================================================================

exports.addSamplesBatch = async (req, res) => {
  try {
    const { profile_id, samples } = req.body;

    if (!profile_id || !samples || !Array.isArray(samples)) {
      return res.status(400).json({ error: 'profile_id and samples array are required' });
    }

    if (samples.length === 0 || samples.length > 20) {
      return res.status(400).json({ error: 'Samples must be between 1 and 20' });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
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

    res.status(201).json({
      success: true,
      profile_id,
      samples_added: samples.length,
      sample_ids: sampleIds
    });
  } catch (error) {
    console.error('[ERROR] Batch add samples error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// ============================================================================
// FINALIZE PROFILE
// ============================================================================

exports.finalizeProfile = async (req, res) => {
  try {
    const { profile_id } = req.body;

    if (!profile_id) {
      return res.status(400).json({ error: 'profile_id is required' });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const samplesSnapshot = await db.collection('voice_profiles').doc(profile_id).collection('samples').get();
    const samples = samplesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (samples.length < 3) {
      return res.status(400).json({ error: 'Profile needs at least 3 samples' });
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

    res.json({
      success: true,
      profile_id,
      status: 'ready',
      samples_count: samples.length,
      statistical_features: statisticalFeatures,
      voice_profile: voiceProfile
    });
  } catch (error) {
    console.error('[ERROR] Finalize profile error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// ============================================================================
// CREATE PROFILE COMPLETE (Optimized - One API Call with Progress)
// ============================================================================

// Rate limit constants
const PROFILE_RATE_LIMIT_HOURS = 24;
const PROFILE_RATE_LIMIT_COUNT = 5;
const SAMPLE_SIMILARITY_THRESHOLD = 0.92;

exports.createProfileComplete = async (req, res) => {
  try {
    const { user_id, profile_name = 'Default Profile', email, name = 'User', theme = 'work', samples } = req.body;

    // Validate inputs
    if (!samples || !Array.isArray(samples) || samples.length < 3) {
      return res.status(400).json({ 
        success: false,
        error: 'At least 3 text samples are required to create a profile',
        error_code: 'INSUFFICIENT_SAMPLES'
      });
    }

    if (samples.length > 20) {
      return res.status(400).json({ 
        success: false,
        error: 'Maximum 20 text samples allowed',
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

    const userId = validateUserId(user_id);

    // Rate limiting: Check profiles created in last 24 hours
    const rateLimitTime = new Date(Date.now() - PROFILE_RATE_LIMIT_HOURS * 60 * 60 * 1000);
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
    logger.info('Creating embeddings', { count: samples.length });
    const texts = samples.map(s => s.text);
    const embeddings = await geminiService.createBatchEmbeddings(texts, 'RETRIEVAL_DOCUMENT');
    logger.info('Embeddings created', { count: embeddings.length });

    // Step 2.5: Cross-sample similarity check (prevent duplicate/near-duplicate samples)
    const similarPairs = [];
    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        const similarity = analysisService.calculateCosineSimilarity(embeddings[i], embeddings[j]);
        if (similarity > SAMPLE_SIMILARITY_THRESHOLD) {
          similarPairs.push({ i: i + 1, j: j + 1, similarity: Math.round(similarity * 100) });
        }
      }
    }

    if (similarPairs.length > 0) {
      const firstPair = similarPairs[0];
      logger.warn('Similar samples detected', { userId, similarPairs });
      return res.status(400).json({
        success: false,
        error: `Sample #${firstPair.i} and #${firstPair.j} are too similar (${firstPair.similarity}%). Please provide more diverse content.`,
        error_code: 'SIMILAR_SAMPLES',
        similar_pairs: similarPairs
      });
    }

    // Step 3: Calculate statistics
    logger.info('Calculating statistics');
    const allText = texts.join(' ');
    const statisticalFeatures = analysisService.calculateStatistics(allText);

    // Step 4: Generate voice summary with timeout
    logger.info('Generating voice profile');
    const VOICE_SUMMARY_TIMEOUT = 30000; // 30 seconds
    
    let voiceProfile;
    try {
      const voicePromise = geminiService.generateVoiceSummary(texts, statisticalFeatures);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('VOICE_SUMMARY_TIMEOUT')), VOICE_SUMMARY_TIMEOUT)
      );
      
      voiceProfile = await Promise.race([voicePromise, timeoutPromise]);
    } catch (voiceError) {
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
    const MAX_BATCH_RETRIES = 3;
    let batchCommitted = false;
    let lastBatchError = null;

    for (let attempt = 1; attempt <= MAX_BATCH_RETRIES && !batchCommitted; attempt++) {
      try {
        await batch.commit();
        batchCommitted = true;
      } catch (batchError) {
        lastBatchError = batchError;
        logger.warn(`Batch commit attempt ${attempt} failed`, { error: batchError.message });
        
        if (attempt < MAX_BATCH_RETRIES) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    if (!batchCommitted) {
      logger.error('All batch commit attempts failed', { error: lastBatchError?.message });
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
    logger.error('Create profile complete error', { error: error.message });
    
    // Return user-friendly error messages
    let errorMessage = 'Unable to create profile. Please try again.';
    let errorCode = 'UNKNOWN_ERROR';
    let statusCode = 500;
    
    if (error.message.includes('INVALID_CONTENT')) {
      errorMessage = error.message.replace('INVALID_CONTENT: ', '');
      errorCode = 'INVALID_CONTENT';
      statusCode = 400;
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      errorMessage = 'System is overloaded. Please try again in a few minutes.';
      errorCode = 'QUOTA_EXCEEDED';
      statusCode = 503;
    } else if (error.message.includes('EMBEDDING_FAILED')) {
      errorMessage = 'Text processing error. Please check content and try again.';
      errorCode = 'EMBEDDING_FAILED';
      statusCode = 500;
    } else if (error.message.includes('DATABASE_WRITE_FAILED')) {
      errorMessage = error.message.replace('DATABASE_WRITE_FAILED: ', '');
      errorCode = 'DATABASE_WRITE_FAILED';
      statusCode = 503;
    } else if (error.message.includes('VOICE_SUMMARY_TIMEOUT')) {
      errorMessage = 'Voice analysis took too long. Please try again.';
      errorCode = 'VOICE_SUMMARY_TIMEOUT';
      statusCode = 504;
    }
    
    res.status(statusCode).json({ 
      success: false,
      error: errorMessage,
      error_code: errorCode,
      error_detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================================================
// GET PROFILE
// ============================================================================

exports.getProfile = async (req, res) => {
  try {
    const { profile_id } = req.query;

    if (!profile_id) {
      return res.status(400).json({ error: 'profile_id is required' });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();

    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
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
    res.status(500).json({ error: String(error) });
  }
};

// ============================================================================
// GET PROFILES
// ============================================================================

exports.getProfiles = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
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
    res.status(500).json({ error: String(error) });
  }
};

// ============================================================================
// DELETE PROFILE
// ============================================================================

exports.deleteProfile = async (req, res) => {
  try {
    // Support both body and params for flexibility
    const profile_id = req.body.profile_id || req.params.id;

    if (!profile_id) {
      return res.status(400).json({ error: 'profile_id is required' });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();

    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
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
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('[ERROR] Delete profile error:', error);
    res.status(500).json({ error: String(error) });
  }
};
