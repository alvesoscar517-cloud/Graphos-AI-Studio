/**
 * FormTextarea Component
 * Textarea field integrated with React Hook Form
 */

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import FormField from './FormField'

export const FormTextarea = forwardRef(function FormTextarea(
  {
    label,
    name,
    error,
    required,
    hint,
    className,
    textareaClassName,
    rows = 4,
    maxLength,
    showCount,
    value,
    ...props
  },
  ref
) {
  const hasError = !!error
  const charCount = value?.length || 0

  return (
    <FormField
      label={label}
      name={name}
      error={error}
      required={required}
      hint={hint}
      className={className}
    >
      <div className="relative">
        <textarea
          ref={ref}
          id={name}
          name={name}
          rows={rows}
          maxLength={maxLength}
          value={value}
          className={cn(
            'w-full px-3 py-2 rounded-lg border transition-colors resize-none',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus:outline-none focus:ring-2',
            hasError
              ? 'border-red-500 focus:ring-red-500/20'
              : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20',
            textareaClassName
          )}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
          {...props}
        />
        
        {showCount && maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    </FormField>
  )
})

export default FormTextarea
