import { logger } from '../../utils/logger'
import { CONFIG } from '../../utils/config'
import { getUserInfo } from './auth'
import { validateTextBeforeAI } from './validation'
import { handleError, AnalysisError, NetworkError } from '../../utils/errors'
import { perfMonitor, apiTracker } from '../../utils/monitoring'
import apiClient from './client'

/**
 * Analyze text against a profile
 * Uses request deduplication to prevent duplicate concurrent requests
 * @param {string} profileId 
 * @param {string} text 
 * @param {Object} options 
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function analyzeText(profileId, text, options = {}) {
  const endpoint = 'analyze'
  perfMonitor.start(endpoint)
  
  // Validate profileId
  if (!profileId) {
    logger.error('Analysis', 'analyzeText: profileId is missing or undefined!')
    throw new AnalysisError('Profile ID is required for analysis')
  }
  
  try {
    // Validate text before sending
    const validation = validateTextBeforeAI(text, 'gemini-2.5-flash', { task: 'analyze' })
    if (!validation.valid) {
      throw new AnalysisError(validation.errors.join(', '), { stats: validation.stats })
    }
    
    if (validation.warnings.length > 0) {
      logger.warn('Analysis', `Warnings: ${validation.warnings.join(', ')}`)
    }
    
    // Get language from localStorage for localized responses
    const lang = localStorage.getItem('i18nextLng') || 'en'
    
    const requestPayload = {
      profile_id: profileId,
      text: text,
      text_stats: validation.stats,
      language: lang.substring(0, 2)
    }
    
    // Use deduplicated request to prevent duplicate concurrent analysis calls
    const { data } = await apiClient.postDeduplicated('/analyze', requestPayload)
    
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
 * Uses request deduplication to prevent duplicate concurrent requests
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
    
    // Get language from parameter, localStorage, or default to 'en'
    const lang = language || localStorage.getItem('i18nextLng') || 'en'
    
    const requestBody = {
      text: text,
      text_stats: validation.stats,
      enhanced: enhanced,
      language: lang.substring(0, 2)
    }
    
    // Use deduplicated request to prevent duplicate concurrent AI detection calls
    const { data } = await apiClient.postDeduplicated('/authenticate', requestBody)
    
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
    logger.error('Analysis', 'Error detecting AI', error)
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
    const { data } = await apiClient.post('/suggest_improvements', {
      profile_id: profileId,
      sentence: sentence,
      sentence_score: sentenceScore,
      context: context
    })
    
    if (data.success) {
      return { success: true, data }
    }
    
    throw new Error(data.error || 'Failed to get suggestions')
  } catch (error) {
    logger.error('Analysis', 'Error getting suggestions', error)
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
    const { data } = await apiClient.post('/analyze_batch', {
      profile_id: profileId,
      texts: texts
    })
    
    return { success: data.success, data, error: data.error }
  } catch (error) {
    logger.error('Analysis', 'Error batch analyzing', error)
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
      return { success: true, data: cached }
    }
    
    const { data } = await apiClient.post('/analyze', {
      profile_id: profileId,
      text: text,
      use_cache: true
    })
    
    if (data.success) {
      // Cache the result
      setCachedData(cacheKey, data)
      return { success: true, data }
    }
    
    return { success: false, error: data.error }
  } catch (error) {
    logger.error('Analysis', 'Error analyzing text', error)
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
      return { success: true, data: cached }
    }
    
    const { data } = await apiClient.post('/suggest_improvements', {
      profile_id: profileId,
      sentence: sentence,
      sentence_score: sentenceScore,
      lightweight: true
    })
    
    if (data.success) {
      // Cache the result
      setCachedData(cacheKey, data)
      return { success: true, data }
    }
    
    throw new Error(data.error || 'Failed to get suggestions')
  } catch (error) {
    logger.error('Analysis', 'Error getting suggestions', error)
    return { success: false, error: error.message }
  }
}
