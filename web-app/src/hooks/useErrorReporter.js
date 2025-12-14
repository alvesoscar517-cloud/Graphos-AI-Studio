/**
 * useErrorReporter Hook
 * Provides easy error reporting functionality throughout the app
 * 
 * Usage:
 * const { reportError, showErrorWithReport } = useErrorReporter()
 * 
 * // Report silently (no toast)
 * reportError(error, 'Context info')
 * 
 * // Show toast with report button
 * showErrorWithReport('Something went wrong', error)
 */

import { useCallback } from 'react'
import { useSendErrorReport } from '@/hooks/queries'
import { useToasts } from '@/stores/uiStore'

// Storage key for tracking reported errors
const REPORTED_ERRORS_KEY = 'graphos_reported_errors'

/**
 * Generate a hash from error to prevent duplicate reports
 */
function generateErrorHash(error) {
  const errorString = `${error?.name || 'Error'}:${error?.message || 'Unknown'}`
  try {
    return btoa(errorString).slice(0, 32)
  } catch {
    return errorString.slice(0, 32).replace(/[^a-zA-Z0-9]/g, '_')
  }
}

/**
 * Check if error was already reported
 */
function isErrorAlreadyReported(errorHash) {
  try {
    const reported = JSON.parse(localStorage.getItem(REPORTED_ERRORS_KEY) || '[]')
    return reported.includes(errorHash)
  } catch {
    return false
  }
}

export function useErrorReporter() {
  const sendErrorReport = useSendErrorReport()
  const { showError } = useToasts()

  /**
   * Report an error silently (no UI feedback)
   * Useful for background error reporting
   */
  const reportError = useCallback(async (error, context = '') => {
    if (!error) return { success: false, reason: 'no_error' }

    const errorObj = typeof error === 'string' ? new Error(error) : error
    const errorHash = generateErrorHash(errorObj)

    // Check if already reported
    if (isErrorAlreadyReported(errorHash)) {
      return { success: true, alreadyReported: true }
    }

    try {
      const result = await sendErrorReport.mutateAsync({
        error: errorObj,
        url: window.location.href,
        componentStack: context ? `Context: ${context}` : undefined
      })
      return { success: true, ...result }
    } catch (err) {
      console.error('Failed to report error:', err)
      return { success: false, reason: 'send_failed' }
    }
  }, [sendErrorReport])

  /**
   * Show error toast with report button
   * The toast will include a mini report button
   */
  const showErrorWithReport = useCallback((message, error, context = '') => {
    const errorObj = error instanceof Error ? error : new Error(error || message)
    showError(message, { 
      error: errorObj, 
      context,
      duration: 8000 // Longer duration for errors with report button
    })
  }, [showError])

  /**
   * Report error and show success feedback
   * Useful when user explicitly wants to report
   */
  const reportAndNotify = useCallback(async (error, context = '') => {
    const result = await reportError(error, context)
    // Could show a success toast here if needed
    return result
  }, [reportError])

  return {
    reportError,
    showErrorWithReport,
    reportAndNotify,
    isReporting: sendErrorReport.isPending
  }
}

export default useErrorReporter
