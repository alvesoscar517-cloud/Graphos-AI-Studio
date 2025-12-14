import { logger } from '../../utils/logger'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useNotes } from '../../contexts/NotesContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { useUser, useAuthMethod, useHasGoogleLinked, useAuth } from '../../stores/authStore'
import { openDriveFolder } from '../../services/drive'
import { truncateTitleByWords, stripHelpPrefix, hasHelpPrefix } from '../../utils/titleUtils'
import modal from '../../utils/modal'

import LinkGooglePrompt from '../Auth/LinkGooglePrompt'
import { SkeletonHistoryRow } from '../ui/skeleton'
import { cn } from '../../lib/utils'
import { createPortal } from 'react-dom'

// Helper function to highlight search text
const HighlightText = ({ text, searchTerm, regex }) => {
  if (!searchTerm || !text || !regex) return <>{text}</>
  
  const parts = text.split(regex)
  
  return (
    <>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-warning/50 text-text-primary px-0.5 rounded-sm font-inherit">{part}</mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  )
}

const HistoryView = ({ onToggleLeftSidebar, onViewChange }) => {
  const { t } = useTranslation()
  const { notes, loadNote, loading, syncNotes, needsReauth, deleteNote } = useNotes()
  const { conversations, loadConversation, deleteConversation, syncConversationsToDrive, loadConversationsFromDrive } = useWorkspace()
  // Use Zustand stores for user data
  const user = useUser()
  const authMethod = useAuthMethod()
  const hasGoogleLinked = useHasGoogleLinked()
  // Keep signOut and linkGoogleAccount from context
  const { signOut, linkGoogleAccount } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterSource, setFilterSource] = useState('all')
  const [sortBy, setSortBy] = useState('updated')
  const [sortOrder, setSortOrder] = useState('asc')
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false)
  const [sourceDropdownPosition, setSourceDropdownPosition] = useState({ x: 0, y: 0, width: 0 })
  const [showLinkGooglePrompt, setShowLinkGooglePrompt] = useState(false)
  const [linkGoogleAction, setLinkGoogleAction] = useState(null)
  const itemsPerPage = 50
  const searchInputRef = useRef(null)
  const sourceDropdownRef = useRef(null)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(e.target)) {
        setIsSourceDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement !== searchInputRef.current) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        if (isSourceDropdownOpen) setIsSourceDropdownOpen(false)
        else if (searchTerm) setSearchTerm('')
        else if (isSelectionMode) {
          setIsSelectionMode(false)
          setSelectedItems(new Set())
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isSelectionMode) {
        e.preventDefault()
        handleSelectAll()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchTerm, isSelectionMode, isSourceDropdownOpen])

  const formatTimeAgo = useCallback((date) => {
    const now = new Date()
    const dateObj = date instanceof Date ? date : new Date(date)
    const diffMs = now.getTime() - dateObj.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    if (diffHours < 1) return t('common.justNow')
    if (diffHours < 24) return t('common.hoursAgo', { count: diffHours })
    if (diffDays < 7) return t('common.daysAgo', { count: diffDays })
    return dateObj.toLocaleDateString()
  }, [t])

  const searchRegex = useMemo(() => {
    if (!searchTerm) return null
    try {
      return new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    } catch { return null }
  }, [searchTerm])

  // Check if note has meaningful content (same logic as NotesContext)
  const noteHasContent = useCallback((note) => {
    if (!note) return false
    const content = note.content?.trim() || ''
    // Strip HTML tags to check for actual text content
    const plainText = content.replace(/<[^>]*>/g, '').trim()
    const title = note.title?.trim() || ''
    return plainText.length > 0 || (title.length > 0 && title !== 'Untitled' && title !== t('common.untitled'))
  }, [t])

  // Check if conversation has meaningful content
  const conversationHasContent = useCallback((conv) => {
    if (!conv) return false
    return conv.messages && conv.messages.length > 0
  }, [])

  const allItems = useMemo(() => {
    const items = []
    // Filter notes with actual content
    notes.filter(noteHasContent).forEach(note => {
      // Fallback title for notes: use first content or "Untitled"
      const noteTitle = note.title?.trim() || 
        (note.content?.trim()?.split(/[.!?\n]/)[0]?.slice(0, 50)) || 
        t('common.untitled', 'Untitled')
      items.push({
        id: note.id,
        title: noteTitle,
        type: note.type === 'chat' ? 'chat' : 'text',
        updated: note.updated,
        source: note.driveId ? 'drive' : 'local',
        data: note
      })
    })
    // Filter conversations with actual messages
    conversations.filter(conversationHasContent).forEach(conv => {
      // Fallback title for conversations: use first message or "New Chat"
      const convTitle = conv.title?.trim() || 
        (conv.messages?.[0]?.content?.trim()?.split(/[.!?\n]/)[0]?.slice(0, 50)) || 
        t('workspace.newChat', 'New Chat')
      items.push({
        id: conv.id,
        title: convTitle,
        type: 'chat',
        updated: new Date(conv.updated),
        source: conv.driveId ? 'drive' : 'local',
        data: conv
      })
    })
    return items
  }, [notes, conversations, noteHasContent, conversationHasContent, t])

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || 
                         (filterType === 'text' && item.type === 'text') ||
                         (filterType === 'chat' && item.type === 'chat')
      const matchesSource = filterSource === 'all' ||
                           (filterSource === 'drive' && item.source === 'drive') ||
                           (filterSource === 'local' && item.source === 'local')
      return matchesSearch && matchesType && matchesSource
    })
  }, [allItems, searchTerm, filterType, filterSource])

  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems].sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name': comparison = a.title.localeCompare(b.title); break
        case 'type': comparison = a.type.localeCompare(b.type); break
        case 'updated': default: comparison = b.updated - a.updated; break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [filteredItems, sortBy, sortOrder])

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedItems.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedItems, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage)

  const handleItemClick = (item, e) => {
    if (isSelectionMode) {
      e?.stopPropagation()
      toggleItemSelection(item)
      return
    }
    if (item.source === 'drive') {
      loadNote(item.id)
      onViewChange('aistudio-editor')
    } else {
      loadConversation(item.id)
      onViewChange('workspace')
    }
  }

  const toggleItemSelection = (item) => {
    const itemKey = `${item.source}-${item.id}`
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemKey)) newSet.delete(itemKey)
      else newSet.add(itemKey)
      return newSet
    })
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return
    const confirmed = await modal.confirm(
      t('history.confirmBulkDelete', { count: selectedItems.size }),
      t('history.confirmBulkDeleteTitle'),
      { confirmText: t('history.deleteAll'), danger: true }
    )
    if (confirmed) {
      try {
        const itemsToDelete = sortedItems.filter(item => selectedItems.has(`${item.source}-${item.id}`))
        for (const item of itemsToDelete) {
          if (item.source === 'drive') await deleteNote(item.id)
          else await deleteConversation(item.id)
        }
        setSelectedItems(new Set())
        setIsSelectionMode(false)
        modal.toast(t('history.deleted'), t('history.itemsDeleted', { count: itemsToDelete.length }), 'success')
      } catch (error) {
        modal.errorWithReport(t('history.unableToDeleteSome') + ': ' + error.message, error, 'Error', 'HistoryView.handleBulkDelete')
      }
    }
  }

  const handleSelectAll = () => {
    if (selectedItems.size === paginatedItems.length) setSelectedItems(new Set())
    else setSelectedItems(new Set(paginatedItems.map(item => `${item.source}-${item.id}`)))
  }

  const toggleSortOrder = (newSortBy) => {
    if (sortBy === newSortBy) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    else { setSortBy(newSortBy); setSortOrder('asc') }
  }

  const handleDeleteItem = async (item) => {
    const confirmed = await modal.confirm(
      t('history.confirmDeleteItem', { title: item.title }),
      t('sidebar.confirmDelete'),
      { confirmText: t('common.delete'), danger: true }
    )
    if (confirmed) {
      try {
        if (item.source === 'drive') await deleteNote(item.id)
        else await deleteConversation(item.id)
        modal.toast(t('history.deleted'), '', 'success')
      } catch (error) {
        modal.errorWithReport(t('history.unableToDelete') + ': ' + error.message, error, 'Error', 'HistoryView.handleDeleteItem')
      }
    }
  }

  const needsGoogleLink = authMethod === 'email' && !hasGoogleLinked

  const handleOpenInDrive = async () => {
    try {
      if (!user) { modal.alert(t('auth.pleaseSignIn'), t('auth.notSignedIn')); return }
      if (needsGoogleLink) { setLinkGoogleAction('open'); setShowLinkGooglePrompt(true); return }
      await openDriveFolder(notes)
      modal.toast(t('history.driveFolderOpened'), '', 'success')
    } catch (error) {
      if (error.message === 'Not authenticated') modal.alert(t('auth.pleaseSignIn'), t('auth.notSignedIn'))
      else if (error.message === 'NEED_REAUTH' || error.message === 'NEED_GOOGLE_AUTH') {
        // New device needs Google authorization
        const { requestGoogleAuth } = await import('../../services/drive')
        const confirmed = await modal.confirm(
          t('auth.googleAuthRequired') || 'Google Authorization Required',
          t('auth.googleAuthRequiredDesc') || 'This device needs to authorize Google Drive access.',
          { confirmText: t('common.authorize') || 'Authorize', danger: false }
        )
        if (confirmed) {
          await requestGoogleAuth()
          // Retry after authorization
          await handleOpenInDrive()
        }
      } else modal.errorWithReport(t('history.unableToOpenDrive') + ': ' + error.message, error, 'Error', 'HistoryView.handleOpenInDrive')
    }
  }

  const handleSyncNotes = async () => {
    if (needsGoogleLink) { setLinkGoogleAction('sync'); setShowLinkGooglePrompt(true); return }
    try {
      setIsSyncing(true)
      // Sync both notes and conversations
      const [notesResult, convsResult] = await Promise.allSettled([
        syncNotes(),
        syncConversationsToDrive()
      ])
      
      // Also load from Drive to get any new items
      await Promise.allSettled([
        loadConversationsFromDrive()
      ])
      
      const errors = [notesResult, convsResult].filter(r => r.status === 'rejected')
      if (errors.length > 0) {
        // Check if any error is NEED_GOOGLE_AUTH (new device needs authorization)
        const needsAuth = errors.some(e => e.reason?.message === 'NEED_GOOGLE_AUTH')
        if (needsAuth) {
          // Request Google authorization interactively
          const { requestGoogleAuth } = await import('../../services/drive')
          const confirmed = await modal.confirm(
            t('auth.googleAuthRequired') || 'Google Authorization Required',
            t('auth.googleAuthRequiredDesc') || 'This device needs to authorize Google Drive access. Click OK to sign in with Google.',
            { confirmText: t('common.authorize') || 'Authorize', danger: false }
          )
          if (confirmed) {
            await requestGoogleAuth()
            // Retry sync after authorization
            await handleSyncNotes()
          }
          return
        }
        console.warn('Some sync operations failed:', errors)
      }
      
      modal.toast(t('history.synced'), t('history.notesSynced'), 'success')
    } catch (error) {
      // Handle NEED_GOOGLE_AUTH at top level too
      if (error.message === 'NEED_GOOGLE_AUTH') {
        const { requestGoogleAuth } = await import('../../services/drive')
        const confirmed = await modal.confirm(
          t('auth.googleAuthRequired') || 'Google Authorization Required',
          t('auth.googleAuthRequiredDesc') || 'This device needs to authorize Google Drive access.',
          { confirmText: t('common.authorize') || 'Authorize', danger: false }
        )
        if (confirmed) {
          await requestGoogleAuth()
          await handleSyncNotes()
        }
        return
      }
      modal.errorWithReport(t('history.unableToSync') + ': ' + error.message, error, 'Error', 'HistoryView.handleSyncNotes')
    } finally { setIsSyncing(false) }
  }

  const handleLinkGoogleAndContinue = async () => {
    try {
      await linkGoogleAccount()
      setShowLinkGooglePrompt(false)
      modal.toast(t('auth.email.googleLinked') || 'Google account linked!', '', 'success')
      if (linkGoogleAction === 'sync') await handleSyncNotes()
      else if (linkGoogleAction === 'open') {
        await openDriveFolder(notes)
        modal.toast(t('history.driveFolderOpened'), '', 'success')
      }
    } catch (error) {
      modal.errorWithReport(error.message || t('auth.email.linkFailed'), error, 'Error', 'HistoryView.handleLinkGoogleAndContinue')
    }
  }

  // Render table row
  const renderTableRow = (item) => {
    const itemKey = `${item.source}-${item.id}`
    const isSelected = selectedItems.has(itemKey)
    
    return (
      <tr 
        key={itemKey} 
        onClick={(e) => handleItemClick(item, e)}
        className={cn(
          "cursor-pointer transition-all duration-200",
          isSelected && "!bg-primary/10",
          isSelectionMode && "cursor-pointer",
          "hover:bg-transparent [&:hover_td]:bg-bg-hover",
          "[&:hover_td]:border-b-bg-hover",
          "[&:hover_td:first-child]:rounded-l-lg [&:hover_td:last-child]:rounded-r-lg"
        )}
      >
        {isSelectionMode && (
          <td className="w-10 pl-4">
            <input 
              type="checkbox" 
              checked={isSelected}
              onChange={() => toggleItemSelection(item)}
              onClick={(e) => e.stopPropagation()}
              className="w-icon-lg h-icon-lg cursor-pointer accent-primary"
            />
          </td>
        )}
        <td className="py-2.5 pr-3 border-b border-border-light text-text-primary align-middle text-sm h-11 pl-4 min-w-40">
          <div className="flex items-center gap-3 font-normal text-text-primary overflow-hidden">
            <img 
              src={hasHelpPrefix(item.title) ? "/icon/help-circle.svg" : (item.type === 'chat' ? "/icon/message-circle.svg" : "/icon/file-text.svg")} 
              alt={hasHelpPrefix(item.title) ? "Help" : (item.type === 'chat' ? "Chat" : "Text")} 
              className="w-5 h-5 opacity-55 shrink-0 icon-invert"
            />
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              <HighlightText text={truncateTitleByWords(stripHelpPrefix(item.title), 7)} searchTerm={searchTerm} regex={searchRegex} />
            </span>
          </div>
        </td>
        {!isMobile && (
          <>
            <td className="w-28 whitespace-nowrap text-left pl-4 pr-4 py-2.5 border-b border-border-light align-middle text-sm h-11 max-xl:hidden">
              <span className="text-text-secondary text-sm">{item.type === 'chat' ? t('history.chat') : t('history.text')}</span>
            </td>
            <td className="w-28 whitespace-nowrap text-left pl-4 pr-4 py-2.5 border-b border-border-light align-middle text-sm h-11 max-lg:hidden">
              <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
                {item.source === 'drive' ? (
                  <>
                    <img src="/icon/google-drive-svgrepo-com.svg" alt={t('history.drive')} className="w-3.5 h-3.5 opacity-60 icon-invert" />
                    {t('history.drive')}
                  </>
                ) : (
                  <>
                    <img src="/icon/monitor.svg" alt={t('history.local')} className="w-3.5 h-3.5 opacity-60 icon-invert" />
                    {t('history.local')}
                  </>
                )}
              </span>
            </td>
          </>
        )}
        <td className="w-32 whitespace-nowrap text-left pl-4 pr-4 py-2.5 border-b border-border-light align-middle text-sm h-11">
          <span className="text-text-secondary text-sm">{formatTimeAgo(item.updated)}</span>
        </td>
        <td className="w-12 text-right pr-4 py-2.5 border-b border-border-light align-middle text-sm h-11">
          <button 
            className={cn(
              "p-1 bg-transparent border-none cursor-pointer rounded",
              "opacity-40 transition-all duration-200 flex items-center justify-center",
              "w-7 h-7 shrink-0",
              "hover:opacity-100 hover:bg-fill-tertiary"
            )}
            onClick={(e) => { e.stopPropagation(); handleDeleteItem(item) }}
            data-tooltip={t('common.delete')}
            data-tooltip-position="left"
          >
            <img src="/icon/trash-2.svg" alt={t('common.delete')} className="w-4 h-4 icon-invert" />
          </button>
        </td>
      </tr>
    )
  }

  // Render mobile card
  const renderMobileCard = (item) => {
    const itemKey = `${item.source}-${item.id}`
    const isSelected = selectedItems.has(itemKey)
    
    return (
      <div 
        key={itemKey}
        className={cn(
          "bg-bg-secondary border border-border rounded-lg p-4",
          "cursor-pointer transition-all duration-200 relative",
          "hover:bg-bg-tertiary hover:border-border-hover",
          isSelected && "bg-primary/10 border-primary"
        )}
        onClick={(e) => handleItemClick(item, e)}
      >
        {isSelectionMode && (
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => toggleItemSelection(item)}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 left-4 w-5 h-5 cursor-pointer accent-primary"
          />
        )}
        <div className={cn("flex items-center justify-between mb-2", isSelectionMode && isSelected && "ml-8")}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img 
              src={hasHelpPrefix(item.title) ? "/icon/help-circle.svg" : (item.type === 'chat' ? "/icon/message-circle.svg" : "/icon/file-text.svg")} 
              alt={hasHelpPrefix(item.title) ? "Help" : (item.type === 'chat' ? t('history.chat') : t('history.text'))} 
              className="w-5 h-5 opacity-55 shrink-0 icon-invert"
            />
            <span className="text-md font-medium text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">
              <HighlightText text={truncateTitleByWords(stripHelpPrefix(item.title), 7)} searchTerm={searchTerm} regex={searchRegex} />
            </span>
          </div>
          <button 
            className="p-1 bg-transparent border-none cursor-pointer rounded opacity-40 transition-all duration-200 flex items-center justify-center w-7 h-7 shrink-0 hover:opacity-100 hover:bg-fill-tertiary"
            onClick={(e) => { e.stopPropagation(); handleDeleteItem(item) }}
            data-tooltip={t('common.delete')}
            data-tooltip-position="left"
          >
            <img src="/icon/trash-2.svg" alt={t('common.delete')} className="w-4 h-4 icon-invert" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary flex-wrap">
          <span>{item.type === 'chat' ? t('history.chat') : t('history.text')}</span>
          <span className="text-border">•</span>
          <span>{item.source === 'drive' ? t('history.drive') : t('history.local')}</span>
          <span className="text-border">•</span>
          <span>{formatTimeAgo(item.updated)}</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {showLinkGooglePrompt && <LinkGooglePrompt onLink={handleLinkGoogleAndContinue} onClose={() => setShowLinkGooglePrompt(false)} />}
      
      <div className="flex flex-col flex-1 bg-bg-tertiary h-screen overflow-hidden">
        {/* Top Bar - only toggle button, no label */}
        <div className="flex items-center py-2 px-4 bg-bg-tertiary h-14 shrink-0">
          <button 
            className="p-1.5 bg-transparent border-none cursor-pointer rounded-full w-8 h-8 shrink-0 flex items-center justify-center transition-colors duration-200 hover:bg-bg-hover" 
            onClick={onToggleLeftSidebar}
            data-tooltip={t('common.menu')} 
            data-tooltip-position="right"
          >
            <img src="/icon/panel-left.svg" alt={t('common.menu')} className="w-icon-lg h-icon-lg opacity-60 icon-invert" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center p-0 w-full overflow-hidden bg-bg-tertiary">
          {/* Header */}
          <div className="flex items-center justify-between py-2 pr-0 bg-bg-tertiary w-[80%] mx-auto max-lg:w-[90%] max-md:w-[95%] max-lg:flex-wrap max-lg:gap-3 max-md:flex-col max-md:items-start max-md:p-3 max-md:pr-4 max-md:gap-3">
            <div className="flex items-center gap-4 shrink-0 max-md:w-full max-md:flex-col max-md:items-start max-md:gap-3">
              <h2 className="text-xl font-normal text-text-primary m-0 whitespace-nowrap">{t('history.title')}</h2>
              <div className="relative grid grid-cols-3 p-1 rounded-full bg-bg-secondary border border-border-light max-md:w-full">
                {/* Sliding Pill Indicator */}
                <motion.div
                  className={cn(
                    "absolute top-1 bottom-1 rounded-full",
                    "bg-bg-primary border border-border-light",
                    "shadow-sm",
                    "col-span-1"
                  )}
                  initial={false}
                  animate={{
                    left: filterType === 'all' ? '4px' 
                      : filterType === 'text' ? 'calc(33.33% + 1px)' 
                      : 'calc(66.66% - 2px)',
                  }}
                  style={{ width: 'calc(33.33% - 3px)' }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                  }}
                />
                {['all', 'text', 'chat'].map(type => (
                  <button 
                    key={type}
                    className={cn(
                      "bg-transparent border-none py-1.5 px-5 rounded-full z-10 text-sm font-medium cursor-pointer transition-colors duration-200 text-center whitespace-nowrap",
                      "max-lg:px-3 max-lg:text-xs",
                      filterType === type 
                        ? "text-text-primary" 
                        : "text-text-muted hover:text-text-secondary"
                    )}
                    onClick={() => setFilterType(type)}
                  >
                    {type === 'all' ? t('history.all') : type === 'text' ? t('history.text') : t('history.chat')}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 ml-auto flex-1 justify-end flex-wrap max-md:w-full max-md:flex-col max-md:gap-3">
              {!isMobile && (
                <>
                  <button 
                    className="flex items-center gap-2 py-2 px-3 bg-transparent border border-border-hover rounded-lg cursor-pointer text-sm text-text-secondary font-normal transition-all duration-200 hover:text-text-primary hover:border-text-primary hover:bg-bg-tertiary whitespace-nowrap shrink-0"
                    onClick={handleOpenInDrive}
                    data-tooltip-collapsed={t('history.openInDrive')}
                  >
                    <img src="/icon/google-drive-svgrepo-com.svg" alt={t('history.openInDrive')} className="w-icon-lg h-icon-lg opacity-60 icon-invert" />
                    <span className="max-xl:hidden">{t('history.openInDrive')}</span>
                  </button>
                  <button 
                    className={cn(
                      "flex items-center gap-2 py-2 px-3 bg-transparent border border-border-hover rounded-lg cursor-pointer text-sm text-text-secondary font-normal transition-all duration-200 whitespace-nowrap shrink-0",
                      "hover:text-text-primary hover:border-text-primary hover:bg-bg-tertiary",
                      isSyncing && "[&_img]:animate-spin"
                    )}
                    onClick={handleSyncNotes}
                    disabled={isSyncing}
                    data-tooltip-collapsed={t('history.sync')}
                  >
                    <img src="/icon/refresh-cw.svg" alt={t('history.sync')} className="w-icon-lg h-icon-lg opacity-60 transition-transform duration-600 icon-invert" />
                    <span className="max-xl:hidden">{t('history.sync')}</span>
                  </button>
                </>
              )}
              <div className="flex items-center gap-2 py-2 px-3 bg-transparent border border-border-hover rounded-lg min-w-40 max-w-xs flex-1 max-md:w-full max-md:min-w-0 max-md:max-w-none">
                <img src="/icon/search.svg" alt={t('common.search')} className="w-icon-lg h-icon-lg opacity-60 shrink-0 icon-invert" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  className="border-none outline-none text-sm text-text-primary bg-transparent flex-1 min-w-0 p-0 m-0 leading-normal shadow-none rounded-none placeholder:text-text-muted"
                  placeholder={t('history.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Toolbar - always show when there are items in allItems */}
          {allItems.length > 0 && (
            <div className="flex items-center justify-between py-2 px-4 pr-0 bg-bg-tertiary/80 backdrop-blur-md w-[80%] mx-auto max-lg:w-[90%] max-md:w-[95%] gap-3 relative z-dropdown max-lg:flex-wrap max-md:p-3 max-md:pr-4 max-md:flex-col max-md:items-stretch">
              <div className="flex items-center gap-2 flex-wrap relative z-base max-md:w-full">
                {isSelectionMode ? (
                  <>
                    <button className="toolbar-btn max-md:flex-1" onClick={() => { setIsSelectionMode(false); setSelectedItems(new Set()) }}>
                      {t('common.cancel')}
                    </button>
                    <button className="toolbar-btn max-md:flex-1" onClick={handleSelectAll}>
                      {selectedItems.size === paginatedItems.length ? t('common.deselectAll') : t('common.selectAll')}
                    </button>
                    {selectedItems.size > 0 && (
                      <button className="toolbar-btn danger max-md:flex-1" onClick={handleBulkDelete}>
                        {t('common.delete')} ({selectedItems.size})
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button 
                      className="toolbar-btn max-md:flex-1 max-lg:px-2" 
                      onClick={() => setIsSelectionMode(true)}
                      data-tooltip-collapsed={t('common.select')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 stroke-text-secondary">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      <span className="max-xl:hidden">{t('common.select')}</span>
                    </button>
                    <div className="w-px h-6 bg-border mx-1 shrink-0 max-lg:hidden" />
                    {['updated', 'name', 'type'].map(sort => (
                      <button 
                        key={sort}
                        className={cn("toolbar-btn max-lg:px-2", sortBy === sort && "active")}
                        onClick={() => toggleSortOrder(sort)}
                        data-tooltip-collapsed={sort === 'updated' ? t('history.date') : sort === 'name' ? t('history.name') : t('history.type')}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn("shrink-0", sortBy === sort ? "stroke-primary" : "stroke-text-secondary")}>
                          {sort === 'updated' && <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></>}
                          {sort === 'name' && <path d="M4 7h16M4 12h16M4 17h10"></path>}
                          {sort === 'type' && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></>}
                        </svg>
                        <span className="max-xl:hidden">{sort === 'updated' ? t('history.date') : sort === 'name' ? t('history.name') : t('history.type')}</span> {sortBy === sort && (sortOrder === 'asc' ? '↑' : '↓')}
                      </button>
                    ))}
                    <div className="w-px h-6 bg-border mx-1 shrink-0 max-lg:hidden" />
                    <div className="relative inline-block" ref={sourceDropdownRef}>
                      <button 
                        className="toolbar-btn min-w-28 max-lg:min-w-0 max-lg:px-2"
                        onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}
                      >
                        <span className="max-xl:hidden">{filterSource === 'all' ? t('history.allSources') : filterSource === 'drive' ? t('history.driveOnly') : t('history.localOnly')}</span>
                        <span className="xl:hidden">{filterSource === 'all' ? t('history.all') : filterSource === 'drive' ? t('history.drive') : t('history.local')}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn("shrink-0 opacity-60 transition-transform duration-200 stroke-text-secondary", isSourceDropdownOpen && "rotate-180")}>
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                      {isSourceDropdownOpen && (
                        <div 
                          className="absolute top-full left-0 mt-1 bg-bg-secondary border border-border rounded-xl shadow-lg z-[100] animate-fade-in p-1.5 min-w-full"
                        >
                          {['all', 'drive', 'local'].map((source) => (
                            <button 
                              key={source}
                              className={cn(
                                "block w-full py-2 px-3 bg-transparent border-none text-left text-sm cursor-pointer transition-all duration-100 whitespace-nowrap rounded-lg",
                                "hover:bg-fill-tertiary",
                                filterSource === source ? "text-text-primary font-medium" : "text-text-secondary font-normal"
                              )}
                              onClick={() => { 
                                setFilterSource(source); 
                                setIsSourceDropdownOpen(false) 
                              }}
                            >
                              {source === 'all' ? t('history.allSources') : source === 'drive' ? t('history.driveOnly') : t('history.localOnly')}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 max-md:w-full max-md:justify-between">
                <span className="text-sm text-text-secondary font-medium whitespace-nowrap">{sortedItems.length} {t('common.items')}</span>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden w-[80%] mx-auto max-lg:w-[90%] max-md:w-[95%] pr-0 min-h-0 max-md:pr-0">
            {loading ? (
              <div className="pt-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonHistoryRow key={i} />
                ))}
              </div>
            ) : needsReauth ? (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center min-h-96 flex-1">
                <img src="/icon/shield-check.svg" alt={t('auth.drivePermissionRequired')} className="w-20 h-20 opacity-20 mb-6 grayscale icon-invert" />
                <h3 className="text-xl font-medium text-text-primary mb-2">{t('auth.drivePermissionRequired')}</h3>
                <p className="text-sm text-text-secondary mb-8 leading-relaxed max-w-modal-sm">
                  {t('history.drivePermissionDesc')}<br/>{t('history.signInAgainDesc')}
                </p>
                <button 
                  className="bg-transparent text-text-secondary border border-border-hover py-2.5 px-6 rounded-pill text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-bg-tertiary hover:text-text-primary hover:border-text-primary hover:-translate-y-px active:translate-y-0"
                  onClick={async () => {
                    const confirmed = await modal.confirm(t('history.needSignInAgain'), t('auth.signInAgain'), { confirmText: t('auth.signInAgain'), danger: false })
                    if (confirmed) { await signOut(); modal.info(t('history.needSignInAgain')) }
                  }}
                >
                  {t('auth.signInAgain')}
                </button>
              </div>
            ) : sortedItems.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center py-10 px-5 text-center">
                <img src="/icon/message-square.svg" alt={t('history.noItems')} className="w-20 h-20 opacity-20 mb-6 grayscale icon-invert" />
                <h3 className="text-xl font-medium text-text-primary mb-2">{t('history.noItems')}</h3>
                <p className="text-sm text-text-secondary mb-8 leading-relaxed max-w-modal-sm">
                  {user ? t('history.noItemsDesc') : t('history.pleaseSignInToView')}
                </p>
                {user && (
                  <button 
                    className="bg-transparent text-text-secondary border border-border-hover py-2.5 px-6 rounded-pill text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-bg-tertiary hover:text-text-primary hover:border-text-primary hover:-translate-y-px active:translate-y-0"
                    onClick={async () => {
                      try { await syncNotes(); modal.toast(t('history.synced'), '', 'success') }
                      catch (error) { modal.errorWithReport(t('history.unableToSync') + ': ' + error.message, error, 'Error', 'HistoryView.inlineSync') }
                    }}
                  >
                    {t('history.syncFromDrive')}
                  </button>
                )}
              </div>
            ) : isMobile ? (
              <div className="flex flex-col gap-3 p-4">
                {paginatedItems.map(renderMobileCard)}
              </div>
            ) : (
              <table className="w-full border-collapse text-sm table-auto bg-transparent">
                <thead className="sticky top-0 bg-bg-tertiary/80 backdrop-blur-md z-base border-b border-border-light">
                  <tr>
                    {isSelectionMode && <th className="w-10 pl-4"></th>}
                    <th className="text-left py-2.5 pr-3 font-medium text-text-secondary text-xs tracking-wide bg-transparent h-10 pl-4 min-w-40">{t('history.name')}</th>
                    <th className="w-28 text-left py-2.5 pl-4 pr-4 font-medium text-text-secondary text-xs tracking-wide bg-transparent h-10 max-xl:hidden">{t('history.type')}</th>
                    <th className="w-28 text-left py-2.5 pl-4 pr-4 font-medium text-text-secondary text-xs tracking-wide bg-transparent h-10 max-lg:hidden">{t('history.source')}</th>
                    <th className="w-32 text-left py-2.5 pl-4 pr-4 font-medium text-text-secondary text-xs tracking-wide bg-transparent h-10">{t('history.updated')}</th>
                    <th className="w-12 text-right py-2.5 pr-4 font-medium text-text-secondary text-xs tracking-wide bg-transparent h-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map(renderTableRow)}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-5 bg-bg-tertiary border-t border-border-light max-md:p-4">
              <button 
                className="py-2 px-4 bg-transparent border border-border rounded-md cursor-pointer text-sm text-text-secondary font-medium transition-all duration-200 hover:bg-bg-tertiary hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed max-md:py-2.5 max-md:px-5"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                {t('common.back')}
              </button>
              <span className="text-sm text-text-secondary font-medium">{currentPage} / {totalPages}</span>
              <button 
                className="py-2 px-4 bg-transparent border border-border rounded-md cursor-pointer text-sm text-text-secondary font-medium transition-all duration-200 hover:bg-bg-tertiary hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed max-md:py-2.5 max-md:px-5"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default HistoryView
