/**
 * FormSelect Component
 * Select field integrated with React Hook Form
 */

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import FormField from './FormField'

export const FormSelect = forwardRef(function FormSelect(
  {
    label,
    name,
    error,
    required,
    hint,
    className,
    selectClassName,
    options = [],
    placeholder = 'Select an option',
    ...props
  },
  ref
) {
  const hasError = !!error

  return (
    <FormField
      label={label}
      name={name}
      error={error}
      required={required}
      hint={hint}
      className={className}
    >
      <select
        ref={ref}
        id={name}
        name={name}
        className={cn(
          'w-full px-3 py-2 rounded-lg border transition-colors appearance-none',
          'bg-white dark:bg-gray-800',
          'text-gray-900 dark:text-gray-100',
          'focus:outline-none focus:ring-2',
          hasError
            ? 'border-red-500 focus:ring-red-500/20'
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20',
          selectClassName
        )}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  )
})

export default FormSelect
