/**
 * Notifications Query Hook
 * TanStack Query hook for user notifications with real-time support
 */

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import apiClient from '@/services/api/client'
import realtimeService from '@/services/realtimeService'

/**
 * Fetch user notifications with real-time updates
 */
export function useNotifications(userId) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: async () => {
      const { data } = await apiClient.get('/api/notifications')
      return data.notifications || []
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })

  // Subscribe to real-time notification updates
  useEffect(() => {
    if (!userId) return

    const unsubscribe = realtimeService.subscribe('notification', (data) => {
      console.log('[REALTIME] Notification update:', data)
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    })

    return () => unsubscribe()
  }, [userId, queryClient])

  return query
}

/**
 * Fetch unread count
 */
export function useUnreadNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: async () => {
      const { data } = await apiClient.get('/api/notifications/unread')
      return data.count || 0
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

/**
 * Mark notification as read with optimistic update
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId) => {
      const { data } = await apiClient.post(`/api/notifications/${notificationId}/read`)
      return data
    },
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() })
      
      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData(queryKeys.notifications.list())
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.notifications.list(), (old = []) => {
        return old.map(n => n.id === notificationId ? { ...n, read: true } : n)
      })
      
      return { previousNotifications }
    },
    onError: (err, notificationId, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.notifications.list(), context.previousNotifications)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() })
    },
  })
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/api/notifications/read-all')
      return data
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() })
      
      const previousNotifications = queryClient.getQueryData(queryKeys.notifications.list())
      
      // Mark all as read optimistically
      queryClient.setQueryData(queryKeys.notifications.list(), (old = []) => {
        return old.map(n => ({ ...n, read: true }))
      })
      
      // Set unread count to 0
      queryClient.setQueryData(queryKeys.notifications.unread(), 0)
      
      return { previousNotifications }
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(queryKeys.notifications.list(), context.previousNotifications)
    },
  })
}

/**
 * Dismiss notification with optimistic update
 */
export function useDismissNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId) => {
      const { data } = await apiClient.delete(`/api/notifications/${notificationId}`)
      return data
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() })
      
      const previousNotifications = queryClient.getQueryData(queryKeys.notifications.list())
      
      // Remove optimistically
      queryClient.setQueryData(queryKeys.notifications.list(), (old = []) => {
        return old.filter(n => n.id !== notificationId)
      })
      
      return { previousNotifications }
    },
    onError: (err, notificationId, context) => {
      queryClient.setQueryData(queryKeys.notifications.list(), context.previousNotifications)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() })
    },
  })
}

export default useNotifications
