import { useCallback, useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import LinkModal from './LinkModal'
import SearchReplacePopover from './SearchReplacePopover'
import Icon from '../Common/Icon'

/**
 * ToolbarButton - Individual toolbar button
 */
const ToolbarButton = ({ 
  icon, 
  label, 
  onClick, 
  isActive = false, 
  disabled = false,
  tooltip,
  className = ''
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn("flex items-center justify-center shrink-0","w-7 h-7 rounded-md","bg-transparent border-none cursor-pointer","transition-all duration-150","hover:bg-bg-hover","disabled:opacity-40 disabled:cursor-not-allowed",
        isActive &&"bg-primary/15 text-primary","max-md:w-6 max-md:h-6",
        className
      )}
      data-tooltip={tooltip || label}
      data-tooltip-position="bottom"
    >
      <Icon 
        name={icon} 
        size="sm" 
        color={isActive ? 'primary' : 'muted'} 
      />
    </button>
  )
}

/**
 * ToolbarDivider - Vertical divider between button groups
 */
const ToolbarDivider = () => (
  <div className="w-px h-4 bg-border-light mx-1.5 shrink-0 max-md:mx-1 max-md:h-3" />
)

/**
 * ColorPicker - Color selection dropdown
 */
const ColorPicker = ({
  colors,
  currentColor,
  onChange,
  disabled = false,
  tooltip = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={pickerRef} className="relative" style={{ overflow: 'visible' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn("flex items-center justify-center","w-7 h-7 rounded-md","bg-transparent border-none cursor-pointer","transition-all duration-150","hover:bg-bg-hover","disabled:opacity-40 disabled:cursor-not-allowed"
        )}
        data-tooltip={tooltip}
        data-tooltip-position="bottom"
      >
        <div className="flex flex-col items-center gap-0">
          <span className="text-sm font-semibold text-text-secondary leading-none">A</span>
          <div 
            className="w-3.5 h-0.5 rounded-full mt-0.5"
            style={{ backgroundColor: currentColor || 'var(--color-text-primary)' }}
          />
        </div>
      </button>
      
      {isOpen && (
        <div 
          className={cn("fixed p-2","bg-bg-primary border border-border-light rounded-lg shadow-popup"
          )}
          style={{
            zIndex: 9999,
            top: pickerRef.current?.getBoundingClientRect().bottom + 4,
            left: pickerRef.current?.getBoundingClientRect().left - 40
          }}
        >
          <div className="grid grid-cols-5 gap-1">
            {colors.map((colorOption) => (
              <button
                key={colorOption.value}
                type="button"
                onClick={() => {
                  onChange(colorOption.value)
                  setIsOpen(false)
                }}
                className={cn("w-6 h-6 rounded-md border-2 cursor-pointer","transition-transform hover:scale-110",
                  currentColor === colorOption.value ?"border-primary" :"border-transparent"
                )}
                style={{ 
                  backgroundColor: colorOption.value === 'default' 
                    ? 'var(--color-bg-secondary)' 
                    : colorOption.color 
                }}
                data-tooltip={colorOption.label}
              >
                {colorOption.value === 'default' && (
                  <Icon name="x" size="xs" color="muted" className="m-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * ToolbarDropdown - Dropdown menu for toolbar
 */
const ToolbarDropdown = ({ 
  icon = null, 
  label, 
  options, 
  value, 
  onChange, 
  disabled = false,
  tooltip = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative shrink-0" style={{ overflow: 'visible' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn("flex items-center justify-center gap-1","h-7 px-2 rounded-md","bg-transparent border-none cursor-pointer","transition-all duration-150","hover:bg-bg-hover","disabled:opacity-40 disabled:cursor-not-allowed","text-xs font-medium text-text-secondary","max-md:h-6 max-md:px-1.5 max-md:text-[11px]"
        )}
        data-tooltip={tooltip || label}
        data-tooltip-position="bottom"
      >
        {icon && <Icon name={icon} size="sm" color="muted" />}
        <span className="max-w-16 truncate max-md:max-w-12">{value || label}</span>
        <Icon name="chevron-down" size="xs" color="muted" />
      </button>
      
      {isOpen && (
        <div 
          className="bg-bg-primary border border-border-light rounded-xl shadow-popup p-1.5"
          style={{
            position: 'fixed',
            zIndex: 9999,
            maxHeight: '256px',
            top: dropdownRef.current?.getBoundingClientRect().bottom + 4,
            left: dropdownRef.current?.getBoundingClientRect().left
          }}
        >
          {options.map((option) => {
            const isActive = value === option.label
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={cn("block w-full px-3 py-1.5 text-left whitespace-nowrap text-sm rounded-lg","border-none bg-transparent cursor-pointer transition-colors",
                  !isActive &&"hover:bg-fill-tertiary",
                  isActive ?"text-primary font-medium" :"text-text-primary"
                )}
                style={option.style}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * EditorToolbar - Full-featured rich text formatting toolbar
 */
const EditorToolbar = ({ 
  editor, 
  visible = true,
  disabled = false,
  className = ''
}) => {
  const { t } = useTranslation()
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const searchButtonRef = useRef(null)

  // Text formatting handlers
  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run()
  }, [editor])

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run()
  }, [editor])

  const toggleUnderline = useCallback(() => {
    editor?.chain().focus().toggleUnderline().run()
  }, [editor])

  const toggleStrike = useCallback(() => {
    editor?.chain().focus().toggleStrike().run()
  }, [editor])

  // Heading handlers
  const setHeading = useCallback((level) => {
    if (level === 0) {
      editor?.chain().focus().setParagraph().run()
    } else {
      editor?.chain().focus().toggleHeading({ level }).run()
    }
  }, [editor])

  // List handlers
  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run()
  }, [editor])

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run()
  }, [editor])

  // Alignment handlers
  const setTextAlign = useCallback((align) => {
    editor?.chain().focus().setTextAlign(align).run()
  }, [editor])

  // Quote and code
  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run()
  }, [editor])

  const toggleCodeBlock = useCallback(() => {
    editor?.chain().focus().toggleCodeBlock().run()
  }, [editor])

  const toggleCode = useCallback(() => {
    editor?.chain().focus().toggleCode().run()
  }, [editor])

  // Subscript/Superscript
  const toggleSubscript = useCallback(() => {
    editor?.chain().focus().toggleSubscript().run()
  }, [editor])

  const toggleSuperscript = useCallback(() => {
    editor?.chain().focus().toggleSuperscript().run()
  }, [editor])

  // Highlight
  const toggleHighlight = useCallback(() => {
    editor?.chain().focus().toggleHighlight().run()
  }, [editor])

  // Clear formatting
  const clearFormatting = useCallback(() => {
    editor?.chain().focus().clearNodes().unsetAllMarks().run()
  }, [editor])

  // Link - open modal
  const openLinkModal = useCallback(() => {
    setShowLinkModal(true)
  }, [])

  const handleLinkSave = useCallback((url) => {
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const handleLinkRemove = useCallback(() => {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run()
  }, [editor])

  const getCurrentLinkUrl = () => {
    return editor?.getAttributes('link').href || ''
  }

  // Horizontal rule
  const insertHorizontalRule = useCallback(() => {
    editor?.chain().focus().setHorizontalRule().run()
  }, [editor])

  // Get current heading level
  const getCurrentHeading = () => {
    if (editor?.isActive('heading', { level: 1 })) return 'H1'
    if (editor?.isActive('heading', { level: 2 })) return 'H2'
    if (editor?.isActive('heading', { level: 3 })) return 'H3'
    if (editor?.isActive('heading', { level: 4 })) return 'H4'
    return t('editor.paragraph') || 'Paragraph'
  }

  // Get current alignment
  const getCurrentAlign = () => {
    if (editor?.isActive({ textAlign: 'center' })) return 'center'
    if (editor?.isActive({ textAlign: 'right' })) return 'right'
    if (editor?.isActive({ textAlign: 'justify' })) return 'justify'
    return 'left'
  }

  // Font family handler
  const setFontFamily = useCallback((fontFamily) => {
    if (fontFamily === 'default') {
      editor?.chain().focus().unsetFontFamily().run()
    } else {
      editor?.chain().focus().setFontFamily(fontFamily).run()
    }
  }, [editor])

  // Text color handler
  const setTextColor = useCallback((color) => {
    if (color === 'default') {
      editor?.chain().focus().unsetColor().run()
    } else {
      editor?.chain().focus().setColor(color).run()
    }
  }, [editor])

  // Get current font family
  const getCurrentFontFamily = () => {
    const fontFamily = editor?.getAttributes('textStyle').fontFamily
    if (!fontFamily) return 'Default'
    if (fontFamily.includes('serif') && !fontFamily.includes('sans')) return 'Serif'
    if (fontFamily.includes('mono')) return 'Mono'
    return 'Sans'
  }

  // Get current text color
  const getCurrentColor = () => {
    return editor?.getAttributes('textStyle').color || ''
  }

  // Heading options
  const headingOptions = [
    { value: 0, label: t('editor.paragraph') || 'Paragraph' },
    { value: 1, label: 'Heading 1', style: { fontSize: '1.25rem', fontWeight: 700 } },
    { value: 2, label: 'Heading 2', style: { fontSize: '1.125rem', fontWeight: 600 } },
    { value: 3, label: 'Heading 3', style: { fontSize: '1rem', fontWeight: 600 } },
    { value: 4, label: 'Heading 4', style: { fontSize: '0.875rem', fontWeight: 600 } },
  ]

  // Font family options
  const fontFamilyOptions = [
    { value: 'default', label: 'Default' },
    { value: 'Inter, system-ui, sans-serif', label: 'Sans Serif', style: { fontFamily: 'Inter, system-ui, sans-serif' } },
    { value: 'Georgia, serif', label: 'Serif', style: { fontFamily: 'Georgia, serif' } },
    { value: 'SF Mono, Monaco, monospace', label: 'Monospace', style: { fontFamily: 'SF Mono, Monaco, monospace' } },
  ]

  // Color options
  const colorOptions = [
    { value: 'default', label: t('editor.defaultColor') || 'Default', color: 'currentColor' },
    { value: '#000000', label: t('editor.black') || 'Black', color: '#000000' },
    { value: '#374151', label: t('editor.gray') || 'Gray', color: '#374151' },
    { value: '#dc2626', label: t('editor.red') || 'Red', color: '#dc2626' },
    { value: '#ea580c', label: t('editor.orange') || 'Orange', color: '#ea580c' },
    { value: '#ca8a04', label: t('editor.yellow') || 'Yellow', color: '#ca8a04' },
    { value: '#16a34a', label: t('editor.green') || 'Green', color: '#16a34a' },
    { value: '#2563eb', label: t('editor.blue') || 'Blue', color: '#2563eb' },
    { value: '#7c3aed', label: t('editor.purple') || 'Purple', color: '#7c3aed' },
    { value: '#db2777', label: t('editor.pink') || 'Pink', color: '#db2777' },
  ]

  if (!visible || !editor) return null

  return (
    <div
      className={cn("flex items-center justify-start gap-0.5 px-3 py-1.5","bg-fill-tertiary rounded-2xl","overflow-x-auto scrollbar-hidden","max-md:px-2 max-md:py-1 max-md:rounded-xl max-md:gap-0","transition-opacity duration-200",
        disabled &&"opacity-50 pointer-events-none",
        className
      )}
    >
      {/* Font Family dropdown */}
      <ToolbarDropdown
        icon="type"
        label={t('editor.fontFamily') || 'Font'}
        options={fontFamilyOptions}
        value={getCurrentFontFamily()}
        onChange={setFontFamily}
        disabled={disabled}
        tooltip={t('editor.fontFamily') || 'Font family'}
      />

      {/* Heading dropdown */}
      <ToolbarDropdown
        label={t('editor.heading') || 'Heading'}
        options={headingOptions}
        value={getCurrentHeading()}
        onChange={setHeading}
        disabled={disabled}
        tooltip={t('editor.textStyle') || 'Text style'}
      />

      <ToolbarDivider />

      {/* Text formatting */}
      <ToolbarButton
        icon="bold"
        label={t('editor.bold') || 'Bold'}
        onClick={toggleBold}
        isActive={editor?.isActive('bold')}
        disabled={disabled}
        tooltip="Bold (Ctrl+B)"
      />
      <ToolbarButton
        icon="italic"
        label={t('editor.italic') || 'Italic'}
        onClick={toggleItalic}
        isActive={editor?.isActive('italic')}
        disabled={disabled}
        tooltip="Italic (Ctrl+I)"
      />
      <ToolbarButton
        icon="underline"
        label={t('editor.underline') || 'Underline'}
        onClick={toggleUnderline}
        isActive={editor?.isActive('underline')}
        disabled={disabled}
        tooltip="Underline (Ctrl+U)"
      />
      <ToolbarButton
        icon="strikethrough"
        label={t('editor.strikethrough') || 'Strikethrough'}
        onClick={toggleStrike}
        isActive={editor?.isActive('strike')}
        disabled={disabled}
        tooltip="Strikethrough"
      />

      <ToolbarDivider />

      {/* Subscript/Superscript */}
      <ToolbarButton
        icon="subscript"
        label={t('editor.subscript') || 'Subscript'}
        onClick={toggleSubscript}
        isActive={editor?.isActive('subscript')}
        disabled={disabled}
        tooltip="Subscript"
      />
      <ToolbarButton
        icon="superscript"
        label={t('editor.superscript') || 'Superscript'}
        onClick={toggleSuperscript}
        isActive={editor?.isActive('superscript')}
        disabled={disabled}
        tooltip="Superscript"
      />

      <ToolbarDivider />

      {/* Text Color */}
      <ColorPicker
        colors={colorOptions}
        currentColor={getCurrentColor()}
        onChange={setTextColor}
        disabled={disabled}
        tooltip={t('editor.textColor') || 'Text color'}
      />

      {/* Highlight & Link */}
      <ToolbarButton
        icon="highlighter"
        label={t('editor.highlight') || 'Highlight'}
        onClick={toggleHighlight}
        isActive={editor?.isActive('highlight')}
        disabled={disabled}
        tooltip="Highlight"
      />
      <ToolbarButton
        icon="link"
        label={t('editor.link') || 'Link'}
        onClick={openLinkModal}
        isActive={editor?.isActive('link')}
        disabled={disabled}
        tooltip="Insert link"
      />

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        icon="list"
        label={t('editor.bulletList') || 'Bullet list'}
        onClick={toggleBulletList}
        isActive={editor?.isActive('bulletList')}
        disabled={disabled}
        tooltip="Bullet list"
      />
      <ToolbarButton
        icon="list-ordered"
        label={t('editor.orderedList') || 'Numbered list'}
        onClick={toggleOrderedList}
        isActive={editor?.isActive('orderedList')}
        disabled={disabled}
        tooltip="Numbered list"
      />

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        icon="align-left"
        label={t('editor.alignLeft') || 'Align left'}
        onClick={() => setTextAlign('left')}
        isActive={getCurrentAlign() === 'left'}
        disabled={disabled}
        tooltip="Align left"
      />
      <ToolbarButton
        icon="align-center"
        label={t('editor.alignCenter') || 'Align center'}
        onClick={() => setTextAlign('center')}
        isActive={getCurrentAlign() === 'center'}
        disabled={disabled}
        tooltip="Align center"
      />
      <ToolbarButton
        icon="align-right"
        label={t('editor.alignRight') || 'Align right'}
        onClick={() => setTextAlign('right')}
        isActive={getCurrentAlign() === 'right'}
        disabled={disabled}
        tooltip="Align right"
      />
      <ToolbarButton
        icon="align-justify"
        label={t('editor.alignJustify') || 'Justify'}
        onClick={() => setTextAlign('justify')}
        isActive={getCurrentAlign() === 'justify'}
        disabled={disabled}
        tooltip="Justify"
      />

      <ToolbarDivider />

      {/* Quote & Code */}
      <ToolbarButton
        icon="quote"
        label={t('editor.blockquote') || 'Quote'}
        onClick={toggleBlockquote}
        isActive={editor?.isActive('blockquote')}
        disabled={disabled}
        tooltip="Block quote"
      />
      <ToolbarButton
        icon="code"
        label={t('editor.code') || 'Code'}
        onClick={toggleCode}
        isActive={editor?.isActive('code')}
        disabled={disabled}
        tooltip="Inline code"
      />
      <ToolbarButton
        icon="terminal"
        label={t('editor.codeBlock') || 'Code block'}
        onClick={toggleCodeBlock}
        isActive={editor?.isActive('codeBlock')}
        disabled={disabled}
        tooltip="Code block"
      />

      <ToolbarDivider />

      {/* Horizontal rule */}
      <ToolbarButton
        icon="minus"
        label={t('editor.horizontalRule') || 'Horizontal line'}
        onClick={insertHorizontalRule}
        disabled={disabled}
        tooltip="Horizontal line"
      />

      {/* Clear formatting */}
      <ToolbarButton
        icon="remove-formatting"
        label={t('editor.clearFormatting') || 'Clear formatting'}
        onClick={clearFormatting}
        disabled={disabled}
        tooltip="Clear formatting"
      />

      <ToolbarDivider />

      {/* Undo/Redo */}
      <ToolbarButton
        icon="undo-2"
        label={t('editor.undo') || 'Undo'}
        onClick={() => editor?.chain().focus().undo().run()}
        disabled={disabled || !editor?.can().undo()}
        tooltip="Undo (Ctrl+Z)"
      />
      <ToolbarButton
        icon="redo-2"
        label={t('editor.redo') || 'Redo'}
        onClick={() => editor?.chain().focus().redo().run()}
        disabled={disabled || !editor?.can().redo()}
        tooltip="Redo (Ctrl+Y)"
      />

      <ToolbarDivider />

      {/* Search */}
      <div ref={searchButtonRef}>
        <ToolbarButton
          icon="search"
          label={t('editor.search') || 'Search'}
          onClick={() => setShowSearch(!showSearch)}
          isActive={showSearch}
          disabled={disabled}
          tooltip={t('editor.searchReplace') || 'Search & Replace (Ctrl+F)'}
        />
      </div>

      {/* Link Modal */}
      <LinkModal
        isOpen={showLinkModal}
        currentUrl={getCurrentLinkUrl()}
        onSave={handleLinkSave}
        onRemove={handleLinkRemove}
        onClose={() => setShowLinkModal(false)}
      />

      {/* Search & Replace Popover */}
      <SearchReplacePopover
        editor={editor}
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        anchorRef={searchButtonRef}
      />
    </div>
  )
}

export default EditorToolbar
