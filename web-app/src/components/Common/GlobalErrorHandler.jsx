/**
 * Global Error Handler Component
 * Catches network errors, offline state, and unhandled promise rejections
 * Displays error page with specific error information and appropriate icons
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/appStore'

// Error types for categorization
const ERROR_TYPES = {
  OFFLINE: 'offline',
  NETWORK: 'network',
  SERVER: 'server',
  TIMEOUT: 'timeout',
  MAINTENANCE: 'maintenance',
  FORBIDDEN: 'forbidden',
  QUOTA: 'quota',
  UNKNOWN: 'unknown'
}

// Icon mapping for each error type
const ERROR_ICONS = {
  [ERROR_TYPES.OFFLINE]: '/icon/wifi-off.svg',
  [ERROR_TYPES.NETWORK]: '/icon/wifi-off.svg',
  [ERROR_TYPES.SERVER]: '/icon/cloud-alert.svg',
  [ERROR_TYPES.TIMEOUT]: '/icon/clock-alert.svg',
  [ERROR_TYPES.MAINTENANCE]: '/icon/construction.svg',
  [ERROR_TYPES.FORBIDDEN]: '/icon/shield-off.svg',
  [ERROR_TYPES.QUOTA]: '/icon/alert-circle.svg',
  [ERROR_TYPES.UNKNOWN]: '/icon/alert-triangle.svg'
}

/**
 * Detect error type from error object
 */
function detectErrorType(error) {
  if (!navigator.onLine) {
    return ERROR_TYPES.OFFLINE
  }

  const message = error?.message?.toLowerCase() || ''
  const code = error?.code?.toLowerCase() || ''

  // Network errors
  if (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('net::err') ||
    code === 'network_error' ||
    (error.name === 'TypeError' && message.includes('fetch'))
  ) {
    return ERROR_TYPES.NETWORK
  }

  // Maintenance mode (503)
  if (error?.status === 503 || code === 'maintenance' || message.includes('maintenance')) {
    return ERROR_TYPES.MAINTENANCE
  }

  // Server errors (5xx)
  if (error?.status >= 500 || code.includes('server')) {
    return ERROR_TYPES.SERVER
  }

  // Forbidden (403)
  if (error?.status === 403 || code === 'forbidden') {
    return ERROR_TYPES.FORBIDDEN
  }

  // Quota exceeded
  if (code === 'quota_exceeded' || message.includes('quota') || message.includes('limit exceeded')) {
    return ERROR_TYPES.QUOTA
  }

  // Timeout errors
  if (
    message.includes('timeout') ||
    message.includes('timed out') ||
    code === 'timeout' ||
    error.name === 'AbortError'
  ) {
    return ERROR_TYPES.TIMEOUT
  }

  return ERROR_TYPES.UNKNOWN
}

/**
 * Check if error should trigger global error page
 */
function shouldShowGlobalError(error) {
  // Don't show for auth errors (handled by SessionExpiredModal)
  if (error?.code === 'auth/session-expired' || error?.status === 401) {
    return false
  }

  // Don't show for validation errors
  if (error?.status === 400 || error?.status === 422) {
    return false
  }

  // Don't show for rate limit (handled locally)
  if (error?.status === 429) {
    return false
  }

  const errorType = detectErrorType(error)

  // Show for network-related and critical errors
  return [
    ERROR_TYPES.OFFLINE,
    ERROR_TYPES.NETWORK,
    ERROR_TYPES.SERVER,
    ERROR_TYPES.TIMEOUT,
    ERROR_TYPES.MAINTENANCE,
    ERROR_TYPES.FORBIDDEN,
    ERROR_TYPES.QUOTA
  ].includes(errorType)
}

export function GlobalErrorHandler({ children }) {
  const { t } = useTranslation()
  const isOnline = useAppStore((state) => state.isOnline)
  const [globalError, setGlobalError] = useState(null)
  const [errorType, setErrorType] = useState(null)

  /**
   * Handle global error
   */
  const handleGlobalError = useCallback((error) => {
    if (!shouldShowGlobalError(error)) {
      return
    }

    const type = detectErrorType(error)
    console.error('[GlobalErrorHandler] Caught error:', type, error)

    setErrorType(type)
    setGlobalError(error)
  }, [])

  /**
   * Clear error and retry
   */
  const handleRetry = useCallback(() => {
    setGlobalError(null)
    setErrorType(null)

    // If was offline, check if back online
    if (!navigator.onLine) {
      // Still offline, show error again after a moment
      setTimeout(() => {
        if (!navigator.onLine) {
          setErrorType(ERROR_TYPES.OFFLINE)
          setGlobalError(new Error('No internet connection'))
        }
      }, 500)
    }
  }, [])

  // Listen for offline state
  useEffect(() => {
    if (!isOnline && !globalError) {
      setErrorType(ERROR_TYPES.OFFLINE)
      setGlobalError(new Error('No internet connection'))
    } else if (isOnline && errorType === ERROR_TYPES.OFFLINE) {
      // Back online, clear error
      setGlobalError(null)
      setErrorType(null)
    }
  }, [isOnline, globalError, errorType])

  // Listen for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      const error = event.reason

      // Only handle network-related errors
      if (shouldShowGlobalError(error)) {
        event.preventDefault() // Prevent default console error
        handleGlobalError(error)
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  }, [handleGlobalError])

  // Listen for custom network error events
  useEffect(() => {
    const handleNetworkError = (event) => {
      handleGlobalError(event.detail?.error || new Error('Network error'))
    }

    window.addEventListener('app:network-error', handleNetworkError)
    return () => window.removeEventListener('app:network-error', handleNetworkError)
  }, [handleGlobalError])

  // Get error title and message based on type
  const getErrorContent = () => {
    switch (errorType) {
      case ERROR_TYPES.OFFLINE:
        return {
          title: t('globalError.offlineTitle', 'No Internet Connection'),
          message: t(
            'globalError.offlineMessage',
            'Please check your internet connection and try again.'
          )
        }
      case ERROR_TYPES.NETWORK:
        return {
          title: t('globalError.networkTitle', 'Connection Error'),
          message: t(
            'globalError.networkMessage',
            'Unable to connect to the server. Please check your network and try again.'
          )
        }
      case ERROR_TYPES.SERVER:
        return {
          title: t('globalError.serverTitle', 'Server Error'),
          message: t(
            'globalError.serverMessage',
            'The server is temporarily unavailable. Please try again later.'
          )
        }
      case ERROR_TYPES.TIMEOUT:
        return {
          title: t('globalError.timeoutTitle', 'Request Timeout'),
          message: t('globalError.timeoutMessage', 'The request took too long. Please try again.')
        }
      case ERROR_TYPES.MAINTENANCE:
        return {
          title: t('globalError.maintenanceTitle', 'Under Maintenance'),
          message: t(
            'globalError.maintenanceMessage',
            'We are performing scheduled maintenance. Please try again in a few minutes.'
          )
        }
      case ERROR_TYPES.FORBIDDEN:
        return {
          title: t('globalError.forbiddenTitle', 'Access Denied'),
          message: t(
            'globalError.forbiddenMessage',
            'You do not have permission to access this resource.'
          )
        }
      case ERROR_TYPES.QUOTA:
        return {
          title: t('globalError.quotaTitle', 'Quota Exceeded'),
          message: t(
            'globalError.quotaMessage',
            'You have exceeded your usage limit. Please upgrade your plan or try again later.'
          )
        }
      default:
        return {
          title: t('errorPage.title', 'Oops! Something went wrong'),
          message:
            globalError?.message ||
            t('errorPage.message', 'An unexpected error occurred. Please try again.')
        }
    }
  }

  // Show error page if there's a global error
  if (globalError) {
    const { title, message } = getErrorContent()
    const icon = ERROR_ICONS[errorType] || ERROR_ICONS[ERROR_TYPES.UNKNOWN]

    return (
      <div className="flex items-center justify-center min-h-screen w-full p-4 bg-bg-primary box-border">
        <div className="flex flex-col items-center text-center max-w-[520px] w-full">
          {/* Error Icon - same style as ErrorPage */}
          <div className="w-36 h-36 mb-6">
            <img src={icon} alt="Error" className="w-full h-full object-contain error-icon-style" />
          </div>
          <style>{`
            .error-icon-style {
              opacity: 0.6;
            }
            .dark .error-icon-style,
            [data-theme="dark"] .error-icon-style {
              filter: invert(1) brightness(2);
              opacity: 0.7;
            }
          `}</style>

          {/* Error Title */}
          <h1 className="text-xl font-semibold text-text-primary m-0 mb-2">{title}</h1>

          {/* Error Message */}
          <p className="text-sm text-text-secondary m-0 mb-6 leading-relaxed max-w-[400px] px-4">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-nowrap gap-3 justify-center mb-6">
            <button
              className="inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-medium rounded-lg border-none cursor-pointer transition-all bg-accent text-white hover:bg-accent-hover active:scale-[0.98]"
              onClick={handleRetry}
            >
              <img src="/icon/refresh-cw.svg" alt="" className="w-4 h-4 brightness-0 invert" />
              {t('errorPage.tryAgain', 'Try Again')}
            </button>

            {errorType !== ERROR_TYPES.OFFLINE && (
              <button
                className="inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-medium rounded-lg cursor-pointer transition-all bg-bg-secondary text-text-primary border border-border-light hover:bg-bg-hover active:scale-[0.98]"
                onClick={() => (window.location.href = '/')}
              >
                <img src="/icon/home.svg" alt="" className="w-4 h-4 opacity-70 icon-invert" />
                {t('errorPage.backToHome', 'Back to Home')}
              </button>
            )}
          </div>

          {/* Help Text */}
          <p className="text-xs text-text-muted m-0">
            {t('errorPage.helpText', 'If the problem persists, please contact')}{' '}
            <a href="mailto:Support@graphosai.com" className="text-accent hover:underline">
              Support@graphosai.com
            </a>
          </p>
        </div>
      </div>
    )
  }

  return children
}

/**
 * Test button component for triggering different error types
 * Only visible in development mode
 */
export function GlobalErrorTestButton() {
  const [isOpen, setIsOpen] = useState(false)

  // Only show in development
  if (!import.meta.env.DEV) {
    return null
  }

  const triggerError = (type) => {
    setIsOpen(false)

    switch (type) {
      case 'offline':
        // Simulate offline by dispatching event
        window.dispatchEvent(
          new CustomEvent('app:network-error', {
            detail: { error: { message: 'No internet connection', code: 'NETWORK_ERROR' } }
          })
        )
        break
      case 'network':
        window.dispatchEvent(
          new CustomEvent('app:network-error', {
            detail: { error: { message: 'Failed to fetch', code: 'NETWORK_ERROR' } }
          })
        )
        break
      case 'server':
        window.dispatchEvent(
          new CustomEvent('app:network-error', {
            detail: { error: { message: 'Server error', code: 'SERVER_ERROR', status: 500 } }
          })
        )
        break
      case 'timeout':
        window.dispatchEvent(
          new CustomEvent('app:network-error', {
            detail: { error: { message: 'Request timeout', code: 'TIMEOUT', name: 'AbortError' } }
          })
        )
        break
      case 'maintenance':
        window.dispatchEvent(
          new CustomEvent('app:network-error', {
            detail: { error: { message: 'Service under maintenance', code: 'MAINTENANCE', status: 503 } }
          })
        )
        break
      case 'forbidden':
        window.dispatchEvent(
          new CustomEvent('app:network-error', {
            detail: { error: { message: 'Access forbidden', code: 'FORBIDDEN', status: 403 } }
          })
        )
        break
      case 'quota':
        window.dispatchEvent(
          new CustomEvent('app:network-error', {
            detail: { error: { message: 'Quota exceeded', code: 'QUOTA_EXCEEDED' } }
          })
        )
        break
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-bg-primary border border-border-light rounded-lg shadow-lg p-2 min-w-[160px]">
          <button
            onClick={() => triggerError('offline')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-bg-hover rounded flex items-center gap-2"
          >
            <img src="/icon/wifi-off.svg" alt="" className="w-4 h-4 icon-invert" />
            Offline
          </button>
          <button
            onClick={() => triggerError('network')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-bg-hover rounded flex items-center gap-2"
          >
            <img src="/icon/cloud-off.svg" alt="" className="w-4 h-4 icon-invert" />
            Network Error
          </button>
          <button
            onClick={() => triggerError('server')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-bg-hover rounded flex items-center gap-2"
          >
            <img src="/icon/cloud-alert.svg" alt="" className="w-4 h-4 icon-invert" />
            Server Error
          </button>
          <button
            onClick={() => triggerError('timeout')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-bg-hover rounded flex items-center gap-2"
          >
            <img src="/icon/clock-alert.svg" alt="" className="w-4 h-4 icon-invert" />
            Timeout
          </button>
          <button
            onClick={() => triggerError('maintenance')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-bg-hover rounded flex items-center gap-2"
          >
            <img src="/icon/construction.svg" alt="" className="w-4 h-4 icon-invert" />
            Maintenance
          </button>
          <button
            onClick={() => triggerError('forbidden')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-bg-hover rounded flex items-center gap-2"
          >
            <img src="/icon/shield-off.svg" alt="" className="w-4 h-4 icon-invert" />
            Forbidden
          </button>
          <button
            onClick={() => triggerError('quota')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-bg-hover rounded flex items-center gap-2"
          >
            <img src="/icon/alert-circle.svg" alt="" className="w-4 h-4 icon-invert" />
            Quota Exceeded
          </button>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-system-red text-white flex items-center justify-center shadow-lg hover:bg-system-red/90 transition-colors"
        title="Test Global Errors"
      >
        <img src="/icon/bug.svg" alt="" className="w-5 h-5 brightness-0 invert" />
      </button>
    </div>
  )
}

export default GlobalErrorHandler
