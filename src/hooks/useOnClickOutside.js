/**
 * useOnClickOutside Hook
 * Detect clicks outside of a referenced element
 */
import { useEffect, useRef } from 'react'

/**
 * Call handler when clicking outside of ref element
 * @param {Function} handler - Callback when clicking outside
 * @param {boolean} enabled - Whether the hook is enabled (default: true)
 * @returns {React.RefObject} Ref to attach to the element
 */
export function useOnClickOutside(handler, enabled = true) {
  const ref = useRef(null)

  useEffect(() => {
    if (!enabled) return

    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [handler, enabled])

  return ref
}

/**
 * Alternative: Pass ref as parameter
 * @param {React.RefObject} ref - Ref of the element
 * @param {Function} handler - Callback when clicking outside
 * @param {boolean} enabled - Whether the hook is enabled
 */
export function useClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler, enabled])
}

export default useOnClickOutside
