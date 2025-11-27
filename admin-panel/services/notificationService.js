/**
 * Notification Service
 * Handles user notifications from backend
 */

const API_BASE_URL = 'https://ai-authenticator-472729326429.us-central1.run.app';

// Get user ID from auth
const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.uid || user.email || null;
};

/**
 * Get user notifications
 */
export async function getUserNotifications(unreadOnly = false) {
  try {
    const userId = getUserId();
    if (!userId) {
      // No user logged in, use localStorage only
      return getLocalNotifications();
    }

    const params = new URLSearchParams({
      user_id: userId,
      unread_only: unreadOnly.toString(),
      limit: '50'
    });

    const response = await fetch(`${API_BASE_URL}/api/notifications?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const data = await response.json();
    return {
      notifications: data.notifications || [],
      unreadCount: data.unreadCount || 0
    };
  } catch (error) {
    console.error('Get notifications error:', error);
    // Fallback to localStorage
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

    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark as read');
    }

    return true;
  } catch (error) {
    console.error('Mark as read error:', error);
    // Fallback to localStorage
    markLocalNotificationAsRead(notificationId);
    return false;
  }
}

/**
 * Mark notification as clicked
 */
export async function markNotificationAsClicked(notificationId) {
  try {
    const userId = getUserId();
    if (!userId) return false;

    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark as clicked');
    }

    return true;
  } catch (error) {
    console.error('Mark as clicked error:', error);
    return false;
  }
}

// ============================================================================
// LOCAL STORAGE FALLBACK
// ============================================================================

function getLocalNotifications() {
  try {
    const stored = localStorage.getItem('user_notifications');
    if (!stored) {
      return { notifications: [], unreadCount: 0 };
    }

    const notifications = JSON.parse(stored);
    const unreadCount = notifications.filter(n => !n.read).length;

    return { notifications, unreadCount };
  } catch (error) {
    console.error('Get local notifications error:', error);
    return { notifications: [], unreadCount: 0 };
  }
}

function markLocalNotificationAsRead(notificationId) {
  try {
    const stored = localStorage.getItem('user_notifications');
    if (!stored) return;

    const notifications = JSON.parse(stored);
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );

    localStorage.setItem('user_notifications', JSON.stringify(updated));
  } catch (error) {
    console.error('Mark local notification as read error:', error);
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
      read: false,
      clicked: false,
      createdAt: new Date().toISOString(),
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
    console.error('Simulate notification error:', error);
    return null;
  }
}
