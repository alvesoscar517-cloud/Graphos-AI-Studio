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
import './RightSidebar.css'

const RightSidebar = ({ hidden, onClose, onAnalysisComplete, onModeChange }) => {
  const { currentNote } = useNotes()
  const { currentProfile, selectProfile } = useProfiles()
  const [mode, setMode] = useState('analysis') // 'analysis' or 'rewrite'
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash')

  // Notify parent when mode changes
  const handleModeChange = (newMode) => {
    setMode(newMode)
    if (onModeChange) {
      onModeChange(newMode)
    }
  }

  const handleProfileSelect = (profile) => {
    selectProfile(profile)
  }

  const hasText = currentNote && currentNote.content && currentNote.content.trim().length > 0
  const hasProfile = currentProfile !== null

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
            onClick={() => handleModeChange('analysis')}
            data-tooltip="Công cụ phân tích" 
            data-tooltip-position="bottom"
          >
            <img src="/icon/bar-chart-4.svg" alt="Analysis" />
            <span>Phân tích</span>
          </button>
          <button 
            className={`mode-toggle-btn ${mode === 'rewrite' ? 'active' : ''}`}
            onClick={() => handleModeChange('rewrite')}
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

    </motion.aside>
  )
}

export default RightSidebar
