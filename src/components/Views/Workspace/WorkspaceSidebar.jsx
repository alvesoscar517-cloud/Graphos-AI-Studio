import { useEffect } from 'react'
import { useProfiles } from '../../../contexts/ProfileContext'
import { useWorkspace } from '../../../contexts/WorkspaceContext'
import ProfileSelector from '../../Analysis/ProfileSelector'
import ModelSelector from '../../Analysis/ModelSelector'
import './WorkspaceSidebar.css'

const WorkspaceSidebar = ({ hidden, onClose }) => {
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
      title: 'Use Voice Profile',
      description: 'Apply your writing style to AI responses'
    },
    {
      key: 'useVocabularyPreferences',
      icon: '/icon/book-open.svg',
      title: 'Vocabulary Preferences',
      description: 'Use your preferred phrases and connectors'
    },
    {
      key: 'useKeyCharacteristics',
      icon: '/icon/list.svg',
      title: 'Key Characteristics',
      description: 'Match your writing characteristics'
    },
    {
      key: 'useSentencePatterns',
      icon: '/icon/align-left.svg',
      title: 'Sentence Patterns',
      description: 'Follow your sentence structure style'
    }
  ]

  // Humanization options
  const humanizationOptions = [
    {
      key: 'useAntiAIDetection',
      icon: '/icon/shield.svg',
      title: 'Anti-AI Detection',
      description: 'Avoid AI-typical patterns in responses',
      badge: 'NEW'
    },
    {
      key: 'humanizeResponse',
      icon: '/icon/user-check.svg',
      title: 'Humanize Output',
      description: 'Make responses indistinguishable from human',
      badge: 'BETA'
    }
  ]

  // Response style options
  const responseStyles = [
    { value: 'concise', label: 'Concise' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'detailed', label: 'Detailed' }
  ]

  // Creativity levels
  const creativityLevels = [
    { value: 'low', label: 'Precise', temp: 0.3 },
    { value: 'medium', label: 'Balanced', temp: 0.7 },
    { value: 'high', label: 'Creative', temp: 0.9 }
  ]

  return (
    <aside className={`workspace-sidebar right-sidebar ${hidden ? 'hidden' : ''}`}>
      {/* Header */}
      <div className="ws-header">
        <div className="ws-header-title">
          <img src="/icon/settings.svg" alt="Settings" />
          <span>AI Settings</span>
        </div>
        <button className="ws-close-btn" onClick={onClose}>
          <img src="/icon/x.svg" alt="Close" />
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
            <img src="/icon/mic.svg" alt="Voice" />
            <span>Voice Profile</span>
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
              <img src="/icon/alert-circle.svg" alt="Info" />
              <span>Select a profile to enable voice customization</span>
            </div>
          )}
        </div>

        {/* Humanization Section */}
        <div className="ws-section">
          <div className="ws-section-header">
            <img src="/icon/user-check.svg" alt="Humanize" />
            <span>Humanization</span>
            <span className="ws-badge">NEW</span>
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
                <span>Target AI Probability</span>
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
                <span>More human</span>
                <span>Faster</span>
              </div>
            </div>
          )}
        </div>

        {/* Response Style Section */}
        <div className="ws-section">
          <div className="ws-section-header">
            <img src="/icon/sliders.svg" alt="Style" />
            <span>Response Style</span>
          </div>
          
          <div className="ws-option-group">
            <span className="ws-option-label">Length</span>
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
            <span className="ws-option-label">Creativity</span>
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
    </aside>
  )
}

export default WorkspaceSidebar
