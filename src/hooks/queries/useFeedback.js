/**
 * Feedback Query Hook
 * TanStack Query hook for feedback and billing support
 * 
 * User info is fetched from server (Firestore) via authenticated request
 */

import { useMutation } from '@tanstack/react-query'
import { getValidToken } from '@/services/tokenService'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://graphosai-472729326429.us-central1.run.app'

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

export default useSendFeedback
