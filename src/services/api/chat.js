import { CONFIG } from '../../utils/config'
import apiClient from './client'
import { getUserInfo } from './auth'

/**
 * Get auth headers for streaming requests
 * Uses getAuthTokenWithType for proper auth type hint
 * Throws error if no valid auth token available
 */
async function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  }
  
  // Get auth token with type hint for backend optimization
  const { token, authType } = await apiClient.getAuthTokenWithType()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    if (authType) {
      headers['X-Auth-Type'] = authType
    }
  } else {
    // No token available - dispatch session expired event
    console.error('[CHAT] No auth token available')
    window.dispatchEvent(new CustomEvent('sessionExpired', {
      detail: { message: 'Please sign in to continue.' }
    }))
    throw new Error('Unauthorized access')
  }
  
  return headers
}

/**
 * Error codes and messages mapping
 */
const ERROR_MESSAGES = {
  QUOTA_EXCEEDED: 'API quota exceeded. Please try again in a few minutes.',
  RATE_LIMITED: 'Too many requests. Please slow down.',
  INVALID_INPUT: 'Invalid input. Please check your message.',
  CONTENT_BLOCKED: 'Content was blocked by safety filters. Please rephrase.',
  MODEL_ERROR: 'AI model error. Try selecting a different model.',
  INTERNAL_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.'
}

/**
 * Format error for display
 * @param {Object|Error} error - Error object
 * @returns {string} - User-friendly error message
 */
function formatErrorMessage(error) {
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code]
  }
  if (error.message) {
    return error.message
  }
  return ERROR_MESSAGES.INTERNAL_ERROR
}

/**
 * Chat streaming - for smooth chat responses
 * @param {Array} messages 
 * @param {string} systemPrompt 
 * @param {string} model 
 * @param {number} temperature 
 * @param {string} profileId 
 * @param {Object} writingPreferences 
 * @param {Function} onChunk - Called for each text chunk
 * @param {Object} [options] - Additional options
 * @param {Function} [options.onContext] - Called when context info received
 * @param {Function} [options.onComplete] - Called when stream completes
 * @param {string} [options.conversationSummary] - Existing conversation summary
 * @returns {Promise<Object>} - { success, summary, error }
 */
export async function sendChatMessageStream(
  messages, 
  systemPrompt, 
  model, 
  temperature, 
  profileId, 
  writingPreferences,
  chatSettings,
  onChunk,
  options = {}
) {
  const { onContext, onComplete, conversationSummary } = options
  
  try {
    console.log('📡 Sending chat stream request...')
    
    const headers = await getAuthHeaders()
    const userInfo = await getUserInfo()
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages,
        systemPrompt,
        model,
        temperature,
        profileId,
        writingPreferences,
        chatSettings,
        conversationSummary,
        user_id: userInfo?.userId
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Handle 401 - session expired
      if (response.status === 401) {
        console.error('[CHAT] 401 Unauthorized - session expired')
        window.dispatchEvent(new CustomEvent('sessionExpired', {
          detail: { message: 'Your session has expired. Please sign in again.' }
        }))
      }
      
      throw {
        code: errorData.code || (response.status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR'),
        message: errorData.error || `HTTP error! status: ${response.status}`,
        retryAfter: errorData.retryAfter
      }
    }
    
    console.log('📡 Response received, starting to read stream...')
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let summary = null
    let outputTokens = 0
    let chunkCount = 0
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        console.log('📡 Stream ended, total chunks received:', chunkCount)
        console.log('📡 Remaining buffer:', buffer)
        break
      }
      
      // Decode chunk and add to buffer
      const decoded = decoder.decode(value, { stream: true })
      buffer += decoded
      console.log('📡 Raw chunk received:', decoded.substring(0, 100))
      
      // Process complete lines
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          
          if (data === '[DONE]') {
            console.log('📡 Received [DONE] signal')
            if (onComplete) {
              onComplete({ summary, outputTokens })
            }
            return { success: true, summary, outputTokens }
          }
          
          if (data) {
            try {
              const json = JSON.parse(data)
              console.log('📡 Parsed JSON type:', json.type || (json.chunk ? 'chunk' : 'unknown'))
              
              // Handle different message types
              if (json.type === 'context' && onContext) {
                onContext(json)
              } else if (json.type === 'complete') {
                summary = json.summary
                outputTokens = json.outputTokens
              } else if (json.chunk) {
                chunkCount++
                onChunk(json.chunk)
              } else if (json.error) {
                console.error('[FAIL] Server error:', json.error)
                throw {
                  code: json.code || 'INTERNAL_ERROR',
                  message: json.error,
                  retryAfter: json.retryAfter
                }
              }
            } catch (e) {
              if (e.code) throw e // Re-throw formatted errors
              console.warn('[WARNING] Failed to parse JSON:', data, e)
            }
          }
        }
      }
    }
    
    return { success: true, summary, outputTokens }
  } catch (error) {
    console.error('[FAIL] Error streaming chat:', error)
    const errorMessage = formatErrorMessage(error)
    throw new Error(errorMessage)
  }
}

/**
 * Send chat message (non-streaming)
 * @param {Array} messages 
 * @param {string} systemPrompt 
 * @param {string} model 
 * @param {number} temperature 
 * @param {string} profileId 
 * @param {Object} writingPreferences 
 * @param {string} conversationSummary
 * @returns {Promise<Object>}
 */
export async function sendChatMessage(
  messages, 
  systemPrompt, 
  model = 'gemini-2.5-flash', 
  temperature = 0.7, 
  profileId = null, 
  writingPreferences = null,
  conversationSummary = null
) {
  try {
    const { data } = await apiClient.post('/api/chat', {
      messages,
      systemPrompt,
      model,
      temperature,
      profileId,
      writingPreferences,
      conversationSummary
    })
    
    return data
  } catch (error) {
    console.error('[FAIL] Error sending chat:', error)
    throw new Error(formatErrorMessage(error))
  }
}

/**
 * Upload file for chat
 * @param {string} base64Data - Base64 encoded file data
 * @param {string} mimeType - File MIME type
 * @param {string} fileName - File name
 * @returns {Promise<Object>}
 */
export async function uploadChatFile(base64Data, mimeType, fileName) {
  try {
    const { data } = await apiClient.post('/api/chat/upload', {
      file: base64Data,
      mimeType,
      fileName
    })
    
    return data
  } catch (error) {
    console.error('[FAIL] Error uploading file:', error)
    throw new Error(formatErrorMessage(error))
  }
}

/**
 * Summarize conversation
 * @param {Array} messages - Messages to summarize
 * @returns {Promise<Object>}
 */
export async function summarizeConversation(messages) {
  try {
    const { data } = await apiClient.post('/api/chat/summarize', { messages })
    return data
  } catch (error) {
    console.error('[FAIL] Error summarizing:', error)
    throw new Error(formatErrorMessage(error))
  }
}

/**
 * Estimate tokens for text
 * @param {string} text - Text to estimate
 * @returns {number} - Estimated token count
 */
export function estimateTokens(text) {
  if (!text) return 0
  const charCount = text.length
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length
  const charBasedEstimate = Math.ceil(charCount / 3.5)
  const wordBasedEstimate = Math.ceil(wordCount * 1.3)
  return Math.ceil((charBasedEstimate + wordBasedEstimate) / 2)
}

/**
 * Send humanized chat message (streaming)
 * Uses voice profile to make AI responses match user's writing style
 * @param {Array} messages 
 * @param {string} systemPrompt 
 * @param {string} model 
 * @param {number} temperature 
 * @param {string} profileId 
 * @param {Object} writingPreferences 
 * @param {Object} chatSettings - Humanization settings
 * @param {Function} onChunk 
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function sendHumanizedChatStream(
  messages, 
  systemPrompt, 
  model, 
  temperature, 
  profileId, 
  writingPreferences,
  chatSettings,
  onChunk,
  options = {}
) {
  const { onContext, onComplete, onHumanized, onHumanizing, conversationSummary } = options
  
  try {
    console.log('📡 Sending humanized chat stream request...')
    
    const headers = await getAuthHeaders()
    const userInfo = await getUserInfo()
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/chat/humanized/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages,
        systemPrompt,
        model,
        temperature,
        profileId,
        writingPreferences,
        chatSettings,
        conversationSummary,
        user_id: userInfo?.userId
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        code: errorData.code || 'INTERNAL_ERROR',
        message: errorData.error || `HTTP error! status: ${response.status}`,
        retryAfter: errorData.retryAfter
      }
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let summary = null
    let outputTokens = 0
    let humanizationResult = null
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          
          if (data === '[DONE]') {
            if (onComplete) {
              onComplete({ summary, outputTokens, humanization: humanizationResult })
            }
            return { success: true, summary, outputTokens, humanization: humanizationResult }
          }
          
          if (data) {
            try {
              const json = JSON.parse(data)
              
              if (json.type === 'context' && onContext) {
                onContext(json)
              } else if (json.type === 'humanizing' && onHumanizing) {
                // Humanization in progress
                onHumanizing(json)
              } else if (json.type === 'humanized' && onHumanized) {
                // Received fully humanized text
                onHumanized(json.text)
              } else if (json.type === 'complete') {
                summary = json.summary
                outputTokens = json.outputTokens
                humanizationResult = json.humanization
              } else if (json.chunk) {
                onChunk(json.chunk)
              } else if (json.error) {
                throw {
                  code: json.code || 'INTERNAL_ERROR',
                  message: json.error,
                  retryAfter: json.retryAfter
                }
              }
            } catch (e) {
              if (e.code) throw e
              console.warn('[WARNING] Failed to parse JSON:', data, e)
            }
          }
        }
      }
    }
    
    return { success: true, summary, outputTokens, humanization: humanizationResult }
  } catch (error) {
    console.error('[FAIL] Error streaming humanized chat:', error)
    throw new Error(formatErrorMessage(error))
  }
}
