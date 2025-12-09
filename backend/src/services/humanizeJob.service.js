/**
 * Humanize Job Service
 * Async job processing for iterative humanization
 * 
 * Solves timeout issues by:
 * 1. Creating a job and returning immediately
 * 2. Processing in background with progress updates
 * 3. Client polls for status/result
 * 
 * @module services/humanizeJob
 */

const { v4: uuidv4 } = require('uuid');
const cache = require('./cache.service');
const humanizeService = require('./humanize.service');
const geminiService = require('./gemini.service');
const logger = require('../utils/logger');
const { db, FieldValue } = require('../config/firebase');
const activityLogService = require('./activityLog.service');

// ============================================================================
// CONSTANTS
// ============================================================================

const JOB_PREFIX = 'humanize_job:';
const JOB_TTL = 30 * 60; // 30 minutes
const MAX_ITERATIONS = 5;
const MIN_TARGET_PROBABILITY = 20;

/**
 * Job statuses
 */
const JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// ============================================================================
// JOB MANAGEMENT
// ============================================================================

/**
 * Create a new humanize job
 * @param {Object} params - Job parameters
 * @returns {Promise<Object>} Job info with jobId
 */
async function createJob(params) {
  const {
    profileId,
    text,
    userId,
    maxIterations = 3,
    targetProbability = 35,
    model = 'gemini-2.0-flash-exp',
    creditCost = 0,
    creditsBefore = 0
  } = params;

  const jobId = uuidv4();
  const jobKey = `${JOB_PREFIX}${jobId}`;

  const jobData = {
    jobId,
    status: JOB_STATUS.PENDING,
    profileId,
    text,
    userId,
    maxIterations: Math.min(maxIterations, MAX_ITERATIONS),
    targetProbability: Math.max(targetProbability, MIN_TARGET_PROBABILITY),
    model,
    creditCost,
    creditsBefore,
    progress: {
      currentIteration: 0,
      totalIterations: maxIterations,
      currentStep: 'queued',
      aiProbability: null
    },
    result: null,
    error: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await cache.set(jobKey, JSON.stringify(jobData), JOB_TTL);
  
  logger.info('Humanize job created', { jobId, profileId, textLength: text.length });

  // Start processing immediately (non-blocking)
  processJob(jobId).catch(err => {
    logger.error('Job processing error', { jobId, error: err.message });
  });

  return {
    jobId,
    status: JOB_STATUS.PENDING,
    estimatedTime: calculateEstimatedTime(text.length, maxIterations, model)
  };
}

/**
 * Get job status and result
 * @param {string} jobId - Job ID
 * @returns {Promise<Object|null>} Job data or null
 */
async function getJob(jobId) {
  const jobKey = `${JOB_PREFIX}${jobId}`;
  const data = await cache.get(jobKey);
  
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Update job data
 * @param {string} jobId - Job ID
 * @param {Object} updates - Fields to update
 */
async function updateJob(jobId, updates) {
  const jobKey = `${JOB_PREFIX}${jobId}`;
  const job = await getJob(jobId);
  
  if (!job) {
    logger.warn('Job not found for update', { jobId });
    return;
  }

  const updatedJob = {
    ...job,
    ...updates,
    updatedAt: Date.now()
  };

  await cache.set(jobKey, JSON.stringify(updatedJob), JOB_TTL);
}

// ============================================================================
// JOB PROCESSING
// ============================================================================

/**
 * Process humanize job
 * @param {string} jobId - Job ID
 */
async function processJob(jobId) {
  const job = await getJob(jobId);
  
  if (!job) {
    logger.error('Job not found', { jobId });
    return;
  }

  const startTime = Date.now();

  try {
    // Update status to processing
    await updateJob(jobId, {
      status: JOB_STATUS.PROCESSING,
      progress: {
        ...job.progress,
        currentStep: 'loading_profile'
      }
    });

    // Load profile
    const profileDoc = await db.collection('voice_profiles').doc(job.profileId).get();
    if (!profileDoc.exists) {
      throw new Error('Profile not found');
    }

    const profileData = profileDoc.data();
    const voiceProfile = profileData.voiceProfile || profileData.promptableSummary;

    if (!voiceProfile) {
      throw new Error('Voice profile not found');
    }

    // Get sample text for few-shot learning
    let sampleText = null;
    try {
      const samplesSnapshot = await db.collection('voice_profiles')
        .doc(job.profileId)
        .collection('samples')
        .where('type', '==', 'long')
        .limit(1)
        .get();
      
      if (!samplesSnapshot.empty) {
        sampleText = samplesSnapshot.docs[0].data().text;
      }
    } catch (e) {
      logger.warn('Could not fetch sample text', { error: e.message });
    }

    // Run iterative refinement with progress updates
    const result = await runIterativeRefinement(
      jobId,
      job.text,
      voiceProfile,
      { sampleText },
      {
        maxIterations: job.maxIterations,
        targetProbability: job.targetProbability,
        model: job.model
      }
    );

    const processingTime = Date.now() - startTime;

    // Update user stats
    if (job.userId) {
      await db.collection('users').doc(job.userId).update({
        'usage.rewritesCount': FieldValue.increment(result.iterations)
      });

      // Log activity
      activityLogService.logFeatureUsage(job.userId, 'iterative_humanize', {
        profileId: job.profileId,
        inputLength: job.text.length,
        outputLength: result.text.length,
        iterations: result.iterations,
        aiProbability: result.aiProbability,
        reachedTarget: result.reachedTarget,
        duration: processingTime,
        model: job.model,
        creditsUsed: job.creditCost,
        creditsBefore: job.creditsBefore,
        async: true
      });
    }

    // Mark job as completed
    await updateJob(jobId, {
      status: JOB_STATUS.COMPLETED,
      result: {
        originalText: job.text,
        rewrittenText: result.text,
        iterationsUsed: result.iterations,
        finalAIProbability: result.aiProbability,
        confidence: result.confidence,
        reachedTarget: result.reachedTarget,
        improved: result.improved,
        warning: result.warning,
        profileName: profileData.name,
        processingTimeMs: processingTime
      },
      progress: {
        currentIteration: result.iterations,
        totalIterations: job.maxIterations,
        currentStep: 'completed',
        aiProbability: result.aiProbability
      }
    });

    logger.info('Humanize job completed', {
      jobId,
      iterations: result.iterations,
      aiProbability: result.aiProbability,
      processingTime
    });

  } catch (error) {
    logger.error('Humanize job failed', { jobId, error: error.message });

    await updateJob(jobId, {
      status: JOB_STATUS.FAILED,
      error: error.message,
      progress: {
        ...job.progress,
        currentStep: 'failed'
      }
    });
  }
}

/**
 * Run iterative refinement with progress updates
 */
async function runIterativeRefinement(jobId, originalText, voiceProfile, context, options) {
  const { maxIterations, targetProbability, model } = options;
  
  let currentText = originalText;
  let iterations = 0;
  let lastDetection = null;

  for (let i = 0; i < maxIterations; i++) {
    iterations = i + 1;

    // Update progress - rewriting
    await updateJob(jobId, {
      progress: {
        currentIteration: iterations,
        totalIterations: maxIterations,
        currentStep: 'rewriting',
        aiProbability: lastDetection?.aiProbability || null
      }
    });

    // Step 1: Rewrite
    const refinementContext = lastDetection
      ? humanizeService.buildRefinementContext(currentText, lastDetection.aiIndicators, lastDetection.aiProbability)
      : null;

    currentText = await humanizeService.rewriteWithAntiDetection(
      i === 0 ? originalText : currentText,
      voiceProfile,
      { ...context, refinementContext },
      model
    );

    // Update progress - checking
    await updateJob(jobId, {
      progress: {
        currentIteration: iterations,
        totalIterations: maxIterations,
        currentStep: 'checking',
        aiProbability: lastDetection?.aiProbability || null
      }
    });

    // Step 2: Check AI probability
    lastDetection = await geminiService.detectAIContentEnhanced(currentText);

    logger.info('Iteration complete', {
      jobId,
      iteration: iterations,
      aiProbability: lastDetection.aiProbability
    });

    // Step 3: Check if target reached
    if (lastDetection.aiProbability < targetProbability) {
      return {
        text: currentText,
        iterations,
        aiProbability: lastDetection.aiProbability,
        confidence: lastDetection.confidence,
        improved: true,
        reachedTarget: true
      };
    }
  }

  // Return best result even if target not reached
  return {
    text: currentText,
    iterations,
    aiProbability: lastDetection?.aiProbability || 50,
    confidence: lastDetection?.confidence || 50,
    improved: lastDetection?.aiProbability < 70,
    reachedTarget: false,
    warning: `Could not reach target ${targetProbability}% after ${maxIterations} iterations`
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Calculate estimated processing time
 * @param {number} textLength - Text length in characters
 * @param {number} maxIterations - Max iterations
 * @param {string} model - Model name
 * @returns {Object} Estimated time range
 */
function calculateEstimatedTime(textLength, maxIterations, model) {
  // Base time per iteration (seconds)
  let baseTime = 10;
  
  // Adjust for model
  if (model.includes('2.5-pro')) {
    baseTime = 25; // Pro models are slower
  } else if (model.includes('2.5-flash')) {
    baseTime = 15;
  }

  // Adjust for text length
  const lengthMultiplier = Math.max(1, textLength / 2000);
  
  const minTime = Math.round(baseTime * lengthMultiplier);
  const maxTime = Math.round(baseTime * maxIterations * lengthMultiplier * 1.5);

  return {
    minSeconds: minTime,
    maxSeconds: maxTime,
    display: `${minTime}-${maxTime}s`
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  createJob,
  getJob,
  updateJob,
  JOB_STATUS,
  calculateEstimatedTime
};
