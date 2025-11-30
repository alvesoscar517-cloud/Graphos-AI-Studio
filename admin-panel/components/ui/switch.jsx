import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

/**
 * Switch component - Toggle switch for boolean values
 * Built on Radix UI Switch primitive
 */
const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full',
      'border-2 border-transparent shadow-sm transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-primary data-[state=unchecked]:bg-border',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
        'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

/**
 * Switch with label
 */
const SwitchWithLabel = React.forwardRef(({ 
  className, 
  label, 
  description,
  ...props 
}, ref) => (
  <div className={cn('flex items-center justify-between gap-4', className)}>
    <div className="space-y-0.5">
      {label && (
        <label className="text-sm font-medium text-primary cursor-pointer">
          {label}
        </label>
      )}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
    <Switch ref={ref} {...props} />
  </div>
))
SwitchWithLabel.displayName = 'SwitchWithLabel'

export { Switch, SwitchWithLabel }
