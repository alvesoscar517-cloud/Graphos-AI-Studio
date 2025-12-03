/**
 * Form Utilities
 * Helper functions for React Hook Form + Zod
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'

/**
 * Create a form hook with Zod validation
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 * @param {object} defaultValues - Default form values
 * @param {object} options - Additional react-hook-form options
 */
export function createFormHook(schema, defaultValues = {}, options = {}) {
  return function useCustomForm(onSubmit, initialValues = {}) {
    const form = useForm({
      resolver: zodResolver(schema),
      defaultValues: { ...defaultValues, ...initialValues },
      mode: 'onBlur',
      ...options,
    })

    const handleSubmit = form.handleSubmit(async (data) => {
      try {
        await onSubmit?.(data)
      } catch (error) {
        form.setError('root', {
          type: 'manual',
          message: error.message || 'An error occurred',
        })
        throw error
      }
    })

    return {
      ...form,
      handleSubmit,
      isLoading: form.formState.isSubmitting,
      isValid: form.formState.isValid,
      isDirty: form.formState.isDirty,
      errors: form.formState.errors,
      rootError: form.formState.errors.root?.message,
    }
  }
}

/**
 * Generic form hook for any schema
 * @param {import('zod').ZodSchema} schema
 * @param {object} options
 */
export function useZodForm(schema, options = {}) {
  const {
    defaultValues = {},
    onSubmit,
    mode = 'onBlur',
    ...restOptions
  } = options

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode,
    ...restOptions,
  })

  const handleSubmit = useCallback(
    (submitFn) => {
      return form.handleSubmit(async (data) => {
        try {
          await (submitFn || onSubmit)?.(data)
        } catch (error) {
          form.setError('root', {
            type: 'manual',
            message: error.message || 'An error occurred',
          })
        }
      })
    },
    [form, onSubmit]
  )

  return {
    ...form,
    handleSubmit,
    isLoading: form.formState.isSubmitting,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    errors: form.formState.errors,
    rootError: form.formState.errors.root?.message,
  }
}

/**
 * Get field error message
 */
export function getFieldError(errors, fieldName) {
  const error = fieldName.split('.').reduce((obj, key) => obj?.[key], errors)
  return error?.message
}

/**
 * Check if field has error
 */
export function hasFieldError(errors, fieldName) {
  return !!getFieldError(errors, fieldName)
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors) {
  const messages = []
  
  function extractMessages(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (value?.message) {
        messages.push({
          field: prefix ? `${prefix}.${key}` : key,
          message: value.message,
        })
      } else if (typeof value === 'object' && value !== null) {
        extractMessages(value, prefix ? `${prefix}.${key}` : key)
      }
    }
  }
  
  extractMessages(errors)
  return messages
}

export default {
  createFormHook,
  useZodForm,
  getFieldError,
  hasFieldError,
  formatValidationErrors,
}
