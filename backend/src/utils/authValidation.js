/**
 * Authentication Validation Utilities
 * 
 * Provides validation functions for email authentication:
 * - Password strength validation
 * - Email format validation
 * - Display name validation
 */

// Password validation constants
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Display name constants
const DISPLAY_NAME_MIN_LENGTH = 2;
const DISPLAY_NAME_MAX_LENGTH = 50;

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * 
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, errors: string[]}} Validation result with specific errors
 */
function validatePassword(password) {
  const errors = [];
  
  // Check if password is provided
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }
  
  // Check minimum length
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  
  // Check maximum length
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Password must be no more than ${PASSWORD_MAX_LENGTH} characters`);
  }
  
  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if password meets all requirements (simple boolean check)
 * @param {string} password - Password to check
 * @returns {boolean} True if password is valid
 */
function isValidPassword(password) {
  return validatePassword(password).valid;
}

/**
 * Validate email format
 * Uses RFC 5322 simplified regex
 * 
 * @param {string} email - Email to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
function validateEmail(email) {
  // Check if email is provided
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  // Trim and lowercase
  const normalizedEmail = email.trim().toLowerCase();
  
  // Check length
  if (normalizedEmail.length === 0) {
    return { valid: false, error: 'Email is required' };
  }
  
  if (normalizedEmail.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }
  
  // Check format
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  // Check for valid domain part
  const parts = normalizedEmail.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  const [localPart, domain] = parts;
  
  // Local part checks
  if (localPart.length === 0 || localPart.length > 64) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  // Domain checks
  if (domain.length === 0 || domain.length > 253) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  // Domain must have at least one dot (TLD)
  if (!domain.includes('.')) {
    return { valid: false, error: 'Invalid email domain' };
  }
  
  // TLD must be at least 2 characters
  const tld = domain.split('.').pop();
  if (tld.length < 2) {
    return { valid: false, error: 'Invalid email domain' };
  }
  
  return { valid: true };
}

/**
 * Check if email format is valid (simple boolean check)
 * @param {string} email - Email to check
 * @returns {boolean} True if email is valid
 */
function isValidEmail(email) {
  return validateEmail(email).valid;
}

/**
 * Validate display name
 * @param {string} name - Display name to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
function validateDisplayName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Display name is required' };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < DISPLAY_NAME_MIN_LENGTH) {
    return { valid: false, error: `Display name must be at least ${DISPLAY_NAME_MIN_LENGTH} characters` };
  }
  
  if (trimmedName.length > DISPLAY_NAME_MAX_LENGTH) {
    return { valid: false, error: `Display name must be no more than ${DISPLAY_NAME_MAX_LENGTH} characters` };
  }
  
  // Check for invalid characters (allow letters, numbers, spaces, and common punctuation)
  if (!/^[\p{L}\p{N}\s\-_.]+$/u.test(trimmedName)) {
    return { valid: false, error: 'Display name contains invalid characters' };
  }
  
  return { valid: true };
}

/**
 * Normalize email for storage and comparison
 * @param {string} email - Email to normalize
 * @returns {string} Normalized email
 */
function normalizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return '';
  }
  return email.trim().toLowerCase();
}

/**
 * Calculate password strength score (0-100)
 * @param {string} password - Password to score
 * @returns {{score: number, level: string, feedback: string[]}}
 */
function getPasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { score: 0, level: 'none', feedback: ['Enter a password'] };
  }
  
  let score = 0;
  const feedback = [];
  
  // Length scoring
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Character variety scoring
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  
  // Feedback
  if (password.length < 8) feedback.push('Use at least 8 characters');
  if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters');
  if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters');
  if (!/[0-9]/.test(password)) feedback.push('Add numbers');
  if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Add special characters for extra security');
  
  // Determine level
  let level;
  if (score < 30) level = 'weak';
  else if (score < 50) level = 'fair';
  else if (score < 70) level = 'good';
  else level = 'strong';
  
  return { score: Math.min(100, score), level, feedback };
}

// Export constants for testing
const VALIDATION_CONSTANTS = {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  EMAIL_REGEX
};

module.exports = {
  validatePassword,
  isValidPassword,
  validateEmail,
  isValidEmail,
  validateDisplayName,
  normalizeEmail,
  getPasswordStrength,
  VALIDATION_CONSTANTS
};
