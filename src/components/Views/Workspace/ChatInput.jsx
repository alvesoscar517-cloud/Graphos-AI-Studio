import { useState, useRef, useEffect } from 'react'
import './ChatInput.css'

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState([])
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [message])

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments)
      setMessage('')
      setAttachments([])
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
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
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file)
    }))
    setAttachments(prev => [...prev, ...newAttachments])
    e.target.value = '' // Reset input
  }

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => {
      const newAttachments = [...prev]
      URL.revokeObjectURL(newAttachments[index].url)
      newAttachments.splice(index, 1)
      return newAttachments
    })
  }

  return (
    <div className="workspace-input-container">
      <div className="workspace-input-wrapper">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="workspace-attachments-preview">
            {attachments.map((attachment, index) => (
              <div key={index} className="attachment-chip">
                {attachment.type.startsWith('image/') ? (
                  <img src={attachment.url} alt={attachment.name} />
                ) : (
                  <img src="/icon/file.svg" alt="File" />
                )}
                <span className="attachment-name">
                  {attachment.name.length > 20 
                    ? attachment.name.substring(0, 20) + '...' 
                    : attachment.name}
                </span>
                <button 
                  className="attachment-remove"
                  onClick={() => handleRemoveAttachment(index)}
                >
                  <img src="/icon/x.svg" alt="Remove" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Box */}
        <div className="workspace-input-box">
          <button 
            className="workspace-attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            data-tooltip="Đính kèm file"
            data-tooltip-position="top"
          >
            <img src="/icon/paperclip.svg" alt="Attach" />
          </button>

          <textarea
            ref={textareaRef}
            className="workspace-textarea"
            placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
          />

          {(message.trim() || attachments.length > 0) && (
            <button 
              className="workspace-send-btn"
              onClick={handleSend}
              disabled={disabled}
              data-tooltip="Gửi tin nhắn"
              data-tooltip-position="top"
            >
              <img src="/icon/send.svg" alt="Send" />
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

export default ChatInput
