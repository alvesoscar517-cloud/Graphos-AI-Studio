/**
 * Input Validation Utilities
 */

/**
 * Validate text input with smart content detection
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
  
  // Smart content validation
  const contentCheck = validateContentQuality(trimmed);
  if (!contentCheck.valid) {
    throw new Error(`INVALID_CONTENT: ${contentCheck.reason}`);
  }
  
  return trimmed;
}

/**
 * Validate content quality - detect spam, code, gibberish
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
    /<\/?[a-z][\s\S]*>/gi, // HTML tags
    /\{[\s\S]*\}/g, // JSON-like structures
    /class\s+\w+\s*\{/gi,
    /def\s+\w+\s*\(/gi, // Python
    /public\s+class/gi, // Java
  ];
  
  let codeMatches = 0;
  for (const pattern of codePatterns) {
    const matches = text.match(pattern);
    if (matches) codeMatches += matches.length;
  }
  
  // If more than 3 code patterns found, likely code
  if (codeMatches >= 3) {
    return {
      valid: false,
      reason: 'Text contains code. Please provide natural text (email, blog, message...)'
    };
  }
  
  // 2. Check for excessive special characters (gibberish)
  const specialChars = text.match(/[^a-zA-Z0-9\s\u00C0-\u1EF9.,!?;:'"()\-]/g) || [];
  const specialCharRatio = specialChars.length / text.length;
  
  if (specialCharRatio > 0.3) {
    return {
      valid: false,
      reason: 'Text contains too many special characters. Please provide meaningful text.'
    };
  }
  
  // 3. Check for excessive repetition (spam)
  const words = text.toLowerCase().split(/\s+/);
  const wordFreq = {};
  words.forEach(word => {
    if (word.length > 2) { // Only count words longer than 2 chars
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const maxFreq = Math.max(...Object.values(wordFreq));
  const repetitionRatio = maxFreq / words.length;
  
  if (repetitionRatio > 0.3) {
    return {
      valid: false,
      reason: 'Text repeats too much. Please provide more diverse content.'
    };
  }
  
  // 4. Check for minimum word diversity
  const uniqueWords = new Set(words.filter(w => w.length > 2));
  const diversity = uniqueWords.size / words.length;
  
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
  const diversity = uniqueWords.size / words.length;
  
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

/**
 * Allowed AI models for rewrite and chat features
 */
const ALLOWED_MODELS = [
  'gemini-2.0-flash-exp',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro'
];

/**
 * Validate and normalize model name
 * @param {string} model - Model name from request
 * @param {string} defaultModel - Default model if invalid
 * @returns {string} - Valid model name
 */
function validateModel(model, defaultModel = 'gemini-2.5-flash') {
  if (!model || typeof model !== 'string') {
    return defaultModel;
  }
  
  const normalizedModel = model.trim().toLowerCase();
  
  // Check if model is in allowed list
  const validModel = ALLOWED_MODELS.find(m => m.toLowerCase() === normalizedModel);
  
  if (validModel) {
    return validModel;
  }
  
  console.warn(`[WARN] Invalid model requested: ${model}, using default: ${defaultModel}`);
  return defaultModel;
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
