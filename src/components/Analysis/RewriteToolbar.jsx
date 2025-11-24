import { useState, useRef, useEffect } from 'react'
import { motion, MotionConfig } from 'framer-motion'
import { rewriteTextStream } from '../../services/api'
import { useRewrite } from '../../contexts/RewriteContext'
import { useAIProcessing } from '../../contexts/AIProcessingContext'
import modal from '../../utils/modal'
import './RewriteToolbar.css'

const transition = {
  type: 'spring',
  bounce: 0.15,
  duration: 0.3,
  stiffness: 300,
  damping: 25,
}

const Button = ({ children, onClick, disabled, ariaLabel, active }) => {
  return (
    <button
      className={`toolbar-btn ${active ? 'active' : ''}`}
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
  const { startProcessing, stopProcessing } = useAIProcessing()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef(null)
  const fileInputRef = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  // Reset state when visibility changes
  useEffect(() => {
    if (!visible) {
      setIsExpanded(false)
    }
  }, [visible])

  const handleRewrite = async () => {
    // Check if text exists
    if (!text || text.trim().length === 0) {
      modal.alert('Vui lòng nhập văn bản trước khi viết lại', 'Không có văn bản')
      return
    }

    if (!currentProfile || isLoading) return
    
    const originalText = text // Save original text for error recovery
    
    console.log('🚀 Starting rewrite process...')
    setIsLoading(true)
    startProcessing('rewrite')
    
    try {
      let streamedText = ''
      let hasStartedStreaming = false
      let chunkCount = 0
      
      await rewriteTextStream(
        currentProfile.profile_id,
        originalText,
        selectedModel,
        writingPreferences,
        (chunk) => {
          chunkCount++
          console.log(`📦 Chunk ${chunkCount} received:`, chunk.substring(0, 50) + '...')
          
          // First chunk - stop shimmer and clear editor
          if (!hasStartedStreaming) {
            hasStartedStreaming = true
            console.log('🔄 First chunk - stopping shimmer and clearing editor')
            stopProcessing() // Stop shimmer effect immediately
            onTextChange('') // Clear old text immediately
          }
          
          // Append chunk to streamed text
          streamedText += chunk
          onTextChange(streamedText)
          console.log(`✍️ Updated editor with ${streamedText.length} characters`)
        }
      )
      
      // Success - text is already in editor
      console.log(`✅ Rewrite completed successfully - ${chunkCount} chunks received`)
      
    } catch (error) {
      console.error('❌ Error rewriting:', error)
      stopProcessing()
      modal.error('Viết lại thất bại: ' + error.message)
      // Restore original text on error
      onTextChange(originalText)
    } finally {
      setIsLoading(false)
      stopProcessing()
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
      modal.error('Chỉ hỗ trợ file .txt, .pdf, .docx')
      return
    }

    const loadingModal = modal.loading('Đang đọc file...')

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
          modal.error('Không thể đọc file PDF: ' + pdfError.message)
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
          modal.error('Không thể đọc file DOCX: ' + docxError.message)
          return
        }
      }

      loadingModal.close()

      if (extractedText && onTextChange) {
        onTextChange(extractedText)
        modal.success('Đã tải nội dung file lên editor')
      } else {
        modal.error('Không thể trích xuất nội dung từ file')
      }
    } catch (error) {
      loadingModal.close()
      console.error('Error reading file:', error)
      modal.error('Không thể đọc file: ' + error.message)
    }

    // Reset input
    event.target.value = ''
  }

  if (!visible) return null

  return (
    <MotionConfig transition={transition}>
      <motion.div 
        className="rewrite-toolbar-container" 
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="rewrite-toolbar"
          animate={{
            width: isExpanded ? '260px' : '100px',
          }}
          initial={false}
        >
          <div className="toolbar-content">
            {!isExpanded ? (
              <div className="toolbar-collapsed">
                <Button
                  onClick={handleRewrite}
                  disabled={disabled || isLoading || !text || !currentProfile}
                  ariaLabel="Viết lại văn bản"
                  active={isLoading}
                >
                  {!isLoading && <img src="/icon/pen.svg" alt="Rewrite" className="toolbar-icon" />}
                </Button>
                <Button
                  onClick={() => setIsExpanded(true)}
                  ariaLabel="Mở thêm tùy chọn"
                >
                  <img src="/icon/chevron-right.svg" alt="Expand" className="toolbar-icon" />
                </Button>
              </div>
            ) : (
              <div className="toolbar-expanded">
                <Button
                  onClick={() => setIsExpanded(false)}
                  ariaLabel="Thu gọn"
                >
                  <img src="/icon/chevron-left.svg" alt="Collapse" className="toolbar-icon" />
                </Button>
                
                <div className="toolbar-divider" />
                
                <Button
                  onClick={handleRewrite}
                  disabled={disabled || isLoading || !text || !currentProfile}
                  ariaLabel="Viết lại văn bản"
                  active={isLoading}
                >
                  {!isLoading && (
                    <>
                      <img src="/icon/pen.svg" alt="Rewrite" className="toolbar-icon" />
                      <span className="toolbar-label">Viết lại</span>
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  ariaLabel="Tải file lên"
                >
                  <img src="/icon/upload.svg" alt="Upload" className="toolbar-icon" />
                  <span className="toolbar-label">Tải file</span>
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.docx,.doc"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </MotionConfig>
  )
}

export default RewriteToolbar
