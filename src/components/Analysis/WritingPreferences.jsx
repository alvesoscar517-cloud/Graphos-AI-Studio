import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './WritingPreferences.css'

const WritingPreferences = ({ currentProfile, preferences, onPreferencesChange }) => {
  const { t } = useTranslation()
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

  const isDisabled = !currentProfile

  const preferenceItems = [
    {
      key: 'useVocabularyPreferences',
      icon: '/icon/book-open.svg',
      title: t('writingPreferences.preferredVocabulary'),
      description: t('writingPreferences.preferredVocabularyDesc')
    },
    {
      key: 'useKeyCharacteristics',
      icon: '/icon/list.svg',
      title: t('writingPreferences.keyFeatures'),
      description: t('writingPreferences.keyFeaturesDesc')
    },
    {
      key: 'useSentencePatterns',
      icon: '/icon/align-left.svg',
      title: t('writingPreferences.sentenceStructure'),
      description: t('writingPreferences.sentenceStructureDesc')
    },
    {
      key: 'useRewriteInstructions',
      icon: '/icon/file-text.svg',
      title: t('writingPreferences.rewriteInstructions'),
      description: t('writingPreferences.rewriteInstructionsDesc')
    }
  ]

  const humanizationItems = [
    {
      key: 'useAntiAIDetection',
      icon: '/icon/shield.svg',
      title: t('writingPreferences.antiAIDetection'),
      description: t('writingPreferences.antiAIDetectionDesc'),
      badge: t('writingPreferences.new')
    },
    {
      key: 'useIterativeRefinement',
      icon: '/icon/refresh-cw.svg',
      title: t('writingPreferences.iterativeRefinement'),
      description: t('writingPreferences.iterativeRefinementDesc'),
      badge: t('writingPreferences.beta')
    }
  ]

  return (
    <div className={`wp-container ${isDisabled ? 'wp-disabled' : ''}`}>
      <div className="wp-header">
        <img src="/icon/sliders.svg" alt={t('writingPreferences.advancedOptions')} className="wp-header-icon" />
        <h4 className="wp-header-title">{t('writingPreferences.advancedOptions')}</h4>
      </div>

      {isDisabled && (
        <div className="wp-notice">
          <img src="/icon/alert-circle.svg" alt={t('common.info')} />
          <span>{t('writingPreferences.selectProfileNotice')}</span>
        </div>
      )}

      <div className="wp-list">
        {preferenceItems.map((item) => (
          <div key={item.key} className={`wp-item ${isDisabled ? 'wp-item-disabled' : ''}`}>
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
                disabled={isDisabled}
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
        <img src="/icon/user-check.svg" alt={t('writingPreferences.humanization')} className="wp-header-icon" />
        <h4 className="wp-header-title">{t('writingPreferences.humanization')}</h4>
        <span className="wp-header-badge">{t('writingPreferences.new')}</span>
      </div>

      <div className="wp-list">
        {humanizationItems.map((item) => (
          <div key={item.key} className={`wp-item ${isDisabled ? 'wp-item-disabled' : ''}`}>
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
                disabled={isDisabled}
              />
              <span className="wp-toggle-track">
                <span className="wp-toggle-thumb"></span>
              </span>
            </label>
          </div>
        ))}

        {/* Target AI Probability Slider - only show when iterative refinement is enabled */}
        {localPreferences.useIterativeRefinement && (
          <div className={`wp-item wp-item-slider ${isDisabled ? 'wp-item-disabled' : ''}`}>
            <div className="wp-item-left">
              <img src="/icon/target.svg" alt={t('writingPreferences.targetAIProbability')} className="wp-item-icon" />
              <div className="wp-item-content">
                <div className="wp-item-title">{t('writingPreferences.targetAIProbability')}</div>
                <div className="wp-item-desc">
                  {t('writingPreferences.refineUntilBelow', { percent: localPreferences.targetAIProbability })}
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
                disabled={isDisabled}
              />
              <span className="wp-slider-value">{localPreferences.targetAIProbability}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Info box */}
      {localPreferences.useAntiAIDetection && !isDisabled && (
        <div className="wp-info-box">
          <img src="/icon/info.svg" alt={t('common.info')} className="wp-info-icon" />
          <div className="wp-info-text">
            {t('writingPreferences.antiAIInfo')}
          </div>
        </div>
      )}
    </div>
  )
}

export default WritingPreferences
