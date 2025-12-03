/**
 * OTP Service - Powered by otplib
 * RFC 4226 (HOTP) and RFC 6238 (TOTP) compliant OTP generation
 * 
 * Features:
 * - 6-digit OTP generation with 10-minute expiration
 * - Attempt tracking with lockout after 5 failed attempts
 * - Rate limiting for resend requests (3 per hour)
 * - Secure OTP storage with hashing
 * 
 * @module services/otp
 */

const { authenticator, totp } = require('otplib');
const crypto = require('crypto');
const { db } = require('../config/firebase');
const logger = require('../utils/logger');
const { addTime, isDateBefore, getMinutesDiff } = require('../utils/date');

// ============================================================================
// CONFIGURATION
// ============================================================================

// OTP Settings
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const OTP_STEP = OTP_EXPIRY_MINUTES * 60; // Step in seconds for TOTP

// Rate Limiting
const MAX_VERIFICATION_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 30;
const MAX_RESENDS_PER_HOUR = 3;
const RESEND_WINDOW_MINUTES = 60;

// Collection name
const OTP_COLLECTION = 'otp_codes';

// ============================================================================
// OTPLIB CONFIGURATION
// ============================================================================

// Configure authenticator for our use case
authenticator.options = {
  digits: OTP_LENGTH,
  step: OTP_STEP,
  window: 1 // Allow 1 step before/after for clock drift
};

// Configure TOTP
totp.options = {
  digits: OTP_LENGTH,
  step: OTP_STEP,
  window: 1
};

// ============================================================================
// CORE OTP FUNCTIONS
// ============================================================================

/**
 * Generate a cryptographically secure secret
 * @returns {string} Base32 encoded secret
 */
function generateSecret() {
  return authenticator.generateSecret(20); // 20 bytes = 160 bits
}

/**
 * Generate OTP code using otplib
 * @param {string} secret - Base32 encoded secret
 * @returns {string} 6-digit OTP code
 */
function generateOTPCode(secret) {
  if (secret) {
    return authenticator.generate(secret);
  }
  // Fallback: generate random 6-digit code
  const randomBytes = crypto.randomBytes(4);
  const randomNumber = randomBytes.readUInt32BE(0) % 1000000;
  return randomNumber.toString().padStart(OTP_LENGTH, '0');
}

/**
 * Verify OTP code using otplib
 * @param {string} token - OTP code to verify
 * @param {string} secret - Base32 encoded secret
 * @returns {boolean} True if valid
 */
function verifyOTPCode(token, secret) {
  if (!secret) return false;
  return authenticator.verify({ token, secret });
}

/**
 * Hash OTP for secure storage (fallback for non-TOTP mode)
 * @param {string} otp - Plain OTP code
 * @returns {string} Hashed OTP
 */
function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Generate and store OTP for email verification or password reset
 * @param {string} email - User email
 * @param {string} type - 'verification' or 'password_reset'
 * @returns {Promise<{code: string, expiresAt: Date}>} Generated OTP and expiration
 */
async function generateOTP(email, type = 'verification') {
  const normalizedEmail = email.toLowerCase().trim();
  const docId = `${normalizedEmail}_${type}`;
  
  logger.info('Generating OTP', { email: normalizedEmail, docId, type });
  
  // Check rate limit for resends
  const existingDoc = await db.collection(OTP_COLLECTION).doc(docId).get();
  
  const now = new Date();
  
  if (existingDoc.exists) {
    const data = existingDoc.data();
    const lastResendAt = data.lastResendAt?.toDate();
    
    // Check resend rate limit
    if (lastResendAt) {
      const windowStart = addTime(now, -RESEND_WINDOW_MINUTES, 'minutes');
      if (isDateBefore(windowStart, lastResendAt) && data.resendCount >= MAX_RESENDS_PER_HOUR) {
        const waitMinutes = Math.ceil(getMinutesDiff(addTime(lastResendAt, RESEND_WINDOW_MINUTES, 'minutes'), now));
        throw new Error(`RATE_LIMITED: Please wait ${waitMinutes} minutes before requesting another code`);
      }
    }
    
    // Check if locked out
    if (data.lockedUntil) {
      const lockedUntil = data.lockedUntil.toDate();
      if (isDateBefore(now, lockedUntil)) {
        const waitMinutes = Math.ceil(getMinutesDiff(lockedUntil, now));
        throw new Error(`LOCKED: Too many failed attempts. Please wait ${waitMinutes} minutes`);
      }
    }
  }
  
  // Generate new secret and OTP using otplib
  const secret = generateSecret();
  const code = generateOTPCode(secret);
  const expiresAt = addTime(now, OTP_EXPIRY_MINUTES, 'minutes');
  
  // Calculate resend count
  let resendCount = 1;
  if (existingDoc.exists) {
    const data = existingDoc.data();
    const lastResendAt = data.lastResendAt?.toDate();
    const windowStart = addTime(now, -RESEND_WINDOW_MINUTES, 'minutes');
    
    if (lastResendAt && isDateBefore(windowStart, lastResendAt)) {
      resendCount = (data.resendCount || 0) + 1;
    }
  }
  
  // Store OTP data (hash the code for security)
  const otpData = {
    email: normalizedEmail,
    secret, // Store secret for TOTP verification
    codeHash: hashOTP(code), // Also store hash for fallback
    type,
    expiresAt,
    attempts: 0,
    resendCount,
    lastResendAt: now,
    lockedUntil: null,
    createdAt: now,
    updatedAt: now
  };
  
  await db.collection(OTP_COLLECTION).doc(docId).set(otpData);
  
  logger.info('OTP generated', { email: normalizedEmail, type, expiresAt });
  
  return {
    code,
    expiresAt
  };
}

/**
 * Verify OTP code
 * @param {string} email - User email
 * @param {string} code - OTP code to verify
 * @param {string} type - 'verification' or 'password_reset'
 * @returns {Promise<{success: boolean, error?: string}>} Verification result
 */
async function verifyOTP(email, code, type = 'verification') {
  const normalizedEmail = email.toLowerCase().trim();
  const docId = `${normalizedEmail}_${type}`;
  
  logger.info('Verifying OTP', { email: normalizedEmail, docId, codeLength: code?.length });
  
  const docRef = db.collection(OTP_COLLECTION).doc(docId);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    logger.warn('OTP document not found', { email: normalizedEmail, docId });
    return { success: false, error: 'No verification code found. Please request a new one.' };
  }
  
  const data = doc.data();
  const now = new Date();
  
  // Check if locked out
  if (data.lockedUntil) {
    const lockedUntil = data.lockedUntil.toDate();
    if (isDateBefore(now, lockedUntil)) {
      const waitMinutes = Math.ceil(getMinutesDiff(lockedUntil, now));
      return { 
        success: false, 
        error: `Too many failed attempts. Please wait ${waitMinutes} minutes.`,
        locked: true
      };
    }
  }
  
  // Check if already verified
  if (data.verified) {
    logger.info('OTP already verified, allowing retry', { email: normalizedEmail, type });
    return { success: true, docId, alreadyVerified: true };
  }
  
  // Check expiration
  const expiresAt = data.expiresAt.toDate();
  if (isDateBefore(expiresAt, now)) {
    return { success: false, error: 'Verification code has expired. Please request a new one.', expired: true };
  }
  
  // Verify code - try otplib first, then hash fallback
  let isValid = false;
  
  if (data.secret) {
    // Use otplib TOTP verification
    isValid = verifyOTPCode(code, data.secret);
  }
  
  // Fallback to hash comparison
  if (!isValid && data.codeHash) {
    isValid = hashOTP(code) === data.codeHash;
  }
  
  if (!isValid) {
    // Increment failed attempts
    const newAttempts = (data.attempts || 0) + 1;
    const updateData = {
      attempts: newAttempts,
      updatedAt: now
    };
    
    // Lock if too many attempts
    if (newAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      updateData.lockedUntil = addTime(now, LOCKOUT_MINUTES, 'minutes');
      await docRef.update(updateData);
      
      logger.warn('OTP verification locked', { email: normalizedEmail, type, attempts: newAttempts });
      
      return { 
        success: false, 
        error: `Too many failed attempts. Please wait ${LOCKOUT_MINUTES} minutes.`,
        locked: true
      };
    }
    
    await docRef.update(updateData);
    
    const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - newAttempts;
    return { 
      success: false, 
      error: `Invalid code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
      remainingAttempts
    };
  }
  
  // Success - mark as verified
  await docRef.update({
    verified: true,
    verifiedAt: now,
    updatedAt: now
  });
  
  logger.info('OTP verified successfully', { email: normalizedEmail, type });
  
  return { success: true, docId };
}

/**
 * Invalidate existing OTP
 * @param {string} email - User email
 * @param {string} type - 'verification' or 'password_reset'
 */
async function invalidateOTP(email, type = 'verification') {
  const normalizedEmail = email.toLowerCase().trim();
  const docId = `${normalizedEmail}_${type}`;
  
  try {
    await db.collection(OTP_COLLECTION).doc(docId).delete();
    logger.info('OTP invalidated', { email: normalizedEmail, type });
  } catch (error) {
    logger.debug('OTP invalidation - no existing record', { email: normalizedEmail, type });
  }
}

/**
 * Check if user can request new OTP (rate limit check)
 * @param {string} email - User email
 * @param {string} type - 'verification' or 'password_reset'
 * @returns {Promise<{allowed: boolean, waitMinutes?: number, resendCount?: number}>}
 */
async function checkRateLimit(email, type = 'verification') {
  const normalizedEmail = email.toLowerCase().trim();
  const docId = `${normalizedEmail}_${type}`;
  
  const doc = await db.collection(OTP_COLLECTION).doc(docId).get();
  
  if (!doc.exists) {
    return { allowed: true, resendCount: 0 };
  }
  
  const data = doc.data();
  const now = new Date();
  
  // Check lockout
  if (data.lockedUntil) {
    const lockedUntil = data.lockedUntil.toDate();
    if (isDateBefore(now, lockedUntil)) {
      const waitMinutes = Math.ceil(getMinutesDiff(lockedUntil, now));
      return { allowed: false, waitMinutes, reason: 'locked' };
    }
  }
  
  // Check resend rate limit
  const lastResendAt = data.lastResendAt?.toDate();
  if (lastResendAt) {
    const windowStart = addTime(now, -RESEND_WINDOW_MINUTES, 'minutes');
    
    if (isDateBefore(windowStart, lastResendAt) && data.resendCount >= MAX_RESENDS_PER_HOUR) {
      const waitMinutes = Math.ceil(getMinutesDiff(addTime(windowStart, RESEND_WINDOW_MINUTES, 'minutes'), now));
      return { 
        allowed: false, 
        waitMinutes, 
        reason: 'rate_limited',
        resendCount: data.resendCount 
      };
    }
    
    return { 
      allowed: true, 
      resendCount: isDateBefore(windowStart, lastResendAt) ? data.resendCount : 0 
    };
  }
  
  return { allowed: true, resendCount: 0 };
}

/**
 * Get OTP status for debugging/admin purposes
 * @param {string} email - User email
 * @param {string} type - 'verification' or 'password_reset'
 * @returns {Promise<Object|null>} OTP status or null
 */
async function getOTPStatus(email, type = 'verification') {
  const normalizedEmail = email.toLowerCase().trim();
  const docId = `${normalizedEmail}_${type}`;
  
  const doc = await db.collection(OTP_COLLECTION).doc(docId).get();
  
  if (!doc.exists) {
    return null;
  }
  
  const data = doc.data();
  const now = new Date();
  const expiresAtDate = data.expiresAt.toDate();
  const lockedUntilDate = data.lockedUntil?.toDate() || null;
  
  return {
    email: data.email,
    type: data.type,
    expiresAt: expiresAtDate,
    isExpired: isDateBefore(expiresAtDate, now),
    attempts: data.attempts,
    resendCount: data.resendCount,
    isLocked: lockedUntilDate ? isDateBefore(now, lockedUntilDate) : false,
    lockedUntil: lockedUntilDate
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export constants for testing
const OTP_CONSTANTS = {
  OTP_LENGTH,
  OTP_EXPIRY_MINUTES,
  MAX_VERIFICATION_ATTEMPTS,
  LOCKOUT_MINUTES,
  MAX_RESENDS_PER_HOUR,
  RESEND_WINDOW_MINUTES
};

module.exports = {
  // Main functions
  generateOTP,
  verifyOTP,
  invalidateOTP,
  checkRateLimit,
  getOTPStatus,
  
  // Low-level functions (for testing/advanced use)
  generateSecret,
  generateOTPCode,
  verifyOTPCode,
  hashOTP,
  
  // Constants
  OTP_CONSTANTS
};
