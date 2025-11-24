import { useState, useMemo } from 'react'
import { useNotes } from '../../contexts/NotesContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { useAuth } from '../../contexts/AuthContext'
import { openDriveFolder } from '../../services/drive'
import modal from '../../utils/modal'
import SharePopup from '../Popups/SharePopup'
import './HistoryView.css'

const HistoryView = ({ onToggleLeftSidebar, onViewChange }) => {
  const { notes, loadNote, loading, syncNotes, needsReauth, deleteNote } = useNotes()
  const { conversations, loadConversation, deleteConversation } = useWorkspace()
  const { user, signOut } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'text', 'chat'
  const [isSyncing, setIsSyncing] = useState(false)
  const [activeMenu, setActiveMenu] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [shareItem, setShareItem] = useState(null)
  
  console.log('HistoryView - notes:', notes.length, 'conversations:', conversations.length, 'loading:', loading)

  const formatTimeAgo = (date) => {
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

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

  const filteredItems = allItems.filter(item => {
    // Filter by search term
    const matchesSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filter by type
    const matchesType = filterType === 'all' || 
                       (filterType === 'text' && item.type === 'text') ||
                       (filterType === 'chat' && item.type === 'chat')
    
    return matchesSearch && matchesType
  })

  const sortedItems = [...filteredItems].sort((a, b) => b.updated - a.updated)

  const handleItemClick = (item) => {
    if (item.source === 'drive') {
      loadNote(item.id)
      onViewChange('playground-editor')
    } else {
      // Load workspace conversation
      loadConversation(item.id)
      onViewChange('workspace')
    }
  }

  const handleMenuClick = (e, item) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const menuWidth = 160
    const menuHeight = 100 // Approximate height of menu
    
    // Calculate horizontal position (center under button)
    const x = rect.left + (rect.width / 2) - (menuWidth / 2)
    
    // Calculate vertical position (below or above based on space)
    const spaceBelow = window.innerHeight - rect.bottom
    const y = spaceBelow > menuHeight + 20 
      ? rect.bottom + 8  // Show below
      : rect.top - menuHeight - 8  // Show above
    
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
      `Bạn có chắc chắn muốn xóa "${item.title}"?`,
      'Xác nhận xóa',
      { confirmText: 'Xóa', danger: true }
    )
    
    if (confirmed) {
      try {
        if (item.source === 'drive') {
          await deleteNote(item.id)
        } else {
          await deleteConversation(item.id)
        }
        modal.toast('Đã xóa', '', 'success')
      } catch (error) {
        modal.error('Không thể xóa: ' + error.message)
      }
    }
  }

  const handleShareItem = (item) => {
    setActiveMenu(null)
    setShareItem(item)
  }

  const handleOpenInDrive = async () => {
    try {
      if (!user) {
        modal.alert('Vui lòng đăng nhập để sử dụng tính năng này', 'Chưa đăng nhập')
        return
      }

      await openDriveFolder(notes)
      modal.toast('Đã mở thư mục Drive', '', 'success')
    } catch (error) {
      if (error.message === 'Not authenticated') {
        modal.alert('Vui lòng đăng nhập để sử dụng tính năng này', 'Chưa đăng nhập')
      } else if (error.message === 'NEED_REAUTH') {
        const confirmed = await modal.confirm(
          'Ứng dụng cần quyền truy cập Google Drive để đồng bộ notes. Vui lòng đăng nhập lại để cấp quyền.',
          'Cần cấp quyền Drive',
          { confirmText: 'Đăng nhập lại', danger: false }
        )
        
        if (confirmed) {
          await signOut()
          modal.info('Vui lòng đăng nhập lại để cấp quyền truy cập Google Drive.')
        }
      } else {
        modal.error('Không thể mở thư mục Drive: ' + error.message)
      }
    }
  }

  return (
    <>
      {shareItem && (
        <SharePopup 
          item={shareItem}
          onClose={() => setShareItem(null)}
        />
      )}
      <div className="history-view">
      <div className="history-topbar">
        <button 
          className="menu-btn icon-btn" 
          onClick={onToggleLeftSidebar}
          data-tooltip="Ẩn/hiện sidebar" 
          data-tooltip-position="right"
        >
          <img src="/icon/panel-left.svg" alt="Toggle Left Sidebar" />
        </button>
      </div>

      <div className="history-content">
        <div className="history-header">
          <div className="history-title-section">
            <h2 className="history-title">My history</h2>
            <div className="history-filter-tabs">
              <button 
                className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                Tất cả
              </button>
              <button 
                className={`filter-tab ${filterType === 'text' ? 'active' : ''}`}
                onClick={() => setFilterType('text')}
              >
                Văn bản
              </button>
              <button 
                className={`filter-tab ${filterType === 'chat' ? 'active' : ''}`}
                onClick={() => setFilterType('chat')}
              >
                Trò chuyện
              </button>
            </div>
          </div>
          <div className="history-actions">
            <button className="history-action-btn" onClick={handleOpenInDrive}>
              <img src="/icon/google-drive-svgrepo-com.svg" alt="Open in Drive" />
              <span>Open in Drive</span>
            </button>
            <button 
              className={`history-action-btn ${isSyncing ? 'syncing' : ''}`}
              onClick={async () => {
                try {
                  setIsSyncing(true)
                  await syncNotes()
                  // TODO: Also sync conversations when implemented
                  // await syncConversationsToDrive()
                  modal.toast('Đã đồng bộ', 'Notes đã được đồng bộ với Drive', 'success')
                } catch (error) {
                  modal.error('Không thể đồng bộ: ' + error.message)
                } finally {
                  setIsSyncing(false)
                }
              }}
              data-tooltip="Đồng bộ với Drive"
              data-tooltip-position="bottom"
              disabled={isSyncing}
            >
              <img src="/icon/refresh-cw.svg" alt="Sync" />
              <span>Sync</span>
            </button>
            <div className="search-container">
              <img src="/icon/search.svg" alt="Search" className="search-icon" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="history-table-container">
          {loading ? (
            <div className="history-empty-state">
              <p className="history-empty-desc">Đang tải notes từ Drive...</p>
            </div>
          ) : needsReauth ? (
            <div className="history-empty-state">
              <img src="/icon/shield-check.svg" alt="Need Auth" className="history-empty-icon" />
              <h3 className="history-empty-title">
                Cần cấp quyền Drive
              </h3>
              <p className="history-empty-desc">
                Ứng dụng cần quyền truy cập Google Drive để đồng bộ notes.<br/>
                Vui lòng đăng nhập lại để cấp quyền.
              </p>
              <button 
                className="sync-drive-btn"
                onClick={async () => {
                  const confirmed = await modal.confirm(
                    'Bạn sẽ cần đăng nhập lại để cấp quyền truy cập Google Drive.',
                    'Đăng nhập lại',
                    { confirmText: 'Đăng nhập lại', danger: false }
                  )
                  
                  if (confirmed) {
                    await signOut()
                    modal.info('Vui lòng đăng nhập lại để cấp quyền truy cập Google Drive.')
                  }
                }}
              >
                Đăng nhập lại
              </button>
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="history-empty-state">
              <img src="/icon/message-square.svg" alt="No items" className="history-empty-icon" />
              <h3 className="history-empty-title">
                Chưa có nội dung nào
              </h3>
              <p className="history-empty-desc">
                {user ? 'Tạo note hoặc chat đầu tiên, hoặc đồng bộ từ Drive' : 'Vui lòng đăng nhập để xem lịch sử'}
              </p>
              {user && (
                <button 
                  className="sync-drive-btn"
                  onClick={async () => {
                    try {
                      await syncNotes()
                      modal.toast('Đã đồng bộ', '', 'success')
                    } catch (error) {
                      modal.error('Không thể đồng bộ: ' + error.message)
                    }
                  }}
                >
                  Đồng bộ từ Drive
                </button>
              )}
            </div>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th className="name-col">Name</th>
                  <th className="type-col">Type</th>
                  <th className="source-col">Source</th>
                  <th className="updated-col">Updated</th>
                  <th className="actions-col"></th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map(item => (
                  <tr key={`${item.source}-${item.id}`} onClick={() => handleItemClick(item)}>
                    <td className="name-col">
                      <div className="history-name">
                        <img 
                          src={item.type === 'chat' ? "/icon/message-circle.svg" : "/icon/file-text.svg"} 
                          alt={item.type === 'chat' ? "Chat" : "Text"} 
                        />
                        <span>{item.title}</span>
                      </div>
                    </td>
                    <td className="type-col">
                      <span className="history-type">{item.type === 'chat' ? 'Trò chuyện' : 'Văn bản'}</span>
                    </td>
                    <td className="source-col">
                      <span className="history-source">
                        {item.source === 'drive' ? (
                          <>
                            <img src="/icon/google-drive-svgrepo-com.svg" alt="Drive" />
                            Drive
                          </>
                        ) : (
                          <>
                            <img src="/icon/monitor.svg" alt="Local" />
                            Local
                          </>
                        )}
                      </span>
                    </td>
                    <td className="updated-col">
                      <span className="history-updated">{formatTimeAgo(item.updated)}</span>
                    </td>
                    <td className="actions-col">
                      <button 
                        className="history-actions-btn" 
                        onClick={(e) => handleMenuClick(e, item)}
                      >
                        <img src="/icon/more-vertical.svg" alt="Actions" />
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
                              <img src="/icon/share-2.svg" alt="Share" />
                              Chia sẻ
                            </button>
                            <button 
                              className="history-menu-item danger"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteItem(item)
                              }}
                            >
                              <img src="/icon/trash-2.svg" alt="Delete" />
                              Xóa
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
    </>
  )
}

export default HistoryView
