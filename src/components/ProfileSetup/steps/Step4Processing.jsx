/**
 * Step 4: Processing and Completion
 */
import { useTranslation } from 'react-i18next'
import LottieWrapper from '../LottieWrapper'
import loadingBlueAnimation from '../../../animation/loading-animation-blue.json'
import faceIdAnimation from '../../../animation/face-id.json'
import error404Animation from '../../../animation/404 blue.json'

const ProcessingView = ({ animationKey, processingStep, processingMessage, totalSamples, t }) => (
  <div className="step-content active" role="status" aria-live="polite" aria-busy="true">
    <div className="content-wrapper-processing">
      <div className="animation-container-large" aria-hidden="true">
        <LottieWrapper key={`step4-${animationKey}`} animationData={loadingBlueAnimation} loop={true} />
      </div>
      <div className="form-container-processing">
        <h1 className="step-title">{t('profileSetup.finalizingProfile')}</h1>
        <p className="step-description">
          {processingMessage || t('common.processing')}
        </p>

        <div className="checklist">
          <div className={`checklist-item ${processingStep >= 1 ? processingStep === 1 ? 'processing' : 'completed' : ''}`}>
            {processingStep === 1 ? (
              <div className="item-spinner"></div>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
            <span>{t('profileSetup.analyzingText')} ({totalSamples} {t('common.samples')})</span>
          </div>
          <div className={`checklist-item ${processingStep >= 2 ? processingStep === 2 ? 'processing' : 'completed' : ''}`}>
            {processingStep === 2 ? (
              <div className="item-spinner"></div>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
            <span>{t('profileSetup.analyzingText')}</span>
          </div>
          <div className={`checklist-item ${processingStep >= 3 ? processingStep === 3 ? 'processing' : 'completed' : ''}`}>
            {processingStep === 3 ? (
              <div className="item-spinner"></div>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
            <span>{t('profileSetup.finalizingProfile')}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const ErrorView = ({ animationKey, errorMessage, onBack, onRetry, t }) => (
  <div className="completion-modal error-modal active" role="alert" aria-live="assertive">
    <div className="completion-modal-content">
      <div className="completion-animation" aria-hidden="true">
        <LottieWrapper key={`error-${animationKey}`} animationData={error404Animation} loop={true} />
      </div>
      <h1 className="completion-title error-title">{t('profileSetup.errorOccurred')}</h1>
      <p className="completion-subtitle error-subtitle">{errorMessage}</p>
      <div className="error-actions">
        <button 
          className="btn btn-secondary btn-large" 
          onClick={onBack}
          aria-label={t('profileSetup.goBackToPrevious')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          {t('common.back')}
        </button>
        <button 
          className="btn btn-primary btn-large" 
          onClick={onRetry}
          aria-label={t('profileSetup.retryCreating')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
          </svg>
          {t('common.retry')}
        </button>
      </div>
    </div>
  </div>
)

const CompletionView = ({ animationKey, qualityScore, onComplete, t }) => (
  <div className="completion-modal active" role="status" aria-live="polite">
    <div className="completion-modal-content">
      <div className="completion-animation" aria-hidden="true">
        <LottieWrapper key={`completion-${animationKey}`} animationData={faceIdAnimation} loop={false} />
      </div>
      <h1 className="completion-title">{t('profileSetup.complete')}</h1>
      
      {qualityScore && (
        <div className="completion-score-inline" aria-label={t('profile.profileQuality') + `: ${qualityScore.score}/100`}>
          <div className="score-number" data-rating={qualityScore.rating}>
            {qualityScore.score}/100
          </div>
          <p className="score-message">{qualityScore.recommendation}</p>
        </div>
      )}
      
      {!qualityScore && (
        <p className="completion-subtitle">{t('profileSetup.profileReady')}</p>
      )}
      
      <button 
        className="btn btn-primary btn-large completion-btn" 
        onClick={onComplete}
        aria-label={t('profileSetup.completeAndStart')}
      >
        {t('profileSetup.startWriting')}
      </button>
    </div>
  </div>
)

const Step4Processing = ({
  animationKey,
  processing,
  processingStep,
  processingMessage,
  showCompletion,
  showError,
  errorMessage,
  qualityScore,
  totalSamples,
  onBack,
  onRetry,
  onComplete
}) => {
  const { t } = useTranslation()

  if (showError) {
    return <ErrorView 
      animationKey={animationKey} 
      errorMessage={errorMessage} 
      onBack={onBack} 
      onRetry={onRetry}
      t={t}
    />
  }

  if (showCompletion) {
    return <CompletionView 
      animationKey={animationKey} 
      qualityScore={qualityScore} 
      onComplete={onComplete}
      t={t}
    />
  }

  return <ProcessingView 
    animationKey={animationKey}
    processingStep={processingStep}
    processingMessage={processingMessage}
    totalSamples={totalSamples}
    t={t}
  />
}

export default Step4Processing
