/**
 * ProfileSetup - Refactored Version
 * Main component for creating new voice profiles
 * Split into smaller components for better maintainability
 */
import { useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { createProfileComplete } from '../../services/api'
import { clearAllProfileDetailCaches } from '../../utils/profileDetailCache'
import useProfileSetup, { getDraftTimeAgo } from './hooks/useProfileSetup'
import { Step1NameTheme, Step2LongText, Step3ShortSamples, Step4Processing } from './steps'
import PasteTextModal from './PasteTextModal'
import UploadFileModal from './UploadFileModal'
import ConfirmModal from './ConfirmModal'
import '../../styles/ProfileSetup.css'
import '../../styles/ThemeSelector.css'

const ProfileSetup = () => {
  const { t } = useTranslation()
  const {
    // State
    currentStep,
    setCurrentStep,
    animationKey,
    profileData,
    setProfileData,
    profileName,
    setProfileName,
    selectedTheme,
    setSelectedTheme,
    showPasteModal,
    setShowPasteModal,
    showUploadModal,
    setShowUploadModal,
    hasPastedText,
    hasUploadedFiles,
    shortText,
    setShortText,
    samples,
    shortTextWordCount,
    currentSampleIndex,
    setCurrentSampleIndex,
    isEditingMode,
    setIsEditingMode,
    processing,
    setProcessing,
    processingStep,
    setProcessingStep,
    processingMessage,
    setProcessingMessage,
    showCompletion,
    setShowCompletion,
    showError,
    setShowError,
    errorMessage,
    setErrorMessage,
    isCancelling,
    qualityScore,
    setQualityScore,
    
    // Refs
    mountedRef,
    timeoutsRef,
    abortControllerRef,
    
    // Computed
    totalChunks,
    totalSamples,
    totalWords,
    hasLongText,
    progressPercentage,
    wordCountWarning,
    
    // Draft
    hasDraft,
    draftInfo,
    lastSavedAt,
    handleRestoreDraft,
    handleDiscardDraft,
    
    // Handlers
    handleNextStep1,
    handleSavePaste,
    handleSaveUpload,
    handleAddSample,
    handleNavigateSample,
    handleCancel,
    handleConfirmCancel,
    handleCancelCancel,
    handleComplete,
    
    // Cancel confirm modal
    showCancelConfirm,
    
    // Constants
    MIN_SAMPLES,
    MAX_SAMPLES,
    MIN_SAMPLE_WORDS,
    MAX_SAMPLE_WORDS
  } = useProfileSetup()

  // Step 4: Create complete profile with retry mechanism
  const createProfile = useCallback(async (retryCount = 0) => {
    if (!mountedRef.current) return
    
    const MAX_RETRIES = 2
    
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    
    setProcessing(true)
    setShowError(false)
    setShowCompletion(false)
    setProcessingStep(1)
    setProcessingMessage(t('profileSetupErrors.preparingData'))

    try {
      // Prepare all samples
      const allLongChunks = [...profileData.pastedChunks, ...profileData.uploadedChunks]
      const allSamples = [
        ...allLongChunks.map(text => ({ text, type: 'long' })),
        ...profileData.shortSamples.map(text => ({ text, type: 'short' }))
      ]

      console.log(`[PACKAGE] Creating profile with ${allSamples.length} samples (attempt ${retryCount + 1})`)

      if (allSamples.length < 3) {
        if (mountedRef.current) {
          setErrorMessage(t('profileSetupErrors.atLeast3Samples'))
          setShowError(true)
          setProcessing(false)
        }
        return
      }

      const estimatedTime = Math.max(15, allSamples.length * 2)
      
      if (!mountedRef.current) return
      
      // Step 1: Preparing
      setProcessingStep(1)
      setProcessingMessage(t('profileSetupErrors.preparingSamples', { count: allSamples.length }))
      
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, 3000)
        timeoutsRef.current.push(timeout)
      })
      
      if (!mountedRef.current) return
      
      // Step 2: Creating embeddings
      setProcessingStep(2)
      setProcessingMessage(t('profileSetupErrors.creatingEmbeddings', { time: estimatedTime }))
      
      try {
        const response = await createProfileComplete(
          profileData.name,
          profileData.theme,
          allSamples,
          { signal: abortControllerRef.current?.signal }
        )
        
        if (!mountedRef.current) return
        
        if (!response.success) {
          throw new Error(response.error || t('profileSetupErrors.unableToCreate'))
        }
        
        setProfileData(prev => ({ ...prev, profileId: response.profile_id }))
        
        if (response.quality_score) {
          setQualityScore(response.quality_score)
        }
        
        clearAllProfileDetailCaches()
        
        // Step 3: Finalizing
        setProcessingStep(3)
        setProcessingMessage(t('profileSetupErrors.finalizingProfile'))
        
        await new Promise(resolve => {
          const timeout = setTimeout(resolve, 2000)
          timeoutsRef.current.push(timeout)
        })
        
        if (mountedRef.current) {
          setProcessing(false)
          setShowCompletion(true)
        }
      } catch (apiError) {
        // Ignore abort errors
        if (apiError.name === 'AbortError') {
          console.log('API request was aborted')
          return
        }
        
        console.error('API error:', apiError)
        
        // Retry logic for transient errors only
        const errMsg = apiError.message?.toLowerCase() || ''
        const isRetryable = (
          errMsg.includes('quota') || 
          errMsg.includes('overload') ||
          errMsg.includes('timeout') ||
          errMsg.includes('network') ||
          errMsg.includes('database_write')
        ) && !errMsg.includes('rate_limit') && !errMsg.includes('duplicate') && !errMsg.includes('similar')
        
        if (isRetryable && retryCount < MAX_RETRIES) {
          console.log(`[SYNC] Retrying... (${retryCount + 1}/${MAX_RETRIES})`)
          setProcessingMessage(t('profileSetupErrors.retrying', { current: retryCount + 1, max: MAX_RETRIES }))
          
          await new Promise(resolve => {
            const timeout = setTimeout(resolve, 2000 * (retryCount + 1))
            timeoutsRef.current.push(timeout)
          })
          
          return createProfile(retryCount + 1)
        }
        
        if (mountedRef.current) {
          let errorMsg = t('profileSetupErrors.unableToCreate')
          const errMessage = apiError.message || ''
          
          // Handle specific error types
          if (errMessage.includes('code') || errMessage.includes('Code')) {
            errorMsg = t('profileSetupErrors.textContainsCode')
          } else if (errMessage.includes('ký tự đặc biệt')) {
            errorMsg = t('profileSetupErrors.tooManySpecialChars')
          } else if (errMessage.includes('repetition')) {
            errorMsg = t('profileSetupErrors.tooMuchRepetition')
          } else if (errMessage.includes('quota') || errMessage.includes('overload')) {
            errorMsg = t('profileSetupErrors.systemOverloaded')
          } else if (errMessage.includes('limit') || errMessage.includes('RATE_LIMIT')) {
            errorMsg = errMessage // Use the rate limit message from backend
          } else if (errMessage.includes('already exists') || errMessage.includes('DUPLICATE')) {
            errorMsg = errMessage // Use the duplicate name message from backend
          } else if (errMessage.includes('too similar') || errMessage.includes('SIMILAR_SAMPLES')) {
            errorMsg = errMessage // Use the similar samples message from backend
          } else if (errMessage.includes('timeout') || errMessage.includes('TIMEOUT')) {
            errorMsg = t('profileSetupErrors.processingTooLong')
          } else if (errMessage.includes('DATABASE_WRITE')) {
            errorMsg = t('profileSetupErrors.dataSaveError')
          } else if (errMessage) {
            errorMsg = errMessage
          }
          
          setErrorMessage(errorMsg)
          setShowError(true)
          setProcessing(false)
        }
      }
    } catch (error) {
      console.error('Create profile error:', error)
      if (mountedRef.current) {
        setErrorMessage(t('profileSetupErrors.unexpectedError'))
        setShowError(true)
        setProcessing(false)
      }
    }
  }, [profileData, setProfileData, setProcessing, setShowError, setShowCompletion, 
      setProcessingStep, setProcessingMessage, setErrorMessage, setQualityScore, 
      mountedRef, timeoutsRef])

  // Trigger profile creation when entering step 4
  useEffect(() => {
    if (currentStep !== 4 || processing || !mountedRef.current) return
    createProfile()
  }, [currentStep, processing, createProfile, mountedRef])

  // Don't render if cancelling or unmounted
  if (isCancelling || !mountedRef.current) {
    return null
  }

  return (
    <div className="profile-setup-page">
      <div className="setup-container">
        {/* Progress Bar */}
        <div className="progress-bar-container" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={4} aria-label={`Progress: Step ${currentStep} of 4`}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="progress-text">{t('profileSetupErrors.step')} {currentStep} / 4</div>
        </div>

        {/* Step 1: Profile Name & Theme */}
        {currentStep === 1 && (
          <Step1NameTheme
            animationKey={animationKey}
            profileName={profileName}
            setProfileName={setProfileName}
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            onNext={handleNextStep1}
            onCancel={handleCancel}
            isCancelling={isCancelling}
          />
        )}

        {/* Step 2: Long Text */}
        {currentStep === 2 && (
          <Step2LongText
            animationKey={animationKey}
            hasPastedText={hasPastedText}
            hasUploadedFiles={hasUploadedFiles}
            totalChunks={totalChunks}
            totalWords={totalWords}
            onOpenPasteModal={() => setShowPasteModal(true)}
            onOpenUploadModal={() => setShowUploadModal(true)}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
            hasLongText={hasLongText}
          />
        )}

        {/* Step 3: Short Samples */}
        {currentStep === 3 && (
          <Step3ShortSamples
            animationKey={animationKey}
            shortText={shortText}
            setShortText={setShortText}
            samples={samples}
            shortTextWordCount={shortTextWordCount}
            currentSampleIndex={currentSampleIndex}
            setCurrentSampleIndex={setCurrentSampleIndex}
            isEditingMode={isEditingMode}
            setIsEditingMode={setIsEditingMode}
            onAddSample={handleAddSample}
            onNavigateSample={handleNavigateSample}
            onBack={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
            MIN_SAMPLES={MIN_SAMPLES}
            MAX_SAMPLES={MAX_SAMPLES}
            MIN_SAMPLE_WORDS={MIN_SAMPLE_WORDS}
            MAX_SAMPLE_WORDS={MAX_SAMPLE_WORDS}
          />
        )}

        {/* Step 4: Processing */}
        {currentStep === 4 && (
          <Step4Processing
            animationKey={animationKey}
            processing={processing}
            processingStep={processingStep}
            processingMessage={processingMessage}
            showCompletion={showCompletion}
            showError={showError}
            errorMessage={errorMessage}
            qualityScore={qualityScore}
            totalSamples={totalSamples}
            onBack={() => {
              setShowError(false)
              setCurrentStep(3)
            }}
            onRetry={() => {
              setShowError(false)
              createProfile()
            }}
            onComplete={handleComplete}
          />
        )}
      </div>

      {/* Modals */}
      <PasteTextModal
        isOpen={showPasteModal}
        onClose={() => setShowPasteModal(false)}
        onSave={handleSavePaste}
        initialText={profileData.pastedTextOriginal}
        currentTotalWords={totalWords}
        maxWords={3000}
      />

      <UploadFileModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSave={handleSaveUpload}
        onFileRemove={handleSaveUpload}
        initialFiles={profileData.uploadedFiles}
        currentTotalWords={totalWords}
        maxWords={3000}
      />

      {/* Draft Restore Toast - Windows-style notification */}
      {hasDraft && draftInfo && currentStep === 1 && (
        <div className="draft-toast">
          <div className="draft-toast-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="draft-toast-content">
            <div className="draft-toast-title">{t('profileSetup.incompleteDraft')}</div>
            <div className="draft-toast-subtitle">
              {draftInfo.profileName ? `"${draftInfo.profileName}"` : t('nav.profile')} • {t('profileSetupErrors.step')} {draftInfo.currentStep || 1}
              {draftInfo.savedAt && ` • ${getDraftTimeAgo(draftInfo.savedAt)}`}
            </div>
          </div>
          <div className="draft-toast-actions">
            <button className="draft-toast-btn draft-toast-btn-secondary" onClick={handleDiscardDraft}>
              {t('common.skip')}
            </button>
            <button className="draft-toast-btn draft-toast-btn-primary" onClick={handleRestoreDraft}>
              {t('profileSetup.restore')}
            </button>
          </div>
          <button className="draft-toast-close" onClick={handleDiscardDraft} aria-label={t('common.close')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Auto-save indicator - subtle floating badge */}
      {lastSavedAt && currentStep < 4 && (
        <div className="auto-save-badge" title={t('profileSetup.autoSavingDraft')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>{t('profileSetup.saved')}</span>
        </div>
      )}

      {/* Cancel Confirm Modal - renders inside profile-setup-page */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        title={t('profileSetup.cancelProfileCreation')}
        message={t('profileSetup.allDataWillBeLost')}
        type="warning"
        danger={true}
        confirmText={t('common.cancel')}
        cancelText={t('common.continue')}
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelCancel}
      />
    </div>
  )
}

export default ProfileSetup
