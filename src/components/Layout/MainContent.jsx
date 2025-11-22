import HomeView from '../Views/HomeView'
import PlaygroundView from '../Views/PlaygroundView'
import WorkspaceView from '../Views/WorkspaceView'
import HistoryView from '../Views/HistoryView'

const MainContent = ({ 
  currentView, 
  onViewChange, 
  onToggleLeftSidebar, 
  onToggleRightSidebar,
  rightSidebarHidden,
  leftSidebarHidden,
  highlightedSentence,
  analysisData
}) => {
  // Only add margin-right for playground-editor (RightSidebar)
  // Workspace handles its own sidebar internally
  const shouldAddRightMargin = currentView === 'playground-editor' && !rightSidebarHidden
  
  return (
    <main 
      className="main-content"
      style={{
        marginLeft: leftSidebarHidden ? 0 : '238px',
        marginRight: shouldAddRightMargin ? '300px' : 0,
        transition: 'margin 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {currentView === 'home' && (
        <HomeView 
          onToggleLeftSidebar={onToggleLeftSidebar}
          onViewChange={onViewChange}
        />
      )}
      
      {(currentView === 'playground' || currentView === 'playground-editor') && (
        <PlaygroundView 
          showEditor={currentView === 'playground-editor'}
          onToggleLeftSidebar={onToggleLeftSidebar}
          onToggleRightSidebar={onToggleRightSidebar}
          rightSidebarHidden={rightSidebarHidden}
          onViewChange={onViewChange}
          highlightedSentence={highlightedSentence}
          analysisData={analysisData}
        />
      )}

      {currentView === 'workspace' && (
        <WorkspaceView 
          onToggleLeftSidebar={onToggleLeftSidebar}
          onToggleRightSidebar={onToggleRightSidebar}
          rightSidebarHidden={rightSidebarHidden}
          leftSidebarHidden={leftSidebarHidden}
        />
      )}
      
      {currentView === 'history' && (
        <HistoryView 
          onToggleLeftSidebar={onToggleLeftSidebar}
          onViewChange={onViewChange}
        />
      )}
    </main>
  )
}

export default MainContent
