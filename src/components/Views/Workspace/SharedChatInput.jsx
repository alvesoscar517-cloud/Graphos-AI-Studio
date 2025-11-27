import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './SharedChatInput.css'

const SharedChatInput = ({ 
  onSendMessage, 
  disabled, 
  isCentered = false,
  placeholder,
  autoFocus = false,
  rightSidebarHidden = false,
  leftSidebarHidden = false
}) => {
  const { t } = useTranslation()
  const defaultPlaceholder = placeholder || t('workspace.askAnything')
  const [message, setMessage] = useState('')
  const [showSendBtn, setShowSendBtn] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setShowSendBtn(message.trim().length > 0)
  }, [message])

  // Auto-resize textarea (1 line default, max 3 lines)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px' // Reset to 1 line
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = 72 // 3 lines: 24px * 3
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px'
    }
  }, [message])

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = '24px' // Reset to 1 line
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    // TODO: Handle file attachments
    console.log('Files selected:', files)
    e.target.value = ''
  }

  return (
    <div 
      className={`shared-chat-input-container ${isCentered ? 'centered' : 'bottom'}`}
      style={{
        marginLeft: leftSidebarHidden ? 0 : (isCentered ? 0 : '238px'),
        marginRight: rightSidebarHidden ? 0 : '300px',
        transition: 'margin 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="shared-chat-input-wrapper">
        <div className="shared-chat-input-box">
          <button 
            type="button"
            className="shared-attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            data-tooltip={t('common.attach')}
            data-tooltip-position="top"
          >
            <img src="/icon/paperclip.svg" alt={t('common.attach')} />
          </button>

          <textarea
            ref={textareaRef}
            className="shared-textarea"
            placeholder={defaultPlaceholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            autoFocus={autoFocus}
          />

          {showSendBtn && (
            <button 
              type="button"
              className="shared-send-btn"
              onClick={handleSend}
              disabled={disabled}
              data-tooltip={t('common.send')}
              data-tooltip-position="top"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.doc,.docx,.csv,.json"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </div>
      </div>
    </div>
  )
}

export default SharedChatInput
