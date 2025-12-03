import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useUser } from '../../stores/authStore'
import { useNotes } from '../../contexts/NotesContext'
import { truncateTitleByWords } from '../../utils/titleUtils'
import { cn } from '../../lib/utils'
import Icon from '../Common/Icon'
import NotificationPopup from '../Popups/NotificationPopup'
import SettingsPopup from '../Popups/SettingsPopup'
import UserProfilePopup from '../Popups/UserProfilePopup'
import modal from '../../utils/modal'

const truncateEmail = (email, maxLength = 18) => {
  if (!email || email.length <= maxLength) return email
  return email.substring(0, maxLength) + '...'
}

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const { getUserNotifications } = await import('../../services/notificationService');
        let { unreadCount: apiUnread } = await getUserNotifications(true);
        try {
          const stored = localStorage.getItem('user_notifications');
          if (stored) {
            const localNotifs = JSON.parse(stored);
            apiUnread = Math.max(apiUnread, localNotifs.filter(n => !n.read).length);
          }
        } catch (e) {}
        setUnreadCount(apiUnread);
      } catch (err) {
        try {
          const stored = localStorage.getItem('user_notifications');
          if (stored) setUnreadCount(JSON.parse(stored).filter(n => !n.read).length);
        } catch (e) {}
      }
    };
    loadUnreadCount();
    const handleNewNotification = () => loadUnreadCount();
    window.addEventListener('new-notification', handleNewNotification);
    let unsubscribeRealtime = null;
    (async () => {
      try {
        const realtimeService = (await import('../../services/realtimeService')).default;
        unsubscribeRealtime = realtimeService.subscribe('notification', (data) => {
          if (data?.notification) {
            try {
              const stored = localStorage.getItem('user_notifications');
              const notifications = stored ? JSON.parse(stored) : [];
              if (!notifications.some(n => n.id === data.notification.id)) {
                notifications.unshift(data.notification);
                localStorage.setItem('user_notifications', JSON.stringify(notifications));
              }
            } catch (e) {}
          }
          window.dispatchEvent(new CustomEvent('new-notification', { detail: data }));
          loadUnreadCount();
        });
      } catch (err) {}
    })();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
      if (unsubscribeRealtime) unsubscribeRealtime();
      clearInterval(interval);
    };
  }, []);

  if (unreadCount === 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-error shadow-ring-2 shadow-bg-secondary z-10" />
  );
};


const Sidebar = ({ hidden, currentView, onViewChange, onToggle }) => {
  const { t } = useTranslation()
  const user = useUser() // Use Zustand store directly
  const { getVisibleNotes, loadNote, deleteNote, currentNote } = useNotes()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const visibleNotes = getVisibleNotes()
  const truncateTitle = (title) => truncateTitleByWords(title, 7)

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
      className={cn(
        "bg-bg-tertiary",
        "border-r border-separator",
        "flex flex-col overflow-y-auto overflow-x-hidden scrollbar-thin",
        "h-screen touch-pan-y shrink-0",
        isDragging ? "z-[100] shadow-xl" : "z-sidebar"
      )}
      initial={false}
      animate={{ 
        width: hidden ? 0 : 220,
        opacity: hidden ? 0 : 1,
        x: 0
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
      drag={hidden ? false : "x"}
      dragConstraints={{ left: -220, right: 0 }}
      dragElastic={0.15}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false)
        if (info.offset.x < -80 && !hidden && onToggle) onToggle()
      }}
      style={{ 
        pointerEvents: hidden ? 'none' : 'auto',
        minWidth: isDragging ? 220 : undefined
      }}
    >
      <div className="py-4">
        <h1 className="text-[26px] text-text-primary tracking-tighter leading-tight text-center whitespace-nowrap">
          <span className="font-bold">Graphos</span> <span className="font-normal">AI Studio</span>
        </h1>
      </div>

      <nav className="py-3 px-2 flex-1">
        <a href="#" className={cn(
          "flex items-center gap-3 py-2.5 px-3 rounded-2xl no-underline",
          "text-text-primary text-body cursor-pointer relative my-0.5",
          "transition-all duration-200",
          "focus:outline-none", 
          currentView === 'home' 
            ? "bg-system-blue text-white font-medium" 
            : "hover:bg-fill-tertiary"
        )} onClick={(e) => { e.preventDefault(); onViewChange('home') }}>
          <Icon name="home" alt={t('nav.home')} size="lg" className={currentView === 'home' ? 'brightness-0 invert' : ''} />
          <span>{t('nav.home')}</span>
        </a>

        {(() => {
          const isAIStudioActive = currentView === 'aistudio-editor' && (!currentNote || !visibleNotes.some(n => n.id === currentNote?.id));
          return (
            <a href="#" className={cn(
              "flex items-center gap-3 py-2.5 px-3 rounded-2xl no-underline",
              "text-text-primary text-body cursor-pointer relative my-0.5",
              "transition-all duration-200",
              "focus:outline-none",
              isAIStudioActive 
                ? "bg-system-blue text-white font-medium" 
                : "hover:bg-fill-tertiary"
            )} onClick={(e) => { e.preventDefault(); onViewChange('aistudio-editor', { createNew: true }) }}>
              <Icon name="play" alt={t('nav.aiStudio')} size="lg" className={isAIStudioActive ? 'brightness-0 invert' : ''} />
              <span>{t('nav.aiStudio')}</span>
            </a>
          );
        })()}

        <a href="#" className={cn(
          "flex items-center gap-3 py-2.5 px-3 rounded-2xl no-underline",
          "text-text-primary text-body cursor-pointer relative my-0.5",
          "transition-all duration-200",
          "focus:outline-none", 
          currentView === 'workspace' 
            ? "bg-system-blue text-white font-medium" 
            : "hover:bg-fill-tertiary"
        )} onClick={(e) => { e.preventDefault(); onViewChange('workspace') }}>
          <Icon name="message-square" alt={t('nav.aiWorkspace')} size="lg" className={currentView === 'workspace' ? 'brightness-0 invert' : ''} />
          <span>{t('nav.aiWorkspace')}</span>
        </a>

        <div className="flex items-center gap-3 py-2.5 px-3 mt-1 text-text-secondary text-body">
          <Icon name="clock" alt="History" size="lg" color="muted" />
          <span>History</span>
        </div>

        <div className="mb-0.5 pl-0 bg-transparent" id="notesList">
          {visibleNotes.map(note => (
            <div key={note.id} className={cn(
              "cursor-pointer relative flex items-center justify-between gap-2",
              "py-2.5 px-3 my-0.5 rounded-2xl bg-transparent transition-all duration-200",
              "text-body leading-snug group hover:bg-fill-tertiary",
              currentNote?.id === note.id && currentView === 'aistudio-editor' && "bg-fill-tertiary"
            )} onClick={() => handleNoteClick(note)}>
              <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-body text-text-secondary leading-tight font-normal">
                {truncateTitle(note.title)}
              </span>
              <button className={cn(
                "bg-transparent border-none p-1 cursor-pointer rounded-sm",
                "opacity-0 invisible shrink-0 transition-all duration-150",
                "group-hover:opacity-60 group-hover:visible hover:!opacity-100 hover:bg-fill-secondary"
              )} onClick={(e) => handleDeleteNote(e, note.id)}>
                <Icon name="trash" alt={t('common.delete')} size="sm" />
              </button>
            </div>
          ))}
        </div>

        <a href="#" className={cn(
          "block py-2.5 px-3 text-system-blue text-body no-underline rounded-2xl m-0 font-medium",
          "hover:bg-fill-tertiary focus:outline-none transition-all duration-200",
          currentView === 'history' && "bg-fill-tertiary"
        )} onClick={(e) => { e.preventDefault(); onViewChange('history') }}>
          {t('nav.viewAllHistory')} →
        </a>
      </nav>

      <div className="p-2 overflow-visible">
        <div className="p-0 relative overflow-visible">
          <button className={cn(
            "flex items-center gap-3 py-2.5 px-3 text-text-primary",
            "text-body rounded-2xl relative my-0.5 border-none bg-transparent w-full cursor-pointer",
            "hover:bg-fill-tertiary focus:outline-none transition-all duration-200"
          )} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSettings(false); setShowUserProfile(false); setShowNotifications(!showNotifications); }}>
            <div className="relative flex items-center justify-center">
              <Icon name="bell" alt={t('nav.notification')} size="lg" />
              <NotificationBadge />
            </div>
            {t('nav.notification')}
          </button>

          <button className={cn(
            "flex items-center gap-3 py-2.5 px-3 text-text-primary",
            "text-body rounded-2xl relative my-0.5 border-none bg-transparent w-full cursor-pointer",
            "hover:bg-fill-tertiary focus:outline-none transition-all duration-200"
          )} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowNotifications(false); setShowUserProfile(false); setShowSettings(!showSettings); }}>
            <Icon name="settings" alt={t('nav.settings')} size="lg" />
            {t('nav.settings')}
          </button>

          <button className={cn(
            "flex items-center gap-3 py-2.5 px-3 text-text-primary",
            "text-body rounded-2xl relative my-0.5 border-none bg-transparent w-full cursor-pointer",
            "hover:bg-fill-tertiary focus:outline-none transition-all duration-200"
          )} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowNotifications(false); setShowSettings(false); setShowUserProfile(!showUserProfile); }}>
            {user?.picture ? (
              <img src={user.picture} alt="User" className="w-6 h-6 shrink-0 rounded-full" />
            ) : (
              <Icon name="user-circle" alt="User" size="lg" />
            )}
            <span className="overflow-hidden text-ellipsis whitespace-nowrap" title={user?.email}>
              {truncateEmail(user?.email, 18) || t('common.notLoggedIn')}
            </span>
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
