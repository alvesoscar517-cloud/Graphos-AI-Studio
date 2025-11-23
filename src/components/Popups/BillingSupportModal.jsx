import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNotification } from '../../hooks/useNotification'
import './BillingSupportModal.css'

const BillingSupportModal = ({ onClose }) => {
  const { success, error: showError } = useNotification()
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const modalRef = useRef(null)

  const categories = [
    'Billing Issue',
    'Payment Failed',
    'Refund Request',
    'Subscription',
    'Invoice',
    'Other'
  ]

  // Không cần useEffect nữa vì đã xử lý onClick trực tiếp trên overlay

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (attachments.length + files.length > 3) {
      setError('Tối đa 3 file đính kèm')
      return
    }

    const newAttachments = []
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 5MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        newAttachments.push({
          name: file.name,
          data: e.target.result
        })
        if (newAttachments.length === files.length) {
          setAttachments([...attachments, ...newAttachments])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!category || !subject.trim() || !description.trim()) {
      setError('Vui lòng điền đầy đủ thông tin')
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
          type: 'billing_support', // Phân biệt với feedback
          category,
          priority: 'high', // Mặc định cao vì người dùng luôn muốn được ưu tiên
          title: subject,
          content: description,
          images: attachments.map(att => att.data),
          userEmail: localStorage.getItem('userEmail') || 'anonymous@user.com',
          userName: localStorage.getItem('userName') || 'Anonymous User'
        })
      })

      const data = await response.json()

      if (response.ok) {
        success('Yêu cầu hỗ trợ đã được gửi! Chúng tôi sẽ phản hồi trong vòng 24h.')
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
    <div className="billing-modal-overlay" onClick={(e) => {
      if (e.target.classList.contains('billing-modal-overlay')) {
        onClose()
      }
    }}>
      <div className="billing-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <div className="billing-modal-header">
          <div className="billing-header-content">
            <img src="/icon/dollar-sign.svg" alt="Billing" className="billing-icon" />
            <div className="billing-header-text">
              <h2>Billing Support</h2>
              <p>Chúng tôi sẵn sàng hỗ trợ bạn 24/7</p>
            </div>
          </div>
          <button className="billing-close-btn" onClick={onClose}>
            <img src="/icon/x.svg" alt="Close" />
          </button>
        </div>

        <div className="billing-content">
          {/* Info Cards */}
          <div className="billing-info-cards">
            <div className="billing-info-card">
              <img src="/icon/clock.svg" alt="Response Time" />
              <h4>Response Time</h4>
              <p>{'< 24h'}</p>
            </div>
            <div className="billing-info-card">
              <img src="/icon/users.svg" alt="Support Team" />
              <h4>Support Team</h4>
              <p>Available</p>
            </div>
            <div className="billing-info-card">
              <img src="/icon/shield-check.svg" alt="Secure" />
              <h4>Secure</h4>
              <p>Encrypted</p>
            </div>
          </div>

          {/* Support Categories */}
          <div className="support-categories">
            <h3>Chọn loại vấn đề</h3>
            <div className="category-chips">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className={`category-chip ${category === cat ? 'selected' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="billing-form">
            <div className="billing-field">
              <label>Tiêu đề</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Mô tả ngắn gọn vấn đề của bạn..."
                maxLength={100}
              />
            </div>

            <div className="billing-field">
              <label>Mô tả chi tiết</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải, bao gồm:&#10;- Thông tin giao dịch (nếu có)&#10;- Thời gian xảy ra vấn đề&#10;- Các bước bạn đã thử&#10;- Ảnh chụp màn hình (nếu có)"
                rows={6}
                maxLength={2000}
              />
              <div className="char-count">{description.length}/2000</div>
            </div>

            <div className="billing-field">
              <label>File đính kèm (tùy chọn, tối đa 3 file)</label>
              <div className="attachment-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={attachments.length >= 3}
                >
                  <img src="/icon/paperclip.svg" alt="Attach" />
                  <span>Đính kèm file</span>
                </button>

                {attachments.length > 0 && (
                  <div className="attachment-list">
                    {attachments.map((att, index) => (
                      <div key={index} className="attachment-item">
                        <img src={att.data} alt={att.name} />
                        <button
                          type="button"
                          className="remove-attachment-btn"
                          onClick={() => removeAttachment(index)}
                        >
                          <img src="/icon/x.svg" alt="Remove" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="billing-error">
                <img src="/icon/alert-circle.svg" alt="Error" />
                {error}
              </div>
            )}

            <div className="billing-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Hủy
              </button>
              <button type="submit" className="btn-submit" disabled={sending}>
                {sending ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default BillingSupportModal
