import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, MotionConfig } from 'framer-motion'
import LazyLottie from '../Common/LazyLottie'
import { rewriteTextStream, iterativeHumanize } from '../../services/api'
import { useRewrite } from '@/stores'
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

const Button = ({ children, onClick, disabled, ariaLabel, active, variant }) => {
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
  const { selectedModel, writingPreferences } = useRewrite()
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleRewrite = async () => {
    // Check if text exists
    if (!text || text.trim().length === 0) {
      modal.alert(t('rewrite.pleaseEnterTextFirst'), t('rewrite.noText'))
      return
    }

    if (!currentProfile || isLoading) return
    
    const originalText = text // Save original text for error recovery
    
    // Check if iterative refinement is enabled
    const useIterative = writingPreferences?.useIterativeRefinement
    
    if (useIterative) {
      // Use iterative humanization (non-streaming)
      console.log('[LAUNCH] Starting iterative humanization...')
      setIsLoading(true)
      
      const loadingModal = modal.loading(t('rewrite.humanizing'))
      
      try {
        const result = await iterativeHumanize(
          currentProfile.profile_id,
          originalText,
          {
            maxIterations: 3,
            targetProbability: writingPreferences?.targetAIProbability || 35,
            model: selectedModel
          }
        )
        
        loadingModal.close()
        
        if (result.success && result.data) {
          onTextChange(result.data.rewritten_text)
          
          const emoji = result.data.reached_target ? '[SUCCESS]' : '[WARNING]'
          modal.success(
            `${emoji} ${t('rewrite.completedIterations', { count: result.data.iterations_used })}\n` +
            `${t('rewrite.aiProbability', { percent: result.data.final_ai_probability })}\n` +
            (result.data.warning || ''),
            t('rewrite.humanizationComplete')
          )
        } else {
          throw new Error(result.error || t('rewrite.humanizationFailed'))
        }
      } catch (error) {
        loadingModal.close()
        console.error('[FAIL] Error in iterative humanize:', error)
        modal.error(t('rewrite.humanizationFailed') + ' ' + error.message)
        onTextChange(originalText)
      } finally {
        setIsLoading(false)
      }
      return
    }
    
    // Standard streaming rewrite with enhanced anti-AI detection
    console.log('[LAUNCH] Starting rewrite process...')
    setIsLoading(true)
    
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
        currentProfile.profile_id,
        originalText,
        selectedModel,
        writingPreferences,
        (chunk) => {
          chunkCount++
          console.log(`[PACKAGE] Chunk ${chunkCount} received:`, chunk.substring(0, 50) + '...')
          
          // First chunk - clear editor
          if (!hasStartedStreaming) {
            hasStartedStreaming = true
            console.log('[SYNC] First chunk - clearing editor')
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
          
          console.log(`✍️ Buffer: ${fullText.length} chars, Displayed: ${displayedText.length} chars`)
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
      console.log(`[SUCCESS] Rewrite completed successfully - ${chunkCount} chunks received`)
      
    } catch (error) {
      console.error('[FAIL] Error rewriting:', error)
      modal.error(t('rewrite.rewriteFailed') + ' ' + error.message)
      // Restore original text on error
      onTextChange(originalText)
    } finally {
      setIsLoading(false)
      console.log('🏁 Rewrite process finished')
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
          modal.error(t('rewrite.unableToReadPdf') + ' ' + pdfError.message)
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
          modal.error(t('rewrite.unableToReadDocx') + ' ' + docxError.message)
          return
        }
      }

      loadingModal.close()

      if (extractedText && onTextChange) {
        onTextChange(extractedText)
        modal.success(t('rewrite.fileContentLoaded'))
      } else {
        modal.error(t('rewrite.unableToExtractContent'))
      }
    } catch (error) {
      loadingModal.close()
      console.error('Error reading file:', error)
      modal.error(t('rewrite.unableToReadFile') + ' ' + error.message)
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
          <div className="p-1.5 flex items-center gap-1.5 md:p-[5px] md:gap-[5px]">
            {/* Main Rewrite Button */}
            <Button
              onClick={handleRewrite}
              disabled={disabled || isLoading || !text || !currentProfile}
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
