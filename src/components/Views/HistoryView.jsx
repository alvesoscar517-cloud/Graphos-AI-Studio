import { useState } from 'react'
import { useNotes } from '../../contexts/NotesContext'
import { useAuth } from '../../contexts/AuthContext'
import { openDriveFolder } from '../../services/drive'
import modal from '../../utils/modal'
import './HistoryView.css'

const HistoryView = ({ onToggleLeftSidebar, onViewChange }) => {
  const { notes, loadNote, loading, syncNotes, needsReauth } = useNotes()
  const { user, signOut } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  
  console.log('HistoryView - notes:', notes.length, 'loading:', loading, 'needsReauth:', needsReauth)

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

  const filteredNotes = searchTerm
    ? notes.filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : notes

  const sortedNotes = [...filteredNotes].sort((a, b) => b.updated - a.updated)

  const handleNoteClick = (noteId) => {
    loadNote(noteId)
    onViewChange('playground-editor')
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
            <button className="dropdown-btn">
              <img src="/icon/chevron-down.svg" alt="Dropdown" />
            </button>
          </div>
          <div className="history-actions">
            <button className="history-action-btn" onClick={handleOpenInDrive}>
              <img src="/icon/google-drive-svgrepo-com.svg" alt="Open in Drive" />
              <span>Open in Drive</span>
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
          ) : sortedNotes.length === 0 ? (
            <div className="history-empty-state">
              <img src="/icon/message-square.svg" alt="No notes" className="history-empty-icon" />
              <h3 className="history-empty-title">
                Chưa có notes nào
              </h3>
              <p className="history-empty-desc">
                {user ? 'Tạo note đầu tiên hoặc đồng bộ từ Drive' : 'Vui lòng đăng nhập để xem notes'}
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
                  <th className="updated-col">Updated</th>
                  <th className="actions-col"></th>
                </tr>
              </thead>
              <tbody>
                {sortedNotes.map(note => (
                  <tr key={note.id} onClick={() => handleNoteClick(note.id)}>
                    <td className="name-col">
                      <div className="history-name">
                        <img src="/icon/message-square.svg" alt="Chat" />
                        <span>{note.title}</span>
                      </div>
                    </td>
                    <td className="type-col">
                      <span className="history-type">{note.type}</span>
                    </td>
                    <td className="updated-col">
                      <span className="history-updated">{formatTimeAgo(note.updated)}</span>
                    </td>
                    <td className="actions-col">
                      <button className="history-actions-btn">
                        <img src="/icon/more-vertical.svg" alt="Actions" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default HistoryView
