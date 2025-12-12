/**
 * Firebase Configuration for Admin Panel
 * Firestore Realtime listeners for instant updates
 * 
 * Note: Firebase API key is designed to be public.
 * Security is enforced via Firestore Security Rules.
 */

import logger from '../lib/logger'
import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

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

export function initializeFirebase() {
  if (app) return { app, db }
  
  // Config is hardcoded, no need to check

  try {
    app = initializeApp(firebaseConfig, 'admin-panel')
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    })
    logger.log('[Firebase] Admin panel initialized successfully')
    return { app, db }
  } catch (error) {
    console.error('[Firebase] Initialization error:', error)
    return { app: null, db: null }
  }
}

export function getDb() {
  if (!db) initializeFirebase()
  return db
}

export { app, db }

