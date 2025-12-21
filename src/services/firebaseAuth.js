/**
 * Firebase Auth Service
 * 
 * Platform-aware authentication service using Firebase Auth.
 * - Extension: Uses chrome.identity.launchWebAuthFlow + signInWithCredential
 * - Web App: Uses signInWithPopup
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.8, 2.9, 3.1.2, 3.1.7
 */

import { 
  signInWithPopup, 
  signInWithCredential,
  signInWithCustomToken as firebaseSignInWithCustomToken,
  GoogleAuthProvider,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth'
import { initializeFirebase } from '../config/firebase'
import { isExtension, isWebApp } from '../utils/platform'
import { logger } from '../utils/logger'

// Initialize Firebase and get auth instance
let auth = null
let googleProvider = null

function getFirebaseAuth() {
  if (!auth) {
    const firebase = initializeFirebase()
    auth = firebase.auth
    googleProvider = firebase.googleProvider
  }
  return { auth, googleProvider }
}


/**
 * Sign in with Google for Chrome Extension
 * Uses background.js signInFirebase action which calls launchWebAuthFlow
 * Then uses Firebase signInWithCredential with the returned ID token
 * 
 * Requirements: 2.1, 2.3, 3.1.7
 */
async function signInWithGoogleExtension() {
  const { auth } = getFirebaseAuth()
  
  logger.log('[FirebaseAuth] Starting Extension sign-in via background.js...')
  
  try {
    // Call background.js to handle the OAuth flow
    const response = await chrome.runtime.sendMessage({ action: 'signInFirebase' })
    
    if (!response.success) {
      if (response.cancelled) {
        return { success: false, error: 'User cancelled sign-in' }
      }
      throw new Error(response.error || 'Sign in failed')
    }
    
    const { idToken, userInfo } = response
    
    if (!idToken) {
      throw new Error('No ID token received from background')
    }
    
    logger.log('[FirebaseAuth] Got ID token from background, signing in to Firebase...')
    
    // Sign in to Firebase with the Google credential
    const credential = GoogleAuthProvider.credential(idToken)
    const result = await signInWithCredential(auth, credential)
    
    // Get Firebase ID token for backend
    const firebaseIdToken = await result.user.getIdToken()
    
    logger.log('[FirebaseAuth] Extension sign-in successful')
    
    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || userInfo?.name || 'User',
        picture: result.user.photoURL || userInfo?.picture || ''
      },
      token: firebaseIdToken,
      isNewUser: result._tokenResponse?.isNewUser || false
    }
  } catch (error) {
    logger.error('FirebaseAuth', 'Extension sign-in failed', error)
    
    // Handle user cancellation
    if (error.message?.includes('canceled') || error.message?.includes('closed') || error.message?.includes('cancelled')) {
      return { success: false, error: 'User cancelled sign-in' }
    }
    
    throw error
  }
}


/**
 * Sign in with Google for Web App
 * Uses Firebase signInWithPopup
 * 
 * Requirements: 2.2, 3.1.2
 */
async function signInWithGoogleWebApp() {
  const { auth, googleProvider } = getFirebaseAuth()
  
  logger.log('[FirebaseAuth] Starting signInWithPopup...')
  
  try {
    const result = await signInWithPopup(auth, googleProvider)
    
    // Get Firebase ID token for backend
    const firebaseIdToken = await result.user.getIdToken()
    
    logger.log('[FirebaseAuth] Web App sign-in successful')
    
    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || 'User',
        picture: result.user.photoURL || ''
      },
      token: firebaseIdToken,
      isNewUser: result._tokenResponse?.isNewUser || false
    }
  } catch (error) {
    logger.error('FirebaseAuth', 'Web App sign-in failed', error)
    
    // Handle popup closed
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'User cancelled sign-in' }
    }
    
    // Handle account exists with different credential
    if (error.code === 'auth/account-exists-with-different-credential') {
      return { success: false, error: 'EMAIL_ALREADY_REGISTERED' }
    }
    
    throw error
  }
}

/**
 * Sign in with Google (platform-aware)
 * Automatically uses the correct method based on platform
 * 
 * Requirements: 2.1, 2.2, 2.3
 */
export async function signInWithGoogle() {
  if (isExtension()) {
    return signInWithGoogleExtension()
  } else {
    return signInWithGoogleWebApp()
  }
}

/**
 * Check if email exists in backend (for conflict detection)
 * 
 * Requirements: 2.9
 */
export async function checkEmailConflict(email, backendUrl) {
  try {
    const response = await fetch(`${backendUrl}/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    
    if (!response.ok) {
      return { exists: false }
    }
    
    const data = await response.json()
    return {
      exists: data.exists,
      authMethod: data.authMethod // 'email' or 'google'
    }
  } catch (error) {
    logger.error('FirebaseAuth', 'Email check failed', error)
    return { exists: false }
  }
}


/**
 * Sign in with Firebase Custom Token
 * Used for email users to get Firebase Auth session
 * This enables direct Firestore access with security rules
 * 
 * @param {string} customToken - Firebase custom token from backend
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function signInWithCustomToken(customToken) {
  if (!customToken) {
    logger.warn('[FirebaseAuth] No custom token provided')
    return { success: false, error: 'No custom token provided' }
  }
  
  try {
    const { auth } = getFirebaseAuth()
    const result = await firebaseSignInWithCustomToken(auth, customToken)
    
    logger.log('[FirebaseAuth] Custom token sign-in successful', { uid: result.user.uid })
    
    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || 'User',
        picture: result.user.photoURL || ''
      }
    }
  } catch (error) {
    logger.error('FirebaseAuth', 'Custom token sign-in failed', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get current Firebase user
 */
export function getCurrentUser() {
  const { auth } = getFirebaseAuth()
  return auth?.currentUser || null
}

/**
 * Get Firebase ID token for API calls
 * Returns null if not authenticated
 */
export async function getIdToken() {
  const { auth } = getFirebaseAuth()
  const user = auth?.currentUser
  
  if (!user) {
    return null
  }
  
  try {
    return await user.getIdToken()
  } catch (error) {
    logger.error('FirebaseAuth', 'Failed to get ID token', error)
    return null
  }
}

/**
 * Sign out from Firebase
 */
export async function signOut() {
  const { auth } = getFirebaseAuth()
  
  try {
    await firebaseSignOut(auth)
    logger.log('[FirebaseAuth] Signed out successfully')
    return { success: true }
  } catch (error) {
    logger.error('FirebaseAuth', 'Sign out failed', error)
    return { success: false, error: error.message }
  }
}

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Called with user object or null
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChanged(callback) {
  const { auth } = getFirebaseAuth()
  
  return firebaseOnAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        name: user.displayName || 'User',
        picture: user.photoURL || ''
      })
    } else {
      callback(null)
    }
  })
}

/**
 * Initialize Firebase Auth and return current state
 */
export function initializeAuth() {
  const { auth } = getFirebaseAuth()
  return {
    auth,
    currentUser: auth?.currentUser || null
  }
}

export default {
  signInWithGoogle,
  signInWithCustomToken,
  checkEmailConflict,
  getCurrentUser,
  getIdToken,
  signOut,
  onAuthStateChanged,
  initializeAuth
}
