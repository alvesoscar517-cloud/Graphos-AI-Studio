/**
 * Input Sanitization Utilities
 * Now powered by sanitize-html library for battle-tested XSS prevention
 * 
 * @module utils/sanitize
 */

const sanitizeHtml = require('sanitize-html');

// ============================================================================
// SANITIZE-HTML CONFIGURATIONS
// ============================================================================

/**
 * Strict config - strips all HTML
 */
const strictConfig = {
  allowedTags: [],
  allowedAttributes: {},
  textFilter: (text) => text
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
};

/**
 * Basic config - allows basic formatting
 */
const basicConfig = {
  allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
  allowedAttributes: {},
  textFilter: (text) => text
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
};

/**
 * Rich config - allows more formatting for content display
 */
const richConfig = {
  allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'],
  allowedAttributes: {
    'a': ['href', 'title', 'target'],
    'code': ['class'],
    'pre': ['class']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  textFilter: (text) => text
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
};

// ============================================================================
// CORE SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Sanitize text by stripping all HTML
 * @param {string} text - Text to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized text
 */
function sanitizeText(text, maxLength = 20000) {
  if (typeof text !== 'string') return '';
  
  let sanitized = sanitizeHtml(text, strictConfig);
  
  // Normalize whitespace
  sanitized = sanitized
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
  
  // Truncate if needed
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitize HTML with basic formatting allowed
 * @param {string} html - HTML to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized HTML
 */
function sanitizeBasicHtml(html, maxLength = 50000) {
  if (typeof html !== 'string') return '';
  
  let sanitized = sanitizeHtml(html, basicConfig);
  
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitize HTML with rich formatting allowed
 * @param {string} html - HTML to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized HTML
 */
function sanitizeRichHtml(html, maxLength = 100000) {
  if (typeof html !== 'string') return '';
  
  let sanitized = sanitizeHtml(html, richConfig);
  
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  
  return sanitized;
}

// ============================================================================
// LEGACY COMPATIBILITY FUNCTIONS
// ============================================================================

/**
 * HTML entities for escaping
 */
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"'`=/]/g, char => HTML_ENTITIES[char]);
}

/**
 * Remove HTML tags from string
 * @param {string} str - String to strip
 * @returns {string} String without HTML tags
 */
function stripHtml(str) {
  if (typeof str !== 'string') return str;
  return sanitizeHtml(str, strictConfig);
}

/**
 * Sanitize string for safe storage and display
 * @param {string} str - String to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized string
 */
function sanitizeString(str, options = {}) {
  if (typeof str !== 'string') return str;
  
  const {
    stripTags = true,
    normalizeWhitespace = true,
    trim = true,
    maxLength = null,
    escapeOutput = false,
  } = options;
  
  let result = str;
  
  if (stripTags) {
    result = sanitizeHtml(result, strictConfig);
  }
  
  if (normalizeWhitespace) {
    result = result
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ');
  }
  
  if (trim) {
    result = result.trim();
  }
  
  if (maxLength && result.length > maxLength) {
    result = result.substring(0, maxLength);
  }
  
  if (escapeOutput) {
    result = escapeHtml(result);
  }
  
  return result;
}

/**
 * Sanitize text input for AI analysis
 * @param {string} text - Text to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized text
 */
function sanitizeTextForAnalysis(text, maxLength = 20000) {
  if (typeof text !== 'string') {
    throw new Error('Text must be a string');
  }
  
  return sanitizeText(text, maxLength);
}

/**
 * Sanitize object recursively
 * @param {Object} obj - Object to sanitize
 * @param {Object} options - Sanitization options
 * @returns {Object} Sanitized object
 */
function sanitizeObject(obj, options = {}) {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj, options);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const safeKey = sanitizeString(key, { stripTags: true, maxLength: 100 });
      if (safeKey === '__proto__' || safeKey === 'constructor' || safeKey === 'prototype') {
        continue;
      }
      sanitized[safeKey] = sanitizeObject(value, options);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Validate and sanitize email
 * @param {string} email - Email to validate
 * @returns {string|null} Sanitized email or null if invalid
 */
function sanitizeEmail(email) {
  if (typeof email !== 'string') return null;
  
  const sanitized = email.toLowerCase().trim();
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return null;
  }
  
  if (sanitized.length > 254) return null;
  if (sanitized.includes('..')) return null;
  
  return sanitized;
}

/**
 * Sanitize profile ID
 * @param {string} profileId - Profile ID to sanitize
 * @returns {string} Sanitized profile ID
 */
function sanitizeProfileId(profileId) {
  if (typeof profileId !== 'string') {
    throw new Error('Profile ID must be a string');
  }
  
  const sanitized = profileId.replace(/[^a-zA-Z0-9_-]/g, '');
  
  if (sanitized.length === 0) {
    throw new Error('Invalid profile ID');
  }
  
  if (sanitized.length > 100) {
    throw new Error('Profile ID too long');
  }
  
  return sanitized;
}

/**
 * Sanitize file name
 * @param {string} filename - File name to sanitize
 * @returns {string} Sanitized file name
 */
function sanitizeFileName(filename) {
  if (typeof filename !== 'string') return '';
  
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 255);
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Express middleware for input sanitization
 * @param {Object} options - Middleware options
 * @returns {Function} Express middleware
 */
function sanitizeMiddleware(options = {}) {
  const {
    sanitizeBody = true,
    sanitizeQuery = true,
    sanitizeParams = true,
    textFields = ['text', 'content', 'message', 'sentence'],
    maxTextLength = 20000,
  } = options;
  
  return (req, res, next) => {
    try {
      // Debug: log body before sanitization for auth routes
      if (req.path.includes('/auth/')) {
        console.log('[SANITIZE] Auth route body before:', JSON.stringify(req.body));
      }
      
      if (sanitizeBody && req.body) {
        for (const field of textFields) {
          if (req.body[field] && typeof req.body[field] === 'string') {
            try {
              req.body[field] = sanitizeText(req.body[field], maxTextLength);
            } catch (fieldError) {
              console.error(`[SANITIZE] Error sanitizing field "${field}":`, fieldError.message);
              throw fieldError;
            }
          }
        }
        try {
          req.body = sanitizeObject(req.body, { stripTags: true });
        } catch (objError) {
          console.error('[SANITIZE] Error sanitizing object:', objError.message);
          throw objError;
        }
      }
      
      // Debug: log body after sanitization for auth routes
      if (req.path.includes('/auth/')) {
        console.log('[SANITIZE] Auth route body after:', JSON.stringify(req.body));
      }
      
      if (sanitizeQuery && req.query) {
        req.query = sanitizeObject(req.query, { stripTags: true, maxLength: 1000 });
      }
      
      if (sanitizeParams && req.params) {
        req.params = sanitizeObject(req.params, { stripTags: true, maxLength: 200 });
      }
      
      next();
    } catch (error) {
      console.error('[SANITIZE] Error:', error.message);
      console.error('[SANITIZE] Stack:', error.stack);
      console.error('[SANITIZE] Path:', req.path);
      console.error('[SANITIZE] Body keys:', Object.keys(req.body || {}));
      console.error('[SANITIZE] Text length:', req.body?.text?.length);
      res.status(400).json({
        success: false,
        error: 'Invalid input',
        code: 'INVALID_INPUT',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  };
}

/**
 * Create sanitization middleware for specific fields
 * @param {string[]} fields - Fields to sanitize
 * @returns {Function} Express middleware
 */
function sanitizeFields(fields = ['text', 'content']) {
  return (req, res, next) => {
    for (const field of fields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = sanitizeText(req.body[field]);
      }
    }
    next();
  };
}

module.exports = {
  // New sanitize-html based functions
  sanitizeText,
  sanitizeBasicHtml,
  sanitizeRichHtml,
  sanitizeFileName,
  sanitizeFields,
  
  // Legacy compatibility
  escapeHtml,
  stripHtml,
  sanitizeString,
  sanitizeTextForAnalysis,
  sanitizeObject,
  sanitizeEmail,
  sanitizeProfileId,
  sanitizeMiddleware,
  
  // Configs for advanced usage
  strictConfig,
  basicConfig,
  richConfig
};
