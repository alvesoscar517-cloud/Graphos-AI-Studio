import { useState, useRef, useEffect } from 'react'
import './SharedChatInput.css'

const SharedChatInput = ({ 
  onSendMessage, 
  disabled, 
  isCentered = false,
  placeholder = "Hỏi bất cứ điều gì...",
  autoFocus = false,
  rightSidebarHidden = false,
  leftSidebarHidden = false
}) => {
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
            data-tooltip="Đính kèm file"
            data-tooltip-position="top"
          >
            <img src="/icon/paperclip.svg" alt="Attach" />
          </button>

          <textarea
            ref={textareaRef}
            className="shared-textarea"
            placeholder={placeholder}
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
              data-tooltip="Gửi tin nhắn"
              data-tooltip-position="top"
            >
              <img src="/icon/arrow-up.svg" alt="Send" />
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
