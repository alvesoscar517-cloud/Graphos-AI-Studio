import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { debounce } from '../../utils/debounce'
import { cn } from '../../lib/utils'
import { Icon } from '../Common'

const PasteTextModal = ({ isOpen, onClose, onSave, initialText = '' }) => {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [analysis, setAnalysis] = useState(null)
  const debouncedAnalyzeRef = useRef(null)

  const debouncedAnalyze = useCallback((value) => {
    if (!debouncedAnalyzeRef.current) {
      debouncedAnalyzeRef.current = debounce((val) => {
        const result = analyzeText(val)
        setAnalysis(result)
      }, 300)
    }
    debouncedAnalyzeRef.current(value)
  }, [])

  useEffect(() => {
    return () => {
      if (debouncedAnalyzeRef.current?.cancel) {
        debouncedAnalyzeRef.current.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen && initialText) {
      handleTextChange(initialText, true)
    } else if (!isOpen) {
      if (!initialText) {
        setText('')
        setWordCount(0)
        setAnalysis(null)
      }
      if (debouncedAnalyzeRef.current?.cancel) {
        debouncedAnalyzeRef.current.cancel()
      }
    }
  }, [isOpen, initialText])

  const analyzeText = (value) => {
    const words = value.trim().split(/\s+/).filter(w => w.length > 0)
    const sentences = value.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const paragraphs = value.split(/\n\n+/).filter(p => p.trim().length > 0)
    const uniqueWords = new Set(words.map(w => w.toLowerCase()))
    
    const wordCount = words.length
    const sentenceCount = sentences.length
    const paragraphCount = paragraphs.length
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0
    const avgParagraphLength = paragraphCount > 0 ? wordCount / paragraphCount : 0
    const vocabularyDiversity = wordCount > 0 ? (uniqueWords.size / wordCount) * 100 : 0
    
    const wordFreq = {}
    words.forEach(w => {
      const lower = w.toLowerCase()
      wordFreq[lower] = (wordFreq[lower] || 0) + 1
    })
    const repetitiveWords = Object.entries(wordFreq)
      .filter(([word, count]) => count / wordCount > 0.03 && word.length > 4)
      .map(([word]) => word)
    
    let qualityScore = 0
    const smartHints = []
    
    if (wordCount < 500) {
      smartHints.push(`Need ${500 - wordCount} more words to reach minimum level (current: ${wordCount} words)`)
      qualityScore += Math.min((wordCount / 500) * 25, 25)
    } else if (wordCount >= 500 && wordCount < 1000) {
      qualityScore += 30
      smartHints.push(`Minimum reached. Add ${1000 - wordCount} more words to reach recommended level`)
    } else if (wordCount >= 1000 && wordCount < 1500) {
      qualityScore += 40
      smartHints.push(`Excellent! Add ${1500 - wordCount} more words to reach optimal quality`)
    } else if (wordCount >= 1500 && wordCount < 2000) {
      qualityScore += 45
      smartHints.push(`Excellent! Add ${2000 - wordCount} more words for deeper AI learning`)
    } else if (wordCount >= 2000) {
      qualityScore += 50
      smartHints.push(`Perfect! Ideal length for best AI learning`)
    }
    
    if (paragraphCount < 2 && wordCount > 200) {
      smartHints.push(`Should split into multiple paragraphs (current: ${paragraphCount} paragraphs)`)
      qualityScore += 5
    } else if (avgParagraphLength > 200) {
      smartHints.push(`Paragraphs too long (Avg: ${Math.round(avgParagraphLength)} words/paragraph). Should split smaller`)
      qualityScore += 10
    } else if (paragraphCount >= 2) {
      qualityScore += 15
    }
    
    if (vocabularyDiversity < 40) {
      smartHints.push(`Vocabulary repetitive (${vocabularyDiversity.toFixed(0)}% unique). Use synonyms`)
      qualityScore += 5
    } else if (vocabularyDiversity >= 40 && vocabularyDiversity < 60) {
      qualityScore += 15
    } else {
      qualityScore += 20
      if (wordCount >= 1000) {
        smartHints.push(`Vocabulary very diverse (${vocabularyDiversity.toFixed(0)}% unique)`)
      }
    }
    
    if (avgSentenceLength < 8) {
      smartHints.push(`Sentences too short (Avg: ${avgSentenceLength.toFixed(1)} words/sentence). Combine more complex sentences`)
      qualityScore += 5
    } else if (avgSentenceLength > 25) {
      smartHints.push(`Sentences too long (avg: ${avgSentenceLength.toFixed(1)} words/sentence). Break them up for readability`)
      qualityScore += 10
    } else {
      qualityScore += 15
    }
    
    if (repetitiveWords.length > 0 && wordCount > 300) {
      smartHints.push(`Repeated words: "${repetitiveWords.slice(0, 2).join('", "')}"`)
    }
    
    const shortSentences = sentences.filter(s => s.trim().split(/\s+/).length < 10).length
    const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 20).length
    const sentenceVariety = sentenceCount > 0 ? 
      1 - Math.abs((shortSentences + longSentences) / sentenceCount - 0.4) : 0
    
    if (sentenceVariety < 0.5 && sentenceCount > 5) {
      smartHints.push(`Sentence structure monotonous. Mix short and long sentences for rhythm`)
    }
    
    return {
      wordCount,
      sentenceCount,
      paragraphCount,
      avgSentenceLength: avgSentenceLength.toFixed(1),
      avgParagraphLength: avgParagraphLength.toFixed(0),
      vocabularyDiversity: vocabularyDiversity.toFixed(1),
      qualityScore: Math.min(qualityScore, 100),
      smartHints,
      isReady: wordCount >= 500 && qualityScore >= 50
    }
  }

  const handleTextChange = useCallback((value, immediate = false) => {
    const words = value.trim().split(/\s+/).filter(w => w.length > 0)
    
    if (words.length > 5000) {
      const trimmedText = words.slice(0, 5000).join(' ')
      setText(trimmedText)
      setWordCount(5000)
      const result = analyzeText(trimmedText)
      setAnalysis(result)
    } else {
      setText(value)
      setWordCount(words.length)
      
      if (words.length > 50) {
        if (immediate) {
          const result = analyzeText(value)
          setAnalysis(result)
        } else {
          debouncedAnalyze(value)
        }
      } else {
        setAnalysis(null)
      }
    }
  }, [debouncedAnalyze])

  const handleSave = () => {
    if (analysis && analysis.isReady) {
      onSave(text)
    }
  }

  if (!isOpen) return null

  const progress = Math.min((wordCount / 5000) * 100, 100)
  const canSave = analysis && analysis.isReady
  
  const getProgressStatus = () => {
    if (wordCount < 500) return 'low'
    if (wordCount < 1000) return 'medium'
    if (wordCount < 1500) return 'good'
    if (wordCount < 2000) return 'great'
    return 'optimal'
  }

  const getPrimaryHint = () => {
    if (wordCount === 0) return t('profileSetup.pasteToStart')
    if (wordCount < 100) return t('profileSetup.keepTyping')
    if (analysis && analysis.smartHints.length > 0) return analysis.smartHints[0]
    return t('profileSetup.greatText')
  }

  const status = getProgressStatus()
  const statusColors = {
    low: { bg: 'bg-red-100', text: 'text-red-600', fill: 'from-red-500 to-red-400' },
    medium: { bg: 'bg-orange-100', text: 'text-orange-600', fill: 'from-orange-500 to-orange-400' },
    good: { bg: 'bg-yellow-100', text: 'text-yellow-600', fill: 'from-yellow-500 to-yellow-400' },
    great: { bg: 'bg-lime-100', text: 'text-lime-600', fill: 'from-lime-500 to-lime-400' },
    optimal: { bg: 'bg-emerald-100', text: 'text-emerald-600', fill: 'from-emerald-500 to-emerald-400' }
  }

  const statusLabels = {
    low: t('profileSetup.needMore'),
    medium: t('profileSetup.minimum'),
    good: t('profileSetup.fair'),
    great: t('profileSetup.good'),
    optimal: wordCount >= 5000 ? t('profileSetup.maximum') : 
             wordCount >= 3000 ? t('profileSetup.excellent') : t('profileSetup.veryGood')
  }

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-modal p-5 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className={cn(
          "bg-white rounded-2xl w-full max-w-[820px] max-h-[88vh]",
          "flex flex-col shadow-xl",
          "animate-slide-up overflow-hidden"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3.5 py-6 px-7 pb-3 shrink-0">
          <div className="w-11 h-11 flex items-center justify-center bg-gray-100 rounded-xl shrink-0">
            <Icon name="edit-3" size="md" color="primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 m-0 mb-1 tracking-tight">
              {t('profileSetup.pasteTextTitle')}
            </h2>
            <p className="text-xs text-gray-600 m-0 leading-normal">
              {t('profileSetup.pasteTextSubtitle')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col py-3 px-7 pb-5 gap-3.5 overflow-y-auto min-h-0">
          <textarea
            className={cn(
              "w-full min-h-[420px] flex-1 p-4 text-sm font-sans leading-relaxed",
              "text-gray-900 bg-gray-50 border border-gray-300 rounded-xl",
              "resize-none outline-none placeholder:text-gray-500"
            )}
            placeholder={t('profileSetup.pasteTextPlaceholder')}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
          />
          
          {/* Progress Section */}
          <div className="flex flex-col gap-2.5 py-3.5 px-4 bg-bg-secondary rounded-xl border border-gray-200 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 py-1.5 px-3 bg-white rounded-lg border border-gray-300">
                <span className="text-base font-bold text-gray-900 tracking-tight">{wordCount.toLocaleString()}</span>
                <span className="text-sm text-gray-400 font-normal">/</span>
                <span className="text-sm font-medium text-gray-500">5,000 {t('common.words')}</span>
              </div>
              <div className={cn(
                "py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300",
                statusColors[status].bg,
                statusColors[status].text
              )}>
                [{statusLabels[status]}]
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-full h-1.5 bg-gray-200 rounded-xl relative overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-xl transition-all duration-400 ease-out",
                    "bg-gradient-to-r",
                    statusColors[status].fill
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between px-0.5">
                {[500, 1000, 2000, 3000, 5000].map((milestone, i) => (
                  <span 
                    key={milestone}
                    className={cn(
                      "text-xs font-semibold tracking-wide transition-all duration-300",
                      wordCount >= milestone ? "text-emerald-500" : "text-gray-500"
                    )}
                  >
                    {i === 1 ? '1K' : i === 2 ? '2K' : i === 3 ? '3K' : i === 4 ? '5K' : milestone}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between py-4 px-7 shrink-0">
          <div className="flex items-center gap-2 py-2.5 px-3.5 bg-bg-secondary rounded-lg flex-1 max-w-md">
            <img src="/icon/lightbulb.svg" alt="" width="16" height="16" className="shrink-0 opacity-60" />
            <span className="text-sm text-gray-600 leading-snug">{getPrimaryHint()}</span>
          </div>
          <div className="flex gap-2.5">
            <button 
              className="py-2.5 px-6 text-sm font-medium border-none rounded-lg cursor-pointer transition-all duration-200 bg-gray-100 text-gray-600 hover:bg-gray-200"
              onClick={onClose}
            >
              {t('common.cancel')}
            </button>
            <button 
              className={cn(
                "py-2.5 px-6 text-sm font-medium border-none rounded-lg cursor-pointer transition-all duration-200",
                "bg-primary text-white",
                "hover:enabled:bg-primary-hover hover:enabled:-translate-y-px hover:enabled:shadow-md",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              onClick={handleSave}
              disabled={!canSave}
            >
              {t('profileSetup.saveText')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PasteTextModal
