import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'

/**
 * LinkModal - Modal for inserting/editing links
 */
const LinkModal = ({ isOpen, currentUrl = '', onSave, onRemove, onClose }) => {
  const { t } = useTranslation()
  const [url, setUrl] = useState(currentUrl || '')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setUrl(currentUrl || '')
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }, 50)
    }
  }, [isOpen, currentUrl])

  const handleSave = () => {
    const trimmedUrl = url.trim()
    if (trimmedUrl) {
      // Auto-add https:// if no protocol
      const finalUrl = trimmedUrl.match(/^https?:\/\//) 
        ? trimmedUrl 
        : `https://${trimmedUrl}`
      onSave(finalUrl)
    }
    onClose()
  }

  const handleRemove = () => {
    onRemove?.()
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-menu"
      onClick={handleOverlayClick}
    >
      <div className={cn(
        "bg-bg-primary border border-border-light rounded-2xl shadow-popup",
        "w-full max-w-md m-4 overflow-hidden p-5",
        "animate-slide-up-fast"
      )}>
        {/* Header */}
        <div className="flex items-center gap-2.5 text-md font-medium text-text-primary mb-4">
          <img 
            src="/icon/link.svg" 
            alt={t('editor.link')} 
            className="w-icon-md h-icon-md opacity-70 icon-invert" 
          />
          <span>{currentUrl ? t('editor.editLink') : t('editor.insertLink')}</span>
        </div>

        {/* Body */}
        <div className="mb-4">
          <input
            ref={inputRef}
            type="url"
            className={cn(
              "w-full py-3 px-3.5 text-sm rounded-xl outline-none box-border",
              "border border-border-light",
              "bg-bg-secondary",
              "text-text-primary",
              "placeholder:text-text-muted"
            )}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between">
          <div>
            {currentUrl && (
              <button 
                className={cn(
                  "py-2 px-4 text-sm font-medium rounded-pill cursor-pointer border-none",
                  "bg-transparent text-system-red",
                  "transition-colors duration-150",
                  "hover:bg-system-red/10"
                )}
                onClick={handleRemove}
              >
                {t('editor.removeLink')}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              className={cn(
                "py-2 px-5 text-sm font-medium rounded-pill cursor-pointer border-none",
                "bg-transparent text-text-secondary",
                "transition-colors duration-150",
                "hover:bg-bg-tertiary hover:text-text-primary"
              )}
              onClick={onClose}
            >
              {t('common.cancel')}
            </button>
            <button 
              className={cn(
                "py-2 px-5 text-sm font-medium rounded-pill cursor-pointer border-none",
                "bg-accent text-white",
                "transition-colors duration-150",
                "hover:bg-accent-hover",
                "disabled:bg-border-hover",
                "disabled:text-text-muted",
                "disabled:cursor-not-allowed"
              )}
              onClick={handleSave}
              disabled={!url.trim()}
            >
              {currentUrl ? t('common.save') : t('editor.insert')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LinkModal
