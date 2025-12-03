import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils'

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
    <div 
      className={cn(
        "absolute left-0 right-0 z-sidebar pointer-events-none",
        isCentered ? [
          "top-1/2 -translate-y-1/2 px-6",
          "transition-all duration-600 ease-smooth"
        ] : [
          "fixed bottom-0 translate-y-0 p-4 bg-transparent",
          "animate-slide-to-bottom"
        ],
        "max-md:px-4 max-md:p-3"
      )}
      style={{
        marginLeft: leftSidebarHidden ? 0 : (isCentered ? 0 : '238px'),
        marginRight: rightSidebarHidden ? 0 : '300px',
        transition: 'margin 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className={cn(
        "mx-auto pointer-events-auto max-w-2xl"
      )}>
        <div className={cn(
          "flex items-center gap-2 rounded-3xl py-2.5 px-4 min-h-12",
          "bg-bg-primary border border-border-hover",
          "shadow-sm",
          !isCentered && [
            "bg-bg-primary/95",
            "backdrop-blur-md"
          ],
          "transition-all duration-200"
        )}>
          <button 
            type="button"
            className={cn(
              "p-1.5 bg-transparent border-none cursor-pointer rounded-full",
              "flex items-center justify-center shrink-0",
              "opacity-70 transition-opacity duration-200",
              "hover:opacity-100",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            data-tooltip={t('common.attach')}
            data-tooltip-position="top"
          >
            <img src="/icon/paperclip.svg" alt={t('common.attach')} className="w-5 h-5 opacity-70 icon-invert" />
          </button>

          <textarea
            ref={textareaRef}
            className={cn(
              "flex-1 border-none bg-transparent resize-none self-center",
              "text-md text-text-primary",
              "py-0 px-1 outline-none",
              "min-h-6 max-h-20 leading-6",
              "overflow-y-auto scrollbar-none",
              "font-[Google_Sans,Roboto,sans-serif]",
              "placeholder:text-text-muted placeholder:opacity-60",
              !isCentered && "text-sm"
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
                "w-8 h-8 rounded-full border-none cursor-pointer shrink-0",
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
                width="18" 
                height="18" 
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
    </div>
  )
}

export default SharedChatInput
