/**
 * Error Page Component
 * Beautiful error page with ghost icon for app-wide error handling
 * Note: This component does NOT use React Router hooks because it may render
 * outside of Router context (e.g., when ErrorBoundary catches errors at app level)
 */

import { useTranslation } from 'react-i18next'
import ghostIcon from '../../../icon for background/ghost-with-raised-arms.svg'

const ErrorPage = ({ 
  error, 
  onRetry, 
  showHomeButton = true,
  showBackButton = true,
  showReloadButton = true,
  title,
  message 
}) => {
  const { t } = useTranslation()

  const handleGoHome = () => {
    // Use window.location instead of navigate() to avoid Router dependency
    window.location.href = '/'
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      handleGoHome()
    }
  }

  const handleReload = () => {
    window.location.reload()
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
            className="w-full h-full object-contain"
          />
        </div>

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

        {/* Action Buttons - 3 buttons in a row */}
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

          {showBackButton && (
            <button 
              className="inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-medium rounded-lg cursor-pointer transition-all bg-bg-secondary text-text-primary border border-border-light hover:bg-bg-hover active:scale-[0.98]"
              onClick={handleGoBack}
            >
              <img src="/icon/arrow-left.svg" alt="" className="w-4 h-4 opacity-70 icon-invert" />
              {t('errorPage.goBack', 'Go Back')}
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
