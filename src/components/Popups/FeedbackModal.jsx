/**
 * FeedbackModal Component
 * Uses React Hook Form + Zod + TanStack Query
 */
import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToasts } from '../../stores/uiStore'
import { useSendFeedback } from '@/hooks/queries'
import { cn } from '../../lib/utils'
import Icon from '../Common/Icon'

// Validation schema
const feedbackFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be at most 100 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(2000, 'Content must be at most 2000 characters'),
})

const FeedbackModal = ({ onClose }) => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToasts()
  const [images, setImages] = useState([])
  const fileInputRef = useRef(null)
  const modalRef = useRef(null)

  // TanStack Query mutation
  const sendFeedback = useSendFeedback()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      title: '',
      content: '',
    },
    mode: 'onBlur',
  })

  const content = watch('content', '')
  const isSubmitting = sendFeedback.isPending

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 3) {
      showError(t('feedback.maxImages'))
      return
    }

    const newImages = []
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        showError(t('feedback.imageSizeLimit'))
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        newImages.push({
          name: file.name,
          data: e.target.result
        })
        if (newImages.length === files.length) {
          setImages(prev => [...prev, ...newImages])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const onSubmit = async (data) => {
    try {
      await sendFeedback.mutateAsync({
        title: data.title,
        content: data.content,
        images: images.map(img => img.data),
      })
      showSuccess(t('feedback.thankYou'))
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
          "bg-bg-primary rounded-2xl w-[90%] max-w-[550px] max-h-[90vh]",
          "flex flex-col overflow-hidden shadow-modal",
          "animate-slide-up"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between py-5 px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="card-icon !w-10 !h-10">
              <Icon name="message-square" alt={t('feedback.sendFeedback')} size="lg" color="muted" />
            </div>
            <div>
              <h2 className="m-0 text-xl font-semibold text-text-primary">{t('feedback.sendFeedback')}</h2>
              <p className="m-0 mt-0.5 text-sm text-text-secondary">{t('feedback.helpUsImprove')}</p>
            </div>
          </div>
          <button 
            className="bg-transparent border-none cursor-pointer p-2 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-bg-hover"
            onClick={onClose}
            data-tooltip={t('common.close')}
          >
            <Icon name="x" alt={t('common.close')} size="lg" color="muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="pt-2 pb-6 px-6 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
          <div className="mb-5">
            <label className="block mb-2.5 text-sm font-semibold text-text-primary tracking-tight">
              {t('feedback.title')}
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder={t('feedback.titlePlaceholder')}
              maxLength={100}
              className={cn(
                "w-full box-border py-3 px-4 border rounded-xl",
                "bg-bg-primary text-text-primary text-sm font-sans",
                "placeholder:text-text-muted focus:outline-none focus:border-primary",
                errors.title ? "border-error" : "border-border"
              )}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-error">{errors.title.message}</p>
            )}
          </div>

          <div className="mb-5">
            <label className="block mb-2.5 text-sm font-semibold text-text-primary tracking-tight">
              {t('feedback.content')}
            </label>
            <textarea
              {...register('content')}
              placeholder={t('feedback.contentPlaceholder')}
              rows={6}
              maxLength={2000}
              className={cn(
                "w-full box-border py-3 px-4 border rounded-xl",
                "bg-bg-primary text-text-primary text-sm font-sans leading-relaxed",
                "placeholder:text-text-muted focus:outline-none focus:border-primary",
                "resize-none h-40 min-h-40 max-h-40 overflow-y-auto scrollbar-none",
                "whitespace-pre-wrap break-words",
                errors.content ? "border-error" : "border-border"
              )}
            />
            <div className="flex justify-between mt-1.5">
              {errors.content && (
                <p className="text-xs text-error">{errors.content.message}</p>
              )}
              <div className="text-right text-xs text-text-muted font-medium ml-auto">
                {content.length}/2000
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="block mb-2.5 text-sm font-semibold text-text-primary tracking-tight">
              {t('feedback.imagesLabel')}
            </label>
            <div className="mt-2">
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
                className={cn(
                  "inline-flex items-center gap-2 py-2.5 px-4",
                  "bg-bg-secondary border-2 border-dashed border-border rounded-xl",
                  "text-text-primary text-sm font-medium cursor-pointer transition-all duration-200",
                  "hover:not-disabled:bg-bg-hover hover:not-disabled:border-accent hover:not-disabled:-translate-y-px hover:not-disabled:shadow-popup",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 3}
              >
                <Icon name="image-plus" alt={t('feedback.addImage')} size="lg" color="muted" />
                <span>{t('feedback.addImage')}</span>
              </button>

              {images.length > 0 && (
                <div className="flex gap-3 mt-3 flex-wrap">
                  {images.map((img, index) => (
                    <div key={index} className="relative w-thumbnail-sm h-thumbnail-sm rounded-lg overflow-hidden border border-border">
                      <img src={img.data} alt={img.name} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-black/70 border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-black/90"
                        onClick={() => removeImage(index)}
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
            <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm mb-4">
              {errors.root.message}
            </div>
          )}

          <div className="flex gap-3 justify-end mt-6 flex-col sm:flex-row">
            <button 
              type="button" 
              className={cn(
                "py-3 px-6 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200",
                "border border-border bg-bg-secondary text-text-primary",
                "hover:bg-bg-hover hover:border-accent hover:-translate-y-px"
              )}
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
              {isSubmitting ? t('feedback.sending') : t('feedback.sendFeedback')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default FeedbackModal
