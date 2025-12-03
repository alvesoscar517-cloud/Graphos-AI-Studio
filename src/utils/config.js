/**
 * Enhanced Configuration
 * Centralized config with validation and environment awareness
 */

// ============================================================================
// ENVIRONMENT DETECTION
// ============================================================================

const IS_DEV = import.meta.env.DEV;
const IS_PROD = import.meta.env.PROD;
const MODE = import.meta.env.MODE;

// ============================================================================
// ENVIRONMENT VARIABLE HELPERS
// ============================================================================

/**
 * Get environment variable with fallback
 */
const getEnvVar = (key, defaultValue) => {
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
};

/**
 * Get boolean environment variable
 */
const getEnvBool = (key, defaultValue = false) => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

/**
 * Get number environment variable
 */
const getEnvNumber = (key, defaultValue) => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
};

// ============================================================================
// CONFIGURATION OBJECT
// ============================================================================

export const CONFIG = {
  // Environment
  IS_DEV,
  IS_PROD,
  MODE,
  
  // API Configuration
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'https://graphosai-472729326429.us-central1.run.app'),
  REQUEST_TIMEOUT: getEnvNumber('VITE_REQUEST_TIMEOUT', 30000),
  MAX_RETRIES: getEnvNumber('VITE_MAX_RETRIES', 2),
  
  // Profile & Samples
  MIN_WORDS_SHORT_SAMPLE: 10,
  MIN_WORDS_LONG_TEXT: 500,
  MIN_SAMPLES_REQUIRED: 3,
  MAX_SAMPLES_ALLOWED: 5,
  
  // File Upload
  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  SUPPORTED_FILE_TYPES: ['docx', 'pdf', 'txt'],
  SUPPORTED_MIME_TYPES: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
    'text/plain'
  ],
  
  // Text Limits
  MAX_TEXT_LENGTH: 50000,
  MIN_TEXT_LENGTH: 50,
  MAX_SENTENCE_LENGTH: 500,
  
  // Performance
  MAX_CONVERSATIONS: 100,
  MAX_MESSAGES_PER_CONVERSATION: 50,
  MAX_NOTES: 200,
  DEBOUNCE_DELAY: 300,
  
  // Cache
  CACHE_TTL: 30 * 60 * 1000, // 30 minutes
  CACHE_MAX_SIZE: 100,
  
  // Debug & Error Handling
  ENABLE_DEBUG_LOGS: IS_DEV || getEnvBool('VITE_ENABLE_DEBUG'),
  ENABLE_ERROR_DETAILS: IS_DEV || getEnvBool('VITE_ENABLE_ERROR_DETAILS'),
  
  // Features
  FEATURES: {
    ENABLE_MONITORING: getEnvBool('VITE_ENABLE_MONITORING', true),
    ENABLE_ERROR_TRACKING: IS_PROD && getEnvBool('VITE_ENABLE_ERROR_TRACKING'),
    ENABLE_ANALYTICS: IS_PROD && !!getEnvVar('VITE_GA_TRACKING_ID', ''),
    ENABLE_CACHING: getEnvBool('VITE_ENABLE_CACHING', true),
    ENABLE_OFFLINE_MODE: getEnvBool('VITE_ENABLE_OFFLINE_MODE', false)
  },
  
  // AI Models
  MODELS: {
    DEFAULT: 'gemini-2.0-flash-exp',
    AVAILABLE: [
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', speed: 'fast', quality: 'good' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', speed: 'fast', quality: 'better' },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', speed: 'fastest', quality: 'good' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', speed: 'slow', quality: 'best' }
    ]
  },
  
  // Validation
  VALIDATION: {
    TEXT: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 50000
    },
    PROFILE_NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 100
    },
    EMAIL: {
      PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Debug log - only logs in development or when debug is enabled
 */
export function debugLog(...args) {
  if (CONFIG.ENABLE_DEBUG_LOGS) {
    console.log('[DEBUG]', ...args);
  }
}

/**
 * Warning log - always logs but with context
 */
export function warnLog(...args) {
  console.warn('[WARN]', ...args);
}

/**
 * Error log with optional details
 */
export function errorLog(message, error, details = null) {
  console.error('[ERROR]', message, error);
  
  if (CONFIG.ENABLE_ERROR_DETAILS && details) {
    console.error('[DETAILS]', details);
  }
}

/**
 * Show error to user
 */
export function showError(title, error, details = null) {
  let message = title;
  
  if (CONFIG.ENABLE_ERROR_DETAILS) {
    message += `\n\nError: ${error}`;
    if (details) {
      message += `\n\n${details}`;
    }
  }
  
  // Use notification system if available
  if (window.showNotification) {
    window.showNotification({ type: 'error', message: title, details: error });
  } else {
    alert(message);
  }
}

/**
 * Validate configuration on startup
 */
export function validateConfig() {
  const errors = [];
  
  if (!CONFIG.API_BASE_URL) {
    errors.push('API_BASE_URL is not configured');
  }
  
  if (CONFIG.REQUEST_TIMEOUT < 1000) {
    errors.push('REQUEST_TIMEOUT is too low (minimum 1000ms)');
  }
  
  if (errors.length > 0) {
    console.error('[CONFIG] Configuration errors:', errors);
    return false;
  }
  
  if (CONFIG.ENABLE_DEBUG_LOGS) {
    console.log('[CONFIG] Configuration validated successfully');
    console.log('[CONFIG] Environment:', MODE);
    console.log('[CONFIG] API URL:', CONFIG.API_BASE_URL);
  }
  
  return true;
}

/**
 * Get model by ID
 */
export function getModelById(modelId) {
  return CONFIG.MODELS.AVAILABLE.find(m => m.id === modelId) || CONFIG.MODELS.AVAILABLE[0];
}

/**
 * Check if file type is supported
 */
export function isFileTypeSupported(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  return CONFIG.SUPPORTED_FILE_TYPES.includes(ext);
}

/**
 * Check if file size is within limit
 */
export function isFileSizeValid(sizeInBytes) {
  return sizeInBytes <= CONFIG.MAX_FILE_SIZE_BYTES;
}

// Validate config on module load
validateConfig();

export default CONFIG;
