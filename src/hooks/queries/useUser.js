/**
 * User Query Hooks
 * TanStack Query hooks for user management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import apiClient from '@/services/api/client'

/**
 * Fetch current user info
 */
export function useCurrentUser(options = {}) {
  return useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: async () => {
      const { data } = await apiClient.get('/api/user/me')
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
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
      queryClient.setQueryData(queryKeys.user.sessions(), (old = []) =>
        old.filter((s) => s.id !== sessionId)
      )
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
