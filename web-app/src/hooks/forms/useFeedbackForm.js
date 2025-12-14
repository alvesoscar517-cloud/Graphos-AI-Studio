/**
 * Feedback Form Hook
 * React Hook Form + Zod validation for user feedback
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { feedbackSchema } from '@/lib/validations'

/**
 * Custom hook for feedback form management
 * @param {Function} onSubmit - Callback when form is submitted
 * @param {Object} options - Additional options
 */
export function useFeedbackForm(onSubmit, options = {}) {
  const { defaultEmail = '' } = options

  const form = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: 'general',
      subject: '',
      message: '',
      email: defaultEmail,
    },
    mode: 'onBlur',
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Failed to submit feedback.',
      })
    }
  })

  return {
    ...form,
    handleSubmit,
    isLoading: form.formState.isSubmitting,
    errors: form.formState.errors,
    rootError: form.formState.errors.root?.message,
  }
}

export default useFeedbackForm
