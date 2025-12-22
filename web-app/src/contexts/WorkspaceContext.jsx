/**
 * WorkspaceContext with Firestore
 * 
 * Workspace management using Firestore for real-time sync.
 */

import { logger } from '../utils/logger'
import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAuth } from '../stores/authStore'
import { useProfiles } from './ProfileContext'
import { handleCreditError, showUpgradeModal } from '../utils/creditHandler'
import { 
  useConversations, 
  useConversationMutations, 
  clearLocalData
} from '../db/hooks'
import { subscribeToMessages } from '../db/firestore'
import { getFirebaseAuth } from '../config/firebase'

const WorkspaceContext = createContext(null)

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider')
  }
  return context
}

// Error messages mapping
const ERROR_MESSAGES = {
  QUOTA_EXCEEDED: 'API quota exceeded. Please try again in a few minutes.',
  RATE_LIMITED: 'Too many requests. Please slow down.',
  INVALID_INPUT: 'Invalid input. Please check your message.',
  CONTENT_BLOCKED: 'Content was blocked by safety filters. Please rephrase your message.',
  MODEL_ERROR: 'AI model error. Try selecting a different model.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  DEFAULT: 'Something went wrong. Please try again.'
}

// Safe hook to get current profile
const useSafeProfiles = () => {
  try {
    return useProfiles()
  } catch {
    return { currentProfile: null, profiles: [], loading: false }
  }
}

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth()
  const { currentProfile } = useSafeProfiles()
  
  // Get Firebase Auth uid for Firestore operations
  // Firestore rules require request.auth.uid to match userId in data
  // Priority: Firebase Auth currentUser > user.uid > user.userId
  const [firebaseUid, setFirebaseUid] = useState(null)
  
  useEffect(() => {
    const auth = getFirebaseAuth()
    if (!auth) return
    
    // Listen for Firebase Auth state changes
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUid(firebaseUser.uid)
        logger.log('[WORKSPACE] Firebase Auth uid:', firebaseUser.uid)
      } else {
        setFirebaseUid(null)
      }
    })
    return () => unsubscribe()
  }, [])
  
  // Use Firebase Auth uid for Firestore, fallback to user.uid/userId for API calls
  const userId = firebaseUid || user?.uid || user?.userId || user?.id
  
  // Get conversations from Firestore (reactive)
  const { conversations: firestoreConversations, loading: conversationsLoading } = useConversations(userId)
  const { createConversation, updateConversation, saveConversationMessages, deleteConversation: removeConversation } = useConversationMutations()
  
  // Local state
  const [currentConversation, setCurrentConversation] = useState(null)
  const [currentMessages, setCurrentMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [modelSettings, setModelSettings] = useState({
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    maxTokens: 2048,
    writingPreferences: {
      useVocabularyPreferences: true,
      useKeyCharacteristics: true,
      useSentencePatterns: true,
      useRewriteInstructions: true
    }
  })

  // Track previous user
  const prevUserRef = useRef(null)

  // Handle user change
  useEffect(() => {
    const prevUserId = prevUserRef.current
    
    if (prevUserId && prevUserId !== userId) {
      logger.log('[SECURITY] User changed, clearing workspace data...')
      setCurrentConversation(null)
      setCurrentMessages([])
      setError(null)
    }
    
    prevUserRef.current = userId
  }, [userId])

  // Subscribe to messages when current conversation changes
  // LOCAL-FIRST: UI shows local state immediately, Firestore syncs in background
  useEffect(() => {
    if (!currentConversation?.id || !userId) {
      return
    }

    // Subscribe to Firestore for cross-device sync (background only)
    const unsubscribe = subscribeToMessages(currentConversation.id, userId, (messages) => {
      // Only merge if we have messages AND no local streaming messages
      // This prevents Firestore from overwriting optimistic updates
      if (messages.length > 0) {
        setCurrentMessages(prev => {
          // If we have streaming messages, keep local state (don't let Firestore overwrite)
          const hasStreamingMessages = prev.some(m => m.streaming)
          if (hasStreamingMessages) {
            return prev
          }
          
          // If local is empty, use Firestore data (loading existing conversation)
          if (prev.length === 0) {
            return messages
          }
          
          // Merge: prefer local messages, add any from Firestore that we don't have
          const localIds = new Set(prev.map(m => m.id))
          const newFromFirestore = messages.filter(m => !localIds.has(m.id))
          
          if (newFromFirestore.length > 0) {
            // New messages from another device
            return [...prev, ...newFromFirestore].sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )
          }
          
          return prev
        })
      }
    })

    return () => unsubscribe()
  }, [currentConversation?.id, userId])

  // Generate system prompt based on user profile
  const generateSystemPrompt = useCallback(() => {
    if (!currentProfile) {
      return 'You are an intelligent and helpful AI assistant. Please respond naturally and accurately.'
    }

    const { writing_style, tone, expertise } = currentProfile
    
    let prompt = 'You are an intelligent AI assistant. '
    
    if (writing_style) {
      prompt += `Write in this style: ${writing_style}. `
    }
    
    if (tone) {
      prompt += `Use this tone: ${tone}. `
    }
    
    if (expertise && expertise.length > 0) {
      prompt += `You have expertise in: ${expertise.join(', ')}. `
    }
    
    prompt += 'Please respond naturally, accurately, and in a way that matches the user\'s writing style.'
    
    return prompt
  }, [currentProfile])

  // Pending save queue - tracks conversations waiting for Firestore ID
  // Pattern: { tempId: { messages: [], updates: {}, resolve: fn } }
  const pendingSaveQueueRef = useRef(new Map())
  
  // Track temp ID to Firestore ID mapping for quick lookup
  const tempToFirestoreIdRef = useRef(new Map())
  
  // Create new conversation - optimistic update, sync in background
  // Pattern: Similar to Notion/Linear - create locally first, sync async
  const createNewConversation = useCallback(async (title = 'New Chat') => {
    if (!userId) return null
    
    const now = new Date().toISOString()
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    
    // Create local conversation immediately for instant UX
    const localConv = {
      id: tempId,
      userId,
      title,
      messages: [], // Embedded messages array
      systemPrompt: generateSystemPrompt(),
      type: 'chat',
      titleGenerated: false,
      userEditedTitle: false,
      summary: null,
      created: now,
      updated: now,
      _isTemp: true // Mark as temp for easier tracking
    }
    
    // Update UI immediately
    setCurrentConversation(localConv)
    setCurrentMessages([])
    
    // Initialize pending queue for this temp conversation
    pendingSaveQueueRef.current.set(tempId, { messages: [], updates: {} })
    
    // Sync to Firestore in background
    try {
      const firestoreConv = await createConversation(userId, {
        title,
        systemPrompt: localConv.systemPrompt,
        type: 'chat'
      })
      
      if (firestoreConv) {
        logger.log('[WORKSPACE] Created conversation in Firestore:', firestoreConv.id)
        
        // Store mapping for future lookups
        tempToFirestoreIdRef.current.set(tempId, firestoreConv.id)
        
        // Flush any pending saves that accumulated while waiting
        const pending = pendingSaveQueueRef.current.get(tempId)
        if (pending && pending.messages.length > 0) {
          logger.log('[WORKSPACE] Flushing pending messages:', pending.messages.length)
          await saveConversationMessages(firestoreConv.id, pending.messages, pending.updates)
        }
        pendingSaveQueueRef.current.delete(tempId)
        
        // Update conversation ID atomically
        setCurrentConversation(prev => {
          if (prev?.id === tempId) {
            return { ...prev, id: firestoreConv.id, _isTemp: false }
          }
          return prev
        })
      }
    } catch (err) {
      logger.warn('Workspace', 'Failed to sync conversation to Firestore:', err.message)
      // Keep local conversation - will work offline
      // Mark for retry later
      const existing = pendingSaveQueueRef.current.get(tempId) || { messages: [], updates: {} }
      pendingSaveQueueRef.current.set(tempId, { 
        ...existing,
        _retryNeeded: true 
      })
    }
    
    return localConv
  }, [userId, createConversation, generateSystemPrompt, saveConversationMessages])

  // Merge current temp conversation into list for immediate display
  // Moved up so loadConversation can use it
  const mergedConversations = useMemo(() => {
    if (!currentConversation) return firestoreConversations
    
    // If current conversation is temp and not in Firestore list, add it
    const isTemp = currentConversation.id?.startsWith('temp_')
    const existsInFirestore = firestoreConversations.some(c => c.id === currentConversation.id)
    
    if (isTemp || !existsInFirestore) {
      // Add current conversation at the top
      return [currentConversation, ...firestoreConversations.filter(c => c.id !== currentConversation.id)]
    }
    
    return firestoreConversations
  }, [currentConversation, firestoreConversations])

  // Load conversation - search in merged list (includes temp conversations)
  // Pattern: Load embedded messages immediately, subscribe for real-time updates
  const loadConversation = useCallback((id) => {
    // First check if it's the current conversation
    if (currentConversation?.id === id) {
      return // Already loaded
    }
    
    // Search in merged conversations (includes temp and Firestore)
    const conversation = mergedConversations.find(c => c.id === id)
    if (conversation) {
      setCurrentConversation(conversation)
      
      // CRITICAL FIX: Load embedded messages immediately instead of waiting for subscription
      // This ensures messages are visible when opening an existing conversation
      if (conversation.messages && conversation.messages.length > 0) {
        logger.log('[WORKSPACE] Loading embedded messages:', conversation.messages.length)
        setCurrentMessages(conversation.messages)
      } else {
        setCurrentMessages([]) // Clear messages, will be loaded by subscription
      }
    }
  }, [mergedConversations, currentConversation])

  // Truncate title to max words
  const truncateTitleToWords = useCallback((title, maxWords = 7) => {
    if (!title) return title
    const words = title.trim().split(/\s+/)
    if (words.length <= maxWords) return title
    return words.slice(0, maxWords).join(' ') + '...'
  }, [])

  // Generate title from first message
  const generateTitle = useCallback((firstMessage) => {
    const firstSentence = firstMessage.split(/[.!?。\n]/)[0]?.trim() || firstMessage
    return truncateTitleToWords(firstSentence, 7)
  }, [truncateTitleToWords])

  // Format error message
  const formatErrorMessage = useCallback((error) => {
    if (error.code && ERROR_MESSAGES[error.code]) {
      return ERROR_MESSAGES[error.code]
    }
    if (error.message) {
      if (error.message.includes('quota') || error.message.includes('QUOTA')) {
        return ERROR_MESSAGES.QUOTA_EXCEEDED
      }
      if (error.message.includes('rate') || error.message.includes('429')) {
        return ERROR_MESSAGES.RATE_LIMITED
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return ERROR_MESSAGES.NETWORK_ERROR
      }
      if (error.message.includes('blocked') || error.message.includes('safety')) {
        return ERROR_MESSAGES.CONTENT_BLOCKED
      }
      return error.message
    }
    return ERROR_MESSAGES.DEFAULT
  }, [])

  // Send message with streaming
  const sendMessage = useCallback(async (content, attachments = []) => {
    let conversation = currentConversation
    
    if (!conversation) {
      conversation = await createNewConversation()
      if (!conversation) return
    }

    // Process attachments
    const processedAttachments = await Promise.all(
      attachments.map(async (att) => {
        if (att.base64) return att
        if (att.file) {
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => {
              const result = reader.result
              resolve({
                ...att,
                base64: typeof result === 'string' ? result.split(',')[1] : '',
                mimeType: att.type || att.file.type
              })
            }
            reader.readAsDataURL(att.file)
          })
        }
        return att
      })
    )

    // Create user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      attachments: processedAttachments,
      timestamp: new Date().toISOString()
    }

    // Update local state immediately (optimistic update)
    const updatedMessages = [...currentMessages, userMessage]
    setCurrentMessages(updatedMessages)

    setIsLoading(true)
    setError(null)

    // Create AI message placeholder
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      streaming: true
    }

    setCurrentMessages(prev => [...prev, aiMessage])

    try {
      const modelMap = {
        'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
        'gemini-2.5-flash': 'gemini-2.5-flash',
        'gemini-2.5-pro': 'gemini-2.5-pro'
      }
      
      const actualModel = modelMap[modelSettings.model] || 'gemini-2.5-flash'
      const chatSettings = modelSettings.chatSettings || {}
      const useHumanizedChat = chatSettings.humanizeResponse || chatSettings.useAntiAIDetection

      const { sendChatMessageStream, sendHumanizedChatStream } = await import('../services/api')
      const streamFunction = useHumanizedChat ? sendHumanizedChatStream : sendChatMessageStream

      let fullText = ''
      let displayedText = ''
      let isAnimating = false
      let streamingComplete = false
      let newSummary = conversation?.summary || null

      const animateText = () => {
        if (displayedText.length < fullText.length) {
          const remaining = fullText.length - displayedText.length
          const charsToAdd = Math.max(1, Math.min(5, Math.ceil(remaining / 15)))
          displayedText = fullText.substring(0, displayedText.length + charsToAdd)
          
          setCurrentMessages(prev => prev.map(m => 
            m.id === aiMessageId ? { ...m, content: displayedText } : m
          ))
          
          requestAnimationFrame(animateText)
        } else if (!streamingComplete) {
          requestAnimationFrame(animateText)
        } else {
          isAnimating = false
        }
      }

      // Prepare messages for API
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments?.map(a => ({
          base64: a.base64,
          mimeType: a.mimeType || a.type,
          name: a.name
        }))
      }))

      // Stream response
      if (useHumanizedChat) {
        await streamFunction(
          apiMessages,
          conversation?.systemPrompt || generateSystemPrompt(),
          actualModel,
          modelSettings.temperature || 0.7,
          currentProfile?.profile_id || null,
          modelSettings.writingPreferences || null,
          chatSettings,
          (chunk) => {
            fullText += chunk
            if (!isAnimating) {
              isAnimating = true
              animateText()
            }
          },
          {
            conversationSummary: conversation?.summary,
            onHumanized: (humanizedText) => {
              fullText = humanizedText
              displayedText = humanizedText
              setCurrentMessages(prev => prev.map(m => 
                m.id === aiMessageId ? { ...m, content: humanizedText } : m
              ))
            },
            onComplete: (completeInfo) => {
              if (completeInfo?.summary) newSummary = completeInfo.summary
            }
          }
        )
      } else {
        await sendChatMessageStream(
          apiMessages,
          conversation?.systemPrompt || generateSystemPrompt(),
          actualModel,
          modelSettings.temperature || 0.7,
          currentProfile?.profile_id || null,
          modelSettings.writingPreferences || null,
          chatSettings,
          (chunk) => {
            fullText += chunk
            if (!isAnimating) {
              isAnimating = true
              animateText()
            }
          },
          {
            conversationSummary: conversation?.summary,
            onComplete: (completeInfo) => {
              if (completeInfo?.summary) newSummary = completeInfo.summary
            }
          }
        )
      }

      streamingComplete = true

      // Wait for animation
      await new Promise(resolve => {
        const check = () => {
          if (!isAnimating && displayedText.length >= fullText.length) {
            resolve()
          } else {
            requestAnimationFrame(check)
          }
        }
        check()
      })

      // Final AI message
      const finalAiMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: fullText,
        timestamp: new Date().toISOString(),
        streaming: false
      }
      
      // Build final messages array
      const finalMessages = [...updatedMessages, finalAiMessage]
      
      // Update local state
      setCurrentMessages(finalMessages)

      // Generate title if first message
      const isFirstMessage = currentMessages.length === 0
      const newTitle = isFirstMessage && !conversation.userEditedTitle 
        ? generateTitle(content) 
        : conversation.title
      
      if (isFirstMessage && !conversation.userEditedTitle) {
        setCurrentConversation(prev => prev ? { ...prev, title: newTitle, titleGenerated: true } : null)
      }

      // Save everything to Firestore in one atomic operation
      // Pattern: Similar to Slack/Discord - queue if temp, save immediately if real ID
      const isTemp = conversation.id.startsWith('temp_')
      const isLocalOnly = conversation.id.startsWith('local_')
      
      // Build updates object
      const updates = {
        ...(isFirstMessage && !conversation.userEditedTitle ? { title: newTitle, titleGenerated: true } : {}),
        ...(newSummary ? { summary: newSummary } : {})
      }
      
      if (!isTemp && !isLocalOnly) {
        // Real Firestore ID - save immediately
        logger.log('[WORKSPACE] Saving messages to Firestore:', conversation.id, finalMessages.length)
        saveConversationMessages(conversation.id, finalMessages, updates).catch(err => {
          logger.warn('Workspace', 'Failed to save conversation:', err.message)
        })
      } else if (isTemp) {
        // Check if we already have a Firestore ID for this temp conversation
        const firestoreId = tempToFirestoreIdRef.current.get(conversation.id)
        
        if (firestoreId) {
          // Firestore ID is ready - save directly
          logger.log('[WORKSPACE] Temp conversation has Firestore ID, saving:', firestoreId)
          saveConversationMessages(firestoreId, finalMessages, updates).catch(err => {
            logger.warn('Workspace', 'Failed to save conversation:', err.message)
          })
          
          // Update current conversation ID
          setCurrentConversation(prev => {
            if (prev?.id === conversation.id) {
              return { ...prev, id: firestoreId, _isTemp: false }
            }
            return prev
          })
        } else {
          // Queue for later when Firestore ID is ready
          logger.log('[WORKSPACE] Queueing messages for temp conversation:', conversation.id)
          const existing = pendingSaveQueueRef.current.get(conversation.id) || { messages: [], updates: {} }
          pendingSaveQueueRef.current.set(conversation.id, {
            messages: finalMessages,
            updates: { ...existing.updates, ...updates }
          })
        }
      }

    } catch (err) {
      logger.error('Workspace', 'Send message error', err)
      
      // Handle credit errors
      if (typeof handleCreditError === 'function') {
        try {
          if (handleCreditError(err, userId)) {
            showUpgradeModal()
          }
        } catch (e) {
          // Ignore credit handler errors
        }
      }
      
      setError(formatErrorMessage(err))
      
      // Remove failed AI message
      setCurrentMessages(prev => prev.filter(m => m.id !== aiMessageId))
    } finally {
      setIsLoading(false)
    }
  }, [currentConversation, currentMessages, userId, modelSettings, currentProfile, generateSystemPrompt, generateTitle, saveConversationMessages, updateConversation, createNewConversation, formatErrorMessage])

  // Delete conversation
  const deleteConversation = useCallback(async (id) => {
    try {
      // Handle temp conversations - just clear local state
      if (id.startsWith('temp_')) {
        logger.log('[WORKSPACE] Deleting temp conversation:', id)
        pendingSaveQueueRef.current.delete(id)
        tempToFirestoreIdRef.current.delete(id)
        
        if (currentConversation?.id === id) {
          setCurrentConversation(null)
          setCurrentMessages([])
        }
        return
      }
      
      // Delete from Firestore
      await removeConversation(id)
      
      if (currentConversation?.id === id) {
        setCurrentConversation(null)
        setCurrentMessages([])
      }
      
      logger.log('[WORKSPACE] Deleted conversation:', id)
    } catch (err) {
      logger.error('Workspace', 'Failed to delete conversation', err)
    }
  }, [removeConversation, currentConversation])

  // Rename conversation
  const renameConversation = useCallback(async (id, newTitle) => {
    try {
      await updateConversation(id, { 
        title: newTitle, 
        userEditedTitle: true 
      })
      
      if (currentConversation?.id === id) {
        setCurrentConversation(prev => prev ? { ...prev, title: newTitle, userEditedTitle: true } : null)
      }
    } catch (err) {
      logger.error('Workspace', 'Failed to rename conversation', err)
    }
  }, [updateConversation, currentConversation])

  // Clear current conversation (for starting new chat)
  const clearConversation = useCallback(() => {
    setCurrentConversation(null)
    setCurrentMessages([])
    setError(null)
  }, [])

  // Clear all conversations
  const clearAllConversations = useCallback(async () => {
    try {
      await clearLocalData()
      setCurrentConversation(null)
      setCurrentMessages([])
      logger.log('[WORKSPACE] Cleared all conversations')
    } catch (err) {
      logger.error('Workspace', 'Failed to clear conversations', err)
    }
  }, [])

  // Update model settings
  const updateModelSettings = useCallback((newSettings) => {
    setModelSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  const value = {
    // Data
    conversations: mergedConversations,
    currentConversation,
    messages: currentMessages,
    isLoading: isLoading || conversationsLoading,
    error,
    modelSettings,
    
    // Actions
    createConversation: createNewConversation,
    loadConversation,
    deleteConversation,
    renameConversation,
    clearConversation,
    clearAllConversations,
    sendMessage,
    updateModelSettings,
    setError
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export default WorkspaceContext
