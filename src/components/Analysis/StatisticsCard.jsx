import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { analyzeText } from '../../services/api'
import { useNotes } from '../../contexts/NotesContext'
import { getCachedAnalysis, setCachedAnalysis } from '../../services/analysisCache'
import Lottie from 'lottie-react'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import modal from '../../utils/modal'
import './Analysis.css'

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

  // Reset state and load cached result when note or profile changes
  useEffect(() => {
    // Always reset state first when note/profile changes
    setStats(null)
    setBenchmarkData(null)
    setSuggestions([])
    setTextChanged(true)

    if (!currentNote || !currentProfile) {
      return
    }

    // Only load cache if we have text and exact match exists
    if (text) {
      const cacheKey = `stats_${currentProfile.profile_id}`
      const cached = getCachedAnalysis(currentNote.id, text, cacheKey)
      if (cached) {
        setStats(cached.stats || cached)
        setBenchmarkData(cached.benchmarkData || null)
        setSuggestions(cached.suggestions || [])
        setTextChanged(false)
        console.log('[PACKAGE] Loaded cached statistics for note:', currentNote.id)
      }
    }
  }, [currentNote?.id, currentProfile?.profile_id])

  // Check if text has changed and load cache if available
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
      console.log('[PACKAGE] Loaded cached statistics for text change')
    } else {
      // Text changed but no cache - reset result and enable button
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
    
    setIsLoading(true)
    try {
      console.log('[CHART] Analyzing statistics for text:', text.substring(0, 50) + '...')
      const result = await analyzeText(currentProfile.profile_id, text)
      
      console.log('[CHART] API Result:', result)
      
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
        
        // Get benchmark data and suggestions from API
        const benchmarkResult = result.data.benchmark_comparison || null
        const improvementSuggestions = result.data.improvement_suggestions || []
        
        setStats(statsData)
        setBenchmarkData(benchmarkResult)
        setSuggestions(improvementSuggestions)
        
        // Save to cache
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
      modal.error(t('analysis.analysisFailed') + ' ' + error.message)
      setStats(null)
      setBenchmarkData(null)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const getReadabilityColor = (score) => {
    if (score >= 80) return '#34a853' // Green - Very Easy
    if (score >= 60) return '#4285f4' // Blue - Easy
    if (score >= 40) return '#fbbc04' // Yellow - Medium
    if (score >= 20) return '#ff9800' // Orange - Hard
    return '#ea4335' // Red - Very Hard
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
    if (typeof value === 'number') {
      return value.toFixed(1)
    }
    return value
  }

  return (
    <>
      <div className="feature-card stats-card">
        <div className="feature-card-header">
          <div className="feature-icon stats-icon">
            <img src="/icon/bar-chart-4.svg" alt={t('analysis.statistics')} />
          </div>
          <div className="feature-info">
            <h4>{t('analysis.statistics')}</h4>
            <p>{t('analysis.detailedAnalysis')}</p>
          </div>
          {stats && (
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
          onClick={analyzeStats}
          disabled={disabled || isLoading || !textChanged}
          title={!textChanged ? t('analysis.analyzed') : ''}
        >
          {isLoading ? (
            <Lottie 
              animationData={threeDotsAnimation} 
              loop={true}
              style={{ width: 50, height: 16 }}
            />
          ) : (
            <>
              <span>{!textChanged ? t('analysis.analyzed') : t('analysis.analyze')}</span>
              <img src="/icon/arrow-right.svg" alt="" className="btn-arrow" />
            </>
          )}
        </button>
        {stats && showResult && (
          <div className="feature-result" style={{ display: 'block' }}>
            <div className="stats-grid-modern">
              <div className="stat-item-modern">
                <div className="stat-icon-wrapper readability">
                  <img src="/icon/book-open.svg" alt={t('analysis.readability')} />
                </div>
                <span className="stat-label-modern">{t('analysis.readability').toUpperCase()}</span>
                <span className="stat-value-modern">{stats.readabilityScore}</span>
              </div>
              <div className="stat-item-modern">
                <div className="stat-icon-wrapper sentence">
                  <img src="/icon/align-left.svg" alt={t('analysis.avgSentence')} />
                </div>
                <span className="stat-label-modern">{t('analysis.avgSentence')}</span>
                <span className="stat-value-modern">{stats.avgSentenceLength}</span>
              </div>
              <div className="stat-item-modern">
                <div className="stat-icon-wrapper complexity">
                  <img src="/icon/zap.svg" alt={t('analysis.vocabulary')} />
                </div>
                <span className="stat-label-modern">{t('analysis.vocabulary').toUpperCase()}</span>
                <span className="stat-value-modern">{stats.vocabularyRichness}%</span>
              </div>
              <div className="stat-item-modern">
                <div className="stat-icon-wrapper words">
                  <img src="/icon/type.svg" alt={t('analysis.totalWords')} />
                </div>
                <span className="stat-label-modern">{t('analysis.totalWords')}</span>
                <span className="stat-value-modern">{stats.totalWords}</span>
              </div>
            </div>

            {/* Suggestions preview */}
            {suggestions.length > 0 && (
              <div className="suggestions-preview">
                <div className="suggestions-header">
                  <img src="/icon/lightbulb.svg" alt={t('analysis.suggestions')} className="icon-filter" />
                  <span>{suggestions.length} {t('analysis.suggestions')}</span>
                </div>
                <div className="suggestion-item-preview">
                  {suggestions[0]?.message?.substring(0, 80)}...
                </div>
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
        )}
      </div>

      {/* Modal showing details */}
      {showModal && stats && (
        <div className="ai-detail-overlay" onClick={() => setShowModal(false)}>
          <div className="ai-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-detail-header">
              <h3>{t('analysis.detailedStatistics')}</h3>
              <button className="close-detail-btn" onClick={() => setShowModal(false)}>
                <img src="/icon/x.svg" alt={t('common.close')} />
              </button>
            </div>
            <div className="ai-detail-body">
              {/* Readability Score với màu sắc */}
              <div className="ai-detail-score">
                <div>
                  <div className="ai-detail-label">
                    {t('analysis.readability')}
                  </div>
                  <div 
                    className="ai-detail-value" 
                    style={{ color: getReadabilityColor(stats.readabilityScore) }}
                  >
                    {stats.readabilityScore}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="ai-detail-label">
                    {t('analysis.language')}
                  </div>
                  <div className="ai-detail-verdict">
                    {stats.detectedLanguage === 'vi' ? `🇻🇳 ${t('analysis.vietnamese')}` : `🇺🇸 ${t('analysis.english')}`}
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="compatibility-detail-stats">
                <div className="stat-card">
                  <div className="stat-label">{t('analysis.words')}</div>
                  <div className="stat-value">{stats.totalWords}</div>
                  <div className="stat-desc">{t('analysis.words')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">{t('analysis.sentences')}</div>
                  <div className="stat-value">{stats.totalSentences}</div>
                  <div className="stat-desc">{t('analysis.sentences')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">{t('analysis.paragraphs')}</div>
                  <div className="stat-value">{stats.totalParagraphs || 1}</div>
                  <div className="stat-desc">{t('analysis.paragraphs')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">{t('analysis.transitions')}</div>
                  <div className="stat-value">{stats.transitionWordCount || 0}</div>
                  <div className="stat-desc">{t('analysis.connectors')}</div>
                </div>
              </div>

              {/* Benchmark Comparison */}
              {benchmarkData && benchmarkData.comparison && (
                <div className="benchmark-section">
                  <h4 className="section-title">
                    <img src="/icon/bar-chart-2.svg" alt="" className="icon-filter" />
                    {t('analysis.benchmarkComparison')} ({benchmarkData.styleType})
                  </h4>
                  <div className="benchmark-grid">
                    {Object.entries(benchmarkData.comparison).map(([key, data]) => (
                      <div key={key} className={`benchmark-item ${data.status}`}>
                        <div className="benchmark-label">{getBenchmarkLabel(key)}</div>
                        <div className="benchmark-values">
                          <span className="current-value">{formatBenchmarkValue(key, data.value)}</span>
                          <span className="benchmark-range">
                            ({data.benchmark.min} - {data.benchmark.max})
                          </span>
                        </div>
                        <div className="benchmark-bar">
                          <div 
                            className={`benchmark-fill ${data.status}`}
                            style={{ width: `${Math.min(100, data.benchmarkScore)}%` }}
                          />
                        </div>
                        <div className="benchmark-score">{Math.round(data.benchmarkScore)}%</div>
                        {data.profileComparison && (
                          <div className={`profile-comparison ${data.profileComparison.status}`}>
                            {t('analysis.vsProfile')}: {data.profileComparison.difference > 0 ? '+' : ''}{data.profileComparison.difference}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvement Suggestions */}
              {suggestions.length > 0 && (
                <div className="suggestions-section">
                  <h4 className="section-title">
                    <img src="/icon/lightbulb.svg" alt="" className="icon-filter" />
                    {t('analysis.improvementSuggestions')} ({suggestions.length})
                  </h4>
                  <div className="suggestions-list">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className={`suggestion-item ${suggestion.status}`}>
                        <div className="suggestion-header">
                          <span className={`status-badge ${suggestion.status}`}>
                            {suggestion.status === 'low' ? `↓ ${t('analysis.low')}` : `↑ ${t('analysis.high')}`}
                          </span>
                          <span className="metric-name">{getBenchmarkLabel(suggestion.metric)}</span>
                        </div>
                        <p className="suggestion-message">{suggestion.message}</p>
                        <div className="suggestion-meta">
                          <span>{t('analysis.current')}: {formatBenchmarkValue(suggestion.metric, suggestion.currentValue)}</span>
                          <span>{t('analysis.recommended')}: {suggestion.recommendedRange}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Stats */}
              <div className="compatibility-detail-info">
                <div className="info-row">
                  <img src="/icon/align-left.svg" alt="" />
                  <span>{t('analysis.avgSentenceLength')}:</span>
                  <span>{stats.avgSentenceLength} {t('common.words')}</span>
                </div>
                <div className="info-row">
                  <img src="/icon/type.svg" alt="" />
                  <span>{t('analysis.avgWordLength')}:</span>
                  <span>{stats.avgWordLength} {t('common.characters')}</span>
                </div>
                <div className="info-row">
                  <img src="/icon/zap.svg" alt="" />
                  <span>{t('analysis.vocabularyRichness')}:</span>
                  <span>{stats.vocabularyRichness}%</span>
                </div>
                <div className="info-row">
                  <img src="/icon/more-horizontal.svg" alt="" />
                  <span>{t('analysis.punctuationRatio')}</span>
                  <span>{stats.punctuationRatio}%</span>
                </div>
                <div className="info-row">
                  <img src="/icon/file-text.svg" alt="" />
                  <span>{t('analysis.avgParagraphLength')}:</span>
                  <span>{stats.avgParagraphLength || 0} {t('common.words')}</span>
                </div>
              </div>

              {/* Readability Explanation */}
              <div className="ai-detail-evidence">
                <h4 className="ai-detail-evidence-title">
                  {t('analysis.readabilityExplanation')}
                </h4>
                <div className="evidence-paragraphs">
                  <p className="evidence-paragraph">
                    <strong>80-100:</strong> {t('analysis.veryEasyToRead')}<br/>
                    <strong>60-80:</strong> {t('analysis.easyToRead')}<br/>
                    <strong>40-60:</strong> {t('analysis.average')}<br/>
                    <strong>0-40:</strong> {t('analysis.difficultToRead')}
                  </p>
                  <p className="evidence-paragraph">
                    <strong>{stats.readabilityScore}</strong> - <strong>{getReadabilityLabel(stats.readabilityScore)}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StatisticsCard
