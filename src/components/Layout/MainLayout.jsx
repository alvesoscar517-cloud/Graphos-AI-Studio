import { useState } from 'react'
import Sidebar from './Sidebar'
import MainContent from './MainContent'
import RightSidebar from './RightSidebar'
import WorkspaceSidebar from '../Views/Workspace/WorkspaceSidebar'
import { useNotes } from '../../contexts/NotesContext'
import { cn } from '../../lib/utils'

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
    <div className={cn(
      "flex h-screen w-full overflow-hidden bg-bg-secondary",
      "p-1.5 gap-1.5" // Floating panels effect (6px)
    )}>
      <Sidebar 
        hidden={leftSidebarHidden}
        currentView={currentView}
        onViewChange={handleViewChange}
        onToggle={() => setLeftSidebarHidden(!leftSidebarHidden)}
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
      {/* Show RightSidebar for aistudio-editor */}
      {currentView === 'aistudio-editor' && (
        <RightSidebar 
          hidden={rightSidebarHidden || !shouldShowRightSidebar}
          onClose={() => setRightSidebarHidden(true)}
          onHighlightSentence={setHighlightedSentence}
          onAnalysisComplete={setAnalysisData}
          onModeChange={(mode) => setRewriteMode(mode === 'rewrite')}
        />
      )}
      {/* Show WorkspaceSidebar for workspace */}
      {currentView === 'workspace' && (
        <WorkspaceSidebar 
          hidden={rightSidebarHidden}
          onClose={() => setRightSidebarHidden(true)}
        />
      )}
    </div>
  )
}

export default MainLayout
