/**
 * LoadingSpinner Component
 * Used for lazy-loaded components and page transitions
 */
import { clsx } from 'clsx'

export default function LoadingSpinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div
        className={clsx(
          'animate-spin rounded-full border-2 border-[var(--color-border)]',
          'border-t-[var(--color-primary)]',
          sizeClasses[size]
        )}
      />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-[var(--color-text-muted)] text-sm">Loading...</p>
      </div>
    </div>
  )
}
