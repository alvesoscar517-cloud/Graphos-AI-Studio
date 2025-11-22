import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useNotes } from '../../contexts/NotesContext'
import './Sidebar.css'
import NotificationPopup from '../Popups/NotificationPopup'
import SettingsPopup from '../Popups/SettingsPopup'
import UserProfilePopup from '../Popups/UserProfilePopup'
import modal from '../../utils/modal'

// Notification Badge Component
const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const { getUserNotifications } = await import('../../services/notificationService');
        const { unreadCount } = await getUserNotifications(true);
        setUnreadCount(unreadCount);
      } catch (err) {
        console.error('Load unread count error:', err);
      }
    };

    loadUnreadCount();

    // Listen for new notifications
    const handleNewNotification = () => {
      loadUnreadCount();
    };
    window.addEventListener('new-notification', handleNewNotification);

    // Poll every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);

    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
      clearInterval(interval);
    };
  }, []);

  if (unreadCount === 0) return null;

  return (
    <span className="notification-badge">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
};

const Sidebar = ({ hidden, currentView, onViewChange }) => {
  const { user } = useAuth()
  const { getVisibleNotes, loadNote, deleteNote, currentNote } = useNotes()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)

  const visibleNotes = getVisibleNotes()

  const truncateTitle = (title, maxLength = 25) => {
    if (title.length <= maxLength) return title
    return title.substring(0, maxLength) + '...'
  }

  const handleNoteClick = (note) => {
    loadNote(note.id)
    onViewChange('playground-editor')
  }

  const handleDeleteNote = async (e, noteId) => {
    e.stopPropagation()
    const note = visibleNotes.find(n => n.id === noteId)
    const confirmed = await modal.confirm(
      `Bạn có chắc muốn xóa note "${note?.title}"?`,
      'Xác nhận xóa',
      { confirmText: 'Xóa', danger: true }
    )
    if (confirmed) {
      deleteNote(noteId)
      modal.toast('Đã xóa note', '', 'success')
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
        // Nếu kéo quá 40% width thì toggle
        const threshold = 238 * 0.4
        if (info.offset.x < -threshold && !hidden) {
          // Đóng sidebar nếu đang mở
          // Note: Cần thêm callback từ parent để toggle
        } else if (info.offset.x > threshold && hidden) {
          // Mở sidebar nếu đang đóng
        }
      }}
      style={{
        pointerEvents: hidden ? 'none' : 'auto'
      }}
    >
      <div className="sidebar-header">
        <h1 className="logo-title">AI Content Auth</h1>
      </div>

      <nav className="nav">
        <a 
          href="#" 
          className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); onViewChange('home') }}
        >
          <img src="/icon/home.svg" alt="Home" />
          <span>Home</span>
        </a>

        <a 
          href="#" 
          className={`nav-item ${currentView === 'playground' || currentView === 'playground-default' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); onViewChange('playground') }}
        >
          <img src="/icon/play.svg" alt="Playground" />
          <span>Playground</span>
          <img 
            src="/icon/clock.svg" 
            alt="History" 
            className="history-icon"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onViewChange('history') }}
            data-tooltip="Xem lịch sử"
            data-tooltip-position="right"
          />
        </a>

        <a 
          href="#" 
          className={`nav-item ${currentView === 'workspace' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); onViewChange('workspace') }}
        >
          <img src="/icon/message-square.svg" alt="Workspace" />
          <span>Workspace</span>
          <img 
            src="/icon/clock.svg" 
            alt="History" 
            className="history-icon"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onViewChange('history') }}
            data-tooltip="Xem lịch sử chat"
            data-tooltip-position="right"
          />
        </a>

        <div className="nav-section" id="notesList">
          {visibleNotes.map(note => (
            <div 
              key={note.id}
              className={`nav-subitem note-item ${currentNote?.id === note.id && currentView === 'playground-editor' ? 'active' : ''}`}
              onClick={() => handleNoteClick(note)}
            >
              <span className="note-item-text" title={note.title}>
                {truncateTitle(note.title)}
              </span>
              <button 
                className="delete-note-btn"
                onClick={(e) => handleDeleteNote(e, note.id)}
              >
                <img src="/icon/trash.svg" alt="Delete" />
              </button>
            </div>
          ))}
        </div>

        <a 
          href="#" 
          className={`view-all ${currentView === 'history' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); onViewChange('history') }}
        >
          View all history →
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
              <img src="/icon/bell.svg" alt="Notifications" />
              <NotificationBadge />
            </div>
            Thông báo
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
            <img src="/icon/settings.svg" alt="Settings" />
            Settings
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
            <span>{user?.email || 'Chưa đăng nhập'}</span>
          </button>
        </div>
      </div>

      {showNotifications && <NotificationPopup onClose={() => setShowNotifications(false)} />}
      {showSettings && <SettingsPopup onClose={() => setShowSettings(false)} />}
      {showUserProfile && <UserProfilePopup onClose={() => setShowUserProfile(false)} />}
    </motion.aside>
  )
}

export default Sidebar
