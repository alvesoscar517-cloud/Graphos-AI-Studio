import { CONFIG } from '../../utils/config'
import { isDevMode, getDefaultTestUser, devLog } from '../../utils/devConfig'

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
    const authToken = localStorage.getItem('authToken')
    const authMethod = localStorage.getItem('authMethod')
    const storedUser = localStorage.getItem('user')
    
    if (authToken && authMethod === 'email' && storedUser) {
      const user = JSON.parse(storedUser)
      return {
        userId: user.userId || user.email,
        email: user.email,
        name: user.displayName || user.name || 'User'
      }
    }
  } catch (e) {
    // Continue to check Chrome extension
  }
  
  // PRODUCTION: Get real user from Chrome extension
  try {
    // Check if running in Chrome extension context
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        const response = await chrome.runtime.sendMessage({ action: 'getUserInfo' })
        if (response && response.email) {
          return {
            userId: response.email,
            email: response.email,
            name: response.name || 'User'
          }
        }
      } catch (chromeError) {
        console.log('Chrome extension context not available')
      }
    }
  } catch (error) {
    console.error('Error getting user info:', error)
  }
  
  // Check localStorage userId (legacy support)
  try {
    const userId = localStorage.getItem('userId')
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
  console.log('[INFO] No authenticated user found')
  return null
}
