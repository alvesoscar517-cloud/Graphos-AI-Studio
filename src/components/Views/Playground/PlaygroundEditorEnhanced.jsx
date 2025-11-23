import { useState, useEffect } from 'react'
import { useNotes } from '../../../contexts/NotesContext'
import { useAuth } from '../../../contexts/AuthContext'
import { useAIProcessing } from '../../../contexts/AIProcessingContext'
import { useProfiles } from '../../../contexts/ProfileContext'
import { openDriveFolder } from '../../../services/drive'
import TextHighlightEditor from '../../Analysis/TextHighlightEditor'
import modal from '../../../utils/modal'
import './PlaygroundEditor.css'

/**
 * PlaygroundEditorEnhanced - Editor với ContentEditable và inline highlighting
 * 
 * FEATURES:
 * - ContentEditable editor với HTML/CSS đầy đủ
 * - Highlight trực tiếp trong text với gạch chân
 * - Tooltip gợi ý khi click vào câu lệch chuẩn
 * - Hiển thị tốt hơn, tương tác dễ dàng hơn
 */
const PlaygroundEditorEnhanced = ({ 
  onToggleLeftSidebar, 
  onToggleRightSidebar, 
  rightSidebarHidden,
  onCreateNote,
  externalAnalysisData,
  rewriteMode
}) => {
  const { currentNote, updateNote, notes, generateTitle } = useNotes()
  const { user, signOut } = useAuth()
  const { isProcessing } = useAIProcessing()
  const { currentProfile } = useProfiles()
  
  const [analysis, setAnalysis] = useState(null)
  const [showHighlights, setShowHighlights] = useState(true)
  const [hasHighlights, setHasHighlights] = useState(false)
  const [title, setTitle] = useState('')
  const [displayTitle, setDisplayTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isTypingTitle, setIsTypingTitle] = useState(false)

  // Listen for external analysis data from RightSidebar
  useEffect(() => {
    if (externalAnalysisData) {
      console.log('📊 Received external analysis data:', externalAnalysisData)
      setAnalysis(externalAnalysisData)
      setShowHighlights(true) // Show highlights when new analysis arrives
      
      // Auto-generate title when first AI feature is used
      if (currentNote && !currentNote.userEditedTitle && !currentNote.titleGenerated && currentNote.title === 'Untitled') {
        const content = currentNote.content.trim()
        if (content.length > 10) {
          generateTitle(content).then(newTitle => {
            updateNote(currentNote.id, { title: newTitle, titleGenerated: true })
          })
        }
      }
    }
  }, [externalAnalysisData, currentNote, generateTitle, updateNote])

  // Typing effect for title
  useEffect(() => {
    if (currentNote && currentNote.title !== displayTitle) {
      const newTitle = currentNote.title
      
      // Only apply typing effect if title was just generated
      if (currentNote.titleGenerated && !currentNote.userEditedTitle && newTitle !== 'Untitled') {
        setIsTypingTitle(true)
        let currentIndex = 0
        let timeoutId
        
        const typeNextChar = () => {
          if (currentIndex < newTitle.length) {
            setDisplayTitle(newTitle.substring(0, currentIndex + 1))
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
        // No typing effect, just set directly
        setDisplayTitle(newTitle)
      }
    }
  }, [currentNote?.title, currentNote?.titleGenerated])

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title)
      if (!isTypingTitle) {
        setDisplayTitle(currentNote.title)
      }
    }
  }, [currentNote, isTypingTitle])

  const handleTitleChange = (e) => {
    setTitle(e.target.value)
  }

  const handleTitleSave = () => {
    setIsEditingTitle(false)
    const trimmedTitle = title.trim()
    if (trimmedTitle && trimmedTitle !== currentNote?.title) {
      // Limit to 60 characters
      const limitedTitle = trimmedTitle.substring(0, 60)
      updateNote(currentNote.id, { title: limitedTitle }, true) // true = user edit
      setTitle(limitedTitle)
      setDisplayTitle(limitedTitle)
    } else {
      setTitle(currentNote?.title || '')
      setDisplayTitle(currentNote?.title || '')
    }
  }

  const handleTitleBlur = () => {
    handleTitleSave()
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTitleSave()
    } else if (e.key === 'Escape') {
      setTitle(currentNote?.title || '')
      setIsEditingTitle(false)
    }
  }

  const handleEditClick = () => {
    setIsEditingTitle(true)
  }

  const handleContentChange = (newContent) => {
    if (currentNote) {
      updateNote(currentNote.id, { content: newContent })
    }
  }

  const handleOpenInDrive = async () => {
    try {
      if (!user) {
        modal.alert('Vui lòng đăng nhập để sử dụng tính năng này', 'Chưa đăng nhập')
        return
      }

      await openDriveFolder(notes)
      modal.toast('Đã mở thư mục Drive', '', 'success')
    } catch (error) {
      if (error.message === 'Not authenticated') {
        modal.alert('Vui lòng đăng nhập để sử dụng tính năng này', 'Chưa đăng nhập')
      } else if (error.message === 'NEED_REAUTH') {
        const confirmed = await modal.confirm(
          'Ứng dụng cần quyền truy cập Google Drive để đồng bộ notes. Vui lòng đăng nhập lại để cấp quyền.',
          'Cần cấp quyền Drive',
          { confirmText: 'Đăng nhập lại', danger: false }
        )
        
        if (confirmed) {
          await signOut()
          modal.info('Vui lòng đăng nhập lại để cấp quyền truy cập Google Drive.')
        }
      } else {
        modal.error('Không thể mở thư mục Drive: ' + error.message)
      }
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
        
        <div className="title-container">
          {isEditingTitle ? (
            <input 
              type="text" 
              className="title-input" 
              placeholder="Nhập tiêu đề..."
              value={title}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleTitleBlur}
              maxLength={60}
              autoFocus
            />
          ) : (
            <div className="title-display">
              {displayTitle || 'Untitled'}
            </div>
          )}
          {!isEditingTitle && (
            <button 
              className="title-edit-btn"
              onClick={handleEditClick}
              data-tooltip="Sửa tiêu đề"
              data-tooltip-position="bottom"
              disabled={isTypingTitle}
            >
              <img src="/icon/pencil.svg" alt="Edit" />
            </button>
          )}
        </div>
        
        <div className="header-actions">
          {hasHighlights && showHighlights && (
            <button 
              className="done-highlights-btn"
              onClick={() => setShowHighlights(false)}
              data-tooltip="Ẩn highlight"
            >
              <img src="/icon/eye-off.svg" alt="hide" />
              <span>Xong</span>
            </button>
          )}

          <button 
            className="icon-btn" 
            onClick={onCreateNote}
            data-tooltip="Tạo note mới"
          >
            <img src="/icon/plus.svg" alt="Add" />
          </button>
          <button 
            className="icon-btn" 
            onClick={handleOpenInDrive}
            data-tooltip="Mở trong Google Drive"
          >
            <img src="/icon/share-2.svg" alt="Drive" />
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
          placeholder="Nhập nội dung..."
          showHighlights={showHighlights}
          onHighlightsChange={setHasHighlights}
          showRewriteToolbar={true}
          currentProfile={currentProfile}
        />
      </div>

    </div>
  )
}

export default PlaygroundEditorEnhanced
