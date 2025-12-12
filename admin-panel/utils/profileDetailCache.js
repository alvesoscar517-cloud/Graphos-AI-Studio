import logger from '../lib/logger'
/**
 * Profile Detail Cache Utility
 * Caches full profile details to avoid repeated API calls
 */

const CACHE_KEY_PREFIX = 'profile_detail_'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get cached profile details
 * @param {string} profileId - Profile ID
 * @returns {object|null} Cached profile or null
 */
export function getCachedProfileDetail(profileId) {
  try {
    const cacheKey = CACHE_KEY_PREFIX + profileId
    const cached = localStorage.getItem(cacheKey)
    
    if (!cached) {
      return null
    }

    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is still valid
    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey)
      return null
    }

    logger.log(`[SUCCESS] Using cached profile detail for: ${profileId}`)
    return data
  } catch (error) {
    console.error('Error reading profile detail cache:', error)
    return null
  }
}

/**
 * Set profile details in cache
 * @param {string} profileId - Profile ID
 * @param {object} profileData - Profile data to cache
 */
export function setCachedProfileDetail(profileId, profileData) {
  try {
    const cacheKey = CACHE_KEY_PREFIX + profileId
    const cacheData = {
      data: profileData,
      timestamp: Date.now()
    }
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    logger.log(`[SAVE] Cached profile detail for: ${profileId}`)
  } catch (error) {
    console.error('Error setting profile detail cache:', error)
  }
}

/**
 * Clear cached profile detail
 * @param {string} profileId - Profile ID
 */
export function clearCachedProfileDetail(profileId) {
  try {
    const cacheKey = CACHE_KEY_PREFIX + profileId
    localStorage.removeItem(cacheKey)
    logger.log(`[TRASH] Cleared cache for profile: ${profileId}`)
  } catch (error) {
    console.error('Error clearing profile detail cache:', error)
  }
}

/**
 * Clear all profile detail caches
 */
export function clearAllProfileDetailCaches() {
  try {
    const keys = Object.keys(localStorage)
    let cleared = 0
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key)
        cleared++
      }
    })
    
    logger.log(`[TRASH] Cleared ${cleared} profile detail caches`)
  } catch (error) {
    console.error('Error clearing all profile detail caches:', error)
  }
}

/**
 * Check if cache should be invalidated (e.g., after profile update)
 * Call this when user creates/updates/deletes a profile
 */
export function invalidateProfileDetailCache(profileId) {
  clearCachedProfileDetail(profileId)
}

/**
 * Get cache info for debugging
 * @param {string} profileId - Profile ID
 * @returns {object|null} Cache info
 */
export function getProfileDetailCacheInfo(profileId) {
  try {
    const cacheKey = CACHE_KEY_PREFIX + profileId
    const cached = localStorage.getItem(cacheKey)
    
    if (!cached) {
      return null
    }

    const { timestamp } = JSON.parse(cached)
    const now = Date.now()
    const age = now - timestamp
    const remaining = CACHE_DURATION - age

    return {
      profileId,
      age: Math.floor(age / 1000), // seconds
      remaining: Math.floor(remaining / 1000), // seconds
      isValid: remaining > 0
    }
  } catch (error) {
    console.error('Error getting cache info:', error)
    return null
  }
}

