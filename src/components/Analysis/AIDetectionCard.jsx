import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { detectAI as detectAIAPI } from '../../services/api'
import { useNotes } from '../../contexts/NotesContext'
import { getCachedAnalysis, setCachedAnalysis } from '../../services/analysisCache'
import Lottie from 'lottie-react'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import modal from '../../utils/modal'
import './Analysis.css'
import './AIDetectionCard.css'

const AIDetectionCard = ({ disabled, text }) => {
  const { t } = useTranslation()
  const [result, setResult] = useState(null)
  const [confidence, setConfidence] = useState(null)
  const [evidence, setEvidence] = useState([])
  const [humanIndicators, setHumanIndicators] = useState([])
  const [aiIndicators, setAiIndicators] = useState([])
  const [verdict, setVerdict] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showResult, setShowResult] = useState(true)
  const [textChanged, setTextChanged] = useState(true)
  const [analysisDetails, setAnalysisDetails] = useState(null)
  const { currentNote } = useNotes()

  // Reset state and load cached result when note changes
  useEffect(() => {
    // Always reset state first when note changes
    setResult(null)
    setConfidence(null)
    setEvidence([])
    setHumanIndicators([])
    setAiIndicators([])
    setVerdict('')
    setAnalysisDetails(null)
    setTextChanged(true)

    if (!currentNote) {
      return
    }

    // Only load cache if we have text and exact match exists
    if (text) {
      const cached = getCachedAnalysis(currentNote.id, text, 'detect')
      if (cached) {
        // Capitalize first letter of verdict when loading from cache
        const verdictText = cached.verdict ? cached.verdict.charAt(0).toUpperCase() + cached.verdict.slice(1) : cached.verdict
        setResult(cached.aiScore)
        setConfidence(cached.confidence || null)
        setVerdict(verdictText)
        setEvidence(cached.evidence || [])
        setHumanIndicators(cached.humanIndicators || [])
        setAiIndicators(cached.aiIndicators || [])
        setAnalysisDetails(cached.analysisDetails || null)
        setTextChanged(false)
        console.log('[PACKAGE] Loaded cached AI detection result for note:', currentNote.id)
      }
    }
  }, [currentNote?.id])

  // Check if text has changed and load cache if available
  useEffect(() => {
    if (!currentNote || !text) {
      setTextChanged(true)
      return
    }

    // Check if we have cached result for this exact text
    const cached = getCachedAnalysis(currentNote.id, text, 'detect')
    if (cached) {
      const verdictText = cached.verdict ? cached.verdict.charAt(0).toUpperCase() + cached.verdict.slice(1) : cached.verdict
      setResult(cached.aiScore)
      setConfidence(cached.confidence || null)
      setVerdict(verdictText)
      setEvidence(cached.evidence || [])
      setHumanIndicators(cached.humanIndicators || [])
      setAiIndicators(cached.aiIndicators || [])
      setAnalysisDetails(cached.analysisDetails || null)
      setTextChanged(false)
      console.log('[PACKAGE] Loaded cached AI detection result for text change')
    } else {
      // Text changed but no cache - reset result and enable button
      setResult(null)
      setConfidence(null)
      setEvidence([])
      setHumanIndicators([])
      setAiIndicators([])
      setVerdict('')
      setAnalysisDetails(null)
      setTextChanged(true)
    }
  }, [currentNote?.id, text])

  const detectAI = async () => {
    if (!text) {
      modal.error(t('analysis.pleaseEnterText'))
      return
    }

    if (!currentNote) {
      modal.error(t('analysis.currentNoteNotFound'))
      return
    }
    
    setIsLoading(true)
    try {
      console.log('[SEARCH] Detecting AI for text:', text.substring(0, 50) + '...')
      const apiResult = await detectAIAPI(text)
      
      console.log('[CHART] API Result:', apiResult)
      
      if (apiResult.success && apiResult.data) {
        const aiScore = Math.round(apiResult.data.ai_probability || 0)
        const confidenceScore = Math.round(apiResult.data.confidence || 70)
        
        // Shorten verdict and capitalize first letter
        let verdictText = apiResult.data.verdict || (aiScore < 50 ? 'Appears to be human-written' : 'Likely AI-generated')
        verdictText = verdictText.replace('Content ', '').replace('content ', '')
        // Capitalize first letter
        verdictText = verdictText.charAt(0).toUpperCase() + verdictText.slice(1)
        
        const resultData = {
          aiScore,
          confidence: confidenceScore,
          verdict: verdictText,
          evidence: apiResult.data.evidence || [],
          humanIndicators: apiResult.data.human_indicators || [],
          aiIndicators: apiResult.data.ai_indicators || [],
          analysisDetails: apiResult.data.analysis_details || null
        }
        
        setResult(aiScore)
        setConfidence(confidenceScore)
        setVerdict(verdictText)
        setEvidence(apiResult.data.evidence || [])
        setHumanIndicators(apiResult.data.human_indicators || [])
        setAiIndicators(apiResult.data.ai_indicators || [])
        setAnalysisDetails(apiResult.data.analysis_details || null)
        
        // Save to cache
        setCachedAnalysis(currentNote.id, text, 'detect', resultData)
        setTextChanged(false)
        
        modal.toast(t('analysis.detectionComplete'), verdictText, 'success')
      } else {
        throw new Error(apiResult.error || t('analysis.detectionFailed'))
      }
    } catch (error) {
      console.error('[FAIL] Error detecting AI:', error)
      modal.error(t('analysis.detectionFailed') + ' ' + error.message)
      setResult(null)
      setConfidence(null)
      setEvidence([])
      setHumanIndicators([])
      setAiIndicators([])
      setVerdict('')
      setAnalysisDetails(null)
    } finally {
      setIsLoading(false)
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
            <img src="/icon/shield-check.svg" alt={t('analysis.aiDetection')} />
          </div>
          <div className="feature-info">
            <h4>{t('analysis.aiDetection')}</h4>
            <p>{t('analysis.content')}</p>
          </div>
          {result !== null && (
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
          onClick={detectAI}
          disabled={disabled || isLoading || !textChanged}
          title={!textChanged ? t('analysis.detected') : ''}
        >
          {isLoading ? (
            <Lottie 
              animationData={threeDotsAnimation} 
              loop={true}
              style={{ width: 50, height: 16 }}
            />
          ) : (
            <>
              <span>{!textChanged ? t('analysis.detected') : t('analysis.detect')}</span>
              <img src="/icon/arrow-right.svg" alt="" className="btn-arrow" />
            </>
          )}
        </button>
        {result !== null && showResult && (
          <div className="feature-result" style={{ display: 'block' }}>
            <div className="ai-score-display">
              <div className="ai-score-circle">
                <svg className="ai-score-svg" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4facfe" />
                      <stop offset="100%" stopColor="#00d4ff" />
                    </linearGradient>
                  </defs>
                  <circle className="ai-score-bg" cx="50" cy="50" r="45"></circle>
                  <circle 
                    className="ai-score-progress" 
                    cx="50" 
                    cy="50" 
                    r="45"
                    style={{
                      strokeDashoffset: 282.74 - (result / 100) * 282.74
                    }}
                  ></circle>
                  <circle className="ai-score-inner" cx="50" cy="50" r="40"></circle>
                </svg>
                <div className="ai-score-text">
                  <div className="ai-score-number">{result}</div>
                  <div className="ai-score-symbol">%</div>
                </div>
              </div>
              
              <div className="ai-verdict-full">
                <img 
                  src={
                    result < 30 ? "/icon/shield-check.svg" : 
                    result < 50 ? "/icon/check-circle.svg" : 
                    result < 70 ? "/icon/alert-circle.svg" : 
                    "/icon/alert-triangle.svg"
                  } 
                  alt="verdict" 
                  className="verdict-icon"
                />
                <span>{verdict}</span>
              </div>
              
              {confidence !== null && (
                <div className="confidence-indicator">
                  <div className="confidence-header">
                    <span className="confidence-label">{t('analysis.confidence')}</span>
                    <span className="confidence-value">{confidence}%</span>
                  </div>
                  <div className="confidence-bar">
                    <div 
                      className={`confidence-fill ${confidence < 60 ? 'low' : confidence < 80 ? 'medium' : 'high'}`}
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                </div>
              )}
              
              {confidence !== null && confidence < 60 && (
                <div className="low-confidence-warning">
                  <img src="/icon/alert-circle.svg" alt="warning" />
                  <span>{t('analysis.lowConfidenceWarning')}</span>
                </div>
              )}
              
              {analysisDetails?.multi_pass && (
                <div className="analysis-badge">
                  <img src="/icon/layers.svg" alt="multi-pass" />
                  <span>{t('analysis.multiLayerAnalysis')}</span>
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
          </div>
        )}
      </div>

      {showModal && (
        <div className="ai-detail-overlay" onClick={() => setShowModal(false)}>
          <div className="ai-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-detail-header">
              <h3>{t('analysis.detailedAnalysis')}</h3>
              <button className="close-detail-btn" onClick={() => setShowModal(false)}>
                <img src="/icon/x.svg" alt={t('common.close')} />
              </button>
            </div>
            <div className="ai-detail-body">
              <div className="ai-detail-score">
                <div>
                  <div className="ai-detail-label">
                    {t('analysis.aiGenerationProbability')}
                  </div>
                  <div className="ai-detail-value">
                    {result}%
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="ai-detail-label">
                    {t('analysis.confidence')}
                  </div>
                  <div className="ai-detail-value" style={{ 
                    color: confidence < 60 ? '#ff9800' : confidence < 80 ? '#4285f4' : '#34a853' 
                  }}>
                    {confidence}%
                  </div>
                </div>
              </div>

              <div className="ai-detail-verdict-section">
                <div className="ai-detail-label">{t('analysis.conclusion')}</div>
                <div className="ai-detail-verdict">{verdict}</div>
              </div>

              {analysisDetails && (
                <div className="ai-detail-stats">
                  <div className="stat-item">
                    <span className="stat-label">{t('analysis.wordCount')}</span>
                    <span className="stat-value">{analysisDetails.word_count}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{t('analysis.length')}</span>
                    <span className="stat-value">{analysisDetails.text_length} {t('common.characters')}</span>
                  </div>
                  {analysisDetails.multi_pass && (
                    <div className="stat-item">
                      <span className="stat-badge">
                        <img src="/icon/layers.svg" alt="multi" />
                        {t('analysis.multiLayerAnalysis')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {humanIndicators && humanIndicators.length > 0 && (
                <div className="ai-detail-section">
                  <h4 className="ai-detail-section-title">
                    <img src="/icon/user-check.svg" alt="human" />
                    {t('analysis.humanIndicators')} ({humanIndicators.length})
                  </h4>
                  <div className="indicator-list human-indicators">
                    {humanIndicators.map((item, index) => (
                      <div key={index} className="indicator-item">
                        <span className="indicator-bullet">[OK]</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiIndicators && aiIndicators.length > 0 && (
                <div className="ai-detail-section">
                  <h4 className="ai-detail-section-title">
                    <img src="/icon/cpu.svg" alt="ai" />
                    {t('analysis.aiIndicators')} ({aiIndicators.length})
                  </h4>
                  <div className="indicator-list ai-indicators">
                    {aiIndicators.map((item, index) => (
                      <div key={index} className="indicator-item">
                        <span className="indicator-bullet">⚠</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="ai-detail-section">
                <h4 className="ai-detail-section-title">
                  <img src="/icon/file-text.svg" alt="evidence" />
                  {t('analysis.analysisEvidence')}
                </h4>
                {evidence && evidence.length > 0 ? (
                  <div className="evidence-paragraphs">
                    {evidence.map((item, index) => (
                      <p key={index} className="evidence-paragraph">{item}</p>
                    ))}
                  </div>
                ) : (
                  <div className="no-evidence">
                    {t('analysis.noDetailedEvidence')}
                  </div>
                )}
              </div>

              {analysisDetails?.key_factor && (
                <div className="ai-detail-section key-factor">
                  <h4 className="ai-detail-section-title">
                    <img src="/icon/key.svg" alt="key" />
                    {t('analysis.determiningFactors')}
                  </h4>
                  <p className="key-factor-text">{analysisDetails.key_factor}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AIDetectionCard
