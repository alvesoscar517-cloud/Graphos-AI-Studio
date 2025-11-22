import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import './ChatMessage.css'

const ChatMessage = ({ message }) => {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isError = message.error

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-ai'} ${isError ? 'chat-message-error' : ''}`}>
      <div className="chat-message-content-wrapper">
        {isUser ? (
          <div className="chat-message-bubble">
            <p className="chat-message-text">{message.content}</p>
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="chat-message-attachments">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="chat-attachment">
                    {attachment.type?.startsWith('image/') ? (
                      <img src={attachment.url} alt={attachment.name} />
                    ) : (
                      <div className="chat-attachment-file">
                        <img src="/icon/file.svg" alt="File" />
                        <span>{attachment.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="chat-message-ai-content">
            <div className="chat-message-markdown">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            
            <button 
              className="chat-message-copy"
              onClick={handleCopy}
              data-tooltip={copied ? 'Đã sao chép!' : 'Sao chép'}
              data-tooltip-position="top"
            >
              <img src={copied ? "/icon/check.svg" : "/icon/copy.svg"} alt="Copy" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessage
