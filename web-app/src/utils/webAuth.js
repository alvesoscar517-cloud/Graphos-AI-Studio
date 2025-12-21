/**
 * Web Authentication Module
 * 
 * Provides Google authentication for web app using Firebase Auth.
 * Simplified version - no longer uses direct OAuth.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 8.3
 */

import { logger } from './logger'
import { 
  signInWithGoogle as firebaseSignInWithGoogle,
  signOut as firebaseSignOut,
  getCurrentUser,
  onAuthStateChanged
} from '../services/firebaseAuth'

/**
 * Error codes for authentication failures
 */
export const AUTH_ERROR_CODES = {
  POPUP_BLOCKED: 'POPUP_BLOCKED',
  POPUP_CLOSED: 'POPUP_CLOSED',
  OAUTH_FAILED: 'OAUTH_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

/**
 * Sign in with Google using Firebase Auth popup
 * 
 * @returns {Promise<{success: boolean, userInfo?: object, token?: string, isNewUser?: boolean, error?: string, code?: string}>}
 */
export async function signInWithGooglePopup() {
  logger.log('[WebAuth] Starting Google sign-in (Firebase Auth)...')
  
  try {
    const result = await firebaseSignInWithGoogle()
    
    if (!result.success) {
      let code = AUTH_ERROR_CODES.OAUTH_FAILED
      
      if (result.error === 'User cancelled sign-in') {
        code = AUTH_ERROR_CODES.POPUP_CLOSED
      }
      
      return {
        success: false,
        error: result.error,
        code
      }
    }
    
    logger.log('[WebAuth] Sign-in successful:', result.user.email)
    
    return {
      success: true,
      userInfo: result.user,
      token: result.token,
      isNewUser: result.isNewUser
    }
  } catch (error) {
    logger.error('WebAuth', 'Sign-in failed', error)
    return {
      success: false,
      error: error.message,
      code: AUTH_ERROR_CODES.UNKNOWN_ERROR
    }
  }
}

/**
 * Sign out from Firebase Auth
 * 
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function signOutWeb() {
  try {
    await firebaseSignOut()
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
 * Subscribe to auth state changes
 * 
 * @param {Function} callback - Called with user object or null
 * @returns {Function} Unsubscribe function
 */
export function onWebAuthStateChanged(callback) {
  return onAuthStateChanged(callback)
}

/**
 * Check if user is currently signed in with Google
 * 
 * @returns {boolean}
 */
export function isSignedInWithGoogle() {
  return !!getCurrentUser()
}

/**
 * Get current user info
 * 
 * @returns {object|null} User info or null
 */
export function getCurrentWebUser() {
  const user = getCurrentUser()
  if (!user) return null
  
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || 'User',
    picture: user.photoURL || ''
  }
}

export default {
  signInWithGooglePopup,
  signOutWeb,
  onWebAuthStateChanged,
  isSignedInWithGoogle,
  getCurrentWebUser,
  AUTH_ERROR_CODES
}
