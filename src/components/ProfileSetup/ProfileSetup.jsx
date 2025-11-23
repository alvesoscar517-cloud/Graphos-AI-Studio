import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProfileComplete } from '../../services/api'
import { splitTextIntoChunks, validateSampleText } from '../../utils/textSplitter'
import { clearCachedProfileDetail, clearAllProfileDetailCaches } from '../../utils/profileDetailCache'
import modal from '../../utils/modal'
import LottieWrapper from './LottieWrapper'
import PasteTextModal from './PasteTextModal'
import UploadFileModal from './UploadFileModal'
import '../../styles/ProfileSetup.css'
import '../../styles/ThemeSelector.css'

// Import animations
import loaderCatAnimation from '../../animation/loader-cat.json'
import biometricAnimation from '../../animation/biometric-authentication.json'
import contactMailAnimation from '../../animation/contact-mail.json'
import loadingBlueAnimation from '../../animation/loading-animation-blue.json'
import faceIdAnimation from '../../animation/face-id.json'
import error404Animation from '../../animation/404 blue.json'

const ProfileSetup = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [animationKey, setAnimationKey] = useState(0)
  const mountedRef = useRef(true)
  const cancellingRef = useRef(false)
  const timeoutsRef = useRef([])

  const [profileData, setProfileData] = useState({
    name: '',
    profileId: null,
    theme: 'work',
    pastedChunks: [],     // Chunks from paste
    uploadedChunks: [],   // Chunks from upload
    uploadedFiles: [],    // Store uploaded file info for display
    pastedTextOriginal: '', // Original pasted text for editing
    shortSamples: []      // Store samples locally
  })

  // Step 1 state
  const [profileName, setProfileName] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('work')

  // Step 2 state
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [hasPastedText, setHasPastedText] = useState(false)
  const [hasUploadedFiles, setHasUploadedFiles] = useState(false)

  // Step 3 state
  const [shortText, setShortText] = useState('')
  const [samples, setSamples] = useState([])
  const [shortTextWordCount, setShortTextWordCount] = useState(0)
  const [currentSampleIndex, setCurrentSampleIndex] = useState(-1) // -1 means new sample mode
  const [isEditingMode, setIsEditingMode] = useState(false)

  // Step 4 state
  const [processing, setProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(1)
  const [processingMessage, setProcessingMessage] = useState('')
  const [showCompletion, setShowCompletion] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [qualityScore, setQualityScore] = useState(null)

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    
    return () => {
      mountedRef.current = false
      // Clear all pending timeouts
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutsRef.current = []
    }
  }, [])

  // Real-time word count for Step 3
  useEffect(() => {
    if (shortText.trim()) {
      const words = shortText.trim().split(/\s+/).filter(w => w.length > 0)
      setShortTextWordCount(words.length)
    } else {
      setShortTextWordCount(0)
    }
  }, [shortText])

  // Force remount animations when step changes
  useEffect(() => {
    setAnimationKey(prev => prev + 1)
  }, [currentStep])



  // Theme options
  const themes = [
    { id: 'work', name: 'Công việc', icon: 'briefcase' },
    { id: 'personal', name: 'Cá nhân', icon: 'user' },
    { id: 'academic', name: 'Học thuật', icon: 'graduation-cap' },
    { id: 'creative', name: 'Sáng tạo', icon: 'palette' },
    { id: 'business', name: 'Kinh doanh', icon: 'trending-up' },
    { id: 'social', name: 'Mạng xã hội', icon: 'message-circle' },
    { id: 'technical', name: 'Kỹ thuật', icon: 'code' },
    { id: 'other', name: 'Khác', icon: 'more-horizontal' }
  ]

  // Step 1: Just validate and move to next step (no API call)
  const handleNextStep1 = () => {
    if (!profileName.trim()) return

    setProfileData(prev => ({
      ...prev,
      name: profileName.trim(),
      theme: selectedTheme
    }))
    setCurrentStep(2)
  }

  // Calculate total word count
  const getTotalWordCount = () => {
    const pastedWords = profileData.pastedChunks.reduce((sum, chunk) => {
      return sum + chunk.split(/\s+/).filter(w => w.length > 0).length
    }, 0)
    const uploadedWords = profileData.uploadedChunks.reduce((sum, chunk) => {
      return sum + chunk.split(/\s+/).filter(w => w.length > 0).length
    }, 0)
    return pastedWords + uploadedWords
  }

  // Helper function to detect duplicate or highly similar chunks
  const detectDuplicates = (chunks) => {
    const duplicates = []
    const seen = new Set()
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i].trim().toLowerCase()
      
      // Check exact duplicates
      if (seen.has(chunk)) {
        duplicates.push(i)
        continue
      }
      
      // Check similarity with existing chunks (simple word overlap check)
      const words1 = chunk.split(/\s+/)
      let isDuplicate = false
      
      for (const seenChunk of seen) {
        const words2 = seenChunk.split(/\s+/)
        const commonWords = words1.filter(w => words2.includes(w)).length
        const similarity = commonWords / Math.max(words1.length, words2.length)
        
        // If more than 80% similar, consider it a duplicate
        if (similarity > 0.8) {
          duplicates.push(i)
          isDuplicate = true
          break
        }
      }
      
      if (!isDuplicate) {
        seen.add(chunk)
      }
    }
    
    return duplicates
  }

  // Step 2: Handle paste text (split into chunks, save locally)
  const handleSavePaste = async (text) => {
    try {
      // Note: PasteTextModal already handles auto-truncation to 3000 words
      // So we don't need to check here anymore
      
      // Split text into chunks
      const chunks = splitTextIntoChunks(text, {
        minLength: 200,
        maxLength: 2000,
        method: 'paragraph'
      })

      if (chunks.length === 0) {
        modal.alert('Văn bản quá ngắn hoặc không hợp lệ', 'Lỗi', 'error', true)
        return
      }

      // Detect duplicates
      const duplicateIndices = detectDuplicates(chunks)
      if (duplicateIndices.length > 0) {
        const uniqueChunks = chunks.filter((_, i) => !duplicateIndices.includes(i))
        
        if (uniqueChunks.length === 0) {
          modal.alert('Tất cả các đoạn văn bản đều trùng lặp. Vui lòng cung cấp nội dung đa dạng hơn.', 'Nội dung trùng lặp', 'warning', true)
          return
        }
        
        const confirmed = await modal.confirm(
          `Phát hiện ${duplicateIndices.length} đoạn văn bản trùng lặp hoặc quá giống nhau.\n\nChỉ giữ lại ${uniqueChunks.length} đoạn duy nhất để AI học tốt hơn?`,
          'Phát hiện trùng lặp',
          { type: 'question', forceLight: true, confirmText: 'Loại bỏ trùng lặp', cancelText: 'Giữ tất cả' }
        )
        
        if (confirmed) {
          // Use unique chunks only
          const uniqueWords = uniqueChunks.reduce((sum, chunk) => {
            return sum + chunk.split(/\s+/).filter(w => w.length > 0).length
          }, 0)
          
          setProfileData(prev => ({
            ...prev,
            pastedChunks: uniqueChunks,
            pastedTextOriginal: text
          }))
          
          setHasPastedText(true)
          setShowPasteModal(false)
          modal.toast(`Đã lưu ${uniqueChunks.length} đoạn văn bản duy nhất (${uniqueWords} từ)`, '', 'success')
          return
        }
        // If user chooses to keep all, continue with all chunks
      }

      // Validate chunks
      const invalidChunks = chunks.filter(chunk => !validateSampleText(chunk).valid)
      if (invalidChunks.length > 0) {
        modal.alert(`${invalidChunks.length} đoạn văn bản không hợp lệ`, 'Lỗi', 'error', true)
        return
      }

      // Count words in chunks
      const pastedWords = chunks.reduce((sum, chunk) => {
        return sum + chunk.split(/\s+/).filter(w => w.length > 0).length
      }, 0)

      setProfileData(prev => ({
        ...prev,
        pastedChunks: chunks,
        pastedTextOriginal: text
      }))

      setHasPastedText(true)
      setShowPasteModal(false)
      modal.toast(`Đã lưu ${chunks.length} đoạn văn bản (${pastedWords} từ)`, '', 'success')
    } catch (error) {
      modal.alert('Không thể xử lý văn bản. Vui lòng thử lại.', 'Lỗi', 'error', true)
    }
  }

  // Step 2: Handle file upload (text already extracted and validated in modal)
  const handleSaveUpload = async (fileData) => {
    try {
      // If no files, clear everything
      if (!fileData || fileData.length === 0) {
        setProfileData(prev => ({
          ...prev,
          uploadedChunks: [],
          uploadedFiles: []
        }))
        setHasUploadedFiles(false)
        setShowUploadModal(false)
        modal.toast('Đã xóa tất cả file', '', 'success')
        return
      }

      let allChunks = []
      let currentWordCount = 0
      const MAX_WORDS = 3000
      
      for (const item of fileData) {
        if (item.text && currentWordCount < MAX_WORDS) {
          const chunks = splitTextIntoChunks(item.text, {
            minLength: 200,
            maxLength: 2000,
            method: 'paragraph'
          })
          
          // Add chunks until we reach 3000 words limit
          for (const chunk of chunks) {
            const chunkWords = chunk.split(/\s+/).filter(w => w.length > 0).length
            if (currentWordCount + chunkWords <= MAX_WORDS) {
              allChunks.push(chunk)
              currentWordCount += chunkWords
            } else {
              // Truncate last chunk to fit
              const remainingWords = MAX_WORDS - currentWordCount
              if (remainingWords > 0) {
                const words = chunk.split(/\s+/).filter(w => w.length > 0)
                const truncatedChunk = words.slice(0, remainingWords).join(' ')
                allChunks.push(truncatedChunk)
                currentWordCount = MAX_WORDS
              }
              break
            }
          }
          
          if (currentWordCount >= MAX_WORDS) break
        }
      }

      if (allChunks.length === 0) {
        modal.alert('Không thể trích xuất văn bản từ file', 'Lỗi', 'error', true)
        return
      }

      // Detect duplicates in uploaded chunks
      const duplicateIndices = detectDuplicates(allChunks)
      if (duplicateIndices.length > 0) {
        const uniqueChunks = allChunks.filter((_, i) => !duplicateIndices.includes(i))
        
        if (uniqueChunks.length === 0) {
          modal.alert('Tất cả các đoạn văn bản trong file đều trùng lặp. Vui lòng cung cấp nội dung đa dạng hơn.', 'Nội dung trùng lặp', 'warning', true)
          return
        }
        
        const confirmed = await modal.confirm(
          `Phát hiện ${duplicateIndices.length} đoạn văn bản trùng lặp trong file.\n\nChỉ giữ lại ${uniqueChunks.length} đoạn duy nhất?`,
          'Phát hiện trùng lặp',
          { type: 'question', forceLight: true, confirmText: 'Loại bỏ trùng lặp', cancelText: 'Giữ tất cả' }
        )
        
        if (confirmed) {
          allChunks = uniqueChunks
        }
      }

      // Count words in uploaded files (after truncation)
      const uploadedWords = allChunks.reduce((sum, chunk) => {
        return sum + chunk.split(/\s+/).filter(w => w.length > 0).length
      }, 0)
      
      setProfileData(prev => ({
        ...prev,
        uploadedChunks: allChunks,
        uploadedFiles: fileData // Save file info for display
      }))
      setHasUploadedFiles(true)
      setShowUploadModal(false)
      modal.toast(`Đã xử lý ${allChunks.length} đoạn văn bản từ ${fileData.length} file (${uploadedWords} từ)`, '', 'success')
    } catch (error) {
      console.error('Error processing uploaded files:', error)
      modal.alert('Không thể xử lý file. Vui lòng thử lại.', 'Lỗi', 'error', true)
    }
  }

  // Step 3: Add or update sample with smart validation
  const handleAddSample = async () => {
    if (!shortText.trim()) return
    
    // If editing mode, don't allow adding more than 5
    if (!isEditingMode && profileData.shortSamples.length >= 5) return

    const text = shortText.trim()
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const wordCount = words.length

    // Word count validation (20-300 words for short samples)
    if (wordCount < 20) {
      modal.alert('Mẫu văn bản quá ngắn. Cần ít nhất 20 từ để AI học được phong cách của bạn.', 'Văn bản quá ngắn', 'warning', true)
      return
    }
    if (wordCount > 300) {
      modal.alert('Mẫu văn bản quá dài. Tối đa 300 từ cho văn bản ngắn. Hãy rút gọn hoặc chia thành nhiều mẫu.', 'Văn bản quá dài', 'warning', true)
      return
    }

    // Basic validation
    const validation = validateSampleText(text)
    if (!validation.valid) {
      modal.alert(validation.error, 'Lỗi', 'error', true)
      return
    }

    // Check for duplicates (skip current sample if editing)
    const existingSamples = profileData.shortSamples
    for (let i = 0; i < existingSamples.length; i++) {
      if (isEditingMode && i === currentSampleIndex) continue // Skip current sample when editing
      
      const existing = existingSamples[i].toLowerCase()
      const newSample = text.toLowerCase()
      
      // Exact duplicate check
      if (existing === newSample) {
        modal.alert('Mẫu này đã tồn tại. Vui lòng cung cấp mẫu khác để AI học đa dạng hơn.', 'Mẫu trùng lặp', 'warning', true)
        return
      }
      
      // Similarity check (simple word overlap)
      const words1 = existing.split(/\s+/)
      const words2 = newSample.split(/\s+/)
      const commonWords = words1.filter(w => words2.includes(w)).length
      const similarity = commonWords / Math.max(words1.length, words2.length)
      
      if (similarity > 0.7) {
        const confirmed = await modal.confirm(
          `Mẫu này có ${Math.round(similarity * 100)}% giống với mẫu #${i + 1}.\n\nBạn có muốn ${isEditingMode ? 'cập nhật' : 'thêm'} mẫu này không? Mẫu đa dạng sẽ giúp AI học tốt hơn.`,
          'Mẫu tương tự',
          { type: 'question', forceLight: true, confirmText: isEditingMode ? 'Cập nhật' : 'Thêm mẫu', cancelText: 'Hủy' }
        )
        if (!confirmed) return
        break
      }
    }

    if (isEditingMode && currentSampleIndex >= 0) {
      // Update existing sample
      const newSamples = [...samples]
      newSamples[currentSampleIndex] = text
      setSamples(newSamples)
      
      setProfileData(prev => ({
        ...prev,
        shortSamples: newSamples
      }))
      
      modal.toast(`Đã cập nhật mẫu #${currentSampleIndex + 1} (${wordCount} từ)`, '', 'success')
      setIsEditingMode(false)
      setCurrentSampleIndex(-1)
    } else {
      // Add new sample
      setProfileData(prev => ({
        ...prev,
        shortSamples: [...prev.shortSamples, text]
      }))
      
      setSamples(prev => [...prev, text])
      modal.toast(`Đã thêm mẫu (${wordCount} từ)`, '', 'success')
    }
    
    setShortText('')
  }

  // Navigate between samples
  const handleNavigateSample = (direction) => {
    if (samples.length === 0) return
    
    let newIndex = currentSampleIndex
    if (direction === 'prev') {
      newIndex = currentSampleIndex <= 0 ? samples.length - 1 : currentSampleIndex - 1
    } else {
      newIndex = currentSampleIndex >= samples.length - 1 ? 0 : currentSampleIndex + 1
    }
    
    setCurrentSampleIndex(newIndex)
    setShortText(samples[newIndex])
    setIsEditingMode(true)
  }

  // Step 4: Create complete profile with real progress tracking
  useEffect(() => {
    if (currentStep !== 4 || processing || !mountedRef.current) return

    const handleCreateCompleteProfile = async () => {
      if (!mountedRef.current) return
      
      setProcessing(true)
      setShowError(false)
      setShowCompletion(false)
      setProcessingStep(1)
      setProcessingMessage('Đang chuẩn bị dữ liệu...')

      try {
        // Prepare all samples (combine pasted and uploaded chunks)
        const allLongChunks = [...profileData.pastedChunks, ...profileData.uploadedChunks]
        const allSamples = [
          ...allLongChunks.map(text => ({ text, type: 'long' })),
          ...profileData.shortSamples.map(text => ({ text, type: 'short' }))
        ]

        console.log(`📦 Creating profile with ${allSamples.length} samples (${allLongChunks.length} long + ${profileData.shortSamples.length} short)`)

        if (allSamples.length < 3) {
          if (mountedRef.current) {
            setErrorMessage('Cần ít nhất 3 mẫu văn bản để tạo hồ sơ')
            setShowError(true)
            setProcessing(false)
          }
          return
        }

        // Estimate time based on sample count
        const estimatedTime = Math.max(15, allSamples.length * 2) // 2 seconds per sample, min 15s
        
        if (!mountedRef.current) return
        
        // Step 1: Preparing (20% - 3s)
        setProcessingStep(1)
        setProcessingMessage(`Đang chuẩn bị ${allSamples.length} mẫu văn bản...`)
        
        await new Promise(resolve => {
          const timeout = setTimeout(resolve, 3000)
          timeoutsRef.current.push(timeout)
        })
        
        if (!mountedRef.current) return
        
        // Step 2: Creating embeddings and analyzing (60% - actual API call)
        setProcessingStep(2)
        setProcessingMessage(`Đang tạo embeddings và phân tích văn phong... (${estimatedTime}s)`)
        
        try {
          const response = await createProfileComplete(
            profileData.name,
            profileData.theme,
            allSamples
          )
          
          if (!mountedRef.current) return
          
          // Check if API returned error
          if (!response.success) {
            throw new Error(response.error || 'Không thể tạo hồ sơ')
          }
          
          // Store profile ID and quality score
          setProfileData(prev => ({
            ...prev,
            profileId: response.profile_id
          }))
          
          if (response.quality_score) {
            setQualityScore(response.quality_score)
          }
          
          // Clear caches after profile creation
          clearAllProfileDetailCaches()
          
          // Step 3: Finalizing (20% - 2s)
          setProcessingStep(3)
          setProcessingMessage('Đang hoàn thiện hồ sơ...')
          
          await new Promise(resolve => {
            const timeout = setTimeout(resolve, 2000)
            timeoutsRef.current.push(timeout)
          })
          
          if (mountedRef.current) {
            setProcessing(false)
            setShowCompletion(true)
          }
        } catch (apiError) {
          console.error('API error:', apiError)
          if (mountedRef.current) {
            // Show user-friendly error message
            let errorMsg = 'Không thể tạo hồ sơ. Vui lòng thử lại.'
            
            if (apiError.message.includes('code') || apiError.message.includes('Code')) {
              errorMsg = 'Văn bản chứa code. Vui lòng cung cấp văn bản tự nhiên (email, blog, tin nhắn...)'
            } else if (apiError.message.includes('ký tự đặc biệt')) {
              errorMsg = 'Văn bản chứa quá nhiều ký tự đặc biệt. Vui lòng cung cấp văn bản có nghĩa.'
            } else if (apiError.message.includes('lặp lại')) {
              errorMsg = 'Văn bản lặp lại quá nhiều. Vui lòng cung cấp nội dung đa dạng hơn.'
            } else if (apiError.message.includes('quota') || apiError.message.includes('quá tải')) {
              errorMsg = 'Hệ thống đang quá tải. Vui lòng thử lại sau vài phút.'
            } else if (apiError.message) {
              errorMsg = apiError.message
            }
            
            setErrorMessage(errorMsg)
            setShowError(true)
            setProcessing(false)
          }
        }
      } catch (error) {
        console.error('Create profile error:', error)
        if (mountedRef.current) {
          setErrorMessage('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.')
          setShowError(true)
          setProcessing(false)
        }
      }
    }

    handleCreateCompleteProfile()
  }, [currentStep, profileData.name, profileData.theme, profileData.pastedChunks, profileData.uploadedChunks, profileData.shortSamples])

  // Complete setup
  const handleComplete = () => {
    localStorage.setItem('activeProfileId', profileData.profileId)
    localStorage.setItem('activeProfileName', profileData.name)
    localStorage.setItem('profileCacheInvalidated', 'true')
    navigate('/')
  }

  // Calculate total samples and words for display
  const totalChunks = profileData.pastedChunks.length + profileData.uploadedChunks.length
  const totalSamples = totalChunks + profileData.shortSamples.length
  const totalWords = getTotalWordCount()
  const hasLongText = hasPastedText || hasUploadedFiles
  const progressPercentage = (currentStep / 4) * 100

  const handleCancel = useCallback(async () => {
    // Prevent if component is unmounting
    if (!mountedRef.current || isCancelling) {
      return
    }
    
    // Prevent multiple simultaneous calls
    if (cancellingRef.current) {
      return
    }
    
    try {
      cancellingRef.current = true
      setIsCancelling(true)
      
      const hasData = profileName || hasPastedText || hasUploadedFiles || samples.length > 0
      if (hasData) {
        const confirmed = await modal.confirm(
          'Tất cả dữ liệu đã nhập sẽ bị mất.',
          'Hủy bỏ tạo hồ sơ?',
          { type: 'warning', danger: true, forceLight: true, confirmText: 'Hủy bỏ' }
        )
        
        if (!confirmed) {
          if (mountedRef.current) {
            setIsCancelling(false)
          }
          cancellingRef.current = false
          return
        }
      }
      
      // Clear all timeouts before navigating
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutsRef.current = []
      
      navigate('/', { replace: true })
    } catch (error) {
      console.error('[ProfileSetup] Error in handleCancel:', error)
      navigate('/', { replace: true })
    } finally {
      cancellingRef.current = false
    }
  }, [profileName, hasPastedText, hasUploadedFiles, samples.length, isCancelling, navigate])

  // Don't render if cancelling or unmounted
  if (isCancelling || !mountedRef.current) {
    return null
  }

  return (
    <div className="profile-setup-page">
      <div className="setup-container">
        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="progress-text">Bước {currentStep} / 4</div>
        </div>

        {/* Step 1: Profile Name */}
        {currentStep === 1 && (
        <div className="step-content active">
          <div className="content-wrapper">
            <div className="animation-container">
              <LottieWrapper key={`step1-${animationKey}`} animationData={loaderCatAnimation} loop={true} />
            </div>
            <div className="form-container">
              <div className="step1-form-content">
                <h1 className="step-title">Bắt đầu Hiệu chỉnh Văn phong của bạn</h1>
                <p className="step-description">
                  Đặt một cái tên dễ nhớ. Bạn có thể tạo nhiều hồ sơ (ở gói Premium) để chuyển đổi giữa các văn phong khác nhau.
                </p>

                <div className="input-group">
                  <label htmlFor="profileName">Tên Hồ sơ</label>
                  <input
                    type="text"
                    id="profileName"
                    placeholder="Ví dụ: Blog cá nhân, Email cho sếp, Khách hàng B2B..."
                    maxLength="50"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                  <div className="input-hint">Tối đa 50 ký tự</div>
                </div>
                
                <div className="input-group">
                  <label htmlFor="profileTheme">Chủ đề</label>
                  <div className="theme-selector-wrapper">
                    <div className="theme-selector-grid">
                      {themes.map(theme => (
                        <button
                          key={theme.id}
                          className={`theme-btn ${selectedTheme === theme.id ? 'theme-selected' : ''}`}
                          data-theme={theme.id}
                          onClick={() => setSelectedTheme(theme.id)}
                        >
                          <img 
                            src={`/icon/${theme.icon}.svg`} 
                            alt={theme.name}
                            className="theme-btn-icon"
                          />
                          <span className="theme-btn-label">{theme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="button-group">
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleCancel}
                    disabled={isCancelling}
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    className="btn btn-primary" 
                    disabled={!profileName.trim() || isCancelling}
                    onClick={handleNextStep1}
                  >
                    Tiếp theo
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Step 2: Long Text */}
        {currentStep === 2 && (
        <div className="step-content step-content-2 active">
          <div className="content-wrapper">
            <div className="animation-container">
              <LottieWrapper key={`step2-${animationKey}`} animationData={biometricAnimation} loop={true} />
            </div>
            <div className="form-container">
              <div className="step2-form-content">
                <h1 className="step-title">Cung cấp Văn bản Dài</h1>
                <p className="step-description">
                  Dán hoặc tải lên các bài viết, blog, email dài (300-800 từ tối ưu) để AI học cấu trúc lập luận và phong cách viết của bạn. Hệ thống sẽ phân tích chất lượng real-time.
                </p>
              
              <div className="option-cards">
                <div 
                  className={`option-card ${hasPastedText ? 'has-data' : ''}`}
                  onClick={() => setShowPasteModal(true)}
                >
                  <div className="option-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    </svg>
                  </div>
                  <div className="option-content">
                    <h3>Dán Văn bản</h3>
                    <p>Dán trực tiếp các bài viết, email, blog của bạn</p>
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
                  onClick={() => setShowUploadModal(true)}
                >
                  <div className="option-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <div className="option-content">
                    <h3>Tải lên Tài liệu</h3>
                    <p>Tải lên file .docx, .pdf, .txt từ máy tính</p>
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

              {/* Always show status badge - with data or tip */}
              {totalChunks > 0 ? (
                <div className="saved-chunks-badge">
                  <div className="saved-chunks-left">
                    <div className="saved-chunks-icon">
                      <img src="/icon/check-circle.svg" alt="" width="18" height="18" />
                    </div>
                    <div className="saved-chunks-content">
                      <span className="saved-chunks-label">Đã lưu:</span>
                      <span className="saved-chunks-count">{totalWords}</span>
                      <span className="saved-chunks-unit">/ 3000 từ</span>
                      <span className="saved-chunks-detail">({totalChunks} đoạn)</span>
                    </div>
                  </div>
                  <div className="saved-chunks-actions">
                    {hasPastedText && (
                      <button 
                        className="btn-edit-text"
                        onClick={() => setShowPasteModal(true)}
                        title="Xem và chỉnh sửa văn bản đã dán"
                      >
                        <img src="/icon/edit-2.svg" alt="" width="16" height="16" />
                        <span>Sửa văn bản</span>
                      </button>
                    )}
                    {hasUploadedFiles && (
                      <button 
                        className="btn-edit-text"
                        onClick={() => setShowUploadModal(true)}
                        title="Xem và quản lý file đã tải lên"
                      >
                        <img src="/icon/file-text.svg" alt="" width="16" height="16" />
                        <span>Quản lý file</span>
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
                    <span className="tip-text">Cung cấp 800-1500 từ để AI học tốt nhất. Có thể kết hợp dán văn bản và tải file.</span>
                  </div>
                </div>
              )}

                <div className="button-group">
                  <button className="btn btn-secondary" onClick={() => setCurrentStep(1)}>Quay lại</button>
                  <button 
                    className="btn btn-primary" 
                    disabled={!hasLongText}
                    onClick={() => setCurrentStep(3)}
                  >
                    Tiếp theo
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Step 3: Short Samples */}
        {currentStep === 3 && (
        <div className="step-content active">
          <div className="content-wrapper">
            <div className="animation-container">
              <LottieWrapper key={`step3-${animationKey}`} animationData={contactMailAnimation} loop={true} />
            </div>
            <div className="form-container">
              <div className="step3-form-content">
                <h1 className="step-title">Cung cấp Văn bản Ngắn</h1>
                <p className="step-description">
                  Tuyệt vời! Giờ hãy cung cấp 3-5 mẫu văn bản ngắn (20-300 từ) như email, tin nhắn để AI 'học' cách bạn chào hỏi, dùng từ và thể hiện cảm xúc. Hệ thống sẽ tự động kiểm tra trùng lặp.
                </p>
                
                <div className="modern-textarea-container">
                  <textarea
                    id="shortText"
                    placeholder={samples.length >= 5 && !isEditingMode ? "Đã đạt giới hạn 5 mẫu. Click vào nút tích để chỉnh sửa mẫu." : "Dán mẫu email hoặc tin nhắn của bạn vào đây..."}
                    rows="8"
                    value={shortText}
                    onChange={(e) => setShortText(e.target.value)}
                    disabled={samples.length >= 5 && !isEditingMode}
                  ></textarea>

                  <div className="sample-action-buttons">
                    {isEditingMode && (
                      <button 
                        className="btn btn-secondary cancel-edit-btn"
                        onClick={() => {
                          setShortText('')
                          setIsEditingMode(false)
                          setCurrentSampleIndex(-1)
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Hủy
                      </button>
                    )}
                    <button 
                      className="btn btn-primary add-sample-btn"
                      disabled={!shortText.trim() || (!isEditingMode && samples.length >= 5) || shortTextWordCount < 20 || shortTextWordCount > 300}
                      onClick={handleAddSample}
                    >
                      {isEditingMode ? (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Cập nhật mẫu
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          {samples.length >= 5 ? 'Đã đủ 5 mẫu' : 'Thêm mẫu'}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="sample-progress-smart">
                  <button 
                    className="sample-nav-btn"
                    onClick={() => handleNavigateSample('prev')}
                    disabled={samples.length === 0}
                    title="Xem mẫu trước"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>

                  <div className="sample-progress-center">
                    <div className="sample-progress-text">
                      {isEditingMode ? (
                        <>Đang xem: <span>Mẫu #{currentSampleIndex + 1}</span> / {samples.length}</>
                      ) : (
                        <>Tiến độ: <span>{samples.length}</span> / 3 mẫu tối thiểu</>
                      )}
                    </div>
                    <div className="sample-checkmarks-modern">
                      {Array.from({ length: Math.max(3, samples.length) }, (_, i) => i).map(i => (
                        <button 
                          key={i}
                          className={`checkmark-btn ${i < samples.length ? 'completed' : ''} ${isEditingMode && i === currentSampleIndex ? 'active' : ''}`}
                          disabled={i >= samples.length}
                          onClick={() => {
                            if (i < samples.length) {
                              setCurrentSampleIndex(i)
                              setShortText(samples[i])
                              setIsEditingMode(true)
                            }
                          }}
                          title={i < samples.length ? `Xem mẫu #${i + 1}` : ''}
                        >
                          {isEditingMode && i === currentSampleIndex ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>

                  </div>

                  <button 
                    className="sample-nav-btn"
                    onClick={() => handleNavigateSample('next')}
                    disabled={samples.length === 0}
                    title="Xem mẫu tiếp theo"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>

                <div className="button-group">
                  <button className="btn btn-secondary" onClick={() => setCurrentStep(2)}>Quay lại</button>
                  <button 
                    className="btn btn-primary"
                    disabled={samples.length < 3}
                    onClick={() => setCurrentStep(4)}
                  >
                    Tiếp theo
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Step 4: Processing */}
        {currentStep === 4 && !showCompletion && !showError && (
        <div className="step-content active">
          <div className="content-wrapper-processing">
            <div className="animation-container-large">
              <LottieWrapper key={`step4-${animationKey}`} animationData={loadingBlueAnimation} loop={true} />
            </div>
            <div className="form-container-processing">
              <h1 className="step-title">Đang Hiệu chỉnh Hồ sơ</h1>
              <p className="step-description">
                {processingMessage || 'Đang xử lý...'}
              </p>

              <div className="checklist">
                <div className={`checklist-item ${processingStep >= 1 ? processingStep === 1 ? 'processing' : 'completed' : ''}`}>
                  {processingStep === 1 ? (
                    <div className="item-spinner"></div>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                  <span>Chuẩn bị {totalSamples} mẫu văn bản (3-5s)</span>
                </div>
                <div className={`checklist-item ${processingStep >= 2 ? processingStep === 2 ? 'processing' : 'completed' : ''}`}>
                  {processingStep === 2 ? (
                    <div className="item-spinner"></div>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                  <span>Tạo embeddings và phân tích văn phong ({Math.max(15, totalSamples * 2)}s)</span>
                </div>
                <div className={`checklist-item ${processingStep >= 3 ? processingStep === 3 ? 'processing' : 'completed' : ''}`}>
                  {processingStep === 3 ? (
                    <div className="item-spinner"></div>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                  <span>Hoàn thiện và lưu hồ sơ (2-3s)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Error Modal */}
        {showError && (
          <div className="completion-modal error-modal active">
            <div className="completion-modal-content">
              <div className="completion-animation">
                <LottieWrapper key={`error-${animationKey}`} animationData={error404Animation} loop={true} />
              </div>
              <h1 className="completion-title error-title">Oops! Có lỗi xảy ra</h1>
              <p className="completion-subtitle error-subtitle">{errorMessage}</p>
              <div className="error-actions">
                <button 
                  className="btn btn-secondary btn-large" 
                  onClick={() => {
                    setShowError(false)
                    setCurrentStep(3)
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  Quay lại chỉnh sửa
                </button>
                <button 
                  className="btn btn-primary btn-large" 
                  onClick={() => {
                    setShowError(false)
                    setCurrentStep(4)
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
                  </svg>
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Completion Modal */}
        {showCompletion && (
          <div className="completion-modal active">
            <div className="completion-modal-content">
              <div className="completion-animation">
                <LottieWrapper key={`completion-${animationKey}`} animationData={faceIdAnimation} loop={false} />
              </div>
              <h1 className="completion-title">Hoàn tất!</h1>
              
              {qualityScore && (
                <div className="completion-score-inline">
                  <div className="score-number" data-rating={qualityScore.rating}>
                    {qualityScore.score}/100
                  </div>
                  <p className="score-message">{qualityScore.recommendation}</p>
                </div>
              )}
              
              {!qualityScore && (
                <p className="completion-subtitle">Hồ sơ văn phong của bạn đã sẵn sàng</p>
              )}
              
              <button className="btn btn-primary btn-large completion-btn" onClick={handleComplete}>
                Bắt đầu Soạn thảo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Paste Modal */}
      <PasteTextModal
        isOpen={showPasteModal}
        onClose={() => setShowPasteModal(false)}
        onSave={handleSavePaste}
        initialText={profileData.pastedTextOriginal}
        currentTotalWords={totalWords}
        maxWords={3000}
      />

      {/* Upload Modal */}
      <UploadFileModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSave={handleSaveUpload}
        onFileRemove={handleSaveUpload}
        initialFiles={profileData.uploadedFiles}
        currentTotalWords={totalWords}
        maxWords={3000}
      />
    </div>
  )
}

export default ProfileSetup
