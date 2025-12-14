/**
 * useToggle Hook
 * Simple boolean state toggle
 */

import { useState, useCallback } from 'react'

/**
 * Hook for toggling boolean state
 * @param {boolean} initialValue - Initial toggle state (default: false)
 * @returns {[boolean, Function, Function, Function]} - [value, toggle, setTrue, setFalse]
 */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue(v => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return [value, toggle, setTrue, setFalse]
}

/**
 * Hook for managing disclosure state (modals, dropdowns, etc.)
 * @param {boolean} initialValue - Initial open state
 * @returns {Object} - { isOpen, open, close, toggle }
 */
export function useDisclosure(initialValue = false) {
  const [isOpen, toggle, open, close] = useToggle(initialValue)
  
  return { isOpen, open, close, toggle }
}

export default useToggle
