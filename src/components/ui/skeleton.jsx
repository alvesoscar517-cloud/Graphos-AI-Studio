/**
 * Skeleton loading components
 * Placeholder UI while content is loading - matching admin panel design
 * Optimized for responsive design and matching real data sizes
 */

import { cn } from '@/lib/utils'

/**
 * Base skeleton component with pulse animation
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-fill-secondary',
        className
      )}
      {...props}
    />
  )
}

/**
 * Text skeleton - for text content
 */
function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-[14px] rounded-md',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

/**
 * Avatar skeleton - circular placeholder
 */
function SkeletonAvatar({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <Skeleton className={cn('rounded-full', sizes[size], className)} />
  )
}

/**
 * Card skeleton - for card content
 */
function SkeletonCard({ className = '', children }) {
  return (
    <div className={cn('rounded-2xl border border-border-light p-5 space-y-4 bg-bg-secondary', className)}>
      {children || (
        <>
          <div className="flex items-center gap-3">
            <SkeletonAvatar size="md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3 rounded-md" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
          </div>
          <SkeletonText lines={3} />
        </>
      )}
    </div>
  )
}

/**
 * Table row skeleton - matches actual table row height (h-11 = 44px)
 */
function SkeletonTableRow({ columns = 4, className = '' }) {
  return (
    <div className={cn('flex items-center gap-4 py-2.5 px-4 border-b border-border-light h-11', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-[14px] rounded-md',
            i === 0 ? 'w-40 shrink-0' : i === columns - 1 ? 'w-20 shrink-0' : 'flex-1 max-w-32'
          )}
        />
      ))}
    </div>
  )
}

/**
 * Table skeleton - multiple rows
 */
function SkeletonTable({ rows = 5, columns = 4, className = '' }) {
  return (
    <div className={cn('rounded-2xl border border-border-light overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center gap-4 py-3 px-4 bg-fill-quaternary border-b border-border-light h-10">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-20 rounded-md" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} columns={columns} />
      ))}
    </div>
  )
}

/**
 * Stats card skeleton - for dashboard stats
 */
function SkeletonStatsCard({ className = '' }) {
  return (
    <div className={cn('rounded-2xl border border-border-light p-5 bg-bg-secondary', className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-3 w-20 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-24 mb-2 rounded-md" />
      <Skeleton className="h-3 w-16 rounded-md" />
    </div>
  )
}

/**
 * List item skeleton - matches notification list items
 */
function SkeletonListItem({ className = '' }) {
  return (
    <div className={cn('flex items-center gap-3 py-3 px-4', className)}>
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-[14px] w-2/5 rounded-md" />
        <Skeleton className="h-3 w-3/5 rounded-md" />
      </div>
      <Skeleton className="h-5 w-14 rounded-full shrink-0" />
    </div>
  )
}

/**
 * Profile card skeleton - for profile carousel
 * Matches ProfileCard dimensions exactly
 */
function SkeletonProfileCard({ className = '' }) {
  return (
    <div className={cn(
      'rounded-xl border border-border-light p-5 bg-bg-secondary',
      'min-w-0 flex-1',
      'max-lg:p-4 max-sm:p-3.5',
      className
    )}>
      {/* Header with Icon */}
      <div className="flex items-start justify-between mb-4 max-lg:mb-3">
        <Skeleton className={cn("w-14 h-14 rounded-xl","max-lg:w-10 max-lg:h-10 max-sm:w-9 max-sm:h-9"
        )} />
      </div>
      
      {/* Title */}
      <Skeleton className="h-[18px] w-3/4 rounded-md mb-2 max-lg:h-4 max-sm:h-[13px]" />
      
      {/* Meta */}
      <div className={cn("flex items-center gap-3 mb-4","max-lg:gap-2 max-lg:mb-3","max-sm:gap-1.5"
      )}>
        <Skeleton className="h-3 w-16 rounded-md max-lg:w-14 max-sm:w-12" />
        <Skeleton className="h-3 w-20 rounded-md max-lg:w-16 max-sm:w-14" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 max-lg:gap-2 max-lg:mb-3 max-sm:gap-1.5">
        <div className={cn("flex flex-col gap-1.5 p-3 rounded-lg border border-border-light bg-fill-tertiary","max-lg:p-2 max-sm:p-1.5"
        )}>
          <Skeleton className="h-2.5 w-12 rounded max-sm:w-10" />
          <Skeleton className="h-5 w-10 rounded-md max-lg:h-4 max-sm:h-3.5" />
        </div>
        <div className={cn("flex flex-col gap-1.5 p-3 rounded-lg border border-border-light bg-fill-tertiary","max-lg:p-2 max-sm:p-1.5"
        )}>
          <Skeleton className="h-2.5 w-14 rounded max-sm:w-12" />
          <Skeleton className="h-5 w-8 rounded-md max-lg:h-4 max-sm:h-3.5" />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4 max-lg:gap-1.5 max-lg:mb-3 max-sm:gap-1">
        <Skeleton className="h-6 w-16 rounded-md max-lg:h-5 max-sm:h-4 max-sm:w-14" />
        <Skeleton className="h-6 w-20 rounded-md max-lg:h-5 max-sm:h-4 max-sm:w-16" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border-light max-lg:pt-3 max-sm:pt-2.5">
        <Skeleton className="h-3 w-20 rounded-md max-lg:w-16 max-sm:w-14" />
        <Skeleton className="h-7 w-16 rounded-lg max-lg:h-6 max-sm:h-5 max-sm:w-14" />
      </div>
    </div>
  )
}

/**
 * Action card skeleton - for quick action cards
 */
function SkeletonActionCard({ className = '' }) {
  return (
    <div className={cn(
      'flex items-center gap-4 py-3 px-6 rounded-xl border border-border-light bg-bg-secondary',
      'max-xl:gap-3 max-xl:py-2.5 max-xl:px-4',
      'max-lg:flex-col max-lg:text-center max-lg:py-4 max-lg:px-3 max-lg:gap-2',
      'max-md:flex-row max-md:text-left max-md:py-3 max-md:px-4 max-md:gap-3',
      'max-sm:py-2.5 max-sm:px-3 max-sm:gap-2.5 max-sm:rounded-lg',
      className
    )}>
      <Skeleton className={cn("w-12 h-12 rounded-lg shrink-0","max-xl:w-10 max-xl:h-10","max-lg:w-11 max-lg:h-11","max-sm:w-9 max-sm:h-9"
      )} />
      <Skeleton className="h-[14px] w-28 rounded-md max-lg:w-20 max-sm:w-16 max-sm:h-3" />
    </div>
  )
}

/**
 * Feature card skeleton - for featured features section
 */
function SkeletonFeatureCard({ className = '' }) {
  return (
    <div className={cn(
      'flex gap-4 py-3.5 px-6 items-center rounded-xl border border-border-light bg-bg-secondary',
      'max-xl:gap-3 max-xl:py-3 max-xl:px-4',
      'max-md:py-3 max-md:px-4',
      'max-sm:py-2.5 max-sm:px-3 max-sm:gap-2.5 max-sm:rounded-lg',
      className
    )}>
      <Skeleton className={cn("w-12 h-12 rounded-lg shrink-0","max-xl:w-10 max-xl:h-10","max-sm:w-9 max-sm:h-9"
      )} />
      <div className="flex-1 space-y-2 min-w-0 max-xl:space-y-1.5 max-sm:space-y-1">
        <Skeleton className="h-[14px] w-1/3 rounded-md max-xl:h-3 max-sm:h-2.5" />
        <Skeleton className="h-3 w-2/3 rounded-md max-sm:h-2.5" />
      </div>
    </div>
  )
}

/**
 * History row skeleton - for history table
 * Matches actual row height (h-11 = 44px) and column widths
 */
function SkeletonHistoryRow({ className = '' }) {
  return (
    <div className={cn(
      'flex items-center gap-4 py-2.5 px-4 border-b border-border-light h-11',
      'max-md:gap-3',
      className
    )}>
      {/* Icon */}
      <Skeleton className="w-5 h-5 rounded shrink-0" />
      {/* Title - flex-1 with max-width */}
      <Skeleton className="h-[14px] flex-1 max-w-[240px] rounded-md max-md:max-w-[160px]" />
      {/* Type - hidden on lg */}
      <Skeleton className="h-[14px] w-14 rounded-md max-xl:hidden" />
      {/* Source - hidden on lg */}
      <Skeleton className="h-[14px] w-14 rounded-md max-lg:hidden" />
      {/* Time */}
      <Skeleton className="h-[14px] w-20 rounded-md shrink-0 max-md:w-16" />
      {/* Delete button */}
      <Skeleton className="h-7 w-7 rounded shrink-0" />
    </div>
  )
}

/**
 * Credit history row skeleton
 * Matches actual credit row height and column widths
 */
function SkeletonCreditRow({ className = '' }) {
  return (
    <div className={cn(
      'flex items-center gap-4 py-2.5 px-4 border-b border-border-light h-11',
      'max-md:gap-3',
      className
    )}>
      {/* Icon */}
      <Skeleton className="w-5 h-5 rounded shrink-0" />
      {/* Description - min-w-40 in actual */}
      <Skeleton className="h-[14px] flex-1 max-w-[200px] rounded-md max-md:max-w-[140px]" />
      {/* Type - hidden on lg */}
      <Skeleton className="h-[14px] w-20 rounded-md max-lg:hidden" />
      {/* Time */}
      <Skeleton className="h-[14px] w-20 rounded-md shrink-0 max-md:w-14" />
      {/* Amount */}
      <Skeleton className="h-[14px] w-16 rounded-md shrink-0" />
      {/* Balance - hidden on xl */}
      <Skeleton className="h-[14px] w-14 rounded-md shrink-0 max-xl:hidden" />
    </div>
  )
}

/**
 * Conversation skeleton - for workspace chat
 */
function SkeletonConversation({ className = '' }) {
  return (
    <div className={cn('space-y-6 p-4 max-w-3xl mx-auto', className)}>
      {/* User message */}
      <div className="flex justify-end">
        <div className="max-w-[70%] space-y-2">
          <Skeleton className="h-[14px] w-52 ml-auto rounded-md" />
          <Skeleton className="h-[14px] w-36 ml-auto rounded-md" />
        </div>
      </div>
      {/* AI message */}
      <div className="flex justify-start">
        <div className="max-w-[70%] space-y-2">
          <Skeleton className="h-[14px] w-72 rounded-md" />
          <Skeleton className="h-[14px] w-64 rounded-md" />
          <Skeleton className="h-[14px] w-48 rounded-md" />
        </div>
      </div>
      {/* User message */}
      <div className="flex justify-end">
        <div className="max-w-[70%] space-y-2">
          <Skeleton className="h-[14px] w-40 ml-auto rounded-md" />
        </div>
      </div>
      {/* AI message */}
      <div className="flex justify-start">
        <div className="max-w-[70%] space-y-2">
          <Skeleton className="h-[14px] w-80 rounded-md" />
          <Skeleton className="h-[14px] w-72 rounded-md" />
          <Skeleton className="h-[14px] w-56 rounded-md" />
          <Skeleton className="h-[14px] w-40 rounded-md" />
        </div>
      </div>
    </div>
  )
}

/**
 * Editor skeleton - for AI Studio editor
 */
function SkeletonEditor({ className = '' }) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-border-light">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
      {/* Content */}
      <div className="flex-1 p-6 space-y-4">
        <Skeleton className="h-5 w-3/4 rounded-md" />
        <Skeleton className="h-5 w-full rounded-md" />
        <Skeleton className="h-5 w-5/6 rounded-md" />
        <Skeleton className="h-5 w-2/3 rounded-md" />
        <div className="h-6" />
        <Skeleton className="h-5 w-full rounded-md" />
        <Skeleton className="h-5 w-4/5 rounded-md" />
        <Skeleton className="h-5 w-3/4 rounded-md" />
      </div>
    </div>
  )
}

/**
 * Mobile card skeleton - for mobile list views
 */
function SkeletonMobileCard({ className = '' }) {
  return (
    <div className={cn(
      'bg-bg-secondary border border-border-light rounded-lg p-4',
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Skeleton className="w-5 h-5 rounded shrink-0" />
          <Skeleton className="h-[14px] flex-1 max-w-[180px] rounded-md" />
        </div>
        <Skeleton className="h-[14px] w-14 rounded-md shrink-0" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="h-3 w-20 rounded-md" />
        <Skeleton className="h-3 w-14 rounded-md" />
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonTable,
  SkeletonStatsCard,
  SkeletonListItem,
  SkeletonProfileCard,
  SkeletonActionCard,
  SkeletonFeatureCard,
  SkeletonHistoryRow,
  SkeletonCreditRow,
  SkeletonConversation,
  SkeletonEditor,
  SkeletonMobileCard,
}
