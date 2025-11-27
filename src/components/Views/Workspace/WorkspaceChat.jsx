import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWorkspace } from '../../../contexts/WorkspaceContext'
import { truncateTitleByWords } from '../../../utils/titleUtils'
import useAutoScrollbar from '../../../hooks/useAutoScrollbar'
import ChatMessage from './ChatMessage'
import WorkspaceSidebar from './WorkspaceSidebar'
import SharePopup from '../../Popups/SharePopup'
import EditTitleModal from '../../Common/EditTitleModal'
import Lottie from 'lottie-react'
import threeDotsAnimation from '../../../animation/Three dots loading.json'

const WorkspaceChat = ({ onToggleLeftSidebar, onToggleRightSidebar, rightSidebarHidden }) => {
  const { t } = useTranslation()
  const { currentConversation, isLoading, updateConversationTitle, clearConversation } = useWorkspace()
  const messagesEndRef = useRef(null)
  const [title, setTitle] = useState('')
  
  // Auto-show scrollbar khi scroll nhiều
  const { containerRef: messagesContainerRef, scrollbarClassName } = useAutoScrollbar({
    scrollThreshold: 50,
    hideDelay: 1500,
    showOnHover: true
  })
  const [displayTitle, setDisplayTitle] = useState('')
  const [showEditTitleModal, setShowEditTitleModal] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isTypingTitle, setIsTypingTitle] = useState(false)
  const [showSharePopup, setShowSharePopup] = useState(false)
  const typingTimeoutRef = useRef(null)

  // Typing effect for title
  useEffect(() => {
    if (currentConversation && currentConversation.title !== displayTitle) {
      const newTitle = currentConversation.title
      // Truncate to 7 words for display
      const truncatedTitle = truncateTitleByWords(newTitle, 7)
      
      // Only apply typing effect if title was just generated
      if (currentConversation.titleGenerated && !currentConversation.userEditedTitle && newTitle !== t('workspace.newChat')) {
        setIsTypingTitle(true)
        let currentIndex = 0
        
        const typeNextChar = () => {
          if (currentIndex < truncatedTitle.length) {
            setDisplayTitle(truncatedTitle.substring(0, currentIndex + 1))
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
        // No typing effect, just set directly (still truncate for display)
        setDisplayTitle(truncatedTitle)
      }
    }
  }, [currentConversation?.title, currentConversation?.titleGenerated, t])

  useEffect(() => {
    if (currentConversation) {
      setTitle(currentConversation.title) // Keep full title for editing
      if (!isTypingTitle) {
        // Truncate to 7 words for display only
        setDisplayTitle(truncateTitleByWords(currentConversation.title, 7))
      }
    }
  }, [currentConversation, isTypingTitle])

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

  const handleEditClick = () => {
    setShowEditTitleModal(true)
  }

  const handleTitleSave = (newTitle) => {
    if (newTitle && newTitle !== currentConversation?.title) {
      updateConversationTitle?.(currentConversation.id, newTitle, true)
      setTitle(newTitle)
      setDisplayTitle(truncateTitleByWords(newTitle, 7))
    }
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
            data-tooltip={t('common.menu')} 
            data-tooltip-position="right"
          >
            <img src="/icon/panel-left.svg" alt={t('common.menu')} />
          </button>

          <div className="workspace-title-container">
            <div 
              className={`workspace-title-display ${isTypingTitle ? 'typing' : ''}`}
              title={currentConversation?.title || ''}
            >
              {displayTitle}
            </div>
            <button 
              className="title-edit-btn"
              onClick={handleEditClick}
              data-tooltip={t('common.edit')}
              data-tooltip-position="bottom"
              disabled={isTypingTitle}
            >
              <img src="/icon/pencil.svg" alt={t('common.edit')} />
            </button>
          </div>

          <div className="workspace-header-actions">
            <button 
              className="icon-btn"
              onClick={clearConversation}
              data-tooltip={t('common.new')} 
              data-tooltip-position="left"
            >
              <img src="/icon/plus.svg" alt={t('workspace.newChat')} />
            </button>
            <button 
              className="icon-btn"
              onClick={handleShareClick}
              data-tooltip={t('common.share')} 
              data-tooltip-position="left"
              disabled={!currentConversation || currentConversation.messages.length === 0}
            >
              <img src="/icon/share-2.svg" alt={t('common.share')} />
            </button>
            {rightSidebarHidden && (
              <button 
                className="icon-btn"
                onClick={onToggleRightSidebar}
                data-tooltip={t('nav.sidebar')} 
                data-tooltip-position="left"
              >
                <img src="/icon/panel-right.svg" alt={t('nav.sidebar')} />
              </button>
            )}
          </div>
        </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className={`workspace-messages ${scrollbarClassName}`}
        style={{ paddingBottom: '80px' }}
      >
        {currentConversation?.messages.length === 0 ? (
          <div className="workspace-empty">
            <img src="/icon/message-circle.svg" alt="Empty" className="workspace-empty-icon" />
            <h3 className="workspace-empty-title">{t('workspace.startConversation')}</h3>
            <p className="workspace-empty-desc">
              {t('workspace.askAnythingAI')}
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
          data-tooltip={t('workspace.scrollDown')}
          data-tooltip-position="top"
        >
          <img src="/icon/arrow-down.svg" alt={t('workspace.scrollDown')} />
        </button>
      )}
      </div>

      {/* Right Sidebar */}
      <WorkspaceSidebar 
        hidden={rightSidebarHidden} 
        onClose={onToggleRightSidebar}
        onNewChat={clearConversation}
      />

      {/* Edit Title Modal */}
      <EditTitleModal
        isOpen={showEditTitleModal}
        currentTitle={currentConversation?.title || ''}
        onSave={handleTitleSave}
        onClose={() => setShowEditTitleModal(false)}
        maxLength={100}
      />
    </>
  )
}

export default WorkspaceChat
