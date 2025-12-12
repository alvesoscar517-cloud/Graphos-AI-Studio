/**
 * Error Boundary Component
 * Catches JavaScript errors in child components
 */

import { Component } from 'react'
import ErrorPage from './ErrorPage'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Use inline fallback for small components
      if (this.props.inline) {
        return (
          <div className="p-4 text-center">
            <p className="text-red-500 mb-2">{this.props.t?.('errorBoundary.somethingWentWrong') || 'Something went wrong'}</p>
            <button
              onClick={this.handleRetry}
              className="text-blue-600 hover:underline text-sm"
            >
              {this.props.t?.('errorBoundary.tryAgain') || 'Try again'}
            </button>
          </div>
        )
      }

      // Use full ErrorPage for app-level errors
      return (
        <ErrorPage 
          error={this.state.error}
          componentStack={this.state.errorInfo?.componentStack}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Query Error Fallback - for TanStack Query errors
 */
export function QueryErrorFallback({ error, resetErrorBoundary, t }) {
  // Lazy import to avoid circular dependency
  const ErrorReportButton = require('./ErrorReportButton').ErrorReportButton
  
  return (
    <div className="p-4 text-center">
      <p className="text-red-500 mb-2">{t?.('errorBoundary.failedToLoadData') || 'Failed to load data'}</p>
      <p className="text-gray-500 text-sm mb-4">{error?.message}</p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={resetErrorBoundary}
          className="text-blue-600 hover:underline"
        >
          {t?.('errorBoundary.tryAgain') || 'Try again'}
        </button>
        <ErrorReportButton error={error} variant="link" context="QueryErrorFallback" />
      </div>
    </div>
  )
}

export default ErrorBoundary
