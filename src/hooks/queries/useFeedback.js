/**
 * Feedback Query Hook
 * TanStack Query hook for feedback, billing support, and error reports
 * 
 * User info is fetched from server (Firestore) via authenticated request
 */

import { useMutation } from '@tanstack/react-query'
import { getValidToken } from '@/services/tokenService'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://graphosai-472729326429.us-central1.run.app'

// Local storage key for tracking reported errors
const REPORTED_ERRORS_KEY = 'graphos_reported_errors'

/**
 * Generate a hash from error to prevent duplicate reports
 */
function generateErrorHash(error) {
  const errorString = `${error?.name || 'Error'}:${error?.message || 'Unknown'}`
  // Simple hash - take first 32 chars of base64 encoded string
  try {
    return btoa(errorString).slice(0, 32)
  } catch {
    // Fallback for non-ASCII characters
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

/**
 * Mark error as reported
 */
function markErrorAsReported(errorHash) {
  try {
    const reported = JSON.parse(localStorage.getItem(REPORTED_ERRORS_KEY) || '[]')
    if (!reported.includes(errorHash)) {
      // Keep only last 100 error hashes to prevent localStorage bloat
      const updated = [...reported, errorHash].slice(-100)
      localStorage.setItem(REPORTED_ERRORS_KEY, JSON.stringify(updated))
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * @typedef {Object} FeedbackData
 * @property {string} title
 * @property {string} content
 * @property {string[]} [images]
 */

/**
 * @typedef {Object} BillingSupportData
 * @property {string} category
 * @property {string} subject
 * @property {string} description
 * @property {string[]} [attachments]
 */

/**
 * Send general feedback
 * Server will get user info from auth token
 */
export function useSendFeedback() {
  return useMutation({
    /** @param {FeedbackData} data */
    mutationFn: async (data) => {
      const { title, content, images = [] } = data
      // Get auth token for server to identify user
      const token = await getValidToken()
      
      const response = await fetch(`${API_BASE_URL}/send-feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          title,
          content,
          images
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send feedback')
      }

      return result
    },
  })
}

/**
 * Send billing support request
 * Server will get user info from auth token
 */
export function useSendBillingSupport() {
  return useMutation({
    /** @param {BillingSupportData} data */
    mutationFn: async (data) => {
      const { category, subject, description, attachments = [] } = data
      // Get auth token for server to identify user
      const token = await getValidToken()
      
      const response = await fetch(`${API_BASE_URL}/send-feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          type: 'billing_support',
          category,
          priority: 'high',
          title: subject,
          content: description,
          images: attachments
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send support request')
      }

      return result
    },
  })
}

/**
 * @typedef {Object} ErrorReportData
 * @property {Error} error - The error object
 * @property {string} [url] - Current URL where error occurred
 * @property {string} [componentStack] - React component stack if available
 */

/**
 * Send error report
 * Automatically prevents duplicate reports for the same error
 */
export function useSendErrorReport() {
  return useMutation({
    /** @param {ErrorReportData} data */
    mutationFn: async (data) => {
      const { error, url, componentStack } = data
      
      // Generate hash to check for duplicates
      const errorHash = generateErrorHash(error)
      
      // Check if already reported
      if (isErrorAlreadyReported(errorHash)) {
        return { success: true, alreadyReported: true }
      }
      
      // Get auth token for server to identify user
      const token = await getValidToken()
      
      // Build error content with useful debugging info
      const errorContent = [
        `Error: ${error?.message || 'Unknown error'}`,
        '',
        '--- Stack Trace ---',
        error?.stack || 'No stack trace available',
        '',
        '--- Environment ---',
        `URL: ${url || window.location.href}`,
        `User Agent: ${navigator.userAgent}`,
        `Timestamp: ${new Date().toISOString()}`,
        `Viewport: ${window.innerWidth}x${window.innerHeight}`,
        componentStack ? `\n--- Component Stack ---\n${componentStack}` : ''
      ].filter(Boolean).join('\n')
      
      const response = await fetch(`${API_BASE_URL}/send-feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          type: 'error_report',
          priority: 'high',
          title: `[Error] ${error?.name || 'Error'}: ${(error?.message || 'Unknown error').slice(0, 80)}`,
          content: errorContent,
          metadata: {
            errorName: error?.name,
            errorMessage: error?.message,
            errorHash,
            url: url || window.location.href,
            userAgent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: new Date().toISOString()
          }
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send error report')
      }

      // Mark as reported to prevent duplicates
      markErrorAsReported(errorHash)

      return { ...result, alreadyReported: false }
    },
  })
}

export default useSendFeedback
