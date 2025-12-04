/**
 * Environment Configuration Service for Main Backend
 * Reads environment variables from Firestore (shared with admin backend)
 * @version 1.0.0
 */

const { db } = require('../config/firebase');
const logger = require('../utils/logger');
const crypto = require('crypto');

// Firestore document paths (same as admin backend)
const ENV_DOCS = {
  shared: 'system_settings/env_shared',
  backend: 'system_settings/env_backend',
  custom: 'system_settings/env_custom'
};

// Encryption key (must match admin backend)
const ENCRYPTION_KEY = process.env.ENV_ENCRYPTION_KEY || 'graphosai-env-config-secret-key-32';
const IV_LENGTH = 16;

// List of sensitive keys
const SENSITIVE_KEYS = [
  'JWT_SECRET', 'SESSION_SECRET', 'INTERNAL_API_KEY', 'REDIS_URL',
  'LEMON_SQUEEZY_API_KEY', 'LEMON_SQUEEZY_WEBHOOK_SECRET',
  'GOOGLE_SERVICE_ACCOUNT_KEY', 'GEMINI_API_KEY', 'SMTP_PASS'
];

// In-memory cache for config
let configCache = {
  shared: null,
  backend: null,
  custom: null,
  lastFetch: null
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// ENCRYPTION HELPERS
// ============================================================================

function decrypt(encryptedText) {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  try {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    logger.error('Decryption failed', { error: error.message });
    return encryptedText;
  }
}

function isSensitiveKey(key) {
  return SENSITIVE_KEYS.some(sk => key.toUpperCase().includes(sk));
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Load config from Firestore
 * @param {string} type - 'shared', 'backend', or 'custom'
 */
async function loadConfig(type) {
  try {
    const docPath = ENV_DOCS[type];
    if (!docPath) return {};
    
    const doc = await db.doc(docPath).get();
    if (!doc.exists) return {};
    
    const data = doc.data();
    const variables = {};
    
    // Decrypt sensitive values
    for (const [key, value] of Object.entries(data.variables || {})) {
      if (isSensitiveKey(key) && value) {
        variables[key] = decrypt(value);
      } else {
        variables[key] = value;
      }
    }
    
    return variables;
  } catch (error) {
    logger.error('Failed to load env config', { type, error: error.message });
    return {};
  }
}

/**
 * Get all configs with caching
 */
async function getAllConfigs() {
  const now = Date.now();
  
  // Return cached if still valid
  if (configCache.lastFetch && (now - configCache.lastFetch) < CACHE_TTL) {
    return {
      shared: configCache.shared || {},
      backend: configCache.backend || {},
      custom: configCache.custom || {}
    };
  }
  
  try {
    const [shared, backend, custom] = await Promise.all([
      loadConfig('shared'),
      loadConfig('backend'),
      loadConfig('custom')
    ]);
    
    configCache = {
      shared,
      backend,
      custom,
      lastFetch: now
    };
    
    logger.info('Env config loaded from Firestore', {
      sharedCount: Object.keys(shared).length,
      backendCount: Object.keys(backend).length,
      customCount: Object.keys(custom).length
    });
    
    return { shared, backend, custom };
  } catch (error) {
    logger.error('Failed to load all env configs', { error: error.message });
    return {
      shared: configCache.shared || {},
      backend: configCache.backend || {},
      custom: configCache.custom || {}
    };
  }
}

/**
 * Get a specific config value
 * Priority: Firestore backend > Firestore shared > process.env > default
 * 
 * @param {string} key - Environment variable key
 * @param {*} defaultValue - Default value if not found
 */
async function getConfigValue(key, defaultValue = undefined) {
  try {
    const configs = await getAllConfigs();
    
    // Check backend-specific first
    if (configs.backend[key] !== undefined && configs.backend[key] !== '') {
      return configs.backend[key];
    }
    
    // Check shared
    if (configs.shared[key] !== undefined && configs.shared[key] !== '') {
      return configs.shared[key];
    }
    
    // Check custom (format: backend_KEY or shared_KEY)
    const customBackendKey = `backend_${key}`;
    const customSharedKey = `shared_${key}`;
    if (configs.custom[customBackendKey] !== undefined) {
      return decrypt(configs.custom[customBackendKey]);
    }
    if (configs.custom[customSharedKey] !== undefined) {
      return decrypt(configs.custom[customSharedKey]);
    }
    
    // Fallback to process.env
    if (process.env[key] !== undefined && process.env[key] !== '') {
      return process.env[key];
    }
    
    return defaultValue;
  } catch (error) {
    logger.error('Failed to get config value', { key, error: error.message });
    // Fallback to process.env on error
    return process.env[key] ?? defaultValue;
  }
}

/**
 * Get config value synchronously (from cache only)
 * Use this for hot paths where async is not possible
 */
function getConfigValueSync(key, defaultValue = undefined) {
  // Check cache first
  if (configCache.backend?.[key] !== undefined && configCache.backend[key] !== '') {
    return configCache.backend[key];
  }
  if (configCache.shared?.[key] !== undefined && configCache.shared[key] !== '') {
    return configCache.shared[key];
  }
  
  // Fallback to process.env
  return process.env[key] ?? defaultValue;
}

/**
 * Refresh config cache
 */
async function refreshCache() {
  configCache.lastFetch = null;
  return getAllConfigs();
}

/**
 * Clear config cache
 */
function clearCache() {
  configCache = {
    shared: null,
    backend: null,
    custom: null,
    lastFetch: null
  };
}

/**
 * Initialize config on startup
 */
async function initializeConfig() {
  try {
    await getAllConfigs();
    logger.info('Environment config initialized from Firestore');
  } catch (error) {
    logger.warn('Failed to initialize env config from Firestore, using process.env', {
      error: error.message
    });
  }
}

module.exports = {
  loadConfig,
  getAllConfigs,
  getConfigValue,
  getConfigValueSync,
  refreshCache,
  clearCache,
  initializeConfig,
  SENSITIVE_KEYS
};
