/**
 * Password Hashing Module - Powered by Argon2
 * OWASP-recommended password hashing with bcrypt fallback
 * 
 * @module utils/password
 */

const argon2 = require('argon2');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const logger = require('./logger');

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Argon2 options (OWASP recommended)
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 */
const ARGON2_OPTIONS = {
  type: argon2.argon2id,  // Hybrid mode (recommended)
  memoryCost: 65536,      // 64 MB
  timeCost: 3,            // 3 iterations
  parallelism: 4,         // 4 parallel threads
  hashLength: 32          // 32 bytes output
};

/**
 * Bcrypt cost factor for fallback
 */
const BCRYPT_ROUNDS = 12;

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Hash password using Argon2id
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  
  try {
    const hash = await argon2.hash(password, ARGON2_OPTIONS);
    return hash;
  } catch (error) {
    logger.error('Argon2 hash failed, falling back to bcrypt', { error: error.message });
    // Fallback to bcrypt
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }
}

/**
 * Verify password against hash
 * Supports both Argon2 and bcrypt hashes for migration
 * @param {string} hash - Stored hash
 * @param {string} password - Plain text password to verify
 * @returns {Promise<boolean>} True if password matches
 */
async function verifyPassword(hash, password) {
  if (!hash || !password) {
    return false;
  }
  
  try {
    // Check if it's an Argon2 hash
    if (hash.startsWith('$argon2')) {
      return await argon2.verify(hash, password);
    }
    
    // Check if it's a bcrypt hash
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return await bcrypt.compare(password, hash);
    }
    
    // Unknown hash format
    logger.warn('Unknown hash format', { hashPrefix: hash.substring(0, 10) });
    return false;
  } catch (error) {
    logger.error('Password verification failed', { error: error.message });
    return false;
  }
}

/**
 * Check if hash needs rehashing (e.g., bcrypt to argon2 migration)
 * @param {string} hash - Stored hash
 * @returns {boolean} True if hash should be updated
 */
function needsRehash(hash) {
  if (!hash) return false;
  
  // Bcrypt hashes should be migrated to Argon2
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    return true;
  }
  
  // Check if Argon2 parameters need updating
  if (hash.startsWith('$argon2')) {
    try {
      return argon2.needsRehash(hash, ARGON2_OPTIONS);
    } catch {
      return false;
    }
  }
  
  return false;
}

/**
 * Verify password and rehash if needed
 * @param {string} hash - Stored hash
 * @param {string} password - Plain text password
 * @returns {Promise<{valid: boolean, newHash?: string}>}
 */
async function verifyAndRehash(hash, password) {
  const valid = await verifyPassword(hash, password);
  
  if (!valid) {
    return { valid: false };
  }
  
  // Check if rehash is needed
  if (needsRehash(hash)) {
    const newHash = await hashPassword(password);
    return { valid: true, newHash };
  }
  
  return { valid: true };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a secure random token
 * @param {number} length - Token length in bytes
 * @returns {string} Hex-encoded token
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a secure random password
 * @param {number} length - Password length
 * @returns {string} Random password
 */
function generateRandomPassword(length = 16) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const randomBytes = crypto.randomBytes(length);
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  return password;
}

/**
 * Timing-safe string comparison
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} True if strings are equal
 */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  if (bufA.length !== bufB.length) {
    // Still do comparison to prevent timing attacks
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Hash a value using SHA-256 (for non-password use cases)
 * @param {string} value - Value to hash
 * @returns {string} Hex-encoded hash
 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Core functions
  hashPassword,
  verifyPassword,
  needsRehash,
  verifyAndRehash,
  
  // Utilities
  generateToken,
  generateRandomPassword,
  timingSafeEqual,
  sha256,
  
  // Configuration (for testing)
  ARGON2_OPTIONS,
  BCRYPT_ROUNDS
};
