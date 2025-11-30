import { cn } from '@/lib/utils'

const badgeVariants = {
  default: 'bg-surface-secondary text-secondary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
  primary: 'bg-primary text-primary-foreground',
}

/**
 * Badge component with status variants
 * @param {object} props
 * @param {'default'|'success'|'warning'|'error'|'info'|'primary'} props.variant - Badge style variant
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.children - Badge content
 */
function Badge({ variant = 'default', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-pill text-xs font-medium',
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/**
 * Status badge with dot indicator
 */
function StatusBadge({ status, className, children, ...props }) {
  const statusConfig = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'default', label: 'Inactive' },
    pending: { variant: 'warning', label: 'Pending' },
    suspended: { variant: 'error', label: 'Suspended' },
    banned: { variant: 'error', label: 'Banned' },
  }

  const config = statusConfig[status] || statusConfig.inactive
  
  return (
    <Badge variant={config.variant} className={cn('gap-1.5', className)} {...props}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        config.variant === 'success' && 'bg-success',
        config.variant === 'warning' && 'bg-warning',
        config.variant === 'error' && 'bg-destructive',
        config.variant === 'default' && 'bg-muted',
      )} />
      {children || config.label}
    </Badge>
  )
}

/**
 * Priority badge
 */
function PriorityBadge({ priority, className, ...props }) {
  const priorityConfig = {
    low: { variant: 'default', label: 'Low' },
    medium: { variant: 'info', label: 'Medium' },
    high: { variant: 'warning', label: 'High' },
    urgent: { variant: 'error', label: 'Urgent' },
  }

  const config = priorityConfig[priority] || priorityConfig.low
  
  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.label}
    </Badge>
  )
}

export { Badge, StatusBadge, PriorityBadge, badgeVariants }
export default Badge
