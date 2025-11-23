import { useState, useRef, useEffect, useCallback } from 'react'
import { useAIProcessing } from '../../contexts/AIProcessingContext'
import SuggestionTooltip from './SuggestionTooltip'
import RewriteToolbar from './RewriteToolbar'
import './TextHighlightEditor.css'

/**
 * TextHighlightEditor - Clean rewrite with new class names
 */
const TextHighlightEditor = ({ 
  value, 
  onChange, 
  analysis: externalAnalysis,
  disabled = false,
  placeholder = "Nhập văn bản...",
  showHighlights = true,
  onHighlightsChange,
  showRewriteToolbar = false,
  currentProfile = null
}) => {
  const [analysis, setAnalysis] = useState(externalAnalysis)
  const [activeTooltip, setActiveTooltip] = useState(null)
  const { isProcessing } = useAIProcessing()
  
  const editorRef = useRef(null)
  
  // Detect dark theme
  const isDarkTheme = document.body.classList.contains('dark-theme') || 
                      document.documentElement.getAttribute('data-theme') === 'dark'

  // Update analysis
  useEffect(() => {
    if (externalAnalysis) {
      setAnalysis(externalAnalysis)
      
      const sentencesWithIssues = externalAnalysis.sentence_suggestions 
        ? Object.values(externalAnalysis.sentence_suggestions).filter(
            s => s.issues_found > 0 && s.suggestions && s.suggestions.length > 0
          ).length
        : 0
      
      console.log('📊 Highlighting', sentencesWithIssues, 'sentences with issues')
      
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

    // Get sentences with issues
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

      // Determine severity level
      const issuesCount = item.suggestionData.issues_found || 0
      const confidence = item.suggestionData.confidence || 50
      
      let level = 'low'
      if (issuesCount >= 3 || confidence < 40) {
        level = 'high'
      } else if (issuesCount >= 2 || confidence < 60) {
        level = 'medium'
      }

      // Add highlighted segment
      segments.push({
        text: item.sentence,
        type: 'highlight',
        level,
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

  // Handle click on highlighted text
  const handleHighlightClick = useCallback((segment, event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    
    setActiveTooltip({
      targetRect: rect,
      suggestions: segment.suggestions,
      level: segment.level,
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
    <div className="text-highlight-editor" ref={editorRef}>
      <div className={`highlight-editor-wrapper ${isProcessing ? 'processing-active' : ''} ${showRewriteToolbar ? 'with-toolbar' : ''}`}>
        {/* Overlay with highlights */}
        {analysis && showHighlights && (
          <div className="highlight-editor-overlay">
            {segments.map((segment, index) => {
              if (segment.type === 'normal') {
                return (
                  <span key={index} className="highlight-text-normal">
                    {segment.text}
                  </span>
                )
              }

              // Determine background color based on level and theme
              let bgColor
              if (isDarkTheme) {
                bgColor = segment.level === 'high' 
                  ? 'rgba(242, 139, 130, 0.25)'
                  : segment.level === 'medium'
                  ? 'rgba(253, 214, 99, 0.2)'
                  : 'rgba(253, 214, 99, 0.15)'
              } else {
                bgColor = segment.level === 'high' 
                  ? 'rgba(220, 38, 38, 0.15)'
                  : segment.level === 'medium'
                  ? 'rgba(234, 88, 12, 0.15)'
                  : 'rgba(202, 138, 4, 0.15)'
              }

              return (
                <span
                  key={index}
                  className={`highlight-text-marked level-${segment.level}`}
                  onClick={(e) => handleHighlightClick(segment, e)}
                  title={`${segment.suggestions.issues_found} vấn đề - Click để xem`}
                  style={{
                    backgroundColor: bgColor,
                    transition: 'none',
                    animation: 'none',
                    transform: 'none',
                    filter: 'none',
                    boxShadow: 'none',
                    outline: 'none',
                    border: 'none',
                    willChange: 'auto'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = bgColor
                    e.currentTarget.style.transition = 'none'
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.filter = 'none'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = bgColor
                    e.currentTarget.style.transition = 'none'
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.filter = 'none'
                  }}
                  onMouseMove={(e) => {
                    e.currentTarget.style.backgroundColor = bgColor
                  }}
                >
                  {segment.text}
                </span>
              )
            })}
          </div>
        )}
        
        {/* Input textarea */}
        <textarea
          className={`highlight-editor-input ${isProcessing ? 'processing-shimmer' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          spellCheck={false}
        />
      </div>

      {/* Tooltip */}
      {activeTooltip && (
        <SuggestionTooltip
          targetRect={activeTooltip.targetRect}
          suggestions={activeTooltip.suggestions}
          severity={activeTooltip.level}
          onApply={handleApplySuggestion}
          onClose={() => setActiveTooltip(null)}
        />
      )}

      {/* Rewrite Toolbar */}
      <RewriteToolbar
        visible={showRewriteToolbar}
        currentProfile={currentProfile}
        text={value}
        onTextChange={onChange}
        disabled={disabled || isProcessing}
      />
    </div>
  )
}

export default TextHighlightEditor
