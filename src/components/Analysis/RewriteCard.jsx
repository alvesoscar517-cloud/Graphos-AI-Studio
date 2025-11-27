import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { rewriteText as rewriteTextAPI } from '../../services/api'
import { useRewrite } from '../../contexts/RewriteContext'
import modal from '../../utils/modal'
import './Analysis.css'

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
        
        // Show result in modal
        await modal.alert(
          rewrittenText,
          t('rewrite.rewrite'),
          'success'
        )
      } else {
        throw new Error(result.error || t('rewrite.rewriteFailed'))
      }
    } catch (error) {
      loadingModal.close()
      console.error('Error rewriting:', error)
      modal.error(t('rewrite.rewriteFailed') + ' ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="feature-card rewrite-card">
      <div className="feature-card-header">
        <div className="feature-icon rewrite-icon">
          <img src="/icon/pen.svg" alt={t('rewrite.rewrite')} />
        </div>
        <div className="feature-info">
          <h4>{t('rewrite.rewrite')}</h4>
          <p>{t('rewrite.matchYourStyle')}</p>
        </div>
      </div>
      <button 
        className={`feature-btn ${isLoading ? 'loading' : ''}`}
        onClick={rewriteText}
        disabled={disabled || isLoading}
      >
        <span className={isLoading ? 'shimmer-text-effect' : ''}>{isLoading ? t('rewrite.rewrite') + '...' : t('rewrite.rewrite')}</span>
        <img src="/icon/arrow-right.svg" alt="" className="btn-arrow" />
      </button>
    </div>
  )
}

export default RewriteCard
