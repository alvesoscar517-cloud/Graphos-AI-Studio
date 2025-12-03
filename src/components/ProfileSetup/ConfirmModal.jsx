/**
 * ConfirmModal - Inline confirmation modal for ProfileSetup
 * Renders inside the profile-setup-page instead of document.body
 */
import { useEffect, useCallback } from 'react'
import { cn } from '../../lib/utils'

const ConfirmModal = ({
  isOpen,
  title = 'Confirm',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // warning, question, info
  danger = false,
  onConfirm,
  onCancel
}) => {
  // Handle ESC key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && onCancel) {
      onCancel()
    }
  }, [onCancel])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const iconMap = {
    warning: 'alert-triangle',
    question: 'help-circle',
    info: 'info'
  }

  const icon = iconMap[type] || 'alert-triangle'

  const iconBgColors = {
    warning: 'bg-icon-warning',
    question: 'bg-icon-info',
    info: 'bg-icon-info'
  }

  const iconFilterClasses = {
    warning: 'filter-icon-warning',
    question: 'filter-icon-primary',
    info: 'filter-icon-primary'
  }

  return (
    <div 
      className={cn(
        "absolute inset-0 bg-black/30 backdrop-blur-sm",
        "flex items-center justify-center z-sidebar",
        "animate-fade-in"
      )}
      onClick={onCancel}
    >
      <div 
        className={cn(
          "bg-white rounded-3xl max-w-modal-sm w-11/12 py-6 px-7",
          "shadow-modal",
          "animate-scale-in"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shrink-0",
            iconBgColors[type]
          )}>
            <img 
              src={`/icon/${icon}.svg`} 
              alt={type} 
              className={cn("w-7 h-7", iconFilterClasses[type])}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-text-primary m-0 mb-1.5 leading-tight">
              {title}
            </h3>
            <p className="text-sm text-text-secondary m-0 leading-normal">
              {message}
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button 
            className={cn(
              "py-2.5 px-6 rounded-xl text-sm font-medium cursor-pointer",
              "transition-all duration-150 border-none outline-none",
              "bg-bg-tertiary text-text-primary hover:bg-bg-hover"
            )}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={cn(
              "py-2.5 px-6 rounded-xl text-sm font-medium cursor-pointer",
              "transition-all duration-150 border-none outline-none text-white",
              danger 
                ? "bg-error hover:bg-red-600" 
                : "bg-primary hover:bg-primary-hover"
            )}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
