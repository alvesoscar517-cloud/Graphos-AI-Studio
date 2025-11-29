/**
 * Development Configuration
 * Configuration for development environment to avoid creating new profile each test
 */

export const DEV_CONFIG = {
  // Enable development mode (use default test profile)
  ENABLE_DEV_MODE: false,
  
  // Default test user - simulating Google OAuth login
  DEFAULT_TEST_USER: {
    userId: 'google_oauth_test_12345678901234567890',
    email: 'nguyen.vantest@gmail.com',
    name: 'Nguyễn Văn Test',
    displayName: 'Nguyễn Văn Test',
    photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    emailVerified: true,
    providerId: 'google.com',
    providerData: [{
      providerId: 'google.com',
      uid: '12345678901234567890',
      displayName: 'Nguyễn Văn Test',
      email: 'nguyen.vantest@gmail.com',
      photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
    }],
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    },
    locale: 'vi',
    isAnonymous: false
  },
  
  // Auto select test profile on startup
  AUTO_SELECT_TEST_PROFILE: true,
  
  // Skip profile setup in dev mode
  SKIP_PROFILE_SETUP: false, // Set true if you want to skip completely
  
  // Verbose logging in dev mode
  VERBOSE_LOGGING: true
}

/**
 * Check if in dev mode
 */
export function isDevMode() {
  return import.meta.env.DEV && DEV_CONFIG.ENABLE_DEV_MODE
}

/**
 * Log in dev mode
 */
export function devLog(...args) {
  if (isDevMode() && DEV_CONFIG.VERBOSE_LOGGING) {
    console.log('[DEV]', ...args)
  }
}

/**
 * Get test profile from localStorage
 */
export function getDefaultTestProfile() {
  if (!isDevMode()) return null
  
  // Check if test profile exists in localStorage
  const stored = localStorage.getItem('dev_test_profile')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to parse stored test profile')
    }
  }
  
  return null
}

/**
 * Save test profile to localStorage
 */
export function saveTestProfile(profile) {
  if (!isDevMode()) return
  
  localStorage.setItem('dev_test_profile', JSON.stringify(profile))
  devLog('Saved test profile:', profile.profile_name)
}

/**
 * Clear test profile
 */
export function clearTestProfile() {
  localStorage.removeItem('dev_test_profile')
  devLog('Cleared test profile')
}

/**
 * Get default test user
 */
export function getDefaultTestUser() {
  if (!isDevMode()) return null
  return DEV_CONFIG.DEFAULT_TEST_USER
}

/**
 * Check if should use test profile
 */
export function shouldUseTestProfile() {
  return isDevMode() && DEV_CONFIG.AUTO_SELECT_TEST_PROFILE
}

/**
 * Get or create test profile from localStorage
 */
export async function getOrCreateTestProfile() {
  if (!isDevMode()) return null
  
  // Check localStorage
  const existing = getDefaultTestProfile()
  if (existing) {
    devLog('Using existing test profile:', existing.profile_name)
    return existing
  }
  
  return null
}

/**
 * Reset dev environment
 */
export function resetDevEnvironment() {
  if (!isDevMode()) return
  
  clearTestProfile()
  localStorage.removeItem('activeProfileId')
  localStorage.removeItem('activeProfileName')
  devLog('Dev environment reset')
}
