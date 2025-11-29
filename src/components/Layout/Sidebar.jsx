import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useNotes } from '../../contexts/NotesContext'
import { truncateTitleByWords } from '../../utils/titleUtils'
import './Sidebar.css'

// Truncate email to max characters
const truncateEmail = (email, maxLength = 18) => {
  if (!email || email.length <= maxLength) return email
  return email.substring(0, maxLength) + '...'
}
import NotificationPopup from '../Popups/NotificationPopup'
import SettingsPopup from '../Popups/SettingsPopup'
import UserProfilePopup from '../Popups/UserProfilePopup'
import modal from '../../utils/modal'

// Notification Badge Component - Simple Dot
const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const { getUserNotifications } = await import('../../services/notificationService');
        let { unreadCount: apiUnread } = await getUserNotifications(true);
        
        // Also count unread from localStorage (for realtime notifications)
        try {
          const stored = localStorage.getItem('user_notifications');
          if (stored) {
            const localNotifs = JSON.parse(stored);
            const localUnread = localNotifs.filter(n => !n.read).length;
            apiUnread = Math.max(apiUnread, localUnread);
          }
        } catch (e) {
          // Ignore localStorage errors
        }
        
        setUnreadCount(apiUnread);
      } catch (err) {
        console.error('Load unread count error:', err);
        try {
          const stored = localStorage.getItem('user_notifications');
          if (stored) {
            const localNotifs = JSON.parse(stored);
            setUnreadCount(localNotifs.filter(n => !n.read).length);
          }
        } catch (e) {
          // Ignore
        }
      }
    };

    loadUnreadCount();

    const handleNewNotification = () => loadUnreadCount();
    window.addEventListener('new-notification', handleNewNotification);

    // Subscribe to realtime notifications from SSE
    let unsubscribeRealtime = null;
    const setupRealtimeListener = async () => {
      try {
        const realtimeService = (await import('../../services/realtimeService')).default;
        unsubscribeRealtime = realtimeService.subscribe('notification', (data) => {
          console.log('[BELL] Realtime notification received:', data);
          
          if (data?.notification) {
            try {
              const stored = localStorage.getItem('user_notifications');
              const notifications = stored ? JSON.parse(stored) : [];
              const exists = notifications.some(n => n.id === data.notification.id);
              if (!exists) {
                notifications.unshift(data.notification);
                localStorage.setItem('user_notifications', JSON.stringify(notifications));
              }
            } catch (e) {
              console.error('[BELL] Failed to save notification to localStorage:', e);
            }
          }
          
          window.dispatchEvent(new CustomEvent('new-notification', { detail: data }));
          loadUnreadCount();
        });
      } catch (err) {
        console.error('Setup realtime notification listener error:', err);
      }
    };
    setupRealtimeListener();

    const interval = setInterval(loadUnreadCount, 30000);

    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
      if (unsubscribeRealtime) unsubscribeRealtime();
      clearInterval(interval);
    };
  }, []);

  if (unreadCount === 0) return null;

  return <span className="notification-badge" />;
};

const Sidebar = ({ hidden, currentView, onViewChange }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { getVisibleNotes, loadNote, deleteNote, currentNote } = useNotes()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)

  const visibleNotes = getVisibleNotes()

  // Truncate title to max 7 words for display
  const truncateTitle = (title) => {
    return truncateTitleByWords(title, 7)
  }

  const handleNoteClick = (note) => {
    loadNote(note.id)
    onViewChange('aistudio-editor')
  }

  const handleDeleteNote = async (e, noteId) => {
    e.stopPropagation()
    const note = visibleNotes.find(n => n.id === noteId)
    const confirmed = await modal.confirm(
      t('sidebar.confirmDeleteNote', { title: note?.title }),
      t('sidebar.confirmDelete'),
      { confirmText: t('common.delete'), danger: true }
    )
    if (confirmed) {
      deleteNote(noteId)
      modal.toast(t('sidebar.noteDeleted'), '', 'success')
    }
  }

  return (
    <motion.aside 
      className="sidebar"
      initial={false}
      animate={{
        x: hidden ? -238 : 0,
        opacity: hidden ? 0 : 1
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
      drag="x"
      dragConstraints={{ left: -238, right: 0 }}
      dragElastic={0.2}
      dragMomentum={false}
      onDragEnd={(event, info) => {
        // If dragged over 40% width then toggle
        const threshold = 238 * 0.4
        if (info.offset.x < -threshold && !hidden) {
          // Close sidebar if open
          // Note: Need to add callback from parent to toggle
        } else if (info.offset.x > threshold && hidden) {
          // Open sidebar if closed
        }
      }}
      style={{
        pointerEvents: hidden ? 'none' : 'auto'
      }}
    >
      <div className="sidebar-header">
        <h1 className="logo-title">{t('sidebar.appTitle')}</h1>
      </div>

      <nav className="nav">
        <a 
          href="#" 
          className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); onViewChange('home') }}
        >
          <img src="/icon/home.svg" alt={t('nav.home')} />
          <span>{t('nav.home')}</span>
        </a>

        <a 
          href="#" 
          className={`nav-item ${currentView === 'aistudio-editor' && (!currentNote || !visibleNotes.some(n => n.id === currentNote?.id)) ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); onViewChange('aistudio-editor', { createNew: true }) }}
        >
          <img src="/icon/play.svg" alt={t('nav.aiStudio')} />
          <span>{t('nav.aiStudio')}</span>
        </a>

        <a 
          href="#" 
          className={`nav-item ${currentView === 'workspace' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); onViewChange('workspace') }}
        >
          <img src="/icon/message-square.svg" alt={t('nav.aiWorkspace')} />
          <span>{t('nav.aiWorkspace')}</span>
        </a>

        <div className="nav-label">
          <img src="/icon/clock.svg" alt={t('nav.history')} />
          <span>{t('nav.history')}</span>
        </div>

        <div className="nav-section" id="notesList">
          {visibleNotes.map(note => (
            <div 
              key={note.id}
              className={`nav-subitem note-item ${currentNote?.id === note.id && currentView === 'aistudio-editor' ? 'active' : ''}`}
              onClick={() => handleNoteClick(note)}
            >
              <span className="note-item-text">
                {truncateTitle(note.title)}
              </span>
              <button 
                className="delete-note-btn"
                onClick={(e) => handleDeleteNote(e, note.id)}
                data-tooltip={t('common.delete')}
                data-tooltip-position="left"
              >
                <img src="/icon/trash.svg" alt={t('common.delete')} />
              </button>
            </div>
          ))}
        </div>

        <a 
          href="#" 
          className={`view-all ${currentView === 'history' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); onViewChange('history') }}
        >
          {t('nav.viewAllHistory')} →
        </a>
      </nav>

      <div className="sidebar-bottom">
        <div className="footer-info">
          <button 
            className="footer-link notification-btn"
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation();
              setShowSettings(false);
              setShowUserProfile(false);
              setShowNotifications(!showNotifications);
            }}
          >
            <div className="notification-icon-wrapper">
              <img src="/icon/bell.svg" alt={t('nav.notification')} />
              <NotificationBadge />
            </div>
            {t('nav.notification')}
          </button>

          <button 
            className="footer-link"
            onClick={(e) => { 
              e.preventDefault()
              e.stopPropagation()
              setShowNotifications(false)
              setShowUserProfile(false)
              setShowSettings(!showSettings)
            }}
          >
            <img src="/icon/settings.svg" alt={t('nav.settings')} />
            {t('nav.settings')}
          </button>

          <button 
            className="footer-link"
            onClick={(e) => { 
              e.preventDefault()
              e.stopPropagation()
              setShowNotifications(false)
              setShowSettings(false)
              setShowUserProfile(!showUserProfile)
            }}
          >
            <img 
              src={user?.picture || "/icon/user-circle.svg"} 
              alt="User"
              style={user?.picture ? { borderRadius: '50%', width: '20px', height: '20px' } : {}}
            />
            <span title={user?.email}>{truncateEmail(user?.email, 18) || t('common.notLoggedIn')}</span>
          </button>
        </div>
      </div>

      {showNotifications && <NotificationPopup onClose={() => setShowNotifications(false)} onViewChange={onViewChange} />}
      {showSettings && <SettingsPopup onClose={() => setShowSettings(false)} />}
      {showUserProfile && <UserProfilePopup onClose={() => setShowUserProfile(false)} />}
    </motion.aside>
  )
}

export default Sidebar
