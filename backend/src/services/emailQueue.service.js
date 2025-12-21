/**
 * Email Queue Service
 * Helper service to queue emails for background processing
 * 
 * @module services/emailQueue
 */

const { addJob, addDelayedJob, QUEUE_NAMES } = require('./queue.service');
const logger = require('../utils/logger');

// ============================================================================
// QUEUE EMAIL FUNCTIONS
// ============================================================================

/**
 * Queue an OTP email
 * @param {string} to - Recipient email
 * @param {string} code - OTP code
 * @param {string} lang - Language code
 * @returns {Promise<Job>} Queued job
 */
async function queueOTPEmail(to, code, lang = 'en') {
  return addJob(QUEUE_NAMES.EMAIL, 'otp', {
    type: 'otp',
    to,
    subject: 'Verification Code',
    data: { code, lang }
  }, {
    priority: 1, // High priority
    attempts: 3
  });
}

/**
 * Queue a welcome email
 * @param {string} to - Recipient email
 * @param {string} name - User name
 * @param {string} lang - Language code
 * @returns {Promise<Job>} Queued job
 */
async function queueWelcomeEmail(to, name, lang = 'en') {
  return addJob(QUEUE_NAMES.EMAIL, 'welcome', {
    type: 'welcome',
    to,
    subject: 'Welcome!',
    data: { name, lang }
  }, {
    priority: 5, // Lower priority
    attempts: 3
  });
}

/**
 * Queue a password reset email
 * @param {string} to - Recipient email
 * @param {string} code - Reset code
 * @param {string} lang - Language code
 * @returns {Promise<Job>} Queued job
 */
async function queuePasswordResetEmail(to, code, lang = 'en') {
  return addJob(QUEUE_NAMES.EMAIL, 'password_reset', {
    type: 'password_reset',
    to,
    subject: 'Password Reset',
    data: { code, lang }
  }, {
    priority: 1, // High priority
    attempts: 3
  });
}

/**
 * Queue a notification email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} content - Email content
 * @param {string} lang - Language code
 * @returns {Promise<Job>} Queued job
 */
async function queueNotificationEmail(to, subject, content, lang = 'en') {
  return addJob(QUEUE_NAMES.EMAIL, 'notification', {
    type: 'notification',
    to,
    subject,
    data: { content, lang }
  }, {
    priority: 10, // Low priority
    attempts: 2
  });
}

/**
 * Queue a delayed email
 * @param {string} to - Recipient email
 * @param {string} type - Email type
 * @param {Object} data - Email data
 * @param {number} delayMs - Delay in milliseconds
 * @returns {Promise<Job>} Queued job
 */
async function queueDelayedEmail(to, type, data, delayMs) {
  return addDelayedJob(QUEUE_NAMES.EMAIL, type, {
    type,
    to,
    data
  }, delayMs);
}

/**
 * Queue a purchase confirmation email
 * @param {string} to - Recipient email
 * @param {Object} data - Purchase data (packageName, creditsAdded, newBalance, orderId, amount, currency)
 * @param {string} lang - Language code
 * @returns {Promise<Job>} Queued job
 */
async function queuePurchaseConfirmationEmail(to, data, lang = 'en') {
  return addJob(QUEUE_NAMES.EMAIL, 'purchase_confirmation', {
    type: 'purchase_confirmation',
    to,
    subject: 'Purchase Confirmation',
    data: { ...data, lang }
  }, {
    priority: 2, // High priority - important transaction
    attempts: 3
  });
}

/**
 * Queue a first purchase bonus email
 * @param {string} to - Recipient email
 * @param {Object} data - Bonus data (baseCredits, bonusCredits, totalCredits, newBalance)
 * @param {string} lang - Language code
 * @returns {Promise<Job>} Queued job
 */
async function queueFirstPurchaseBonusEmail(to, data, lang = 'en') {
  return addJob(QUEUE_NAMES.EMAIL, 'first_purchase_bonus', {
    type: 'first_purchase_bonus',
    to,
    subject: 'Welcome Bonus',
    data: { ...data, lang }
  }, {
    priority: 2, // High priority
    attempts: 3
  });
}

/**
 * Queue a low credits warning email
 * @param {string} to - Recipient email
 * @param {Object} data - Credits data (currentBalance, userName)
 * @param {string} lang - Language code
 * @returns {Promise<Job>} Queued job
 */
async function queueLowCreditsEmail(to, data, lang = 'en') {
  return addJob(QUEUE_NAMES.EMAIL, 'low_credits', {
    type: 'low_credits',
    to,
    subject: 'Low Credits Warning',
    data: { ...data, lang }
  }, {
    priority: 5, // Medium priority
    attempts: 2
  });
}

/**
 * Queue a re-engagement email
 * @param {string} to - Recipient email
 * @param {Object} data - User data (currentCredits, userName)
 * @param {string} lang - Language code
 * @returns {Promise<Job>} Queued job
 */
async function queueReEngagementEmail(to, data, lang = 'en') {
  return addJob(QUEUE_NAMES.EMAIL, 're_engagement', {
    type: 're_engagement',
    to,
    subject: 'We Miss You',
    data: { ...data, lang }
  }, {
    priority: 10, // Low priority
    attempts: 2
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  queueOTPEmail,
  queueWelcomeEmail,
  queuePasswordResetEmail,
  queueNotificationEmail,
  queueDelayedEmail,
  // New queue functions
  queuePurchaseConfirmationEmail,
  queueFirstPurchaseBonusEmail,
  queueLowCreditsEmail,
  queueReEngagementEmail
};
