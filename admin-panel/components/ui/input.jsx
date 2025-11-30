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
          className="text-xs font-medium uppercase tracking-wide text-primary flex items-center gap-2"
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
          'w-full px-4 py-2.5 rounded-lg border border-border/50 bg-surface-secondary text-primary text-sm',
          'transition-colors duration-200 placeholder:text-muted',
          'hover:bg-surface',
          'focus:outline-none focus:bg-surface',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          error && 'border-destructive/50 bg-destructive/5',
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
