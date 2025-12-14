/**
 * Environment Detection Module
 * 
 * Detects whether the application is running as a Chrome Extension or Web App.
 * This module provides utility functions to determine the runtime environment
 * and select appropriate APIs accordingly.
 * 
 * Requirements: 1.2, 8.1
 */

/**
 * Checks if the application is running as a standalone web app
 * (not as a Chrome Extension)
 * 
 * @returns {boolean} True if running in web app context, false if Chrome Extension
 */
export const isWebApp = () => {
  // In a web app context, chrome.runtime?.id will be undefined
  // because the chrome.runtime API is only available in extension contexts
  return typeof chrome === 'undefined' || !chrome.runtime?.id
}

/**
 * Checks if the application is running as a Chrome Extension
 * 
 * @returns {boolean} True if running in Chrome Extension context, false otherwise
 */
export const isChromeExtension = () => {
  // Chrome Extension context has chrome.runtime.id defined
  return typeof chrome !== 'undefined' && !!chrome.runtime?.id
}

/**
 * Gets the current runtime environment as a string
 * 
 * @returns {'web' | 'extension'} The current environment type
 */
export const getEnvironment = () => {
  return isWebApp() ? 'web' : 'extension'
}

/**
 * Checks if a specific Chrome API is available
 * Useful for graceful degradation when specific APIs are needed
 * 
 * @param {string} apiPath - Dot-separated path to the API (e.g., 'storage.local', 'identity')
 * @returns {boolean} True if the API is available
 */
export const isChromeApiAvailable = (apiPath) => {
  if (typeof chrome === 'undefined') {
    return false
  }
  
  const parts = apiPath.split('.')
  let current = chrome
  
  for (const part of parts) {
    if (current === undefined || current === null || !(part in current)) {
      return false
    }
    current = current[part]
  }
  
  return current !== undefined && current !== null
}
