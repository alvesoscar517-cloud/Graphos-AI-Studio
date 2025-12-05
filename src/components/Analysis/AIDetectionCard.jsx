import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { detectAI as detectAIAPI } from '../../services/api'
import { useNotes } from '../../contexts/NotesContext'
import { getCachedAnalysis, setCachedAnalysis } from '../../services/analysisCache'
import { getLocalizedContentError } from '../../utils/errorMessages'
import { handleCreditError } from '../../utils/creditHandler'
import LazyLottie from '../Common/LazyLottie'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import Icon from '../Common/Icon'
import modal from '../../utils/modal'
import { cn } from '../../lib/utils'

const AIDetectionCard = ({ disabled, text }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
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

  useEffect(() => {
    setResult(null)
    setConfidence(null)
    setEvidence([])
    setHumanIndicators([])
    setAiIndicators([])
    setVerdict('')
    setAnalysisDetails(null)
    setTextChanged(true)

    if (!currentNote) return

    if (text) {
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
      }
    }
  }, [currentNote?.id])

  useEffect(() => {
    if (!currentNote || !text) {
      setTextChanged(true)
      return
    }

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
    } else {
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

    // Check minimum text length (50 characters required for AI detection)
    if (text.trim().length < 50) {
      modal.error(t('errors.textTooShort', { min: 50 }))
      return
    }

    if (!currentNote) {
      modal.error(t('analysis.currentNoteNotFound'))
      return
    }
    
    setIsLoading(true)
    try {
      const apiResult = await detectAIAPI(text)
      
      if (apiResult.success && apiResult.data) {
        const aiScore = Math.round(apiResult.data.ai_probability || 0)
        const confidenceScore = Math.round(apiResult.data.confidence || 70)
        
        let verdictText = apiResult.data.verdict || (aiScore < 50 ? 'Appears to be human-written' : 'Likely AI-generated')
        verdictText = verdictText.replace('Content ', '').replace('content ', '')
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
        
        setCachedAnalysis(currentNote.id, text, 'detect', resultData)
        setTextChanged(false)
        
        modal.toast(t('analysis.detectionComplete'), verdictText, 'success')
      } else {
        throw new Error(apiResult.error || t('analysis.detectionFailed'))
      }
    } catch (error) {
      console.error('[FAIL] Error detecting AI:', error)
      
      // Check if it's a credit error first
      const wasCreditError = handleCreditError(error, t, () => navigate('/pricing'))
      
      if (!wasCreditError) {
        // Get localized error message for other errors
        const localizedError = getLocalizedContentError(error.message, t)
        modal.error(localizedError || t('analysis.detectionFailed'))
      }
      
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

  return (
    <>
      {/* Main Card */}
      <div className={cn(
        "p-4 border border-border-light rounded-xl",
        "bg-bg-secondary transition-all duration-200",
        "hover:shadow-md"
      )}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-3 relative">
          <div className="card-icon">
            <Icon name="shield-check" size="lg" color="primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-text-primary m-0 mb-0.5">
              {t('analysis.aiDetection')}
            </h4>
            <p className="text-xs text-text-secondary m-0">
              {t('analysis.content')}
            </p>
          </div>
          {result !== null && (
            <button 
              className={cn(
                "bg-transparent border-none p-1.5 cursor-pointer rounded-md",
                "flex items-center justify-center transition-colors duration-200",
                "hover:bg-bg-tertiary ml-auto"
              )}
              onClick={() => setShowResult(!showResult)}
            >
              <img 
                src="/icon/chevron-down.svg"
                alt="toggle"
                className={cn(
                  "w-icon-md h-icon-md opacity-60 transition-all duration-300",
                  "hover:opacity-100 icon-invert",
                  showResult ? "rotate-180" : "rotate-0"
                )}
              />
            </button>
          )}
        </div>

        {/* Action Button */}
        <button 
          className={cn(
            "w-full flex items-center justify-between py-2.5 px-3.5",
            "bg-bg-secondary border border-border-light rounded-xl",
            "text-sm font-medium text-text-primary cursor-pointer",
            "transition-all duration-200 relative overflow-hidden",
            "hover:border-border-hover hover:shadow-md",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
            isLoading && "pointer-events-none opacity-70"
          )}
          onClick={detectAI}
          disabled={disabled || isLoading || !textChanged}
        >
          {isLoading ? (
            <LazyLottie animationData={threeDotsAnimation} loop={true} style={{ width: 50, height: 16 }} />
          ) : (
            <>
              <span>{!textChanged ? t('analysis.detected') : t('analysis.detect')}</span>
              <Icon name="arrow-right" size="md" color="muted" />
            </>
          )}
        </button>

        {/* Result Section */}
        {result !== null && showResult && (
          <div className="mt-2 block animate-slide-down">
            <div className="flex flex-col items-center gap-2 p-0">
              {/* Score Circle */}
              <div className="relative w-score-circle h-score-circle flex items-center justify-center my-3">
                <svg 
                  className="absolute top-0 left-0 w-full h-full -rotate-90" 
                  viewBox="0 0 100 100"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))' }}
                >
                  {/* Background circle - transparent fill */}
                  <circle 
                    className="fill-none" 
                    cx="50" cy="50" r="42"
                    style={{ 
                      stroke: 'var(--color-border-light)',
                      strokeWidth: 8
                    }}
                  />
                  {/* Progress circle */}
                  <circle 
                    className="fill-none"
                    cx="50" cy="50" r="42"
                    style={{
                      stroke: 'var(--color-text-link)',
                      strokeWidth: 8,
                      strokeDasharray: 263.89,
                      strokeDashoffset: 263.89 - (result / 100) * 263.89,
                      strokeLinecap: 'round',
                      transition: 'stroke-dashoffset 0.5s ease-out',
                      filter: 'drop-shadow(0 1px 3px rgba(66, 133, 244, 0.3))'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span className="text-3xl font-semibold leading-none tracking-tight text-text-primary">{result}</span>
                    <span className="text-sm font-medium leading-none text-text-secondary opacity-60">%</span>
                  </div>
                </div>
              </div>
              
              {/* Verdict */}
              <div className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-bg-secondary rounded-lg text-xs font-medium text-text-primary">
                <Icon 
                  name={result < 30 ? "shield-check" : result < 50 ? "check-circle" : result < 70 ? "alert-circle" : "alert-triangle"} 
                  size="sm" color="primary" className="flex-shrink-0 -mt-px"
                />
                <span className="whitespace-nowrap flex-shrink-0 leading-none">{verdict}</span>
              </div>
              
              {/* Confidence Indicator */}
              {confidence !== null && (
                <div className="w-full p-2 px-3 bg-bg-secondary rounded-lg mt-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-2xs font-medium text-text-secondary uppercase tracking-wide">{t('analysis.confidence')}</span>
                    <span className="text-sm font-semibold text-text-primary">{confidence}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-bg-tertiary rounded-sm overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-sm transition-all duration-500",
                        confidence < 60 && "bg-gradient-to-r from-orange-500 to-red-400",
                        confidence >= 60 && confidence < 80 && "bg-gradient-to-r from-blue-500 to-cyan-400",
                        confidence >= 80 && "bg-gradient-to-r from-green-500 to-emerald-400"
                      )}
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Low Confidence Warning */}
              {confidence !== null && confidence < 60 && (
                <div className="w-full flex items-center gap-2 py-2 px-3 bg-warning/10 border border-warning/30 rounded-lg text-2xs text-warning leading-relaxed">
                  <Icon name="alert-circle" size="sm" color="warning" className="flex-shrink-0" />
                  <span>{t('analysis.lowConfidenceWarning')}</span>
                </div>
              )}
              
              {/* View Details Button */}
              <button 
                className={cn(
                  "w-full py-2 px-3 mt-0",
                  "bg-bg-secondary border-none rounded-lg",
                  "flex items-center justify-between cursor-pointer",
                  "transition-all duration-200 text-xs font-medium text-text-primary",
                  "hover:bg-bg-tertiary"
                )}
                onClick={() => setShowModal(true)}
              >
                <span>{t('common.viewDetails')}</span>
                <Icon name="chevron-right" size="sm" color="muted" />
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Detail Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between py-5 px-6 border-b border-border-light">
              <h3 className="text-lg font-medium text-text-primary m-0">{t('analysis.detailedAnalysis')}</h3>
              <button 
                className="bg-transparent border-none p-2 cursor-pointer rounded-full flex items-center justify-center hover:bg-bg-tertiary"
                onClick={() => setShowModal(false)}
              >
                <Icon name="x" alt={t('common.close')} size="lg" color="muted" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Score Section */}
              <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl mb-5">
                <div>
                  <div className="text-sm text-text-secondary mb-1">{t('analysis.aiGenerationProbability')}</div>
                  <div className="text-3xl font-semibold text-text-secondary">{result}%</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-text-secondary mb-1">{t('analysis.confidence')}</div>
                  <div 
                    className="text-3xl font-semibold"
                    style={{ color: confidence < 60 ? '#ff9800' : confidence < 80 ? '#4285f4' : '#34a853' }}
                  >
                    {confidence}%
                  </div>
                </div>
              </div>

              {/* Verdict Section */}
              <div className="p-3 bg-bg-secondary rounded-lg mb-4">
                <div className="text-sm text-text-secondary mb-1">{t('analysis.conclusion')}</div>
                <div className="text-sm font-medium text-text-primary">{verdict}</div>
              </div>

              {/* Analysis Stats */}
              {analysisDetails && (
                <div className="flex gap-3 flex-wrap p-3 bg-bg-secondary rounded-lg mb-4">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-text-secondary font-medium">{t('analysis.wordCount')}</span>
                    <span className="text-text-primary font-semibold">{analysisDetails.word_count}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-text-secondary font-medium">{t('analysis.length')}</span>
                    <span className="text-text-primary font-semibold">{analysisDetails.text_length} {t('common.characters')}</span>
                  </div>
                  {analysisDetails.multi_pass && (
                    <div className="flex items-center gap-1 py-1 px-2 bg-primary/10 rounded text-primary text-2xs font-medium">
                      <Icon name="layers" size="xs" color="primary" />
                      {t('analysis.multiLayerAnalysis')}
                    </div>
                  )}
                </div>
              )}

              {/* Human Indicators */}
              {humanIndicators && humanIndicators.length > 0 && (
                <div className="mb-5">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2.5">
                    <Icon name="user-check" size="sm" color="primary" />
                    {t('analysis.humanIndicators')} ({humanIndicators.length})
                  </h4>
                  <div className="flex flex-col gap-2">
                    {humanIndicators.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 py-2 px-2.5 bg-bg-secondary rounded-md text-xs leading-relaxed">
                        <span className="flex-shrink-0 font-semibold mt-px text-success">[OK]</span>
                        <span className="text-text-primary">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Indicators */}
              {aiIndicators && aiIndicators.length > 0 && (
                <div className="mb-5">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2.5">
                    <Icon name="cpu" size="sm" color="primary" />
                    {t('analysis.aiIndicators')} ({aiIndicators.length})
                  </h4>
                  <div className="flex flex-col gap-2">
                    {aiIndicators.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 py-2 px-2.5 bg-bg-secondary rounded-md text-xs leading-relaxed">
                        <span className="flex-shrink-0 font-semibold mt-px text-warning">⚠</span>
                        <span className="text-text-primary">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Section */}
              <div className="mb-5">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2.5">
                  <Icon name="file-text" size="sm" color="primary" />
                  {t('analysis.analysisEvidence')}
                </h4>
                {evidence && evidence.length > 0 ? (
                  <div className="flex flex-col gap-3 p-4 bg-bg-secondary rounded-xl">
                    {evidence.map((item, index) => (
                      <p key={index} className="text-sm text-text-primary leading-relaxed m-0">{item}</p>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-text-secondary text-sm">{t('analysis.noDetailedEvidence')}</div>
                )}
              </div>

              {/* Key Factor */}
              {analysisDetails?.key_factor && (
                <div className="p-3 bg-primary/5 border-l-4 border-primary rounded-md mb-5">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2.5">
                    <Icon name="key" size="sm" color="primary" />
                    {t('analysis.determiningFactors')}
                  </h4>
                  <p className="text-xs leading-relaxed text-text-primary m-0 italic">{analysisDetails.key_factor}</p>
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
