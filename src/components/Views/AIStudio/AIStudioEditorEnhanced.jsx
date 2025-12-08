import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNotes } from '../../../contexts/NotesContext'
import { useAIProcessing } from '@/stores'
import { useProfiles } from '../../../contexts/ProfileContext'

import { truncateTitleByWords } from '../../../utils/titleUtils'
import TextHighlightEditor from '../../Analysis/TextHighlightEditor'
import EditTitleModal from '../../Common/EditTitleModal'
import TokenBadge from '../../Common/TokenBadge'
import { cn } from '../../../lib/utils'

const AIStudioEditorEnhanced = ({ 
  onToggleLeftSidebar, 
  onToggleRightSidebar, 
  rightSidebarHidden,
  onCreateNote,
  externalAnalysisData
}) => {
  const { t } = useTranslation()
  const { currentNote, updateNote } = useNotes()
  const { isProcessing } = useAIProcessing()
  const { currentProfile } = useProfiles()
  
  const [analysis, setAnalysis] = useState(null)
  const [showHighlights, setShowHighlights] = useState(true)
  const [hasHighlights, setHasHighlights] = useState(false)
  const [displayTitle, setDisplayTitle] = useState('')
  const [showEditTitleModal, setShowEditTitleModal] = useState(false)
  const [isTypingTitle, setIsTypingTitle] = useState(false)
  const titleGenerationTimeoutRef = useRef(null)
  const isGeneratingTitleRef = useRef(false)

  // Store currentNote and updateNote in refs to avoid dependency issues
  const currentNoteRef = useRef(currentNote)
  currentNoteRef.current = currentNote
  
  const updateNoteRef = useRef(updateNote)
  updateNoteRef.current = updateNote
  
  // Track previous values to prevent unnecessary effect runs
  const prevContentRef = useRef(null)
  const prevNoteIdRef = useRef(null)

  // Auto-generate title when user types/pastes content
  useEffect(() => {
    const note = currentNoteRef.current
    if (!note) return
    
    const noteId = note.id
    const content = note.content?.trim() || ''
    
    // Skip if note ID hasn't changed but content is the same
    if (prevNoteIdRef.current === noteId && prevContentRef.current === content) {
      return
    }
    
    // Update refs
    prevNoteIdRef.current = noteId
    prevContentRef.current = content
    
    // Skip if title already generated or user edited
    if (note.userEditedTitle || note.titleGenerated || note.title !== 'Untitled') {
      return
    }
    
    // Need at least 15 characters to generate title
    if (!content || content.length < 15 || isGeneratingTitleRef.current) {
      return
    }

    // Clear any pending timeout
    if (titleGenerationTimeoutRef.current) {
      clearTimeout(titleGenerationTimeoutRef.current)
    }

    // Generate title after short delay (500ms for quick response)
    titleGenerationTimeoutRef.current = setTimeout(() => {
      const currentNoteNow = currentNoteRef.current
      if (!currentNoteNow || currentNoteNow.id !== noteId) return
      if (isGeneratingTitleRef.current) return
      if (currentNoteNow.title !== 'Untitled' || currentNoteNow.userEditedTitle || currentNoteNow.titleGenerated) return
      
      isGeneratingTitleRef.current = true
      try {
        const currentContent = currentNoteNow.content?.trim() || ''
        if (currentContent.length < 15) return
        
        const firstSentence = currentContent.split(/[.!?。\n]/)[0]?.trim() || currentContent
        const newTitle = truncateTitleByWords(firstSentence, 7)
        if (newTitle && newTitle.length > 0) {
          updateNoteRef.current(currentNoteNow.id, { title: newTitle, titleGenerated: true })
        }
      } finally {
        isGeneratingTitleRef.current = false
      }
    }, 500)

    return () => {
      if (titleGenerationTimeoutRef.current) {
        clearTimeout(titleGenerationTimeoutRef.current)
      }
    }
  }, [currentNote?.content, currentNote?.id])

  // Track previous externalAnalysisData to avoid duplicate processing
  const prevAnalysisDataRef = useRef(null)
  
  useEffect(() => {
    if (!externalAnalysisData) return
    // Skip if same analysis data
    if (prevAnalysisDataRef.current === externalAnalysisData) return
    prevAnalysisDataRef.current = externalAnalysisData
    
    setAnalysis(externalAnalysisData)
    setShowHighlights(true)
    
    // DISABLED: Auto-generate title on analysis complete
    // This was causing potential infinite loops
    // Title generation is now only done manually or via the first useEffect
  }, [externalAnalysisData])

  // Track previous title to avoid unnecessary updates
  const prevTitleRef = useRef(null)
  
  useEffect(() => {
    if (!currentNote) return
    
    const newTitle = currentNote.title
    const truncatedTitle = truncateTitleByWords(newTitle, 7)
    
    // Skip if title hasn't changed
    if (prevTitleRef.current === newTitle) return
    prevTitleRef.current = newTitle
    
    if (currentNote.titleGenerated && !currentNote.userEditedTitle && newTitle !== 'Untitled') {
      setIsTypingTitle(true)
      let currentIndex = 0
      let timeoutId
      
      const typeNextChar = () => {
        if (currentIndex < truncatedTitle.length) {
          setDisplayTitle(truncatedTitle.substring(0, currentIndex + 1))
          currentIndex++
          timeoutId = setTimeout(typeNextChar, 30)
        } else {
          setIsTypingTitle(false)
        }
      }
      
      typeNextChar()
      
      return () => {
        if (timeoutId) clearTimeout(timeoutId)
      }
    } else {
      setDisplayTitle(truncatedTitle)
    }
  }, [currentNote?.title, currentNote?.titleGenerated, currentNote?.userEditedTitle])

  const handleEditClick = () => setShowEditTitleModal(true)

  const handleTitleSave = (newTitle) => {
    if (newTitle && newTitle !== currentNote?.title) {
      updateNote(currentNote.id, { title: newTitle }, true)
      setDisplayTitle(truncateTitleByWords(newTitle, 7))
    }
  }

  const handleContentChange = (newContent) => {
    if (currentNote) {
      updateNote(currentNote.id, { content: newContent })
    }
  }

  useEffect(() => {
    if (analysis && currentNote?.content) {
      const originalLength = analysis.sentence_analysis?.reduce(
        (sum, s) => sum + s.sentence.length, 0
      ) || 0
      const currentLength = currentNote.content.length
      
      if (Math.abs(currentLength - originalLength) > originalLength * 0.1) {
        setAnalysis(null)
      }
    }
  }, [currentNote?.content, analysis])

  return (
    <div className={cn(
      "flex flex-col flex-1 overflow-hidden p-0 m-0",
      "bg-bg-tertiary",
      "h-full w-full box-border"
    )}>
      <header className={cn(
        "flex items-center gap-2 py-2 px-4",
        "border-b border-border-light",
        "bg-bg-tertiary h-14 shrink-0"
      )}>
        <button 
          className={cn(
            "p-1.5 bg-transparent border-none cursor-pointer rounded-full",
            "w-8 h-8 shrink-0 flex items-center justify-center",
            "transition-colors duration-200",
            "hover:bg-bg-hover"
          )}
          onClick={onToggleLeftSidebar}
          data-tooltip={t('common.menu')} 
          data-tooltip-position="right"
        >
          <img src="/icon/panel-left.svg" alt={t('common.menu')} className="w-icon-lg h-icon-lg opacity-60 icon-invert" />
        </button>
        
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div 
            className="text-sm font-medium text-text-primary py-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis cursor-default max-w-xl shrink-0"
            title={currentNote?.title || ''}
          >
            {displayTitle || t('editor.untitled')}
          </div>
          <button 
            className={cn(
              "bg-transparent border-none p-1.5 cursor-pointer rounded-md shrink-0",
              "flex items-center justify-center opacity-50 transition-all duration-200",
              "hover:opacity-100 hover:bg-bg-hover hover:scale-110",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            onClick={handleEditClick}
            data-tooltip={t('common.edit')}
            data-tooltip-position="bottom"
            disabled={isTypingTitle}
          >
            <img src="/icon/pencil.svg" alt={t('common.edit')} className="w-3.5 h-3.5 icon-invert" />
          </button>
          
          <TokenBadge text={currentNote?.content || ''} />
        </div>
        
        <div className="flex items-center gap-1">
          {hasHighlights && showHighlights && (
            <button 
              className={cn(
                "flex items-center gap-1.5 py-1.5 px-3.5",
                "bg-transparent text-text-primary",
                "border border-border-light",
                "rounded-pill text-sm font-medium cursor-pointer",
                "transition-all duration-200",
                "hover:bg-bg-hover",
                "hover:border-border-hover"
              )}
              onClick={() => setShowHighlights(false)}
              data-tooltip={t('common.hide')}
            >
              <img src="/icon/eye-off.svg" alt={t('common.hide')} className="w-4 h-4 opacity-70 icon-invert" />
              <span>{t('common.done')}</span>
            </button>
          )}

          <button 
            className={cn(
              "p-1.5 bg-transparent border-none cursor-pointer rounded-full",
              "w-8 h-8 flex items-center justify-center",
              "transition-colors duration-200",
              "hover:bg-bg-hover"
            )}
            onClick={onCreateNote}
            data-tooltip={t('common.new')}
          >
            <img src="/icon/plus.svg" alt={t('common.new')} className="w-icon-lg h-icon-lg opacity-60 icon-invert" />
          </button>
          {rightSidebarHidden && (
            <button 
              className={cn(
                "p-1.5 bg-transparent border-none cursor-pointer rounded-full",
                "w-8 h-8 flex items-center justify-center",
                "transition-colors duration-200",
                "hover:bg-bg-hover"
              )}
              onClick={onToggleRightSidebar}
              data-tooltip={t('nav.sidebar')}
            >
              <img src="/icon/panel-right.svg" alt={t('nav.sidebar')} className="w-icon-lg h-icon-lg opacity-60 icon-invert" />
            </button>
          )}
        </div>
      </header>

      <div className={cn(
        "relative flex-1 p-0 m-0 border-none",
        "bg-bg-tertiary",
        "overflow-hidden h-full w-full box-border"
      )}>
        <TextHighlightEditor
          value={currentNote?.content || ''}
          onChange={handleContentChange}
          analysis={analysis}
          disabled={isProcessing}
          placeholder={t('editor.enterYourText')}
          showHighlights={showHighlights}
          onHighlightsChange={setHasHighlights}
          showRewriteToolbar={true}
          currentProfile={currentProfile}
        />
      </div>

      <EditTitleModal
        isOpen={showEditTitleModal}
        currentTitle={currentNote?.title || ''}
        onSave={handleTitleSave}
        onClose={() => setShowEditTitleModal(false)}
        maxLength={100}
      />
    </div>
  )
}

export default AIStudioEditorEnhanced
