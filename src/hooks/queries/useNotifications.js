/**
 * Notifications Query Hook
 * TanStack Query hook for user notifications with Firestore Realtime support
 */

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import apiClient from '@/services/api/client'
import realtimeService from '@/services/realtimeService'

/**
 * Fetch user notifications with Firestore Realtime updates
 */
export function useNotifications(userId) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: async () => {
      const { data } = await apiClient.get('/api/notifications')
      return data.notifications || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - Firestore Realtime handles instant updates
    // No polling - Firestore Realtime handles updates, saves API costs
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  })

  // Subscribe to Firestore Realtime notification updates
  useEffect(() => {
    if (!userId) return

    const unsubscribe = realtimeService.subscribe('notification', (data) => {
      console.log('[REALTIME] Notification update:', data)
      
      // If we received a new notification, add it directly to cache
      if (data.type === 'new' && data.notification) {
        queryClient.setQueryData(queryKeys.notifications.list(), (old) => {
          const oldList = Array.isArray(old) ? old : []
          // Check if notification already exists
          const exists = oldList.some(n => n.id === data.notification.id)
          if (exists) return oldList
          // Add new notification at the beginning
          return [data.notification, ...oldList]
        })
        // Also invalidate unread count
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() })
      } else {
        // Fallback: invalidate to refetch
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      }
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
    staleTime: 5 * 60 * 1000, // 5 minutes - Firestore Realtime handles instant updates
    // No polling - Firestore Realtime handles updates
    refetchOnWindowFocus: true,
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
      queryClient.setQueryData(queryKeys.notifications.list(), (old) => {
        const oldList = Array.isArray(old) ? old : []
        return oldList.map(n => n.id === notificationId ? { ...n, read: true } : n)
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
      queryClient.setQueryData(queryKeys.notifications.list(), (old) => {
        const oldList = Array.isArray(old) ? old : []
        return oldList.map(n => ({ ...n, read: true }))
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
      queryClient.setQueryData(queryKeys.notifications.list(), (old) => {
        const oldList = Array.isArray(old) ? old : []
        return oldList.filter(n => n.id !== notificationId)
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
