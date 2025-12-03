import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverAnchor = PopoverPrimitive.Anchor
const PopoverClose = PopoverPrimitive.Close

const PopoverContent = React.forwardRef(({ 
  className, 
  align = 'center', 
  sideOffset = 6,
  ...props 
}, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-80 rounded-2xl border border-border/30 bg-surface/95 backdrop-blur-xl p-5 shadow-dropdown outline-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-[0.97] data-[state=open]:zoom-in-[0.97]',
        'data-[side=bottom]:slide-in-from-top-2',
        'data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2',
        'data-[side=top]:slide-in-from-bottom-2',
        'duration-200',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

/**
 * Simple Popover - convenience wrapper
 */
function SimplePopover({ 
  trigger, 
  children, 
  align = 'center',
  side = 'bottom',
  className,
  ...props 
}) {
  return (
    <Popover {...props}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent align={align} side={side} className={className}>
        {children}
      </PopoverContent>
    </Popover>
  )
}

export { 
  Popover, 
  PopoverTrigger, 
  PopoverContent, 
  PopoverAnchor, 
  PopoverClose,
  SimplePopover 
}
