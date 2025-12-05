/**
 * User Query Hooks
 * TanStack Query hooks for user management with Firestore Realtime updates
 */

import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import apiClient from '@/services/api/client'

/**
 * Fetch current user info with Firestore Realtime updates
 * Listens for profile changes (locked status, settings)
 */
export function useCurrentUser(options = {}) {
  const queryClient = useQueryClient()
  const unsubscribeRef = useRef(null)

  const query = useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: async () => {
      const { data } = await apiClient.get('/api/user/me')
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - Firestore handles instant updates
    ...options,
  })

  // Subscribe to Firestore Realtime user profile updates
  useEffect(() => {
    const setupRealtime = async () => {
      try {
        const { default: realtimeService } = await import('@/services/realtimeService')

        unsubscribeRef.current = realtimeService.subscribe('userProfile', (data) => {
          console.log('[REALTIME] User profile update:', data)
          if (data.type === 'updated' && data.profile) {
            // Update cache with new profile data
            queryClient.setQueryData(queryKeys.user.current(), (old) => {
              if (!old || typeof old !== 'object') return old
              return {
                ...old,
                locked: data.profile.locked,
                settings: data.profile.settings,
              }
            })

            // If user is locked, dispatch event for logout handling
            if (data.profile.locked) {
              window.dispatchEvent(
                new CustomEvent('user-locked', {
                  detail: { reason: data.profile.lockReason },
                })
              )
            }
          }
        })
      } catch (err) {
        console.warn('Could not setup realtime user profile updates:', err.message)
      }
    }

    setupRealtime()

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [queryClient])

  return query
}

/**
 * Update user profile
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData) => {
      const { data } = await apiClient.put('/api/user/profile', userData)
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.user.current(), data)
    },
  })
}

/**
 * Update user settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings) => {
      const { data } = await apiClient.put('/api/user/settings', settings)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.current() })
    },
  })
}

/**
 * Get user sessions
 */
export function useSessions(options = {}) {
  return useQuery({
    queryKey: queryKeys.user.sessions(),
    queryFn: async () => {
      const { data } = await apiClient.get('/auth/email/sessions')
      return data?.sessions || []
    },
    staleTime: 60 * 1000, // 1 minute
    ...options,
  })
}

/**
 * Revoke a session
 */
export function useRevokeSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId) => {
      await apiClient.delete(`/auth/email/sessions/${sessionId}`)
      return sessionId
    },
    onSuccess: (sessionId) => {
      queryClient.setQueryData(queryKeys.user.sessions(), (old) => {
        const sessions = Array.isArray(old) ? old : []
        return sessions.filter((s) => s.id !== sessionId)
      })
    },
  })
}

/**
 * Revoke all other sessions
 */
export function useRevokeAllSessions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/auth/email/sessions/revoke-others')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.sessions() })
    },
  })
}

export default useCurrentUser
