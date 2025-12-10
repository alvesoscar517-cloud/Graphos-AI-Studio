import { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Input component with label and error state
 * @param {object} props
 * @param {string} props.label - Input label
 * @param {string} props.error - Error message
 * @param {string} props.hint - Hint text
 * @param {React.ReactNode} props.icon - Icon element
 * @param {string} props.className - Additional classes for input
 * @param {string} props.containerClassName - Additional classes for container
 */
const Input = forwardRef(({
  label,
  error,
  hint,
  icon,
  className,
  containerClassName,
  type = 'text',
  ...props
}, ref) => {
  const id = useId()
  const inputId = props.id || id

  return (
    <div className={cn('flex flex-col gap-2', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[12px] font-semibold uppercase tracking-[0.02em] text-secondary flex items-center gap-2"
        >
          {icon && <span className="w-3.5 h-3.5 icon-dark">{icon}</span>}
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={cn(
          'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-border/40 bg-surface-secondary text-primary text-[14px] sm:text-[15px]',
          'transition-all duration-[250ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]',
          'placeholder:text-muted/70',
          'hover:bg-surface hover:border-border/60',
          'focus:outline-none focus:bg-surface focus:border-[rgba(0,122,255,0.4)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-destructive/50 bg-destructive/5 focus:border-destructive/60',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error && (
        <span
          id={`${inputId}-error`}
          className="text-xs text-destructive"
          role="alert"
        >
          {error}
        </span>
      )}
      {hint && !error && (
        <span
          id={`${inputId}-hint`}
          className="text-xs text-muted"
        >
          {hint}
        </span>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export { Input }
export default Input
