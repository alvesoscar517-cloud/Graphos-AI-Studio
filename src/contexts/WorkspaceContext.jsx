import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useProfiles } from './ProfileContext'
import { CONFIG } from '../utils/config'

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

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth()
  const { currentProfile } = useProfiles()
  
  // Configuration
  const MAX_CONVERSATIONS = 100
  const MAX_MESSAGES_PER_CONVERSATION = 50
  const SUMMARIZE_THRESHOLD = 20 // Trigger summarization after this many messages
  
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modelSettings, setModelSettings] = useState({
    model: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 2048,
    writingPreferences: {
      useVocabularyPreferences: true,
      useKeyCharacteristics: true,
      useSentencePatterns: true,
      useRewriteInstructions: true
    }
  })

  // Load conversations from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`workspace_conversations_${user.email}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const limited = parsed.slice(0, MAX_CONVERSATIONS)
          setConversations(limited)
          
          if (parsed.length > MAX_CONVERSATIONS) {
            console.log(`⚠️ Loaded ${MAX_CONVERSATIONS} of ${parsed.length} conversations`)
          }
        } catch (err) {
          console.error('Failed to load conversations:', err)
        }
      }
    }
  }, [user])

  // Save conversations to localStorage
  useEffect(() => {
    if (user) {
      const conversationsWithContent = conversations.filter(c => 
        (c.messages && c.messages.length > 0) || 
        (c.title && c.title.trim() !== '' && c.title !== 'New Chat')
      )
      
      const limited = conversationsWithContent.slice(0, MAX_CONVERSATIONS)
      
      if (limited.length > 0) {
        localStorage.setItem(
          `workspace_conversations_${user.email}`,
          JSON.stringify(limited)
        )
      }
    }
  }, [conversations, user])
  
  // Periodic cleanup
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setConversations(prev => {
        if (prev.length <= MAX_CONVERSATIONS) return prev
        
        const sorted = [...prev].sort((a, b) => 
          new Date(b.updated || b.created) - new Date(a.updated || a.created)
        )
        
        console.log(`🧹 Auto-cleanup: Keeping ${MAX_CONVERSATIONS} of ${prev.length} conversations`)
        return sorted.slice(0, MAX_CONVERSATIONS)
      })
    }, 5 * 60 * 1000)
    
    return () => clearInterval(cleanupInterval)
  }, [])

  // Generate system prompt based on user profile
  const generateSystemPrompt = useCallback(() => {
    if (!currentProfile) {
      return 'Bạn là một trợ lý AI thông minh và hữu ích. Hãy trả lời một cách tự nhiên và chính xác.'
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

  // Check if conversation has content
  const hasContent = useCallback((conversation) => {
    if (!conversation) return false
    const messages = conversation.messages || []
    const title = conversation.title?.trim() || ''
    return messages.length > 0 || (title.length > 0 && title !== 'New Chat')
  }, [])

  // Clean up empty conversations
  const cleanupEmptyConversations = useCallback(() => {
    setConversations(prev => {
      const emptyConvs = prev.filter(c => !hasContent(c) && c.id !== currentConversation?.id)
      if (emptyConvs.length > 0) {
        console.log(`🧹 Cleaning up ${emptyConvs.length} empty conversations`)
        return prev.filter(c => hasContent(c) || c.id === currentConversation?.id)
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
    const conversation = conversations.find(c => c.id === id)
    if (conversation) {
      setCurrentConversation(conversation)
    }
  }, [conversations])

  // Truncate title to max words
  const truncateTitleToWords = useCallback((title, maxWords = 7) => {
    if (!title) return title
    const words = title.trim().split(/\s+/)
    if (words.length <= maxWords) return title
    return words.slice(0, maxWords).join(' ') + '...'
  }, [])

  // Generate title from AI
  const generateTitle = useCallback(async (firstMessage) => {
    try {
      const truncatedMessage = firstMessage.substring(0, 150)
      
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Create a short title (maximum 7 words) for the following content. ONLY return the title, no explanation: "${truncatedMessage}"`
          }],
          systemPrompt: 'You are a title generation assistant. Only return a short title of maximum 7 words, no explanation, no quotes.',
          model: 'gemini-2.0-flash-lite',
          temperature: 0.2,
          maxTokens: 30
        })
      })

      if (response.ok) {
        const data = await response.json()
        let title = data.message.trim().replace(/^["']|["']$/g, '')
        return truncateTitleToWords(title, 7)
      }
    } catch (err) {
      console.error('Failed to generate title:', err)
    }
    
    const firstSentence = firstMessage.split(/[.!?。]/)[0]?.trim() || firstMessage
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
        'gemini-2.0-flash-exp': 'gemini-2.0-flash-exp',
        'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
        'gemini-2.5-flash': 'gemini-2.5-flash',
        'gemini-2.5-pro': 'gemini-2.5-pro'
      }
      
      const actualModel = modelMap[modelSettings.model] || 'gemini-2.0-flash-exp'

      // Check if humanization is enabled
      const chatSettings = modelSettings.chatSettings || {}
      const useHumanizedChat = chatSettings.humanizeResponse || chatSettings.useAntiAIDetection

      // Import appropriate streaming function
      const { sendChatMessageStream, sendHumanizedChatStream } = await import('../services/api')
      const streamFunction = useHumanizedChat && currentProfile ? sendHumanizedChatStream : sendChatMessageStream

      let fullText = ''
      let displayedText = ''
      let animationFrameId = null
      let isAnimating = false
      let newSummary = conversation?.summary || null
      let humanizationResult = null

      const animateText = () => {
        if (displayedText.length < fullText.length) {
          const remaining = fullText.length - displayedText.length
          const charsToAdd = Math.max(1, Math.min(3, Math.ceil(remaining / 20)))
          
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
        } else {
          isAnimating = false
          animationFrameId = null
        }
      }

      // Prepare messages for API (include attachments)
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments?.map(a => ({
          base64: a.base64,
          mimeType: a.mimeType || a.type,
          name: a.name
        }))
      }))

      // Use humanized or standard chat based on settings
      if (useHumanizedChat && currentProfile) {
        console.log('🎭 Using humanized chat with voice profile')
        await streamFunction(
          apiMessages,
          currentConversation?.systemPrompt || generateSystemPrompt(),
          actualModel,
          modelSettings.temperature || 0.7,
          currentProfile.profile_id,
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
                console.log(`📝 Conversation summarized (${contextInfo.summarizedCount} messages)`)
              }
            },
            onHumanized: (humanizedText) => {
              // Replace with fully humanized text
              console.log('✨ Received humanized text')
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
                console.log(`📝 Conversation summarized (${contextInfo.summarizedCount} messages)`)
              }
            },
            onComplete: (completeInfo) => {
              if (completeInfo.summary) {
                newSummary = completeInfo.summary
              }
            }
          }
        )
      }

      // Wait for animation to complete
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
      displayedText = fullText

      const finalAiMessage = {
        ...aiMessage,
        content: fullText,
        streaming: false
      }

      const finalMessages = [...updatedMessages, finalAiMessage]

      // Auto-generate title for first message
      let newTitle = currentConversation?.title || conversation?.title
      const isFirstMessage = (currentConversation?.messages || conversation?.messages || []).length === 0
      const userEditedTitle = currentConversation?.userEditedTitle || conversation?.userEditedTitle
      
      if (isFirstMessage && !userEditedTitle) {
        generateTitle(content).then(title => {
          setConversations(prev => 
            prev.map(c => c.id === (currentConversation?.id || conversation?.id) 
              ? { ...c, title, titleGenerated: true } 
              : c
            )
          )
          setCurrentConversation(prev => prev ? { ...prev, title, titleGenerated: true } : prev)
        })
        
        newTitle = truncateTitleToWords(content, 7)
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
      console.error('Error sending message:', err)
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
    } finally {
      setIsLoading(false)
    }
  }, [currentConversation, generateSystemPrompt, createConversation, modelSettings, currentProfile, generateTitle, formatErrorMessage, truncateTitleToWords])

  // Delete conversation
  const deleteConversation = useCallback((id) => {
    setConversations(prev => prev.filter(c => c.id !== id))
    if (currentConversation?.id === id) {
      setCurrentConversation(null)
    }
  }, [currentConversation])

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
    setCurrentConversation(null)
  }, [])

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

  // Sync to Drive (placeholder)
  const syncConversationsToDrive = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      console.log('📤 Drive sync for conversations not yet implemented')
      console.log(`   Would sync ${conversations.length} conversations`)
      return { synced: 0, message: 'Drive sync coming soon' }
    } catch (error) {
      console.error('Failed to sync conversations to Drive:', error)
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
    syncConversationsToDrive,
    retryLastMessage
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}
