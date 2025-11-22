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
  const { currentConversation, createConversation, sendMessage, isLoading } = useWorkspace()
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleStartChat = () => {
    createConversation('New Chat')
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

  const isCentered = !currentConversation && !isTransitioning

  return (
    <div className="workspace-view">
      {!currentConversation ? (
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
              onStartChat={handleStartChat}
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
