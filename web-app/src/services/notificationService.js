/**
 * Notification Service
 * Handles user notifications from backend
 * 
 * Features:
 * - Fetch notifications with pagination
 * - Mark as read/clicked
 * - Delete notifications
 * - CTA action handling
 * - LocalStorage fallback
 */

import { logger } from '../utils/logger';
import apiClient from './api/client';

// Get user ID from auth
const getUserId = () => {
  // Try direct userId first (set by AuthContext)
  const directUserId = localStorage.getItem('userId');
  if (directUserId) {
    return directUserId;
  }
  
  // Fallback to user object
  // Support all user ID formats: userId (email auth), uid (Google), id (legacy)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.userId || user.uid || user.id || user.email || null;
};

/**
 * Get user notifications
 */
export async function getUserNotifications(unreadOnly = false, limit = 50) {
  try {
    const userId = getUserId();
    if (!userId) {
      return getLocalNotifications();
    }

    const params = new URLSearchParams({
      user_id: userId,
      unread_only: unreadOnly.toString(),
      limit: limit.toString()
    });

    const { data } = await apiClient.get(`/api/notifications?${params}`);
    
    return {
      notifications: data.notifications || [],
      unreadCount: data.unreadCount || 0,
      total: data.count || 0
    };
  } catch (error) {
    logger.error('Notification', 'Get notifications failed', error);
    return getLocalNotifications();
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const userId = getUserId();
    if (!userId) return false;

    await apiClient.post(`/api/notifications/${notificationId}/read`, { user_id: userId });
    return true;
  } catch (error) {
    logger.error('Notification', 'Mark as read failed', error);
    markLocalNotificationAsRead(notificationId);
    return false;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  try {
    const userId = getUserId();
    if (!userId) return false;

    await apiClient.post('/api/notifications/mark-all-read', { user_id: userId });
    return true;
  } catch (error) {
    logger.error('Notification', 'Mark all as read failed', error);
    // Fallback to localStorage
    markAllLocalNotificationsAsRead();
    return false;
  }
}

/**
 * Mark notification as clicked (for CTA tracking)
 */
export async function markNotificationAsClicked(notificationId) {
  try {
    const userId = getUserId();
    if (!userId) return false;

    await apiClient.post(`/api/notifications/${notificationId}/click`, { user_id: userId });
    return true;
  } catch (error) {
    logger.error('Notification', 'Mark as clicked failed', error);
    return false;
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId) {
  try {
    const userId = getUserId();
    if (!userId) {
      deleteLocalNotification(notificationId);
      return true;
    }

    await apiClient.delete(`/api/notifications/${notificationId}?user_id=${userId}`);
    return true;
  } catch (error) {
    logger.error('Notification', 'Delete notification failed', error);
    deleteLocalNotification(notificationId);
    return false;
  }
}

/**
 * Handle CTA action
 * Maps admin panel view names to frontend view names
 * @param {Object} notification - Notification object with ctaAction
 * @param {Function} onViewChange - Callback to change view (from parent component)
 */
export function handleCtaAction(notification, onViewChange) {
  const ctaAction = notification.ctaAction;
  if (!ctaAction) return;

  // Mark as clicked for tracking
  markNotificationAsClicked(notification.id);

  switch (ctaAction.type) {
    case 'url':
      if (ctaAction.url) {
        window.open(ctaAction.url, '_blank', 'noopener,noreferrer');
      }
      break;
    
    case 'view':
      if (ctaAction.action && onViewChange) {
        // Map admin panel view names to frontend view names
        const viewMapping = {
          'home': 'home',
          'profiles': 'home', // Profiles are on home page
          'analysis': 'aistudio-editor',
          'rewrite': 'aistudio-editor',
          'history': 'history',
          'settings': 'home', // Settings popup, stay on home
          'upgrade': 'home', // Upgrade modal, stay on home
          'credits': 'credit-history',
          'support': 'home', // Support popup, stay on home
          'workspace': 'workspace',
          'aistudio-editor': 'aistudio-editor',
          'credit-history': 'credit-history'
        };
        
        const mappedView = viewMapping[ctaAction.action] || ctaAction.action;
        onViewChange(mappedView);
      }
      break;
    
    default:
      logger.warn('Notification', `Unknown CTA action type: ${ctaAction.type}`);
  }
}

// ============================================================================
// LOCAL STORAGE FALLBACK
// ============================================================================

function getLocalNotifications() {
  try {
    const stored = localStorage.getItem('user_notifications');
    if (!stored) {
      return { notifications: [], unreadCount: 0, total: 0 };
    }

    const notifications = JSON.parse(stored);
    // Filter expired notifications
    const now = new Date();
    const validNotifications = notifications.filter(n => {
      if (n.expiresAt) {
        return new Date(n.expiresAt) > now;
      }
      return true;
    });
    
    const unreadCount = validNotifications.filter(n => !n.read).length;

    return { notifications: validNotifications, unreadCount, total: validNotifications.length };
  } catch (error) {
    logger.error('Notification', 'Get local notifications failed', error);
    return { notifications: [], unreadCount: 0, total: 0 };
  }
}

function markLocalNotificationAsRead(notificationId) {
  try {
    const stored = localStorage.getItem('user_notifications');
    if (!stored) return;

    const notifications = JSON.parse(stored);
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
    );

    localStorage.setItem('user_notifications', JSON.stringify(updated));
  } catch (error) {
    logger.error('Notification', 'Mark local notification as read failed', error);
  }
}

function markAllLocalNotificationsAsRead() {
  try {
    const stored = localStorage.getItem('user_notifications');
    if (!stored) return;

    const notifications = JSON.parse(stored);
    const now = new Date().toISOString();
    const updated = notifications.map(n => ({ ...n, read: true, readAt: now }));

    localStorage.setItem('user_notifications', JSON.stringify(updated));
  } catch (error) {
    logger.error('Notification', 'Mark all local notifications as read failed', error);
  }
}

function deleteLocalNotification(notificationId) {
  try {
    const stored = localStorage.getItem('user_notifications');
    if (!stored) return;

    const notifications = JSON.parse(stored);
    const updated = notifications.filter(n => n.id !== notificationId);

    localStorage.setItem('user_notifications', JSON.stringify(updated));
  } catch (error) {
    logger.error('Notification', 'Delete local notification failed', error);
  }
}

/**
 * Simulate receiving a notification (for testing)
 */
export function simulateNotification(notification) {
  try {
    const stored = localStorage.getItem('user_notifications');
    const notifications = stored ? JSON.parse(stored) : [];

    const newNotification = {
      id: `notif_${Date.now()}`,
      type: notification.type || 'info',
      priority: notification.priority || 'medium',
      translations: notification.translations || {
        vi: {
          title: notification.title || 'Notification',
          message: notification.message || '',
          cta: notification.cta || ''
        }
      },
      ctaAction: notification.ctaAction || null,
      read: false,
      clicked: false,
      createdAt: new Date().toISOString(),
      expiresAt: notification.expiresAt || null,
      ...notification
    };

    notifications.unshift(newNotification);
    localStorage.setItem('user_notifications', JSON.stringify(notifications));

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('new-notification', {
      detail: newNotification
    }));

    return newNotification;
  } catch (error) {
    logger.error('Notification', 'Simulate notification failed', error);
    return null;
  }
}
