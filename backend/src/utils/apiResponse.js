/**
 * Standardized API Response Utilities
 * 
 * Provides consistent response format across all API endpoints.
 * Replaces inconsistent error handling patterns.
 */

const logger = require('./logger');

/**
 * Error codes with HTTP status mapping
 */
const ERROR_CODES = {
  // Client errors (4xx)
  INVALID_INPUT: { status: 400, message: 'Invalid input provided' },
  TEXT_TOO_SHORT: { status: 400, message: 'Text is too short' },
  TEXT_TOO_LONG: { status: 400, message: 'Text exceeds maximum length' },
  TEXT_REQUIRED: { status: 400, message: 'Text is required' },
  MISSING_REQUIRED_FIELD: { status: 400, message: 'Missing required field' },
  
  UNAUTHORIZED: { status: 401, message: 'Authentication required' },
  INVALID_TOKEN: { status: 401, message: 'Invalid or expired token' },
  SESSION_EXPIRED: { status: 401, message: 'Session has expired' },
  
  FORBIDDEN: { status: 403, message: 'Access denied' },
  ACCOUNT_LOCKED: { status: 403, message: 'Account has been locked' },
  INSUFFICIENT_CREDITS: { status: 403, message: 'Insufficient credits' },
  
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  PROFILE_NOT_FOUND: { status: 404, message: 'Voice profile not found' },
  USER_NOT_FOUND: { status: 404, message: 'User not found' },
  
  RATE_LIMITED: { status: 429, message: 'Too many requests' },
  QUOTA_EXCEEDED: { status: 429, message: 'API quota exceeded' },
  
  // Server errors (5xx)
  SERVER_ERROR: { status: 500, message: 'Internal server error' },
  ANALYSIS_FAILED: { status: 500, message: 'Analysis failed' },
  AI_MODEL_ERROR: { status: 500, message: 'AI model error' },
  DATABASE_ERROR: { status: 500, message: 'Database error' },
  
  SERVICE_UNAVAILABLE: { status: 503, message: 'Service temporarily unavailable' },
};

/**
 * Create a standardized success response
 * @param {Object} data - Response data
 * @param {Object} options - Additional options
 * @returns {Object} - Formatted response
 */
function successResponse(data, options = {}) {
  const { message = null, meta = null } = options;
  
  const response = {
    success: true,
    ...data,
  };
  
  if (message) {
    response.message = message;
  }
  
  if (meta) {
    response.meta = meta;
  }
  
  return response;
}

/**
 * Create a standardized error response
 * @param {string} code - Error code from ERROR_CODES
 * @param {Object} options - Additional options
 * @returns {Object} - Formatted error response
 */
function errorResponse(code, options = {}) {
  const { details = null, message = null, data = null } = options;
  
  const errorInfo = ERROR_CODES[code] || ERROR_CODES.SERVER_ERROR;
  
  const response = {
    success: false,
    error: message || errorInfo.message,
    code: code,
  };
  
  if (details) {
    response.details = details;
  }
  
  if (data) {
    response.data = data;
  }
  
  return {
    status: errorInfo.status,
    body: response,
  };
}

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {Object} options - Additional options
 */
function sendSuccess(res, data, options = {}) {
  const { statusCode = 200, ...rest } = options;
  res.status(statusCode).json(successResponse(data, rest));
}

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} code - Error code
 * @param {Object} options - Additional options
 */
function sendError(res, code, options = {}) {
  const { status, body } = errorResponse(code, options);
  
  // Log error
  logger.error(`API Error: ${code}`, {
    code,
    status,
    details: options.details,
    path: res.req?.path,
  });
  
  res.status(status).json(body);
}

/**
 * Handle caught errors and send appropriate response
 * @param {Object} res - Express response object
 * @param {Error} error - Caught error
 * @param {Object} options - Additional options
 */
function handleError(res, error, options = {}) {
  const { context = 'API', localizer = null } = options;
  
  // Log the error
  logger.error(`[${context}] Error:`, {
    message: error.message,
    stack: error.stack,
    code: error.code,
  });
  
  // Determine error code and extract user-friendly message
  let code = 'SERVER_ERROR';
  let details = null;
  let userMessage = null;
  
  if (error.code && ERROR_CODES[error.code]) {
    code = error.code;
  } else if (error.message) {
    const msg = error.message;
    const msgLower = msg.toLowerCase();
    
    // Extract user-friendly message from INVALID_CONTENT errors
    if (msg.startsWith('INVALID_CONTENT:')) {
      code = 'INVALID_INPUT';
      userMessage = msg.replace('INVALID_CONTENT:', '').trim();
      details = userMessage;
    } else if (msg.startsWith('INVALID_INPUT:')) {
      code = 'INVALID_INPUT';
      userMessage = msg.replace('INVALID_INPUT:', '').trim();
      details = userMessage;
    } else if (msgLower.includes('quota') || msgLower.includes('resource_exhausted')) {
      code = 'QUOTA_EXCEEDED';
    } else if (msgLower.includes('not found')) {
      code = 'NOT_FOUND';
    } else if (msgLower.includes('invalid') || msgLower.includes('validation')) {
      code = 'INVALID_INPUT';
      details = msg;
    } else if (msgLower.includes('unauthorized') || msgLower.includes('auth')) {
      code = 'UNAUTHORIZED';
    } else if (msgLower.includes('rate') || msgLower.includes('429')) {
      code = 'RATE_LIMITED';
    }
  }
  
  // Use localizer if available, but prefer userMessage for content validation errors
  if (userMessage) {
    sendError(res, code, { message: userMessage, details });
  } else if (localizer && typeof localizer.error === 'function') {
    const localized = localizer.error(code.toLowerCase());
    sendError(res, code, { 
      message: localized.error || localized.message,
      details 
    });
  } else {
    sendError(res, code, { details });
  }
}

/**
 * Express middleware for async error handling
 * Wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      handleError(res, error, { context: req.path });
    });
  };
}

/**
 * Create controller method with standardized error handling
 * @param {Function} handler - Controller handler function
 * @param {Object} options - Options
 * @returns {Function} - Wrapped handler
 */
function createHandler(handler, options = {}) {
  const { context = 'Controller' } = options;
  
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      const localizer = req.localizer || null;
      handleError(res, error, { context, localizer });
    }
  };
}

module.exports = {
  ERROR_CODES,
  successResponse,
  errorResponse,
  sendSuccess,
  sendError,
  handleError,
  asyncHandler,
  createHandler,
};
