import { logger } from '../../../utils/logger'
import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * useDeviationHighlights - Hook for managing AI deviation highlights in editor
 * Handles analysis data, tooltip state, and dismissed suggestions
 */
export function useDeviationHighlights(editor, analysis, showHighlights = true) {
  const [dismissedSentences, setDismissedSentences] = useState(new Set())
  const [activeTooltip, setActiveTooltip] = useState(null)
  const [hasHighlights, setHasHighlights] = useState(false)
  const lastContentLengthRef = useRef(0)

  /**
   * Parse analysis data and find sentence positions
   */
  const parseHighlights = useCallback((content) => {
    if (!analysis || !content || !analysis.sentence_suggestions) {
      return []
    }

    const highlights = []

    Object.entries(analysis.sentence_suggestions).forEach(([sentence, suggestionData]) => {
      if (suggestionData.issues_found <= 0) return
      if (dismissedSentences.has(sentence)) return

      const position = content.indexOf(sentence)
      if (position === -1) return

      // Determine severity level
      let level = suggestionData.severity || 'low'
      if (!['high', 'medium', 'low', 'mild', 'moderate', 'severe'].includes(level)) {
        const issuesCount = suggestionData.issues_found || 0
        if (issuesCount >= 3) level = 'high'
        else if (issuesCount >= 2) level = 'medium'
        else level = 'low'
      }
      
      // Map API severity to display level
      if (level === 'severe') level = 'high'
      if (level === 'moderate') level = 'medium'
      if (level === 'mild') level = 'low'

      highlights.push({
        sentence,
        position,
        length: sentence.length,
        level,
        suggestions: suggestionData,
        sentenceId: sentence.substring(0, 50), // Use first 50 chars as ID
      })
    })

    // Sort by position
    highlights.sort((a, b) => a.position - b.position)

    return highlights
  }, [analysis, dismissedSentences])

  /**
   * Check if content changed significantly (>10%)
   */
  const checkSignificantChange = useCallback((newLength) => {
    const oldLength = lastContentLengthRef.current
    if (oldLength === 0) {
      lastContentLengthRef.current = newLength
      return false
    }

    const diff = Math.abs(newLength - oldLength)
    const threshold = oldLength * 0.1

    if (diff > threshold) {
      lastContentLengthRef.current = newLength
      return true
    }

    return false
  }, [])

  /**
   * Clear all highlights
   */
  const clearHighlights = useCallback(() => {
    setHasHighlights(false)
    setActiveTooltip(null)
  }, [])

  /**
   * Handle highlight click - show tooltip
   */
  const handleHighlightClick = useCallback((highlight, event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    
    setActiveTooltip({
      targetRect: rect,
      suggestions: highlight.suggestions,
      level: highlight.level,
      originalText: highlight.sentence,
      sentenceId: highlight.sentenceId,
    })
  }, [])

  /**
   * Apply suggestion - replace text
   */
  const handleApplySuggestion = useCallback((rewrittenText, onApply) => {
    if (!activeTooltip || !editor) return

    const content = editor.getText()
    const newContent = content.replace(activeTooltip.originalText, rewrittenText)
    
    // Update editor content
    editor.commands.setContent(newContent, false, { preserveWhitespace: 'full' })
    
    // Close tooltip
    setActiveTooltip(null)
    
    // Call external handler
    onApply?.(newContent)
    
    logger.log('[HIGHLIGHT] Suggestion applied:', activeTooltip.originalText.substring(0, 30), '→', rewrittenText.substring(0, 30))
  }, [activeTooltip, editor])

  /**
   * Dismiss suggestion - prevent future popups
   */
  const handleDismissSuggestion = useCallback(() => {
    if (!activeTooltip) return

    setDismissedSentences(prev => new Set([...prev, activeTooltip.originalText]))
    setActiveTooltip(null)
    
    logger.log('[HIGHLIGHT] Suggestion dismissed:', activeTooltip.originalText.substring(0, 30))
  }, [activeTooltip])

  /**
   * Close tooltip
   */
  const closeTooltip = useCallback(() => {
    setActiveTooltip(null)
  }, [])

  /**
   * Reset dismissed suggestions (when analysis changes)
   */
  const resetDismissed = useCallback(() => {
    setDismissedSentences(new Set())
  }, [])

  // Update highlights when analysis or showHighlights changes
  useEffect(() => {
    if (!editor || !showHighlights) {
      clearHighlights()
      return
    }

    if (!analysis) {
      clearHighlights()
      return
    }

    const content = editor.getText()
    
    // Check for significant content change
    if (checkSignificantChange(content.length)) {
      clearHighlights()
      resetDismissed()
      return
    }

    const highlights = parseHighlights(content)
    setHasHighlights(highlights.length > 0)

    logger.log('[HIGHLIGHT] Found', highlights.length, 'sentences with issues')
  }, [editor, analysis, showHighlights, parseHighlights, clearHighlights, checkSignificantChange, resetDismissed])

  // Reset dismissed when analysis changes
  useEffect(() => {
    if (analysis) {
      resetDismissed()
    }
  }, [analysis, resetDismissed])

  return {
    hasHighlights,
    activeTooltip,
    dismissedSentences,
    parseHighlights,
    handleHighlightClick,
    handleApplySuggestion,
    handleDismissSuggestion,
    closeTooltip,
    clearHighlights,
    resetDismissed,
  }
}

export default useDeviationHighlights
