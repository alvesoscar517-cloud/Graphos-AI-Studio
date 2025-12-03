import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Portal from '../Common/Portal'
import { useNotifications, useNotificationActions } from '../../stores/notificationStore'

export default function NotificationPopup({ onClose, onViewChange }) {
  const { t, i18n } = useTranslation()
  const { notifications, unreadCount, loading } = useNotifications()
  const { markAsRead, markAllAsRead, deleteNotification, handleCtaAction, refresh } = useNotificationActions()
  
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [selectedItemRect, setSelectedItemRect] = useState(null);
  const popupRef = useRef(null);
  const detailPopupRef = useRef(null);

  useEffect(() => {
    // Don't force refresh on open - store handles caching
    // Only refresh if explicitly needed (cache is managed by store)
    
    const handleClickOutside = (e) => {
      if (popupRef.current && popupRef.current.contains(e.target)) {
        return;
      }
      if (e.target.closest('.notification-btn')) {
        return;
      }
      if (e.target.closest('.notif-detail-popup')) {
        return;
      }
      if (detailPopupRef.current && detailPopupRef.current.contains(e.target)) {
        return;
      }
      onClose?.();
    };
    
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
    if (selectedNotif?.id === notificationId) {
      setSelectedNotif(null);
      setSelectedItemRect(null);
    }
  };

  const handleItemClick = (notif, event) => {
    if (!notif.read) handleMarkAsRead(notif.id);
    
    const itemElement = event.currentTarget;
    const rect = itemElement.getBoundingClientRect();
    setSelectedItemRect(rect);
    setSelectedNotif(notif);
  };

  useEffect(() => {
    if (!selectedNotif) return;
    
    const handleClickOutsideDetail = (e) => {
      if (detailPopupRef.current && 
          !detailPopupRef.current.contains(e.target) &&
          !e.target.closest('.notif-item')) {
        setSelectedNotif(null);
        setSelectedItemRect(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutsideDetail);
    return () => document.removeEventListener('mousedown', handleClickOutsideDetail);
  }, [selectedNotif]);

  const handleCtaClick = (notif) => {
    setSelectedNotif(null);
    handleCtaAction(notif, (view) => {
      onClose?.();
      onViewChange?.(view);
    });
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
    const diffMs = now.getTime() - notifTime.getTime();
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
    <Portal>
      <div 
        className="popup notification-popup show" 
        ref={popupRef}
        style={{
          position: 'fixed',
          bottom: '148px',
          left: '12px',
          width: '320px',
          height: '400px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 'var(--z-popup)',
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
            color: 'var(--color-text-primary)'
          }}>
            <span>{t('notifications.notifications')}</span>
            {unreadCount > 0 && (
              <span className="notif-count" style={{
                minWidth: '18px',
                height: '18px',
                padding: '0 5px',
                borderRadius: '9px',
                background: 'var(--color-system-blue)',
                color: '#fff',
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
              onClick={handleMarkAllAsRead}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-system-blue)',
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
                  className={`notif-item ${!notif.read ? 'unread' : ''} ${selectedNotif?.id === notif.id ? 'selected' : ''}`}
                  onClick={(e) => handleItemClick(notif, e)}
                  style={{
                    border: !notif.read ? 'none' : '1px solid var(--color-border-light)',
                    background: selectedNotif?.id === notif.id
                      ? 'var(--color-primary-light)'
                      : !notif.read 
                        ? 'var(--color-primary-light)' 
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
                      background: 'var(--color-system-blue)',
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

      {/* Detail Popup */}
      {selectedNotif && selectedItemRect && (
        <div 
          ref={detailPopupRef}
          className="popup notif-detail-popup"
          style={{
            position: 'fixed',
            bottom: '148px',
            left: '344px',
            width: '400px',
            height: '450px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 'var(--z-popup-submenu)',
            overflow: 'hidden',
            animation: 'notifDetailSlideIn 0.2s ease-out'
          }}
        >
          <div style={{
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0,
            borderBottom: '1px solid var(--color-border-light)'
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                margin: '0 0 4px 0',
                lineHeight: 1.4
              }}>
                {selectedNotif.translations?.[userLang]?.title || 
                 selectedNotif.translations?.en?.title || 
                 t('notifications.notification')}
              </h3>
              <span style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)'
              }}>
                {formatFullTime(selectedNotif.createdAt)}
              </span>
            </div>
            
            <button 
              onClick={() => { setSelectedNotif(null); setSelectedItemRect(null); }}
              style={{
                width: '24px',
                height: '24px',
                border: 'none',
                background: 'transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease',
                flexShrink: 0,
                marginTop: '-2px'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-fill-tertiary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <img src="/icon/x.svg" alt={t('common.close')} style={{ 
                width: '14px', 
                height: '14px', 
                opacity: 0.6
              }} />
            </button>
          </div>

          <div 
            className="notif-detail-body-scroll"
            style={{
              padding: '14px 18px',
              flex: 1,
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {selectedNotif.translations?.[userLang]?.message || 
               selectedNotif.translations?.en?.message || ''}
            </p>
          </div>

          {selectedNotif.translations?.[userLang]?.cta && selectedNotif.ctaAction && (
            <div style={{
              padding: '14px 18px',
              borderTop: '1px solid var(--color-border-light)',
              flexShrink: 0
            }}>
              <button 
                onClick={() => handleCtaClick(selectedNotif)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--color-system-blue)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-system-blue)'}
              >
                {selectedNotif.translations[userLang].cta}
                <img 
                  src="/icon/arrow-right.svg" 
                  alt="" 
                  className="w-3.5 h-3.5 brightness-0 invert" 
                />
              </button>
            </div>
          )}
        </div>
      )}
    </Portal>
  );
}
