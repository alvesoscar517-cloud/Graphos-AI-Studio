/**
 * Enhanced API Client
 * Centralized HTTP client with retry, timeout, error handling, and request deduplication
 * 
 * Features:
 * - Automatic token refresh on 401
 * - Request retry with exponential backoff
 * - Request deduplication
 * - Timeout handling
 * - Standardized error handling via logError
 */

import { logger } from '../../utils/logger'
import { CONFIG } from '../../utils/config'
import { withRetry, logError } from '../../utils/errors'
import { getUserInfo } from './auth'
import { tokenService } from '../tokenService'
import { 
  parseApiError, 
  ApiError,
  requestDeduplicator,
} from './errorHandler'

// ============================================================================
// REQUEST CONFIGURATION
// ============================================================================

const DEFAULT_TIMEOUT = 30000 // 30 seconds

// ============================================================================
// TIMEOUT TIERS FOR DIFFERENT OPERATION TYPES
// ============================================================================

// Standard AI timeout (2 minutes) - for detection, analysis, suggestions, translation
const STANDARD_AI_TIMEOUT = 120000

// Heavy AI timeout (3 minutes) - for rewrite, humanization check
const HEAVY_AI_TIMEOUT = 180000

// Iterative/Streaming timeout (5 minutes) - for iterative humanization, streaming
const STREAMING_TIMEOUT = 300000

// Endpoint timeout mapping
const ENDPOINT_TIMEOUTS = {
  // Standard AI operations (2 min)
  '/authenticate': STANDARD_AI_TIMEOUT,
  '/analysis/authenticate': STANDARD_AI_TIMEOUT,
  '/analyze': STANDARD_AI_TIMEOUT,
  '/analysis/analyze': STANDARD_AI_TIMEOUT,
  '/suggest_improvements': STANDARD_AI_TIMEOUT,
  '/analysis/suggest-improvements': STANDARD_AI_TIMEOUT,
  '/api/translate': STANDARD_AI_TIMEOUT,
  '/analysis/translate': STANDARD_AI_TIMEOUT,
  '/add_sample': STANDARD_AI_TIMEOUT,
  '/profiles/add-sample': STANDARD_AI_TIMEOUT,
  
  // Heavy AI operations (3 min)
  '/rewrite': HEAVY_AI_TIMEOUT,
  '/analysis/rewrite': HEAVY_AI_TIMEOUT,
  '/check-humanization': HEAVY_AI_TIMEOUT,
  '/analysis/check-humanization': HEAVY_AI_TIMEOUT,
  '/api/chat': STANDARD_AI_TIMEOUT,
  '/api/chat/humanized': HEAVY_AI_TIMEOUT,
  '/add_samples_batch': HEAVY_AI_TIMEOUT,
  '/profiles/add-samples-batch': HEAVY_AI_TIMEOUT,
  '/finalize_profile': HEAVY_AI_TIMEOUT,
  '/profiles/finalize': HEAVY_AI_TIMEOUT,
  
  // Streaming/Iterative operations (5 min)
  '/rewrite_stream': STREAMING_TIMEOUT,
  '/rewrite-stream': STREAMING_TIMEOUT,
  '/analysis/rewrite-stream': STREAMING_TIMEOUT,
  '/iterative-humanize': STREAMING_TIMEOUT,
  '/analysis/iterative-humanize': STREAMING_TIMEOUT,
  '/api/chat/stream': STREAMING_TIMEOUT,
  '/api/chat/humanized/stream': STREAMING_TIMEOUT,
  '/create_profile_complete': STREAMING_TIMEOUT,
  '/create_profile_complete/stream': STREAMING_TIMEOUT,
  '/profiles/create': STREAMING_TIMEOUT,
}

/**
 * Get timeout for endpoint based on operation type
 */
function getTimeoutForEndpoint(endpoint) {
  // Check exact match first
  for (const [path, timeout] of Object.entries(ENDPOINT_TIMEOUTS)) {
    if (endpoint === path || endpoint.endsWith(path)) {
      return timeout
    }
  }
  
  // Check partial match for streaming endpoints
  if (endpoint.includes('stream') || endpoint.includes('humanize')) {
    return STREAMING_TIMEOUT
  }
  
  // Check for AI-related endpoints
  if (endpoint.includes('rewrite') || endpoint.includes('humaniz')) {
    return HEAVY_AI_TIMEOUT
  }
  
  if (endpoint.includes('authenticate') || endpoint.includes('analyze') || endpoint.includes('chat')) {
    return STANDARD_AI_TIMEOUT
  }
  
  return DEFAULT_TIMEOUT
}

const DEFAULT_RETRY_OPTIONS = {
  maxRetries: 2,
  baseDelay: 1000,
  maxDelay: 10000, // Max 10 seconds between retries
  shouldRetry: (error) => {
    // Retry on network errors and 5xx server errors
    if (error instanceof ApiError) {
      // Don't retry on rate limit - wait for retry-after
      if (error.code === 'RATE_LIMITED' && error.retryAfter) {
        return false
      }
      return error.retryable
    }
    return error?.statusCode >= 500 || error?.statusCode === null
  }
}

// ============================================================================
// REQUEST ID GENERATION
// ============================================================================

function generateRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class ApiClient {
  constructor(baseUrl = CONFIG.API_BASE_URL) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
  }
  
  /**
   * Make HTTP request with enhanced features
   */
  async request(endpoint, options = {}) {
    // Get appropriate timeout based on endpoint type
    const endpointTimeout = getTimeoutForEndpoint(endpoint)
    
    const {
      method = 'GET',
      body = null,
      headers = {},
      params = null,
      timeout = endpointTimeout,
      retry = true,
      includeAuth = true,
      signal = null
    } = options
    
    const requestId = generateRequestId()
    
    // Validate baseUrl
    if (!this.baseUrl) {
      const configError = new ApiError('API base URL is not configured', {
        code: 'CONFIG_ERROR',
        requestId
      })
      logError(configError, { context: 'API', endpoint })
      throw configError
    }
    
    // Build URL with query params for GET requests
    let url = `${this.baseUrl}${endpoint}`
    if (params && typeof params === 'object') {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value)
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `${endpoint.includes('?') ? '&' : '?'}${queryString}`
      }
    }
    
    // Build headers
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
      'X-Request-ID': requestId
    }
    
    // Mutable body for adding user_id
    let requestBody = body
    
    // Add auth if needed
    if (includeAuth) {
      try {
        const userInfo = await getUserInfo()
        if (userInfo?.userId) {
          // Add user_id to body for legacy compatibility
          if (requestBody && typeof requestBody === 'object') {
            requestBody = { ...requestBody, user_id: userInfo.userId }
          }
        }
        
        // Add auth token and type hint if available
        // X-Auth-Type header helps backend verify token efficiently
        const { token: authToken, authType } = await this.getAuthTokenWithType()
        // Only add Authorization header if token is a valid non-empty string
        if (authToken && typeof authToken === 'string' && authToken.trim()) {
          requestHeaders['Authorization'] = `Bearer ${authToken}`
          // Add auth type hint for backend optimization
          if (authType) {
            requestHeaders['X-Auth-Type'] = authType
          }
        }
      } catch (error) {
        logError(error, { context: 'getAuthInfo', requestId })
      }
    }
    
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    // Clean headers - remove any undefined/null values
    const cleanHeaders = Object.fromEntries(
      Object.entries(requestHeaders).filter(([, value]) => value != null && value !== '')
    )
    
    // Build fetch options
    const fetchOptions = {
      method,
      headers: cleanHeaders,
      signal: signal || controller.signal
    }
    
    if (requestBody && method !== 'GET') {
      fetchOptions.body = JSON.stringify(requestBody)
    }
    
    // Execute request with optional retry
    const executeRequest = async () => {
      const startTime = Date.now()
      
      try {
        // Validate URL before fetch
        if (!url || typeof url !== 'string') {
          throw new ApiError('Invalid request URL', { code: 'INVALID_URL', requestId })
        }
        
        const response = await fetch(url, fetchOptions)
        const duration = Date.now() - startTime
        
        // Log request in debug mode
        if (CONFIG.ENABLE_DEBUG_LOGS) {
          logger.log(`[API] ${method} ${endpoint} - ${response.status} (${duration}ms)`)
        }
        
        // Parse response
        let data
        const contentType = response.headers.get('content-type')
        
        if (contentType?.includes('application/json')) {
          data = await response.json()
        } else if (contentType?.includes('text/event-stream')) {
          // Return response for streaming
          return { response, stream: true }
        } else {
          data = await response.text()
        }
        
        // Handle error responses
        if (!response.ok) {
          const error = parseApiError(response, data, requestId)
          
          // Log error with standardized handler
          logError(error, { 
            context: 'API', 
            endpoint, 
            method, 
            statusCode: response.status,
            requestId 
          })
          
          // Special handling for locked account
          if (data?.code === 'ACCOUNT_LOCKED') {
            this.handleAccountLocked(data)
          }
          
          // Handle 401 - attempt token refresh (only once)
          if (response.status === 401 && !options._isRetry) {
            return this.handleUnauthorized(endpoint, options, error)
          }
          
          throw error
        }
        
        return { data, response }
      } catch (error) {
        // Handle abort/timeout
        if (error.name === 'AbortError') {
          const timeoutError = new ApiError('Request timed out', {
            code: 'TIMEOUT',
            requestId
          })
          logError(timeoutError, { context: 'API', endpoint, method, requestId })
          throw timeoutError
        }
        
        // Handle network errors
        if (error.message === 'Failed to fetch') {
          const networkError = new ApiError('Network connection failed', {
            code: 'NETWORK_ERROR',
            requestId
          })
          logError(networkError, { context: 'API', endpoint, method, requestId })
          
          // Dispatch event for GlobalErrorHandler to catch
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app:network-error', { 
              detail: { error: networkError } 
            }))
          }
          
          throw networkError
        }
        
        // Handle invalid fetch parameters (e.g., invalid URL or headers)
        if (error.name === 'TypeError' && error.message?.includes('Invalid value')) {
          logger.error('API', 'Invalid fetch parameters', { url, headers: Object.keys(cleanHeaders) })
          const invalidError = new ApiError('Invalid request parameters', {
            code: 'INVALID_REQUEST',
            requestId
          })
          logError(invalidError, { context: 'API', endpoint, method, requestId })
          throw invalidError
        }
        
        throw error
      } finally {
        clearTimeout(timeoutId)
      }
    }
    
    if (retry) {
      return withRetry(executeRequest, DEFAULT_RETRY_OPTIONS)
    }
    
    return executeRequest()
  }
  
  /**
   * Get auth token and auth type from Chrome extension or localStorage
   * Uses tokenService for automatic refresh
   * @returns {Promise<{token: string|null, authType: 'email'|'google'|null}>}
   */
  async getAuthTokenWithType() {
    // First try JWT token from tokenService (works for both email and Google users)
    // Both auth methods now get JWT tokens from backend:
    // - Email users: JWT from /auth/email/login
    // - Google users: JWT from /auth/email/google-login
    try {
      const token = await tokenService.getValidToken()
      if (token && typeof token === 'string' && token.trim()) {
        // Always use 'email' auth type for JWT tokens
        // Backend verifies JWT the same way regardless of original auth method
        return { token, authType: 'email' }
      }
    } catch (error) {
      logError(error, { context: 'getAuthToken' })
    }
    
    // Fallback: Try Chrome extension (Google OAuth token directly)
    // This is only used when user hasn't gone through backend login yet
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        const response = await chrome.runtime.sendMessage({ action: 'getAuthToken' })
        if (response?.token && typeof response.token === 'string') {
          // This is a Google OAuth access token, not JWT
          return { token: response.token, authType: 'google' }
        }
      }
    } catch {
      // Not in extension context
    }
    return { token: null, authType: null }
  }
  
  /**
   * Get auth token from Chrome extension or localStorage
   * Uses tokenService for automatic refresh
   * @deprecated Use getAuthTokenWithType() instead for better performance
   */
  async getAuthToken() {
    const { token } = await this.getAuthTokenWithType()
    return token
  }

  /**
   * Handle 401 response - attempt token refresh and retry
   * 
   * Both email and Google users now use JWT tokens from backend,
   * so token refresh should work for both auth methods.
   */
  async handleUnauthorized(endpoint, options, originalError) {
    try {
      const { getAuthMethod } = await import('../../utils/authStorage')
      const authMethod = getAuthMethod()
      
      // Attempt refresh for both email and google auth (both use JWT now)
      // Only skip if authMethod is explicitly something else (future auth methods)
      if (authMethod && authMethod !== 'email' && authMethod !== 'google') {
        throw originalError
      }

      // Try to refresh token
      const newToken = await tokenService.refreshAccessToken()
      
      if (!newToken) {
        // Refresh failed - session expired
        this.handleSessionExpired()
        throw originalError
      }

      // Retry original request with new token
      logger.log('[API] Retrying request with refreshed token')
      return this.request(endpoint, { ...options, _isRetry: true })
    } catch (error) {
      logError(error, { context: 'handleUnauthorized', endpoint })
      throw originalError
    }
  }

  /**
   * Handle session expired
   */
  handleSessionExpired() {
    logger.log('[API] Session expired, clearing auth')
    tokenService.clearTokens()
    
    // Dispatch event for UI to handle
    const event = new CustomEvent('sessionExpired', {
      detail: { message: 'Your session has expired. Please sign in again.' }
    })
    window.dispatchEvent(event)
  }
  
  /**
   * Handle account locked error
   * Show modal and prevent further access
   */
  handleAccountLocked(errorData) {
    logError(new Error('Account locked'), { 
      context: 'API', 
      reason: errorData.reason 
    })
    
    // Dispatch custom event for UI to handle
    const event = new CustomEvent('accountLocked', {
      detail: {
        reason: errorData.reason || 'Your account has been locked.',
        message: errorData.message,
        locked: true
      }
    })
    window.dispatchEvent(event)
    
    // Clear auth data
    this.clearAuth()
  }
  
  /**
   * Clear authentication data
   */
  async clearAuth() {
    try {
      // Clear from Chrome storage
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        await chrome.storage.local.remove(['authToken', 'userInfo'])
      }
      
      // Clear via authStorage utility
      const { clearAuthStorage } = await import('../../utils/authStorage')
      clearAuthStorage()
      
      // Send message to background script
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ action: 'clearAuth' })
      }
    } catch (error) {
      logError(error, { context: 'clearAuth' })
    }
  }
  
  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================
  
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }
  
  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body })
  }
  
  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body })
  }
  
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }
  
  // ============================================================================
  // DEDUPLICATED REQUESTS
  // ============================================================================
  
  /**
   * Make a deduplicated POST request
   * Prevents duplicate concurrent requests to the same endpoint with same body
   * Also enforces cooldown between identical requests to prevent rapid re-requests
   */
  async postDeduplicated(endpoint, body, options = {}) {
    // For profile creation, use a simpler key to catch all attempts
    // This prevents multiple profile creations even with slightly different data
    const isProfileCreation = endpoint.includes('profile_complete') || endpoint.includes('create_profile')
    const key = isProfileCreation 
      ? `${endpoint}:profile_creation` // Simplified key for profile creation
      : requestDeduplicator.getKey(endpoint, body)
    
    return requestDeduplicator.execute(key, () => this.post(endpoint, body, options))
  }
  
  /**
   * Make a deduplicated GET request
   */
  async getDeduplicated(endpoint, options = {}) {
    const key = requestDeduplicator.getKey(endpoint, null)
    return requestDeduplicator.execute(key, () => this.get(endpoint, options))
  }
  
  // ============================================================================
  // STREAMING SUPPORT
  // ============================================================================
  
  /**
   * Make streaming request (for SSE endpoints)
   */
  async stream(endpoint, body, onChunk, options = {}) {
    const { response, stream } = await this.post(endpoint, body, {
      ...options,
      retry: false // Don't retry streaming requests
    })
    
    if (!stream) {
      throw new Error('Expected streaming response')
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        
        // Process SSE events
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              return
            }
            
            try {
              const parsed = JSON.parse(data)
              onChunk(parsed)
            } catch {
              // Not JSON, pass raw data
              onChunk({ raw: data })
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const apiClient = new ApiClient()

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/**
 * Legacy fetch wrapper for backward compatibility
 */
export async function apiFetch(endpoint, options = {}) {
  const { data } = await apiClient.request(endpoint, options)
  return data
}

export default apiClient
