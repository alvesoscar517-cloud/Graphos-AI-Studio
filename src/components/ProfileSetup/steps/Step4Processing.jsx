/**
 * Step 4: Processing and Completion
 * Migrated to Tailwind CSS v4
 * Updated: Shows processing steps with three dots animation
 */
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils'
import LottieWrapper from '../LottieWrapper'
import loadingBlueAnimation from '../../../animation/loading-animation-blue.json'
import faceIdAnimation from '../../../animation/face-id.json'
import error404Animation from '../../../animation/404 blue.json'

const ProcessingView = ({ animationKey, processingStep, processingMessage, totalSamples, t }) => (
  <div className="block animate-fade-in-slow h-[calc(100%-100px)] relative" role="status" aria-live="polite" aria-busy="true">
    <div className="grid grid-cols-2 h-full gap-0 relative min-h-0 overflow-hidden max-lg:grid-cols-1">
      {/* Animation Container - Left Column */}
      <div className="flex items-center justify-center w-full h-full p-10 box-border bg-transparent">
        <div className="!w-lottie-md !h-lottie-md max-w-full max-h-full max-lg:!w-lottie-sm max-lg:!h-lottie-sm">
          <LottieWrapper key={`step4-${animationKey}`} animationData={loadingBlueAnimation} loop={true} />
        </div>
      </div>
      
      {/* Content Container - Right Column */}
      <div className="py-2.5 pl-0 pr-10 flex flex-col justify-center bg-transparent overflow-y-auto h-full relative scrollbar-hidden max-md:px-5">
        <div className="w-[95%] max-lg:w-full">
          <h1 className="text-2xl font-semibold text-gray-800 mb-3 leading-tight">
            {t('profileSetup.finalizingProfile')}
          </h1>
          <p className="text-sm text-input-placeholder leading-relaxed mb-6">
            {processingMessage || t('common.processing')}
          </p>
          
          {/* Processing Steps */}
          <div className="flex flex-col gap-3 max-w-form">
            {[
              { step: 1, label: t('profileSetup.creatingEmbeddings', { count: totalSamples }) || `Creating embeddings (${totalSamples} samples)` },
              { step: 2, label: t('profileSetup.analyzingPatterns') || 'Analyzing writing patterns' },
              { step: 3, label: t('profileSetup.generatingVoice') || 'Generating voice profile' },
              { step: 4, label: t('profileSetup.savingProfile') || 'Saving profile' }
            ].map(({ step, label }) => (
              <div key={step} className={cn(
                "flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-300",
                processingStep >= step 
                  ? processingStep === step 
                    ? "bg-text-link/10 border border-text-link/30" 
                    : "bg-green-50 border border-green-200"
                  : "bg-bg-secondary border border-border"
              )}>
                {processingStep === step ? (
                  <div className="w-5 h-5 border-2 border-text-link border-t-transparent rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={cn("flex-shrink-0", processingStep > step ? "stroke-success" : "stroke-gray-400")} strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
                <span className={cn(
                  "text-sm font-medium",
                  processingStep === step ? "text-text-link" : processingStep > step ? "text-green-600" : "text-text-muted"
                )}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

const ErrorView = ({ animationKey, errorMessage, errorCode, onBack, onRetry, t }) => {
  const isCreditError = errorCode === 'INSUFFICIENT_CREDITS' || 
    errorMessage?.toLowerCase().includes('credit') ||
    errorMessage?.toLowerCase().includes('insufficient')
  
  return (
    <div className="fixed inset-0 bg-white/98 backdrop-blur-xl flex items-center justify-center z-overlay-high" role="alert" aria-live="assertive">
      <div className="text-center animate-scale-in">
        <div className="w-thumbnail-xl h-thumbnail-xl mx-auto mb-10 flex items-center justify-center" aria-hidden="true">
          <LottieWrapper key={`error-${animationKey}`} animationData={error404Animation} loop={true} />
        </div>
        <h1 className="text-4xl font-semibold text-error mb-3 animate-slide-up">
          {isCreditError ? t('profileSetup.insufficientCredits') : t('profileSetup.errorOccurred')}
        </h1>
        <p className="text-lg text-input-placeholder mb-8 animate-slide-up max-w-md mx-auto">{errorMessage}</p>
        <div className="flex gap-4 justify-center animate-slide-up">
          <button className="py-3.5 px-8 text-base font-semibold rounded-lg cursor-pointer transition-all duration-200 inline-flex items-center gap-2 bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            {t('common.back')}
          </button>
          {!isCreditError && (
            <button className="py-3.5 px-8 text-base font-semibold rounded-lg cursor-pointer transition-all duration-200 inline-flex items-center gap-2 bg-text-link text-white hover:bg-primary hover:-translate-y-px" onClick={onRetry}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path></svg>
              {t('common.retry')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const CompletionView = ({ animationKey, qualityScore, onComplete, t }) => (
  <div className="fixed inset-0 bg-white/98 backdrop-blur-xl flex items-center justify-center z-overlay-high" role="status" aria-live="polite">
    <div className="text-center animate-scale-in">
      <div className="w-thumbnail-xl h-thumbnail-xl mx-auto mb-10 flex items-center justify-center" aria-hidden="true">
        <LottieWrapper key={`completion-${animationKey}`} animationData={faceIdAnimation} loop={false} />
      </div>
      <h1 className="text-4xl font-semibold mb-3 text-text-link animate-slide-up">
        {t('profileSetup.complete')}
      </h1>
      {qualityScore ? (
        <div className="mb-8 animate-slide-up">
          <div className={cn("text-4xl font-bold mb-2",
            qualityScore.rating === 'excellent' ? "text-success" :
            qualityScore.rating === 'good' ? "text-text-link" :
            qualityScore.rating === 'fair' ? "text-amber-500" : "text-text-muted"
          )}>{qualityScore.score}/100</div>
          <p className="text-sm text-input-placeholder">{qualityScore.recommendation}</p>
        </div>
      ) : (
        <p className="text-lg text-input-placeholder mb-8 animate-slide-up">{t('profileSetup.profileReady')}</p>
      )}
      <button className="py-3.5 px-8 text-base font-semibold rounded-lg cursor-pointer transition-all duration-200 bg-text-link text-white hover:bg-primary hover:-translate-y-px animate-slide-up" onClick={onComplete}>
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
  errorCode, 
  qualityScore, 
  totalSamples, 
  onBack, 
  onRetry, 
  onComplete 
}) => {
  const { t } = useTranslation()
  if (showError) return <ErrorView animationKey={animationKey} errorMessage={errorMessage} errorCode={errorCode} onBack={onBack} onRetry={onRetry} t={t} />
  if (showCompletion) return <CompletionView animationKey={animationKey} qualityScore={qualityScore} onComplete={onComplete} t={t} />
  return <ProcessingView 
    animationKey={animationKey} 
    processingStep={processingStep} 
    processingMessage={processingMessage} 
    totalSamples={totalSamples} 
    t={t} 
  />
}

export default Step4Processing
