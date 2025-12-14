/**
 * FormField Component
 * Reusable form field wrapper with error handling
 */

import { cn } from '@/lib/utils'

export function FormField({
  label,
  name,
  error,
  required,
  hint,
  children,
  className,
}) {
  const hasError = !!error

  return (
    <div className={cn('form-field', className)}>
      {label && (
        <label
          htmlFor={name}
          className={cn(
            'block text-sm font-medium mb-1.5',
            'text-gray-700 dark:text-gray-300',
            hasError && 'text-red-600 dark:text-red-400'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {hint && !hasError && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
      
      {hasError && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
