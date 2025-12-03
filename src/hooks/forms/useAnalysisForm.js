/**
 * Analysis Form Hook
 * React Hook Form + Zod validation for text analysis input
 * 
 * NOTE: This hook is currently NOT USED in the codebase.
 * Kept for potential future use in analysis input forms.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { analysisInputSchema } from '@/lib/validations'

/**
 * Custom hook for analysis input form
 * @param {Function} onSubmit - Callback when form is submitted
 * @param {Object} options - Additional options
 */
export function useAnalysisForm(onSubmit, options = {}) {
  const { defaultText = '' } = options

  const form = useForm({
    resolver: zodResolver(analysisInputSchema),
    defaultValues: {
      text: defaultText,
    },
    mode: 'onChange',
  })

  const text = form.watch('text')
  const charCount = text?.length || 0
  const wordCount = text?.trim().split(/\s+/).filter(Boolean).length || 0

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data)
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Analysis failed. Please try again.',
      })
    }
  })

  const clearText = () => {
    form.reset({ text: '' })
  }

  return {
    ...form,
    handleSubmit,
    isLoading: form.formState.isSubmitting,
    errors: form.formState.errors,
    rootError: form.formState.errors.root?.message,
    charCount,
    wordCount,
    clearText,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
  }
}

export default useAnalysisForm
