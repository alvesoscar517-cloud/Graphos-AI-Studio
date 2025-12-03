import { cn } from '@/lib/utils'

/**
 * Spinner component for loading states
 * @param {object} props
 * @param {string} props.className - Additional classes
 * @param {'sm'|'md'|'lg'} props.size - Spinner size
 */
export default function Spinner({ className, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-[1.5px]',
    md: 'w-6 h-6 border-2',
    lg: 'w-9 h-9 border-[2.5px]',
  }

  return (
    <div
      className={cn(
        'rounded-full border-surface-secondary border-t-primary',
        sizeClasses[size],
        className
      )}
      style={{ 
        animation: 'spin 0.7s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite' 
      }}
      role="status"
      aria-label="Loading"
    />
  )
}
