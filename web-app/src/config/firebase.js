/**
 * Firebase Configuration for Frontend
 * Firestore Realtime listeners for instant updates
 * Firebase Auth for web authentication
 * 
 * Note: Firebase API key is designed to be public.
 * Security is enforced via Firestore Security Rules.
 * 
 * Requirements: 2.1
 */

import { logger } from '../utils/logger'
import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// Firebase config - API key is public, security via Firestore Rules
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAhHsXuRUsUfQjsVqlu6F7uix_E9zFTXm4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'notes-sync-472107.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'notes-sync-472107',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'notes-sync-472107.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '472729326429',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:472729326429:web:8f3d06edfde82426820eb4',
}

let app = null
let db = null
let auth = null
let googleProvider = null

export function initializeFirebase() {
  if (app) return { app, db, auth, googleProvider }
  
  // Config is hardcoded, no need to check

  try {
    app = initializeApp(firebaseConfig)
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    })
    
    // Initialize Firebase Auth
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()
    // Request additional scopes for Google Drive access
    googleProvider.addScope('https://www.googleapis.com/auth/drive.file')
    googleProvider.addScope('profile')
    googleProvider.addScope('email')
    
    logger.log('[Firebase] Initialized successfully with Auth')
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
