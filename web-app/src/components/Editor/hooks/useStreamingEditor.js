import { logger } from '../../../utils/logger'
import { useCallback, useRef, useState } from 'react'

/**
 * useStreamingEditor - Hook for managing streaming text in Tiptap editor
 * Provides smooth animation for incoming text chunks
 */
export function useStreamingEditor(editor) {
  const [isStreaming, setIsStreaming] = useState(false)
  
  const streamingRef = useRef({
    fullText: '',
    displayedLength: 0,
    animationFrame: null,
    isAnimating: false,
    originalContent: '',
  })

  /**
   * Animate text display with adaptive speed
   */
  const animateText = useCallback(() => {
    if (!editor) return
    
    const state = streamingRef.current
    
    if (state.displayedLength < state.fullText.length) {
      // Calculate adaptive speed based on buffer size
      const remaining = state.fullText.length - state.displayedLength
      const charsToAdd = Math.max(1, Math.min(3, Math.ceil(remaining / 20)))
      
      state.displayedLength += charsToAdd
      const displayText = state.fullText.substring(0, state.displayedLength)
      
      // Update editor content
      editor.commands.setContent(displayText, false, { preserveWhitespace: 'full' })
      
      // Continue animation
      state.animationFrame = requestAnimationFrame(animateText)
    } else {
      state.isAnimating = false
      state.animationFrame = null
    }
  }, [editor])

  /**
   * Start streaming - clear content and prepare for new text
   */
  const startStreaming = useCallback(() => {
    if (!editor) return
    
    // Save original content
    streamingRef.current.originalContent = editor.getText()
    streamingRef.current.fullText = ''
    streamingRef.current.displayedLength = 0
    streamingRef.current.isAnimating = false
    
    // Cancel any pending animation
    if (streamingRef.current.animationFrame) {
      cancelAnimationFrame(streamingRef.current.animationFrame)
      streamingRef.current.animationFrame = null
    }
    
    // Clear editor and lock
    editor.commands.setContent('')
    editor.setEditable(false)
    
    setIsStreaming(true)
    
    logger.log('[STREAMING] Started')
  }, [editor])

  /**
   * Append chunk to stream buffer
   */
  const appendChunk = useCallback((chunk) => {
    if (!editor || !isStreaming) return
    
    const state = streamingRef.current
    state.fullText += chunk
    
    // Start animation if not already running
    if (!state.isAnimating) {
      state.isAnimating = true
      animateText()
    }
    
    logger.log(`[STREAMING] Chunk received, buffer: ${state.fullText.length} chars`)
  }, [editor, isStreaming, animateText])

  /**
   * End streaming - finalize content and unlock editor
   */
  const endStreaming = useCallback(() => {
    return new Promise((resolve) => {
      if (!editor) {
        resolve()
        return
      }
      
      const state = streamingRef.current
      
      // Wait for animation to complete
      const checkComplete = () => {
        if (!state.isAnimating && state.displayedLength >= state.fullText.length) {
          // Ensure final content is set
          if (state.fullText) {
            editor.commands.setContent(state.fullText, false, { preserveWhitespace: 'full' })
          }
          
          // Unlock editor
          editor.setEditable(true)
          editor.commands.focus('end')
          
          setIsStreaming(false)
          
          // Clear state
          state.fullText = ''
          state.displayedLength = 0
          state.originalContent = ''
          
          logger.log('[STREAMING] Ended')
          resolve()
        } else {
          requestAnimationFrame(checkComplete)
        }
      }
      
      checkComplete()
    })
  }, [editor])

  /**
   * Abort streaming - restore original content
   */
  const abortStreaming = useCallback(() => {
    if (!editor) return
    
    const state = streamingRef.current
    
    // Cancel animation
    if (state.animationFrame) {
      cancelAnimationFrame(state.animationFrame)
      state.animationFrame = null
    }
    
    // Restore original content
    if (state.originalContent) {
      editor.commands.setContent(state.originalContent, false, { preserveWhitespace: 'full' })
    }
    
    // Unlock editor
    editor.setEditable(true)
    
    setIsStreaming(false)
    
    // Clear state
    state.fullText = ''
    state.displayedLength = 0
    state.isAnimating = false
    state.originalContent = ''
    
    logger.log('[STREAMING] Aborted')
  }, [editor])

  /**
   * Get current streamed content
   */
  const getStreamedContent = useCallback(() => {
    return streamingRef.current.fullText
  }, [])

  return {
    isStreaming,
    startStreaming,
    appendChunk,
    endStreaming,
    abortStreaming,
    getStreamedContent,
  }
}

export default useStreamingEditor
