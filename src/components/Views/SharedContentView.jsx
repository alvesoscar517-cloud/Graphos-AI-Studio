import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getShare } from '../../services/share'
import { useNotes } from '../../contexts/NotesContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import modal from '../../utils/modal'
import './SharedContentView.css'

const SharedContentView = () => {
  const { t } = useTranslation()
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
      setError(t('errors.shareCodeNotFound'))
      setLoading(false)
      return
    }

    loadSharedContent(shareId)
  }, [searchParams, t])

  const loadSharedContent = async (shareId) => {
    try {
      setLoading(true)
      const data = await getShare(shareId)
      setSharedData(data)
    } catch (err) {
      console.error('Failed to load shared content:', err)
      setError(err.message || t('errors.unableToLoadShared'))
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
        
        modal.toast(t('sharedContent.imported'), t('sharedContent.noteAdded'), 'success')
        navigate('/')
      } else if (sharedData.type === 'conversation') {
        // Import as conversation
        const conversation = createConversation(sharedData.title)
        
        // Add messages to conversation
        if (sharedData.messages && sharedData.messages.length > 0) {
          // Update conversation with messages
          conversation.messages = sharedData.messages
        }
        
        modal.toast(t('sharedContent.imported'), t('sharedContent.conversationAdded'), 'success')
        navigate('/')
      }
    } catch (err) {
      console.error('Failed to import:', err)
      modal.error(t('errors.unableToImport'))
    }
  }

  if (loading) {
    return (
      <div className="shared-content-view">
        <div className="shared-content-loading">
          <div className="spinner"></div>
          <p>{t('sharedContent.loadingSharedContent')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="shared-content-view">
        <div className="shared-content-error">
          <img src="/icon/alert-circle.svg" alt={t('common.error')} />
          <h2>{t('sharedContent.unableToLoadContent')}</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            {t('common.goHome')}
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
            <span>{sharedData.type === 'conversation' ? t('history.conversation') : t('history.text')}</span>
          </div>
          <h1>{sharedData.title}</h1>
          <p className="shared-content-meta">
            {t('sharedContent.sharedOn')} {new Date(sharedData.createdAt).toLocaleDateString('en-US', {
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
                      <img src="/icon/user.svg" alt={t('sharedContent.you')} />
                    ) : (
                      <img src="/icon/bot.svg" alt={t('sharedContent.ai')} />
                    )}
                  </div>
                  <div className="shared-message-content">
                    <div className="shared-message-role">
                      {message.role === 'user' ? t('sharedContent.you') : t('sharedContent.ai')}
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
            {t('common.close')}
          </button>
          <button className="btn-primary" onClick={handleImport}>
            <img src="/icon/download.svg" alt={t('sharedContent.importToApp')} />
            {t('sharedContent.importToApp')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SharedContentView
