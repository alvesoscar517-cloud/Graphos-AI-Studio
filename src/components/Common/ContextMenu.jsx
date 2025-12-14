import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Portal from './Portal'

const ContextMenu = () => {
  const { t } = useTranslation()
  
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [targetElement, setTargetElement] = useState(null)
  const [hasSelection, setHasSelection] = useState(false)
  const [canPaste, setCanPaste] = useState(false)
  const menuRef = useRef(null)

  const [isTextSelection, setIsTextSelection] = useState(false)
  const [isTiptapSelection, setIsTiptapSelection] = useState(false)
  const [selectedText, setSelectedText] = useState('')

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

  const textSelectionMenuItems = [
    { id: 'copy', labelKey: 'common.copy', shortcut: 'Ctrl+C', icon: 'copy' },
  ]
  
  const tiptapSelectionMenuItems = [
    { id: 'copy', labelKey: 'common.copy', shortcut: 'Ctrl+C', icon: 'copy' },
    { id: 'cut', labelKey: 'common.cut', shortcut: 'Ctrl+X', icon: 'cut' },
  ]

  const menuItems = isTiptapSelection 
    ? tiptapSelectionMenuItems 
    : (isTextSelection ? textSelectionMenuItems : editableMenuItems)

  const isEditableElement = (element) => {
    if (!element) return false
    const tagName = element.tagName?.toLowerCase()
    return tagName === 'input' || tagName === 'textarea' || element.isContentEditable
  }
  
  const isTiptapElement = (element) => {
    if (!element) return false
    return element.closest('.tiptap-editor') || element.closest('.ProseMirror')
  }

  const handleContextMenu = useCallback((e) => {
    const target = e.target
    const windowSelection = window.getSelection()
    const selectedTextValue = windowSelection?.toString()?.trim()
    
    if (isTiptapElement(target) && selectedTextValue) {
      e.preventDefault()
      setIsTextSelection(false)
      setIsTiptapSelection(true)
      setHasSelection(true)
      setCanPaste(false)
      setSelectedText(selectedTextValue)
      setTargetElement(target)
    } else if (isEditableElement(target)) {
      e.preventDefault()
      setIsTextSelection(false)
      setIsTiptapSelection(false)
      const selection = target.selectionStart !== target.selectionEnd
      setHasSelection(selection)
      setCanPaste(true)
      setTargetElement(target)
      setSelectedText('')
    } else if (selectedTextValue) {
      e.preventDefault()
      setIsTextSelection(true)
      setIsTiptapSelection(false)
      setHasSelection(true)
      setCanPaste(false)
      setTargetElement(null)
      setSelectedText(selectedTextValue)
    } else {
      e.preventDefault()
      return
    }
    
    let x = e.clientX
    let y = e.clientY
    const menuWidth = 200
    const menuHeight = isTiptapSelection ? 80 : (isTextSelection ? 50 : 260)
    
    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 8
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 8
    
    setPosition({ x, y })
    setIsVisible(true)
  }, [])

  const handleClickOutside = useCallback((e) => {
    if (isVisible && menuRef.current && !menuRef.current.contains(e.target)) {
      setIsVisible(false)
    }
  }, [isVisible])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setIsVisible(false)
  }, [])

  const handleScroll = useCallback(() => {
    if (isVisible) setIsVisible(false)
  }, [isVisible])

  const executeAction = useCallback((actionId) => {
    if (isTiptapSelection) {
      if (actionId === 'copy') {
        navigator.clipboard.writeText(selectedText).catch(() => document.execCommand('copy'))
        setIsVisible(false)
        return
      }
      if (actionId === 'cut') {
        navigator.clipboard.writeText(selectedText).then(() => document.execCommand('delete')).catch(() => document.execCommand('cut'))
        setIsVisible(false)
        return
      }
    }
    
    if (isTextSelection && actionId === 'copy') {
      const selectedTextValue = window.getSelection()?.toString()
      if (selectedTextValue) navigator.clipboard.writeText(selectedTextValue).catch(() => document.execCommand('copy'))
      setIsVisible(false)
      return
    }
    
    if (!targetElement) return
    targetElement.focus()
    
    switch (actionId) {
      case 'cut': document.execCommand('cut'); break
      case 'copy': document.execCommand('copy'); break
      case 'paste':
        navigator.clipboard.readText().then(text => {
          const start = targetElement.selectionStart
          const end = targetElement.selectionEnd
          const value = targetElement.value
          targetElement.value = value.substring(0, start) + text + value.substring(end)
          targetElement.selectionStart = targetElement.selectionEnd = start + text.length
          targetElement.dispatchEvent(new Event('input', { bubbles: true }))
        }).catch(() => document.execCommand('paste'))
        break
      case 'selectAll': targetElement.select(); break
      case 'undo': document.execCommand('undo'); break
      case 'redo': document.execCommand('redo'); break
      default: break
    }
    setIsVisible(false)
  }, [targetElement, isTextSelection, isTiptapSelection, selectedText])

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

  const getIcon = (iconName) => {
    const icons = {
      'cut': (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>),
      'copy': (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>),
      'paste': (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>),
      'select-all': (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>),
      'undo': (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>),
      'redo': (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>),
    }
    return icons[iconName] || null
  }

  if (!isVisible) return null

  return (
    <Portal containerId="context-menu-root">
      <div ref={menuRef} className="context-menu" style={{ position: 'fixed', left: position.x, top: position.y }}>
        {menuItems.map((item) => {
          if (item.type === 'divider') return <div key={item.id} className="context-menu-divider" />
          const isDisabled = (item.requiresSelection && !hasSelection) || (item.requiresPaste && !canPaste)
          return (
            <button key={item.id} className={`context-menu-item ${isDisabled ? 'disabled' : ''}`} onClick={() => !isDisabled && executeAction(item.id)} disabled={isDisabled}>
              <span className="context-menu-icon">{getIcon(item.icon)}</span>
              <span className="context-menu-label">{t(item.labelKey)}</span>
              {item.shortcut && <span className="context-menu-shortcut">{item.shortcut}</span>}
            </button>
          )
        })}
      </div>
    </Portal>
  )
}

export default ContextMenu
