import { useState, useRef } from 'react'
import { motion, MotionConfig } from 'framer-motion'
import Lottie from 'lottie-react'
import { rewriteTextStream, iterativeHumanize } from '../../services/api'
import { useRewrite } from '../../contexts/RewriteContext'
import modal from '../../utils/modal'
import threeDotsAnimation from '../../animation/Three dots loading.json'
import './RewriteToolbar.css'

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
      className={`toolbar-btn ${active ? 'active' : ''} ${variant ? `toolbar-btn-${variant}` : ''}`}
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
  const { selectedModel, writingPreferences } = useRewrite()
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleRewrite = async () => {
    // Check if text exists
    if (!text || text.trim().length === 0) {
      modal.alert('Please enter text before rewriting', 'No Text')
      return
    }

    if (!currentProfile || isLoading) return
    
    const originalText = text // Save original text for error recovery
    
    // Check if iterative refinement is enabled
    const useIterative = writingPreferences?.useIterativeRefinement
    
    if (useIterative) {
      // Use iterative humanization (non-streaming)
      console.log('🚀 Starting iterative humanization...')
      setIsLoading(true)
      
      const loadingModal = modal.loading('Đang humanize văn bản... (có thể mất 30-60 giây)')
      
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
          
          const emoji = result.data.reached_target ? '✅' : '⚠️'
          modal.success(
            `${emoji} Hoàn thành sau ${result.data.iterations_used} lần lặp\n` +
            `AI Probability: ${result.data.final_ai_probability}%\n` +
            (result.data.warning || ''),
            'Humanization Complete'
          )
        } else {
          throw new Error(result.error || 'Humanization failed')
        }
      } catch (error) {
        loadingModal.close()
        console.error('❌ Error in iterative humanize:', error)
        modal.error('Humanization thất bại: ' + error.message)
        onTextChange(originalText)
      } finally {
        setIsLoading(false)
      }
      return
    }
    
    // Standard streaming rewrite with enhanced anti-AI detection
    console.log('🚀 Starting rewrite process...')
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
          console.log(`📦 Chunk ${chunkCount} received:`, chunk.substring(0, 50) + '...')
          
          // First chunk - clear editor
          if (!hasStartedStreaming) {
            hasStartedStreaming = true
            console.log('🔄 First chunk - clearing editor')
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
      console.log(`✅ Rewrite completed successfully - ${chunkCount} chunks received`)
      
    } catch (error) {
      console.error('❌ Error rewriting:', error)
      modal.error('Viết lại thất bại: ' + error.message)
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
      modal.error('Only .txt, .pdf, .docx files are supported')
      return
    }

    const loadingModal = modal.loading('Reading file...')

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
          modal.error('Unable to read PDF file: ' + pdfError.message)
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
          modal.error('Unable to read DOCX file: ' + docxError.message)
          return
        }
      }

      loadingModal.close()

      if (extractedText && onTextChange) {
        onTextChange(extractedText)
        modal.success('File content loaded to editor')
      } else {
        modal.error('Unable to extract content from file')
      }
    } catch (error) {
      loadingModal.close()
      console.error('Error reading file:', error)
      modal.error('Unable to read file: ' + error.message)
    }

    // Reset input
    event.target.value = ''
  }

  if (!visible) return null

  // Determine button label based on settings
  const rewriteLabel = writingPreferences?.useIterativeRefinement 
    ? 'Humanize' 
    : writingPreferences?.useAntiAIDetection 
    ? 'Smart Rewrite' 
    : 'Rewrite'

  return (
    <MotionConfig transition={transition}>
      <motion.div 
        className="rewrite-toolbar-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <div className="rewrite-toolbar">
          <div className="toolbar-content">
            {/* Main Rewrite Button */}
            <Button
              onClick={handleRewrite}
              disabled={disabled || isLoading || !text || !currentProfile}
              ariaLabel="Rewrite text"
              active={isLoading}
              variant={writingPreferences?.useIterativeRefinement ? 'primary' : ''}
            >
              <img 
                src={writingPreferences?.useIterativeRefinement ? '/icon/user-check.svg' : '/icon/pen.svg'} 
                alt="Rewrite" 
                className="toolbar-icon" 
              />
              <span className="toolbar-label">{rewriteLabel}</span>
              {isLoading && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Lottie 
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
              ariaLabel="Upload file"
            >
              <img src="/icon/upload.svg" alt="Upload" className="toolbar-icon" />
              <span className="toolbar-label">Upload</span>
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
