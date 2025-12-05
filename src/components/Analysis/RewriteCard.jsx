import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { rewriteText as rewriteTextAPI } from '../../services/api'
import { useRewrite } from '@/stores'
import { getLocalizedContentError } from '../../utils/errorMessages'
import Icon from '../Common/Icon'
import modal from '../../utils/modal'
import { cn } from '../../lib/utils'

const RewriteCard = ({ disabled, currentProfile, text }) => {
  const { t } = useTranslation()
  const { selectedModel, writingPreferences } = useRewrite()
  const [isLoading, setIsLoading] = useState(false)

  const rewriteText = async () => {
    if (!currentProfile || !text) return
    
    setIsLoading(true)
    const loadingModal = modal.loading(t('rewrite.rewrite') + '...')
    
    try {
      const result = await rewriteTextAPI(
        currentProfile.profile_id, 
        text,
        selectedModel,
        writingPreferences
      )
      
      loadingModal.close()
      
      if (result.success && result.data) {
        const rewrittenText = result.data.rewritten_text || ''
        await modal.alert(rewrittenText, t('rewrite.rewrite'), 'success')
      } else {
        throw new Error(result.error || t('rewrite.rewriteFailed'))
      }
    } catch (error) {
      loadingModal.close()
      console.error('Error rewriting:', error)
      const localizedError = getLocalizedContentError(error.message, t)
      modal.error(localizedError || t('rewrite.rewriteFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn(
      "p-4 border border-border-light rounded-xl",
      "bg-bg-tertiary transition-all duration-200 hover:shadow-md"
    )}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-3 relative">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
          "bg-bg-tertiary transition-all duration-200",
          "hover:bg-bg-secondary hover:scale-[1.02]"
        )}>
          <Icon name="pen" alt={t('rewrite.rewrite')} size="xl" color="primary" className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-text-primary m-0 mb-0.5">{t('rewrite.rewrite')}</h4>
          <p className="text-xs text-text-secondary m-0">{t('rewrite.matchYourStyle')}</p>
        </div>
      </div>

      {/* Action Button */}
      <button 
        className={cn(
          "w-full flex items-center justify-between py-2.5 px-3.5",
          "bg-bg-secondary border border-border-light rounded-xl",
          "text-sm font-medium text-text-primary cursor-pointer",
          "transition-all duration-200 hover:border-border-hover hover:shadow-md",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          isLoading && "pointer-events-none opacity-70"
        )}
        onClick={rewriteText}
        disabled={disabled || isLoading}
      >
        <span className={isLoading ? 'animate-pulse' : ''}>
          {isLoading ? t('rewrite.rewrite') + '...' : t('rewrite.rewrite')}
        </span>
        <Icon name="arrow-right" size="md" color="muted" />
      </button>
    </div>
  )
}

export default RewriteCard
