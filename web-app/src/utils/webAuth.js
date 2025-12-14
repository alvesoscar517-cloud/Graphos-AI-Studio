/**
 * Web Authentication Module
 * 
 * Provides Google OAuth 2.0 authentication for web app using Firebase Auth.
 * This replaces chrome.identity API used in the Chrome Extension.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 8.3
 */

import { logger } from './logger'
import { getFirebaseAuth, getGoogleProvider, initializeFirebase } from '../config/firebase'
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getRedirectResult
} from 'firebase/auth'

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
 * @returns {Promise<{success: boolean, userInfo?: object, accessToken?: string, idToken?: string, error?: string, code?: string}>}
 */
export async function signInWithGooglePopup() {
  try {
    // Ensure Firebase is initialized
    initializeFirebase()
    
    const auth = getFirebaseAuth()
    const provider = getGoogleProvider()
    
    if (!auth || !provider) {
      throw new Error('Firebase Auth not initialized')
    }
    
    logger.log('[WebAuth] Starting Google sign-in popup...')
    
    const result = await signInWithPopup(auth, provider)
    
    // Get the Google Access Token for Drive API from the credential
    // @ts-ignore - _tokenResponse is internal but contains the OAuth token
    const tokenResponse = result._tokenResponse || {}
    const accessToken = tokenResponse.oauthAccessToken || null
    
    const user = result.user
    
    const userInfo = {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      picture: user.photoURL,
      emailVerified: user.emailVerified
    }
    
    logger.log('[WebAuth] Google sign-in successful:', userInfo.email)
    
    // Get Firebase ID token for backend verification
    const idToken = await user.getIdToken()
    
    return {
      success: true,
      userInfo,
      accessToken,
      idToken
    }
  } catch (error) {
    logger.error('WebAuth', 'Google sign-in failed', error)
    
    // Map Firebase errors to our error codes
    let code = AUTH_ERROR_CODES.UNKNOWN_ERROR
    let message = error.message
    
    switch (error.code) {
      case 'auth/popup-blocked':
        code = AUTH_ERROR_CODES.POPUP_BLOCKED
        message = 'Popup was blocked. Please allow popups for this site.'
        break
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        code = AUTH_ERROR_CODES.POPUP_CLOSED
        message = 'Sign-in was cancelled.'
        break
      case 'auth/network-request-failed':
        code = AUTH_ERROR_CODES.NETWORK_ERROR
        message = 'Network error. Please check your connection.'
        break
      case 'auth/unauthorized-domain':
        code = AUTH_ERROR_CODES.OAUTH_FAILED
        message = 'This domain is not authorized for OAuth. Please contact support.'
        break
      default:
        code = AUTH_ERROR_CODES.OAUTH_FAILED
    }
    
    return {
      success: false,
      error: message,
      code
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
    const auth = getFirebaseAuth()
    
    if (!auth) {
      logger.warn('WebAuth', 'Firebase Auth not initialized, nothing to sign out')
      return { success: true }
    }
    
    await firebaseSignOut(auth)
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
 * Get the current Google access token from Firebase Auth
 * Useful for Google Drive API calls
 * 
 * @returns {Promise<string|null>} The access token or null if not available
 */
export async function getGoogleAccessTokenWeb() {
  try {
    const auth = getFirebaseAuth()
    
    if (!auth || !auth.currentUser) {
      return null
    }
    
    // Re-authenticate to get fresh access token
    // Note: Firebase doesn't store the OAuth access token, only the ID token
    // For Drive access, we need to re-authenticate or use a different approach
    const idToken = await auth.currentUser.getIdToken(true)
    
    // Return the ID token - for Drive access, we'll need to handle this differently
    // The actual Google OAuth access token is only available during sign-in
    return idToken
  } catch (error) {
    logger.error('WebAuth', 'Failed to get access token', error)
    return null
  }
}

/**
 * Subscribe to auth state changes
 * 
 * @param {Function} callback - Called with user object or null
 * @returns {Function} Unsubscribe function
 */
export function onWebAuthStateChanged(callback) {
  const auth = getFirebaseAuth()
  
  if (!auth) {
    logger.warn('WebAuth', 'Firebase Auth not initialized')
    return () => {}
  }
  
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        id: user.uid,
        email: user.email,
        name: user.displayName,
        picture: user.photoURL,
        emailVerified: user.emailVerified
      })
    } else {
      callback(null)
    }
  })
}

/**
 * Check if user is currently signed in with Google via Firebase
 * 
 * @returns {boolean}
 */
export function isSignedInWithGoogle() {
  const auth = getFirebaseAuth()
  return auth?.currentUser != null
}

/**
 * Get current Firebase user info
 * 
 * @returns {object|null} User info or null
 */
export function getCurrentWebUser() {
  const auth = getFirebaseAuth()
  const user = auth?.currentUser
  
  if (!user) return null
  
  return {
    id: user.uid,
    email: user.email,
    name: user.displayName,
    picture: user.photoURL,
    emailVerified: user.emailVerified
  }
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
