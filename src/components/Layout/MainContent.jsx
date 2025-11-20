import HomeView from '../Views/HomeView'
import PlaygroundView from '../Views/PlaygroundView'
import HistoryView from '../Views/HistoryView'

const MainContent = ({ 
  currentView, 
  onViewChange, 
  onToggleLeftSidebar, 
  onToggleRightSidebar,
  rightSidebarHidden,
  leftSidebarHidden,
  highlightedSentence
}) => {
  return (
    <main 
      className="main-content"
      style={{
        marginLeft: leftSidebarHidden ? 0 : '238px',
        marginRight: rightSidebarHidden ? 0 : '300px',
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
