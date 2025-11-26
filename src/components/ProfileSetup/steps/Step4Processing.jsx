/**
 * Step 4: Processing and Completion
 */
import LottieWrapper from '../LottieWrapper'
import loadingBlueAnimation from '../../../animation/loading-animation-blue.json'
import faceIdAnimation from '../../../animation/face-id.json'
import error404Animation from '../../../animation/404 blue.json'

const ProcessingView = ({ animationKey, processingStep, processingMessage, totalSamples }) => (
  <div className="step-content active" role="status" aria-live="polite" aria-busy="true">
    <div className="content-wrapper-processing">
      <div className="animation-container-large" aria-hidden="true">
        <LottieWrapper key={`step4-${animationKey}`} animationData={loadingBlueAnimation} loop={true} />
      </div>
      <div className="form-container-processing">
        <h1 className="step-title">Finalizing Profile</h1>
        <p className="step-description">
          {processingMessage || 'Processing...'}
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
            <span>Chuẩn bị {totalSamples} mẫu văn bản (3-5s)</span>
          </div>
          <div className={`checklist-item ${processingStep >= 2 ? processingStep === 2 ? 'processing' : 'completed' : ''}`}>
            {processingStep === 2 ? (
              <div className="item-spinner"></div>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
            <span>Creating embeddings and analyzing writing style ({Math.max(15, totalSamples * 2)}s)</span>
          </div>
          <div className={`checklist-item ${processingStep >= 3 ? processingStep === 3 ? 'processing' : 'completed' : ''}`}>
            {processingStep === 3 ? (
              <div className="item-spinner"></div>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
            <span>Finalizing and saving profile (2-3s)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const ErrorView = ({ animationKey, errorMessage, onBack, onRetry }) => (
  <div className="completion-modal error-modal active" role="alert" aria-live="assertive">
    <div className="completion-modal-content">
      <div className="completion-animation" aria-hidden="true">
        <LottieWrapper key={`error-${animationKey}`} animationData={error404Animation} loop={true} />
      </div>
      <h1 className="completion-title error-title">Oops! An Error Occurred</h1>
      <p className="completion-subtitle error-subtitle">{errorMessage}</p>
      <div className="error-actions">
        <button 
          className="btn btn-secondary btn-large" 
          onClick={onBack}
          aria-label="Go back to previous step to edit"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to Edit
        </button>
        <button 
          className="btn btn-primary btn-large" 
          onClick={onRetry}
          aria-label="Thử tạo hồ sơ lại"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
          </svg>
          Thử lại
        </button>
      </div>
    </div>
  </div>
)

const CompletionView = ({ animationKey, qualityScore, onComplete }) => (
  <div className="completion-modal active" role="status" aria-live="polite">
    <div className="completion-modal-content">
      <div className="completion-animation" aria-hidden="true">
        <LottieWrapper key={`completion-${animationKey}`} animationData={faceIdAnimation} loop={false} />
      </div>
      <h1 className="completion-title">Hoàn tất!</h1>
      
      {qualityScore && (
        <div className="completion-score-inline" aria-label={`Quality score: ${qualityScore.score} out of 100`}>
          <div className="score-number" data-rating={qualityScore.rating}>
            {qualityScore.score}/100
          </div>
          <p className="score-message">{qualityScore.recommendation}</p>
        </div>
      )}
      
      {!qualityScore && (
        <p className="completion-subtitle">Hồ sơ văn phong của bạn đã sẵn sàng</p>
      )}
      
      <button 
        className="btn btn-primary btn-large completion-btn" 
        onClick={onComplete}
        aria-label="Hoàn tất và bắt đầu soạn thảo"
      >
        Bắt đầu Soạn thảo
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
  if (showError) {
    return <ErrorView 
      animationKey={animationKey} 
      errorMessage={errorMessage} 
      onBack={onBack} 
      onRetry={onRetry} 
    />
  }

  if (showCompletion) {
    return <CompletionView 
      animationKey={animationKey} 
      qualityScore={qualityScore} 
      onComplete={onComplete} 
    />
  }

  return <ProcessingView 
    animationKey={animationKey}
    processingStep={processingStep}
    processingMessage={processingMessage}
    totalSamples={totalSamples}
  />
}

export default Step4Processing
