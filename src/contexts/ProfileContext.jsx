import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loadProfiles as loadProfilesAPI, getUserInfo } from '../services/api'
import { isDevMode, getOrCreateTestProfile, shouldUseTestProfile, devLog } from '../utils/devConfig'
import realtimeService from '../services/realtimeService'

const ProfileContext = createContext()

export const useProfiles = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfiles must be used within ProfileProvider')
  }
  return context
}

export const ProfileProvider = ({ children }) => {
  const [profiles, setProfiles] = useState([])
  const [currentProfile, setCurrentProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastLoaded, setLastLoaded] = useState(null)

  // Load profiles on mount
  useEffect(() => {
    loadProfiles()
  }, [])

  // Subscribe to real-time profile updates via SSE
  useEffect(() => {
    let unsubscribe = null;
    
    const setupRealtimeUpdates = async () => {
      try {
        const userInfo = await getUserInfo();
        if (!userInfo || !userInfo.userId) {
          console.warn('No user info available for realtime updates');
          return;
        }
        
        realtimeService.connect(userInfo.userId);
        
        // Subscribe to profile updates
        unsubscribe = realtimeService.subscribe('profile', (data) => {
          console.log('👤 Profile update via SSE:', data);
          if (data.type === 'created' || data.type === 'updated' || data.type === 'deleted') {
            loadProfiles(true); // Force reload
          }
        });
      } catch (e) {
        console.warn('Could not setup realtime profile updates:', e.message);
      }
    };
    
    setupRealtimeUpdates();
    
    // Fallback: Check localStorage invalidation (for legacy support)
    const checkInvalidation = () => {
      try {
        const invalidated = localStorage.getItem('profileCacheInvalidated')
        if (invalidated === 'true') {
          console.log('🔄 Profile cache invalidated, reloading...')
          loadProfiles(true)
          localStorage.removeItem('profileCacheInvalidated')
        }
      } catch (e) {
        console.error('Error checking cache invalidation:', e.message)
      }
    }
    checkInvalidation()
    
    return () => {
      if (unsubscribe) unsubscribe();
    }
  }, [])

  const loadProfiles = async (force = false) => {
    // Don't reload if already loaded recently (unless forced)
    if (!force && lastLoaded && Date.now() - lastLoaded < 30000) {
      console.log('📦 Using cached profiles (loaded', Math.round((Date.now() - lastLoaded) / 1000), 's ago)')
      return
    }

    setLoading(true)
    try {
      console.log('🔄 Loading profiles from API...')
      
      // DEV MODE: Use test profile if enabled
      if (isDevMode() && shouldUseTestProfile()) {
        devLog('🧪 Dev mode enabled - using test profile')
        try {
          const testProfile = await getOrCreateTestProfile()
          
          if (testProfile) {
            setProfiles([testProfile])
            setLastLoaded(Date.now())
            
            // Auto-select test profile
            devLog('Auto-selecting test profile:', testProfile.profile_name)
            setCurrentProfile(testProfile)
            localStorage.setItem('activeProfileId', testProfile.profile_id)
            localStorage.setItem('activeProfileName', testProfile.profile_name)
            
            setLoading(false)
            return
          }
        } catch (testError) {
          console.error('❌ Error loading test profile:', testError)
          // Continue to production mode if test profile fails
        }
      }
      
      // PRODUCTION: Load from API as normal
      const data = await loadProfilesAPI()
      setProfiles(data)
      setLastLoaded(Date.now())
      
      // Verify current profile still exists
      const activeProfileId = localStorage.getItem('activeProfileId')
      if (activeProfileId) {
        const profile = data.find(p => p.profile_id === activeProfileId)
        if (profile) {
          console.log('✅ Current profile verified:', profile.profile_name)
          setCurrentProfile(profile)
        } else {
          console.warn('⚠️ Current profile not found, clearing...')
          setCurrentProfile(null)
          localStorage.removeItem('activeProfileId')
          localStorage.removeItem('activeProfileName')
        }
      }
      
      console.log(`✅ Loaded ${data.length} profiles`)
    } catch (error) {
      console.error('❌ Error loading profiles:', error)
      // Set empty profiles array to prevent undefined errors
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }

  const selectProfile = (profile) => {
    console.log('📌 Selecting profile:', profile?.profile_name || 'None')
    setCurrentProfile(profile)
    
    if (profile) {
      localStorage.setItem('activeProfileId', profile.profile_id)
      localStorage.setItem('activeProfileName', profile.profile_name)
    } else {
      localStorage.removeItem('activeProfileId')
      localStorage.removeItem('activeProfileName')
    }
  }

  const invalidateCache = () => {
    console.log('🔄 Invalidating profile cache...')
    setLastLoaded(null)
    loadProfiles(true)
  }

  const addProfile = (profile) => {
    setProfiles(prev => [profile, ...prev])
  }

  const removeProfile = (profileId) => {
    setProfiles(prev => prev.filter(p => p.profile_id !== profileId))
    if (currentProfile?.profile_id === profileId) {
      setCurrentProfile(null)
      localStorage.removeItem('activeProfileId')
      localStorage.removeItem('activeProfileName')
    }
  }

  const value = {
    profiles,
    currentProfile,
    loading,
    loadProfiles,
    selectProfile,
    invalidateCache,
    addProfile,
    removeProfile
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}
