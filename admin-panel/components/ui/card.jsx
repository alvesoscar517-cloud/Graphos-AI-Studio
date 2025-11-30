import { cn } from '@/lib/utils'

/**
 * Card component with consistent styling
 * @param {object} props
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.children - Card content
 */
function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-surface rounded-xl border border-border shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Card header component
 */
function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn('p-6 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Card title component
 */
function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn('text-lg font-semibold text-primary', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

/**
 * Card description component
 */
function CardDescription({ className, children, ...props }) {
  return (
    <p
      className={cn('text-sm text-muted mt-1', className)}
      {...props}
    >
      {children}
    </p>
  )
}

/**
 * Card content component
 */
function CardContent({ className, children, ...props }) {
  return (
    <div
      className={cn('p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Card footer component
 */
function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn('p-6 pt-4 border-t border-border flex items-center gap-3', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
export default Card
