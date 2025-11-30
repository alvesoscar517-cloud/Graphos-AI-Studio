/**
 * Toast hook for easy access to toast notifications
 * Uses Sonner under the hood
 */

import { showToast } from '@/components/ui/toast'

/**
 * Hook to access toast notifications
 * @returns {object} Toast methods
 */
export function useToast() {
  return {
    success: showToast.success,
    error: showToast.error,
    warning: showToast.warning,
    info: showToast.info,
    loading: showToast.loading,
    promise: showToast.promise,
    dismiss: showToast.dismiss,
    dismissAll: showToast.dismissAll,
    
    // Alias for compatibility with existing code
    notify: {
      success: showToast.success,
      error: showToast.error,
      warning: showToast.warning,
      info: showToast.info,
    },
  }
}

export default useToast
