import { useState } from 'react'
import Sidebar from './Sidebar'
import MainContent from './MainContent'
import RightSidebar from './RightSidebar'

const MainLayout = () => {
  const [leftSidebarHidden, setLeftSidebarHidden] = useState(false)
  const [rightSidebarHidden, setRightSidebarHidden] = useState(false)
  const [currentView, setCurrentView] = useState('playground') // 'home', 'playground', 'history'
  const [highlightedSentence, setHighlightedSentence] = useState(null) // NEW: For highlighting sentence in editor

  // Auto hide/show right sidebar based on view
  const shouldShowRightSidebar = currentView === 'playground-editor'

  return (
    <div className="container">
      <Sidebar 
        hidden={leftSidebarHidden}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      <MainContent 
        currentView={currentView}
        onViewChange={setCurrentView}
        onToggleLeftSidebar={() => setLeftSidebarHidden(!leftSidebarHidden)}
        onToggleRightSidebar={() => setRightSidebarHidden(!rightSidebarHidden)}
        rightSidebarHidden={rightSidebarHidden || !shouldShowRightSidebar}
        leftSidebarHidden={leftSidebarHidden}
        highlightedSentence={highlightedSentence}
      />
      <RightSidebar 
        hidden={rightSidebarHidden || !shouldShowRightSidebar}
        onClose={() => setRightSidebarHidden(true)}
        onHighlightSentence={setHighlightedSentence}
      />
    </div>
  )
}

export default MainLayout
