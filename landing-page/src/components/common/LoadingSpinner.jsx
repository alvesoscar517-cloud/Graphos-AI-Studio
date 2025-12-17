/**
 * LoadingSpinner Component
 * Used for lazy-loaded components and page transitions
 * Uses ThreeDotsLoading animation for consistent UX
 */
import ThreeDotsLoading from './ThreeDotsLoading'

export default function LoadingSpinner({ size = 'md', className }) {
  return (
    <div className={`flex items-center justify-center ${className || ''}`}>
      <ThreeDotsLoading size={size} />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <ThreeDotsLoading size="lg" />
    </div>
  )
}
