/**
 * Analysis Cache Service
 * Lưu trữ kết quả phân tích AI để tránh gọi API lặp lại
 */

// Tạo hash đơn giản từ text
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
    console.error('Error loading analysis cache:', error)
    return {}
  }
}

// Save cache to localStorage
function saveCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('Error saving analysis cache:', error)
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
  
  if (result) {
    console.log(`✅ Cache hit for ${type} on note ${noteId}`)
    return result.data
  }
  
  console.log(`❌ Cache miss for ${type} on note ${noteId}`)
  return null
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
  console.log(`💾 Cached ${type} result for note ${noteId}`)
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
 * Clear cache for a specific note
 * @param {string} noteId - Note ID
 */
export function clearNoteCache(noteId) {
  if (!noteId) return
  
  const cache = loadCache()
  delete cache[noteId]
  saveCache(cache)
  console.log(`🗑️ Cleared cache for note ${noteId}`)
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  localStorage.removeItem(CACHE_KEY)
  console.log('🗑️ Cleared all analysis cache')
}

/**
 * Get cache statistics
 * @returns {object} Cache stats
 */
export function getCacheStats() {
  const cache = loadCache()
  let totalEntries = 0
  let noteCount = Object.keys(cache).length
  
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
