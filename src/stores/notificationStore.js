/**
 * Notification Store (Zustand)
 * Centralized notification management with caching and real-time sync
 * 
 * Features:
 * - Auto-load notifications on login
 * - Memory + localStorage cache with TTL
 * - SSE real-time sync
 * - Periodic refresh
 * - Optimistic updates
 */

import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import apiClient from '../services/api/client'
import realtimeService from '../services/realtimeService'

// Cache TTL: 10 minutes (reduce API calls)
const CACHE_TTL = 10 * 60 * 1000

// Polling interval when SSE is disconnected: 30 minutes
const FALLBACK_POLLING_INTERVAL = 30 * 60 * 1000

export const useNotificationStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // ========================================================================
        // STATE
        // ========================================================================
        notifications: [],
        unreadCount: 0,
        loading: false,
        lastFetch: null,
        error: null,
        
        // Internal refs (not persisted)
        _refreshInterval: null,
        _sseUnsubscribe: null,
        _initialized: false,

        // ========================================================================
        // INTERNAL HELPERS
        // ========================================================================
        
        _getUserId: () => {
          // Try direct userId first
          const directUserId = localStorage.getItem('userId')
          if (directUserId) return directUserId
          
          // Fallback to user object
          try {
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            return user.uid || user.id || user.email || null
          } catch {
            return null
          }
        },

        _isCacheValid: () => {
          const { lastFetch } = get()
          if (!lastFetch) return false
          return (Date.now() - lastFetch) < CACHE_TTL
        },

        // ========================================================================
        // ACTIONS
        // ========================================================================

        /**
         * Fetch notifications from API
         */
        fetchNotifications: async (force = false) => {
          const userId = get()._getUserId()
          if (!userId) return

          // Check cache validity (unless forced)
          if (!force && get()._isCacheValid()) {
            console.log('[NotificationStore] Using cached data')
            return
          }

          try {
            set({ loading: true, error: null })
            console.log('[NotificationStore] Fetching notifications...')
            
            const params = new URLSearchParams({
              user_id: userId,
              limit: '100'
            })

            const { data } = await apiClient.get(`/api/notifications?${params}`)
            
            const notifications = data.notifications || []
            const unreadCount = data.unreadCount || notifications.filter(n => !n.read).length
            
            set({ 
              notifications, 
              unreadCount, 
              lastFetch: Date.now(),
              loading: false 
            })
            
            console.log('[NotificationStore] Loaded', notifications.length, 'notifications,', unreadCount, 'unread')
          } catch (error) {
            console.error('[NotificationStore] Fetch error:', error)
            set({ error: error.message, loading: false })
          }
        },

        /**
         * Add new notification (from SSE)
         */
        addNotification: (notification) => {
          set((state) => {
            // Check if already exists
            if (state.notifications.some(n => n.id === notification.id)) {
              return state
            }
            
            const notifications = [notification, ...state.notifications]
            const unreadCount = notifications.filter(n => !n.read).length
            
            // Dispatch event for other components (toast, etc.)
            window.dispatchEvent(new CustomEvent('new-notification', {
              detail: { notification }
            }))
            
            return { notifications, unreadCount, lastFetch: Date.now() }
          })
        },

        /**
         * Mark notification as read
         */
        markAsRead: async (notificationId) => {
          const userId = get()._getUserId()
          if (!userId) return false

          // Optimistic update
          set((state) => {
            const notifications = state.notifications.map(n =>
              n.id === notificationId 
                ? { ...n, read: true, readAt: new Date().toISOString() } 
                : n
            )
            return { 
              notifications, 
              unreadCount: notifications.filter(n => !n.read).length 
            }
          })

          try {
            await apiClient.post(`/api/notifications/${notificationId}/read`, { user_id: userId })
            return true
          } catch (error) {
            console.error('[NotificationStore] Mark as read error:', error)
            return false
          }
        },

        /**
         * Mark all notifications as read
         */
        markAllAsRead: async () => {
          const userId = get()._getUserId()
          if (!userId) return false

          // Optimistic update
          const now = new Date().toISOString()
          set((state) => ({
            notifications: state.notifications.map(n => ({ ...n, read: true, readAt: now })),
            unreadCount: 0
          }))

          try {
            await apiClient.post('/api/notifications/mark-all-read', { user_id: userId })
            return true
          } catch (error) {
            console.error('[NotificationStore] Mark all as read error:', error)
            return false
          }
        },

        /**
         * Delete notification
         */
        deleteNotification: async (notificationId) => {
          const userId = get()._getUserId()
          if (!userId) return false

          // Optimistic update
          set((state) => {
            const notifications = state.notifications.filter(n => n.id !== notificationId)
            return { 
              notifications, 
              unreadCount: notifications.filter(n => !n.read).length 
            }
          })

          try {
            await apiClient.delete(`/api/notifications/${notificationId}?user_id=${userId}`)
            return true
          } catch (error) {
            console.error('[NotificationStore] Delete error:', error)
            return false
          }
        },

        /**
         * Mark as clicked (for CTA tracking)
         */
        markAsClicked: async (notificationId) => {
          const userId = get()._getUserId()
          if (!userId) return false

          try {
            await apiClient.post(`/api/notifications/${notificationId}/click`, { user_id: userId })
            return true
          } catch (error) {
            console.error('[NotificationStore] Mark as clicked error:', error)
            return false
          }
        },

        /**
         * Handle CTA action
         */
        handleCtaAction: (notification, onViewChange) => {
          const ctaAction = notification.ctaAction
          if (!ctaAction) return

          // Mark as clicked for tracking
          get().markAsClicked(notification.id)

          switch (ctaAction.type) {
            case 'url':
              if (ctaAction.url) {
                window.open(ctaAction.url, '_blank', 'noopener,noreferrer')
              }
              break
            
            case 'view':
              if (ctaAction.action && onViewChange) {
                onViewChange(ctaAction.action)
              }
              break
            
            default:
              console.warn('[NotificationStore] Unknown CTA action type:', ctaAction.type)
          }
        },

        /**
         * Initialize store - call after auth
         * 
         * Cost optimization:
         * - SSE is primary source for real-time updates (no polling needed when connected)
         * - Fallback polling only when SSE disconnected (every 30 min)
         * - Cache TTL 10 minutes to reduce redundant fetches
         * - Only fetch on visibility change if cache expired
         */
        init: (userId) => {
          if (get()._initialized) return
          
          console.log('[NotificationStore] Initializing...')
          
          // Fetch notifications only if cache is invalid
          if (!get()._isCacheValid()) {
            get().fetchNotifications()
          }
          
          // Setup SSE listener - PRIMARY source for real-time updates
          const unsubscribe = realtimeService.subscribe('notification', (data) => {
            console.log('[NotificationStore] SSE notification received:', data)
            if (data.notification) {
              get().addNotification(data.notification)
            }
          })
          
          // Connect to SSE if not already connected
          if (!realtimeService.isConnected() && userId) {
            realtimeService.connect(userId)
          }
          
          // Setup FALLBACK polling - only when SSE might be disconnected
          // This is a safety net, not the primary update mechanism
          const interval = setInterval(() => {
            // Only poll if SSE is disconnected AND cache is expired
            if (!realtimeService.isConnected() && !get()._isCacheValid()) {
              console.log('[NotificationStore] Fallback polling (SSE disconnected)')
              get().fetchNotifications(true)
            }
          }, FALLBACK_POLLING_INTERVAL)
          
          set({ 
            _sseUnsubscribe: unsubscribe, 
            _refreshInterval: interval,
            _initialized: true 
          })
          
          // Listen for visibility change - only fetch if cache expired
          const handleVisibility = () => {
            if (document.visibilityState === 'visible' && !get()._isCacheValid()) {
              get().fetchNotifications(true)
            }
          }
          document.addEventListener('visibilitychange', handleVisibility)
          
          // Store cleanup function
          set({ _visibilityHandler: handleVisibility })
        },

        /**
         * Cleanup - call on logout
         */
        cleanup: () => {
          const { _refreshInterval, _sseUnsubscribe, _visibilityHandler } = get()
          
          if (_refreshInterval) {
            clearInterval(_refreshInterval)
          }
          
          if (_sseUnsubscribe) {
            _sseUnsubscribe()
          }
          
          if (_visibilityHandler) {
            document.removeEventListener('visibilitychange', _visibilityHandler)
          }
          
          set({ 
            notifications: [],
            unreadCount: 0,
            lastFetch: null,
            error: null,
            _refreshInterval: null,
            _sseUnsubscribe: null,
            _visibilityHandler: null,
            _initialized: false
          })
          
          console.log('[NotificationStore] Cleaned up')
        },

        /**
         * Force refresh
         */
        refresh: () => get().fetchNotifications(true),
      }),
      {
        name: 'notification-storage',
        partialize: (state) => ({
          notifications: state.notifications,
          unreadCount: state.unreadCount,
          lastFetch: state.lastFetch,
        }),
      }
    )
  )
)

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

export const useNotifications = () => useNotificationStore(
  useShallow((state) => ({
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loading,
    error: state.error,
  }))
)

export const useUnreadCount = () => useNotificationStore((state) => state.unreadCount)

export const useNotificationActions = () => useNotificationStore(
  useShallow((state) => ({
    fetchNotifications: state.fetchNotifications,
    addNotification: state.addNotification,
    markAsRead: state.markAsRead,
    markAllAsRead: state.markAllAsRead,
    deleteNotification: state.deleteNotification,
    markAsClicked: state.markAsClicked,
    handleCtaAction: state.handleCtaAction,
    refresh: state.refresh,
    init: state.init,
    cleanup: state.cleanup,
  }))
)

export default useNotificationStore
