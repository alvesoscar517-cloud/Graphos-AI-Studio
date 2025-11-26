import { useState, useEffect } from 'react'
import './WritingPreferences.css'

const WritingPreferences = ({ currentProfile, preferences, onPreferencesChange }) => {
  const [localPreferences, setLocalPreferences] = useState(preferences || {
    useVocabularyPreferences: true,
    useKeyCharacteristics: true,
    useSentencePatterns: true,
    useRewriteInstructions: true,
    // New humanization options
    useAntiAIDetection: true,
    useIterativeRefinement: false,
    targetAIProbability: 35
  })

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(prev => ({ ...prev, ...preferences }))
    }
  }, [preferences])

  const handleToggle = (key) => {
    const updated = { ...localPreferences, [key]: !localPreferences[key] }
    setLocalPreferences(updated)
    onPreferencesChange(updated)
  }

  const handleSliderChange = (key, value) => {
    const updated = { ...localPreferences, [key]: value }
    setLocalPreferences(updated)
    onPreferencesChange(updated)
  }

  if (!currentProfile) {
    return null
  }

  const preferenceItems = [
    {
      key: 'useVocabularyPreferences',
      icon: '/icon/book-open.svg',
      title: 'Preferred Vocabulary',
      description: 'Common phrases, connectors, and words to avoid'
    },
    {
      key: 'useKeyCharacteristics',
      icon: '/icon/list.svg',
      title: 'Key Features',
      description: 'Analyzed writing style characteristics'
    },
    {
      key: 'useSentencePatterns',
      icon: '/icon/align-left.svg',
      title: 'Sentence Structure',
      description: 'Opening style and characteristic patterns'
    },
    {
      key: 'useRewriteInstructions',
      icon: '/icon/file-text.svg',
      title: 'Rewrite Instructions',
      description: 'Custom rewrite instructions'
    }
  ]

  const humanizationItems = [
    {
      key: 'useAntiAIDetection',
      icon: '/icon/shield.svg',
      title: 'Anti-AI Detection',
      description: 'Apply rules to avoid AI-typical patterns',
      badge: 'NEW'
    },
    {
      key: 'useIterativeRefinement',
      icon: '/icon/refresh-cw.svg',
      title: 'Iterative Refinement',
      description: 'Refine until AI probability is below target',
      badge: 'BETA'
    }
  ]

  return (
    <div className="wp-container">
      <div className="wp-header">
        <img src="/icon/sliders.svg" alt="Settings" className="wp-header-icon" />
        <h4 className="wp-header-title">ADVANCED OPTIONS</h4>
      </div>

      <div className="wp-list">
        {preferenceItems.map((item) => (
          <div key={item.key} className="wp-item">
            <div className="wp-item-left">
              <img src={item.icon} alt={item.title} className="wp-item-icon" />
              <div className="wp-item-content">
                <div className="wp-item-title">{item.title}</div>
                <div className="wp-item-desc">{item.description}</div>
              </div>
            </div>
            <label className="wp-toggle">
              <input
                type="checkbox"
                checked={localPreferences[item.key]}
                onChange={() => handleToggle(item.key)}
                className="wp-toggle-input"
              />
              <span className="wp-toggle-track">
                <span className="wp-toggle-thumb"></span>
              </span>
            </label>
          </div>
        ))}
      </div>

      {/* Humanization Section */}
      <div className="wp-header wp-header-humanize">
        <img src="/icon/user-check.svg" alt="Humanize" className="wp-header-icon" />
        <h4 className="wp-header-title">HUMANIZATION</h4>
        <span className="wp-header-badge">NEW</span>
      </div>

      <div className="wp-list">
        {humanizationItems.map((item) => (
          <div key={item.key} className="wp-item">
            <div className="wp-item-left">
              <img src={item.icon} alt={item.title} className="wp-item-icon" />
              <div className="wp-item-content">
                <div className="wp-item-title">
                  {item.title}
                  {item.badge && <span className="wp-item-badge">{item.badge}</span>}
                </div>
                <div className="wp-item-desc">{item.description}</div>
              </div>
            </div>
            <label className="wp-toggle">
              <input
                type="checkbox"
                checked={localPreferences[item.key]}
                onChange={() => handleToggle(item.key)}
                className="wp-toggle-input"
              />
              <span className="wp-toggle-track">
                <span className="wp-toggle-thumb"></span>
              </span>
            </label>
          </div>
        ))}

        {/* Target AI Probability Slider - only show when iterative refinement is enabled */}
        {localPreferences.useIterativeRefinement && (
          <div className="wp-item wp-item-slider">
            <div className="wp-item-left">
              <img src="/icon/target.svg" alt="Target" className="wp-item-icon" />
              <div className="wp-item-content">
                <div className="wp-item-title">Target AI Probability</div>
                <div className="wp-item-desc">
                  Refine until AI detection is below {localPreferences.targetAIProbability}%
                </div>
              </div>
            </div>
            <div className="wp-slider-container">
              <input
                type="range"
                min="20"
                max="50"
                step="5"
                value={localPreferences.targetAIProbability}
                onChange={(e) => handleSliderChange('targetAIProbability', parseInt(e.target.value))}
                className="wp-slider"
              />
              <span className="wp-slider-value">{localPreferences.targetAIProbability}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Info box */}
      {localPreferences.useAntiAIDetection && (
        <div className="wp-info-box">
          <img src="/icon/info.svg" alt="Info" className="wp-info-icon" />
          <div className="wp-info-text">
            Anti-AI Detection applies advanced rules to make your text indistinguishable from human writing, 
            including natural contractions, varied sentence lengths, and avoiding AI-typical phrases.
          </div>
        </div>
      )}
    </div>
  )
}

export default WritingPreferences
