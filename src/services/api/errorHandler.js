/**
 * Centralized API Error Handler
 * 
 * Provides consistent error handling across all API calls
 * with proper error classification, logging, and user-friendly messages.
 */

// Error codes mapping to user-friendly messages
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  
  // Auth errors
  UNAUTHORIZED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact Support@graphosai.com for assistance.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  
  // Validation errors
  INVALID_INPUT: 'Invalid input. Please check your data and try again.',
  TEXT_TOO_SHORT: 'Text is too short for analysis.',
  TEXT_TOO_LONG: 'Text exceeds the maximum length.',
  PROFILE_NOT_FOUND: 'Voice profile not found.',
  
  // Rate limiting
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  QUOTA_EXCEEDED: 'API quota exceeded. Please try again later.',
  
  // Credit errors
  INSUFFICIENT_CREDITS: 'Insufficient credits. Please purchase more credits to continue.',
  
  // Server errors
  SERVER_ERROR: 'Something went wrong on our end. Please try again.',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
  
  // AI specific
  AI_MODEL_ERROR: 'AI model error. Please try a different model.',
  CONTENT_BLOCKED: 'Content was blocked by safety filters. Please rephrase.',
  ANALYSIS_FAILED: 'Analysis failed. Please try again.',
  
  // Default
  UNKNOWN: 'An unexpected error occurred. Please try again.',
}

// Error codes that should trigger a logout
const LOGOUT_ERROR_CODES = ['UNAUTHORIZED', 'SESSION_EXPIRED', 'TOKEN_INVALID']

// Error codes that are retryable
const RETRYABLE_ERROR_CODES = ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR', 'SERVICE_UNAVAILABLE', 'RATE_LIMITED']

/**
 * API Error class with additional metadata
 */
export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ApiError'
    this.code = options.code || 'UNKNOWN'
    this.statusCode = options.statusCode || null
    this.details = options.details || null
    this.retryable = options.retryable ?? RETRYABLE_ERROR_CODES.includes(this.code)
    this.shouldLogout = options.shouldLogout ?? LOGOUT_ERROR_CODES.includes(this.code)
    this.timestamp = new Date().toISOString()
    this.requestId = options.requestId || null
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      retryable: this.retryable,
      timestamp: this.timestamp,
      requestId: this.requestId,
    }
  }
}

/**
 * Parse error from API response
 */
export function parseApiError(response, data, requestId = null) {
  const statusCode = response?.status || 500
  
  // Determine error code from response
  let code = data?.code || 'UNKNOWN'
  let details = data?.details || null
  
  // Map HTTP status codes to error codes if not provided
  if (!data?.code) {
    switch (statusCode) {
      case 400:
        code = 'INVALID_INPUT'
        break
      case 401:
        code = 'UNAUTHORIZED'
        break
      case 402:
        code = 'INSUFFICIENT_CREDITS'
        break
      case 403:
        code = 'FORBIDDEN'
        break
      case 404:
        code = 'NOT_FOUND'
        break
      case 429:
        code = 'RATE_LIMITED'
        break
      case 500:
        code = 'SERVER_ERROR'
        break
      case 502:
      case 503:
      case 504:
        code = 'SERVICE_UNAVAILABLE'
        break
    }
  }
  
  // Prefer backend's detailed message, then details, then fallback to generic message
  // This ensures user-friendly validation messages are shown
  let message = data?.error || data?.message || details || ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN
  
  // If details contains more specific info than the generic error, use it
  if (details && message === ERROR_MESSAGES[code]) {
    message = details
  }
  
  return new ApiError(message, {
    code,
    statusCode,
    details,
    requestId,
  })
}

/**
 * Parse network/fetch errors
 */
export function parseNetworkError(error, requestId = null) {
  let code = 'NETWORK_ERROR'
  let message = ERROR_MESSAGES.NETWORK_ERROR
  
  if (error.name === 'AbortError') {
    code = 'TIMEOUT'
    message = ERROR_MESSAGES.TIMEOUT
  } else if (error.message?.includes('Failed to fetch')) {
    code = 'NETWORK_ERROR'
    message = ERROR_MESSAGES.NETWORK_ERROR
  }
  
  return new ApiError(message, {
    code,
    details: error.message,
    requestId,
  })
}

/**
 * Handle API error with logging and optional callbacks
 */
export function handleApiError(error, options = {}) {
  const {
    context = 'API',
    onLogout = null,
    onRetry = null,
    silent = false,
  } = options
  
  // Ensure we have an ApiError
  const apiError = error instanceof ApiError 
    ? error 
    : new ApiError(error.message || ERROR_MESSAGES.UNKNOWN, {
        code: error.code || 'UNKNOWN',
        details: error.stack,
      })
  
  // Log error (unless silent)
  if (!silent) {
    console.error(`[${context}] Error:`, {
      code: apiError.code,
      message: apiError.message,
      statusCode: apiError.statusCode,
      requestId: apiError.requestId,
    })
  }
  
  // Handle logout if needed
  if (apiError.shouldLogout && onLogout) {
    console.log('[AUTH] Error requires logout, triggering...')
    onLogout()
  }
  
  // Suggest retry if applicable
  if (apiError.retryable && onRetry) {
    return { error: apiError, canRetry: true, retry: onRetry }
  }
  
  return { error: apiError, canRetry: false }
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling(fn, options = {}) {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      const result = handleApiError(error, options)
      
      if (options.throwOnError !== false) {
        throw result.error
      }
      
      return { success: false, ...result }
    }
  }
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error) {
  if (error instanceof ApiError) {
    return error.message
  }
  
  if (error?.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code]
  }
  
  return error?.message || ERROR_MESSAGES.UNKNOWN
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error) {
  if (error instanceof ApiError) {
    return error.retryable
  }
  return RETRYABLE_ERROR_CODES.includes(error?.code)
}

/**
 * Request deduplication manager
 * Prevents duplicate concurrent requests to the same endpoint
 */
class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map()
    this.recentRequests = new Map() // Track recent completed requests
    this.COOLDOWN_MS = 2000 // 2 second cooldown between identical requests
  }

  /**
   * Get cache key for request
   */
  getKey(endpoint, body) {
    const bodyHash = body ? JSON.stringify(body) : ''
    return `${endpoint}:${bodyHash}`
  }

  /**
   * Execute request with deduplication and rate limiting
   */
  async execute(key, requestFn) {
    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      console.log(`[DEDUP] Reusing pending request: ${key.substring(0, 50)}...`)
      return this.pendingRequests.get(key)
    }

    // Check cooldown for recently completed requests (prevent rapid re-requests)
    const lastCompleted = this.recentRequests.get(key)
    if (lastCompleted && Date.now() - lastCompleted < this.COOLDOWN_MS) {
      const waitTime = this.COOLDOWN_MS - (Date.now() - lastCompleted)
      console.log(`[DEDUP] Request on cooldown, waiting ${waitTime}ms: ${key.substring(0, 50)}...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    // Create new request promise
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key)
      this.recentRequests.set(key, Date.now())
      
      // Clean up old entries after 1 minute
      setTimeout(() => {
        this.recentRequests.delete(key)
      }, 60000)
    })

    this.pendingRequests.set(key, promise)
    return promise
  }

  /**
   * Clear all pending requests
   */
  clear() {
    this.pendingRequests.clear()
    this.recentRequests.clear()
  }
}

export const requestDeduplicator = new RequestDeduplicator()

export default {
  ApiError,
  parseApiError,
  parseNetworkError,
  handleApiError,
  withErrorHandling,
  getErrorMessage,
  isRetryableError,
  requestDeduplicator,
  ERROR_MESSAGES,
}
