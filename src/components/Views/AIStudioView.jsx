import { useNotes } from '../../contexts/NotesContext'
import AIStudioDefault from './AIStudio/AIStudioDefault'
import AIStudioEditorEnhanced from './AIStudio/AIStudioEditorEnhanced'
import './AIStudioView.css'

const AIStudioView = ({ 
  showEditor, 
  onToggleLeftSidebar, 
  onToggleRightSidebar,
  rightSidebarHidden,
  onViewChange,
  highlightedSentence,
  analysisData,
  rewriteMode
}) => {
  const { createNote } = useNotes()

  const handleCreateNote = () => {
    createNote()
    onViewChange('aistudio-editor')
  }

  return (
    <div className="aistudio-view">
      {!showEditor ? (
        <AIStudioDefault 
          onToggleLeftSidebar={onToggleLeftSidebar}
          onCreateNote={handleCreateNote}
        />
      ) : (
        <AIStudioEditorEnhanced 
          onToggleLeftSidebar={onToggleLeftSidebar}
          onToggleRightSidebar={onToggleRightSidebar}
          rightSidebarHidden={rightSidebarHidden}
          onCreateNote={handleCreateNote}
          externalAnalysisData={analysisData}
          rewriteMode={rewriteMode}
        />
      )}
    </div>
  )
}

export default AIStudioView
