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
        className="flex flex-col flex-1 h-full bg-bg-tertiary overflow-hidden"
        style={{
          marginRight: rightSidebarHidden ? 0 : '300px',
          transition: 'margin-right 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 py-2 px-4 border-b border-border-light bg-bg-tertiary h-14 shrink-0">
          <button 
            className="p-1.5 bg-transparent border-none cursor-pointer rounded-full w-8 h-8 shrink-0 flex items-center justify-center transition-colors duration-200 hover:bg-bg-hover" 
            onClick={onToggleLeftSidebar}
            data-tooltip={t('common.menu')} 
            data-tooltip-position="right"
          >
            <img src="/icon/panel-left.svg" alt={t('common.menu')} className="w-icon-lg h-icon-lg opacity-60 icon-invert" />
          </button>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div 
              className={`text-sm font-medium text-text-primary py-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis cursor-default max-w-xl shrink-0 ${isTypingTitle ? 'animate-pulse' : ''}`}
              title={currentConversation?.title || ''}
            >
              {displayTitle}
            </div>
            <button 
              className="bg-transparent border-none p-1.5 cursor-pointer rounded-md shrink-0 flex items-center justify-center opacity-50 transition-all duration-200 hover:opacity-100 hover:bg-bg-hover hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={handleEditClick}
              data-tooltip={t('common.edit')}
              data-tooltip-position="bottom"
              disabled={isTypingTitle}
            >
              <img src="/icon/pencil.svg" alt={t('common.edit')} className="w-3.5 h-3.5 icon-invert" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 bg-transparent border-none cursor-pointer rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200 hover:bg-bg-hover"
              onClick={clearConversation}
              data-tooltip={t('common.new')} 
              data-tooltip-position="left"
            >
              <img src="/icon/plus.svg" alt={t('workspace.newChat')} className="w-icon-lg h-icon-lg opacity-60 icon-invert" />
            </button>
            <button 
              className="p-1.5 bg-transparent border-none cursor-pointer rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200 hover:bg-bg-hover disabled:opacity-30"
              onClick={handleShareClick}
              data-tooltip={t('common.share')} 
              data-tooltip-position="left"
              disabled={!currentConversation || currentConversation.messages.length === 0}
            >
              <img src="/icon/share-2.svg" alt={t('common.share')} className="w-icon-lg h-icon-lg opacity-60 icon-invert" />
            </button>
            {rightSidebarHidden && (
              <button 
                className="p-1.5 bg-transparent border-none cursor-pointer rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200 hover:bg-bg-hover"
                onClick={onToggleRightSidebar}
                data-tooltip={t('nav.sidebar')} 
                data-tooltip-position="left"
              >
                <img src="/icon/panel-right.svg" alt={t('nav.sidebar')} className="w-icon-lg h-icon-lg opacity-60 icon-invert" />
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
