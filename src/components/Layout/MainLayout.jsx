import { useState } from 'react'
import Sidebar from './Sidebar'
import MainContent from './MainContent'
import RightSidebar from './RightSidebar'

const MainLayout = () => {
  const [leftSidebarHidden, setLeftSidebarHidden] = useState(false)
  const [rightSidebarHidden, setRightSidebarHidden] = useState(false)
  const [currentView, setCurrentView] = useState('playground') // 'home', 'playground', 'history', 'workspace'
  const [highlightedSentence, setHighlightedSentence] = useState(null) // NEW: For highlighting sentence in editor
  const [analysisData, setAnalysisData] = useState(null) // NEW: For inline highlighting
  const [rewriteMode, setRewriteMode] = useState(false) // NEW: For showing rewrite toolbar

  // Reset right sidebar state when switching to workspace
  const handleViewChange = (view) => {
    if (view === 'workspace') {
      setRightSidebarHidden(false) // Show workspace sidebar by default
    }
    setCurrentView(view)
  }

  // Auto hide/show right sidebar based on view
  // Workspace has its own sidebar, so don't show RightSidebar for it
  const shouldShowRightSidebar = currentView === 'playground-editor'
  
  // For workspace, pass rightSidebarHidden directly (not affected by shouldShowRightSidebar)
  const effectiveRightSidebarHidden = currentView === 'workspace' 
    ? rightSidebarHidden 
    : (rightSidebarHidden || !shouldShowRightSidebar)

  return (
    <div className="container">
      <Sidebar 
        hidden={leftSidebarHidden}
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      <MainContent 
        currentView={currentView}
        onViewChange={handleViewChange}
        onToggleLeftSidebar={() => setLeftSidebarHidden(!leftSidebarHidden)}
        onToggleRightSidebar={() => setRightSidebarHidden(!rightSidebarHidden)}
        rightSidebarHidden={effectiveRightSidebarHidden}
        leftSidebarHidden={leftSidebarHidden}
        highlightedSentence={highlightedSentence}
        analysisData={analysisData}
        rewriteMode={rewriteMode}
      />
      {/* Only show RightSidebar for playground-editor, not for workspace */}
      {currentView !== 'workspace' && (
        <RightSidebar 
          hidden={rightSidebarHidden || !shouldShowRightSidebar}
          onClose={() => setRightSidebarHidden(true)}
          onHighlightSentence={setHighlightedSentence}
          onAnalysisComplete={setAnalysisData}
          onModeChange={(mode) => setRewriteMode(mode === 'rewrite')}
        />
      )}
    </div>
  )
}

export default MainLayout
