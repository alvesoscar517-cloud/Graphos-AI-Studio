const logger = require('../utils/logger');

/**
 * Environment Config Helper
 * Provides sync access to config with Firestore > process.env > default fallback
 * 
 * This module solves the bootstrap problem:
 * 1. Server starts with process.env/defaults (no Firestore dependency)
 * 2. After Firestore is ready, config is loaded and cached
 * 3. All subsequent reads use cached Firestore values
 * 
 * @module config/envConfigHelper
 */

// In-memory cache for Firestore config
let firestoreConfig = {
  shared: {},
  backend: {},
  custom: {},
  loaded: false,
  loading: false,
  lastLoad: null
};

// Default values for all environment variables
const DEFAULTS = {
  // Server
  PORT: 8080,
  NODE_ENV: 'production',
  LOG_LEVEL: 'info',
  REQUEST_TIMEOUT: 30000,
  MAX_REQUEST_SIZE: '10mb',
  
  // Google Cloud
  GOOGLE_CLOUD_PROJECT: 'notes-sync-472107',
  VERTEX_AI_LOCATION: 'us-central1',
  
  // AI Models
  GEMINI_MODEL: 'gemini-2.5-flash',
  EMBEDDING_MODEL: 'text-embedding-004',
  MAX_TEXT_LENGTH: 20000,
  
  // Redis
  REDIS_URL: '',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: 900000,
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Caching
  CACHE_TTL_PROFILE: 300000,
  CACHE_TTL_EMBEDDING: 1800000,
  CACHE_TTL_ANALYSIS: 600000,
  CACHE_MAX_EMBEDDING: 1000,
  CACHE_MAX_ANALYSIS: 100,
  
  // AI Detection
  AI_DETECTION_MAX_CHUNK_SIZE: 3000,
  AI_DETECTION_UNCERTAIN_LOW: 35,
  AI_DETECTION_UNCERTAIN_HIGH: 65,
  AI_DETECTION_DEEP_THRESHOLD: 75,
  
  // Email / SMTP (shared with admin backend)
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: 587,
  SMTP_USER: '',
  SMTP_PASS: '',
  EMAIL_FROM: 'no-reply@graphosai.com',
  EMAIL_FROM_NAME: 'Graphos AI Studio',
  EMAIL_SUPPORT: 'support@graphosai.com',
  EMAIL_BILLING: 'support@graphosai.com',
  ICON_BASE_URL: 'https://alvesoscar517-cloud.github.io/icons-for-Gmail',
  
  // Security
  CORS_WHITELIST: '',
  SESSION_SECRET: '',
  JWT_SECRET: '',
  MAX_PROFILE_SAMPLES: 100,
  MAX_BATCH_SIZE: 10,
  SANITIZE_INPUT: true,
  INTERNAL_API_KEY: '',
  
  // Features
  ENABLE_CACHING: true,
  ENABLE_RATE_LIMITING: true,
  ENABLE_ANALYTICS: true,
  ENABLE_EMAIL: false,
  ENABLE_DEBUG_ENDPOINTS: false,
  
  // Lemon Squeezy
  LEMON_SQUEEZY_API_KEY: '',
  LEMON_SQUEEZY_STORE_ID: '',
  LEMON_SQUEEZY_WEBHOOK_SECRET: '',
  LS_VARIANT_BASIC: '',
  LS_VARIANT_PRO: '',
  LS_VARIANT_PRO_PLUS: '',
  LS_VARIANT_POWER: ''
};

/**
 * Get config value with fallback chain:
 * Firestore backend > Firestore shared > process.env > default
 * 
 * @param {string} key - Environment variable key
 * @param {*} defaultValue - Override default value
 * @returns {*} Config value
 */
function get(key, defaultValue = undefined) {
  // 1. Check Firestore backend config
  if (firestoreConfig.backend[key] !== undefined && firestoreConfig.backend[key] !== '') {
    return firestoreConfig.backend[key];
  }
  
  // 2. Check Firestore shared config
  if (firestoreConfig.shared[key] !== undefined && firestoreConfig.shared[key] !== '') {
    return firestoreConfig.shared[key];
  }
  
  // 3. Check custom variables
  const customBackendKey = `backend_${key}`;
  const customSharedKey = `shared_${key}`;
  if (firestoreConfig.custom[customBackendKey] !== undefined) {
    return firestoreConfig.custom[customBackendKey];
  }
  if (firestoreConfig.custom[customSharedKey] !== undefined) {
    return firestoreConfig.custom[customSharedKey];
  }
  
  // 4. Check process.env
  if (process.env[key] !== undefined && process.env[key] !== '') {
    return parseValue(process.env[key], key);
  }
  
  // 5. Return default
  return defaultValue !== undefined ? defaultValue : DEFAULTS[key];
}

/**
 * Parse string value to appropriate type based on key
 */
function parseValue(value, key) {
  if (value === undefined || value === null) return value;
  
  // Boolean keys
  const booleanKeys = ['ENABLE_CACHING', 'ENABLE_RATE_LIMITING', 'ENABLE_ANALYTICS', 
    'ENABLE_EMAIL', 'ENABLE_DEBUG_ENDPOINTS', 'SANITIZE_INPUT'];
  if (booleanKeys.includes(key)) {
    return value === 'true' || value === true;
  }
  
  // Number keys
  const numberKeys = ['PORT', 'SMTP_PORT', 'REQUEST_TIMEOUT', 'MAX_TEXT_LENGTH',
    'RATE_LIMIT_WINDOW', 'RATE_LIMIT_MAX_REQUESTS', 'CACHE_TTL_PROFILE',
    'CACHE_TTL_EMBEDDING', 'CACHE_TTL_ANALYSIS', 'CACHE_MAX_EMBEDDING',
    'CACHE_MAX_ANALYSIS', 'AI_DETECTION_MAX_CHUNK_SIZE', 'AI_DETECTION_UNCERTAIN_LOW',
    'AI_DETECTION_UNCERTAIN_HIGH', 'AI_DETECTION_DEEP_THRESHOLD',
    'MAX_PROFILE_SAMPLES', 'MAX_BATCH_SIZE'];
  if (numberKeys.includes(key)) {
    const num = Number(value);
    return isNaN(num) ? value : num;
  }
  
  return value;
}

/**
 * Update Firestore config cache
 * Called after loading from Firestore
 */
function updateCache(type, config) {
  if (type === 'shared') {
    firestoreConfig.shared = config || {};
  } else if (type === 'backend') {
    firestoreConfig.backend = config || {};
  } else if (type === 'custom') {
    firestoreConfig.custom = config || {};
  }
  firestoreConfig.loaded = true;
  firestoreConfig.lastLoad = Date.now();
}

/**
 * Load config from Firestore (async)
 * Should be called after server starts
 */
async function loadFromFirestore() {
  if (firestoreConfig.loading) return;
  firestoreConfig.loading = true;
  
  try {
    const envConfigService = require('../services/envConfig.service');
    const configs = await envConfigService.getAllConfigs();
    
    updateCache('shared', configs.shared);
    updateCache('backend', configs.backend);
    updateCache('custom', configs.custom);
    
    logger.info('[ENV-CONFIG] Loaded from Firestore:', {
      shared: Object.keys(configs.shared).length,
      backend: Object.keys(configs.backend).length,
      custom: Object.keys(configs.custom).length
    });
  } catch (error) {
    logger.warn('[ENV-CONFIG] Failed to load from Firestore, using process.env:', error.message);
  } finally {
    firestoreConfig.loading = false;
  }
}

/**
 * Clear cache and reload
 */
async function refresh() {
  firestoreConfig = {
    shared: {},
    backend: {},
    custom: {},
    loaded: false,
    loading: false,
    lastLoad: null
  };
  await loadFromFirestore();
}

/**
 * Check if Firestore config is loaded
 */
function isLoaded() {
  return firestoreConfig.loaded;
}

/**
 * Get all config as object (for debugging)
 */
function getAll() {
  const result = {};
  for (const key of Object.keys(DEFAULTS)) {
    result[key] = get(key);
  }
  return result;
}

module.exports = {
  get,
  updateCache,
  loadFromFirestore,
  refresh,
  isLoaded,
  getAll,
  DEFAULTS
};
