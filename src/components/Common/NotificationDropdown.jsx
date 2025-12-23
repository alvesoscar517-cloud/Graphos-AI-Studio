/**
 * Notification Dropdown Component
 * Uses TanStack Query for data fetching with optimistic updates
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  useNotifications, 
  useUnreadNotifications, 
  useMarkAsRead, 
  useMarkAllAsRead,
  useDismissNotification 
} from '@/hooks/queries'
import { useUser } from '@/stores/authStore'
import { SkeletonListItem } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const NotificationDropdown = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const user = useUser() // Use Zustand store directly
  const [filter, setFilter] = useState('all') // 'all' | 'unread'

  // TanStack Query hooks
  const { data: notifications = [], isLoading, error } = useNotifications(user?.id)
  const { data: unreadCount = 0 } = useUnreadNotifications()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const dismissNotification = useDismissNotification()

  // Filter notifications
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  const handleMarkAsRead = (notificationId) => {
    markAsRead.mutate(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate()
  }

  const handleDismiss = (notificationId, e) => {
    e.stopPropagation()
    dismissNotification.mutate(notificationId)
  }

  if (!isOpen) return null

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-300 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-semibold text-gray-900">
          {t('notifications.title', 'Notifications')}
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
            className="text-xs text-system-blue hover:underline disabled:opacity-50"
          >
            {t('notifications.markAllRead', 'Mark all read')}
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex">
        <button
          onClick={() => setFilter('all')}
          className={cn("flex-1 py-2 text-sm font-medium transition-colors",
            filter === 'all' 
              ?"text-system-blue border-b-2 border-system-blue" 
              :"text-gray-500 hover:text-gray-700"
          )}
        >
          {t('notifications.all', 'All')}
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn("flex-1 py-2 text-sm font-medium transition-colors",
            filter === 'unread' 
              ?"text-system-blue border-b-2 border-system-blue" 
              :"text-gray-500 hover:text-gray-700"
          )}
        >
          {t('notifications.unread', 'Unread')}
        </button>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="py-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonListItem key={i} className="border-none" />
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-red-500">
            {t('notifications.error', 'Failed to load notifications')}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            {filter === 'unread' 
              ? t('notifications.noUnread', 'No unread notifications')
              : t('notifications.empty', 'No notifications yet')
            }
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                className={cn("px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50",
                  !notification.read &&"bg-blue-50/50"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    notification.type === 'info' &&"bg-blue-100 text-blue-600",
                    notification.type === 'warning' &&"bg-yellow-100 text-yellow-600",
                    notification.type === 'success' &&"bg-green-100 text-green-600",
                    notification.type === 'error' &&"bg-red-100 text-red-600",
                    !notification.type &&"bg-gray-100 text-gray-600"
                  )}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm",
                      !notification.read ?"font-medium text-gray-900" :"text-gray-700"
                    )}>
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Dismiss button */}
                  <button
                    onClick={(e) => handleDismiss(notification.id, e)}
                    disabled={dismissNotification.isPending}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50">
        <button
          onClick={onClose}
          className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
        >
          {t('notifications.close', 'Close')}
        </button>
      </div>
    </div>
  )
}

export default NotificationDropdown
