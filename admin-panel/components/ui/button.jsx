import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import Spinner from './spinner'

const buttonVariants = {
  variant: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-md',
    secondary: 'bg-surface-secondary text-secondary-foreground border border-border/50 hover:bg-surface-tertiary',
    ghost: 'bg-transparent hover:bg-surface-secondary text-secondary',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
    success: 'bg-success text-success-foreground hover:bg-success/90 shadow-sm',
  },
  size: {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2',
  },
}

/**
 * Button component with variants and sizes
 * @param {object} props
 * @param {'primary'|'secondary'|'ghost'|'destructive'|'success'} props.variant - Button style variant
 * @param {'sm'|'md'|'lg'} props.size - Button size
 * @param {boolean} props.loading - Show loading spinner
 * @param {boolean} props.disabled - Disable button
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.children - Button content
 */
const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/20',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none',
        'active:scale-[0.98]',
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export { Button, buttonVariants }
export default Button
