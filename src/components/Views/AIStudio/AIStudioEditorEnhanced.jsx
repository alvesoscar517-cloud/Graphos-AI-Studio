import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNotes } from '../../../contexts/NotesContext'
import { useAIProcessing } from '@/stores'
import { useProfiles } from '../../../contexts/ProfileContext'

import { truncateTitleByWords } from '../../../utils/titleUtils'
import TextHighlightEditor from '../../Analysis/TextHighlightEditor'
import EditTitleModal from '../../Common/EditTitleModal'
import TokenBadge from '../../Common/TokenBadge'
import modal from '../../../utils/modal'
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

  const triggerAutoGenerateTitle = useCallback(() => {
    if (!currentNote || currentNote.userEditedTitle || currentNote.titleGenerated || currentNote.title !== 'Untitled') {
      return
    }
    
    const content = currentNote.content?.trim()
    if (!content || content.length < 20 || isGeneratingTitleRef.current) {
      return
    }

    if (titleGenerationTimeoutRef.current) {
      clearTimeout(titleGenerationTimeoutRef.current)
    }

    // Generate title from first characters (no AI call)
    titleGenerationTimeoutRef.current = setTimeout(() => {
      if (isGeneratingTitleRef.current) return
      
      isGeneratingTitleRef.current = true
      try {
        const firstSentence = content.split(/[.!?。\n]/)[0]?.trim() || content
        const newTitle = truncateTitleByWords(firstSentence, 7)
        if (newTitle && currentNote.title === 'Untitled' && !currentNote.userEditedTitle) {
          updateNote(currentNote.id, { title: newTitle, titleGenerated: true })
        }
      } finally {
        isGeneratingTitleRef.current = false
      }
    }, 1500)
  }, [currentNote, updateNote])

  useEffect(() => {
    triggerAutoGenerateTitle()
    return () => {
      if (titleGenerationTimeoutRef.current) {
        clearTimeout(titleGenerationTimeoutRef.current)
      }
    }
  }, [currentNote?.content, triggerAutoGenerateTitle])

  useEffect(() => {
    if (externalAnalysisData) {
      setAnalysis(externalAnalysisData)
      setShowHighlights(true)
      
      // Generate title from first characters (no AI call)
      if (currentNote && !currentNote.userEditedTitle && !currentNote.titleGenerated && currentNote.title === 'Untitled') {
        const content = currentNote.content.trim()
        if (content.length > 10 && !isGeneratingTitleRef.current) {
          if (titleGenerationTimeoutRef.current) {
            clearTimeout(titleGenerationTimeoutRef.current)
          }
          
          isGeneratingTitleRef.current = true
          const firstSentence = content.split(/[.!?。\n]/)[0]?.trim() || content
          const newTitle = truncateTitleByWords(firstSentence, 7)
          updateNote(currentNote.id, { title: newTitle, titleGenerated: true })
          isGeneratingTitleRef.current = false
        }
      }
    }
  }, [externalAnalysisData, currentNote, updateNote])

  useEffect(() => {
    if (currentNote && currentNote.title !== displayTitle) {
      const newTitle = currentNote.title
      const truncatedTitle = truncateTitleByWords(newTitle, 7)
      
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
    }
  }, [currentNote?.title, currentNote?.titleGenerated])

  useEffect(() => {
    if (currentNote && !isTypingTitle) {
      setDisplayTitle(truncateTitleByWords(currentNote.title, 7))
    }
  }, [currentNote, isTypingTitle])

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
