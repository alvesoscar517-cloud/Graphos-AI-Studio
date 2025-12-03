import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useProfiles } from '../../../contexts/ProfileContext'
import { useWorkspace } from '../../../contexts/WorkspaceContext'
import ProfileSelector from '../../Analysis/ProfileSelector'
import ModelSelector from '../../Analysis/ModelSelector'
import Icon from '../../Common/Icon'
import { cn } from '../../../lib/utils'

const WorkspaceSidebar = ({ hidden, onClose }) => {
  const { t } = useTranslation()
  const { currentProfile, selectProfile } = useProfiles()
  const { modelSettings, updateModelSettings } = useWorkspace()
  const [isDragging, setIsDragging] = useState(false)

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
      updateModelSettings({ model: 'gemini-2.0-flash-exp' })
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

  return (
    <motion.aside 
      className={cn(
        "bg-bg-tertiary",
        "border-l border-separator",
        "overflow-y-auto overflow-x-hidden flex flex-col",
        "h-screen shrink-0",
        "touch-pan-y overscroll-contain scrollbar-none",
        "absolute right-0 top-0 bottom-0",
        "max-md:w-full",
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

      <div className={cn(
        "flex-1 overflow-y-auto p-4 flex flex-col gap-5",
        "scrollbar-hidden"
      )}>
        <ProfileSelector currentProfile={currentProfile} onProfileSelect={handleProfileSelect} />
        <ModelSelector selectedModel={modelSettings.model || 'gemini-2.0-flash-exp'} onModelSelect={handleModelSelect} />

        {/* Voice Profile Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wide">
            <img src="/icon/mic.svg" alt={t('workspace.voiceProfile')} className="w-3.5 h-3.5 opacity-60 icon-invert" />
            <span>{t('workspace.voiceProfile')}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {voiceProfileOptions.map((option) => {
              const isMainToggle = option.key === 'useVoiceProfile'
              const voiceEnabled = chatSettings.useVoiceProfile !== false
              const isDisabled = !isMainToggle && (!currentProfile || !voiceEnabled)
              const isChecked = isMainToggle ? voiceEnabled : voiceEnabled && chatSettings[option.key] !== false
              
              return (
                <div 
                  key={option.key} 
                  className={cn(
                    "flex items-center justify-between py-2.5 px-3 gap-3 rounded-xl",
                    "bg-bg-secondary border border-border-light",
                    isDisabled && "opacity-50 pointer-events-none"
                  )}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <img src={option.icon} alt="" className="w-icon-lg h-icon-lg opacity-60 shrink-0 icon-invert" />
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-sm font-medium text-text-primary flex items-center gap-1.5">{option.title}</span>
                      <span className="text-xs text-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">{option.description}</span>
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
              "flex items-start gap-2 py-2.5 px-3 mt-1 rounded-lg text-xs",
              "bg-warning/10 border border-warning/20 text-warning"
            )}>
              <Icon name="alert-circle" size="sm" color="warning" className="shrink-0 mt-0.5" />
              <span>{t('workspace.selectProfileNotice')}</span>
            </div>
          )}
        </div>

        {/* Humanization Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wide">
            <img src="/icon/user-check.svg" alt={t('workspace.humanization')} className="w-3.5 h-3.5 opacity-60 icon-invert" />
            <span>{t('workspace.humanization')}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {humanizationOptions.map((option) => (
              <div key={option.key} className="flex items-center justify-between py-2.5 px-3 gap-3 rounded-xl bg-bg-secondary border border-border-light">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <img src={option.icon} alt="" className="w-icon-lg h-icon-lg opacity-60 shrink-0 icon-invert" />
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                      {option.title}
                      {option.badge && <span className="text-[9px] font-medium py-px px-1 bg-primary/15 text-primary rounded">{option.badge}</span>}
                    </span>
                    <span className="text-xs text-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">{option.description}</span>
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
            <div className="flex flex-col gap-2 py-2.5 px-3 rounded-xl bg-bg-secondary border border-border-light">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-primary font-medium">{t('workspace.targetAIProbability')}</span>
                <span className="text-primary font-semibold">{chatSettings.targetAIProbability || 35}%</span>
              </div>
              <input
                type="range" min="20" max="50" step="5"
                value={chatSettings.targetAIProbability || 35}
                onChange={(e) => handleSettingChange('targetAIProbability', parseInt(e.target.value))}
                className={cn(
                  "w-full h-1 rounded appearance-none cursor-pointer",
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
        </div>

        {/* Response Style Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wide">
            <img src="/icon/sliders.svg" alt={t('workspace.responseStyle')} className="w-3.5 h-3.5 opacity-60 icon-invert" />
            <span>{t('workspace.responseStyle')}</span>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-text-secondary">{t('workspace.length')}</span>
            <div className="flex gap-1 p-1 rounded-lg bg-bg-secondary border border-border-light">
              {responseStyles.map((style) => (
                <button
                  key={style.value}
                  className={cn(
                    "flex-1 py-2 px-3 bg-transparent border-none rounded-md",
                    "text-xs font-medium text-text-secondary cursor-pointer whitespace-nowrap",
                    "transition-all duration-200",
                    "hover:text-text-primary hover:bg-bg-tertiary",
                    (chatSettings.responseStyle || 'balanced') === style.value && "bg-bg-primary text-primary shadow-sm"
                  )}
                  onClick={() => handleSettingChange('responseStyle', style.value)}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-text-secondary">{t('workspace.creativity')}</span>
            <div className="flex gap-1 p-1 rounded-lg bg-bg-secondary border border-border-light">
              {creativityLevels.map((level) => (
                <button
                  key={level.value}
                  className={cn(
                    "flex-1 py-2 px-3 bg-transparent border-none rounded-md",
                    "text-xs font-medium text-text-secondary cursor-pointer whitespace-nowrap",
                    "transition-all duration-200",
                    "hover:text-text-primary hover:bg-bg-tertiary",
                    (chatSettings.creativityLevel || 'medium') === level.value && "bg-bg-primary text-primary shadow-sm"
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
  )
}

export default WorkspaceSidebar
