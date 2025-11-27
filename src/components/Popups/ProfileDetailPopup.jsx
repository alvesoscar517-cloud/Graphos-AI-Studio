import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import './ProfileDetailPopup.css'

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

  // Format tone
  const formatTone = (tone) => {
    return t(`tones.${tone}`, { defaultValue: tone })
  }

  // Format sentence length
  const formatSentenceLength = (length) => {
    return t(`sentenceLengths.${length}`, { defaultValue: length })
  }

  // Format structure preference
  const formatStructure = (structure) => {
    return t(`structures.${structure}`, { defaultValue: structure })
  }

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

  return (
    <div className="profile-detail-overlay">
      <div className="profile-detail-popup" ref={popupRef}>
        <div className="profile-detail-header">
          <div className="profile-detail-title-section">
            <h2>{profile.profile_name}</h2>
            <span className={`profile-status-badge ${profile.status}`}>
              {profile.status === 'ready' ? t('profile.ready') : t('profile.processing')}
            </span>
          </div>
          <button className="profile-detail-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="profile-detail-content">
          {/* Quality Score Section */}
          {(profile.quality_score || profile.qualityScore) && (
            <section className="profile-detail-section">
              <h3>
                <img src="/icon/award.svg" alt={t('profile.profileQuality')} />
                {t('profile.profileQuality')}
              </h3>
              <div className="profile-quality-score">
                <div className={`quality-score-display quality-rating-${profile.quality_rating || profile.qualityRating || 'ok'}`}>
                  <div className="quality-score-number">
                    {profile.quality_score || profile.qualityScore}
                  </div>
                  <div className="quality-score-label">/100</div>
                </div>
                <div className="quality-score-info">
                  <div className="quality-rating-badge">
                    <img src={`/icon/${getQualityRating().icon}.svg`} alt="" />
                    <span>{getQualityRating().label}</span>
                  </div>
                  <p className="quality-description">{getQualityDescription()}</p>
                </div>
              </div>
            </section>
          )}

          {/* Overview Section */}
          <section className="profile-detail-section">
            <h3>
              <img src="/icon/info.svg" alt={t('profile.overview')} />
              {t('profile.overview')}
            </h3>
            <div className="profile-detail-grid">
              <div className="profile-detail-item">
                <span className="label">{t('profile.sampleCount')}</span>
                <span className="value">{profile.sample_count || 0} {t('common.samples')}</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">{t('profile.totalWords')}</span>
                <span className="value">{stats.totalWords?.toLocaleString() || 0} {t('common.words')}</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">{t('profile.totalSentences')}</span>
                <span className="value">{stats.totalSentences?.toLocaleString() || 0} {t('common.sentences')}</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">{t('profile.createdDate')}</span>
                <span className="value">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </section>

          {/* Statistical Features */}
          <section className="profile-detail-section">
            <h3>
              <img src="/icon/bar-chart.svg" alt={t('profile.statisticalFeatures')} />
              {t('profile.statisticalFeatures')}
            </h3>
            <div className="profile-detail-grid">
              <div className="profile-detail-item">
                <span className="label">{t('profile.avgWordLength')}</span>
                <span className="value">{stats.avgWordLength?.toFixed(2) || 0} {t('common.characters')}</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">{t('profile.avgSentenceLength')}</span>
                <span className="value">{stats.avgSentenceLength?.toFixed(1) || 0} {t('common.words')}</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">{t('profile.vocabularyRichness')}</span>
                <span className="value">{((stats.vocabularyRichness || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">{t('profile.punctuationRatio')}</span>
                <span className="value">{((stats.punctuationRatio || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">{t('profile.readabilityFlesch')}</span>
                <span className="value">{stats.readabilityScore?.toFixed(0) || 0}/100</span>
              </div>
            </div>
          </section>

          {/* Voice Profile */}
          {voiceProfile.tone && (
            <section className="profile-detail-section">
              <h3>
                <img src="/icon/mic.svg" alt={t('profile.writingStyle')} />
                {t('profile.writingStyle')}
              </h3>
              <div className="profile-detail-grid">
                <div className="profile-detail-item">
                  <span className="label">{t('profile.tone')}</span>
                  <span className="value">{formatTone(voiceProfile.tone)}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="label">{t('profile.formalityLevel')}</span>
                  <span className="value">{voiceProfile.formality_level || 0}/10</span>
                </div>
                <div className="profile-detail-item">
                  <span className="label">{t('profile.sentenceLength')}</span>
                  <span className="value">{formatSentenceLength(sentencePatterns.typical_length)}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="label">{t('profile.structure')}</span>
                  <span className="value">{formatStructure(sentencePatterns.structure_preference)}</span>
                </div>
              </div>
            </section>
          )}

          {/* Key Characteristics */}
          {voiceProfile.key_characteristics && voiceProfile.key_characteristics.length > 0 && (
            <section className="profile-detail-section">
              <h3>
                <img src="/icon/list.svg" alt={t('profile.keyCharacteristics')} />
                {t('profile.keyCharacteristics')}
              </h3>
              <ul className="profile-characteristics-list">
                {voiceProfile.key_characteristics.map((char, index) => (
                  <li key={index}>
                    <img src="/icon/check-circle.svg" alt="" />
                    <span>{char}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Vocabulary Preferences */}
          {(vocabPrefs.common_phrases?.length > 0 || vocabPrefs.preferred_connectors?.length > 0) && (
            <section className="profile-detail-section">
              <h3>
                <img src="/icon/book-open.svg" alt={t('profile.preferredVocabulary')} />
                {t('profile.preferredVocabulary')}
              </h3>
              
              {vocabPrefs.common_phrases?.length > 0 && (
                <div className="profile-vocab-group">
                  <h4>{t('profile.commonPhrases')}</h4>
                  <div className="profile-tags">
                    {vocabPrefs.common_phrases.map((phrase, index) => (
                      <span key={index} className="profile-tag">{phrase}</span>
                    ))}
                  </div>
                </div>
              )}

              {vocabPrefs.preferred_connectors?.length > 0 && (
                <div className="profile-vocab-group">
                  <h4>{t('profile.preferredConnectors')}</h4>
                  <div className="profile-tags">
                    {vocabPrefs.preferred_connectors.map((connector, index) => (
                      <span key={index} className="profile-tag">{connector}</span>
                    ))}
                  </div>
                </div>
              )}

              {vocabPrefs.avoid_words?.length > 0 && (
                <div className="profile-vocab-group">
                  <h4>{t('profile.wordsToAvoid')}</h4>
                  <div className="profile-tags avoid">
                    {vocabPrefs.avoid_words.map((word, index) => (
                      <span key={index} className="profile-tag avoid">{word}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Rewrite Instructions */}
          {voiceProfile.rewrite_instructions && (
            <section className="profile-detail-section">
              <h3>
                <img src="/icon/file-text.svg" alt={t('profile.rewritingGuidelines')} />
                {t('profile.rewritingGuidelines')}
              </h3>
              <div className="profile-instructions">
                <p>{voiceProfile.rewrite_instructions}</p>
              </div>
            </section>
          )}

          {/* Opening Style */}
          {sentencePatterns.opening_style && (
            <section className="profile-detail-section">
              <h3>
                <img src="/icon/align-left.svg" alt={t('profile.openingStyle')} />
                {t('profile.openingStyle')}
              </h3>
              <div className="profile-instructions">
                <p>{sentencePatterns.opening_style}</p>
              </div>
            </section>
          )}
        </div>

        <div className="profile-detail-footer">
          <button className="btn-secondary" onClick={onClose}>
            {t('common.close')}
          </button>
          {onUse && profile.status === 'ready' && (
            <button className="btn-primary" onClick={onUse}>
              <img src="/icon/play.svg" alt={t('profile.useThisProfile')} />
              {t('profile.useThisProfile')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileDetailPopup
