import { logger } from '@/utils/logger'
import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { rewriteTextStream, startIterativeHumanize, pollAndStreamHumanizeJob } from '../../services/api'
import { useRewrite, useAIProcessingActions } from '@/stores'
import { getLocalizedContentError } from '../../utils/errorMessages'
import { handleCreditError } from '../../utils/creditHandler'
import modal from '../../utils/modal'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import { cn } from '../../lib/utils'

const transition = {
  type: 'spring',
  bounce: 0,
  duration: 0.2,
  stiffness: 400,
  damping: 30,
}

const Button = ({ children, onClick, disabled, ariaLabel, active = false, variant = '' }) => {
  return (
    <button
      className={cn(
        "rewrite-toolbar-btn",
        "relative flex items-center justify-center gap-2 h-10 px-5",
        "border-none rounded-xl",
        "text-sm font-medium cursor-pointer",
        "transition-all duration-150 select-none whitespace-nowrap shrink-0",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
        "focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 focus-visible:rounded-xl",
        active && "active",
        variant === 'primary' && "variant-primary"
      )}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}

const RewriteToolbar = ({ 
  visible, 
  currentProfile, 
  text, 
  onTextChange,
  disabled 
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { selectedModel, writingPreferences } = useRewrite()
  const { startProcessing, startStreaming, stopProcessing } = useAIProcessingActions()
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  const hasProfile = currentProfile !== null

  // Check if at least one feature is enabled for rewrite/humanize
  const hasAnyFeatureEnabled = () => {
    const prefs = writingPreferences || {}
    // If no profile, only anti-AI and iterative refinement matter
    if (!hasProfile) {
      return prefs.useAntiAIDetection || prefs.useIterativeRefinement
    }
    // If has profile, check all features
    return prefs.useAntiAIDetection || prefs.useIterativeRefinement ||
           prefs.useVocabularyPreferences || prefs.useKeyCharacteristics ||
           prefs.useSentencePatterns || prefs.useRewriteInstructions
  }

  const handleRewrite = async () => {
    // Check if text exists
    if (!text || text.trim().length === 0) {
      modal.alert(t('rewrite.pleaseEnterTextFirst'), t('rewrite.noText'))
      return
    }

    // Check if at least one feature is enabled
    if (!hasAnyFeatureEnabled()) return
    if (isLoading) return

    const useIterative = writingPreferences?.useIterativeRefinement
    
    const originalText = text // Save original text for error recovery
    
    if (useIterative) {
      // Use async iterative humanization
      logger.log('[LAUNCH] Starting async iterative humanization...')
      setIsLoading(true)
      startProcessing('humanize')
      
      try {
        // Start async job - profile_id is optional for generic humanization
        const startResult = await startIterativeHumanize(
          currentProfile?.profile_id || null,
          originalText,
          {
            maxIterations: 3,
            targetProbability: writingPreferences?.targetAIProbability || 35,
            model: selectedModel,
            writingPreferences: writingPreferences
          }
        )
        
        if (!startResult.success) {
          throw new Error(startResult.error || t('rewrite.humanizationFailed'))
        }
        
        logger.log('[LAUNCH] Job started:', startResult.jobId, 'Estimated:', startResult.estimatedTime?.display)
        
        // Variables for streaming animation
        let fullText = ''
        let displayedText = ''
        let isAnimating = false
        let hasStartedStreaming = false
        
        const animateText = () => {
          if (displayedText.length < fullText.length) {
            const remaining = fullText.length - displayedText.length
            const charsToAdd = Math.max(1, Math.min(3, Math.ceil(remaining / 20)))
            displayedText = fullText.substring(0, displayedText.length + charsToAdd)
            onTextChange(displayedText)
            requestAnimationFrame(animateText)
          } else {
            isAnimating = false
          }
        }
        
        // Poll for progress, then stream result when completed
        const result = await pollAndStreamHumanizeJob(startResult.jobId, {
          onProgress: (progress) => {
            logger.log('[PROGRESS]', progress)
          },
          onChunk: (chunk) => {
            if (!hasStartedStreaming) {
              hasStartedStreaming = true
              logger.log('[SYNC] First chunk - starting stream')
              startStreaming()
              onTextChange('')
              displayedText = ''
            }
            
            fullText += chunk
            
            if (!isAnimating) {
              isAnimating = true
              animateText()
            }
          },
          onComplete: (metadata) => {
            logger.log('[COMPLETE] Streaming finished:', metadata)
          },
          pollInterval: 1500,
          maxWaitTime: 300000
        })
        
        // Wait for animation to complete
        const waitForAnimation = () => {
          return new Promise((resolve) => {
            const checkAnimation = () => {
              if (!isAnimating && displayedText.length >= fullText.length) {
                resolve()
              } else {
                requestAnimationFrame(checkAnimation)
              }
            }
            checkAnimation()
          })
        }
        
        if (hasStartedStreaming) {
          await waitForAnimation()
        } else if (result.success && result.data) {
          // Fallback if streaming didn't work
          startStreaming()
          onTextChange(result.data.rewritten_text)
        }
        
        if (!result.success) {
          throw new Error(result.error || t('rewrite.humanizationFailed'))
        }
      } catch (error) {
        console.error('[FAIL] Error in iterative humanize:', error)
        
        // Restore original text on error
        onTextChange(originalText)
        
        // Check if it's a credit error first
        const wasCreditError = handleCreditError(error, t, () => navigate('/pricing'))
        
        if (!wasCreditError) {
          const localizedError = getLocalizedContentError(error.message, t)
          modal.errorWithReport(localizedError || t('rewrite.humanizationFailed'), error, 'Error', 'RewriteToolbar.handleHumanize')
        }
      } finally {
        setIsLoading(false)
        stopProcessing()
      }
      return
    }
    
    // Standard streaming rewrite with enhanced anti-AI detection
    logger.log('[LAUNCH] Starting rewrite process...')
    setIsLoading(true)
    startProcessing('rewrite')
    
    try {
      let fullText = '' // Complete text buffer
      let displayedText = '' // Currently displayed text
      let hasStartedStreaming = false
      let chunkCount = 0
      let animationFrameId = null
      let isAnimating = false
      
      // Smooth animation function
      const animateText = () => {
        if (displayedText.length < fullText.length) {
          // Calculate how many characters to add (adaptive speed)
          const remaining = fullText.length - displayedText.length
          const charsToAdd = Math.max(1, Math.min(3, Math.ceil(remaining / 20)))
          
          displayedText = fullText.substring(0, displayedText.length + charsToAdd)
          onTextChange(displayedText)
          
          animationFrameId = requestAnimationFrame(animateText)
        } else {
          isAnimating = false
          animationFrameId = null
        }
      }
      
      await rewriteTextStream(
        currentProfile?.profile_id || null,
        originalText,
        selectedModel,
        writingPreferences,
        (chunk, type) => {
          // Skip reasoning chunks - feature removed
          if (type === 'reasoning') {
            return
          }
          
          chunkCount++
          logger.log(`[PACKAGE] Chunk ${chunkCount} received:`, chunk.substring(0, 50) + '...')
          
          // First content chunk - start streaming
          if (!hasStartedStreaming) {
            hasStartedStreaming = true
            logger.log('[SYNC] First chunk - starting stream')
            startStreaming()
            onTextChange('') // Clear old text immediately
            displayedText = ''
          }
          
          // Add chunk to full text buffer
          fullText += chunk
          
          // Start smooth animation if not already running
          if (!isAnimating) {
            isAnimating = true
            animateText()
          }
          
          logger.log(`✍️ Buffer: ${fullText.length} chars, Displayed: ${displayedText.length} chars`)
        }
      )
      
      // Wait for animation to complete naturally
      const waitForAnimation = () => {
        return new Promise((resolve) => {
          const checkAnimation = () => {
            if (!isAnimating && displayedText.length >= fullText.length) {
              resolve()
            } else {
              requestAnimationFrame(checkAnimation)
            }
          }
          checkAnimation()
        })
      }
      
      await waitForAnimation()
      
      // Success - text is already in editor
      logger.log(`[SUCCESS] Rewrite completed successfully - ${chunkCount} chunks received`)
      
    } catch (error) {
      console.error('[FAIL] Error rewriting:', error)
      
      // Restore original text on error
      onTextChange(originalText)
      
      // Check if it's a credit error first
      const wasCreditError = handleCreditError(error, t, () => navigate('/pricing'))
      
      if (!wasCreditError) {
        const localizedError = getLocalizedContentError(error.message, t)
        modal.errorWithReport(localizedError || t('rewrite.rewriteFailed'), error, 'Error', 'RewriteToolbar.handleRewrite')
      }
    } finally {
      setIsLoading(false)
      stopProcessing()
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]

    const fileName = file.name.toLowerCase()
    const isValidType = validTypes.includes(file.type) || 
                       fileName.endsWith('.txt') || 
                       fileName.endsWith('.pdf') || 
                       fileName.endsWith('.docx') || 
                       fileName.endsWith('.doc')

    if (!isValidType) {
      modal.error(t('rewrite.onlyTxtPdfDocx'))
      return
    }

    const loadingModal = modal.loading(t('rewrite.readingFile'))

    try {
      let extractedText = ''

      if (file.type === 'text/plain' || fileName.endsWith('.txt')) {
        extractedText = await file.text()
      } else if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
        // For PDF, use pdfjs-dist
        try {
          const pdfjsModule = await import('pdfjs-dist')
          const pdfjsLib = pdfjsModule.default || pdfjsModule
          
          // Set worker source
          if (pdfjsLib.GlobalWorkerOptions) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
          }
          
          const arrayBuffer = await file.arrayBuffer()
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
          const pdf = await loadingTask.promise
          
          let fullText = ''
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map(item => item.str).join(' ')
            fullText += pageText + '\n\n'
          }
          
          extractedText = fullText.trim()
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError)
          loadingModal.close()
          modal.errorWithReport(t('rewrite.unableToReadPdf') + ' ' + pdfError.message, pdfError, 'Error', 'RewriteToolbar.parsePDF')
          return
        }
      } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        // For DOCX, use mammoth
        try {
          const mammothModule = await import('mammoth')
          const mammoth = mammothModule.default || mammothModule
          const arrayBuffer = await file.arrayBuffer()
          const result = await mammoth.extractRawText({ arrayBuffer })
          extractedText = result.value
        } catch (docxError) {
          console.error('DOCX parsing error:', docxError)
          loadingModal.close()
          modal.errorWithReport(t('rewrite.unableToReadDocx') + ' ' + docxError.message, docxError, 'Error', 'RewriteToolbar.parseDOCX')
          return
        }
      }

      loadingModal.close()

      if (extractedText && onTextChange) {
        onTextChange(extractedText)
        modal.success(t('rewrite.fileContentLoaded'))
      } else {
        modal.errorWithReport(t('rewrite.unableToExtractContent'), new Error('Empty content'), 'Error', 'RewriteToolbar.extractContent')
      }
    } catch (error) {
      loadingModal.close()
      console.error('Error reading file:', error)
      modal.errorWithReport(t('rewrite.unableToReadFile') + ' ' + error.message, error, 'Error', 'RewriteToolbar.readFile')
    }

    // Reset input
    event.target.value = ''
  }

  if (!visible) return null

  // Determine button label based on settings
  const rewriteLabel = writingPreferences?.useIterativeRefinement 
    ? t('rewrite.humanize') 
    : t('rewrite.rewrite')

  return (
    <MotionConfig transition={transition}>
      <motion.div 
        className={cn(
          "absolute bottom-6 left-0 right-0 z-sidebar",
          "pointer-events-none flex justify-center items-center",
          "md:bottom-4"
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <div className="rewrite-toolbar-container pointer-events-auto rounded-2xl overflow-hidden backdrop-blur-xl md:max-w-[calc(100vw-32px)]">
          <div className="p-1.5 flex flex-col gap-1.5 md:p-[5px] md:gap-[5px]">
            <div className="flex items-center gap-1.5 md:gap-[5px]">
              {/* Main Rewrite Button */}
              <Button
                onClick={handleRewrite}
                disabled={disabled || isLoading || !text || !hasAnyFeatureEnabled()}
                ariaLabel={t('rewrite.rewriteText')}
                active={isLoading}
                variant={writingPreferences?.useIterativeRefinement ? 'primary' : ''}
              >
                <img 
                  src={writingPreferences?.useIterativeRefinement ? '/icon/user-check.svg' : '/icon/pen.svg'} 
                  alt={t('rewrite.rewrite')} 
                  className={cn(
                    "w-icon-md h-icon-md shrink-0 opacity-55 transition-opacity duration-150",
                    "group-hover:not-disabled:opacity-85 icon-invert",
                    isLoading && "invisible",
                    writingPreferences?.useIterativeRefinement && "invert opacity-90"
                  )}
                />
                <span className={cn(
                  "text-sm leading-tight font-medium opacity-85 tracking-tight transition-opacity duration-150",
                  "group-hover:not-disabled:opacity-100",
                  isLoading && "invisible",
                  writingPreferences?.useIterativeRefinement && "opacity-100"
                )}>{rewriteLabel}</span>
                {isLoading && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <LazyLottie 
                      animationData={threeDotsAnimation} 
                      loop={true}
                      style={{ width: 40, height: 16 }}
                    />
                  </div>
                )}
              </Button>
              
              {/* Upload Button */}
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isLoading}
                ariaLabel={t('rewrite.uploadFile')}
              >
                <img 
                  src="/icon/upload.svg" 
                  alt={t('common.upload')} 
                  className={cn(
                    "w-icon-md h-icon-md shrink-0 opacity-55 transition-opacity duration-150",
                    "group-hover:not-disabled:opacity-85 icon-invert"
                  )}
                />
                <span className={cn(
                  "text-sm leading-tight font-medium opacity-85 tracking-tight transition-opacity duration-150",
                  "group-hover:not-disabled:opacity-100"
                )}>{t('common.upload')}</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf,.docx,.doc"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        
      </motion.div>
    </MotionConfig>
  )
}

export default RewriteToolbar
