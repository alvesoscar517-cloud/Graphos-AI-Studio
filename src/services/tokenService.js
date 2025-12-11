/**
 * Token Service (Simplified)
 * 
 * Single source of truth for token management.
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
  getAuthMethod,
} from '../utils/authStorage'

const API_BASE_URL = CONFIG.API_BASE_URL || 'https://graphosai-472729326429.us-central1.run.app'

/**
 * Token refresh configuration
 * 
 * REFRESH_THRESHOLD: How early to refresh before expiry
 * - For 1h token: 5 minutes is good (8% of lifetime)
 * - For 7d token (rememberMe): 1 hour is better (0.6% of lifetime)
 * 
 * We use 5 minutes as default since most tokens are 1h
 * The backend handles sliding expiration for refresh tokens
 */
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes before expiry

// Singleton state
let refreshPromise = null
let refreshTimer = null

class TokenService {
  constructor() {
    this.listeners = new Set()
  }

  // ============================================================================
  // TOKEN GETTERS
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
  // TOKEN SETTERS
  // ============================================================================

  /**
   * Store tokens securely
   * @param {Object} tokens - { accessToken, refreshToken, expiresIn }
   */
  setTokens({ accessToken, refreshToken, expiresIn }) {
    setStorageTokens({ accessToken, refreshToken, expiresIn })
    this.scheduleRefresh()
    this.notifyListeners('tokens_updated')
  }

  /**
   * Clear all tokens
   */
  clearTokens() {
    clearStorageTokens()
    
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
    
    refreshPromise = null
    this.notifyListeners('tokens_cleared')
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
    if (!expiry) return true

    return Date.now() < expiry
  }

  /**
   * Check if token needs refresh (within threshold)
   */
  needsRefresh() {
    const expiry = this.getTokenExpiry()
    if (!expiry) return false

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
      return null
    }

    // Single flight - return existing promise if refresh in progress
    if (refreshPromise) {
      return refreshPromise
    }

    refreshPromise = this._doRefresh(refreshToken).finally(() => {
      refreshPromise = null
    })

    return refreshPromise
  }

  /**
   * Internal refresh implementation
   */
  async _doRefresh(refreshToken) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`${API_BASE_URL}/auth/email/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.clearTokens()
          this.notifyListeners('session_expired')
          
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

      // Store new tokens (with rotation)
      this.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn || 3600
      })

      return data.accessToken

    } catch (error) {
      // On network error, don't clear tokens
      if (error.message === 'Failed to fetch' || error.name === 'AbortError') {
        return this.getAccessToken()
      }
      
      return null
    }
  }

  /**
   * Schedule automatic token refresh
   */
  scheduleRefresh() {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }

    const expiry = this.getTokenExpiry()
    if (!expiry) return

    const refreshAt = expiry - REFRESH_THRESHOLD_MS
    const delay = refreshAt - Date.now()

    if (delay <= 0) {
      this.refreshAccessToken()
      return
    }

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
    const currentToken = this.getAccessToken()
    if (!currentToken) {
      return null
    }

    if (this.needsRefresh() && this.hasRefreshToken()) {
      const newToken = await this.refreshAccessToken()
      return newToken || currentToken
    }

    return currentToken
  }

  // ============================================================================
  // EVENT LISTENERS
  // ============================================================================

  subscribe(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

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

  init() {
    if (this.getAccessToken() && this.getAuthMethod() === 'email') {
      // Validate auth state consistency
      this.validateAuthState()
      
      this.scheduleRefresh()
      
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
  }
  
  /**
   * Validate auth state consistency
   * Checks if token and user data are both present
   * If inconsistent, clears auth and triggers re-login
   */
  validateAuthState() {
    const { getUserData } = require('../utils/authStorage')
    const token = this.getAccessToken()
    const userData = getUserData()
    
    if (token && !userData) {
      console.warn('[TokenService] Auth state inconsistent: token exists but no user data')
      // Clear tokens and trigger re-login
      this.clearTokens()
      this.notifyListeners('session_expired')
      
      window.dispatchEvent(new CustomEvent('sessionExpired', {
        detail: { 
          message: 'Your session data was corrupted. Please sign in again.',
          code: 'AUTH_STATE_CORRUPTED'
        }
      }))
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const tokenService = new TokenService()

// Convenience functions
export const getValidToken = () => tokenService.getValidToken()
export const refreshToken = () => tokenService.refreshAccessToken()
export const clearTokens = () => tokenService.clearTokens()
export const setTokens = (tokens) => tokenService.setTokens(tokens)
export const subscribeToTokenEvents = (cb) => tokenService.subscribe(cb)

export default tokenService
