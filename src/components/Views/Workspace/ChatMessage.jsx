import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWorkspace } from '../../../contexts/WorkspaceContext'
import Icon from '../../Common/Icon'
import MarkdownResponse from './MarkdownResponse'
import { cn } from '../../../lib/utils'

const ChatMessage = ({ message }) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const { retryLastMessage, isLoading } = useWorkspace()
  const isUser = message.role === 'user'
  const isError = message.error

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRetry = () => {
    if (!isLoading) {
      retryLastMessage()
    }
  }

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
              {message.content}
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
                <MarkdownResponse streaming={message.streaming}>
                  {message.content}
                </MarkdownResponse>
                
                {/* Copy button - only show when not streaming and has content */}
                {!message.streaming && message.content && (
                  <button 
                    className={cn(
                      "bg-transparent border-none p-1.5 cursor-pointer rounded-md mt-3",
                      "inline-flex items-center gap-1.5",
                      "text-text-muted text-xs",
                      "hover:bg-bg-hover hover:text-text-primary",
                      "transition-all duration-200"
                    )}
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                    )}
                    <span>{copied ? t('common.copied') : t('common.copyResponse')}</span>
                  </button>
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
