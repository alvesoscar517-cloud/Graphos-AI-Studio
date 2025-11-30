import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { userEditSchema } from '@/lib/validations'

/**
 * Custom hook for user edit form management
 * @param {object} user - Initial user data
 * @param {Function} onSubmit - Callback function when form is submitted successfully
 * @returns {object} Form methods and state
 */
export function useUserEditForm(user, onSubmit) {
  const form = useForm({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      displayName: '',
      email: '',
      role: 'user',
      status: 'active',
    },
    mode: 'onBlur',
  })

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || '',
        email: user.email || '',
        role: user.role || 'user',
        status: user.status || 'active',
      })
    }
  }, [user, form])

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data)
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Update failed. Please try again.',
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

export default useUserEditForm
