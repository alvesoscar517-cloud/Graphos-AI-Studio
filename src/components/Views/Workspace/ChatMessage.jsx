import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { useWorkspace } from '../../../contexts/WorkspaceContext'
import Icon from '../../Common/Icon'
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
        return '/icon/clock.svg'
      case 'RATE_LIMITED':
        return '/icon/alert-triangle.svg'
      case 'CONTENT_BLOCKED':
        return '/icon/shield.svg'
      case 'NETWORK_ERROR':
        return '/icon/wifi-off.svg'
      default:
        return '/icon/alert-circle.svg'
    }
  }

  return (
    <div className={cn(
      "flex w-full mb-6 animate-message-in",
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
            <p className="m-0 leading-relaxed text-sm whitespace-pre-wrap text-text-primary">
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
                  <div className="flex items-start gap-2.5">
                    <Icon name={getErrorIcon().replace('/icon/', '').replace('.svg', '')} size="md" color="error" className="shrink-0" />
                    <span className="text-sm leading-relaxed text-error">
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
                <div className={cn(
                  "text-sm leading-relaxed text-text-primary",
                  "will-change-contents",
                  "[contain:layout_style]",
                  "[-webkit-font-smoothing:antialiased]",
                  "[-moz-osx-font-smoothing:grayscale]",
                  "[text-rendering:optimizeSpeed]",
                  // Markdown styles
                  "[&_p]:m-0 [&_p]:mb-2 [&_p:last-child]:mb-0",
                  "[&_code]:bg-bg-tertiary [&_code]:py-0.5 [&_code]:px-1.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm",
                  "[&_pre]:bg-bg-tertiary [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-2",
                  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
                  "[&_ul]:my-2 [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:pl-6",
                  "[&_li]:my-1",
                  "[&_strong]:font-semibold",
                  "[&_em]:italic",
                  "[&_a]:underline",
                  "[&_blockquote]:border-l-4 [&_blockquote]:border-border-light [&_blockquote]:pl-3 [&_blockquote]:my-2"
                )}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                
                {/* Only show copy button when not streaming and has content */}
                {!message.streaming && message.content && (
                  <button 
                    className={cn(
                      "bg-transparent border-none p-1.5 cursor-pointer rounded-md mt-2",
                      "opacity-50 inline-flex items-center justify-center",
                      "hover:opacity-100 hover:bg-bg-hover"
                    )}
                    onClick={handleCopy}
                    data-tooltip={copied ? t('common.copied') : t('common.copy')}
                    data-tooltip-position="top"
                  >
                    <img 
                      src={copied ? "/icon/check.svg" : "/icon/copy.svg"} 
                      alt={t('common.copy')} 
                      className="w-4 h-4 icon-invert"
                    />
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
