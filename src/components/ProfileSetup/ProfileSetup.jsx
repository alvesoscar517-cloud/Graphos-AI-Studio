import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProfile, addSamplesBatch, finalizeProfile } from '../../services/api'
import { splitTextIntoChunks, validateSampleText } from '../../utils/textSplitter'
import { clearCachedProfileDetail, clearAllProfileDetailCaches } from '../../utils/profileDetailCache'
import modal from '../../utils/modal'
import Lottie from 'lottie-react'
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

const ProfileSetup = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [mountKey, setMountKey] = useState(Date.now())
  

  const [profileData, setProfileData] = useState({
    name: '',
    profileId: null,
    theme: 'work',
    longTextChunks: [],  // Store chunks locally
    shortSamples: []     // Store samples locally
  })

  // Step 1 state
  const [profileName, setProfileName] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('work')

  // Step 2 state
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [hasLongText, setHasLongText] = useState(false)

  // Step 3 state
  const [shortText, setShortText] = useState('')
  const [samples, setSamples] = useState([])

  // Step 4 state
  const [processing, setProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(1)
  const [showCompletion, setShowCompletion] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  // Cleanup on unmount
  useEffect(() => {
    // Force fresh mount
    setMountKey(Date.now())
    
    return () => {
      // Clear any pending timeouts/intervals
      setProcessing(false)
      setShowPasteModal(false)
      setShowUploadModal(false)
    }
  }, [])



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

  // Step 1: Create profile
  const handleNextStep1 = async () => {
    if (!profileName.trim()) return

    try {
      const response = await createProfile(profileName.trim(), selectedTheme)
      setProfileData(prev => ({
        ...prev,
        name: profileName.trim(),
        profileId: response.profile_id,
        theme: selectedTheme
      }))
      setCurrentStep(2)
    } catch (error) {
      modal.alert('Không thể tạo hồ sơ. Vui lòng thử lại.', 'Lỗi')
    }
  }

  // Step 2: Handle paste text (split into chunks, save locally)
  const handleSavePaste = async (text) => {
    try {
      // Split text into chunks
      const chunks = splitTextIntoChunks(text, {
        minLength: 200,
        maxLength: 2000,
        method: 'paragraph'
      })

      if (chunks.length === 0) {
        modal.alert('Văn bản quá ngắn hoặc không hợp lệ', 'Lỗi')
        return
      }

      // Validate chunks
      const invalidChunks = chunks.filter(chunk => !validateSampleText(chunk).valid)
      if (invalidChunks.length > 0) {
        modal.alert(`${invalidChunks.length} đoạn văn bản không hợp lệ`, 'Lỗi')
        return
      }

      setProfileData(prev => ({
        ...prev,
        longTextChunks: chunks
      }))

      setHasLongText(true)
      setShowPasteModal(false)
      modal.toast(`Đã lưu ${chunks.length} đoạn văn bản`, '', 'success')
    } catch (error) {
      modal.alert('Không thể xử lý văn bản. Vui lòng thử lại.', 'Lỗi')
    }
  }

  // Step 2: Handle file upload (extract text, split, save locally)
  const handleSaveUpload = async (files) => {
    try {
      let allChunks = []
      
      for (const file of files) {
        const text = await extractTextFromFile(file)
        if (text) {
          const chunks = splitTextIntoChunks(text, {
            minLength: 200,
            maxLength: 2000,
            method: 'paragraph'
          })
          allChunks = [...allChunks, ...chunks]
        }
      }

      if (allChunks.length > 0) {
        setProfileData(prev => ({
          ...prev,
          longTextChunks: allChunks
        }))
        setHasLongText(true)
        setShowUploadModal(false)
        modal.toast(`Đã xử lý ${allChunks.length} đoạn văn bản từ ${files.length} file`, '', 'success')
      } else {
        modal.alert('Không thể trích xuất văn bản từ file', 'Lỗi')
      }
    } catch (error) {
      modal.alert('Không thể xử lý file. Vui lòng thử lại.', 'Lỗi')
    }
  }

  // Extract text from file
  const extractTextFromFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    
    if (ext === 'txt') {
      return await file.text()
    }
    
    modal.toast('Chức năng đọc file .docx và .pdf đang được phát triển', '', 'info')
    return null
  }

  // Step 3: Add sample (save locally)
  const handleAddSample = () => {
    if (!shortText.trim() || profileData.shortSamples.length >= 5) return

    // Validate
    const validation = validateSampleText(shortText.trim())
    if (!validation.valid) {
      modal.alert(validation.error, 'Lỗi')
      return
    }

    setProfileData(prev => ({
      ...prev,
      shortSamples: [...prev.shortSamples, shortText.trim()]
    }))
    
    setSamples(prev => [...prev, shortText.trim()])
    setShortText('')
    modal.toast('Đã thêm mẫu', '', 'success')
  }

  // Step 4: Finalize profile (batch upload + finalize)
  useEffect(() => {
    if (currentStep !== 4 || processing) return

    let timeouts = []
    
    const handleFinalizeProfile = async () => {
      setProcessing(true)
      setProcessingStep(1)

      try {
        // Prepare all samples
        const allSamples = [
          ...profileData.longTextChunks.map(text => ({ text, type: 'long' })),
          ...profileData.shortSamples.map(text => ({ text, type: 'short' }))
        ]

        console.log(`📦 Submitting ${allSamples.length} samples (${profileData.longTextChunks.length} long + ${profileData.shortSamples.length} short)`)

        if (allSamples.length < 3) {
          modal.alert('Cần ít nhất 3 mẫu văn bản', 'Lỗi')
          setProcessing(false)
          setCurrentStep(3)
          return
        }

        // Step 1: Upload samples in batch
        setProcessingStep(1)
        await addSamplesBatch(profileData.profileId, allSamples)
        
        timeouts.push(setTimeout(() => setProcessingStep(2), 500))

        // Step 2: Finalize profile (create embeddings + summary)
        timeouts.push(setTimeout(async () => {
          setProcessingStep(2)
          await finalizeProfile(profileData.profileId)
          
          // Clear caches after profile creation
          clearAllProfileDetailCaches() // Clear all profile caches
          clearCachedProfileDetail(profileData.profileId) // Clear detail cache if exists
          
          setTimeout(() => {
            setProcessingStep(3)
            setShowCompletion(true)
          }, 1000)
        }, 1500))

      } catch (error) {
        console.error('Finalize error:', error)
        modal.alert('Không thể hoàn thiện hồ sơ. Vui lòng thử lại.', 'Lỗi')
        setProcessing(false)
        setCurrentStep(3)
      }
    }

    handleFinalizeProfile()

    // Cleanup timeouts on unmount
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [currentStep, profileData])

  // Complete setup
  const handleComplete = () => {
    localStorage.setItem('activeProfileId', profileData.profileId)
    localStorage.setItem('activeProfileName', profileData.name)
    localStorage.setItem('profileCacheInvalidated', 'true')
    navigate('/')
  }

  const cancellingRef = useRef(false)
  const mountedRef = useRef(true)
  
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])
  
  const handleCancel = useCallback(async () => {
    // Prevent if component is unmounting
    if (!mountedRef.current || isCancelling) {
      console.log('[ProfileSetup] Component unmounted or already cancelling, ignoring...')
      return
    }
    
    // Prevent multiple simultaneous calls
    if (cancellingRef.current) {
      console.log('[ProfileSetup] Already cancelling, ignoring...')
      return
    }
    

    
    try {
      setIsCancelling(true)
      cancellingRef.current = true
      const hasData = profileName || hasLongText || samples.length > 0
      if (hasData) {
        console.log('[ProfileSetup] Showing cancel confirmation...')
        const confirmed = await modal.confirm(
          'Tất cả dữ liệu đã nhập sẽ bị mất.',
          'Hủy bỏ tạo hồ sơ?',
          { confirmText: 'Hủy bỏ', danger: true }
        )
        console.log('[ProfileSetup] Confirmation result:', confirmed)
        if (!confirmed) {
          cancellingRef.current = false
          return
        }
      }
      mountedRef.current = false
      navigate('/', { replace: true })
    } catch (error) {
      console.error('[ProfileSetup] Error in handleCancel:', error)
      // Force navigate even if there's an error
      navigate('/', { replace: true })
    } finally {
      // Reset after a delay
      setTimeout(() => {
        cancellingRef.current = false
      }, 1000)
    }
  }, [])

  const progressPercentage = (currentStep / 4) * 100
  
  // Calculate total samples for display
  const totalSamples = profileData.longTextChunks.length + profileData.shortSamples.length

  if (isCancelling) {
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
        <div className={`step-content ${currentStep === 1 ? 'active' : ''}`} style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <div className="content-wrapper">
            <div className="animation-container">
              <Lottie key={`lottie-1-${mountKey}`} animationData={loaderCatAnimation} loop={true} />
            </div>
            <div className="form-container">
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

        {/* Step 2: Long Text */}
        <div className={`step-content ${currentStep === 2 ? 'active' : ''}`} style={{ display: currentStep === 2 ? 'block' : 'none' }}>
          <div className="content-wrapper">
            <div className="animation-container">
              <Lottie animationData={biometricAnimation} loop={true} />
            </div>
            <div className="form-container">
              <h1 className="step-title">Cung cấp Văn bản Dài</h1>
              <p className="step-description">
                Hãy dán hoặc tải lên các bài viết, blog, hoặc tài liệu (trên 500 từ) để AI 'học' cấu trúc lập luận và các chủ đề bạn thường viết.
              </p>
              
              <div className="option-cards">
                <div 
                  className={`option-card ${hasLongText ? 'has-data' : ''}`}
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
                  {hasLongText && (
                    <div className="option-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                </div>

                <div 
                  className="option-card"
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
                </div>
              </div>

              {profileData.longTextChunks.length > 0 && (
                <div className="sample-progress-modern" style={{ marginTop: '20px' }}>
                  <div className="sample-progress-text">
                    Đã lưu: <span>{profileData.longTextChunks.length}</span> đoạn văn bản
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

        {/* Step 3: Short Samples */}
        <div className={`step-content ${currentStep === 3 ? 'active' : ''}`} style={{ display: currentStep === 3 ? 'block' : 'none' }}>
          <div className="content-wrapper">
            <div className="animation-container">
              <Lottie animationData={contactMailAnimation} loop={true} />
            </div>
            <div className="form-container">
              <h1 className="step-title">Cung cấp Văn bản Ngắn</h1>
              <p className="step-description">
                Tuyệt vời! Giờ hãy cung cấp 3-5 mẫu văn bản ngắn (như email, tin nhắn) để AI 'học' cách bạn chào hỏi, dùng từ và thể hiện cảm xúc.
              </p>
              
              <div className="modern-textarea-container">
                <textarea
                  id="shortText"
                  placeholder="Dán mẫu email hoặc tin nhắn của bạn vào đây..."
                  rows="8"
                  value={shortText}
                  onChange={(e) => setShortText(e.target.value)}
                ></textarea>
                <button 
                  className="btn btn-primary add-sample-btn"
                  disabled={!shortText.trim()}
                  onClick={handleAddSample}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Thêm mẫu
                </button>
              </div>

              <div className="sample-progress-modern">
                <div className="sample-progress-text">
                  Đã cung cấp: <span>{samples.length}</span> / 3 mẫu yêu cầu
                </div>
                <div className="sample-checkmarks-modern">
                  {[0, 1, 2].map(i => (
                    <button 
                      key={i}
                      className={`checkmark-btn ${i < samples.length ? 'completed' : ''}`}
                      disabled={i >= samples.length}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                  ))}
                </div>
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

        {/* Step 4: Processing */}
        <div className={`step-content ${currentStep === 4 ? 'active' : ''}`} style={{ display: currentStep === 4 && !showCompletion ? 'block' : 'none' }}>
          <div className="content-wrapper-processing">
            <div className="animation-container-large">
              <Lottie animationData={loadingBlueAnimation} loop={true} />
            </div>
            <div className="form-container-processing">
              <h1 className="step-title">Đang Hiệu chỉnh Hồ sơ</h1>
              <p className="step-description">
                Giống như Face ID, việc này mất khoảng 30 giây...
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
                  <span>Đang tải lên {totalSamples} mẫu văn bản...</span>
                </div>
                <div className={`checklist-item ${processingStep >= 2 ? processingStep === 2 ? 'processing' : 'completed' : ''}`}>
                  {processingStep === 2 ? (
                    <div className="item-spinner"></div>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                  <span>Đang tạo embeddings và tính toán thống kê...</span>
                </div>
                <div className={`checklist-item ${processingStep >= 3 ? processingStep === 3 ? 'processing' : 'completed' : ''}`}>
                  {processingStep === 3 ? (
                    <div className="item-spinner"></div>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                  <span>Đang tạo tóm tắt văn phong (Gemini)...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Modal */}
        {showCompletion && (
          <div className="completion-modal active">
            <div className="completion-modal-content">
              <div className="completion-animation">
                <Lottie animationData={faceIdAnimation} loop={false} />
              </div>
              <h1 className="completion-title">Hoàn tất!</h1>
              <p className="completion-subtitle">Hồ sơ văn phong của bạn đã sẵn sàng</p>
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
      />

      {/* Upload Modal */}
      <UploadFileModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSave={handleSaveUpload}
      />
    </div>
  )
}

export default ProfileSetup
