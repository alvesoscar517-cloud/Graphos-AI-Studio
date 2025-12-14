import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { logger } from '@/utils/logger'
import { useRewrite, useAIProcessingActions } from '@/stores'
import { useUISelectionActions } from '@/stores/uiSelectionStore'
import { useProfiles } from '../../contexts/ProfileContext'
import { rewriteTextStream, startIterativeHumanize, pollAndStreamHumanizeJob } from '../../services/api'
import { getLocalizedContentError } from '../../utils/errorMessages'
import { handleCreditError, showUpgradeModal } from '../../utils/creditHandler'
import modal from '../../utils/modal'
import Portal from './Portal'

/**
 * Custom Context Menu Component
 * Hoạt động trên input và textarea trong toàn bộ hệ thống
 * Hỗ trợ Rewrite/Humanize cho text selection trong TiptapEditor
 */
const ContextMenu = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentProfile } = useProfiles()
  const { selectedModel, writingPreferences } = useRewrite()
  const { startProcessing, stopProcessing } = useAIProcessingActions()
  const { showContextMenu, hideAll } = useUISelectionActions()
  
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [targetElement, setTargetElement] = useState(null)
  const [hasSelection, setHasSelection] = useState(false)
  const [canPaste, setCanPaste] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const menuRef = useRef(null)

  const [isTextSelection, setIsTextSelection] = useState(false)
  const [isTiptapSelection, setIsTiptapSelection] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [tiptapEditor, setTiptapEditor] = useState(null)
  const [selectionRange, setSelectionRange] = useState({ from: 0, to: 0 })

  // Check if features are enabled for rewrite/humanize
  const hasAnyFeatureEnabled = useCallback(() => {
    const prefs = writingPreferences || {}
    const hasProfile = currentProfile !== null
    
    if (!hasProfile) {
      return prefs.useAntiAIDetection || prefs.useIterativeRefinement
    }
    return prefs.useAntiAIDetection || prefs.useIterativeRefinement ||
           prefs.useVocabularyPreferences || prefs.useKeyCharacteristics ||
           prefs.useSentencePatterns || prefs.useRewriteInstructions
  }, [currentProfile, writingPreferences])

  // Menu items for editable elements
  const editableMenuItems = [
    { id: 'cut', labelKey: 'common.cut', shortcut: 'Ctrl+X', icon: 'cut', requiresSelection: true },
    { id: 'copy', labelKey: 'common.copy', shortcut: 'Ctrl+C', icon: 'copy', requiresSelection: true },
    { id: 'paste', labelKey: 'common.paste', shortcut: 'Ctrl+V', icon: 'paste', requiresPaste: true },
    { id: 'divider1', type: 'divider' },
    { id: 'selectAll', labelKey: 'common.selectAll', shortcut: 'Ctrl+A', icon: 'select-all' },
    { id: 'divider2', type: 'divider' },
    { id: 'undo', labelKey: 'common.undo', shortcut: 'Ctrl+Z', icon: 'undo' },
    { id: 'redo', labelKey: 'common.redo', shortcut: 'Ctrl+Shift+Z', icon: 'redo' },
  ]

  // Menu items for text selection (non-editable)
  const textSelectionMenuItems = [
    { id: 'copy', labelKey: 'common.copy', shortcut: 'Ctrl+C', icon: 'copy' },
  ]
  
  // Menu items for TiptapEditor selection (with AI features)
  const tiptapSelectionMenuItems = [
    { id: 'copy', labelKey: 'common.copy', shortcut: 'Ctrl+C', icon: 'copy' },
    { id: 'cut', labelKey: 'common.cut', shortcut: 'Ctrl+X', icon: 'cut' },
    { id: 'divider-ai', type: 'divider' },
    { id: 'rewrite', labelKey: 'rewrite.rewriteSelection', icon: 'rewrite', isAI: true },
    { id: 'humanize', labelKey: 'rewrite.humanizeSelection', icon: 'humanize', isAI: true },
  ]

  const menuItems = isTiptapSelection 
    ? tiptapSelectionMenuItems 
    : (isTextSelection ? textSelectionMenuItems : editableMenuItems)

  // Check if element is input or textarea
  const isEditableElement = (element) => {
    if (!element) return false
    const tagName = element.tagName?.toLowerCase()
    return tagName === 'input' || tagName === 'textarea' || element.isContentEditable
  }
  
  // Check if element is inside TiptapEditor
  const isTiptapElement = (element) => {
    if (!element) return false
    return element.closest('.tiptap-editor') || element.closest('.ProseMirror')
  }
  
  // Get TiptapEditor instance from DOM
  const getTiptapEditor = (element) => {
    const proseMirror = element.closest('.ProseMirror')
    if (proseMirror && proseMirror.pmViewDesc?.node) {
      // Access editor through ProseMirror view
      return proseMirror.pmViewDesc
    }
    return null
  }

  // Handle context menu event
  const handleContextMenu = useCallback((e) => {
    const target = e.target
    
    // Check for text selection first
    const windowSelection = window.getSelection()
    const selectedTextValue = windowSelection?.toString()?.trim()
    
    // Check if inside TiptapEditor with selection
    if (isTiptapElement(target) && selectedTextValue) {
      e.preventDefault()
      setIsTextSelection(false)
      setIsTiptapSelection(true)
      setHasSelection(true)
      setCanPaste(false)
      setSelectedText(selectedTextValue)
      setTargetElement(target)
      
      // Try to get selection range from ProseMirror
      const proseMirror = target.closest('.ProseMirror')
      if (proseMirror) {
        // Store reference for later use
        setTiptapEditor(proseMirror)
      }
    } else if (isEditableElement(target)) {
      e.preventDefault()
      setIsTextSelection(false)
      setIsTiptapSelection(false)
      
      // Check selection in input/textarea
      const selection = target.selectionStart !== target.selectionEnd
      setHasSelection(selection)
      setCanPaste(true)
      setTargetElement(target)
      setSelectedText('')
    } else if (selectedTextValue) {
      // Has text selection in non-editable element
      e.preventDefault()
      setIsTextSelection(true)
      setIsTiptapSelection(false)
      setHasSelection(true)
      setCanPaste(false)
      setTargetElement(null)
      setSelectedText(selectedTextValue)
    } else {
      // Block default context menu for other elements
      e.preventDefault()
      return
    }
    
    // Calculate position
    let x = e.clientX
    let y = e.clientY
    
    // Adjust position to stay within viewport
    const menuWidth = 200
    const menuHeight = isTiptapSelection ? 180 : (isTextSelection ? 50 : 260)
    
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 8
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 8
    }
    
    setPosition({ x, y })
    setIsVisible(true)
    showContextMenu() // Hide floating toolbar when context menu opens
  }, [showContextMenu])

  // Handle click outside to close menu
  const handleClickOutside = useCallback((e) => {
    if (isVisible && menuRef.current && !menuRef.current.contains(e.target)) {
      setIsVisible(false)
      hideAll() // Allow floating toolbar to show again
    }
  }, [isVisible, hideAll])

  // Handle escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsVisible(false)
      hideAll()
    }
  }, [hideAll])

  // Handle scroll to close menu
  const handleScroll = useCallback(() => {
    if (isVisible) {
      setIsVisible(false)
      hideAll()
    }
  }, [isVisible, hideAll])


  // Handle rewrite for selection
  const handleRewriteSelection = async (useIterative = false) => {
    if (!selectedText || isProcessing) return
    
    setIsProcessing(true)
    startProcessing(useIterative ? 'humanize' : 'rewrite')
    setIsVisible(false)
    
    const originalText = selectedText
    
    try {
      let resultText = ''
      
      if (useIterative) {
        logger.log('[CONTEXT MENU] Starting iterative humanization for selection...')
        
        const startResult = await startIterativeHumanize(
          currentProfile?.profile_id || null,
          originalText,
          {
            maxIterations: 3,
            targetProbability: writingPreferences?.targetAIProbability || 35,
            model: selectedModel,
            writingPreferences: writingPreferences
          }
        )
        
        if (!startResult.success) {
          throw new Error(startResult.error || t('rewrite.humanizationFailed'))
        }
        
        const result = await pollAndStreamHumanizeJob(startResult.jobId, {
          onProgress: (progress) => {
            logger.log('[CONTEXT MENU PROGRESS]', progress)
          },
          onChunk: (chunk) => {
            resultText += chunk
          },
          onComplete: (metadata) => {
            logger.log('[CONTEXT MENU COMPLETE]', metadata)
          },
          pollInterval: 1500,
          maxWaitTime: 300000
        })
        
        if (!result.success) {
          throw new Error(result.error || t('rewrite.humanizationFailed'))
        }
        
        resultText = resultText || result.data?.rewritten_text
      } else {
        logger.log('[CONTEXT MENU] Starting rewrite for selection...')
        
        await rewriteTextStream(
          currentProfile?.profile_id || null,
          originalText,
          selectedModel,
          writingPreferences,
          (chunk, type) => {
            if (type === 'reasoning') return
            resultText += chunk
          }
        )
      }
      
      // Replace selection in TiptapEditor
      if (resultText && tiptapEditor) {
        // Use document.execCommand for contenteditable
        document.execCommand('insertText', false, resultText)
        modal.success(useIterative 
          ? (t('rewrite.selectionHumanized') || 'Selection humanized!')
          : (t('rewrite.selectionRewritten') || 'Selection rewritten!')
        )
      }
    } catch (error) {
      console.error('[CONTEXT MENU FAIL]', error)
      
      const wasCreditError = handleCreditError(error, t, showUpgradeModal)
      
      if (!wasCreditError) {
        const localizedError = getLocalizedContentError(error.message, t)
        modal.errorWithReport(
          localizedError || t('rewrite.rewriteFailed'),
          error,
          'Error',
          'ContextMenu.handleRewriteSelection'
        )
      }
    } finally {
      setIsProcessing(false)
      stopProcessing()
    }
  }

  // Execute menu action
  const executeAction = useCallback((actionId) => {
    // Handle AI actions for TiptapEditor
    if (isTiptapSelection) {
      if (actionId === 'rewrite') {
        handleRewriteSelection(false)
        return
      }
      if (actionId === 'humanize') {
        handleRewriteSelection(true)
        return
      }
      if (actionId === 'copy') {
        navigator.clipboard.writeText(selectedText).catch(() => {
          document.execCommand('copy')
        })
        setIsVisible(false)
        return
      }
      if (actionId === 'cut') {
        navigator.clipboard.writeText(selectedText).then(() => {
          document.execCommand('delete')
        }).catch(() => {
          document.execCommand('cut')
        })
        setIsVisible(false)
        return
      }
    }
    
    // Handle copy for text selection (non-editable)
    if (isTextSelection && actionId === 'copy') {
      const selectedTextValue = window.getSelection()?.toString()
      if (selectedTextValue) {
        navigator.clipboard.writeText(selectedTextValue).catch(() => {
          document.execCommand('copy')
        })
      }
      setIsVisible(false)
      return
    }
    
    if (!targetElement) return
    
    targetElement.focus()
    
    switch (actionId) {
      case 'cut':
        document.execCommand('cut')
        break
      case 'copy':
        document.execCommand('copy')
        break
      case 'paste':
        navigator.clipboard.readText().then(text => {
          const start = targetElement.selectionStart
          const end = targetElement.selectionEnd
          const value = targetElement.value
          targetElement.value = value.substring(0, start) + text + value.substring(end)
          targetElement.selectionStart = targetElement.selectionEnd = start + text.length
          // Trigger input event
          targetElement.dispatchEvent(new Event('input', { bubbles: true }))
        }).catch(() => {
          document.execCommand('paste')
        })
        break
      case 'selectAll':
        targetElement.select()
        break
      case 'undo':
        document.execCommand('undo')
        break
      case 'redo':
        document.execCommand('redo')
        break
      default:
        break
    }
    
    setIsVisible(false)
  }, [targetElement, isTextSelection, isTiptapSelection, selectedText, handleRewriteSelection])

  // Setup event listeners
  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('scroll', handleScroll, true)
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [handleContextMenu, handleClickOutside, handleKeyDown, handleScroll])

  // Get icon for menu item
  const getIcon = (iconName) => {
    const icons = {
      'cut': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="6" cy="6" r="3"/>
          <circle cx="6" cy="18" r="3"/>
          <line x1="20" y1="4" x2="8.12" y2="15.88"/>
          <line x1="14.47" y1="14.48" x2="20" y2="20"/>
          <line x1="8.12" y1="8.12" x2="12" y2="12"/>
        </svg>
      ),
      'copy': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      ),
      'paste': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        </svg>
      ),
      'select-all': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M9 9h6v6H9z"/>
        </svg>
      ),
      'undo': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7v6h6"/>
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
        </svg>
      ),
      'redo': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 7v6h-6"/>
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>
        </svg>
      ),
      'rewrite': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          <path d="m15 5 4 4"/>
        </svg>
      ),
      'humanize': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <polyline points="16 11 18 13 22 9"/>
        </svg>
      ),
    }
    return icons[iconName] || null
  }

  if (!isVisible) return null

  return (
    <Portal containerId="context-menu-root">
      <div
        ref={menuRef}
        className="context-menu"
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
        }}
      >
        {/* Selection info for TiptapEditor */}
        {isTiptapSelection && selectedText && (
          <div className="context-menu-header">
            <span className="context-menu-selection-info">
              {selectedText.split(/\s+/).filter(w => w.length > 0).length} {t('common.words') || 'words'}
            </span>
          </div>
        )}
        
        {menuItems.map((item) => {
          if (item.type === 'divider') {
            return <div key={item.id} className="context-menu-divider" />
          }
          
          const isAIDisabled = item.isAI && !hasAnyFeatureEnabled()
          const isDisabled = 
            (item.requiresSelection && !hasSelection) ||
            (item.requiresPaste && !canPaste) ||
            isAIDisabled ||
            isProcessing
          
          // Tooltip for disabled AI actions
          const tooltipText = isAIDisabled 
            ? (t('rewrite.enableFeatureFirst') || 'Enable at least one rewrite feature in sidebar first')
            : undefined
          
          return (
            <button
              key={item.id}
              className={`context-menu-item ${isDisabled ? 'disabled' : ''}`}
              onClick={() => !isDisabled && executeAction(item.id)}
              disabled={isDisabled}
              data-tooltip={tooltipText}
              data-tooltip-position="right"
            >
              <span className="context-menu-icon">{getIcon(item.icon)}</span>
              <span className="context-menu-label">{t(item.labelKey)}</span>
              {item.shortcut && <span className="context-menu-shortcut">{item.shortcut}</span>}
              {item.isAI && <span className="context-menu-badge">AI</span>}
            </button>
          )
        })}
      </div>
    </Portal>
  )
}

export default ContextMenu
