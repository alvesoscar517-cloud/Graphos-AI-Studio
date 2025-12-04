/**
 * Notification Context - DEPRECATED
 * 
 * This file is kept for backward compatibility only.
 * All functionality has been moved to notificationStore (Zustand).
 * 
 * New code should import from notificationStore directly:
 * import { useNotifications, useNotificationActions } from '@/stores/notificationStore'
 * 
 * @deprecated Use stores/notificationStore.js instead
 */

// Re-export from notificationStore for backward compatibility
export { 
  useNotificationStore,
  useNotifications,
  useUnreadCount,
  useNotificationActions,
} from '../stores/notificationStore'

// Legacy NotificationProvider - now a no-op wrapper
export const NotificationProvider = ({ children }) => children

export default { NotificationProvider }
