/**
 * Login Form Hook
 * React Hook Form + Zod validation
 * Supports auto-fill remembered email (like Google, GitHub, Facebook)
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validations'
import { getRememberedEmail, isRememberMeEnabled } from '@/utils/authStorage'

/**
 * Custom hook for login form management
 * @param {Function} onSubmit - Callback when form is submitted successfully
 */
export function useLoginForm(onSubmit) {
  // Lấy email đã nhớ để auto-fill (giống Google, GitHub)
  const rememberedEmail = getRememberedEmail()
  const wasRemembered = isRememberMeEnabled() || !!rememberedEmail

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: rememberedEmail || '',
      password: '',
      rememberMe: wasRemembered, // Tự động tick nếu đã từng remember
    },
    mode: 'onBlur',
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data)
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Login failed. Please try again.',
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

export default useLoginForm
