import { CONFIG } from '../../utils/config'
import { getUserInfo } from './auth'
import { handleError, ProfileError, NetworkError } from '../../utils/errors'
import { perfMonitor, apiTracker } from '../../utils/monitoring'
import apiClient from './client'

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
 * Load all profiles for current user
 * @returns {Promise<Array>}
 */
export async function loadProfiles() {
  const endpoint = 'profiles'
  perfMonitor.start(endpoint)
  
  try {
    const userInfo = await getUserInfo()
    
    // Don't make API call if user is not authenticated
    if (!userInfo || !userInfo.userId) {
      console.log('[INFO] No authenticated user, skipping profile load')
      perfMonitor.end(endpoint)
      return []
    }
    
    console.log('📋 Loading profiles for user:', userInfo.userId)
    
    // Use new endpoint instead of deprecated /get_profiles
    const { data } = await apiClient.get(`/profiles?user_id=${userInfo.userId}`)
    
    if (!data.success) {
      throw new ProfileError(data.error || 'Failed to load profiles')
    }
    
    const duration = perfMonitor.end(endpoint)
    apiTracker.trackCall(endpoint, duration, { userId: userInfo.userId })
    
    console.log('[SUCCESS] Loaded profiles:', data.profiles?.length || 0)
    return data.profiles || []
  } catch (error) {
    perfMonitor.end(endpoint)
    apiTracker.trackError(endpoint, error)
    console.error('[FAIL] Error loading profiles:', error)
    return []
  }
}

/**
 * Delete a profile
 * @param {string} profileId 
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteProfile(profileId) {
  try {
    const { data } = await apiClient.post('/delete_profile', { profile_id: profileId })
    return { success: data.success, error: data.error }
  } catch (error) {
    console.error('Error deleting profile:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get profile details
 * @param {string} profileId 
 * @returns {Promise<Object>}
 */
export async function getProfileDetails(profileId) {
  try {
    console.log('📋 Loading profile details for:', profileId)
    
    const { data } = await apiClient.get(`/get_profile?profile_id=${profileId}`)
    
    console.log('[PACKAGE] Profile Details Response:', data)
    
    if (data.success) {
      console.log('[SUCCESS] Loaded profile details')
      return data.profile
    }
    throw new Error(data.error || 'Failed to load profile details')
  } catch (error) {
    console.error('[FAIL] Error loading profile details:', error)
    throw error
  }
}

/**
 * Create a new profile
 * @param {string} profileName 
 * @param {string} theme 
 * @returns {Promise<Object>}
 */
export async function createProfile(profileName, theme = 'work') {
  try {
    const userInfo = await getUserInfo()
    
    if (!userInfo || !userInfo.userId) {
      throw new Error('User not authenticated')
    }
    
    const { data } = await apiClient.post('/create_profile', {
      profile_name: profileName,
      email: userInfo.email,
      name: userInfo.name,
      theme: theme
    })
    
    if (data.success) {
      return data
    }
    throw new Error(data.error || 'Failed to create profile')
  } catch (error) {
    console.error('Error creating profile:', error)
    throw error
  }
}

/**
 * Add a single sample to profile
 * @param {string} profileId 
 * @param {string} text 
 * @returns {Promise<Object>}
 */
export async function addSample(profileId, text) {
  try {
    const { data } = await apiClient.post('/add_sample', {
      profile_id: profileId,
      text: text
    })
    
    if (data.success) {
      return data
    }
    throw new Error(data.error || 'Failed to add sample')
  } catch (error) {
    console.error('Error adding sample:', error)
    throw error
  }
}

/**
 * Add multiple samples in batch
 * @param {string} profileId 
 * @param {Array<string>} samples 
 * @returns {Promise<Object>}
 */
export async function addSamplesBatch(profileId, samples) {
  try {
    console.log(`[PACKAGE] Uploading ${samples.length} samples in batch...`)
    
    const { data } = await apiClient.post('/add_samples_batch', {
      profile_id: profileId,
      samples: samples
    })
    
    if (data.success) {
      console.log(`[SUCCESS] Batch upload successful: ${data.samples_added} samples`)
      return data
    }
    throw new Error(data.error || 'Failed to add samples batch')
  } catch (error) {
    console.error('Error adding samples batch:', error)
    throw error
  }
}

/**
 * Finalize profile after adding samples
 * @param {string} profileId 
 * @returns {Promise<Object>}
 */
export async function finalizeProfile(profileId) {
  try {
    const { data } = await apiClient.post('/finalize_profile', {
      profile_id: profileId
    })
    
    if (data.success) {
      return data
    }
    throw new Error(data.error || 'Failed to finalize profile')
  } catch (error) {
    console.error('Error finalizing profile:', error)
    throw error
  }
}

/**
 * Create profile with all data in one call (optimized flow)
 * Uses request deduplication to prevent duplicate concurrent requests
 * @param {string} profileName 
 * @param {string} theme 
 * @param {Array<{text: string, type: string}>} samples 
 * @param {Object} options 
 * @returns {Promise<Object>}
 */
export async function createProfileComplete(profileName, theme, samples, options = {}) {
  try {
    const userInfo = await getUserInfo()
    
    if (!userInfo || !userInfo.userId) {
      console.error('[PROFILE] User not authenticated - userInfo:', userInfo)
      throw new Error('User not authenticated')
    }
    
    console.log(`[PACKAGE] Creating complete profile with ${samples.length} samples...`)
    console.log('[PACKAGE] User info:', { userId: userInfo.userId, email: userInfo.email })
    console.log('[PACKAGE] Request data:', { 
      profile_name: profileName, 
      theme, 
      samplesCount: samples.length,
      sampleTypes: samples.map(s => s?.type || 'unknown')
    })
    
    // Use deduplicated request to prevent duplicate concurrent profile creation
    // This is critical to prevent multiple credits being deducted
    const { data } = await apiClient.postDeduplicated('/create_profile_complete', {
      profile_name: profileName,
      email: userInfo.email,
      name: userInfo.name,
      theme: theme,
      samples: samples
    }, {
      signal: options.signal
    })
    
    if (data.success) {
      console.log(`[SUCCESS] Profile created successfully: ${data.profile_id}`)
      return data
    }
    throw new Error(data.error || 'Failed to create profile')
  } catch (error) {
    // Re-throw AbortError for proper handling
    if (error.name === 'AbortError') {
      throw error
    }
    console.error('Error creating complete profile:', error)
    throw error
  }
}

/**
 * Create profile with streaming progress and reasoning
 * @param {string} profileName 
 * @param {string} theme 
 * @param {Array<{text: string, type: string}>} samples 
 * @param {Object} callbacks - { onStep, onReasoning, onComplete, onError }
 * @param {Object} options - { signal }
 * @returns {Promise<Object>}
 */
export async function createProfileCompleteStream(profileName, theme, samples, callbacks = {}, options = {}) {
  const { onStep, onReasoning, onComplete, onError } = callbacks
  
  try {
    const userInfo = await getUserInfo()
    
    if (!userInfo || !userInfo.userId) {
      throw new Error('User not authenticated')
    }
    
    console.log(`[STREAM] Creating profile with ${samples.length} samples...`)
    
    const headers = await getAuthHeaders()
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/create_profile_complete/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_id: userInfo.userId,
        profile_name: profileName,
        email: userInfo.email,
        name: userInfo.name,
        theme: theme,
        samples: samples
      }),
      signal: options.signal
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let result = null
    
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
            console.log('[STREAM] Profile creation complete')
            if (result && onComplete) {
              onComplete(result)
            }
            return result
          }
          
          if (data) {
            try {
              const json = JSON.parse(data)
              
              if (json.type === 'step' && onStep) {
                onStep(json.step, json.message)
              } else if (json.type === 'reasoning' && onReasoning) {
                onReasoning(json.content)
              } else if (json.type === 'complete') {
                result = {
                  success: true,
                  profile_id: json.profile_id,
                  status: json.status,
                  samples_count: json.samples_count,
                  quality_score: json.quality_score
                }
              } else if (json.type === 'error') {
                const error = new Error(json.error)
                error.code = json.error_code
                if (onError) {
                  onError(error)
                }
                throw error
              }
            } catch (e) {
              if (e.code) throw e
              console.warn('[STREAM] Failed to parse JSON:', data, e)
            }
          }
        }
      }
    }
    
    return result
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }
    console.error('[STREAM] Error creating profile:', error)
    if (onError) {
      onError(error)
    }
    throw error
  }
}
