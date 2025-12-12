/**
 * Loading Spinner Component
 * Reusable loading indicator
 */

import { useTranslation } from 'react-i18next'

export function LoadingSpinner({ size = 'md', className = '' }) {
  const { t } = useTranslation()
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  }

  return (
    <div
      className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizes[size]} ${className}`}
      role="status"
      aria-label={t('common.loading')}
    />
  )
}

export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export function LoadingPlaceholder({ lines = 3, className = '' }) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  )
}

export default LoadingSpinner
