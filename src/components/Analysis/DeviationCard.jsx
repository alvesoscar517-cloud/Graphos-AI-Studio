import { useState } from 'react'
import { analyzeText } from '../../services/api'
import modal from '../../utils/modal'
import './Analysis.css'

const DeviationCard = ({ disabled, currentProfile, text, onSentenceClick }) => {
  const [deviations, setDeviations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [highlightEnabled, setHighlightEnabled] = useState(true)

  const findDeviations = async () => {
    if (!currentProfile || !text) return
    
    setIsLoading(true)
    try {
      const result = await analyzeText(currentProfile.profile_id, text)
      
      console.log('📊 Analysis result:', result)
      
      if (result.success && result.data) {
        const deviantSentences = result.data.deviant_sentences || []
        const allSentences = result.data.sentence_analysis || []
        
        console.log('📝 All sentences:', allSentences.length)
        console.log('⚠️ Deviant sentences:', deviantSentences.length)
        console.log('📋 Deviant details:', deviantSentences)
        
        setDeviations(deviantSentences)
        
        if (deviantSentences.length > 0) {
          modal.toast('Phân tích hoàn tất', `Tìm thấy ${deviantSentences.length} câu lệch chuẩn`, 'success')
        } else {
          modal.toast('Phân tích hoàn tất', 'Không phát hiện lệch chuẩn', 'success')
        }
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Error finding deviations:', error)
      modal.error('Phân tích thất bại: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="feature-card deviation-card">
      <div className="feature-card-header">
        <div className="feature-icon deviation-icon">
          <img src="/icon/alert-triangle.svg" alt="Deviation" />
        </div>
        <div className="feature-info">
          <h4>Lệch chuẩn</h4>
          <p>Gợi ý & đánh dấu</p>
        </div>
      </div>
      <button 
        className={`feature-btn ${isLoading ? 'loading' : ''}`}
        onClick={findDeviations}
        disabled={disabled || isLoading}
      >
        <span>{isLoading ? 'Đang tìm...' : 'Tìm kiếm'}</span>
        <img src="/icon/arrow-right.svg" alt="Go" className="btn-arrow" />
      </button>
      {deviations.length > 0 && (
        <div className="feature-result" style={{ display: 'block' }}>
          <div className="deviation-header">
            <span className="deviation-count">{deviations.length} câu</span>
            <label className="toggle-modern">
              <input 
                type="checkbox" 
                checked={highlightEnabled}
                onChange={(e) => setHighlightEnabled(e.target.checked)}
              />
              <span className="toggle-slider-modern"></span>
              <span className="toggle-label">Đánh dấu</span>
            </label>
          </div>
          <div className="deviation-list-modern">
            {deviations.map((dev, idx) => (
              <div 
                key={idx} 
                className="deviation-item-modern clickable"
                onClick={() => {
                  console.log('🖱️ Deviation clicked:', dev)
                  if (onSentenceClick) {
                    onSentenceClick(dev)
                  }
                }}
                title="Click để xem gợi ý cải thiện"
              >
                <img src="/icon/alert-triangle.svg" alt="Warning" />
                <span>Câu {dev.index + 1}: Độ tương đồng thấp ({Math.round(dev.similarityScore * 100)}%)</span>
                <img src="/icon/chevron-right.svg" alt="View" className="view-icon" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DeviationCard
