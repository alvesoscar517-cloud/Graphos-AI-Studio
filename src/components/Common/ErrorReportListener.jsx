/**
 * Error Report Listener Component
 * Listens for error report events from non-React code (like modal.js)
 * and handles the actual error reporting using React hooks
 */

import { useEffect } from 'react'
import { useSendErrorReport } from '@/hooks/queries'

export function ErrorReportListener() {
  const sendErrorReport = useSendErrorReport()

  useEffect(() => {
    const handleReportError = async (event) => {
      const { error, context } = event.detail || {}
      
      if (!error) return

      try {
        await sendErrorReport.mutateAsync({
          error,
          url: window.location.href,
          componentStack: context ? `Context: ${context}` : undefined
        })
      } catch (err) {
        console.error('Failed to report error via listener:', err)
      }
    }

    window.addEventListener('report-error', handleReportError)
    
    return () => {
      window.removeEventListener('report-error', handleReportError)
    }
  }, [sendErrorReport])

  // This component doesn't render anything
  return null
}

export default ErrorReportListener
