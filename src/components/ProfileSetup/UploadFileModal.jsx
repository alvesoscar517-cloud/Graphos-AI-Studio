import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import Icon from '../Common/Icon'

const UploadFileModal = ({ isOpen, onClose, onSave, initialFiles = [] }) => {
  const { t } = useTranslation()
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [fileAnalysis, setFileAnalysis] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalWordCount, setTotalWordCount] = useState(0)

  useEffect(() => {
    if (isOpen && initialFiles.length > 0) {
      const analysis = initialFiles.map(item => ({
        file: item.file,
        text: item.text,
        analysis: analyzeFileText(item.text),
        isValid: true
      }))
      setFiles(initialFiles.map(item => item.file))
      setFileAnalysis(analysis)
      const total = analysis.reduce((sum, item) => sum + (item.analysis?.wordCount || 0), 0)
      setTotalWordCount(total)
    } else if (!isOpen) {
      setFiles([])
      setIsDragging(false)
      setFileAnalysis([])
      setIsProcessing(false)
      setTotalWordCount(0)
    }
  }, [isOpen, initialFiles])

  const analyzeFileText = (text) => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0)
    const wordCount = words.length
    return {
      wordCount,
      isValid: wordCount >= 100,
      status: wordCount < 100 ? 'too-short' : wordCount < 500 ? 'acceptable' : wordCount < 1000 ? 'good' : wordCount < 2000 ? 'great' : 'excellent'
    }
  }

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
          textPromises.push(pdf.getPage(i).then(page => page.getTextContent().then(content => content.items.map(item => item.str).join(' '))))
        }
        const pageTexts = await Promise.all(textPromises)
        text = pageTexts.join('\n\n')
        const words = text.trim().split(/\s+/).filter(w => w.length > 0)
        if (words.length < 50 && pdf.numPages > 0) return { error: t('profileSetup.scannedPdfWarning') }
      }
      const words = text.trim().split(/\s+/).filter(w => w.length > 0)
      if (words.length === 0) return { error: t('profileSetup.noValidText') }
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

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleFiles(Array.from(e.dataTransfer.files)) }
  const handleFileSelect = (e) => { handleFiles(Array.from(e.target.files)) }

  const handleFiles = async (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase()
      return ['docx', 'pdf', 'txt'].includes(ext) && file.size <= 10 * 1024 * 1024
    })
    if (validFiles.length === 0) return
    setIsProcessing(true)
    const newAnalysis = []
    for (const file of validFiles) {
      const result = await extractTextFromFile(file)
      if (result.error) {
        newAnalysis.push({ file, error: result.error, isValid: false })
      } else {
        const analysis = analyzeFileText(result.text)
        newAnalysis.push({ file, text: result.text, analysis, truncated: result.truncated, originalCount: result.originalCount, isValid: analysis.isValid })
      }
    }
    setFiles(prev => [...prev, ...validFiles])
    setFileAnalysis(prev => [...prev, ...newAnalysis])
    setTotalWordCount(prev => prev + newAnalysis.reduce((sum, item) => sum + (item.analysis?.wordCount || 0), 0))
    setIsProcessing(false)
  }

  const handleRemoveFile = (index) => {
    const removedAnalysis = fileAnalysis[index]
    setFiles(files.filter((_, i) => i !== index))
    setFileAnalysis(fileAnalysis.filter((_, i) => i !== index))
    if (removedAnalysis?.analysis?.wordCount) setTotalWordCount(prev => prev - removedAnalysis.analysis.wordCount)
  }

  const handleSave = () => {
    const validAnalysis = fileAnalysis.filter(item => item.isValid && item.text)
    let currentTotal = 0
    const MAX_WORDS = 5000
    const processedFiles = validAnalysis.map(item => {
      const words = item.text.trim().split(/\s+/).filter(w => w.length > 0)
      const remainingSpace = MAX_WORDS - currentTotal
      if (remainingSpace <= 0) return null
      let finalText = item.text
      if (words.length > remainingSpace) finalText = words.slice(0, remainingSpace).join(' ')
      currentTotal += Math.min(words.length, remainingSpace)
      return { file: item.file, text: finalText }
    }).filter(Boolean)
    onSave(processedFiles)
  }

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
  const canSave = (validFilesCount > 0 && totalWordCount >= 500) || files.length === 0

  if (!isOpen) return null

  return (
    <div className={cn("fixed inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center z-modal p-5 animate-fade-in")} onClick={onClose}>
      <div className={cn("bg-white border border-gray-200 rounded-3xl w-full max-w-[580px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up-bounce max-md:max-w-[95%]")} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-6 pb-4 shrink-0">
          <div className="card-icon !w-10 !h-10">
            <Icon name="paperclip" size="md" color="primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 m-0 mb-1 tracking-tight">{t('profileSetup.uploadDocumentsTitle')}</h2>
            <p className="text-xs text-text-muted m-0 leading-relaxed">{t('profileSetup.uploadDocumentsSubtitle')}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pb-6 pt-3 bg-white overflow-y-auto scrollbar-none">
          {/* Upload Zone */}
          <div className={cn("rounded-2xl py-6 px-6 text-center transition-all duration-300 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 border-dashed relative overflow-hidden", isDragging &&"border-accent bg-gradient-to-br from-blue-50 to-blue-100 scale-[1.01] shadow-lg")} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <div className="flex items-center justify-center mb-4">
              <img src="/icon for background/monster-chibi.svg" alt="Upload" className={cn("w-28 h-28 object-contain opacity-50", isDragging &&"opacity-80")} />
            </div>
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-slate-500 m-0 font-medium">{t('profileSetup.supportedFormats')}</p>
              <button className="py-3 px-6 bg-primary text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 inline-flex items-center gap-2 shadow-sm hover:bg-primary-hover hover:shadow-md hover:-translate-y-0.5 active:translate-y-0" onClick={() => document.getElementById('uploadFileInput').click()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {t('profileSetup.selectFromComputer')}
              </button>
              <input type="file" id="uploadFileInput" accept=".docx,.pdf,.txt" multiple hidden onChange={handleFileSelect} />
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 flex flex-col gap-3">
              {isProcessing && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl text-primary text-sm font-medium">
                  <div className="w-5 h-5 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                  <span>{t('profileSetup.analyzingText')}</span>
                </div>
              )}
              {fileAnalysis.map((item, index) => (
                <div key={index} className={cn("flex items-center gap-4 p-4 bg-bg-secondary rounded-xl transition-all duration-200 animate-slide-in hover:bg-bg-hover", item.error &&"bg-red-50 border border-red-200", !item.isValid && !item.error &&"bg-amber-50 border border-amber-200")}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary shrink-0"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 mb-1 overflow-hidden text-ellipsis whitespace-nowrap">{item.file.name}</div>
                    {item.error ? (
                      <div className="text-sm text-gray-700 font-medium">{item.error}</div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap text-sm">
                        <span className="text-gray-700 font-semibold">{item.analysis.wordCount} {t('common.words')}</span>
                        <span className="font-medium text-xs text-text-muted">{getStatusLabel(item.analysis.status)}</span>
                        {item.truncated && <span className="text-text-muted text-xs">({t('profileSetup.trimmedFrom', { count: item.originalCount })})</span>}
                        {!item.isValid && <span className="text-gray-700 text-xs font-medium">{t('profileSetup.minimum100Words')}</span>}
                      </div>
                    )}
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center bg-transparent border-none rounded-lg cursor-pointer transition-all duration-200 text-error shrink-0 hover:bg-red-100" onClick={() => handleRemoveFile(index)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
              {fileAnalysis.length > 0 && !isProcessing && (
                <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span>{t('profileSetup.totalFromFiles', { words: Math.min(totalWordCount, 5000), valid: validFilesCount, total: files.length })}</span>
                  </div>
                  {totalWordCount < 500 && <div className="text-sm text-slate-500 pl-6">{t('profileSetup.needMoreWordsFile', { count: 500 - totalWordCount })}</div>}
                  {totalWordCount >= 500 && totalWordCount < 1000 && <div className="text-sm text-gray-700 font-medium pl-6">{t('profileSetup.minimumReachedFile', { count: 1000 - totalWordCount })}</div>}
                  {totalWordCount >= 1000 && totalWordCount < 5000 && <div className="text-sm text-gray-700 font-medium pl-6">[{t('profileSetup.excellent').toUpperCase()}] {t('profileSetup.excellentEnough')}</div>}
                  {totalWordCount >= 5000 && <div className="text-sm text-gray-700 font-medium pl-6">{t('profileSetup.perfectMaximum')}</div>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-6 py-4 bg-white shrink-0">
          <button className="py-3 px-7 text-md font-semibold border-none rounded-xl cursor-pointer transition-all duration-200 bg-bg-secondary text-text-muted hover:bg-bg-hover" onClick={onClose}>{t('common.cancel')}</button>
          <button className="py-3 px-7 text-md font-semibold border-none rounded-xl cursor-pointer transition-all duration-200 bg-primary text-white hover:bg-primary-hover hover:shadow-md hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none" onClick={handleSave} disabled={!canSave || isProcessing}>
            {isProcessing ? t('common.processing') : files.length === 0 ? t('profileSetup.clearAll') : t('profileSetup.confirmCount', { count: validFilesCount })}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadFileModal
