import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import './EditTitleModal.css'

/**
 * EditTitleModal - Compact modal for editing title
 * 
 * @param {boolean} isOpen - Modal display status
 * @param {string} currentTitle - Current title
 * @param {function} onSave - Callback when saving new title
 * @param {function} onClose - Callback when closing modal
 * @param {number} maxLength - Maximum title length (default: 100)
 */
const EditTitleModal = ({ isOpen, currentTitle, onSave, onClose, maxLength = 100 }) => {
  const { t } = useTranslation()
  const [title, setTitle] = useState(currentTitle || '')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle || '')
      // Focus and select all text when opening modal
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
    <div className="edit-title-modal-overlay" onClick={handleOverlayClick}>
      <div className="edit-title-modal">
        <div className="edit-title-modal-header">
          <img src="/icon/pencil.svg" alt={t('common.edit')} className="edit-title-modal-icon" />
          <span>{t('editor.editTitle')}</span>
        </div>

        <div className="edit-title-modal-body">
          <input
            ref={inputRef}
            type="text"
            className="edit-title-modal-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('editor.enterTitle')}
            maxLength={maxLength}
          />
          <div className="edit-title-modal-counter">
            {title.length}/{maxLength}
          </div>
        </div>

        <div className="edit-title-modal-footer">
          <button className="edit-title-modal-btn cancel" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button 
            className="edit-title-modal-btn save" 
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
