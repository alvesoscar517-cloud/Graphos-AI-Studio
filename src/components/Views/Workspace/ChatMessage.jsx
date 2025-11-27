import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { useWorkspace } from '../../../contexts/WorkspaceContext'
import './ChatMessage.css'

const ChatMessage = ({ message }) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const { retryLastMessage, isLoading } = useWorkspace()
  const isUser = message.role === 'user'
  const isError = message.error

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRetry = () => {
    if (!isLoading) {
      retryLastMessage()
    }
  }

  // Get error icon based on error code
  const getErrorIcon = () => {
    switch (message.errorCode) {
      case 'QUOTA_EXCEEDED':
        return '/icon/clock.svg'
      case 'RATE_LIMITED':
        return '/icon/alert-triangle.svg'
      case 'CONTENT_BLOCKED':
        return '/icon/shield.svg'
      case 'NETWORK_ERROR':
        return '/icon/wifi-off.svg'
      default:
        return '/icon/alert-circle.svg'
    }
  }

  return (
    <div className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-ai'} ${isError ? 'chat-message-error' : ''}`}>
      <div className="chat-message-content-wrapper">
        {isUser ? (
          <div className="chat-message-bubble">
            <p className="chat-message-text">{message.content}</p>
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="chat-message-attachments">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="chat-attachment">
                    {attachment.type?.startsWith('image/') || attachment.mimeType?.startsWith('image/') ? (
                      <img 
                        src={attachment.url || `data:${attachment.mimeType};base64,${attachment.base64}`} 
                        alt={attachment.name} 
                      />
                    ) : (
                      <div className="chat-attachment-file">
                        <img src="/icon/file.svg" alt={t('chat.file')} />
                        <span>{attachment.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="chat-message-ai-content">
            {isError ? (
              <div className="chat-message-error-content">
                <div className="chat-error-header">
                  <img src={getErrorIcon()} alt={t('common.error')} className="chat-error-icon" />
                  <span className="chat-error-text">{message.content}</span>
                </div>
                <button 
                  className="chat-retry-btn"
                  onClick={handleRetry}
                  disabled={isLoading}
                >
                  <img src="/icon/refresh-cw.svg" alt={t('common.retry')} />
                  <span>{t('common.retry')}</span>
                </button>
              </div>
            ) : (
              <>
                <div className="chat-message-markdown">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                
                {/* Only show copy button when not streaming and has content */}
                {!message.streaming && message.content && (
                  <button 
                    className="chat-message-copy"
                    onClick={handleCopy}
                    data-tooltip={copied ? t('common.copied') : t('common.copy')}
                    data-tooltip-position="top"
                  >
                    <img src={copied ? "/icon/check.svg" : "/icon/copy.svg"} alt={t('common.copy')} />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessage
