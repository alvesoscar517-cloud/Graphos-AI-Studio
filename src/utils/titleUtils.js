/**
 * Title Utilities
 * Utility functions for handling and displaying titles
 */

// Help prefix for app context detection
const HELP_PREFIX = '[APP_HELP] '

/**
 * Check if title has help prefix
 * @param {string} title - Title to check
 * @returns {boolean} True if has help prefix
 */
export const hasHelpPrefix = (title) => {
  return title?.startsWith(HELP_PREFIX) || false
}

/**
 * Strip help prefix from title
 * @param {string} title - Title to strip
 * @returns {string} Title without help prefix
 */
export const stripHelpPrefix = (title) => {
  if (!title) return title
  return hasHelpPrefix(title) ? title.slice(HELP_PREFIX.length) : title
}

/**
 * Truncate title by word count
 * @param {string} title - Original title
 * @param {number} maxWords - Maximum words (default: 7)
 * @returns {string} Truncated title
 */
export const truncateTitleByWords = (title, maxWords = 7) => {
  if (!title) return title
  const words = title.trim().split(/\s+/)
  if (words.length <= maxWords) return title
  return words.slice(0, maxWords).join(' ') + '...'
}

/**
 * Truncate title by character count (fallback)
 * @param {string} title - Original title
 * @param {number} maxLength - Maximum characters (default: 50)
 * @returns {string} Truncated title
 */
export const truncateTitleByChars = (title, maxLength = 50) => {
  if (!title) return title
  if (title.length <= maxLength) return title
  return title.substring(0, maxLength) + '...'
}

/**
 * Format title for display (combines both methods)
 * @param {string} title - Original title
 * @param {number} maxWords - Maximum words (default: 7)
 * @param {number} maxChars - Maximum characters (default: 60)
 * @returns {string} Formatted title
 */
export const formatDisplayTitle = (title, maxWords = 7, maxChars = 60) => {
  if (!title) return title
  
  // First truncate by words
  let result = truncateTitleByWords(title, maxWords)
  
  // Then ensure it doesn't exceed max chars
  if (result.length > maxChars) {
    result = truncateTitleByChars(result, maxChars)
  }
  
  return result
}
