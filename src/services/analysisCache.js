/**
 * Analysis Cache Service
 * Store AI analysis results to avoid repeated API calls
 */

import { logger } from '../utils/logger'

// Create simple hash from text
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(36)
}

// Cache structure: { noteId: { textHash: { type: 'detect', result: {...}, timestamp: ... } } }
const CACHE_KEY = 'ai_analysis_cache'
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days

// Load cache from localStorage
function loadCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return {}
    
    const cache = JSON.parse(cached)
    
    // Clean expired entries
    const now = Date.now()
    Object.keys(cache).forEach(noteId => {
      Object.keys(cache[noteId]).forEach(textHash => {
        Object.keys(cache[noteId][textHash]).forEach(type => {
          const entry = cache[noteId][textHash][type]
          if (now - entry.timestamp > CACHE_EXPIRY) {
            delete cache[noteId][textHash][type]
          }
        })
        // Remove empty textHash
        if (Object.keys(cache[noteId][textHash]).length === 0) {
          delete cache[noteId][textHash]
        }
      })
      // Remove empty noteId
      if (Object.keys(cache[noteId]).length === 0) {
        delete cache[noteId]
      }
    })
    
    return cache
  } catch (error) {
    logger.error('Cache', 'Error loading analysis cache', error)
    return {}
  }
}

// Save cache to localStorage
function saveCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    logger.error('Cache', 'Error saving analysis cache', error)
  }
}

/**
 * Get cached analysis result
 * @param {string} noteId - Note ID
 * @param {string} text - Text content
 * @param {string} type - Analysis type ('detect', 'analyze', 'rewrite', etc.)
 * @returns {object|null} Cached result or null
 */
export function getCachedAnalysis(noteId, text, type) {
  if (!noteId || !text || !type) return null
  
  const cache = loadCache()
  const textHash = simpleHash(text)
  
  const result = cache[noteId]?.[textHash]?.[type]
  
  return result ? result.data : null
}

/**
 * Save analysis result to cache
 * @param {string} noteId - Note ID
 * @param {string} text - Text content
 * @param {string} type - Analysis type
 * @param {object} data - Analysis result data
 */
export function setCachedAnalysis(noteId, text, type, data) {
  if (!noteId || !text || !type || !data) return
  
  const cache = loadCache()
  const textHash = simpleHash(text)
  
  if (!cache[noteId]) {
    cache[noteId] = {}
  }
  
  if (!cache[noteId][textHash]) {
    cache[noteId][textHash] = {}
  }
  
  cache[noteId][textHash][type] = {
    data,
    timestamp: Date.now()
  }
  
  saveCache(cache)
}

/**
 * Check if text has changed since last analysis
 * @param {string} noteId - Note ID
 * @param {string} text - Current text content
 * @param {string} type - Analysis type
 * @returns {boolean} True if text has changed
 */
export function hasTextChanged(noteId, text, type) {
  if (!noteId || !text || !type) return true
  
  const cache = loadCache()
  const textHash = simpleHash(text)
  
  // If no cache exists for this note/text/type, text has "changed"
  return !cache[noteId]?.[textHash]?.[type]
}

/**
 * Get the latest analysis result for a note (regardless of text content)
 * This allows showing previous results even when text has changed
 * @param {string} noteId - Note ID
 * @param {string} type - Analysis type
 * @returns {object|null} Latest cached result with metadata or null
 */
export function getLatestAnalysis(noteId, type) {
  if (!noteId || !type) return null
  
  const cache = loadCache()
  const noteCache = cache[noteId]
  if (!noteCache) return null
  
  let latestResult = null
  let latestTimestamp = 0
  let latestTextHash = null
  
  // Find the most recent analysis of this type for this note
  Object.entries(noteCache).forEach(([textHash, textCache]) => {
    const entry = textCache[type]
    if (entry && entry.timestamp > latestTimestamp) {
      latestTimestamp = entry.timestamp
      latestResult = entry.data
      latestTextHash = textHash
    }
  })
  
  if (!latestResult) return null
  
  return {
    data: latestResult,
    timestamp: latestTimestamp,
    textHash: latestTextHash
  }
}

/**
 * Check if current text matches the cached analysis
 * @param {string} noteId - Note ID
 * @param {string} text - Current text content
 * @param {string} type - Analysis type
 * @returns {object} { hasCache: boolean, isStale: boolean, data: object|null }
 */
export function getAnalysisStatus(noteId, text, type) {
  if (!noteId || !type) {
    return { hasCache: false, isStale: true, data: null }
  }
  
  const cache = loadCache()
  const textHash = text ? simpleHash(text) : null
  
  // Check if exact match exists
  const exactMatch = textHash ? cache[noteId]?.[textHash]?.[type] : null
  if (exactMatch) {
    return { hasCache: true, isStale: false, data: exactMatch.data }
  }
  
  // Get latest analysis for this note
  const latest = getLatestAnalysis(noteId, type)
  if (latest) {
    return { hasCache: true, isStale: true, data: latest.data }
  }
  
  return { hasCache: false, isStale: true, data: null }
}

/**
 * Clear cache for a specific note
 * @param {string} noteId - Note ID
 */
export function clearNoteCache(noteId) {
  if (!noteId) return
  
  const cache = loadCache()
  delete cache[noteId]
  saveCache(cache)
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  localStorage.removeItem(CACHE_KEY)
}

/**
 * Get cache statistics
 * @returns {object} Cache stats
 */
export function getCacheStats() {
  const cache = loadCache()
  let totalEntries = 0
  const noteCount = Object.keys(cache).length
  
  Object.values(cache).forEach(noteCache => {
    Object.values(noteCache).forEach(textCache => {
      totalEntries += Object.keys(textCache).length
    })
  })
  
  return {
    noteCount,
    totalEntries,
    size: new Blob([JSON.stringify(cache)]).size
  }
}
