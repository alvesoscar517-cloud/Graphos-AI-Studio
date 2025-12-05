import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useState } from 'react';
import { Button } from './button';

/**
 * Error Fallback Component
 * Displayed when an error is caught by the boundary
 */
function ErrorFallback({ error, resetErrorBoundary }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      {/* Icon */}
      <div className="w-12 h-12 bg-surface-secondary/80 rounded-2xl flex items-center justify-center shadow-xs mb-5">
        <img src="/icon/alert-circle.svg" alt="Error" className="w-6 h-6 icon-dark" />
      </div>

      {/* Title */}
      <h2 className="text-[20px] font-semibold text-primary tracking-[-0.02em] mb-2">Something went wrong</h2>

      {/* Description */}
      <p className="text-[14px] text-muted mb-6 max-w-md text-center">
        An error occurred while displaying this content. Please try again or contact support if the issue persists.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <Button variant="primary" size="sm" onClick={resetErrorBoundary}>
          <img src="/icon/refresh-cw.svg" alt="" className="w-4 h-4 icon-white" />
          Try again
        </Button>
        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </div>

      {/* Technical details */}
      {import.meta.env.DEV && error && (
        <div className="mt-6 w-full max-w-md">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[13px] text-muted hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <img
              src="/icon/chevron-right.svg"
              alt=""
              className={`w-3.5 h-3.5 icon-gray transition-transform ${showDetails ? 'rotate-90' : ''}`}
            />
            Technical details
          </button>
          {showDetails && (
            <pre className="text-[12px] bg-surface-secondary/60 text-destructive p-3 rounded-xl mt-2 overflow-auto max-h-32 border border-border/30">
              {error.message}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Page Error Fallback - for route-level errors
 */
function PageErrorFallback({ error, resetErrorBoundary }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-surface">
      {/* Icon */}
      <div className="w-14 h-14 bg-surface-secondary/80 rounded-2xl flex items-center justify-center shadow-xs mb-6">
        <img src="/icon/alert-circle.svg" alt="Error" className="w-7 h-7 icon-dark" />
      </div>

      {/* Title */}
      <h1 className="text-[24px] font-semibold text-primary tracking-[-0.02em] mb-2">Something went wrong</h1>

      {/* Description */}
      <p className="text-[14px] text-muted mb-8 max-w-md text-center">
        An unexpected error occurred. Try reloading the page or return to dashboard.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2.5 mb-6">
        <Button variant="primary" onClick={resetErrorBoundary}>
          <img src="/icon/refresh-cw.svg" alt="" className="w-4 h-4 icon-white" />
          Try again
        </Button>
        <Button variant="secondary" onClick={() => (window.location.href = '/')}>
          <img src="/icon/home.svg" alt="" className="w-4 h-4 icon-dark" />
          Dashboard
        </Button>
      </div>

      {/* Technical details */}
      {import.meta.env.DEV && error && (
        <div className="w-full max-w-lg">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[13px] text-muted hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <img
              src="/icon/chevron-right.svg"
              alt=""
              className={`w-3.5 h-3.5 icon-gray transition-transform ${showDetails ? 'rotate-90' : ''}`}
            />
            Technical details
          </button>
          {showDetails && (
            <pre className="text-[12px] bg-surface-secondary/60 text-destructive p-4 rounded-xl mt-3 overflow-auto max-h-48 border border-border/30 whitespace-pre-wrap break-words">
              {error.stack || error.message}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Error Boundary wrapper component
 */
function ErrorBoundary({ children, fallback, onReset, onError }) {
  const handleError = (error, info) => {
    console.error('Error caught by boundary:', error, info);
    onError?.(error, info);
  };

  return (
    <ReactErrorBoundary FallbackComponent={fallback || ErrorFallback} onReset={onReset} onError={handleError}>
      {children}
    </ReactErrorBoundary>
  );
}

/**
 * Page-level Error Boundary
 */
function PageErrorBoundary({ children, onReset }) {
  return (
    <ErrorBoundary fallback={PageErrorFallback} onReset={onReset}>
      {children}
    </ErrorBoundary>
  );
}

export { ErrorBoundary, PageErrorBoundary, ErrorFallback, PageErrorFallback };
