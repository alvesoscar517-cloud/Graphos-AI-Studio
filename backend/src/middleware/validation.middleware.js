/**
 * Input Validation Middleware
 * Comprehensive validation for all API inputs
 */

const logger = require('../utils/logger');

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const SCHEMAS = {
  // Text validation
  text: {
    minLength: 1,
    maxLength: 50000,
    required: true
  },
  
  // Profile ID validation
  profileId: {
    pattern: /^[a-zA-Z0-9_-]{10,50}$/,
    required: true
  },
  
  // User ID validation
  userId: {
    pattern: /^[a-zA-Z0-9_@.-]{3,100}$/,
    required: false
  },
  
  // Model validation
  model: {
    allowedValues: [
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash',
      'gemini-2.5-pro'
    ],
    default: 'gemini-2.5-flash'
  },
  
  // Email validation
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254
  },
  
  // URL validation
  url: {
    pattern: /^https?:\/\/.+/,
    maxLength: 2048
  }
};

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Sanitize text input - remove potentially dangerous content
 */
function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  
  return text
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize unicode
    .normalize('NFC')
    // Trim whitespace
    .trim();
}

/**
 * Sanitize HTML - escape HTML entities
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, char => htmlEntities[char]);
}

/**
 * Sanitize object - recursively sanitize all string values
 */
function sanitizeObject(obj, depth = 0) {
  if (depth > 10) return obj; // Prevent infinite recursion
  
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key as well
      const safeKey = sanitizeText(key).substring(0, 100);
      sanitized[safeKey] = sanitizeObject(value, depth + 1);
    }
    return sanitized;
  }
  
  return obj;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate text field
 */
function validateText(text, options = {}) {
  const { minLength = 1, maxLength = 50000, fieldName = 'text' } = options;
  const errors = [];
  
  if (text === undefined || text === null) {
    if (options.required !== false) {
      errors.push(`${fieldName} is required`);
    }
    return { valid: errors.length === 0, errors, value: '' };
  }
  
  if (typeof text !== 'string') {
    errors.push(`${fieldName} must be a string`);
    return { valid: false, errors, value: '' };
  }
  
  const sanitized = sanitizeText(text);
  
  if (sanitized.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters`);
  }
  
  if (sanitized.length > maxLength) {
    errors.push(`${fieldName} must not exceed ${maxLength} characters`);
  }
  
  return { valid: errors.length === 0, errors, value: sanitized };
}

/**
 * Validate profile ID
 */
function validateProfileId(profileId) {
  const errors = [];
  
  if (!profileId) {
    errors.push('profile_id is required');
    return { valid: false, errors, value: null };
  }
  
  if (typeof profileId !== 'string') {
    errors.push('profile_id must be a string');
    return { valid: false, errors, value: null };
  }
  
  const sanitized = sanitizeText(profileId);
  
  if (!SCHEMAS.profileId.pattern.test(sanitized)) {
    errors.push('profile_id format is invalid');
  }
  
  return { valid: errors.length === 0, errors, value: sanitized };
}

/**
 * Validate model name
 */
function validateModel(model) {
  if (!model) {
    return { valid: true, errors: [], value: SCHEMAS.model.default };
  }
  
  const sanitized = sanitizeText(model);
  
  if (!SCHEMAS.model.allowedValues.includes(sanitized)) {
    return { 
      valid: true, 
      errors: [], 
      value: SCHEMAS.model.default,
      warning: `Invalid model "${sanitized}", using default`
    };
  }
  
  return { valid: true, errors: [], value: sanitized };
}

/**
 * Validate email
 */
function validateEmail(email) {
  const errors = [];
  
  if (!email) {
    return { valid: true, errors: [], value: null };
  }
  
  const sanitized = sanitizeText(email).toLowerCase();
  
  if (!SCHEMAS.email.pattern.test(sanitized)) {
    errors.push('Invalid email format');
  }
  
  if (sanitized.length > SCHEMAS.email.maxLength) {
    errors.push('Email is too long');
  }
  
  return { valid: errors.length === 0, errors, value: sanitized };
}

/**
 * Validate array of texts (for batch operations)
 */
function validateTextArray(texts, options = {}) {
  const { maxItems = 50, minLength = 1, maxLength = 20000 } = options;
  const errors = [];
  
  if (!Array.isArray(texts)) {
    errors.push('Expected an array of texts');
    return { valid: false, errors, value: [] };
  }
  
  if (texts.length === 0) {
    errors.push('Array cannot be empty');
    return { valid: false, errors, value: [] };
  }
  
  if (texts.length > maxItems) {
    errors.push(`Array cannot exceed ${maxItems} items`);
    return { valid: false, errors, value: [] };
  }
  
  const validatedTexts = [];
  texts.forEach((text, index) => {
    const result = validateText(text, { minLength, maxLength, fieldName: `texts[${index}]` });
    if (!result.valid) {
      errors.push(...result.errors);
    } else {
      validatedTexts.push(result.value);
    }
  });
  
  return { valid: errors.length === 0, errors, value: validatedTexts };
}

// ============================================================================
// MIDDLEWARE FACTORIES
// ============================================================================

/**
 * Create validation middleware for specific fields
 */
function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    const sanitizedBody = {};
    
    // Sanitize entire body first
    req.body = sanitizeObject(req.body);
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      
      // Check required
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      
      // Skip validation if not required and not provided
      if (value === undefined || value === null) {
        if (rules.default !== undefined) {
          sanitizedBody[field] = rules.default;
        }
        continue;
      }
      
      // Type validation
      if (rules.type === 'string') {
        const result = validateText(value, { 
          minLength: rules.minLength, 
          maxLength: rules.maxLength,
          fieldName: field,
          required: rules.required
        });
        if (!result.valid) {
          errors.push(...result.errors);
        } else {
          sanitizedBody[field] = result.value;
        }
      } else if (rules.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push(`${field} must be a number`);
        } else if (rules.min !== undefined && num < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        } else if (rules.max !== undefined && num > rules.max) {
          errors.push(`${field} must not exceed ${rules.max}`);
        } else {
          sanitizedBody[field] = num;
        }
      } else if (rules.type === 'boolean') {
        sanitizedBody[field] = Boolean(value);
      } else if (rules.type === 'array') {
        if (!Array.isArray(value)) {
          errors.push(`${field} must be an array`);
        } else if (rules.maxItems && value.length > rules.maxItems) {
          errors.push(`${field} cannot exceed ${rules.maxItems} items`);
        } else {
          sanitizedBody[field] = value.map(item => 
            typeof item === 'string' ? sanitizeText(item) : item
          );
        }
      } else if (rules.type === 'enum') {
        if (!rules.values.includes(value)) {
          if (rules.default !== undefined) {
            sanitizedBody[field] = rules.default;
          } else {
            errors.push(`${field} must be one of: ${rules.values.join(', ')}`);
          }
        } else {
          sanitizedBody[field] = value;
        }
      } else {
        // Default: just sanitize
        sanitizedBody[field] = typeof value === 'string' ? sanitizeText(value) : value;
      }
      
      // Pattern validation
      if (rules.pattern && sanitizedBody[field]) {
        if (!rules.pattern.test(sanitizedBody[field])) {
          errors.push(`${field} format is invalid`);
        }
      }
    }
    
    if (errors.length > 0) {
      logger.warn('Validation failed', { 
        errors, 
        path: req.path,
        bodyKeys: Object.keys(req.body || {}),
        textLength: req.body?.text?.length,
        textPreview: req.body?.text?.substring(0, 100)
      });
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }
    
    // Merge sanitized values back to body
    req.body = { ...req.body, ...sanitizedBody };
    req.validated = sanitizedBody;
    
    next();
  };
}

// ============================================================================
// PRE-BUILT VALIDATORS
// ============================================================================

const validators = {
  // Analysis endpoints
  analyzeText: validate({
    profile_id: { required: true, type: 'string', minLength: 10, maxLength: 50 },
    text: { required: true, type: 'string', minLength: 10, maxLength: 50000 },
    use_cache: { type: 'boolean', default: true }
  }),
  
  // AI Detection
  detectAI: validate({
    text: { required: true, type: 'string', minLength: 50, maxLength: 50000 },
    enhanced: { type: 'boolean', default: true }
  }),
  
  // Rewrite
  rewriteText: validate({
    profile_id: { required: true, type: 'string', minLength: 10, maxLength: 50 },
    text: { required: true, type: 'string', minLength: 10, maxLength: 20000 },
    model: { 
      type: 'enum', 
      values: SCHEMAS.model.allowedValues, 
      default: SCHEMAS.model.default 
    },
    check_ai_after: { type: 'boolean', default: true }
  }),
  
  // Chat
  chatMessage: validate({
    messages: { required: true, type: 'array', maxItems: 100 },
    model: { 
      type: 'enum', 
      values: SCHEMAS.model.allowedValues, 
      default: SCHEMAS.model.default 
    },
    profile_id: { type: 'string', minLength: 10, maxLength: 50 }
  }),
  
  // Profile creation
  createProfile: validate({
    name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', maxLength: 500 }
  }),
  
  // Add sample
  addSample: validate({
    profile_id: { required: true, type: 'string', minLength: 10, maxLength: 50 },
    text: { required: true, type: 'string', minLength: 20, maxLength: 50000 },
    type: { type: 'enum', values: ['short', 'long'], default: 'short' }
  }),
  
  // Suggestions
  getSuggestions: validate({
    profile_id: { required: true, type: 'string', minLength: 10, maxLength: 50 },
    sentence: { required: true, type: 'string', minLength: 3, maxLength: 2000 },
    sentence_score: { type: 'number', min: 0, max: 1 }
  }),
  
  // Translation
  translate: validate({
    text: { required: true, type: 'string', minLength: 1, maxLength: 10000 },
    source_lang: { type: 'string', maxLength: 10 },
    target_lang: { required: true, type: 'string', maxLength: 10 }
  }),
  
  // Humanization
  iterativeHumanize: validate({
    profile_id: { required: true, type: 'string', minLength: 10, maxLength: 50 },
    text: { required: true, type: 'string', minLength: 50, maxLength: 20000 },
    max_iterations: { type: 'number', min: 1, max: 5, default: 3 },
    target_probability: { type: 'number', min: 10, max: 50, default: 35 }
  }),
  
  // Rewrite Stream (profile_id optional for generic humanization)
  rewriteTextStream: validate({
    profile_id: { type: 'string', minLength: 10, maxLength: 50 }, // Optional
    text: { required: true, type: 'string', minLength: 10, maxLength: 20000 },
    model: { 
      type: 'enum', 
      values: SCHEMAS.model.allowedValues, 
      default: SCHEMAS.model.default 
    }
  })
};

module.exports = {
  validate,
  validators,
  sanitizeText,
  sanitizeObject,
  escapeHtml,
  validateText,
  validateProfileId,
  validateModel,
  validateEmail,
  validateTextArray
};
