import { useState, useCallback } from 'react'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import WorkspaceDefault from './Workspace/WorkspaceDefault'
import WorkspaceChat from './Workspace/WorkspaceChat'
import SharedChatInput from './Workspace/SharedChatInput'
import { cn } from '../../lib/utils'

const WorkspaceView = ({ 
  onToggleLeftSidebar, 
  onToggleRightSidebar,
  rightSidebarHidden,
  leftSidebarHidden
}) => {
  const { currentConversation, sendMessage, isLoading, clearConversation } = useWorkspace()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [quickActionPrompt, setQuickActionPrompt] = useState('')

  // Handle quick action click - set prompt to input
  const handleQuickAction = useCallback((prompt) => {
    setQuickActionPrompt(prompt)
  }, [])

  const handleStartChat = () => {
    // Clear current conversation to return to default interface
    clearConversation()
  }

  const handleSendMessage = async (message) => {
    if (!currentConversation) {
      // Trigger transition animation
      setIsTransitioning(true)
      
      // Wait a bit for visual feedback, then send message
      setTimeout(async () => {
        await sendMessage(message)
        setIsTransitioning(false)
      }, 100)
    } else {
      await sendMessage(message)
    }
  }

  // Show default view when no conversation OR conversation has no messages
  const showDefaultView = !currentConversation || currentConversation.messages.length === 0

  return (
    <div className={cn(
      "flex flex-col flex-1 bg-bg-tertiary",
      "h-screen overflow-hidden relative"
    )}>
      {showDefaultView ? (
        <>
          <div 
            className="absolute inset-0 z-base"
          >
            <WorkspaceDefault 
              onToggleLeftSidebar={onToggleLeftSidebar}
              onToggleRightSidebar={onToggleRightSidebar}
              rightSidebarHidden={rightSidebarHidden}
              onQuickAction={handleQuickAction}
              chatInput={
                <SharedChatInput
                  onSendMessage={handleSendMessage}
                  disabled={isLoading || isTransitioning}
                  isCentered={true}
                  isInline={true}
                  autoFocus={true}
                  rightSidebarHidden={rightSidebarHidden}
                  initialMessage={quickActionPrompt}
                />
              }
            />
          </div>
          {/* WorkspaceSidebar is now rendered in MainLayout */}
        </>
      ) : (
        <>
          <WorkspaceChat 
            onToggleLeftSidebar={onToggleLeftSidebar}
            onToggleRightSidebar={onToggleRightSidebar}
            rightSidebarHidden={rightSidebarHidden}
          />
          
          {/* Shared Input - bottom when in conversation */}
          <SharedChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            isCentered={false}
            autoFocus={false}
            rightSidebarHidden={rightSidebarHidden}
            leftSidebarHidden={leftSidebarHidden}
          />
        </>
      )}
    </div>
  )
}

export default WorkspaceView
