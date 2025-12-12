import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import Icon from '../Common/Icon'

const WritingPreferences = ({ currentProfile, preferences, onPreferencesChange, onSliderInteraction }) => {
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

  const isProfileDisabled = !currentProfile
  // Both Anti-AI Detection and Iterative Refinement work without profile (generic mode)

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

  // Anti-AI Detection - works without profile (applies anti-AI rules to rewrite)
  const antiAIDetectionItem = {
    key: 'useAntiAIDetection',
    icon: '/icon/shield.svg',
    title: t('writingPreferences.antiAIDetection'),
    description: t('writingPreferences.antiAIDetectionDesc'),
    badge: t('writingPreferences.new')
  }

  // Iterative Refinement - works without profile (switches between Rewrite and Humanize)
  const iterativeRefinementItem = {
    key: 'useIterativeRefinement',
    icon: '/icon/refresh-cw.svg',
    title: t('writingPreferences.iterativeRefinement'),
    description: t('writingPreferences.iterativeRefinementDesc'),
    badge: t('writingPreferences.beta')
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-1 mb-0.5">
        <Icon name="sliders" alt={t('writingPreferences.advancedOptions')} size="xs" color="muted" />
        <h4 className="font-medium text-text-muted m-0 tracking-wide uppercase" style={{ fontSize: '10px' }}>{t('writingPreferences.advancedOptions')}</h4>
      </div>

      {isProfileDisabled && (
        <div className="flex items-start gap-2 py-2 px-2.5 bg-bg-secondary border border-border-light rounded-xl text-[11px] text-text-secondary mb-1">
          <Icon name="alert-circle" alt={t('common.info')} size="sm" color="muted" className="shrink-0 mt-0.5" />
          <span>{t('writingPreferences.selectProfileNotice')}</span>
        </div>
      )}

      <div className="flex flex-col gap-1">
        {preferenceItems.map((item) => (
          <div key={item.key} className={cn(
            "flex items-center justify-between gap-2 py-2 px-2.5",
            "bg-bg-secondary border border-border-light rounded-xl",
            isProfileDisabled && "opacity-50 pointer-events-none"
          )}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Icon name={item.icon.replace('/icon/', '').replace('.svg', '')} alt={item.title} size="md" color="muted" themed className="shrink-0" />
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="text-xs font-medium text-text-primary leading-tight flex items-center gap-1.5">{item.title}</div>
                <div className="text-[11px] text-text-secondary leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{item.description}</div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={localPreferences[item.key]}
                onChange={() => handleToggle(item.key)}
                disabled={isProfileDisabled}
              />
              <span className="toggle-switch-track">
                <span className="toggle-switch-thumb"></span>
              </span>
            </label>
          </div>
        ))}
      </div>

      {/* Humanization Section */}
      <div className="flex items-center gap-1.5 px-1 mb-0.5 mt-2">
        <Icon name="user-check" alt={t('writingPreferences.humanization')} size="xs" color="muted" />
        <h4 className="font-medium text-text-muted m-0 tracking-wide uppercase" style={{ fontSize: '10px' }}>{t('writingPreferences.humanization')}</h4>
      </div>

      <div className="flex flex-col gap-1">
        {/* Anti-AI Detection - works without profile */}
        <div className={cn(
          "flex items-center justify-between gap-2 py-2 px-2.5",
          "bg-bg-secondary border border-border-light rounded-xl"
        )}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon name="shield" alt={antiAIDetectionItem.title} size="md" color="muted" themed className="shrink-0" />
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <div className="text-xs font-medium text-text-primary leading-tight flex items-center gap-1">
                {antiAIDetectionItem.title}
                <span className="text-[8px] font-medium py-px px-1 bg-primary/15 text-primary rounded">{antiAIDetectionItem.badge}</span>
              </div>
              <div className="text-[11px] text-text-secondary leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{antiAIDetectionItem.description}</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localPreferences.useAntiAIDetection}
              onChange={() => handleToggle('useAntiAIDetection')}
            />
            <span className="toggle-switch-track">
              <span className="toggle-switch-thumb"></span>
            </span>
          </label>
        </div>

        {/* Iterative Refinement - works without profile, switches between Rewrite and Humanize */}
        <div className={cn(
          "flex items-center justify-between gap-2 py-2 px-2.5",
          "bg-bg-secondary border border-border-light rounded-xl"
        )}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon name="refresh-cw" alt={iterativeRefinementItem.title} size="md" color="muted" themed className="shrink-0" />
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <div className="text-xs font-medium text-text-primary leading-tight flex items-center gap-1">
                {iterativeRefinementItem.title}
                <span className="text-[8px] font-medium py-px px-1 bg-primary/15 text-primary rounded">{iterativeRefinementItem.badge}</span>
              </div>
              <div className="text-[11px] text-text-secondary leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{iterativeRefinementItem.description}</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localPreferences.useIterativeRefinement}
              onChange={() => handleToggle('useIterativeRefinement')}
            />
            <span className="toggle-switch-track">
              <span className="toggle-switch-thumb"></span>
            </span>
          </label>
        </div>

        {/* Target AI Probability Slider */}
        {localPreferences.useIterativeRefinement && (
          <div className={cn(
            "flex flex-col gap-1.5 py-2 px-2.5",
            "bg-bg-secondary border border-border-light rounded-xl"
          )}>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-text-primary font-medium">{t('writingPreferences.targetAIProbability')}</span>
              <span className="text-primary font-semibold">{localPreferences.targetAIProbability}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="50"
              step="5"
              value={localPreferences.targetAIProbability}
              onChange={(e) => handleSliderChange('targetAIProbability', parseInt(e.target.value))}
              onPointerDown={(e) => {
                e.stopPropagation()
                onSliderInteraction?.(true)
              }}
              onPointerUp={() => onSliderInteraction?.(false)}
              onTouchStart={(e) => {
                e.stopPropagation()
                onSliderInteraction?.(true)
              }}
              onTouchEnd={() => onSliderInteraction?.(false)}
              onMouseDown={(e) => {
                e.stopPropagation()
                onSliderInteraction?.(true)
              }}
              onMouseUp={() => onSliderInteraction?.(false)}
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
      </div>

      {/* Info box for Anti-AI Detection */}
      {localPreferences.useAntiAIDetection && !localPreferences.useIterativeRefinement && (
        <div className="flex items-start gap-2 py-2 px-2.5 bg-bg-secondary border border-border-light rounded-xl mt-1">
          <Icon name="info" alt={t('common.info')} size="sm" color="muted" className="shrink-0 mt-0.5" />
          <div className="text-[11px] text-text-secondary leading-relaxed">
            {t('writingPreferences.antiAIInfo')}
            {isProfileDisabled && ` ${t('writingPreferences.worksWithoutProfile')}`}
          </div>
        </div>
      )}

      {/* Info box for Iterative Refinement */}
      {localPreferences.useIterativeRefinement && (
        <div className="flex items-start gap-2 py-2 px-2.5 bg-bg-secondary border border-border-light rounded-xl mt-1">
          <Icon name="info" alt={t('common.info')} size="sm" color="muted" className="shrink-0 mt-0.5" />
          <div className="text-[11px] text-text-secondary leading-relaxed">
            {t('writingPreferences.iterativeRefinementInfo')}
            {isProfileDisabled && ` ${t('writingPreferences.worksWithoutProfile')}`}
          </div>
        </div>
      )}

      {/* Warning when no profile and all humanization features disabled */}
      {isProfileDisabled && !localPreferences.useAntiAIDetection && !localPreferences.useIterativeRefinement && (
        <div className="flex items-start gap-2 py-2 px-2.5 bg-bg-secondary border border-border-light rounded-xl mt-1">
          <Icon name="alert-circle" alt={t('common.info')} size="sm" color="muted" className="shrink-0 mt-0.5" />
          <div className="text-[11px] text-text-secondary leading-relaxed">
            {t('writingPreferences.enableFeatureOrSelectProfile')}
          </div>
        </div>
      )}

      {/* Warning when has profile but all features disabled */}
      {!isProfileDisabled && !localPreferences.useAntiAIDetection && !localPreferences.useIterativeRefinement && 
       !localPreferences.useVocabularyPreferences && !localPreferences.useKeyCharacteristics && 
       !localPreferences.useSentencePatterns && !localPreferences.useRewriteInstructions && (
        <div className="flex items-start gap-2 py-2 px-2.5 bg-bg-secondary border border-border-light rounded-xl mt-1">
          <Icon name="alert-circle" alt={t('common.info')} size="sm" color="muted" className="shrink-0 mt-0.5" />
          <div className="text-[11px] text-text-secondary leading-relaxed">
            {t('writingPreferences.enableAtLeastOneFeature')}
          </div>
        </div>
      )}
    </div>
  )
}

export default WritingPreferences
