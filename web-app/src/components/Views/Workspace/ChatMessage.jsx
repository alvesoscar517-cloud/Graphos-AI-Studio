import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useWorkspace } from '../../../contexts/WorkspaceContext'
import Icon from '../../Common/Icon'
import MarkdownResponse from './MarkdownResponse'
import ImportToWorkspacePopup from '../../Popups/ImportToWorkspacePopup'
import { cn } from '../../../lib/utils'
import { useSpeech } from '../../../hooks'

// Help prefix for app context detection
const HELP_PREFIX = '[APP_HELP] '

const ChatMessage = ({ message, isLastMessage = false }) => {
  const { t, i18n } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [showImportPopup, setShowImportPopup] = useState(false)
  const { retryLastMessage, isLoading } = useWorkspace()
  const { speak, stop, isSpeaking, isSupported } = useSpeech()
  const isUser = message.role === 'user'
  const isError = message.error
  
  // Check if message has help prefix and get clean content (strip prefix for display)
  const displayContent = message.content?.startsWith(HELP_PREFIX) 
    ? message.content.slice(HELP_PREFIX.length) 
    : message.content

  // Ref to get rendered text from MarkdownResponse
  const responseRef = useRef(null)

  const handleCopy = async () => {
    try {
      const element = responseRef.current
      if (element) {
        // Get both HTML and plain text from rendered content
        const html = element.innerHTML
        const plainText = element.innerText
        
        // Use Clipboard API to copy both formats (rich text + plain text fallback)
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([plainText], { type: 'text/plain' })
          })
        ])
      } else {
        // Fallback to plain text
        await navigator.clipboard.writeText(message.content)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers that don't support ClipboardItem
      const plainText = responseRef.current?.innerText || message.content
      navigator.clipboard.writeText(plainText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRetry = () => {
    if (!isLoading) {
      retryLastMessage()
    }
  }

  // Handle regenerate response
  const handleRegenerate = () => {
    if (!isLoading) {
      retryLastMessage()
    }
  }

  // Handle text-to-speech
  const handleListen = () => {
    if (isSpeaking) {
      stop()
    } else {
      const text = responseRef.current?.innerText || message.content
      speak(text, i18n.language)
    }
  }

  // Stop speech when component unmounts or message changes
  useEffect(() => {
    return () => stop()
  }, [message.id])

  // Get error icon based on error code
  const getErrorIcon = () => {
    switch (message.errorCode) {
      case 'QUOTA_EXCEEDED':
        return 'clock'
      case 'RATE_LIMITED':
        return 'alert-triangle'
      case 'CONTENT_BLOCKED':
        return 'shield'
      case 'NETWORK_ERROR':
        return 'wifi-off'
      default:
        return 'alert-circle'
    }
  }

  return (
    <div className={cn(
      "flex w-full animate-message-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex flex-col",
        isUser ? "items-end max-w-7/10" : "items-start w-full"
      )}>
        {isUser ? (
          <div className={cn(
            "py-3 px-4 rounded-2xl break-words",
            "bg-bg-secondary border border-border-light"
          )}>
            <p className="m-0 leading-[1.6] text-base whitespace-pre-wrap text-text-primary">
              {displayContent}
            </p>
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="max-w-attachment rounded-lg overflow-hidden">
                    {attachment.type?.startsWith('image/') || attachment.mimeType?.startsWith('image/') ? (
                      <img 
                        src={attachment.url || `data:${attachment.mimeType};base64,${attachment.base64}`} 
                        alt={attachment.name}
                        className="w-full h-auto block"
                      />
                    ) : (
                      <div className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm bg-bg-hover">
                        <img src="/icon/file.svg" alt={t('chat.file')} className="w-5 h-5 opacity-60 icon-invert" />
                        <span className="text-text-primary">{attachment.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={cn(
            "w-full relative",
            isError && "text-error"
          )}>
            {isError ? (
              <div className={cn(
                "bg-error/10 border border-error/20",
                "rounded-xl p-4"
              )}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <Icon name={getErrorIcon()} size="md" color="error" className="shrink-0" />
                    <span className="text-base leading-[1.6] text-error">
                      {message.content}
                    </span>
                  </div>
                  <button 
                    className={cn(
                      "inline-flex items-center gap-1.5 py-2 px-4 w-fit",
                      "bg-error/10 border border-error/30 rounded-lg",
                      "text-error text-sm font-medium",
                      "cursor-pointer transition-all duration-200",
                      "hover:bg-error/15 hover:border-error/40",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                    onClick={handleRetry}
                    disabled={isLoading}
                  >
                    <Icon name="refresh-cw" size="sm" color="error" />
                    <span>{t('common.retry')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* AI Response with MarkdownResponse component */}
                <div ref={responseRef}>
                  <MarkdownResponse className="" streaming={message.streaming}>
                    {message.content}
                  </MarkdownResponse>
                </div>
                
                {/* Action buttons - only show when not streaming and has content */}
                {!message.streaming && message.content && (
                  <div className="relative flex items-center gap-1 mt-3">
                    {/* Copy button */}
                    <button 
                      className={cn(
                        "bg-transparent border-none p-1.5 cursor-pointer rounded-md",
                        "inline-flex items-center justify-center",
                        "text-text-muted",
                        "hover:bg-bg-hover hover:text-text-primary",
                        "transition-all duration-200"
                      )}
                      onClick={handleCopy}
                      data-tooltip={copied ? t('common.copied') : t('common.copy')}
                      data-tooltip-position="top"
                    >
                      {copied ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      )}
                    </button>

                    {/* Regenerate button */}
                    <button 
                      className={cn(
                        "bg-transparent border-none p-1.5 cursor-pointer rounded-md",
                        "inline-flex items-center justify-center",
                        "text-text-muted",
                        "hover:bg-bg-hover hover:text-text-primary",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      onClick={handleRegenerate}
                      disabled={isLoading}
                      data-tooltip={t('workspace.regenerate')}
                      data-tooltip-position="top"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 16h5v5" />
                      </svg>
                    </button>

                    {/* Listen button - only show if TTS is supported */}
                    {isSupported && (
                      <button 
                        className={cn(
                          "bg-transparent border-none p-1.5 cursor-pointer rounded-md",
                          "inline-flex items-center justify-center",
                          "text-text-muted",
                          "hover:bg-bg-hover hover:text-text-primary",
                          "transition-all duration-200",
                          isSpeaking && "text-primary"
                        )}
                        onClick={handleListen}
                        data-tooltip={isSpeaking ? t('workspace.stopListening') : t('workspace.listen')}
                        data-tooltip-position="top"
                      >
                        {isSpeaking ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                          </svg>
                        )}
                      </button>
                    )}
                    
                    {/* Import button */}
                    <div className="relative">
                      <button 
                        className={cn(
                          "bg-transparent border-none p-1.5 cursor-pointer rounded-md",
                          "inline-flex items-center justify-center",
                          "text-text-muted",
                          "hover:bg-bg-hover hover:text-text-primary",
                          "transition-all duration-200"
                        )}
                        onClick={() => setShowImportPopup(!showImportPopup)}
                        data-tooltip={t('workspace.import', 'Import')}
                        data-tooltip-position="top"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                      
                      {/* Import Popup */}
                      {showImportPopup && (
                        <ImportToWorkspacePopup
                          content={message.content}
                          htmlContent={responseRef.current?.innerHTML}
                          onClose={() => setShowImportPopup(false)}
                          onImport={() => {}}
                        />
                      )}
                    </div>
                  </div>
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
