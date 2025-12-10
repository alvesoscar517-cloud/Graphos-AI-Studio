import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'

const ProfileDetailPopup = ({ profile, onClose, onUse }) => {
  const { t } = useTranslation()
  const popupRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  if (!profile) return null

  const stats = profile.statistics || {}
  const voiceProfile = profile.voice_profile || {}
  const vocabPrefs = voiceProfile.vocabulary_preferences || {}
  const sentencePatterns = voiceProfile.sentence_patterns || {}

  const formatTone = (tone) => t(`tones.${tone}`, { defaultValue: tone })
  const formatSentenceLength = (length) => t(`sentenceLengths.${length}`, { defaultValue: length })
  const formatStructure = (structure) => t(`structures.${structure}`, { defaultValue: structure })

  const getQualityRating = () => {
    const rating = profile.quality_rating || profile.qualityRating
    if (rating === 'excellent') return { icon: 'star', label: t('profile.excellent') }
    if (rating === 'good') return { icon: 'thumbs-up', label: t('profile.good') }
    if (rating === 'ok') return { icon: 'check', label: t('profile.meetsRequirements') }
    return { icon: 'alert-circle', label: t('profile.needsImprovement') }
  }

  const getQualityDescription = () => {
    const rating = profile.quality_rating || profile.qualityRating
    if (rating === 'excellent') return t('profile.excellentDesc')
    if (rating === 'good') return t('profile.goodDesc')
    if (rating === 'ok') return t('profile.okDesc')
    return t('profile.poorDesc')
  }

  const qualityRating = profile.quality_rating || profile.qualityRating || 'ok'
  const qualityColors = {
    excellent: { border: 'border-success', text: 'text-success' },
    good: { border: 'border-cyan-500', text: 'text-cyan-500' },
    ok: { border: 'border-warning', text: 'text-warning' },
    poor: { border: 'border-error', text: 'text-error' }
  }

  const sectionClass = cn(
    "mb-6 p-5 bg-bg-secondary border border-border-light rounded-xl",
    "transition-all duration-200",
    "max-lg:mb-5 max-lg:p-4",
    "max-md:mb-4 max-md:p-3.5",
    "max-sm:mb-3 max-sm:p-3"
  )

  const sectionTitleClass = cn(
    "flex items-center gap-2 m-0 mb-4 text-sm font-semibold",
    "text-text-primary uppercase tracking-wider opacity-90",
    "max-lg:mb-3 max-lg:text-xs",
    "max-sm:mb-2.5 max-sm:text-[11px]"
  )

  const gridItemClass = cn(
    "bg-bg-primary border border-border-light p-3 rounded-lg",
    "flex flex-col gap-1 transition-all duration-200",
    "max-lg:p-2.5",
    "max-sm:p-2"
  )

  return createPortal(
    <div className={cn(
      "fixed inset-0 bg-black/75 backdrop-blur-lg flex items-center justify-center z-overlay-high p-5 animate-fade-in",
      "transition-all duration-300",
      "max-lg:p-4 max-md:p-3 max-md:items-end max-sm:p-2"
    )}>
      <div 
        ref={popupRef}
        className={cn(
          "bg-bg-primary border border-border-light rounded-3xl",
          "w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden",
          "shadow-modal animate-slide-up transition-all duration-300",
          "max-lg:max-w-3xl max-lg:rounded-2xl",
          "max-md:max-w-full max-md:max-h-[85vh] max-md:rounded-t-2xl max-md:rounded-b-none",
          "max-sm:max-h-[90vh]"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between py-5 px-6 border-b border-border-light",
          "bg-bg-primary shrink-0",
          "max-lg:py-4 max-lg:px-5",
          "max-md:py-3.5 max-md:px-4",
          "max-sm:py-3 max-sm:px-3"
        )}>
          <div className="flex items-center gap-3 flex-1 min-w-0 max-sm:gap-2">
            <h2 className={cn(
              "m-0 text-xl font-bold text-text-primary tracking-tight truncate",
              "max-lg:text-lg max-sm:text-base"
            )}>
              {profile.profile_name}
            </h2>
            <span className={cn(
              "py-1 px-3 rounded-lg text-xs font-medium border border-transparent shrink-0",
              "max-sm:py-0.5 max-sm:px-2 max-sm:text-[10px]",
              profile.status === 'ready' && "bg-success/[0.12] text-success border-success/20",
              profile.status !== 'ready' && "bg-warning/[0.12] text-warning border-warning/20"
            )}>
              {profile.status === 'ready' ? t('profile.ready') : t('profile.processing')}
            </span>
          </div>
          <button 
            onClick={onClose}
            className={cn(
              "w-9 h-9 rounded-lg border border-border-light bg-bg-secondary shrink-0",
              "cursor-pointer flex items-center justify-center transition-all duration-200",
              "hover:bg-error/10 hover:border-error/30",
              "max-sm:w-8 max-sm:h-8"
            )}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary hover:text-error max-sm:w-4 max-sm:h-4">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={cn(
          "flex-1 overflow-y-auto p-6 bg-bg-primary scrollbar-none",
          "max-lg:p-5 max-md:p-4 max-sm:p-3"
        )}>
          {/* Quality Score Section */}
          {(profile.quality_score || profile.qualityScore) && (
            <section className={sectionClass}>
              <h3 className={sectionTitleClass}>
                <img src="/icon/award.svg" alt="" className="w-4 h-4 opacity-60 icon-invert max-sm:w-3.5 max-sm:h-3.5" />
                {t('profile.profileQuality')}
              </h3>
              <div className="flex items-center gap-5 max-lg:gap-4 max-md:flex-col max-md:items-start max-md:gap-3">
                <div className={cn(
                  "flex items-baseline gap-1 py-4 px-5 bg-bg-primary border-3 rounded-2xl",
                  "min-w-28 justify-center shadow-md",
                  "max-lg:py-3 max-lg:px-4 max-lg:min-w-24",
                  "max-sm:py-2.5 max-sm:px-3 max-sm:min-w-20 max-sm:rounded-xl",
                  qualityColors[qualityRating]?.border
                )}>
                  <span className={cn(
                    "text-4xl font-extrabold leading-none tracking-tight",
                    "max-lg:text-3xl max-sm:text-2xl",
                    qualityColors[qualityRating]?.text
                  )}>
                    {profile.quality_score || profile.qualityScore}
                  </span>
                  <span className="text-sm font-medium text-text-muted max-sm:text-xs">/100</span>
                </div>
                <div className="flex-1 flex flex-col gap-2 max-sm:gap-1.5">
                  <div className={cn(
                    "inline-flex items-center gap-2 py-2 px-4 bg-bg-primary",
                    "border border-border-light rounded-lg text-sm font-semibold w-fit",
                    "shadow-sm",
                    "max-sm:py-1.5 max-sm:px-3 max-sm:text-xs max-sm:gap-1.5"
                  )}>
                    <img src={`/icon/${getQualityRating().icon}.svg`} alt="" className="w-4 h-4 opacity-70 icon-invert max-sm:w-3.5 max-sm:h-3.5" />
                    <span className="text-text-primary font-bold">{getQualityRating().label}</span>
                  </div>
                  <p className="m-0 text-sm text-text-muted leading-relaxed max-sm:text-xs">{getQualityDescription()}</p>
                </div>
              </div>
            </section>
          )}

          {/* Overview Section */}
          <section className={sectionClass}>
            <h3 className={sectionTitleClass}>
              <img src="/icon/info.svg" alt="" className="w-4 h-4 opacity-60 icon-invert max-sm:w-3.5 max-sm:h-3.5" />
              {t('profile.overview')}
            </h3>
            <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-lg:gap-2.5 max-sm:gap-2">
              <div className={gridItemClass}>
                <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider opacity-80 max-sm:text-[9px]">{t('profile.sampleCount')}</span>
                <span className="text-base text-text-primary font-bold tracking-tight max-lg:text-sm max-sm:text-xs">{profile.sample_count || 0} {t('common.samples')}</span>
              </div>
              <div className={gridItemClass}>
                <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider opacity-80 max-sm:text-[9px]">{t('profile.totalWords')}</span>
                <span className="text-base text-text-primary font-bold tracking-tight max-lg:text-sm max-sm:text-xs">{stats.totalWords?.toLocaleString() || 0} {t('common.words')}</span>
              </div>
              <div className={gridItemClass}>
                <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider opacity-80 max-sm:text-[9px]">{t('profile.totalSentences')}</span>
                <span className="text-base text-text-primary font-bold tracking-tight max-lg:text-sm max-sm:text-xs">{stats.totalSentences?.toLocaleString() || 0} {t('common.sentences')}</span>
              </div>
              <div className={gridItemClass}>
                <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider opacity-80 max-sm:text-[9px]">{t('profile.createdDate')}</span>
                <span className="text-base text-text-primary font-bold tracking-tight max-lg:text-sm max-sm:text-xs">{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </section>

          {/* Statistical Features */}
          <section className={sectionClass}>
            <h3 className={sectionTitleClass}>
              <img src="/icon/bar-chart.svg" alt="" className="w-4 h-4 opacity-60 icon-invert max-sm:w-3.5 max-sm:h-3.5" />
              {t('profile.statisticalFeatures')}
            </h3>
            <div className="grid grid-cols-5 gap-3 max-lg:grid-cols-3 max-md:grid-cols-2 max-lg:gap-2.5 max-sm:gap-2">
              <div className={gridItemClass}>
                <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider opacity-80 max-sm:text-[9px]">{t('profile.avgWordLength')}</span>
                <span className="text-base text-text-primary font-bold tracking-tight max-lg:text-sm max-sm:text-xs">{stats.avgWordLength?.toFixed(2) || 0} {t('common.characters')}</span>
              </div>
              <div className={gridItemClass}>
                <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider opacity-80 max-sm:text-[9px]">{t('profile.avgSentenceLength')}</span>
                <span className="text-base text-text-primary font-bold tracking-tight max-lg:text-sm max-sm:text-xs">{stats.avgSentenceLength?.toFixed(1) || 0} {t('common.words')}</span>
              </div>
              <div className={gridItemClass}>
                <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider opacity-80 max-sm:text-[9px]">{t('profile.vocabularyRichness')}</span>
                <span className="text-base text-text-primary font-bold tracking-tight max-lg:text-sm max-sm:text-xs">{((stats.vocabularyRichness || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className={gridItemClass}>
                <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider opacity-80 max-sm:text-[9px]">{t('profile.punctuationRatio')}</span>
                <span className="text-base text-text-primary font-bold tracking-tight max-lg:text-sm max-sm:text-xs">{((stats.punctuationRatio || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className={gridItemClass}>
                <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider opacity-80 max-sm:text-[9px]">{t('profile.readabilityFlesch')}</span>
                <span className="text-base text-text-primary font-bold tracking-tight max-lg:text-sm max-sm:text-xs">{stats.readabilityScore?.toFixed(0) || 0}/100</span>
              </div>
            </div>
          </section>

          {/* Voice Profile */}
          {voiceProfile.tone && (
            <section className={sectionClass}>
              <h3 className={sectionTitleClass}>
                <img src="/icon/mic.svg" alt="" className="w-4 h-4 opacity-60 icon-invert max-sm:w-3.5 max-sm:h-3.5" />
                {t('profile.writingStyle')}
              </h3>
              <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-lg:gap-2.5 max-sm:gap-2">
                <div className={gridItemClass}>
                  <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider opacity-80 max-sm:text-[9px]">{t('profile.tone')}</span>
                  <span className="text-base text-text-primary font-bold tracking-tight max-lg:text-sm max-sm:text-xs">{formatTone(voiceProfile.tone)}</span>
                </div>
                <div className={gridItemClass}>
                  <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider opacity-80 max-sm:text-[9px]">{t('profile.formalityLevel')}</span>
                  <span className="text-base text-text-primary font-bold tracking-tight max-lg:text-sm max-sm:text-xs">{voiceProfile.formality_level || 0}/10</span>
                </div>
                <div className={gridItemClass}>
                  <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider opacity-80 max-sm:text-[9px]">{t('profile.sentenceLength')}</span>
                  <span className="text-base text-text-primary font-bold tracking-tight max-lg:text-sm max-sm:text-xs">{formatSentenceLength(sentencePatterns.typical_length)}</span>
                </div>
                <div className={gridItemClass}>
                  <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider opacity-80 max-sm:text-[9px]">{t('profile.structure')}</span>
                  <span className="text-base text-text-primary font-bold tracking-tight max-lg:text-sm max-sm:text-xs">{formatStructure(sentencePatterns.structure_preference)}</span>
                </div>
              </div>
            </section>
          )}

          {/* Key Characteristics */}
          {voiceProfile.key_characteristics?.length > 0 && (
            <section className={sectionClass}>
              <h3 className={sectionTitleClass}>
                <img src="/icon/list.svg" alt="" className="w-4 h-4 opacity-60 icon-invert" />
                {t('profile.keyCharacteristics')}
              </h3>
              <ul className="list-none p-0 m-0 flex flex-col gap-2">
                {voiceProfile.key_characteristics.map((char, index) => (
                  <li key={index} className={cn(
                    "flex items-start gap-2.5 py-3 px-3.5 bg-bg-primary border border-border-light",
                    "rounded-lg text-sm text-text-primary leading-relaxed transition-all duration-200"
                  )}>
                    <img src="/icon/check-circle.svg" alt="" className="w-4 h-4 opacity-60 shrink-0 mt-0.5 icon-invert" />
                    <span>{char}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Vocabulary Preferences */}
          {(vocabPrefs.common_phrases?.length > 0 || vocabPrefs.preferred_connectors?.length > 0) && (
            <section className={sectionClass}>
              <h3 className={sectionTitleClass}>
                <img src="/icon/book-open.svg" alt="" className="w-4 h-4 opacity-60 icon-invert" />
                {t('profile.preferredVocabulary')}
              </h3>
              
              {vocabPrefs.common_phrases?.length > 0 && (
                <div className="mb-4 last:mb-0">
                  <h4 className="m-0 mb-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider opacity-90">{t('profile.commonPhrases')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {vocabPrefs.common_phrases.map((phrase, index) => (
                      <span key={index} className={cn(
                        "py-1.5 px-3 bg-bg-primary border border-border-light",
                        "rounded-lg text-sm text-text-primary font-medium transition-all duration-200"
                      )}>{phrase}</span>
                    ))}
                  </div>
                </div>
              )}

              {vocabPrefs.preferred_connectors?.length > 0 && (
                <div className="mb-4 last:mb-0">
                  <h4 className="m-0 mb-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider opacity-90">{t('profile.preferredConnectors')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {vocabPrefs.preferred_connectors.map((connector, index) => (
                      <span key={index} className={cn(
                        "py-1.5 px-3 bg-bg-primary border border-border-light",
                        "rounded-lg text-sm text-text-primary font-medium transition-all duration-200"
                      )}>{connector}</span>
                    ))}
                  </div>
                </div>
              )}

              {vocabPrefs.avoid_words?.length > 0 && (
                <div className="mb-4 last:mb-0">
                  <h4 className="m-0 mb-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider opacity-90">{t('profile.wordsToAvoid')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {vocabPrefs.avoid_words.map((word, index) => (
                      <span key={index} className={cn(
                        "py-1.5 px-3 bg-error/[0.12] border border-error/25 rounded-lg",
                        "text-sm text-error font-medium transition-all duration-200"
                      )}>{word}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Rewrite Instructions */}
          {voiceProfile.rewrite_instructions && (
            <section className={sectionClass}>
              <h3 className={sectionTitleClass}>
                <img src="/icon/file-text.svg" alt="" className="w-4 h-4 opacity-60 icon-invert" />
                {t('profile.rewritingGuidelines')}
              </h3>
              <div className="bg-bg-primary border border-border p-4 rounded-lg">
                <p className="m-0 text-sm text-text-primary leading-relaxed italic">{voiceProfile.rewrite_instructions}</p>
              </div>
            </section>
          )}

          {/* Opening Style */}
          {sentencePatterns.opening_style && (
            <section className={cn(sectionClass, "!mb-0")}>
              <h3 className={sectionTitleClass}>
                <img src="/icon/align-left.svg" alt="" className="w-4 h-4 opacity-60 icon-invert" />
                {t('profile.openingStyle')}
              </h3>
              <div className="bg-bg-primary border border-border p-4 rounded-lg">
                <p className="m-0 text-sm text-text-primary leading-relaxed italic">{sentencePatterns.opening_style}</p>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className={cn(
          "py-4 px-6 border-t border-border-light bg-bg-primary",
          "flex justify-end gap-3 shrink-0",
          "max-lg:py-3.5 max-lg:px-5",
          "max-md:px-4 max-md:flex-col-reverse max-md:gap-2",
          "max-sm:py-3 max-sm:px-3"
        )}>
          <button 
            onClick={onClose}
            className={cn(
              "py-2.5 px-6 rounded-lg border border-border-light bg-bg-secondary",
              "text-text-primary text-sm font-semibold cursor-pointer transition-all duration-200",
              "hover:bg-bg-hover hover:border-border-hover",
              "max-sm:py-2 max-sm:px-4 max-sm:text-xs"
            )}
          >
            {t('common.close')}
          </button>
          {onUse && profile.status === 'ready' && (
            <button 
              onClick={onUse}
              className={cn(
                "py-2.5 px-6 rounded-lg border border-border-light bg-bg-primary",
                "text-text-primary text-sm font-semibold cursor-pointer transition-all duration-200",
                "flex items-center justify-center gap-2 hover:bg-bg-hover hover:border-border-hover",
                "max-sm:py-2 max-sm:px-4 max-sm:text-xs max-sm:gap-1.5"
              )}
            >
              <img src="/icon/play.svg" alt="" className="w-4 h-4 opacity-60 transition-all duration-200 icon-invert max-sm:w-3.5 max-sm:h-3.5" />
              {t('profile.useThisProfile')}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ProfileDetailPopup
