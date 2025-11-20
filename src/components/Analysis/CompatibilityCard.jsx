import { useState, useEffect } from 'react'
import { analyzeText } from '../../services/api'
import { useAIProcessing } from '../../contexts/AIProcessingContext'
import { useNotes } from '../../contexts/NotesContext'
import { getCachedAnalysis, setCachedAnalysis, hasTextChanged } from '../../services/analysisCache'
import TextHighlighter from './TextHighlighter'
import './Analysis.css'
import './CompatibilityCard.css'

const CompatibilityCard = ({ disabled, currentProfile, text, onSentenceClick }) => {
  const [score, setScore] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analysisDetails, setAnalysisDetails] = useState(null)
  const [showResult, setShowResult] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [textChanged, setTextChanged] = useState(true)
  const [showHighlighter, setShowHighlighter] = useState(false)
  const { startProcessing, stopProcessing } = useAIProcessing()
  const { currentNote } = useNotes()

  // Load cached result when note or profile changes
  useEffect(() => {
    if (!currentNote || !currentProfile) {
      setScore(null)
      setAnalysisDetails(null)
      setTextChanged(true)
      return
    }

    // Try to load cached result for this note + profile + text
    if (text) {
      const cacheKey = `${currentProfile.profile_id}_${text}`
      const cached = getCachedAnalysis(currentNote.id, cacheKey, 'compatibility')
      if (cached) {
        setScore(cached.score)
        setAnalysisDetails(cached.details)
        setTextChanged(false)
        console.log('📦 Loaded cached compatibility result')
        return
      }
    }

    // If no exact match, try to load most recent result for this profile
    const cache = JSON.parse(localStorage.getItem('ai_analysis_cache') || '{}')
    const noteCache = cache[currentNote.id]
    
    if (noteCache) {
      let latestResult = null
      let latestTimestamp = 0
      
      Object.values(noteCache).forEach(textCache => {
        if (textCache.compatibility && textCache.compatibility.timestamp > latestTimestamp) {
          const cachedData = textCache.compatibility.data
          // Check if it's for the same profile
          if (cachedData.details?.profile_name === currentProfile.profile_name) {
            latestTimestamp = textCache.compatibility.timestamp
            latestResult = cachedData
          }
        }
      })
      
      if (latestResult) {
        setScore(latestResult.score)
        setAnalysisDetails(latestResult.details)
        console.log('📦 Loaded most recent cached result (text/profile changed)')
      }
    }
  }, [currentNote, currentProfile])

  // Check if text or profile has changed
  useEffect(() => {
    if (!currentNote || !text || !currentProfile) {
      setTextChanged(true)
      return
    }

    const cacheKey = `${currentProfile.profile_id}_${text}`
    const changed = hasTextChanged(currentNote.id, cacheKey, 'compatibility')
    setTextChanged(changed)
  }, [currentNote, text, currentProfile])

  const calculateScore = async () => {
    if (!currentProfile || !text) {
      modal.error('Vui lòng chọn hồ sơ và nhập văn bản')
      return
    }

    if (!currentNote) {
      modal.error('Không tìm thấy note hiện tại')
      return
    }
    
    setIsLoading(true)
    startProcessing('compatibility')
    try {
      console.log('🔍 Analyzing with profile:', currentProfile.profile_id)
      console.log('📝 Text length:', text.length)
      
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
        const cacheStatus = result.data.cache_hit ? '⚡ Cache' : '💾 Fresh'
        const processingTime = result.data.processing_time_ms || 0
        modal.toast(
          'Tính toán hoàn tất', 
          `Điểm: ${compatibilityScore}% | ${cacheStatus} | ${processingTime}ms`, 
          'success'
        )
        
        console.log('✅ Analysis complete:', {
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
        throw new Error(result.error || 'Calculation failed')
      }
    } catch (error) {
      console.error('❌ Error calculating score:', error)
      modal.error('Tính toán thất bại: ' + error.message)
      setScore(null)
      setAnalysisDetails(null)
    } finally {
      setIsLoading(false)
      stopProcessing()
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
    if (score >= 90) return 'Rất tương thích'
    if (score >= 75) return 'Tương thích tốt'
    if (score >= 60) return 'Tương thích trung bình'
    if (score >= 40) return 'Tương thích thấp'
    return 'Không tương thích'
  }

  // Debug: Log when conditions change
  useEffect(() => {
    console.log('🔍 Highlighter conditions:', {
      hasScore: score !== null,
      hasSentenceAnalysis: !!analysisDetails?.sentence_analysis,
      sentenceCount: analysisDetails?.sentence_analysis?.length || 0,
      showHighlighter
    })
  }, [score, analysisDetails, showHighlighter])

  return (
    <>
      <div className="feature-card compatibility-card">
        <div className="feature-card-header">
          <div className="feature-icon compatibility-icon">
            <img src="/icon/target.svg" alt="Compatibility" />
          </div>
          <div className="feature-info">
            <h4>Điểm tương thích</h4>
            <p>Văn phong</p>
          </div>
          {score !== null && (
            <button 
              className={`toggle-result-btn ${showResult ? 'expanded' : 'collapsed'}`}
              onClick={() => setShowResult(!showResult)}
              data-tooltip={showResult ? 'Ẩn kết quả' : 'Hiện kết quả'}
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
          title={!textChanged ? 'Văn bản chưa thay đổi' : ''}
        >
          <span>
            {isLoading ? 'Đang tính...' : !textChanged ? 'Đã tính' : 'Tính điểm'}
          </span>
          <img src="/icon/arrow-right.svg" alt="Go" className="btn-arrow" />
        </button>
        {score !== null && showResult && (
          <div className="feature-result" style={{ display: 'block' }}>
            <div className="compatibility-score-display">
              <div className="compatibility-score-circle">
                <svg className="compatibility-score-svg" viewBox="0 0 120 120">
                  <defs>
                    <linearGradient id="compatibilityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: getScoreColor(score), stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: getScoreColor(score), stopOpacity: 0.7 }} />
                    </linearGradient>
                  </defs>
                  <circle className="compatibility-score-bg" cx="60" cy="60" r="52"></circle>
                  <circle 
                    className="compatibility-score-progress" 
                    cx="60" 
                    cy="60" 
                    r="52"
                    style={{
                      strokeDashoffset: 326.56 - (score / 100) * 326.56,
                      stroke: 'url(#compatibilityGradient)'
                    }}
                  ></circle>
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
                    <span className="breakdown-label">Vector</span>
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
                    <span className="breakdown-label">Thống kê</span>
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
          </div>
        )}

        {/* Text Highlighter Section */}
        {score !== null && analysisDetails?.sentence_analysis && (
          <div className="highlighter-section">
            <button 
              className={`toggle-highlighter-btn ${showHighlighter ? 'active' : ''}`}
              onClick={() => {
                console.log('🎨 Toggle highlighter:', !showHighlighter)
                setShowHighlighter(!showHighlighter)
              }}
            >
              <img src="/icon/highlighter.svg" alt="highlight" />
              <span>{showHighlighter ? 'Ẩn đánh dấu' : 'Hiện đánh dấu câu'}</span>
            </button>
            
            {showHighlighter && (
              <div className="highlighter-container">
                <TextHighlighter
                  text={text}
                  sentenceAnalysis={analysisDetails.sentence_analysis}
                  onSentenceClick={(sentence) => {
                    console.log('📝 Sentence clicked in CompatibilityCard:', sentence)
                    if (onSentenceClick) {
                      onSentenceClick(sentence)
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>



      {/* Modal hiển thị chi tiết */}
      {showModal && analysisDetails && (
        <div className="ai-detail-overlay" onClick={() => setShowModal(false)}>
          <div className="ai-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-detail-header">
              <h3>Phân tích chi tiết</h3>
              <button className="close-detail-btn" onClick={() => setShowModal(false)}>
                <img src="/icon/x.svg" alt="close" />
              </button>
            </div>
            <div className="ai-detail-body">
              <div className="ai-detail-score">
                <div>
                  <div className="ai-detail-label">
                    Điểm tương thích
                  </div>
                  <div className="ai-detail-value" style={{ color: getScoreColor(score) }}>
                    {score}%
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="ai-detail-label">
                    Hồ sơ
                  </div>
                  <div className="ai-detail-verdict">
                    {analysisDetails.profile_name}
                  </div>
                </div>
              </div>

              <div className="compatibility-detail-stats">
                <div className="stat-card">
                  <div className="stat-label">Vector Score</div>
                  <div className="stat-value">{Math.round(analysisDetails.vector_score)}%</div>
                  <div className="stat-desc">Semantic similarity</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Statistical Score</div>
                  <div className="stat-value">{Math.round(analysisDetails.statistical_score)}%</div>
                  <div className="stat-desc">Structural similarity</div>
                </div>
              </div>

              <div className="compatibility-detail-weights">
                <h4>Trọng số tính toán</h4>
                <div className="weight-item">
                  <span>Embedding</span>
                  <span>{Math.round(analysisDetails.embedding_weight * 100)}%</span>
                </div>
                <div className="weight-item">
                  <span>Statistical</span>
                  <span>{Math.round(analysisDetails.statistical_weight * 100)}%</span>
                </div>
              </div>

              <div className="compatibility-detail-info">
                <div className="info-row">
                  <img src="/icon/file-text.svg" alt="" />
                  <span>Samples used:</span>
                  <span>{analysisDetails.samples_used}</span>
                </div>
                <div className="info-row">
                  <img src="/icon/clock.svg" alt="" />
                  <span>Processing time:</span>
                  <span>{analysisDetails.processing_time_ms}ms</span>
                </div>
                <div className="info-row">
                  <img src={analysisDetails.cache_hit ? "/icon/zap.svg" : "/icon/database.svg"} alt="" />
                  <span>Cache status:</span>
                  <span>{analysisDetails.cache_hit ? 'Cached' : 'Fresh'}</span>
                </div>
                <div className="info-row">
                  <img src="/icon/list.svg" alt="" />
                  <span>Sentences analyzed:</span>
                  <span>{analysisDetails.sentence_analysis?.length || 0}</span>
                </div>
                {analysisDetails.deviant_sentences && analysisDetails.deviant_sentences.length > 0 && (
                  <div className="info-row">
                    <img src="/icon/alert-triangle.svg" alt="" />
                    <span>Deviant sentences:</span>
                    <span style={{ color: '#ea4335' }}>{analysisDetails.deviant_sentences.length}</span>
                  </div>
                )}
              </div>

              {analysisDetails.statistics && (
                <div className="compatibility-detail-stats-full">
                  <h4>Thống kê văn bản</h4>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span>Avg word length</span>
                      <span>{analysisDetails.statistics.avgWordLength}</span>
                    </div>
                    <div className="stat-item">
                      <span>Avg sentence length</span>
                      <span>{analysisDetails.statistics.avgSentenceLength}</span>
                    </div>
                    <div className="stat-item">
                      <span>Vocabulary richness</span>
                      <span>{analysisDetails.statistics.vocabularyRichness.toFixed(3)}</span>
                    </div>
                    <div className="stat-item">
                      <span>Readability score</span>
                      <span>{analysisDetails.statistics.readabilityScore.toFixed(1)}</span>
                    </div>
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
