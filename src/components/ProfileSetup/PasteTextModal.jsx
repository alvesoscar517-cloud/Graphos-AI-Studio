import { useState, useEffect } from 'react'
import './PasteTextModal.css'

const PasteTextModal = ({ isOpen, onClose, onSave }) => {
  const [text, setText] = useState('')
  const [selectedType, setSelectedType] = useState('essay')
  const [wordCount, setWordCount] = useState(0)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setText('')
      setWordCount(0)
      setSelectedType('essay')
    }
  }, [isOpen])

  const handleTextChange = (value) => {
    setText(value)
    const words = value.trim().split(/\s+/).filter(w => w.length > 0)
    setWordCount(words.length)
  }

  const handleSave = () => {
    if (wordCount >= 500) {
      onSave(text)
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  const progress = Math.min((wordCount / 500) * 100, 100)
  const canSave = wordCount >= 500

  return (
    <div className="paste-modal-overlay" onClick={handleClose}>
      <div className="paste-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="paste-modal-header">
          <button className="paste-modal-back-btn" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 className="paste-modal-title">Dán Văn bản</h2>
        </div>

        {/* Tabs */}
        <div className="paste-modal-tabs">
          {[
            { id: 'essay', label: 'Bài luận' },
            { id: 'email', label: 'Email' },
            { id: 'blog', label: 'Blog' },
            { id: 'note', label: 'Ghi chú' },
            { id: 'other', label: 'Khác' }
          ].map(type => (
            <button
              key={type.id}
              className={`paste-modal-tab ${selectedType === type.id ? 'active' : ''}`}
              onClick={() => setSelectedType(type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="paste-modal-content">
          <textarea
            className="paste-modal-textarea"
            placeholder="Dán văn bản dài của bạn vào đây (tối thiểu 500 từ)..."
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
          />
          
          <div className="paste-modal-footer-info">
            <div className="paste-word-count">
              <span className="paste-word-count-number">{wordCount}</span>
              <span className="paste-word-count-text"> / 500 từ yêu cầu</span>
            </div>
            <div className="paste-progress-bar">
              <div 
                className="paste-progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="paste-modal-footer">
          <button className="paste-modal-btn paste-modal-btn-cancel" onClick={handleClose}>
            Hủy
          </button>
          <button 
            className="paste-modal-btn paste-modal-btn-save" 
            onClick={handleSave}
            disabled={!canSave}
          >
            Lưu văn bản
          </button>
        </div>
      </div>
    </div>
  )
}

export default PasteTextModal
