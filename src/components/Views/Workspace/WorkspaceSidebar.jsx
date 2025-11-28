import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useProfiles } from '../../../contexts/ProfileContext'
import { useWorkspace } from '../../../contexts/WorkspaceContext'
import ProfileSelector from '../../Analysis/ProfileSelector'
import ModelSelector from '../../Analysis/ModelSelector'
import './WorkspaceSidebar.css'

const WorkspaceSidebar = ({ hidden, onClose }) => {
  const { t } = useTranslation()
  const { currentProfile, selectProfile } = useProfiles()
  const { modelSettings, updateModelSettings } = useWorkspace()

  const chatSettings = modelSettings.chatSettings || {}

  const handleProfileSelect = (profile) => {
    selectProfile(profile)
  }

  const handleModelSelect = (modelId) => {
    updateModelSettings({ model: modelId })
  }

  const handleSettingChange = (key, value) => {
    const newChatSettings = { ...chatSettings, [key]: value }
    
    // If turning off useVoiceProfile, also turn off sub-options
    if (key === 'useVoiceProfile' && !value) {
      newChatSettings.useVocabularyPreferences = false
      newChatSettings.useKeyCharacteristics = false
      newChatSettings.useSentencePatterns = false
    }
    
    // Sync writingPreferences with chatSettings for backend compatibility
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

  // Sync initial model if not set
  useEffect(() => {
    if (!modelSettings.model) {
      updateModelSettings({ model: 'gemini-2.0-flash-exp' })
    }
  }, [])

  // Voice profile options
  const voiceProfileOptions = [
    {
      key: 'useVoiceProfile',
      icon: '/icon/user.svg',
      title: t('workspace.useVoiceProfile'),
      description: t('workspace.useVoiceProfileDesc')
    },
    {
      key: 'useVocabularyPreferences',
      icon: '/icon/book-open.svg',
      title: t('workspace.vocabularyPreferences'),
      description: t('workspace.vocabularyPreferencesDesc')
    },
    {
      key: 'useKeyCharacteristics',
      icon: '/icon/list.svg',
      title: t('workspace.keyCharacteristics'),
      description: t('workspace.keyCharacteristicsDesc')
    },
    {
      key: 'useSentencePatterns',
      icon: '/icon/align-left.svg',
      title: t('workspace.sentencePatterns'),
      description: t('workspace.sentencePatternsDesc')
    }
  ]

  // Humanization options
  const humanizationOptions = [
    {
      key: 'useAntiAIDetection',
      icon: '/icon/shield.svg',
      title: t('workspace.antiAIDetection'),
      description: t('workspace.antiAIDetectionDesc'),
      badge: 'NEW'
    },
    {
      key: 'humanizeResponse',
      icon: '/icon/user-check.svg',
      title: t('workspace.humanizeOutput'),
      description: t('workspace.humanizeOutputDesc'),
      badge: 'BETA'
    }
  ]

  // Response style options
  const responseStyles = [
    { value: 'concise', label: t('workspace.concise') },
    { value: 'balanced', label: t('workspace.balanced') },
    { value: 'detailed', label: t('workspace.detailed') }
  ]

  // Creativity levels
  const creativityLevels = [
    { value: 'low', label: t('workspace.precise'), temp: 0.3 },
    { value: 'medium', label: t('workspace.balanced'), temp: 0.7 },
    { value: 'high', label: t('workspace.creative'), temp: 0.9 }
  ]

  return (
    <motion.aside 
      className="workspace-sidebar right-sidebar"
      initial={{ x: 0, opacity: 1 }}
      animate={{
        x: hidden ? 300 : 0,
        opacity: hidden ? 0 : 1
      }}
      transition={hidden ? {
        type: "tween",
        duration: 0.2,
        ease: "easeOut"
      } : {
        duration: 0
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 300 }}
      dragElastic={0.2}
      dragMomentum={false}
      onDragEnd={(event, info) => {
        const threshold = 300 * 0.4
        if (info.offset.x > threshold && !hidden) {
          onClose?.()
        }
      }}
      style={{
        pointerEvents: hidden ? 'none' : 'auto'
      }}
    >
      {/* Header */}
      <div className="ws-header">
        <div className="ws-header-title">
          <img src="/icon/settings.svg" alt={t('nav.settings')} />
          <span>{t('workspace.aiSettings')}</span>
        </div>
        <button className="ws-close-btn" onClick={onClose} data-tooltip={t('common.close')} data-tooltip-position="left">
          <img src="/icon/x.svg" alt={t('common.close')} />
        </button>
      </div>

      <div className="ws-content">
        {/* Profile & Model Selection */}
        <ProfileSelector 
          currentProfile={currentProfile}
          onProfileSelect={handleProfileSelect}
        />

        <ModelSelector 
          selectedModel={modelSettings.model || 'gemini-2.0-flash-exp'}
          onModelSelect={handleModelSelect}
        />

        {/* Voice Profile Section */}
        <div className="ws-section">
          <div className="ws-section-header">
            <img src="/icon/mic.svg" alt={t('workspace.voiceProfile')} />
            <span>{t('workspace.voiceProfile')}</span>
          </div>

          <div className="ws-toggle-list">
            {voiceProfileOptions.map((option) => {
              const isMainToggle = option.key === 'useVoiceProfile'
              const voiceEnabled = chatSettings.useVoiceProfile !== false
              const isDisabled = !isMainToggle && (!currentProfile || !voiceEnabled)
              const isChecked = isMainToggle 
                ? voiceEnabled 
                : voiceEnabled && chatSettings[option.key] !== false
              
              return (
                <div 
                  key={option.key} 
                  className={`ws-toggle-item ${isDisabled ? 'ws-disabled' : ''}`}
                >
                  <div className="ws-toggle-left">
                    <img src={option.icon} alt="" className="ws-toggle-icon" />
                    <div className="ws-toggle-info">
                      <span className="ws-toggle-title">{option.title}</span>
                      <span className="ws-toggle-desc">{option.description}</span>
                    </div>
                  </div>
                  <label className="ws-toggle">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggle(option.key)}
                      disabled={isDisabled}
                    />
                    <span className="ws-toggle-track"></span>
                  </label>
                </div>
              )
            })}
          </div>

          {!currentProfile && (
            <div className="ws-notice">
              <img src="/icon/alert-circle.svg" alt={t('common.info')} />
              <span>{t('workspace.selectProfileNotice')}</span>
            </div>
          )}
        </div>

        {/* Humanization Section */}
        <div className="ws-section">
          <div className="ws-section-header">
            <img src="/icon/user-check.svg" alt={t('workspace.humanization')} />
            <span>{t('workspace.humanization')}</span>
            <span className="ws-badge">{t('common.new').toUpperCase()}</span>
          </div>

          <div className="ws-toggle-list">
            {humanizationOptions.map((option) => (
              <div key={option.key} className="ws-toggle-item">
                <div className="ws-toggle-left">
                  <img src={option.icon} alt="" className="ws-toggle-icon" />
                  <div className="ws-toggle-info">
                    <span className="ws-toggle-title">
                      {option.title}
                      {option.badge && <span className="ws-item-badge">{option.badge}</span>}
                    </span>
                    <span className="ws-toggle-desc">{option.description}</span>
                  </div>
                </div>
                <label className="ws-toggle">
                  <input
                    type="checkbox"
                    checked={chatSettings[option.key] || false}
                    onChange={() => handleToggle(option.key)}
                  />
                  <span className="ws-toggle-track"></span>
                </label>
              </div>
            ))}
          </div>

          {/* Target AI Probability - show when humanize is enabled */}
          {chatSettings.humanizeResponse && (
            <div className="ws-slider-item">
              <div className="ws-slider-header">
                <span>{t('workspace.targetAIProbability')}</span>
                <span className="ws-slider-value">{chatSettings.targetAIProbability || 35}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="50"
                step="5"
                value={chatSettings.targetAIProbability || 35}
                onChange={(e) => handleSettingChange('targetAIProbability', parseInt(e.target.value))}
                className="ws-slider"
              />
              <div className="ws-slider-labels">
                <span>{t('workspace.moreHuman')}</span>
                <span>{t('workspace.faster')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Response Style Section */}
        <div className="ws-section">
          <div className="ws-section-header">
            <img src="/icon/sliders.svg" alt={t('workspace.responseStyle')} />
            <span>{t('workspace.responseStyle')}</span>
          </div>
          
          <div className="ws-option-group">
            <span className="ws-option-label">{t('workspace.length')}</span>
            <div className="ws-btn-group">
              {responseStyles.map((style) => (
                <button
                  key={style.value}
                  className={`ws-btn ${(chatSettings.responseStyle || 'balanced') === style.value ? 'active' : ''}`}
                  onClick={() => handleSettingChange('responseStyle', style.value)}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ws-option-group">
            <span className="ws-option-label">{t('workspace.creativity')}</span>
            <div className="ws-btn-group">
              {creativityLevels.map((level) => (
                <button
                  key={level.value}
                  className={`ws-btn ${(chatSettings.creativityLevel || 'medium') === level.value ? 'active' : ''}`}
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
