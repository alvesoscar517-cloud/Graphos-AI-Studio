/**
 * Enhanced Error Handling Middleware
 * Re-exports from new http-errors based module with backward compatibility
 * 
 * @module middleware/errorHandler.middleware
 */

const config = require('../config');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const localization = require('../services/localization.service');
const { getLanguage } = require('./language.middleware');

// Import new http-errors based module
const httpErrors = require('./errorHandler');

// ============================================================================
// CUSTOM ERROR CLASSES (Legacy - for backward compatibility)
// ============================================================================

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED', { retryAfter });
  }
}


class InsufficientCreditsError extends AppError {
  constructor(required, available) {
    super('Insufficient credits', 402, 'INSUFFICIENT_CREDITS', { required, available });
  }
}

class ExternalServiceError extends AppError {
  constructor(service, originalError) {
    super(`${service} service error`, 503, 'SERVICE_ERROR', { service });
    this.originalError = originalError;
  }
}

// ============================================================================
// ERROR MAPPING
// ============================================================================

const ERROR_MAPPINGS = {
  'QUOTA_EXCEEDED': {
    statusCode: 429,
    code: 'QUOTA_EXCEEDED',
    message: 'API quota exceeded. Please try again later.'
  },
  'EMBEDDING_FAILED': {
    statusCode: 503,
    code: 'AI_SERVICE_ERROR',
    message: 'AI service temporarily unavailable.'
  },
  'INVALID_INPUT': {
    statusCode: 400,
    code: 'VALIDATION_ERROR',
    message: 'Invalid input provided.'
  },
  'PROFILE_NOT_FOUND': {
    statusCode: 404,
    code: 'NOT_FOUND',
    message: 'Profile not found.'
  },
  'INSUFFICIENT_CREDITS': {
    statusCode: 402,
    code: 'INSUFFICIENT_CREDITS',
    message: 'Insufficient credits to perform this operation.'
  }
};

/**
 * Map known error patterns to structured responses
 */
function mapError(error) {
  const errorMessage = error.message || '';
  
  for (const [pattern, mapping] of Object.entries(ERROR_MAPPINGS)) {
    if (errorMessage.includes(pattern)) {
      return {
        statusCode: mapping.statusCode,
        code: mapping.code,
        message: mapping.message
      };
    }
  }
  
  return null;
}

// ============================================================================
// ERROR HANDLER MIDDLEWARE
// ============================================================================

/**
 * Global error handler - Enhanced with http-errors support
 */
function errorHandler(err, req, res, next) {
  // Generate error ID for tracking
  const errorId = uuidv4().substring(0, 8);
  
  // Get language for localized error messages
  const lang = getLanguage(req);
  
  // Use new parseError for http-errors compatibility
  const parsed = httpErrors.parseError(err);
  
  // Default error values
  let statusCode = err.statusCode || err.status || parsed.status || 500;
  let code = err.code || parsed.code || 'INTERNAL_ERROR';
  let message = err.message || parsed.message || 'An unexpected error occurred';
  const details = err.details || null;
  
  // Check for mapped errors
  const mapped = mapError(err);
  if (mapped) {
    statusCode = mapped.statusCode;
    code = mapped.code;
    message = mapped.message;
  }
  
  // Try to get localized message
  const errorKeyMap = {
    'VALIDATION_ERROR': 'invalid_input',
    'AUTH_ERROR': 'unauthorized',
    'FORBIDDEN': 'forbidden',
    'NOT_FOUND': 'not_found',
    'RATE_LIMIT_EXCEEDED': 'rate_limited',
    'RATE_LIMITED': 'rate_limited',
    'INSUFFICIENT_CREDITS': 'insufficient_credits',
    'QUOTA_EXCEEDED': 'quota_exceeded',
    'SERVICE_ERROR': 'service_unavailable',
    'SERVICE_UNAVAILABLE': 'service_unavailable',
    'REQUEST_TIMEOUT': 'timeout',
    'INTERNAL_ERROR': 'server_error'
  };
  
  const errorKey = errorKeyMap[code];
  if (errorKey) {
    const localizedMessage = localization.translate(`errors.${errorKey}`, lang);
    if (localizedMessage && !localizedMessage.startsWith('errors.')) {
      message = localizedMessage;
    }
  }
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }
  
  // Categorize error for monitoring
  const category = httpErrors.categorizeError(err);
  const shouldReport = httpErrors.shouldReportError(err);
  
  // Log error
  const logData = {
    errorId,
    statusCode,
    code,
    category,
    message: err.message,
    path: req.path,
    method: req.method,
    userId: req.userId,
    ip: req.ip,
    correlationId: req.correlationId
  };
  
  if (statusCode >= 500 || shouldReport) {
    logger.error('Server error', { ...logData, stack: err.stack });
  } else if (statusCode >= 400) {
    logger.warn('Client error', logData);
  }
  
  // Build response
  const response = {
    success: false,
    error: {
      code,
      message: config.IS_PRODUCTION ? sanitizeErrorMessage(message) : message,
      errorId
    },
    language: lang
  };
  
  // Add details if available
  if (details) {
    response.error.details = details;
  }
  
  // Add retry-after for rate limits
  if (err.retryAfter) {
    response.error.retryAfter = err.retryAfter;
    res.set('Retry-After', err.retryAfter);
  }
  
  // Add stack trace in development
  if (config.IS_DEVELOPMENT && err.stack) {
    response.error.stack = err.stack.split('\n').slice(0, 5);
  }
  
  res.status(statusCode).json(response);
}

/**
 * Sanitize error message for production
 */
function sanitizeErrorMessage(message) {
  message = message.replace(/\/[^\s]+\.(js|ts|json)/g, '[file]');
  message = message.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[ip]');
  message = message.replace(/key[=:]\s*['"]?[a-zA-Z0-9_-]+['"]?/gi, 'key=[redacted]');
  if (message.length > 200) {
    message = message.substring(0, 200) + '...';
  }
  return message;
}

/**
 * 404 handler
 */
function notFoundHandler(req, res) {
  const lang = getLanguage(req);
  const message = localization.translate('errors.not_found', lang) || `Route ${req.method} ${req.path} not found`;
  
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message,
      errorId: uuidv4().substring(0, 8)
    },
    language: lang
  });
}

/**
 * Async error wrapper
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Request timeout middleware
 */
function requestTimeout(timeout = 30000) {
  return (req, res, next) => {
    req.setTimeout(timeout, () => {
      const error = new AppError('Request timeout', 408, 'REQUEST_TIMEOUT');
      next(error);
    });
    next();
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
  requestTimeout,
  
  // Error classes (legacy)
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  InsufficientCreditsError,
  ExternalServiceError,
  
  // Re-export new http-errors factories
  validationError: httpErrors.validationError,
  authError: httpErrors.authError,
  forbiddenError: httpErrors.forbiddenError,
  notFoundError: httpErrors.notFoundError,
  rateLimitError: httpErrors.rateLimitError,
  internalError: httpErrors.internalError,
  serviceUnavailableError: httpErrors.serviceUnavailableError,
  conflictError: httpErrors.conflictError,
  badGatewayError: httpErrors.badGatewayError,
  quotaExceededError: httpErrors.quotaExceededError,
  payloadTooLargeError: httpErrors.payloadTooLargeError,
  unprocessableEntityError: httpErrors.unprocessableEntityError,
  
  // Re-export utilities
  createError: httpErrors.createError,
  categorizeError: httpErrors.categorizeError,
  shouldReportError: httpErrors.shouldReportError,
  wrapController: httpErrors.wrapController,
  
  // Constants
  ERROR_CODES: httpErrors.ERROR_CODES,
  ERROR_CATEGORIES: httpErrors.ERROR_CATEGORIES,
  ERROR_MAPPINGS
};
