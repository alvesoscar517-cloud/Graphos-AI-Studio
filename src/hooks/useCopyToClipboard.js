/**
 * useCopyToClipboard Hook
 * Easy clipboard operations with feedback
 */

import { useState, useCallback } from 'react'

/**
 * Hook for copying text to clipboard
 * @param {number} resetDelay - Delay in ms before resetting copied state (default: 2000)
 * @returns {Object} - { copy, copied, error }
 */
export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  const copy = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      setError(new Error('Clipboard not supported'))
      return false
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setError(null)
      
      // Reset after delay
      setTimeout(() => setCopied(false), resetDelay)
      return true
    } catch (err) {
      setError(err)
      setCopied(false)
      return false
    }
  }, [resetDelay])

  const reset = useCallback(() => {
    setCopied(false)
    setError(null)
  }, [])

  return { copy, copied, error, reset }
}

export default useCopyToClipboard
