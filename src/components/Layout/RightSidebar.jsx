import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNotes } from '../../contexts/NotesContext'
import { useProfiles } from '../../contexts/ProfileContext'
import ProfileSelector from '../Analysis/ProfileSelector'
import CompatibilityCard from '../Analysis/CompatibilityCard'
import AIDetectionCard from '../Analysis/AIDetectionCard'
import DeviationCard from '../Analysis/DeviationCard'
import StatisticsCard from '../Analysis/StatisticsCard'
import RewriteCard from '../Analysis/RewriteCard'
import SuggestionPopup from '../Analysis/SuggestionPopup'
import modal from '../../utils/modal'
import './RightSidebar.css'

const RightSidebar = ({ hidden, onClose, onHighlightSentence }) => {
  const { currentNote } = useNotes()
  const { currentProfile, selectProfile } = useProfiles()
  const [selectedSentence, setSelectedSentence] = useState(null)

  const handleProfileSelect = (profile) => {
    selectProfile(profile)
  }

  const handleSentenceClick = (sentence) => {
    console.log('📝 Sentence clicked in RightSidebar:', sentence)
    if (!currentProfile?.profile_id) {
      console.error('❌ No profile selected!')
      modal.toast('Lỗi', 'Vui lòng chọn profile trước', 'error')
      return
    }
    
    // Highlight sentence in editor
    if (onHighlightSentence) {
      onHighlightSentence(sentence)
    }
    
    // Show suggestion popup
    setSelectedSentence(sentence)
  }

  const hasText = currentNote && currentNote.content && currentNote.content.trim().length > 0
  const hasProfile = currentProfile !== null

  // Debug: Log when component renders
  console.log('🔧 RightSidebar render:', { hidden, hasText, hasProfile, selectedSentence })

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
        <h3 className="right-header-title">Công cụ phân tích</h3>
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

        <div className="feature-cards-grid">
          <CompatibilityCard 
            disabled={!hasText || !hasProfile}
            currentProfile={currentProfile}
            text={currentNote?.content || ''}
            onSentenceClick={handleSentenceClick}
          />

          <AIDetectionCard 
            disabled={!hasText || !hasProfile}
            text={currentNote?.content || ''}
          />

          <DeviationCard 
            disabled={!hasText || !hasProfile}
            currentProfile={currentProfile}
            text={currentNote?.content || ''}
            onSentenceClick={handleSentenceClick}
          />

          <StatisticsCard 
            disabled={!hasText || !hasProfile}
            currentProfile={currentProfile}
            text={currentNote?.content || ''}
          />

          <RewriteCard 
            disabled={!hasText || !hasProfile}
            currentProfile={currentProfile}
            text={currentNote?.content || ''}
          />
        </div>
      </div>

      {/* Suggestion Popup - Shared across all cards */}
      {selectedSentence && (
        <SuggestionPopup
          sentence={selectedSentence}
          profileId={currentProfile?.profile_id}
          onClose={() => {
            console.log('❌ Closing suggestion popup')
            setSelectedSentence(null)
          }}
          onApply={(rewrittenText) => {
            console.log('✅ Applied suggestion:', rewrittenText)
            modal.toast('Đã áp dụng gợi ý', 'Câu đã được cập nhật', 'success')
            setSelectedSentence(null)
            // TODO: Update text in editor
          }}
        />
      )}
    </motion.aside>
  )
}

export default RightSidebar
