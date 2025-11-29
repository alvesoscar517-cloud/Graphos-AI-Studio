import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNotes } from '../../contexts/NotesContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { useAuth } from '../../contexts/AuthContext'
import { openDriveFolder } from '../../services/drive'
import { truncateTitleByWords } from '../../utils/titleUtils'
import modal from '../../utils/modal'
import SharePopup from '../Popups/SharePopup'
import LinkGooglePrompt from '../Auth/LinkGooglePrompt'
import './HistoryView.css'

// Helper function to highlight search text
const HighlightText = ({ text, searchTerm, regex }) => {
  if (!searchTerm || !text || !regex) return <>{text}</>
  
  const parts = text.split(regex)
  
  return (
    <>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="search-highlight">{part}</mark>
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
  const { conversations, loadConversation, deleteConversation } = useWorkspace()
  const { user, signOut, authMethod, hasGoogleLinked, linkGoogleAccount } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'text', 'chat'
  const [filterSource, setFilterSource] = useState('all') // 'all', 'drive', 'local'
  const [sortBy, setSortBy] = useState('updated') // 'updated', 'name', 'type'
  const [sortOrder, setSortOrder] = useState('asc') // 'asc', 'desc'
  const [isSyncing, setIsSyncing] = useState(false)
  const [activeMenu, setActiveMenu] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [shareItem, setShareItem] = useState(null)
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false)
  const [showLinkGooglePrompt, setShowLinkGooglePrompt] = useState(false)
  const [linkGoogleAction, setLinkGoogleAction] = useState(null) // 'sync' or 'open'
  const itemsPerPage = 50
  const searchInputRef = useRef(null)
  const sourceDropdownRef = useRef(null)
  
  console.log('HistoryView - notes:', notes.length, 'conversations:', conversations.length, 'loading:', loading)

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
      // Focus search with '/'
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement !== searchInputRef.current) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      
      // Escape to clear search or exit selection mode
      if (e.key === 'Escape') {
        if (isSourceDropdownOpen) {
          setIsSourceDropdownOpen(false)
        } else if (searchTerm) {
          setSearchTerm('')
        } else if (isSelectionMode) {
          setIsSelectionMode(false)
          setSelectedItems(new Set())
        }
      }
      
      // Ctrl/Cmd + A to select all
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
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) return t('common.justNow')
    if (diffHours < 24) return t('common.hoursAgo', { count: diffHours })
    if (diffDays < 7) return t('common.daysAgo', { count: diffDays })
    return date.toLocaleDateString()
  }, [t])

  // Memoized search regex
  const searchRegex = useMemo(() => {
    if (!searchTerm) return null
    try {
      return new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    } catch {
      return null
    }
  }, [searchTerm])

  // Combine notes and conversations into unified list
  const allItems = useMemo(() => {
    const items = []
    
    // Add notes from Drive
    notes.forEach(note => {
      items.push({
        id: note.id,
        title: note.title,
        type: note.type === 'chat' ? 'chat' : 'text',
        updated: note.updated,
        source: 'drive',
        data: note
      })
    })
    
    // Add conversations from workspace
    conversations.forEach(conv => {
      items.push({
        id: conv.id,
        title: conv.title,
        type: 'chat',
        updated: new Date(conv.updated),
        source: 'workspace',
        data: conv
      })
    })
    
    return items
  }, [notes, conversations])

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      // Filter by search term
      const matchesSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Filter by type
      const matchesType = filterType === 'all' || 
                         (filterType === 'text' && item.type === 'text') ||
                         (filterType === 'chat' && item.type === 'chat')
      
      // Filter by source
      const matchesSource = filterSource === 'all' ||
                           (filterSource === 'drive' && item.source === 'drive') ||
                           (filterSource === 'local' && item.source === 'workspace')
      
      return matchesSearch && matchesType && matchesSource
    })
  }, [allItems, searchTerm, filterType, filterSource])

  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title)
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        case 'updated':
        default:
          comparison = b.updated - a.updated
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return sorted
  }, [filteredItems, sortBy, sortOrder])

  // Paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedItems.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedItems, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage)

  const handleItemClick = (item, e) => {
    // If in selection mode, toggle selection
    if (isSelectionMode) {
      e?.stopPropagation()
      toggleItemSelection(item)
      return
    }
    
    if (item.source === 'drive') {
      loadNote(item.id)
      onViewChange('aistudio-editor')
    } else {
      // Load workspace conversation
      loadConversation(item.id)
      onViewChange('workspace')
    }
  }

  const toggleItemSelection = (item) => {
    const itemKey = `${item.source}-${item.id}`
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey)
      } else {
        newSet.add(itemKey)
      }
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
        const itemsToDelete = sortedItems.filter(item => 
          selectedItems.has(`${item.source}-${item.id}`)
        )
        
        for (const item of itemsToDelete) {
          if (item.source === 'drive') {
            await deleteNote(item.id)
          } else {
            await deleteConversation(item.id)
          }
        }
        
        setSelectedItems(new Set())
        setIsSelectionMode(false)
        modal.toast(t('history.deleted'), t('history.itemsDeleted', { count: itemsToDelete.length }), 'success')
      } catch (error) {
        modal.error(t('history.unableToDeleteSome') + ': ' + error.message)
      }
    }
  }

  const handleSelectAll = () => {
    if (selectedItems.size === paginatedItems.length) {
      setSelectedItems(new Set())
    } else {
      const allIds = new Set(paginatedItems.map(item => `${item.source}-${item.id}`))
      setSelectedItems(allIds)
    }
  }

  const toggleSortOrder = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('asc')
    }
  }

  const handleMenuClick = (e, item) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const menuWidth = 160
    const menuHeight = 100
    
    const x = rect.left + (rect.width / 2) - (menuWidth / 2)
    const spaceBelow = window.innerHeight - rect.bottom
    const y = spaceBelow > menuHeight + 20 
      ? rect.bottom + 8
      : rect.top - menuHeight - 8
    
    setMenuPosition({ x, y })
    setActiveMenu(activeMenu === item.id ? null : item.id)
  }

  const handleCloseMenu = (e) => {
    e.stopPropagation()
    setActiveMenu(null)
  }

  const handleDeleteItem = async (item) => {
    setActiveMenu(null)
    const confirmed = await modal.confirm(
      t('history.confirmDeleteItem', { title: item.title }),
      t('sidebar.confirmDelete'),
      { confirmText: t('common.delete'), danger: true }
    )
    
    if (confirmed) {
      try {
        if (item.source === 'drive') {
          await deleteNote(item.id)
        } else {
          await deleteConversation(item.id)
        }
        modal.toast(t('history.deleted'), '', 'success')
      } catch (error) {
        modal.error(t('history.unableToDelete') + ': ' + error.message)
      }
    }
  }

  const handleShareItem = (item) => {
    setActiveMenu(null)
    setShareItem(item)
  }

  // Check if email user needs to link Google first
  const needsGoogleLink = authMethod === 'email' && !hasGoogleLinked

  const handleOpenInDrive = async () => {
    try {
      if (!user) {
        modal.alert(t('auth.pleaseSignIn'), t('auth.notSignedIn'))
        return
      }

      // Email user without Google linked - show prompt
      if (needsGoogleLink) {
        setLinkGoogleAction('open')
        setShowLinkGooglePrompt(true)
        return
      }

      await openDriveFolder(notes)
      modal.toast(t('history.driveFolderOpened'), '', 'success')
    } catch (error) {
      if (error.message === 'Not authenticated') {
        modal.alert(t('auth.pleaseSignIn'), t('auth.notSignedIn'))
      } else if (error.message === 'NEED_REAUTH') {
        const confirmed = await modal.confirm(
          t('auth.needReauth'),
          t('auth.drivePermissionRequired'),
          { confirmText: t('auth.signInAgain'), danger: false }
        )
        
        if (confirmed) {
          await signOut()
          modal.info(t('history.needSignInAgain'))
        }
      } else {
        modal.error(t('history.unableToOpenDrive') + ': ' + error.message)
      }
    }
  }

  const handleSyncNotes = async () => {
    // Email user without Google linked - show prompt
    if (needsGoogleLink) {
      setLinkGoogleAction('sync')
      setShowLinkGooglePrompt(true)
      return
    }

    try {
      setIsSyncing(true)
      await syncNotes()
      modal.toast(t('history.synced'), t('history.notesSynced'), 'success')
    } catch (error) {
      modal.error(t('history.unableToSync') + ': ' + error.message)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleLinkGoogleAndContinue = async () => {
    try {
      await linkGoogleAccount()
      setShowLinkGooglePrompt(false)
      modal.toast(t('auth.email.googleLinked') || 'Google account linked!', '', 'success')
      
      // Continue with the original action
      if (linkGoogleAction === 'sync') {
        await handleSyncNotes()
      } else if (linkGoogleAction === 'open') {
        await openDriveFolder(notes)
        modal.toast(t('history.driveFolderOpened'), '', 'success')
      }
    } catch (error) {
      modal.error(error.message || t('auth.email.linkFailed'))
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
        className={`${isSelected ? 'selected' : ''} ${isSelectionMode ? 'selection-mode' : ''}`}
      >
        {isSelectionMode && (
          <td className="checkbox-col">
            <input 
              type="checkbox" 
              checked={isSelected}
              onChange={() => toggleItemSelection(item)}
              onClick={(e) => e.stopPropagation()}
            />
          </td>
        )}
        <td className="name-col">
          <div className="history-name">
            <img 
              src={item.type === 'chat' ? "/icon/message-circle.svg" : "/icon/file-text.svg"} 
              alt={item.type === 'chat' ? "Chat" : "Text"} 
            />
            <span title={item.title}>
              <HighlightText 
                text={truncateTitleByWords(item.title, 7)} 
                searchTerm={searchTerm}
                regex={searchRegex}
              />
            </span>
          </div>
        </td>
        {!isMobile && (
          <>
            <td className="type-col">
              <span className="history-type">{item.type === 'chat' ? t('history.chat') : t('history.text')}</span>
            </td>
            <td className="source-col">
              <span className="history-source">
                {item.source === 'drive' ? (
                  <>
                    <img src="/icon/google-drive-svgrepo-com.svg" alt={t('history.drive')} />
                    {t('history.drive')}
                  </>
                ) : (
                  <>
                    <img src="/icon/monitor.svg" alt={t('history.local')} />
                    {t('history.local')}
                  </>
                )}
              </span>
            </td>
          </>
        )}
        <td className="updated-col">
          <span className="history-updated">{formatTimeAgo(item.updated)}</span>
        </td>
        <td className="actions-col">
          <button 
            className="history-actions-btn" 
            onClick={(e) => handleMenuClick(e, item)}
            data-tooltip={t('common.more')}
            data-tooltip-position="left"
          >
            <img src="/icon/more-vertical.svg" alt={t('common.more')} />
          </button>
          {activeMenu === item.id && (
            <>
              <div 
                className="history-menu-overlay" 
                onClick={handleCloseMenu}
              />
              <div 
                className="history-actions-menu"
                style={{ 
                  position: 'fixed',
                  left: `${menuPosition.x}px`,
                  top: `${menuPosition.y}px`
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  className="history-menu-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShareItem(item)
                  }}
                >
                  <img src="/icon/share-2.svg" alt={t('common.share')} />
                  {t('common.share')}
                </button>
                <button 
                  className="history-menu-item danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteItem(item)
                  }}
                >
                  <img src="/icon/trash-2.svg" alt={t('common.delete')} />
                  {t('common.delete')}
                </button>
              </div>
            </>
          )}
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
        className={`history-card ${isSelected ? 'selected' : ''}`}
        onClick={(e) => handleItemClick(item, e)}
      >
        {isSelectionMode && (
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => toggleItemSelection(item)}
            onClick={(e) => e.stopPropagation()}
            className="card-checkbox"
          />
        )}
        <div className="card-header">
          <div className="card-title">
            <img 
              src={item.type === 'chat' ? "/icon/message-circle.svg" : "/icon/file-text.svg"} 
              alt={item.type === 'chat' ? t('history.chat') : t('history.text')} 
            />
            <span>
              <HighlightText 
                text={truncateTitleByWords(item.title, 7)} 
                searchTerm={searchTerm}
                regex={searchRegex}
              />
            </span>
          </div>
          <button 
            className="history-actions-btn" 
            onClick={(e) => handleMenuClick(e, item)}
            data-tooltip={t('common.more')}
            data-tooltip-position="left"
          >
            <img src="/icon/more-vertical.svg" alt={t('common.more')} />
          </button>
        </div>
        <div className="card-meta">
          <span className="card-type">{item.type === 'chat' ? t('history.chat') : t('history.text')}</span>
          <span className="card-separator">•</span>
          <span className="card-source">
            {item.source === 'drive' ? t('history.drive') : t('history.local')}
          </span>
          <span className="card-separator">•</span>
          <span className="card-time">{formatTimeAgo(item.updated)}</span>
        </div>
        {activeMenu === item.id && (
          <>
            <div 
              className="history-menu-overlay" 
              onClick={handleCloseMenu}
            />
            <div 
              className="history-actions-menu"
              style={{ 
                position: 'fixed',
                left: `${menuPosition.x}px`,
                top: `${menuPosition.y}px`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="history-menu-item"
                onClick={(e) => {
                  e.stopPropagation()
                  handleShareItem(item)
                }}
              >
                <img src="/icon/share-2.svg" alt={t('common.share')} />
                {t('common.share')}
              </button>
              <button 
                className="history-menu-item danger"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteItem(item)
                }}
              >
                <img src="/icon/trash-2.svg" alt={t('common.delete')} />
                {t('common.delete')}
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      {shareItem && (
        <SharePopup 
          item={shareItem}
          onClose={() => setShareItem(null)}
        />
      )}
      {showLinkGooglePrompt && (
        <LinkGooglePrompt
          onLink={handleLinkGoogleAndContinue}
          onClose={() => setShowLinkGooglePrompt(false)}
        />
      )}
      <div className="history-view">
        <div className="history-topbar">
          <button 
            className="menu-btn icon-btn" 
            onClick={onToggleLeftSidebar}
            data-tooltip={t('common.menu')} 
            data-tooltip-position="right"
          >
            <img src="/icon/panel-left.svg" alt={t('common.menu')} />
          </button>
        </div>

        <div className="history-content">
          <div className="history-header">
            <div className="history-title-section">
              <h2 className="history-title">{t('history.title')}</h2>
              <div className="history-filter-tabs">
                <button 
                  className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  {t('history.all')}
                </button>
                <button 
                  className={`filter-tab ${filterType === 'text' ? 'active' : ''}`}
                  onClick={() => setFilterType('text')}
                >
                  {t('history.text')}
                </button>
                <button 
                  className={`filter-tab ${filterType === 'chat' ? 'active' : ''}`}
                  onClick={() => setFilterType('chat')}
                >
                  {t('history.chat')}
                </button>
              </div>
            </div>
            <div className="history-actions">
              {!isMobile && (
                <>
                  <button className="history-action-btn" onClick={handleOpenInDrive}>
                    <img src="/icon/google-drive-svgrepo-com.svg" alt={t('history.openInDrive')} />
                    <span>{t('history.openInDrive')}</span>
                  </button>
                  <button 
                    className={`history-action-btn ${isSyncing ? 'syncing' : ''}`}
                    onClick={handleSyncNotes}
                    disabled={isSyncing}
                  >
                    <img src="/icon/refresh-cw.svg" alt={t('history.sync')} />
                    <span>{t('history.sync')}</span>
                  </button>
                </>
              )}
              <div className="search-container">
                <img src="/icon/search.svg" alt={t('common.search')} className="search-icon" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  className="search-input" 
                  placeholder={t('history.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Toolbar */}
          {sortedItems.length > 0 && (
            <div className="history-toolbar">
              <div className="toolbar-left">
                {isSelectionMode ? (
                  <>
                    <button 
                      className="toolbar-btn"
                      onClick={() => {
                        setIsSelectionMode(false)
                        setSelectedItems(new Set())
                      }}
                    >
                      {t('common.cancel')}
                    </button>
                    <button 
                      className="toolbar-btn"
                      onClick={handleSelectAll}
                    >
                      {selectedItems.size === paginatedItems.length ? t('common.deselectAll') : t('common.selectAll')}
                    </button>
                    {selectedItems.size > 0 && (
                      <button 
                        className="toolbar-btn danger"
                        onClick={handleBulkDelete}
                      >
                        {t('common.delete')} ({selectedItems.size})
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button 
                      className="toolbar-btn select-btn"
                      onClick={() => setIsSelectionMode(true)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      {t('common.select')}
                    </button>
                    <div className="toolbar-divider" />
                    <button 
                      className={`toolbar-btn sort-btn ${sortBy === 'updated' ? 'active' : ''}`}
                      onClick={() => toggleSortOrder('updated')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {t('history.date')} {sortBy === 'updated' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                    <button 
                      className={`toolbar-btn sort-btn ${sortBy === 'name' ? 'active' : ''}`}
                      onClick={() => toggleSortOrder('name')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 7h16M4 12h16M4 17h10"></path>
                      </svg>
                      {t('history.name')} {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                    <button 
                      className={`toolbar-btn sort-btn ${sortBy === 'type' ? 'active' : ''}`}
                      onClick={() => toggleSortOrder('type')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      {t('history.type')} {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                    <div className="toolbar-divider" />
                    <div className="custom-dropdown" ref={sourceDropdownRef}>
                      <button 
                        className="custom-dropdown-trigger"
                        onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}
                      >
                        <span>
                          {filterSource === 'all' && t('history.allSources')}
                          {filterSource === 'drive' && t('history.driveOnly')}
                          {filterSource === 'local' && t('history.localOnly')}
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                      {isSourceDropdownOpen && (
                        <div className="custom-dropdown-menu">
                          <button 
                            className={`custom-dropdown-item ${filterSource === 'all' ? 'active' : ''}`}
                            onClick={() => {
                              setFilterSource('all')
                              setIsSourceDropdownOpen(false)
                            }}
                          >
                            {t('history.allSources')}
                          </button>
                          <button 
                            className={`custom-dropdown-item ${filterSource === 'drive' ? 'active' : ''}`}
                            onClick={() => {
                              setFilterSource('drive')
                              setIsSourceDropdownOpen(false)
                            }}
                          >
                            {t('history.driveOnly')}
                          </button>
                          <button 
                            className={`custom-dropdown-item ${filterSource === 'local' ? 'active' : ''}`}
                            onClick={() => {
                              setFilterSource('local')
                              setIsSourceDropdownOpen(false)
                            }}
                          >
                            {t('history.localOnly')}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="toolbar-right">
                <span className="item-count">{sortedItems.length} {t('common.items')}</span>
              </div>
            </div>
          )}

          <div className="history-table-container">
            {loading ? (
              <div className="history-empty-state">
                <p className="history-empty-desc">{t('history.loadingFromDrive')}</p>
              </div>
            ) : needsReauth ? (
              <div className="history-empty-state">
                <img src="/icon/shield-check.svg" alt={t('auth.drivePermissionRequired')} className="history-empty-icon" />
                <h3 className="history-empty-title">{t('auth.drivePermissionRequired')}</h3>
                <p className="history-empty-desc">
                  {t('history.drivePermissionDesc')}<br/>
                  {t('history.signInAgainDesc')}
                </p>
                <button 
                  className="sync-drive-btn"
                  onClick={async () => {
                    const confirmed = await modal.confirm(
                      t('history.needSignInAgain'),
                      t('auth.signInAgain'),
                      { confirmText: t('auth.signInAgain'), danger: false }
                    )
                    
                    if (confirmed) {
                      await signOut()
                      modal.info(t('history.needSignInAgain'))
                    }
                  }}
                >
                  {t('auth.signInAgain')}
                </button>
              </div>
            ) : sortedItems.length === 0 ? (
              <div className="history-empty-state">
                <img src="/icon/message-square.svg" alt={t('history.noItems')} className="history-empty-icon" />
                <h3 className="history-empty-title">{t('history.noItems')}</h3>
                <p className="history-empty-desc">
                  {user ? t('history.noItemsDesc') : t('history.pleaseSignInToView')}
                </p>
                {user && (
                  <button 
                    className="sync-drive-btn"
                    onClick={async () => {
                      try {
                        await syncNotes()
                        modal.toast(t('history.synced'), '', 'success')
                      } catch (error) {
                        modal.error(t('history.unableToSync') + ': ' + error.message)
                      }
                    }}
                  >
                    {t('history.syncFromDrive')}
                  </button>
                )}
              </div>
            ) : isMobile ? (
              <div className="history-cards">
                {paginatedItems.map(renderMobileCard)}
              </div>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    {isSelectionMode && <th className="checkbox-col"></th>}
                    <th className="name-col">{t('history.name')}</th>
                    <th className="type-col">{t('history.type')}</th>
                    <th className="source-col">{t('history.source')}</th>
                    <th className="updated-col">{t('history.updated')}</th>
                    <th className="actions-col"></th>
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
            <div className="history-pagination">
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                {t('common.back')}
              </button>
              <span className="pagination-info">
                {currentPage} / {totalPages}
              </span>
              <button 
                className="pagination-btn"
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
