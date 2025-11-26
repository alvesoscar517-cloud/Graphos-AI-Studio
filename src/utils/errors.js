/**
 * Custom Error Classes
 * Standardized error handling across the application
 */

/**
 * Base API Error
 */
export class APIError extends Error {
  constructor(message, code = 'API_ERROR', details = null) {
    super(message)
    this.name = 'APIError'
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp
    }
  }
}

/**
 * Authentication Error
 */
export class AuthError extends APIError {
  constructor(message, details = null) {
    super(message, 'AUTH_ERROR', details)
    this.name = 'AuthError'
  }
}

/**
 * Validation Error
 */
export class ValidationError extends APIError {
  constructor(message, details = null) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

/**
 * Network Error
 */
export class NetworkError extends APIError {
  constructor(message, details = null) {
    super(message, 'NETWORK_ERROR', details)
    this.name = 'NetworkError'
  }
}

/**
 * Rate Limit Error
 */
export class RateLimitError extends APIError {
  constructor(message = 'Rate limit exceeded', retryAfter = null) {
    super(message, 'RATE_LIMIT_ERROR', { retryAfter })
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

/**
 * Profile Error
 */
export class ProfileError extends APIError {
  constructor(message, details = null) {
    super(message, 'PROFILE_ERROR', details)
    this.name = 'ProfileError'
  }
}

/**
 * Analysis Error
 */
export class AnalysisError extends APIError {
  constructor(message, details = null) {
    super(message, 'ANALYSIS_ERROR', details)
    this.name = 'AnalysisError'
  }
}

/**
 * Error handler utility
 * @param {Error} error 
 * @returns {Object} Standardized error response
 */
export function handleError(error) {
  // If already an APIError, return as is
  if (error instanceof APIError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details
    }
  }

  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      success: false,
      error: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR'
    }
  }

  // Handle abort errors
  if (error.name === 'AbortError') {
    return {
      success: false,
      error: 'Request was cancelled',
      code: 'ABORTED'
    }
  }

  // Generic error
  return {
    success: false,
    error: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  }
}

/**
 * Log error with context
 * @param {Error} error 
 * @param {Object} context 
 */
export function logError(error, context = {}) {
  const errorInfo = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    ...context
  }

  if (error instanceof APIError) {
    errorInfo.code = error.code
    errorInfo.details = error.details
  }

  console.error('❌ Error:', errorInfo)

  // TODO: Send to error tracking service (Sentry, etc.)
  // if (window.Sentry) {
  //   window.Sentry.captureException(error, { extra: context })
  // }
}
