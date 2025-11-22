import { useNotes } from '../../contexts/NotesContext'
import PlaygroundDefault from './Playground/PlaygroundDefault'
import PlaygroundEditorEnhanced from './Playground/PlaygroundEditorEnhanced'
import './PlaygroundView.css'

const PlaygroundView = ({ 
  showEditor, 
  onToggleLeftSidebar, 
  onToggleRightSidebar,
  rightSidebarHidden,
  onViewChange,
  highlightedSentence,
  analysisData
}) => {
  const { createNote } = useNotes()

  const handleCreateNote = () => {
    createNote()
    onViewChange('playground-editor')
  }

  return (
    <div className="playground-view">
      {!showEditor ? (
        <PlaygroundDefault 
          onToggleLeftSidebar={onToggleLeftSidebar}
          onCreateNote={handleCreateNote}
        />
      ) : (
        <PlaygroundEditorEnhanced 
          onToggleLeftSidebar={onToggleLeftSidebar}
          onToggleRightSidebar={onToggleRightSidebar}
          rightSidebarHidden={rightSidebarHidden}
          onCreateNote={handleCreateNote}
          externalAnalysisData={analysisData}
        />
      )}
    </div>
  )
}

export default PlaygroundView
