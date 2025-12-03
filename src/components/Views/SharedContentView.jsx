import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getShare } from '../../services/share'
import { useNotes } from '../../contexts/NotesContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import modal from '../../utils/modal'
import { cn } from '../../lib/utils'

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
        const note = createNote()
        updateNote(note.id, {
          title: sharedData.title,
          content: sharedData.content,
          type: 'text'
        })
        
        modal.toast(t('sharedContent.imported'), t('sharedContent.noteAdded'), 'success')
        navigate('/')
      } else if (sharedData.type === 'conversation') {
        const conversation = createConversation(sharedData.title)
        
        if (sharedData.messages && sharedData.messages.length > 0) {
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
      <div className="w-full h-screen bg-gradient-to-br from-gradient-purple-start to-gradient-purple-end flex items-center justify-center p-5 overflow-y-auto">
        <div className="bg-bg-primary rounded-2xl p-12 text-center shadow-modal max-w-modal-sm">
          <div className="w-12 h-12 border-4 border-border-light border-t-gradient-purple-start rounded-full animate-spin mx-auto mb-6" />
          <p className="text-text-secondary text-base m-0">{t('sharedContent.loadingSharedContent')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-gradient-purple-start to-gradient-purple-end flex items-center justify-center p-5 overflow-y-auto">
        <div className="bg-bg-primary rounded-2xl p-12 text-center shadow-modal max-w-modal-sm">
          <img src="/icon/alert-circle.svg" alt={t('common.error')} className="w-16 h-16 mb-6 opacity-50" />
          <h2 className="text-text-primary text-2xl m-0 mb-3">{t('sharedContent.unableToLoadContent')}</h2>
          <p className="text-text-secondary text-base m-0 mb-6">{error}</p>
          <button 
            className={cn(
              "py-3 px-6 rounded-lg text-sm font-medium cursor-pointer border-none",
              "bg-gradient-to-br from-gradient-purple-start to-gradient-purple-end text-white",
              "flex items-center gap-2 mx-auto",
              "transition-all duration-200",
              "hover:-translate-y-0.5 hover:shadow-lg"
            )}
            onClick={() => navigate('/')}
          >
            {t('common.goHome')}
          </button>
        </div>
      </div>
    )
  }

  if (!sharedData) return null

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gradient-purple-start to-gradient-purple-end flex items-center justify-center p-5 overflow-y-auto max-md:p-0">
      <div className="bg-bg-primary rounded-2xl shadow-modal max-w-modal-xl w-full max-h-[90vh] flex flex-col overflow-hidden max-md:rounded-none max-md:max-h-screen">
        {/* Header */}
        <div className="p-8 border-b border-border-light bg-bg-secondary max-md:p-6">
          <div className="inline-flex items-center gap-2 bg-bg-primary py-2 px-4 rounded-pill text-sm text-text-secondary mb-4 shadow-sm">
            <img 
              src={sharedData.type === 'conversation' ? '/icon/message-circle.svg' : '/icon/file-text.svg'} 
              alt={sharedData.type} 
              className="w-4 h-4 icon-invert"
            />
            <span>{sharedData.type === 'conversation' ? t('history.conversation') : t('history.text')}</span>
          </div>
          <h1 className="text-text-primary text-2xl font-semibold m-0 mb-2 max-md:text-xl">{sharedData.title}</h1>
          <p className="text-text-secondary text-sm m-0">
            {t('sharedContent.sharedOn')} {new Date(sharedData.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 max-md:p-6">
          {sharedData.type === 'note' && (
            <pre className="whitespace-pre-wrap break-words font-[Segoe_UI,system-ui,sans-serif] text-md leading-relaxed text-text-primary m-0">
              {sharedData.content}
            </pre>
          )}

          {sharedData.type === 'conversation' && sharedData.messages && (
            <div className="flex flex-col gap-6">
              {sharedData.messages.map((message, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex gap-4 animate-fade-in-slow",
                    message.role === 'user' && "flex-row-reverse"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    message.role === 'user' 
                      ? "bg-gradient-to-br from-gradient-purple-start to-gradient-purple-end" 
                      : "bg-bg-tertiary"
                  )}>
                    {message.role === 'user' ? (
                      <img src="/icon/user.svg" alt={t('sharedContent.you')} className="w-5 h-5 invert" />
                    ) : (
                      <img src="/icon/bot.svg" alt={t('sharedContent.ai')} className="w-5 h-5 icon-invert" />
                    )}
                  </div>
                  <div className={cn(
                    "flex-1 max-w-4/5 max-md:max-w-10/12",
                    message.role === 'user' && "text-right"
                  )}>
                    <div className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
                      {message.role === 'user' ? t('sharedContent.you') : t('sharedContent.ai')}
                    </div>
                    <div className={cn(
                      "p-4 rounded-xl text-md leading-relaxed whitespace-pre-wrap break-words",
                      message.role === 'user' 
                        ? "bg-gradient-to-br from-gradient-purple-start to-gradient-purple-end text-white" 
                        : "bg-bg-tertiary text-text-primary"
                    )}>
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="py-6 px-8 border-t border-border-light flex gap-3 justify-end bg-bg-secondary max-md:p-4 max-md:flex-col-reverse">
          <button 
            className={cn(
              "py-3 px-6 rounded-lg text-sm font-medium cursor-pointer",
              "bg-bg-tertiary text-text-secondary",
              "border border-border-light",
              "flex items-center gap-2",
              "transition-all duration-200",
              "hover:bg-bg-hover",
              "max-md:w-full max-md:justify-center"
            )}
            onClick={() => navigate('/')}
          >
            {t('common.close')}
          </button>
          <button 
            className={cn(
              "py-3 px-6 rounded-lg text-sm font-medium cursor-pointer border-none",
              "bg-gradient-to-br from-gradient-purple-start to-gradient-purple-end text-white",
              "flex items-center gap-2",
              "transition-all duration-200",
              "hover:-translate-y-0.5 hover:shadow-lg",
              "max-md:w-full max-md:justify-center"
            )}
            onClick={handleImport}
          >
            <img src="/icon/download.svg" alt={t('sharedContent.importToApp')} className="w-4 h-4 invert" />
            {t('sharedContent.importToApp')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SharedContentView
