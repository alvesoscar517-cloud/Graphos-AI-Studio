import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useNotes } from '../../contexts/NotesContext'
import { useProfiles } from '../../contexts/ProfileContext'
import { useRewrite } from '@/stores'
import ProfileSelector from '../Analysis/ProfileSelector'
import CompatibilityCard from '../Analysis/CompatibilityCard'
import AIDetectionCard from '../Analysis/AIDetectionCard'
import DeviationCard from '../Analysis/DeviationCard'
import StatisticsCard from '../Analysis/StatisticsCard'
import ModelSelector from '../Analysis/ModelSelector'
import WritingPreferences from '../Analysis/WritingPreferences'
import Icon from '../Common/Icon'
import { cn } from '../../lib/utils'

const RightSidebar = ({ hidden, onClose, onAnalysisComplete, onModeChange }) => {
  const { t } = useTranslation()
  const { currentNote } = useNotes()
  const { currentProfile, selectProfile } = useProfiles()
  const { selectedModel, setSelectedModel, writingPreferences, setWritingPreferences } = useRewrite()
  const [mode, setMode] = useState('analysis') // 'analysis' or 'rewrite'
  const [isDragging, setIsDragging] = useState(false)

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
      className={cn(
        "bg-bg-tertiary",
        "border-l border-separator",
        "overflow-y-auto overflow-x-hidden flex flex-col",
        "h-screen shrink-0",
        "touch-pan-y overscroll-contain scrollbar-none",
        isDragging ? "z-[100] shadow-xl" : "z-sidebar"
      )}
      initial={false}
      animate={{
        width: hidden ? 0 : 300,
        opacity: hidden ? 0 : 1,
        x: 0
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
      drag={hidden ? false : "x"}
      dragConstraints={{ left: 0, right: 300 }}
      dragElastic={0.15}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false)
        if (info.offset.x > 80 && !hidden) onClose?.()
      }}
      style={{
        pointerEvents: hidden ? 'none' : 'auto',
        overflow: hidden ? 'hidden' : undefined,
        minWidth: isDragging ? 300 : undefined
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 py-3 px-4 h-14 justify-start shrink-0">
        {/* Mode Toggle */}
        <div className="flex gap-1 bg-bg-tertiary/80 backdrop-blur-sm p-1 rounded-xl flex-1 border border-border-light">
          <button 
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2",
              "border-none rounded-lg cursor-pointer",
              "text-xs font-normal text-text-secondary",
              "transition-all duration-200",
              "hover:text-text-primary",
              mode === 'analysis' 
                ? "bg-primary/20 text-primary shadow-sm border border-primary/30" 
                : "bg-transparent"
            )}
            onClick={() => handleModeChange('analysis')}
          >
            <Icon 
              name="bar-chart-4" 
              alt={t('rightSidebar.analysis')} 
              size="sm"
              color={mode === 'analysis' ? 'primary' : 'muted'}
              themed={mode !== 'analysis'}
            />
            <span>{t('rightSidebar.analysis')}</span>
          </button>
          <button 
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2",
              "border-none rounded-lg cursor-pointer",
              "text-xs font-normal text-text-secondary",
              "transition-all duration-200",
              "hover:text-text-primary",
              mode === 'rewrite' 
                ? "bg-primary/20 text-primary shadow-sm border border-primary/30" 
                : "bg-transparent"
            )}
            onClick={() => handleModeChange('rewrite')}
          >
            <Icon 
              name="pen" 
              alt={t('rightSidebar.rewrite')} 
              size="sm"
              color={mode === 'rewrite' ? 'primary' : 'muted'}
              themed={mode !== 'rewrite'}
            />
            <span>{t('rightSidebar.rewrite')}</span>
          </button>
        </div>

        {/* Close Button */}
        <button 
          className={cn(
            "shrink-0 p-1.5",
            "bg-transparent border-none rounded-full cursor-pointer",
            "flex items-center justify-center",
            "w-8 h-8 transition-colors duration-200",
            "hover:bg-bg-hover"
          )}
          onClick={onClose}
          data-tooltip={t('common.close')} 
          data-tooltip-position="left"
        >
          <Icon name="x" alt={t('common.close')} size="lg" color="muted" />
        </button>
      </div>

      {/* Settings Panel */}
      <div className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto overflow-x-hidden">
        <ProfileSelector 
          currentProfile={currentProfile}
          onProfileSelect={handleProfileSelect}
        />

        {mode === 'analysis' ? (
          <div className="flex flex-col gap-3">
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
