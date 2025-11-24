import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getShare } from '../../services/share'
import { useNotes } from '../../contexts/NotesContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import modal from '../../utils/modal'
import './SharedContentView.css'

const SharedContentView = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { createNote, updateNote } = useNotes()
  const { createConversation } = useWorkspace()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sharedData, setSharedData] = useState(null)

  useEffect(() => {
    const shareId = searchParams.get('share')
    
    if (!shareId) {
      setError('Không tìm thấy mã chia sẻ')
      setLoading(false)
      return
    }

    loadSharedContent(shareId)
  }, [searchParams])

  const loadSharedContent = async (shareId) => {
    try {
      setLoading(true)
      const data = await getShare(shareId)
      setSharedData(data)
    } catch (err) {
      console.error('Failed to load shared content:', err)
      setError(err.message || 'Không thể tải nội dung được chia sẻ')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = () => {
    if (!sharedData) return

    try {
      if (sharedData.type === 'note') {
        // Import as note
        const note = createNote()
        updateNote(note.id, {
          title: sharedData.title,
          content: sharedData.content,
          type: 'text'
        })
        
        modal.toast('Đã nhập', 'Note đã được thêm vào danh sách của bạn', 'success')
        navigate('/')
      } else if (sharedData.type === 'conversation') {
        // Import as conversation
        const conversation = createConversation(sharedData.title)
        
        // Add messages to conversation
        if (sharedData.messages && sharedData.messages.length > 0) {
          // Update conversation with messages
          conversation.messages = sharedData.messages
        }
        
        modal.toast('Đã nhập', 'Cuộc trò chuyện đã được thêm vào workspace', 'success')
        navigate('/')
      }
    } catch (err) {
      console.error('Failed to import:', err)
      modal.error('Không thể nhập nội dung')
    }
  }

  if (loading) {
    return (
      <div className="shared-content-view">
        <div className="shared-content-loading">
          <div className="spinner"></div>
          <p>Đang tải nội dung được chia sẻ...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="shared-content-view">
        <div className="shared-content-error">
          <img src="/icon/alert-circle.svg" alt="Error" />
          <h2>Không thể tải nội dung</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Về trang chủ
          </button>
        </div>
      </div>
    )
  }

  if (!sharedData) {
    return null
  }

  return (
    <div className="shared-content-view">
      <div className="shared-content-container">
        <div className="shared-content-header">
          <div className="shared-content-badge">
            <img 
              src={sharedData.type === 'conversation' ? '/icon/message-circle.svg' : '/icon/file-text.svg'} 
              alt={sharedData.type} 
            />
            <span>{sharedData.type === 'conversation' ? 'Cuộc trò chuyện' : 'Văn bản'}</span>
          </div>
          <h1>{sharedData.title}</h1>
          <p className="shared-content-meta">
            Được chia sẻ vào {new Date(sharedData.createdAt).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="shared-content-body">
          {sharedData.type === 'note' && (
            <div className="shared-note-content">
              <pre>{sharedData.content}</pre>
            </div>
          )}

          {sharedData.type === 'conversation' && sharedData.messages && (
            <div className="shared-conversation-content">
              {sharedData.messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`shared-message ${message.role === 'user' ? 'user' : 'assistant'}`}
                >
                  <div className="shared-message-avatar">
                    {message.role === 'user' ? (
                      <img src="/icon/user.svg" alt="User" />
                    ) : (
                      <img src="/icon/bot.svg" alt="AI" />
                    )}
                  </div>
                  <div className="shared-message-content">
                    <div className="shared-message-role">
                      {message.role === 'user' ? 'Bạn' : 'AI'}
                    </div>
                    <div className="shared-message-text">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="shared-content-footer">
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Đóng
          </button>
          <button className="btn-primary" onClick={handleImport}>
            <img src="/icon/download.svg" alt="Import" />
            Nhập vào ứng dụng
          </button>
        </div>
      </div>
    </div>
  )
}

export default SharedContentView
