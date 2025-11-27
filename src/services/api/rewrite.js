import { CONFIG } from '../../utils/config'
import { getUserInfo } from './auth'
import { validateTextBeforeAI } from './validation'

/**
 * Rewrite text using AI
 * @param {string} profileId 
 * @param {string} text 
 * @param {string} model 
 * @param {Object} writingPreferences 
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function rewriteText(profileId, text, model = 'gemini-2.5-flash', writingPreferences = null) {
  try {
    // Validate text before sending
    const validation = validateTextBeforeAI(text, model, { task: 'rewrite' })
    if (!validation.valid) {
      return { 
        success: false, 
        error: validation.errors.join(', '),
        validationFailed: true,
        stats: validation.stats
      }
    }
    
    console.log('[CHART] Rewrite text stats:', validation.stats.display)
    
    const userInfo = await getUserInfo()
    const response = await fetch(`${CONFIG.API_BASE_URL}/rewrite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_id: profileId,
        text: text,
        user_id: userInfo.userId,
        model: model,
        writing_preferences: writingPreferences,
        text_stats: validation.stats
      })
    })
    
    const data = await response.json()
    return { 
      success: response.ok && data.success, 
      data, 
      error: data.error,
      textStats: validation.stats
    }
  } catch (error) {
    console.error('Error rewriting text:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Streaming rewrite with model selection
 * @param {string} profileId 
 * @param {string} text 
 * @param {string} model 
 * @param {Object} writingPreferences 
 * @param {Function} onChunk 
 * @returns {Promise<void>}
 */
export async function rewriteTextStream(profileId, text, model, writingPreferences, onChunk) {
  try {
    // Validate text before sending
    const validation = validateTextBeforeAI(text, model, { task: 'rewrite' })
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '))
    }
    
    console.log('[CHART] Stream rewrite text stats:', validation.stats.display)
    
    const userInfo = await getUserInfo()
    console.log('📡 Sending rewrite_stream request...')
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/rewrite_stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_id: profileId,
        text: text,
        model: model,
        writing_preferences: writingPreferences,
        user_id: userInfo.userId
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    console.log('📡 Response received, starting to read stream...')
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        console.log('📡 Stream ended')
        break
      }
      
      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true })
      
      // Process complete lines
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          
          if (data === '[DONE]') {
            console.log('📡 Received [DONE] signal')
            return
          }
          
          if (data) {
            try {
              const json = JSON.parse(data)
              if (json.chunk) {
                console.log('[PACKAGE] Chunk received:', json.chunk.substring(0, 30) + '...')
                onChunk(json.chunk)
              } else if (json.error) {
                console.error('[FAIL] Server error:', json.error)
                throw new Error(json.error)
              }
            } catch (e) {
              console.warn('[WARNING] Failed to parse JSON:', data, e)
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('[FAIL] Error streaming rewrite:', error)
    throw error
  }
}

/**
 * Check humanization - get suggestions to make text more human-like
 * @param {string} text 
 * @returns {Promise<Object>}
 */
export async function checkHumanization(text) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/check-humanization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    })
    
    const data = await response.json()
    return { 
      success: response.ok && data.success, 
      data, 
      error: data.error 
    }
  } catch (error) {
    console.error('Error checking humanization:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Iterative humanize - rewrite with AI detection feedback loop
 * @param {string} profileId 
 * @param {string} text 
 * @param {Object} options - { maxIterations, targetProbability, model }
 * @returns {Promise<Object>}
 */
export async function iterativeHumanize(profileId, text, options = {}) {
  try {
    const validation = validateTextBeforeAI(text, options.model || 'gemini-2.0-flash-exp', { task: 'rewrite' })
    if (!validation.valid) {
      return { 
        success: false, 
        error: validation.errors.join(', '),
        validationFailed: true
      }
    }
    
    const userInfo = await getUserInfo()
    const response = await fetch(`${CONFIG.API_BASE_URL}/iterative-humanize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_id: profileId,
        text: text,
        user_id: userInfo.userId,
        max_iterations: options.maxIterations || 3,
        target_probability: options.targetProbability || 35,
        model: options.model || 'gemini-2.0-flash-exp'
      })
    })
    
    const data = await response.json()
    return { 
      success: response.ok && data.success, 
      data, 
      error: data.error 
    }
  } catch (error) {
    console.error('Error in iterative humanize:', error)
    return { success: false, error: error.message }
  }
}
