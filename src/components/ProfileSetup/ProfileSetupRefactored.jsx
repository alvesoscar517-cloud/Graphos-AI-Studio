/**
 * ProfileSetup - Refactored Version
 * Main component for creating new voice profiles
 * Split into smaller components for better maintainability
 * Migrated to Tailwind CSS v4
 * NOTE: This feature only supports light mode
 */
import { useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '../../lib/utils'
import { createProfileComplete } from '../../services/api'
import { clearAllProfileDetailCaches } from '../../utils/profileDetailCache'
import { queryKeys } from '../../lib/queryKeys'
import useProfileSetup, { getDraftTimeAgo } from './hooks/useProfileSetup'
import { Step1NameTheme, Step2LongText, Step3ShortSamples, Step4Processing } from './steps'
import PasteTextModal from './PasteTextModal'
import UploadFileModal from './UploadFileModal'
import ConfirmModal from './ConfirmModal'

/**
 * Custom hook to force light mode for ProfileSetup
 * Temporarily removes dark mode when component mounts and restores it on unmount
 * Also prevents theme changes while on this page
 */
const useForceLightMode = () => {
  const wasDarkModeRef = useRef(false)
  
  useEffect(() => {
    // Check if dark mode was active and store the state
    wasDarkModeRef.current = document.documentElement.classList.contains('dark')
    
    // Force light mode by removing dark class
    document.documentElement.classList.remove('dark')
    
    // Create a MutationObserver to prevent dark mode from being re-added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark')
          }
        }
      })
    })
    
    // Start observing
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    // Cleanup: restore dark mode if it was previously active and disconnect observer
    return () => {
      observer.disconnect()
      if (wasDarkModeRef.current) {
        document.documentElement.classList.add('dark')
      }
    }
  }, [])
}

const ProfileSetup = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  
  // Force light mode for this feature - dark mode is not supported
  useForceLightMode()
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
    errorCode,
    setErrorCode,
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

  // Ref to track if profile creation is already in progress (prevent duplicate calls)
  const isCreatingProfileRef = useRef(false)
  // Ref to store the latest createProfile function
  const createProfileRef = useRef(null)
  
  // Step 4: Create complete profile with retry mechanism
  const createProfile = useCallback(async (retryCount = 0) => {
    // CRITICAL: Prevent duplicate/concurrent profile creation
    if (!mountedRef.current) return
    if (isCreatingProfileRef.current && retryCount === 0) {
      console.log('[PROFILE] Creation already in progress, skipping duplicate call')
      return
    }
    
    // Mark as creating (only for initial call, not retries)
    if (retryCount === 0) {
      isCreatingProfileRef.current = true
    }
    
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
        
        // Invalidate TanStack Query cache to ensure HomeView shows new profile
        queryClient.invalidateQueries({ queryKey: queryKeys.profiles.list() })
        
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
          isCreatingProfileRef.current = false // Reset flag on success
        }
      } catch (apiError) {
        // Ignore abort errors
        if (apiError.name === 'AbortError') {
          console.log('API request was aborted')
          isCreatingProfileRef.current = false
          return
        }
        
        console.error('API error:', apiError)
        
        const errMsg = apiError.message?.toLowerCase() || ''
        const errorCode = apiError.code || ''
        
        // Check for non-retryable errors first (credit, rate limit, duplicate, etc.)
        const isInsufficientCredits = errorCode === 'INSUFFICIENT_CREDITS' || 
          errMsg.includes('insufficient credits') || 
          errMsg.includes('credit')
        const isRateLimit = errMsg.includes('rate_limit') || errorCode === 'RATE_LIMITED'
        const isDuplicate = errMsg.includes('duplicate') || errMsg.includes('already exists') || errorCode === 'DUPLICATE'
        const isSimilar = errMsg.includes('similar') || errorCode === 'SIMILAR_SAMPLES'
        
        // These errors should NOT be retried
        const isNonRetryable = isInsufficientCredits || isRateLimit || isDuplicate || isSimilar
        
        // Retry logic for transient errors only
        const isRetryable = !isNonRetryable && (
          errMsg.includes('quota') || 
          errMsg.includes('overload') ||
          errMsg.includes('timeout') ||
          errMsg.includes('network') ||
          errMsg.includes('database_write')
        )
        
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
          let finalErrorCode = errorCode
          const errMessage = apiError.message || ''
          
          // Handle specific error types
          if (isInsufficientCredits) {
            errorMsg = t('profileSetupErrors.insufficientCredits') || errMessage
            finalErrorCode = 'INSUFFICIENT_CREDITS'
          } else if (errMessage.includes('code') || errMessage.includes('Code')) {
            errorMsg = t('profileSetupErrors.textContainsCode')
          } else if (errMessage.includes('ký tự đặc biệt')) {
            errorMsg = t('profileSetupErrors.tooManySpecialChars')
          } else if (errMessage.includes('repetition')) {
            errorMsg = t('profileSetupErrors.tooMuchRepetition')
          } else if (errMessage.includes('quota') || errMessage.includes('overload')) {
            errorMsg = t('profileSetupErrors.systemOverloaded')
          } else if (isRateLimit) {
            errorMsg = errMessage // Use the rate limit message from backend
          } else if (isDuplicate) {
            errorMsg = errMessage // Use the duplicate name message from backend
          } else if (isSimilar) {
            errorMsg = errMessage // Use the similar samples message from backend
          } else if (errMessage.includes('timeout') || errMessage.includes('TIMEOUT')) {
            errorMsg = t('profileSetupErrors.processingTooLong')
          } else if (errMessage.includes('DATABASE_WRITE')) {
            errorMsg = t('profileSetupErrors.dataSaveError')
          } else if (errMessage) {
            errorMsg = errMessage
          }
          
          setErrorMessage(errorMsg)
          setErrorCode(finalErrorCode)
          setShowError(true)
          setProcessing(false)
          isCreatingProfileRef.current = false // Reset flag on error
        }
      }
    } catch (error) {
      console.error('Create profile error:', error)
      if (mountedRef.current) {
        setErrorMessage(t('profileSetupErrors.unexpectedError'))
        setShowError(true)
        setProcessing(false)
        isCreatingProfileRef.current = false // Reset flag on error
      }
    }
  }, [profileData, setProfileData, setProcessing, setShowError, setShowCompletion, 
      setProcessingStep, setProcessingMessage, setErrorMessage, setErrorCode, setQualityScore, 
      mountedRef, timeoutsRef, t])

  // Keep createProfileRef updated with the latest createProfile function
  useEffect(() => {
    createProfileRef.current = createProfile
  }, [createProfile])

  // Trigger profile creation when entering step 4
  // CRITICAL: Use ref to ensure this only runs ONCE when entering step 4
  const hasTriggeredCreationRef = useRef(false)
  
  useEffect(() => {
    // Reset trigger flag when leaving step 4
    if (currentStep !== 4) {
      hasTriggeredCreationRef.current = false
      isCreatingProfileRef.current = false
      return
    }
    
    // Only trigger once when entering step 4
    if (hasTriggeredCreationRef.current) {
      return
    }
    
    // Don't trigger if component is unmounted
    if (!mountedRef.current) {
      return
    }
    
    // Mark as triggered BEFORE calling createProfile to prevent race conditions
    hasTriggeredCreationRef.current = true
    console.log('[PROFILE] Triggering profile creation (step 4 entered)')
    
    // Use setTimeout to ensure state updates are batched and prevent infinite loops
    const timeoutId = setTimeout(() => {
      if (mountedRef.current && currentStep === 4 && !isCreatingProfileRef.current) {
        // Call the latest createProfile function via ref
        createProfileRef.current?.()
      }
    }, 100) // Small delay to ensure all state updates are complete
    
    return () => clearTimeout(timeoutId)
  }, [currentStep]) // ONLY depend on currentStep - createProfile is accessed via ref

  // Don't render if cancelling or unmounted
  if (isCancelling || !mountedRef.current) {
    return null
  }

  return (
    <div className={cn(
      "fixed inset-0 bg-gray-100 flex items-center justify-center p-5 overflow-hidden z-modal-backdrop",
      "bg-[radial-gradient(at_20%_25%,hsla(240,80%,90%,0.8)_0px,transparent_50%),radial-gradient(at_80%_15%,hsla(320,70%,92%,0.7)_0px,transparent_50%),radial-gradient(at_50%_50%,hsla(200,60%,94%,0.6)_0px,transparent_55%),radial-gradient(at_10%_80%,hsla(280,50%,91%,0.5)_0px,transparent_50%),radial-gradient(at_90%_75%,hsla(180,50%,93%,0.6)_0px,transparent_55%)]",
      "before:content-[''] before:absolute before:inset-0 before:bg-white/25 before:z-0"
    )}>
      <div className={cn(
        "w-10/12 max-w-modal-2xl h-[85vh] bg-white/75 backdrop-blur-2xl",
        "border border-white/30 rounded-3xl shadow-lg",
        "overflow-hidden animate-slide-in relative z-base"
      )}>
        {/* Progress Bar */}
        <div className="py-[30px] px-10 pb-5 bg-transparent" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={4} aria-label={`Progress: Step ${currentStep} of 4`}>
          <div className="w-full h-1 bg-gray-200 rounded-xl overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-[#38bdf8] via-[#3b82f6] to-[#06b6d4] rounded-xl transition-[width] duration-400 ease-smooth" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-center text-sm text-input-placeholder font-medium">
            {t('profileSetupErrors.step')} {currentStep} / 4
          </div>
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
            errorCode={errorCode}
            qualityScore={qualityScore}
            totalSamples={totalSamples}
            onBack={() => {
              // Abort any pending API request to prevent race conditions
              if (abortControllerRef.current) {
                abortControllerRef.current.abort()
                abortControllerRef.current = null
              }
              // Clear all pending timeouts
              timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
              timeoutsRef.current = []
              // Reset creation refs to allow re-creation when returning to step 4
              isCreatingProfileRef.current = false
              hasTriggeredCreationRef.current = false
              
              // Navigate back to step 3 first, then reset states
              // This ensures the step change happens before state resets
              setCurrentStep(3)
              
              // Use requestAnimationFrame to batch state resets after navigation
              requestAnimationFrame(() => {
                setShowError(false)
                setErrorCode('')
                setErrorMessage('')
                setProcessing(false)
                setProcessingStep(1)
                setProcessingMessage('')
                setShowCompletion(false)
              })
            }}
            onRetry={() => {
              // Retry with current data
              setShowError(false)
              setErrorCode('')
              setErrorMessage('')
              isCreatingProfileRef.current = false
              createProfileRef.current?.()
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

      {/* Draft Restore Toast */}
      {hasDraft && draftInfo && currentStep === 1 && (
        <div className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-toast",
          "flex items-center gap-4 py-4 px-5 pr-12",
          "bg-white rounded-xl shadow-lg",
          "border border-gray-200 animate-slide-up"
        )}>
          <div className="w-10 h-10 rounded-lg bg-text-link/10 flex items-center justify-center text-text-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-800">{t('profileSetup.incompleteDraft')}</div>
            <div className="text-xs text-gray-600">
              {draftInfo.profileName ? `"${draftInfo.profileName}"` : t('nav.profile')} • {t('profileSetupErrors.step')} {draftInfo.currentStep || 1}
              {draftInfo.savedAt && ` • ${getDraftTimeAgo(draftInfo.savedAt)}`}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="py-2 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all" onClick={handleDiscardDraft}>
              {t('common.skip')}
            </button>
            <button className="py-2 px-4 text-sm font-medium text-white bg-text-link rounded-lg hover:bg-primary transition-all" onClick={handleRestoreDraft}>
              {t('profileSetup.restore')}
            </button>
          </div>
          <button className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-600 transition-all" onClick={handleDiscardDraft} aria-label={t('common.close')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Auto-save indicator */}
      {lastSavedAt && currentStep < 4 && (
        <div className="fixed bottom-6 right-6 z-modal-backdrop flex items-center gap-1.5 py-1.5 px-3 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 text-xs text-gray-600" title={t('profileSetup.autoSavingDraft')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>{t('profileSetup.saved')}</span>
        </div>
      )}

      {/* Cancel Confirm Modal */}
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
