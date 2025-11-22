// Profile cache management
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
    console.log('⏰ Profile cache expired')
    return null
  }

  console.log('✅ Using cached profiles')
  return profilesCache.data
}

export function setCachedProfiles(profiles) {
  profilesCache.data = profiles
  profilesCache.timestamp = Date.now()
  console.log('💾 Cached profiles:', profiles.length)
}

export function clearProfileCache() {
  profilesCache.data = null
  profilesCache.timestamp = null
  console.log('🗑️ Profile cache cleared')
}

// Check if cache should be invalidated (after creating new profile)
export function checkCacheInvalidation() {
  if (localStorage.getItem('profileCacheInvalidated') === 'true') {
    clearProfileCache()
    localStorage.removeItem('profileCacheInvalidated')
    console.log('✅ Profile cache invalidated after profile creation')
    return true
  }
  return false
}
