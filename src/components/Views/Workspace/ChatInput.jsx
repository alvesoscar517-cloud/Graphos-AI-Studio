import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '../../Common/Icon'
import { cn } from '../../../lib/utils'

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
    const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type)
    const isDoc = SUPPORTED_DOC_TYPES.includes(file.type)
    
    if (!isImage && !isDoc) {
      return { valid: false, error: t('errors.unsupportedFileType', { type: file.type || 'unknown' }) }
    }
    
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
    e.target.value = ''
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
    <div className={cn(
      "fixed bottom-0 left-sidebar right-sidebar-right z-10",
      "py-4 px-6 pb-6",
      "bg-gradient-to-t from-bg-primary from-80% to-transparent",
      "max-lg:left-0 max-lg:right-0"
    )}>
      <div className="max-w-2xl mx-auto flex flex-col gap-2 w-full">
        {/* Upload Error */}
        {uploadError && (
          <div className={cn(
            "flex items-center gap-2 py-2 px-3",
            "bg-error/10 border border-error/20 rounded-lg",
            "text-sm text-error"
          )}>
            <Icon name="alert-circle" size="sm" color="error" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className={cn(
            "flex flex-wrap gap-2 p-2",
            "bg-bg-secondary rounded-t-xl",
            "border border-border-light border-b-0"
          )}>
            {attachments.map((attachment, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex items-center gap-2 py-1.5 px-2",
                  "bg-bg-primary border border-border-light rounded-lg",
                  "max-w-attachment"
                )}
              >
                {attachment.isImage ? (
                  <img 
                    src={attachment.url} 
                    alt={attachment.name} 
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center rounded bg-bg-hover">
                    <img src="/icon/file-text.svg" alt={t('chat.file')} className="w-5 h-5 opacity-60 icon-invert" />
                  </div>
                )}
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span 
                    className="text-xs text-text-primary whitespace-nowrap overflow-hidden text-ellipsis"
                    title={attachment.name}
                  >
                    {attachment.name.length > 20 
                      ? attachment.name.substring(0, 17) + '...' 
                      : attachment.name}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {formatFileSize(attachment.size)}
                  </span>
                </div>
                <button 
                  className={cn(
                    "p-1 bg-transparent border-none cursor-pointer rounded",
                    "opacity-50 flex items-center justify-center",
                    "hover:opacity-100 hover:bg-bg-hover"
                  )}
                  onClick={() => handleRemoveAttachment(index)}
                  data-tooltip={t('common.remove')}
                  data-tooltip-position="top"
                >
                  <img src="/icon/x.svg" alt={t('common.remove')} className="w-3.5 h-3.5 icon-invert" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Box */}
        <div className={cn(
          "flex items-end gap-2 py-3 px-4",
          "bg-bg-secondary border border-border-hover rounded-3xl",
          "transition-all duration-200",
          attachments.length > 0 && "rounded-t-none border-t-0"
        )}>
          <button 
            className={cn(
              "p-2 bg-transparent border-none cursor-pointer rounded-full",
              "opacity-60 flex items-center justify-center",
              "transition-all duration-200",
              "hover:opacity-100 hover:bg-bg-hover",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            data-tooltip={t('common.attach')}
            data-tooltip-position="top"
          >
            <img src="/icon/paperclip.svg" alt={t('common.attach')} className="w-5 h-5 icon-invert" />
          </button>

          <textarea
            ref={textareaRef}
            className={cn(
              "flex-1 border-none bg-transparent resize-none",
              "text-sm leading-relaxed text-text-primary",
              "max-h-40 overflow-y-auto",
              "placeholder:text-text-muted",
              "focus:outline-none"
            )}
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
              className={cn(
                "p-2 rounded-full cursor-pointer border-none",
                "bg-primary flex items-center justify-center",
                "transition-all duration-200",
                "hover:bg-primary-hover",
                "disabled:opacity-30 disabled:cursor-not-allowed"
              )}
              onClick={handleSend}
              disabled={disabled}
              data-tooltip={t('common.send')}
              data-tooltip-position="top"
            >
              <img src="/icon/send.svg" alt={t('common.send')} className="w-5 h-5 invert" />
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={[...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_DOC_TYPES].join(',')}
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Supported formats hint */}
        <div className={cn(
          "text-xs text-text-muted text-center",
          "opacity-0 transition-opacity duration-200",
          "group-focus-within:opacity-100"
        )}>
          {t('editor.supportsFormats')}
        </div>
      </div>
    </div>
  )
}

export default ChatInput
