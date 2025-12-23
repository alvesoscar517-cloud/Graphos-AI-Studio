import { useNotes } from '../../contexts/NotesContext'
import AIStudioEditorEnhanced from './AIStudio/AIStudioEditorEnhanced'
import { cn } from '../../lib/utils'

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
    <div className={cn("flex flex-col flex-1 bg-bg-tertiary","h-screen w-full overflow-hidden box-border"
    )}>
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
