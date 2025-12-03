import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import Spinner from './spinner'

const buttonVariants = {
  variant: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-md active:shadow-sm',
    secondary: 'bg-surface-secondary text-secondary-foreground border border-border/40 hover:bg-surface hover:border-border/60',
    ghost: 'bg-transparent hover:bg-surface-secondary/80 text-secondary',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
    success: 'bg-success text-success-foreground hover:bg-success/90 shadow-sm',
  },
  size: {
    sm: 'h-[34px] px-3.5 text-[13px] gap-1.5',
    md: 'h-[42px] px-5 text-[15px] gap-2',
    lg: 'h-[50px] px-7 text-[17px] gap-2.5',
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
        'inline-flex items-center justify-center font-medium rounded-xl',
        'transition-all duration-[250ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]',
        'focus:outline-none focus-visible:ring-[3px] focus-visible:ring-info/25',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        'active:scale-[0.97] active:transition-none',
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
