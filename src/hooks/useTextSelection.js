import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook to manage text selection state in TiptapEditor
 * Provides selection info for floating toolbar and context menu
 */
export const useTextSelection = (editor) => {
  const [selection, setSelection] = useState({
    hasSelection: false,
    selectedText: '',
    wordCount: 0,
    charCount: 0,
    from: 0,
    to: 0,
    rect: null
  })
  
  const selectionTimeoutRef = useRef(null)

  const updateSelection = useCallback(() => {
    if (!editor) {
      return
    }

    try {
      const { from, to, empty } = editor.state.selection
      
      if (empty || from === to) {
        setSelection({
          hasSelection: false,
          selectedText: '',
          wordCount: 0,
          charCount: 0,
          from: 0,
          to: 0,
          rect: null
        })
        return
      }

      const selectedText = editor.state.doc.textBetween(from, to, ' ')
      const trimmedText = selectedText.trim()
      
      if (!trimmedText) {
        setSelection({
          hasSelection: false,
          selectedText: '',
          wordCount: 0,
          charCount: 0,
          from: 0,
          to: 0,
          rect: null
        })
        return
      }

      // Get selection coordinates for floating toolbar positioning
      const { view } = editor
      let rect = null
      
      try {
        const coords = view.coordsAtPos(from)
        const endCoords = view.coordsAtPos(to)
        
        // Calculate bounding rect of selection
        rect = {
          top: Math.min(coords.top, endCoords.top),
          bottom: Math.max(coords.bottom, endCoords.bottom),
          left: Math.min(coords.left, endCoords.left),
          right: Math.max(coords.right, endCoords.right),
          width: Math.abs(endCoords.right - coords.left),
          height: Math.abs(endCoords.bottom - coords.top)
        }
      } catch (e) {
        // Fallback: use window selection
        const windowSelection = window.getSelection()
        if (windowSelection && windowSelection.rangeCount > 0) {
          const range = windowSelection.getRangeAt(0)
          const boundingRect = range.getBoundingClientRect()
          rect = {
            top: boundingRect.top,
            bottom: boundingRect.bottom,
            left: boundingRect.left,
            right: boundingRect.right,
            width: boundingRect.width,
            height: boundingRect.height
          }
        }
      }

      const wordCount = trimmedText.split(/\s+/).filter(w => w.length > 0).length
      const charCount = trimmedText.length

      setSelection({
        hasSelection: true,
        selectedText: trimmedText,
        wordCount,
        charCount,
        from,
        to,
        rect
      })
    } catch (error) {
      console.error('[useTextSelection] Error updating selection:', error)
    }
  }, [editor])

  // Debounced selection update
  const debouncedUpdate = useCallback(() => {
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current)
    }
    selectionTimeoutRef.current = setTimeout(updateSelection, 100)
  }, [updateSelection])

  useEffect(() => {
    if (!editor) return

    // Listen to selection changes via editor events
    const handleSelectionUpdate = () => {
      debouncedUpdate()
    }
    
    const handleBlur = () => {
      // Small delay to allow click events on toolbar to fire first
      setTimeout(() => {
        const activeElement = document.activeElement
        if (!activeElement?.closest('.selection-floating-toolbar')) {
          setSelection(prev => ({ ...prev, hasSelection: false }))
        }
      }, 200)
    }
    
    const handleTransaction = () => {
      debouncedUpdate()
    }

    editor.on('selectionUpdate', handleSelectionUpdate)
    editor.on('blur', handleBlur)
    editor.on('transaction', handleTransaction)
    
    // Also listen to native selection change
    const handleNativeSelectionChange = () => {
      // Only update if editor is focused
      if (editor.isFocused) {
        debouncedUpdate()
      }
    }
    
    document.addEventListener('selectionchange', handleNativeSelectionChange)

    // Initial check
    updateSelection()

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
      editor.off('blur', handleBlur)
      editor.off('transaction', handleTransaction)
      document.removeEventListener('selectionchange', handleNativeSelectionChange)
      
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current)
      }
    }
  }, [editor, debouncedUpdate, updateSelection])

  // Method to replace selected text
  const replaceSelection = useCallback((newText) => {
    if (!editor || !selection.hasSelection) return false
    
    editor
      .chain()
      .focus()
      .deleteRange({ from: selection.from, to: selection.to })
      .insertContent(newText)
      .run()
    
    return true
  }, [editor, selection])

  // Method to clear selection
  const clearSelection = useCallback(() => {
    if (!editor) return
    editor.commands.setTextSelection(editor.state.selection.to)
  }, [editor])

  return {
    ...selection,
    replaceSelection,
    clearSelection,
    updateSelection
  }
}

export default useTextSelection
