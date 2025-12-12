/**
 * Email Worker - Background email processing
 * 
 * Handles:
 * - OTP emails (highest priority)
 * - Password reset emails (highest priority)
 * - Security alert emails
 * - Welcome emails
 * - Notification emails (lowest priority, rate limited)
 * 
 * Features:
 * - Priority-based processing
 * - Rate limiting to avoid spam
 * - Domain-based throttling
 * - Automatic retries with exponential backoff
 * 
 * @module workers/email
 */

const { createWorker, QUEUE_NAMES } = require('../services/queue.service');
const logger = require('../utils/logger');

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Worker options with rate limiting
 * - concurrency: 3 to avoid overwhelming SMTP
 * - limiter: 5 emails per second max (300/minute)
 * This helps avoid spam filters and respects provider limits
 */
const WORKER_OPTIONS = {
  concurrency: 3,
  limiter: {
    max: 5,
    duration: 1000 // 5 emails per second max
  }
};

// Track domain send counts for additional throttling
const domainSendCounts = new Map();
const DOMAIN_LIMIT_PER_MINUTE = 10;

/**
 * Check if we should throttle for this domain
 */
function shouldThrottleDomain(email) {
  const domain = email.toLowerCase().split('@')[1];
  const now = Date.now();
  const minuteAgo = now - 60000;
  
  const data = domainSendCounts.get(domain);
  if (!data || data.resetAt < minuteAgo) {
    domainSendCounts.set(domain, { count: 1, resetAt: now });
    return false;
  }
  
  if (data.count >= DOMAIN_LIMIT_PER_MINUTE) {
    return true;
  }
  
  data.count++;
  return false;
}

// ============================================================================
// EMAIL PROCESSOR
// ============================================================================

/**
 * Process email jobs with priority handling
 * @param {Job} job - BullMQ job
 * @returns {Promise<Object>} Result
 */
async function processEmailJob(job) {
  const { type, to, subject, data, alertType } = job.data;
  const priority = job.opts?.priority || 10;
  
  logger.info('Processing email job', { 
    jobId: job.id, 
    type, 
    to,
    priority,
    attempt: job.attemptsMade + 1
  });
  
  // For low priority emails (notifications), check domain throttling
  if (priority >= 10 && shouldThrottleDomain(to)) {
    logger.warn('Domain throttled, delaying email', { to, type });
    // Throw error to trigger retry with backoff
    throw new Error('DOMAIN_THROTTLED: Too many emails to this domain');
  }
  
  try {
    // Lazy load email service to avoid circular dependencies
    const emailService = require('../services/email.service');
    
    let result;
    
    switch (type) {
      case 'otp':
        result = await emailService.sendOTPEmail(to, data.code, data.lang);
        break;
        
      case 'password_reset':
        result = await emailService.sendPasswordResetEmail(to, data.code, data.lang);
        break;
        
      case 'security_alert':
        if (alertType === 'new_device') {
          result = await emailService.sendNewDeviceLoginEmail(to, data, data.lang);
        } else if (alertType === 'password_changed') {
          result = await emailService.sendPasswordChangedEmail(to, data.name, data.lang);
        } else {
          // Generic security alert
          result = await emailService.sendNotificationEmail(to, subject, data.content, data.lang);
        }
        break;
        
      case 'welcome':
        result = await emailService.sendWelcomeEmail(to, data.name, data.lang);
        break;
        
      case 'notification':
        result = await emailService.sendNotificationEmail(to, subject, data.content, data.lang);
        break;
        
      default:
        throw new Error(`Unknown email type: ${type}`);
    }
    
    logger.info('Email sent successfully', { 
      jobId: job.id, 
      type, 
      to,
      messageId: result?.messageId
    });
    
    return { success: true, messageId: result?.messageId };
  } catch (error) {
    logger.error('Email job failed', { 
      jobId: job.id, 
      type, 
      to, 
      error: error.message,
      code: error.code,
      attempt: job.attemptsMade + 1,
      maxAttempts: job.opts?.attempts || 3
    });
    
    // Don't retry on certain errors
    if (error.code === 'EAUTH' || error.responseCode === 550) {
      // Authentication error or recipient rejected - don't retry
      return { success: false, error: error.message, permanent: true };
    }
    
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
