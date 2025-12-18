/**
 * Forgot Password Form Hook
 * React Hook Form + Zod validation
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/validations'

/**
 * Hook for forgot password (request reset) form
 */
export function useForgotPasswordForm(onSubmit) {
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur', // Validate when user leaves the field
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data.email)
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Failed to send reset email. Please try again.',
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

/**
 * Hook for reset password (with OTP) form
 */
export function useResetPasswordForm(onSubmit) {
  const [showPassword, setShowPassword] = useState(false)
  
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur', // Validate when user leaves the field
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data)
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Failed to reset password. Please try again.',
      })
      throw error // Re-throw to allow parent to handle step changes
    }
  })

  const togglePassword = () => setShowPassword(prev => !prev)

  return {
    ...form,
    handleSubmit,
    isLoading: form.formState.isSubmitting,
    errors: form.formState.errors,
    rootError: form.formState.errors.root?.message,
    showPassword,
    togglePassword,
  }
}

export default useForgotPasswordForm
