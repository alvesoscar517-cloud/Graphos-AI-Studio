/**
 * Firebase Configuration for Frontend
 * Firestore Realtime listeners for instant updates
 * Firebase Auth for Google Sign-In
 * 
 * Note: Firebase API key is designed to be public.
 * Security is enforced via Firestore Security Rules.
 * 
 * Requirements: 3.1.1 - Initialize Firebase Auth on app startup
 */

import { logger } from '../utils/logger'
import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// Firebase config - API key is public, security via Firestore Rules
const firebaseConfig = {
  apiKey: 'AIzaSyAhHsXuRUsUfQjsVqlu6F7uix_E9zFTXm4',
  authDomain: 'notes-sync-472107.firebaseapp.com',
  projectId: 'notes-sync-472107',
  storageBucket: 'notes-sync-472107.firebasestorage.app',
  messagingSenderId: '472729326429',
  appId: '1:472729326429:web:8f3d06edfde82426820eb4',
}

let app = null
let db = null
let auth = null
let googleProvider = null

export function initializeFirebase() {
  if (app) return { app, db, auth, googleProvider }
  
  try {
    app = initializeApp(firebaseConfig)
    
    // Initialize Firestore with offline persistence
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    })
    
    // Initialize Firebase Auth
    auth = getAuth(app)
    
    // Initialize Google Auth Provider
    googleProvider = new GoogleAuthProvider()
    googleProvider.addScope('email')
    googleProvider.addScope('profile')
    // Force account selection on each sign-in
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    })
    
    logger.log('[Firebase] Initialized successfully (Firestore + Auth)')
    return { app, db, auth, googleProvider }
  } catch (error) {
    console.error('[Firebase] Initialization error:', error)
    return { app: null, db: null, auth: null, googleProvider: null }
  }
}

export function getDb() {
  if (!db) initializeFirebase()
  return db
}

export function getFirebaseAuth() {
  if (!auth) initializeFirebase()
  return auth
}

export function getGoogleProvider() {
  if (!googleProvider) initializeFirebase()
  return googleProvider
}

export { app, db, auth, googleProvider }
