/**
 * Feedback Query Hook
 * TanStack Query hook for feedback and billing support
 */

import { useMutation } from '@tanstack/react-query'

const FEEDBACK_API_URL = 'https://graphosai-472729326429.us-central1.run.app/send-feedback'

/**
 * Send general feedback
 */
export function useSendFeedback() {
  return useMutation({
    mutationFn: async ({ title, content, images = [] }) => {
      const response = await fetch(FEEDBACK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          images,
          userEmail: localStorage.getItem('userEmail') || 'anonymous@user.com',
          userName: localStorage.getItem('userName') || 'Anonymous User'
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
 */
export function useSendBillingSupport() {
  return useMutation({
    mutationFn: async ({ category, subject, description, attachments = [] }) => {
      const response = await fetch(FEEDBACK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'billing_support',
          category,
          priority: 'high',
          title: subject,
          content: description,
          images: attachments,
          userEmail: localStorage.getItem('userEmail') || 'anonymous@user.com',
          userName: localStorage.getItem('userName') || 'Anonymous User'
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
