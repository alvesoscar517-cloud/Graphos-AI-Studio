/**
 * Auth API Utilities
 * Helper functions for authentication in API calls
 */

import { logger } from '../../utils/logger'
import { isDevMode, getDefaultTestUser, devLog } from '../../utils/devConfig'
import { 
  getUserData, 
  getAuthMethod, 
  secureGet, 
  AUTH_STORAGE_KEYS 
} from '../../utils/authStorage'

/**
 * Get user info helper
 * Returns null if user is not authenticated
 * @returns {Promise<{userId: string, email: string, name: string} | null>}
 */
export async function getUserInfo() {
  // DEV MODE: Use test user
  if (isDevMode()) {
    const testUser = getDefaultTestUser()
    if (testUser) {
      devLog('Using test user:', testUser.email)
      return testUser
    }
  }
  
  // Check for email auth token first (web app mode)
  try {
    const authToken = secureGet(AUTH_STORAGE_KEYS.AUTH_TOKEN)
    const authMethod = getAuthMethod()
    const storedUser = getUserData()
    
    // Debug logging for auth issues
    if (!authToken || !storedUser) {
      logger.log('[AUTH DEBUG] Missing auth data:', {
        hasToken: !!authToken,
        authMethod,
        hasUser: !!storedUser,
        userId: storedUser?.userId || storedUser?.email || 'none'
      })
      
      // If we have token but no user data, auth state is corrupted
      // This can happen if localStorage was partially cleared
      if (authToken && !storedUser && authMethod === 'email') {
        console.warn('[AUTH] Token exists but user data missing - auth state corrupted')
        // Don't trigger session expired here, let the API call fail and handle it
      }
    }
    
    // Relaxed check: if we have storedUser with userId/email, use it
    // This handles cases where authMethod might not be set correctly
    if (storedUser && (storedUser.userId || storedUser.email)) {
      return {
        userId: storedUser.userId || storedUser.email,
        email: storedUser.email,
        name: storedUser.displayName || storedUser.name || 'User'
      }
    }
    
    // Original strict check for backward compatibility
    if (authToken && authMethod === 'email' && storedUser) {
      return {
        userId: storedUser.userId || storedUser.email,
        email: storedUser.email,
        name: storedUser.displayName || storedUser.name || 'User'
      }
    }
  } catch (e) {
    console.error('[AUTH] Error getting user info from storage:', e)
    // Continue to check Chrome extension
  }
  
  // PRODUCTION: Get real user from Chrome extension
  try {
    // Check if running in Chrome extension context
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        const response = /** @type {{ email?: string, name?: string }} */ (
          await chrome.runtime.sendMessage({ action: 'getUserInfo' })
        )
        if (response?.email) {
          return {
            userId: response.email,
            email: response.email,
            name: response.name || 'User'
          }
        }
      } catch (chromeError) {
        logger.log('Chrome extension context not available')
      }
    }
  } catch (error) {
    console.error('Error getting user info:', error)
  }
  
  // Check localStorage userId (legacy support)
  try {
    const userId = secureGet(AUTH_STORAGE_KEYS.USER_ID)
    if (userId) {
      // Only return if it looks like a real user ID (not auto-generated)
      const isRealUser = !userId.startsWith('user_') && !userId.startsWith('temp_')
      if (isRealUser) {
        return {
          userId: userId,
          email: `${userId}@localhost.dev`,
          name: 'Local User'
        }
      }
    }
  } catch (storageError) {
    console.warn('localStorage not available')
  }
  
  // No authenticated user found
  logger.log('[INFO] No authenticated user found')
  return null
}
