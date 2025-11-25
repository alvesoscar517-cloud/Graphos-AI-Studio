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

// ============================================================================
// CREATE PROFILE
// ============================================================================

exports.createProfile = async (req, res) => {
  try {
    const { user_id, profile_name = 'Hồ sơ mặc định', email, name = 'User', theme = 'work' } = req.body;

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
    console.error('❌ Batch add samples error:', error);
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
Mức độ trang trọng: ${voiceProfile.formality_level}/10
Đặc điểm: ${voiceProfile.key_characteristics.join(', ')}
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
    console.error('❌ Finalize profile error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// ============================================================================
// CREATE PROFILE COMPLETE (Optimized - One API Call with Progress)
// ============================================================================

exports.createProfileComplete = async (req, res) => {
  try {
    const { user_id, profile_name = 'Hồ sơ mặc định', email, name = 'User', theme = 'work', samples } = req.body;

    // Validate inputs
    if (!samples || !Array.isArray(samples) || samples.length < 3) {
      return res.status(400).json({ 
        success: false,
        error: 'Cần ít nhất 3 mẫu văn bản để tạo hồ sơ',
        error_code: 'INSUFFICIENT_SAMPLES'
      });
    }

    if (samples.length > 20) {
      return res.status(400).json({ 
        success: false,
        error: 'Tối đa 20 mẫu văn bản',
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
          error: `Mẫu #${i + 1}: ${error.message}`,
          error_code: 'INVALID_SAMPLE_CONTENT'
        });
      }
    }

    const userId = validateUserId(user_id);

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

    // Step 3: Calculate statistics
    logger.info('Calculating statistics');
    const allText = texts.join(' ');
    const statisticalFeatures = analysisService.calculateStatistics(allText);

    // Step 4: Generate voice summary
    logger.info('Generating voice profile');
    const voiceProfile = await geminiService.generateVoiceSummary(texts, statisticalFeatures);

    const promptableSummary = `
Tone: ${voiceProfile.tone}
Mức độ trang trọng: ${voiceProfile.formality_level}/10
Đặc điểm: ${voiceProfile.key_characteristics.join(', ')}
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

    await batch.commit();

    logger.info('Profile created complete', { 
      profileId, 
      userId, 
      samplesCount: samples.length,
      qualityScore: qualityScore.score
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
    let errorMessage = 'Không thể tạo hồ sơ. Vui lòng thử lại.';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error.message.includes('INVALID_CONTENT')) {
      errorMessage = error.message.replace('INVALID_CONTENT: ', '');
      errorCode = 'INVALID_CONTENT';
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      errorMessage = 'Hệ thống đang quá tải. Vui lòng thử lại sau vài phút.';
      errorCode = 'QUOTA_EXCEEDED';
    } else if (error.message.includes('EMBEDDING_FAILED')) {
      errorMessage = 'Lỗi xử lý văn bản. Vui lòng kiểm tra nội dung và thử lại.';
      errorCode = 'EMBEDDING_FAILED';
    }
    
    res.status(500).json({ 
      success: false,
      error: errorMessage,
      error_code: errorCode,
      error_detail: error.message
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
    console.error('❌ Get profile error:', error);
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

    const profilesSnapshot = await db.collection('voice_profiles')
      .where('userId', '==', user_id)
      .get();

    const profiles = [];
    
    for (const doc of profilesSnapshot.docs) {
      const profileData = doc.data();
      
      const samplesSnapshot = await db.collection('voice_profiles')
        .doc(doc.id)
        .collection('samples')
        .get();
      
      profiles.push({
        profile_id: doc.id,
        profile_name: profileData.name,
        theme: profileData.theme || 'work',
        status: profileData.status,
        sample_count: samplesSnapshot.size,
        created_at: profileData.createdAt?.toDate().toISOString()
      });
    }

    profiles.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA;
    });

    res.json({
      success: true,
      profiles,
      count: profiles.length
    });
  } catch (error) {
    console.error('❌ Get profiles error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// ============================================================================
// DELETE PROFILE
// ============================================================================

exports.deleteProfile = async (req, res) => {
  try {
    const { profile_id } = req.body;

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

    await db.collection('voice_profiles').doc(profile_id).delete();

    cacheService.invalidateProfileCache(profile_id);

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete profile error:', error);
    res.status(500).json({ error: String(error) });
  }
};
