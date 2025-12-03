/**
 * Analysis Worker - Background AI analysis processing
 * 
 * Handles:
 * - Text analysis jobs
 * - Batch analysis
 * - Profile analysis
 * 
 * @module workers/analysis
 */

const { createWorker, QUEUE_NAMES } = require('../services/queue.service');
const logger = require('../utils/logger');

// ============================================================================
// CONFIGURATION
// ============================================================================

const WORKER_OPTIONS = {
  concurrency: 3, // Lower concurrency for CPU-intensive tasks
  limiter: {
    max: 5,
    duration: 1000 // 5 analysis per second max
  }
};

// ============================================================================
// ANALYSIS PROCESSOR
// ============================================================================

/**
 * Process analysis jobs
 * @param {Job} job - BullMQ job
 * @returns {Promise<Object>} Analysis result
 */
async function processAnalysisJob(job) {
  const { type, userId, data } = job.data;
  
  logger.info('Processing analysis job', { jobId: job.id, type, userId });
  
  try {
    // Lazy load services to avoid circular dependencies
    const analysisService = require('../services/analysis.service');
    
    let result;
    
    // Update progress
    await job.updateProgress(10);
    
    switch (type) {
      case 'text':
        result = await analysisService.analyzeText(data.text, {
          userId,
          profileId: data.profileId,
          options: data.options
        });
        break;
        
      case 'batch':
        result = await analysisService.analyzeBatch(data.texts, {
          userId,
          profileId: data.profileId
        });
        break;
        
      case 'profile':
        result = await analysisService.analyzeProfile(data.profileId, {
          userId,
          samples: data.samples
        });
        break;
        
      default:
        throw new Error(`Unknown analysis type: ${type}`);
    }
    
    await job.updateProgress(100);
    
    logger.info('Analysis completed', { jobId: job.id, type, userId });
    
    return { success: true, result };
  } catch (error) {
    logger.error('Analysis job failed', { 
      jobId: job.id, 
      type, 
      userId,
      error: error.message,
      attempt: job.attemptsMade + 1
    });
    
    throw error;
  }
}

// ============================================================================
// WORKER INITIALIZATION
// ============================================================================

let analysisWorker = null;

/**
 * Start the analysis worker
 */
function startAnalysisWorker() {
  if (analysisWorker) {
    logger.warn('Analysis worker already running');
    return analysisWorker;
  }
  
  analysisWorker = createWorker(QUEUE_NAMES.ANALYSIS, processAnalysisJob, WORKER_OPTIONS);
  
  logger.info('Analysis worker started', { 
    concurrency: WORKER_OPTIONS.concurrency,
    rateLimit: `${WORKER_OPTIONS.limiter.max}/${WORKER_OPTIONS.limiter.duration}ms`
  });
  
  return analysisWorker;
}

/**
 * Stop the analysis worker
 */
async function stopAnalysisWorker() {
  if (analysisWorker) {
    await analysisWorker.close();
    analysisWorker = null;
    logger.info('Analysis worker stopped');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  processAnalysisJob,
  startAnalysisWorker,
  stopAnalysisWorker
};
