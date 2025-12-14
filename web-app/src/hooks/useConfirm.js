/**
 * useConfirm Hook
 * Custom confirmation dialog using Zustand store
 */

import { useState, useCallback } from 'react'
import { useUIStore } from '@/stores/uiStore'

/**
 * Hook for showing confirmation dialogs
 * Uses the modal system from uiStore
 */
export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState({})
  const [resolveRef, setResolveRef] = useState(null)

  const confirm = useCallback((options = {}) => {
    const {
      title = 'Confirm',
      message = 'Are you sure?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      danger = false,
    } = options

    return new Promise((resolve) => {
      setConfig({ title, message, confirmText, cancelText, danger })
      setResolveRef(() => resolve)
      setIsOpen(true)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setIsOpen(false)
    resolveRef?.(true)
  }, [resolveRef])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
    resolveRef?.(false)
  }, [resolveRef])

  return {
    confirm,
    isOpen,
    config,
    handleConfirm,
    handleCancel,
  }
}

/**
 * Simple confirm using window.confirm (fallback)
 */
export function useSimpleConfirm() {
  const confirm = useCallback((message) => {
    return Promise.resolve(window.confirm(message))
  }, [])

  return { confirm }
}

export default useConfirm
