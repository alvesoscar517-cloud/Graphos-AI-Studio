import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { cn } from '../../../lib/utils'
import { createPortal } from 'react-dom'
import Icon from '../../Common/Icon'

// Supported file types
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const SUPPORTED_DOC_TYPES = ['application/pdf', 'text/plain', 'text/csv', 'application/json']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Gemini Models - simplified names like shadcn-io/ai
const MODELS = [
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Lite' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' }
]

const ModernChatInput = ({
  onSendMessage,
  disabled,
  isCentered = false,
  placeholder,
  autoFocus = false,
  initialMessage = '',
  selectedModel = 'gemini-2.0-flash-exp',
  onModelChange,
  showModelSelector = true
}) => {
  const { t } = useTranslation()
  const defaultPlaceholder = placeholder || t('workspace.askAnything')
  
  const [message, setMessage] = useState(initialMessage)
  const [attachments, setAttachments] = useState([])
  const [uploadError, setUploadError] = useState(null)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [status, setStatus] = useState('ready') // ready, submitted, streaming
  
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const modelDropdownRef = useRef(null)
  const modelButtonRef = useRef(null)

  // Speech Recognition
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition()

  // Update message when transcript changes
  useEffect(() => {
    if (transcript && isRecording) {
      setMessage(prev => prev + (prev ? ' ' : '') + transcript)
      resetTranscript()
    }
  }, [transcript, isRecording, resetTranscript])

  // Update message when initialMessage changes
  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage)
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(initialMessage.length, initialMessage.length)
      }
    }
  }, [initialMessage])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = 200
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px'
    }
  }, [message])

  // Clear upload error after 3 seconds
  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => setUploadError(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [uploadError])

  // Close model dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target) &&
          modelButtonRef.current && !modelButtonRef.current.contains(e.target)) {
        setShowModelDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0]

  const handleSend = useCallback(() => {
    if ((message.trim() || attachments.length > 0) && !disabled && status === 'ready') {
      setStatus('submitted')
      onSendMessage(message.trim(), attachments)
      setMessage('')
      setAttachments([])
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      // Reset status after a short delay
      setTimeout(() => setStatus('ready'), 500)
    }
  }, [message, attachments, disabled, onSendMessage, status])

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
    
    const newAttachments = validFiles.map((file) => ({
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      isImage: SUPPORTED_IMAGE_TYPES.includes(file.type)
    }))
    
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

  const toggleVoiceRecording = () => {
    if (!browserSupportsSpeechRecognition) {
      setUploadError(t('workspace.voiceNotSupported'))
      return
    }

    if (listening) {
      SpeechRecognition.stopListening()
      setIsRecording(false)
    } else {
      resetTranscript()
      setIsRecording(true)
      SpeechRecognition.startListening({ 
        continuous: true, 
        language: navigator.language || 'en-US'
      })
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const hasContent = message.trim() || attachments.length > 0

  return (
    <div className={cn("w-full", isCentered && "max-w-2xl mx-auto")}>
      {/* Upload Error */}
      {uploadError && (
        <div className={cn(
          "flex items-center gap-2 py-2 px-3 mb-2",
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
          "flex flex-wrap gap-2 p-3 mb-0",
          "bg-bg-secondary rounded-t-2xl",
          "border border-border-light border-b-0"
        )}>
          {attachments.map((attachment, index) => (
            <div 
              key={index} 
              className={cn(
                "flex items-center gap-2 py-1.5 px-2",
                "bg-bg-primary border border-border-light rounded-lg",
                "max-w-[200px]"
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
                  <Icon name="file-text" size="md" color="muted" />
                </div>
              )}
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="text-xs text-text-primary truncate" title={attachment.name}>
                  {attachment.name.length > 15 ? attachment.name.substring(0, 12) + '...' : attachment.name}
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
              >
                <Icon name="x" size="xs" color="muted" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Container - shadcn-io/ai style */}
      <div className={cn(
        "relative flex flex-col",
        "bg-bg-primary border border-border-light rounded-2xl",
        "shadow-sm",
        attachments.length > 0 && "rounded-t-none border-t-0"
      )}>
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          className={cn(
            "w-full border-none bg-transparent resize-none",
            "text-text-primary text-sm",
            "px-4 pt-3 pb-2",
            "outline-none min-h-[44px] max-h-[200px]",
            "overflow-y-auto",
            "placeholder:text-text-muted/60"
          )}
          placeholder={defaultPlaceholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={disabled}
          rows={1}
          autoFocus={autoFocus}
        />

        {/* Toolbar - shadcn-io/ai style */}
        <div className="flex items-center justify-between px-3 pb-3">
          {/* Left Tools */}
          <div className="flex items-center gap-0.5">
            {/* Attach File Button */}
            <button
              type="button"
              className={cn(
                "inline-flex items-center justify-center gap-2",
                "h-8 px-2 rounded-lg",
                "text-text-muted hover:text-text-primary",
                "hover:bg-bg-hover/80",
                "transition-colors",
                "disabled:opacity-50 disabled:pointer-events-none"
              )}
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>

            {/* Voice Input Button */}
            {browserSupportsSpeechRecognition && (
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center gap-2",
                  "h-8 px-3 rounded-lg",
                  "text-text-muted hover:text-text-primary",
                  "hover:bg-bg-hover/80",
                  "transition-colors",
                  listening && "text-error bg-error/10",
                  "disabled:opacity-50 disabled:pointer-events-none"
                )}
                onClick={toggleVoiceRecording}
                disabled={disabled}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
                <span className="text-xs">{listening ? t('workspace.recording') : 'Voice'}</span>
              </button>
            )}

            {/* Model Selector - shadcn-io/ai style */}
            {showModelSelector && (
              <div className="relative">
                <button
                  ref={modelButtonRef}
                  type="button"
                  className={cn(
                    "inline-flex items-center justify-between gap-1",
                    "h-8 px-3 rounded-lg",
                    "text-xs text-text-muted",
                    "hover:bg-bg-hover/80",
                    "transition-colors",
                    "min-w-[120px]"
                  )}
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                >
                  <span>{currentModel.name}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-transform", showModelDropdown && "rotate-180")}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {/* Model Dropdown - shadcn-io/ai style */}
                {showModelDropdown && createPortal(
                  <div 
                    className="fixed inset-0 z-50"
                    onClick={() => setShowModelDropdown(false)}
                  >
                    <div 
                      ref={modelDropdownRef}
                      className={cn(
                        "absolute bg-bg-primary border border-border-light rounded-xl",
                        "shadow-lg py-1 min-w-[180px]",
                        "animate-fade-in"
                      )}
                      style={(() => {
                        const buttonRect = modelButtonRef.current?.getBoundingClientRect()
                        if (!buttonRect) return {}
                        
                        // Calculate if input is in bottom half of screen
                        const isInBottomHalf = buttonRect.top > window.innerHeight / 2
                        const dropdownHeight = MODELS.length * 40 + 8 // Approximate height
                        
                        if (isInBottomHalf) {
                          // Dropdown opens upward
                          return {
                            bottom: window.innerHeight - buttonRect.top + 4,
                            left: buttonRect.left
                          }
                        } else {
                          // Dropdown opens downward
                          return {
                            top: buttonRect.bottom + 4,
                            left: buttonRect.left
                          }
                        }
                      })()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {MODELS.map((model) => (
                        <button
                          key={model.id}
                          className={cn(
                            "w-full px-3 py-2 text-left",
                            "flex items-center justify-between",
                            "text-sm text-text-primary",
                            "hover:bg-bg-hover",
                            "transition-colors"
                          )}
                          onClick={() => {
                            onModelChange?.(model.id)
                            setShowModelDropdown(false)
                          }}
                        >
                          <span>{model.name}</span>
                          {selectedModel === model.id && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-primary">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>,
                  document.body
                )}
              </div>
            )}
          </div>

          {/* Send Button - shadcn-io/ai style (paper plane icon) */}
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center",
              "h-8 w-8 rounded-lg",
              "transition-colors",
              hasContent && status === 'ready'
                ? "bg-text-primary text-bg-primary hover:bg-text-primary/90" 
                : "bg-bg-hover text-text-muted cursor-not-allowed",
              "disabled:opacity-50"
            )}
            onClick={handleSend}
            disabled={disabled || !hasContent || status !== 'ready'}
          >
            {status === 'submitted' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={[...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_DOC_TYPES].join(',')}
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}

export default ModernChatInput
