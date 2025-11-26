/**
 * Storage Cleanup Utilities
 * Functions to detect and clean corrupted localStorage data
 */

/**
 * Check if a localStorage item is valid JSON
 */
export function isValidJSON(key) {
  try {
    const item = localStorage.getItem(key)
    if (!item) return true // null/undefined is valid (not set)
    JSON.parse(item)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Clean corrupted localStorage items
 */
export function cleanCorruptedStorage() {
  const keysToCheck = [
    'dev_test_profile',
    'activeProfileId',
    'activeProfileName',
    'profileCacheInvalidated',
    'user',
    'authToken'
  ]
  
  let cleaned = 0
  
  keysToCheck.forEach(key => {
    if (!isValidJSON(key)) {
      console.warn(`🧹 Removing corrupted localStorage item: ${key}`)
      localStorage.removeItem(key)
      cleaned++
    }
  })
  
  if (cleaned > 0) {
    console.log(`✅ Cleaned ${cleaned} corrupted localStorage items`)
  }
  
  return cleaned
}

/**
 * Safe get from localStorage with JSON parse
 */
export function safeGetJSON(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue
    return JSON.parse(item)
  } catch (e) {
    console.warn(`Failed to parse localStorage item "${key}":`, e.message)
    localStorage.removeItem(key)
    return defaultValue
  }
}

/**
 * Safe set to localStorage with JSON stringify
 */
export function safeSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.error(`Failed to save to localStorage "${key}":`, e.message)
    return false
  }
}

/**
 * Initialize storage cleanup on app start
 */
export function initStorageCleanup() {
  console.log('🔍 Checking localStorage for corrupted data...')
  const cleaned = cleanCorruptedStorage()
  
  if (cleaned === 0) {
    console.log('✅ localStorage is clean')
  }
}
