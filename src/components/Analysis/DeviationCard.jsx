import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { analyzeText } from '../../services/api'
import { useNotes } from '../../contexts/NotesContext'
import { useAIProcessingActions } from '@/stores'
import { getCachedAnalysis, setCachedAnalysis } from '../../services/analysisCache'
import { getLocalizedContentError } from '../../utils/errorMessages'
import LazyLottie from '../Common/LazyLottie'
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
  const { startProcessing, stopProcessing } = useAIProcessingActions()

  // Single useEffect to handle cache loading - avoid duplicate calls
  useEffect(() => {
    // Reset state when note or profile changes
    setDeviations([])
    setAnalysisData(null)
    setTextChanged(true)

    if (!currentNote || !currentProfile || !text) return

    const cacheKey = `deviation_${currentProfile.profile_id}`
    const cached = getCachedAnalysis(currentNote.id, text, cacheKey)
    if (cached) {
      setDeviations(cached.deviant_sentences || [])
      setAnalysisData(cached)
      setTextChanged(false)
      // Don't call onAnalysisComplete here to avoid infinite loops
      // User needs to click "Search" button to trigger analysis
    }
  }, [currentNote?.id, text, currentProfile?.profile_id])

  const findDeviations = async () => {
    if (!currentProfile || !text) return
    if (!currentNote) {
      modal.error(t('analysis.currentNoteNotFound'))
      return
    }
    // Check if profile is still loading (placeholder)
    if (currentProfile._isPlaceholder) {
      modal.error(t('analysis.profileLoading') || 'Profile is still loading, please wait...')
      return
    }
    
    setIsLoading(true)
    startProcessing('analyze')
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
      const localizedError = getLocalizedContentError(error.message, t)
      modal.error(localizedError || t('analysis.analysisFailed'))
    } finally {
      setIsLoading(false)
      stopProcessing()
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
          <LazyLottie animationData={threeDotsAnimation} loop={true} style={{ width: 50, height: 16 }} />
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
          <div className="flex flex-col items-center gap-2 p-0">
            {/* Score Circle - matching system design */}
            <div className="relative w-score-circle h-score-circle flex items-center justify-center my-3">
              <svg 
                className="absolute top-0 left-0 w-full h-full -rotate-90" 
                viewBox="0 0 100 100"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))' }}
              >
                <defs>
                  <linearGradient id="deviationGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#93c5fd" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <circle 
                  className="fill-none" 
                  cx="50" cy="50" r="42"
                  style={{ stroke: 'var(--color-border-light)', strokeWidth: 8 }}
                />
                <circle 
                  className="fill-none"
                  cx="50" cy="50" r="42"
                  style={{
                    stroke: 'url(#deviationGradient)',
                    strokeWidth: 8,
                    strokeDasharray: 263.89,
                    strokeDashoffset: 263.89 - (analysisData.voice_compatibility_score / 100) * 263.89,
                    strokeLinecap: 'round',
                    transition: 'stroke-dashoffset 0.5s ease-out',
                    filter: 'drop-shadow(0 1px 3px rgba(66, 133, 244, 0.3))'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-2xl font-semibold leading-none tracking-tight text-text-primary">{analysisData.voice_compatibility_score}</span>
                  <span className="text-xs font-medium leading-none text-text-secondary opacity-60">%</span>
                </div>
              </div>
            </div>

            {/* Verdict Label */}
            <div className="w-full flex justify-center">
              <div className="inline-flex items-center gap-2 py-2 px-3 bg-bg-secondary border border-border-light rounded-lg text-xs font-medium text-text-primary">
                <Icon name="target" size="sm" color="primary" className="flex-shrink-0 -mt-px" />
                <span className="whitespace-nowrap leading-none">{t('analysis.compatibility')}</span>
              </div>
            </div>

            {/* Sentences with Suggestions */}
            <div className="w-full p-2 px-3 bg-bg-secondary rounded-lg">
              <span className="text-2xs text-text-secondary block mb-1.5">{t('analysis.suggestions')}</span>
              <span className="text-2xs py-1 px-2 rounded-md bg-primary/15 text-primary font-medium">
                {analysisData.sentence_suggestions ? Object.keys(analysisData.sentence_suggestions).filter(key => analysisData.sentence_suggestions[key].issues_found > 0).length : 0} {t('analysis.sentences')}
              </span>
            </div>

            {/* Severity Summary */}
            {deviations.length > 0 && analysisData.deviation_summary && (
              <div className="w-full p-2 px-3 bg-bg-secondary rounded-lg">
                <span className="text-2xs text-text-secondary block mb-1.5">{t('analysis.bySeverity')}</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisData.deviation_summary.by_severity?.severe > 0 && (
                    <span className="text-2xs py-1 px-2 rounded-md bg-error/15 text-error font-medium">
                      {analysisData.deviation_summary.by_severity.severe} {t('analysis.severe')}
                    </span>
                  )}
                  {analysisData.deviation_summary.by_severity?.moderate > 0 && (
                    <span className="text-2xs py-1 px-2 rounded-md bg-warning/15 text-warning font-medium">
                      {analysisData.deviation_summary.by_severity.moderate} {t('analysis.moderate')}
                    </span>
                  )}
                  {analysisData.deviation_summary.by_severity?.mild > 0 && (
                    <span className="text-2xs py-1 px-2 rounded-md bg-primary/15 text-primary font-medium">
                      {analysisData.deviation_summary.by_severity.mild} {t('analysis.mild')}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Hint or Success Message */}
            {deviations.length > 0 ? (
              <div className="w-full flex items-center gap-1.5 py-1.5 px-2.5 bg-bg-secondary border border-border-light rounded-lg text-xs text-text-muted leading-normal">
                <Icon name="mouse-pointer" size="xs" color="muted" className="flex-shrink-0 opacity-50" />
                <span>{t('analysis.clickHighlightedSentences')}</span>
              </div>
            ) : (
              <div className="w-full flex items-center gap-2 py-2 px-3 bg-success/10 rounded-lg text-xs text-success">
                <Icon name="check-circle" size="sm" color="success" />
                <span>{t('analysis.textMatchesStyle')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DeviationCard
