/**
 * ConfirmModal - Inline confirmation modal for ProfileSetup
 * Renders inside the profile-setup-page instead of document.body
 */
import { useEffect, useCallback } from 'react'
import './ConfirmModal.css'

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

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <div className={`confirm-modal-icon ${type}`}>
            <img src={`/icon/${icon}.svg`} alt={type} />
          </div>
          <div className="confirm-modal-header-text">
            <h3 className="confirm-modal-title">{title}</h3>
            <p className="confirm-modal-message">{message}</p>
          </div>
        </div>
        <div className="confirm-modal-footer">
          <button 
            className="confirm-modal-button secondary" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-modal-button ${danger ? 'danger' : 'primary'}`}
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
