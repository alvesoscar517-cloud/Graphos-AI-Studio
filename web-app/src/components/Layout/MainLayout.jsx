import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import MainContent from './MainContent'
import RightSidebar from './RightSidebar'
import WorkspaceSidebar from '../Views/Workspace/WorkspaceSidebar'
import { useNotes } from '../../contexts/NotesContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { cn } from '../../lib/utils'

// Breakpoints for responsive behavior
const BREAKPOINT_MOBILE = 768
const BREAKPOINT_TABLET = 1024

const MainLayout = () => {
  const [leftSidebarHidden, setLeftSidebarHidden] = useState(false)
  const [rightSidebarHidden, setRightSidebarHidden] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // Detect screen size and auto-adjust sidebars with debounce
  useEffect(() => {
    let resizeTimeout
    
    const checkScreenSize = () => {
      const width = window.innerWidth
      const mobile = width < BREAKPOINT_MOBILE
      const tablet = width >= BREAKPOINT_MOBILE && width < BREAKPOINT_TABLET
      
      setIsMobile(mobile)
      setIsTablet(tablet)
      
      // Auto-hide right sidebar on mobile
      if (mobile) {
        setRightSidebarHidden(true)
      }
      // Auto-collapse left sidebar on tablet
      if (tablet && !leftSidebarHidden) {
        // Let Sidebar component handle collapse state
      }
    }
    
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(checkScreenSize, 100)
    }
    
    checkScreenSize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [leftSidebarHidden])
  const [currentView, setCurrentView] = useState('home') // Default open Home
  const [viewParams, setViewParams] = useState({}) // NEW: For passing params to views
  const [highlightedSentence, setHighlightedSentence] = useState(null) // NEW: For highlighting sentence in editor
  const [analysisData, setAnalysisData] = useState(null) // NEW: For inline highlighting
  const [rewriteMode, setRewriteMode] = useState(false) // NEW: For showing rewrite toolbar
  const { createNote } = useNotes()
  const { clearConversation } = useWorkspace()

  // Reset right sidebar state when switching to workspace
  const handleViewChange = (view, options = {}) => {
    if (view === 'workspace') {
      setRightSidebarHidden(false) // Show workspace sidebar by default
      // Clear current conversation when createNew flag is set (clicking AI Workspace menu)
      if (options.createNew) {
        clearConversation()
      }
    }
    // Only create new note when createNew flag is set
    if (view === 'aistudio-editor' && options.createNew) {
      createNote()
    }
    setViewParams(options) // Store view params
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
        viewParams={viewParams}
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
