import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

/**
 * Progress component
 * Built on Radix UI Progress primitive
 */
const Progress = React.forwardRef(({ 
  className, 
  value = 0, 
  max = 100,
  variant = 'default',
  size = 'md',
  showValue = false,
  ...props 
}, ref) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
    info: 'bg-info',
  }
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className="w-full">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-surface-secondary',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full transition-all duration-300 ease-in-out rounded-full',
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </ProgressPrimitive.Root>
      {showValue && (
        <span className="text-xs text-muted-foreground mt-1">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

/**
 * Progress with label
 */
function ProgressWithLabel({ 
  label, 
  value, 
  max = 100, 
  variant,
  className,
  ...props 
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-primary font-medium">{label}</span>
        <span className="text-muted-foreground">{Math.round(percentage)}%</span>
      </div>
      <Progress value={value} max={max} variant={variant} {...props} />
    </div>
  )
}

/**
 * Circular Progress
 */
function CircularProgress({ 
  value = 0, 
  max = 100, 
  size = 48, 
  strokeWidth = 4,
  variant = 'default',
  showValue = true,
  className 
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  const variantColors = {
    default: 'stroke-primary',
    success: 'stroke-success',
    warning: 'stroke-warning',
    destructive: 'stroke-destructive',
    info: 'stroke-info',
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-surface-secondary"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('transition-all duration-300', variantColors[variant])}
        />
      </svg>
      {showValue && (
        <span className="absolute text-xs font-medium text-primary">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}

export { Progress, ProgressWithLabel, CircularProgress }
