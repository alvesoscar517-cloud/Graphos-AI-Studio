import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  getTextStats,
  validateTextForModel,
  recommendModel,
  estimateCredits,
  splitTextForModel,
  MODEL_LIMITS
} from '../utils/tokenUtils'

/**
 * Hook to manage text stats and validation for AI features
 * 
 * @param {string} text - Text content
 * @param {object} options - Configuration options
 * @returns {TextStatsHook}
 */
export function useTextStats(text, options = {}) {
  const {
    model = 'gemini-2.5-flash',
    task = 'rewrite',
    debounceMs = 300,
    autoValidate = true
  } = options

  const [debouncedText, setDebouncedText] = useState(text)

  // Debounce text changes to avoid excessive calculations
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(text)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [text, debounceMs])

  // Calculate stats (memoized)
  const stats = useMemo(() => {
    return getTextStats(debouncedText)
  }, [debouncedText])

  // Validation result
  const validation = useMemo(() => {
    if (!autoValidate) return null
    return validateTextForModel(debouncedText, model)
  }, [debouncedText, model, autoValidate])

  // Model recommendation
  const modelRecommendation = useMemo(() => {
    return recommendModel(debouncedText, { task })
  }, [debouncedText, task])

  // Credits estimate
  const credits = useMemo(() => {
    return estimateCredits(debouncedText, model, task)
  }, [debouncedText, model, task])

  // Helper: Check if text is too long
  const isTooLong = useMemo(() => {
    const limits = MODEL_LIMITS[model] || MODEL_LIMITS['gemini-2.5-flash']
    return stats.chars > limits.recommendedMaxChars
  }, [stats.chars, model])

  // Helper: Check if text is empty or too short
  const isTooShort = stats.chars < 10

  // Helper: Get chunks if needed
  const getChunks = useCallback(() => {
    return splitTextForModel(debouncedText, model)
  }, [debouncedText, model])

  // Status indicator
  const status = useMemo(() => {
    if (isTooShort) return 'empty'
    if (validation?.errors?.length > 0) return 'error'
    if (validation?.warnings?.length > 0) return 'warning'
    if (isTooLong) return 'long'
    return 'ok'
  }, [isTooShort, isTooLong, validation])

  return {
    // Basic stats
    stats,
    chars: stats.chars,
    words: stats.words,
    tokens: stats.tokens,
    pages: stats.pages,
    language: stats.language,
    
    // Validation
    validation,
    isValid: validation?.valid ?? true,
    errors: validation?.errors || [],
    warnings: validation?.warnings || [],
    
    // Recommendations
    modelRecommendation,
    recommendedModel: modelRecommendation.model,
    
    // Credits
    credits,
    estimatedCredits: credits.display,
    
    // Helpers
    isTooLong,
    isTooShort,
    status,
    getChunks,
    
    // Display string
    displayStats: stats.display
  }
}

/**
 * Simple hook to display stats only (no validation)
 */
export function useSimpleTextStats(text) {
  return useMemo(() => getTextStats(text), [text])
}

export default useTextStats
