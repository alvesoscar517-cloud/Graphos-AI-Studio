/**
 * Auth Storage Utility
 * Centralized, secure storage for authentication data
 * 
 * Features:
 * - Token encryption/decryption
 * - Secure storage with obfuscation
 * - Single source of truth for auth storage operations
 */

// ============================================================================
// ENCRYPTION UTILITIES
// ============================================================================

/**
 * Simple encryption key derived from browser fingerprint
 * This provides basic obfuscation - not military-grade encryption
 * but prevents casual inspection of localStorage
 */
const getEncryptionKey = () => {
  // Use a combination of stable browser properties
  const fingerprint = [
    navigator.userAgent.slice(0, 20),
    navigator.language,
    screen.colorDepth,
    new Date().getTimezoneOffset()
  ].join('|')
  
  // Simple hash
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

/**
 * Encrypt sensitive data
 * Uses XOR cipher with rotation for basic obfuscation
 */
export function encryptData(data) {
  if (!data) return null
  
  try {
    const key = getEncryptionKey()
    const str = typeof data === 'string' ? data : JSON.stringify(data)
    
    let encrypted = ''
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      encrypted += String.fromCharCode(charCode)
    }
    
    // Base64 encode for safe storage
    return btoa(encodeURIComponent(encrypted))
  } catch (error) {
    console.error('[AuthStorage] Encryption failed:', error)
    return null
  }
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData) {
  if (!encryptedData) return null
  
  try {
    const key = getEncryptionKey()
    const encrypted = decodeURIComponent(atob(encryptedData))
    
    let decrypted = ''
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      decrypted += String.fromCharCode(charCode)
    }
    
    // Try to parse as JSON, return string if fails
    try {
      return JSON.parse(decrypted)
    } catch {
      return decrypted
    }
  } catch (error) {
    console.error('[AuthStorage] Decryption failed:', error)
    return null
  }
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const AUTH_STORAGE_KEYS = {
  USER_ID: 'userId',
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  TOKEN_EXPIRY: 'tokenExpiry',
  AUTH_METHOD: 'authMethod',
  USER: 'user',
  SESSION_ID: 'sessionId',
  NOTIFICATIONS: 'user_notifications',
  ACTIVE_PROFILE_ID: 'activeProfileId',
  ACTIVE_PROFILE_NAME: 'activeProfileName',
  PROFILE_CACHE_INVALIDATED: 'profileCacheInvalidated',
  REMEMBER_ME: 'rememberMe',
}

// Keys that should be encrypted
const SENSITIVE_KEYS = [
  AUTH_STORAGE_KEYS.AUTH_TOKEN,
  AUTH_STORAGE_KEYS.REFRESH_TOKEN,
  AUTH_STORAGE_KEYS.SESSION_ID,
]

// ============================================================================
// SECURE STORAGE OPERATIONS
// ============================================================================

/**
 * Securely store a value
 * Automatically encrypts sensitive data
 */
export function secureSet(key, value) {
  try {
    const shouldEncrypt = SENSITIVE_KEYS.includes(key)
    const storedValue = shouldEncrypt ? encryptData(value) : value
    
    if (typeof storedValue === 'object') {
      localStorage.setItem(key, JSON.stringify(storedValue))
    } else {
      localStorage.setItem(key, storedValue)
    }
    return true
  } catch (error) {
    console.error(`[AuthStorage] Failed to set ${key}:`, error)
    return false
  }
}

/**
 * Securely retrieve a value
 * Automatically decrypts sensitive data
 */
export function secureGet(key) {
  try {
    const value = localStorage.getItem(key)
    if (value === null) return null
    
    const shouldDecrypt = SENSITIVE_KEYS.includes(key)
    
    if (shouldDecrypt) {
      return decryptData(value)
    }
    
    // Try to parse as JSON
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  } catch (error) {
    console.error(`[AuthStorage] Failed to get ${key}:`, error)
    return null
  }
}

/**
 * Remove a value from storage
 */
export function secureRemove(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`[AuthStorage] Failed to remove ${key}:`, error)
    return false
  }
}

// ============================================================================
// AUTH STORAGE OPERATIONS
// ============================================================================

/**
 * Clear all authentication storage
 * Single source of truth for auth cleanup
 */
export function clearAuthStorage() {
  // Get current user email before clearing to clean user-specific data
  const storedUser = secureGet(AUTH_STORAGE_KEYS.USER)
  let userEmail = null
  
  if (storedUser) {
    userEmail = storedUser.email || storedUser.id
  }

  // Clear all auth-related keys
  const keysToRemove = [
    AUTH_STORAGE_KEYS.USER_ID,
    AUTH_STORAGE_KEYS.AUTH_TOKEN,
    AUTH_STORAGE_KEYS.REFRESH_TOKEN,
    AUTH_STORAGE_KEYS.TOKEN_EXPIRY,
    AUTH_STORAGE_KEYS.AUTH_METHOD,
    AUTH_STORAGE_KEYS.USER,
    AUTH_STORAGE_KEYS.SESSION_ID,
    AUTH_STORAGE_KEYS.NOTIFICATIONS,
    AUTH_STORAGE_KEYS.ACTIVE_PROFILE_ID,
    AUTH_STORAGE_KEYS.ACTIVE_PROFILE_NAME,
    AUTH_STORAGE_KEYS.PROFILE_CACHE_INVALIDATED,
  ]

  keysToRemove.forEach(key => secureRemove(key))

  // Clear user-specific workspace conversations
  if (userEmail) {
    secureRemove(`workspace_conversations_${userEmail}`)
  }

  // Clear ALL user data from localStorage to prevent data leakage
  try {
    const keysToDelete = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.startsWith('workspace_conversations_') ||
        key.startsWith('notes_') ||
        key.startsWith('user_') ||
        key === 'auth-storage' ||  // Zustand persist storage
        key === 'theme-storage' ||
        key === 'notes-storage' ||
        key === 'payment_listening_state'
      )) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => localStorage.removeItem(key))
  } catch (e) {
    // Ignore errors during cleanup
  }

  console.log('[SECURITY] Auth storage cleared')
}

/**
 * Store user data
 */
export function setUserData(user) {
  if (!user) return false
  
  secureSet(AUTH_STORAGE_KEYS.USER, user)
  
  if (user.userId || user.id) {
    secureSet(AUTH_STORAGE_KEYS.USER_ID, user.userId || user.id)
  }
  
  return true
}

/**
 * Get user data
 */
export function getUserData() {
  return secureGet(AUTH_STORAGE_KEYS.USER)
}

/**
 * Store tokens securely
 */
export function setTokens({ accessToken, refreshToken, expiresIn }) {
  if (accessToken) {
    secureSet(AUTH_STORAGE_KEYS.AUTH_TOKEN, accessToken)
  }
  
  if (refreshToken) {
    secureSet(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
  }
  
  if (expiresIn) {
    const expiryTime = Date.now() + (expiresIn * 1000)
    secureSet(AUTH_STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString())
  }
}

/**
 * Get tokens
 */
export function getTokens() {
  return {
    accessToken: secureGet(AUTH_STORAGE_KEYS.AUTH_TOKEN),
    refreshToken: secureGet(AUTH_STORAGE_KEYS.REFRESH_TOKEN),
    expiry: secureGet(AUTH_STORAGE_KEYS.TOKEN_EXPIRY),
  }
}

/**
 * Clear tokens only
 */
export function clearTokens() {
  secureRemove(AUTH_STORAGE_KEYS.AUTH_TOKEN)
  secureRemove(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
  secureRemove(AUTH_STORAGE_KEYS.TOKEN_EXPIRY)
}

/**
 * Set auth method
 */
export function setAuthMethod(method) {
  secureSet(AUTH_STORAGE_KEYS.AUTH_METHOD, method)
}

/**
 * Get auth method
 */
export function getAuthMethod() {
  return secureGet(AUTH_STORAGE_KEYS.AUTH_METHOD)
}

/**
 * Check if user is potentially authenticated (has stored data)
 */
export function hasStoredAuth() {
  const token = secureGet(AUTH_STORAGE_KEYS.AUTH_TOKEN)
  const method = secureGet(AUTH_STORAGE_KEYS.AUTH_METHOD)
  return !!(token && method)
}

// ============================================================================
// PROFILE STORAGE
// ============================================================================

/**
 * Set active profile
 */
export function setActiveProfile(profileId, profileName) {
  if (profileId) {
    secureSet(AUTH_STORAGE_KEYS.ACTIVE_PROFILE_ID, profileId)
  }
  if (profileName) {
    secureSet(AUTH_STORAGE_KEYS.ACTIVE_PROFILE_NAME, profileName)
  }
}

/**
 * Get active profile
 */
export function getActiveProfile() {
  return {
    id: secureGet(AUTH_STORAGE_KEYS.ACTIVE_PROFILE_ID),
    name: secureGet(AUTH_STORAGE_KEYS.ACTIVE_PROFILE_NAME),
  }
}

/**
 * Clear active profile
 */
export function clearActiveProfile() {
  secureRemove(AUTH_STORAGE_KEYS.ACTIVE_PROFILE_ID)
  secureRemove(AUTH_STORAGE_KEYS.ACTIVE_PROFILE_NAME)
}

// ============================================================================
// MIGRATION UTILITY
// ============================================================================

/**
 * Migrate existing unencrypted tokens to encrypted format
 * Call this once on app startup
 */
export function migrateToSecureStorage() {
  try {
    // Check if migration is needed
    const rawToken = localStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TOKEN)
    if (!rawToken) return
    
    // If token doesn't look encrypted (not base64), encrypt it
    const isEncrypted = /^[A-Za-z0-9+/=]+$/.test(rawToken) && rawToken.length > 100
    
    if (!isEncrypted && rawToken.length < 500) {
      // Likely unencrypted, migrate
      console.log('[AuthStorage] Migrating to secure storage...')
      
      const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
      const sessionId = localStorage.getItem(AUTH_STORAGE_KEYS.SESSION_ID)
      
      // Re-store with encryption
      if (rawToken) secureSet(AUTH_STORAGE_KEYS.AUTH_TOKEN, rawToken)
      if (refreshToken) secureSet(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
      if (sessionId) secureSet(AUTH_STORAGE_KEYS.SESSION_ID, sessionId)
      
      console.log('[AuthStorage] Migration complete')
    }
  } catch (error) {
    console.error('[AuthStorage] Migration failed:', error)
  }
}

export default {
  // Encryption
  encryptData,
  decryptData,
  
  // Secure operations
  secureSet,
  secureGet,
  secureRemove,
  
  // Auth operations
  clearAuthStorage,
  setUserData,
  getUserData,
  setTokens,
  getTokens,
  clearTokens,
  setAuthMethod,
  getAuthMethod,
  hasStoredAuth,
  
  // Profile operations
  setActiveProfile,
  getActiveProfile,
  clearActiveProfile,
  
  // Migration
  migrateToSecureStorage,
  
  // Constants
  AUTH_STORAGE_KEYS,
}
