/**
 * Profiles Query Hook
 * TanStack Query hook for voice profiles management with real-time updates
 */

import { logger } from '@/utils/logger'
import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { loadProfiles as loadProfilesAPI } from '@/services/api'
import apiClient from '@/services/api/client'
import { getActiveProfile, setActiveProfile as setStorageProfile, clearActiveProfile } from '@/utils/authStorage'
import { useAuthStore } from '@/stores/authStore'

/**
 * Fetch all profiles using TanStack Query with real-time updates
 */
export function useProfilesQuery(options = {}) {
  const queryClient = useQueryClient()
  const unsubscribeRef = useRef(null)
  const hasSetupRealtimeRef = useRef(false)
  
  // Get auth state to refetch when user logs in
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)

  const query = useQuery({
    queryKey: queryKeys.profiles.list(),
    queryFn: async () => {
      const profiles = await loadProfilesAPI()
      return profiles || []
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
    // Only fetch when authenticated and auth is not loading
    enabled: isAuthenticated && !!user && !isLoading,
    ...options,
  })
  
  // Refetch when auth state changes from loading to authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      // Delay to ensure auth is fully ready
      const timer = setTimeout(() => {
        query.refetch()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, user, isLoading])

  // Subscribe to real-time profile updates
  useEffect(() => {
    // Prevent duplicate setup
    if (hasSetupRealtimeRef.current) return
    
    const setupRealtime = async () => {
      try {
        const { default: realtimeService } = await import('@/services/realtimeService')

        // Subscribe to profile events
        unsubscribeRef.current = realtimeService.subscribe('profile', (data) => {
          logger.log('[REALTIME] Profile update received:', data)
          // Invalidate to refetch on any profile change
          if (data.type === 'created' || data.type === 'updated' || data.type === 'deleted') {
            queryClient.invalidateQueries({ queryKey: queryKeys.profiles.list() })
          }
        })
        
        hasSetupRealtimeRef.current = true
      } catch (err) {
        console.warn('Could not setup realtime profile updates:', err.message)
      }
    }

    setupRealtime()

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      hasSetupRealtimeRef.current = false
    }
  }, [queryClient])

  return query
}

/**
 * Fetch single profile detail
 */
export function useProfile(profileId) {
  return useQuery({
    queryKey: queryKeys.profiles.detail(profileId),
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/profiles/${profileId}`)
      return data
    },
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Create new profile
 */
export function useCreateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (profileData) => {
      const { data } = await apiClient.post('/api/profiles', profileData)
      return data
    },
    onSuccess: (newProfile) => {
      // Optimistically add to cache
      queryClient.setQueryData(queryKeys.profiles.list(), (old = []) => {
        return [newProfile, ...old]
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.list() })
    },
  })
}

/**
 * Update profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ profileId, data: profileData }) => {
      const { data } = await apiClient.put(`/api/profiles/${profileId}`, profileData)
      return data
    },
    onSuccess: (updatedProfile, variables) => {
      // Update cache optimistically
      queryClient.setQueryData(queryKeys.profiles.list(), (old = []) => {
        return old.map(p => p.profile_id === variables.profileId ? updatedProfile : p)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(variables.profileId) })
    },
  })
}

/**
 * Delete profile
 */
export function useDeleteProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (profileId) => {
      const { data } = await apiClient.delete(`/api/profiles/${profileId}`)
      return data
    },
    onSuccess: (_, profileId) => {
      // Remove from cache optimistically
      queryClient.setQueryData(queryKeys.profiles.list(), (old = []) => {
        return old.filter(p => p.profile_id !== profileId)
      })
      // Clear active profile if deleted
      try {
        const { id: activeId } = getActiveProfile()
        if (activeId === profileId) {
          clearActiveProfile()
        }
      } catch {
        // Fallback
        const activeId = localStorage.getItem('activeProfileId')
        if (activeId === profileId) {
          localStorage.removeItem('activeProfileId')
          localStorage.removeItem('activeProfileName')
        }
      }
    },
  })
}

/**
 * Hook to get/set active profile from secure storage
 */
export function useActiveProfile() {
  const { data: profiles = [] } = useProfilesQuery()
  
  const getActiveProfileId = () => {
    try {
      return getActiveProfile().id
    } catch {
      return localStorage.getItem('activeProfileId')
    }
  }
  
  const activeProfileId = getActiveProfileId()
  const activeProfile = profiles.find(p => p.profile_id === activeProfileId) || null
  
  const setActiveProfile = (profile) => {
    try {
      if (profile) {
        setStorageProfile(profile.profile_id, profile.profile_name)
      } else {
        clearActiveProfile()
      }
    } catch {
      // Fallback to direct localStorage
      if (profile) {
        localStorage.setItem('activeProfileId', profile.profile_id)
        localStorage.setItem('activeProfileName', profile.profile_name)
      } else {
        localStorage.removeItem('activeProfileId')
        localStorage.removeItem('activeProfileName')
      }
    }
  }
  
  return { activeProfile, setActiveProfile }
}

/**
 * Hook to invalidate profiles cache
 */
export function useInvalidateProfiles() {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all })
  }
}

// Legacy export for backward compatibility
export { useProfilesQuery as useProfiles }

export default useProfilesQuery
