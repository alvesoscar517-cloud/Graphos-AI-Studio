import { useState } from 'react'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import WorkspaceDefault from './Workspace/WorkspaceDefault'
import WorkspaceChat from './Workspace/WorkspaceChat'
import WorkspaceSidebar from './Workspace/WorkspaceSidebar'
import SharedChatInput from './Workspace/SharedChatInput'
import './WorkspaceView.css'

const WorkspaceView = ({ 
  onToggleLeftSidebar, 
  onToggleRightSidebar,
  rightSidebarHidden,
  leftSidebarHidden
}) => {
  const { currentConversation, sendMessage, isLoading, clearConversation } = useWorkspace()
  const [isTransitioning, setIsTransitioning] = useState(false)

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
    <div className="workspace-view">
      {showDefaultView ? (
        <>
          <div 
            className="workspace-default-wrapper"
            style={{
              paddingRight: rightSidebarHidden ? 0 : '300px',
              transition: 'padding 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <WorkspaceDefault 
              onToggleLeftSidebar={onToggleLeftSidebar}
              onToggleRightSidebar={onToggleRightSidebar}
              rightSidebarHidden={rightSidebarHidden}
            />
            
            {/* Shared Input - centered when no conversation */}
            <SharedChatInput
              onSendMessage={handleSendMessage}
              disabled={isLoading || isTransitioning}
              isCentered={true}
              autoFocus={true}
              rightSidebarHidden={rightSidebarHidden}
            />
          </div>
          {/* Show sidebar even on default screen */}
          <WorkspaceSidebar 
            hidden={rightSidebarHidden} 
            onClose={onToggleRightSidebar}
            onNewChat={handleStartChat}
          />
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
