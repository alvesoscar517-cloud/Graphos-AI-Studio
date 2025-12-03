/**
 * Notification Context - Thin Wrapper for Backward Compatibility
 * 
 * IMPORTANT: This context now delegates to notificationStore (Zustand).
 * notificationStore is the SINGLE SOURCE OF TRUTH for notifications.
 * 
 * New code should use notificationStore directly:
 * import { useNotifications, useNotificationActions } from '@/stores/notificationStore'
 * 
 * This context is maintained for backward compatibility with existing components.
 */

import { createContext, useContext, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { 
  useNotificationStore, 
  useNotifications as useNotificationsStore,
  useNotificationActions 
} from '../stores/notificationStore'

const NotificationContext = createContext(null)

/**
 * useNotifications hook - delegates to notificationStore
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

/**
 * Notification Provider - Thin wrapper around notificationStore
 * Initializes notifications on auth and provides context for backward compatibility
 */
export const NotificationProvider = ({ children }) => {
  // Get state from Zustand store
  const { notifications, unreadCount, loading, error } = useNotificationsStore()
  const lastFetch = useNotificationStore((state) => state.lastFetch)
  
  // Get actions from Zustand store
  const actions = useNotificationActions()
  
  // Auth state
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Initialize on auth change
  useEffect(() => {
    if (isAuthenticated && user) {
      const userId = user.uid || user.id || localStorage.getItem('userId')
      if (userId) {
        actions.init(userId)
      }
    } else {
      actions.cleanup()
    }
    
    // Cleanup on unmount
    return () => {
      // Don't cleanup on unmount, only on logout
    }
  }, [isAuthenticated, user])

  // Listen for auth signout event
  useEffect(() => {
    const handleSignout = () => {
      actions.cleanup()
    }
    
    window.addEventListener('auth-signout', handleSignout)
    return () => window.removeEventListener('auth-signout', handleSignout)
  }, [actions])

  // Build context value from store state and actions
  const value = {
    // State
    notifications,
    unreadCount,
    loading,
    error,
    lastFetch,
    
    // Actions
    refresh: actions.refresh,
    markAsRead: actions.markAsRead,
    markAllAsRead: actions.markAllAsRead,
    deleteNotification: actions.deleteNotification,
    markAsClicked: actions.markAsClicked,
    handleCtaAction: actions.handleCtaAction,
    addNotification: actions.addNotification,
    clearCache: actions.cleanup,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationProvider
