/**
 * Email Authentication Controller
 * Handles HTTP requests for email/password authentication
 */

const emailAuthService = require('../services/emailAuth.service');
const { otpVerificationEmail, passwordResetEmail } = require('../services/emailTemplate.service');
const { createLocalizer } = require('../utils/localized-messages.util');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send OTP email
 */
async function sendOTPEmail(email, code, type, userName, locale) {
  const templateFn = type === 'verification' ? otpVerificationEmail : passwordResetEmail;
  const subject = type === 'verification' 
    ? 'Verify Your Email - AI Content Authenticator'
    : 'Reset Your Password - AI Content Authenticator';
  
  const html = templateFn({
    code,
    userName: userName || email.split('@')[0],
    expiryMinutes: 10,
    lang: locale
  });
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html
  });
  
  logger.info('OTP email sent', { email, type });
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
    
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and verification code are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    const result = await emailAuthService.verifyEmail(email, otp);
    
    res.json({
      success: true,
      user: result.user,
      token: result.token,
      message: 'Email verified successfully'
    });
    
  } catch (error) {
    logger.error('Email verification error', { error: error.message });
    
    const errorCode = error.message.split(':')[0];
    const errorMessage = error.message.split(': ')[1] || error.message;
    
    let statusCode = 500;
    if (errorCode === 'AUTH_INVALID_OTP') {
      statusCode = 400;
    } else if (errorCode === 'AUTH_REGISTRATION_EXPIRED') {
      statusCode = 410;
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
 * Login with email and password
 * POST /auth/email/login
 */
exports.login = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    const result = await emailAuthService.login(email, password);
    
    res.json({
      success: true,
      user: result.user,
      token: result.token
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
  
  try {
    const { email, locale } = req.body;
    
    if (!email) {
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
 */
exports.linkGoogle = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { googleIdToken } = req.body;
    const userId = req.userId; // From auth middleware
    
    if (!googleIdToken) {
      return res.status(400).json({
        success: false,
        error: 'Google ID token is required',
        code: 'MISSING_FIELDS'
      });
    }
    
    const result = await emailAuthService.linkGoogle(userId, googleIdToken);
    
    res.json({
      success: true,
      googleEmail: result.googleEmail,
      message: 'Google account linked successfully'
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
