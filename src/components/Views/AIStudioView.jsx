import { useNotes } from '../../contexts/NotesContext'
import AIStudioEditorEnhanced from './AIStudio/AIStudioEditorEnhanced'
import './AIStudioView.css'

const AIStudioView = ({ 
  onToggleLeftSidebar, 
  onToggleRightSidebar,
  rightSidebarHidden,
  onViewChange,
  analysisData,
  rewriteMode
}) => {
  const { createNote } = useNotes()

  const handleCreateNote = () => {
    createNote()
  }

  return (
    <div className="aistudio-view">
      <AIStudioEditorEnhanced 
        onToggleLeftSidebar={onToggleLeftSidebar}
        onToggleRightSidebar={onToggleRightSidebar}
        rightSidebarHidden={rightSidebarHidden}
        onCreateNote={handleCreateNote}
        externalAnalysisData={analysisData}
        rewriteMode={rewriteMode}
      />
    </div>
  )
}

export default AIStudioView
