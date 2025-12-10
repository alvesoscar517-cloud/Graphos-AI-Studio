/**
 * User-Friendly Error Handler Utility
 * Converts technical errors to user-friendly messages
 * 
 * CRITICAL: Never expose stack traces, error codes, or technical details to users
 */

const localizationService = require('../services/localization.service');

// ============================================================================
// ERROR MAPPINGS - Map technical errors to friendly keys
// ============================================================================

const ERROR_MAPPINGS = {
  // Timeout errors
  'ETIMEDOUT': 'timeout',
  'ESOCKETTIMEDOUT': 'timeout',
  'TIMEOUT': 'timeout',
  'ECONNABORTED': 'timeout',
  'DEADLINE_EXCEEDED': 'timeout',
  
  // Database errors
  'FIRESTORE_ERROR': 'temporary_issue',
  'DATABASE_ERROR': 'temporary_issue',
  'INTERNAL': 'temporary_issue',
  'DATA_LOSS': 'temporary_issue',
  'ABORTED': 'temporary_issue',
  
  // Network errors
  'ECONNREFUSED': 'connection',
  'ENOTFOUND': 'connection',
  'NETWORK_ERROR': 'connection',
  'ECONNRESET': 'connection',
  'EPIPE': 'connection',
  'UNAVAILABLE': 'connection',
  
  // Auth errors
  'UNAUTHENTICATED': 'auth_required',
  'UNAUTHORIZED': 'auth_required',
  'TOKEN_EXPIRED': 'session_expired',
  'INVALID_TOKEN': 'session_expired',
  'PERMISSION_DENIED': 'forbidden',
  
  // Rate limiting
  'RATE_LIMITED': 'too_many_requests',
  'RESOURCE_EXHAUSTED': 'too_many_requests',
  'TOO_MANY_REQUESTS': 'too_many_requests',
  
  // Quota errors
  'QUOTA_EXCEEDED': 'service_busy',
  'QUOTA_LIMIT': 'service_busy',
  
  // Credit errors
  'INSUFFICIENT_CREDITS': 'insufficient_credits',
  'NO_CREDITS': 'insufficient_credits',
  
  // Validation errors
  'INVALID_ARGUMENT': 'invalid_input',
  'VALIDATION_ERROR': 'invalid_input',
  'BAD_REQUEST': 'invalid_input',
  
  // File errors
  'FILE_TOO_LARGE': 'file_too_large',
  'INVALID_FILE_TYPE': 'invalid_file_type',
  
  // Not found
  'NOT_FOUND': 'not_found',
  'RESOURCE_NOT_FOUND': 'not_found'
};

// ============================================================================
// FRIENDLY ERROR CONFIGURATION
// ============================================================================

const FRIENDLY_ERROR_CONFIG = {
  timeout: {
    key: 'errors.friendly.timeout',
    retryable: true,
    retryAfter: 5,
    action: 'actions.try_again'
  },
  temporary_issue: {
    key: 'errors.friendly.temporary_issue',
    retryable: true,
    retryAfter: 10,
    action: 'actions.try_again_later'
  },
  connection: {
    key: 'errors.friendly.connection',
    retryable: true,
    retryAfter: 5,
    action: 'actions.check_connection'
  },
  auth_required: {
    key: 'errors.friendly.auth_required',
    retryable: false,
    action: 'actions.sign_in'
  },
  session_expired: {
    key: 'errors.friendly.session_expired',
    retryable: false,
    action: 'actions.sign_in_again'
  },
  forbidden: {
    key: 'errors.friendly.forbidden',
    retryable: false,
    action: 'actions.contact_support'
  },
  too_many_requests: {
    key: 'errors.friendly.too_many_requests',
    retryable: true,
    retryAfter: 30,
    action: 'actions.wait_and_retry'
  },
  service_busy: {
    key: 'errors.friendly.service_busy',
    retryable: true,
    retryAfter: 60,
    action: 'actions.wait_and_retry'
  },
  insufficient_credits: {
    key: 'errors.friendly.insufficient_credits',
    retryable: false,
    action: 'actions.purchase_credits'
  },
  invalid_input: {
    key: 'errors.friendly.invalid_input',
    retryable: false,
    action: 'actions.check_input'
  },
  file_too_large: {
    key: 'errors.friendly.file_too_large',
    retryable: false,
    action: 'actions.reduce_file_size'
  },
  invalid_file_type: {
    key: 'errors.friendly.invalid_file_type',
    retryable: false,
    action: 'actions.check_file_type'
  },
  not_found: {
    key: 'errors.friendly.not_found',
    retryable: false,
    action: 'actions.go_back'
  },
  generic: {
    key: 'errors.friendly.generic',
    retryable: true,
    retryAfter: 5,
    action: 'actions.try_again'
  }
};

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Extract error code from various error formats
 * @param {Error|Object|string} error - The error object
 * @returns {string} - Normalized error code
 */
function extractErrorCode(error) {
  if (!error) return 'UNKNOWN';
  
  // String error
  if (typeof error === 'string') {
    return error.toUpperCase().replace(/[^A-Z_]/g, '_');
  }
  
  // Check common error code locations
  const code = error.code 
    || error.errorCode 
    || error.status 
    || error.statusCode
    || error.name
    || (error.response && error.response.status)
    || (error.cause && error.cause.code);
  
  if (code) {
    return String(code).toUpperCase().replace(/[^A-Z0-9_]/g, '_');
  }
  
  // Check error message for known patterns
  const message = (error.message || '').toLowerCase();
  
  if (message.includes('timeout') || message.includes('timed out')) return 'TIMEOUT';
  if (message.includes('network') || message.includes('connection')) return 'NETWORK_ERROR';
  if (message.includes('unauthorized') || message.includes('unauthenticated')) return 'UNAUTHENTICATED';
  if (message.includes('forbidden') || message.includes('permission')) return 'PERMISSION_DENIED';
  if (message.includes('not found')) return 'NOT_FOUND';
  if (message.includes('rate limit') || message.includes('too many')) return 'RATE_LIMITED';
  if (message.includes('quota')) return 'QUOTA_EXCEEDED';
  if (message.includes('credit')) return 'INSUFFICIENT_CREDITS';
  if (message.includes('invalid') || message.includes('validation')) return 'VALIDATION_ERROR';
  
  return 'UNKNOWN';
}

/**
 * Get friendly error type from error code
 * @param {string} errorCode - The error code
 * @returns {string} - Friendly error type
 */
function getFriendlyErrorType(errorCode) {
  return ERROR_MAPPINGS[errorCode] || 'generic';
}

/**
 * Create a user-friendly error response
 * @param {Error|Object|string} error - The original error
 * @param {string} lang - User's language code
 * @param {Object} context - Additional context (e.g., { required: 100, available: 50 })
 * @returns {Object} - User-friendly error object
 */
function createUserFriendlyError(error, lang = 'en', context = {}) {
  const errorCode = extractErrorCode(error);
  const friendlyType = getFriendlyErrorType(errorCode);
  const config = FRIENDLY_ERROR_CONFIG[friendlyType] || FRIENDLY_ERROR_CONFIG.generic;
  
  // Build params for translation
  const params = {
    ...context,
    seconds: config.retryAfter || 30
  };
  
  // Get translated message
  let message = localizationService.translate(config.key, lang, params);
  
  // Fallback if translation key not found
  if (message === config.key) {
    message = localizationService.translate('errors.friendly.generic', lang);
  }
  
  // Get translated action
  let action = localizationService.translate(config.action, lang);
  if (action === config.action) {
    action = localizationService.translate('actions.try_again', lang);
  }
  
  // Log the original error for debugging (server-side only)
  console.error(`[ERROR] Original: ${errorCode}`, error?.message || error);
  
  return {
    success: false,
    error: {
      message,
      action,
      retryable: config.retryable,
      ...(config.retryable && config.retryAfter ? { retryAfter: config.retryAfter } : {})
    }
  };
}

/**
 * Sanitize an error message - remove any technical details
 * @param {string} message - The error message
 * @param {string} lang - User's language code
 * @returns {string} - Sanitized message
 */
function sanitizeErrorMessage(message, lang = 'en') {
  if (!message || typeof message !== 'string') {
    return localizationService.translate('errors.friendly.generic', lang);
  }
  
  // Patterns that indicate technical content
  const technicalPatterns = [
    /at\s+\w+\s*\(/i,           // Stack trace: "at Function ("
    /\w+Error:/i,               // Error types: "TypeError:"
    /\d{3}\s+\w+/,              // HTTP codes: "500 Internal"
    /ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i,  // System errors
    /firestore|firebase|google/i,          // Service names
    /api|endpoint|request|response/i,      // API terms
    /database|query|collection/i,          // DB terms
    /null|undefined|NaN/i,                 // Programming terms
    /\{.*\}/,                              // JSON objects
    /\[.*\]/,                              // Arrays
    /stack|trace|line\s+\d+/i,            // Debug info
    /internal|server|backend/i,            // Internal terms
    /token|jwt|auth0|oauth/i,             // Auth terms
    /sql|mongo|redis|cache/i              // DB technologies
  ];
  
  // Check if message contains technical content
  for (const pattern of technicalPatterns) {
    if (pattern.test(message)) {
      return localizationService.translate('errors.friendly.generic', lang);
    }
  }
  
  // If message is too long, it's probably technical
  if (message.length > 200) {
    return localizationService.translate('errors.friendly.generic', lang);
  }
  
  return message;
}

/**
 * Wrap a controller function with user-friendly error handling
 * @param {Function} fn - The controller function
 * @returns {Function} - Wrapped function
 */
function withFriendlyErrors(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      const lang = req.user?.language || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';
      const friendlyError = createUserFriendlyError(error, lang);
      
      // Determine HTTP status code
      const statusCode = getHttpStatusCode(error);
      
      res.status(statusCode).json(friendlyError);
    }
  };
}

/**
 * Get appropriate HTTP status code for error
 * @param {Error|Object} error - The error
 * @returns {number} - HTTP status code
 */
function getHttpStatusCode(error) {
  const code = extractErrorCode(error);
  
  const statusMap = {
    'UNAUTHENTICATED': 401,
    'UNAUTHORIZED': 401,
    'TOKEN_EXPIRED': 401,
    'INVALID_TOKEN': 401,
    'PERMISSION_DENIED': 403,
    'FORBIDDEN': 403,
    'NOT_FOUND': 404,
    'RESOURCE_NOT_FOUND': 404,
    'VALIDATION_ERROR': 400,
    'INVALID_ARGUMENT': 400,
    'BAD_REQUEST': 400,
    'RATE_LIMITED': 429,
    'TOO_MANY_REQUESTS': 429,
    'RESOURCE_EXHAUSTED': 429,
    'TIMEOUT': 504,
    'ETIMEDOUT': 504,
    'UNAVAILABLE': 503,
    'QUOTA_EXCEEDED': 503
  };
  
  return statusMap[code] || 500;
}

module.exports = {
  createUserFriendlyError,
  sanitizeErrorMessage,
  withFriendlyErrors,
  extractErrorCode,
  getFriendlyErrorType,
  getHttpStatusCode,
  ERROR_MAPPINGS,
  FRIENDLY_ERROR_CONFIG
};
