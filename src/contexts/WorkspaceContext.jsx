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

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth()
  const { currentProfile } = useProfiles()
  
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
          setConversations(parsed)
        } catch (err) {
          console.error('Failed to load conversations:', err)
        }
      }
    }
  }, [user])

  // Save conversations to localStorage
  useEffect(() => {
    if (user && conversations.length > 0) {
      localStorage.setItem(
        `workspace_conversations_${user.email}`,
        JSON.stringify(conversations)
      )
      
      // TODO: Sync to Drive in background
      // This would require Drive API integration similar to notes
      // For now, conversations are stored locally only
    }
  }, [conversations, user])

  // Generate system prompt based on user profile
  const generateSystemPrompt = useCallback(() => {
    if (!currentProfile) {
      return 'Bạn là một trợ lý AI thông minh và hữu ích. Hãy trả lời một cách tự nhiên và chính xác.'
    }

    const { writing_style, tone, expertise } = currentProfile
    
    let prompt = 'Bạn là một trợ lý AI thông minh. '
    
    if (writing_style) {
      prompt += `Hãy viết theo phong cách: ${writing_style}. `
    }
    
    if (tone) {
      prompt += `Sử dụng giọng điệu: ${tone}. `
    }
    
    if (expertise && expertise.length > 0) {
      prompt += `Bạn có chuyên môn về: ${expertise.join(', ')}. `
    }
    
    prompt += 'Hãy trả lời một cách tự nhiên, chính xác và phù hợp với văn phong của người dùng.'
    
    return prompt
  }, [currentProfile])

  // Create new conversation
  const createConversation = useCallback((title = 'New Chat') => {
    const newConversation = {
      id: Date.now().toString(),
      title,
      messages: [],
      systemPrompt: generateSystemPrompt(),
      created: new Date(),
      updated: new Date(),
      type: 'chat',
      titleGenerated: false, // Track if title was auto-generated
      userEditedTitle: false // Track if user manually edited title
    }
    
    setConversations(prev => [newConversation, ...prev])
    setCurrentConversation(newConversation)
    
    return newConversation
  }, [generateSystemPrompt])

  // Load conversation
  const loadConversation = useCallback((id) => {
    const conversation = conversations.find(c => c.id === id)
    if (conversation) {
      setCurrentConversation(conversation)
    }
  }, [conversations])

  // Generate title from AI
  const generateTitle = useCallback(async (firstMessage) => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Tóm tắt nội dung sau thành tiêu đề ngắn gọn (tối đa 6-8 từ), chỉ trả về tiêu đề không giải thích: "${firstMessage}"`
          }],
          systemPrompt: 'Bạn là trợ lý tóm tắt. Chỉ trả về tiêu đề ngắn gọn, không giải thích.',
          model: modelSettings.model || 'gemini-2.0-flash-exp',
          temperature: 0.3
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.message.trim().replace(/^["']|["']$/g, '') // Remove quotes
      }
    } catch (err) {
      console.error('Failed to generate title:', err)
    }
    
    // Fallback to truncated message
    return firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '')
  }, [modelSettings.model])

  // Send message with smooth streaming
  const sendMessage = useCallback(async (content, attachments = []) => {
    let conversation = currentConversation
    
    if (!conversation) {
      conversation = createConversation()
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      attachments,
      timestamp: new Date()
    }

    // Add user message immediately
    const updatedMessages = [...(conversation?.messages || []), userMessage]
    
    setCurrentConversation(prev => ({
      ...(prev || conversation),
      messages: updatedMessages,
      updated: new Date()
    }))

    setIsLoading(true)
    setError(null)

    // Create AI message placeholder
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      streaming: true
    }

    // Add empty AI message
    setCurrentConversation(prev => ({
      ...(prev || conversation),
      messages: [...updatedMessages, aiMessage],
      updated: new Date()
    }))

    try {
      // Map model ID to actual model name
      const modelMap = {
        'gemini-2.0-flash-exp': 'gemini-2.0-flash-exp',
        'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
        'gemini-2.5-flash': 'gemini-2.5-flash',
        'gemini-2.5-pro': 'gemini-2.5-pro'
      }
      
      const actualModel = modelMap[modelSettings.model] || 'gemini-2.0-flash-exp'

      // Import streaming function
      const { sendChatMessageStream } = await import('../services/api')

      let fullText = '' // Complete text buffer
      let displayedText = '' // Currently displayed text
      let animationFrameId = null
      let isAnimating = false

      // Smooth animation function
      const animateText = () => {
        if (displayedText.length < fullText.length) {
          // Calculate how many characters to add (adaptive speed)
          const remaining = fullText.length - displayedText.length
          const charsToAdd = Math.max(1, Math.min(3, Math.ceil(remaining / 20)))
          
          displayedText = fullText.substring(0, displayedText.length + charsToAdd)
          
          // Update message content
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

      // Stream response
      await sendChatMessageStream(
        updatedMessages.map(m => ({
          role: m.role,
          content: m.content
        })),
        currentConversation?.systemPrompt || generateSystemPrompt(),
        actualModel,
        modelSettings.temperature || 0.7,
        currentProfile?.profile_id || null,
        modelSettings.writingPreferences || null,
        (chunk) => {
          // Add chunk to full text buffer
          fullText += chunk
          
          // Start smooth animation if not already running
          if (!isAnimating) {
            isAnimating = true
            animateText()
          }
        }
      )

      // Wait for animation to complete naturally
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

      // Final update with complete message
      const finalAiMessage = {
        ...aiMessage,
        content: fullText,
        streaming: false
      }

      const finalMessages = [...updatedMessages, finalAiMessage]

      // Auto-generate title for first message (only if user hasn't edited it)
      let newTitle = currentConversation?.title || conversation?.title
      const isFirstMessage = (currentConversation?.messages || conversation?.messages || []).length === 0
      const userEditedTitle = currentConversation?.userEditedTitle || conversation?.userEditedTitle
      
      if (isFirstMessage && !userEditedTitle) {
        // Generate title in background
        generateTitle(content).then(title => {
          setConversations(prev => 
            prev.map(c => c.id === (currentConversation?.id || conversation?.id) 
              ? { ...c, title, titleGenerated: true } 
              : c
            )
          )
          setCurrentConversation(prev => prev ? { ...prev, title, titleGenerated: true } : prev)
        })
        
        // Use temporary title for now
        newTitle = content.substring(0, 50) + (content.length > 50 ? '...' : '')
      }

      // Update conversation with AI response
      const updatedConversation = {
        ...(currentConversation || conversation),
        messages: finalMessages,
        updated: new Date(),
        title: newTitle
      }
      
      setCurrentConversation(updatedConversation)

      // Update in conversations list
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
      setError(err.message)
      
      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
        error: true,
        timestamp: new Date()
      }

      setCurrentConversation(prev => ({
        ...(prev || conversation),
        messages: [...updatedMessages, errorMessage]
      }))
    } finally {
      setIsLoading(false)
    }
  }, [currentConversation, generateSystemPrompt, createConversation, modelSettings, currentProfile, generateTitle])

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

  // Sync conversations to Drive (placeholder for future implementation)
  const syncConversationsToDrive = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      // TODO: Implement Drive sync
      // 1. Get or create "AI Conversations" folder in Drive
      // 2. For each conversation, create/update a JSON file
      // 3. Store conversation data including messages, title, timestamps
      // 4. Handle conflicts (local vs remote changes)
      
      console.log('📤 Drive sync for conversations not yet implemented')
      console.log(`   Would sync ${conversations.length} conversations`)
      
      // For now, just return success
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
    syncConversationsToDrive
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}
