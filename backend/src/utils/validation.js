/**
 * Input Validation Utilities
 * Now powered by Zod schemas with backward compatibility
 * 
 * @module utils/validation
 */

const { z } = require('zod');
const {
  emailSchema,
  profileIdSchema,
  userIdSchema,
  textSchema,
  modelSchema,
  ALLOWED_MODELS
} = require('../schemas');

// ============================================================================
// CONTENT QUALITY VALIDATION
// ============================================================================

/**
 * Validate content quality - detect spam, code, gibberish
 * @param {string} text - Text to validate
 * @returns {{valid: boolean, reason?: string}}
 */
function validateContentQuality(text) {
  // 1. Check for code patterns
  const codePatterns = [
    /function\s+\w+\s*\(/gi,
    /const\s+\w+\s*=/gi,
    /let\s+\w+\s*=/gi,
    /var\s+\w+\s*=/gi,
    /import\s+.*from/gi,
    /export\s+(default|const|function)/gi,
    /<\/?[a-z][\s\S]*>/gi,
    /\{[\s\S]*\}/g,
    /class\s+\w+\s*\{/gi,
    /def\s+\w+\s*\(/gi,
    /public\s+class/gi,
  ];
  
  let codeMatches = 0;
  for (const pattern of codePatterns) {
    const matches = text.match(pattern);
    if (matches) codeMatches += matches.length;
  }
  
  if (codeMatches >= 3) {
    return {
      valid: false,
      reason: 'Text contains code. Please provide natural text (email, blog, message...)'
    };
  }
  
  // 2. Check for excessive special characters
  const specialChars = text.match(/[^a-zA-Z0-9\s\u00C0-\u1EF9.,!?;:'"()\-]/g) || [];
  const specialCharRatio = specialChars.length / text.length;
  
  if (specialCharRatio > 0.3) {
    return {
      valid: false,
      reason: 'Text contains too many special characters. Please provide meaningful text.'
    };
  }
  
  // 3. Check for excessive repetition
  const words = text.toLowerCase().split(/\s+/);
  const wordFreq = {};
  words.forEach(word => {
    if (word.length > 2) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const maxFreq = Math.max(...Object.values(wordFreq), 0);
  const repetitionRatio = words.length > 0 ? maxFreq / words.length : 0;
  
  if (repetitionRatio > 0.3) {
    return {
      valid: false,
      reason: 'Text repeats too much. Please provide more diverse content.'
    };
  }
  
  // 4. Check for minimum word diversity
  const uniqueWords = new Set(words.filter(w => w.length > 2));
  const diversity = words.length > 0 ? uniqueWords.size / words.length : 0;
  
  if (diversity < 0.15 && words.length > 20) {
    return {
      valid: false,
      reason: 'Text lacks diversity. Please provide richer content.'
    };
  }
  
  // 5. Check for minimum meaningful content
  const meaningfulWords = words.filter(w => w.length >= 3);
  if (meaningfulWords.length < 5) {
    return {
      valid: false,
      reason: 'Text is too short or lacks meaningful content.'
    };
  }
  
  return { valid: true };
}

// ============================================================================
// ZOD-BASED VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate text input with smart content detection
 * @param {string} text - Text to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {string} Validated and trimmed text
 * @throws {Error} If validation fails
 */
function validateText(text, minLength = 1, maxLength = 20000) {
  const schema = z.string()
    .min(minLength, `Text must be at least ${minLength} characters`)
    .max(maxLength, `Text must not exceed ${maxLength} characters`)
    .transform(s => s.trim());
  
  const result = schema.safeParse(text);
  
  if (!result.success) {
    const message = result.error.issues[0]?.message || 'Invalid text input';
    throw new Error(`INVALID_INPUT: ${message}`);
  }
  
  const trimmed = result.data;
  
  // Smart content validation
  const contentCheck = validateContentQuality(trimmed);
  if (!contentCheck.valid) {
    throw new Error(`INVALID_CONTENT: ${contentCheck.reason}`);
  }
  
  return trimmed;
}

/**
 * Validate profile ID
 * @param {string} profileId - Profile ID to validate
 * @returns {string} Validated profile ID
 * @throws {Error} If validation fails
 */
function validateProfileId(profileId) {
  const result = profileIdSchema.safeParse(profileId);
  
  if (!result.success) {
    throw new Error('INVALID_INPUT: Invalid profile ID format');
  }
  
  return result.data;
}

/**
 * Validate user ID
 * @param {string} userId - User ID to validate
 * @returns {string} Validated user ID
 * @throws {Error} If validation fails
 */
function validateUserId(userId) {
  const result = userIdSchema.safeParse(userId);
  
  if (!result.success) {
    throw new Error('INVALID_INPUT: User ID is required');
  }
  
  return result.data;
}

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {string} Validated and normalized email
 * @throws {Error} If validation fails
 */
function validateEmail(email) {
  const result = emailSchema.safeParse(email);
  
  if (!result.success) {
    throw new Error('INVALID_INPUT: Invalid email format');
  }
  
  return result.data;
}

/**
 * Validate and normalize model name
 * @param {string} model - Model name from request
 * @param {string} defaultModel - Default model if invalid
 * @returns {string} Valid model name
 */
function validateModel(model, defaultModel = 'gemini-2.5-flash') {
  if (!model || typeof model !== 'string') {
    return defaultModel;
  }
  
  const normalizedModel = model.trim().toLowerCase();
  const validModel = ALLOWED_MODELS.find(m => m.toLowerCase() === normalizedModel);
  
  if (validModel) {
    return validModel;
  }
  
  console.warn(`[WARN] Invalid model requested: ${model}, using default: ${defaultModel}`);
  return defaultModel;
}

// ============================================================================
// LEGACY FUNCTIONS (kept for backward compatibility)
// ============================================================================

/**
 * Sanitize HTML to prevent XSS
 * @deprecated Use sanitize-html library instead
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

/**
 * Calculate profile quality score (0-100)
 */
function calculateProfileScore(samples) {
  let score = 0;
  const feedback = [];
  
  // 1. Sample count (0-25 points)
  const sampleCount = samples.length;
  if (sampleCount >= 10) {
    score += 25;
    feedback.push({ type: 'excellent', message: `Excellent sample count (${sampleCount})` });
  } else if (sampleCount >= 5) {
    score += 20;
    feedback.push({ type: 'good', message: `Good sample count (${sampleCount})` });
  } else if (sampleCount >= 3) {
    score += 15;
    feedback.push({ type: 'ok', message: `Sufficient sample count (${sampleCount})` });
  } else {
    score += 5;
    feedback.push({ type: 'warning', message: `Low sample count (${sampleCount}), add more for better AI learning` });
  }
  
  // 2. Total word count (0-25 points)
  const totalWords = samples.reduce((sum, s) => {
    return sum + s.text.split(/\s+/).filter(w => w.length > 0).length;
  }, 0);
  
  if (totalWords >= 2000) {
    score += 25;
    feedback.push({ type: 'excellent', message: `Excellent total words (${totalWords})` });
  } else if (totalWords >= 1000) {
    score += 20;
    feedback.push({ type: 'good', message: `Good total words (${totalWords})` });
  } else if (totalWords >= 500) {
    score += 15;
    feedback.push({ type: 'ok', message: `Sufficient total words (${totalWords})` });
  } else {
    score += 10;
    feedback.push({ type: 'warning', message: `Low total words (${totalWords}), add more for better AI learning` });
  }
  
  // 3. Sample diversity (0-25 points)
  const allText = samples.map(s => s.text.toLowerCase()).join(' ');
  const words = allText.split(/\s+/).filter(w => w.length > 2);
  const uniqueWords = new Set(words);
  const diversity = words.length > 0 ? uniqueWords.size / words.length : 0;
  
  if (diversity >= 0.6) {
    score += 25;
    feedback.push({ type: 'excellent', message: `Excellent vocabulary diversity (${(diversity * 100).toFixed(0)}%)` });
  } else if (diversity >= 0.4) {
    score += 20;
    feedback.push({ type: 'good', message: `Good vocabulary diversity (${(diversity * 100).toFixed(0)}%)` });
  } else if (diversity >= 0.3) {
    score += 15;
    feedback.push({ type: 'ok', message: `Sufficient vocabulary diversity (${(diversity * 100).toFixed(0)}%)` });
  } else {
    score += 10;
    feedback.push({ type: 'warning', message: `Low vocabulary diversity (${(diversity * 100).toFixed(0)}%), provide more diverse content` });
  }
  
  // 4. Sample type balance (0-25 points)
  const longSamples = samples.filter(s => s.type === 'long').length;
  const shortSamples = samples.filter(s => s.type === 'short').length;
  
  if (longSamples >= 2 && shortSamples >= 3) {
    score += 25;
    feedback.push({ type: 'excellent', message: `Good balance between long (${longSamples}) and short (${shortSamples}) text` });
  } else if (longSamples >= 1 && shortSamples >= 2) {
    score += 20;
    feedback.push({ type: 'good', message: `Has both long (${longSamples}) and short (${shortSamples}) text` });
  } else if (longSamples >= 1 || shortSamples >= 2) {
    score += 15;
    feedback.push({ type: 'ok', message: `Add more ${longSamples === 0 ? 'long text' : 'short text'}` });
  } else {
    score += 10;
    feedback.push({ type: 'warning', message: `Lacks balance between long and short text` });
  }
  
  // Determine overall rating
  let rating, recommendation;
  if (score >= 90) {
    rating = 'excellent';
    recommendation = 'Excellent profile! AI will learn your writing style very well.';
  } else if (score >= 75) {
    rating = 'good';
    recommendation = 'Good profile! AI can learn your writing style.';
  } else if (score >= 60) {
    rating = 'ok';
    recommendation = 'Profile is usable, but improve it for better AI learning.';
  } else {
    rating = 'poor';
    recommendation = 'Profile needs improvement. Add more samples and diverse content.';
  }
  
  return {
    score: Math.round(score),
    rating,
    recommendation,
    feedback,
    details: {
      sampleCount,
      totalWords,
      diversity: Math.round(diversity * 100),
      longSamples,
      shortSamples
    }
  };
}

module.exports = {
  validateText,
  validateProfileId,
  validateUserId,
  validateEmail,
  sanitizeHtml,
  validateContentQuality,
  calculateProfileScore,
  validateModel,
  ALLOWED_MODELS
};
