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
import SearchHighlightExtension from './extensions/SearchHighlightExtension'
import DeviationHighlightExtension from './extensions/DeviationHighlightExtension'
import ReasoningDisplay from './ReasoningDisplay'
import { AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useIsStreaming, useReasoning } from '@/stores'
import { cn } from '../../lib/utils'
import { serializeToPlainText, parseFromPlainText } from './utils/serialization'
import SuggestionTooltip from '../Analysis/SuggestionTooltip'
import EditorToolbar from './EditorToolbar'
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
  onEditorReady
}, ref) {
  const { t } = useTranslation()
  const isStreaming = useIsStreaming()
  const reasoning = useReasoning()
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
    content: parseFromPlainText(value),
    editable: !disabled && !isProcessing,
    onUpdate: ({ editor }) => {
      if (isExternalUpdate.current) return
      
      const plainText = serializeToPlainText(editor.getJSON())
      lastValueRef.current = plainText
      onChange?.(plainText)
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
        editor.commands.setContent(parseFromPlainText(text))
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

  // Sync external value changes
  useEffect(() => {
    if (!editor || value === lastValueRef.current) return
    
    isExternalUpdate.current = true
    const currentPos = editor.state.selection.from
    editor.commands.setContent(parseFromPlainText(value))
    
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
      {/* Editor Toolbar - only show if showToolbar is true */}
      {showToolbar && (
        <EditorToolbar 
          editor={editor} 
          visible={!isProcessing}
          disabled={disabled || isProcessing}
          className={toolbarClassName}
        />
      )}

      {/* Editor content area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Editor content - highlights are now applied via DeviationHighlightExtension */}
        <EditorContent 
          editor={editor} 
          className={cn(
            "tiptap-editor",
            isProcessing && "tiptap-processing"
          )}
        />

        {/* AI Processing overlay with reasoning display */}
        <AnimatePresence>
          {isProcessing && !isStreaming && reasoning.isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6">
              <div className="absolute inset-0 bg-bg-tertiary/60 backdrop-blur-[2px]" />
              <div className="relative z-10 w-full max-w-lg">
                <ReasoningDisplay
                  content={reasoning.content}
                  isActive={reasoning.isActive}
                  isComplete={reasoning.isComplete}
                  startTime={reasoning.startTime}
                />
              </div>
            </div>
          )}
        </AnimatePresence>

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
    </div>
  )
}

const TiptapEditor = forwardRef(TiptapEditorComponent)
TiptapEditor.displayName = 'TiptapEditor'

export default TiptapEditor
