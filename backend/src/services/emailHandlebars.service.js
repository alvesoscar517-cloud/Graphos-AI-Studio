/**
 * Email Service with Handlebars Templates
 * Powered by nodemailer-express-handlebars
 * 
 * @module services/emailHandlebars
 */

const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const logger = require('../utils/logger');
const config = require('../config');

// ============================================================================
// CONFIGURATION
// ============================================================================

const TEMPLATES_DIR = path.join(__dirname, '../templates/emails');
const LAYOUTS_DIR = path.join(TEMPLATES_DIR, 'layouts');

// ============================================================================
// TRANSPORTER SETUP
// ============================================================================

let transporter = null;
let isConfigured = false;

/**
 * Initialize email transporter with Handlebars
 */
function initializeTransporter() {
  if (transporter) return transporter;
  
  const smtpHost = config.SMTP_HOST || process.env.SMTP_HOST;
  const smtpPort = config.SMTP_PORT || process.env.SMTP_PORT || 587;
  const smtpUser = config.SMTP_USER || process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = config.SMTP_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  
  if (!smtpUser || !smtpPass) {
    logger.warn('Email service not configured - missing SMTP credentials');
    return null;
  }
  
  // Create transporter
  const transportConfig = smtpHost 
    ? {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass }
      }
    : {
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass }
      };
  
  transporter = nodemailer.createTransport(transportConfig);
  
  // Configure Handlebars
  const handlebarOptions = {
    viewEngine: {
      extName: '.hbs',
      partialsDir: TEMPLATES_DIR,
      layoutsDir: LAYOUTS_DIR,
      defaultLayout: 'main'
    },
    viewPath: TEMPLATES_DIR,
    extName: '.hbs'
  };
  
  transporter.use('compile', hbs(handlebarOptions));
  isConfigured = true;
  
  logger.info('Email transporter initialized with Handlebars templates');
  
  return transporter;
}

// ============================================================================
// EMAIL SENDING FUNCTIONS
// ============================================================================

/**
 * Send email using template
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name (without .hbs)
 * @param {Object} options.context - Template context data
 * @returns {Promise<Object>} Send result
 */
async function sendTemplateEmail(options) {
  const transport = initializeTransporter();
  
  if (!transport) {
    logger.warn('Email not sent - transporter not configured', { to: options.to });
    return { success: false, error: 'Email service not configured' };
  }
  
  const { to, subject, template, context = {} } = options;
  
  // Add common context
  const fullContext = {
    ...context,
    year: new Date().getFullYear(),
    lang: context.lang || 'en'
  };
  
  try {
    const fromEmail = config.EMAIL_FROM || process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const fromName = config.EMAIL_FROM_NAME || process.env.EMAIL_FROM_NAME || 'Graphos AI Studio';
    
    const result = await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      template,
      context: fullContext
    });
    
    logger.info('Template email sent', { to, template, messageId: result.messageId });
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error('Failed to send template email', { 
      to, 
      template, 
      error: error.message 
    });
    
    return { success: false, error: error.message };
  }
}

/**
 * Send OTP verification email
 */
async function sendOTPVerificationEmail(email, code, options = {}) {
  return sendTemplateEmail({
    to: email,
    subject: 'Verify Your Email - Graphos AI Studio',
    template: 'otp-verification',
    context: {
      code,
      userName: options.userName || email.split('@')[0],
      expiryMinutes: options.expiryMinutes || 10,
      lang: options.lang || 'en'
    }
  });
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email, code, options = {}) {
  return sendTemplateEmail({
    to: email,
    subject: 'Reset Your Password - Graphos AI Studio',
    template: 'password-reset',
    context: {
      code,
      userName: options.userName || email.split('@')[0],
      expiryMinutes: options.expiryMinutes || 10,
      lang: options.lang || 'en'
    }
  });
}

/**
 * Send password changed notification
 */
async function sendPasswordChangedEmail(email, options = {}) {
  return sendTemplateEmail({
    to: email,
    subject: 'Password Changed - Graphos AI Studio',
    template: 'password-changed',
    context: {
      userName: options.userName || email.split('@')[0],
      changedAt: options.changedAt || new Date().toLocaleString(),
      lang: options.lang || 'en'
    }
  });
}

/**
 * Send new device login notification
 */
async function sendNewDeviceLoginEmail(email, deviceInfo, options = {}) {
  return sendTemplateEmail({
    to: email,
    subject: 'New Device Login - Graphos AI Studio',
    template: 'new-device-login',
    context: {
      userName: options.userName || email.split('@')[0],
      deviceInfo: deviceInfo.userAgent || 'Unknown device',
      ipAddress: deviceInfo.ipAddress || 'Unknown',
      location: deviceInfo.location || 'Unknown',
      loginTime: deviceInfo.loginTime || new Date().toLocaleString(),
      secureAccountUrl: options.secureAccountUrl,
      lang: options.lang || 'en'
    }
  });
}

/**
 * Send welcome email
 */
async function sendWelcomeEmail(email, options = {}) {
  return sendTemplateEmail({
    to: email,
    subject: 'Welcome to Graphos AI Studio! 🎉',
    template: 'welcome',
    context: {
      userName: options.userName || email.split('@')[0],
      dashboardUrl: options.dashboardUrl,
      lang: options.lang || 'en'
    }
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Core function
  sendTemplateEmail,
  
  // Specific email functions
  sendOTPVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendNewDeviceLoginEmail,
  sendWelcomeEmail,
  
  // Utilities
  initializeTransporter,
  isConfigured: () => isConfigured
};
