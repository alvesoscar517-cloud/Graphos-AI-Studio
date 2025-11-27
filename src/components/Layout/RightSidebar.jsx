import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useNotes } from '../../contexts/NotesContext'
import { useProfiles } from '../../contexts/ProfileContext'
import { useRewrite } from '../../contexts/RewriteContext'
import ProfileSelector from '../Analysis/ProfileSelector'
import CompatibilityCard from '../Analysis/CompatibilityCard'
import AIDetectionCard from '../Analysis/AIDetectionCard'
import DeviationCard from '../Analysis/DeviationCard'
import StatisticsCard from '../Analysis/StatisticsCard'
import ModelSelector from '../Analysis/ModelSelector'
import WritingPreferences from '../Analysis/WritingPreferences'
import './RightSidebar.css'

const RightSidebar = ({ hidden, onClose, onAnalysisComplete, onModeChange }) => {
  const { t } = useTranslation()
  const { currentNote } = useNotes()
  const { currentProfile, selectProfile } = useProfiles()
  const { selectedModel, setSelectedModel, writingPreferences, setWritingPreferences } = useRewrite()
  const [mode, setMode] = useState('analysis') // 'analysis' or 'rewrite'

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
        // If dragged over 40% width then close
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
          >
            <img src="/icon/bar-chart-4.svg" alt={t('rightSidebar.analysis')} />
            <span>{t('rightSidebar.analysis')}</span>
          </button>
          <button 
            className={`mode-toggle-btn ${mode === 'rewrite' ? 'active' : ''}`}
            onClick={() => handleModeChange('rewrite')}
          >
            <img src="/icon/pen.svg" alt={t('rightSidebar.rewrite')} />
            <span>{t('rightSidebar.rewrite')}</span>
          </button>
        </div>
        <button 
          className="icon-btn close-sidebar-btn" 
          onClick={onClose}
          data-tooltip={t('common.close')} 
          data-tooltip-position="left"
        >
          <img src="/icon/x.svg" alt={t('common.close')} />
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
              disabled={!hasText}
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
          <>
            <ModelSelector 
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
            />
            <WritingPreferences
              currentProfile={currentProfile}
              preferences={writingPreferences}
              onPreferencesChange={setWritingPreferences}
            />
          </>
        )}
      </div>

    </motion.aside>
  )
}

export default RightSidebar
