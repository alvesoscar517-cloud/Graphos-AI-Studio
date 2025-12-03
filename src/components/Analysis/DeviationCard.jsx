import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { analyzeText } from '../../services/api'
import { useNotes } from '../../contexts/NotesContext'
import { getCachedAnalysis, setCachedAnalysis } from '../../services/analysisCache'
import Lottie from 'lottie-react'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import Icon from '../Common/Icon'
import modal from '../../utils/modal'
import { cn } from '../../lib/utils'

const DeviationCard = ({ disabled, currentProfile, text, onAnalysisComplete }) => {
  const { t } = useTranslation()
  const [deviations, setDeviations] = useState([])
  const [analysisData, setAnalysisData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResult, setShowResult] = useState(true)
  const [textChanged, setTextChanged] = useState(true)
  const { currentNote } = useNotes()

  useEffect(() => {
    setDeviations([])
    setAnalysisData(null)
    setTextChanged(true)

    if (!currentNote || !currentProfile) return

    if (text) {
      const cacheKey = `deviation_${currentProfile.profile_id}`
      const cached = getCachedAnalysis(currentNote.id, text, cacheKey)
      if (cached) {
        setDeviations(cached.deviant_sentences || [])
        setAnalysisData(cached)
        setTextChanged(false)
        if (onAnalysisComplete) onAnalysisComplete(cached)
      }
    }
  }, [currentNote?.id, currentProfile?.profile_id])

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
      if (onAnalysisComplete) onAnalysisComplete(cached)
    } else {
      setDeviations([])
      setAnalysisData(null)
      setTextChanged(true)
    }
  }, [currentNote?.id, text, currentProfile?.profile_id])

  const findDeviations = async () => {
    if (!currentProfile || !text) return
    if (!currentNote) {
      modal.error(t('analysis.currentNoteNotFound'))
      return
    }
    
    setIsLoading(true)
    try {
      const progressToast = modal.toast(t('analysis.analyzing'), t('analysis.checkingStyleSuggestions'), 'info', { duration: 0 })
      const result = await analyzeText(currentProfile.profile_id, text)
      if (progressToast?.dismiss) progressToast.dismiss()
      
      if (result.success && result.data) {
        const deviantSentences = result.data.deviant_sentences || []
        setDeviations(deviantSentences)
        setAnalysisData(result.data)
        
        const cacheKey = `deviation_${currentProfile.profile_id}`
        setCachedAnalysis(currentNote.id, text, cacheKey, result.data)
        setTextChanged(false)
        
        if (onAnalysisComplete) onAnalysisComplete(result.data)
        
        if (deviantSentences.length > 0) {
          const severeSummary = result.data.deviation_summary?.by_severity || {}
          let summaryText = t('analysis.foundSentencesToImprove', { count: deviantSentences.length })
          if (severeSummary.severe > 0) summaryText += ` (${severeSummary.severe} ${t('analysis.severe')})`
          summaryText += `. ${t('analysis.clickSentencesForSuggestions')}`
          modal.toast(t('analysis.analysisComplete'), summaryText, 'success')
        } else {
          modal.toast(t('analysis.analysisComplete'), t('analysis.textMatchesStyle'), 'success')
        }
      } else {
        throw new Error(result.error || t('analysis.analysisFailed'))
      }
    } catch (error) {
      console.error('Error finding deviations:', error)
      modal.error(t('analysis.analysisFailed') + ' ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn(
      "p-4 border border-border-light rounded-xl",
      "bg-bg-secondary transition-all duration-200 hover:shadow-md"
    )}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-3 relative">
        <div className="card-icon">
          <Icon name="alert-triangle" size="lg" color="primary" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-text-primary m-0 mb-0.5">{t('analysis.deviations')}</h4>
          <p className="text-xs text-text-secondary m-0">{t('analysis.suggestionsHighlights')}</p>
        </div>
        {analysisData && (
          <button 
            className={cn(
              "bg-transparent border-none p-1.5 cursor-pointer rounded-md",
              "flex items-center justify-center transition-colors duration-200",
              "hover:bg-bg-tertiary ml-auto"
            )}
            onClick={() => setShowResult(!showResult)}
          >
            <img 
              src="/icon/chevron-down.svg" alt="toggle"
              className={cn("w-icon-md h-icon-md opacity-60 transition-all duration-300 hover:opacity-100 icon-invert", showResult ? "rotate-180" : "rotate-0")}
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
          "transition-all duration-200 hover:border-border-hover hover:shadow-md",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          isLoading && "pointer-events-none opacity-70"
        )}
        onClick={findDeviations}
        disabled={disabled || isLoading || !textChanged}
      >
        {isLoading ? (
          <Lottie animationData={threeDotsAnimation} loop={true} style={{ width: 50, height: 16 }} />
        ) : (
          <>
            <span>{!textChanged ? t('analysis.alreadySearched') : t('common.search')}</span>
            <Icon name="arrow-right" size="md" color="muted" />
          </>
        )}
      </button>

      {/* Result Section */}
      {analysisData && showResult && (
        <div className="mt-2 block animate-slide-down">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="stat-box">
              <div className="stat-box-icon">
                <Icon name="target" size="md" color="primary" />
              </div>
              <span className="stat-box-label">{t('analysis.compatibility').toUpperCase()}</span>
              <span className="stat-box-value">{analysisData.voice_compatibility_score}%</span>
            </div>
            <div className="stat-box">
              <div className="stat-box-icon">
                <Icon name="alert-circle" size="md" color="primary" />
              </div>
              <span className="stat-box-label">{t('analysis.sentencesWithSuggestions')}</span>
              <span className="stat-box-value">
                {analysisData.sentence_suggestions ? Object.keys(analysisData.sentence_suggestions).filter(key => analysisData.sentence_suggestions[key].issues_found > 0).length : 0}
              </span>
            </div>
          </div>

          {deviations.length > 0 ? (
            <>
              {/* Severity Summary */}
              {analysisData.deviation_summary && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {analysisData.deviation_summary.by_severity?.severe > 0 && (
                    <span className="text-2xs py-1 px-2 rounded bg-error/15 text-error font-medium">
                      {analysisData.deviation_summary.by_severity.severe} {t('analysis.severe')}
                    </span>
                  )}
                  {analysisData.deviation_summary.by_severity?.moderate > 0 && (
                    <span className="text-2xs py-1 px-2 rounded bg-warning/15 text-warning font-medium">
                      {analysisData.deviation_summary.by_severity.moderate} {t('analysis.moderate')}
                    </span>
                  )}
                  {analysisData.deviation_summary.by_severity?.mild > 0 && (
                    <span className="text-2xs py-1 px-2 rounded bg-primary/15 text-primary font-medium">
                      {analysisData.deviation_summary.by_severity.mild} {t('analysis.mild')}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-2 p-2 bg-bg-secondary rounded-lg text-xs text-text-secondary">
                <Icon name="mouse-pointer" size="sm" color="muted" />
                <span>{t('analysis.clickHighlightedSentences')}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 mt-2 p-2 bg-success/10 rounded-lg text-xs text-success">
              <Icon name="check-circle" size="sm" color="success" />
              <span>{t('analysis.textMatchesStyle')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DeviationCard
