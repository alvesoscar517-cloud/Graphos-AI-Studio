import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfiles } from '../../../contexts/ProfileContext'
import { useWorkspace } from '../../../contexts/WorkspaceContext'
import ProfileSelector from '../../Analysis/ProfileSelector'
import ModelSelector from '../../Analysis/ModelSelector'
import { cn } from '../../../lib/utils'
import Icon from '../../Common/Icon'

// Breakpoints for responsive behavior
const BREAKPOINT_MOBILE = 768
const BREAKPOINT_TABLET = 1024

// Sidebar widths
const WIDTH_DESKTOP = 300
const WIDTH_TABLET = 280

const WorkspaceSidebar = ({ hidden, onClose }) => {
  const { t } = useTranslation()
  const { currentProfile, selectProfile } = useProfiles()
  const { modelSettings, updateModelSettings } = useWorkspace()
  const [isDragging, setIsDragging] = useState(false)
  const [isInteractingWithSlider, setIsInteractingWithSlider] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // Detect screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < BREAKPOINT_MOBILE)
      setIsTablet(width >= BREAKPOINT_MOBILE && width < BREAKPOINT_TABLET)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Body scroll lock on mobile
  useEffect(() => {
    if (isMobile && !hidden) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isMobile, hidden])

  // Calculate sidebar width based on screen size
  const sidebarWidth = isMobile ? '100%' : isTablet ? WIDTH_TABLET : WIDTH_DESKTOP

  const chatSettings = modelSettings.chatSettings || {}

  const handleProfileSelect = (profile) => {
    selectProfile(profile)
  }

  const handleModelSelect = (modelId) => {
    updateModelSettings({ model: modelId })
  }

  const handleSettingChange = (key, value) => {
    const newChatSettings = { ...chatSettings, [key]: value }
    
    if (key === 'useVoiceProfile' && !value) {
      newChatSettings.useVocabularyPreferences = false
      newChatSettings.useKeyCharacteristics = false
      newChatSettings.useSentencePatterns = false
    }
    
    const useVoice = newChatSettings.useVoiceProfile !== false
    const writingPreferences = {
      useVocabularyPreferences: useVoice && newChatSettings.useVocabularyPreferences !== false,
      useKeyCharacteristics: useVoice && newChatSettings.useKeyCharacteristics !== false,
      useSentencePatterns: useVoice && newChatSettings.useSentencePatterns !== false,
      useRewriteInstructions: useVoice,
      useAntiAIDetection: newChatSettings.useAntiAIDetection || false,
      targetAIProbability: newChatSettings.targetAIProbability || 35
    }
    
    updateModelSettings({ 
      chatSettings: newChatSettings,
      writingPreferences
    })
  }

  const handleToggle = (key) => {
    handleSettingChange(key, !chatSettings[key])
  }

  useEffect(() => {
    if (!modelSettings.model) {
      updateModelSettings({ model: 'gemini-2.5-flash' })
    }
  }, [])

  const voiceProfileOptions = [
    { key: 'useVoiceProfile', icon: '/icon/user.svg', title: t('workspace.useVoiceProfile'), description: t('workspace.useVoiceProfileDesc') },
    { key: 'useVocabularyPreferences', icon: '/icon/book-open.svg', title: t('workspace.vocabularyPreferences'), description: t('workspace.vocabularyPreferencesDesc') },
    { key: 'useKeyCharacteristics', icon: '/icon/list.svg', title: t('workspace.keyCharacteristics'), description: t('workspace.keyCharacteristicsDesc') },
    { key: 'useSentencePatterns', icon: '/icon/align-left.svg', title: t('workspace.sentencePatterns'), description: t('workspace.sentencePatternsDesc') }
  ]

  const humanizationOptions = [
    { key: 'useAntiAIDetection', icon: '/icon/shield.svg', title: t('workspace.antiAIDetection'), description: t('workspace.antiAIDetectionDesc'), badge: 'NEW' },
    { key: 'humanizeResponse', icon: '/icon/user-check.svg', title: t('workspace.humanizeOutput'), description: t('workspace.humanizeOutputDesc'), badge: 'BETA' }
  ]

  const responseStyles = [
    { value: 'concise', label: t('workspace.concise') },
    { value: 'balanced', label: t('workspace.balanced') },
    { value: 'detailed', label: t('workspace.detailed') }
  ]

  const creativityLevels = [
    { value: 'low', label: t('workspace.precise'), temp: 0.3 },
    { value: 'medium', label: t('workspace.balanced'), temp: 0.7 },
    { value: 'high', label: t('workspace.creative'), temp: 0.9 }
  ]

  // Mobile overlay backdrop
  const MobileBackdrop = () => (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    />
  )

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobile && !hidden && <MobileBackdrop />}
      </AnimatePresence>

      <motion.aside 
        className={cn(
          "bg-bg-tertiary",
          "overflow-y-auto overflow-x-hidden flex flex-col",
          "h-full shrink-0",
          "touch-pan-y overscroll-contain scrollbar-none",
          "rounded-md", // Floating panel effect
          isDragging ? "z-[100] shadow-xl" : "z-sidebar",
          // Mobile: full width overlay from right
          isMobile && "fixed inset-y-0 right-0 rounded-none shadow-2xl z-[100] max-w-[85vw]"
        )}
        initial={false}
        animate={{
          width: hidden ? 0 : sidebarWidth,
          opacity: hidden ? 0 : 1,
          x: isMobile && hidden ? '100%' : 0
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8
        }}
        drag={hidden || isInteractingWithSlider || isMobile ? false : "x"}
        dragConstraints={{ left: 0, right: 300 }}
        dragElastic={0.15}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(_, info) => {
          setIsDragging(false)
          if (info.offset.x > 80 && !hidden) onClose?.()
        }}
        onPointerDown={(e) => {
          const target = e.target
          if (target instanceof HTMLInputElement && target.type === 'range') {
            setIsInteractingWithSlider(true)
          }
        }}
        onPointerUp={() => setIsInteractingWithSlider(false)}
        onPointerLeave={() => setIsInteractingWithSlider(false)}
        style={{
          pointerEvents: hidden ? 'none' : 'auto',
          overflow: hidden ? 'hidden' : undefined,
          minWidth: isDragging ? WIDTH_DESKTOP : undefined
        }}
      >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 py-3 px-4 h-14 shrink-0">
        <div className="flex items-center gap-2 py-1.5 px-3 border border-border-light rounded-lg text-sm font-semibold text-text-primary">
          <img src="/icon/settings.svg" alt={t('nav.settings')} className="w-icon-lg h-icon-lg opacity-70 icon-invert" />
          <span>{t('workspace.aiSettings')}</span>
        </div>
        <button 
          className={cn(
            "p-1.5 bg-transparent border-none cursor-pointer rounded-full",
            "flex items-center justify-center transition-all duration-200",
            "w-8 h-8 shrink-0",
            "hover:bg-bg-hover"
          )}
          onClick={onClose}
          data-tooltip={t('common.close')}
          data-tooltip-position="left"
        >
          <img src="/icon/x.svg" alt={t('common.close')} className="w-icon-lg h-icon-lg opacity-60 icon-invert" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-none">
        <ProfileSelector currentProfile={currentProfile} onProfileSelect={handleProfileSelect} />
        <ModelSelector selectedModel={modelSettings.model || 'gemini-2.5-flash'} onModelSelect={handleModelSelect} />

        {/* Voice Profile Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 px-1 mb-0.5">
            <img src="/icon/mic.svg" alt={t('workspace.voiceProfile')} className="w-3 h-3 opacity-60 icon-invert" />
            <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">{t('workspace.voiceProfile')}</span>
          </div>

          <div className="flex flex-col gap-1">
            {voiceProfileOptions.map((option) => {
              const isMainToggle = option.key === 'useVoiceProfile'
              const voiceEnabled = chatSettings.useVoiceProfile !== false
              const isDisabled = !isMainToggle && (!currentProfile || !voiceEnabled)
              const isChecked = isMainToggle ? voiceEnabled : voiceEnabled && chatSettings[option.key] !== false
              
              return (
                <div 
                  key={option.key} 
                  className={cn(
                    "flex items-center justify-between py-2 px-2.5 gap-2 rounded-xl",
                    "bg-bg-secondary border border-border-light",
                    isDisabled && "opacity-50 pointer-events-none"
                  )}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img src={option.icon} alt="" className="w-icon-md h-icon-md opacity-60 shrink-0 icon-invert" />
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-xs font-medium text-text-primary flex items-center gap-1.5">{option.title}</span>
                      <span className="text-[11px] text-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">{option.description}</span>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={isChecked} onChange={() => handleToggle(option.key)} disabled={isDisabled} />
                    <span className="toggle-switch-track">
                      <span className="toggle-switch-thumb"></span>
                    </span>
                  </label>
                </div>
              )
            })}
          </div>

          {!currentProfile && (
            <div className={cn(
              "flex items-start gap-2 py-2 px-2.5 mt-1 rounded-xl text-[11px]",
              "bg-bg-secondary border border-border-light text-text-secondary"
            )}>
              <Icon name="alert-circle" size="sm" color="muted" className="shrink-0 mt-0.5" />
              <span>{t('workspace.selectProfileNotice')}</span>
            </div>
          )}
        </div>

        {/* Humanization Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 px-1 mb-0.5">
            <img src="/icon/user-check.svg" alt={t('workspace.humanization')} className="w-3 h-3 opacity-60 icon-invert" />
            <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">{t('workspace.humanization')}</span>
          </div>

          <div className="flex flex-col gap-1">
            {humanizationOptions.map((option) => (
              <div key={option.key} className="flex items-center justify-between py-2 px-2.5 gap-2 rounded-xl bg-bg-secondary border border-border-light">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img src={option.icon} alt="" className="w-icon-md h-icon-md opacity-60 shrink-0 icon-invert" />
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-xs font-medium text-text-primary flex items-center gap-1">
                      {option.title}
                      {option.badge && <span className="text-[8px] font-medium py-px px-1 bg-primary/15 text-primary rounded">{option.badge}</span>}
                    </span>
                    <span className="text-[11px] text-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">{option.description}</span>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={chatSettings[option.key] || false} onChange={() => handleToggle(option.key)} />
                  <span className="toggle-switch-track">
                    <span className="toggle-switch-thumb"></span>
                  </span>
                </label>
              </div>
            ))}
          </div>

          {chatSettings.humanizeResponse && (
            <div className="flex flex-col gap-1.5 py-2 px-2.5 rounded-xl bg-bg-secondary border border-border-light">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-text-primary font-medium">{t('workspace.targetAIProbability')}</span>
                <span className="text-primary font-semibold">{chatSettings.targetAIProbability || 35}%</span>
              </div>
              <input
                type="range" min="20" max="50" step="5"
                value={chatSettings.targetAIProbability || 35}
                onChange={(e) => handleSettingChange('targetAIProbability', parseInt(e.target.value))}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  setIsInteractingWithSlider(true)
                }}
                onPointerUp={() => setIsInteractingWithSlider(false)}
                onTouchStart={(e) => {
                  e.stopPropagation()
                  setIsInteractingWithSlider(true)
                }}
                onTouchEnd={() => setIsInteractingWithSlider(false)}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  setIsInteractingWithSlider(true)
                }}
                onMouseUp={() => setIsInteractingWithSlider(false)}
                className={cn(
                  "w-full h-1 rounded appearance-none cursor-pointer touch-none",
                  "bg-bg-tertiary",
                  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
                  "[&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full",
                  "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform",
                  "[&::-webkit-slider-thumb]:hover:scale-110"
                )}
              />
              <div className="flex justify-between text-xs text-text-muted">
                <span>{t('workspace.moreHuman')}</span>
                <span>{t('workspace.faster')}</span>
              </div>
            </div>
          )}

          {/* Notice when humanization enabled without profile */}
          {(chatSettings.humanizeResponse || chatSettings.useAntiAIDetection) && !currentProfile && (
            <div className={cn(
              "flex items-start gap-2 py-2 px-2.5 rounded-xl text-[11px]",
              "bg-bg-secondary border border-border-light text-text-secondary"
            )}>
              <Icon name="info" size="sm" color="muted" className="shrink-0 mt-0.5" />
              <span>{t('workspace.genericHumanizationNotice')}</span>
            </div>
          )}
        </div>

        {/* Response Style Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 px-1 mb-0.5">
            <img src="/icon/sliders.svg" alt={t('workspace.responseStyle')} className="w-3 h-3 opacity-60 icon-invert" />
            <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">{t('workspace.responseStyle')}</span>
          </div>
          
          {/* Length - Glass Slider */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-text-secondary">{t('workspace.length')}</span>
            <div className="relative flex p-1 rounded-xl bg-bg-secondary border border-border-light">
              {/* Sliding Glass Indicator */}
              <motion.div
                className={cn(
                  "absolute top-1 bottom-1 rounded-lg",
                  "bg-fill-tertiary border border-border-light",
                  "shadow-sm backdrop-blur-sm"
                )}
                initial={false}
                animate={{
                  left: (chatSettings.responseStyle || 'balanced') === 'concise' ? '4px' 
                      : (chatSettings.responseStyle || 'balanced') === 'balanced' ? 'calc(33.33% + 2px)' 
                      : 'calc(66.66%)',
                  width: 'calc(33.33% - 4px)'
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30
                }}
              />
              {responseStyles.map((style) => (
                <button
                  key={style.value}
                  className={cn(
                    "flex-1 py-2 px-2 bg-transparent border-none rounded-lg z-10",
                    "text-xs font-medium cursor-pointer whitespace-nowrap",
                    "transition-colors duration-200",
                    (chatSettings.responseStyle || 'balanced') === style.value 
                      ? "text-text-primary" 
                      : "text-text-muted hover:text-text-secondary"
                  )}
                  onClick={() => handleSettingChange('responseStyle', style.value)}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Creativity - Glass Slider */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-text-secondary">{t('workspace.creativity')}</span>
            <div className="relative flex p-1 rounded-xl bg-bg-secondary border border-border-light">
              {/* Sliding Glass Indicator */}
              <motion.div
                className={cn(
                  "absolute top-1 bottom-1 rounded-lg",
                  "bg-fill-tertiary border border-border-light",
                  "shadow-sm backdrop-blur-sm"
                )}
                initial={false}
                animate={{
                  left: (chatSettings.creativityLevel || 'medium') === 'low' ? '4px' 
                      : (chatSettings.creativityLevel || 'medium') === 'medium' ? 'calc(33.33% + 2px)' 
                      : 'calc(66.66%)',
                  width: 'calc(33.33% - 4px)'
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30
                }}
              />
              {creativityLevels.map((level) => (
                <button
                  key={level.value}
                  className={cn(
                    "flex-1 py-2 px-2 bg-transparent border-none rounded-lg z-10",
                    "text-xs font-medium cursor-pointer whitespace-nowrap",
                    "transition-colors duration-200",
                    (chatSettings.creativityLevel || 'medium') === level.value 
                      ? "text-text-primary" 
                      : "text-text-muted hover:text-text-secondary"
                  )}
                  onClick={() => {
                    handleSettingChange('creativityLevel', level.value)
                    updateModelSettings({ temperature: level.temp })
                  }}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
    </>
  )
}

export default WorkspaceSidebar
