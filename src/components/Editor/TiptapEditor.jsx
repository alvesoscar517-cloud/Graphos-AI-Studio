// @ts-nocheck
import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import { useNavigate } from 'react-router-dom'
import SearchHighlightExtension from './extensions/SearchHighlightExtension'
import DeviationHighlightExtension from './extensions/DeviationHighlightExtension'
import EditorTextLoader from './EditorTextLoader'
import SelectionFloatingToolbar from './SelectionFloatingToolbar'
import { useTranslation } from 'react-i18next'
import { useIsStreaming, useProcessingType, useAIProcessingActions } from '@/stores'
import { cn } from '../../lib/utils'
import { serializeToPlainText, parseFromPlainText, isHtmlContent } from './utils/serialization'
import { rewriteTextStream, startIterativeHumanize, pollAndStreamHumanizeJob } from '../../services/api'
import { getLocalizedContentError } from '../../utils/errorMessages'
import { handleCreditError } from '../../utils/creditHandler'
import modal from '../../utils/modal'
import { logger } from '@/utils/logger'
import SuggestionTooltip from '../Analysis/SuggestionTooltip'
import EditorToolbar from './EditorToolbar'
import useTextSelection from '../../hooks/useTextSelection'
import './TiptapEditor.css'

/**
 * TiptapEditor - Rich text editor with AI features
 * Drop-in replacement for TextHighlightEditor
 */
function TiptapEditorComponent({ 
  value = '',
  onChange,
  analysis = null,
  disabled = false,
  placeholder,
  showHighlights = true,
  onHighlightsChange,
  isProcessing = false,
  className = '',
  showToolbar = true,
  toolbarClassName = '',
  onEditorReady,
  showSelectionToolbar = true // New prop to enable/disable selection toolbar
}, ref) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isStreaming = useIsStreaming()
  const processingType = useProcessingType()
  const { startProcessing, stopProcessing, startStreaming } = useAIProcessingActions()
  
  // Check if this is an AI operation that needs text loader on editor
  const isAIOperation = processingType === 'rewrite' || processingType === 'humanize' || 
                        processingType === 'detect' || processingType === 'analyze'
  
  // Track if selection rewrite is in progress
  const [isSelectionProcessing, setIsSelectionProcessing] = useState(false)
  
  // Show text loader for AI operations (including selection rewrite) - hide when streaming
  // isSelectionProcessing tự động hiển thị shimmer vì nó là rewrite/humanize operation
  const showTextLoader = ((isProcessing && isAIOperation) || isSelectionProcessing) && !isStreaming
  
  const [activeTooltip, setActiveTooltip] = useState(null)
  const [dismissedSuggestions, setDismissedSuggestions] = useState(new Set())
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const editorContainerRef = useRef(null)
  const isExternalUpdate = useRef(false)
  const lastValueRef = useRef(value)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        // Disable built-in extensions that we configure separately
        link: false,
        underline: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || t('editor.enterYourText'),
        emptyEditorClass: 'tiptap-empty',
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }),
      Subscript,
      Superscript,
      TextStyle,
      Color,
      FontFamily,
      SearchHighlightExtension,
      DeviationHighlightExtension.configure({
        onHighlightClick: (data) => {
          setActiveTooltip(data)
        },
      }),
    ],
    content: isHtmlContent(value) ? value : parseFromPlainText(value),
    editable: !disabled && !isProcessing,
    onUpdate: ({ editor }) => {
      if (isExternalUpdate.current) return
      
      // Use HTML to preserve formatting (bold, lists, headers, etc.)
      const htmlContent = editor.getHTML()
      lastValueRef.current = htmlContent
      onChange?.(htmlContent)
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content',
        spellcheck: 'false',
      },
    },
  })

  // Expose editor methods via ref
  useImperativeHandle(ref, () => ({
    editor,
    getContent: () => serializeToPlainText(editor?.getJSON()),
    setContent: (text) => {
      if (editor) {
        isExternalUpdate.current = true
        const content = isHtmlContent(text) ? text : parseFromPlainText(text)
        editor.commands.setContent(content)
        isExternalUpdate.current = false
      }
    },
    focus: () => editor?.commands.focus(),
    blur: () => editor?.commands.blur(),
  }), [editor])

  // Notify parent when editor is ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])
  
  // Text selection hook for floating toolbar - use editor directly
  const selection = useTextSelection(editor)
  
  // Track streaming state for selection rewrite
  const streamingRangeRef = useRef(null)
  const originalTextRef = useRef(null)
  
  // Handle selection rewrite - dùng shimmer toàn editor như rewrite thường
  const handleSelectionRewrite = useCallback(async (params) => {
    if (!editor) return
    
    const { text, from, to, useIterative, profileId, model, writingPreferences, processingType } = params
    
    // Lưu text gốc và vị trí để rollback nếu lỗi
    originalTextRef.current = text
    const originalFrom = from
    const originalTo = to
    
    // Lưu toàn bộ content để rollback
    const fullOriginalContent = value
    
    // Save to undo stack
    setUndoStack(prev => [...prev.slice(-19), { text: value, timestamp: Date.now() }])
    setRedoStack([])
    
    // Bắt đầu processing - shimmer toàn editor + three dots ở sidebar
    setIsSelectionProcessing(true)
    startProcessing(processingType)
    
    // Lưu range để streaming vào đúng vị trí
    streamingRangeRef.current = { from: originalFrom, to: originalTo }
    
    // Variables for streaming animation
    let fullText = ''
    let displayedText = ''
    let isAnimating = false
    let hasStartedStreaming = false
    let animationFrameId = null
    
    // Animation function - streaming text vào đúng vị trí selection
    const animateText = () => {
      if (displayedText.length < fullText.length) {
        const remaining = fullText.length - displayedText.length
        const charsToAdd = Math.max(1, Math.min(5, Math.ceil(remaining / 15)))
        displayedText = fullText.substring(0, displayedText.length + charsToAdd)
        
        // Update text trong editor tại vị trí selection
        const range = streamingRangeRef.current
        if (range && editor) {
          const newTo = range.from + displayedText.length
          editor.chain()
            .deleteRange({ from: range.from, to: range.to })
            .insertContentAt(range.from, displayedText)
            .run()
          streamingRangeRef.current = { from: range.from, to: newTo }
        }
        
        animationFrameId = requestAnimationFrame(animateText)
      } else {
        isAnimating = false
      }
    }
    
    const waitForAnimation = () => {
      return new Promise((resolve) => {
        const checkAnimation = () => {
          if (!isAnimating && displayedText.length >= fullText.length) {
            resolve()
          } else {
            setTimeout(checkAnimation, 50)
          }
        }
        checkAnimation()
      })
    }
    
    try {
      if (useIterative) {
        logger.log('[SELECTION] Starting iterative humanization...')
        
        const startResult = await startIterativeHumanize(profileId, text, {
          maxIterations: 3,
          targetProbability: writingPreferences?.targetAIProbability || 35,
          model,
          writingPreferences
        })
        
        if (!startResult.success) {
          throw new Error(startResult.error || 'Humanization failed')
        }
        
        const result = await pollAndStreamHumanizeJob(startResult.jobId, {
          onProgress: (progress) => logger.log('[SELECTION PROGRESS]', progress),
          onChunk: (chunk) => {
            if (!hasStartedStreaming) {
              hasStartedStreaming = true
              startStreaming()
              // Xóa text gốc khi có chunk đầu tiên
              const range = streamingRangeRef.current
              if (range && editor) {
                editor.chain().deleteRange({ from: range.from, to: range.to }).run()
                streamingRangeRef.current = { from: range.from, to: range.from }
              }
            }
            fullText += chunk
            if (!isAnimating) {
              isAnimating = true
              animateText()
            }
          },
          onComplete: (metadata) => logger.log('[SELECTION COMPLETE]', metadata),
          pollInterval: 1500,
          maxWaitTime: 300000
        })
        
        await waitForAnimation()
        
        if (!result.success) {
          throw new Error(result.error || 'Humanization failed')
        }
      } else {
        logger.log('[SELECTION] Starting rewrite...')
        
        await rewriteTextStream(profileId, text, model, writingPreferences, (chunk, type) => {
          if (type === 'reasoning') return
          
          if (!hasStartedStreaming) {
            hasStartedStreaming = true
            startStreaming()
            // Xóa text gốc khi có chunk đầu tiên
            const range = streamingRangeRef.current
            if (range && editor) {
              editor.chain().deleteRange({ from: range.from, to: range.to }).run()
              streamingRangeRef.current = { from: range.from, to: range.from }
            }
          }
          fullText += chunk
          if (!isAnimating) {
            isAnimating = true
            animateText()
          }
        })
        
        await waitForAnimation()
      }
      
      // Sync content với parent sau khi streaming hoàn tất
      if (editor) {
        const htmlContent = editor.getHTML()
        lastValueRef.current = htmlContent
        onChange?.(htmlContent)
      }
    } catch (error) {
      console.error('[SELECTION FAIL]', error)
      
      // Cancel animation
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      
      // Rollback - khôi phục toàn bộ content gốc
      if (fullOriginalContent) {
        isExternalUpdate.current = true
        const content = isHtmlContent(fullOriginalContent) ? fullOriginalContent : parseFromPlainText(fullOriginalContent)
        editor.commands.setContent(content)
        isExternalUpdate.current = false
        onChange?.(fullOriginalContent)
      }
      
      const wasCreditError = handleCreditError(error, t, () => navigate('/pricing'))
      if (!wasCreditError) {
        const localizedError = getLocalizedContentError(error.message, t)
        modal.errorWithReport(localizedError || 'Rewrite failed', error, 'Error', 'TiptapEditor.handleSelectionRewrite')
      }
    } finally {
      setIsSelectionProcessing(false)
      streamingRangeRef.current = null
      originalTextRef.current = null
      stopProcessing()
    }
  }, [editor, value, onChange, t, navigate, startProcessing, stopProcessing, startStreaming])

  // Sync external value changes
  useEffect(() => {
    if (!editor || value === lastValueRef.current) return
    
    isExternalUpdate.current = true
    const currentPos = editor.state.selection.from
    // Auto-detect HTML or plain text content
    const content = isHtmlContent(value) ? value : parseFromPlainText(value)
    editor.commands.setContent(content)
    
    // Try to restore cursor position (only when not streaming)
    if (!isStreaming) {
      try {
        const maxPos = editor.state.doc.content.size
        const newPos = Math.min(currentPos, maxPos)
        editor.commands.setTextSelection(newPos)
      } catch (e) {
        // Ignore cursor restoration errors
      }
    }
    
    lastValueRef.current = value
    isExternalUpdate.current = false
  }, [value, editor, isStreaming])
  
  // Track previous streaming state to detect when streaming ends
  const wasStreamingRef = useRef(false)
  
  // Convert plain text to HTML after streaming ends
  // This ensures content is saved in HTML format for proper formatting
  useEffect(() => {
    const wasStreaming = wasStreamingRef.current
    wasStreamingRef.current = isStreaming
    
    // Only run when streaming just ended (was streaming, now not streaming)
    if (!editor || isStreaming || !wasStreaming) return
    
    // Small delay to ensure editor has final content
    const timeoutId = setTimeout(() => {
      // Check if current value is plain text (not HTML)
      if (value && !isHtmlContent(value)) {
        // Get HTML from editor and save it
        const htmlContent = editor.getHTML()
        if (htmlContent && htmlContent !== value && htmlContent !== '<p></p>') {
          lastValueRef.current = htmlContent
          onChange?.(htmlContent)
        }
      }
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [editor, isStreaming, value, onChange])

  // Auto-scroll to bottom when streaming new content
  useEffect(() => {
    if (!editor || !isStreaming) return
    
    // Scroll editor to bottom to follow streaming text
    const editorElement = editor.view.dom
    if (editorElement) {
      const scrollContainer = editorElement.closest('.ProseMirror') || editorElement
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  }, [editor, isStreaming, value])

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled && !isProcessing)
    }
  }, [editor, disabled, isProcessing])

  // Handle analysis highlights using DeviationHighlightExtension
  useEffect(() => {
    if (!editor) return

    if (!analysis || !showHighlights) {
      // Clear highlights when no analysis or hidden
      editor.commands.clearDeviationHighlights?.()
      if (onHighlightsChange) {
        onHighlightsChange(false)
      }
      return
    }

    // Update deviation highlights via extension
    editor.commands.setDeviationAnalysis?.(analysis, dismissedSuggestions)
    editor.commands.setDeviationShowHighlights?.(showHighlights)

    const sentencesWithIssues = analysis.sentence_suggestions 
      ? Object.values(analysis.sentence_suggestions).filter(
          s => s.issues_found > 0
        ).length
      : 0

    if (onHighlightsChange) {
      onHighlightsChange(sentencesWithIssues > 0)
    }
  }, [editor, analysis, showHighlights, onHighlightsChange, dismissedSuggestions])



  // Apply suggestion
  const handleApplySuggestion = useCallback((rewrittenText) => {
    if (!activeTooltip || !editor) return
    
    setUndoStack(prev => [...prev.slice(-19), { text: value, timestamp: Date.now() }])
    setRedoStack([])
    
    const newValue = value.replace(activeTooltip.originalText, rewrittenText)
    onChange?.(newValue)
    
    setActiveTooltip(null)
  }, [activeTooltip, value, onChange, editor])

  // Dismiss suggestion
  const handleDismissSuggestion = useCallback(() => {
    if (!activeTooltip) return
    
    setDismissedSuggestions(prev => new Set([...prev, activeTooltip.originalText]))
    setActiveTooltip(null)
  }, [activeTooltip])

  // Undo handler
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return
    
    const lastState = undoStack[undoStack.length - 1]
    setRedoStack(prev => [...prev, { text: value, timestamp: Date.now() }])
    setUndoStack(prev => prev.slice(0, -1))
    onChange?.(lastState.text)
  }, [undoStack, value, onChange])

  return (
    <div 
      ref={editorContainerRef}
      className={cn(
        "tiptap-editor-container",
        "relative w-full h-full bg-bg-tertiary overflow-hidden box-border flex flex-col",
        className
      )}
    >
      {/* Editor Toolbar - only show if showToolbar is true, always visible but disabled when processing */}
      {showToolbar && (
        <EditorToolbar 
          editor={editor} 
          visible={true}
          disabled={disabled || isProcessing}
          className={toolbarClassName}
        />
      )}

      {/* Editor content area */}
      <div className="relative flex-1 overflow-hidden flex flex-col">
        {/* Scrollable content wrapper */}
        <div className="flex-1 overflow-y-auto">
          {/* Editor content */}
          <EditorContent 
            editor={editor} 
            className={cn(
              "tiptap-editor",
              isProcessing && "tiptap-processing"
            )}
          />
        </div>

        {/* EditorTextLoader for rewrite/humanize operations (including selection rewrite) */}
        <EditorTextLoader visible={showTextLoader} />

        {/* SparklesLoader overlay removed - EditorTextLoader now handles all AI operations */}

        {/* Suggestion tooltip */}
        {activeTooltip && (
          <SuggestionTooltip
            targetRect={activeTooltip.targetRect}
            suggestions={activeTooltip.suggestions}
            severity={activeTooltip.level}
            onApply={handleApplySuggestion}
            onDismiss={handleDismissSuggestion}
            onClose={() => setActiveTooltip(null)}
            canUndo={undoStack.length > 0}
            onUndo={handleUndo}
          />
        )}
      </div>
      
      {/* Selection Floating Toolbar - appears when text is selected */}
      {showSelectionToolbar && !disabled && !isSelectionProcessing && (
        <SelectionFloatingToolbar
          selection={selection}
          onSelectionRewrite={handleSelectionRewrite}
          disabled={isProcessing || disabled}
        />
      )}
    </div>
  )
}

const TiptapEditor = forwardRef(TiptapEditorComponent)
TiptapEditor.displayName = 'TiptapEditor'

export default TiptapEditor
