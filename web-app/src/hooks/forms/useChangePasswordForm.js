/**
 * Change Password Form Hook
 * React Hook Form + Zod validation
 * 
 * Used by: ChangePasswordV2 component
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordSchema } from '@/lib/validations'

/**
 * Custom hook for change password form management
 * @param {Function} onSubmit - Callback when form is submitted successfully
 */
export function useChangePasswordForm(onSubmit) {
  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur', // Validate when user leaves the field
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const { confirmPassword, ...submitData } = data
      await onSubmit(submitData)
      form.reset() // Clear form on success
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Failed to change password. Please try again.',
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

export default useChangePasswordForm
