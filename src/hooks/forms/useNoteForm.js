/**
 * Note Form Hook
 * React Hook Form + Zod validation for notes
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { noteSchema } from '@/lib/validations'

/**
 * Custom hook for note form management
 * @param {Function} onSubmit - Callback when form is submitted
 * @param {Object} defaultValues - Initial values for editing
 */
export function useNoteForm(onSubmit, defaultValues = {}) {
  const form = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: defaultValues.title || '',
      content: defaultValues.content || '',
      type: defaultValues.type || 'Note',
    },
    mode: 'onBlur',
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data)
      if (!defaultValues.id) {
        form.reset() // Reset only for new notes
      }
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Failed to save note.',
      })
    }
  })

  return {
    ...form,
    handleSubmit,
    isLoading: form.formState.isSubmitting,
    errors: form.formState.errors,
    rootError: form.formState.errors.root?.message,
    isDirty: form.formState.isDirty,
  }
}

export default useNoteForm
