import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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

    if (currentProfile._isPlaceholder) {
      modal.error(t('analysis.profileLoading') || 'Profile is still loading, please wait...')
      return
    }
    
    if (!currentProfile.profile_id) {
      modal.error(t('analysis.profileIdMissing') || 'Profile ID is missing')
      return
    }

    setIsLoading(true)
    startProcessing('analyze')
    try {
      const result = await analyzeText(currentProfile.profile_id, text)
      
      if (result.success && result.data) {
        const rawVoiceScore = result.data.voice_compatibility_score
        const compatibilityScore = Math.round(Number.isFinite(rawVoiceScore) ? rawVoiceScore : 0)
        
        const resultData = {
          score: compatibilityScore,
          details: result.data
        }
        
        setScore(compatibilityScore)
        setAnalysisDetails(result.data)
        
        const cacheKey = `${currentProfile.profile_id}_${text}`
        setCachedAnalysis(currentNote.id, cacheKey, 'compatibility', resultData)
        setTextChanged(false)
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

  const getScoreColor = (s) => {
    if (s >= 90) return '#34a853'
    if (s >= 75) return '#4285f4'
    if (s >= 60) return '#fbbc04'
    if (s >= 40) return '#ff9800'
    return '#ea4335'
  }

  const getScoreLabel = (s) => {
    if (s >= 90) return t('analysis.veryCompatible')
    if (s >= 75) return t('analysis.goodCompatibility')
    if (s >= 60) return t('analysis.averageCompatibility')
    if (s >= 40) return t('analysis.lowCompatibility')
    return t('analysis.notCompatible')
  }

  const getScoreIcon = (s) => {
    if (s >= 75) return 'check-circle'
    if (s >= 40) return 'alert-circle'
    return 'x-circle'
  }

  const safeScore = (val) => Number.isFinite(val) ? Math.round(val) : 0
  const confidence = analysisDetails?.confidence

  return (
    <>
      {/* Main Card */}
      <div className={cn(
        "p-3 border border-border-light rounded-xl",
        "bg-bg-secondary transition-all duration-200",
        "hover:shadow-md"
      )}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-2 relative">
          <div className="card-icon !w-10 !h-10">
            <Icon name="target" size="lg" color="primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-medium text-text-primary m-0 mb-0.5">
              {t('analysis.compatibilityScore')}
            </h4>
            <p className="text-[11px] text-text-secondary m-0">
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
              <Icon 
                name="chevron-down" 
                size="md" 
                color="muted"
                className={cn("transition-transform duration-300", showResult && "rotate-180")}
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
              {/* Score Circle - matching AI Detection style */}
              <div className="relative w-score-circle h-score-circle flex items-center justify-center my-3">
                <svg 
                  className="absolute top-0 left-0 w-full h-full -rotate-90" 
                  viewBox="0 0 100 100"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))' }}
                >
                  <defs>
                    <linearGradient id="compatibilityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#93c5fd" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                  <circle 
                    className="fill-none" 
                    cx="50" cy="50" r="42"
                    style={{ stroke: 'var(--color-border-light)', strokeWidth: 8 }}
                  />
                  <circle 
                    className="fill-none"
                    cx="50" cy="50" r="42"
                    style={{
                      stroke: 'url(#compatibilityGradient)',
                      strokeWidth: 8,
                      strokeDasharray: 263.89,
                      strokeDashoffset: 263.89 - (score / 100) * 263.89,
                      strokeLinecap: 'round',
                      transition: 'stroke-dashoffset 0.5s ease-out',
                      filter: 'drop-shadow(0 1px 3px rgba(66, 133, 244, 0.3))'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span className="text-3xl font-semibold leading-none tracking-tight text-text-primary">{score}</span>
                    <span className="text-sm font-medium leading-none text-text-secondary opacity-60">%</span>
                  </div>
                </div>
              </div>

              {/* Verdict */}
              <div className="w-full flex justify-center">
                <div className="inline-flex items-center gap-2 py-2 px-3 bg-bg-secondary border border-border-light rounded-lg text-xs font-medium text-text-primary">
                  <Icon name={getScoreIcon(score)} size="sm" color="primary" className="flex-shrink-0 -mt-px" />
                  <span className="whitespace-nowrap leading-none">{getScoreLabel(score)}</span>
                </div>
              </div>

              {/* Score Breakdown - Vector & Statistical */}
              {analysisDetails && (
                <div className="w-full p-2 px-3 bg-bg-secondary rounded-lg mt-0">
                  <div className="flex flex-col gap-3">
                    {/* Vector Score */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-2xs text-text-secondary">{t('analysis.vector')}</span>
                        <span className="text-xs font-semibold text-text-primary">
                          {safeScore(analysisDetails.vector_score)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-bg-tertiary rounded-sm overflow-hidden">
                        <div 
                          className="h-full rounded-sm bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500" 
                          style={{ width: `${safeScore(analysisDetails.vector_score)}%` }} 
                        />
                      </div>
                    </div>
                    {/* Statistical Score */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-2xs text-text-secondary">{t('analysis.statistical')}</span>
                        <span className="text-xs font-semibold text-text-primary">
                          {safeScore(analysisDetails.statistical_score)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-bg-tertiary rounded-sm overflow-hidden">
                        <div 
                          className="h-full rounded-sm bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500" 
                          style={{ width: `${safeScore(analysisDetails.statistical_score)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Confidence Indicator - matching AI Detection style */}
              {confidence !== null && confidence !== undefined && (
                <div className="w-full p-2 px-3 bg-bg-secondary rounded-lg mt-0">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-2xs text-text-secondary">{t('analysis.confidence')}</span>
                      <span className="text-xs font-semibold text-text-primary">{safeScore(confidence)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-bg-tertiary rounded-sm overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-sm transition-all duration-500",
                          confidence < 60 && "bg-gradient-to-r from-orange-500 to-red-400",
                          confidence >= 60 && confidence < 80 && "bg-gradient-to-r from-blue-500 to-cyan-400",
                          confidence >= 80 && "bg-gradient-to-r from-green-500 to-emerald-400"
                        )}
                        style={{ width: `${safeScore(confidence)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Low Confidence Warning */}
              {confidence !== null && confidence < 60 && (
                <div className="w-full flex items-center gap-1.5 py-1.5 px-2.5 bg-bg-secondary border border-border-light rounded-lg text-xs text-text-muted leading-normal">
                  <Icon name="info" size="xs" color="muted" className="flex-shrink-0 opacity-50" />
                  <span>{t('analysis.lowConfidenceWarning')}</span>
                </div>
              )}

              {/* Deviation Summary */}
              {analysisDetails?.deviation_summary?.total > 0 && (
                <div className="w-full p-2 px-3 bg-bg-secondary rounded-lg">
                  <span className="text-2xs text-text-secondary block mb-1.5">{t('analysis.styleDeviationSentences')}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisDetails.deviation_summary.by_severity.severe > 0 && (
                      <span className="text-2xs py-1 px-2 rounded-md bg-error/15 text-error font-medium">
                        {analysisDetails.deviation_summary.by_severity.severe} {t('analysis.severe')}
                      </span>
                    )}
                    {analysisDetails.deviation_summary.by_severity.moderate > 0 && (
                      <span className="text-2xs py-1 px-2 rounded-md bg-warning/15 text-warning font-medium">
                        {analysisDetails.deviation_summary.by_severity.moderate} {t('analysis.moderate')}
                      </span>
                    )}
                    {analysisDetails.deviation_summary.by_severity.mild > 0 && (
                      <span className="text-2xs py-1 px-2 rounded-md bg-primary/15 text-primary font-medium">
                        {analysisDetails.deviation_summary.by_severity.mild} {t('analysis.mild')}
                      </span>
                    )}
                  </div>
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
                <Icon name="chevron-right" size="sm" color="muted" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal - rendered via Portal */}
      {showModal && analysisDetails && createPortal(
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
              {/* Summary Section */}
              <div className="p-4 bg-fill-tertiary border border-border-light rounded-xl mb-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-text-secondary mb-1">{t('analysis.compatibilityScore')}</div>
                    <div className="text-3xl font-semibold" style={{ color: getScoreColor(score) }}>{score}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-text-secondary mb-1">{t('analysis.confidence')}</div>
                    <div 
                      className="text-3xl font-semibold"
                      style={{ color: confidence < 60 ? '#ff9800' : confidence < 80 ? '#4285f4' : '#34a853' }}
                    >
                      {safeScore(confidence)}%
                    </div>
                  </div>
                </div>

                {/* Verdict */}
                <div className="pt-3 border-t border-border-light">
                  <div className="text-sm text-text-secondary mb-1">{t('analysis.conclusion')}</div>
                  <div className="text-sm font-medium text-text-primary">{getScoreLabel(score)}</div>
                </div>

                {/* Profile & Stats */}
                <div className="flex gap-3 flex-wrap pt-3 mt-3 border-t border-border-light">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-text-secondary font-medium">{t('nav.profile')}</span>
                    <span className="text-text-primary font-semibold">{analysisDetails.profile_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-text-secondary font-medium">{t('analysis.samplesUsed')}</span>
                    <span className="text-text-primary font-semibold">{analysisDetails.samples_used}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-text-secondary font-medium">{t('analysis.processingTime')}</span>
                    <span className="text-text-primary font-semibold">{analysisDetails.processing_time_ms}ms</span>
                  </div>
                </div>
              </div>

              {/* Score Breakdown Cards */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-4 bg-fill-tertiary border border-border-light rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="cpu" size="sm" color="primary" />
                    <span className="text-2xs text-text-secondary">{t('analysis.vectorScore')}</span>
                  </div>
                  <div className="text-2xl font-semibold text-text-primary">{safeScore(analysisDetails.vector_score)}%</div>
                  <div className="text-2xs text-text-secondary mt-1">{t('analysis.semanticSimilarity')}</div>
                </div>
                <div className="p-4 bg-fill-tertiary border border-border-light rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="bar-chart-2" size="sm" color="primary" />
                    <span className="text-2xs text-text-secondary">{t('analysis.statisticalScore')}</span>
                  </div>
                  <div className="text-2xl font-semibold text-text-primary">{safeScore(analysisDetails.statistical_score)}%</div>
                  <div className="text-2xs text-text-secondary mt-1">{t('analysis.structuralSimilarity')}</div>
                </div>
              </div>

              {/* Calculation Weights */}
              <div className="mb-5">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2.5">
                  <Icon name="sliders" size="sm" color="primary" />
                  {t('analysis.calculationWeights')}
                </h4>
                <div className="flex flex-col gap-3 p-4 bg-fill-tertiary border border-border-light rounded-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">{t('analysis.embedding')}</span>
                    <span className="text-text-primary font-semibold">
                      {Number.isFinite(analysisDetails.embedding_weight) ? Math.round(analysisDetails.embedding_weight * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">{t('analysis.statistical')}</span>
                    <span className="text-text-primary font-semibold">
                      {Number.isFinite(analysisDetails.statistical_weight) ? Math.round(analysisDetails.statistical_weight * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistical Breakdown */}
              {analysisDetails.statistical_breakdown && (
                <div className="mb-5">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2.5">
                    <Icon name="pie-chart" size="sm" color="primary" />
                    {t('analysis.statisticalComparisonDetails')}
                  </h4>
                  <div className="flex flex-col gap-3 p-4 bg-fill-tertiary border border-border-light rounded-xl">
                    {Object.entries(analysisDetails.statistical_breakdown).map(([key, value]) => (
                      <div className="flex items-center gap-2" key={key}>
                        <span className="text-xs text-text-secondary w-label-xl flex-shrink-0">{formatBreakdownLabel(key)}</span>
                        <div className="flex-1 h-1.5 bg-bg-tertiary rounded-sm overflow-hidden">
                          <div 
                            className="h-full rounded-sm transition-all duration-300"
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
                <div className="mb-5">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2.5">
                    <Icon name="file-text" size="sm" color="primary" />
                    {t('analysis.textStatistics')}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 p-4 bg-fill-tertiary border border-border-light rounded-xl">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">{t('analysis.avgWordLength')}</span>
                      <span className="text-text-primary font-medium">{analysisDetails.statistics.avgWordLength}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">{t('analysis.avgSentenceLength')}</span>
                      <span className="text-text-primary font-medium">{analysisDetails.statistics.avgSentenceLength}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">{t('analysis.vocabularyRichness')}</span>
                      <span className="text-text-primary font-medium">{analysisDetails.statistics.vocabularyRichness?.toFixed(3) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">{t('analysis.readabilityScore')}</span>
                      <span className="text-text-primary font-medium">{analysisDetails.statistics.readabilityScore?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Confidence Factors */}
              {analysisDetails.confidence_factors && (
                <div className="mb-5">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2.5">
                    <Icon name="activity" size="sm" color="primary" />
                    {t('analysis.confidenceFactors')}
                  </h4>
                  <div className="flex flex-col gap-2 p-4 bg-fill-tertiary border border-border-light rounded-xl">
                    {analysisDetails.confidence_factors.variancePenalty !== undefined && (
                      <div className="flex justify-between items-center text-xs py-2 px-3 rounded-lg bg-error/10">
                        <span className="text-text-secondary">{t('analysis.variance')}</span>
                        <span className="text-error font-semibold">-{analysisDetails.confidence_factors.variancePenalty.toFixed(1)}%</span>
                      </div>
                    )}
                    {analysisDetails.confidence_factors.sampleBonus !== undefined && (
                      <div className="flex justify-between items-center text-xs py-2 px-3 rounded-lg bg-success/10">
                        <span className="text-text-secondary">{t('analysis.profileSamples')}</span>
                        <span className="text-success font-semibold">+{analysisDetails.confidence_factors.sampleBonus.toFixed(1)}%</span>
                      </div>
                    )}
                    {analysisDetails.confidence_factors.sentenceBonus !== undefined && (
                      <div className="flex justify-between items-center text-xs py-2 px-3 rounded-lg bg-success/10">
                        <span className="text-text-secondary">{t('analysis.analyzedSentences')}</span>
                        <span className="text-success font-semibold">+{analysisDetails.confidence_factors.sentenceBonus.toFixed(1)}%</span>
                      </div>
                    )}
                    {analysisDetails.confidence_factors.meanCertainty !== undefined && (
                      <div className="flex justify-between items-center text-xs py-2 px-3 rounded-lg bg-success/10">
                        <span className="text-text-secondary">{t('analysis.clarity')}</span>
                        <span className="text-success font-semibold">+{analysisDetails.confidence_factors.meanCertainty.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Deviant Sentences */}
              {analysisDetails.deviant_sentences && analysisDetails.deviant_sentences.length > 0 && (
                <div className="mb-5">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2.5">
                    <Icon name="alert-triangle" size="sm" color="warning" />
                    {t('analysis.deviantSentences')} ({analysisDetails.deviant_sentences.length})
                  </h4>
                  <div className="flex flex-col gap-3 p-4 bg-fill-tertiary border border-border-light rounded-xl">
                    {analysisDetails.deviant_sentences.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs">
                        <span className={cn(
                          "flex-shrink-0 p-1 rounded-md",
                          item.severity === 'severe' && "bg-error/15",
                          item.severity === 'moderate' && "bg-warning/15",
                          item.severity === 'mild' && "bg-primary/15"
                        )}>
                          <Icon 
                            name="alert-circle" 
                            size="xs" 
                            color={item.severity === 'severe' ? 'error' : item.severity === 'moderate' ? 'warning' : 'primary'} 
                          />
                        </span>
                        <span className="text-text-primary leading-normal">{item.sentence}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Info */}
              <div className="p-4 bg-fill-tertiary border border-border-light rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Icon name="file-text" size="xs" color="muted" />
                  <span className="text-text-secondary">{t('analysis.samplesUsed')}</span>
                  <span className="ml-auto text-text-primary font-medium">{analysisDetails.samples_used || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Icon name="clock" size="xs" color="muted" />
                  <span className="text-text-secondary">{t('analysis.processingTime')}</span>
                  <span className="ml-auto text-text-primary font-medium">{analysisDetails.processing_time_ms || 0}ms</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Icon name={analysisDetails.cache_hit ? "zap" : "database"} size="xs" color="muted" />
                  <span className="text-text-secondary">{t('analysis.cacheStatus')}</span>
                  <span className="ml-auto text-text-primary font-medium">{analysisDetails.cache_hit ? t('common.cached') : t('common.fresh')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Icon name="list" size="xs" color="muted" />
                  <span className="text-text-secondary">{t('analysis.sentencesAnalyzed')}</span>
                  <span className="ml-auto text-text-primary font-medium">{analysisDetails.sentence_analysis?.length || 0}</span>
                </div>
                {analysisDetails.deviant_sentences && analysisDetails.deviant_sentences.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <Icon name="alert-triangle" size="xs" color="warning" />
                    <span className="text-text-secondary">{t('analysis.deviantSentences')}</span>
                    <span className="ml-auto text-error font-medium">{analysisDetails.deviant_sentences.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default CompatibilityCard
