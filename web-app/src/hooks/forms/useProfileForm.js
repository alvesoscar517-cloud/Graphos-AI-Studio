/**
 * Profile Form Hook
 * React Hook Form + Zod validation for voice profiles
 * 
 * NOTE: This hook is currently NOT USED in the codebase.
 * Profile editing is handled via ProfileSetup wizard.
 * Kept for potential future use in inline profile editing.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { profileSchema } from '@/lib/validations'

/**
 * Custom hook for profile form management
 * @param {object} profile - Initial profile data (for editing)
 * @param {Function} onSubmit - Callback when form is submitted successfully
 */
export function useProfileForm(profile, onSubmit) {
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      description: '',
      writingStyle: '',
      tone: '',
      expertise: [],
    },
    mode: 'onBlur',
  })

  // Reset form when profile data changes (edit mode)
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        description: profile.description || '',
        writingStyle: profile.writing_style || profile.writingStyle || '',
        tone: profile.tone || '',
        expertise: profile.expertise || [],
      })
    }
  }, [profile, form])

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data)
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Failed to save profile. Please try again.',
      })
    }
  })

  return {
    ...form,
    handleSubmit,
    isLoading: form.formState.isSubmitting,
    isDirty: form.formState.isDirty,
    errors: form.formState.errors,
    rootError: form.formState.errors.root?.message,
  }
}

export default useProfileForm
