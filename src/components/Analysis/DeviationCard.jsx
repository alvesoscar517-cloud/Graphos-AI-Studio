import { useState, useEffect } from 'react'
import { analyzeText } from '../../services/api'
import { useNotes } from '../../contexts/NotesContext'
import { getCachedAnalysis, setCachedAnalysis } from '../../services/analysisCache'
import Lottie from 'lottie-react'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import modal from '../../utils/modal'
import './Analysis.css'

const DeviationCard = ({ disabled, currentProfile, text, onAnalysisComplete }) => {
  const [deviations, setDeviations] = useState([])
  const [analysisData, setAnalysisData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResult, setShowResult] = useState(true)
  const [textChanged, setTextChanged] = useState(true)
  const { currentNote } = useNotes()

  // Reset state and load cached result when note or profile changes
  useEffect(() => {
    // Always reset state first when note/profile changes
    setDeviations([])
    setAnalysisData(null)
    setTextChanged(true)

    if (!currentNote || !currentProfile) {
      return
    }

    // Only load cache if we have text and exact match exists
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
        
        console.log('📦 Loaded cached deviation analysis for note:', currentNote.id)
      }
    }
  }, [currentNote?.id, currentProfile?.profile_id])

  // Check if text has changed and load cache if available
  useEffect(() => {
    if (!currentNote || !text || !currentProfile) {
      setTextChanged(true)
      return
    }

    const cacheKey = `deviation_${currentProfile.profile_id}`
    const cached = getCachedAnalysis(currentNote.id, text, cacheKey)
    if (cached) {
      setDeviations(cached.deviant_sentences || [])
      setAnalysisData(cached)
      setTextChanged(false)
      
      if (onAnalysisComplete) {
        onAnalysisComplete(cached)
      }
      console.log('📦 Loaded cached deviation analysis for text change')
    } else {
      // Text changed but no cache - reset result and enable button
      setDeviations([])
      setAnalysisData(null)
      setTextChanged(true)
    }
  }, [currentNote?.id, text, currentProfile?.profile_id])

  const findDeviations = async () => {
    if (!currentProfile || !text) return
    
    if (!currentNote) {
      modal.error('Current note not found')
      return
    }
    
    setIsLoading(true)
    try {
      // Show progress toast
      const progressToast = modal.toast('Đang phân tích...', 'Đang kiểm tra văn phong và tạo gợi ý', 'info', { duration: 0 })
      
      const result = await analyzeText(currentProfile.profile_id, text)
      
      // Dismiss progress toast
      if (progressToast?.dismiss) progressToast.dismiss()
      
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
        const rewriteCount = result.data.sentence_suggestions 
          ? Object.values(result.data.sentence_suggestions).filter(s => s.rewritten).length 
          : 0
        
        console.log('💡 Suggestions generated:', suggestionsCount, 'with', rewriteCount, 'rewrites')
        
        if (deviantSentences.length > 0) {
          const severeSummary = result.data.deviation_summary?.by_severity || {}
          let summaryText = `Tìm thấy ${deviantSentences.length} câu cần cải thiện`
          if (severeSummary.severe > 0) summaryText += ` (${severeSummary.severe} nghiêm trọng)`
          summaryText += `. Click vào câu được đánh dấu để xem gợi ý.`
          
          modal.toast('Phân tích hoàn tất', summaryText, 'success')
        } else {
          modal.toast('Phân tích hoàn tất', 'Văn bản phù hợp với văn phong của bạn!', 'success')
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
          <h4>Deviations</h4>
          <p>Suggestions & highlights</p>
        </div>
        {analysisData && (
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
        onClick={findDeviations}
        disabled={disabled || isLoading || !textChanged}
        title={!textChanged ? 'Text has not changed' : ''}
      >
        {isLoading ? (
          <Lottie 
            animationData={threeDotsAnimation} 
            loop={true}
            style={{ width: 50, height: 16 }}
          />
        ) : (
          <>
            <span>{!textChanged ? 'Already searched' : 'Search'}</span>
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
              <span className="stat-label-modern">COMPATIBILITY</span>
              <span className="stat-value-modern">{analysisData.voice_compatibility_score}%</span>
            </div>
            <div className="stat-item-modern">
              <div className="stat-icon-wrapper">
                <img src="/icon/alert-circle.svg" alt="Suggestions" />
              </div>
              <span className="stat-label-modern">SENTENCES WITH SUGGESTIONS</span>
              <span className="stat-value-modern">
                {analysisData.sentence_suggestions ? Object.keys(analysisData.sentence_suggestions).filter(
                  key => analysisData.sentence_suggestions[key].issues_found > 0
                ).length : 0}
              </span>
            </div>
          </div>

          {deviations.length > 0 ? (
            <>
              {/* Severity Summary - using new deviation_summary from API */}
              {analysisData.deviation_summary ? (
                <div className="sentence-summary-simple">
                  {analysisData.deviation_summary.by_severity?.severe > 0 && (
                    <span className="summary-badge summary-critical">
                      {analysisData.deviation_summary.by_severity.severe} nghiêm trọng
                    </span>
                  )}
                  {analysisData.deviation_summary.by_severity?.moderate > 0 && (
                    <span className="summary-badge summary-minor">
                      {analysisData.deviation_summary.by_severity.moderate} trung bình
                    </span>
                  )}
                  {analysisData.deviation_summary.by_severity?.mild > 0 && (
                    <span className="summary-badge summary-good">
                      {analysisData.deviation_summary.by_severity.mild} nhẹ
                    </span>
                  )}
                </div>
              ) : analysisData.sentence_suggestions && (() => {
                // Fallback to old logic if deviation_summary not available
                const suggestions = Object.values(analysisData.sentence_suggestions)
                const withIssues = suggestions.filter(s => s.issues_found > 0)
                const high = withIssues.filter(s => s.issues_found >= 3 || s.confidence < 40).length
                const medium = withIssues.filter(s => s.issues_found === 2 || (s.confidence >= 40 && s.confidence < 60)).length
                const low = withIssues.filter(s => s.issues_found === 1 && s.confidence >= 60).length
                
                return (
                  <div className="sentence-summary-simple">
                    {high > 0 && (
                      <span className="summary-badge summary-critical">
                        {high} critical
                      </span>
                    )}
                    {medium > 0 && (
                      <span className="summary-badge summary-minor">
                        {medium} medium
                      </span>
                    )}
                    {low > 0 && (
                      <span className="summary-badge summary-good">
                        {low} minor
                      </span>
                    )}
                  </div>
                )
              })()}
              
              <div className="deviation-hint">
                <img src="/icon/mouse-pointer.svg" alt="info" className="icon-filter" />
                <span>Click on highlighted sentences to see detailed suggestions</span>
              </div>
            </>
          ) : (
            <div className="deviation-success">
              <img src="/icon/check-circle.svg" alt="success" className="icon-filter" />
              <span>Text matches your writing style!</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DeviationCard
