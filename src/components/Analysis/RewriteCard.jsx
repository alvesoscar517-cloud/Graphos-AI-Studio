import { useState } from 'react'
import { rewriteText as rewriteTextAPI } from '../../services/api'
import { useRewrite } from '../../contexts/RewriteContext'
import modal from '../../utils/modal'
import './Analysis.css'

const RewriteCard = ({ disabled, currentProfile, text }) => {
  const { selectedModel, writingPreferences } = useRewrite()
  const [isLoading, setIsLoading] = useState(false)

  const rewriteText = async () => {
    if (!currentProfile || !text) return
    
    setIsLoading(true)
    const loadingModal = modal.loading('Rewriting text...')
    
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
          'Văn bản đã được viết lại',
          'success'
        )
      } else {
        throw new Error(result.error || 'Rewrite failed')
      }
    } catch (error) {
      loadingModal.close()
      console.error('Error rewriting:', error)
      modal.error('Viết lại thất bại: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="feature-card rewrite-card">
      <div className="feature-card-header">
        <div className="feature-icon rewrite-icon">
          <img src="/icon/pen.svg" alt="Rewrite" />
        </div>
        <div className="feature-info">
          <h4>Viết lại</h4>
          <p>Theo văn phong</p>
        </div>
      </div>
      <button 
        className={`feature-btn ${isLoading ? 'loading' : ''}`}
        onClick={rewriteText}
        disabled={disabled || isLoading}
      >
        <span className={isLoading ? 'shimmer-text-effect' : ''}>{isLoading ? 'Rewriting...' : 'Rewrite'}</span>
        <img src="/icon/arrow-right.svg" alt="Go" className="btn-arrow" />
      </button>
    </div>
  )
}

export default RewriteCard
