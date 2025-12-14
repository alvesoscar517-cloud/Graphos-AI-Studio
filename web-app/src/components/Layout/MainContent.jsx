import HomeView from '../Views/HomeView'
import AIStudioView from '../Views/AIStudioView'
import WorkspaceView from '../Views/WorkspaceView'
import HistoryView from '../Views/HistoryView'
import CreditHistoryView from '../Views/CreditHistoryView'
import { cn } from '../../lib/utils'

const MainContent = ({ 
  currentView, 
  viewParams = {},
  onViewChange, 
  onToggleLeftSidebar, 
  onToggleRightSidebar,
  rightSidebarHidden,
  leftSidebarHidden,
  analysisData,
  rewriteMode
}) => {
  return (
    <main 
      className={cn(
        "flex-1 flex flex-col h-full overflow-hidden bg-bg-tertiary",
        "min-w-0", // Important: allows flex item to shrink below content size
        "relative z-base", // Lower z-index to allow sidebar popups to appear above
        "rounded-md" // Floating panel effect
      )}
    >
      {currentView === 'home' && (
        <HomeView 
          onToggleLeftSidebar={onToggleLeftSidebar}
          onViewChange={onViewChange}
        />
      )}
      
      {currentView === 'aistudio-editor' && (
        <AIStudioView 
          onToggleLeftSidebar={onToggleLeftSidebar}
          onToggleRightSidebar={onToggleRightSidebar}
          rightSidebarHidden={rightSidebarHidden}
          onViewChange={onViewChange}
          analysisData={analysisData}
          rewriteMode={rewriteMode}
        />
      )}

      {currentView === 'workspace' && (
        <WorkspaceView 
          onToggleLeftSidebar={onToggleLeftSidebar}
          onToggleRightSidebar={onToggleRightSidebar}
          rightSidebarHidden={rightSidebarHidden}
          leftSidebarHidden={leftSidebarHidden}
          initialHelpMode={viewParams.helpMode}
        />
      )}
      
      {currentView === 'history' && (
        <HistoryView 
          onToggleLeftSidebar={onToggleLeftSidebar}
          onViewChange={onViewChange}
        />
      )}

      {currentView === 'credit-history' && (
        <CreditHistoryView 
          onToggleLeftSidebar={onToggleLeftSidebar}
          onViewChange={onViewChange}
        />
      )}
    </main>
  )
}

export default MainContent
