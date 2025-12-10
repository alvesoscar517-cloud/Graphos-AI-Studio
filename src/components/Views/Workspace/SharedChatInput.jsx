import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils'

const SharedChatInput = ({ 
  onSendMessage, 
  disabled, 
  isCentered = false,
  isInline = false, // New prop: render inline without absolute positioning
  placeholder,
  autoFocus = false,
  rightSidebarHidden = false,
  leftSidebarHidden = false,
  initialMessage = ''
}) => {
  const { t } = useTranslation()
  const defaultPlaceholder = placeholder || t('workspace.askAnything')
  const [message, setMessage] = useState(initialMessage)
  const [showSendBtn, setShowSendBtn] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setShowSendBtn(message.trim().length > 0)
  }, [message])

  // Update message when initialMessage changes (from quick actions)
  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage)
      // Focus textarea and move cursor to end
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(initialMessage.length, initialMessage.length)
      }
    }
  }, [initialMessage])

  // Auto-resize textarea (1 line default, max 3 lines)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'
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
        textareaRef.current.style.height = '24px'
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
    console.log('Files selected:', files)
    e.target.value = ''
  }

  return (
    <div className={cn("w-full", isCentered && "max-w-2xl mx-auto")}>
      <div className={cn(
          "flex items-center gap-2 rounded-2xl py-2 px-3 min-h-11",
          "bg-bg-primary border border-border-light",
          "shadow-sm",
          !isCentered && [
            "bg-bg-primary/95",
            "backdrop-blur-md"
          ],
          "transition-all duration-200",
          "hover:border-border-hover focus-within:border-border-hover"
        )}>
          <button 
            type="button"
            className={cn(
              "p-1 bg-transparent border-none cursor-pointer rounded-full",
              "flex items-center justify-center shrink-0",
              "opacity-60 transition-opacity duration-200",
              "hover:opacity-100",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            data-tooltip={t('common.attach')}
            data-tooltip-position="top"
          >
            <img src="/icon/paperclip.svg" alt={t('common.attach')} className="w-4.5 h-4.5 opacity-70 icon-invert" />
          </button>

          <textarea
            ref={textareaRef}
            className={cn(
              "flex-1 border-none bg-transparent resize-none",
              "text-text-primary text-sm",
              "py-1 px-1 outline-none",
              "min-h-5 max-h-16",
              "overflow-y-auto scrollbar-none",
              "font-[Google_Sans,Roboto,sans-serif]",
              "placeholder:text-text-muted placeholder:opacity-60",
              "leading-normal"
            )}
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
              className={cn(
                "w-7 h-7 rounded-full border-none cursor-pointer shrink-0",
                "flex items-center justify-center relative p-0",
                "bg-primary text-white",
                "transition-colors duration-200",
                "hover:bg-primary-hover",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-border-light"
              )}
              onClick={handleSend}
              disabled={disabled}
              data-tooltip={t('common.send')}
              data-tooltip-position="top"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
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
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  )
}

export default SharedChatInput
