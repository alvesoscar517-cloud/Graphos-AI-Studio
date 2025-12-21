import { logger } from '../utils/logger'
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../stores/authStore'
import { logError } from '../utils/errors'
import { useProfiles } from './ProfileContext'
import { handleCreditError, showUpgradeModal } from '../utils/creditHandler'
import {
  getConversationsFromDB,
  saveConversationToDB,
  deleteConversationFromDB,
  clearConversationsDB
} from '../services/indexedDB'
import { queueSync, SyncOperation, isNetworkOnline } from '../services/syncService'

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

// Safe hook to get current profile - doesn't throw if context missing
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
  
  // Configuration
  const MAX_CONVERSATIONS = 100
  const MAX_MESSAGES_PER_CONVERSATION = 50
  const SUMMARIZE_THRESHOLD = 20 // Trigger summarization after this many messages
  
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
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

  // Track previous user to detect account changes
  const prevUserRef = useRef(null)

  // Load conversations from IndexedDB and clear on user change
  useEffect(() => {
    const prevUser = prevUserRef.current
    const currentUserEmail = user?.email || user?.id
    const prevUserEmail = prevUser?.email || prevUser?.id

    // Detect user change (logout or switch account)
    if (prevUserEmail && prevUserEmail !== currentUserEmail) {
      logger.log('[SECURITY] User changed, clearing workspace data...')
      setConversations([])
      setCurrentConversation(null)
      setError(null)
    }

    // Update ref
    prevUserRef.current = user

    if (user) {
      const userKey = user.email || user.id
      // Load from IndexedDB
      getConversationsFromDB(userKey)
        .then(async loaded => {
          // Migration: Check if there's old data in localStorage
          const oldKey = `workspace_conversations_${userKey}`
          const oldData = localStorage.getItem(oldKey)
          if (oldData && loaded.length === 0) {
            try {
              const parsed = JSON.parse(oldData)
              const migrated = parsed
                .filter(c => c.messages && c.messages.length > 0)
                .map(conv => ({
                  ...conv,
                  created: conv.created ? new Date(conv.created) : new Date(),
                  updated: conv.updated ? new Date(conv.updated) : new Date(),
                  messages: conv.messages?.map(m => ({
                    ...m,
                    timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
                  })) || []
                }))
              
              // Save migrated data to IndexedDB
              for (const conv of migrated) {
                await saveConversationToDB(userKey, conv)
              }
              
              // Remove old localStorage data
              localStorage.removeItem(oldKey)
              logger.log(`[WORKSPACE] Migrated ${migrated.length} conversations from localStorage to IndexedDB`)
              
              setConversations(migrated.slice(0, MAX_CONVERSATIONS))
              return
            } catch (err) {
              logger.error('Workspace', 'Failed to migrate from localStorage', err)
            }
          }

          const limited = loaded
            .sort((a, b) => new Date(b.updated) - new Date(a.updated))
            .slice(0, MAX_CONVERSATIONS)
          setConversations(limited)
          logger.log(`[WORKSPACE] Loaded ${limited.length} conversations from IndexedDB`)
        })
        .catch(err => {
          logger.error('Workspace', 'Failed to load conversations from IndexedDB', err)
          setConversations([])
        })
    } else {
      // User logged out, clear everything
      setConversations([])
      setCurrentConversation(null)
    }
  }, [user])

  // Auto-sync with Firestore when user signs in
  useEffect(() => {
    const handleAuthSignIn = async (event) => {
      const { authMethod, isNewUser } = event.detail || {}
      
      // Skip sync for brand new users (nothing to sync yet)
      if (isNewUser) {
        logger.log('[SYNC] New user, skipping initial Firestore sync')
        return
      }
      
      logger.log('[SYNC] User signed in, starting auto-sync with Firestore...')
      
      // Small delay to ensure auth is fully set up
      setTimeout(async () => {
        try {
          if (!user || !isNetworkOnline()) return
          
          const userId = user.id || user.uid || user.email
          const { getConversations } = await import('../services/firestoreDataService')
          const { conversations: firestoreConversations } = await getConversations(userId, { pageSize: 100 })
          
          if (firestoreConversations && firestoreConversations.length > 0) {
            // Merge with local conversations
            setConversations(prev => {
              const localIds = new Set(prev.map(c => c.id))
              const newFromFirestore = firestoreConversations.filter(c => !localIds.has(c.id))
              
              // Update existing if Firestore version is newer
              const merged = prev.map(local => {
                const firestoreVersion = firestoreConversations.find(d => d.id === local.id)
                if (firestoreVersion && new Date(firestoreVersion.updated) > new Date(local.updated)) {
                  return { ...firestoreVersion, messages: local.messages } // Keep local messages
                }
                return local
              })
              
              const all = [...merged, ...newFromFirestore]
                .sort((a, b) => new Date(b.updated) - new Date(a.updated))
              
              logger.log(`[SYNC] Auto-synced: ${firestoreConversations.length} from Firestore, ${newFromFirestore.length} new`)
              return all
            })
          }
        } catch (error) {
          // Silent fail for auto-sync - don't interrupt user experience
          logger.log('[SYNC] Auto-sync failed (will retry on manual sync):', error.message)
        }
      }, 1500)
    }
    
    window.addEventListener('auth-signin', handleAuthSignIn)
    return () => window.removeEventListener('auth-signin', handleAuthSignIn)
  }, [])

  // Save ref to track last saved state (avoid unnecessary writes)
  const lastSavedRef = useRef(null)

  // Save conversations to IndexedDB and queue Firestore sync (debounced, only when changed)
  useEffect(() => {
    if (!user) return

    const userKey = user.email || user.id
    const userId = user.id || user.uid || user.email
    // Only save conversations with actual content (messages)
    const conversationsWithContent = conversations.filter(
      c => c.messages && c.messages.length > 0
    )

    // Skip if nothing changed
    const currentHash = JSON.stringify(conversationsWithContent.map(c => c.id + c.updated))
    if (lastSavedRef.current === currentHash) return
    lastSavedRef.current = currentHash

    // Debounce save to IndexedDB and queue Firestore sync
    const saveTimeout = setTimeout(() => {
      conversationsWithContent.forEach(async conv => {
        try {
          await saveConversationToDB(userKey, conv)
          
          // Queue sync to Firestore (without messages - they're separate)
          if (userId && isNetworkOnline()) {
            const convForSync = {
              ...conv,
              messages: undefined, // Don't include messages in conversation sync
              messageCount: conv.messages?.length || 0
            }
            await queueSync({
              entityType: 'conversation',
              entityId: conv.id,
              operation: SyncOperation.UPDATE,
              data: convForSync,
              userId
            })
          }
        } catch (err) {
          logger.error('Workspace', 'Failed to save conversation', err)
        }
      })
    }, 500)

    return () => clearTimeout(saveTimeout)
  }, [conversations, user])
  
  // Periodic cleanup - with proper cleanup ref to prevent memory leaks
  const cleanupIntervalRef = useRef(null)
  
  useEffect(() => {
    // Clear any existing interval first
    if (cleanupIntervalRef.current) {
      clearInterval(cleanupIntervalRef.current)
    }
    
    cleanupIntervalRef.current = setInterval(() => {
      setConversations(prev => {
        // First, remove empty conversations (no messages)
        const withContent = prev.filter(c => 
          c.messages && c.messages.length > 0
        )
        
        // Log if we removed any empty ones
        if (withContent.length < prev.length) {
          const removed = prev.length - withContent.length
          logger.log(`🧹 Auto-cleanup: Removed ${removed} empty conversations`)
          // Delete empty ones from IndexedDB
          prev.filter(c => !c.messages || c.messages.length === 0).forEach(c => {
            deleteConversationFromDB(c.id).catch(() => {})
          })
        }
        
        // Then limit to MAX_CONVERSATIONS
        if (withContent.length <= MAX_CONVERSATIONS) return withContent
        
        const sorted = [...withContent].sort((a, b) => 
          new Date(b.updated || b.created) - new Date(a.updated || a.created)
        )
        
        logger.log(`🧹 Auto-cleanup: Keeping ${MAX_CONVERSATIONS} of ${sorted.length} conversations`)
        return sorted.slice(0, MAX_CONVERSATIONS)
      })
    }, 5 * 60 * 1000)
    
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
        cleanupIntervalRef.current = null
      }
    }
  }, [])

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

  // Check if conversation has content (only messages count, not title)
  const hasContent = useCallback((conversation) => {
    if (!conversation) return false
    const messages = conversation.messages || []
    // Only count as having content if there are actual messages
    return messages.length > 0
  }, [])

  // Clean up empty conversations (except current one being edited)
  const cleanupEmptyConversations = useCallback((excludeId = null) => {
    setConversations(prev => {
      const currentId = excludeId || currentConversation?.id
      const emptyConvs = prev.filter(c => !hasContent(c) && c.id !== currentId)
      if (emptyConvs.length > 0) {
        logger.log(`🧹 Cleaning up ${emptyConvs.length} empty conversations`)
        // Also delete from IndexedDB
        emptyConvs.forEach(c => {
          deleteConversationFromDB(c.id).catch(err => {
            logger.error('Workspace', 'Failed to delete empty conversation from IndexedDB', err)
          })
        })
        return prev.filter(c => hasContent(c) || c.id === currentId)
      }
      return prev
    })
  }, [hasContent, currentConversation])

  // Create new conversation
  const createConversation = useCallback((title = 'New Chat') => {
    cleanupEmptyConversations()
    
    const newConversation = {
      id: Date.now().toString(),
      title,
      messages: [],
      systemPrompt: generateSystemPrompt(),
      created: new Date(),
      updated: new Date(),
      type: 'chat',
      titleGenerated: false,
      userEditedTitle: false,
      summary: null // Store conversation summary
    }
    
    setConversations(prev => [newConversation, ...prev])
    setCurrentConversation(newConversation)
    
    return newConversation
  }, [generateSystemPrompt, cleanupEmptyConversations])

  // Load conversation
  const loadConversation = useCallback((id) => {
    // Clean up empty conversations when switching (except the one we're loading)
    cleanupEmptyConversations(id)
    
    const conversation = conversations.find(c => c.id === id)
    if (conversation) {
      setCurrentConversation(conversation)
    }
  }, [conversations, cleanupEmptyConversations])

  // Truncate title to max words
  const truncateTitleToWords = useCallback((title, maxWords = 7) => {
    if (!title) return title
    const words = title.trim().split(/\s+/)
    if (words.length <= maxWords) return title
    return words.slice(0, maxWords).join(' ') + '...'
  }, [])

  // Generate title from first characters of content (no AI call)
  const generateTitle = useCallback((firstMessage) => {
    const firstSentence = firstMessage.split(/[.!?。\n]/)[0]?.trim() || firstMessage
    return truncateTitleToWords(firstSentence, 7)
  }, [truncateTitleToWords])

  // Format error message for display
  const formatErrorMessage = useCallback((error) => {
    if (error.code && ERROR_MESSAGES[error.code]) {
      return ERROR_MESSAGES[error.code]
    }
    if (error.message) {
      // Check for known error patterns
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
      conversation = createConversation()
    }

    // Process attachments to base64 if needed
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

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      attachments: processedAttachments,
      timestamp: new Date()
    }

    const updatedMessages = [...(conversation?.messages || []), userMessage]
    
    setCurrentConversation(prev => ({
      ...(prev || conversation),
      messages: updatedMessages,
      updated: new Date()
    }))

    setIsLoading(true)
    setError(null)

    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      streaming: true
    }

    setCurrentConversation(prev => ({
      ...(prev || conversation),
      messages: [...updatedMessages, aiMessage],
      updated: new Date()
    }))

    try {
      const modelMap = {
        'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
        'gemini-2.5-flash': 'gemini-2.5-flash',
        'gemini-2.5-pro': 'gemini-2.5-pro'
      }
      
      const actualModel = modelMap[modelSettings.model] || 'gemini-2.5-flash'

      // Check if humanization is enabled
      const chatSettings = modelSettings.chatSettings || {}
      const useHumanizedChat = chatSettings.humanizeResponse || chatSettings.useAntiAIDetection

      // Import appropriate streaming function
      // Humanized chat can work with or without profile (generic humanization)
      const { sendChatMessageStream, sendHumanizedChatStream } = await import('../services/api')
      const streamFunction = useHumanizedChat ? sendHumanizedChatStream : sendChatMessageStream

      let fullText = ''
      let displayedText = ''
      let animationFrameId = null
      let isAnimating = false
      let streamingComplete = false // Flag to track when streaming is done
      let newSummary = conversation?.summary || null
      let humanizationResult = null

      const animateText = () => {
        if (displayedText.length < fullText.length) {
          const remaining = fullText.length - displayedText.length
          // Adaptive speed: faster when buffer is large, slower when catching up
          const charsToAdd = Math.max(1, Math.min(5, Math.ceil(remaining / 15)))
          
          displayedText = fullText.substring(0, displayedText.length + charsToAdd)
          
          setCurrentConversation(prev => ({
            ...prev,
            messages: prev.messages.map(m => 
              m.id === aiMessageId 
                ? { ...m, content: displayedText }
                : m
            )
          }))
          
          animationFrameId = requestAnimationFrame(animateText)
        } else if (!streamingComplete) {
          // Text caught up but streaming not done - keep checking for new content
          animationFrameId = requestAnimationFrame(animateText)
        } else {
          // Streaming complete and all text displayed
          isAnimating = false
          animationFrameId = null
        }
      }

      // Prepare messages for API (include attachments)
      // Optimization: If we have a summary, only send recent messages
      // Backend will use summary for context, reducing bandwidth and tokens
      const MAX_MESSAGES_TO_SEND = 10
      const hasSummary = !!conversation?.summary
      const messagesToSend = hasSummary && updatedMessages.length > MAX_MESSAGES_TO_SEND
        ? updatedMessages.slice(-MAX_MESSAGES_TO_SEND)
        : updatedMessages
      
      const apiMessages = messagesToSend.map(m => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments?.map(a => ({
          base64: a.base64,
          mimeType: a.mimeType || a.type,
          name: a.name
        }))
      }))
      
      if (hasSummary && updatedMessages.length > MAX_MESSAGES_TO_SEND) {
        logger.log(`[OPTIMIZE] Sending ${messagesToSend.length}/${updatedMessages.length} messages (has summary)`)
      }

      // Use humanized or standard chat based on settings
      if (useHumanizedChat) {
        logger.log('[PERSONA] Using humanized chat', currentProfile ? 'with voice profile' : 'with generic voice')
        await streamFunction(
          apiMessages,
          currentConversation?.systemPrompt || generateSystemPrompt(),
          actualModel,
          modelSettings.temperature || 0.7,
          currentProfile?.profile_id || null, // Can be null for generic humanization
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
            onContext: (contextInfo) => {
              if (contextInfo.wasSummarized) {
                logger.log(`[NOTE] Conversation summarized (${contextInfo.summarizedCount} messages)`)
              }
            },
            onHumanizing: (humanizingInfo) => {
              // Humanization in progress - show status
              logger.log(`[SYNC] Humanizing: AI probability ${humanizingInfo.aiProbability}% -> target ${humanizingInfo.target}%`)
            },
            onHumanized: (humanizedText) => {
              // Replace with fully humanized text
              fullText = humanizedText
              displayedText = humanizedText
              setCurrentConversation(prev => ({
                ...prev,
                messages: prev.messages.map(m => 
                  m.id === aiMessageId 
                    ? { ...m, content: humanizedText }
                    : m
                )
              }))
            },
            onComplete: (completeInfo) => {
              if (completeInfo.summary) {
                newSummary = completeInfo.summary
              }
              if (completeInfo.humanization) {
                humanizationResult = completeInfo.humanization
              }
              // Log if response was incomplete
              if (completeInfo.wasIncomplete) {
                logger.warn('[WORKSPACE] Response was truncated due to token limit')
              }
            }
          }
        )
      } else {
        await sendChatMessageStream(
          apiMessages,
          currentConversation?.systemPrompt || generateSystemPrompt(),
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
            onContext: (contextInfo) => {
              if (contextInfo.wasSummarized) {
                logger.log(`[NOTE] Conversation summarized (${contextInfo.summarizedCount} messages)`)
              }
            },
            onComplete: (completeInfo) => {
              if (completeInfo.summary) {
                newSummary = completeInfo.summary
              }
              // Log if response was incomplete
              if (completeInfo.wasIncomplete) {
                logger.warn('[WORKSPACE] Response was truncated due to token limit')
              }
            }
          }
        )
      }

      // Mark streaming as complete so animation knows to stop
      streamingComplete = true

      // Wait for animation to complete with proper final update
      const waitForAnimation = () => {
        return new Promise((resolve) => {
          const checkAnimation = () => {
            // Check if animation is done AND displayed text matches full text
            if (!isAnimating && displayedText.length >= fullText.length) {
              // Ensure final content is fully displayed
              if (displayedText !== fullText) {
                displayedText = fullText
                setCurrentConversation(prev => ({
                  ...prev,
                  messages: prev.messages.map(m => 
                    m.id === aiMessageId 
                      ? { ...m, content: fullText }
                      : m
                  )
                }))
              }
              resolve()
            } else {
              // If animation stopped but text not complete, restart it
              if (!isAnimating && displayedText.length < fullText.length) {
                isAnimating = true
                animateText()
              }
              requestAnimationFrame(checkAnimation)
            }
          }
          checkAnimation()
        })
      }
      
      await waitForAnimation()

      const finalAiMessage = {
        ...aiMessage,
        content: fullText,
        streaming: false
      }

      const finalMessages = [...updatedMessages, finalAiMessage]

      // Auto-generate title for first message (using first characters, no AI)
      let newTitle = currentConversation?.title || conversation?.title
      const isFirstMessage = (currentConversation?.messages || conversation?.messages || []).length === 0
      const userEditedTitle = currentConversation?.userEditedTitle || conversation?.userEditedTitle
      
      if (isFirstMessage && !userEditedTitle) {
        newTitle = generateTitle(content)
        setConversations(prev => 
          prev.map(c => c.id === (currentConversation?.id || conversation?.id) 
            ? { ...c, title: newTitle, titleGenerated: true } 
            : c
          )
        )
        setCurrentConversation(prev => prev ? { ...prev, title: newTitle, titleGenerated: true } : prev)
      }

      const updatedConversation = {
        ...(currentConversation || conversation),
        messages: finalMessages,
        updated: new Date(),
        title: newTitle,
        summary: newSummary
      }
      
      setCurrentConversation(updatedConversation)

      setConversations(prev => {
        const exists = prev.find(c => c.id === updatedConversation.id)
        if (exists) {
          return prev.map(c => c.id === updatedConversation.id ? updatedConversation : c)
        } else {
          return [updatedConversation, ...prev]
        }
      })

    } catch (err) {
      logError(err, { context: 'sendMessage', conversationId: conversation?.id })
      
      // Check if it's a credit error - show friendly modal instead of inline error
      const wasCreditError = handleCreditError(err, null, showUpgradeModal)
      
      if (wasCreditError) {
        // Remove the streaming AI message since we're showing a modal
        setCurrentConversation(prev => ({
          ...(prev || conversation),
          messages: updatedMessages // Remove the AI message that was being streamed
        }))
      } else {
        const errorMessage = formatErrorMessage(err)
        setError(errorMessage)
        
        const errorMessageObj = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: errorMessage,
          error: true,
          errorCode: err.code,
          timestamp: new Date()
        }

        setCurrentConversation(prev => ({
          ...(prev || conversation),
          messages: [...updatedMessages, errorMessageObj]
        }))
      }
    } finally {
      setIsLoading(false)
    }
  }, [currentConversation, generateSystemPrompt, createConversation, modelSettings, currentProfile, generateTitle, formatErrorMessage, truncateTitleToWords])

  // Delete conversation
  const deleteConversation = useCallback(async (id) => {
    const userId = user?.id || user?.uid || user?.email
    
    setConversations(prev => prev.filter(c => c.id !== id))
    if (currentConversation?.id === id) {
      setCurrentConversation(null)
    }
    // Also delete from IndexedDB
    try {
      await deleteConversationFromDB(id)
      
      // Queue Firestore delete
      if (userId) {
        await queueSync({
          entityType: 'conversation',
          entityId: id,
          operation: SyncOperation.DELETE,
          data: null,
          userId
        })
      }
    } catch (err) {
      logger.error('Workspace', 'Failed to delete conversation', err)
    }
  }, [currentConversation, user])

  // Update system prompt
  const updateSystemPrompt = useCallback((prompt) => {
    if (currentConversation) {
      const updated = { ...currentConversation, systemPrompt: prompt }
      setCurrentConversation(updated)
      setConversations(prev => 
        prev.map(c => c.id === currentConversation.id ? updated : c)
      )
    }
  }, [currentConversation])

  // Clear current conversation
  const clearConversation = useCallback(() => {
    // Clean up empty conversations when clearing
    cleanupEmptyConversations()
    setCurrentConversation(null)
  }, [cleanupEmptyConversations])

  // Update model settings
  const updateModelSettings = useCallback((settings) => {
    setModelSettings(prev => ({ ...prev, ...settings }))
  }, [])

  // Update conversation title
  const updateConversationTitle = useCallback((id, newTitle, isUserEdit = true) => {
    setConversations(prev => 
      prev.map(c => c.id === id ? { 
        ...c, 
        title: newTitle, 
        updated: new Date(),
        userEditedTitle: isUserEdit ? true : c.userEditedTitle 
      } : c)
    )
    if (currentConversation?.id === id) {
      setCurrentConversation(prev => ({ 
        ...prev, 
        title: newTitle, 
        updated: new Date(),
        userEditedTitle: isUserEdit ? true : prev.userEditedTitle
      }))
    }
  }, [currentConversation])

  // Retry last message
  const retryLastMessage = useCallback(async () => {
    if (!currentConversation || currentConversation.messages.length < 2) return
    
    const messages = currentConversation.messages
    const lastUserMessageIndex = messages.length - 2
    const lastUserMessage = messages[lastUserMessageIndex]
    
    if (lastUserMessage?.role !== 'user') return
    
    // Remove the error message
    const messagesWithoutError = messages.slice(0, -1)
    setCurrentConversation(prev => ({
      ...prev,
      messages: messagesWithoutError
    }))
    
    // Resend
    await sendMessage(lastUserMessage.content, lastUserMessage.attachments || [])
  }, [currentConversation, sendMessage])

  // Sync conversations to Firestore
  const syncConversationsToFirestore = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    const userId = user.id || user.uid || user.email
    
    try {
      const { getConversations, saveConversation } = await import('../services/firestoreDataService')
      
      // Only sync conversations with content
      const conversationsToSync = conversations.filter(c => 
        c.messages && c.messages.length > 0
      )
      
      let synced = 0
      for (const conv of conversationsToSync) {
        const convForSync = {
          ...conv,
          messages: undefined, // Messages are synced separately
          messageCount: conv.messages?.length || 0
        }
        await saveConversation(userId, convForSync)
        synced++
      }
      
      logger.log(`[UPLOAD] Synced ${synced} conversations to Firestore`)
      return { synced }
    } catch (error) {
      logger.error('Workspace', 'Failed to sync conversations to Firestore', error)
      throw error
    }
  }, [user, conversations])

  // Load conversations from Firestore
  const loadConversationsFromFirestore = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    const userId = user.id || user.uid || user.email
    
    try {
      const { getConversations } = await import('../services/firestoreDataService')
      const { conversations: firestoreConversations } = await getConversations(userId, { pageSize: 100 })
      
      // Merge with local conversations (Firestore takes precedence for same ID)
      const localIds = new Set(conversations.map(c => c.id))
      const newFromFirestore = firestoreConversations.filter(c => !localIds.has(c.id))
      
      // Update existing conversations if Firestore version is newer
      const merged = conversations.map(local => {
        const firestoreVersion = firestoreConversations.find(d => d.id === local.id)
        if (firestoreVersion && new Date(firestoreVersion.updated) > new Date(local.updated)) {
          return { ...firestoreVersion, messages: local.messages } // Keep local messages
        }
        return local
      })
      
      // Add new conversations from Firestore
      const allConversations = [...merged, ...newFromFirestore]
        .sort((a, b) => new Date(b.updated) - new Date(a.updated))
      
      setConversations(allConversations)
      logger.log(`[DOWNLOAD] Loaded ${firestoreConversations.length} conversations from Firestore, ${newFromFirestore.length} new`)
      
      return { loaded: firestoreConversations.length, new: newFromFirestore.length }
    } catch (error) {
      logger.error('Workspace', 'Failed to load conversations from Firestore', error)
      throw error
    }
  }, [user, conversations])

  const value = {
    conversations,
    currentConversation,
    isLoading,
    error,
    modelSettings,
    createConversation,
    loadConversation,
    sendMessage,
    deleteConversation,
    updateSystemPrompt,
    clearConversation,
    generateSystemPrompt,
    updateModelSettings,
    updateConversationTitle,
    syncConversationsToFirestore,
    loadConversationsFromFirestore,
    retryLastMessage
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}
