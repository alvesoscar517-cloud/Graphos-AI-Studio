/**
 * OTP Service
 * Handles OTP generation, verification, and rate limiting for email authentication
 * 
 * Features:
 * - 6-digit OTP generation with 10-minute expiration
 * - Attempt tracking with lockout after 5 failed attempts
 * - Rate limiting for resend requests (3 per hour)
 * - Secure OTP storage with hashing
 */

const crypto = require('crypto');
const { db, FieldValue } = require('../config/firebase');
const logger = require('../utils/logger');

// Constants
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_VERIFICATION_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 30;
const MAX_RESENDS_PER_HOUR = 3;
const RESEND_WINDOW_MINUTES = 60;

// Collection name
const OTP_COLLECTION = 'otp_codes';

/**
 * Generate a cryptographically secure 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
function generateOTPCode() {
  // Generate random number between 0 and 999999
  const randomBytes = crypto.randomBytes(4);
  const randomNumber = randomBytes.readUInt32BE(0) % 1000000;
  // Pad with leading zeros to ensure 6 digits
  return randomNumber.toString().padStart(OTP_LENGTH, '0');
}

/**
 * Hash OTP for secure storage
 * @param {string} otp - Plain OTP code
 * @returns {string} Hashed OTP
 */
function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Generate and store OTP for email verification or password reset
 * @param {string} email - User email
 * @param {string} type - 'verification' or 'password_reset'
 * @returns {Promise<{code: string, expiresAt: Date}>} Generated OTP and expiration
 */
async function generateOTP(email, type = 'verification') {
  const normalizedEmail = email.toLowerCase().trim();
  const docId = `${normalizedEmail}_${type}`;
  
  // Check rate limit for resends
  const existingDoc = await db.collection(OTP_COLLECTION).doc(docId).get();
  
  if (existingDoc.exists) {
    const data = existingDoc.data();
    const now = new Date();
    const lastResendAt = data.lastResendAt?.toDate();
    
    // Check resend rate limit
    if (lastResendAt) {
      const windowStart = new Date(now.getTime() - RESEND_WINDOW_MINUTES * 60 * 1000);
      if (lastResendAt > windowStart && data.resendCount >= MAX_RESENDS_PER_HOUR) {
        const waitMinutes = Math.ceil((lastResendAt.getTime() + RESEND_WINDOW_MINUTES * 60 * 1000 - now.getTime()) / 60000);
        throw new Error(`RATE_LIMITED: Please wait ${waitMinutes} minutes before requesting another code`);
      }
    }
    
    // Check if locked out
    if (data.lockedUntil) {
      const lockedUntil = data.lockedUntil.toDate();
      if (lockedUntil > now) {
        const waitMinutes = Math.ceil((lockedUntil.getTime() - now.getTime()) / 60000);
        throw new Error(`LOCKED: Too many failed attempts. Please wait ${waitMinutes} minutes`);
      }
    }
  }
  
  // Generate new OTP
  const code = generateOTPCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
  
  // Calculate resend count
  let resendCount = 1;
  if (existingDoc.exists) {
    const data = existingDoc.data();
    const lastResendAt = data.lastResendAt?.toDate();
    const windowStart = new Date(now.getTime() - RESEND_WINDOW_MINUTES * 60 * 1000);
    
    if (lastResendAt && lastResendAt > windowStart) {
      resendCount = (data.resendCount || 0) + 1;
    }
  }
  
  // Store hashed OTP
  const otpData = {
    email: normalizedEmail,
    codeHash: hashOTP(code),
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
  
  const docRef = db.collection(OTP_COLLECTION).doc(docId);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    return { success: false, error: 'No verification code found. Please request a new one.' };
  }
  
  const data = doc.data();
  const now = new Date();
  
  // Check if locked out
  if (data.lockedUntil) {
    const lockedUntil = data.lockedUntil.toDate();
    if (lockedUntil > now) {
      const waitMinutes = Math.ceil((lockedUntil.getTime() - now.getTime()) / 60000);
      return { 
        success: false, 
        error: `Too many failed attempts. Please wait ${waitMinutes} minutes.`,
        locked: true
      };
    }
  }
  
  // Check expiration
  const expiresAt = data.expiresAt.toDate();
  if (expiresAt < now) {
    return { success: false, error: 'Verification code has expired. Please request a new one.', expired: true };
  }
  
  // Verify code
  const codeHash = hashOTP(code);
  if (codeHash !== data.codeHash) {
    // Increment failed attempts
    const newAttempts = (data.attempts || 0) + 1;
    const updateData = {
      attempts: newAttempts,
      updatedAt: now
    };
    
    // Lock if too many attempts
    if (newAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      updateData.lockedUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000);
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
  
  // Success - delete the OTP record
  await docRef.delete();
  
  logger.info('OTP verified successfully', { email: normalizedEmail, type });
  
  return { success: true };
}

/**
 * Invalidate existing OTP (used when generating new one)
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
    // Ignore if doesn't exist
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
    if (lockedUntil > now) {
      const waitMinutes = Math.ceil((lockedUntil.getTime() - now.getTime()) / 60000);
      return { allowed: false, waitMinutes, reason: 'locked' };
    }
  }
  
  // Check resend rate limit
  const lastResendAt = data.lastResendAt?.toDate();
  if (lastResendAt) {
    const windowStart = new Date(now.getTime() - RESEND_WINDOW_MINUTES * 60 * 1000);
    
    if (lastResendAt > windowStart && data.resendCount >= MAX_RESENDS_PER_HOUR) {
      const waitMinutes = Math.ceil((windowStart.getTime() + RESEND_WINDOW_MINUTES * 60 * 1000 - now.getTime()) / 60000);
      return { 
        allowed: false, 
        waitMinutes, 
        reason: 'rate_limited',
        resendCount: data.resendCount 
      };
    }
    
    return { 
      allowed: true, 
      resendCount: lastResendAt > windowStart ? data.resendCount : 0 
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
  
  return {
    email: data.email,
    type: data.type,
    expiresAt: data.expiresAt.toDate(),
    isExpired: data.expiresAt.toDate() < now,
    attempts: data.attempts,
    resendCount: data.resendCount,
    isLocked: data.lockedUntil ? data.lockedUntil.toDate() > now : false,
    lockedUntil: data.lockedUntil?.toDate() || null
  };
}

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
  generateOTP,
  verifyOTP,
  invalidateOTP,
  checkRateLimit,
  getOTPStatus,
  // Export for testing
  generateOTPCode,
  hashOTP,
  OTP_CONSTANTS
};
