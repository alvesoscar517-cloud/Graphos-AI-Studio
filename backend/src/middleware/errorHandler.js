/**
 * Error Handling Middleware - Powered by http-errors and express-async-errors
 * Standardized HTTP error creation and automatic async error catching
 * 
 * @module middleware/errorHandler
 */

// Import express-async-errors to enable automatic async error catching
require('express-async-errors');

const createError = require('http-errors');
const logger = require('../utils/logger');

// ============================================================================
// CONFIGURATION
// ============================================================================

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Error codes mapping
 */
const ERROR_CODES = {
  VALIDATION_ERROR: 400,
  INVALID_INPUT: 400,
  UNAUTHORIZED: 401,
  AUTH_ERROR: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  QUOTA_EXCEEDED: 429,
  INTERNAL_ERROR: 500,
  EMBEDDING_FAILED: 503,
  SERVICE_UNAVAILABLE: 503
};

// ============================================================================
// ERROR FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a validation error
 * @param {string} message - Error message
 * @param {Object} details - Field-level error details
 * @returns {HttpError} HTTP error
 */
function validationError(message = 'Validation failed', details = {}) {
  const error = createError(400, message);
  error.code = 'VALIDATION_ERROR';
  error.details = details;
  return error;
}

/**
 * Create an authentication error
 * @param {string} message - Error message
 * @returns {HttpError} HTTP error
 */
function authError(message = 'Authentication required') {
  const error = createError(401, message);
  error.code = 'AUTH_ERROR';
  return error;
}

/**
 * Create a forbidden error
 * @param {string} message - Error message
 * @returns {HttpError} HTTP error
 */
function forbiddenError(message = 'Access denied') {
  const error = createError(403, message);
  error.code = 'FORBIDDEN';
  return error;
}

/**
 * Create a not found error
 * @param {string} resource - Resource name
 * @returns {HttpError} HTTP error
 */
function notFoundError(resource = 'Resource') {
  const error = createError(404, `${resource} not found`);
  error.code = 'NOT_FOUND';
  return error;
}

/**
 * Create a rate limit error
 * @param {number} retryAfter - Seconds until retry allowed
 * @returns {HttpError} HTTP error
 */
function rateLimitError(retryAfter = 60) {
  const error = createError(429, 'Too many requests');
  error.code = 'RATE_LIMITED';
  error.retryAfter = retryAfter;
  return error;
}

/**
 * Create an internal server error
 * @param {string} message - Error message
 * @returns {HttpError} HTTP error
 */
function internalError(message = 'Internal server error') {
  const error = createError(500, message);
  error.code = 'INTERNAL_ERROR';
  return error;
}

/**
 * Create a service unavailable error
 * @param {string} service - Service name
 * @returns {HttpError} HTTP error
 */
function serviceUnavailableError(service = 'Service') {
  const error = createError(503, `${service} temporarily unavailable`);
  error.code = 'SERVICE_UNAVAILABLE';
  return error;
}

/**
 * Create a conflict error
 * @param {string} message - Error message
 * @returns {HttpError} HTTP error
 */
function conflictError(message = 'Resource conflict') {
  const error = createError(409, message);
  error.code = 'CONFLICT';
  return error;
}

/**
 * Create a bad gateway error
 * @param {string} service - External service name
 * @returns {HttpError} HTTP error
 */
function badGatewayError(service = 'External service') {
  const error = createError(502, `${service} returned an invalid response`);
  error.code = 'BAD_GATEWAY';
  return error;
}

/**
 * Create a quota exceeded error
 * @param {string} resource - Resource name
 * @param {number} retryAfter - Seconds until retry allowed
 * @returns {HttpError} HTTP error
 */
function quotaExceededError(resource = 'API', retryAfter = 3600) {
  const error = createError(429, `${resource} quota exceeded`);
  error.code = 'QUOTA_EXCEEDED';
  error.retryAfter = retryAfter;
  return error;
}

/**
 * Create a payload too large error
 * @param {number} maxSize - Maximum allowed size
 * @returns {HttpError} HTTP error
 */
function payloadTooLargeError(maxSize) {
  const message = maxSize 
    ? `Payload exceeds maximum size of ${maxSize} bytes`
    : 'Payload too large';
  const error = createError(413, message);
  error.code = 'PAYLOAD_TOO_LARGE';
  return error;
}

/**
 * Create an unprocessable entity error
 * @param {string} message - Error message
 * @param {Object} details - Validation details
 * @returns {HttpError} HTTP error
 */
function unprocessableEntityError(message = 'Unprocessable entity', details = {}) {
  const error = createError(422, message);
  error.code = 'UNPROCESSABLE_ENTITY';
  error.details = details;
  return error;
}

// ============================================================================
// ERROR CATEGORIZATION
// ============================================================================

/**
 * Error categories for classification
 */
const ERROR_CATEGORIES = {
  CLIENT: 'client',      // 4xx errors - client's fault
  SERVER: 'server',      // 5xx errors - server's fault
  NETWORK: 'network',    // Network/connectivity issues
  EXTERNAL: 'external',  // External service failures
  UNKNOWN: 'unknown'     // Unclassified errors
};

/**
 * Categorize an error
 * @param {Error} err - Error to categorize
 * @returns {string} Error category
 */
function categorizeError(err) {
  const status = err.status || err.statusCode || 500;
  
  // Client errors (4xx)
  if (status >= 400 && status < 500) {
    return ERROR_CATEGORIES.CLIENT;
  }
  
  // Server errors (5xx)
  if (status >= 500) {
    // Check for external service failures
    if (err.code === 'BAD_GATEWAY' || err.code === 'SERVICE_UNAVAILABLE') {
      return ERROR_CATEGORIES.EXTERNAL;
    }
    return ERROR_CATEGORIES.SERVER;
  }
  
  // Network errors
  const networkCodes = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'];
  if (networkCodes.includes(err.code)) {
    return ERROR_CATEGORIES.NETWORK;
  }
  
  return ERROR_CATEGORIES.UNKNOWN;
}

/**
 * Check if error should be reported to monitoring
 * @param {Error} err - Error to check
 * @returns {boolean} True if should report
 */
function shouldReportError(err) {
  const category = categorizeError(err);
  const status = err.status || err.statusCode || 500;
  
  // Always report server errors
  if (category === ERROR_CATEGORIES.SERVER) {
    return true;
  }
  
  // Report external service failures
  if (category === ERROR_CATEGORIES.EXTERNAL) {
    return true;
  }
  
  // Don't report common client errors
  if (status === 400 || status === 401 || status === 404 || status === 429) {
    return false;
  }
  
  return status >= 500;
}

/**
 * Get stack trace visibility based on environment
 * @param {Error} err - Error object
 * @returns {string|undefined} Stack trace or undefined
 */
function getStackTrace(err) {
  if (IS_PRODUCTION) {
    return undefined;
  }
  return err.stack;
}

// ============================================================================
// ERROR HANDLERS
// ============================================================================

/**
 * Parse error to determine status and code
 * @param {Error} err - Error object
 * @returns {{status: number, code: string, message: string}}
 */
function parseError(err) {
  // Already an HTTP error
  if (err.status && err.statusCode) {
    return {
      status: err.status || err.statusCode,
      code: err.code || 'ERROR',
      message: err.message
    };
  }
  
  // Check for known error patterns in message
  const message = err.message || '';
  
  if (message.includes('QUOTA_EXCEEDED')) {
    return { status: 429, code: 'QUOTA_EXCEEDED', message: 'API quota exceeded. Please try again later.' };
  }
  
  if (message.includes('EMBEDDING_FAILED')) {
    return { status: 503, code: 'EMBEDDING_FAILED', message: 'AI service temporarily unavailable.' };
  }
  
  if (message.includes('INVALID_INPUT')) {
    return { status: 400, code: 'INVALID_INPUT', message };
  }
  
  if (message.includes('RATE_LIMITED')) {
    return { status: 429, code: 'RATE_LIMITED', message };
  }
  
  if (message.includes('LOCKED')) {
    return { status: 429, code: 'LOCKED', message };
  }
  
  if (message.includes('UNAUTHORIZED') || message.includes('not authenticated')) {
    return { status: 401, code: 'AUTH_ERROR', message };
  }
  
  // Default to internal error
  return {
    status: err.status || 500,
    code: err.code || 'INTERNAL_ERROR',
    message: IS_PRODUCTION ? 'Internal server error' : message
  };
}

/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  const { status, code, message } = parseError(err);
  
  // Log error
  const logData = {
    status,
    code,
    path: req.path,
    method: req.method,
    userId: req.userId,
    correlationId: req.correlationId
  };
  
  if (status >= 500) {
    logger.error(message, { ...logData, stack: err.stack });
  } else if (status >= 400) {
    logger.warn(message, logData);
  }
  
  // Build response
  const response = {
    error: message,
    code
  };
  
  // Add details if available
  if (err.details) {
    response.details = err.details;
  }
  
  // Add retry-after for rate limits
  if (err.retryAfter) {
    response.retryAfter = err.retryAfter;
    res.set('Retry-After', err.retryAfter);
  }
  
  // Add stack trace in development
  if (!IS_PRODUCTION && err.stack) {
    response.stack = err.stack;
  }
  
  res.status(status).json(response);
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
  next(createError(404, `Route ${req.method} ${req.path} not found`));
}

/**
 * Async error wrapper (legacy - now handled by express-async-errors)
 * @deprecated Use express-async-errors instead
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Wrap controller to use http-errors
 * Converts thrown errors to proper HTTP responses
 * @param {Function} controller - Controller function
 * @returns {Function} Wrapped controller
 */
function wrapController(controller) {
  return async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      // If already an HTTP error, pass through
      if (error.status || error.statusCode) {
        return next(error);
      }
      
      // Convert to HTTP error
      const { toHttpError } = require('../utils/controllerErrors');
      next(toHttpError(error));
    }
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Middleware
  errorHandler,
  notFoundHandler,
  asyncHandler,
  wrapController,
  
  // Error factories
  validationError,
  authError,
  forbiddenError,
  notFoundError,
  rateLimitError,
  internalError,
  serviceUnavailableError,
  conflictError,
  badGatewayError,
  quotaExceededError,
  payloadTooLargeError,
  unprocessableEntityError,
  
  // Categorization
  categorizeError,
  shouldReportError,
  getStackTrace,
  
  // Utilities
  parseError,
  createError,
  
  // Constants
  ERROR_CODES,
  ERROR_CATEGORIES
};
