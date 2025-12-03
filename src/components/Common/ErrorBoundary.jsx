/**
 * Error Boundary Component
 * Catches JavaScript errors in child components
 */

import { Component } from 'react'
import ErrorPage from './ErrorPage'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
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
            <p className="text-red-500 mb-2">Something went wrong</p>
            <button
              onClick={this.handleRetry}
              className="text-blue-600 hover:underline text-sm"
            >
              Try again
            </button>
          </div>
        )
      }

      // Use full ErrorPage for app-level errors
      return (
        <ErrorPage 
          error={this.state.error}
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
export function QueryErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 text-center">
      <p className="text-red-500 mb-2">Failed to load data</p>
      <p className="text-gray-500 text-sm mb-4">{error?.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="text-blue-600 hover:underline"
      >
        Try again
      </button>
    </div>
  )
}

export default ErrorBoundary
