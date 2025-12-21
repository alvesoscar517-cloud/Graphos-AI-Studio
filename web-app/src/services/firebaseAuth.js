/**
 * Firebase Auth Service (Web App)
 * 
 * Platform-aware authentication service using Firebase Auth.
 * - Web App: Uses signInWithPopup
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.8, 2.9, 3.1.2
 */

import { 
  signInWithPopup, 
  signInWithCredential,
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
 * Sign in with Google (Web App only)
 * 
 * Requirements: 2.2
 */
export async function signInWithGoogle() {
  return signInWithGoogleWebApp()
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
  checkEmailConflict,
  getCurrentUser,
  getIdToken,
  signOut,
  onAuthStateChanged,
  initializeAuth
}
