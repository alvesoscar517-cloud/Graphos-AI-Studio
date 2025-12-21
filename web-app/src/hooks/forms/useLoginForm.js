/**
 * Login Form Hook
 * React Hook Form + Zod validation
 * Supports auto-fill remembered email (like Google, GitHub, Facebook)
 * 
 * UX Flow (giống các ứng dụng lớn):
 * - Email: LUÔN được lưu và hiển thị sẵn khi quay lại
 * - Password: Browser auto-fill (nếu user cho phép browser lưu)
 * - Remember me: Nếu tick = tự động đăng nhập, không tick = chỉ hiển thị email
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
  // Lấy email đã nhớ để auto-fill (giống Google, GitHub, Facebook)
  // Email LUÔN được lưu sau mỗi lần đăng nhập thành công
  const rememberedEmail = getRememberedEmail()
  
  // Chỉ tự động tick "Remember me" nếu user đã từng chọn option này
  // Không tự động tick chỉ vì có email được nhớ
  const wasRememberMeEnabled = isRememberMeEnabled()

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: rememberedEmail || '',
      password: '',
      rememberMe: wasRememberMeEnabled, // Chỉ tick nếu user đã từng chọn
    },
    mode: 'onBlur', // Validate when user leaves the field (not while typing)
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
    submitCount: form.formState.submitCount,
  }
}

export default useLoginForm
