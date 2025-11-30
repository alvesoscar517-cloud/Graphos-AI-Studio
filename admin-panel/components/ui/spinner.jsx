import { cn } from '@/lib/utils'

/**
 * Spinner component for loading states
 * @param {object} props
 * @param {string} props.className - Additional classes
 * @param {'sm'|'md'|'lg'} props.size - Spinner size
 */
export default function Spinner({ className, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  }

  return (
    <div
      className={cn(
        'rounded-full border-surface-secondary border-t-primary animate-spin-slow',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
