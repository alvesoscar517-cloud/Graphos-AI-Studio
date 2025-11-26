import { useState, useEffect } from 'react'
import { analyzeText } from '../../services/api'
import { useNotes } from '../../contexts/NotesContext'
import { getCachedAnalysis, setCachedAnalysis } from '../../services/analysisCache'
import Lottie from 'lottie-react'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import modal from '../../utils/modal'
import './Analysis.css'

const StatisticsCard = ({ disabled, currentProfile, text }) => {
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
        console.log('📦 Loaded cached statistics for note:', currentNote.id)
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
      console.log('📦 Loaded cached statistics for text change')
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
      modal.error('Please select a profile and enter text')
      return
    }
    
    if (!currentNote) {
      modal.error('Không tìm thấy note hiện tại')
      return
    }
    
    setIsLoading(true)
    try {
      console.log('📊 Analyzing statistics for text:', text.substring(0, 50) + '...')
      const result = await analyzeText(currentProfile.profile_id, text)
      
      console.log('📊 API Result:', result)
      
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
          'Analysis Complete', 
          `${statsData.totalWords} words | Benchmark: ${Math.round(benchmarkScore)}%`, 
          'success'
        )
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('❌ Error analyzing stats:', error)
      modal.error('Analysis failed: ' + error.message)
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
    if (score >= 80) return 'Very Easy to Read'
    if (score >= 60) return 'Easy to Read'
    if (score >= 40) return 'Average'
    if (score >= 20) return 'Difficult to Read'
    return 'Very Difficult to Read'
  }

  const getBenchmarkLabel = (key) => {
    const labels = {
      avgWordLength: 'Độ dài từ',
      avgSentenceLength: 'Độ dài câu',
      readabilityScore: 'Dễ đọc',
      vocabularyRichness: 'Từ vựng',
      punctuationRatio: 'Dấu câu'
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
            <img src="/icon/bar-chart-4.svg" alt="Statistics" />
          </div>
          <div className="feature-info">
            <h4>Statistics</h4>
            <p>Detailed Analysis</p>
          </div>
          {stats && (
            <button 
              className={`toggle-result-btn ${showResult ? 'expanded' : 'collapsed'}`}
              onClick={() => setShowResult(!showResult)}
              data-tooltip={showResult ? 'Hide results' : 'Show results'}
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
          title={!textChanged ? 'Văn bản chưa thay đổi' : ''}
        >
          {isLoading ? (
            <Lottie 
              animationData={threeDotsAnimation} 
              loop={true}
              style={{ width: 50, height: 16 }}
            />
          ) : (
            <>
              <span>{!textChanged ? 'Analyzed' : 'Analyze'}</span>
              <img src="/icon/arrow-right.svg" alt="Go" className="btn-arrow" />
            </>
          )}
        </button>
        {stats && showResult && (
          <div className="feature-result" style={{ display: 'block' }}>
            <div className="stats-grid-modern">
              <div className="stat-item-modern">
                <div className="stat-icon-wrapper readability">
                  <img src="/icon/book-open.svg" alt="Readability" />
                </div>
                <span className="stat-label-modern">READABILITY</span>
                <span className="stat-value-modern">{stats.readabilityScore}</span>
              </div>
              <div className="stat-item-modern">
                <div className="stat-icon-wrapper sentence">
                  <img src="/icon/align-left.svg" alt="Sentence" />
                </div>
                <span className="stat-label-modern">AVG SENTENCE</span>
                <span className="stat-value-modern">{stats.avgSentenceLength}</span>
              </div>
              <div className="stat-item-modern">
                <div className="stat-icon-wrapper complexity">
                  <img src="/icon/zap.svg" alt="Complexity" />
                </div>
                <span className="stat-label-modern">VOCABULARY</span>
                <span className="stat-value-modern">{stats.vocabularyRichness}%</span>
              </div>
              <div className="stat-item-modern">
                <div className="stat-icon-wrapper words">
                  <img src="/icon/type.svg" alt="Words" />
                </div>
                <span className="stat-label-modern">TOTAL WORDS</span>
                <span className="stat-value-modern">{stats.totalWords}</span>
              </div>
            </div>

            {/* Suggestions preview */}
            {suggestions.length > 0 && (
              <div className="suggestions-preview">
                <div className="suggestions-header">
                  <img src="/icon/lightbulb.svg" alt="suggestions" className="icon-filter" />
                  <span>{suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''}</span>
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
              <span>Xem chi tiết</span>
              <img src="/icon/chevron-right.svg" alt="detail" />
            </button>
          </div>
        )}
      </div>

      {/* Modal hiển thị chi tiết */}
      {showModal && stats && (
        <div className="ai-detail-overlay" onClick={() => setShowModal(false)}>
          <div className="ai-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-detail-header">
              <h3>Thống kê chi tiết</h3>
              <button className="close-detail-btn" onClick={() => setShowModal(false)}>
                <img src="/icon/x.svg" alt="close" />
              </button>
            </div>
            <div className="ai-detail-body">
              {/* Readability Score với màu sắc */}
              <div className="ai-detail-score">
                <div>
                  <div className="ai-detail-label">
                    Readability
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
                    {stats.detectedLanguage === 'vi' ? 'Ngôn ngữ' : 'Language'}
                  </div>
                  <div className="ai-detail-verdict">
                    {stats.detectedLanguage === 'vi' ? '🇻🇳 Tiếng Việt' : '🇺🇸 English'}
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="compatibility-detail-stats">
                <div className="stat-card">
                  <div className="stat-label">Total Words</div>
                  <div className="stat-value">{stats.totalWords}</div>
                  <div className="stat-desc">Words</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Sentences</div>
                  <div className="stat-value">{stats.totalSentences}</div>
                  <div className="stat-desc">Sentences</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Paragraphs</div>
                  <div className="stat-value">{stats.totalParagraphs || 1}</div>
                  <div className="stat-desc">Paragraphs</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Transitions</div>
                  <div className="stat-value">{stats.transitionWordCount || 0}</div>
                  <div className="stat-desc">Connectors</div>
                </div>
              </div>

              {/* Benchmark Comparison */}
              {benchmarkData && benchmarkData.comparison && (
                <div className="benchmark-section">
                  <h4 className="section-title">
                    <img src="/icon/bar-chart-2.svg" alt="" className="icon-filter" />
                    So sánh với chuẩn ({benchmarkData.styleType})
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
                            vs Profile: {data.profileComparison.difference > 0 ? '+' : ''}{data.profileComparison.difference}%
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
                    Gợi ý cải thiện ({suggestions.length})
                  </h4>
                  <div className="suggestions-list">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className={`suggestion-item ${suggestion.status}`}>
                        <div className="suggestion-header">
                          <span className={`status-badge ${suggestion.status}`}>
                            {suggestion.status === 'low' ? '↓ Thấp' : '↑ Cao'}
                          </span>
                          <span className="metric-name">{getBenchmarkLabel(suggestion.metric)}</span>
                        </div>
                        <p className="suggestion-message">{suggestion.message}</p>
                        <div className="suggestion-meta">
                          <span>Hiện tại: {formatBenchmarkValue(suggestion.metric, suggestion.currentValue)}</span>
                          <span>Khuyến nghị: {suggestion.recommendedRange}</span>
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
                  <span>Avg Sentence Length:</span>
                  <span>{stats.avgSentenceLength} words</span>
                </div>
                <div className="info-row">
                  <img src="/icon/type.svg" alt="" />
                  <span>Avg Word Length:</span>
                  <span>{stats.avgWordLength} chars</span>
                </div>
                <div className="info-row">
                  <img src="/icon/zap.svg" alt="" />
                  <span>Vocabulary Richness:</span>
                  <span>{stats.vocabularyRichness}%</span>
                </div>
                <div className="info-row">
                  <img src="/icon/more-horizontal.svg" alt="" />
                  <span>Punctuation Ratio:</span>
                  <span>{stats.punctuationRatio}%</span>
                </div>
                <div className="info-row">
                  <img src="/icon/file-text.svg" alt="" />
                  <span>Avg Paragraph Length:</span>
                  <span>{stats.avgParagraphLength || 0} words</span>
                </div>
              </div>

              {/* Readability Explanation */}
              <div className="ai-detail-evidence">
                <h4 className="ai-detail-evidence-title">
                  {stats.detectedLanguage === 'vi' ? 'Giải thích Readability' : 'Readability Explanation'}
                </h4>
                <div className="evidence-paragraphs">
                  {stats.detectedLanguage === 'vi' ? (
                    <>
                      <p className="evidence-paragraph">
                        Điểm dễ đọc được tính dựa trên độ dài câu và độ dài từ trung bình, tối ưu cho tiếng Việt.
                      </p>
                      <p className="evidence-paragraph">
                        <strong>80-100:</strong> Rất dễ đọc<br/>
                        <strong>60-80:</strong> Dễ đọc<br/>
                        <strong>40-60:</strong> Trung bình<br/>
                        <strong>0-40:</strong> Khó đọc
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="evidence-paragraph">
                        Readability score is calculated using the Flesch Reading Ease formula.
                      </p>
                      <p className="evidence-paragraph">
                        <strong>90-100:</strong> Very easy to read<br/>
                        <strong>60-70:</strong> Easy to read<br/>
                        <strong>30-50:</strong> Difficult to read<br/>
                        <strong>0-30:</strong> Very difficult to read
                      </p>
                    </>
                  )}
                  <p className="evidence-paragraph">
                    Your text: <strong>{stats.readabilityScore}</strong> - <strong>{getReadabilityLabel(stats.readabilityScore)}</strong>
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
