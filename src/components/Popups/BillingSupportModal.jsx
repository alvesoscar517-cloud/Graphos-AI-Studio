import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useNotification } from '../../hooks/useNotification'
import './BillingSupportModal.css'

const BillingSupportModal = ({ onClose }) => {
  const { t } = useTranslation()
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
    { key: 'billingIssue', label: t('billing.billingIssue') },
    { key: 'paymentFailed', label: t('billing.paymentFailed') },
    { key: 'refundRequest', label: t('billing.refundRequest') },
    { key: 'creditPurchase', label: t('billing.creditPurchase') },
    { key: 'invoice', label: t('billing.invoice') },
    { key: 'other', label: t('billing.other') }
  ]

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (attachments.length + files.length > 3) {
      setError(t('errors.maxAttachments'))
      return
    }

    const newAttachments = []
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('errors.fileSizeLimit'))
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
      setError(t('errors.fillAllRequired'))
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
          type: 'billing_support',
          category,
          priority: 'high',
          title: subject,
          content: description,
          images: attachments.map(att => att.data),
          userEmail: localStorage.getItem('userEmail') || 'anonymous@user.com',
          userName: localStorage.getItem('userName') || 'Anonymous User'
        })
      })

      const data = await response.json()

      if (response.ok) {
        success(t('billing.supportRequestSent'))
        onClose()
      } else {
        setError(data.error || t('feedback.errorOccurred'))
      }
    } catch (err) {
      setError(t('feedback.unableToConnect'))
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
            <img src="/icon/dollar-sign.svg" alt={t('settings.billingSupport')} className="billing-icon" />
            <div className="billing-header-text">
              <h2>{t('settings.billingSupport')}</h2>
              <p>{t('billing.readyToSupport')}</p>
            </div>
          </div>
          <button className="billing-close-btn" onClick={onClose}>
            <img src="/icon/x.svg" alt={t('common.close')} />
          </button>
        </div>

        <div className="billing-content">
          {/* Info Cards */}
          <div className="billing-info-cards">
            <div className="billing-info-card">
              <img src="/icon/clock.svg" alt={t('billing.responseTime')} />
              <h4>{t('billing.responseTime')}</h4>
              <p>{'< 24h'}</p>
            </div>
            <div className="billing-info-card">
              <img src="/icon/users.svg" alt={t('billing.supportTeam')} />
              <h4>{t('billing.supportTeam')}</h4>
              <p>{t('billing.available')}</p>
            </div>
            <div className="billing-info-card">
              <img src="/icon/shield-check.svg" alt={t('billing.secure')} />
              <h4>{t('billing.secure')}</h4>
              <p>{t('billing.encrypted')}</p>
            </div>
          </div>

          {/* Support Categories */}
          <div className="support-categories">
            <h3>{t('billing.selectIssueType')}</h3>
            <div className="category-chips">
              {categories.map((cat) => (
                <div
                  key={cat.key}
                  className={`category-chip ${category === cat.key ? 'selected' : ''}`}
                  onClick={() => setCategory(cat.key)}
                >
                  {cat.label}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="billing-form">
            <div className="billing-field">
              <label>{t('feedback.title')}</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('billing.briefDescription')}
                maxLength={100}
              />
            </div>

            <div className="billing-field">
              <label>{t('billing.detailedDescription')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('billing.descriptionPlaceholder')}
                rows={6}
                maxLength={2000}
              />
              <div className="char-count">{description.length}/2000</div>
            </div>

            <div className="billing-field">
              <label>{t('billing.attachments')}</label>
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
                  <img src="/icon/paperclip.svg" alt={t('billing.attachFile')} />
                  <span>{t('billing.attachFile')}</span>
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
                          <img src="/icon/x.svg" alt={t('common.remove')} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="billing-error">
                <img src="/icon/alert-circle.svg" alt={t('common.error')} />
                {error}
              </div>
            )}

            <div className="billing-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                {t('common.cancel')}
              </button>
              <button type="submit" className="btn-submit" disabled={sending}>
                {sending ? t('feedback.sending') : t('billing.sendRequest')}
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
