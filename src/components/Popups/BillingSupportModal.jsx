/**
 * BillingSupportModal Component
 * Uses React Hook Form + Zod + TanStack Query
 */
import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToasts } from '../../stores/uiStore'
import { useSendBillingSupport } from '@/hooks/queries'
import Icon from '../Common/Icon'
import { cn } from '../../lib/utils'

// Validation schema
const billingSupportSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be at most 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be at most 2000 characters'),
})

const BillingSupportModal = ({ onClose }) => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToasts()
  const [attachments, setAttachments] = useState([])
  const fileInputRef = useRef(null)
  const modalRef = useRef(null)

  // TanStack Query mutation
  const sendBillingSupport = useSendBillingSupport()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(billingSupportSchema),
    defaultValues: {
      category: '',
      subject: '',
      description: '',
    },
    mode: 'onBlur',
  })

  const isSubmitting = sendBillingSupport.isPending

  const category = watch('category')
  const description = watch('description', '')

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
      showError(t('errors.maxAttachments'))
      return
    }

    const newAttachments = []
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        showError(t('errors.fileSizeLimit'))
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        newAttachments.push({
          name: file.name,
          data: e.target.result
        })
        if (newAttachments.length === files.length) {
          setAttachments(prev => [...prev, ...newAttachments])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const onSubmit = async (data) => {
    try {
      await sendBillingSupport.mutateAsync({
        category: data.category,
        subject: data.subject,
        description: data.description,
        attachments: attachments.map(att => att.data),
      })
      showSuccess(t('billing.supportRequestSent'))
      onClose()
    } catch (err) {
      setError('root', { message: err.message || t('feedback.unableToConnect') })
    }
  }

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-toast animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        ref={modalRef} 
        className={cn(
          "bg-bg-primary rounded-2xl w-[90%] max-w-[600px] max-h-[90vh]",
          "flex flex-col overflow-hidden shadow-modal",
          "animate-slide-up"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between py-5 px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="card-icon !w-10 !h-10">
              <Icon name="dollar-sign" alt={t('settings.billingSupport')} size="lg" color="muted" />
            </div>
            <div>
              <h2 className="m-0 text-xl font-semibold text-text-primary">{t('settings.billingSupport')}</h2>
              <p className="m-0 mt-0.5 text-sm text-text-secondary">{t('billing.readyToSupport')}</p>
            </div>
          </div>
          <button className="bg-transparent border-none cursor-pointer p-2 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-bg-hover" onClick={onClose}>
            <Icon name="x" alt={t('common.close')} size="lg" color="muted" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { icon: '/icon/clock.svg', title: t('billing.responseTime'), value: '< 24h' },
              { icon: '/icon/users.svg', title: t('billing.supportTeam'), value: t('billing.available') },
              { icon: '/icon/shield-check.svg', title: t('billing.secure'), value: t('billing.encrypted') }
            ].map((card, idx) => (
              <div key={idx} className="p-3 bg-bg-secondary rounded-xl text-center">
                <img src={card.icon} alt={card.title} className="w-5 h-5 mx-auto mb-1.5 opacity-60 icon-invert" />
                <p className="m-0 text-xs text-text-muted">{card.title}</p>
                <p className="m-0 text-sm font-semibold text-text-primary">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Support Categories */}
          <div className="mb-6">
            <h3 className="m-0 mb-3 text-md font-semibold text-text-primary">{t('billing.selectIssueType')}</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.key}
                  className={cn(
                    "py-2 px-4 bg-bg-secondary border border-border rounded-pill",
                    "text-sm text-text-primary cursor-pointer transition-all duration-200 select-none",
                    "hover:border-accent hover:bg-bg-hover",
                    category === cat.key && "bg-primary text-white border-accent"
                  )}
                  onClick={() => setValue('category', cat.key, { shouldValidate: true })}
                >
                  {cat.label}
                </div>
              ))}
            </div>
            {errors.category && (
              <p className="mt-2 text-xs text-error">{errors.category.message}</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
            <div className="mb-5">
              <label className="block mb-2.5 text-sm font-semibold text-text-primary tracking-tight">
                {t('feedback.title')}
              </label>
              <input
                type="text"
                {...register('subject')}
                placeholder={t('billing.briefDescription')}
                maxLength={100}
                className={cn(
                  "w-full box-border py-3 px-4 border rounded-xl",
                  "bg-bg-primary text-text-primary text-sm font-sans",
                  "placeholder:text-text-muted focus:outline-none focus:border-primary",
                  errors.subject ? "border-error" : "border-border"
                )}
              />
              {errors.subject && (
                <p className="mt-1.5 text-xs text-error">{errors.subject.message}</p>
              )}
            </div>

            <div className="mb-5">
              <label className="block mb-2.5 text-sm font-semibold text-text-primary tracking-tight">
                {t('billing.detailedDescription')}
              </label>
              <textarea
                {...register('description')}
                placeholder={t('billing.descriptionPlaceholder')}
                rows={6}
                maxLength={2000}
                className={cn(
                  "w-full box-border py-3 px-4 border rounded-xl",
                  "bg-bg-primary text-text-primary text-sm font-sans leading-relaxed",
                  "placeholder:text-text-muted focus:outline-none focus:border-primary",
                  "resize-none h-[140px] min-h-[140px] max-h-[140px] overflow-y-auto scrollbar-none",
                  "whitespace-pre-wrap break-words",
                  errors.description ? "border-error" : "border-border"
                )}
              />
              <div className="flex justify-between mt-1.5">
                {errors.description && (
                  <p className="text-xs text-error">{errors.description.message}</p>
                )}
                <div className="text-right text-xs text-text-muted font-medium ml-auto">
                  {description.length}/2000
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2.5 text-sm font-semibold text-text-primary tracking-tight">
                {t('billing.attachments')}
              </label>
              <div className="mt-2">
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
                  className={cn(
                    "inline-flex items-center gap-2 py-2.5 px-4",
                    "bg-bg-secondary border-2 border-dashed border-border rounded-xl",
                    "text-text-primary text-sm font-medium cursor-pointer transition-all duration-200",
                    "hover:not-disabled:bg-bg-hover hover:not-disabled:border-accent hover:not-disabled:-translate-y-px hover:not-disabled:shadow-popup",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={attachments.length >= 3}
                >
                  <Icon name="paperclip" alt={t('billing.attachFile')} size="lg" color="muted" />
                  <span>{t('billing.attachFile')}</span>
                </button>

                {attachments.length > 0 && (
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {attachments.map((att, index) => (
                      <div key={index} className="relative w-thumbnail-sm h-thumbnail-sm rounded-lg overflow-hidden border border-border">
                        <img src={att.data} alt={att.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-black/70 border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-black/90"
                          onClick={() => removeAttachment(index)}
                        >
                          <Icon name="x" alt={t('common.remove')} size="sm" themed={false} className="invert" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {errors.root && (
              <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm mb-4 flex items-center gap-2">
                <Icon name="alert-circle" alt={t('common.error')} size="lg" color="error" themed={false} />
                {errors.root.message}
              </div>
            )}

            <div className="flex gap-3 justify-end mt-6">
              <button 
                type="button" 
                className="py-3 px-6 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 border border-border bg-bg-secondary text-text-primary hover:bg-bg-hover hover:border-accent hover:-translate-y-px"
                onClick={onClose}
              >
                {t('common.cancel')}
              </button>
              <button 
                type="submit" 
                className={cn(
                  "py-3 px-6 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200",
                  "border border-primary bg-primary text-white",
                  "hover:not-disabled:bg-primary-hover hover:not-disabled:-translate-y-px",
                  "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                )}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('feedback.sending') : t('billing.sendRequest')}
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
