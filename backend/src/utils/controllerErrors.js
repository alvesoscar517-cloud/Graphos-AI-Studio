/**
 * Controller Error Utilities
 * Standardized error handling for controllers using http-errors
 * 
 * @module utils/controllerErrors
 */

const {
  validationError,
  authError,
  forbiddenError,
  notFoundError,
  rateLimitError,
  internalError,
  serviceUnavailableError,
  conflictError,
  createError
} = require('../middleware/errorHandler');

// ============================================================================
// ERROR CODE MAPPING
// ============================================================================

/**
 * Map error codes to http-errors factory functions
 */
const ERROR_CODE_MAP = {
  // Validation errors (400)
  'MISSING_FIELDS': (msg) => validationError(msg || 'Required fields are missing'),
  'INVALID_INPUT': (msg) => validationError(msg || 'Invalid input'),
  'AUTH_INVALID_EMAIL': (msg) => validationError(msg || 'Invalid email format'),
  'AUTH_WEAK_PASSWORD': (msg) => validationError(msg || 'Password does not meet requirements'),
  'AUTH_INVALID_NAME': (msg) => validationError(msg || 'Invalid display name'),
  'AUTH_INVALID_OTP': (msg) => validationError(msg || 'Invalid verification code'),
  'AUTH_PASSWORD_REQUIRED': (msg) => validationError(msg || 'Password is required'),
  'AUTH_PASSWORD_SAME': (msg) => validationError(msg || 'New password must be different'),
  'AUTH_PASSWORD_REUSED': (msg) => validationError(msg || 'Cannot reuse recent passwords'),
  'INVALID_CONTENT': (msg) => validationError(msg || 'Invalid content'),
  'INSUFFICIENT_SAMPLES': (msg) => validationError(msg || 'Insufficient samples'),
  'SIMILAR_SAMPLES': (msg) => validationError(msg || 'Samples are too similar'),
  
  // Authentication errors (401)
  'AUTH_INVALID_CREDENTIALS': (msg) => authError(msg || 'Invalid email or password'),
  'AUTH_INVALID_TOKEN': (msg) => authError(msg || 'Invalid or expired token'),
  'UNAUTHORIZED': (msg) => authError(msg || 'Authentication required'),
  
  // Forbidden errors (403)
  'AUTH_EMAIL_NOT_VERIFIED': (msg) => forbiddenError(msg || 'Email not verified'),
  'AUTH_ACCOUNT_SUSPENDED': (msg) => forbiddenError(msg || 'Account suspended'),
  'AUTH_INVALID_OPERATION': (msg) => forbiddenError(msg || 'Operation not allowed'),
  'AUTH_UNAUTHORIZED': (msg) => forbiddenError(msg || 'Access denied'),
  'FORBIDDEN': (msg) => forbiddenError(msg || 'Access denied'),
  
  // Not found errors (404)
  'AUTH_USER_NOT_FOUND': (msg) => notFoundError('User'),
  'AUTH_NO_PENDING_REGISTRATION': (msg) => notFoundError('Registration'),
  'AUTH_SESSION_NOT_FOUND': (msg) => notFoundError('Session'),
  'AUTH_NO_GOOGLE_LINKED': (msg) => notFoundError('Google account'),
  'NOT_FOUND': (msg) => notFoundError('Resource'),
  
  // Conflict errors (409)
  'AUTH_EMAIL_EXISTS': (msg) => conflictError(msg || 'Email already registered'),
  'AUTH_GOOGLE_ALREADY_LINKED': (msg) => conflictError(msg || 'Google account already linked'),
  'DUPLICATE_PROFILE_NAME': (msg) => conflictError(msg || 'Profile name already exists'),
  
  // Gone errors (410)
  'AUTH_REGISTRATION_EXPIRED': (msg) => createError(410, msg || 'Registration expired'),
  'AUTH_ACCOUNT_DELETED': (msg) => createError(410, msg || 'Account deleted'),
  
  // Locked errors (423)
  'AUTH_ACCOUNT_LOCKED': (msg) => createError(423, msg || 'Account temporarily locked'),
  'LOCKED': (msg) => createError(423, msg || 'Resource locked'),
  
  // Rate limit errors (429)
  'RATE_LIMITED': (msg, retryAfter) => rateLimitError(retryAfter || 60),
  'RATE_LIMIT_EXCEEDED': (msg) => rateLimitError(60),
  'QUOTA_EXCEEDED': (msg) => createError(429, msg || 'Quota exceeded'),
  
  // Service unavailable errors (503)
  'AUTH_SERVICE_UNAVAILABLE': (msg) => serviceUnavailableError('Authentication'),
  'AUTH_SERVICE_ERROR': (msg) => serviceUnavailableError('Authentication'),
  'EMBEDDING_FAILED': (msg) => serviceUnavailableError('AI'),
  'DATABASE_WRITE_FAILED': (msg) => serviceUnavailableError('Database'),
  
  // Gateway timeout (504)
  'VOICE_SUMMARY_TIMEOUT': (msg) => createError(504, msg || 'Voice analysis timed out')
};

// ============================================================================
// ERROR PARSING
// ============================================================================

/**
 * Parse error message to extract code and message
 * @param {Error|string} error - Error object or message
 * @returns {{code: string, message: string}}
 */
function parseErrorMessage(error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Check for "CODE: message" format
  const colonIndex = errorMessage.indexOf(':');
  if (colonIndex > 0 && colonIndex < 50) {
    const potentialCode = errorMessage.substring(0, colonIndex).trim();
    // Verify it looks like an error code (uppercase with underscores)
    if (/^[A-Z_]+$/.test(potentialCode)) {
      return {
        code: potentialCode,
        message: errorMessage.substring(colonIndex + 1).trim() || potentialCode
      };
    }
  }
  
  return {
    code: 'INTERNAL_ERROR',
    message: errorMessage
  };
}

/**
 * Convert error to http-error
 * @param {Error|string} error - Error to convert
 * @returns {HttpError} HTTP error
 */
function toHttpError(error) {
  const { code, message } = parseErrorMessage(error);
  
  const factory = ERROR_CODE_MAP[code];
  if (factory) {
    const httpError = factory(message);
    httpError.code = code;
    return httpError;
  }
  
  // Default to internal error
  const httpError = internalError(message);
  httpError.code = code;
  return httpError;
}

/**
 * Throw http-error from error code
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @throws {HttpError}
 */
function throwError(code, message) {
  const factory = ERROR_CODE_MAP[code];
  if (factory) {
    const error = factory(message);
    error.code = code;
    throw error;
  }
  
  const error = internalError(message || code);
  error.code = code;
  throw error;
}

/**
 * Create error response object (for backward compatibility)
 * @param {Error|string} error - Error
 * @returns {{status: number, body: Object}}
 */
function createErrorResponse(error) {
  const httpError = toHttpError(error);
  
  return {
    status: httpError.status || 500,
    body: {
      success: false,
      error: httpError.message,
      code: httpError.code || 'INTERNAL_ERROR',
      ...(httpError.details && { details: httpError.details }),
      ...(httpError.retryAfter && { retryAfter: httpError.retryAfter })
    }
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  parseErrorMessage,
  toHttpError,
  throwError,
  createErrorResponse,
  ERROR_CODE_MAP
};
