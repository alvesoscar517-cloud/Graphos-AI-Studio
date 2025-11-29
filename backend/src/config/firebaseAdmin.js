/**
 * Firebase Admin SDK Configuration
 * Centralized initialization to avoid multiple init conflicts
 */

const admin = require('firebase-admin');
const config = require('./index');

let initialized = false;
let initError = null;

/**
 * Initialize Firebase Admin SDK
 * Uses Application Default Credentials (ADC) which automatically works with:
 * - Cloud Run service account
 * - Local development with gcloud auth
 * - GOOGLE_APPLICATION_CREDENTIALS env var
 */
function initializeFirebaseAdmin() {
  if (initialized) {
    return admin;
  }
  
  if (initError) {
    throw initError;
  }
  
  if (admin.apps.length > 0) {
    initialized = true;
    console.log('[Firebase Admin] Already initialized, reusing existing app');
    return admin;
  }
  
  try {
    admin.initializeApp({
      projectId: config.PROJECT_ID,
      credential: admin.credential.applicationDefault()
    });
    
    initialized = true;
    console.log('[Firebase Admin] Initialized successfully', {
      projectId: config.PROJECT_ID,
      appsCount: admin.apps.length
    });
    
    return admin;
  } catch (error) {
    console.error('[Firebase Admin] Initialization failed:', {
      error: error.message,
      code: error.code
    });
    initError = error;
    throw error;
  }
}

/**
 * Get Firebase Admin instance
 * @returns {admin.app.App} Firebase Admin app
 */
function getAdmin() {
  if (!initialized && admin.apps.length === 0) {
    initializeFirebaseAdmin();
  }
  return admin;
}

/**
 * Check if Firebase Admin is available
 */
function isAvailable() {
  return initialized || admin.apps.length > 0;
}

// Initialize on module load
try {
  initializeFirebaseAdmin();
} catch (error) {
  console.error('[Firebase Admin] Failed to initialize on startup:', error.message);
}

module.exports = {
  admin: getAdmin,
  getAdmin,
  isAvailable,
  initializeFirebaseAdmin
};
