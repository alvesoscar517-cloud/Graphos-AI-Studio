/**
 * Error Page Component
 * Beautiful error page with ghost icon for app-wide error handling
 * Note: This component does NOT use React Router hooks or QueryClient hooks
 * because it may render outside of those contexts (e.g., when ErrorBoundary catches errors at app level)
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ghostIcon from '../../../icon for background/ghost-with-raised-arms.svg'

// Direct API call for error reporting (no QueryClient dependency)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://graphosai-472729326429.us-central1.run.app'

// Simple hash function for error deduplication
const generateErrorHash = (error) => {
  const str = `${error?.name || ''}:${error?.message || ''}:${(error?.stack || '').slice(0, 200)}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

// Track reported errors in session
const reportedErrors = new Set()

const ErrorPage = ({ 
  error, 
  onRetry, 
  showHomeButton = true,
  showReportButton = true,
  showReloadButton = true,
  title,
  message,
  componentStack
}) => {
  const { t } = useTranslation()
  const [reportStatus, setReportStatus] = useState('idle') // idle | sending | sent | already_reported | error

  // Suppress sessionExpired modal while on error page
  useEffect(() => {
    window.__errorPageActive = true
    window.__clearPendingSessionExpired?.()
    return () => {
      window.__errorPageActive = false
    }
  }, [])

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleReload = () => {
    window.location.reload()
  }

  const handleReportError = async () => {
    if (reportStatus === 'sending' || reportStatus === 'sent' || reportStatus === 'already_reported') return
    
    const errorHash = generateErrorHash(error)
    
    // Check if already reported this session
    if (reportedErrors.has(errorHash)) {
      setReportStatus('already_reported')
      return
    }
    
    setReportStatus('sending')
    try {
      // Get token if available (optional for error reports)
      let token = null
      try {
        token = localStorage.getItem('accessToken')
      } catch {
        // Ignore storage errors
      }
      
      const errorContent = [
        `Error: ${error?.message || 'Unknown error'}`,
        '',
        '--- Stack Trace ---',
        error?.stack || 'No stack trace available',
        '',
        '--- Environment ---',
        `URL: ${window.location.href}`,
        `User Agent: ${navigator.userAgent}`,
        `Timestamp: ${new Date().toISOString()}`,
        `Viewport: ${window.innerWidth}x${window.innerHeight}`,
        componentStack ? `\n--- Component Stack ---\n${componentStack}` : ''
      ].filter(Boolean).join('\n')
      
      const response = await fetch(`${API_BASE_URL}/send-feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          type: 'error_report',
          priority: 'high',
          title: `[Error] ${error?.name || 'Error'}: ${(error?.message || 'Unknown error').slice(0, 80)}`,
          content: errorContent,
          metadata: {
            errorName: error?.name,
            errorMessage: error?.message,
            errorHash,
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send error report')
      }
      
      reportedErrors.add(errorHash)
      setReportStatus('sent')
    } catch (err) {
      console.error('Failed to report error:', err)
      setReportStatus('error')
      setTimeout(() => setReportStatus('idle'), 3000)
    }
  }

  const getReportButtonText = () => {
    switch (reportStatus) {
      case 'sending': return t('errorPage.reporting', 'Reporting...')
      case 'sent': return t('errorPage.reported', 'Reported!')
      case 'already_reported': return t('errorPage.alreadyReported', 'Already Reported')
      case 'error': return t('errorPage.reportFailed', 'Failed')
      default: return t('errorPage.reportError', 'Report Error')
    }
  }

  const errorTitle = title || t('errorPage.title', 'Oops! Something went wrong')
  const errorMessage = message || error?.message || t('errorPage.message', 'An unexpected error occurred. Please try again.')

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4 bg-bg-primary box-border">
      <div className="flex flex-col items-center text-center max-w-[520px] w-full">
        
        {/* Ghost Icon */}
        <div className="w-36 h-36 mb-6">
          <img 
            src={ghostIcon} 
            alt="Error" 
            className="w-full h-full object-contain ghost-icon-invert"
          />
        </div>
        <style>{`
          .ghost-icon-invert {
            opacity: 0.6;
          }
          .dark .ghost-icon-invert,
          [data-theme="dark"] .ghost-icon-invert {
            filter: invert(1) brightness(2);
            opacity: 0.7;
          }
        `}</style>

        {/* Error Title */}
        <h1 className="text-xl font-semibold text-text-primary m-0 mb-2">
          {errorTitle}
        </h1>

        {/* Error Message */}
        <p className="text-sm text-text-secondary m-0 mb-6 leading-relaxed max-w-[400px] px-4">
          {errorMessage}
        </p>

        {/* Error Details (only in development) */}
        {import.meta.env.DEV && error?.stack && (
          <details className="w-full max-w-[400px] mb-5 text-left">
            <summary className="text-xs text-text-muted cursor-pointer py-2 px-3 bg-bg-secondary rounded-lg transition-colors hover:bg-bg-hover">
              {t('errorPage.technicalDetails', 'Technical Details')}
            </summary>
            <pre className="text-xs text-text-muted bg-bg-secondary p-3 rounded-lg mt-2 overflow-x-auto whitespace-pre-wrap break-words max-h-[160px] overflow-y-auto">
              {error.stack}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-nowrap gap-3 justify-center mb-6">
          {onRetry && (
            <button 
              className="inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-medium rounded-lg border-none cursor-pointer transition-all bg-accent text-white hover:bg-accent-hover active:scale-[0.98]"
              onClick={onRetry}
            >
              <img src="/icon/refresh-cw.svg" alt="" className="w-4 h-4 brightness-0 invert" />
              {t('errorPage.tryAgain', 'Try Again')}
            </button>
          )}
          
          {showReloadButton && !onRetry && (
            <button 
              className="inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-medium rounded-lg border-none cursor-pointer transition-all bg-accent text-white hover:bg-accent-hover active:scale-[0.98]"
              onClick={handleReload}
            >
              <img src="/icon/refresh-cw.svg" alt="" className="w-4 h-4 brightness-0 invert" />
              {t('errorPage.tryAgain', 'Try Again')}
            </button>
          )}

          {showReportButton && error && (
            <button 
              className={`inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-medium rounded-lg cursor-pointer transition-all border active:scale-[0.98] ${
                reportStatus === 'sent' || reportStatus === 'already_reported'
                  ? 'bg-system-green/10 text-system-green border-system-green/30 cursor-default'
                  : reportStatus === 'error'
                  ? 'bg-system-red/10 text-system-red border-system-red/30'
                  : 'bg-bg-secondary text-text-primary border-border-light hover:bg-bg-hover'
              }`}
              onClick={handleReportError}
              disabled={reportStatus === 'sending' || reportStatus === 'sent' || reportStatus === 'already_reported'}
            >
              <img 
                src={reportStatus === 'sent' || reportStatus === 'already_reported' ? '/icon/check-circle.svg' : '/icon/flag.svg'} 
                alt="" 
                className={`w-4 h-4 ${
                  reportStatus === 'sent' || reportStatus === 'already_reported' 
                    ? '' 
                    : 'opacity-70 icon-invert'
                }`}
                style={reportStatus === 'sent' || reportStatus === 'already_reported' 
                  ? { filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' } 
                  : reportStatus === 'error'
                  ? { filter: 'invert(31%) sepia(98%) saturate(7483%) hue-rotate(359deg) brightness(103%) contrast(107%)' }
                  : {}
                }
              />
              {getReportButtonText()}
            </button>
          )}

          {showHomeButton && (
            <button 
              className="inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-medium rounded-lg cursor-pointer transition-all bg-bg-secondary text-text-primary border border-border-light hover:bg-bg-hover active:scale-[0.98]"
              onClick={handleGoHome}
            >
              <img src="/icon/home.svg" alt="" className="w-4 h-4 opacity-70 icon-invert" />
              {t('errorPage.backToHome', 'Back to Home')}
            </button>
          )}
        </div>

        {/* Help Text with Support Email */}
        <p className="text-xs text-text-muted m-0">
          {t('errorPage.helpText', 'If the problem persists, please contact')}{' '}
          <a 
            href="mailto:Support@graphosai.com" 
            className="text-accent hover:underline"
          >
            Support@graphosai.com
          </a>
        </p>
      </div>
    </div>
  )
}

export default ErrorPage
