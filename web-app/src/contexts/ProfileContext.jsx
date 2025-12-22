/**
 * Profile Context with API
 * 
 * Profile management using backend API.
 * Profiles are stored on server, not locally.
 */

import { logger } from '../utils/logger'
import { createContext, useContext, useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { useAuth } from '../stores/authStore'
import { loadProfiles, deleteProfile as deleteProfileApi } from '../services/api/profile'
import { 
  setActiveProfile as setStorageActiveProfile, 
  getActiveProfile as getStorageActiveProfile,
  clearActiveProfile 
} from '../utils/authStorage'

const ProfileContext = createContext(null)

export const useProfiles = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfiles must be used within ProfileProvider')
  }
  return context
}

export const ProfileProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const prevUserRef = useRef(null)
  
  // Get userId
  const userId = user?.userId || user?.uid || user?.id
  
  // State
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeProfileId, setActiveProfileId] = useState(() => getStorageActiveProfile().id)

  // Load profiles from API
  const fetchProfiles = useCallback(async () => {
    if (!userId || !isAuthenticated) {
      setProfiles([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await loadProfiles()
      setProfiles(data || [])
    } catch (err) {
      logger.error('Profile', 'Failed to load profiles', err)
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }, [userId, isAuthenticated])

  // Load profiles on mount and when user changes
  useEffect(() => {
    const prevUserId = prevUserRef.current
    
    if (prevUserId && prevUserId !== userId) {
      logger.log('[SECURITY] User changed, clearing profile data...')
      setProfiles([])
      setActiveProfileId(null)
      clearActiveProfile()
    }
    
    prevUserRef.current = userId
    
    if (userId && isAuthenticated) {
      fetchProfiles()
    }
  }, [userId, isAuthenticated, fetchProfiles])

  // Get current profile
  const currentProfile = useMemo(() => {
    if (!activeProfileId) return null
    if (profiles.length === 0) {
      const storedProfile = getStorageActiveProfile()
      if (storedProfile.id && storedProfile.name) {
        logger.log('[PROFILE] Using stored profile while loading:', storedProfile.name)
        return {
          profile_id: storedProfile.id,
          profile_name: storedProfile.name,
          _isPlaceholder: true
        }
      }
      return null
    }
    const found = profiles.find(p => p.profile_id === activeProfileId)
    if (!found && activeProfileId) {
      logger.log('[PROFILE] Stored profile not found in list, clearing')
      clearActiveProfile()
      return null
    }
    return found || null
  }, [profiles, activeProfileId])

  // Auto-select default profile
  useEffect(() => {
    if (!activeProfileId && profiles.length > 0) {
      const defaultProfile = profiles.find(p => p.is_default)
      if (defaultProfile) {
        selectProfile(defaultProfile)
      }
    }
  }, [profiles, activeProfileId])

  // Select profile
  const selectProfile = useCallback((profile) => {
    logger.log('[PROFILE] Selecting profile:', profile?.profile_name || 'None')
    
    if (profile) {
      setActiveProfileId(profile.profile_id)
      setStorageActiveProfile(profile.profile_id, profile.profile_name)
    } else {
      setActiveProfileId(null)
      clearActiveProfile()
    }
  }, [])

  // Delete profile
  const deleteProfileById = useCallback(async (profileId) => {
    try {
      const result = await deleteProfileApi(profileId)
      
      if (result.success) {
        // Remove from local state
        setProfiles(prev => prev.filter(p => p.profile_id !== profileId))
        
        if (activeProfileId === profileId) {
          const remainingProfiles = profiles.filter(p => p.profile_id !== profileId)
          if (remainingProfiles.length > 0) {
            selectProfile(remainingProfiles[0])
          } else {
            selectProfile(null)
          }
        }
        
        logger.log('[PROFILE] Deleted profile:', profileId)
      } else {
        logger.error('Profile', 'Failed to delete profile:', result.error)
      }
      
      return result
    } catch (err) {
      logger.error('Profile', 'Failed to delete profile', err)
      return { success: false, error: err.message }
    }
  }, [activeProfileId, profiles, selectProfile])

  const value = {
    // Data
    profiles,
    currentProfile,
    loading,
    
    // Actions
    selectProfile,
    deleteProfile: deleteProfileById,
    refetch: fetchProfiles,
    
    // Aliases for backward compatibility
    setCurrentProfile: selectProfile
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export default ProfileContext
