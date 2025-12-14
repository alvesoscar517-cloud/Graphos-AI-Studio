import { logger } from '../../utils/logger'
import { CONFIG } from '../../utils/config'
import { getUserInfo } from './auth'
import { handleError, ProfileError, NetworkError } from '../../utils/errors'
import { perfMonitor, apiTracker } from '../../utils/monitoring'
import apiClient from './client'

/**
 * Get auth headers for streaming requests
 * Uses getAuthTokenWithType for proper auth type hint
 */
async function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  }
  
  // Get auth token with type hint for backend optimization
  const { token, authType } = await apiClient.getAuthTokenWithType()
  // Only add Authorization header if token is a valid non-empty string
  if (token && typeof token === 'string' && token.trim()) {
    headers['Authorization'] = `Bearer ${token}`
    if (authType) {
      headers['X-Auth-Type'] = authType
    }
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
    if (!userInfo || !userInfo.userId || typeof userInfo.userId !== 'string') {
      perfMonitor.end(endpoint)
      return []
    }
    
    // Use new endpoint instead of deprecated /get_profiles
    const { data } = await apiClient.get(`/profiles?user_id=${encodeURIComponent(userInfo.userId)}`)
    
    if (!data.success) {
      throw new ProfileError(data.error || 'Failed to load profiles')
    }
    
    const duration = perfMonitor.end(endpoint)
    apiTracker.trackCall(endpoint, duration, { userId: userInfo.userId })
    
    const profiles = data.profiles || []
    logger.log('[API] profiles completed in', duration + 'ms', { count: profiles.length })
    
    return profiles
  } catch (error) {
    perfMonitor.end(endpoint)
    apiTracker.trackError(endpoint, error)
    logger.error('Profile', 'Error loading profiles', error)
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
    logger.error('Profile', 'Error deleting profile', error)
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
    const { data } = await apiClient.get(`/get_profile?profile_id=${profileId}`)
    
    if (data.success) {
      return data.profile
    }
    throw new Error(data.error || 'Failed to load profile details')
  } catch (error) {
    logger.error('Profile', 'Error loading profile details', error)
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
    logger.error('Profile', 'Error creating profile', error)
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
    logger.error('Profile', 'Error adding sample', error)
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
    const { data } = await apiClient.post('/add_samples_batch', {
      profile_id: profileId,
      samples: samples
    })
    
    if (data.success) {
      return data
    }
    throw new Error(data.error || 'Failed to add samples batch')
  } catch (error) {
    logger.error('Profile', 'Error adding samples batch', error)
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
    logger.error('Profile', 'Error finalizing profile', error)
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
      throw new Error('User not authenticated')
    }
    
    // Get current UI language for profile content generation
    const currentLanguage = localStorage.getItem('i18nextLng') || navigator.language?.split('-')[0] || 'en'
    
    // Use deduplicated request to prevent duplicate concurrent profile creation
    // This is critical to prevent multiple credits being deducted
    const { data } = await apiClient.postDeduplicated('/create_profile_complete', {
      profile_name: profileName,
      email: userInfo.email,
      name: userInfo.name,
      theme: theme,
      samples: samples,
      language: currentLanguage
    }, {
      signal: options.signal
    })
    
    if (data.success) {
      return data
    }
    throw new Error(data.error || 'Failed to create profile')
  } catch (error) {
    // Re-throw AbortError for proper handling
    if (error.name === 'AbortError') {
      throw error
    }
    logger.error('Profile', 'Error creating complete profile', error)
    throw error
  }
}

/**
 * Create profile with streaming progress
 * @param {string} profileName 
 * @param {string} theme 
 * @param {Array<{text: string, type: string}>} samples 
 * @param {Object} callbacks - { onStep, onComplete, onError }
 * @param {Object} options - { signal }
 * @returns {Promise<Object>}
 */
export async function createProfileCompleteStream(profileName, theme, samples, callbacks = {}, options = {}) {
  const { onStep, onComplete, onError } = callbacks
  
  try {
    const userInfo = await getUserInfo()
    
    if (!userInfo || !userInfo.userId) {
      throw new Error('User not authenticated')
    }
    

    
    const headers = await getAuthHeaders()
    
    // Get current UI language for profile content generation
    const currentLanguage = localStorage.getItem('i18nextLng') || navigator.language?.split('-')[0] || 'en'
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/create_profile_complete/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_id: userInfo.userId,
        profile_name: profileName,
        email: userInfo.email,
        name: userInfo.name,
        theme: theme,
        samples: samples,
        language: currentLanguage
      }),
      signal: options.signal
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Handle 402 - insufficient credits
      if (response.status === 402) {
        const error = new Error(errorData.error || 'Insufficient credits')
        error.code = 'INSUFFICIENT_CREDITS'
        error.statusCode = 402
        error.required = errorData.required
        error.available = errorData.available
        error.shortfall = errorData.shortfall
        throw error
      }
      
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
              logger.warn('Profile', `Failed to parse JSON: ${data}`)
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
    logger.error('Profile', 'Error creating profile stream', error)
    if (onError) {
      onError(error)
    }
    throw error
  }
}
