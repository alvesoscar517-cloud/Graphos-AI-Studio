import { useState, useEffect, useRef } from 'react'
import './EditTitleModal.css'

/**
 * EditTitleModal - Modal nhỏ gọn để chỉnh sửa title
 * 
 * @param {boolean} isOpen - Trạng thái hiển thị modal
 * @param {string} currentTitle - Title hiện tại
 * @param {function} onSave - Callback khi lưu title mới
 * @param {function} onClose - Callback khi đóng modal
 * @param {number} maxLength - Độ dài tối đa của title (default: 100)
 */
const EditTitleModal = ({ isOpen, currentTitle, onSave, onClose, maxLength = 100 }) => {
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
          <img src="/icon/pencil.svg" alt="Edit" className="edit-title-modal-icon" />
          <span>Chỉnh sửa tiêu đề</span>
        </div>

        <div className="edit-title-modal-body">
          <input
            ref={inputRef}
            type="text"
            className="edit-title-modal-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tiêu đề..."
            maxLength={maxLength}
          />
          <div className="edit-title-modal-counter">
            {title.length}/{maxLength}
          </div>
        </div>

        <div className="edit-title-modal-footer">
          <button className="edit-title-modal-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="edit-title-modal-btn save" 
            onClick={handleSave}
            disabled={!title.trim()}
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditTitleModal
