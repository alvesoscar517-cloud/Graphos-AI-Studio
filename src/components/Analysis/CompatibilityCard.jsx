import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { analyzeText } from '../../services/api'
import { useNotes } from '../../contexts/NotesContext'
import { getCachedAnalysis, setCachedAnalysis } from '../../services/analysisCache'
import modal from '../../utils/modal'
import Lottie from 'lottie-react'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import './Analysis.css'
import './CompatibilityCard.css'

const CompatibilityCard = ({ disabled, currentProfile, text }) => {
  const { t } = useTranslation()

  // Helper function to format breakdown labels
  const formatBreakdownLabel = (key) => {
    const labels = {
      avgWordLength: t('analysis.avgWordLength'),
      avgSentenceLength: t('analysis.avgSentenceLength'),
      readabilityScore: t('analysis.readability'),
      vocabularyRichness: t('analysis.vocabulary'),
      punctuationRatio: t('analysis.punctuationRatio'),
      avgParagraphLength: t('analysis.avgParagraphLength'),
      sentenceStarterSimilarity: t('analysis.sentenceStarters'),
      transitionWordSimilarity: t('analysis.transitionWords')
    }
    return labels[key] || key
  }
  const [score, setScore] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analysisDetails, setAnalysisDetails] = useState(null)
  const [showResult, setShowResult] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [textChanged, setTextChanged] = useState(true)
  const { currentNote } = useNotes()

  // Reset state and load cached result when note or profile changes
  useEffect(() => {
    // Always reset state first when note/profile changes
    setScore(null)
    setAnalysisDetails(null)
    setTextChanged(true)

    if (!currentNote || !currentProfile) {
      return
    }

    // Only load cache if we have text and exact match exists
    if (text) {
      const cacheKey = `${currentProfile.profile_id}_${text}`
      const cached = getCachedAnalysis(currentNote.id, cacheKey, 'compatibility')
      if (cached) {
        setScore(cached.score)
        setAnalysisDetails(cached.details)
        setTextChanged(false)
        console.log('[PACKAGE] Loaded cached compatibility result for note:', currentNote.id)
      }
    }
  }, [currentNote?.id, currentProfile?.profile_id])

  // Check if text or profile has changed and load cache if available
  useEffect(() => {
    if (!currentNote || !text || !currentProfile) {
      setTextChanged(true)
      return
    }

    // Check if we have cached result for this exact text + profile
    const cacheKey = `${currentProfile.profile_id}_${text}`
    const cached = getCachedAnalysis(currentNote.id, cacheKey, 'compatibility')
    if (cached) {
      setScore(cached.score)
      setAnalysisDetails(cached.details)
      setTextChanged(false)
      console.log('[PACKAGE] Loaded cached compatibility result for text change')
    } else {
      // Text/profile changed but no cache - reset result and enable button
      setScore(null)
      setAnalysisDetails(null)
      setTextChanged(true)
    }
  }, [currentNote?.id, text, currentProfile?.profile_id])

  const calculateScore = async () => {
    if (!currentProfile || !text) {
      modal.error(t('analysis.pleaseSelectProfileAndText'))
      return
    }

    if (!currentNote) {
      modal.error(t('analysis.currentNoteNotFound'))
      return
    }
    
    setIsLoading(true)
    try {
      console.log('[SEARCH] Analyzing with profile:', currentProfile.profile_id)
      console.log('[NOTE] Text length:', text.length)
      
      const result = await analyzeText(currentProfile.profile_id, text)
      
      if (result.success && result.data) {
        const compatibilityScore = Math.round(result.data.voice_compatibility_score || 0)
        
        const resultData = {
          score: compatibilityScore,
          details: result.data
        }
        
        setScore(compatibilityScore)
        setAnalysisDetails(result.data)
        
        // Save to cache with profile_id + text as key
        const cacheKey = `${currentProfile.profile_id}_${text}`
        setCachedAnalysis(currentNote.id, cacheKey, 'compatibility', resultData)
        setTextChanged(false)
        
        // Show detailed toast
        const cacheStatus = result.data.cache_hit ? t('common.cached') : t('common.fresh')
        const processingTime = result.data.processing_time_ms || 0
        modal.toast(
          t('analysis.calculationComplete'), 
          `${t('profile.score')}: ${compatibilityScore}% | ${cacheStatus} | ${processingTime}ms`, 
          'success'
        )
        
        console.log('[SUCCESS] Analysis complete:', {
          score: compatibilityScore,
          vectorScore: result.data.vector_score,
          statisticalScore: result.data.statistical_score,
          cacheHit: result.data.cache_hit,
          processingTime: processingTime,
          samplesUsed: result.data.samples_used,
          hasSentenceAnalysis: !!result.data.sentence_analysis,
          sentenceCount: result.data.sentence_analysis?.length || 0
        })
      } else {
        throw new Error(result.error || t('analysis.calculationFailed'))
      }
    } catch (error) {
      console.error('[FAIL] Error calculating score:', error)
      modal.error(t('analysis.calculationFailed') + ' ' + error.message)
      setScore(null)
      setAnalysisDetails(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return '#34a853' // Green
    if (score >= 75) return '#4285f4' // Blue
    if (score >= 60) return '#fbbc04' // Yellow
    if (score >= 40) return '#ff9800' // Orange
    return '#ea4335' // Red
  }

  const getScoreLabel = (score) => {
    if (score >= 90) return t('analysis.veryCompatible')
    if (score >= 75) return t('analysis.goodCompatibility')
    if (score >= 60) return t('analysis.averageCompatibility')
    if (score >= 40) return t('analysis.lowCompatibility')
    return t('analysis.notCompatible')
  }



  return (
    <>
      <div className="feature-card compatibility-card">
        <div className="feature-card-header">
          <div className="feature-icon compatibility-icon">
            <img src="/icon/target.svg" alt={t('analysis.compatibilityScore')} />
          </div>
          <div className="feature-info">
            <h4>{t('analysis.compatibilityScore')}</h4>
            <p>{t('analysis.writingStyle')}</p>
          </div>
          {score !== null && (
            <button 
              className={`toggle-result-btn ${showResult ? 'expanded' : 'collapsed'}`}
              onClick={() => setShowResult(!showResult)}
              data-tooltip={showResult ? t('common.hide') : t('common.show')}
              data-tooltip-position="left"
            >
              <img 
                src="/icon/chevron-down.svg"
                alt="toggle" 
              />
            </button>
          )}
        </div>
        <button 
          className={`feature-btn ${isLoading ? 'loading' : ''}`}
          onClick={calculateScore}
          disabled={disabled || isLoading || !textChanged}
          title={!textChanged ? t('analysis.calculated') : ''}
        >
          {isLoading ? (
            <Lottie 
              animationData={threeDotsAnimation} 
              loop={true}
              style={{ width: 50, height: 16 }}
            />
          ) : (
            <>
              <span>{!textChanged ? t('analysis.calculated') : t('analysis.calculateScore')}</span>
              <img src="/icon/arrow-right.svg" alt="" className="btn-arrow" />
            </>
          )}
        </button>
        {score !== null && showResult && (
          <div className="feature-result" style={{ display: 'block' }}>
            <div className="compatibility-score-display">
              <div className="compatibility-score-circle">
                <svg className="compatibility-score-svg" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="compatibilityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4facfe" />
                      <stop offset="100%" stopColor="#00d4ff" />
                    </linearGradient>
                  </defs>
                  <circle className="compatibility-score-bg" cx="50" cy="50" r="45"></circle>
                  <circle 
                    className="compatibility-score-progress" 
                    cx="50" 
                    cy="50" 
                    r="45"
                    style={{
                      strokeDashoffset: 282.74 - (score / 100) * 282.74
                    }}
                  ></circle>
                  <circle className="compatibility-score-inner" cx="50" cy="50" r="40"></circle>
                </svg>
                <div className="compatibility-score-text">
                  <div className="compatibility-score-number">{score}</div>
                  <div className="compatibility-score-symbol">%</div>
                </div>
              </div>
              
              <div className="compatibility-verdict">
                <img 
                  src={score >= 75 ? "/icon/check-circle.svg" : score >= 40 ? "/icon/alert-circle.svg" : "/icon/x-circle.svg"}
                  alt="verdict" 
                  className="verdict-icon"
                />
                <span>{getScoreLabel(score)}</span>
              </div>

              {analysisDetails && (
                <div className="compatibility-breakdown">
                  <div className="breakdown-item">
                    <span className="breakdown-label">{t('analysis.vector')}</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{ 
                          width: `${analysisDetails.vector_score}%`,
                          background: '#4285f4'
                        }}
                      ></div>
                    </div>
                    <span className="breakdown-value">{Math.round(analysisDetails.vector_score)}%</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">{t('analysis.statistical')}</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{ 
                          width: `${analysisDetails.statistical_score}%`,
                          background: '#34a853'
                        }}
                      ></div>
                    </div>
                    <span className="breakdown-value">{Math.round(analysisDetails.statistical_score)}%</span>
                  </div>
                  {analysisDetails.confidence && (
                    <div className="breakdown-item confidence-item">
                      <span className="breakdown-label">{t('analysis.confidence')}</span>
                      <div className="breakdown-bar">
                        <div 
                          className="breakdown-fill" 
                          style={{ 
                            width: `${analysisDetails.confidence}%`,
                            background: analysisDetails.confidence >= 70 ? '#34a853' : analysisDetails.confidence >= 50 ? '#fbbc04' : '#ea4335'
                          }}
                        ></div>
                      </div>
                      <span className="breakdown-value">{Math.round(analysisDetails.confidence)}%</span>
                    </div>
                  )}
                  {analysisDetails.deviation_summary && analysisDetails.deviation_summary.total > 0 && (
                    <div className="deviation-summary">
                      <span className="deviation-label">{t('analysis.styleDeviationSentences')}</span>
                      <div className="deviation-badges">
                        {analysisDetails.deviation_summary.by_severity.severe > 0 && (
                          <span className="deviation-badge severe">
                            {analysisDetails.deviation_summary.by_severity.severe} {t('analysis.severe')}
                          </span>
                        )}
                        {analysisDetails.deviation_summary.by_severity.moderate > 0 && (
                          <span className="deviation-badge moderate">
                            {analysisDetails.deviation_summary.by_severity.moderate} {t('analysis.moderate')}
                          </span>
                        )}
                        {analysisDetails.deviation_summary.by_severity.mild > 0 && (
                          <span className="deviation-badge mild">
                            {analysisDetails.deviation_summary.by_severity.mild} {t('analysis.mild')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button 
                className="detail-btn-full"
                onClick={() => setShowModal(true)}
              >
                <span>{t('common.viewDetails')}</span>
                <img src="/icon/chevron-right.svg" alt="detail" />
              </button>
            </div>
          </div>
        )}

      </div>



      {/* Modal showing details */}
      {showModal && analysisDetails && (
        <div className="ai-detail-overlay" onClick={() => setShowModal(false)}>
          <div className="ai-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-detail-header">
              <h3>{t('analysis.detailedAnalysis')}</h3>
              <button className="close-detail-btn" onClick={() => setShowModal(false)}>
                <img src="/icon/x.svg" alt={t('common.close')} />
              </button>
            </div>
            <div className="ai-detail-body">
              <div className="ai-detail-score">
                <div>
                  <div className="ai-detail-label">
                    {t('analysis.compatibilityScore')}
                  </div>
                  <div className="ai-detail-value" style={{ color: getScoreColor(score) }}>
                    {score}%
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="ai-detail-label">
                    {t('nav.profile')}
                  </div>
                  <div className="ai-detail-verdict">
                    {analysisDetails.profile_name}
                  </div>
                </div>
              </div>

              <div className="compatibility-detail-stats">
                <div className="stat-card">
                  <div className="stat-label">{t('analysis.vectorScore')}</div>
                  <div className="stat-value">{Math.round(analysisDetails.vector_score)}%</div>
                  <div className="stat-desc">{t('analysis.semanticSimilarity')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">{t('analysis.statisticalScore')}</div>
                  <div className="stat-value">{Math.round(analysisDetails.statistical_score)}%</div>
                  <div className="stat-desc">{t('analysis.structuralSimilarity')}</div>
                </div>
              </div>

              <div className="compatibility-detail-weights">
                <h4>{t('analysis.calculationWeights')}</h4>
                <div className="weight-item">
                  <span>{t('analysis.embedding')}</span>
                  <span>{Math.round(analysisDetails.embedding_weight * 100)}%</span>
                </div>
                <div className="weight-item">
                  <span>{t('analysis.statistical')}</span>
                  <span>{Math.round(analysisDetails.statistical_weight * 100)}%</span>
                </div>
              </div>

              <div className="compatibility-detail-info">
                <div className="info-row">
                  <img src="/icon/file-text.svg" alt="" />
                  <span>{t('analysis.samplesUsed')}</span>
                  <span>{analysisDetails.samples_used}</span>
                </div>
                <div className="info-row">
                  <img src="/icon/clock.svg" alt="" />
                  <span>{t('analysis.processingTime')}</span>
                  <span>{analysisDetails.processing_time_ms}ms</span>
                </div>
                <div className="info-row">
                  <img src={analysisDetails.cache_hit ? "/icon/zap.svg" : "/icon/database.svg"} alt="" />
                  <span>{t('analysis.cacheStatus')}</span>
                  <span>{analysisDetails.cache_hit ? t('common.cached') : t('common.fresh')}</span>
                </div>
                <div className="info-row">
                  <img src="/icon/list.svg" alt="" />
                  <span>{t('analysis.sentencesAnalyzed')}</span>
                  <span>{analysisDetails.sentence_analysis?.length || 0}</span>
                </div>
                {analysisDetails.deviant_sentences && analysisDetails.deviant_sentences.length > 0 && (
                  <div className="info-row">
                    <img src="/icon/alert-triangle.svg" alt="" />
                    <span>{t('analysis.deviantSentences')}</span>
                    <span style={{ color: '#ea4335' }}>{analysisDetails.deviant_sentences.length}</span>
                  </div>
                )}
              </div>

              {analysisDetails.statistical_breakdown && (
                <div className="compatibility-detail-breakdown">
                  <h4>{t('analysis.statisticalComparisonDetails')}</h4>
                  <div className="stats-grid">
                    {Object.entries(analysisDetails.statistical_breakdown).map(([key, value]) => (
                      <div className="stat-item" key={key}>
                        <span>{formatBreakdownLabel(key)}</span>
                        <div className="mini-bar">
                          <div 
                            className="mini-bar-fill" 
                            style={{ 
                              width: `${value}%`,
                              background: value >= 70 ? '#34a853' : value >= 50 ? '#fbbc04' : '#ea4335'
                            }}
                          ></div>
                        </div>
                        <span>{Math.round(value)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysisDetails.statistics && (
                <div className="compatibility-detail-stats-full">
                  <h4>{t('analysis.textStatistics')}</h4>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span>{t('analysis.avgWordLength')}</span>
                      <span>{analysisDetails.statistics.avgWordLength}</span>
                    </div>
                    <div className="stat-item">
                      <span>{t('analysis.avgSentenceLength')}</span>
                      <span>{analysisDetails.statistics.avgSentenceLength}</span>
                    </div>
                    <div className="stat-item">
                      <span>{t('analysis.vocabularyRichness')}</span>
                      <span>{analysisDetails.statistics.vocabularyRichness?.toFixed(3) || 'N/A'}</span>
                    </div>
                    <div className="stat-item">
                      <span>{t('analysis.readabilityScore')}</span>
                      <span>{analysisDetails.statistics.readabilityScore?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="stat-item">
                      <span>{t('analysis.avgParagraphLength')}</span>
                      <span>{analysisDetails.statistics.avgParagraphLength?.toFixed(1) || 'N/A'}</span>
                    </div>
                    {analysisDetails.detected_language && (
                      <div className="stat-item">
                        <span>{t('analysis.language')}</span>
                        <span>{analysisDetails.detected_language === 'vi' ? t('analysis.vietnamese') : t('analysis.english')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {analysisDetails.confidence_factors && (
                <div className="compatibility-detail-confidence">
                  <h4>{t('analysis.confidenceFactors')}</h4>
                  <div className="confidence-factors">
                    {analysisDetails.confidence_factors.variancePenalty !== undefined && (
                      <div className="factor-item negative">
                        <span>{t('analysis.variance')}</span>
                        <span>-{analysisDetails.confidence_factors.variancePenalty.toFixed(1)}%</span>
                      </div>
                    )}
                    {analysisDetails.confidence_factors.sampleBonus !== undefined && (
                      <div className="factor-item positive">
                        <span>{t('analysis.profileSamples')}</span>
                        <span>+{analysisDetails.confidence_factors.sampleBonus.toFixed(1)}%</span>
                      </div>
                    )}
                    {analysisDetails.confidence_factors.sentenceBonus !== undefined && (
                      <div className="factor-item positive">
                        <span>{t('analysis.analyzedSentences')}</span>
                        <span>+{analysisDetails.confidence_factors.sentenceBonus.toFixed(1)}%</span>
                      </div>
                    )}
                    {analysisDetails.confidence_factors.meanCertainty !== undefined && (
                      <div className="factor-item positive">
                        <span>{t('analysis.clarity')}</span>
                        <span>+{analysisDetails.confidence_factors.meanCertainty.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CompatibilityCard
