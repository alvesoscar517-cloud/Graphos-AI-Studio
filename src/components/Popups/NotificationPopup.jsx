import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Portal from '../Common/Portal'
import { useNotifications, useNotificationActions } from '../../stores/notificationStore'

export default function NotificationPopup({ onClose, onViewChange, autoShowNotification = null }) {
  const { t, i18n } = useTranslation()
  const { notifications, unreadCount, loading } = useNotifications()
  const { markAsRead, markAllAsRead, deleteNotification, handleCtaAction, refresh } = useNotificationActions()
  
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [selectedItemRect, setSelectedItemRect] = useState(null);
  const [showCenteredModal, setShowCenteredModal] = useState(false);
  const popupRef = useRef(null);
  const detailPopupRef = useRef(null);

  // Auto show notification when passed from parent (new notification)
  useEffect(() => {
    if (autoShowNotification) {
      setSelectedNotif(autoShowNotification);
      setShowCenteredModal(true);
    }
  }, [autoShowNotification]);

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
    setSelectedNotif(notif);
    setShowCenteredModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedNotif(null);
    setShowCenteredModal(false);
    setSelectedItemRect(null);
  };

  useEffect(() => {
    if (!selectedNotif || !showCenteredModal) return;
    
    const handleClickOutsideDetail = (e) => {
      if (detailPopupRef.current && 
          !detailPopupRef.current.contains(e.target) &&
          !e.target.closest('.notif-item') &&
          !e.target.closest('.cat-animation-container')) {
        handleCloseDetailModal();
      }
    };
    
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        handleCloseDetailModal();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutsideDetail);
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideDetail);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [selectedNotif, showCenteredModal]);

  const handleCtaClick = (notif) => {
    handleCloseDetailModal();
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
              const isSelected = selectedNotif?.id === notif.id;
              return (
                <div 
                  key={notif.id} 
                  className={`notif-item ${!notif.read ? 'unread' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => handleItemClick(notif, e)}
                  style={{
                    border: '1px solid var(--color-border-light)',
                    background: isSelected ? 'var(--color-fill-tertiary)' : 'transparent'
                  }}
                >
                  <div className={`notif-item-icon ${!notif.read ? 'unread' : ''}`}>
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

      {/* Centered Detail Modal - No overlay */}
      {selectedNotif && showCenteredModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 'var(--z-modal)',
            pointerEvents: 'none'
          }}
        >
          {/* Modal Container */}
          <div 
            style={{
              animation: 'notifModalSlideUp 0.3s ease-out',
              pointerEvents: 'auto'
            }}
          >
            {/* Detail Modal - Fixed size */}
            <div 
              ref={detailPopupRef}
              className="popup notif-detail-popup"
              style={{
                width: '380px',
                height: '500px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: '20px',
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.35), 0 10px 30px rgba(0, 0, 0, 0.2)',
                position: 'relative'
              }}
            >
              {/* Header - compact */}
              <div style={{
                padding: '14px 16px',
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
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    margin: '0 0 4px 0',
                    lineHeight: 1.3
                  }}>
                    {selectedNotif.translations?.[userLang]?.title || 
                     selectedNotif.translations?.en?.title || 
                     t('notifications.notification')}
                  </h3>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--color-text-tertiary)'
                  }}>
                    {formatFullTime(selectedNotif.createdAt)}
                  </span>
                </div>
                
                <button 
                  onClick={handleCloseDetailModal}
                  className="notif-modal-close-btn"
                  style={{
                    width: '28px',
                    height: '28px',
                    border: '1px solid var(--color-border-light)',
                    background: 'var(--color-fill-tertiary)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--color-fill-secondary)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--color-fill-tertiary)';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = 'var(--color-border-light)';
                  }}
                >
                  <img src="/icon/x.svg" alt={t('common.close')} className="icon-invert" style={{ 
                    width: '14px', 
                    height: '14px',
                    opacity: 0.6
                  }} />
                </button>
              </div>

              {/* Body - Fixed height with scroll */}
              <div 
                className="notif-detail-body-scroll"
                style={{
                  padding: '16px',
                  flex: 1,
                  overflowY: 'auto',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                <p style={{
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.7,
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedNotif.translations?.[userLang]?.message || 
                   selectedNotif.translations?.en?.message || ''}
                </p>
              </div>

              {/* CTA Button */}
              {selectedNotif.translations?.[userLang]?.cta && selectedNotif.ctaAction && (
                <div style={{
                  padding: '14px 16px',
                  borderTop: '1px solid var(--color-border-light)',
                  flexShrink: 0
                }}>
                  <button 
                    onClick={() => handleCtaClick(selectedNotif)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'var(--color-system-blue)',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--color-primary-hover)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--color-system-blue)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
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
          </div>
        </div>
      )}
    </Portal>
  );
}
