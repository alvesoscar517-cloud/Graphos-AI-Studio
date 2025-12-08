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
  const [isInteractingWithSlider, setIsInteractingWithSlider] = useState(false)

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

  // Handle pointer down to detect slider interaction
  const handlePointerDown = (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
      setIsInteractingWithSlider(true)
    }
  }

  const handlePointerUp = () => {
    setIsInteractingWithSlider(false)
  }

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
      drag={hidden || isInteractingWithSlider ? false : "x"}
      dragConstraints={{ left: 0, right: 300 }}
      dragElastic={0.15}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false)
        if (info.offset.x > 80 && !hidden) onClose?.()
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        pointerEvents: hidden ? 'none' : 'auto',
        overflow: hidden ? 'hidden' : undefined,
        minWidth: isDragging ? 300 : undefined
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 py-3 px-4 h-14 justify-start shrink-0">
        {/* Mode Toggle - Glass Slider */}
        <div className="relative flex p-1 rounded-xl flex-1 bg-bg-secondary border border-border-light">
          {/* Sliding Glass Indicator */}
          <motion.div
            className={cn(
              "absolute top-1 bottom-1 rounded-lg",
              "bg-fill-tertiary border border-border-light",
              "shadow-sm backdrop-blur-sm"
            )}
            initial={false}
            animate={{
              left: mode === 'analysis' ? '4px' : '50%',
              width: 'calc(50% - 4px)'
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
          />
          
          <button 
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 z-10",
              "bg-transparent border-none rounded-lg cursor-pointer",
              "text-xs font-medium transition-colors duration-200",
              mode === 'analysis' ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
            )}
            onClick={() => handleModeChange('analysis')}
          >
            <Icon 
              name="bar-chart-4" 
              alt={t('rightSidebar.analysis')} 
              size="sm"
              color="muted"
              themed
            />
            <span>{t('rightSidebar.analysis')}</span>
          </button>
          <button 
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 z-10",
              "bg-transparent border-none rounded-lg cursor-pointer",
              "text-xs font-medium transition-colors duration-200",
              mode === 'rewrite' ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
            )}
            onClick={() => handleModeChange('rewrite')}
          >
            <Icon 
              name="pen" 
              alt={t('rightSidebar.rewrite')} 
              size="sm"
              color="muted"
              themed
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
