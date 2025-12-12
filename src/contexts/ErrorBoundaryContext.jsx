/**
 * ErrorBoundaryContext
 * Tracks when an ErrorBoundary is actively displaying an error
 * Used to prevent SessionExpiredModal from overlaying the error page
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ErrorBoundaryContext = createContext({
  hasActiveError: false,
  setActiveError: () => {},
  clearActiveError: () => {},
})

export function ErrorBoundaryProvider({ children }) {
  const [hasActiveError, setHasActiveError] = useState(false)

  const setActiveError = useCallback(() => {
    setHasActiveError(true)
  }, [])

  const clearActiveError = useCallback(() => {
    setHasActiveError(false)
  }, [])

  // Listen for error boundary events (for ErrorBoundary components that may not have context access)
  useEffect(() => {
    const handleErrorBoundaryActive = () => setActiveError()
    const handleErrorBoundaryCleared = () => clearActiveError()

    window.addEventListener('errorBoundaryActive', handleErrorBoundaryActive)
    window.addEventListener('errorBoundaryCleared', handleErrorBoundaryCleared)

    return () => {
      window.removeEventListener('errorBoundaryActive', handleErrorBoundaryActive)
      window.removeEventListener('errorBoundaryCleared', handleErrorBoundaryCleared)
    }
  }, [setActiveError, clearActiveError])

  return (
    <ErrorBoundaryContext.Provider value={{ hasActiveError, setActiveError, clearActiveError }}>
      {children}
    </ErrorBoundaryContext.Provider>
  )
}

export function useErrorBoundaryState() {
  return useContext(ErrorBoundaryContext)
}

export default ErrorBoundaryContext
