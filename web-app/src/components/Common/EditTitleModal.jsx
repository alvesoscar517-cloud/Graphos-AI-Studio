import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'

/**
 * EditTitleModal - Compact modal for editing title
 */
const EditTitleModal = ({ isOpen, currentTitle, onSave, onClose, maxLength = 100 }) => {
  const { t } = useTranslation()
  const [title, setTitle] = useState(currentTitle || '')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle || '')
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }, 50)
    }
  }, [isOpen, currentTitle])

  const handleSave = () => {
    const trimmedTitle = title.trim()
    if (trimmedTitle && trimmedTitle !== currentTitle) {
      onSave(trimmedTitle.substring(0, maxLength))
    }
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
      className={cn(
        "fixed inset-0 flex items-center justify-center z-menu",
        "bg-black/5 backdrop-blur-[1px]",
        "max-md:items-end max-md:p-3"
      )}
      onClick={handleOverlayClick}
    >
      <div className={cn(
        "bg-bg-primary border border-border-light rounded-2xl shadow-popup",
        "w-full max-w-md m-4 overflow-hidden p-5",
        "animate-slide-up-fast",
        "max-md:max-w-full max-md:m-0 max-md:rounded-t-2xl max-md:rounded-b-none"
      )}>
        {/* Header */}
        <div className="flex items-center gap-2.5 text-md font-medium text-text-primary mb-4">
          <img 
            src="/icon/pencil.svg" 
            alt={t('common.edit')} 
            className="w-icon-md h-icon-md opacity-70 icon-invert" 
          />
          <span>{t('editor.editTitle')}</span>
        </div>

        {/* Body */}
        <div className="mb-4">
          <input
            ref={inputRef}
            type="text"
            className={cn(
              "w-full py-3 px-3.5 text-sm rounded-xl outline-none box-border",
              "border border-border-light",
              "bg-bg-secondary",
              "text-text-primary",
              "placeholder:text-text-muted"
            )}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('editor.enterTitle')}
            maxLength={maxLength}
          />
          <div className="text-right text-2xs text-text-muted mt-1.5">
            {title.length}/{maxLength}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2">
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
            disabled={!title.trim()}
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditTitleModal
