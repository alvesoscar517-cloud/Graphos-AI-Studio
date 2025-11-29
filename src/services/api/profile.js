import { CONFIG } from '../../utils/config'
import { getUserInfo } from './auth'
import { handleError, ProfileError, NetworkError } from '../../utils/errors'
import { perfMonitor, apiTracker } from '../../utils/monitoring'

/**
 * Load all profiles for current user
 * @returns {Promise<Array>}
 */
export async function loadProfiles() {
  const endpoint = 'get_profiles'
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
    
    const url = `${CONFIG.API_BASE_URL}/get_profiles?user_id=${userInfo.userId}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
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
    const response = await fetch(`${CONFIG.API_BASE_URL}/delete_profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ profile_id: profileId })
    })
    
    const data = await response.json()
    return { success: response.ok && data.success, error: data.error }
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
    
    const url = `${CONFIG.API_BASE_URL}/get_profile?profile_id=${profileId}`
    console.log('[LINK] API URL:', url)
    
    const response = await fetch(url)
    const data = await response.json()
    
    console.log('[PACKAGE] Profile Details Response:', data)
    
    if (response.ok && data.success) {
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
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/create_profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userInfo.userId,
        profile_name: profileName,
        email: userInfo.email,
        name: userInfo.name,
        theme: theme
      })
    })
    
    const data = await response.json()
    if (response.ok && data.success) {
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
    const response = await fetch(`${CONFIG.API_BASE_URL}/add_sample`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_id: profileId,
        text: text
      })
    })
    
    const data = await response.json()
    if (response.ok && data.success) {
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
    const response = await fetch(`${CONFIG.API_BASE_URL}/add_samples_batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_id: profileId,
        samples: samples
      })
    })
    
    const data = await response.json()
    if (response.ok && data.success) {
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
    const response = await fetch(`${CONFIG.API_BASE_URL}/finalize_profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_id: profileId
      })
    })
    
    const data = await response.json()
    if (response.ok && data.success) {
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
 * @param {string} profileName 
 * @param {string} theme 
 * @param {Array<string>} samples 
 * @param {Object} options 
 * @returns {Promise<Object>}
 */
export async function createProfileComplete(profileName, theme, samples, options = {}) {
  try {
    const userInfo = await getUserInfo()
    
    if (!userInfo || !userInfo.userId) {
      throw new Error('User not authenticated')
    }
    
    console.log(`[PACKAGE] Creating complete profile with ${samples.length} samples...`)
    
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userInfo.userId,
        profile_name: profileName,
        email: userInfo.email,
        name: userInfo.name,
        theme: theme,
        samples: samples
      })
    }
    
    // Support AbortController signal for cancellation
    if (options.signal) {
      fetchOptions.signal = options.signal
    }
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/create_profile_complete`, fetchOptions)
    
    const data = await response.json()
    if (response.ok && data.success) {
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
