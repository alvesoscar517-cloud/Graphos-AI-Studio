import { useState } from 'react'
import Sidebar from './Sidebar'
import MainContent from './MainContent'
import RightSidebar from './RightSidebar'
import { useNotes } from '../../contexts/NotesContext'

const MainLayout = () => {
  const [leftSidebarHidden, setLeftSidebarHidden] = useState(false)
  const [rightSidebarHidden, setRightSidebarHidden] = useState(false)
  const [currentView, setCurrentView] = useState('home') // Default open Home
  const [highlightedSentence, setHighlightedSentence] = useState(null) // NEW: For highlighting sentence in editor
  const [analysisData, setAnalysisData] = useState(null) // NEW: For inline highlighting
  const [rewriteMode, setRewriteMode] = useState(false) // NEW: For showing rewrite toolbar
  const { createNote } = useNotes()

  // Reset right sidebar state when switching to workspace
  const handleViewChange = (view, options = {}) => {
    if (view === 'workspace') {
      setRightSidebarHidden(false) // Show workspace sidebar by default
    }
    // Only create new note when createNew flag is set
    if (view === 'aistudio-editor' && options.createNew) {
      createNote()
    }
    setCurrentView(view)
  }

  // Auto hide/show right sidebar based on view
  // Workspace has its own sidebar, so don't show RightSidebar for it
  const shouldShowRightSidebar = currentView === 'aistudio-editor'
  
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
        analysisData={analysisData}
        rewriteMode={rewriteMode}
      />
      {/* Only show RightSidebar for aistudio-editor, not for workspace */}
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
