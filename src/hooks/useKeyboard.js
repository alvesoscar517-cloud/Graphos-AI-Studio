/**
 * useKeyboard Hook
 * Handle keyboard shortcuts and events
 */

import { useEffect, useCallback, useRef } from 'react'

/**
 * Hook for handling keyboard shortcuts
 * @param {Object} shortcuts - Map of key combinations to handlers
 * @param {Object} options - Configuration options
 */
export function useKeyboardShortcuts(shortcuts, options = {}) {
  const { enabled = true, preventDefault = true, target = document } = options

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event) => {
      const key = getKeyCombo(event)

      if (shortcuts[key]) {
        if (preventDefault) {
          event.preventDefault()
        }
        shortcuts[key](event)
      }
    }

    target.addEventListener('keydown', handleKeyDown)
    return () => target.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, enabled, preventDefault, target])
}

/**
 * Hook for handling a single key press
 * @param {string} targetKey - The key to listen for
 * @param {Function} handler - Callback when key is pressed
 * @param {Object} options - Configuration options
 */
export function useKeyPress(targetKey, handler, options = {}) {
  const { enabled = true, preventDefault = false, modifiers = {} } = options

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event) => {
      const matchesKey = event.key.toLowerCase() === targetKey.toLowerCase()
      const matchesModifiers =
        (!modifiers.ctrl || event.ctrlKey || event.metaKey) &&
        (!modifiers.shift || event.shiftKey) &&
        (!modifiers.alt || event.altKey)

      if (matchesKey && matchesModifiers) {
        if (preventDefault) {
          event.preventDefault()
        }
        handler(event)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [targetKey, handler, enabled, preventDefault, modifiers])
}

/**
 * Hook for Escape key to close modals/dialogs
 * @param {Function} onEscape - Callback when Escape is pressed
 * @param {boolean} enabled - Whether the hook is active
 */
export function useEscapeKey(onEscape, enabled = true) {
  useKeyPress('Escape', onEscape, { enabled })
}

/**
 * Hook for Enter key to submit forms
 * @param {Function} onEnter - Callback when Enter is pressed
 * @param {Object} options - Configuration options
 */
export function useEnterKey(onEnter, options = {}) {
  const { enabled = true, ctrlEnter = false } = options

  useKeyPress('Enter', onEnter, {
    enabled,
    modifiers: ctrlEnter ? { ctrl: true } : {},
  })
}

/**
 * Get key combination string from event
 */
function getKeyCombo(event) {
  const parts = []

  if (event.ctrlKey || event.metaKey) parts.push('ctrl')
  if (event.shiftKey) parts.push('shift')
  if (event.altKey) parts.push('alt')

  const key = event.key.toLowerCase()
  if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
    parts.push(key)
  }

  return parts.join('+')
}

export default useKeyboardShortcuts
