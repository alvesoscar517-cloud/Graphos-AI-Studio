/**
 * useFormWithMutation Hook
 * Combines React Hook Form with TanStack Query mutation
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useCallback } from 'react'

/**
 * Hook that combines form handling with mutation
 * @param {object} options
 * @param {import('zod').ZodSchema} options.schema - Zod validation schema
 * @param {object} options.defaultValues - Default form values
 * @param {Function} options.mutationFn - Mutation function
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {object} options.mutationOptions - Additional mutation options
 */
export function useFormWithMutation({
  schema,
  defaultValues = {},
  mutationFn,
  onSuccess,
  onError,
  mutationOptions = {},
  formOptions = {},
}) {
  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode: 'onBlur',
    ...formOptions,
  })

  const mutation = useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      form.reset()
      onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      form.setError('root', {
        type: 'manual',
        message: error.message || 'An error occurred',
      })
      onError?.(error, variables)
    },
    ...mutationOptions,
  })

  const handleSubmit = useCallback(
    (e) => {
      return form.handleSubmit((data) => {
        mutation.mutate(data)
      })(e)
    },
    [form, mutation]
  )

  const submitAsync = useCallback(
    async (data) => {
      return mutation.mutateAsync(data)
    },
    [mutation]
  )

  return {
    // Form
    ...form,
    handleSubmit,
    submitAsync,
    
    // Form state
    isLoading: form.formState.isSubmitting || mutation.isPending,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    errors: form.formState.errors,
    rootError: form.formState.errors.root?.message,
    
    // Mutation state
    mutation,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    mutationError: mutation.error,
    data: mutation.data,
    
    // Actions
    reset: () => {
      form.reset()
      mutation.reset()
    },
  }
}

export default useFormWithMutation
