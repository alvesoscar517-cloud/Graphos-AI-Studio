import { cn } from '../../lib/utils'

/**
 * IconContainer - Apple style icon with background
 * Standardized component for consistent icon styling across the app
 */
const IconContainer = ({ children, size = 'md', className }) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  }
  
  const radiusClasses = {
    xs: 'rounded-lg',
    sm: 'rounded-[10px]',
    md: 'rounded-xl',
    lg: 'rounded-xl',
    xl: 'rounded-2xl'
  }
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center shrink-0",
        "transition-all duration-200",
        "group-hover:scale-105",
        sizeClasses[size],
        radiusClasses[size],
        className
      )}
      style={{ backgroundColor: 'var(--icon-bg)' }}
    >
      {children}
    </div>
  )
}

export default IconContainer
