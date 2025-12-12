import { logger } from './logger'
/**
 * Auth Storage Utility
 * Centralized, secure storage for authentication data
 * 
 * Features:
 * - Token encryption/decryption
 * - Secure storage with obfuscation
 * - Single source of truth for auth storage operations
 * - SessionStorage when Remember Me is OFF (industry standard)
 * - LocalStorage when Remember Me is ON (persistent across browser sessions)
 */

// ============================================================================
// STORAGE MODE MANAGEMENT
// ============================================================================

/**
 * Get the appropriate storage based on Remember Me preference
 * - Remember Me ON: localStorage (persists across browser sessions)
 * - Remember Me OFF: sessionStorage (cleared when browser closes)
 * 
 * This follows industry standards (Google, GitHub, Facebook)
 */
function getStorage() {
  // Check if Remember Me is enabled
  // Note: REMEMBER_ME flag itself is always in localStorage
  const rememberMe = localStorage.getItem('rememberMe') === 'true'
  return rememberMe ? localStorage : sessionStorage
}

/**
 * Check if Remember Me is enabled
 */
export function isRememberMeEnabled() {
  return localStorage.getItem('rememberMe') === 'true'
}

/**
 * Set Remember Me preference
 * This determines which storage to use for auth data
 */
export function setRememberMe(enabled) {
  if (enabled) {
    localStorage.setItem('rememberMe', 'true')
  } else {
    localStorage.removeItem('rememberMe')
  }
}

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
    logger.error('AuthStorage', 'Encryption failed', error)
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
    logger.error('AuthStorage', 'Decryption failed', error)
    // Token is corrupted - trigger session expired to force re-login
    logger.warn('AuthStorage', 'Token corrupted, user needs to re-login')
    return null
  }
}

/**
 * Check if stored token is valid (can be decrypted)
 * Returns false if token is corrupted
 */
export function isTokenValid() {
  try {
    // Use getStorage() to check the correct storage based on Remember Me preference
    const storage = getStorage()
    let rawToken = storage.getItem(AUTH_STORAGE_KEYS.AUTH_TOKEN)
    
    // Fallback: check the other storage for migration compatibility
    if (!rawToken) {
      const otherStorage = storage === localStorage ? sessionStorage : localStorage
      rawToken = otherStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TOKEN)
    }
    
    if (!rawToken) return false
    
    const decrypted = decryptData(rawToken)
    // Token should be a JWT-like string (contains dots)
    return decrypted && typeof decrypted === 'string' && decrypted.includes('.')
  } catch {
    return false
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

// Keys that should ALWAYS use localStorage (not sensitive, needed for app state)
const PERSISTENT_KEYS = [
  AUTH_STORAGE_KEYS.USER_ID,
  AUTH_STORAGE_KEYS.USER,
  AUTH_STORAGE_KEYS.AUTH_METHOD,
  AUTH_STORAGE_KEYS.ACTIVE_PROFILE_ID,
  AUTH_STORAGE_KEYS.ACTIVE_PROFILE_NAME,
]

/**
 * Securely store a value
 * Automatically encrypts sensitive data
 * Uses sessionStorage or localStorage based on Remember Me preference
 * Exception: USER_ID and USER always use localStorage for app stability
 */
export function secureSet(key, value) {
  try {
    const shouldEncrypt = SENSITIVE_KEYS.includes(key)
    const storedValue = shouldEncrypt ? encryptData(value) : value
    
    // Use localStorage for persistent keys (userId, user data)
    // Use rememberMe-based storage for sensitive tokens
    const storage = PERSISTENT_KEYS.includes(key) ? localStorage : getStorage()
    
    if (typeof storedValue === 'object') {
      storage.setItem(key, JSON.stringify(storedValue))
    } else {
      storage.setItem(key, storedValue)
    }
    return true
  } catch (error) {
    logger.error('AuthStorage', `Failed to set ${key}`, error)
    return false
  }
}

/**
 * Securely retrieve a value
 * Automatically decrypts sensitive data
 * Checks both sessionStorage and localStorage for migration compatibility
 */
export function secureGet(key) {
  try {
    // Use localStorage for persistent keys
    const storage = PERSISTENT_KEYS.includes(key) ? localStorage : getStorage()
    let value = storage.getItem(key)
    
    // Fallback: check the other storage for migration compatibility
    if (value === null) {
      const otherStorage = storage === localStorage ? sessionStorage : localStorage
      value = otherStorage.getItem(key)
    }
    
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
    logger.error('AuthStorage', `Failed to get ${key}`, error)
    return null
  }
}

/**
 * Remove a value from storage
 * Removes from both storages to ensure cleanup
 */
export function secureRemove(key) {
  try {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
    return true
  } catch (error) {
    logger.error('AuthStorage', `Failed to remove ${key}`, error)
    return false
  }
}

// ============================================================================
// AUTH STORAGE OPERATIONS
// ============================================================================

/**
 * Clear all authentication storage
 * Single source of truth for auth cleanup
 * Clears both localStorage and sessionStorage for complete cleanup
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
    AUTH_STORAGE_KEYS.REMEMBER_ME, // Clear Remember Me preference on logout
  ]

  keysToRemove.forEach(key => secureRemove(key))

  // Clear user-specific workspace conversations
  if (userEmail) {
    secureRemove(`workspace_conversations_${userEmail}`)
  }

  // Clear ALL user data from both storages to prevent data leakage
  const clearStorageData = (storage) => {
    try {
      const keysToDelete = []
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
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
      keysToDelete.forEach(key => storage.removeItem(key))
    } catch (e) {
      // Ignore errors during cleanup
    }
  }
  
  clearStorageData(localStorage)
  clearStorageData(sessionStorage)

  logger.log('[SECURITY] Auth storage cleared (both localStorage and sessionStorage)')
}

/**
 * Store user data
 */
export function setUserData(user) {
  if (!user) return false
  
  const success = secureSet(AUTH_STORAGE_KEYS.USER, user)
  
  if (!success) {
    logger.error('AuthStorage', 'Failed to store user data')
    return false
  }
  
  if (user.userId || user.id) {
    secureSet(AUTH_STORAGE_KEYS.USER_ID, user.userId || user.id)
  }
  
  // Verify data was stored correctly
  const stored = secureGet(AUTH_STORAGE_KEYS.USER)
  if (!stored || !stored.userId) {
    logger.error('AuthStorage', 'User data verification failed')
    return false
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
 * Also handles migration between localStorage and sessionStorage based on Remember Me
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
      logger.log('[AuthStorage] Migrating to secure storage...')
      
      const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
      const sessionId = localStorage.getItem(AUTH_STORAGE_KEYS.SESSION_ID)
      
      // Re-store with encryption
      if (rawToken) secureSet(AUTH_STORAGE_KEYS.AUTH_TOKEN, rawToken)
      if (refreshToken) secureSet(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
      if (sessionId) secureSet(AUTH_STORAGE_KEYS.SESSION_ID, sessionId)
      
      logger.log('[AuthStorage] Migration complete')
    }
    
    // Migrate existing users: if they have tokens in localStorage but no rememberMe flag,
    // assume they want to be remembered (backward compatibility)
    const hasRememberMeFlag = localStorage.getItem('rememberMe') !== null
    if (!hasRememberMeFlag && rawToken) {
      logger.log('[AuthStorage] Setting rememberMe=true for existing user (backward compatibility)')
      localStorage.setItem('rememberMe', 'true')
    }
  } catch (error) {
    logger.error('AuthStorage', 'Migration failed', error)
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
  isTokenValid,
  
  // Profile operations
  setActiveProfile,
  getActiveProfile,
  clearActiveProfile,
  
  // Migration
  migrateToSecureStorage,
  
  // Remember Me
  isRememberMeEnabled,
  setRememberMe,
  
  // Constants
  AUTH_STORAGE_KEYS,
}

