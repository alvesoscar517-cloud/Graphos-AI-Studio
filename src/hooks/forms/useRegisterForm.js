/**
 * Register Form Hook
 * React Hook Form + Zod validation with password strength
 */

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, validatePasswordStrength } from '@/lib/validations'

/**
 * Custom hook for registration form management
 * @param {Function} onSubmit - Callback when form is submitted successfully
 */
export function useRegisterForm(onSubmit) {
  const [showPassword, setShowPassword] = useState(false)
  
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
    },
    mode: 'onChange',
  })

  const password = form.watch('password')
  
  // Calculate password strength
  const passwordStrength = useMemo(() => {
    return validatePasswordStrength(password)
  }, [password])

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...submitData } = data
      await onSubmit(submitData)
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Registration failed. Please try again.',
      })
    }
  })

  const togglePassword = () => setShowPassword(prev => !prev)

  // Get strength level label
  const getStrengthLevel = (score) => {
    if (score >= 5) return 'strong'
    if (score >= 4) return 'good'
    if (score >= 3) return 'fair'
    return 'weak'
  }

  return {
    ...form,
    handleSubmit,
    isLoading: form.formState.isSubmitting,
    errors: form.formState.errors,
    rootError: form.formState.errors.root?.message,
    showPassword,
    togglePassword,
    // Password strength
    passwordStrength: {
      ...passwordStrength,
      level: getStrengthLevel(passwordStrength.score),
      percentage: Math.min(100, passwordStrength.score * 20),
    },
  }
}

export default useRegisterForm
