/**
 * Email Worker - Background email processing
 * 
 * Handles:
 * - OTP emails
 * - Welcome emails
 * - Password reset emails
 * - Notification emails
 * 
 * @module workers/email
 */

const { createWorker, QUEUE_NAMES } = require('../services/queue.service');
const logger = require('../utils/logger');

// ============================================================================
// CONFIGURATION
// ============================================================================

const WORKER_OPTIONS = {
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000 // 10 emails per second max
  }
};

// ============================================================================
// EMAIL PROCESSOR
// ============================================================================

/**
 * Process email jobs
 * @param {Job} job - BullMQ job
 * @returns {Promise<Object>} Result
 */
async function processEmailJob(job) {
  const { type, to, subject, data } = job.data;
  
  logger.info('Processing email job', { jobId: job.id, type, to });
  
  try {
    // Lazy load email service to avoid circular dependencies
    const emailService = require('../services/email.service');
    
    let result;
    
    switch (type) {
      case 'otp':
        result = await emailService.sendOTPEmail(to, data.code, data.lang);
        break;
        
      case 'welcome':
        result = await emailService.sendWelcomeEmail(to, data.name, data.lang);
        break;
        
      case 'password_reset':
        result = await emailService.sendPasswordResetEmail(to, data.code, data.lang);
        break;
        
      case 'notification':
        result = await emailService.sendNotificationEmail(to, subject, data.content, data.lang);
        break;
        
      default:
        throw new Error(`Unknown email type: ${type}`);
    }
    
    logger.info('Email sent successfully', { jobId: job.id, type, to });
    
    return { success: true, messageId: result?.messageId };
  } catch (error) {
    logger.error('Email job failed', { 
      jobId: job.id, 
      type, 
      to, 
      error: error.message,
      attempt: job.attemptsMade + 1
    });
    
    throw error;
  }
}

// ============================================================================
// WORKER INITIALIZATION
// ============================================================================

let emailWorker = null;

/**
 * Start the email worker
 */
function startEmailWorker() {
  if (emailWorker) {
    logger.warn('Email worker already running');
    return emailWorker;
  }
  
  emailWorker = createWorker(QUEUE_NAMES.EMAIL, processEmailJob, WORKER_OPTIONS);
  
  logger.info('Email worker started', { 
    concurrency: WORKER_OPTIONS.concurrency,
    rateLimit: `${WORKER_OPTIONS.limiter.max}/${WORKER_OPTIONS.limiter.duration}ms`
  });
  
  return emailWorker;
}

/**
 * Stop the email worker
 */
async function stopEmailWorker() {
  if (emailWorker) {
    await emailWorker.close();
    emailWorker = null;
    logger.info('Email worker stopped');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  processEmailJob,
  startEmailWorker,
  stopEmailWorker
};
