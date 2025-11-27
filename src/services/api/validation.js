/**
 * API Validation Service
 * Validates data before sending to API
 */

import { validateText, calculateTextStats, sanitizeText } from '../../utils/validation';
import { CONFIG, debugLog } from '../../utils/config';

// ============================================================================
// MODEL TOKEN LIMITS
// ============================================================================

const MODEL_LIMITS = {
  'gemini-2.0-flash-exp': {
    maxInputTokens: 32000,
    maxOutputTokens: 8000,
    charsPerToken: 4
  },
  'gemini-2.5-flash': {
    maxInputTokens: 32000,
    maxOutputTokens: 8000,
    charsPerToken: 4
  },
  'gemini-2.5-flash-lite': {
    maxInputTokens: 16000,
    maxOutputTokens: 4000,
    charsPerToken: 4
  },
  'gemini-2.5-pro': {
    maxInputTokens: 128000,
    maxOutputTokens: 8000,
    charsPerToken: 4
  }
};

/**
 * Estimate token count from text
 */
function estimateTokens(text, model = 'gemini-2.0-flash-exp') {
  const limits = MODEL_LIMITS[model] || MODEL_LIMITS['gemini-2.0-flash-exp'];
  return Math.ceil(text.length / limits.charsPerToken);
}

/**
 * Get max characters for model
 */
function getMaxChars(model = 'gemini-2.0-flash-exp') {
  const limits = MODEL_LIMITS[model] || MODEL_LIMITS['gemini-2.0-flash-exp'];
  return limits.maxInputTokens * limits.charsPerToken;
}

// ============================================================================
// TEXT VALIDATION FOR AI
// ============================================================================

/**
 * Validate text before sending to AI
 * @param {string} text - Text to validate
 * @param {string} model - AI model to use
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export function validateTextBeforeAI(text, model = 'gemini-2.0-flash-exp', options = {}) {
  const { task = 'analyze', showWarning = true } = options;
  
  // Sanitize input first
  const sanitized = sanitizeText(text);
  
  // Basic validation
  const validation = validateText(sanitized, {
    minLength: task === 'detect' ? 50 : 10,
    maxLength: CONFIG.MAX_TEXT_LENGTH,
    task
  });
  
  if (!validation.valid) {
    if (showWarning) {
      debugLog('Text validation failed:', validation.errors);
    }
    return {
      valid: false,
      errors: validation.errors,
      warnings: validation.warnings,
      stats: validation.stats
    };
  }
  
  // Check token limits
  const estimatedTokens = estimateTokens(sanitized, model);
  const maxChars = getMaxChars(model);
  const limits = MODEL_LIMITS[model] || MODEL_LIMITS['gemini-2.0-flash-exp'];
  
  const warnings = [...validation.warnings];
  let recommendation = 'ok';
  let chunks = null;
  
  if (estimatedTokens > limits.maxInputTokens * 0.9) {
    warnings.push(`Text is close to model limit (${estimatedTokens} estimated tokens)`);
    recommendation = 'chunk';
    chunks = splitTextForModel(sanitized, model);
  }
  
  if (sanitized.length > maxChars) {
    return {
      valid: false,
      errors: [`Text exceeds maximum length for ${model} (${sanitized.length} > ${maxChars} characters)`],
      warnings,
      stats: validation.stats
    };
  }
  
  if (warnings.length > 0 && showWarning) {
    debugLog('Text validation warnings:', warnings);
  }
  
  return {
    valid: true,
    errors: [],
    warnings,
    stats: validation.stats,
    estimatedTokens,
    recommendation,
    shouldChunk: recommendation === 'chunk',
    chunks,
    sanitizedText: sanitized
  };
}

/**
 * Split text into chunks for model
 */
export function splitTextForModel(text, model = 'gemini-2.0-flash-exp') {
  const maxChars = getMaxChars(model) * 0.8; // Leave 20% buffer
  
  if (text.length <= maxChars) {
    return [text];
  }
  
  const chunks = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// ============================================================================
// PROFILE VALIDATION
// ============================================================================

/**
 * Validate profile data before API call
 */
export function validateProfileData(data) {
  const errors = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Profile name is required');
  } else if (data.name.length > 100) {
    errors.push('Profile name must not exceed 100 characters');
  }
  
  if (data.description && data.description.length > 500) {
    errors.push('Description must not exceed 500 characters');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate sample data before API call
 */
export function validateSampleData(data) {
  const errors = [];
  
  if (!data.profile_id) {
    errors.push('Profile ID is required');
  }
  
  if (!data.text) {
    errors.push('Sample text is required');
  } else {
    const textValidation = validateText(data.text, {
      minLength: 20,
      minWords: 5
    });
    
    if (!textValidation.valid) {
      errors.push(...textValidation.errors);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  validateTextBeforeAI,
  splitTextForModel,
  validateProfileData,
  validateSampleData,
  estimateTokens,
  getMaxChars
};
