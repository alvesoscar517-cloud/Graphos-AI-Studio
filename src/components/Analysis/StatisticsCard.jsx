import { useState } from 'react'
import { analyzeText } from '../../services/api'
import modal from '../../utils/modal'
import './Analysis.css'

const StatisticsCard = ({ disabled, currentProfile, text }) => {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const analyzeStats = async () => {
    if (!currentProfile || !text) return
    
    setIsLoading(true)
    try {
      const result = await analyzeText(currentProfile.profile_id, text)
      
      if (result.success && result.data && result.data.statistics) {
        const statistics = result.data.statistics
        setStats({
          readabilityScore: statistics.readabilityScore || 0,
          avgSentenceLength: statistics.avgSentenceLength || 0,
          complexWords: Math.round((statistics.vocabularyRichness || 0) * 100),
          totalWords: statistics.totalWords || 0
        })
        modal.toast('Phân tích hoàn tất', '', 'success')
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Error analyzing stats:', error)
      modal.error('Phân tích thất bại: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="feature-card stats-card">
      <div className="feature-card-header">
        <div className="feature-icon stats-icon">
          <img src="/icon/bar-chart-4.svg" alt="Statistics" />
        </div>
        <div className="feature-info">
          <h4>Thống kê</h4>
          <p>Phân tích chi tiết</p>
        </div>
      </div>
      <button 
        className={`feature-btn ${isLoading ? 'loading' : ''}`}
        onClick={analyzeStats}
        disabled={disabled || isLoading}
      >
        <span>{isLoading ? 'Đang phân tích...' : 'Phân tích'}</span>
        <img src="/icon/arrow-right.svg" alt="Go" className="btn-arrow" />
      </button>
      {stats && (
        <div className="feature-result" style={{ display: 'block' }}>
          <div className="stats-grid-modern">
            <div className="stat-item-modern">
              <div className="stat-icon-wrapper readability">
                <img src="/icon/book-open.svg" alt="Readability" />
              </div>
              <div className="stat-content">
                <span className="stat-label">Độ dễ đọc</span>
                <span className="stat-value">{stats.readabilityScore}</span>
              </div>
            </div>
            <div className="stat-item-modern">
              <div className="stat-icon-wrapper sentence">
                <img src="/icon/align-left.svg" alt="Sentence" />
              </div>
              <div className="stat-content">
                <span className="stat-label">Câu TB</span>
                <span className="stat-value">{stats.avgSentenceLength}</span>
              </div>
            </div>
            <div className="stat-item-modern">
              <div className="stat-icon-wrapper complexity">
                <img src="/icon/zap.svg" alt="Complexity" />
              </div>
              <div className="stat-content">
                <span className="stat-label">Phức tạp</span>
                <span className="stat-value">{stats.complexWords}%</span>
              </div>
            </div>
            <div className="stat-item-modern">
              <div className="stat-icon-wrapper words">
                <img src="/icon/type.svg" alt="Words" />
              </div>
              <div className="stat-content">
                <span className="stat-label">Tổng từ</span>
                <span className="stat-value">{stats.totalWords}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StatisticsCard
