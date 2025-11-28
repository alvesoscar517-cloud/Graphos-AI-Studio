/**
 * Enhanced Error Handling Middleware
 * Provides structured error responses and logging
 */

const config = require('../config');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const localization = require('../services/localization.service');
const { getLanguage } = require('./language.middleware');

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
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
 * Global error handler
 */
function errorHandler(err, req, res, next) {
  // Generate error ID for tracking
  const errorId = uuidv4().substring(0, 8);
  
  // Get language for localized error messages
  const lang = getLanguage(req);
  
  // Default error values
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || null;
  
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
    'INSUFFICIENT_CREDITS': 'insufficient_credits',
    'QUOTA_EXCEEDED': 'quota_exceeded',
    'SERVICE_ERROR': 'service_unavailable',
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
  
  // Log error
  const logData = {
    errorId,
    statusCode,
    code,
    message: err.message,
    path: req.path,
    method: req.method,
    userId: req.userId,
    ip: req.ip
  };
  
  if (statusCode >= 500) {
    // Log full stack for server errors
    logger.error('Server error', { ...logData, stack: err.stack });
  } else if (statusCode >= 400) {
    // Log warning for client errors
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
  
  // Add details if available and not in production
  if (details) {
    response.error.details = details;
  }
  
  // Add stack trace in development
  if (config.IS_DEVELOPMENT && err.stack) {
    response.error.stack = err.stack.split('\n').slice(0, 5);
  }
  
  res.status(statusCode).json(response);
}

/**
 * Sanitize error message for production
 * Remove sensitive information
 */
function sanitizeErrorMessage(message) {
  // Remove file paths
  message = message.replace(/\/[^\s]+\.(js|ts|json)/g, '[file]');
  
  // Remove IP addresses
  message = message.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[ip]');
  
  // Remove potential secrets
  message = message.replace(/key[=:]\s*['"]?[a-zA-Z0-9_-]+['"]?/gi, 'key=[redacted]');
  
  // Truncate long messages
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
 * Wraps async route handlers to catch errors
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

module.exports = {
  // Middleware
  errorHandler,
  notFoundHandler,
  asyncHandler,
  requestTimeout,
  
  // Error classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  InsufficientCreditsError,
  ExternalServiceError
};
