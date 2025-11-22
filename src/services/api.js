import { CONFIG } from '../utils/config'
import { isDevMode, getDefaultTestUser, devLog } from '../utils/devConfig'

// Get user info helper
export async function getUserInfo() {
  // DEV MODE: Sử dụng test user
  if (isDevMode()) {
    const testUser = getDefaultTestUser()
    if (testUser) {
      devLog('Using test user:', testUser.email)
      return testUser
    }
  }
  
  // PRODUCTION: Lấy user thật
  try {
    // Check if running in Chrome extension context
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        const response = await chrome.runtime.sendMessage({ action: 'getUserInfo' })
        if (response && response.email) {
          return {
            userId: response.email,
            email: response.email,
            name: response.name || 'User'
          }
        }
      } catch (chromeError) {
        console.log('Chrome extension context not available, using localStorage')
      }
    }
  } catch (error) {
    console.error('Error getting user info:', error)
  }
  
  // Fallback to localStorage (for web app mode)
  try {
    let userId = localStorage.getItem('userId')
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
      localStorage.setItem('userId', userId)
    }
    return {
      userId: userId,
      email: userId + '@local',
      name: 'Local User'
    }
  } catch (storageError) {
    // If localStorage also fails, generate temporary ID
    console.warn('localStorage not available, using temporary ID')
    const tempId = 'temp_' + Date.now()
    return {
      userId: tempId,
      email: tempId + '@temp',
      name: 'Temporary User'
    }
  }
}

// Profile API calls
export async function loadProfiles() {
  try {
    const userInfo = await getUserInfo()
    console.log('📋 Loading profiles for user:', userInfo.userId)
    
    const url = `${CONFIG.API_BASE_URL}/get_profiles?user_id=${userInfo.userId}`
    console.log('🔗 API URL:', url)
    
    const response = await fetch(url)
    const data = await response.json()
    
    console.log('📦 API Response:', data)
    
    if (response.ok && data.success) {
      console.log('✅ Loaded profiles:', data.profiles?.length || 0)
      return data.profiles || []
    }
    console.warn('⚠️ API returned error:', data)
    return []
  } catch (error) {
    console.error('❌ Error loading profiles:', error)
    return []
  }
}

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

// Analysis API calls
export async function analyzeText(profileId, text) {
  try {
    const userInfo = await getUserInfo()
    const response = await fetch(`${CONFIG.API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_id: profileId,
        text: text,
        user_id: userInfo.userId
      })
    })
    
    const data = await response.json()
    return { success: response.ok && data.success, data, error: data.error }
  } catch (error) {
    console.error('Error analyzing text:', error)
    return { success: false, error: error.message }
  }
}

export async function detectAI(text) {
  try {
    const userInfo = await getUserInfo()
    const response = await fetch(`${CONFIG.API_BASE_URL}/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        user_id: userInfo.userId
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Backend returns ai_probability directly in response
    return { 
      success: data.success, 
      data: {
        ai_probability: data.ai_probability,
        evidence: data.evidence,
        verdict: data.verdict
      }, 
      error: data.error 
    }
  } catch (error) {
    console.error('Error detecting AI:', error)
    return { success: false, error: error.message }
  }
}

export async function rewriteText(profileId, text) {
  try {
    const userInfo = await getUserInfo()
    const response = await fetch(`${CONFIG.API_BASE_URL}/rewrite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_id: profileId,
        text: text,
        user_id: userInfo.userId
      })
    })
    
    const data = await response.json()
    return { success: response.ok && data.success, data, error: data.error }
  } catch (error) {
    console.error('Error rewriting text:', error)
    return { success: false, error: error.message }
  }
}

// Streaming rewrite with model selection
export async function rewriteTextStream(profileId, text, model, onChunk) {
  try {
    const userInfo = await getUserInfo()
    const response = await fetch(`${CONFIG.API_BASE_URL}/rewrite_stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_id: profileId,
        text: text,
        model: model,
        user_id: userInfo.userId
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break
      
      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            return
          }
          try {
            const json = JSON.parse(data)
            if (json.chunk) {
              onChunk(json.chunk)
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error('Error streaming rewrite:', error)
    throw error
  }
}

// Profile Setup API calls
export async function createProfile(profileName, theme = 'work') {
  try {
    const userInfo = await getUserInfo()
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

export async function addSamplesBatch(profileId, samples) {
  try {
    console.log(`📦 Uploading ${samples.length} samples in batch...`)
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
      console.log(`✅ Batch upload successful: ${data.samples_added} samples`)
      return data
    }
    throw new Error(data.error || 'Failed to add samples batch')
  } catch (error) {
    console.error('Error adding samples batch:', error)
    throw error
  }
}

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

export async function getProfileDetails(profileId) {
  try {
    console.log('📋 Loading profile details for:', profileId)
    
    const url = `${CONFIG.API_BASE_URL}/get_profile?profile_id=${profileId}`
    console.log('🔗 API URL:', url)
    
    const response = await fetch(url)
    const data = await response.json()
    
    console.log('📦 Profile Details Response:', data)
    
    if (response.ok && data.success) {
      console.log('✅ Loaded profile details')
      return data.profile
    }
    throw new Error(data.error || 'Failed to load profile details')
  } catch (error) {
    console.error('❌ Error loading profile details:', error)
    throw error
  }
}

// Suggestion API - NEW
export async function getSuggestions(profileId, sentence, sentenceScore, context = {}) {
  try {
    console.log('💡 Getting suggestions for sentence...')
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/suggest_improvements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_id: profileId,
        sentence: sentence,
        sentence_score: sentenceScore,
        context: context
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      console.log(`✅ Got ${data.suggestions?.length || 0} suggestions`)
      return { success: true, data }
    }
    
    throw new Error(data.error || 'Failed to get suggestions')
  } catch (error) {
    console.error('❌ Error getting suggestions:', error)
    return { success: false, error: error.message }
  }
}

// ============================================================================
// OPTIMIZED APIs - Cost-efficient versions
// ============================================================================

// In-memory cache for embeddings (client-side)
const embeddingCache = new Map()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

function getCacheKey(text) {
  // Simple hash function for cache key
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

function getCachedData(key) {
  const cached = embeddingCache.get(key)
  if (!cached) return null
  
  const now = Date.now()
  if (now - cached.timestamp > CACHE_TTL) {
    embeddingCache.delete(key)
    return null
  }
  
  return cached.data
}

function setCachedData(key, data) {
  embeddingCache.set(key, {
    data,
    timestamp: Date.now()
  })
}

// Optimized analyze - with client-side caching
export async function analyzeTextOptimized(profileId, text) {
  try {
    // Check cache first
    const cacheKey = `analyze_${profileId}_${getCacheKey(text)}`
    const cached = getCachedData(cacheKey)
    
    if (cached) {
      console.log('⚡ Using cached analysis result')
      return { success: true, data: cached }
    }
    
    const userInfo = await getUserInfo()
    const response = await fetch(`${CONFIG.API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_id: profileId,
        text: text,
        user_id: userInfo.userId,
        use_cache: true // Tell backend to use cache
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      // Cache the result
      setCachedData(cacheKey, data)
      return { success: true, data }
    }
    
    return { success: false, error: data.error }
  } catch (error) {
    console.error('Error analyzing text:', error)
    return { success: false, error: error.message }
  }
}

// Optimized suggestions - only for deviant sentences
export async function getSuggestionsOptimized(profileId, sentence, sentenceScore) {
  try {
    // Only fetch suggestions if sentence is deviant (score < 0.6)
    if (sentenceScore >= 0.6) {
      return {
        success: true,
        data: {
          suggestions: [],
          rewritten: sentence,
          confidence: 100
        }
      }
    }
    
    // Check cache
    const cacheKey = `suggest_${profileId}_${getCacheKey(sentence)}`
    const cached = getCachedData(cacheKey)
    
    if (cached) {
      console.log('⚡ Using cached suggestions')
      return { success: true, data: cached }
    }
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/suggest_improvements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_id: profileId,
        sentence: sentence,
        sentence_score: sentenceScore,
        lightweight: true // Request lightweight response
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      // Cache the result
      setCachedData(cacheKey, data)
      return { success: true, data }
    }
    
    throw new Error(data.error || 'Failed to get suggestions')
  } catch (error) {
    console.error('❌ Error getting suggestions:', error)
    return { success: false, error: error.message }
  }
}

// Batch analyze - for multiple texts efficiently
export async function analyzeTextBatch(profileId, texts) {
  try {
    const userInfo = await getUserInfo()
    const response = await fetch(`${CONFIG.API_BASE_URL}/analyze_batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_id: profileId,
        texts: texts,
        user_id: userInfo.userId
      })
    })
    
    const data = await response.json()
    return { success: response.ok && data.success, data, error: data.error }
  } catch (error) {
    console.error('Error batch analyzing:', error)
    return { success: false, error: error.message }
  }
}
