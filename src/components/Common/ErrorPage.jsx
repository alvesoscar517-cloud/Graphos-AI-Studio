/**
 * Error Page Component
 * Beautiful error page with ghost icon for app-wide error handling
 */

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
    window.location.reload()
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
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
    <div className="flex items-center justify-center min-h-screen w-full p-6 bg-bg-primary box-border">
      <div className="flex flex-col items-center text-center max-w-[480px] w-full py-12 px-8 bg-bg-secondary rounded-3xl border border-border-light shadow-lg">
        
        {/* Ghost Icon */}
        <div className="w-40 h-40 mb-8">
          <img 
            src={ghostIcon} 
            alt="Error" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-text-primary m-0 mb-3 leading-tight">
          {errorTitle}
        </h1>

        {/* Error Message */}
        <p className="text-base text-text-secondary m-0 mb-8 leading-relaxed max-w-[360px]">
          {errorMessage}
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && error?.stack && (
          <details className="w-full mb-6 text-left">
            <summary className="text-sm text-text-muted cursor-pointer py-2 px-3 bg-bg-tertiary rounded-lg transition-colors hover:bg-bg-hover">
              {t('errorPage.technicalDetails', 'Technical Details')}
            </summary>
            <pre className="text-xs text-text-muted bg-bg-tertiary p-3 rounded-lg mt-2 overflow-x-auto whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto">
              {error.stack}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {onRetry && (
            <button 
              className="inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl border-none cursor-pointer transition-all min-w-[140px] bg-accent text-white hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-glow-primary active:scale-95"
              onClick={onRetry}
            >
              <img src="/icon/refresh-cw.svg" alt="" className="w-[18px] h-[18px] brightness-0 invert" />
              {t('errorPage.tryAgain', 'Try Again')}
            </button>
          )}
          
          {showReloadButton && !onRetry && (
            <button 
              className="inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl border-none cursor-pointer transition-all min-w-[140px] bg-accent text-white hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-glow-primary active:scale-95"
              onClick={handleReload}
            >
              <img src="/icon/refresh-cw.svg" alt="" className="w-[18px] h-[18px] brightness-0 invert" />
              {t('errorPage.reload', 'Reload Page')}
            </button>
          )}

          {showBackButton && (
            <button 
              className="inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl cursor-pointer transition-all min-w-[140px] bg-bg-tertiary text-text-primary border border-border-light hover:bg-bg-hover hover:border-border-hover hover:-translate-y-0.5 active:scale-95"
              onClick={handleGoBack}
            >
              <img src="/icon/arrow-left.svg" alt="" className="w-[18px] h-[18px] opacity-70 icon-invert" />
              {t('errorPage.goBack', 'Go Back')}
            </button>
          )}

          {showHomeButton && (
            <button 
              className="inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl cursor-pointer transition-all min-w-[140px] bg-bg-tertiary text-text-primary border border-border-light hover:bg-bg-hover hover:border-border-hover hover:-translate-y-0.5 active:scale-95"
              onClick={handleGoHome}
            >
              <img src="/icon/home.svg" alt="" className="w-[18px] h-[18px] opacity-70 icon-invert" />
              {t('errorPage.backToHome', 'Back to Home')}
            </button>
          )}
        </div>

        {/* Help Text */}
        <p className="text-sm text-text-muted m-0">
          {t('errorPage.helpText', 'If the problem persists, please contact support.')}
        </p>
      </div>
    </div>
  )
}

export default ErrorPage
