import { useNotes } from '../../contexts/NotesContext'
import PlaygroundDefault from './Playground/PlaygroundDefault'
import PlaygroundEditor from './Playground/PlaygroundEditor'
import './PlaygroundView.css'

const PlaygroundView = ({ 
  showEditor, 
  onToggleLeftSidebar, 
  onToggleRightSidebar,
  rightSidebarHidden,
  onViewChange,
  highlightedSentence
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
        <PlaygroundEditor 
          onToggleLeftSidebar={onToggleLeftSidebar}
          onToggleRightSidebar={onToggleRightSidebar}
          rightSidebarHidden={rightSidebarHidden}
          onCreateNote={handleCreateNote}
          highlightedSentence={highlightedSentence}
        />
      )}
    </div>
  )
}

export default PlaygroundView
