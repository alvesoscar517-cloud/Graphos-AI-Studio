import { useState, useEffect } from 'react'
import { analyzeText } from '../../services/api'
import { useNotes } from '../../contexts/NotesContext'
import { getCachedAnalysis, setCachedAnalysis, hasTextChanged } from '../../services/analysisCache'
import Lottie from 'lottie-react'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import modal from '../../utils/modal'
import './Analysis.css'

const DeviationCard = ({ disabled, currentProfile, text, onSentenceClick, onAnalysisComplete }) => {
  const [deviations, setDeviations] = useState([])
  const [analysisData, setAnalysisData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResult, setShowResult] = useState(true)
  const [textChanged, setTextChanged] = useState(true)
  const { currentNote } = useNotes()

  // Load cached result when note changes
  useEffect(() => {
    if (!currentNote || !currentProfile) {
      setDeviations([])
      setAnalysisData(null)
      setTextChanged(true)
      return
    }

    // Try to load cached result for current text
    if (text) {
      const cacheKey = `deviation_${currentProfile.profile_id}`
      const cached = getCachedAnalysis(currentNote.id, text, cacheKey)
      if (cached) {
        setDeviations(cached.deviant_sentences || [])
        setAnalysisData(cached)
        setTextChanged(false)
        
        // Trigger inline highlighting in editor
        if (onAnalysisComplete) {
          onAnalysisComplete(cached)
        }
        
        console.log('📦 Loaded cached deviation analysis')
        return
      }
    }

    // Try to load most recent cached result
    const cache = JSON.parse(localStorage.getItem('ai_analysis_cache') || '{}')
    const noteCache = cache[currentNote.id]
    
    if (noteCache && currentProfile) {
      const cacheKey = `deviation_${currentProfile.profile_id}`
      let latestResult = null
      let latestTimestamp = 0
      
      Object.values(noteCache).forEach(textCache => {
        if (textCache[cacheKey] && textCache[cacheKey].timestamp > latestTimestamp) {
          latestTimestamp = textCache[cacheKey].timestamp
          latestResult = textCache[cacheKey].data
        }
      })
      
      if (latestResult) {
        setDeviations(latestResult.deviant_sentences || [])
        setAnalysisData(latestResult)
        console.log('📦 Loaded most recent cached result (text has changed)')
      }
    }
  }, [currentNote, currentProfile])

  // Check if text has changed
  useEffect(() => {
    if (!currentNote || !text || !currentProfile) {
      setTextChanged(true)
      return
    }

    const cacheKey = `deviation_${currentProfile.profile_id}`
    const changed = hasTextChanged(currentNote.id, text, cacheKey)
    setTextChanged(changed)
  }, [currentNote, text, currentProfile])

  const findDeviations = async () => {
    if (!currentProfile || !text) return
    
    if (!currentNote) {
      modal.error('Không tìm thấy note hiện tại')
      return
    }
    
    setIsLoading(true)
    try {
      const result = await analyzeText(currentProfile.profile_id, text)
      
      console.log('📊 Analysis result:', result)
      
      if (result.success && result.data) {
        const deviantSentences = result.data.deviant_sentences || []
        
        console.log('⚠️ Deviant sentences:', deviantSentences.length)
        
        setDeviations(deviantSentences)
        setAnalysisData(result.data)
        
        // Save to cache
        const cacheKey = `deviation_${currentProfile.profile_id}`
        setCachedAnalysis(currentNote.id, text, cacheKey, result.data)
        setTextChanged(false)
        
        // Trigger inline highlighting in editor
        if (onAnalysisComplete) {
          onAnalysisComplete(result.data)
        }
        
        const suggestionsCount = result.data.sentence_suggestions ? Object.keys(result.data.sentence_suggestions).length : 0
        console.log('💡 Suggestions generated:', suggestionsCount)
        
        if (deviantSentences.length > 0) {
          modal.toast('Phân tích hoàn tất', `Tìm thấy ${deviantSentences.length} câu cần cải thiện với ${suggestionsCount} gợi ý. Di chuột vào câu để xem chi tiết.`, 'success')
        } else {
          modal.toast('Phân tích hoàn tất', 'Văn bản phù hợp với văn phong!', 'success')
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
        {analysisData && (
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
        onClick={findDeviations}
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
            <span>{!textChanged ? 'Đã tìm kiếm' : 'Tìm kiếm'}</span>
            <img src="/icon/arrow-right.svg" alt="Go" className="btn-arrow" />
          </>
        )}
      </button>
      {analysisData && showResult && (
        <div className="feature-result" style={{ display: 'block' }}>
          {/* Analysis stats */}
          <div className="stats-grid-modern">
            <div className="stat-item-modern">
              <div className="stat-icon-wrapper">
                <img src="/icon/target.svg" alt="Compatibility" />
              </div>
              <span className="stat-label-modern">TƯƠNG THÍCH</span>
              <span className="stat-value-modern">{analysisData.voice_compatibility_score}%</span>
            </div>
            <div className="stat-item-modern">
              <div className="stat-icon-wrapper">
                <img src="/icon/alert-circle.svg" alt="Suggestions" />
              </div>
              <span className="stat-label-modern">CÂU CÓ GỢI Ý</span>
              <span className="stat-value-modern">
                {analysisData.sentence_suggestions ? Object.keys(analysisData.sentence_suggestions).filter(
                  key => analysisData.sentence_suggestions[key].issues_found > 0
                ).length : 0}
              </span>
            </div>
          </div>

          {deviations.length > 0 ? (
            <>
              {/* Simple Summary - based on actual suggestions */}
              {analysisData.sentence_suggestions && (() => {
                const suggestions = Object.values(analysisData.sentence_suggestions)
                const withIssues = suggestions.filter(s => s.issues_found > 0)
                const high = withIssues.filter(s => s.issues_found >= 3 || s.confidence < 40).length
                const medium = withIssues.filter(s => s.issues_found === 2 || (s.confidence >= 40 && s.confidence < 60)).length
                const low = withIssues.filter(s => s.issues_found === 1 && s.confidence >= 60).length
                
                return (
                  <div className="sentence-summary-simple">
                    {high > 0 && (
                      <span className="summary-badge summary-critical">
                        {high} quan trọng
                      </span>
                    )}
                    {medium > 0 && (
                      <span className="summary-badge summary-minor">
                        {medium} trung bình
                      </span>
                    )}
                    {low > 0 && (
                      <span className="summary-badge summary-good">
                        {low} nhỏ
                      </span>
                    )}
                  </div>
                )
              })()}
              
              <div className="deviation-hint">
                <img src="/icon/mouse-pointer.svg" alt="info" className="icon-filter" />
                <span>Click vào câu được đánh dấu để xem gợi ý chi tiết</span>
              </div>
            </>
          ) : (
            <div className="deviation-success">
              <img src="/icon/check-circle.svg" alt="success" className="icon-filter" />
              <span>Văn bản phù hợp với văn phong!</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DeviationCard
