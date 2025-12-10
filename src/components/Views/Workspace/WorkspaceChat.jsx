import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWorkspace } from '../../../contexts/WorkspaceContext'
import { truncateTitleByWords } from '../../../utils/titleUtils'
import { cn } from '../../../lib/utils'
import ChatMessage from './ChatMessage'
import EditTitleModal from '../../Common/EditTitleModal'
import LazyLottie from '../../Common/LazyLottie'
import threeDotsAnimation from '../../../animation/Three dots loading.json'

const WorkspaceChat = ({ onToggleLeftSidebar, onToggleRightSidebar, rightSidebarHidden, chatInput }) => {
  const { t } = useTranslation()
  const { currentConversation, isLoading, updateConversationTitle, clearConversation } = useWorkspace()
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const [title, setTitle] = useState('')
  const [displayTitle, setDisplayTitle] = useState('')
  const [showEditTitleModal, setShowEditTitleModal] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isTypingTitle, setIsTypingTitle] = useState(false)
  
  // Track if this is initial load from history (don't auto-scroll)
  const isInitialLoadRef = useRef(true)
  const prevConversationIdRef = useRef(null)

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

  // Track conversation changes - mark as initial load when switching conversations
  useEffect(() => {
    if (currentConversation?.id !== prevConversationIdRef.current) {
      isInitialLoadRef.current = true
      prevConversationIdRef.current = currentConversation?.id
    }
  }, [currentConversation?.id])

  // Auto-scroll to bottom only for new messages, not when loading from history
  useEffect(() => {
    if (!currentConversation?.messages?.length) return
    
    // Skip auto-scroll on initial load from history (conversation has existing messages)
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
      // Scroll to top instead for history
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = 0
      }
      return
    }
    
    // Auto-scroll for new messages
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

  return (
    <>
      <div 
        className="flex flex-col flex-1 h-full bg-bg-tertiary overflow-hidden"
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
        className="flex-1 overflow-y-auto py-6 workspace-scrollbar"
        style={{ paddingBottom: '100px', scrollbarGutter: 'stable' }}
      >
        <div className="max-w-3xl mx-auto px-4 flex flex-col gap-6">
          {currentConversation?.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <img src="/icon/message-circle.svg" alt="Empty" className="w-12 h-12 opacity-30 mb-4 icon-invert" />
              <h3 className="text-lg font-medium text-text-primary mb-2">{t('workspace.startConversation')}</h3>
              <p className="text-sm text-text-secondary">
                {t('workspace.askAnythingAI')}
              </p>
            </div>
          ) : (
            <>
              {currentConversation.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {/* Show loading only when isLoading AND last message is not streaming with content */}
              {isLoading && (() => {
                const lastMsg = currentConversation.messages[currentConversation.messages.length - 1]
                const isStreamingWithContent = lastMsg?.streaming && lastMsg?.content?.length > 0
                return !isStreamingWithContent
              })() && (
                <div className="flex justify-start py-2">
                  <LazyLottie 
                    animationData={threeDotsAnimation} 
                    loop={true}
                    style={{ width: 50, height: 30 }}
                  />
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button 
          className="absolute bottom-24 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-bg-primary border border-border-light shadow-md flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-bg-hover hover:shadow-lg z-10"
          onClick={scrollToBottom}
          data-tooltip={t('workspace.scrollDown')}
          data-tooltip-position="top"
        >
          <img src="/icon/arrow-down.svg" alt={t('workspace.scrollDown')} className="w-4 h-4 opacity-60 icon-invert" />
        </button>
      )}

      {/* Chat Input - positioned at bottom, aligned with messages */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        {/* Gradient fade - covers full width */}
        <div className="h-8 bg-gradient-to-t from-bg-tertiary to-transparent" />
        {/* Input wrapper - same width as messages area, pr-2 to match scrollbar-gutter */}
        <div className="bg-bg-tertiary pr-2">
          <div className="max-w-3xl mx-auto px-4 pb-4 pointer-events-auto">
            {chatInput}
          </div>
        </div>
      </div>
      </div>

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
