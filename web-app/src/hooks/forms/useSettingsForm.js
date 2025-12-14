/**
 * Settings Form Hook
 * React Hook Form for user settings
 * 
 * NOTE: This hook is currently NOT USED in the codebase.
 * Kept for potential future use in settings forms.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const settingsSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be at most 50 characters'),
  language: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      marketing: z.boolean().optional(),
    })
    .optional(),
})

/**
 * Custom hook for settings form
 * @param {Function} onSubmit - Callback when form is submitted
 * @param {Object} defaultValues - Initial values
 */
export function useSettingsForm(onSubmit, defaultValues = {}) {
  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      displayName: defaultValues.displayName || '',
      language: defaultValues.language || 'en',
      theme: defaultValues.theme || 'system',
      notifications: {
        email: defaultValues.notifications?.email ?? true,
        push: defaultValues.notifications?.push ?? true,
        marketing: defaultValues.notifications?.marketing ?? false,
      },
    },
    mode: 'onBlur',
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data)
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Failed to save settings.',
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

export default useSettingsForm
