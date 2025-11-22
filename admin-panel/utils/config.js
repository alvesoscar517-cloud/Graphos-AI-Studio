export const CONFIG = {
  API_BASE_URL: 'https://ai-authenticator-472729326429.us-central1.run.app',
  MIN_WORDS_SHORT_SAMPLE: 10,
  MIN_WORDS_LONG_TEXT: 500,
  MIN_SAMPLES_REQUIRED: 3,
  MAX_SAMPLES_ALLOWED: 5,
  MAX_FILE_SIZE_MB: 10,
  SUPPORTED_FILE_TYPES: ['docx', 'pdf', 'txt'],
  REQUEST_TIMEOUT: 30000,
  ENABLE_DEBUG_LOGS: true,
  ENABLE_ERROR_DETAILS: true
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
