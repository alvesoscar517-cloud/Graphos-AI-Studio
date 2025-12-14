import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useUser } from '../../stores/authStore'
import { useNotes } from '../../contexts/NotesContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { useUnreadCount } from '../../stores/notificationStore'
import { truncateTitleByWords, stripHelpPrefix, hasHelpPrefix } from '../../utils/titleUtils'
import { cn } from '../../lib/utils'
import Icon from '../Common/Icon'
import NotificationPopup from '../Popups/NotificationPopup'
import SettingsPopup from '../Popups/SettingsPopup'
import UserProfilePopup from '../Popups/UserProfilePopup'
import modal from '../../utils/modal'

// Breakpoints for responsive behavior
const BREAKPOINT_MOBILE = 768
const BREAKPOINT_TABLET = 1024

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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  // Detect screen size and auto-collapse/hide sidebar with debounce
  useEffect(() => {
    let resizeTimeout
    
    const checkScreenSize = () => {
      const width = window.innerWidth
      const newIsMobile = width < BREAKPOINT_MOBILE
      const newIsCollapsed = width >= BREAKPOINT_MOBILE && width < BREAKPOINT_TABLET
      
      // Only update if values changed
      if (newIsMobile !== isMobile || newIsCollapsed !== isCollapsed) {
        setIsResizing(true)
        setIsMobile(newIsMobile)
        setIsCollapsed(newIsCollapsed)
        // Reset resizing state after transition
        setTimeout(() => setIsResizing(false), 350)
      }
    }
    
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(checkScreenSize, 100)
    }
    
    checkScreenSize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [isMobile, isCollapsed])

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

    // Map conversations to unified format (only those with actual messages)
    const conversationItems = conversations
      .filter(conv => conv.messages && conv.messages.length > 0)
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

  // Calculate sidebar width based on state
  const getSidebarWidth = () => {
    if (hidden) return 0
    if (isCollapsed) return 64
    return 220
  }

  return (
    <motion.aside 
      className={cn(
        "bg-bg-tertiary",
        "flex flex-col overflow-y-auto overflow-x-hidden scrollbar-thin",
        "h-full touch-pan-y shrink-0 relative",
        "rounded-md", // Floating panel effect
        isDragging ? "z-[100] shadow-xl" : "z-[50]",
        isCollapsed && !hidden && "items-center"
      )}
      initial={false}
      animate={{ 
        width: getSidebarWidth(),
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
        minWidth: isDragging ? (isCollapsed ? 64 : 220) : undefined
      }}
    >
      <div className={cn("py-4", isCollapsed && "px-2")}>
        {isCollapsed ? (
          <div className="text-[20px] text-text-primary font-bold text-center">G</div>
        ) : (
          <h1 className="text-[26px] text-text-primary tracking-tighter leading-tight text-center whitespace-nowrap">
            <span className="font-bold">Graphos</span> <span className="font-normal">AI Studio</span>
          </h1>
        )}
      </div>

      <nav className={cn("py-3 flex-1", isCollapsed ? "px-1" : "px-2")}>
        <div className={cn(
          "flex items-center gap-3 py-2.5 px-3 rounded-2xl",
          "text-text-primary text-body cursor-pointer relative my-0.5",
          "transition-all duration-200",
          "focus:outline-none hover:bg-fill-tertiary", 
          currentView === 'home' && "bg-fill-secondary",
          isCollapsed && "justify-center px-2"
        )} onClick={() => onViewChange('home')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onViewChange('home')} data-tooltip-collapsed={t('nav.home')}>
          <Icon name="home" alt={t('nav.home')} size="lg" />
          {!isCollapsed && <span>{t('nav.home')}</span>}
        </div>

        {(() => {
          const isAIStudioActive = currentView === 'aistudio-editor' && (!currentNote || !recentItems.some(item => item.source === 'aistudio' && item.id === currentNote?.id));
          return (
            <div className={cn(
              "flex items-center gap-3 py-2.5 px-3 rounded-2xl",
              "text-text-primary text-body cursor-pointer relative my-0.5",
              "transition-all duration-200",
              "focus:outline-none hover:bg-fill-tertiary",
              isAIStudioActive && "bg-fill-secondary",
              isCollapsed && "justify-center px-2"
            )} onClick={() => onViewChange('aistudio-editor', { createNew: true })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onViewChange('aistudio-editor', { createNew: true })} data-tooltip-collapsed={t('nav.aiStudio')}>
              <Icon name="play" alt={t('nav.aiStudio')} size="lg" />
              {!isCollapsed && <span>{t('nav.aiStudio')}</span>}
            </div>
          );
        })()}

        {(() => {
          // AI Workspace is active only when in workspace view AND no conversation from history is selected
          const isWorkspaceActive = currentView === 'workspace' && 
            (!currentConversation || !recentItems.some(item => item.source === 'workspace' && item.id === currentConversation?.id));
          return (
            <div className={cn(
              "flex items-center gap-3 py-2.5 px-3 rounded-2xl",
              "text-text-primary text-body cursor-pointer relative my-0.5",
              "transition-all duration-200",
              "focus:outline-none hover:bg-fill-tertiary", 
              isWorkspaceActive && "bg-fill-secondary",
              isCollapsed && "justify-center px-2"
            )} onClick={() => onViewChange('workspace', { createNew: true })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onViewChange('workspace', { createNew: true })} data-tooltip-collapsed={t('nav.aiWorkspace')}>
              <Icon name="message-square" alt={t('nav.aiWorkspace')} size="lg" />
              {!isCollapsed && <span>{t('nav.aiWorkspace')}</span>}
            </div>
          );
        })()}

        {!isCollapsed && (
          <>
            <div className="flex items-center gap-3 py-2.5 px-3 mt-1 text-text-secondary text-body">
              <Icon name="clock" alt={t('nav.history')} size="lg" color="muted" />
              <span>{t('nav.history')}</span>
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
                      {hasHelpPrefix(item.title) ? (
                        <Icon 
                          name="help-circle" 
                          alt="Help" 
                          size="sm" 
                          color="muted"
                          className="shrink-0"
                        />
                      ) : (
                        <Icon 
                          name={item.source === 'workspace' ? 'message-square' : 'file-text'} 
                          alt={item.source === 'workspace' ? t('nav.aiWorkspace') : t('nav.aiStudio')} 
                          size="sm" 
                          color="muted"
                          className="shrink-0"
                        />
                      )}
                      <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-body text-text-secondary leading-tight font-normal">
                        {truncateTitle(stripHelpPrefix(item.title))}
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

            <div className={cn(
              "block py-2.5 px-3 text-system-blue text-body rounded-2xl m-0 font-medium cursor-pointer",
              "hover:bg-fill-tertiary focus:outline-none transition-all duration-200",
              currentView === 'history' && "bg-fill-tertiary"
            )} onClick={() => onViewChange('history')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onViewChange('history')}>
              {t('nav.viewAllHistory')} →
            </div>
          </>
        )}

        {isCollapsed && (
          <div className={cn(
            "flex items-center justify-center py-2.5 px-2 rounded-2xl my-0.5",
            "text-text-secondary text-body cursor-pointer",
            "transition-all duration-200",
            "focus:outline-none hover:bg-fill-tertiary", 
            currentView === 'history' && "bg-fill-tertiary"
          )} onClick={() => onViewChange('history')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onViewChange('history')} data-tooltip-collapsed={t('nav.viewAllHistory')}>
            <Icon name="clock" alt={t('nav.viewAllHistory')} size="lg" color="muted" />
          </div>
        )}
      </nav>

      <div className={cn("p-2 overflow-visible", isCollapsed && "px-1")}>
        <div className="p-0 relative overflow-visible">
          <button className={cn(
            "flex items-center gap-3 py-2.5 px-3 text-text-primary",
            "text-body rounded-2xl relative my-0.5 border-none bg-transparent w-full cursor-pointer",
            "hover:bg-fill-tertiary focus:outline-none transition-all duration-200",
            isCollapsed && "justify-center px-2"
          )} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSettings(false); setShowUserProfile(false); setShowNotifications(!showNotifications); }} data-tooltip-collapsed={t('nav.notification')}>
            <div className="relative flex items-center justify-center">
              <Icon name="bell" alt={t('nav.notification')} size="lg" />
              <NotificationBadge />
            </div>
            {!isCollapsed && t('nav.notification')}
          </button>

          <button className={cn(
            "flex items-center gap-3 py-2.5 px-3 text-text-primary",
            "text-body rounded-2xl relative my-0.5 border-none bg-transparent w-full cursor-pointer",
            "hover:bg-fill-tertiary focus:outline-none transition-all duration-200",
            isCollapsed && "justify-center px-2"
          )} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowNotifications(false); setShowUserProfile(false); setShowSettings(!showSettings); }} data-tooltip-collapsed={t('nav.settings')}>
            <Icon name="settings" alt={t('nav.settings')} size="lg" />
            {!isCollapsed && t('nav.settings')}
          </button>

          <button className={cn(
            "flex items-center gap-3 py-2.5 px-3 text-text-primary",
            "text-body rounded-2xl relative my-0.5 border-none bg-transparent w-full cursor-pointer",
            "hover:bg-fill-tertiary focus:outline-none transition-all duration-200",
            isCollapsed && "justify-center px-2"
          )} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowNotifications(false); setShowSettings(false); setShowUserProfile(!showUserProfile); }} data-tooltip-collapsed={user?.email || t('common.notLoggedIn')}>
            {user?.picture ? (
              <img src={user.picture} alt="User" className="w-6 h-6 shrink-0 rounded-full" />
            ) : (
              <Icon name="user-circle" alt="User" size="lg" />
            )}
            {!isCollapsed && (
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {truncateEmail(user?.email, 18) || t('common.notLoggedIn')}
              </span>
            )}
          </button>
        </div>
      </div>

      {showNotifications && <NotificationPopup onClose={() => setShowNotifications(false)} onViewChange={onViewChange} />}
      {showSettings && <SettingsPopup onClose={() => setShowSettings(false)} onViewChange={onViewChange} />}
      {showUserProfile && <UserProfilePopup onClose={() => setShowUserProfile(false)} />}
    </motion.aside>
  )
}

export default Sidebar
