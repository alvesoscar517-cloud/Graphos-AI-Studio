/**
 * Step 2: Long Text Input (Paste or Upload)
 */
import { useTranslation } from 'react-i18next'
import LottieWrapper from '../LottieWrapper'
import biometricAnimation from '../../../animation/biometric-authentication.json'

const Step2LongText = ({
  animationKey,
  hasPastedText,
  hasUploadedFiles,
  totalChunks,
  totalWords,
  onOpenPasteModal,
  onOpenUploadModal,
  onBack,
  onNext,
  hasLongText
}) => {
  const { t } = useTranslation()

  return (
    <div className="step-content step-content-2 active">
      <div className="content-wrapper">
        <div className="animation-container">
          <LottieWrapper key={`step2-${animationKey}`} animationData={biometricAnimation} loop={true} />
        </div>
        <div className="form-container">
          <div className="step2-form-content">
            <h1 className="step-title">{t('profileSetup.provideLongText')}</h1>
            <p className="step-description">
              {t('profileSetup.pasteOrUpload')}
            </p>
          
            <div className="option-cards">
              <div 
                className={`option-card ${hasPastedText ? 'has-data' : ''}`}
                onClick={onOpenPasteModal}
              >
                <div className="option-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                </div>
                <div className="option-content">
                  <h3>{t('profileSetup.pasteText')}</h3>
                  <p>{t('profileSetup.pasteArticles')}</p>
                </div>
                {hasPastedText && (
                  <div className="option-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </div>

              <div 
                className={`option-card ${hasUploadedFiles ? 'has-data' : ''}`}
                onClick={onOpenUploadModal}
              >
                <div className="option-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <div className="option-content">
                  <h3>{t('profileSetup.uploadDocuments')}</h3>
                  <p>{t('profileSetup.uploadFiles')}</p>
                </div>
                {hasUploadedFiles && (
                  <div className="option-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Status Badge */}
            {totalChunks > 0 ? (
              <div className="saved-chunks-badge">
                <div className="saved-chunks-left">
                  <div className="saved-chunks-icon">
                    <img src="/icon/check-circle.svg" alt="" width="18" height="18" />
                  </div>
                  <div className="saved-chunks-content">
                    <span className="saved-chunks-label">{t('profileSetup.saved')}:</span>
                    <span className="saved-chunks-count">{totalWords}</span>
                    <span className="saved-chunks-unit">/ 5000 {t('common.words')}</span>
                    <span className="saved-chunks-detail">({totalChunks} {t('profileSetup.sections')})</span>
                  </div>
                </div>
                <div className="saved-chunks-actions">
                  {hasPastedText && (
                    <button 
                      className="btn-edit-text"
                      onClick={onOpenPasteModal}
                      title={t('profileSetup.viewEditPastedText')}
                    >
                      <img src="/icon/edit-2.svg" alt="" width="16" height="16" />
                      <span>{t('profileSetup.editText')}</span>
                    </button>
                  )}
                  {hasUploadedFiles && (
                    <button 
                      className="btn-edit-text"
                      onClick={onOpenUploadModal}
                      title={t('profileSetup.viewManageFiles')}
                    >
                      <img src="/icon/file-text.svg" alt="" width="16" height="16" />
                      <span>{t('profileSetup.manageFiles')}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="tip-badge">
                <div className="tip-icon">
                  <img src="/icon/info.svg" alt="" width="18" height="18" />
                </div>
                <div className="tip-content">
                  <span className="tip-text">{t('profileSetup.provide1000to5000')}</span>
                </div>
              </div>
            )}

            <div className="button-group">
              <button className="btn btn-secondary" onClick={onBack}>{t('common.back')}</button>
              <button 
                className="btn btn-primary" 
                disabled={!hasLongText}
                onClick={onNext}
              >
                {t('common.next')}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step2LongText
