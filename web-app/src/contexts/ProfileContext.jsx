/**
 * Profile Context with RxDB
 * 
 * Simplified profile management using RxDB for offline-first data
 * with automatic Firestore sync.
 */

import { logger } from '../utils/logger'
import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react'
import { useAuth } from '../stores/authStore'
import { 
  useProfiles as useProfilesRx, 
  useProfileMutations,
  useRxDBSync 
} from '../db/hooks'
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
  const { user } = useAuth()
  
  // Get userId for RxDB
  const userId = user?.userId || user?.uid || user?.id
  
  // Setup RxDB sync
  useRxDBSync(userId)
  
  // Get profiles from RxDB (reactive)
  const { profiles: rxProfiles, loading: profilesLoading } = useProfilesRx(userId)
  const { createProfile, updateProfile, saveProfile, deleteProfile: removeProfile, setDefaultProfile } = useProfileMutations()
  
  // Track active profile ID
  const [activeProfileId, setActiveProfileId] = useState(() => getStorageActiveProfile().id)

  // Convert RxDB profiles to expected format
  const profiles = useMemo(() => {
    return rxProfiles.map(p => ({
      profile_id: p.id,
      profile_name: p.name,
      writing_style: p.writing_style,
      tone: p.tone,
      expertise: p.expertise,
      vocabulary_preferences: p.vocabulary_preferences,
      key_characteristics: p.key_characteristics,
      sentence_patterns: p.sentence_patterns,
      rewrite_instructions: p.rewrite_instructions,
      isDefault: p.isDefault,
      created: p.created,
      updated: p.updated,
      // Keep original for mutations
      _rxdbDoc: p
    }))
  }, [rxProfiles])

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
      const defaultProfile = profiles.find(p => p.isDefault)
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

  // Create new profile
  const createNewProfile = useCallback(async (profileData) => {
    if (!userId) return null
    
    try {
      const newProfile = await createProfile(userId, {
        name: profileData.profile_name || profileData.name,
        writing_style: profileData.writing_style,
        tone: profileData.tone,
        expertise: profileData.expertise || [],
        vocabulary_preferences: profileData.vocabulary_preferences,
        key_characteristics: profileData.key_characteristics || [],
        sentence_patterns: profileData.sentence_patterns || [],
        rewrite_instructions: profileData.rewrite_instructions,
        isDefault: profileData.isDefault || false
      })
      
      const profileObj = newProfile.toJSON ? newProfile.toJSON() : newProfile
      logger.log('[PROFILE] Created new profile:', profileObj.id)
      
      return {
        profile_id: profileObj.id,
        profile_name: profileObj.name,
        ...profileObj
      }
    } catch (err) {
      logger.error('Profile', 'Failed to create profile', err)
      return null
    }
  }, [userId, createProfile])

  // Update profile
  const updateProfileData = useCallback(async (profileId, updates) => {
    try {
      // Convert from API format to RxDB format
      const rxdbUpdates = {
        name: updates.profile_name || updates.name,
        writing_style: updates.writing_style,
        tone: updates.tone,
        expertise: updates.expertise,
        vocabulary_preferences: updates.vocabulary_preferences,
        key_characteristics: updates.key_characteristics,
        sentence_patterns: updates.sentence_patterns,
        rewrite_instructions: updates.rewrite_instructions,
        isDefault: updates.isDefault
      }
      
      // Remove undefined values
      Object.keys(rxdbUpdates).forEach(key => {
        if (rxdbUpdates[key] === undefined) delete rxdbUpdates[key]
      })
      
      await updateProfile(profileId, rxdbUpdates)
      logger.log('[PROFILE] Updated profile:', profileId)
    } catch (err) {
      logger.error('Profile', 'Failed to update profile', err)
    }
  }, [updateProfile])

  // Delete profile
  const deleteProfileById = useCallback(async (profileId) => {
    try {
      await removeProfile(profileId)
      
      if (activeProfileId === profileId) {
        const remainingProfiles = profiles.filter(p => p.profile_id !== profileId)
        if (remainingProfiles.length > 0) {
          selectProfile(remainingProfiles[0])
        } else {
          selectProfile(null)
        }
      }
      
      logger.log('[PROFILE] Deleted profile:', profileId)
    } catch (err) {
      logger.error('Profile', 'Failed to delete profile', err)
    }
  }, [removeProfile, activeProfileId, profiles, selectProfile])

  // Set as default
  const setAsDefault = useCallback(async (profileId) => {
    try {
      await setDefaultProfile(userId, profileId, rxProfiles)
      logger.log('[PROFILE] Set default profile:', profileId)
    } catch (err) {
      logger.error('Profile', 'Failed to set default profile', err)
    }
  }, [setDefaultProfile, userId, rxProfiles])

  const value = {
    // Data
    profiles,
    currentProfile,
    loading: profilesLoading,
    
    // Actions
    selectProfile,
    createProfile: createNewProfile,
    updateProfile: updateProfileData,
    deleteProfile: deleteProfileById,
    setAsDefault,
    
    // Compatibility
    refetch: () => {}, // RxDB auto-updates
    
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
