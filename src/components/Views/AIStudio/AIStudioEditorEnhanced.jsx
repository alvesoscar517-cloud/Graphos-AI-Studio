import { useState, useEffect, useRef, useCallback } from 'react'
import { useNotes } from '../../../contexts/NotesContext'
import { useAIProcessing } from '../../../contexts/AIProcessingContext'
import { useProfiles } from '../../../contexts/ProfileContext'
import { createShare } from '../../../services/share'
import { truncateTitleByWords } from '../../../utils/titleUtils'
import TextHighlightEditor from '../../Analysis/TextHighlightEditor'
import EditTitleModal from '../../Common/EditTitleModal'
import TokenBadge from '../../Common/TokenBadge'
import modal from '../../../utils/modal'
import './AIStudioEditor.css'

/**
 * AIStudioEditorEnhanced - Editor with ContentEditable and inline highlighting
 * 
 * FEATURES:
 * - ContentEditable editor with full HTML/CSS support
 * - Direct highlighting in text with underline
 * - Tooltip suggestions when clicking on deviation sentences
 * - Better display and easier interaction
 */
const AIStudioEditorEnhanced = ({ 
  onToggleLeftSidebar, 
  onToggleRightSidebar, 
  rightSidebarHidden,
  onCreateNote,
  externalAnalysisData
}) => {
  const { currentNote, updateNote, generateTitle } = useNotes()
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

  // Auto-generate title when user stops typing (debounced)
  const triggerAutoGenerateTitle = useCallback(() => {
    if (!currentNote || currentNote.userEditedTitle || currentNote.titleGenerated || currentNote.title !== 'Untitled') {
      return
    }
    
    const content = currentNote.content?.trim()
    if (!content || content.length < 20 || isGeneratingTitleRef.current) {
      return
    }

    // Clear existing timeout
    if (titleGenerationTimeoutRef.current) {
      clearTimeout(titleGenerationTimeoutRef.current)
    }

    // Debounce: wait 3 seconds after user stops typing
    titleGenerationTimeoutRef.current = setTimeout(async () => {
      if (isGeneratingTitleRef.current) return
      
      isGeneratingTitleRef.current = true
      try {
        console.log('🏷️ Auto-generating title for note...')
        const newTitle = await generateTitle(content)
        if (newTitle && currentNote.title === 'Untitled' && !currentNote.userEditedTitle) {
          updateNote(currentNote.id, { title: newTitle, titleGenerated: true })
        }
      } catch (err) {
        console.error('Failed to auto-generate title:', err)
      } finally {
        isGeneratingTitleRef.current = false
      }
    }, 3000) // 3 seconds debounce
  }, [currentNote, generateTitle, updateNote])

  // Trigger title generation when content changes
  useEffect(() => {
    triggerAutoGenerateTitle()
    
    return () => {
      if (titleGenerationTimeoutRef.current) {
        clearTimeout(titleGenerationTimeoutRef.current)
      }
    }
  }, [currentNote?.content, triggerAutoGenerateTitle])

  // Listen for external analysis data from RightSidebar
  useEffect(() => {
    if (externalAnalysisData) {
      console.log('📊 Received external analysis data:', externalAnalysisData)
      setAnalysis(externalAnalysisData)
      setShowHighlights(true) // Show highlights when new analysis arrives
      
      // Immediately generate title when AI feature is used (if not already generated)
      if (currentNote && !currentNote.userEditedTitle && !currentNote.titleGenerated && currentNote.title === 'Untitled') {
        const content = currentNote.content.trim()
        if (content.length > 10 && !isGeneratingTitleRef.current) {
          // Clear debounce timeout since we're generating immediately
          if (titleGenerationTimeoutRef.current) {
            clearTimeout(titleGenerationTimeoutRef.current)
          }
          
          isGeneratingTitleRef.current = true
          generateTitle(content).then(newTitle => {
            updateNote(currentNote.id, { title: newTitle, titleGenerated: true })
          }).finally(() => {
            isGeneratingTitleRef.current = false
          })
        }
      }
    }
  }, [externalAnalysisData, currentNote, generateTitle, updateNote])

  // Typing effect for title
  useEffect(() => {
    if (currentNote && currentNote.title !== displayTitle) {
      const newTitle = currentNote.title
      // Truncate to 7 words for display
      const truncatedTitle = truncateTitleByWords(newTitle, 7)
      
      // Only apply typing effect if title was just generated
      if (currentNote.titleGenerated && !currentNote.userEditedTitle && newTitle !== 'Untitled') {
        setIsTypingTitle(true)
        let currentIndex = 0
        let timeoutId
        
        const typeNextChar = () => {
          if (currentIndex < truncatedTitle.length) {
            setDisplayTitle(truncatedTitle.substring(0, currentIndex + 1))
            currentIndex++
            timeoutId = setTimeout(typeNextChar, 30) // 30ms per character
          } else {
            setIsTypingTitle(false)
          }
        }
        
        typeNextChar()
        
        return () => {
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
        }
      } else {
        // No typing effect, just set directly (still truncate for display)
        setDisplayTitle(truncatedTitle)
      }
    }
  }, [currentNote?.title, currentNote?.titleGenerated])

  useEffect(() => {
    if (currentNote && !isTypingTitle) {
      // Truncate to 7 words for display only
      setDisplayTitle(truncateTitleByWords(currentNote.title, 7))
    }
  }, [currentNote, isTypingTitle])

  const handleEditClick = () => {
    setShowEditTitleModal(true)
  }

  const handleTitleSave = (newTitle) => {
    if (newTitle && newTitle !== currentNote?.title) {
      updateNote(currentNote.id, { title: newTitle }, true) // true = user edit
      setDisplayTitle(truncateTitleByWords(newTitle, 7))
    }
  }

  const handleContentChange = (newContent) => {
    if (currentNote) {
      updateNote(currentNote.id, { content: newContent })
    }
  }

  const handleShare = async () => {
    try {
      if (!currentNote || !currentNote.content.trim()) {
        modal.alert('No content to share', 'Error')
        return
      }

      // Create share link
      const shareData = await createShare(
        'note',
        currentNote.title || 'Untitled',
        currentNote.content,
        null,
        {
          createdAt: new Date().toISOString()
        }
      )

      // Copy link to clipboard
      const shareUrl = `${window.location.origin}/shared/${shareData.share_id}`
      await navigator.clipboard.writeText(shareUrl)
      
      modal.toast('Share link copied', '', 'success')
    } catch (error) {
      console.error('Share error:', error)
      modal.error('Unable to create share link: ' + error.message)
    }
  }

  // Clear analysis when content changes significantly
  useEffect(() => {
    if (analysis && currentNote?.content) {
      const originalLength = analysis.sentence_analysis?.reduce(
        (sum, s) => sum + s.sentence.length, 0
      ) || 0
      const currentLength = currentNote.content.length
      
      if (Math.abs(currentLength - originalLength) > originalLength * 0.1) {
        console.log('📝 Content changed significantly, clearing analysis')
        setAnalysis(null)
      }
    }
  }, [currentNote?.content, analysis])

  return (
    <div className="aistudio-editor-view">
      <header className="main-header">
        <button 
          className="menu-btn icon-btn" 
          onClick={onToggleLeftSidebar}
          data-tooltip="Toggle sidebar" 
          data-tooltip-position="right"
        >
          <img src="/icon/panel-left.svg" alt="Toggle Left Sidebar" />
        </button>
        
        <div className="title-container">
          <div className="title-display" title={currentNote?.title || ''}>
            {displayTitle || 'Untitled'}
          </div>
          <button 
            className="title-edit-btn"
            onClick={handleEditClick}
            data-tooltip="Edit title"
            data-tooltip-position="bottom"
            disabled={isTypingTitle}
          >
            <img src="/icon/pencil.svg" alt="Edit" />
          </button>
          
          {/* Token Badge - automatically gets model from RewriteContext */}
          <TokenBadge text={currentNote?.content || ''} />
        </div>
        
        <div className="header-actions">
          {hasHighlights && showHighlights && (
            <button 
              className="done-highlights-btn"
              onClick={() => setShowHighlights(false)}
              data-tooltip="Hide highlights"
            >
              <img src="/icon/eye-off.svg" alt="hide" />
              <span>Done</span>
            </button>
          )}

          <button 
            className="icon-btn" 
            onClick={onCreateNote}
            data-tooltip="Create new note"
          >
            <img src="/icon/plus.svg" alt="Add" />
          </button>
          <button 
            className="icon-btn" 
            onClick={handleShare}
            data-tooltip="Share note"
          >
            <img src="/icon/share-2.svg" alt="Share" />
          </button>
          {rightSidebarHidden && (
            <button 
              className="icon-btn" 
              onClick={onToggleRightSidebar}
              data-tooltip="Hiện sidebar"
            >
              <img src="/icon/panel-right.svg" alt="Toggle Right Sidebar" />
            </button>
          )}
        </div>
      </header>

      <div className="text-input-area">
        <TextHighlightEditor
          value={currentNote?.content || ''}
          onChange={handleContentChange}
          analysis={analysis}
          disabled={isProcessing}
          placeholder="Enter content..."
          showHighlights={showHighlights}
          onHighlightsChange={setHasHighlights}
          showRewriteToolbar={true}
          currentProfile={currentProfile}
        />
      </div>

      {/* Edit Title Modal */}
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
