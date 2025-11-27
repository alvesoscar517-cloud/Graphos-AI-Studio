import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './ChatInput.css'

// Supported file types
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const SUPPORTED_DOC_TYPES = ['application/pdf', 'text/plain', 'text/csv', 'application/json']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ChatInput = ({ onSendMessage, disabled }) => {
  const { t } = useTranslation()
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState([])
  const [uploadError, setUploadError] = useState(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [message])

  // Clear upload error after 3 seconds
  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => setUploadError(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [uploadError])

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

  const validateFile = (file) => {
    // Check file type
    const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type)
    const isDoc = SUPPORTED_DOC_TYPES.includes(file.type)
    
    if (!isImage && !isDoc) {
      return { valid: false, error: t('errors.unsupportedFileType', { type: file.type || 'unknown' }) }
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: t('errors.fileTooLarge', { size: `${(file.size / 1024 / 1024).toFixed(1)}MB` }) }
    }
    
    return { valid: true }
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    setUploadError(null)
    
    const validFiles = []
    const errors = []
    
    for (const file of files) {
      const validation = validateFile(file)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    }
    
    if (errors.length > 0) {
      setUploadError(errors.join('\n'))
    }
    
    // Process valid files
    const newAttachments = await Promise.all(
      validFiles.map(async (file) => {
        const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type)
        
        return {
          file,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          isImage
        }
      })
    )
    
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

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items
    if (!items) return
    
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          const validation = validateFile(file)
          if (validation.valid) {
            const attachment = {
              file,
              name: `pasted-image-${Date.now()}.${file.type.split('/')[1]}`,
              type: file.type,
              size: file.size,
              url: URL.createObjectURL(file),
              isImage: true
            }
            setAttachments(prev => [...prev, attachment])
          } else {
            setUploadError(validation.error)
          }
        }
        break
      }
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="workspace-input-container">
      <div className="workspace-input-wrapper">
        {/* Upload Error */}
        {uploadError && (
          <div className="workspace-upload-error">
            <img src="/icon/alert-circle.svg" alt={t('common.error')} />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="workspace-attachments-preview">
            {attachments.map((attachment, index) => (
              <div key={index} className="attachment-chip">
                {attachment.isImage ? (
                  <img src={attachment.url} alt={attachment.name} className="attachment-preview-img" />
                ) : (
                  <div className="attachment-file-icon">
                    <img src="/icon/file-text.svg" alt={t('chat.file')} />
                  </div>
                )}
                <div className="attachment-info">
                  <span className="attachment-name" title={attachment.name}>
                    {attachment.name.length > 20 
                      ? attachment.name.substring(0, 17) + '...' 
                      : attachment.name}
                  </span>
                  <span className="attachment-size">{formatFileSize(attachment.size)}</span>
                </div>
                <button 
                  className="attachment-remove"
                  onClick={() => handleRemoveAttachment(index)}
                  data-tooltip={t('common.remove')}
                  data-tooltip-position="top"
                >
                  <img src="/icon/x.svg" alt={t('common.remove')} />
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
            data-tooltip={t('common.attach')}
            data-tooltip-position="top"
          >
            <img src="/icon/paperclip.svg" alt={t('common.attach')} />
          </button>

          <textarea
            ref={textareaRef}
            className="workspace-textarea"
            placeholder={t('workspace.typeMessage')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={disabled}
            rows={1}
          />

          {(message.trim() || attachments.length > 0) && (
            <button 
              className="workspace-send-btn"
              onClick={handleSend}
              disabled={disabled}
              data-tooltip={t('common.send')}
              data-tooltip-position="top"
            >
              <img src="/icon/send.svg" alt={t('common.send')} />
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={[...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_DOC_TYPES].join(',')}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </div>

        {/* Supported formats hint */}
        <div className="workspace-input-hint">
          {t('editor.supportsFormats')}
        </div>
      </div>
    </div>
  )
}

export default ChatInput
