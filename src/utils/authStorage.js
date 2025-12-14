import { logger } from './logger'
/**
 * Auth Storage Utility
 * Centralized, secure storage for authentication data
 * 
 * Features:
 * - Token encryption/decryption
 * - Secure storage with obfuscation
 * - Single source of truth for auth storage operations
 * - Uses chrome.storage.local for Chrome Extension (persists across popup closes)
 * - Falls back to localStorage for web app
 * 
 * IMPORTANT: In Chrome Extension, localStorage is cleared when popup closes!
 * We must use chrome.storage.local for persistent data.
 */

// ============================================================================
// CHROME EXTENSION STORAGE WRAPPER
// ============================================================================

/**
 * Check if running in Chrome Extension context
 */
function isChromeExtension() {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local
}

/**
 * In-memory cache for chrome.storage.local data
 * This allows synchronous access while chrome.storage is async
 */
let storageCache = {}
let storageCacheInitialized = false

/**
 * Initialize storage cache from chrome.storage.local
 * Must be called on app startup before any storage operations
 */
export async function initStorageCache() {
  if (!isChromeExtension()) {
    storageCacheInitialized = true
    return
  }
  
  try {
    const result = await chrome.storage.local.get(null) // Get all data
    storageCache = result || {}
    storageCacheInitialized = true
    logger.log('[AuthStorage] Storage cache initialized with', Object.keys(storageCache).length, 'keys')
  } catch (error) {
    logger.error('AuthStorage', 'Failed to initialize storage cache', error)
    storageCacheInitialized = true // Continue anyway
  }
}

/**
 * Get value from storage (sync from cache, async from chrome.storage)
 */
function getFromStorage(key) {
  if (isChromeExtension()) {
    // Return from cache for sync access
    return storageCache[key] ?? null
  }
  return localStorage.getItem(key)
}

/**
 * Set value to storage (updates cache and chrome.storage)
 */
function setToStorage(key, value) {
  if (isChromeExtension()) {
    // Update cache immediately for sync access
    storageCache[key] = value
    // Persist to chrome.storage.local asynchronously
    chrome.storage.local.set({ [key]: value }).catch(err => {
      logger.error('AuthStorage', `Failed to persist ${key} to chrome.storage`, err)
    })
    return true
  }
  localStorage.setItem(key, value)
  return true
}

/**
 * Remove value from storage
 */
function removeFromStorage(key) {
  if (isChromeExtension()) {
    delete storageCache[key]
    chrome.storage.local.remove(key).catch(err => {
      logger.error('AuthStorage', `Failed to remove ${key} from chrome.storage`, err)
    })
    return true
  }
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
  return true
}

// ============================================================================
// STORAGE MODE MANAGEMENT
// ============================================================================

/**
 * Check if Remember Me is enabled
 */
export function isRememberMeEnabled() {
  return getFromStorage('rememberMe') === 'true' || getFromStorage('rememberMe') === true
}

/**
 * Set Remember Me preference
 */
export function setRememberMe(enabled) {
  if (enabled) {
    setToStorage('rememberMe', 'true')
  } else {
    removeFromStorage('rememberMe')
  }
}

// ============================================================================
// REMEMBERED EMAIL (Auto-fill feature like Google, GitHub, Facebook)
// ============================================================================

/**
 * Lưu email để tự động điền khi đăng nhập lại
 * Chỉ lưu khi user tick "Remember me"
 */
export function setRememberedEmail(email) {
  if (email) {
    setToStorage(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL, email)
  }
}

/**
 * Lấy email đã được nhớ để auto-fill vào form đăng nhập
 */
export function getRememberedEmail() {
  return getFromStorage(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL)
}

/**
 * Xóa email đã nhớ (khi user không muốn remember nữa)
 */
export function clearRememberedEmail() {
  removeFromStorage(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL)
}

// ============================================================================
// ENCRYPTION UTILITIES
// ============================================================================

/**
 * Simple encryption key derived from browser fingerprint
 * This provides basic obfuscation - not military-grade encryption
 * but prevents casual inspection of localStorage
 * 
 * IMPORTANT: Key must be STABLE across sessions to decrypt stored tokens
 * - Removed getTimezoneOffset() as it can change with DST
 * - Using only truly stable browser properties
 */
const getEncryptionKey = () => {
  // Use ONLY stable browser properties that don't change between sessions
  // Removed: new Date().getTimezoneOffset() - changes with DST!
  const fingerprint = [
    navigator.userAgent.slice(0, 20),
    navigator.language,
    screen.colorDepth,
    // Use a fixed salt instead of timezone
    'graphos-salt-v1'
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
 * Legacy encryption key for migration
 * Used to decrypt tokens encrypted with old key (with timezone)
 */
const getLegacyEncryptionKey = () => {
  const fingerprint = [
    navigator.userAgent.slice(0, 20),
    navigator.language,
    screen.colorDepth,
    new Date().getTimezoneOffset()
  ].join('|')
  
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
 * Tries new key first, falls back to legacy key for migration
 */
export function decryptData(encryptedData) {
  if (!encryptedData) return null
  
  // Helper to attempt decryption with a specific key
  const tryDecrypt = (key) => {
    try {
      const encrypted = decodeURIComponent(atob(encryptedData))
      
      let decrypted = ''
      for (let i = 0; i < encrypted.length; i++) {
        const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        decrypted += String.fromCharCode(charCode)
      }
      
      // Validate: JWT tokens should contain dots
      if (decrypted && decrypted.includes('.')) {
        return decrypted
      }
      
      // Try to parse as JSON
      try {
        return JSON.parse(decrypted)
      } catch {
        return decrypted
      }
    } catch {
      return null
    }
  }
  
  try {
    // Try with new stable key first
    const result = tryDecrypt(getEncryptionKey())
    if (result) return result
    
    // Fallback: try with legacy key (for tokens encrypted before fix)
    const legacyResult = tryDecrypt(getLegacyEncryptionKey())
    if (legacyResult) {
      logger.log('[AuthStorage] Decrypted with legacy key, will re-encrypt on next save')
      return legacyResult
    }
    
    logger.warn('AuthStorage', 'Token decryption failed with both keys')
    return null
  } catch (error) {
    logger.error('AuthStorage', 'Decryption failed', error)
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
  REMEMBERED_EMAIL: 'rememberedEmail', // Email được nhớ để auto-fill khi đăng nhập lại
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
 * Uses chrome.storage.local for Chrome Extension (persists across popup closes)
 */
export function secureSet(key, value) {
  try {
    const shouldEncrypt = SENSITIVE_KEYS.includes(key)
    const storedValue = shouldEncrypt ? encryptData(value) : value
    
    // For Chrome Extension, always use chrome.storage.local
    // For web app, use localStorage
    if (typeof storedValue === 'object') {
      setToStorage(key, JSON.stringify(storedValue))
    } else {
      setToStorage(key, storedValue)
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
 * Uses chrome.storage.local for Chrome Extension
 */
export function secureGet(key) {
  try {
    let value = getFromStorage(key)
    
    // Fallback: check localStorage/sessionStorage for migration from old storage
    if (value === null && !isChromeExtension()) {
      value = localStorage.getItem(key) || sessionStorage.getItem(key)
    }
    
    if (value === null || value === undefined) {
      if (key === AUTH_STORAGE_KEYS.AUTH_TOKEN) {
        logger.log(`[AuthStorage] secureGet(${key}) - not found`)
      }
      return null
    }
    
    const shouldDecrypt = SENSITIVE_KEYS.includes(key)
    
    if (shouldDecrypt) {
      const decrypted = decryptData(value)
      if (key === AUTH_STORAGE_KEYS.AUTH_TOKEN) {
        logger.log(`[AuthStorage] secureGet(${key}) - found, decrypted: ${!!decrypted}`)
      }
      return decrypted
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
 * Removes from all storages to ensure cleanup
 */
export function secureRemove(key) {
  try {
    removeFromStorage(key)
    // Also clean up old localStorage/sessionStorage if exists
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key)
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(key)
    }
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
 * Clears chrome.storage.local, localStorage and sessionStorage
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

  // Clear ALL user data from localStorage/sessionStorage to prevent data leakage
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
  
  if (typeof localStorage !== 'undefined') {
    clearStorageData(localStorage)
  }
  if (typeof sessionStorage !== 'undefined') {
    clearStorageData(sessionStorage)
  }
  
  // Clear storage cache
  storageCache = {}

  logger.log('[SECURITY] Auth storage cleared')
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
  const rememberMe = isRememberMeEnabled()
  const targetStorage = rememberMe ? 'localStorage' : 'sessionStorage'
  logger.log(`[AuthStorage] setTokens - rememberMe: ${rememberMe}, using: ${targetStorage}`)
  
  if (accessToken) {
    const success = secureSet(AUTH_STORAGE_KEYS.AUTH_TOKEN, accessToken)
    logger.log(`[AuthStorage] setTokens - accessToken stored: ${success}`)
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
 * Migrate existing tokens from localStorage/sessionStorage to chrome.storage.local
 * Also handles encryption migration
 * Call this once on app startup AFTER initStorageCache()
 */
export async function migrateToSecureStorage() {
  try {
    // First, check if we have tokens in old localStorage/sessionStorage
    // and migrate them to chrome.storage.local
    if (isChromeExtension()) {
      const oldLocalToken = localStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TOKEN)
      const oldSessionToken = sessionStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TOKEN)
      const oldToken = oldLocalToken || oldSessionToken
      
      if (oldToken) {
        logger.log('[AuthStorage] Found token in old storage, migrating to chrome.storage.local...')
        
        // Migrate all auth data
        const keysToMigrate = [
          AUTH_STORAGE_KEYS.AUTH_TOKEN,
          AUTH_STORAGE_KEYS.REFRESH_TOKEN,
          AUTH_STORAGE_KEYS.TOKEN_EXPIRY,
          AUTH_STORAGE_KEYS.USER,
          AUTH_STORAGE_KEYS.USER_ID,
          AUTH_STORAGE_KEYS.AUTH_METHOD,
          AUTH_STORAGE_KEYS.SESSION_ID,
          'rememberMe',
          AUTH_STORAGE_KEYS.REMEMBERED_EMAIL,
        ]
        
        for (const key of keysToMigrate) {
          const value = localStorage.getItem(key) || sessionStorage.getItem(key)
          if (value) {
            setToStorage(key, value)
            localStorage.removeItem(key)
            sessionStorage.removeItem(key)
          }
        }
        
        logger.log('[AuthStorage] Migration to chrome.storage.local complete')
      }
    }
    
    // Now check current storage for token
    let rawToken = getFromStorage(AUTH_STORAGE_KEYS.AUTH_TOKEN)
    
    if (!rawToken) return
    
    // If token doesn't look encrypted (not base64), encrypt it
    const isEncrypted = /^[A-Za-z0-9+/=]+$/.test(rawToken) && rawToken.length > 100
    
    if (!isEncrypted && rawToken.length < 500) {
      // Likely unencrypted, migrate
      logger.log('[AuthStorage] Migrating unencrypted tokens to secure storage...')
      
      const refreshToken = getFromStorage(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
      const sessionId = getFromStorage(AUTH_STORAGE_KEYS.SESSION_ID)
      
      // Re-store with encryption
      if (rawToken) secureSet(AUTH_STORAGE_KEYS.AUTH_TOKEN, rawToken)
      if (refreshToken) secureSet(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
      if (sessionId) secureSet(AUTH_STORAGE_KEYS.SESSION_ID, sessionId)
      
      logger.log('[AuthStorage] Encryption migration complete')
    } else if (isEncrypted) {
      // Token is encrypted, try to decrypt and re-encrypt with new key
      const decrypted = decryptData(rawToken)
      if (decrypted && typeof decrypted === 'string' && decrypted.includes('.')) {
        // Successfully decrypted, re-encrypt with new stable key
        const newEncrypted = encryptData(decrypted)
        if (newEncrypted && newEncrypted !== rawToken) {
          logger.log('[AuthStorage] Re-encrypting token with stable key...')
          setToStorage(AUTH_STORAGE_KEYS.AUTH_TOKEN, newEncrypted)
          
          // Also re-encrypt refresh token if exists
          const encryptedRefresh = getFromStorage(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
          if (encryptedRefresh) {
            const decryptedRefresh = decryptData(encryptedRefresh)
            if (decryptedRefresh) {
              const newRefresh = encryptData(decryptedRefresh)
              if (newRefresh) {
                setToStorage(AUTH_STORAGE_KEYS.REFRESH_TOKEN, newRefresh)
              }
            }
          }
        }
      }
    }
    
    // Migrate existing users: if they have tokens but no rememberMe flag,
    // assume they want to be remembered (backward compatibility)
    const hasRememberMeFlag = getFromStorage('rememberMe') !== null
    if (!hasRememberMeFlag && rawToken) {
      logger.log('[AuthStorage] Setting rememberMe=true for existing user (backward compatibility)')
      setToStorage('rememberMe', 'true')
    }
  } catch (error) {
    logger.error('AuthStorage', 'Migration failed', error)
  }
}

export default {
  // Initialization (MUST be called first in Chrome Extension)
  initStorageCache,
  
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
  
  // Remembered Email (auto-fill)
  setRememberedEmail,
  getRememberedEmail,
  clearRememberedEmail,
  
  // Constants
  AUTH_STORAGE_KEYS,
}

