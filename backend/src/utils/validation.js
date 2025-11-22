/**
 * Input Validation Utilities
 */

/**
 * Validate text input
 */
function validateText(text, minLength = 1, maxLength = 20000) {
  if (!text || typeof text !== 'string') {
    throw new Error('INVALID_INPUT: Text must be a non-empty string');
  }
  
  const trimmed = text.trim();
  
  if (trimmed.length < minLength) {
    throw new Error(`INVALID_INPUT: Text must be at least ${minLength} characters`);
  }
  
  if (trimmed.length > maxLength) {
    throw new Error(`INVALID_INPUT: Text must not exceed ${maxLength} characters`);
  }
  
  return trimmed;
}

/**
 * Validate profile ID
 */
function validateProfileId(profileId) {
  if (!profileId || typeof profileId !== 'string') {
    throw new Error('INVALID_INPUT: Profile ID is required');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(profileId)) {
    throw new Error('INVALID_INPUT: Invalid profile ID format');
  }
  
  return profileId;
}

/**
 * Validate user ID
 */
function validateUserId(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('INVALID_INPUT: User ID is required');
  }
  
  return userId;
}

/**
 * Validate email
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('INVALID_INPUT: Email is required');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('INVALID_INPUT: Invalid email format');
  }
  
  return email.toLowerCase();
}

/**
 * Sanitize HTML to prevent XSS
 */
function sanitizeHtml(html) {
  if (!html) return '';
  
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

module.exports = {
  validateText,
  validateProfileId,
  validateUserId,
  validateEmail,
  sanitizeHtml
};
