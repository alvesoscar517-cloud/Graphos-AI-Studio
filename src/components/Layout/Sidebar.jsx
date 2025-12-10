import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useUser } from '../../stores/authStore'
import { useNotes } from '../../contexts/NotesContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { useUnreadCount } from '../../stores/notificationStore'
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
  const unreadCount = useUnreadCount()

  if (unreadCount === 0) return null
  return (
    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-error" />
  )
}


const MAX_VISIBLE_ITEMS = 5

const Sidebar = ({ hidden, currentView, onViewChange, onToggle }) => {
  const { t } = useTranslation()
  const user = useUser() // Use Zustand store directly
  const { getVisibleNotes, loadNote, deleteNote, currentNote } = useNotes()
  const { conversations, loadConversation, deleteConversation, currentConversation } = useWorkspace()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const truncateTitle = (title) => truncateTitleByWords(title, 7)

  // Combine notes and conversations into a single list sorted by updated time
  const recentItems = useMemo(() => {
    const visibleNotes = getVisibleNotes()
    
    // Map notes to unified format
    const noteItems = visibleNotes.map(note => ({
      id: note.id,
      title: note.title,
      updated: new Date(note.updated),
      type: 'note', // AI Studio note
      source: 'aistudio'
    }))

    // Map conversations to unified format (only those with content)
    const conversationItems = conversations
      .filter(conv => conv.messages?.length > 0 || (conv.title && conv.title !== 'New Chat'))
      .map(conv => ({
        id: conv.id,
        title: conv.title || 'New Chat',
        updated: new Date(conv.updated || conv.created),
        type: 'chat', // AI Workspace conversation
        source: 'workspace'
      }))

    // Combine and sort by updated time (most recent first)
    const combined = [...noteItems, ...conversationItems]
      .sort((a, b) => b.updated - a.updated)
      .slice(0, MAX_VISIBLE_ITEMS)

    return combined
  }, [getVisibleNotes, conversations])

  const handleItemClick = (item) => {
    if (item.source === 'aistudio') {
      loadNote(item.id)
      onViewChange('aistudio-editor')
    } else if (item.source === 'workspace') {
      loadConversation(item.id)
      onViewChange('workspace')
    }
  }

  const handleDeleteItem = async (e, item) => {
    e.stopPropagation()
    const confirmed = await modal.confirm(
      t('sidebar.confirmDeleteNote', { title: item.title }),
      t('sidebar.confirmDelete'),
      { confirmText: t('common.delete'), danger: true }
    )
    if (confirmed) {
      if (item.source === 'aistudio') {
        deleteNote(item.id)
      } else if (item.source === 'workspace') {
        deleteConversation(item.id)
      }
      modal.toast(t('sidebar.noteDeleted'), '', 'success')
    }
  }

  return (
    <motion.aside 
      className={cn(
        "bg-bg-tertiary",
        "flex flex-col overflow-y-auto overflow-x-hidden scrollbar-thin",
        "h-full touch-pan-y shrink-0 relative",
        "rounded-md", // Floating panel effect
        isDragging ? "z-[100] shadow-xl" : "z-[50]"
      )}
      initial={false}
      animate={{ 
        width: hidden ? 0 : 220,
        opacity: hidden ? 0 : 1,
        x: 0
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
      drag={hidden ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false)
        if (info.offset.x < -80 && !hidden && onToggle) onToggle()
      }}
      style={{ 
        pointerEvents: hidden ? 'none' : 'auto',
        overflow: hidden ? 'hidden' : undefined,
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
          "focus:outline-none hover:bg-fill-tertiary", 
          currentView === 'home' && "bg-fill-secondary"
        )} onClick={(e) => { e.preventDefault(); onViewChange('home') }}>
          <Icon name="home" alt={t('nav.home')} size="lg" />
          <span>{t('nav.home')}</span>
        </a>

        {(() => {
          const isAIStudioActive = currentView === 'aistudio-editor' && (!currentNote || !recentItems.some(item => item.source === 'aistudio' && item.id === currentNote?.id));
          return (
            <a href="#" className={cn(
              "flex items-center gap-3 py-2.5 px-3 rounded-2xl no-underline",
              "text-text-primary text-body cursor-pointer relative my-0.5",
              "transition-all duration-200",
              "focus:outline-none hover:bg-fill-tertiary",
              isAIStudioActive && "bg-fill-secondary"
            )} onClick={(e) => { e.preventDefault(); onViewChange('aistudio-editor', { createNew: true }) }}>
              <Icon name="play" alt={t('nav.aiStudio')} size="lg" />
              <span>{t('nav.aiStudio')}</span>
            </a>
          );
        })()}

        {(() => {
          // AI Workspace is active only when in workspace view AND no conversation from history is selected
          const isWorkspaceActive = currentView === 'workspace' && 
            (!currentConversation || !recentItems.some(item => item.source === 'workspace' && item.id === currentConversation?.id));
          return (
            <a href="#" className={cn(
              "flex items-center gap-3 py-2.5 px-3 rounded-2xl no-underline",
              "text-text-primary text-body cursor-pointer relative my-0.5",
              "transition-all duration-200",
              "focus:outline-none hover:bg-fill-tertiary", 
              isWorkspaceActive && "bg-fill-secondary"
            )} onClick={(e) => { e.preventDefault(); onViewChange('workspace') }}>
              <Icon name="message-square" alt={t('nav.aiWorkspace')} size="lg" />
              <span>{t('nav.aiWorkspace')}</span>
            </a>
          );
        })()}

        <div className="flex items-center gap-3 py-2.5 px-3 mt-1 text-text-secondary text-body">
          <Icon name="clock" alt="History" size="lg" color="muted" />
          <span>History</span>
        </div>

        <div className="mb-0.5 pl-0 bg-transparent" id="notesList">
          {recentItems.map(item => {
            const isActive = item.source === 'aistudio' 
              ? (currentNote?.id === item.id && currentView === 'aistudio-editor')
              : (currentConversation?.id === item.id && currentView === 'workspace')
            
            return (
              <div key={`${item.source}-${item.id}`} className={cn(
                "cursor-pointer relative flex items-center justify-between gap-2",
                "py-2.5 px-3 my-0.5 rounded-2xl bg-transparent transition-all duration-200",
                "text-body leading-snug group hover:bg-fill-tertiary",
                isActive && "bg-fill-tertiary"
              )} onClick={() => handleItemClick(item)}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Icon 
                    name={item.source === 'workspace' ? 'message-square' : 'file-text'} 
                    alt={item.source === 'workspace' ? t('nav.aiWorkspace') : t('nav.aiStudio')} 
                    size="sm" 
                    color="muted"
                    className="shrink-0"
                  />
                  <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-body text-text-secondary leading-tight font-normal">
                    {truncateTitle(item.title)}
                  </span>
                </div>
                <button className={cn(
                  "bg-transparent border-none p-1 cursor-pointer rounded-sm",
                  "opacity-0 invisible shrink-0 transition-all duration-150",
                  "group-hover:opacity-60 group-hover:visible hover:!opacity-100 hover:bg-fill-secondary"
                )} onClick={(e) => handleDeleteItem(e, item)}>
                  <Icon name="trash" alt={t('common.delete')} size="sm" />
                </button>
              </div>
            )
          })}
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
