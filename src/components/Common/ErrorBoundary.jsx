import { Component } from 'react'
import i18n from '../../i18n'
import './ErrorBoundary.css'
import ghostIcon from '../../../icon for background/ghost-with-raised-arms.svg'
import { CONFIG } from '../../utils/config'
import { logError } from '../../utils/errors'

/**
 * Enhanced Error Boundary Component
 * Catches React errors and provides recovery options
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false,
      errorId: null
    }
  }

  static getDerivedStateFromError(error) {
    // Generate error ID for tracking
    const errorId = `err_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`
    return { hasError: true, errorId }
  }

  componentDidCatch(error, errorInfo) {
    // Log error with context
    logError(error, {
      context: 'ErrorBoundary',
      componentStack: errorInfo?.componentStack,
      errorId: this.state.errorId,
      url: window.location.href
    })
    
    this.setState({
      error,
      errorInfo
    })
    
    // Report to error tracking service if enabled
    if (CONFIG.FEATURES.ENABLE_ERROR_TRACKING) {
      this.reportError(error, errorInfo)
    }
  }

  /**
   * Report error to tracking service
   */
  reportError = async (error, errorInfo) => {
    try {
      // Could send to Sentry, LogRocket, etc.
      console.log('[ERROR TRACKING] Would report error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        errorId: this.state.errorId
      })
    } catch (e) {
      // Silently fail - don't cause more errors
    }
  }

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }))
  }

  /**
   * Attempt to recover by resetting state
   */
  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false,
      errorId: null
    })
  }

  /**
   * Navigate to home page
   */
  goHome = () => {
    // Clear any cached state that might cause the error
    try {
      sessionStorage.clear()
    } catch (e) {
      // Ignore storage errors
    }
    window.location.href = '/'
  }

  /**
   * Reload the page
   */
  handleReload = () => {
    window.location.reload()
  }

  /**
   * Copy error details to clipboard
   */
  copyErrorDetails = async () => {
    const details = this.getErrorDetails()
    const t = i18n.t.bind(i18n)
    try {
      await navigator.clipboard.writeText(details)
      alert(t('errors.copiedToClipboard'))
    } catch (e) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = details
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      alert(t('errors.copiedToClipboard'))
    }
  }

  /**
   * Get formatted error details
   */
  getErrorDetails = () => {
    const { error, errorInfo, errorId } = this.state
    return `
Error ID: ${errorId}
Time: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Error: ${error?.toString()}

Stack Trace:
${error?.stack || 'No stack trace available'}

Component Stack:
${errorInfo?.componentStack || 'No component stack available'}
    `.trim()
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props
      
      // Allow custom fallback UI
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback({ 
              error: this.state.error, 
              errorId: this.state.errorId,
              retry: this.handleRetry 
            })
          : fallback
      }
      
      const t = i18n.t.bind(i18n)
      return (
        <div className="error-screen">
          <div className="error-content">
            <img 
              src={ghostIcon} 
              alt={t('common.error')} 
              className="error-icon"
            />
            <h1 className="error-title">{t('errors.somethingWentWrong')}</h1>
            <p className="error-message">
              {t('errors.unexpectedError')}
            </p>
            
            {this.state.errorId && (
              <p className="error-id">
                {t('errors.errorId')}: <code>{this.state.errorId}</code>
              </p>
            )}
            
            {this.state.showDetails && (
              <div className="error-details">
                <div className="error-details-content">
                  <div className="error-details-header">
                    <strong>{t('errors.errorDetails')}</strong>
                    <button 
                      className="btn-copy"
                      onClick={this.copyErrorDetails}
                      title={t('common.copy')}
                    >
                      📋 {t('common.copy')}
                    </button>
                  </div>
                  <pre>{this.state.error && this.state.error.toString()}</pre>
                  {CONFIG.ENABLE_DEBUG_LOGS && this.state.error?.stack && (
                    <pre className="error-stack">{this.state.error.stack}</pre>
                  )}
                  {this.state.errorInfo && (
                    <pre className="error-component-stack">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </div>
            )}

            <div className="error-actions">
              <button 
                className="btn-retry"
                onClick={this.handleRetry}
              >
                {t('common.tryAgain')}
              </button>
              <button 
                className="btn-reload"
                onClick={this.handleReload}
              >
                {t('common.reloadPage')}
              </button>
              <button 
                className="btn-details"
                onClick={this.toggleDetails}
              >
                {this.state.showDetails ? t('common.hideDetails') : t('common.showDetails')}
              </button>
              <button 
                className="btn-home"
                onClick={this.goHome}
              >
                {t('common.goHome')}
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
