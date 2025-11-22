import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNotes } from '../../contexts/NotesContext'
import { useProfiles } from '../../contexts/ProfileContext'
import ProfileSelector from '../Analysis/ProfileSelector'
import CompatibilityCard from '../Analysis/CompatibilityCard'
import AIDetectionCard from '../Analysis/AIDetectionCard'
import DeviationCard from '../Analysis/DeviationCard'
import StatisticsCard from '../Analysis/StatisticsCard'
import RewriteModelSelector from '../Analysis/RewriteModelSelector'
import { rewriteTextStream } from '../../services/api'
import modal from '../../utils/modal'
import './RightSidebar.css'

const RightSidebar = ({ hidden, onClose, onAnalysisComplete }) => {
  const { currentNote, updateNote } = useNotes()
  const { currentProfile, selectProfile } = useProfiles()
  const [mode, setMode] = useState('analysis') // 'analysis' or 'rewrite'
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash')
  const [isRewriting, setIsRewriting] = useState(false)

  const handleProfileSelect = (profile) => {
    selectProfile(profile)
  }

  const hasText = currentNote && currentNote.content && currentNote.content.trim().length > 0
  const hasProfile = currentProfile !== null

  const handleRewrite = async () => {
    if (!currentProfile || !hasText || isRewriting) return
    
    setIsRewriting(true)
    
    try {
      // Add shimmer effect to editor
      const editor = document.querySelector('.main-textarea')
      if (editor) {
        editor.classList.add('shimmer-effect')
      }
      
      // Start streaming
      let newText = ''
      await rewriteTextStream(
        currentProfile.profile_id,
        currentNote.content,
        selectedModel,
        (chunk) => {
          // Remove shimmer on first chunk
          if (newText === '' && editor) {
            editor.classList.remove('shimmer-effect')
          }
          
          newText += chunk
          // Update editor in real-time
          updateNote(currentNote.id, { content: newText })
        }
      )
      
      modal.toast('Hoàn tất', 'Văn bản đã được viết lại', 'success')
    } catch (error) {
      console.error('Error rewriting:', error)
      modal.error('Viết lại thất bại: ' + error.message)
      
      // Remove shimmer on error
      const editor = document.querySelector('.main-textarea')
      if (editor) {
        editor.classList.remove('shimmer-effect')
      }
    } finally {
      setIsRewriting(false)
    }
  }

  // Debug: Log when component renders
  console.log('🔧 RightSidebar render:', { hidden, hasText, hasProfile, mode })

  return (
    <motion.aside 
      className="right-sidebar"
      initial={false}
      animate={{
        x: hidden ? 300 : 0,
        opacity: hidden ? 0 : 1
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 300 }}
      dragElastic={0.2}
      dragMomentum={false}
      onDragEnd={(event, info) => {
        // Nếu kéo quá 40% width thì đóng
        const threshold = 300 * 0.4
        if (info.offset.x > threshold && !hidden) {
          onClose?.()
        }
      }}
      style={{
        pointerEvents: hidden ? 'none' : 'auto'
      }}
    >
      <div className="right-header">
        <div className="mode-toggle-container">
          <button 
            className={`mode-toggle-btn ${mode === 'analysis' ? 'active' : ''}`}
            onClick={() => setMode('analysis')}
            data-tooltip="Công cụ phân tích" 
            data-tooltip-position="bottom"
          >
            <img src="/icon/bar-chart-4.svg" alt="Analysis" />
            <span>Phân tích</span>
          </button>
          <button 
            className={`mode-toggle-btn ${mode === 'rewrite' ? 'active' : ''}`}
            onClick={() => setMode('rewrite')}
            data-tooltip="Viết lại văn bản" 
            data-tooltip-position="bottom"
          >
            <img src="/icon/pen.svg" alt="Rewrite" />
            <span>Viết lại</span>
          </button>
        </div>
        <button 
          className="icon-btn close-sidebar-btn" 
          onClick={onClose}
          data-tooltip="Đóng sidebar" 
          data-tooltip-position="left"
        >
          <img src="/icon/x.svg" alt="Close" />
        </button>
      </div>

      <div className="settings-panel">
        <ProfileSelector 
          currentProfile={currentProfile}
          onProfileSelect={handleProfileSelect}
        />

        {mode === 'analysis' ? (
          <div className="feature-cards-grid">
            <CompatibilityCard 
              disabled={!hasText || !hasProfile}
              currentProfile={currentProfile}
              text={currentNote?.content || ''}
            />

            <AIDetectionCard 
              disabled={!hasText || !hasProfile}
              text={currentNote?.content || ''}
            />

            <DeviationCard 
              disabled={!hasText || !hasProfile}
              currentProfile={currentProfile}
              text={currentNote?.content || ''}
              onAnalysisComplete={onAnalysisComplete}
            />

            <StatisticsCard 
              disabled={!hasText || !hasProfile}
              currentProfile={currentProfile}
              text={currentNote?.content || ''}
            />
          </div>
        ) : (
          <RewriteModelSelector 
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
          />
        )}
      </div>

      {/* Rewrite Footer Button */}
      {mode === 'rewrite' && (
        <div className="right-sidebar-footer">
          <button 
            className={`rewrite-footer-btn ${isRewriting ? 'loading' : ''}`}
            onClick={handleRewrite}
            disabled={!hasText || !hasProfile || isRewriting}
          >
            <img src="/icon/pen.svg" alt="Rewrite" />
            <span className={isRewriting ? 'shimmer-text-effect' : ''}>{isRewriting ? 'Đang viết lại...' : 'Viết lại văn bản'}</span>
          </button>
        </div>
      )}
    </motion.aside>
  )
}

export default RightSidebar
