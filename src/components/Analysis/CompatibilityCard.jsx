import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { analyzeText } from '../../services/api'
import { useNotes } from '../../contexts/NotesContext'
import { useAIProcessingActions } from '@/stores'
import { getCachedAnalysis, setCachedAnalysis } from '../../services/analysisCache'
import { getLocalizedContentError } from '../../utils/errorMessages'
import Icon from '../Common/Icon'
import modal from '../../utils/modal'
import LazyLottie from '../Common/LazyLottie'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import { cn } from '../../lib/utils'

const CompatibilityCard = ({ disabled, currentProfile, text }) => {
  const { t } = useTranslation()
  const { startProcessing, stopProcessing } = useAIProcessingActions()

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

  useEffect(() => {
    setScore(null)
    setAnalysisDetails(null)
    setTextChanged(true)

    if (!currentNote || !currentProfile) return

    if (text) {
      const cacheKey = `${currentProfile.profile_id}_${text}`
      const cached = getCachedAnalysis(currentNote.id, cacheKey, 'compatibility')
      if (cached) {
        setScore(cached.score)
        setAnalysisDetails(cached.details)
        setTextChanged(false)
      }
    }
  }, [currentNote?.id, currentProfile?.profile_id])

  useEffect(() => {
    if (!currentNote || !text || !currentProfile) {
      setTextChanged(true)
      return
    }

    const cacheKey = `${currentProfile.profile_id}_${text}`
    const cached = getCachedAnalysis(currentNote.id, cacheKey, 'compatibility')
    if (cached) {
      setScore(cached.score)
      setAnalysisDetails(cached.details)
      setTextChanged(false)
    } else {
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

    // Debug: Log profile info before API call
    console.log('[DEBUG] CompatibilityCard - currentProfile:', {
      profile_id: currentProfile.profile_id,
      profile_name: currentProfile.profile_name,
      fullProfile: currentProfile
    })
    
    if (!currentProfile.profile_id) {
      console.error('[ERROR] profile_id is missing from currentProfile!')
      modal.error(t('analysis.profileIdMissing') || 'Profile ID is missing')
      return
    }
    
    setIsLoading(true)
    startProcessing('analyze')
    try {
      const result = await analyzeText(currentProfile.profile_id, text)
      
      if (result.success && result.data) {
        const compatibilityScore = Math.round(result.data.voice_compatibility_score || 0)
        
        const resultData = {
          score: compatibilityScore,
          details: result.data
        }
        
        setScore(compatibilityScore)
        setAnalysisDetails(result.data)
        
        const cacheKey = `${currentProfile.profile_id}_${text}`
        setCachedAnalysis(currentNote.id, cacheKey, 'compatibility', resultData)
        setTextChanged(false)
        
        const cacheStatus = result.data.cache_hit ? t('common.cached') : t('common.fresh')
        const processingTime = result.data.processing_time_ms || 0
        modal.toast(
          t('analysis.calculationComplete'), 
          `${t('profile.score')}: ${compatibilityScore}% | ${cacheStatus} | ${processingTime}ms`, 
          'success'
        )
      } else {
        throw new Error(result.error || t('analysis.calculationFailed'))
      }
    } catch (error) {
      console.error('[FAIL] Error calculating score:', error)
      const localizedError = getLocalizedContentError(error.message, t)
      modal.error(localizedError || t('analysis.calculationFailed'))
      setScore(null)
      setAnalysisDetails(null)
    } finally {
      setIsLoading(false)
      stopProcessing()
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return '#34a853'
    if (score >= 75) return '#4285f4'
    if (score >= 60) return '#fbbc04'
    if (score >= 40) return '#ff9800'
    return '#ea4335'
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
      {/* Main Card */}
      <div className={cn(
        "p-4 border border-border-light rounded-xl",
        "bg-bg-secondary transition-all duration-200",
        "hover:shadow-md"
      )}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-3 relative">
          <div className="card-icon">
            <Icon name="target" size="lg" color="primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-text-primary m-0 mb-0.5">
              {t('analysis.compatibilityScore')}
            </h4>
            <p className="text-xs text-text-secondary m-0">
              {t('analysis.writingStyle')}
            </p>
          </div>
          {score !== null && (
            <button 
              className={cn(
                "bg-transparent border-none p-1.5 cursor-pointer rounded-md",
                "flex items-center justify-center transition-colors duration-200",
                "hover:bg-bg-tertiary ml-auto"
              )}
              onClick={() => setShowResult(!showResult)}
            >
              <img 
                src="/icon/chevron-down.svg"
                alt="toggle"
                className={cn(
                  "w-icon-md h-icon-md opacity-60 transition-all duration-300",
                  "hover:opacity-100 icon-invert",
                  showResult ? "rotate-180" : "rotate-0"
                )}
              />
            </button>
          )}
        </div>

        {/* Action Button */}
        <button 
          className={cn(
            "w-full flex items-center justify-between py-2.5 px-3.5",
            "bg-bg-secondary border border-border-light rounded-xl",
            "text-sm font-medium text-text-primary cursor-pointer",
            "transition-all duration-200 relative overflow-hidden",
            "hover:border-border-hover hover:shadow-md",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
            isLoading && "pointer-events-none opacity-70"
          )}
          onClick={calculateScore}
          disabled={disabled || isLoading || !textChanged}
        >
          {isLoading ? (
            <LazyLottie animationData={threeDotsAnimation} loop={true} style={{ width: 50, height: 16 }} />
          ) : (
            <>
              <span>{!textChanged ? t('analysis.calculated') : t('analysis.calculateScore')}</span>
              <Icon name="arrow-right" size="md" color="muted" />
            </>
          )}
        </button>

        {/* Result Section */}
        {score !== null && showResult && (
          <div className="mt-2 block animate-slide-down">
            <div className="flex flex-col items-center gap-2 p-0">
              {/* Score Circle */}
              <div className="relative w-score-circle h-score-circle flex items-center justify-center my-1">
                <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="compatibilityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4facfe" />
                      <stop offset="100%" stopColor="#00d4ff" />
                    </linearGradient>
                  </defs>
                  <circle className="fill-none stroke-bg-tertiary stroke-[8]" cx="50" cy="50" r="45" />
                  <circle 
                    className="fill-none stroke-text-link stroke-[8]"
                    cx="50" cy="50" r="45"
                    style={{
                      strokeDasharray: 282.74,
                      strokeDashoffset: 282.74 - (score / 100) * 282.74,
                      strokeLinecap: 'round'
                    }}
                  />
                  <circle className="fill-bg-primary" cx="50" cy="50" r="40" />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-baseline justify-center gap-0.5 z-10">
                  <div className="text-3xl font-semibold leading-none tracking-tight text-text-primary">{score}</div>
                  <div className="text-sm font-medium leading-none text-text-secondary opacity-50">%</div>
                </div>
              </div>
              
              {/* Verdict */}
              <div className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-bg-secondary rounded-lg text-xs font-medium text-text-primary">
                <img 
                  src={score >= 75 ? "/icon/check-circle.svg" : score >= 40 ? "/icon/alert-circle.svg" : "/icon/x-circle.svg"}
                  alt="verdict" 
                  className="w-4 h-4 opacity-80 icon-invert"
                />
                <span>{getScoreLabel(score)}</span>
              </div>

              {/* Breakdown */}
              {analysisDetails && (
                <div className="w-full flex flex-col gap-2 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-text-secondary min-w-[55px]">{t('analysis.vector')}</span>
                    <div className="flex-1 h-1 bg-bg-secondary rounded-sm overflow-hidden">
                      <div className="h-full rounded-sm bg-primary" style={{ width: `${analysisDetails.vector_score}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-text-primary min-w-[38px] text-right">{Math.round(analysisDetails.vector_score)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-text-secondary min-w-[55px]">{t('analysis.statistical')}</span>
                    <div className="flex-1 h-1 bg-bg-secondary rounded-sm overflow-hidden">
                      <div className="h-full rounded-sm bg-success" style={{ width: `${analysisDetails.statistical_score}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-text-primary min-w-[38px] text-right">{Math.round(analysisDetails.statistical_score)}%</span>
                  </div>
                  {analysisDetails.confidence && (
                    <div className="flex items-center gap-2 mt-1 pt-2 border-t border-dashed border-border-light">
                      <span className="text-2xs text-text-secondary min-w-[55px]">{t('analysis.confidence')}</span>
                      <div className="flex-1 h-1 bg-bg-secondary rounded-sm overflow-hidden">
                        <div 
                          className="h-full rounded-sm"
                          style={{ 
                            width: `${analysisDetails.confidence}%`,
                            background: analysisDetails.confidence >= 70 ? '#34a853' : analysisDetails.confidence >= 50 ? '#fbbc04' : '#ea4335'
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-text-primary min-w-[38px] text-right">{Math.round(analysisDetails.confidence)}%</span>
                    </div>
                  )}
                  {analysisDetails.deviation_summary && analysisDetails.deviation_summary.total > 0 && (
                    <div className="w-full mt-2 p-2 bg-bg-secondary rounded-lg">
                      <span className="text-2xs text-text-secondary block mb-1.5">{t('analysis.styleDeviationSentences')}</span>
                      <div className="flex flex-wrap gap-1">
                        {analysisDetails.deviation_summary.by_severity.severe > 0 && (
                          <span className="text-2xs py-0.5 px-1.5 rounded bg-error/15 text-error font-medium">
                            {analysisDetails.deviation_summary.by_severity.severe} {t('analysis.severe')}
                          </span>
                        )}
                        {analysisDetails.deviation_summary.by_severity.moderate > 0 && (
                          <span className="text-2xs py-0.5 px-1.5 rounded bg-warning/15 text-warning font-medium">
                            {analysisDetails.deviation_summary.by_severity.moderate} {t('analysis.moderate')}
                          </span>
                        )}
                        {analysisDetails.deviation_summary.by_severity.mild > 0 && (
                          <span className="text-2xs py-0.5 px-1.5 rounded bg-primary/15 text-primary font-medium">
                            {analysisDetails.deviation_summary.by_severity.mild} {t('analysis.mild')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View Details Button */}
              <button 
                className={cn(
                  "w-full py-2 px-3 mt-0",
                  "bg-bg-secondary border-none rounded-lg",
                  "flex items-center justify-between cursor-pointer",
                  "transition-all duration-200 text-xs font-medium text-text-primary",
                  "hover:bg-bg-tertiary"
                )}
                onClick={() => setShowModal(true)}
              >
                <span>{t('common.viewDetails')}</span>
                <img src="/icon/chevron-right.svg" alt="detail" className="w-4 h-4 opacity-60 icon-invert" />
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Detail Modal */}
      {showModal && analysisDetails && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between py-5 px-6 border-b border-border-light">
              <h3 className="text-lg font-medium text-text-primary m-0">{t('analysis.detailedAnalysis')}</h3>
              <button 
                className="bg-transparent border-none p-2 cursor-pointer rounded-full flex items-center justify-center hover:bg-bg-tertiary"
                onClick={() => setShowModal(false)}
              >
                <Icon name="x" alt={t('common.close')} size="lg" color="muted" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Score Section */}
              <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl mb-5">
                <div>
                  <div className="text-sm text-text-secondary mb-1">{t('analysis.compatibilityScore')}</div>
                  <div className="text-3xl font-semibold" style={{ color: getScoreColor(score) }}>{score}%</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-text-secondary mb-1">{t('nav.profile')}</div>
                  <div className="text-sm font-medium text-text-primary">{analysisDetails.profile_name}</div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-bg-secondary rounded-lg">
                  <div className="text-2xs text-text-secondary mb-1">{t('analysis.vectorScore')}</div>
                  <div className="text-xl font-semibold text-text-primary">{Math.round(analysisDetails.vector_score)}%</div>
                  <div className="text-2xs text-text-secondary">{t('analysis.semanticSimilarity')}</div>
                </div>
                <div className="p-3 bg-bg-secondary rounded-lg">
                  <div className="text-2xs text-text-secondary mb-1">{t('analysis.statisticalScore')}</div>
                  <div className="text-xl font-semibold text-text-primary">{Math.round(analysisDetails.statistical_score)}%</div>
                  <div className="text-2xs text-text-secondary">{t('analysis.structuralSimilarity')}</div>
                </div>
              </div>

              {/* Weights */}
              <div className="p-3 bg-bg-secondary rounded-lg mb-4">
                <h4 className="text-sm font-semibold text-text-primary mb-3">{t('analysis.calculationWeights')}</h4>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-text-secondary">{t('analysis.embedding')}</span>
                  <span className="text-text-primary font-medium">{Math.round(analysisDetails.embedding_weight * 100)}%</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-text-secondary">{t('analysis.statistical')}</span>
                  <span className="text-text-primary font-medium">{Math.round(analysisDetails.statistical_weight * 100)}%</span>
                </div>
              </div>

              {/* Info Rows */}
              <div className="p-3 bg-bg-secondary rounded-lg mb-4 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <img src="/icon/file-text.svg" alt="" className="w-4 h-4 opacity-60 icon-invert" />
                  <span className="text-text-secondary">{t('analysis.samplesUsed')}</span>
                  <span className="ml-auto text-text-primary font-medium">{analysisDetails.samples_used}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <img src="/icon/clock.svg" alt="" className="w-4 h-4 opacity-60 icon-invert" />
                  <span className="text-text-secondary">{t('analysis.processingTime')}</span>
                  <span className="ml-auto text-text-primary font-medium">{analysisDetails.processing_time_ms}ms</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <img src={analysisDetails.cache_hit ? "/icon/zap.svg" : "/icon/database.svg"} alt="" className="w-4 h-4 opacity-60 icon-invert" />
                  <span className="text-text-secondary">{t('analysis.cacheStatus')}</span>
                  <span className="ml-auto text-text-primary font-medium">{analysisDetails.cache_hit ? t('common.cached') : t('common.fresh')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <img src="/icon/list.svg" alt="" className="w-4 h-4 opacity-60 icon-invert" />
                  <span className="text-text-secondary">{t('analysis.sentencesAnalyzed')}</span>
                  <span className="ml-auto text-text-primary font-medium">{analysisDetails.sentence_analysis?.length || 0}</span>
                </div>
                {analysisDetails.deviant_sentences && analysisDetails.deviant_sentences.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <img src="/icon/alert-triangle.svg" alt="" className="w-4 h-4 opacity-60 icon-invert" />
                    <span className="text-text-secondary">{t('analysis.deviantSentences')}</span>
                    <span className="ml-auto text-error font-medium">{analysisDetails.deviant_sentences.length}</span>
                  </div>
                )}
              </div>

              {/* Statistical Breakdown */}
              {analysisDetails.statistical_breakdown && (
                <div className="p-3 bg-bg-secondary rounded-lg mb-4">
                  <h4 className="text-sm font-semibold text-text-primary mb-3">{t('analysis.statisticalComparisonDetails')}</h4>
                  <div className="flex flex-col gap-2">
                    {Object.entries(analysisDetails.statistical_breakdown).map(([key, value]) => (
                      <div className="flex items-center gap-2" key={key}>
                        <span className="text-xs text-text-secondary w-label-xl flex-shrink-0">{formatBreakdownLabel(key)}</span>
                        <div className="flex-1 h-1.5 bg-bg-tertiary rounded-sm overflow-hidden">
                          <div 
                            className="h-full rounded-sm"
                            style={{ 
                              width: `${value}%`,
                              background: value >= 70 ? '#34a853' : value >= 50 ? '#fbbc04' : '#ea4335'
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-text-primary w-10 text-right">{Math.round(value)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Statistics */}
              {analysisDetails.statistics && (
                <div className="p-3 bg-bg-secondary rounded-lg mb-4">
                  <h4 className="text-sm font-semibold text-text-primary mb-3">{t('analysis.textStatistics')}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between text-xs py-1">
                      <span className="text-text-secondary">{t('analysis.avgWordLength')}</span>
                      <span className="text-text-primary font-medium">{analysisDetails.statistics.avgWordLength}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1">
                      <span className="text-text-secondary">{t('analysis.avgSentenceLength')}</span>
                      <span className="text-text-primary font-medium">{analysisDetails.statistics.avgSentenceLength}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1">
                      <span className="text-text-secondary">{t('analysis.vocabularyRichness')}</span>
                      <span className="text-text-primary font-medium">{analysisDetails.statistics.vocabularyRichness?.toFixed(3) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1">
                      <span className="text-text-secondary">{t('analysis.readabilityScore')}</span>
                      <span className="text-text-primary font-medium">{analysisDetails.statistics.readabilityScore?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Confidence Factors */}
              {analysisDetails.confidence_factors && (
                <div className="p-3 bg-bg-secondary rounded-lg">
                  <h4 className="text-sm font-semibold text-text-primary mb-3">{t('analysis.confidenceFactors')}</h4>
                  <div className="flex flex-col gap-1.5">
                    {analysisDetails.confidence_factors.variancePenalty !== undefined && (
                      <div className="flex justify-between items-center text-xs py-1 px-2 rounded bg-error/10">
                        <span className="text-text-secondary">{t('analysis.variance')}</span>
                        <span className="text-error font-semibold">-{analysisDetails.confidence_factors.variancePenalty.toFixed(1)}%</span>
                      </div>
                    )}
                    {analysisDetails.confidence_factors.sampleBonus !== undefined && (
                      <div className="flex justify-between items-center text-xs py-1 px-2 rounded bg-success/10">
                        <span className="text-text-secondary">{t('analysis.profileSamples')}</span>
                        <span className="text-success font-semibold">+{analysisDetails.confidence_factors.sampleBonus.toFixed(1)}%</span>
                      </div>
                    )}
                    {analysisDetails.confidence_factors.sentenceBonus !== undefined && (
                      <div className="flex justify-between items-center text-xs py-1 px-2 rounded bg-success/10">
                        <span className="text-text-secondary">{t('analysis.analyzedSentences')}</span>
                        <span className="text-success font-semibold">+{analysisDetails.confidence_factors.sentenceBonus.toFixed(1)}%</span>
                      </div>
                    )}
                    {analysisDetails.confidence_factors.meanCertainty !== undefined && (
                      <div className="flex justify-between items-center text-xs py-1 px-2 rounded bg-success/10">
                        <span className="text-text-secondary">{t('analysis.clarity')}</span>
                        <span className="text-success font-semibold">+{analysisDetails.confidence_factors.meanCertainty.toFixed(1)}%</span>
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
