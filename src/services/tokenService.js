/**
 * Token Service
 * Manages access tokens and refresh tokens with automatic refresh
 * 
 * Features:
 * - Automatic token refresh before expiration
 * - Token rotation for security
 * - Concurrent refresh prevention (single flight)
 * - Secure token storage via authStorage utility
 */

import { CONFIG } from '../utils/config'
import {
  secureGet,
  secureSet,
  secureRemove,
  AUTH_STORAGE_KEYS,
  clearTokens as clearStorageTokens,
  setTokens as setStorageTokens,
  getTokens as getStorageTokens,
  getAuthMethod,
} from '../utils/authStorage'

const API_BASE_URL = CONFIG.API_BASE_URL || 'https://graphosai-472729326429.us-central1.run.app'

// Refresh token 5 minutes before expiry
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000

// Singleton state for refresh in progress
let refreshPromise = null
let refreshTimer = null

/**
 * Token Service Class
 */
class TokenService {
  constructor() {
    this.listeners = new Set()
    this.isRefreshing = false
  }

  // ============================================================================
  // TOKEN GETTERS (using secure storage)
  // ============================================================================

  getAccessToken() {
    return secureGet(AUTH_STORAGE_KEYS.AUTH_TOKEN)
  }

  getRefreshToken() {
    return secureGet(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
  }

  getTokenExpiry() {
    const expiry = secureGet(AUTH_STORAGE_KEYS.TOKEN_EXPIRY)
    return expiry ? parseInt(expiry, 10) : null
  }

  getAuthMethod() {
    return getAuthMethod()
  }

  // ============================================================================
  // TOKEN SETTERS (using secure storage)
  // ============================================================================

  /**
   * Store tokens securely
   * @param {Object} tokens - { accessToken, refreshToken, expiresIn }
   */
  setTokens({ accessToken, refreshToken, expiresIn }) {
    setStorageTokens({ accessToken, refreshToken, expiresIn })

    // Schedule auto refresh
    this.scheduleRefresh()
    
    // Notify listeners
    this.notifyListeners('tokens_updated')
    
    console.log('[TokenService] Tokens stored securely')
  }

  /**
   * Clear all tokens
   */
  clearTokens() {
    clearStorageTokens()
    
    // Clear refresh timer
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
    
    refreshPromise = null
    this.isRefreshing = false
    
    // Notify listeners
    this.notifyListeners('tokens_cleared')
    
    console.log('[TokenService] Tokens cleared')
  }

  // ============================================================================
  // TOKEN VALIDATION
  // ============================================================================

  /**
   * Check if access token is valid (not expired)
   */
  isAccessTokenValid() {
    const token = this.getAccessToken()
    if (!token) return false

    const expiry = this.getTokenExpiry()
    if (!expiry) return true // No expiry info, assume valid

    // Check if expired
    return Date.now() < expiry
  }

  /**
   * Check if token needs refresh (within threshold)
   */
  needsRefresh() {
    const expiry = this.getTokenExpiry()
    if (!expiry) return false

    // Refresh if within threshold of expiry
    return Date.now() >= (expiry - REFRESH_THRESHOLD_MS)
  }

  /**
   * Check if we have a refresh token
   */
  hasRefreshToken() {
    return !!this.getRefreshToken()
  }

  // ============================================================================
  // TOKEN REFRESH
  // ============================================================================

  /**
   * Refresh access token using refresh token
   * Uses single-flight pattern to prevent concurrent refreshes
   */
  async refreshAccessToken() {
    // Only for email auth
    if (this.getAuthMethod() !== 'email') {
      return null
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      console.log('[TokenService] No refresh token available')
      return null
    }

    // Single flight - return existing promise if refresh in progress
    if (refreshPromise) {
      console.log('[TokenService] Refresh already in progress, waiting...')
      return refreshPromise
    }

    this.isRefreshing = true
    
    refreshPromise = this._doRefresh(refreshToken)
      .finally(() => {
        refreshPromise = null
        this.isRefreshing = false
      })

    return refreshPromise
  }

  /**
   * Internal refresh implementation
   * Uses the new /auth/email/refresh endpoint with token rotation
   */
  async _doRefresh(refreshToken) {
    try {
      console.log('[TokenService] Refreshing access token...')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const response = await fetch(`${API_BASE_URL}/auth/email/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        // Refresh token invalid/expired - need to re-login
        if (response.status === 401 || response.status === 403) {
          console.log('[TokenService] Refresh token invalid, clearing tokens')
          this.clearTokens()
          this.notifyListeners('session_expired')
          
          // Dispatch event for UI to handle
          window.dispatchEvent(new CustomEvent('sessionExpired', {
            detail: { 
              message: 'Your session has expired. Please sign in again.',
              code: data.code || 'SESSION_EXPIRED'
            }
          }))
          
          return null
        }
        throw new Error(data.error || 'Token refresh failed')
      }

      // Store new tokens (with rotation - server always provides new refresh token)
      this.setTokens({
        accessToken: data.accessToken || data.token,
        refreshToken: data.refreshToken, // Always use new refresh token (rotation)
        expiresIn: data.expiresIn || 3600 // Default 1 hour
      })

      console.log('[TokenService] Token refreshed successfully with rotation')
      return data.accessToken || data.token

    } catch (error) {
      console.error('[TokenService] Token refresh failed:', error)
      
      // On network error or timeout, don't clear tokens - might be temporary
      if (error.message === 'Failed to fetch' || error.name === 'AbortError') {
        console.log('[TokenService] Network error/timeout, keeping tokens')
        return this.getAccessToken()
      }
      
      return null
    }
  }

  /**
   * Schedule automatic token refresh
   */
  scheduleRefresh() {
    // Clear existing timer
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }

    const expiry = this.getTokenExpiry()
    if (!expiry) return

    // Calculate when to refresh (5 min before expiry)
    const refreshAt = expiry - REFRESH_THRESHOLD_MS
    const delay = refreshAt - Date.now()

    if (delay <= 0) {
      // Already needs refresh
      this.refreshAccessToken()
      return
    }

    console.log(`[TokenService] Scheduling refresh in ${Math.round(delay / 1000 / 60)} minutes`)
    
    refreshTimer = setTimeout(() => {
      this.refreshAccessToken()
    }, delay)
  }

  // ============================================================================
  // GET VALID TOKEN (with auto-refresh)
  // ============================================================================

  /**
   * Get a valid access token, refreshing if needed
   * This is the main method to use when making API calls
   */
  async getValidToken() {
    // Check if we have a token
    const currentToken = this.getAccessToken()
    if (!currentToken) {
      return null
    }

    // Check if token needs refresh
    if (this.needsRefresh() && this.hasRefreshToken()) {
      const newToken = await this.refreshAccessToken()
      return newToken || currentToken // Fallback to current if refresh fails
    }

    return currentToken
  }

  // ============================================================================
  // EVENT LISTENERS
  // ============================================================================

  /**
   * Subscribe to token events
   * @param {Function} callback - Called with event type
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event) {
    this.listeners.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('[TokenService] Listener error:', error)
      }
    })
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize token service
   * Call this on app startup
   */
  init() {
    // Schedule refresh if we have tokens
    if (this.getAccessToken() && this.getAuthMethod() === 'email') {
      this.scheduleRefresh()
      
      // Check if immediate refresh needed
      if (this.needsRefresh()) {
        this.refreshAccessToken()
      }
    }

    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === AUTH_STORAGE_KEYS.AUTH_TOKEN) {
        this.notifyListeners('tokens_updated')
        this.scheduleRefresh()
      }
    })

    console.log('[TokenService] Initialized')
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const tokenService = new TokenService()

// Export convenience functions
export const getValidToken = () => tokenService.getValidToken()
export const refreshToken = () => tokenService.refreshAccessToken()
export const clearTokens = () => tokenService.clearTokens()
export const setTokens = (tokens) => tokenService.setTokens(tokens)
export const subscribeToTokenEvents = (cb) => tokenService.subscribe(cb)

export default tokenService
