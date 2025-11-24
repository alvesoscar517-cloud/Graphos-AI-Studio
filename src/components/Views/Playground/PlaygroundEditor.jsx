import { useRef, useEffect } from 'react'
import { useNotes } from '../../../contexts/NotesContext'
import { useAuth } from '../../../contexts/AuthContext'
import { useAIProcessing } from '../../../contexts/AIProcessingContext'
import { createShare } from '../../../services/share'
import modal from '../../../utils/modal'
import TextShimmer from '../../Common/TextShimmer'
import './PlaygroundEditor.css'

const PlaygroundEditor = ({ 
  onToggleLeftSidebar, 
  onToggleRightSidebar, 
  rightSidebarHidden,
  onCreateNote,
  highlightedSentence // NEW: Sentence to highlight from deviation card
}) => {
  const { currentNote, updateNote } = useNotes()
  const { user } = useAuth()
  const { isProcessing, processingType } = useAIProcessing()
  const textareaRef = useRef(null)

  const handleTitleChange = (e) => {
    if (currentNote) {
      updateNote(currentNote.id, { title: e.target.value })
    }
  }

  const handleContentChange = (e) => {
    if (currentNote) {
      updateNote(currentNote.id, { content: e.target.value })
    }
  }

  // Highlight and scroll to sentence when clicked from deviation card
  useEffect(() => {
    if (highlightedSentence && textareaRef.current && currentNote?.content) {
      const content = currentNote.content
      const sentenceText = highlightedSentence.sentence
      
      // Find sentence position in content
      const startIndex = content.indexOf(sentenceText)
      
      if (startIndex !== -1) {
        const endIndex = startIndex + sentenceText.length
        
        // Focus textarea
        textareaRef.current.focus()
        
        // Select the sentence
        textareaRef.current.setSelectionRange(startIndex, endIndex)
        
        // Scroll to selection
        const lineHeight = 24 // Approximate line height
        const lines = content.substring(0, startIndex).split('\n').length
        const scrollTop = (lines - 1) * lineHeight
        textareaRef.current.scrollTop = Math.max(0, scrollTop - 100) // Offset for visibility
        
        console.log('📍 Highlighted sentence at position:', { startIndex, endIndex, lines })
      } else {
        console.warn('⚠️ Sentence not found in content')
      }
    }
  }, [highlightedSentence, currentNote?.content])

  const handleShare = async () => {
    try {
      if (!currentNote || !currentNote.content.trim()) {
        modal.alert('Không có nội dung để chia sẻ', 'Lỗi')
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
      
      modal.toast('Đã sao chép link chia sẻ', '', 'success')
    } catch (error) {
      console.error('Share error:', error)
      modal.error('Không thể tạo link chia sẻ: ' + error.message)
    }
  }

  return (
    <div className="playground-editor-view">
      <header className="main-header">
        <button 
          className="menu-btn icon-btn" 
          onClick={onToggleLeftSidebar}
          data-tooltip="Ẩn/hiện sidebar" 
          data-tooltip-position="right"
        >
          <img src="/icon/panel-left.svg" alt="Toggle Left Sidebar" />
        </button>
        
        <input 
          type="text" 
          className="title-input" 
          placeholder="Title..."
          value={currentNote?.title || ''}
          onChange={handleTitleChange}
        />
        
        <div className="header-actions">
          <button 
            className="icon-btn" 
            onClick={onCreateNote}
            data-tooltip="Tạo note mới"
          >
            <img src="/icon/plus.svg" alt="Add" />
          </button>
          <button 
            className="icon-btn" 
            onClick={handleShare}
            data-tooltip="Chia sẻ note"
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
        <textarea 
          ref={textareaRef}
          className="main-textarea" 
          placeholder=""
          value={currentNote?.content || ''}
          onChange={handleContentChange}
          disabled={isProcessing}
          style={{
            opacity: isProcessing ? 0 : 1,
            pointerEvents: isProcessing ? 'none' : 'auto'
          }}
        />
        {isProcessing && (
          <div className="shimmer-overlay">
            <TextShimmer className="shimmer-text" duration={2}>
              {currentNote?.content || ''}
            </TextShimmer>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlaygroundEditor
