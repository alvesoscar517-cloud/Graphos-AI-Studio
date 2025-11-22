/**
 * Error Handling Middleware
 */

const config = require('../config');

/**
 * Global error handler
 */
function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);
  
  // Default error
  let status = err.status || 500;
  let message = err.message || 'Internal server error';
  
  // Handle specific error types
  if (err.message?.includes('QUOTA_EXCEEDED')) {
    status = 429;
    message = 'API quota exceeded. Please try again later.';
  } else if (err.message?.includes('EMBEDDING_FAILED')) {
    status = 503;
    message = 'AI service temporarily unavailable.';
  } else if (err.message?.includes('INVALID_INPUT')) {
    status = 400;
    message = err.message;
  }
  
  // Send error response
  res.status(status).json({
    error: message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * 404 handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
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

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
