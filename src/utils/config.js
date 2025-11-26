/**
 * Configuration
 * Uses environment variables with fallbacks
 */

// Get environment variables
const getEnvVar = (key, defaultValue) => {
  return import.meta.env[key] || defaultValue
}

const IS_DEV = import.meta.env.DEV
const IS_PROD = import.meta.env.PROD

export const CONFIG = {
  // API
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'https://ai-authenticator-472729326429.us-central1.run.app'),
  REQUEST_TIMEOUT: 30000,
  
  // Profile & Samples
  MIN_WORDS_SHORT_SAMPLE: 10,
  MIN_WORDS_LONG_TEXT: 500,
  MIN_SAMPLES_REQUIRED: 3,
  MAX_SAMPLES_ALLOWED: 5,
  
  // File Upload
  MAX_FILE_SIZE_MB: 10,
  SUPPORTED_FILE_TYPES: ['docx', 'pdf', 'txt'],
  
  // Text Limits
  MAX_TEXT_LENGTH: 50000,
  MIN_TEXT_LENGTH: 50,
  
  // Performance
  MAX_CONVERSATIONS: 100,
  MAX_MESSAGES_PER_CONVERSATION: 50,
  MAX_NOTES: 200,
  
  // Cache
  CACHE_TTL: 30 * 60 * 1000, // 30 minutes
  
  // Debug & Error Handling
  ENABLE_DEBUG_LOGS: IS_DEV || getEnvVar('VITE_ENABLE_DEBUG', 'false') === 'true',
  ENABLE_ERROR_DETAILS: IS_DEV || getEnvVar('VITE_ENABLE_ERROR_DETAILS', 'false') === 'true',
  
  // Features
  FEATURES: {
    ENABLE_MONITORING: getEnvVar('VITE_ENABLE_MONITORING', 'true') === 'true',
    ENABLE_ERROR_TRACKING: IS_PROD && getEnvVar('VITE_ENABLE_ERROR_TRACKING', 'false') === 'true',
    ENABLE_ANALYTICS: IS_PROD && !!getEnvVar('VITE_GA_TRACKING_ID', '')
  }
}

export function debugLog(...args) {
  if (CONFIG.ENABLE_DEBUG_LOGS) {
    console.log('[DEBUG]', ...args)
  }
}

export function showError(title, error, details = null) {
  let message = title
  
  if (CONFIG.ENABLE_ERROR_DETAILS) {
    message += `\n\nError: ${error}`
    if (details) {
      message += `\n\n${details}`
    }
  }
  
  alert(message)
}
