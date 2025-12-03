/**
 * useAsync Hook
 * Handle async operations with loading, error, and data states
 */

import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * Hook for handling async operations
 * @param {Function} asyncFunction - The async function to execute
 * @param {Object} options - Configuration options
 */
export function useAsync(asyncFunction, options = {}) {
  const { immediate = false, onSuccess, onError } = options

  const [state, setState] = useState({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  })

  const mountedRef = useRef(true)

  const execute = useCallback(
    async (...args) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
      }))

      try {
        const data = await asyncFunction(...args)
        if (mountedRef.current) {
          setState({
            data,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          })
          onSuccess?.(data)
        }
        return data
      } catch (error) {
        if (mountedRef.current) {
          setState({
            data: null,
            error,
            isLoading: false,
            isSuccess: false,
            isError: true,
          })
          onError?.(error)
        }
        throw error
      }
    },
    [asyncFunction, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    })
  }, [])

  useEffect(() => {
    mountedRef.current = true
    if (immediate) {
      execute()
    }
    return () => {
      mountedRef.current = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    execute,
    reset,
  }
}

/**
 * Hook for handling async operations with automatic retry
 */
export function useAsyncRetry(asyncFunction, options = {}) {
  const { retries = 3, retryDelay = 1000, ...restOptions } = options
  const retriesRef = useRef(0)

  const wrappedFunction = useCallback(
    async (...args) => {
      retriesRef.current = 0

      const attempt = async () => {
        try {
          return await asyncFunction(...args)
        } catch (error) {
          if (retriesRef.current < retries) {
            retriesRef.current++
            await new Promise((resolve) => setTimeout(resolve, retryDelay))
            return attempt()
          }
          throw error
        }
      }

      return attempt()
    },
    [asyncFunction, retries, retryDelay]
  )

  return useAsync(wrappedFunction, restOptions)
}

export default useAsync
