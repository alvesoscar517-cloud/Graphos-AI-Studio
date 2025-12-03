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
      'peer inline-flex h-[26px] w-[46px] shrink-0 cursor-pointer items-center rounded-full',
      'border-2 border-transparent transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-info/25',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-success data-[state=unchecked]:bg-border/80',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-[22px] w-[22px] rounded-full bg-white ring-0',
        'shadow-[0_2px_4px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)]',
        'transition-transform duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
        'data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-0'
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
