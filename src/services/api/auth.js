import { CONFIG } from '../../utils/config'
import { isDevMode, getDefaultTestUser, devLog } from '../../utils/devConfig'

/**
 * Get user info helper
 * @returns {Promise<{userId: string, email: string, name: string}>}
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
  
  // PRODUCTION: Get real user
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
        console.log('Chrome extension context not available, using localStorage')
      }
    }
  } catch (error) {
    console.error('Error getting user info:', error)
  }
  
  // Fallback to localStorage (for web app mode)
  try {
    let userId = localStorage.getItem('userId')
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
      localStorage.setItem('userId', userId)
    }
    // Use valid email for dev/local mode
    const isDevUser = userId.startsWith('dev_user')
    return {
      userId: userId,
      email: isDevUser ? 'dev.test@example.com' : `${userId}@localhost.dev`,
      name: 'Local User'
    }
  } catch (storageError) {
    // If localStorage also fails, generate temporary ID
    console.warn('localStorage not available, using temporary ID')
    const tempId = 'temp_' + Date.now()
    return {
      userId: tempId,
      email: 'temp.user@localhost.dev',
      name: 'Temporary User'
    }
  }
}
