import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { Button } from './button'

/**
 * Error Fallback Component
 * Displayed when an error is caught by the boundary
 */
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      
      <h2 className="text-xl font-semibold text-primary mb-2">
        Something went wrong
      </h2>
      
      <p className="text-muted-foreground mb-4 max-w-md">
        An error occurred while displaying this content. Please try again or contact support if the issue persists.
      </p>
      
      {import.meta.env.DEV && (
        <pre className="text-xs text-left bg-surface-secondary p-4 rounded-md mb-4 max-w-full overflow-auto">
          <code className="text-destructive">{error.message}</code>
        </pre>
      )}
      
      <div className="flex gap-3">
        <Button onClick={resetErrorBoundary}>
          Try again
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </div>
    </div>
  )
}


/**
 * Page Error Fallback - for route-level errors
 */
function PageErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-surface">
      <div className="w-20 h-20 mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      
      <h1 className="text-2xl font-bold text-primary mb-2">
        Something went wrong
      </h1>
      
      <p className="text-muted-foreground mb-6 max-w-md text-center">
        This page encountered an error. Please try again or go back to home.
      </p>
      
      {import.meta.env.DEV && (
        <details className="mb-6 max-w-lg w-full">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-primary">
            Error details (dev only)
          </summary>
          <pre className="text-xs bg-surface-secondary p-4 rounded-md mt-2 overflow-auto">
            <code className="text-destructive">{error.stack || error.message}</code>
          </pre>
        </details>
      )}
      
      <div className="flex gap-3">
        <Button onClick={resetErrorBoundary}>
          Try again
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          Go to home
        </Button>
      </div>
    </div>
  )
}

/**
 * Error Boundary wrapper component
 */
function ErrorBoundary({ children, fallback, onReset, onError }) {
  const handleError = (error, info) => {
    // Log error to console in dev
    console.error('Error caught by boundary:', error, info)
    
    // Call custom error handler if provided
    onError?.(error, info)
  }

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onReset={onReset}
      onError={handleError}
    >
      {children}
    </ReactErrorBoundary>
  )
}

/**
 * Page-level Error Boundary
 */
function PageErrorBoundary({ children, onReset }) {
  return (
    <ErrorBoundary fallback={PageErrorFallback} onReset={onReset}>
      {children}
    </ErrorBoundary>
  )
}

export { ErrorBoundary, PageErrorBoundary, ErrorFallback, PageErrorFallback }
