/**
 * Web Authentication Module
 * 
 * Provides Google OAuth 2.0 authentication for web app using direct OAuth.
 * This matches the Chrome Extension behavior (chrome.identity).
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 8.3
 */

import { logger } from './logger'
import {
  signInWithGoogleOAuth,
  getStoredGoogleToken,
  getStoredUserInfo,
  clearGoogleAuth,
  isSignedInWithGoogle as checkGoogleSignIn,
  AUTH_ERROR_CODES
} from './googleOAuth'

// Re-export error codes
export { AUTH_ERROR_CODES }

/**
 * Sign in with Google using OAuth popup (direct OAuth, not Firebase)
 * 
 * @returns {Promise<{success: boolean, userInfo?: object, accessToken?: string, error?: string, code?: string}>}
 */
export async function signInWithGooglePopup() {
  logger.log('[WebAuth] Starting Google sign-in (direct OAuth)...')
  return signInWithGoogleOAuth()
}

/**
 * Sign out from Google OAuth
 * 
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function signOutWeb() {
  try {
    clearGoogleAuth()
    logger.log('[WebAuth] Signed out successfully')
    return { success: true }
  } catch (error) {
    logger.error('WebAuth', 'Sign out failed', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get the current Google access token
 * Useful for Google Drive API calls
 * 
 * @returns {Promise<string|null>} The access token or null if not available
 */
export async function getGoogleAccessTokenWeb() {
  try {
    return getStoredGoogleToken()
  } catch (error) {
    logger.error('WebAuth', 'Failed to get access token', error)
    return null
  }
}

/**
 * Subscribe to auth state changes
 * Note: Direct OAuth doesn't have real-time state changes like Firebase
 * This is a simplified version that checks current state
 * 
 * @param {Function} callback - Called with user object or null
 * @returns {Function} Unsubscribe function
 */
export function onWebAuthStateChanged(callback) {
  // Check current state immediately
  const userInfo = getStoredUserInfo()
  const token = getStoredGoogleToken()
  
  if (userInfo && token) {
    callback(userInfo)
  } else {
    callback(null)
  }
  
  // Return no-op unsubscribe since we don't have real-time updates
  return () => {}
}

/**
 * Check if user is currently signed in with Google
 * 
 * @returns {boolean}
 */
export function isSignedInWithGoogle() {
  return checkGoogleSignIn()
}

/**
 * Get current user info
 * 
 * @returns {object|null} User info or null
 */
export function getCurrentWebUser() {
  return getStoredUserInfo()
}

export default {
  signInWithGooglePopup,
  signOutWeb,
  getGoogleAccessTokenWeb,
  onWebAuthStateChanged,
  isSignedInWithGoogle,
  getCurrentWebUser,
  AUTH_ERROR_CODES
}
