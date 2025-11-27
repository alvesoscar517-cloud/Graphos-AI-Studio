import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './UploadFileModal.css'

const UploadFileModal = ({ isOpen, onClose, onSave, initialFiles = [], onFileRemove }) => {
  const { t } = useTranslation()
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [fileAnalysis, setFileAnalysis] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalWordCount, setTotalWordCount] = useState(0)

  // Load initial files when modal opens
  useEffect(() => {
    if (isOpen && initialFiles.length > 0) {
      // Reconstruct file analysis from saved data
      const analysis = initialFiles.map(item => ({
        file: item.file,
        text: item.text,
        analysis: analyzeFileText(item.text),
        isValid: true
      }))
      
      setFiles(initialFiles.map(item => item.file))
      setFileAnalysis(analysis)
      
      // Calculate total word count
      const total = analysis.reduce((sum, item) => 
        sum + (item.analysis?.wordCount || 0), 
        0
      )
      setTotalWordCount(total)
    } else if (!isOpen) {
      // Reset state when modal closes
      setFiles([])
      setIsDragging(false)
      setFileAnalysis([])
      setIsProcessing(false)
      setTotalWordCount(0)
    }
  }, [isOpen, initialFiles])

  // Analyze text from file
  const analyzeFileText = (text) => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0)
    const wordCount = words.length
    
    return {
      wordCount,
      isValid: wordCount >= 100, // Minimum 100 words per file
      status: wordCount < 100 ? 'too-short' : 
              wordCount < 500 ? 'acceptable' : 
              wordCount < 1000 ? 'good' : 
              wordCount < 2000 ? 'great' : 'excellent'
    }
  }

  // Extract text from file with validation
  const extractTextFromFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    
    try {
      let text = ''
      
      if (ext === 'txt') {
        text = await file.text()
      } else if (ext === 'docx') {
        const mammoth = await import('mammoth')
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        text = result.value
      } else if (ext === 'pdf') {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
        
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        
        const textPromises = []
        for (let i = 1; i <= pdf.numPages; i++) {
          textPromises.push(
            pdf.getPage(i).then(page => 
              page.getTextContent().then(content => 
                content.items.map(item => item.str).join(' ')
              )
            )
          )
        }
        const pageTexts = await Promise.all(textPromises)
        text = pageTexts.join('\n\n')
        
        // Check if PDF is image-based (very few words extracted)
        const words = text.trim().split(/\s+/).filter(w => w.length > 0)
        if (words.length < 50 && pdf.numPages > 0) {
          return { error: t('profileSetup.scannedPdfWarning') }
        }
      }
      
      // Validate text
      const words = text.trim().split(/\s+/).filter(w => w.length > 0)
      if (words.length === 0) {
        return { error: t('profileSetup.noValidText') }
      }
      
      // Limit to 5000 words per file
      if (words.length > 5000) {
        text = words.slice(0, 5000).join(' ')
        return { text, truncated: true, originalCount: words.length }
      }
      
      return { text }
      
    } catch (error) {
      console.error('Error extracting text:', error)
      return { error: t('profileSetup.unableToReadFormat', { format: ext.toUpperCase() }) }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFiles(selectedFiles)
  }

  const handleFiles = async (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase()
      if (!['docx', 'pdf', 'txt'].includes(ext)) {
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        return false
      }
      return true
    })
    
    if (validFiles.length === 0) return
    
    setIsProcessing(true)
    const newAnalysis = []
    
    for (const file of validFiles) {
      const result = await extractTextFromFile(file)
      
      if (result.error) {
        newAnalysis.push({
          file,
          error: result.error,
          isValid: false
        })
      } else {
        const analysis = analyzeFileText(result.text)
        newAnalysis.push({
          file,
          text: result.text,
          analysis,
          truncated: result.truncated,
          originalCount: result.originalCount,
          isValid: analysis.isValid
        })
      }
    }
    
    setFiles(prev => [...prev, ...validFiles])
    setFileAnalysis(prev => [...prev, ...newAnalysis])
    
    // Calculate total word count
    const total = newAnalysis.reduce((sum, item) => 
      sum + (item.analysis?.wordCount || 0), 
      totalWordCount
    )
    setTotalWordCount(total)
    
    setIsProcessing(false)
  }

  const handleRemoveFile = (index) => {
    const removedAnalysis = fileAnalysis[index]
    const newFiles = files.filter((_, i) => i !== index)
    const newFileAnalysis = fileAnalysis.filter((_, i) => i !== index)
    
    setFiles(newFiles)
    setFileAnalysis(newFileAnalysis)
    
    // Update total word count
    if (removedAnalysis?.analysis?.wordCount) {
      setTotalWordCount(prev => prev - removedAnalysis.analysis.wordCount)
    }
  }

  const handleSave = () => {
    // Only save files with valid text
    const validAnalysis = fileAnalysis.filter(item => item.isValid && item.text)
    
    let currentTotal = 0
    const MAX_WORDS = 5000
    
    const processedFiles = validAnalysis.map(item => {
      const words = item.text.trim().split(/\s+/).filter(w => w.length > 0)
      const remainingSpace = MAX_WORDS - currentTotal
      
      if (remainingSpace <= 0) {
        return null // Skip this file if we've reached the limit
      }
      
      let finalText = item.text
      if (words.length > remainingSpace) {
        // Truncate to fit within the limit
        finalText = words.slice(0, remainingSpace).join(' ')
      }
      
      currentTotal += Math.min(words.length, remainingSpace)
      
      return {
        file: item.file,
        text: finalText
      }
    }).filter(Boolean) // Remove null entries
    
    // Always call onSave, even if empty (to allow clearing files)
    onSave(processedFiles)
  }
  
  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'too-short': return t('profileSetup.tooShort')
      case 'acceptable': return t('profileSetup.acceptable')
      case 'good': return t('profileSetup.good')
      case 'great': return t('profileSetup.veryGood')
      case 'excellent': return t('profileSetup.excellent')
      default: return ''
    }
  }
  
  const validFilesCount = fileAnalysis.filter(item => item.isValid).length
  // Allow save if: has valid files with enough words, OR no files (to clear)
  const canSave = (validFilesCount > 0 && totalWordCount >= 500) || files.length === 0

  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="upload-modal-overlay" onClick={handleClose}>
      <div className="upload-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header with Icon */}
        <div className="upload-modal-header">
          <div className="upload-modal-icon">
            <img src="/icon/paperclip.svg" alt={t('profileSetup.uploadDocumentsTitle')} width="24" height="24" />
          </div>
          <div>
            <h2 className="upload-modal-title">{t('profileSetup.uploadDocumentsTitle')}</h2>
            <p className="upload-modal-subtitle">
              {t('profileSetup.uploadDocumentsSubtitle')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="upload-modal-content">
          {/* Modern Upload Zone */}
          <div 
            className={`upload-modern-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Background Image */}
            <div className="upload-background-image">
              <img src="/icon for background/monster-chibi.svg" alt="Upload" />
            </div>
            
            {/* Upload Info */}
            <div className="upload-info-section">
              <p className="upload-support-text">{t('profileSetup.supportedFormats')}</p>
              <button 
                className="upload-modern-btn"
                onClick={() => document.getElementById('uploadFileInput').click()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                {t('profileSetup.selectFromComputer')}
              </button>
              <input
                type="file"
                id="uploadFileInput"
                accept=".docx,.pdf,.txt"
                multiple
                hidden
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* File List with Analysis */}
          {files.length > 0 && (
            <div className="upload-file-list">
              {isProcessing && (
                <div className="upload-processing">
                  <div className="upload-spinner"></div>
                  <span>{t('profileSetup.analyzingText')}</span>
                </div>
              )}
              
              {fileAnalysis.map((item, index) => (
                <div key={index} className={`upload-file-item ${item.error ? 'error' : ''} ${!item.isValid ? 'invalid' : ''}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                  </svg>
                  <div className="upload-file-info">
                    <div className="upload-file-name">{item.file.name}</div>
                    {item.error ? (
                      <div className="upload-file-error">{item.error}</div>
                    ) : (
                      <div className="upload-file-analysis">
                        <span className="upload-word-count">
                          {item.analysis.wordCount} {t('common.words')}
                        </span>
                        <span className="upload-status-badge">
                          {getStatusLabel(item.analysis.status)}
                        </span>
                        {item.truncated && (
                          <span className="upload-truncated">
                            ({t('profileSetup.trimmedFrom', { count: item.originalCount })})
                          </span>
                        )}
                        {!item.isValid && (
                          <span className="upload-warning">
                            {t('profileSetup.minimum100Words')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button 
                    className="upload-file-remove"
                    onClick={() => handleRemoveFile(index)}
                    data-tooltip={t('common.remove')}
                    data-tooltip-position="left"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
              
              {/* Total Summary */}
              {fileAnalysis.length > 0 && !isProcessing && (
                <div className="upload-summary">
                  <div className="upload-summary-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    <span>{t('profileSetup.totalFromFiles', { words: Math.min(totalWordCount, 5000), valid: validFilesCount, total: files.length })}</span>
                  </div>
                  {totalWordCount < 500 && (
                    <div className="upload-summary-hint">
                      {t('profileSetup.needMoreWordsFile', { count: 500 - totalWordCount })}
                    </div>
                  )}
                  {totalWordCount >= 500 && totalWordCount < 1000 && (
                    <div className="upload-summary-hint success">
                      {t('profileSetup.minimumReachedFile', { count: 1000 - totalWordCount })}
                    </div>
                  )}
                  {totalWordCount >= 1000 && totalWordCount < 5000 && (
                    <div className="upload-summary-hint success">
                      [{t('profileSetup.excellent').toUpperCase()}] {t('profileSetup.excellentEnough')}
                    </div>
                  )}
                  {totalWordCount >= 5000 && (
                    <div className="upload-summary-hint success">
                      {t('profileSetup.perfectMaximum')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="upload-modal-footer">
          <button className="upload-modal-btn upload-modal-btn-cancel" onClick={handleClose}>
            {t('common.cancel')}
          </button>
          <button 
            className="upload-modal-btn upload-modal-btn-save" 
            onClick={handleSave}
            disabled={!canSave || isProcessing}
          >
            {isProcessing ? t('common.processing') : 
             files.length === 0 ? t('profileSetup.clearAll') : 
             t('profileSetup.confirmCount', { count: validFilesCount })}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadFileModal
