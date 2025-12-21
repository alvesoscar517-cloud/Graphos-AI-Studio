/**
 * Platform Detection Utility
 * 
 * Detects whether the app is running as a Chrome Extension or Web App.
 * Used for platform-specific authentication flows and storage APIs.
 * 
 * Requirements: 14.6, 14.7, 14.8
 */

/**
 * Check if running in Chrome Extension context
 * @returns {boolean}
 */
export function isExtension() {
  return typeof chrome !== 'undefined' && 
         chrome.runtime?.id !== undefined &&
         chrome.identity !== undefined
}

/**
 * Check if running in Web App context
 * @returns {boolean}
 */
export function isWebApp() {
  return !isExtension()
}

/**
 * Get current platform name
 * @returns {'extension' | 'webapp'}
 */
export function getPlatform() {
  return isExtension() ? 'extension' : 'webapp'
}

/**
 * Get platform-specific storage
 * Extension uses chrome.storage.local
 * Web App uses localStorage
 */
export const platformStorage = {
  async get(key) {
    if (isExtension()) {
      const result = await chrome.storage.local.get([key])
      return result[key]
    } else {
      const value = localStorage.getItem(key)
      try {
        return value ? JSON.parse(value) : null
      } catch {
        return value
      }
    }
  },
  
  async set(key, value) {
    if (isExtension()) {
      await chrome.storage.local.set({ [key]: value })
    } else {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    }
  },
  
  async remove(key) {
    if (isExtension()) {
      await chrome.storage.local.remove([key])
    } else {
      localStorage.removeItem(key)
    }
  },
  
  async getMultiple(keys) {
    if (isExtension()) {
      return await chrome.storage.local.get(keys)
    } else {
      const result = {}
      for (const key of keys) {
        const value = localStorage.getItem(key)
        try {
          result[key] = value ? JSON.parse(value) : null
        } catch {
          result[key] = value
        }
      }
      return result
    }
  }
}

export default {
  isExtension,
  isWebApp,
  getPlatform,
  platformStorage
}
