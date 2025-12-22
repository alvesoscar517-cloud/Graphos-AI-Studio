/**
 * RxDB Hook for User Profiles (Writing Styles)
 */

import { useMemo } from 'react'
import { useRxCollection, useRxDocument, useRxMutations } from './useRxDB'

/**
 * Get all profiles for a user
 */
export function useProfiles(userId) {
  const selector = useMemo(() => ({ userId }), [userId])

  const { documents, loading, error } = useRxCollection('profiles', {
    selector,
    sort: { updated: 'desc' }
  })

  return { profiles: documents, loading, error }
}

/**
 * Get a single profile by ID
 */
export function useProfile(profileId) {
  const { document, loading, error } = useRxDocument('profiles', profileId)
  return { profile: document, loading, error }
}

/**
 * Get default profile for a user
 */
export function useDefaultProfile(userId) {
  const selector = useMemo(() => ({ 
    userId,
    isDefault: true 
  }), [userId])

  const { documents, loading, error } = useRxCollection('profiles', {
    selector,
    limit: 1
  })

  return { 
    profile: documents.length > 0 ? documents[0] : null, 
    loading, 
    error 
  }
}

/**
 * Profile mutations
 */
export function useProfileMutations() {
  const { insert, update, upsert, remove } = useRxMutations('profiles')

  const createProfile = async (userId, profileData) => {
    return await insert({
      ...profileData,
      userId,
      isDefault: profileData.isDefault || false,
      expertise: profileData.expertise || [],
      key_characteristics: profileData.key_characteristics || [],
      sentence_patterns: profileData.sentence_patterns || []
    })
  }

  const updateProfile = async (profileId, profileData) => {
    return await update(profileId, profileData)
  }

  const saveProfile = async (userId, profileData) => {
    return await upsert({
      ...profileData,
      userId
    })
  }

  const deleteProfile = async (profileId) => {
    return await remove(profileId)
  }

  const setDefaultProfile = async (userId, profileId, allProfiles) => {
    // Unset all other defaults
    for (const profile of allProfiles) {
      if (profile.id !== profileId && profile.isDefault) {
        await update(profile.id, { isDefault: false })
      }
    }
    // Set new default
    return await update(profileId, { isDefault: true })
  }

  return { createProfile, updateProfile, saveProfile, deleteProfile, setDefaultProfile }
}
