import { CONFIG } from '../../utils/config'
import { getUserInfo } from './auth'
import { validateTextBeforeAI } from './validation'
import apiClient from './client'

/**
 * Rewrite text using AI
 * Uses request deduplication to prevent duplicate concurrent requests
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
    
    // Use deduplicated request to prevent duplicate concurrent rewrite calls
    const { data } = await apiClient.postDeduplicated('/rewrite', {
      profile_id: profileId,
      text: text,
      model: model,
      writing_preferences: writingPreferences,
      text_stats: validation.stats
    })
    
    return { 
      success: data.success, 
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
 * Get auth headers for streaming requests
 */
async function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  }
  
  const authToken = await apiClient.getAuthToken()
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  
  return headers
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
    const headers = await getAuthHeaders()
    console.log('📡 Sending rewrite_stream request...')
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/rewrite_stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        profile_id: profileId,
        text: text,
        model: model,
        writing_preferences: writingPreferences,
        user_id: userInfo?.userId
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
    const { data } = await apiClient.post('/check-humanization', { text })
    
    return { 
      success: data.success, 
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
    
    const { data } = await apiClient.post('/iterative-humanize', {
      profile_id: profileId,
      text: text,
      max_iterations: options.maxIterations || 3,
      target_probability: options.targetProbability || 35,
      model: options.model || 'gemini-2.0-flash-exp'
    })
    
    return { 
      success: data.success, 
      data, 
      error: data.error 
    }
  } catch (error) {
    console.error('Error in iterative humanize:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Start async iterative humanize job
 * @param {string|null} profileId - Profile ID (optional, null for generic humanization)
 * @param {string} text 
 * @param {Object} options - { maxIterations, targetProbability, model, writingPreferences }
 * @returns {Promise<Object>} - { success, jobId, estimatedTime }
 */
export async function startIterativeHumanize(profileId, text, options = {}) {
  try {
    const validation = validateTextBeforeAI(text, options.model || 'gemini-2.0-flash-exp', { task: 'rewrite' })
    if (!validation.valid) {
      return { 
        success: false, 
        error: validation.errors.join(', '),
        validationFailed: true
      }
    }
    
    // Build request body - profile_id is optional
    const requestBody = {
      text: text,
      max_iterations: options.maxIterations || 3,
      target_probability: options.targetProbability || 35,
      model: options.model || 'gemini-2.0-flash-exp',
      writing_preferences: options.writingPreferences || {}
    }
    
    // Only include profile_id if provided
    if (profileId) {
      requestBody.profile_id = profileId
    }
    
    const { data } = await apiClient.post('/analysis/iterative-humanize/start', requestBody)
    
    return { 
      success: data.success, 
      jobId: data.job_id,
      estimatedTime: data.estimated_time,
      error: data.error 
    }
  } catch (error) {
    console.error('Error starting iterative humanize:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get humanize job status
 * @param {string} jobId 
 * @returns {Promise<Object>}
 */
export async function getHumanizeJobStatus(jobId) {
  try {
    const { data } = await apiClient.get(`/analysis/iterative-humanize/status/${jobId}`)
    return { 
      success: data.success, 
      data,
      error: data.error 
    }
  } catch (error) {
    console.error('Error getting humanize job status:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Poll humanize job until completion
 * @param {string} jobId 
 * @param {Object} options - { onProgress, pollInterval, maxWaitTime }
 * @returns {Promise<Object>}
 */
export async function pollHumanizeJob(jobId, options = {}) {
  const { 
    onProgress = () => {}, 
    pollInterval = 2000, 
    maxWaitTime = 300000 // 5 minutes max
  } = options
  
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    const result = await getHumanizeJobStatus(jobId)
    
    if (!result.success) {
      return result
    }
    
    const { data } = result
    
    // Call progress callback
    onProgress({
      status: data.status,
      progress: data.progress,
      jobId: data.job_id
    })
    
    // Check if completed or failed
    if (data.status === 'completed') {
      return {
        success: true,
        data: data.result
      }
    }
    
    if (data.status === 'failed') {
      return {
        success: false,
        error: data.error || 'Job failed'
      }
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }
  
  return {
    success: false,
    error: 'Job timed out'
  }
}

/**
 * Stream humanize job result
 * Streams the completed job result text for smooth UI transition
 * @param {string} jobId 
 * @param {Function} onChunk - Callback for each text chunk
 * @param {Function} onComplete - Callback when streaming completes with metadata
 * @returns {Promise<void>}
 */
export async function streamHumanizeJobResult(jobId, onChunk, onComplete = () => {}) {
  try {
    const headers = await getAuthHeaders()
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/analysis/iterative-humanize/stream/${jobId}`, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        break
      }
      
      buffer += decoder.decode(value, { stream: true })
      
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          
          if (data === '[DONE]') {
            return
          }
          
          if (data) {
            try {
              const json = JSON.parse(data)
              if (json.chunk) {
                onChunk(json.chunk)
              } else if (json.done) {
                // Streaming complete with metadata
                onComplete({
                  iterationsUsed: json.iterations_used,
                  finalAIProbability: json.final_ai_probability,
                  reachedTarget: json.reached_target,
                  creditsUsed: json.credits_used
                })
              } else if (json.error) {
                throw new Error(json.error)
              }
            } catch (e) {
              if (e.message !== 'Unexpected end of JSON input') {
                console.warn('[WARNING] Failed to parse JSON:', data, e)
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('[FAIL] Error streaming humanize result:', error)
    throw error
  }
}

/**
 * Poll humanize job and stream result when completed
 * Combines polling for progress with streaming for final result
 * @param {string} jobId 
 * @param {Object} options - { onProgress, onChunk, onComplete, pollInterval, maxWaitTime }
 * @returns {Promise<Object>}
 */
export async function pollAndStreamHumanizeJob(jobId, options = {}) {
  const { 
    onProgress = () => {}, 
    onChunk = () => {},
    onComplete = () => {},
    pollInterval = 2000, 
    maxWaitTime = 300000
  } = options
  
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    const result = await getHumanizeJobStatus(jobId)
    
    if (!result.success) {
      return result
    }
    
    const { data } = result
    
    onProgress({
      status: data.status,
      progress: data.progress,
      jobId: data.job_id
    })
    
    // When completed, stream the result
    if (data.status === 'completed') {
      try {
        await streamHumanizeJobResult(jobId, onChunk, onComplete)
        return {
          success: true,
          data: data.result,
          streamed: true
        }
      } catch (streamError) {
        console.warn('[WARNING] Streaming failed, falling back to direct result:', streamError)
        // Fallback to direct result if streaming fails
        return {
          success: true,
          data: data.result,
          streamed: false
        }
      }
    }
    
    if (data.status === 'failed') {
      return {
        success: false,
        error: data.error || 'Job failed'
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }
  
  return {
    success: false,
    error: 'Job timed out'
  }
}
