/**
 * Skeleton loading components
 * Placeholder UI while content is loading
 */

import { cn } from '@/lib/utils'

/**
 * Base skeleton component
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-surface-secondary/80',
        className
      )}
      {...props}
    />
  )
}

/**
 * Text skeleton - for text content
 */
function SkeletonText({ lines = 1, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
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
function SkeletonAvatar({ size = 'md', className }) {
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
function SkeletonCard({ className }) {
  return (
    <div className={cn('rounded-2xl border border-border/40 p-5 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  )
}

/**
 * Table row skeleton
 */
function SkeletonTableRow({ columns = 4, className }) {
  return (
    <div className={cn('flex items-center gap-4 py-3 px-4 border-b border-border', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === 0 ? 'w-32' : i === columns - 1 ? 'w-20' : 'flex-1'
          )}
        />
      ))}
    </div>
  )
}

/**
 * Table skeleton - multiple rows
 */
function SkeletonTable({ rows = 5, columns = 4, className }) {
  return (
    <div className={cn('rounded-2xl border border-border/40 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center gap-4 py-3.5 px-4 bg-surface-secondary/50 border-b border-border/40">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-20" />
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
 * Stats card skeleton
 */
function SkeletonStatsCard({ className }) {
  return (
    <div className={cn('rounded-2xl border border-border/40 p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

/**
 * Chart skeleton
 */
function SkeletonChart({ height = 300, className }) {
  return (
    <div className={cn('rounded-2xl border border-border/40 p-5', className)}>
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
      <Skeleton className="w-full rounded-xl" style={{ height: height - 80 }} />
    </div>
  )
}

/**
 * List item skeleton
 */
function SkeletonListItem({ className }) {
  return (
    <div className={cn('flex items-center gap-3 py-3 px-4 border-b border-border', className)}>
      <SkeletonAvatar size="md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  )
}

/**
 * Form skeleton
 */
function SkeletonForm({ fields = 3, className }) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-10 w-full rounded-lg mt-6" />
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
  SkeletonChart,
  SkeletonListItem,
  SkeletonForm,
}
