/**
 * Custom hook for Profile Setup logic
 * Extracted from ProfileSetup.jsx for better maintainability
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { splitTextIntoChunks, validateSampleText } from '../../../utils/textSplitter'
import modal from '../../../utils/modal'

// Constants
const MAX_WORDS = 5000
const MIN_SAMPLES = 3
const MAX_SAMPLES = 5
const MIN_SAMPLE_WORDS = 20
const MAX_SAMPLE_WORDS = 300
const SIMILARITY_THRESHOLD = 0.7
const DUPLICATE_THRESHOLD = 0.8
const DRAFT_STORAGE_KEY = 'profile_setup_draft'
const DRAFT_EXPIRY_HOURS = 24

// Theme options with descriptions and sample templates
export const THEMES = [
  { 
    id: 'work', 
    name: 'Work', 
    icon: 'briefcase',
    description: 'Email, reports, office communication',
    sampleTemplates: [
      'Dear Sir/Madam,\n\nI am sending the project progress report for this week. Completed tasks include...',
      'Thank you for your response. I will review and update you as soon as possible.',
      'Hello team,\n\nAs discussed in yesterday\'s meeting, we need to complete the following tasks before the deadline...'
    ]
  },
  { 
    id: 'personal', 
    name: 'Personal', 
    icon: 'user',
    description: 'Diary, thoughts, personal sharing',
    sampleTemplates: [
      'Today was quite an interesting day. I had the opportunity to meet new friends and learn many things...',
      'I realized that life is not always smooth, but it\'s the difficulties that help me grow stronger.',
      'This weekend I plan to spend time with family and rest after a stressful week of work.'
    ]
  },
  { 
    id: 'academic', 
    name: 'Academic', 
    icon: 'graduation-cap',
    description: 'Thesis, research papers, academic writing',
    sampleTemplates: [
      'Nghiên cứu này nhằm mục đích phân tích và đánh giá tác động của các yếu tố kinh tế vĩ mô đến thị trường chứng khoán Việt Nam.',
      'Theo lý thuyết của Maslow (1943), nhu cầu của con người được phân chia thành 5 cấp bậc words cơ bản đến cao cấp.',
      'Kết quả phân tích cho thấy có mối tương quan thuận giữa biến độc lập X và biến phụ thuộc Y với hệ số r = 0.85.'
    ]
  },
  { 
    id: 'creative', 
    name: 'Creative', 
    icon: 'palette',
    description: 'Write stories, poetry, creative content',
    sampleTemplates: [
      'Afternoon sunlight filtered through the leaves, painting shimmering streaks on the calm lake surface. The girl sat there, gazing into the distance...',
      'In a world where magic exists, an ordinary young man discovers he possesses a special ability.',
      'Every painting tells a story. And this story begins with a drop of ink accidentally falling on a blank page.'
    ]
  },
  { 
    id: 'business', 
    name: 'Business', 
    icon: 'trending-up',
    description: 'Proposals, pitches, B2B communication',
    sampleTemplates: [
      'Dear Valued Partner,\n\nWe are pleased to introduce our new solution to optimize your business operations.',
      'With 10 years of experience in the industry, we are confident in delivering the highest quality products to our customers.',
      'The expected ROI for this project is 150% in the first year, based on market analysis and current customer data.'
    ]
  },
  { 
    id: 'social', 
    name: 'Social Media', 
    icon: 'message-circle',
    description: 'Facebook posts, captions, messages',
    sampleTemplates: [
      'Weekend is here! Anyone have plans? I\'m thinking about going to a cafe and reading a book, just chilling [COFFEE][BOOKS]',
      'Just tried a new dish at this place, absolutely delicious! If you\'re nearby, you should definitely try it, guaranteed you won\'t be disappointed [FOOD]',
      'Thank you everyone for always supporting me. This journey wouldn\'t be possible without you [HEART]'
    ]
  },
  { 
    id: 'technical', 
    name: 'Technical', 
    icon: 'code',
    description: 'Technical documentation, guides',
    sampleTemplates: [
      'To install the system, first ensure your server meets the minimum requirements: 8GB RAM, 4-core CPU, 100GB SSD.',
      'This API endpoint supports GET and POST methods. Required parameters include: user_id (string), timestamp (integer).',
      'Error 500 Internal Server Error usually occurs due to incorrect database configuration. Check config.json file and restart the service.'
    ]
  },
  { 
    id: 'other', 
    name: 'Other', 
    icon: 'more-horizontal',
    description: 'Combined writing style',
    sampleTemplates: [
      'This is a sample text. You can replace it with your own content for AI to learn your writing style.',
      'Everyone has their own way of expressing themselves. Provide texts that truly reflect your writing style.',
      'The more diverse text samples, the better AI understands how you use language and sentence structure.'
    ]
  }
]

/**
 * Save draft to localStorage
 */
export const saveDraft = (data) => {
  try {
    const draft = {
      ...data,
      savedAt: Date.now(),
      expiresAt: Date.now() + (DRAFT_EXPIRY_HOURS * 60 * 60 * 1000)
    }
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
    return true
  } catch (error) {
    console.error('Error saving draft:', error)
    return false
  }
}

/**
 * Load draft from localStorage
 */
export const loadDraft = () => {
  try {
    const draftStr = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!draftStr) return null
    
    const draft = JSON.parse(draftStr)
    
    // Check if draft has expired
    if (draft.expiresAt && Date.now() > draft.expiresAt) {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      return null
    }
    
    return draft
  } catch (error) {
    console.error('Error loading draft:', error)
    return null
  }
}

/**
 * Clear draft from localStorage
 */
export const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Error clearing draft:', error)
    return false
  }
}

/**
 * Get time ago string for draft
 */
export const getDraftTimeAgo = (savedAt) => {
  const now = Date.now()
  const diff = now - savedAt
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} minutes ago`
  if (hours < 24) return `${hours} hours ago`
  return 'over 1 day ago'
}

/**
 * Calculate Jaccard similarity with n-grams for better accuracy
 */
export const calculateNGramSimilarity = (text1, text2, n = 2) => {
  const getNGrams = (text, n) => {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0)
    if (words.length < n) return new Set(words)
    
    const ngrams = new Set()
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.add(words.slice(i, i + n).join(' '))
    }
    return ngrams
  }
  
  const ngrams1 = getNGrams(text1, n)
  const ngrams2 = getNGrams(text2, n)
  
  if (ngrams1.size === 0 || ngrams2.size === 0) return 0
  
  const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)))
  const union = new Set([...ngrams1, ...ngrams2])
  
  return intersection.size / union.size
}

/**
 * Detect duplicate or highly similar chunks using improved algorithm
 */
export const detectDuplicates = (chunks, existingChunks = []) => {
  const duplicates = []
  const seen = new Map() // Map of chunk -> index for better tracking
  
  // Add existing chunks to seen map first
  existingChunks.forEach((chunk, idx) => {
    seen.set(chunk.trim().toLowerCase(), `existing-${idx}`)
  })
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i].trim().toLowerCase()
    
    // Exact duplicate check
    if (seen.has(chunk)) {
      duplicates.push(i)
      continue
    }
    
    let isDuplicate = false
    
    // Similarity check using n-gram Jaccard similarity
    for (const [seenChunk] of seen) {
      const similarity = calculateNGramSimilarity(chunk, seenChunk)
      
      if (similarity > DUPLICATE_THRESHOLD) {
        duplicates.push(i)
        isDuplicate = true
        break
      }
    }
    
    if (!isDuplicate) {
      seen.set(chunk, i)
    }
  }
  
  return duplicates
}

/**
 * Main hook for profile setup
 */
export const useProfileSetup = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [animationKey, setAnimationKey] = useState(0)
  const mountedRef = useRef(true)
  const cancellingRef = useRef(false)
  const timeoutsRef = useRef([])
  const abortControllerRef = useRef(null)
  const autoSaveTimeoutRef = useRef(null)

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: '',
    profileId: null,
    theme: 'work',
    pastedChunks: [],
    uploadedChunks: [],
    uploadedFiles: [],
    pastedTextOriginal: '',
    shortSamples: []
  })

  // Step 1 state
  const [profileName, setProfileName] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('work')

  // Step 2 state
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [hasPastedText, setHasPastedText] = useState(false)
  const [hasUploadedFiles, setHasUploadedFiles] = useState(false)
  const [wordCountWarning, setWordCountWarning] = useState(null)

  // Step 3 state
  const [shortText, setShortText] = useState('')
  const [samples, setSamples] = useState([])
  const [shortTextWordCount, setShortTextWordCount] = useState(0)
  const [currentSampleIndex, setCurrentSampleIndex] = useState(-1)
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
  
  // Draft state
  const [hasDraft, setHasDraft] = useState(false)
  const [draftInfo, setDraftInfo] = useState(null)
  const [lastSavedAt, setLastSavedAt] = useState(null)

  // Check for existing draft on mount
  useEffect(() => {
    const existingDraft = loadDraft()
    if (existingDraft) {
      setHasDraft(true)
      setDraftInfo(existingDraft)
    }
  }, [])

  // Auto-save draft when data changes (debounced)
  useEffect(() => {
    // Don't save if we're on step 4 (processing) or if there's no data
    if (currentStep === 4) return
    
    const hasData = profileName || hasPastedText || hasUploadedFiles || samples.length > 0
    if (!hasData) return
    
    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
    
    // Debounce auto-save by 2 seconds
    autoSaveTimeoutRef.current = setTimeout(() => {
      const draftData = {
        currentStep,
        profileName,
        selectedTheme,
        profileData,
        hasPastedText,
        hasUploadedFiles,
        samples
      }
      
      if (saveDraft(draftData)) {
        setLastSavedAt(Date.now())
      }
    }, 2000)
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [currentStep, profileName, selectedTheme, profileData, hasPastedText, hasUploadedFiles, samples])

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      // Clear all pending timeouts
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutsRef.current = []
      // Clear auto-save timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      // Abort any pending API calls to prevent memory leaks
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
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

  // Calculate total word count
  const getTotalWordCount = useCallback(() => {
    const pastedWords = profileData.pastedChunks.reduce((sum, chunk) => {
      return sum + chunk.split(/\s+/).filter(w => w.length > 0).length
    }, 0)
    const uploadedWords = profileData.uploadedChunks.reduce((sum, chunk) => {
      return sum + chunk.split(/\s+/).filter(w => w.length > 0).length
    }, 0)
    return pastedWords + uploadedWords
  }, [profileData.pastedChunks, profileData.uploadedChunks])

  // Step 1: Validate and move to next step
  const handleNextStep1 = useCallback(() => {
    if (!profileName.trim()) return

    setProfileData(prev => ({
      ...prev,
      name: profileName.trim(),
      theme: selectedTheme
    }))
    setCurrentStep(2)
  }, [profileName, selectedTheme])

  // Step 2: Handle paste text with cross-duplicate detection
  const handleSavePaste = useCallback(async (text) => {
    try {
      const chunks = splitTextIntoChunks(text, {
        minLength: 200,
        maxLength: 2000,
        method: 'paragraph'
      })

      if (chunks.length === 0) {
        modal.alert('Text is too short or invalid', '[ERROR]', 'error', true)
        return
      }

      // Calculate new words and check global limit
      const newWords = chunks.reduce((sum, chunk) => {
        return sum + chunk.split(/\s+/).filter(w => w.length > 0).length
      }, 0)
      
      // Get current uploaded words (excluding pasted since we're replacing)
      const uploadedWords = profileData.uploadedChunks.reduce((sum, chunk) => {
        return sum + chunk.split(/\s+/).filter(w => w.length > 0).length
      }, 0)
      
      const totalAfterSave = uploadedWords + newWords
      if (totalAfterSave > MAX_WORDS) {
        const allowedWords = MAX_WORDS - uploadedWords
        if (allowedWords <= 0) {
          modal.alert(`Reached ${MAX_WORDS} word limit from file uploads. Delete some files to paste text.`, '[LIMIT EXCEEDED]', 'warning', true)
          return
        }
        
        const confirmed = await modal.confirm(
          `Text has ${newWords} words, but only ${allowedWords} words available (${uploadedWords} words from files). Auto-trim?`,
          '[WORD LIMIT]',
          { type: 'question', forceLight: true, confirmText: 'Trim', cancelText: 'Cancel' }
        )
        if (!confirmed) return
        
        // Truncate chunks to fit
        let remainingWords = allowedWords
        const truncatedChunks = []
        for (const chunk of chunks) {
          const words = chunk.split(/\s+/).filter(w => w.length > 0)
          if (remainingWords <= 0) break
          if (words.length <= remainingWords) {
            truncatedChunks.push(chunk)
            remainingWords -= words.length
          } else {
            truncatedChunks.push(words.slice(0, remainingWords).join(' '))
            break
          }
        }
        
        setProfileData(prev => ({ ...prev, pastedChunks: truncatedChunks, pastedTextOriginal: text }))
        setHasPastedText(true)
        setShowPasteModal(false)
        modal.toast(`Saved ${truncatedChunks.length} sections (${allowedWords} words, trimmed)`, '', 'success')
        return
      }

      // Cross-duplicate detection: check against uploaded chunks
      const duplicateIndices = detectDuplicates(chunks, profileData.uploadedChunks)
      if (duplicateIndices.length > 0) {
        const uniqueChunks = chunks.filter((_, i) => !duplicateIndices.includes(i))
        
        if (uniqueChunks.length === 0) {
          modal.alert('All text sections are duplicates of uploaded content.', '[DUPLICATE CONTENT]', 'warning', true)
          return
        }
        
        const confirmed = await modal.confirm(
          `Detected ${duplicateIndices.length} duplicate sections (with existing content). Keep only ${uniqueChunks.length} unique sections?`,
          'Duplicates Detected',
          { type: 'question', forceLight: true, confirmText: 'Remove Duplicates', cancelText: 'Keep All' }
        )
        
        if (confirmed) {
          const uniqueWords = uniqueChunks.reduce((sum, chunk) => {
            return sum + chunk.split(/\s+/).filter(w => w.length > 0).length
          }, 0)
          
          setProfileData(prev => ({ ...prev, pastedChunks: uniqueChunks, pastedTextOriginal: text }))
          setHasPastedText(true)
          setShowPasteModal(false)
          modal.toast(`Saved ${uniqueChunks.length} sections (${uniqueWords} words)`, '', 'success')
          return
        }
      }

      const invalidChunks = chunks.filter(chunk => !validateSampleText(chunk).valid)
      if (invalidChunks.length > 0) {
        modal.alert(`${invalidChunks.length} text sections are invalid`, '[ERROR]', 'error', true)
        return
      }

      setProfileData(prev => ({ ...prev, pastedChunks: chunks, pastedTextOriginal: text }))
      setHasPastedText(true)
      setShowPasteModal(false)
      modal.toast(`Saved ${chunks.length} sections (${newWords} words)`, '', 'success')
    } catch (error) {
      modal.alert('Unable to process text.', '[ERROR]', 'error', true)
    }
  }, [profileData.uploadedChunks])

  // Step 2: Handle file upload with cross-duplicate detection and global word limit
  const handleSaveUpload = useCallback(async (fileData) => {
    try {
      if (!fileData || fileData.length === 0) {
        setProfileData(prev => ({ ...prev, uploadedChunks: [], uploadedFiles: [] }))
        setHasUploadedFiles(false)
        setShowUploadModal(false)
        modal.toast('All files deleted', '', 'success')
        return
      }

      // Calculate current pasted words
      const pastedWords = profileData.pastedChunks.reduce((sum, chunk) => {
        return sum + chunk.split(/\s+/).filter(w => w.length > 0).length
      }, 0)
      
      // Calculate available words for upload
      const availableWords = MAX_WORDS - pastedWords

      let allChunks = []
      let currentWordCount = 0
      
      for (const item of fileData) {
        if (item.text && currentWordCount < availableWords) {
          const chunks = splitTextIntoChunks(item.text, {
            minLength: 200,
            maxLength: 2000,
            method: 'paragraph'
          })
          
          for (const chunk of chunks) {
            const chunkWords = chunk.split(/\s+/).filter(w => w.length > 0).length
            if (currentWordCount + chunkWords <= availableWords) {
              allChunks.push(chunk)
              currentWordCount += chunkWords
            } else {
              const remainingWords = availableWords - currentWordCount
              if (remainingWords > 0) {
                const words = chunk.split(/\s+/).filter(w => w.length > 0)
                const truncatedChunk = words.slice(0, remainingWords).join(' ')
                allChunks.push(truncatedChunk)
                currentWordCount = availableWords
              }
              break
            }
          }
          
          if (currentWordCount >= availableWords) break
        }
      }

      if (allChunks.length === 0) {
        if (availableWords <= 0) {
          modal.alert(`Reached ${MAX_WORDS} word limit from pasted text. Delete some text to upload files.`, '[LIMIT EXCEEDED]', 'warning', true)
        } else {
          modal.alert('Unable to extract text from file', '[ERROR]', 'error', true)
        }
        return
      }

      // Cross-duplicate detection: check against pasted chunks
      const duplicateIndices = detectDuplicates(allChunks, profileData.pastedChunks)
      if (duplicateIndices.length > 0) {
        const uniqueChunks = allChunks.filter((_, i) => !duplicateIndices.includes(i))
        
        if (uniqueChunks.length === 0) {
          modal.alert('All text sections in file are duplicates of pasted content.', '[DUPLICATE CONTENT]', 'warning', true)
          return
        }
        
        const confirmed = await modal.confirm(
          `Detected ${duplicateIndices.length} duplicate sections (with pasted content). Keep only ${uniqueChunks.length} sections?`,
          'Duplicates Detected',
          { type: 'question', forceLight: true, confirmText: 'Remove Duplicates', cancelText: 'Keep All' }
        )
        
        if (confirmed) {
          allChunks = uniqueChunks
        }
      }

      const uploadedWords = allChunks.reduce((sum, chunk) => {
        return sum + chunk.split(/\s+/).filter(w => w.length > 0).length
      }, 0)
      
      // Show warning if truncated
      if (pastedWords > 0 && currentWordCount >= availableWords) {
        setWordCountWarning(`Truncated to not exceed ${MAX_WORDS} words total`)
      } else {
        setWordCountWarning(null)
      }
      
      setProfileData(prev => ({ ...prev, uploadedChunks: allChunks, uploadedFiles: fileData }))
      setHasUploadedFiles(true)
      setShowUploadModal(false)
      modal.toast(`Processed ${allChunks.length} chunks from ${fileData.length} file (${uploadedWords} words)`, '', 'success')
    } catch (error) {
      console.error('Error processing uploaded files:', error)
      modal.alert('Unable to process file.', '[ERROR]', 'error', true)
    }
  }, [profileData.pastedChunks])

  // Step 3: Add or update sample with cross-check against long text
  const handleAddSample = useCallback(async () => {
    if (!shortText.trim()) return
    if (!isEditingMode && profileData.shortSamples.length >= MAX_SAMPLES) return

    const text = shortText.trim()
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const wordCount = words.length

    if (wordCount < MIN_SAMPLE_WORDS) {
      modal.alert(`Minimum ${MIN_SAMPLE_WORDS} words required.`, '[TEXT TOO SHORT]', 'warning', true)
      return
    }
    if (wordCount > MAX_SAMPLE_WORDS) {
      modal.alert(`Maximum ${MAX_SAMPLE_WORDS} words.`, '[TEXT TOO LONG]', 'warning', true)
      return
    }

    const validation = validateSampleText(text)
    if (!validation.valid) {
      modal.alert(validation.error, '[ERROR]', 'error', true)
      return
    }

    // Cross-check against long text (pasted + uploaded chunks)
    const allLongChunks = [...profileData.pastedChunks, ...profileData.uploadedChunks]
    for (const chunk of allLongChunks) {
      const similarity = calculateNGramSimilarity(text.toLowerCase(), chunk.toLowerCase())
      if (similarity > SIMILARITY_THRESHOLD) {
        const confirmed = await modal.confirm(
          `This sample is ${Math.round(similarity * 100)}% similar to the long text provided. Continue?`,
          '[SIMILAR TO LONG TEXT]',
          { type: 'question', forceLight: true, confirmText: isEditingMode ? 'Update' : 'Add Sample', cancelText: 'Cancel' }
        )
        if (!confirmed) return
        break
      }
    }

    // Check for duplicates within short samples using improved algorithm
    const existingSamples = profileData.shortSamples
    for (let i = 0; i < existingSamples.length; i++) {
      if (isEditingMode && i === currentSampleIndex) continue
      
      const existing = existingSamples[i].toLowerCase()
      const newSample = text.toLowerCase()
      
      if (existing === newSample) {
        modal.alert('This sample already exists.', '[DUPLICATE SAMPLE]', 'warning', true)
        return
      }
      
      // Use improved n-gram similarity
      const similarity = calculateNGramSimilarity(existing, newSample)
      
      if (similarity > SIMILARITY_THRESHOLD) {
        const confirmed = await modal.confirm(
          `This sample is ${Math.round(similarity * 100)}% similar to sample #${i + 1}. Continue?`,
          '[SIMILAR SAMPLE]',
          { type: 'question', forceLight: true, confirmText: isEditingMode ? 'Update' : 'Add Sample', cancelText: 'Cancel' }
        )
        if (!confirmed) return
        break
      }
    }

    if (isEditingMode && currentSampleIndex >= 0) {
      const newSamples = [...samples]
      newSamples[currentSampleIndex] = text
      setSamples(newSamples)
      setProfileData(prev => ({ ...prev, shortSamples: newSamples }))
      modal.toast(`Updated sample #${currentSampleIndex + 1} (${wordCount} words)`, '', 'success')
      setIsEditingMode(false)
      setCurrentSampleIndex(-1)
    } else {
      setProfileData(prev => ({ ...prev, shortSamples: [...prev.shortSamples, text] }))
      setSamples(prev => [...prev, text])
      modal.toast(`Added sample (${wordCount} words)`, '', 'success')
    }
    
    setShortText('')
  }, [shortText, isEditingMode, profileData.shortSamples, profileData.pastedChunks, profileData.uploadedChunks, currentSampleIndex, samples])

  // Navigate between samples
  const handleNavigateSample = useCallback((direction) => {
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
  }, [samples, currentSampleIndex])

  // Cancel confirm modal state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Cancel handler - show confirm modal if has data
  const handleCancel = useCallback(() => {
    if (!mountedRef.current || isCancelling || cancellingRef.current) return
    
    const hasData = profileName || hasPastedText || hasUploadedFiles || samples.length > 0
    if (hasData) {
      setShowCancelConfirm(true)
    } else {
      // No data, navigate directly
      navigate('/', { replace: true })
    }
  }, [profileName, hasPastedText, hasUploadedFiles, samples.length, isCancelling, navigate])

  // Confirm cancel - actually navigate away
  const handleConfirmCancel = useCallback(() => {
    cancellingRef.current = true
    setIsCancelling(true)
    setShowCancelConfirm(false)
    
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current = []
    navigate('/', { replace: true })
  }, [navigate])

  // Cancel the cancel - close modal
  const handleCancelCancel = useCallback(() => {
    setShowCancelConfirm(false)
  }, [])

  // Complete setup
  const handleComplete = useCallback(() => {
    // Clear draft on successful completion
    clearDraft()
    
    localStorage.setItem('activeProfileId', profileData.profileId)
    localStorage.setItem('activeProfileName', profileData.name)
    localStorage.setItem('profileCacheInvalidated', 'true')
    navigate('/')
  }, [profileData.profileId, profileData.name, navigate])

  // Restore draft
  const handleRestoreDraft = useCallback(async () => {
    if (!draftInfo) return false
    
    try {
      // Restore step 1 data
      if (draftInfo.profileName) {
        setProfileName(draftInfo.profileName)
      }
      if (draftInfo.selectedTheme) {
        setSelectedTheme(draftInfo.selectedTheme)
      }
      
      // Restore profile data
      if (draftInfo.profileData) {
        setProfileData(draftInfo.profileData)
        
        // Restore step 2 flags
        if (draftInfo.profileData.pastedChunks?.length > 0 || draftInfo.profileData.pastedTextOriginal) {
          setHasPastedText(true)
        }
        if (draftInfo.profileData.uploadedChunks?.length > 0 || draftInfo.profileData.uploadedFiles?.length > 0) {
          setHasUploadedFiles(true)
        }
      }
      
      // Restore step 3 data
      if (draftInfo.samples?.length > 0) {
        setSamples(draftInfo.samples)
      }
      
      // Navigate to saved step (but not step 4)
      const targetStep = Math.min(draftInfo.currentStep || 1, 3)
      setCurrentStep(targetStep)
      
      setHasDraft(false)
      setDraftInfo(null)
      
      modal.toast('Draft restored', '', 'success')
      return true
    } catch (error) {
      console.error('Error restoring draft:', error)
      modal.toast('Unable to restore draft', '', 'error')
      return false
    }
  }, [draftInfo])

  // Discard draft
  const handleDiscardDraft = useCallback(() => {
    clearDraft()
    setHasDraft(false)
    setDraftInfo(null)
  }, [])

  // Computed values
  const totalChunks = profileData.pastedChunks.length + profileData.uploadedChunks.length
  const totalSamples = totalChunks + profileData.shortSamples.length
  const totalWords = getTotalWordCount()
  const hasLongText = hasPastedText || hasUploadedFiles
  const progressPercentage = (currentStep / 4) * 100

  return {
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
    setSamples,
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
  }
}

export default useProfileSetup
