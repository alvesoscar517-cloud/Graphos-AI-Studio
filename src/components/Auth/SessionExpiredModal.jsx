/**
 * Session Expired Modal
 * Shows when user's session has expired and needs to re-login
 * Note: Will not show if ErrorBoundary is actively displaying an error
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useErrorBoundaryState } from '../../contexts/ErrorBoundaryContext'

export function SessionExpiredModal() {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState('')
  const { hasActiveError } = useErrorBoundaryState()

  useEffect(() => {
    const handleSessionExpired = (event) => {
      setMessage(event.detail?.message || t('auth.sessionExpired', 'Your session has expired. Please sign in again.'))
      setIsVisible(true)
    }

    window.addEventListener('sessionExpired', handleSessionExpired)
    return () => window.removeEventListener('sessionExpired', handleSessionExpired)
  }, [t])

  // Don't show modal if ErrorBoundary is displaying an error
  // This allows users to report errors before being redirected to login
  const shouldShow = isVisible && !hasActiveError

  const handleClose = () => {
    setIsVisible(false)
    // Reload to show login screen
    window.location.reload()
  }

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4"
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
              {t('auth.sessionExpiredTitle', 'Session Expired')}
            </h3>

            {/* Message */}
            <p className="text-sm text-center text-gray-500 mb-6">
              {message}
            </p>

            {/* Button */}
            <button
              onClick={handleClose}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              {t('auth.signInAgain', 'Sign In Again')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SessionExpiredModal
