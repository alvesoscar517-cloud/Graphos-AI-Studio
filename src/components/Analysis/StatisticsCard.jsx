import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { analyzeText } from '../../services/api'
import { useNotes } from '../../contexts/NotesContext'
import { useAIProcessingActions } from '@/stores'
import { getCachedAnalysis, setCachedAnalysis } from '../../services/analysisCache'
import { getLocalizedContentError } from '../../utils/errorMessages'
import LazyLottie from '../Common/LazyLottie'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import Icon from '../Common/Icon'
import modal from '../../utils/modal'
import { cn } from '../../lib/utils'

const StatisticsCard = ({ disabled, currentProfile, text }) => {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [benchmarkData, setBenchmarkData] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showResult, setShowResult] = useState(true)
  const [textChanged, setTextChanged] = useState(true)
  const { currentNote } = useNotes()
  const { startProcessing, stopProcessing } = useAIProcessingActions()

  useEffect(() => {
    setStats(null)
    setBenchmarkData(null)
    setSuggestions([])
    setTextChanged(true)

    if (!currentNote || !currentProfile) return

    if (text) {
      const cacheKey = `stats_${currentProfile.profile_id}`
      const cached = getCachedAnalysis(currentNote.id, text, cacheKey)
      if (cached) {
        setStats(cached.stats || cached)
        setBenchmarkData(cached.benchmarkData || null)
        setSuggestions(cached.suggestions || [])
        setTextChanged(false)
      }
    }
  }, [currentNote?.id, currentProfile?.profile_id])

  useEffect(() => {
    if (!currentNote || !text || !currentProfile) {
      setTextChanged(true)
      return
    }

    const cacheKey = `stats_${currentProfile.profile_id}`
    const cached = getCachedAnalysis(currentNote.id, text, cacheKey)
    if (cached) {
      setStats(cached.stats || cached)
      setBenchmarkData(cached.benchmarkData || null)
      setSuggestions(cached.suggestions || [])
      setTextChanged(false)
    } else {
      setStats(null)
      setBenchmarkData(null)
      setSuggestions([])
      setTextChanged(true)
    }
  }, [currentNote?.id, text, currentProfile?.profile_id])

  const analyzeStats = async () => {
    if (!currentProfile || !text) {
      modal.error(t('analysis.pleaseSelectProfileAndText'))
      return
    }
    if (!currentNote) {
      modal.error(t('analysis.currentNoteNotFound'))
      return
    }
    // Check if profile is still loading (placeholder)
    if (currentProfile._isPlaceholder) {
      modal.error(t('analysis.profileLoading') || 'Profile is still loading, please wait...')
      return
    }
    
    setIsLoading(true)
    startProcessing('analyze')
    try {
      const result = await analyzeText(currentProfile.profile_id, text)
      
      if (result.success && result.data && result.data.statistics) {
        const statistics = result.data.statistics
        const statsData = {
          readabilityScore: Math.round(statistics.readabilityScore || 0),
          avgSentenceLength: Math.round(statistics.avgSentenceLength || 0),
          vocabularyRichness: Math.round((statistics.vocabularyRichness || 0) * 100),
          punctuationRatio: Math.round((statistics.punctuationRatio || 0) * 100),
          totalWords: statistics.totalWords || 0,
          totalSentences: statistics.totalSentences || 0,
          totalParagraphs: statistics.totalParagraphs || 0,
          avgWordLength: statistics.avgWordLength || 0,
          avgParagraphLength: statistics.avgParagraphLength || 0,
          transitionWordCount: statistics.transitionWordCount || 0,
          detectedLanguage: statistics.detectedLanguage || 'en'
        }
        
        const benchmarkResult = result.data.benchmark_comparison || null
        const improvementSuggestions = result.data.improvement_suggestions || []
        
        setStats(statsData)
        setBenchmarkData(benchmarkResult)
        setSuggestions(improvementSuggestions)
        
        const cacheKey = `stats_${currentProfile.profile_id}`
        setCachedAnalysis(currentNote.id, text, cacheKey, {
          stats: statsData,
          benchmarkData: benchmarkResult,
          suggestions: improvementSuggestions
        })
        setTextChanged(false)
        
        const benchmarkScore = result.data.benchmark_score || 0
        modal.toast(
          t('analysis.analysisComplete'), 
          `${statsData.totalWords} ${t('common.words')} | ${t('analysis.benchmark')}: ${Math.round(benchmarkScore)}%`, 
          'success'
        )
      } else {
        throw new Error(result.error || t('analysis.analysisFailed'))
      }
    } catch (error) {
      console.error('[FAIL] Error analyzing stats:', error)
      const localizedError = getLocalizedContentError(error.message, t)
      modal.error(localizedError || t('analysis.analysisFailed'))
      setStats(null)
      setBenchmarkData(null)
      setSuggestions([])
    } finally {
      setIsLoading(false)
      stopProcessing()
    }
  }

  const getReadabilityColor = (score) => {
    if (score >= 80) return '#34a853'
    if (score >= 60) return '#4285f4'
    if (score >= 40) return '#fbbc04'
    if (score >= 20) return '#ff9800'
    return '#ea4335'
  }

  const getReadabilityLabel = (score) => {
    if (score >= 80) return t('analysis.veryEasyToRead')
    if (score >= 60) return t('analysis.easyToRead')
    if (score >= 40) return t('analysis.average')
    if (score >= 20) return t('analysis.difficultToRead')
    return t('analysis.veryDifficultToRead')
  }

  const getBenchmarkLabel = (key) => {
    const labels = {
      avgWordLength: t('analysis.avgWordLength'),
      avgSentenceLength: t('analysis.avgSentenceLength'),
      readabilityScore: t('analysis.readability'),
      vocabularyRichness: t('analysis.vocabulary'),
      punctuationRatio: t('analysis.punctuationRatio')
    }
    return labels[key] || key
  }

  const formatBenchmarkValue = (key, value) => {
    if (key === 'vocabularyRichness' || key === 'punctuationRatio') {
      return `${(value * 100).toFixed(0)}%`
    }
    if (typeof value === 'number') return value.toFixed(1)
    return value
  }

  return (
    <>
      <div className={cn(
        "p-3 border border-border-light rounded-xl",
        "bg-bg-secondary transition-all duration-200 hover:shadow-md"
      )}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-2 relative">
          <div className="card-icon !w-10 !h-10">
            <Icon name="bar-chart-4" size="lg" color="primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-medium text-text-primary m-0 mb-0.5">{t('analysis.statistics')}</h4>
            <p className="text-[11px] text-text-secondary m-0">{t('analysis.detailedAnalysis')}</p>
          </div>
          {stats && (
            <button 
              className={cn(
                "bg-transparent border-none p-1.5 cursor-pointer rounded-md",
                "flex items-center justify-center transition-colors duration-200",
                "hover:bg-bg-tertiary ml-auto"
              )}
              onClick={() => setShowResult(!showResult)}
            >
              <img 
                src="/icon/chevron-down.svg" alt="toggle"
                className={cn("w-icon-md h-icon-md opacity-60 transition-all duration-300 hover:opacity-100 icon-invert", showResult ? "rotate-180" : "rotate-0")}
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
            "transition-all duration-200 hover:border-border-hover hover:shadow-md",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
            isLoading && "pointer-events-none opacity-70"
          )}
          onClick={analyzeStats}
          disabled={disabled || isLoading || !textChanged}
        >
          {isLoading ? (
            <LazyLottie animationData={threeDotsAnimation} loop={true} style={{ width: 50, height: 16 }} />
          ) : (
            <>
              <span>{!textChanged ? t('analysis.analyzed') : t('analysis.analyze')}</span>
              <Icon name="arrow-right" size="md" color="muted" />
            </>
          )}
        </button>

        {/* Result Section */}
        {stats && showResult && (
          <div className="mt-2 block animate-slide-down">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="stat-box p-2">
                <div className="stat-box-icon">
                  <Icon name="book-open" size="md" color="primary" />
                </div>
                <span className="stat-box-label">{t('analysis.readability')}</span>
                <span className="stat-box-value">{stats.readabilityScore}</span>
              </div>
              <div className="stat-box p-2">
                <div className="stat-box-icon">
                  <Icon name="align-left" size="md" color="primary" />
                </div>
                <span className="stat-box-label">{t('analysis.avgSentence')}</span>
                <span className="stat-box-value">{stats.avgSentenceLength}</span>
              </div>
              <div className="stat-box p-2">
                <div className="stat-box-icon">
                  <Icon name="zap" size="md" color="primary" />
                </div>
                <span className="stat-box-label">{t('analysis.vocabulary')}</span>
                <span className="stat-box-value">{stats.vocabularyRichness}%</span>
              </div>
              <div className="stat-box p-2">
                <div className="stat-box-icon">
                  <Icon name="type" size="md" color="primary" />
                </div>
                <span className="stat-box-label">{t('analysis.totalWords')}</span>
                <span className="stat-box-value">{stats.totalWords}</span>
              </div>
            </div>

            {/* Suggestions Preview */}
            {suggestions.length > 0 && (
              <div className="mt-2 py-2.5 px-3 bg-bg-primary border border-border-light rounded-xl flex items-center gap-2">
                <Icon name="lightbulb" size="sm" color="primary" />
                <span className="text-sm text-text-primary font-medium">{suggestions.length} {t('analysis.suggestions')}</span>
              </div>
            )}

            {/* View Details Button */}
            <button 
              className={cn(
                "w-full py-2 px-3 mt-2",
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
        )}
      </div>

      {/* Detail Modal - rendered via Portal to escape sidebar container */}
      {showModal && stats && createPortal(
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between py-5 px-6 border-b border-border-light">
              <h3 className="text-lg font-medium text-text-primary m-0">{t('analysis.detailedStatistics')}</h3>
              <button 
                className="bg-transparent border-none p-2 cursor-pointer rounded-full flex items-center justify-center hover:bg-bg-tertiary"
                onClick={() => setShowModal(false)}
              >
                <Icon name="x" alt={t('common.close')} size="lg" color="muted" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 max-md:p-4">
              {/* Readability Score */}
              <div className="flex items-center justify-between p-4 bg-fill-tertiary border border-border-light rounded-xl mb-5 max-md:p-3 max-md:mb-4 max-md:flex-col max-md:gap-3">
                <div>
                  <div className="text-sm text-text-secondary mb-1">{t('analysis.readability')}</div>
                  <div className="text-3xl font-semibold" style={{ color: getReadabilityColor(stats.readabilityScore) }}>{stats.readabilityScore}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-text-secondary mb-1">{t('analysis.language')}</div>
                  <div className="text-sm font-medium text-text-primary">
                    {stats.detectedLanguage === 'vi' ? `🇻🇳 ${t('analysis.vietnamese')}` : `🇺🇸 ${t('analysis.english')}`}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mb-4 max-md:grid-cols-2 max-md:gap-2">
                <div className="p-3 bg-fill-tertiary border border-border-light rounded-xl text-center max-md:p-2">
                  <div className="text-2xs text-text-secondary mb-1">{t('analysis.words')}</div>
                  <div className="text-xl font-semibold text-text-primary max-md:text-lg">{stats.totalWords}</div>
                </div>
                <div className="p-3 bg-fill-tertiary border border-border-light rounded-xl text-center max-md:p-2">
                  <div className="text-2xs text-text-secondary mb-1">{t('analysis.sentences')}</div>
                  <div className="text-xl font-semibold text-text-primary max-md:text-lg">{stats.totalSentences}</div>
                </div>
                <div className="p-3 bg-fill-tertiary border border-border-light rounded-xl text-center max-md:p-2">
                  <div className="text-2xs text-text-secondary mb-1">{t('analysis.paragraphs')}</div>
                  <div className="text-xl font-semibold text-text-primary max-md:text-lg">{stats.totalParagraphs || 1}</div>
                </div>
                <div className="p-3 bg-fill-tertiary border border-border-light rounded-xl text-center max-md:p-2">
                  <div className="text-2xs text-text-secondary mb-1">{t('analysis.transitions')}</div>
                  <div className="text-xl font-semibold text-text-primary max-md:text-lg">{stats.transitionWordCount || 0}</div>
                </div>
              </div>

              {/* Benchmark Comparison */}
              {benchmarkData && benchmarkData.comparison && (
                <div className="p-4 bg-fill-tertiary border border-border-light rounded-xl mb-5">
                  <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <Icon name="bar-chart-2" size="sm" color="primary" />
                    {t('analysis.benchmarkComparison')} ({benchmarkData.styleType})
                  </h4>
                  <div className="flex flex-col gap-2">
                    {Object.entries(benchmarkData.comparison).map(([key, data]) => {
                      const score = data.benchmarkScore
                      const barColor = score >= 70 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-error'
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs text-text-secondary w-label-lg flex-shrink-0">{getBenchmarkLabel(key)}</span>
                          <div className="flex-1 h-1.5 bg-bg-tertiary rounded-sm overflow-hidden">
                            <div 
                              className={cn("h-full rounded-sm", barColor)}
                              style={{ width: `${Math.min(100, score)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-text-primary w-10 text-right">{Math.round(score)}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-4 bg-fill-tertiary border border-border-light rounded-xl mb-5">
                  <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <Icon name="lightbulb" size="sm" color="primary" />
                    {t('analysis.improvementSuggestions')} ({suggestions.length})
                  </h4>
                  <div className="flex flex-col gap-3">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className={cn("p-3 rounded-xl", suggestion.status === 'low' ? 'bg-error/10' : 'bg-success/10')}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={cn("text-2xs py-0.5 px-2 rounded-full font-medium", suggestion.status === 'low' ? 'bg-error/20 text-error' : 'bg-success/20 text-success')}>
                            {suggestion.status === 'low' ? `↓ ${t('analysis.low')}` : `↑ ${t('analysis.high')}`}
                          </span>
                          <span className="text-xs font-medium text-text-primary">{getBenchmarkLabel(suggestion.metric)}</span>
                        </div>
                        <p className="text-xs text-text-secondary m-0 leading-relaxed">{suggestion.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Readability Explanation */}
              <div className="p-4 bg-fill-tertiary border border-border-light rounded-xl">
                <h4 className="text-sm font-semibold text-text-primary mb-2">{t('analysis.readabilityExplanation')}</h4>
                <div className="text-xs text-text-secondary space-y-1">
                  <p className="m-0"><strong>80-100:</strong> {t('analysis.veryEasyToRead')}</p>
                  <p className="m-0"><strong>60-80:</strong> {t('analysis.easyToRead')}</p>
                  <p className="m-0"><strong>40-60:</strong> {t('analysis.average')}</p>
                  <p className="m-0"><strong>0-40:</strong> {t('analysis.difficultToRead')}</p>
                  <p className="m-0 mt-2 pt-2 border-t border-border-light">
                    <strong>{stats.readabilityScore}</strong> - <strong>{getReadabilityLabel(stats.readabilityScore)}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default StatisticsCard
