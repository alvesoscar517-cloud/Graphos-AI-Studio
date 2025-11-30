import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { notificationSchema } from '@/lib/validations'

/**
 * Custom hook for notification form management
 * @param {object} notification - Initial notification data (for editing)
 * @param {Function} onSubmit - Callback function when form is submitted successfully
 * @returns {object} Form methods and state
 */
export function useNotificationForm(notification, onSubmit) {
  const form = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 'info',
      targetAudience: 'all',
      scheduledAt: '',
    },
    mode: 'onBlur',
  })

  // Reset form when notification data changes (for editing)
  useEffect(() => {
    if (notification) {
      form.reset({
        title: notification.title || '',
        content: notification.content || '',
        type: notification.type || 'info',
        targetAudience: notification.targetAudience || 'all',
        scheduledAt: notification.scheduledAt || '',
      })
    }
  }, [notification, form])

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data)
      // Reset form after successful submission (for create mode)
      if (!notification) {
        form.reset()
      }
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Failed to send notification. Please try again.',
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
    isEditMode: !!notification,
  }
}

export default useNotificationForm
