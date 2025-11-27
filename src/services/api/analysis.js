import { CONFIG } from '../../utils/config'
import { getUserInfo } from './auth'
import { validateTextBeforeAI } from './validation'
import { handleError, AnalysisError, NetworkError } from '../../utils/errors'
import { perfMonitor, apiTracker } from '../../utils/monitoring'

/**
 * Analyze text against a profile
 * @param {string} profileId 
 * @param {string} text 
 * @param {Object} options 
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function analyzeText(profileId, text, options = {}) {
  const endpoint = 'analyze'
  perfMonitor.start(endpoint)
  
  try {
    // Validate text before sending
    const validation = validateTextBeforeAI(text, 'gemini-2.5-flash', { task: 'analyze' })
    if (!validation.valid) {
      throw new AnalysisError(validation.errors.join(', '), { stats: validation.stats })
    }
    
    // Log stats for monitoring
    console.log('[CHART] Text stats:', validation.stats.display)
    if (validation.warnings.length > 0) {
      console.warn('[WARNING] Warnings:', validation.warnings)
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
        text_stats: validation.stats
      })
    })
    
    if (!response.ok) {
      throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new AnalysisError(data.error || 'Analysis failed')
    }
    
    const duration = perfMonitor.end(endpoint)
    apiTracker.trackCall(endpoint, duration, { profileId, textLength: text.length })
    
    return { 
      success: true, 
      data, 
      textStats: validation.stats
    }
  } catch (error) {
    perfMonitor.end(endpoint)
    apiTracker.trackError(endpoint, error, { profileId })
    return handleError(error)
  }
}

/**
 * Detect AI-generated content
 * @param {string} text 
 * @param {boolean} enhanced - Use enhanced multi-pass detection (default: true)
 * @param {string} language - Language for verdict (default: from localStorage or 'en')
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function detectAI(text, enhanced = true, language = null) {
  try {
    // Validate text before sending
    const validation = validateTextBeforeAI(text, 'gemini-2.5-flash', { task: 'detect' })
    if (!validation.valid) {
      return { 
        success: false, 
        error: validation.errors.join(', '),
        validationFailed: true,
        stats: validation.stats
      }
    }
    
    console.log('[CHART] AI detection text stats:', validation.stats.display)
    console.log(`[SEARCH] Using ${enhanced ? 'ENHANCED' : 'STANDARD'} detection mode`)
    
    // Get language from parameter, localStorage, or default to 'en'
    const lang = language || localStorage.getItem('i18nextLng') || 'en'
    
    const userInfo = await getUserInfo()
    const response = await fetch(`${CONFIG.API_BASE_URL}/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        user_id: userInfo.userId,
        text_stats: validation.stats,
        enhanced: enhanced,
        language: lang.substring(0, 2) // Only use first 2 chars (e.g., 'en-US' -> 'en')
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    return { 
      success: data.success, 
      data: {
        ai_probability: data.ai_probability,
        confidence: data.confidence,
        evidence: data.evidence,
        human_indicators: data.human_indicators,
        ai_indicators: data.ai_indicators,
        verdict: data.verdict,
        analysis_details: data.analysis_details
      }, 
      error: data.error,
      textStats: validation.stats
    }
  } catch (error) {
    console.error('Error detecting AI:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get suggestions for improving text
 * @param {string} profileId 
 * @param {string} sentence 
 * @param {number} sentenceScore 
 * @param {Object} context 
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
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
      console.log(`[SUCCESS] Got ${data.suggestions?.length || 0} suggestions`)
      return { success: true, data }
    }
    
    throw new Error(data.error || 'Failed to get suggestions')
  } catch (error) {
    console.error('[FAIL] Error getting suggestions:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Batch analyze multiple texts
 * @param {string} profileId 
 * @param {Array<string>} texts 
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
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

// ============================================================================
// OPTIMIZED APIs - Cost-efficient versions with caching
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

/**
 * Optimized analyze with client-side caching
 * @param {string} profileId 
 * @param {string} text 
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
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
        use_cache: true
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

/**
 * Optimized suggestions - only for deviant sentences
 * @param {string} profileId 
 * @param {string} sentence 
 * @param {number} sentenceScore 
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
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
        lightweight: true
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
    console.error('[FAIL] Error getting suggestions:', error)
    return { success: false, error: error.message }
  }
}
