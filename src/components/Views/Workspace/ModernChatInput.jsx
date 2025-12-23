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

// Help prefix for app context detection
const HELP_PREFIX = '[APP_HELP] '

// Graphos AI Models
const MODELS = [
  { id: 'gemini-2.5-flash-lite', name: 'Graphos Velocity' },
  { id: 'gemini-2.5-flash', name: 'Graphos Hyper' },
  { id: 'gemini-2.5-pro', name: 'Graphos Zenith' }
]

const ModernChatInput = ({
  onSendMessage,
  disabled,
  isCentered = false,
  placeholder,
  autoFocus = false,
  initialMessage = '',
  selectedModel = 'gemini-2.5-flash',
  onModelChange,
  showModelSelector = true,
  initialHelpMode = false
}) => {
  const { t } = useTranslation()
  const defaultPlaceholder = placeholder || t('workspace.askAnything')
  
  const [message, setMessage] = useState(initialMessage)
  const [attachments, setAttachments] = useState([])
  const [uploadError, setUploadError] = useState(null)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [status, setStatus] = useState('ready') // ready, submitted, streaming
  const [isHelpMode, setIsHelpMode] = useState(initialHelpMode) // Help mode for app context
  
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const modelDropdownRef = useRef(null)
  const modelButtonRef = useRef(null)
  const plusButtonRef = useRef(null)
  const plusMenuRef = useRef(null)

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

  // Update help mode when initialHelpMode changes
  useEffect(() => {
    if (initialHelpMode) {
      setIsHelpMode(true)
      textareaRef.current?.focus()
    }
  }, [initialHelpMode])

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target) &&
          modelButtonRef.current && !modelButtonRef.current.contains(e.target)) {
        setShowModelDropdown(false)
      }
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target) &&
          plusButtonRef.current && !plusButtonRef.current.contains(e.target)) {
        setShowPlusMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0]

  const handleSend = useCallback(() => {
    if ((message.trim() || attachments.length > 0) && !disabled && status === 'ready') {
      setStatus('submitted')
      // Prepend help prefix if in help mode
      const finalMessage = isHelpMode ? HELP_PREFIX + message.trim() : message.trim()
      onSendMessage(finalMessage, attachments)
      setMessage('')
      setAttachments([])
      setIsHelpMode(false) // Reset help mode after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      // Reset status after a short delay
      setTimeout(() => setStatus('ready'), 500)
    }
  }, [message, attachments, disabled, onSendMessage, status, isHelpMode])

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
    setShowPlusMenu(false)
  }

  const handleHelpClick = () => {
    setIsHelpMode(true)
    setShowPlusMenu(false)
    textareaRef.current?.focus()
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
    <div className={cn("w-full", isCentered &&"max-w-2xl mx-auto")}>
      {/* Upload Error */}
      {uploadError && (
        <div className={cn("flex items-center gap-2 py-2 px-3 mb-2","bg-error/10 border border-error/20 rounded-lg","text-sm text-error"
        )}>
          <Icon name="alert-circle" size="sm" color="error" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Main Input Container - shadcn-io/ai style */}
      <div className={cn("relative flex flex-col","bg-bg-primary border border-border-light rounded-2xl","shadow-sm"
      )}>
        {/* Attachments Preview - inside input container */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3 pb-0">
            {attachments.map((attachment, index) => (
              <div 
                key={index} 
                className={cn("flex items-center gap-2 py-1.5 px-2","bg-bg-secondary/50 border border-border-light/50 rounded-lg","max-w-[200px]"
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
                  <span className="text-xs text-text-primary truncate">
                    {attachment.name.length > 15 ? attachment.name.substring(0, 12) + '...' : attachment.name}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {formatFileSize(attachment.size)}
                  </span>
                </div>
                <button 
                  className={cn("p-1 bg-transparent border-none cursor-pointer rounded","opacity-50 flex items-center justify-center","hover:opacity-100 hover:bg-bg-hover"
                  )}
                  onClick={() => handleRemoveAttachment(index)}
                >
                  <Icon name="x" size="xs" color="muted" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          className={cn("w-full border-none bg-transparent resize-none","text-text-primary text-sm","px-4 pt-3 pb-2","outline-none min-h-[44px] max-h-[200px]","overflow-y-auto","placeholder:text-text-muted/60"
          )}
          placeholder={isHelpMode ? t('workspace.helpPlaceholder') : defaultPlaceholder}
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
            {/* Plus Menu Button */}
            <div className="relative">
              <button
                ref={plusButtonRef}
                type="button"
                className={cn("inline-flex items-center justify-center gap-2","h-8 w-8 rounded-lg","text-text-muted hover:text-text-primary","hover:bg-bg-hover/80","transition-colors","disabled:opacity-50 disabled:pointer-events-none"
                )}
                onClick={() => setShowPlusMenu(!showPlusMenu)}
                disabled={disabled}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>

              {/* Plus Menu Dropdown */}
              {showPlusMenu && createPortal(
                <div 
                  className="fixed inset-0 z-50"
                  onClick={() => setShowPlusMenu(false)}
                >
                  <div 
                    ref={plusMenuRef}
                    className={cn("absolute bg-bg-primary border border-border rounded-xl","shadow-lg p-1.5 min-w-[180px]","animate-fade-in"
                    )}
                    style={(() => {
                      const buttonRect = plusButtonRef.current?.getBoundingClientRect()
                      if (!buttonRect) return {}
                      
                      const dropdownHeight = 3 * 40 + 8
                      const spaceBelow = window.innerHeight - buttonRect.bottom
                      const shouldOpenUpward = spaceBelow < dropdownHeight + 20
                      
                      if (shouldOpenUpward) {
                        return {
                          bottom: window.innerHeight - buttonRect.top + 4,
                          left: buttonRect.left
                        }
                      } else {
                        return {
                          top: buttonRect.bottom + 4,
                          left: buttonRect.left
                        }
                      }
                    })()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Images Option */}
                    <button
                      className={cn("w-full px-3 py-2 text-left rounded-lg","flex items-center gap-3","text-sm text-text-primary","hover:bg-fill-tertiary","transition-colors"
                      )}
                      onClick={() => {
                        imageInputRef.current?.click()
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                      <span>{t('workspace.plusMenu.images')}</span>
                    </button>

                    {/* Files Option */}
                    <button
                      className={cn("w-full px-3 py-2 text-left rounded-lg","flex items-center gap-3","text-sm text-text-primary","hover:bg-fill-tertiary","transition-colors"
                      )}
                      onClick={() => {
                        fileInputRef.current?.click()
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span>{t('workspace.plusMenu.files')}</span>
                    </button>

                    {/* Help Option - Info icon */}
                    <button
                      className={cn("w-full px-3 py-2 text-left rounded-lg","flex items-center gap-3","text-sm text-text-primary","hover:bg-fill-tertiary","transition-colors"
                      )}
                      onClick={handleHelpClick}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                      <span>{t('workspace.plusMenu.help')}</span>
                    </button>
                  </div>
                </div>,
                document.body
              )}
            </div>

            {/* Voice Input Button */}
            {browserSupportsSpeechRecognition && (
              <button
                type="button"
                className={cn("inline-flex items-center justify-center gap-2","h-8 px-3 rounded-lg","text-text-muted hover:text-text-primary","hover:bg-bg-hover/80","transition-colors",
                  listening &&"text-error bg-error/10","disabled:opacity-50 disabled:pointer-events-none"
                )}
                onClick={toggleVoiceRecording}
                disabled={disabled}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
                <span className="text-xs">{listening ? t('workspace.recording') : t('workspace.voice')}</span>
              </button>
            )}

            {/* Help Mode Indicator */}
            {isHelpMode && (
              <button
                type="button"
                onClick={() => setIsHelpMode(false)}
                className={cn("inline-flex items-center gap-1.5","h-8 px-3 rounded-lg","bg-bg-hover text-text-primary","hover:bg-bg-secondary","transition-colors cursor-pointer","group"
                )}
              >
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span className="text-xs">{t('workspace.plusMenu.help')}</span>
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-text-muted group-hover:text-text-primary ml-0.5"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}

            {/* Model Selector - shadcn-io/ai style */}
            {showModelSelector && (
              <div className="relative">
                <button
                  ref={modelButtonRef}
                  type="button"
                  className={cn("inline-flex items-center justify-between gap-1","h-8 px-3 rounded-lg","text-xs text-text-muted","hover:bg-bg-hover/80","transition-colors","min-w-[120px]"
                  )}
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                >
                  <span>{currentModel.name}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-transform", showModelDropdown &&"rotate-180")}>
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
                      className={cn("absolute bg-bg-primary border border-border rounded-xl","shadow-lg p-1.5 min-w-[180px]","animate-fade-in"
                      )}
                      style={(() => {
                        const buttonRect = modelButtonRef.current?.getBoundingClientRect()
                        if (!buttonRect) return {}
                        
                        const dropdownHeight = MODELS.length * 40 + 8 // Approximate height
                        const spaceBelow = window.innerHeight - buttonRect.bottom
                        
                        // Only show upward if not enough space below (input is at bottom)
                        const shouldOpenUpward = spaceBelow < dropdownHeight + 20
                        
                        if (shouldOpenUpward) {
                          // Dropdown opens upward (only when input is at bottom)
                          return {
                            bottom: window.innerHeight - buttonRect.top + 4,
                            left: buttonRect.left
                          }
                        } else {
                          // Default: Dropdown opens downward
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
                          className={cn("w-full px-3 py-2 text-left rounded-lg","flex items-center justify-between","text-sm text-text-primary","hover:bg-fill-tertiary","transition-colors"
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
            className={cn("inline-flex items-center justify-center","h-8 w-8 rounded-lg","transition-colors",
              hasContent && status === 'ready'
                ?"bg-text-primary text-bg-primary hover:bg-text-primary/90" 
                :"bg-bg-hover text-text-muted cursor-not-allowed","disabled:opacity-50"
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

      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept={SUPPORTED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={SUPPORTED_DOC_TYPES.join(',')}
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}

export default ModernChatInput
