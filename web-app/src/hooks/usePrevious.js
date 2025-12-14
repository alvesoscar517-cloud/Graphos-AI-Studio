/**
 * usePrevious Hook
 * Track previous value of a variable
 */

import { useRef, useEffect } from 'react'

/**
 * Hook to get the previous value of a variable
 * @param {any} value - Current value to track
 * @returns {any} - Previous value (undefined on first render)
 */
export function usePrevious(value) {
  const ref = useRef()
  
  useEffect(() => {
    ref.current = value
  }, [value])
  
  return ref.current
}

export default usePrevious
