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
        'bg-surface rounded-2xl border border-border/40 shadow-sm',
        'transition-shadow duration-[250ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]',
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
      className={cn('px-6 pt-6 pb-4', className)}
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
      className={cn('text-[17px] font-semibold text-primary tracking-[-0.015em]', className)}
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
      className={cn('text-[13px] text-muted mt-1.5 tracking-[-0.008em]', className)}
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
      className={cn('px-6 py-5 border-t border-border/40 flex items-center gap-3', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
export default Card
