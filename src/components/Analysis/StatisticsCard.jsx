import { useState, useEffect } from 'react'
import { analyzeText } from '../../services/api'
import { useAIProcessing } from '../../contexts/AIProcessingContext'
import { useNotes } from '../../contexts/NotesContext'
import { getCachedAnalysis, setCachedAnalysis, hasTextChanged } from '../../services/analysisCache'
import modal from '../../utils/modal'
import './Analysis.css'

const StatisticsCard = ({ disabled, currentProfile, text }) => {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showResult, setShowResult] = useState(true)
  const [textChanged, setTextChanged] = useState(true)
  const { startProcessing, stopProcessing } = useAIProcessing()
  const { currentNote } = useNotes()

  // Load cached result when note or profile changes
  useEffect(() => {
    if (!currentNote || !currentProfile) {
      setStats(null)
      setTextChanged(true)
      return
    }

    // Try to load cached result for current text first
    if (text) {
      const cacheKey = `stats_${currentProfile.profile_id}`
      const cached = getCachedAnalysis(currentNote.id, text, cacheKey)
      if (cached) {
        setStats(cached)
        setTextChanged(false)
        console.log('📦 Loaded cached statistics for current text')
        return
      }
    }

    // If no exact match, try to load the most recent cached result for this note
    // This keeps the old result visible even when text changes
    const cache = JSON.parse(localStorage.getItem('ai_analysis_cache') || '{}')
    const noteCache = cache[currentNote.id]
    
    if (noteCache && currentProfile) {
      const cacheKey = `stats_${currentProfile.profile_id}`
      let latestResult = null
      let latestTimestamp = 0
      
      Object.values(noteCache).forEach(textCache => {
        if (textCache[cacheKey] && textCache[cacheKey].timestamp > latestTimestamp) {
          latestTimestamp = textCache[cacheKey].timestamp
          latestResult = textCache[cacheKey].data
        }
      })
      
      if (latestResult) {
        setStats(latestResult)
        console.log('📦 Loaded most recent cached statistics (text has changed)')
      }
    }
  }, [currentNote, currentProfile])

  // Check if text has changed (to enable/disable button)
  useEffect(() => {
    if (!currentNote || !text || !currentProfile) {
      setTextChanged(true)
      return
    }

    const cacheKey = `stats_${currentProfile.profile_id}`
    const changed = hasTextChanged(currentNote.id, text, cacheKey)
    setTextChanged(changed)
  }, [currentNote, text, currentProfile])

  const analyzeStats = async () => {
    if (!currentProfile || !text) {
      modal.error('Vui lòng chọn hồ sơ và nhập văn bản')
      return
    }
    
    if (!currentNote) {
      modal.error('Không tìm thấy note hiện tại')
      return
    }
    
    setIsLoading(true)
    startProcessing('statistics')
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
          avgWordLength: statistics.avgWordLength || 0
        }
        
        setStats(statsData)
        
        // Save to cache
        const cacheKey = `stats_${currentProfile.profile_id}`
        setCachedAnalysis(currentNote.id, text, cacheKey, statsData)
        setTextChanged(false)
        
        modal.toast('Phân tích hoàn tất', `${statsData.totalWords} từ, ${statsData.totalSentences} câu`, 'success')
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('❌ Error analyzing stats:', error)
      modal.error('Phân tích thất bại: ' + error.message)
      setStats(null)
    } finally {
      setIsLoading(false)
      stopProcessing()
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
    if (score >= 80) return 'Rất dễ đọc'
    if (score >= 60) return 'Dễ đọc'
    if (score >= 40) return 'Trung bình'
    if (score >= 20) return 'Khó đọc'
    return 'Rất khó đọc'
  }

  return (
    <>
      <div className="feature-card stats-card">
        <div className="feature-card-header">
          <div className="feature-icon stats-icon">
            <img src="/icon/bar-chart-4.svg" alt="Statistics" />
          </div>
          <div className="feature-info">
            <h4>Thống kê</h4>
            <p>Phân tích chi tiết</p>
          </div>
          {stats && (
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
          onClick={analyzeStats}
          disabled={disabled || isLoading || !textChanged}
          title={!textChanged ? 'Văn bản chưa thay đổi' : ''}
        >
          <span className={isLoading ? 'shimmer-text-effect' : ''}>
            {isLoading ? 'Đang phân tích...' : !textChanged ? 'Đã phân tích' : 'Phân tích'}
          </span>
          <img src="/icon/arrow-right.svg" alt="Go" className="btn-arrow" />
        </button>
        {stats && showResult && (
          <div className="feature-result" style={{ display: 'block' }}>
            <div className="stats-grid-modern">
              <div className="stat-item-modern">
                <div className="stat-icon-wrapper readability">
                  <img src="/icon/book-open.svg" alt="Readability" />
                </div>
                <span className="stat-label-modern">ĐỘ DỄ ĐỌC</span>
                <span className="stat-value-modern">{stats.readabilityScore}</span>
              </div>
              <div className="stat-item-modern">
                <div className="stat-icon-wrapper sentence">
                  <img src="/icon/align-left.svg" alt="Sentence" />
                </div>
                <span className="stat-label-modern">CÂU TB</span>
                <span className="stat-value-modern">{stats.avgSentenceLength}</span>
              </div>
              <div className="stat-item-modern">
                <div className="stat-icon-wrapper complexity">
                  <img src="/icon/zap.svg" alt="Complexity" />
                </div>
                <span className="stat-label-modern">PHỨC TẠP</span>
                <span className="stat-value-modern">{stats.vocabularyRichness}%</span>
              </div>
              <div className="stat-item-modern">
                <div className="stat-icon-wrapper words">
                  <img src="/icon/type.svg" alt="Words" />
                </div>
                <span className="stat-label-modern">TỔNG TỪ</span>
                <span className="stat-value-modern">{stats.totalWords}</span>
              </div>
            </div>

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
                    Độ dễ đọc
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
                    Đánh giá
                  </div>
                  <div className="ai-detail-verdict">
                    {getReadabilityLabel(stats.readabilityScore)}
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="compatibility-detail-stats">
                <div className="stat-card">
                  <div className="stat-label">Tổng từ</div>
                  <div className="stat-value">{stats.totalWords}</div>
                  <div className="stat-desc">Words</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Tổng câu</div>
                  <div className="stat-value">{stats.totalSentences}</div>
                  <div className="stat-desc">Sentences</div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="compatibility-detail-info">
                <div className="info-row">
                  <img src="/icon/align-left.svg" alt="" />
                  <span>Độ dài câu TB:</span>
                  <span>{stats.avgSentenceLength} từ</span>
                </div>
                <div className="info-row">
                  <img src="/icon/type.svg" alt="" />
                  <span>Độ dài từ TB:</span>
                  <span>{stats.avgWordLength} ký tự</span>
                </div>
                <div className="info-row">
                  <img src="/icon/zap.svg" alt="" />
                  <span>Độ phong phú từ vựng:</span>
                  <span>{stats.vocabularyRichness}%</span>
                </div>
                <div className="info-row">
                  <img src="/icon/more-horizontal.svg" alt="" />
                  <span>Tỷ lệ dấu câu:</span>
                  <span>{stats.punctuationRatio}%</span>
                </div>
              </div>

              {/* Readability Explanation */}
              <div className="ai-detail-evidence">
                <h4 className="ai-detail-evidence-title">
                  Giải thích độ dễ đọc
                </h4>
                <div className="evidence-paragraphs">
                  <p className="evidence-paragraph">
                    Điểm dễ đọc được tính theo công thức Flesch Reading Ease, dựa trên độ dài câu và số âm tiết trung bình.
                  </p>
                  <p className="evidence-paragraph">
                    <strong>90-100:</strong> Rất dễ đọc (học sinh lớp 5)<br/>
                    <strong>60-70:</strong> Dễ đọc (học sinh lớp 8-9)<br/>
                    <strong>30-50:</strong> Khó đọc (sinh viên đại học)<br/>
                    <strong>0-30:</strong> Rất khó đọc (chuyên gia)
                  </p>
                  <p className="evidence-paragraph">
                    Văn bản của bạn có điểm <strong>{stats.readabilityScore}</strong>, 
                    được đánh giá là <strong>{getReadabilityLabel(stats.readabilityScore).toLowerCase()}</strong>.
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
