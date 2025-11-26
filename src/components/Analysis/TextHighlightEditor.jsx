import { useState, useRef, useEffect, useCallback } from 'react'
import { useAIProcessing } from '../../contexts/AIProcessingContext'
import useAutoScrollbar from '../../hooks/useAutoScrollbar'
import SuggestionTooltip from './SuggestionTooltip'
import RewriteToolbar from './RewriteToolbar'
import './TextHighlightEditor.css'

/**
 * TextHighlightEditor - Enhanced with keyboard navigation and undo support
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
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(-1)
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [dismissedSuggestions, setDismissedSuggestions] = useState(new Set())
  const { isProcessing } = useAIProcessing()
  
  const editorRef = useRef(null)
  const textareaRef = useRef(null)
  const highlightRefs = useRef([])
  
  // Auto-show scrollbar khi scroll nhiều - áp dụng cho textarea
  const { scrollbarClassName } = useAutoScrollbar({
    scrollThreshold: 30,
    hideDelay: 1200,
    showOnHover: true,
    externalRef: textareaRef
  })
  
  // Detect dark theme
  const isDarkTheme = document.body.classList.contains('dark-theme') || 
                      document.documentElement.getAttribute('data-theme') === 'dark'

  // Update analysis and reset states
  useEffect(() => {
    if (externalAnalysis) {
      setAnalysis(externalAnalysis)
      setActiveHighlightIndex(-1)
      setDismissedSuggestions(new Set())
      
      const sentencesWithIssues = externalAnalysis.sentence_suggestions 
        ? Object.values(externalAnalysis.sentence_suggestions).filter(
            s => s.issues_found > 0
          ).length
        : 0
      
      console.log('📊 Highlighting', sentencesWithIssues, 'sentences with issues')
      
      if (onHighlightsChange) {
        onHighlightsChange(sentencesWithIssues > 0)
      }
    }
  }, [externalAnalysis, onHighlightsChange])

  // Keyboard navigation for highlights
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!analysis || !showHighlights) return
      
      const segments = parseTextSegments()
      const highlightSegments = segments.filter(s => s.type === 'highlight' && !dismissedSuggestions.has(s.text))
      
      if (highlightSegments.length === 0) return
      
      // Tab or Arrow keys to navigate highlights
      if (e.key === 'Tab' && e.shiftKey && activeTooltip) {
        e.preventDefault()
        const newIndex = activeHighlightIndex > 0 ? activeHighlightIndex - 1 : highlightSegments.length - 1
        setActiveHighlightIndex(newIndex)
        navigateToHighlight(newIndex, highlightSegments)
      } else if (e.key === 'Tab' && !e.shiftKey && activeTooltip) {
        e.preventDefault()
        const newIndex = activeHighlightIndex < highlightSegments.length - 1 ? activeHighlightIndex + 1 : 0
        setActiveHighlightIndex(newIndex)
        navigateToHighlight(newIndex, highlightSegments)
      }
      
      // Escape to close tooltip
      if (e.key === 'Escape' && activeTooltip) {
        setActiveTooltip(null)
        setActiveHighlightIndex(-1)
      }
      
      // Ctrl+Z for undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey && undoStack.length > 0) {
        e.preventDefault()
        handleUndo()
      }
      
      // Ctrl+Shift+Z or Ctrl+Y for redo
      if ((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
        if (redoStack.length > 0) {
          e.preventDefault()
          handleRedo()
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [analysis, showHighlights, activeTooltip, activeHighlightIndex, undoStack, redoStack, dismissedSuggestions])

  // Navigate to specific highlight
  const navigateToHighlight = useCallback((index, highlightSegments) => {
    if (highlightRefs.current[index]) {
      const element = highlightRefs.current[index]
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      
      const rect = element.getBoundingClientRect()
      setActiveTooltip({
        targetRect: rect,
        suggestions: highlightSegments[index].suggestions,
        level: highlightSegments[index].level,
        originalText: highlightSegments[index].text
      })
    }
  }, [])

  // Undo handler
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return
    
    const lastState = undoStack[undoStack.length - 1]
    setRedoStack(prev => [...prev, { text: value, timestamp: Date.now() }])
    setUndoStack(prev => prev.slice(0, -1))
    onChange(lastState.text)
    
    console.log('↩️ Undo applied')
  }, [undoStack, value, onChange])

  // Redo handler
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return
    
    const nextState = redoStack[redoStack.length - 1]
    setUndoStack(prev => [...prev, { text: value, timestamp: Date.now() }])
    setRedoStack(prev => prev.slice(0, -1))
    onChange(nextState.text)
    
    console.log('↪️ Redo applied')
  }, [redoStack, value, onChange])

  // Parse text into segments
  const parseTextSegments = useCallback(() => {
    if (!analysis || !value || !analysis.sentence_suggestions) {
      return [{ text: value || '', type: 'normal' }]
    }

    const segments = []
    let lastIndex = 0

    // Get sentences with issues (filter out dismissed ones)
    const sentencesWithIssues = Object.entries(analysis.sentence_suggestions)
      .map(([sentence, suggestionData]) => ({
        sentence,
        suggestionData,
        position: value.indexOf(sentence),
        hasRealIssues: suggestionData.issues_found > 0,
        isDismissed: dismissedSuggestions.has(sentence)
      }))
      .filter(item => item.position !== -1 && item.hasRealIssues)
      .sort((a, b) => a.position - b.position)

    if (sentencesWithIssues.length === 0) {
      return [{ text: value, type: 'normal' }]
    }

    // Reset highlight refs
    highlightRefs.current = []

    sentencesWithIssues.forEach((item) => {
      const startIndex = item.position
      
      // Add normal text before
      if (startIndex > lastIndex) {
        segments.push({
          text: value.substring(lastIndex, startIndex),
          type: 'normal'
        })
      }

      // Determine severity level from API or calculate
      let level = item.suggestionData.severity || 'low'
      if (!['high', 'medium', 'low', 'mild', 'moderate', 'severe'].includes(level)) {
        const issuesCount = item.suggestionData.issues_found || 0
        if (issuesCount >= 3) {
          level = 'high'
        } else if (issuesCount >= 2) {
          level = 'medium'
        } else {
          level = 'low'
        }
      }
      
      // Map API severity to display level
      if (level === 'severe') level = 'high'
      if (level === 'moderate') level = 'medium'
      if (level === 'mild') level = 'low'

      // Add highlighted segment (mark as dismissed if applicable)
      segments.push({
        text: item.sentence,
        type: item.isDismissed ? 'dismissed' : 'highlight',
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
  }, [analysis, value, dismissedSuggestions])

  // Handle click on highlighted text
  const handleHighlightClick = useCallback((segment, event, index) => {
    const rect = event.currentTarget.getBoundingClientRect()
    
    setActiveHighlightIndex(index)
    setActiveTooltip({
      targetRect: rect,
      suggestions: segment.suggestions,
      level: segment.level,
      originalText: segment.text
    })
  }, [])

  // Apply suggestion with undo support
  const handleApplySuggestion = useCallback((rewrittenText) => {
    if (!activeTooltip) return
    
    // Save current state to undo stack
    setUndoStack(prev => [...prev.slice(-19), { text: value, timestamp: Date.now() }])
    setRedoStack([]) // Clear redo stack on new change
    
    const newValue = value.replace(activeTooltip.originalText, rewrittenText)
    onChange(newValue)
    
    // Close tooltip after applying
    setActiveTooltip(null)
    setActiveHighlightIndex(-1)
    
    console.log('✅ Suggestion applied:', activeTooltip.originalText.substring(0, 30), '→', rewrittenText.substring(0, 30))
  }, [activeTooltip, value, onChange])

  // Dismiss suggestion (ignore this highlight)
  const handleDismissSuggestion = useCallback(() => {
    if (!activeTooltip) return
    
    setDismissedSuggestions(prev => new Set([...prev, activeTooltip.originalText]))
    setActiveTooltip(null)
    setActiveHighlightIndex(-1)
    
    console.log('🚫 Suggestion dismissed:', activeTooltip.originalText.substring(0, 30))
  }, [activeTooltip])

  const segments = parseTextSegments()

  return (
    <div className="text-highlight-editor" ref={editorRef}>
      <div 
        className={`highlight-editor-wrapper ${isProcessing ? 'processing-active' : ''} ${showRewriteToolbar ? 'with-toolbar' : ''}`}
      >
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

              // Dismissed segments show with strikethrough style
              if (segment.type === 'dismissed') {
                return (
                  <span 
                    key={index} 
                    className="highlight-text-dismissed"
                    style={{ opacity: 0.5, textDecoration: 'line-through' }}
                  >
                    {segment.text}
                  </span>
                )
              }

              // Track highlight index for keyboard navigation
              const highlightIndex = segments.slice(0, index).filter(s => s.type === 'highlight').length

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

              const isActive = activeHighlightIndex === highlightIndex

              return (
                <span
                  key={index}
                  ref={el => highlightRefs.current[highlightIndex] = el}
                  className={`highlight-text-marked level-${segment.level} ${isActive ? 'active' : ''}`}
                  onClick={(e) => handleHighlightClick(segment, e, highlightIndex)}
                  title={`${segment.suggestions.issues_found} vấn đề - Click để xem (Tab để chuyển)`}
                  style={{
                    backgroundColor: bgColor,
                    transition: 'none',
                    animation: 'none',
                    transform: 'none',
                    filter: 'none',
                    boxShadow: isActive ? '0 0 0 2px var(--primary-color)' : 'none',
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
          ref={textareaRef}
          className={`highlight-editor-input ${scrollbarClassName} ${isProcessing ? 'processing-shimmer' : ''}`}
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
          onDismiss={handleDismissSuggestion}
          onClose={() => {
            setActiveTooltip(null)
            setActiveHighlightIndex(-1)
          }}
          canUndo={undoStack.length > 0}
          onUndo={handleUndo}
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
