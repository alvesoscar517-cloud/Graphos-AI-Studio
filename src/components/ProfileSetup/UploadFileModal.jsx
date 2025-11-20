import { useState, useEffect } from 'react'
import './UploadFileModal.css'

const UploadFileModal = ({ isOpen, onClose, onSave }) => {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFiles([])
      setIsDragging(false)
    }
  }, [isOpen])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFiles(selectedFiles)
  }

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase()
      if (!['docx', 'pdf', 'txt'].includes(ext)) {
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        return false
      }
      return true
    })
    setFiles(prev => [...prev, ...validFiles])
  }

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (files.length > 0) {
      onSave(files)
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="upload-modal-overlay" onClick={handleClose}>
      <div className="upload-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="upload-modal-header">
          <button className="upload-modal-back-btn" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 className="upload-modal-title">Tải lên Tài liệu</h2>
        </div>

        {/* Content */}
        <div className="upload-modal-content">
          {/* Drop Zone */}
          <div 
            className={`upload-drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <h3>Kéo & Thả tài liệu vào đây</h3>
            <p>hoặc</p>
            <button 
              className="upload-select-btn"
              onClick={() => document.getElementById('uploadFileInput').click()}
            >
              Chọn tệp từ máy tính
            </button>
            <input
              type="file"
              id="uploadFileInput"
              accept=".docx,.pdf,.txt"
              multiple
              hidden
              onChange={handleFileSelect}
            />
            <p className="upload-hint">Hỗ trợ: .docx, .pdf, .txt (tối đa 10MB mỗi file)</p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="upload-file-list">
              {files.map((file, index) => (
                <div key={index} className="upload-file-item">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                  </svg>
                  <div className="upload-file-info">
                    <div className="upload-file-name">{file.name}</div>
                    <div className="upload-file-size">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button 
                    className="upload-file-remove"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="upload-modal-footer">
          <button className="upload-modal-btn upload-modal-btn-cancel" onClick={handleClose}>
            Hủy
          </button>
          <button 
            className="upload-modal-btn upload-modal-btn-save" 
            onClick={handleSave}
            disabled={files.length === 0}
          >
            Xác nhận ({files.length})
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadFileModal
