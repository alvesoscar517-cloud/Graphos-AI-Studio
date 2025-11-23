import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNotification } from '../../hooks/useNotification'
import './FeedbackModal.css'

const FeedbackModal = ({ onClose }) => {
  const { success, error: showError } = useNotification()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const modalRef = useRef(null)

  // Không cần useEffect nữa vì đã xử lý onClick trực tiếp trên overlay

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 3) {
      setError('Tối đa 3 hình ảnh')
      return
    }

    const newImages = []
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước ảnh không được vượt quá 5MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        newImages.push({
          name: file.name,
          data: e.target.result
        })
        if (newImages.length === files.length) {
          setImages([...images, ...newImages])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      setError('Vui lòng nhập tiêu đề và nội dung')
      return
    }

    setSending(true)
    setError('')

    try {
      const response = await fetch('https://ai-authenticator-472729326429.us-central1.run.app/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          content,
          images: images.map(img => img.data),
          userEmail: localStorage.getItem('userEmail') || 'anonymous@user.com',
          userName: localStorage.getItem('userName') || 'Anonymous User'
        })
      })

      const data = await response.json()

      if (response.ok) {
        success('Cảm ơn bạn đã gửi feedback! Chúng tôi sẽ phản hồi sớm.')
        onClose()
      } else {
        setError(data.error || 'Có lỗi xảy ra, vui lòng thử lại')
      }
    } catch (err) {
      setError('Không thể kết nối đến server')
    } finally {
      setSending(false)
    }
  }

  return createPortal(
    <div className="feedback-modal-overlay" onClick={(e) => {
      if (e.target.classList.contains('feedback-modal-overlay')) {
        onClose()
      }
    }}>
      <div className="feedback-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <div className="feedback-modal-header">
          <h2>Send Feedback</h2>
          <button className="feedback-close-btn" onClick={onClose}>
            <img src="/icon/x.svg" alt="Close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="feedback-field">
            <label>Tiêu đề</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề feedback..."
              maxLength={100}
            />
          </div>

          <div className="feedback-field">
            <label>Nội dung</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Mô tả chi tiết feedback của bạn..."
              rows={6}
              maxLength={2000}
            />
            <div className="char-count">{content.length}/2000</div>
          </div>

          <div className="feedback-field">
            <label>Hình ảnh (tùy chọn, tối đa 3 ảnh)</label>
            <div className="image-upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 3}
              >
                <img src="/icon/image-plus.svg" alt="Upload" />
                <span>Thêm ảnh</span>
              </button>

              {images.length > 0 && (
                <div className="image-preview-list">
                  {images.map((img, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={img.data} alt={img.name} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                      >
                        <img src="/icon/x.svg" alt="Remove" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && <div className="feedback-error">{error}</div>}

          <div className="feedback-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={sending}>
              {sending ? 'Đang gửi...' : 'Gửi Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default FeedbackModal
