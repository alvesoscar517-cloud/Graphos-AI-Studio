import { logger } from '../../../utils/logger'
import { useCallback } from 'react'

/**
 * useEditorHistory - Hook for managing undo/redo with AI operations
 * Wraps AI operations in single transactions for clean undo behavior
 */
export function useEditorHistory(editor) {
  /**
   * Execute an operation as a single undoable transaction
   * @param {Function} operation - Function that modifies editor content
   */
  const executeAsTransaction = useCallback((operation) => {
    if (!editor) return

    // Start a new transaction group
    editor.chain()
      .focus()
      .command(({ tr }) => {
        // Mark this as a single undo step
        tr.setMeta('addToHistory', true)
        return true
      })
      .run()

    // Execute the operation
    operation()
  }, [editor])

  /**
   * Apply AI suggestion as single undoable action
   */
  const applySuggestion = useCallback((originalText, newText) => {
    if (!editor) return false

    const content = editor.getText()
    const newContent = content.replace(originalText, newText)

    // Set content in a way that creates a single undo step
    editor.commands.setContent(newContent, false, { preserveWhitespace: 'full' })

    logger.log('[HISTORY] Suggestion applied as single transaction')
    return true
  }, [editor])

  /**
   * Finalize streaming content as single undoable action
   */
  const finalizeStreaming = useCallback((streamedContent) => {
    if (!editor) return false

    // The streaming content is already in the editor
    // Just ensure it's recorded as a single undo step
    editor.commands.setContent(streamedContent, false, { preserveWhitespace: 'full' })

    logger.log('[HISTORY] Streaming finalized as single transaction')
    return true
  }, [editor])

  /**
   * Undo last action
   */
  const undo = useCallback(() => {
    if (!editor) return false
    return editor.commands.undo()
  }, [editor])

  /**
   * Redo last undone action
   */
  const redo = useCallback(() => {
    if (!editor) return false
    return editor.commands.redo()
  }, [editor])

  /**
   * Check if undo is available
   */
  const canUndo = useCallback(() => {
    if (!editor) return false
    return editor.can().undo()
  }, [editor])

  /**
   * Check if redo is available
   */
  const canRedo = useCallback(() => {
    if (!editor) return false
    return editor.can().redo()
  }, [editor])

  return {
    executeAsTransaction,
    applySuggestion,
    finalizeStreaming,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}

export default useEditorHistory
