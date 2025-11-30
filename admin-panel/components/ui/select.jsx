import { forwardRef, useId, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

/**
 * Modern custom Select component (no Portal - works in Shadow DOM)
 */
const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select...',
  value,
  onChange,
  className,
  containerClassName,
  disabled,
  ...props
}, ref) => {
  const id = useId()
  const selectId = props.id || id
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const selectedOption = options.find(opt => String(opt.value) === String(value))

  const handleSelect = (optionValue) => {
    onChange?.({ target: { value: optionValue } })
    setIsOpen(false)
  }

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    
    // Handle both regular DOM and Shadow DOM
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

  return (
    <div className={cn('flex flex-col gap-2', containerClassName)} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-medium uppercase tracking-wide text-primary"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Trigger Button */}
        <button
          ref={ref}
          id={selectId}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-lg',
            'border border-border/50 bg-surface-secondary text-primary text-sm text-left',
            'transition-colors duration-200 cursor-pointer',
            'hover:bg-surface',
            'focus:outline-none focus:bg-surface',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            isOpen && 'bg-surface',
            error && 'border-destructive/50 bg-destructive/5',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className={cn('truncate', !selectedOption && 'text-muted')}>
            {selectedOption?.label || placeholder}
          </span>
          <svg
            className={cn(
              'w-4 h-4 text-muted shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className={cn(
              'absolute z-[100] w-full mt-1.5 py-1.5 rounded-xl',
              'border border-border bg-surface shadow-xl',
              'max-h-64 overflow-y-auto',
              'animate-in fade-in-0 zoom-in-95 duration-150'
            )}
            role="listbox"
          >
            {options.map((option) => {
              const isSelected = String(option.value) === String(value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left',
                    'transition-colors duration-150 cursor-pointer',
                    'hover:bg-surface-secondary focus:bg-surface-secondary focus:outline-none',
                    isSelected && 'bg-primary/5 font-medium'
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  {option.icon && (
                    <img src={option.icon} alt="" className="w-4 h-4 icon-dark shrink-0" />
                  )}
                  <span className="flex-1 truncate">{option.label}</span>
                  {isSelected && (
                    <svg 
                      className="w-4 h-4 text-primary shrink-0" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {error && (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export { Select }
export default Select
