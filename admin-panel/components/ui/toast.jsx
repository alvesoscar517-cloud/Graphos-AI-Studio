/**
 * Toast notifications using Sonner
 * Lightweight, accessible toast notifications
 */

import { Toaster, toast } from 'sonner'

/**
 * Toast container - add this to your app root
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={4000}
      gap={10}
      toastOptions={{
        style: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
          borderRadius: '14px',
          padding: '14px 16px',
          fontSize: '14px',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
        },
        className: 'admin-toast',
      }}
    />
  )
}

/**
 * Toast utility functions
 */
export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, {
      ...options,
    })
  },

  error: (message, options = {}) => {
    toast.error(message, {
      duration: 5000,
      ...options,
    })
  },

  warning: (message, options = {}) => {
    toast.warning(message, {
      ...options,
    })
  },

  info: (message, options = {}) => {
    toast.info(message, {
      ...options,
    })
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...options,
    })
  },

  promise: (promise, messages, options = {}) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Đang xử lý...',
      success: messages.success || 'Thành công!',
      error: messages.error || 'Có lỗi xảy ra',
      ...options,
    })
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId)
  },

  dismissAll: () => {
    toast.dismiss()
  },
}

export { toast }
export default ToastProvider
