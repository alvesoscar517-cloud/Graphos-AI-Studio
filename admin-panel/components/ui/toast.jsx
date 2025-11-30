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
      toastOptions={{
        style: {
          fontFamily: 'inherit',
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
