/**
 * Actions Dropdown component
 * Custom dropdown menu for row actions (works in Shadow DOM)
 */

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Three dots icon for actions trigger
 */
function MoreIcon({ className }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
    </svg>
  )
}

/**
 * Chevron right icon for detail link
 */
function ChevronRightIcon({ className }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

/**
 * ActionsDropdown component
 * @param {object} props
 * @param {Array} props.actions - Array of action objects { label, icon, onClick, variant, disabled, separator }
 * @param {string} props.label - Optional label for the dropdown
 * @param {string} props.align - Dropdown alignment (start, center, end)
 * @param {function} props.onRowClick - Direct click handler (shows chevron instead of dots)
 * @param {boolean} props.showMenu - Show dropdown menu on click (default: true)
 */
export default function ActionsDropdown({
  actions = [],
  label,
  align = 'end',
  className,
  onRowClick,
  showMenu = true,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    const shadowRoot = containerRef.current?.getRootNode()
    if (shadowRoot && shadowRoot !== document) {
      shadowRoot.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (shadowRoot && shadowRoot !== document) {
        shadowRoot.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // If onRowClick is provided and showMenu is false, render simple button
  if (onRowClick && !showMenu) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn('h-8 w-8 p-0 hover:bg-surface-secondary', className)}
        onClick={onRowClick}
      >
        <ChevronRightIcon className="text-muted" />
        <span className="sr-only">Xem chi tiết</span>
      </Button>
    )
  }

  if (!actions.length && !onRowClick) return null

  const TriggerIcon = onRowClick ? ChevronRightIcon : MoreIcon

  const handleItemClick = (action) => {
    if (action.disabled) return
    action.onClick?.()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="sm"
        className={cn('h-8 w-8 p-0 hover:bg-surface-secondary', className)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <TriggerIcon className={onRowClick ? "text-muted" : ""} />
        <span className="sr-only">{onRowClick ? 'Xem chi tiết' : 'Mở menu'}</span>
      </Button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-[100] min-w-[180px] mt-1 py-1 rounded-xl',
            'border border-border bg-surface shadow-xl',
            'animate-in fade-in-0 zoom-in-95 duration-150',
            align === 'end' && 'right-0',
            align === 'start' && 'left-0',
            align === 'center' && 'left-1/2 -translate-x-1/2'
          )}
        >
          {label && (
            <>
              <div className="px-3 py-1.5 text-xs font-medium text-muted uppercase tracking-wider">
                {label}
              </div>
              <div className="h-px bg-border my-1" />
            </>
          )}

          {onRowClick && (
            <>
              <button
                type="button"
                onClick={() => {
                  onRowClick()
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-primary hover:bg-surface-secondary transition-colors text-left"
              >
                <img src="/icon/eye.svg" alt="" className="w-4 h-4 icon-gray" />
                Xem chi tiết
              </button>
              {actions.length > 0 && <div className="h-px bg-border my-1" />}
            </>
          )}

          {actions.map((action, index) => {
            if (action.separator) {
              return <div key={`sep-${index}`} className="h-px bg-border my-1" />
            }

            return (
              <button
                key={action.label || index}
                type="button"
                onClick={() => handleItemClick(action)}
                disabled={action.disabled}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors',
                  'hover:bg-surface-secondary focus:bg-surface-secondary focus:outline-none',
                  action.disabled && 'opacity-50 cursor-not-allowed',
                  action.variant === 'destructive' 
                    ? 'text-destructive hover:bg-destructive/10' 
                    : 'text-primary'
                )}
              >
                {action.icon && <span className="shrink-0">{action.icon}</span>}
                {action.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Named export
export { ActionsDropdown }
