import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cn } from '@/lib/utils'

/**
 * Checkbox component
 * Built on Radix UI Checkbox primitive
 */
const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-[18px] w-[18px] shrink-0 rounded-md border-[1.5px] border-border/60',
      'transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-info/25',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-info data-[state=checked]:border-info data-[state=checked]:text-primary-foreground',
      'hover:border-border',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
      <svg
        className="h-3 w-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

/**
 * Checkbox with label
 */
const CheckboxWithLabel = React.forwardRef(({ 
  className, 
  label, 
  description,
  id,
  ...props 
}, ref) => {
  const generatedId = React.useId()
  const checkboxId = id || generatedId

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <Checkbox ref={ref} id={checkboxId} {...props} />
      <div className="grid gap-1 leading-none">
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm font-medium text-primary cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
})
CheckboxWithLabel.displayName = 'CheckboxWithLabel'

export { Checkbox, CheckboxWithLabel }
