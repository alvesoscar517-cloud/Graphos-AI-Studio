/**
 * Profile Context (Refactored to use TanStack Query)
 * 
 * This context now uses TanStack Query hooks internally for better caching
 * and real-time updates while maintaining backward compatibility.
 * 
 * New code should import directly from '@/hooks/queries/useProfiles'
 */

import { createContext, useContext, useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useProfilesQuery, useCreateProfile, useUpdateProfile, useDeleteProfile } from '../hooks/queries/useProfiles'
import { queryKeys } from '../lib/queryKeys'
import { 
  setActiveProfile as setStorageActiveProfile, 
  getActiveProfile as getStorageActiveProfile,
  clearActiveProfile 
} from '../utils/authStorage'

const ProfileContext = createContext()

export const useProfiles = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfiles must be used within ProfileProvider')
  }
  return context
}

export const ProfileProvider = ({ children }) => {
  const queryClient = useQueryClient()
  
  // Track active profile ID in state to trigger re-renders
  const [activeProfileId, setActiveProfileId] = useState(() => getStorageActiveProfile().id)
  
  // Use TanStack Query for profiles
  const { 
    data: profiles = [], 
    isLoading: loading, 
    refetch 
  } = useProfilesQuery()
  
  // Mutations
  const createProfileMutation = useCreateProfile()
  const updateProfileMutation = useUpdateProfile()
  const deleteProfileMutation = useDeleteProfile()

  // Get current profile from state + profiles array
  const currentProfile = useMemo(() => {
    if (!activeProfileId || profiles.length === 0) return null
    return profiles.find(p => p.profile_id === activeProfileId) || null
  }, [profiles, activeProfileId])

  // Select profile
  const selectProfile = useCallback((profile) => {
    console.log('📌 Selecting profile:', profile?.profile_name || 'None')
    
    if (profile) {
      setStorageActiveProfile(profile.profile_id, profile.profile_name)
      setActiveProfileId(profile.profile_id)
    } else {
      clearActiveProfile()
      setActiveProfileId(null)
    }
  }, [])

  // Load profiles (backward compatible - now just refetches)
  const loadProfiles = useCallback((force = false) => {
    if (force) {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all })
    }
    return refetch()
  }, [queryClient, refetch])

  // Invalidate cache
  const invalidateCache = useCallback(() => {
    console.log('[SYNC] Invalidating profile cache...')
    queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all })
  }, [queryClient])

  // Add profile (backward compatible)
  const addProfile = useCallback(async (profileData) => {
    try {
      const result = await createProfileMutation.mutateAsync(profileData)
      return result
    } catch (error) {
      console.error('[FAIL] Error creating profile:', error)
      throw error
    }
  }, [createProfileMutation])

  // Remove profile (backward compatible)
  const removeProfile = useCallback(async (profileId) => {
    try {
      await deleteProfileMutation.mutateAsync(profileId)
      
      // Clear selection if deleted profile was active
      if (activeProfileId === profileId) {
        clearActiveProfile()
        setActiveProfileId(null)
      }
    } catch (error) {
      console.error('[FAIL] Error deleting profile:', error)
      throw error
    }
  }, [deleteProfileMutation, activeProfileId])

  // Update profile
  const updateProfile = useCallback(async (profileId, data) => {
    try {
      const result = await updateProfileMutation.mutateAsync({ profileId, data })
      return result
    } catch (error) {
      console.error('[FAIL] Error updating profile:', error)
      throw error
    }
  }, [updateProfileMutation])

  const value = useMemo(() => ({
    profiles,
    currentProfile,
    loading,
    loadProfiles,
    selectProfile,
    invalidateCache,
    addProfile,
    removeProfile,
    updateProfile,
    // Expose mutation states for UI feedback
    isCreating: createProfileMutation.isPending,
    isUpdating: updateProfileMutation.isPending,
    isDeleting: deleteProfileMutation.isPending,
  }), [
    profiles,
    currentProfile,
    loading,
    loadProfiles,
    selectProfile,
    invalidateCache,
    addProfile,
    removeProfile,
    updateProfile,
    createProfileMutation.isPending,
    updateProfileMutation.isPending,
    deleteProfileMutation.isPending,
  ])

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}
