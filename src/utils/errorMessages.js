/**
 * Error Message Utilities
 * Maps backend error messages to localized translations
 */

/**
 * Map backend content validation error to translation key
 * @param {string} errorMessage - Error message from backend
 * @returns {string|null} - Translation key or null if not a content error
 */
export function getContentErrorKey(errorMessage) {
  if (!errorMessage) return null
  
  const msgLower = errorMessage.toLowerCase()
  
  // Content validation errors
  if (msgLower.includes('lacks diversity') || msgLower.includes('richer content')) {
    return 'errors.textLacksDiversity'
  }
  if (msgLower.includes('repeats too much') || msgLower.includes('diverse content')) {
    return 'errors.textTooRepetitive'
  }
  if (msgLower.includes('contains code') || msgLower.includes('natural text')) {
    return 'errors.textContainsCode'
  }
  if (msgLower.includes('special characters') || msgLower.includes('meaningful text')) {
    return 'errors.textTooManySpecialChars'
  }
  if (msgLower.includes('too short') || msgLower.includes('lacks meaningful')) {
    return 'errors.textLacksMeaningfulContent'
  }
  
  // API/System errors
  if (msgLower.includes('quota') || msgLower.includes('resource_exhausted')) {
    return 'errors.quotaExceeded'
  }
  if (msgLower.includes('insufficient credits') || msgLower.includes('not enough credits')) {
    return 'errors.insufficientCredits'
  }
  if (msgLower.includes('rate limit') || msgLower.includes('too many requests')) {
    return 'errors.rateLimited'
  }
  if (msgLower.includes('network') || msgLower.includes('connection')) {
    return 'errors.networkError'
  }
  if (msgLower.includes('timeout') || msgLower.includes('timed out')) {
    return 'errors.timeout'
  }
  if (msgLower.includes('unauthorized') || msgLower.includes('not authenticated')) {
    return 'errors.unauthorized'
  }
  if (msgLower.includes('profile not found') || msgLower.includes('voice profile')) {
    return 'errors.profileNotFound'
  }
  
  return null
}

/**
 * Get localized error message for content validation errors
 * @param {string} errorMessage - Error message from backend
 * @param {Function} t - i18n translation function
 * @returns {string} - Localized error message
 */
export function getLocalizedContentError(errorMessage, t) {
  if (!errorMessage) return t('errors.generic')
  
  const msgLower = errorMessage.toLowerCase()
  
  // Check for min characters error
  if (msgLower.includes('at least') && msgLower.includes('characters')) {
    const match = errorMessage.match(/at least (\d+) characters/i)
    const min = match ? match[1] : '50'
    return t('errors.textTooShort', { min })
  }
  
  // Check for max characters error
  if (msgLower.includes('exceed') && msgLower.includes('characters')) {
    const match = errorMessage.match(/exceed[s]?\s+(\d+)\s+characters/i)
    const max = match ? match[1] : '20000'
    return t('errors.textTooLong', { max })
  }
  
  const key = getContentErrorKey(errorMessage)
  if (key) {
    return t(key)
  }
  
  // Return original message if no mapping found
  return errorMessage
}

/**
 * Check if error is a content validation error
 * @param {string} errorMessage - Error message
 * @returns {boolean}
 */
export function isContentValidationError(errorMessage) {
  if (!errorMessage) return false
  
  const msgLower = errorMessage.toLowerCase()
  return (
    msgLower.includes('text') ||
    msgLower.includes('content') ||
    msgLower.includes('diversity') ||
    msgLower.includes('repetition') ||
    msgLower.includes('characters') ||
    msgLower.includes('code') ||
    msgLower.includes('special')
  )
}

export default {
  getContentErrorKey,
  getLocalizedContentError,
  isContentValidationError
}
