/**
 * Email Authentication Controller
 * Handles HTTP requests for email/password authentication
 */

const emailAuthService = require('../services/emailAuth.service');
const { otpVerificationEmail, passwordResetEmail, newDeviceLoginEmail, passwordChangedEmail } = require('../services/emailTemplate.service');
const { createLocalizer } = require('../utils/localized-messages.util');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');
const config = require('../config');
const envConfig = require('../config/envConfigHelper');
const activityLogService = require('../services/activityLog.service');

// Email configuration - use envConfig helper for Firestore > process.env > default fallback
// Lazy getter functions to always get latest config
function getSmtpConfig() {
  return {
    host: envConfig.get('SMTP_HOST') || config.SMTP_HOST || 'smtp.gmail.com',
    port: envConfig.get('SMTP_PORT') || config.SMTP_PORT || 587,
    user: envConfig.get('SMTP_USER') || config.SMTP_USER || '',
    pass: envConfig.get('SMTP_PASS') || config.SMTP_PASS || '',
    fromEmail: envConfig.get('EMAIL_FROM') || config.EMAIL_FROM || 'no-reply@graphosai.com',
    fromName: envConfig.get('EMAIL_FROM_NAME') || config.EMAIL_FROM_NAME || 'Graphos AI Studio'
  };
}

// For backward compatibility - these will be updated when Firestore config loads
const smtpHost = config.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = config.SMTP_PORT || 587;
const smtpUser = config.SMTP_USER || '';
const smtpPass = config.SMTP_PASS || '';
const fromEmail = config.EMAIL_FROM || 'no-reply@graphosai.com';
const fromName = config.EMAIL_FROM_NAME || 'Graphos AI Studio';

// Log SMTP configuration (without sensitive data)
logger.info('Email configuration loaded (will update from Firestore)', {
  smtpHost,
  smtpPort,
  smtpUser: smtpUser ? `${smtpUser.substring(0, 3)}***` : 'NOT SET',
  smtpPassSet: !!smtpPass,
  fromEmail,
  fromName
});

// Create transporter lazily to get latest config
function getTransporter() {
  const smtp = getSmtpConfig();
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: {
      user: smtp.user,
      pass: smtp.pass
    }
  });
}

// Legacy transporter for backward compatibility (will be replaced by getTransporter())
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass
  }
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    logger.error('SMTP transporter verification failed', { 
      error: error.message,
      code: error.code,
      smtpHost,
      smtpPort,
      smtpUser: smtpUser ? `${smtpUser.substring(0, 3)}***` : 'NOT SET'
    });
  } else {
    logger.info('SMTP transporter verified successfully');
  }
});

/**
 * Send OTP email
 */
async function sendOTPEmail(email, code, type, userName, locale) {
  // Check if SMTP is configured
  if (!smtpUser || !smtpPass) {
    logger.error('SMTP not configured - cannot send email', {
      smtpUserSet: !!smtpUser,
      smtpPassSet: !!smtpPass,
      email,
      type
    });
    throw new Error('Email service not configured');
  }

  const templateFn = type === 'verification' ? otpVerificationEmail : passwordResetEmail;
  const subject = type === 'verification' 
    ? 'Verify Your Email - Graphos AI Studio'
    : 'Reset Your Password - Graphos AI Studio';
  
  const html = templateFn({
    code,
    userName: userName || email.split('@')[0],
    expiryMinutes: 10,
    lang: locale
  });
  
  try {
    const smtp = getSmtpConfig();
    const result = await getTransporter().sendMail({
      from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
      to: email,
      subject,
      html
    });
    
    logger.info('OTP email sent successfully', { 
      email, 
      type,
      messageId: result.messageId,
      response: result.response
    });
  } catch (error) {
    logger.error('Failed to send OTP email', {
      email,
      type,
      error: error.message,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode
    });
    throw error;
  }
}

/**
 * Register new user
 * POST /auth/email/register
 */
exports.register = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { email, password, displayName, locale } = req.body;
    
    if (!email || !password || !displayName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and display name are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    const result = await emailAuthService.register({
      email,
      password,
      displayName,
      locale: locale || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en'
    });
    
    // Send verification email
    try {
      await sendOTPEmail(email, result.otpCode, 'verification', displayName, locale || 'en');
    } catch (emailError) {
      logger.error('Failed to send verification email', { email, error: emailError.message });
      // Continue - user can request resend
    }
    
    // Log registration activity (pending verification)
    activityLogService.logActivity(result.userId || email, 'register', {
      email,
      displayName,
      source: 'email_auth',
      status: 'pending_verification'
    }).catch(err => logger.warn('Failed to log register activity', { error: err.message }));
    
    res.status(201).json({
      success: true,
      pendingVerification: true,
      message: 'Registration successful. Please check your email for verification code.',
      expiresAt: result.otpExpiresAt
    });
    
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    
    const errorCode = error.message.split(':')[0];
    const errorMessage = error.message.split(': ')[1] || error.message;
    
    let statusCode = 500;
    if (errorCode === 'AUTH_INVALID_EMAIL' || errorCode === 'AUTH_WEAK_PASSWORD' || errorCode === 'AUTH_INVALID_NAME') {
      statusCode = 400;
    } else if (errorCode === 'AUTH_EMAIL_EXISTS') {
      statusCode = 409;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: errorCode
    });
  }
};

/**
 * Verify email with OTP
 * POST /auth/email/verify
 */
exports.verifyEmail = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { email, otp } = req.body;
    
    logger.info('Verify email request', { email, otpLength: otp?.length });
    
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and verification code are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    const result = await emailAuthService.verifyEmail(email, otp);

    // If token generation failed, tell user to login manually
    if (result.needsLogin) {
      return res.json({
        success: true,
        needsLogin: true,
        user: result.user,
        message: 'Account verified successfully! Please login with your email and password.'
      });
    }

    // Log email verification activity
    if (result.user?.uid) {
      activityLogService.logActivity(result.user.uid, 'verify_email', {
        email,
        source: 'email_auth',
        success: true
      }).catch(err => logger.warn('Failed to log verify_email activity', { error: err.message }));
    }
    
    res.json({
      success: true,
      user: result.user,
      // Support both old format (token) and new format (accessToken + refreshToken)
      token: result.accessToken,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      message: 'Email verified successfully'
    });
    
  } catch (error) {
    logger.error('Email verification error', { 
      error: error.message,
      stack: error.stack,
      code: error.code 
    });
    
    const errorCode = error.message.split(':')[0];
    const errorMessage = error.message.split(': ')[1] || error.message;
    
    let statusCode = 500;
    if (errorCode === 'AUTH_INVALID_OTP') {
      statusCode = 400;
    } else if (errorCode === 'AUTH_REGISTRATION_EXPIRED') {
      statusCode = 410;
    } else if (errorCode === 'AUTH_EMAIL_EXISTS') {
      statusCode = 409;
    } else if (errorCode === 'AUTH_SERVICE_UNAVAILABLE' || errorCode === 'AUTH_SERVICE_ERROR') {
      statusCode = 503;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: errorCode,
      // Include debug info in non-production for troubleshooting
      ...(process.env.NODE_ENV !== 'production' && { debug: error.message })
    });
  }
};

/**
 * Login with email and password
 * POST /auth/email/login
 */
exports.login = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { email, password, locale, rememberMe } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Get device info from request
    const deviceInfo = {
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'Unknown',
      platform: req.headers['sec-ch-ua-platform'] || 'Unknown',
      language: req.headers['accept-language']?.split(',')[0] || 'en'
    };
    
    // Pass rememberMe option to service
    const result = await emailAuthService.loginWithDeviceTracking(
      email, 
      password, 
      deviceInfo,
      { rememberMe: !!rememberMe }
    );
    
    // Send new device login notification if this is a new device
    if (result.isNewDevice && result.user) {
      try {
        const html = newDeviceLoginEmail({
          userName: result.user.name || email.split('@')[0],
          deviceInfo: deviceInfo.userAgent,
          ipAddress: deviceInfo.ipAddress,
          location: 'Unknown',
          loginTime: new Date(),
          secureAccountUrl: process.env.APP_URL ? `${process.env.APP_URL}/settings/security` : null,
          lang: locale || 'en'
        });
        
        const smtp = getSmtpConfig();
        await getTransporter().sendMail({
          from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
          to: email,
          subject: 'New Device Login - Graphos AI Studio',
          html
        });
        
        logger.info('New device login email sent', { email });
      } catch (emailError) {
        logger.error('Failed to send new device login email', { email, error: emailError.message });
      }
    }
    
    // Log login activity
    if (result.user?.uid) {
      activityLogService.logActivity(result.user.uid, 'login', {
        ip: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
        platform: deviceInfo.platform,
        isNewDevice: result.isNewDevice,
        source: 'email_auth'
      }).catch(err => logger.warn('Failed to log login activity', { error: err.message }));
    }
    
    res.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      isNewDevice: result.isNewDevice
    });
    
  } catch (error) {
    logger.error('Login error', { error: error.message });
    
    const errorCode = error.message.split(':')[0];
    const errorMessage = error.message.split(': ')[1] || error.message;
    
    let statusCode = 500;
    if (errorCode === 'AUTH_INVALID_CREDENTIALS') {
      statusCode = 401;
    } else if (errorCode === 'AUTH_ACCOUNT_LOCKED') {
      statusCode = 423;
    } else if (errorCode === 'AUTH_ACCOUNT_SUSPENDED') {
      statusCode = 403;
    } else if (errorCode === 'AUTH_ACCOUNT_DELETED') {
      statusCode = 410;
    } else if (errorCode === 'AUTH_EMAIL_NOT_VERIFIED') {
      statusCode = 403;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: errorCode
    });
  }
};

/**
 * Resend verification OTP
 * POST /auth/email/resend-otp
 */
exports.resendOTP = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { email, locale } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        code: 'MISSING_FIELDS'
      });
    }
    
    const result = await emailAuthService.resendVerificationOTP(email);
    
    // Send verification email
    try {
      await sendOTPEmail(email, result.otpCode, 'verification', null, locale || 'en');
    } catch (emailError) {
      logger.error('Failed to send verification email', { email, error: emailError.message });
    }
    
    res.json({
      success: true,
      message: 'Verification code sent',
      expiresAt: result.otpExpiresAt
    });
    
  } catch (error) {
    logger.error('Resend OTP error', { error: error.message });
    
    const errorCode = error.message.split(':')[0];
    const errorMessage = error.message.split(': ')[1] || error.message;
    
    let statusCode = 500;
    if (errorCode === 'AUTH_NO_PENDING_REGISTRATION') {
      statusCode = 404;
    } else if (errorCode === 'RATE_LIMITED') {
      statusCode = 429;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: errorCode
    });
  }
};

/**
 * Request password reset
 * POST /auth/email/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  const l = createLocalizer(req);
  
  // Skip OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  try {
    // Debug logging - more detailed
    logger.info('Forgot password request received', { 
      body: req.body,
      rawBody: req.rawBody ? req.rawBody.toString().substring(0, 200) : 'no rawBody',
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      bodyType: typeof req.body,
      bodyStringified: JSON.stringify(req.body),
      method: req.method,
      url: req.url,
      origin: req.headers['origin'],
      userAgent: req.headers['user-agent']?.substring(0, 50)
    });
    
    const { email, locale } = req.body || {};
    
    if (!email) {
      logger.warn('Forgot password missing email', { body: req.body });
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        code: 'MISSING_FIELDS'
      });
    }
    
    const result = await emailAuthService.requestPasswordReset(email);
    
    // Send reset email if OTP was generated
    if (result.otpCode) {
      try {
        await sendOTPEmail(email, result.otpCode, 'password_reset', null, locale || 'en');
      } catch (emailError) {
        logger.error('Failed to send password reset email', { email, error: emailError.message });
      }
    }
    
    // Log forgot password request (don't log email for security)
    activityLogService.logActivity('system', 'forgot_password', {
      source: 'email_auth',
      requested: true
    }).catch(err => logger.warn('Failed to log forgot_password activity', { error: err.message }));
    
    // Always return success (security - don't reveal if email exists)
    res.json({
      success: true,
      message: result.message
    });
    
  } catch (error) {
    logger.error('Forgot password error', { error: error.message });
    
    if (error.message.includes('RATE_LIMITED')) {
      return res.status(429).json({
        success: false,
        error: error.message.split(': ')[1] || 'Too many requests',
        code: 'RATE_LIMITED'
      });
    }
    
    // Generic response for security
    res.json({
      success: true,
      message: 'If this email is registered, you will receive a password reset code'
    });
  }
};

/**
 * Reset password with OTP
 * POST /auth/email/reset-password
 */
exports.resetPassword = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, verification code, and new password are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    const result = await emailAuthService.resetPassword(email, otp, newPassword);
    
    // Log password reset activity
    if (result.userId) {
      activityLogService.logActivity(result.userId, 'reset_password', {
        source: 'email_auth',
        success: true
      }).catch(err => logger.warn('Failed to log reset_password activity', { error: err.message }));
    }
    
    res.json({
      success: true,
      message: result.message
    });
    
  } catch (error) {
    logger.error('Reset password error', { error: error.message });
    
    const errorCode = error.message.split(':')[0];
    const errorMessage = error.message.split(': ')[1] || error.message;
    
    let statusCode = 500;
    if (errorCode === 'AUTH_INVALID_OTP' || errorCode === 'AUTH_WEAK_PASSWORD') {
      statusCode = 400;
    } else if (errorCode === 'AUTH_USER_NOT_FOUND') {
      statusCode = 404;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: errorCode
    });
  }
};

/**
 * Link Google account
 * POST /auth/email/link-google
 * Now accepts OAuth access token instead of Firebase ID token
 */
exports.linkGoogle = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { googleAccessToken, googleEmail, googleName } = req.body;
    const userId = req.userId; // From auth middleware
    
    if (!googleAccessToken || !googleEmail) {
      return res.status(400).json({
        success: false,
        error: 'Google access token and email are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    const result = await emailAuthService.linkGoogleWithOAuth(userId, {
      accessToken: googleAccessToken,
      email: googleEmail,
      name: googleName
    });
    
    res.json({
      success: true,
      googleEmail: result.googleEmail,
      message: 'Google account linked successfully. Drive sync is now enabled.'
    });
    
  } catch (error) {
    logger.error('Link Google error', { error: error.message });
    
    const errorCode = error.message.split(':')[0];
    const errorMessage = error.message.split(': ')[1] || error.message;
    
    let statusCode = 500;
    if (errorCode === 'AUTH_GOOGLE_ALREADY_LINKED') {
      statusCode = 409;
    } else if (errorCode === 'AUTH_USER_NOT_FOUND' || errorCode === 'AUTH_INVALID_OPERATION') {
      statusCode = 400;
    } else if (errorCode === 'AUTH_INVALID_TOKEN') {
      statusCode = 401;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: errorCode
    });
  }
};

/**
 * Unlink Google account
 * POST /auth/email/unlink-google
 */
exports.unlinkGoogle = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const userId = req.userId; // From auth middleware
    
    await emailAuthService.unlinkGoogle(userId);
    
    res.json({
      success: true,
      message: 'Google account unlinked successfully'
    });
    
  } catch (error) {
    logger.error('Unlink Google error', { error: error.message });
    
    const errorCode = error.message.split(':')[0];
    const errorMessage = error.message.split(': ')[1] || error.message;
    
    let statusCode = 500;
    if (errorCode === 'AUTH_USER_NOT_FOUND' || errorCode === 'AUTH_NO_GOOGLE_LINKED') {
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: errorCode
    });
  }
};

/**
 * Change password for authenticated user
 * POST /auth/email/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword, locale } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    const result = await emailAuthService.changePassword(userId, currentPassword, newPassword);
    
    // Log password change activity
    activityLogService.logActivity(userId, 'change_password', {
      source: 'email_auth',
      success: true
    }).catch(err => logger.warn('Failed to log change_password activity', { error: err.message }));
    
    // Send password changed notification email
    if (result.success && req.user?.email) {
      try {
        const html = passwordChangedEmail({
          userName: req.user.name || req.user.email.split('@')[0],
          changedAt: new Date(),
          lang: locale || 'en'
        });
        
        const smtp = getSmtpConfig();
        await getTransporter().sendMail({
          from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
          to: req.user.email,
          subject: 'Password Changed - Graphos AI Studio',
          html
        });
        
        logger.info('Password changed email sent', { userId });
      } catch (emailError) {
        logger.error('Failed to send password changed email', { userId, error: emailError.message });
      }
    }
    
    res.json(result);
    
  } catch (error) {
    logger.error('Change password error', { error: error.message });
    
    const errorCode = error.message.split(':')[0];
    const errorMessage = error.message.split(': ')[1] || error.message;
    
    let statusCode = 500;
    if (errorCode === 'AUTH_INVALID_PASSWORD' || errorCode === 'AUTH_WEAK_PASSWORD' || 
        errorCode === 'AUTH_PASSWORD_REUSED' || errorCode === 'AUTH_PASSWORD_SAME') {
      statusCode = 400;
    } else if (errorCode === 'AUTH_USER_NOT_FOUND') {
      statusCode = 404;
    } else if (errorCode === 'AUTH_INVALID_OPERATION') {
      statusCode = 403;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: errorCode
    });
  }
};

/**
 * Delete user account
 * DELETE /auth/email/account
 */
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;
    
    const result = await emailAuthService.deleteAccount(userId, password);
    
    // Log account deletion activity
    activityLogService.logActivity(userId, 'delete_account', {
      source: 'email_auth',
      success: true
    }).catch(err => logger.warn('Failed to log delete_account activity', { error: err.message }));
    
    res.json(result);
    
  } catch (error) {
    logger.error('Delete account error', { error: error.message });
    
    const errorCode = error.message.split(':')[0];
    const errorMessage = error.message.split(': ')[1] || error.message;
    
    let statusCode = 500;
    if (errorCode === 'AUTH_INVALID_PASSWORD' || errorCode === 'AUTH_PASSWORD_REQUIRED') {
      statusCode = 400;
    } else if (errorCode === 'AUTH_USER_NOT_FOUND') {
      statusCode = 404;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: errorCode
    });
  }
};

/**
 * Get active sessions
 * GET /auth/email/sessions
 */
exports.getSessions = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const sessions = await emailAuthService.getActiveSessions(userId);
    
    res.json({
      success: true,
      sessions
    });
    
  } catch (error) {
    logger.error('Get sessions error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.userId 
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get sessions',
      code: 'GET_SESSIONS_ERROR',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

/**
 * Revoke a specific session
 * DELETE /auth/email/sessions/:sessionId
 */
exports.revokeSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
        code: 'MISSING_SESSION_ID'
      });
    }
    
    await emailAuthService.revokeSession(userId, sessionId);
    
    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
    
  } catch (error) {
    logger.error('Revoke session error', { error: error.message });
    
    const errorCode = error.message.split(':')[0];
    const errorMessage = error.message.split(': ')[1] || error.message;
    
    let statusCode = 500;
    if (errorCode === 'AUTH_SESSION_NOT_FOUND') {
      statusCode = 404;
    } else if (errorCode === 'AUTH_UNAUTHORIZED') {
      statusCode = 403;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: errorCode
    });
  }
};

/**
 * Revoke all other sessions
 * POST /auth/email/sessions/revoke-others
 */
exports.revokeOtherSessions = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentSessionId } = req.body;
    
    const result = await emailAuthService.revokeAllOtherSessions(userId, currentSessionId);
    
    res.json({
      success: true,
      message: `Revoked ${result.revokedCount} session(s)`,
      revokedCount: result.revokedCount
    });
    
  } catch (error) {
    logger.error('Revoke other sessions error', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to revoke sessions',
      code: 'REVOKE_SESSIONS_ERROR'
    });
  }
};

/**
 * Get login history
 * GET /auth/email/login-history
 */
exports.getLoginHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 10;
    
    const history = await emailAuthService.getLoginHistory(userId, Math.min(limit, 50));
    
    res.json({
      success: true,
      history
    });
    
  } catch (error) {
    logger.error('Get login history error', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get login history',
      code: 'GET_HISTORY_ERROR'
    });
  }
};

/**
 * Refresh access token
 * POST /auth/email/refresh
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }
    
    const result = await emailAuthService.refreshAccessToken(refreshToken);
    
    res.json({
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken, // New refresh token (rotation)
      expiresIn: result.expiresIn
    });
    
  } catch (error) {
    logger.error('Refresh token error', { error: error.message });
    
    const errorCode = error.message.split(':')[0];
    const errorMessage = error.message.split(': ')[1] || error.message;
    
    let statusCode = 500;
    if (errorCode === 'AUTH_INVALID_REFRESH_TOKEN' || errorCode === 'AUTH_REFRESH_TOKEN_EXPIRED') {
      statusCode = 401;
    } else if (errorCode === 'AUTH_USER_NOT_FOUND') {
      statusCode = 404;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: errorCode
    });
  }
};
