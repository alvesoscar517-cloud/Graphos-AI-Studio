/**
 * FormCheckbox Component
 * Checkbox field integrated with React Hook Form
 */

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const FormCheckbox = forwardRef(function FormCheckbox(
  {
    label,
    name,
    error,
    hint,
    className,
    checkboxClassName,
    ...props
  },
  ref
) {
  const hasError = !!error

  return (
    <div className={cn('form-checkbox', className)}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          ref={ref}
          id={name}
          name={name}
          type="checkbox"
          className={cn(
            'mt-0.5 h-4 w-4 rounded border transition-colors cursor-pointer',
            'text-blue-600 focus:ring-blue-500 focus:ring-offset-0',
            hasError
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600',
            checkboxClassName
          )}
          aria-invalid={hasError}
          {...props}
        />
        
        <div className="flex-1">
          {label && (
            <span className={cn(
              'text-sm',
              'text-gray-700 dark:text-gray-300',
              hasError && 'text-red-600 dark:text-red-400'
            )}>
              {label}
            </span>
          )}
          
          {hint && !hasError && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {hint}
            </p>
          )}
          
          {hasError && (
            <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </label>
    </div>
  )
})

export default FormCheckbox
