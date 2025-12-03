/**
 * Feedback Form Component
 * Uses React Hook Form + Zod + TanStack Query
 */

import { useFeedbackForm } from '@/hooks/forms'
import { useSendFeedback } from '@/hooks/queries'
import { useToasts } from '@/stores/uiStore'
import { useUser } from '@/stores/authStore'

export function FeedbackForm({ onSuccess, onCancel }) {
  const user = useUser()
  const { showSuccess, showError } = useToasts()
  const sendFeedback = useSendFeedback()

  const handleSubmit = async (data) => {
    try {
      await sendFeedback.mutateAsync({
        title: data.subject,
        content: data.message,
        images: [],
      })
      showSuccess('Thank you for your feedback!')
      onSuccess?.()
    } catch (error) {
      showError(error.message)
      throw error
    }
  }

  const {
    register,
    handleSubmit: onSubmit,
    errors,
    isLoading: formLoading,
    rootError,
  } = useFeedbackForm(handleSubmit, { defaultEmail: user?.email || '' })

  const isLoading = formLoading || sendFeedback.isPending

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Type */}
      <div>
        <label className="block text-sm font-medium mb-1">Feedback Type</label>
        <select
          {...register('type')}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="general">General Feedback</option>
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Request</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium mb-1">Subject</label>
        <input
          {...register('subject')}
          placeholder="Brief description"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium mb-1">Message</label>
        <textarea
          {...register('message')}
          placeholder="Tell us more..."
          rows={5}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>

      {/* Email (optional) */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Email (optional)
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder="your@email.com"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          We'll only use this to follow up on your feedback
        </p>
      </div>

      {/* Root Error */}
      {rootError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {rootError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send Feedback'}
        </button>
      </div>
    </form>
  )
}

export default FeedbackForm
