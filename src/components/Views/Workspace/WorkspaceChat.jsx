import { useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../../../contexts/WorkspaceContext'
import ChatMessage from './ChatMessage'
import WorkspaceSidebar from './WorkspaceSidebar'
import SharePopup from '../../Popups/SharePopup'
import Lottie from 'lottie-react'
import threeDotsAnimation from '../../../animation/Three dots loading.json'

const WorkspaceChat = ({ onToggleLeftSidebar, onToggleRightSidebar, rightSidebarHidden }) => {
  const { currentConversation, isLoading, updateConversationTitle, clearConversation } = useWorkspace()
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const [title, setTitle] = useState('')
  const [displayTitle, setDisplayTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isTypingTitle, setIsTypingTitle] = useState(false)
  const [showSharePopup, setShowSharePopup] = useState(false)
  const titleInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Typing effect for title
  useEffect(() => {
    if (currentConversation && currentConversation.title !== displayTitle) {
      const newTitle = currentConversation.title
      
      // Only apply typing effect if title was just generated
      if (currentConversation.titleGenerated && !currentConversation.userEditedTitle && newTitle !== 'New Chat') {
        setIsTypingTitle(true)
        let currentIndex = 0
        
        const typeNextChar = () => {
          if (currentIndex < newTitle.length) {
            setDisplayTitle(newTitle.substring(0, currentIndex + 1))
            currentIndex++
            typingTimeoutRef.current = setTimeout(typeNextChar, 30) // 30ms per character
          } else {
            setIsTypingTitle(false)
          }
        }
        
        typeNextChar()
        
        return () => {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
          }
        }
      } else {
        // No typing effect, just set directly
        setDisplayTitle(newTitle)
      }
    }
  }, [currentConversation?.title, currentConversation?.titleGenerated])

  useEffect(() => {
    if (currentConversation) {
      setTitle(currentConversation.title)
      if (!isTypingTitle) {
        setDisplayTitle(currentConversation.title)
      }
    }
  }, [currentConversation, isTypingTitle])

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentConversation?.messages])

  // Detect scroll position to show/hide scroll button
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!isNearBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleTitleChange = (e) => {
    setTitle(e.target.value)
  }

  const handleTitleSave = () => {
    setIsEditingTitle(false)
    const trimmedTitle = title.trim()
    if (trimmedTitle && trimmedTitle !== currentConversation?.title) {
      // Limit to 60 characters
      const limitedTitle = trimmedTitle.substring(0, 60)
      updateConversationTitle?.(currentConversation.id, limitedTitle, true)
      setTitle(limitedTitle)
      setDisplayTitle(limitedTitle)
    } else {
      setTitle(currentConversation?.title || '')
      setDisplayTitle(currentConversation?.title || '')
    }
  }

  const handleTitleBlur = () => {
    handleTitleSave()
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTitleSave()
    } else if (e.key === 'Escape') {
      setTitle(currentConversation?.title || '')
      setIsEditingTitle(false)
    }
  }

  const handleEditClick = () => {
    setIsEditingTitle(true)
  }

  const handleShareClick = () => {
    if (currentConversation && currentConversation.messages.length > 0) {
      setShowSharePopup(true)
    }
  }

  return (
    <>
      {showSharePopup && currentConversation && (
        <SharePopup 
          item={{
            id: currentConversation.id,
            title: currentConversation.title,
            type: 'chat',
            updated: new Date(currentConversation.updated),
            data: currentConversation
          }}
          onClose={() => setShowSharePopup(false)}
        />
      )}
      <div 
        className="workspace-chat-container"
        style={{
          marginRight: rightSidebarHidden ? 0 : '300px',
          transition: 'margin-right 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Header */}
        <div className="workspace-header">
          <button 
            className="menu-btn icon-btn" 
            onClick={onToggleLeftSidebar}
            data-tooltip="Ẩn/hiện sidebar" 
            data-tooltip-position="right"
          >
            <img src="/icon/panel-left.svg" alt="Toggle Sidebar" />
          </button>

          <div className="workspace-title-container">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                className="workspace-title-input"
                value={title}
                onChange={handleTitleChange}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleTitleBlur}
                placeholder="Nhập tiêu đề..."
                maxLength={60}
                autoFocus
              />
            ) : (
              <div className={`workspace-title-display ${isTypingTitle ? 'typing' : ''}`}>
                {displayTitle}
              </div>
            )}
            {!isEditingTitle && (
              <button 
                className="title-edit-btn"
                onClick={handleEditClick}
                data-tooltip="Sửa tiêu đề"
                data-tooltip-position="bottom"
                disabled={isTypingTitle}
              >
                <img src="/icon/pencil.svg" alt="Edit" />
              </button>
            )}
          </div>

          <div className="workspace-header-actions">
            <button 
              className="icon-btn"
              onClick={clearConversation}
              data-tooltip="New chat" 
              data-tooltip-position="left"
            >
              <img src="/icon/plus.svg" alt="New Chat" />
            </button>
            <button 
              className="icon-btn"
              onClick={handleShareClick}
              data-tooltip="Chia sẻ cuộc trò chuyện" 
              data-tooltip-position="left"
              disabled={!currentConversation || currentConversation.messages.length === 0}
            >
              <img src="/icon/share-2.svg" alt="Share" />
            </button>
            {rightSidebarHidden && (
              <button 
                className="icon-btn"
                onClick={onToggleRightSidebar}
                data-tooltip="Mở sidebar" 
                data-tooltip-position="left"
              >
                <img src="/icon/panel-right.svg" alt="Toggle Right Sidebar" />
              </button>
            )}
          </div>
        </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="workspace-messages" 
        style={{ paddingBottom: '80px' }}
      >
        {currentConversation?.messages.length === 0 ? (
          <div className="workspace-empty">
            <img src="/icon/message-circle.svg" alt="Empty" className="workspace-empty-icon" />
            <h3 className="workspace-empty-title">Bắt đầu cuộc trò chuyện</h3>
            <p className="workspace-empty-desc">
              Hỏi bất cứ điều gì, AI sẽ trả lời theo phong cách của bạn
            </p>
          </div>
        ) : (
          <>
            {currentConversation.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="workspace-loading">
                <Lottie 
                  animationData={threeDotsAnimation} 
                  loop={true}
                  style={{ width: 60, height: 40 }}
                />
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button 
          className="scroll-to-bottom-btn"
          onClick={scrollToBottom}
          data-tooltip="Về tin nhắn mới nhất"
          data-tooltip-position="top"
        >
          <img src="/icon/arrow-down.svg" alt="Scroll to bottom" />
        </button>
      )}
      </div>

      {/* Right Sidebar */}
      <WorkspaceSidebar 
        hidden={rightSidebarHidden} 
        onClose={onToggleRightSidebar}
        onNewChat={clearConversation}
      />
    </>
  )
}

export default WorkspaceChat
