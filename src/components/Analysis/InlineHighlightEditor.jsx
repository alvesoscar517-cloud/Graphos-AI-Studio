import { useState, useRef, useEffect, useCallback } from 'react'
import { useAIProcessing } from '../../contexts/AIProcessingContext'
import SuggestionTooltip from './SuggestionTooltip'
import './InlineHighlightEditor.css'

/**
 * InlineHighlightEditor - Editor với inline highlighting
 * Viết lại hoàn toàn với tooltip portal để tránh xung đột CSS
 */
const InlineHighlightEditor = ({ 
  value, 
  onChange, 
  analysis: externalAnalysis,
  disabled = false,
  placeholder = "Nhập văn bản...",
  showHighlights = true,
  onHighlightsChange
}) => {
  const [analysis, setAnalysis] = useState(externalAnalysis)
  const [activeTooltip, setActiveTooltip] = useState(null)
  const { isProcessing } = useAIProcessing()
  
  const editorRef = useRef(null)

  // Update analysis
  useEffect(() => {
    if (externalAnalysis) {
      setAnalysis(externalAnalysis)
      
      const sentencesWithIssues = externalAnalysis.sentence_suggestions 
        ? Object.values(externalAnalysis.sentence_suggestions).filter(
            s => s.issues_found > 0 && s.suggestions && s.suggestions.length > 0
          ).length
        : 0
      
      console.log('📊 Highlighting', sentencesWithIssues, 'sentences with real issues')
      
      // Notify parent about highlights availability
      if (onHighlightsChange) {
        onHighlightsChange(sentencesWithIssues > 0)
      }
    }
  }, [externalAnalysis, onHighlightsChange])

  // Parse text into segments
  const parseTextSegments = useCallback(() => {
    if (!analysis || !value || !analysis.sentence_suggestions) {
      return [{ text: value || '', type: 'normal' }]
    }

    const segments = []
    let lastIndex = 0

    // Get sentences with real issues
    const sentencesWithIssues = Object.entries(analysis.sentence_suggestions)
      .map(([sentence, suggestionData]) => ({
        sentence,
        suggestionData,
        position: value.indexOf(sentence),
        hasRealIssues: suggestionData.issues_found > 0 && 
                      suggestionData.suggestions && 
                      suggestionData.suggestions.length > 0
      }))
      .filter(item => item.position !== -1 && item.hasRealIssues)
      .sort((a, b) => a.position - b.position)

    if (sentencesWithIssues.length === 0) {
      return [{ text: value, type: 'normal' }]
    }

    sentencesWithIssues.forEach((item) => {
      const startIndex = item.position
      
      // Add normal text before
      if (startIndex > lastIndex) {
        segments.push({
          text: value.substring(lastIndex, startIndex),
          type: 'normal'
        })
      }

      // Determine severity
      const issuesCount = item.suggestionData.issues_found || 0
      const confidence = item.suggestionData.confidence || 50
      
      let severity = 'low'
      if (issuesCount >= 3 || confidence < 40) {
        severity = 'high'
      } else if (issuesCount >= 2 || confidence < 60) {
        severity = 'medium'
      }

      // Add highlighted segment
      segments.push({
        text: item.sentence,
        type: 'highlight',
        severity,
        suggestions: item.suggestionData
      })

      lastIndex = startIndex + item.sentence.length
    })

    // Add remaining text
    if (lastIndex < value.length) {
      segments.push({
        text: value.substring(lastIndex),
        type: 'normal'
      })
    }

    return segments
  }, [analysis, value])

  // Handle click on highlighted sentence
  const handleHighlightClick = useCallback((segment, event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    
    setActiveTooltip({
      targetRect: rect,
      suggestions: segment.suggestions,
      severity: segment.severity,
      originalText: segment.text
    })
  }, [])

  // Apply suggestion
  const handleApplySuggestion = useCallback((rewrittenText) => {
    if (!activeTooltip) return
    
    const newValue = value.replace(activeTooltip.originalText, rewrittenText)
    onChange(newValue)
  }, [activeTooltip, value, onChange])

  const segments = parseTextSegments()

  return (
    <div className="inline-highlight-editor-v2" ref={editorRef}>
      <div className={`editor-container-v2 ${isProcessing ? 'ai-processing' : ''}`}>
        {/* Highlights layer */}
        {analysis && showHighlights && (
          <div className="editor-highlights-v2">
            {segments.map((segment, index) => {
              if (segment.type === 'normal') {
                return <span key={index} className="text-segment-normal">{segment.text}</span>
              }

              return (
                <span
                  key={index}
                  className={`text-segment-highlight severity-${segment.severity}`}
                  onClick={(e) => handleHighlightClick(segment, e)}
                  title={`${segment.suggestions.issues_found} vấn đề - Click để xem`}
                >
                  {segment.text}
                </span>
              )
            })}
          </div>
        )}
        
        {/* Textarea */}
        <textarea
          className={`editor-textarea-v2 ${isProcessing ? 'shimmer-text' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          spellCheck={false}
        />
      </div>

      {/* Tooltip portal */}
      {activeTooltip && (
        <SuggestionTooltip
          targetRect={activeTooltip.targetRect}
          suggestions={activeTooltip.suggestions}
          severity={activeTooltip.severity}
          onApply={handleApplySuggestion}
          onClose={() => setActiveTooltip(null)}
        />
      )}
    </div>
  )
}

export default InlineHighlightEditor
