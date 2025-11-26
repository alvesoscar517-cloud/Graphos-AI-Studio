import { useEffect, useRef } from 'react'
import './ProfileDetailPopup.css'

const ProfileDetailPopup = ({ profile, onClose, onUse }) => {
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
    const toneMap = {
      'professional': 'Professional',
      'casual': 'Casual',
      'academic': 'Academic',
      'creative': 'Creative',
      'friendly': 'Friendly',
      'formal': 'Formal',
      'neutral': 'Neutral'
    }
    return toneMap[tone] || tone
  }

  // Format sentence length
  const formatSentenceLength = (length) => {
    const lengthMap = {
      'short': 'Short',
      'medium': 'Medium',
      'long': 'Long'
    }
    return lengthMap[length] || length
  }

  // Format structure preference
  const formatStructure = (structure) => {
    const structureMap = {
      'simple': 'Simple',
      'complex': 'Complex',
      'varied': 'Varied'
    }
    return structureMap[structure] || structure
  }

  return (
    <div className="profile-detail-overlay">
      <div className="profile-detail-popup" ref={popupRef}>
        <div className="profile-detail-header">
          <div className="profile-detail-title-section">
            <h2>{profile.profile_name}</h2>
            <span className={`profile-status-badge ${profile.status}`}>
              {profile.status === 'ready' ? 'Ready' : 'Processing'}
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
                <img src="/icon/award.svg" alt="Quality" />
                Profile Quality
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
                    {(profile.quality_rating || profile.qualityRating) === 'excellent' && (
                      <>
                        <img src="/icon/star.svg" alt="Excellent" />
                        <span>Excellent</span>
                      </>
                    )}
                    {(profile.quality_rating || profile.qualityRating) === 'good' && (
                      <>
                        <img src="/icon/thumbs-up.svg" alt="Good" />
                        <span>Tốt</span>
                      </>
                    )}
                    {(profile.quality_rating || profile.qualityRating) === 'ok' && (
                      <>
                        <img src="/icon/check.svg" alt="OK" />
                        <span>Đạt yêu cầu</span>
                      </>
                    )}
                    {(profile.quality_rating || profile.qualityRating) === 'poor' && (
                      <>
                        <img src="/icon/alert-circle.svg" alt="Poor" />
                        <span>Needs Improvement</span>
                      </>
                    )}
                  </div>
                  <p className="quality-description">
                    {(profile.quality_rating || profile.qualityRating) === 'excellent' && 'Excellent profile! AI will learn your writing style very well.'}
                    {(profile.quality_rating || profile.qualityRating) === 'good' && 'Good profile! AI can learn your writing style.'}
                    {(profile.quality_rating || profile.qualityRating) === 'ok' && 'Adequate profile, but consider improving for better AI learning.'}
                    {(profile.quality_rating || profile.qualityRating) === 'poor' && 'Profile needs improvement. Add more samples and diverse content.'}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Overview Section */}
          <section className="profile-detail-section">
            <h3>
              <img src="/icon/info.svg" alt="Info" />
              Overview
            </h3>
            <div className="profile-detail-grid">
              <div className="profile-detail-item">
                <span className="label">Sample Count</span>
                <span className="value">{profile.sample_count || 0} samples</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">Total Words</span>
                <span className="value">{stats.totalWords?.toLocaleString() || 0} words</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">Total Sentences</span>
                <span className="value">{stats.totalSentences?.toLocaleString() || 0} sentences</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">Created Date</span>
                <span className="value">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US') : 'N/A'}
                </span>
              </div>
            </div>
          </section>

          {/* Statistical Features */}
          <section className="profile-detail-section">
            <h3>
              <img src="/icon/bar-chart.svg" alt="Stats" />
              Statistical Features
            </h3>
            <div className="profile-detail-grid">
              <div className="profile-detail-item">
                <span className="label">Avg Word Length</span>
                <span className="value">{stats.avgWordLength?.toFixed(2) || 0} characters</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">Avg Sentence Length</span>
                <span className="value">{stats.avgSentenceLength?.toFixed(1) || 0} words</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">Vocabulary Richness</span>
                <span className="value">{((stats.vocabularyRichness || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">Punctuation Ratio</span>
                <span className="value">{((stats.punctuationRatio || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="profile-detail-item">
                <span className="label">Readability Score (Flesch)</span>
                <span className="value">{stats.readabilityScore?.toFixed(0) || 0}/100</span>
              </div>
            </div>
          </section>

          {/* Voice Profile */}
          {voiceProfile.tone && (
            <section className="profile-detail-section">
              <h3>
                <img src="/icon/mic.svg" alt="Voice" />
                Writing Style
              </h3>
              <div className="profile-detail-grid">
                <div className="profile-detail-item">
                  <span className="label">Tone</span>
                  <span className="value">{formatTone(voiceProfile.tone)}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="label">Formality Level</span>
                  <span className="value">{voiceProfile.formality_level || 0}/10</span>
                </div>
                <div className="profile-detail-item">
                  <span className="label">Độ dài câu</span>
                  <span className="value">{formatSentenceLength(sentencePatterns.typical_length)}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="label">Cấu trúc</span>
                  <span className="value">{formatStructure(sentencePatterns.structure_preference)}</span>
                </div>
              </div>
            </section>
          )}

          {/* Key Characteristics */}
          {voiceProfile.key_characteristics && voiceProfile.key_characteristics.length > 0 && (
            <section className="profile-detail-section">
              <h3>
                <img src="/icon/list.svg" alt="Characteristics" />
                Key Characteristics
              </h3>
              <ul className="profile-characteristics-list">
                {voiceProfile.key_characteristics.map((char, index) => (
                  <li key={index}>
                    <img src="/icon/check-circle.svg" alt="Check" />
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
                <img src="/icon/book-open.svg" alt="Vocabulary" />
                Preferred Vocabulary
              </h3>
              
              {vocabPrefs.common_phrases?.length > 0 && (
                <div className="profile-vocab-group">
                  <h4>Common Phrases</h4>
                  <div className="profile-tags">
                    {vocabPrefs.common_phrases.map((phrase, index) => (
                      <span key={index} className="profile-tag">{phrase}</span>
                    ))}
                  </div>
                </div>
              )}

              {vocabPrefs.preferred_connectors?.length > 0 && (
                <div className="profile-vocab-group">
                  <h4>Preferred Connectors</h4>
                  <div className="profile-tags">
                    {vocabPrefs.preferred_connectors.map((connector, index) => (
                      <span key={index} className="profile-tag">{connector}</span>
                    ))}
                  </div>
                </div>
              )}

              {vocabPrefs.avoid_words?.length > 0 && (
                <div className="profile-vocab-group">
                  <h4>Words to Avoid</h4>
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
                <img src="/icon/file-text.svg" alt="Instructions" />
                Rewriting Guidelines
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
                <img src="/icon/align-left.svg" alt="Opening" />
                Opening Style
              </h3>
              <div className="profile-instructions">
                <p>{sentencePatterns.opening_style}</p>
              </div>
            </section>
          )}
        </div>

        <div className="profile-detail-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {onUse && profile.status === 'ready' && (
            <button className="btn-primary" onClick={onUse}>
              <img src="/icon/play.svg" alt="Use" />
              Use this profile
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileDetailPopup
