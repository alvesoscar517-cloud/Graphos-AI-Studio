/**
 * Tabs component using Radix UI
 * Accessible tabbed interface
 */

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-10 sm:h-11 items-center justify-start sm:justify-center rounded-lg sm:rounded-xl bg-surface-secondary p-1 text-muted gap-0.5',
      'overflow-x-auto scrollbar-hide',
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md sm:rounded-[10px] px-3 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-[14px] font-medium',
      'transition-all duration-[250ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]',
      'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-info/25',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:bg-surface data-[state=active]:text-primary data-[state=active]:shadow-sm',
      'hover:text-primary/80',
      'flex-shrink-0',
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-info/25',
      'data-[state=inactive]:hidden',
      'animate-in fade-in-0 duration-200',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
