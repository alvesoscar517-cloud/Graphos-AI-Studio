/**
 * Email Service
 * Core email sending functionality with template support
 * 
 * @module services/email
 */

const nodemailer = require('nodemailer');
const config = require('../config');
const envConfig = require('../config/envConfigHelper');
const logger = require('../utils/logger');
const { generateCidAttachments } = require('../utils/emailCid');
const { 
  otpVerificationEmail, 
  passwordResetEmail, 
  welcomeEmail,
  newDeviceLoginEmail,
  passwordChangedEmail 
} = require('./emailTemplate.service');

// ============================================================================
// SMTP CONFIGURATION
// ============================================================================

/**
 * Get SMTP configuration from env/Firestore
 */
function getSmtpConfig() {
  return {
    host: envConfig.get('SMTP_HOST') || config.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(envConfig.get('SMTP_PORT') || config.SMTP_PORT || 587),
    user: envConfig.get('SMTP_USER') || config.SMTP_USER || '',
    pass: envConfig.get('SMTP_PASS') || config.SMTP_PASS || '',
    fromEmail: envConfig.get('EMAIL_FROM') || config.EMAIL_FROM || 'no-reply@graphosai.com',
    fromName: envConfig.get('EMAIL_FROM_NAME') || config.EMAIL_FROM_NAME || 'Graphos AI Studio'
  };
}

/**
 * Create nodemailer transporter
 */
function createTransporter() {
  const smtp = getSmtpConfig();
  
  if (!smtp.user || !smtp.pass) {
    logger.warn('SMTP not configured - email sending disabled');
    return null;
  }
  
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: {
      user: smtp.user,
      pass: smtp.pass
    },
    // Connection pool for better performance
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // Timeouts
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 30000
  });
}

let transporter = null;

/**
 * Get or create transporter (lazy initialization)
 */
function getTransporter() {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
}

/**
 * Refresh transporter (when config changes)
 */
function refreshTransporter() {
  if (transporter) {
    transporter.close();
  }
  transporter = createTransporter();
  return transporter;
}

// ============================================================================
// CORE SEND FUNCTION
// ============================================================================

/**
 * Send email with retry logic and CID attachments
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text content
 * @param {Array} [options.attachments] - Additional attachments
 * @param {number} [options.retries=2] - Number of retries
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendEmail({ to, subject, html, text, attachments = [], retries = 2 }) {
  const smtp = getSmtpConfig();
  const transport = getTransporter();
  
  if (!transport) {
    logger.error('Cannot send email - SMTP not configured');
    return { success: false, error: 'SMTP not configured' };
  }
  
  // Generate CID attachments from HTML content
  const cidAttachments = generateCidAttachments(html);
  
  const mailOptions = {
    from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
    attachments: [...cidAttachments, ...attachments] // Combine CID and custom attachments
  };
  
  let lastError = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await transport.sendMail(mailOptions);
      
      logger.info('Email sent successfully', {
        to,
        subject,
        messageId: result.messageId,
        attempt: attempt + 1
      });
      
      return { 
        success: true, 
        messageId: result.messageId,
        response: result.response
      };
    } catch (error) {
      lastError = error;
      
      logger.warn('Email send attempt failed', {
        to,
        subject,
        attempt: attempt + 1,
        maxAttempts: retries + 1,
        error: error.message,
        code: error.code
      });
      
      // Don't retry on certain errors
      if (error.code === 'EAUTH' || error.responseCode === 550) {
        break;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  logger.error('Email send failed after all retries', {
    to,
    subject,
    error: lastError?.message,
    code: lastError?.code
  });
  
  return { 
    success: false, 
    error: lastError?.message || 'Unknown error'
  };
}

// ============================================================================
// TEMPLATE-BASED EMAIL FUNCTIONS
// ============================================================================

/**
 * Send OTP verification email
 */
async function sendOTPEmail(to, code, lang = 'en') {
  const html = otpVerificationEmail({
    code,
    userName: to.split('@')[0],
    expiryMinutes: 10,
    lang
  });
  
  return sendEmail({
    to,
    subject: 'Verify Your Email - Graphos AI Studio',
    html,
    retries: 3 // More retries for OTP
  });
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(to, code, lang = 'en') {
  const html = passwordResetEmail({
    code,
    userName: to.split('@')[0],
    expiryMinutes: 10,
    lang
  });
  
  return sendEmail({
    to,
    subject: 'Reset Your Password - Graphos AI Studio',
    html,
    retries: 3
  });
}

/**
 * Send welcome email
 */
async function sendWelcomeEmail(to, name, lang = 'en') {
  // Check if welcomeEmail template exists
  if (typeof welcomeEmail !== 'function') {
    logger.warn('Welcome email template not found, skipping');
    return { success: true, skipped: true };
  }
  
  const html = welcomeEmail({
    userName: name || to.split('@')[0],
    lang
  });
  
  return sendEmail({
    to,
    subject: 'Welcome to Graphos AI Studio!',
    html,
    retries: 2
  });
}

/**
 * Send new device login alert
 */
async function sendNewDeviceLoginEmail(to, deviceInfo, lang = 'en') {
  const html = newDeviceLoginEmail({
    userName: to.split('@')[0],
    deviceInfo: deviceInfo.userAgent || 'Unknown device',
    ipAddress: deviceInfo.ipAddress || 'Unknown',
    location: deviceInfo.location || 'Unknown',
    loginTime: new Date(),
    lang
  });
  
  return sendEmail({
    to,
    subject: 'New Device Login - Graphos AI Studio',
    html,
    retries: 2
  });
}

/**
 * Send password changed notification
 */
async function sendPasswordChangedEmail(to, name, lang = 'en') {
  const html = passwordChangedEmail({
    userName: name || to.split('@')[0],
    changedAt: new Date(),
    lang
  });
  
  return sendEmail({
    to,
    subject: 'Password Changed - Graphos AI Studio',
    html,
    retries: 2
  });
}

/**
 * Send notification email (generic)
 */
async function sendNotificationEmail(to, subject, content, lang = 'en') {
  // Simple notification template
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">${subject}</h1>
        <div style="color: #333; font-size: 16px; line-height: 1.6;">
          ${content}
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #888; font-size: 12px; text-align: center;">
          Graphos AI Studio
        </p>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to,
    subject,
    html,
    retries: 1
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Core
  sendEmail,
  getSmtpConfig,
  refreshTransporter,
  
  // Template emails
  sendOTPEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendNewDeviceLoginEmail,
  sendPasswordChangedEmail,
  sendNotificationEmail
};
