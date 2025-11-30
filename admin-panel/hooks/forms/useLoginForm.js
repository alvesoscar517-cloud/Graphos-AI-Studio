import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validations'

/**
 * Custom hook for login form management
 * @param {Function} onSubmit - Callback function when form is submitted successfully
 * @returns {object} Form methods and state
 */
export function useLoginForm(onSubmit) {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur', // Validate on blur
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data)
    } catch (error) {
      // Set form-level error
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Login failed. Please try again.',
      })
    }
  })

  return {
    ...form,
    handleSubmit,
    // Convenience getters
    isLoading: form.formState.isSubmitting,
    errors: form.formState.errors,
    rootError: form.formState.errors.root?.message,
  }
}

export default useLoginForm
