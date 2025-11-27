/**
 * Enhanced Error Handling Utilities
 * Provides structured error classes and handling functions
 */

import { CONFIG } from './config';

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * Base application error
 */
export class AppError extends Error {
  constructor(message, code = 'APP_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

/**
 * Authentication error
 */
export class AuthError extends AppError {
  constructor(message = 'Authentication failed', details = null) {
    super(message, 'AUTH_ERROR', details);
    this.name = 'AuthError';
  }
}

/**
 * Network/API error
 */
export class NetworkError extends AppError {
  constructor(message = 'Network request failed', statusCode = null, details = null) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', fields = null) {
    super(message, 'VALIDATION_ERROR', { fields });
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

/**
 * Analysis error
 */
export class AnalysisError extends AppError {
  constructor(message = 'Analysis failed', details = null) {
    super(message, 'ANALYSIS_ERROR', details);
    this.name = 'AnalysisError';
  }
}

/**
 * Profile error
 */
export class ProfileError extends AppError {
  constructor(message = 'Profile operation failed', details = null) {
    super(message, 'PROFILE_ERROR', details);
    this.name = 'ProfileError';
  }
}

/**
 * Credit/Payment error
 */
export class CreditError extends AppError {
  constructor(message = 'Insufficient credits', required = null, available = null) {
    super(message, 'CREDIT_ERROR', { required, available });
    this.name = 'CreditError';
    this.required = required;
    this.available = available;
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('Rate limit exceeded. Please try again later.', 'RATE_LIMIT_ERROR', { retryAfter });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

// ============================================================================
// ERROR HANDLING FUNCTIONS
// ============================================================================

/**
 * Parse API error response
 */
export function parseApiError(response, data) {
  const statusCode = response.status;
  const errorData = data?.error || data;
  
  // Map status codes to error types
  switch (statusCode) {
    case 400:
      return new ValidationError(
        errorData?.message || 'Invalid request',
        errorData?.details
      );
    
    case 401:
      return new AuthError(
        errorData?.message || 'Authentication required'
      );
    
    case 402:
      return new CreditError(
        errorData?.message || 'Insufficient credits',
        errorData?.details?.required,
        errorData?.details?.available
      );
    
    case 403:
      return new AuthError(
        errorData?.message || 'Access denied'
      );
    
    case 404:
      return new AppError(
        errorData?.message || 'Resource not found',
        'NOT_FOUND'
      );
    
    case 429:
      return new RateLimitError(
        errorData?.details?.retryAfter || 60
      );
    
    case 500:
    case 502:
    case 503:
      return new NetworkError(
        errorData?.message || 'Server error. Please try again later.',
        statusCode
      );
    
    default:
      return new NetworkError(
        errorData?.message || `Request failed with status ${statusCode}`,
        statusCode
      );
  }
}

/**
 * Handle error and return standardized response
 */
export function handleError(error) {
  // Log error in development
  if (CONFIG.ENABLE_DEBUG_LOGS) {
    console.error('[ERROR]', error);
  }
  
  // Already an AppError
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details
    };
  }
  
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      success: false,
      error: 'Network connection failed. Please check your internet connection.',
      code: 'NETWORK_ERROR'
    };
  }
  
  // Timeout errors
  if (error.name === 'AbortError') {
    return {
      success: false,
      error: 'Request timed out. Please try again.',
      code: 'TIMEOUT_ERROR'
    };
  }
  
  // Generic error
  return {
    success: false,
    error: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
}

/**
 * Log error with context
 */
export function logError(error, context = {}) {
  const errorInfo = {
    message: error.message,
    name: error.name,
    code: error.code,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString()
  };
  
  if (CONFIG.ENABLE_DEBUG_LOGS) {
    console.error('[ERROR LOG]', errorInfo);
  }
  
  // In production, could send to error tracking service
  if (CONFIG.FEATURES.ENABLE_ERROR_TRACKING) {
    // sendToErrorTracking(errorInfo);
  }
}

/**
 * Create user-friendly error message
 */
export function getUserFriendlyMessage(error) {
  if (error instanceof CreditError) {
    return `You need ${error.required} credits but only have ${error.available}. Please purchase more credits.`;
  }
  
  if (error instanceof RateLimitError) {
    return `Too many requests. Please wait ${error.retryAfter} seconds before trying again.`;
  }
  
  if (error instanceof AuthError) {
    return 'Please sign in to continue.';
  }
  
  if (error instanceof ValidationError) {
    return error.message || 'Please check your input and try again.';
  }
  
  if (error instanceof NetworkError) {
    if (error.statusCode >= 500) {
      return 'Server is temporarily unavailable. Please try again later.';
    }
    return 'Network error. Please check your connection.';
  }
  
  return error.message || 'Something went wrong. Please try again.';
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

/**
 * Retry a function with exponential backoff
 */
export async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error) => error instanceof NetworkError && error.statusCode >= 500
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      
      if (CONFIG.ENABLE_DEBUG_LOGS) {
        console.log(`[RETRY] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// ============================================================================
// ERROR BOUNDARY HELPERS
// ============================================================================

/**
 * Safe JSON parse
 */
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Safe async operation
 */
export async function safeAsync(fn, fallback = null) {
  try {
    return await fn();
  } catch (error) {
    logError(error, { context: 'safeAsync' });
    return fallback;
  }
}
