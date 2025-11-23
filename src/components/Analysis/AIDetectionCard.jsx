import { useState, useEffect } from 'react'
import { detectAI as detectAIAPI } from '../../services/api'
import { useAIProcessing } from '../../contexts/AIProcessingContext'
import { useNotes } from '../../contexts/NotesContext'
import { getCachedAnalysis, setCachedAnalysis, hasTextChanged } from '../../services/analysisCache'
import modal from '../../utils/modal'
import './Analysis.css'
import './AIDetectionCard.css'

const AIDetectionCard = ({ disabled, text }) => {
  const [result, setResult] = useState(null)
  const [evidence, setEvidence] = useState([])
  const [verdict, setVerdict] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showResult, setShowResult] = useState(true)
  const [textChanged, setTextChanged] = useState(true)
  const { startProcessing, stopProcessing } = useAIProcessing()
  const { currentNote } = useNotes()

  // Load cached result when note changes
  useEffect(() => {
    if (!currentNote) {
      setResult(null)
      setEvidence([])
      setVerdict('')
      setTextChanged(true)
      return
    }

    // Try to load any cached result for this note (any text version)
    // We'll check the current text first, then fall back to any cached version
    if (text) {
      const cached = getCachedAnalysis(currentNote.id, text, 'detect')
      if (cached) {
        // In hoa chữ cái đầu của verdict khi load từ cache
        const verdictText = cached.verdict ? cached.verdict.charAt(0).toUpperCase() + cached.verdict.slice(1) : cached.verdict
        setResult(cached.aiScore)
        setVerdict(verdictText)
        setEvidence(cached.evidence || [])
        setTextChanged(false)
        console.log('📦 Loaded cached AI detection result for current text')
        return
      }
    }

    // If no exact match, try to load the most recent cached result for this note
    // This keeps the old result visible even when text changes
    const cache = JSON.parse(localStorage.getItem('ai_analysis_cache') || '{}')
    const noteCache = cache[currentNote.id]
    
    if (noteCache) {
      // Get the most recent cached result
      let latestResult = null
      let latestTimestamp = 0
      
      Object.values(noteCache).forEach(textCache => {
        if (textCache.detect && textCache.detect.timestamp > latestTimestamp) {
          latestTimestamp = textCache.detect.timestamp
          latestResult = textCache.detect.data
        }
      })
      
      if (latestResult) {
        // In hoa chữ cái đầu của verdict khi load từ cache
        const verdictText = latestResult.verdict ? latestResult.verdict.charAt(0).toUpperCase() + latestResult.verdict.slice(1) : latestResult.verdict
        setResult(latestResult.aiScore)
        setVerdict(verdictText)
        setEvidence(latestResult.evidence || [])
        console.log('📦 Loaded most recent cached result (text has changed)')
      }
    }
  }, [currentNote])

  // Check if text has changed (to enable/disable button)
  useEffect(() => {
    if (!currentNote || !text) {
      setTextChanged(true)
      return
    }

    const changed = hasTextChanged(currentNote.id, text, 'detect')
    setTextChanged(changed)
  }, [currentNote, text])

  const detectAI = async () => {
    if (!text) {
      modal.error('Vui lòng nhập văn bản để phát hiện')
      return
    }

    if (!currentNote) {
      modal.error('Không tìm thấy note hiện tại')
      return
    }
    
    setIsLoading(true)
    startProcessing('detect')
    try {
      console.log('🔍 Detecting AI for text:', text.substring(0, 50) + '...')
      const apiResult = await detectAIAPI(text)
      
      console.log('📊 API Result:', apiResult)
      
      if (apiResult.success && apiResult.data) {
        const aiScore = Math.round(apiResult.data.ai_probability || 0)
        // Rút ngắn verdict và in hoa chữ cái đầu
        let verdictText = apiResult.data.verdict || (aiScore < 50 ? 'Có vẻ do con người viết' : 'Có thể do AI tạo ra')
        verdictText = verdictText.replace('Nội dung ', '').replace('nội dung ', '')
        // In hoa chữ cái đầu
        verdictText = verdictText.charAt(0).toUpperCase() + verdictText.slice(1)
        
        const resultData = {
          aiScore,
          verdict: verdictText,
          evidence: apiResult.data.evidence || []
        }
        
        setResult(aiScore)
        setVerdict(verdictText)
        setEvidence(apiResult.data.evidence || [])
        
        // Save to cache
        setCachedAnalysis(currentNote.id, text, 'detect', resultData)
        setTextChanged(false)
        
        modal.toast('Phát hiện hoàn tất', verdictText, 'success')
      } else {
        throw new Error(apiResult.error || 'Detection failed')
      }
    } catch (error) {
      console.error('❌ Error detecting AI:', error)
      modal.error('Phát hiện thất bại: ' + error.message)
      setResult(null)
      setEvidence([])
      setVerdict('')
    } finally {
      setIsLoading(false)
      stopProcessing()
    }
  }

  const isHumanWritten = result !== null && result < 50

  const getAIScoreColor = (score) => {
    if (score < 20) return '#34a853' // Green - Human
    if (score < 40) return '#4285f4' // Blue - Likely Human
    if (score < 60) return '#fbbc04' // Yellow - Uncertain
    if (score < 80) return '#ff9800' // Orange - Likely AI
    return '#ea4335' // Red - AI
  }

  return (
    <>
      <div className="feature-card ai-card">
        <div className="feature-card-header">
          <div className="feature-icon ai-icon">
            <img src="/icon/shield-check.svg" alt="AI Detection" />
          </div>
          <div className="feature-info">
            <h4>Phát hiện AI</h4>
            <p>Nội dung</p>
          </div>
          {result !== null && (
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
          onClick={detectAI}
          disabled={disabled || isLoading || !textChanged}
          title={!textChanged ? 'Văn bản chưa thay đổi' : ''}
        >
          <span className={isLoading ? 'shimmer-text-effect' : ''}>
            {isLoading ? 'Đang phát hiện...' : !textChanged ? 'Đã phát hiện' : 'Phát hiện'}
          </span>
          <img src="/icon/arrow-right.svg" alt="Go" className="btn-arrow" />
        </button>
        {result !== null && showResult && (
          <div className="feature-result" style={{ display: 'block' }}>
            <div className="ai-score-display">
              <div className="ai-score-circle">
                <svg className="ai-score-svg" viewBox="0 0 110 110">
                  <defs>
                    <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4facfe" />
                      <stop offset="100%" stopColor="#00d4ff" />
                    </linearGradient>
                  </defs>
                  {/* Progress track */}
                  <circle className="ai-score-bg" cx="55" cy="55" r="50"></circle>
                  {/* Progress bar */}
                  <circle 
                    className="ai-score-progress" 
                    cx="55" 
                    cy="55" 
                    r="50"
                    style={{
                      strokeDashoffset: 314.16 - (result / 100) * 314.16
                    }}
                  ></circle>
                  {/* White inner circle to create donut effect */}
                  <circle className="ai-score-inner" cx="55" cy="55" r="45"></circle>
                </svg>
                <div className="ai-score-text">
                  <div className="ai-score-number">{result}</div>
                  <div className="ai-score-symbol">%</div>
                </div>
              </div>
              
              <div className="ai-verdict-full">
                <img 
                  src={isHumanWritten ? "/icon/user-check.svg" : "/icon/bot.svg"} 
                  alt="verdict" 
                  className="verdict-icon"
                />
                <span>{verdict}</span>
              </div>
              
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
      </div>

      {/* Modal hiển thị chi tiết */}
      {showModal && (
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
                    Xác suất do AI tạo ra
                  </div>
                  <div className="ai-detail-value">
                    {result}%
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="ai-detail-label">
                    Kết luận
                  </div>
                  <div className="ai-detail-verdict">
                    {verdict}
                  </div>
                </div>
              </div>

              <div className="ai-detail-evidence">
                <h4 className="ai-detail-evidence-title">
                  Bằng chứng phân tích
                </h4>
                {evidence && evidence.length > 0 ? (
                  <div className="evidence-paragraphs">
                    {evidence.map((item, index) => (
                      <p key={index} className="evidence-paragraph">{item}</p>
                    ))}
                  </div>
                ) : (
                  <div className="no-evidence">
                    Không có bằng chứng chi tiết
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AIDetectionCard
