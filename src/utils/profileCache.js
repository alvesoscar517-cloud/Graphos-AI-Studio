// Profile cache management
import { logger } from './logger'

let profilesCache = {
  data: null,
  timestamp: null,
  expiryTime: 5 * 60 * 1000 // 5 minutes
}

export function getCachedProfiles() {
  if (!profilesCache.data || !profilesCache.timestamp) {
    return null
  }

  const now = Date.now()
  if (now - profilesCache.timestamp > profilesCache.expiryTime) {
    logger.cache('Profile cache expired')
    return null
  }

  logger.cache('Using cached profiles')
  return profilesCache.data
}

export function setCachedProfiles(profiles) {
  profilesCache.data = profiles
  profilesCache.timestamp = Date.now()
  logger.cache(`Cached ${profiles.length} profiles`)
}

export function clearProfileCache() {
  profilesCache.data = null
  profilesCache.timestamp = null
  logger.cache('Profile cache cleared')
}

// Check if cache should be invalidated (after creating new profile)
export function checkCacheInvalidation() {
  if (localStorage.getItem('profileCacheInvalidated') === 'true') {
    clearProfileCache()
    localStorage.removeItem('profileCacheInvalidated')
    logger.cache('Profile cache invalidated after profile creation')
    return true
  }
  return false
}
