/**
 * Middleware Index
 * Re-exports all middleware for easy importing
 */

// Authentication
const { 
  authenticate, 
  optionalAuth, 
  requireAdmin, 
  userRateLimit 
} = require('./auth.middleware');

// Validation
const { 
  validate, 
  validators, 
  sanitizeText, 
  sanitizeObject,
  validateText,
  validateProfileId,
  validateModel
} = require('./validation.middleware');

// Error Handling
const { 
  errorHandler, 
  notFoundHandler, 
  asyncHandler,
  requestTimeout,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  InsufficientCreditsError,
  ExternalServiceError
} = require('./errorHandler.middleware');

// CORS
const corsMiddleware = require('./cors');

// Rate Limiting
const rateLimitMiddleware = require('./rateLimit');

// Credit
const creditMiddleware = require('./credit.middleware');

// Activity Logger
const { activityLoggerMiddleware, logUserActivity } = require('./activityLogger.middleware');

module.exports = {
  // Auth
  authenticate,
  optionalAuth,
  requireAdmin,
  userRateLimit,
  
  // Validation
  validate,
  validators,
  sanitizeText,
  sanitizeObject,
  validateText,
  validateProfileId,
  validateModel,
  
  // Error Handling
  errorHandler,
  notFoundHandler,
  asyncHandler,
  requestTimeout,
  
  // Error Classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  InsufficientCreditsError,
  ExternalServiceError,
  
  // Other Middleware
  corsMiddleware,
  rateLimitMiddleware,
  creditMiddleware,
  activityLoggerMiddleware,
  logUserActivity
};
