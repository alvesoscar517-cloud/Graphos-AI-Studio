import { useState, useCallback } from 'react'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import WorkspaceDefault from './Workspace/WorkspaceDefault'
import WorkspaceChat from './Workspace/WorkspaceChat'
import ModernChatInput from './Workspace/ModernChatInput'
import { cn } from '../../lib/utils'

const WorkspaceView = ({ 
  onToggleLeftSidebar, 
  onToggleRightSidebar,
  rightSidebarHidden,
  leftSidebarHidden,
  initialHelpMode = false
}) => {
  const { currentConversation, sendMessage, isLoading, clearConversation, modelSettings, updateModelSettings } = useWorkspace()
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleModelChange = useCallback((modelId) => {
    updateModelSettings({ model: modelId })
  }, [updateModelSettings])

  const handleStartChat = () => {
    // Clear current conversation to return to default interface
    clearConversation()
  }

  const handleSendMessage = useCallback(async (message) => {
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
  }, [currentConversation, sendMessage])

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
              onSendMessage={handleSendMessage}
              chatInput={
                <ModernChatInput
                  onSendMessage={handleSendMessage}
                  disabled={isLoading || isTransitioning}
                  isCentered={true}
                  autoFocus={true}
                  selectedModel={modelSettings?.model || 'gemini-2.5-flash'}
                  onModelChange={handleModelChange}
                  showModelSelector={true}
                  initialHelpMode={initialHelpMode}
                />
              }
            />
          </div>
          {/* WorkspaceSidebar is now rendered in MainLayout */}
        </>
      ) : (
        <WorkspaceChat 
          onToggleLeftSidebar={onToggleLeftSidebar}
          onToggleRightSidebar={onToggleRightSidebar}
          rightSidebarHidden={rightSidebarHidden}
          chatInput={
            <ModernChatInput
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              isCentered={false}
              autoFocus={false}
              selectedModel={modelSettings?.model || 'gemini-2.5-flash'}
              onModelChange={handleModelChange}
              showModelSelector={true}
            />
          }
        />
      )}
    </div>
  )
}

export default WorkspaceView
