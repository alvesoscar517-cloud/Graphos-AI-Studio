import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import Icon from '../Common/Icon'

/**
 * SearchReplacePopover - Search and replace functionality for editor
 * Uses SearchHighlightExtension for proper ProseMirror decorations
 */
const SearchReplacePopover = ({ 
  editor, 
  isOpen, 
  onClose,
  anchorRef
}) => {
  const { t } = useTranslation()
  const [searchText, setSearchText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [showReplace, setShowReplace] = useState(false)
  const [matchCount, setMatchCount] = useState(0)
  const [currentMatch, setCurrentMatch] = useState(0)
  const searchInputRef = useRef(null)
  const popoverRef = useRef(null)

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
    // Clear search when closed
    if (!isOpen && editor) {
      editor.commands.clearSearch?.()
      setSearchText('')
      setMatchCount(0)
      setCurrentMatch(0)
    }
  }, [isOpen, editor])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Update search when text changes
  useEffect(() => {
    if (!editor) return

    const timer = setTimeout(() => {
      if (searchText.trim()) {
        // Use extension command to set search term
        editor.commands.setSearchTerm?.(searchText)
        
        // Get results after a small delay to let decorations update
        setTimeout(() => {
          const results = editor.storage?.searchHighlight?.results || []
          setMatchCount(results.length)
          if (results.length > 0) {
            setCurrentMatch(1)
            editor.commands.setSearchIndex?.(0)
            // Scroll to first match
            scrollToMatch(results[0])
          } else {
            setCurrentMatch(0)
          }
        }, 50)
      } else {
        editor.commands.clearSearch?.()
        setMatchCount(0)
        setCurrentMatch(0)
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [searchText, editor])

  // Scroll to a match position
  const scrollToMatch = useCallback((match) => {
    if (!editor || !match) return

    try {
      const { view } = editor
      if (view) {
        const coords = view.coordsAtPos(match.from)
        if (coords) {
          const editorElement = view.dom.closest('.tiptap-editor-container')
          if (editorElement) {
            const editorRect = editorElement.getBoundingClientRect()
            if (coords.top < editorRect.top || coords.bottom > editorRect.bottom) {
              // Scroll the match into view
              const scrollContainer = view.dom.closest('.ProseMirror')
              if (scrollContainer) {
                const relativeTop = coords.top - editorRect.top + scrollContainer.scrollTop
                scrollContainer.scrollTo({
                  top: relativeTop - editorRect.height / 2,
                  behavior: 'smooth'
                })
              }
            }
          }
        }
      }
    } catch (e) {
      // Ignore scroll errors
    }
  }, [editor])

  // Navigate to next match
  const goToNext = useCallback(() => {
    if (!editor || matchCount === 0) return
    
    const results = editor.storage?.searchHighlight?.results || []
    const next = currentMatch >= matchCount ? 1 : currentMatch + 1
    setCurrentMatch(next)
    editor.commands.setSearchIndex?.(next - 1)
    
    if (results[next - 1]) {
      scrollToMatch(results[next - 1])
    }
  }, [editor, matchCount, currentMatch, scrollToMatch])

  // Navigate to previous match
  const goToPrev = useCallback(() => {
    if (!editor || matchCount === 0) return
    
    const results = editor.storage?.searchHighlight?.results || []
    const prev = currentMatch <= 1 ? matchCount : currentMatch - 1
    setCurrentMatch(prev)
    editor.commands.setSearchIndex?.(prev - 1)
    
    if (results[prev - 1]) {
      scrollToMatch(results[prev - 1])
    }
  }, [editor, matchCount, currentMatch, scrollToMatch])

  // Replace current match
  const replaceCurrent = useCallback(() => {
    if (!editor || matchCount === 0 || currentMatch === 0) return
    
    const results = editor.storage?.searchHighlight?.results || []
    const match = results[currentMatch - 1]
    
    if (match) {
      // Select and replace the match
      editor.chain()
        .focus()
        .setTextSelection({ from: match.from, to: match.to })
        .insertContent(replaceText)
        .run()
      
      // Re-search after replace
      setTimeout(() => {
        editor.commands.setSearchTerm?.(searchText)
        setTimeout(() => {
          const newResults = editor.storage?.searchHighlight?.results || []
          setMatchCount(newResults.length)
          if (newResults.length > 0) {
            const newIndex = Math.min(currentMatch, newResults.length)
            setCurrentMatch(newIndex)
            editor.commands.setSearchIndex?.(newIndex - 1)
          } else {
            setCurrentMatch(0)
          }
          searchInputRef.current?.focus()
        }, 50)
      }, 10)
    }
  }, [editor, matchCount, currentMatch, replaceText, searchText])

  // Replace all matches
  const replaceAll = useCallback(() => {
    if (!editor || matchCount === 0 || !searchText) return
    
    // Get HTML content and replace all occurrences
    const content = editor.getHTML()
    const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const newContent = content.replace(regex, replaceText)
    
    editor.commands.setContent(newContent)
    editor.commands.clearSearch?.()
    
    setMatchCount(0)
    setCurrentMatch(0)
  }, [editor, matchCount, searchText, replaceText])

  // Handle Enter key in search input
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (e.shiftKey) {
        goToPrev()
      } else {
        goToNext()
      }
    }
  }

  // Prevent editor from capturing keystrokes
  const handleInputFocus = useCallback(() => {
    if (editor) {
      editor.commands.blur()
    }
  }, [editor])

  // Stop propagation to prevent editor interaction
  const handlePopoverClick = useCallback((e) => {
    e.stopPropagation()
  }, [])

  if (!isOpen) return null

  // Calculate position - align to right side of toolbar
  const anchorRect = anchorRef?.current?.getBoundingClientRect()
  const popoverStyle = {
    zIndex: 9999,
    top: anchorRect ? anchorRect.bottom + 8 : 120,
    left: anchorRect ? Math.max(16, anchorRect.left - 280) : 'auto',
    right: anchorRect ? 'auto' : 24
  }

  return (
    <div
      ref={popoverRef}
      className={cn(
        "fixed bg-bg-primary border border-border-light rounded-xl shadow-popup",
        "p-3 w-80"
      )}
      style={popoverStyle}
      onClick={handlePopoverClick}
      onMouseDown={handlePopoverClick}
    >
      {/* Search row */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Icon 
            name="search" 
            size="sm" 
            color="muted" 
            className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={handleInputFocus}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder={t('editor.searchPlaceholder') || 'Search...'}
            className={cn(
              "w-full h-8 pl-8 pr-3 text-sm",
              "bg-bg-secondary border border-border-light rounded-full",
              "text-text-primary placeholder:text-text-muted",
              "focus:outline-none"
            )}
          />
        </div>
        
        {/* Match count */}
        <span className="text-xs text-text-muted whitespace-nowrap min-w-12 text-center">
          {searchText ? (matchCount > 0 ? `${currentMatch}/${matchCount}` : '0/0') : ''}
        </span>

        {/* Navigation buttons */}
        <button
          type="button"
          onClick={goToPrev}
          disabled={matchCount === 0}
          className={cn(
            "w-6 h-6 flex items-center justify-center rounded",
            "bg-transparent border-none cursor-pointer",
            "hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed"
          )}
          data-tooltip={t('editor.previousMatch') || 'Previous'}
        >
          <Icon name="chevron-up" size="sm" color="muted" />
        </button>
        <button
          type="button"
          onClick={goToNext}
          disabled={matchCount === 0}
          className={cn(
            "w-6 h-6 flex items-center justify-center rounded",
            "bg-transparent border-none cursor-pointer",
            "hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed"
          )}
          data-tooltip={t('editor.nextMatch') || 'Next'}
        >
          <Icon name="chevron-down" size="sm" color="muted" />
        </button>

        {/* Toggle replace */}
        <button
          type="button"
          onClick={() => setShowReplace(!showReplace)}
          className={cn(
            "w-6 h-6 flex items-center justify-center rounded",
            "bg-transparent border-none cursor-pointer",
            "hover:bg-bg-hover",
            showReplace && "bg-primary/15"
          )}
          data-tooltip={t('editor.toggleReplace') || 'Replace'}
        >
          <Icon name="replace" size="sm" color={showReplace ? 'primary' : 'muted'} />
        </button>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "w-6 h-6 flex items-center justify-center rounded",
            "bg-transparent border-none cursor-pointer",
            "hover:bg-bg-hover"
          )}
        >
          <Icon name="x" size="sm" color="muted" />
        </button>
      </div>

      {/* Replace row */}
      {showReplace && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="relative flex-1">
            <Icon 
              name="replace" 
              size="sm" 
              color="muted" 
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              onFocus={handleInputFocus}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder={t('editor.replacePlaceholder') || 'Replace with...'}
              className={cn(
                "w-full h-8 pl-8 pr-3 text-sm",
                "bg-bg-secondary border border-border-light rounded-full",
                "text-text-primary placeholder:text-text-muted",
                "focus:outline-none"
              )}
            />
          </div>
          
          <button
            type="button"
            onClick={replaceCurrent}
            disabled={matchCount === 0}
            className={cn(
              "h-7 px-3 text-xs font-medium rounded-full",
              "bg-transparent border border-border-light",
              "text-text-primary cursor-pointer",
              "hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {t('editor.replace') || 'Replace'}
          </button>
          <button
            type="button"
            onClick={replaceAll}
            disabled={matchCount === 0}
            className={cn(
              "h-7 px-3 text-xs font-medium rounded-full",
              "bg-primary text-white border-none cursor-pointer",
              "hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {t('editor.replaceAll') || 'All'}
          </button>
        </div>
      )}
    </div>
  )
}

export default SearchReplacePopover
