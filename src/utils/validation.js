/**
 * Frontend Validation Utilities
 * Client-side validation before API calls
 */

import { CONFIG } from './config';

// ============================================================================
// TEXT VALIDATION
// ============================================================================

/**
 * Validate text input
 * @param {string} text - Text to validate
 * @param {Object} options - Validation options
 * @returns {Object} - { valid, errors, warnings, stats }
 */
export function validateText(text, options = {}) {
  const {
    minLength = CONFIG.VALIDATION.TEXT.MIN_LENGTH,
    maxLength = CONFIG.VALIDATION.TEXT.MAX_LENGTH,
    minWords = 3,
    minSentences = 1,
    task = 'general'
  } = options;
  
  const errors = [];
  const warnings = [];
  
  // Check if text exists
  if (!text || typeof text !== 'string') {
    return {
      valid: false,
      errors: ['Text is required'],
      warnings: [],
      stats: null
    };
  }
  
  // Trim and normalize
  const normalizedText = text.trim().replace(/\s+/g, ' ');
  
  // Calculate stats
  const stats = calculateTextStats(normalizedText);
  
  // Length validation
  if (normalizedText.length < minLength) {
    errors.push(`Text must be at least ${minLength} characters (currently ${normalizedText.length})`);
  }
  
  if (normalizedText.length > maxLength) {
    errors.push(`Text must not exceed ${maxLength} characters (currently ${normalizedText.length})`);
  }
  
  // Word count validation
  if (stats.wordCount < minWords) {
    errors.push(`Text must contain at least ${minWords} words (currently ${stats.wordCount})`);
  }
  
  // Sentence count validation
  if (stats.sentenceCount < minSentences) {
    errors.push(`Text must contain at least ${minSentences} sentence(s)`);
  }
  
  // Task-specific validation
  if (task === 'analyze' || task === 'detect') {
    if (stats.wordCount < 50) {
      warnings.push('For better accuracy, use at least 50 words');
    }
  }
  
  if (task === 'rewrite') {
    if (stats.wordCount > 2000) {
      warnings.push('Long texts may take longer to process');
    }
  }
  
  // Content warnings
  if (stats.avgWordLength > 10) {
    warnings.push('Text contains unusually long words');
  }
  
  if (stats.avgSentenceLength > 50) {
    warnings.push('Text contains very long sentences');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      ...stats,
      display: `${stats.wordCount} words, ${stats.sentenceCount} sentences, ${stats.characterCount} characters`
    }
  };
}

/**
 * Calculate text statistics
 */
export function calculateTextStats(text) {
  if (!text) {
    return {
      characterCount: 0,
      wordCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      avgWordLength: 0,
      avgSentenceLength: 0
    };
  }
  
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  const totalWordLength = words.reduce((sum, word) => sum + word.length, 0);
  
  return {
    characterCount: text.length,
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    avgWordLength: words.length > 0 ? totalWordLength / words.length : 0,
    avgSentenceLength: sentences.length > 0 ? words.length / sentences.length : 0
  };
}

// ============================================================================
// PROFILE VALIDATION
// ============================================================================

/**
 * Validate profile name
 */
export function validateProfileName(name) {
  const errors = [];
  
  if (!name || typeof name !== 'string') {
    return { valid: false, errors: ['Profile name is required'] };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < CONFIG.VALIDATION.PROFILE_NAME.MIN_LENGTH) {
    errors.push('Profile name is too short');
  }
  
  if (trimmed.length > CONFIG.VALIDATION.PROFILE_NAME.MAX_LENGTH) {
    errors.push(`Profile name must not exceed ${CONFIG.VALIDATION.PROFILE_NAME.MAX_LENGTH} characters`);
  }
  
  // Check for invalid characters
  if (/[<>{}[\]\\\/]/.test(trimmed)) {
    errors.push('Profile name contains invalid characters');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    value: trimmed
  };
}

/**
 * Validate sample text for profile
 */
export function validateSampleText(text, type = 'short') {
  const minWords = type === 'long' ? CONFIG.MIN_WORDS_LONG_TEXT : CONFIG.MIN_WORDS_SHORT_SAMPLE;
  
  return validateText(text, {
    minLength: minWords * 4, // Approximate characters
    minWords,
    task: 'sample'
  });
}

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

/**
 * Validate email address
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  const trimmed = email.trim().toLowerCase();
  
  if (!CONFIG.VALIDATION.EMAIL.PATTERN.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  if (trimmed.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }
  
  return { valid: true, value: trimmed };
}

// ============================================================================
// FILE VALIDATION
// ============================================================================

/**
 * Validate file for upload
 */
export function validateFile(file) {
  const errors = [];
  
  if (!file) {
    return { valid: false, errors: ['No file selected'] };
  }
  
  // Check file size
  if (file.size > CONFIG.MAX_FILE_SIZE_BYTES) {
    errors.push(`File size must not exceed ${CONFIG.MAX_FILE_SIZE_MB}MB`);
  }
  
  // Check file type
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!CONFIG.SUPPORTED_FILE_TYPES.includes(extension)) {
    errors.push(`Unsupported file type. Allowed: ${CONFIG.SUPPORTED_FILE_TYPES.join(', ')}`);
  }
  
  // Check MIME type
  if (!CONFIG.SUPPORTED_MIME_TYPES.includes(file.type)) {
    errors.push('Invalid file format');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      extension
    }
  };
}

// ============================================================================
// SANITIZATION
// ============================================================================

/**
 * Sanitize text input
 */
export function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim();
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
  };
  
  return text.replace(/[&<>"']/g, char => htmlEntities[char]);
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate before AI analysis
 */
export function validateTextBeforeAI(text, model = 'gemini-2.0-flash-exp', options = {}) {
  const { task = 'analyze' } = options;
  
  // Task-specific minimum lengths
  const minLengths = {
    analyze: 50,
    detect: 50,
    rewrite: 10,
    chat: 1
  };
  
  return validateText(text, {
    minLength: minLengths[task] || 10,
    task
  });
}

export default {
  validateText,
  validateProfileName,
  validateSampleText,
  validateEmail,
  validateFile,
  validateTextBeforeAI,
  calculateTextStats,
  sanitizeText,
  escapeHtml
};
