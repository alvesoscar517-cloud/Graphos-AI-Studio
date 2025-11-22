import { useState, useEffect, useRef } from 'react';
import './NotificationPopup.css';

export default function NotificationPopup({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const popupRef = useRef(null);

  useEffect(() => {
    console.log('🔔 NotificationPopup mounted');
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    
    // Listen for new notifications
    const handleNewNotification = () => {
      loadNotifications();
    };
    window.addEventListener('new-notification', handleNewNotification);
    
    // Click outside to close (with delay to avoid immediate close)
    const handleClickOutside = (e) => {
      // Check if click is outside popup and not on the notification button
      if (popupRef.current && 
          !popupRef.current.contains(e.target) &&
          !e.target.closest('.notification-btn')) {
        onClose?.();
      }
    };
    
    // Add listener with slight delay to avoid immediate trigger
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
      window.removeEventListener('new-notification', handleNewNotification);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const loadNotifications = async () => {
    try {
      // Import notification service
      const { getUserNotifications } = await import('../../services/notificationService');
      
      const { notifications: notifs, unreadCount: unread } = await getUserNotifications();
      console.log('📊 Loaded notifications:', notifs.length, 'Unread:', unread);
      setNotifications(notifs);
      setUnreadCount(unread);
    } catch (err) {
      console.error('Load notifications error:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Import notification service
      const { markNotificationAsRead } = await import('../../services/notificationService');
      
      // Optimistic update
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      setNotifications(updated);
      
      // Update unread count
      const unread = updated.filter(n => !n.read).length;
      setUnreadCount(unread);
      
      // Call API
      await markNotificationAsRead(notificationId);
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Import notification service
      const { markNotificationAsRead } = await import('../../services/notificationService');
      
      // Optimistic update
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
      setUnreadCount(0);
      
      // Call API for each unread notification
      const unreadNotifs = notifications.filter(n => !n.read);
      await Promise.all(unreadNotifs.map(n => markNotificationAsRead(n.id)));
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  };

  const deleteNotification = (notificationId) => {
    // Local delete only (no backend API for delete yet)
    const updated = notifications.filter(n => n.id !== notificationId);
    setNotifications(updated);
    
    // Update localStorage
    localStorage.setItem('user_notifications', JSON.stringify(updated));
    
    // Update unread count
    const unread = updated.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      info: 'info.svg',
      success: 'check-circle.svg',
      warning: 'alert-triangle.svg',
      error: 'x-circle.svg',
      announcement: 'megaphone.svg'
    };
    return icons[type] || 'bell.svg';
  };

  const getNotificationColor = (type) => {
    const colors = {
      info: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      announcement: '#8b5cf6'
    };
    return colors[type] || '#666';
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return notifTime.toLocaleDateString('vi-VN');
  };

  return (
    <div 
      className="notification-popup show" 
      ref={popupRef}
    >
      {/* Header */}
      <div className="notif-header">
        <div className="notif-title">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="notif-count">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            className="notif-mark-all"
            onClick={markAllAsRead}
            title="Mark all as read"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">
            <img src="/icon/inbox.svg" alt="Empty" />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map(notif => {
            const userLang = localStorage.getItem('language') || 'vi';
            const content = notif.translations?.[userLang] || notif.translations?.vi || {};

            return (
              <div 
                key={notif.id} 
                className={`notif-item ${!notif.read ? 'unread' : ''}`}
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                <div className="notif-item-content">
                  <div className="notif-item-header">
                    <span className="notif-item-title">
                      {content.title || 'Notification'}
                    </span>
                    <span className="notif-item-time">
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                  <p className="notif-item-message">
                    {content.message || ''}
                  </p>
                  {content.cta && (
                    <button className="notif-item-cta">
                      {content.cta}
                    </button>
                  )}
                </div>
                {!notif.read && <div className="notif-item-dot" />}
                <button 
                  className="notif-item-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                >
                  <img src="/icon/x.svg" alt="Delete" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
