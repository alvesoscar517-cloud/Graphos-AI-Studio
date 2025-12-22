/**
 * WorkspaceContext with RxDB
 * 
 * Simplified workspace management using RxDB for offline-first data
 * with automatic Firestore sync.
 */

import { logger } from '../utils/logger'
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../stores/authStore'
import { useProfiles } from './ProfileContext'
import { handleCreditError, showUpgradeModal } from '../utils/creditHandler'
import { 
  useConversations, 
  useMessages, 
  useConversationMutations, 
  useMessageMutations,
  useRxDBSync,
  clearLocalData
} from '../db/hooks'

const WorkspaceContext = createContext()

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
  
  // Get userId for RxDB
  const userId = user?.userId || user?.uid || user?.id
  
  // Setup RxDB sync when user logs in
  useRxDBSync(userId)
  
  // Get conversations from RxDB (reactive)
  const { conversations: rxConversations, loading: conversationsLoading } = useConversations(userId)
  const { createConversation, updateConversation, deleteConversation: removeConversation } = useConversationMutations()
  const { addMessage, saveMessage } = useMessageMutations()
  
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

  // Load messages when current conversation changes
  useEffect(() => {
    if (!currentConversation?.id || !userId) {
      setCurrentMessages([])
      return
    }

    // Find messages for current conversation from RxDB
    const loadMessages = async () => {
      try {
        const { getDatabase } = await import('../db/database')
        const db = await getDatabase()
        
        const subscription = db.messages
          .find({
            selector: {
              conversationId: currentConversation.id,
              userId
            }
          })
          .sort({ timestamp: 'asc' })
          .$.subscribe(docs => {
            setCurrentMessages(docs.map(d => d.toJSON()))
          })

        return () => subscription.unsubscribe()
      } catch (err) {
        logger.error('Workspace', 'Failed to load messages', err)
      }
    }

    const cleanup = loadMessages()
    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(unsub => unsub && unsub())
      }
    }
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

  // Create new conversation
  const createNewConversation = useCallback(async (title = 'New Chat') => {
    if (!userId) return null
    
    try {
      const newConv = await createConversation(userId, {
        title,
        systemPrompt: generateSystemPrompt(),
        type: 'chat'
      })
      
      // Handle case where database is not ready
      if (!newConv) {
        logger.warn('Workspace', 'Database not ready, cannot create conversation')
        return null
      }
      
      const convData = newConv.toJSON ? newConv.toJSON() : newConv
      setCurrentConversation(convData)
      setCurrentMessages([])
      
      logger.log('[WORKSPACE] Created new conversation:', convData.id)
      return convData
    } catch (err) {
      logger.error('Workspace', 'Failed to create conversation', err)
      return null
    }
  }, [userId, createConversation, generateSystemPrompt])

  // Load conversation
  const loadConversation = useCallback((id) => {
    const conversation = rxConversations.find(c => c.id === id)
    if (conversation) {
      setCurrentConversation(conversation)
    }
  }, [rxConversations])

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
              resolve({
                ...att,
                base64: reader.result.split(',')[1],
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

    // Save user message to RxDB
    await saveMessage(conversation.id, userId, userMessage)
    
    // Update local state immediately
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
              if (completeInfo.summary) newSummary = completeInfo.summary
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
              if (completeInfo.summary) newSummary = completeInfo.summary
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

      // Save final AI message to RxDB
      const finalAiMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: fullText,
        timestamp: new Date().toISOString(),
        streaming: false
      }
      
      await saveMessage(conversation.id, userId, finalAiMessage)

      // Update conversation title if first message
      const isFirstMessage = currentMessages.length === 0
      if (isFirstMessage && !conversation.userEditedTitle) {
        const newTitle = generateTitle(content)
        await updateConversation(conversation.id, { 
          title: newTitle, 
          titleGenerated: true,
          summary: newSummary,
          messageCount: 2
        })
        setCurrentConversation(prev => ({ ...prev, title: newTitle, titleGenerated: true }))
      } else if (newSummary) {
        await updateConversation(conversation.id, { summary: newSummary })
      }

      setCurrentMessages(prev => prev.map(m => 
        m.id === aiMessageId ? finalAiMessage : m
      ))

    } catch (err) {
      logger.error('Workspace', 'Send message error', err)
      
      // Handle credit errors
      if (handleCreditError(err)) {
        showUpgradeModal()
      }
      
      setError(formatErrorMessage(err))
      
      // Remove failed AI message
      setCurrentMessages(prev => prev.filter(m => m.id !== aiMessageId))
    } finally {
      setIsLoading(false)
    }
  }, [currentConversation, currentMessages, userId, modelSettings, currentProfile, generateSystemPrompt, generateTitle, saveMessage, updateConversation, createNewConversation, formatErrorMessage])

  // Delete conversation
  const deleteConversation = useCallback(async (id) => {
    try {
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
        setCurrentConversation(prev => ({ ...prev, title: newTitle, userEditedTitle: true }))
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
    conversations: rxConversations,
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
