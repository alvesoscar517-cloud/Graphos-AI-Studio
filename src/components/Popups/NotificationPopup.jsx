import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './NotificationPopup.css';

export default function NotificationPopup({ onClose, onViewChange }) {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const popupRef = useRef(null);

  // Detect dark theme
  const isDark = document.body.classList.contains('dark-theme');

  useEffect(() => {
    loadNotifications();
    
    const interval = setInterval(loadNotifications, 30000);
    
    const handleNewNotification = (event) => {
      if (event?.detail?.notification) {
        const newNotif = event.detail.notification;
        setNotifications(prev => {
          const exists = prev.some(n => n.id === newNotif.id);
          if (exists) return prev;
          const updated = [newNotif, ...prev];
          setUnreadCount(updated.filter(n => !n.read).length);
          return updated;
        });
      } else {
        loadNotifications();
      }
    };
    window.addEventListener('new-notification', handleNewNotification);
    
    const handleClickOutside = (e) => {
      if (popupRef.current && 
          !popupRef.current.contains(e.target) &&
          !e.target.closest('.notification-btn') &&
          !e.target.closest('.notif-detail-overlay')) {
        onClose?.();
      }
    };
    
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
      setLoading(true);
      const { getUserNotifications } = await import('../../services/notificationService');
      let { notifications: notifs, unreadCount: unread } = await getUserNotifications();
      
      try {
        const stored = localStorage.getItem('user_notifications');
        if (stored) {
          const localNotifs = JSON.parse(stored);
          localNotifs.forEach(localNotif => {
            const exists = notifs.some(n => n.id === localNotif.id);
            if (!exists) notifs.push(localNotif);
          });
          notifs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          unread = notifs.filter(n => !n.read).length;
        }
      } catch (e) {}
      
      setNotifications(notifs);
      setUnreadCount(unread);
    } catch (err) {
      try {
        const stored = localStorage.getItem('user_notifications');
        if (stored) {
          const localNotifs = JSON.parse(stored);
          setNotifications(localNotifs);
          setUnreadCount(localNotifs.filter(n => !n.read).length);
        }
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const { markNotificationAsRead } = await import('../../services/notificationService');
      
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
      );
      setNotifications(updated);
      setUnreadCount(updated.filter(n => !n.read).length);
      
      try {
        const stored = localStorage.getItem('user_notifications');
        if (stored) {
          const localNotifs = JSON.parse(stored);
          const updatedLocal = localNotifs.map(n => 
            n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
          );
          localStorage.setItem('user_notifications', JSON.stringify(updatedLocal));
        }
      } catch (e) {}
      
      await markNotificationAsRead(notificationId);
    } catch (err) {}
  };

  const markAllAsRead = async () => {
    try {
      const { markAllNotificationsAsRead } = await import('../../services/notificationService');
      
      const now = new Date().toISOString();
      const updated = notifications.map(n => ({ ...n, read: true, readAt: now }));
      setNotifications(updated);
      setUnreadCount(0);
      
      try {
        const stored = localStorage.getItem('user_notifications');
        if (stored) {
          const localNotifs = JSON.parse(stored);
          const updatedLocal = localNotifs.map(n => ({ ...n, read: true, readAt: now }));
          localStorage.setItem('user_notifications', JSON.stringify(updatedLocal));
        }
      } catch (e) {}
      
      await markAllNotificationsAsRead();
    } catch (err) {}
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    try {
      const { deleteNotification } = await import('../../services/notificationService');
      
      const updated = notifications.filter(n => n.id !== notificationId);
      setNotifications(updated);
      setUnreadCount(updated.filter(n => !n.read).length);
      
      try {
        const stored = localStorage.getItem('user_notifications');
        if (stored) {
          const localNotifs = JSON.parse(stored);
          const updatedLocal = localNotifs.filter(n => n.id !== notificationId);
          localStorage.setItem('user_notifications', JSON.stringify(updatedLocal));
        }
      } catch (e) {}
      
      await deleteNotification(notificationId);
    } catch (err) {}
  };

  const handleItemClick = (notif) => {
    if (!notif.read) markAsRead(notif.id);
    setSelectedNotif(notif);
  };

  const handleCtaClick = async (notif) => {
    try {
      const { handleCtaAction } = await import('../../services/notificationService');
      setSelectedNotif(null);
      handleCtaAction(notif, (view) => {
        onClose?.();
        onViewChange?.(view);
      });
    } catch (err) {}
  };

  const getNotificationIcon = (type) => {
    const icons = {
      info: 'info.svg',
      success: 'check-circle.svg',
      warning: 'alert-triangle.svg',
      error: 'x-circle.svg',
      announcement: 'megaphone.svg'
    };
    return icons[type] || 'info.svg';
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('common.justNow');
    if (diffMins < 60) return t('common.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('common.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
    
    return notifTime.toLocaleDateString();
  };

  const formatFullTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const userLang = i18n.language || 'en';

  return (
    <>
      <div 
        className="notification-popup show" 
        ref={popupRef}
        style={{
          position: 'fixed',
          bottom: '135px',
          left: '20px',
          width: '320px',
          height: '400px',
          background: isDark ? '#2d2d2d' : '#fff',
          border: isDark ? '1px solid #3c4043' : '1px solid #e8eaed',
          borderRadius: '12px',
          boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.5)' : '0 4px 16px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden'
        }}
      >
        <div className="notif-header" style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div className="notif-title" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: 500,
            color: isDark ? '#e3e3e3' : '#202124'
          }}>
            <span>{t('notifications.notifications')}</span>
            {unreadCount > 0 && (
              <span className="notif-count" style={{
                minWidth: '18px',
                height: '18px',
                padding: '0 5px',
                borderRadius: '9px',
                background: isDark ? '#8ab4f8' : '#1967d2',
                color: isDark ? '#1e1e1e' : '#fff',
                fontSize: '11px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>{unreadCount}</span>
            )}
          </div>
          {notifications.length > 0 && (
            <button 
              className="notif-mark-all" 
              onClick={markAllAsRead}
              style={{
                background: 'none',
                border: 'none',
                color: isDark ? '#8ab4f8' : '#1967d2',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 500,
                padding: '4px 8px',
                borderRadius: '4px',
                opacity: unreadCount > 0 ? 1 : 0.5
              }}
              disabled={unreadCount === 0}
            >
              {t('notifications.markAllAsRead')}
            </button>
          )}
        </div>

        <div className="notif-list">
          {loading && notifications.length === 0 ? (
            <div className="notif-loading">
              <div className="notif-spinner"></div>
              <p>{t('common.loading')}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty">
              <img src="/icon/inbox.svg" alt="Empty" />
              <p>{t('notifications.noNotifications')}</p>
            </div>
          ) : (
            notifications.map(notif => {
              const content = notif.translations?.[userLang] || notif.translations?.en || {};
              return (
                <div 
                  key={notif.id} 
                  className={`notif-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => handleItemClick(notif)}
                  style={{
                    border: isDark ? '1px solid #3c4043' : '1px solid #e8eaed',
                    background: !notif.read 
                      ? (isDark ? '#1e3a5f' : '#e8f0fe') 
                      : 'transparent',
                    paddingLeft: !notif.read ? '16px' : '12px'
                  }}
                >
                  {!notif.read && (
                    <div style={{
                      position: 'absolute',
                      left: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '6px',
                      height: '6px',
                      background: isDark ? '#8ab4f8' : '#1967d2',
                      borderRadius: '50%'
                    }} />
                  )}
                  <div className="notif-item-icon">
                    <img src={`/icon/${getNotificationIcon(notif.type)}`} alt={notif.type} />
                  </div>
                  <div className="notif-item-content">
                    <div className="notif-item-title">
                      {content.title || t('notifications.notification')}
                    </div>
                    <p className="notif-item-message">{content.message || ''}</p>
                  </div>
                  <span className="notif-item-time">{formatTime(notif.createdAt)}</span>
                  <button 
                    className="notif-item-delete"
                    onClick={(e) => handleDelete(e, notif.id)}
                    title={t('common.delete')}
                  >
                    <img src="/icon/x.svg" alt={t('common.delete')} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNotif && (
        <div 
          className="notif-detail-overlay" 
          onClick={() => setSelectedNotif(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div 
            className="notif-detail-modal" 
            onClick={e => e.stopPropagation()}
            style={{
              background: isDark ? '#2d2d2d' : '#fff',
              borderRadius: '16px',
              width: '520px',
              height: '400px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.7)' : '0 8px 32px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              border: isDark ? '1px solid #3c4043' : '1px solid #e8eaed'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: isDark ? '1px solid #3c4043' : '1px solid #e8eaed',
              background: isDark ? '#353535' : '#f8f9fa'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: isDark ? '#3c4043' : '#e8eaed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={`/icon/${getNotificationIcon(selectedNotif.type)}`} 
                    alt="" 
                    style={{ width: '18px', height: '18px', opacity: 0.7 }}
                  />
                </div>
                <span style={{
                  fontSize: '13px',
                  color: isDark ? '#9aa0a6' : '#5f6368',
                  textTransform: 'capitalize',
                  fontWeight: 500
                }}>
                  {selectedNotif.type || 'info'}
                </span>
              </div>
              <button 
                onClick={() => setSelectedNotif(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => e.target.style.background = isDark ? '#3c4043' : '#e8eaed'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                <img src="/icon/x.svg" alt={t('common.close')} style={{ width: '16px', height: '16px', opacity: 0.6 }} />
              </button>
            </div>

            {/* Body */}
            <div style={{
              padding: '24px 20px',
              flex: 1,
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }} className="notif-detail-body-scroll">
              {/* Title */}
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: isDark ? '#e3e3e3' : '#202124',
                margin: '0 0 12px 0',
                lineHeight: 1.4
              }}>
                {selectedNotif.translations?.[userLang]?.title || 
                 selectedNotif.translations?.en?.title || 
                 t('notifications.notification')}
              </h3>

              {/* Time badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: isDark ? '#3c4043' : '#f1f3f4',
                borderRadius: '20px',
                marginBottom: '20px'
              }}>
                <img src="/icon/clock.svg" alt="" style={{ width: '14px', height: '14px', opacity: 0.6 }} />
                <span style={{
                  fontSize: '12px',
                  color: isDark ? '#9aa0a6' : '#5f6368'
                }}>
                  {formatFullTime(selectedNotif.createdAt)}
                </span>
              </div>

              {/* Divider */}
              <div style={{
                height: '1px',
                background: isDark ? '#3c4043' : '#e8eaed',
                margin: '0 0 20px 0'
              }} />

              {/* Message */}
              <p style={{
                fontSize: '14px',
                color: isDark ? '#bdc1c6' : '#3c4043',
                lineHeight: 1.7,
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {selectedNotif.translations?.[userLang]?.message || 
                 selectedNotif.translations?.en?.message || ''}
              </p>
            </div>

            {/* Footer with CTA */}
            {selectedNotif.translations?.[userLang]?.cta && selectedNotif.ctaAction && (
              <div style={{
                padding: '16px 20px',
                borderTop: isDark ? '1px solid #3c4043' : '1px solid #e8eaed',
                display: 'flex',
                justifyContent: 'flex-end',
                background: isDark ? '#353535' : '#f8f9fa'
              }}>
                <button 
                  onClick={() => handleCtaClick(selectedNotif)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isDark ? '#8ab4f8' : '#1967d2',
                    color: isDark ? '#1e1e1e' : '#fff',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.15s ease'
                  }}
                >
                  {selectedNotif.translations[userLang].cta}
                  <img src="/icon/arrow-right.svg" alt="" style={{ width: '14px', height: '14px', filter: isDark ? 'brightness(0)' : 'brightness(0) invert(1)' }} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
