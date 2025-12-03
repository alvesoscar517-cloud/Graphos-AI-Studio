/**
 * Notification Badge V2
 * Uses TanStack Query for unread count with real-time updates
 */
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUnreadNotifications } from '@/hooks/queries'
import { queryKeys } from '@/lib/queryKeys'
import realtimeService from '@/services/realtimeService'
import { cn } from '@/lib/utils'

const NotificationBadgeV2 = ({ userId, className }) => {
  const queryClient = useQueryClient()
  const { data: unreadCount = 0 } = useUnreadNotifications()

  // Subscribe to real-time notification updates (SSE connection handled centrally)
  useEffect(() => {
    if (!userId) return

    // Subscribe to notification events (connection managed by NotificationStore)
    const unsubscribe = realtimeService.subscribe('notification', (data) => {
      // Invalidate unread count to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() })
      
      // Also update local storage for offline support
      if (data?.notification) {
        try {
          const stored = localStorage.getItem('user_notifications')
          const notifications = stored ? JSON.parse(stored) : []
          if (!notifications.some((n) => n.id === data.notification.id)) {
            notifications.unshift(data.notification)
            localStorage.setItem('user_notifications', JSON.stringify(notifications))
          }
        } catch (e) {
          // Ignore storage errors
        }
      }
    })

    // Listen for custom events
    const handleNewNotification = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() })
    }
    window.addEventListener('new-notification', handleNewNotification)

    return () => {
      unsubscribe()
      window.removeEventListener('new-notification', handleNewNotification)
    }
  }, [userId, queryClient])

  if (unreadCount === 0) return null

  return (
    <span
      className={cn(
        'absolute -top-0.5 -right-0.5 min-w-[8px] h-2 rounded-full bg-error',
        'shadow-ring-2 shadow-bg-secondary z-10',
        unreadCount > 9 && 'min-w-[16px] px-1 text-[8px] text-white font-bold flex items-center justify-center',
        className
      )}
    >
      {unreadCount > 9 ? '9+' : ''}
    </span>
  )
}

export default NotificationBadgeV2
