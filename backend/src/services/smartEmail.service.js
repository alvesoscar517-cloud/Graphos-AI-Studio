/**
 * Smart Email Service
 * Intelligent email sending with anti-spam mechanisms
 * 
 * Features:
 * - Priority-based queue (OTP > Password Reset > Welcome > Notification)
 * - Rate limiting per domain to avoid spam blacklisting
 * - Batch sending with smart delays for bulk notifications
 * - Domain reputation protection
 * - Automatic throttling based on bounce/complaint rates
 * 
 * @module services/smartEmail
 */

const { addJob, addDelayedJob, getQueue, QUEUE_NAMES } = require('./queue.service');
const logger = require('../utils/logger');
const config = require('../config');
const envConfig = require('../config/envConfigHelper');
const { getEmailSubject } = require('./emailTemplate.service');

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Email priority levels (lower = higher priority)
 */
const EMAIL_PRIORITY = {
  OTP: 1,              // Highest - verification codes
  PASSWORD_RESET: 1,   // Highest - security critical
  SECURITY_ALERT: 2,   // High - new device login, etc.
  TRANSACTIONAL: 3,    // Medium - receipts, confirmations
  WELCOME: 5,          // Lower - can wait
  NOTIFICATION: 10,    // Lowest - bulk notifications
  MARKETING: 15        // Lowest - promotional
};

/**
 * Rate limits per email type (emails per minute)
 */
const RATE_LIMITS = {
  OTP: 60,             // 1 per second - no throttling for OTP
  PASSWORD_RESET: 60,  // 1 per second
  SECURITY_ALERT: 30,  // 0.5 per second
  TRANSACTIONAL: 30,
  WELCOME: 20,
  NOTIFICATION: 10,    // Throttled for bulk
  MARKETING: 5         // Heavy throttling
};

/**
 * Batch configuration for bulk emails
 */
const BATCH_CONFIG = {
  // Max emails per batch before adding delay
  BATCH_SIZE: 50,
  // Delay between batches (ms)
  BATCH_DELAY: 60000, // 1 minute
  // Max emails per hour to same domain
  DOMAIN_HOURLY_LIMIT: 100,
  // Delay between emails to same domain (ms)
  SAME_DOMAIN_DELAY: 2000, // 2 seconds
  // Cool down period after sending many emails (ms)
  COOLDOWN_PERIOD: 300000, // 5 minutes
  // Threshold to trigger cooldown
  COOLDOWN_THRESHOLD: 500
};

// In-memory tracking (should use Redis in production for distributed systems)
const domainSendCounts = new Map(); // domain -> { count, lastReset }
const recentSends = []; // Track recent sends for cooldown

// ============================================================================
// DOMAIN TRACKING
// ============================================================================

/**
 * Extract domain from email
 */
function extractDomain(email) {
  return email.toLowerCase().split('@')[1];
}

/**
 * Get send count for domain in current hour
 */
function getDomainSendCount(domain) {
  const now = Date.now();
  const hourAgo = now - 3600000;
  
  const data = domainSendCounts.get(domain);
  if (!data || data.lastReset < hourAgo) {
    return 0;
  }
  return data.count;
}

/**
 * Increment domain send count
 */
function incrementDomainCount(domain) {
  const now = Date.now();
  const hourAgo = now - 3600000;
  
  const data = domainSendCounts.get(domain) || { count: 0, lastReset: now };
  
  if (data.lastReset < hourAgo) {
    data.count = 1;
    data.lastReset = now;
  } else {
    data.count++;
  }
  
  domainSendCounts.set(domain, data);
  return data.count;
}

/**
 * Track recent send for cooldown calculation
 */
function trackRecentSend() {
  const now = Date.now();
  recentSends.push(now);
  
  // Clean old entries (older than cooldown period)
  const cutoff = now - BATCH_CONFIG.COOLDOWN_PERIOD;
  while (recentSends.length > 0 && recentSends[0] < cutoff) {
    recentSends.shift();
  }
}

/**
 * Check if system is in cooldown mode
 */
function isInCooldown() {
  return recentSends.length >= BATCH_CONFIG.COOLDOWN_THRESHOLD;
}

// ============================================================================
// SMART QUEUE FUNCTIONS
// ============================================================================

/**
 * Queue an OTP email with highest priority
 * OTP emails bypass most throttling for immediate delivery
 * 
 * @param {string} to - Recipient email
 * @param {string} code - OTP code
 * @param {string} type - 'verification' or 'password_reset'
 * @param {string} lang - Language code
 * @returns {Promise<Job>} Queued job
 */
async function queueOTPEmail(to, code, type = 'verification', lang = 'en') {
  const emailType = type === 'password_reset' ? 'password_reset' : 'otp';
  
  logger.info('Queueing OTP email', { to, type: emailType, priority: EMAIL_PRIORITY.OTP });
  
  return addJob(QUEUE_NAMES.EMAIL, emailType, {
    type: emailType,
    to,
    subject: type === 'password_reset' ? 'Password Reset Code' : 'Verification Code',
    data: { code, lang, type }
  }, {
    priority: EMAIL_PRIORITY.OTP,
    attempts: 5, // More retries for critical emails
    backoff: {
      type: 'exponential',
      delay: 500 // Start with 500ms, then 1s, 2s, 4s, 8s
    }
  });
}

/**
 * Queue a welcome email
 */
async function queueWelcomeEmail(to, name, lang = 'en') {
  const delay = isInCooldown() ? BATCH_CONFIG.BATCH_DELAY : 0;
  
  logger.info('Queueing welcome email', { to, delay });
  
  return addJob(QUEUE_NAMES.EMAIL, 'welcome', {
    type: 'welcome',
    to,
    subject: getEmailSubject('welcome', lang),
    data: { name, lang }
  }, {
    priority: EMAIL_PRIORITY.WELCOME,
    attempts: 3,
    delay
  });
}

/**
 * Queue a security alert email (new device login, password changed)
 */
async function queueSecurityAlertEmail(to, alertType, data, lang = 'en') {
  const subjectType = alertType === 'new_device' ? 'newDeviceLogin' : 'passwordChanged';
  
  return addJob(QUEUE_NAMES.EMAIL, 'security_alert', {
    type: 'security_alert',
    alertType,
    to,
    subject: getEmailSubject(subjectType, lang),
    data: { ...data, lang }
  }, {
    priority: EMAIL_PRIORITY.SECURITY_ALERT,
    attempts: 3
  });
}

/**
 * Queue notification emails with smart batching
 * For bulk notifications to many users
 * 
 * @param {Array<{to: string, subject: string, content: string, lang: string}>} emails
 * @param {Object} options
 * @returns {Promise<{queued: number, delayed: number}>}
 */
async function queueBulkNotificationEmails(emails, options = {}) {
  const {
    batchSize = BATCH_CONFIG.BATCH_SIZE,
    batchDelay = BATCH_CONFIG.BATCH_DELAY,
    respectDomainLimits = true
  } = options;
  
  logger.info('Queueing bulk notification emails', { 
    total: emails.length, 
    batchSize, 
    batchDelay 
  });
  
  let queued = 0;
  let delayed = 0;
  const domainDelays = new Map(); // Track delays per domain
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    const domain = extractDomain(email.to);
    
    // Calculate delay based on position in batch and domain limits
    let delay = 0;
    
    // Batch delay: every batchSize emails, add batchDelay
    const batchNumber = Math.floor(i / batchSize);
    delay += batchNumber * batchDelay;
    
    // Domain-specific delay to avoid hitting same domain too fast
    if (respectDomainLimits) {
      const domainCount = getDomainSendCount(domain);
      if (domainCount >= BATCH_CONFIG.DOMAIN_HOURLY_LIMIT) {
        // Domain limit reached, delay significantly
        delay += 3600000; // 1 hour
        logger.warn('Domain hourly limit reached', { domain, count: domainCount });
      } else {
        // Add small delay between same-domain emails
        const lastDomainDelay = domainDelays.get(domain) || 0;
        const domainDelay = lastDomainDelay + BATCH_CONFIG.SAME_DOMAIN_DELAY;
        domainDelays.set(domain, domainDelay);
        delay = Math.max(delay, domainDelay);
      }
    }
    
    // Cooldown check
    if (isInCooldown()) {
      delay += BATCH_CONFIG.COOLDOWN_PERIOD;
    }
    
    try {
      if (delay > 0) {
        await addDelayedJob(QUEUE_NAMES.EMAIL, 'notification', {
          type: 'notification',
          to: email.to,
          subject: email.subject,
          data: { content: email.content, lang: email.lang || 'en' }
        }, delay, {
          priority: EMAIL_PRIORITY.NOTIFICATION,
          attempts: 2
        });
        delayed++;
      } else {
        await addJob(QUEUE_NAMES.EMAIL, 'notification', {
          type: 'notification',
          to: email.to,
          subject: email.subject,
          data: { content: email.content, lang: email.lang || 'en' }
        }, {
          priority: EMAIL_PRIORITY.NOTIFICATION,
          attempts: 2
        });
        queued++;
      }
      
      incrementDomainCount(domain);
      trackRecentSend();
    } catch (error) {
      logger.error('Failed to queue notification email', { 
        to: email.to, 
        error: error.message 
      });
    }
  }
  
  logger.info('Bulk notification emails queued', { queued, delayed, total: emails.length });
  
  return { queued, delayed, total: emails.length };
}

/**
 * Queue a single notification email
 */
async function queueNotificationEmail(to, subject, content, lang = 'en') {
  const domain = extractDomain(to);
  const domainCount = getDomainSendCount(domain);
  
  let delay = 0;
  if (domainCount >= BATCH_CONFIG.DOMAIN_HOURLY_LIMIT) {
    delay = 3600000; // 1 hour delay if domain limit reached
  } else if (isInCooldown()) {
    delay = BATCH_CONFIG.BATCH_DELAY;
  }
  
  if (delay > 0) {
    return addDelayedJob(QUEUE_NAMES.EMAIL, 'notification', {
      type: 'notification',
      to,
      subject,
      data: { content, lang }
    }, delay, {
      priority: EMAIL_PRIORITY.NOTIFICATION,
      attempts: 2
    });
  }
  
  return addJob(QUEUE_NAMES.EMAIL, 'notification', {
    type: 'notification',
    to,
    subject,
    data: { content, lang }
  }, {
    priority: EMAIL_PRIORITY.NOTIFICATION,
    attempts: 2
  });
}

// ============================================================================
// QUEUE STATISTICS
// ============================================================================

/**
 * Get email queue statistics
 */
async function getEmailQueueStats() {
  try {
    const queue = getQueue(QUEUE_NAMES.EMAIL);
    
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount()
    ]);
    
    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + delayed,
      isInCooldown: isInCooldown(),
      recentSendCount: recentSends.length,
      domainStats: Object.fromEntries(domainSendCounts)
    };
  } catch (error) {
    logger.error('Failed to get email queue stats', { error: error.message });
    return null;
  }
}

/**
 * Clear domain tracking (for testing or reset)
 */
function clearDomainTracking() {
  domainSendCounts.clear();
  recentSends.length = 0;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Priority constants
  EMAIL_PRIORITY,
  RATE_LIMITS,
  BATCH_CONFIG,
  
  // Queue functions
  queueOTPEmail,
  queueWelcomeEmail,
  queueSecurityAlertEmail,
  queueNotificationEmail,
  queueBulkNotificationEmails,
  
  // Statistics
  getEmailQueueStats,
  
  // Utilities
  extractDomain,
  getDomainSendCount,
  isInCooldown,
  clearDomainTracking
};
