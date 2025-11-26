/**
 * Token Utilities
 * Estimate tokens and manage text limits for AI features
 * 
 * COST OPTIMIZATION:
 * - Don't call API to count tokens (costs credits)
 * - Use estimation formula based on language
 * - Vietnamese: ~1.5-2 tokens/word (due to diacritics and unicode)
 * - English: ~1.3 tokens/word
 */

// Model limits - Chỉ Gemini models (hệ thống chỉ dùng Gemini)
export const MODEL_LIMITS = {
  // Gemini 2.0 Flash Experimental
  'gemini-2.0-flash-exp': {
    name: 'Gemini 2.0 Flash',
    maxInput: 1048576,
    maxOutput: 8192,
    creditsPerKInput: 0.5,    // 0.5 credits per 1K input tokens
    creditsPerKOutput: 1.0,   // 1 credit per 1K output tokens
    recommendedMaxChars: 80000,
    speed: 'very-fast'
  },
  // Gemini 2.5 Flash Lite - Cheapest
  'gemini-2.5-flash-lite': {
    name: 'Gemini 2.5 Flash Lite',
    maxInput: 1048576,
    maxOutput: 65536,
    creditsPerKInput: 0.3,
    creditsPerKOutput: 0.6,
    recommendedMaxChars: 120000,
    speed: 'fastest'
  },
  // Gemini 2.5 Flash - Recommended
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    maxInput: 1048576,
    maxOutput: 65536,
    creditsPerKInput: 0.5,
    creditsPerKOutput: 1.0,
    recommendedMaxChars: 100000,
    speed: 'fast'
  },
  // Gemini 2.5 Pro - Highest quality
  'gemini-2.5-pro': {
    name: 'Gemini 2.5 Pro',
    maxInput: 1048576,
    maxOutput: 65536,
    creditsPerKInput: 2.0,
    creditsPerKOutput: 4.0,
    recommendedMaxChars: 80000,
    speed: 'slow'
  }
}

// Default model if not specified
const DEFAULT_MODEL = 'gemini-2.5-flash'

/**
 * Detect main language of text (Vietnamese vs English)
 * @param {string} text 
 * @returns {'vi' | 'en' | 'mixed'}
 */
export function detectLanguage(text) {
  if (!text) return 'en'
  
  // Vietnamese diacritics pattern
  const viPattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi
  const viMatches = text.match(viPattern) || []
  
  // Ratio of Vietnamese characters
  const viRatio = viMatches.length / text.length
  
  if (viRatio > 0.05) return 'vi'
  if (viRatio > 0.01) return 'mixed'
  return 'en'
}

/**
 * Ước tính số token từ text
 * Công thức: 
 * - Tiếng Việt: chars / 2.5 (vì unicode + dấu)
 * - Tiếng Anh: chars / 4 (standard)
 * - Mixed: chars / 3
 * 
 * @param {string} text 
 * @returns {number} Estimated tokens
 */
export function estimateTokens(text) {
  if (!text) return 0
  
  const lang = detectLanguage(text)
  const chars = text.length
  
  switch (lang) {
    case 'vi':
      return Math.ceil(chars / 2.5)
    case 'mixed':
      return Math.ceil(chars / 3)
    default:
      return Math.ceil(chars / 4)
  }
}

/**
 * Count words in text
 * @param {string} text 
 * @returns {number}
 */
export function countWords(text) {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

/**
 * Count sentences in text
 * @param {string} text 
 * @returns {number}
 */
export function countSentences(text) {
  if (!text) return 0
  const sentences = text.match(/[^.!?]+[.!?]+/g) || []
  return sentences.length || (text.trim() ? 1 : 0)
}

/**
 * Count estimated A4 pages (250 words/page)
 * @param {string} text 
 * @returns {number}
 */
export function estimatePages(text) {
  const words = countWords(text)
  return Math.ceil(words / 250)
}

/**
 * Lấy thông tin chi tiết về text
 * @param {string} text 
 * @returns {TextStats}
 */
export function getTextStats(text) {
  const chars = text?.length || 0
  const words = countWords(text)
  const sentences = countSentences(text)
  const tokens = estimateTokens(text)
  const pages = estimatePages(text)
  const language = detectLanguage(text)
  
  return {
    chars,
    words,
    sentences,
    tokens,
    pages,
    language,
    // Human readable
    display: formatTextStats({ chars, words, tokens, pages })
  }
}

/**
 * Format stats for display
 */
export function formatTextStats({ chars, words, tokens, pages }) {
  const parts = []
  
  if (chars > 0) {
    parts.push(`${chars.toLocaleString()} ký tự`)
  }
  if (words > 0) {
    parts.push(`${words.toLocaleString()} words`)
  }
  if (tokens > 0) {
    parts.push(`~${tokens.toLocaleString()} tokens`)
  }
  if (pages > 1) {
    parts.push(`~${pages} pages`)
  }
  
  return parts.join(' • ')
}

/**
 * Check if text exceeds model limit
 * @param {string} text 
 * @param {string} model 
 * @returns {ValidationResult}
 */
export function validateTextForModel(text, model = DEFAULT_MODEL) {
  const stats = getTextStats(text)
  const limits = MODEL_LIMITS[model] || MODEL_LIMITS[DEFAULT_MODEL]
  
  const result = {
    valid: true,
    stats,
    model,
    limits,
    warnings: [],
    errors: [],
    recommendation: null
  }
  
  // Check minimum
  if (stats.chars < 10) {
    result.valid = false
    result.errors.push('Content too short (minimum 10 characters)')
    return result
  }
  
  // Check recommended max (soft limit)
  if (stats.chars > limits.recommendedMaxChars) {
    result.warnings.push(`Content is quite long (${stats.pages} pages). Processing may take time.`)
    result.recommendation = 'chunk' // Suggest chunking
  }
  
  // Check hard limit
  if (stats.tokens > limits.maxInput * 0.8) {
    result.valid = false
    result.errors.push(`Nội dung vượt giới hạn model (${stats.tokens.toLocaleString()} tokens)`)
    result.recommendation = 'split'
  }
  
  // Cost warning for expensive models
  if (model.includes('pro') || model.includes('gpt-4o')) {
    const estimatedCost = (stats.tokens / 1000) * limits.costPer1kInput
    if (estimatedCost > 0.01) { // > 1 cent
      result.warnings.push(`Estimated cost: ~$${estimatedCost.toFixed(4)}`)
    }
  }
  
  return result
}

/**
 * Split text into chunks suitable for model
 * @param {string} text 
 * @param {string} model 
 * @param {object} options 
 * @returns {string[]}
 */
export function splitTextForModel(text, model = DEFAULT_MODEL, options = {}) {
  const limits = MODEL_LIMITS[model] || MODEL_LIMITS[DEFAULT_MODEL]
  const maxChars = options.maxChars || limits.recommendedMaxChars
  const overlap = options.overlap || 200 // Overlap to maintain context
  
  if (text.length <= maxChars) {
    return [text]
  }
  
  const chunks = []
  const paragraphs = text.split(/\n\n+/)
  let currentChunk = ''
  
  for (const para of paragraphs) {
    if (currentChunk.length + para.length > maxChars) {
      if (currentChunk) {
        chunks.push(currentChunk.trim())
        // Keep last part for overlap
        const words = currentChunk.split(/\s+/)
        const overlapWords = words.slice(-Math.ceil(overlap / 5))
        currentChunk = overlapWords.join(' ') + '\n\n' + para
      } else {
        // Paragraph itself is too long, split by sentences
        const sentences = para.match(/[^.!?]+[.!?]+/g) || [para]
        for (const sent of sentences) {
          if (currentChunk.length + sent.length > maxChars) {
            if (currentChunk) chunks.push(currentChunk.trim())
            currentChunk = sent
          } else {
            currentChunk += ' ' + sent
          }
        }
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}

/**
 * Recommend suitable model based on text length and requirements
 * @param {string} text 
 * @param {object} options 
 * @returns {ModelRecommendation}
 */
export function recommendModel(text, options = {}) {
  const { 
    priority = 'balanced', // 'cost' | 'quality' | 'speed' | 'balanced'
    task = 'rewrite'       // 'rewrite' | 'analyze' | 'detect' | 'chat'
  } = options
  
  const stats = getTextStats(text)
  
  // Short text (< 5000 chars) - use fast/cheap models
  if (stats.chars < 5000) {
    if (priority === 'quality') {
      return { model: 'gemini-2.5-pro', reason: 'High quality for short text' }
    }
    return { model: 'gemini-2.0-flash', reason: 'Fast and cost-effective for short text' }
  }
  
  // Medium text (5000 - 30000 chars)
  if (stats.chars < 30000) {
    if (priority === 'cost') {
      return { model: 'gemini-2.0-flash', reason: 'Lowest cost' }
    }
    if (priority === 'quality') {
      return { model: 'gemini-2.5-flash', reason: 'Balance between quality and cost' }
    }
    return { model: 'gemini-2.5-flash', reason: 'Suitable for medium-length text' }
  }
  
  // Long text (> 30000 chars) - need large context
  if (priority === 'cost') {
    return { 
      model: 'gemini-2.0-flash', 
      reason: 'Low cost, but should chunk text',
      shouldChunk: true
    }
  }
  
  return { 
    model: 'gemini-2.5-flash', 
    reason: 'Large context window for long text',
    shouldChunk: stats.chars > 100000
  }
}

// ============================================================================
// FEATURE COSTS (synced with backend/src/config/pricing.js)
// ============================================================================

const FEATURE_COSTS = {
  // Detection & Analysis
  'ai_detection': { baseCost: 2, perWordCost: 0.001, maxCost: 10 },
  'text_analysis': { baseCost: 3, perSentenceCost: 0.3, maxCost: 20 },
  'improvement_suggestions': { baseCost: 1, perSentenceCost: 0.5, maxCost: 10 },
  
  // Rewrite & Humanization (reduced costs)
  'text_rewrite': { baseCost: 1.5, perWordCost: 0.0008, maxCost: 12, modelMultiplier: true },
  'iterative_humanize': { baseCost: 3, perIterationCost: 1.5, perWordCost: 0.0008, maxCost: 15 },
  'check_humanization': { baseCost: 1.5, perWordCost: 0.0008, maxCost: 6 },
  
  // Chat
  'chat_message': { baseCost: 1, perWordCost: 0.0008, maxCost: 8, modelMultiplier: true },
  'chat_humanized': { baseCost: 2, perWordCost: 0.001, maxCost: 12, modelMultiplier: true },
  'conversation_summarize': { baseCost: 1, perMessageCost: 0.1, maxCost: 5 },
  
  // Translation
  'translation': { baseCost: 1, perWordCost: 0.001, maxCost: 10 },
  
  // Profile (reduced costs for better onboarding)
  'profile_sample_add': { baseCost: 0.3, perWordCost: 0.0002, maxCost: 1.5 },
  'profile_samples_batch': { baseCost: 0.5, perSampleCost: 0.3, maxCost: 8 },
  'profile_complete': { baseCost: 5, perSampleCost: 0.5, maxCost: 15 },
  'voice_profile_generation': { baseCost: 5, perSampleCost: 0.5, maxCost: 15 },
  
  // File upload
  'file_upload_image': { baseCost: 1, maxCost: 3 }
}

const MODEL_MULTIPLIERS = {
  'gemini-2.0-flash-exp': 1.0,
  'gemini-2.5-flash-lite': 0.8,
  'gemini-2.5-flash': 1.2,
  'gemini-2.5-pro': 3.0
}

/**
 * Calculate estimated credits for a feature
 * @param {string} feature - Feature name
 * @param {object} params - Parameters for calculation
 * @returns {number} Estimated credits
 */
export function calculateFeatureCost(feature, params = {}) {
  const config = FEATURE_COSTS[feature]
  if (!config) return 1 // Default cost
  
  let cost = config.baseCost || 0
  
  // Per-word cost
  if (params.wordCount && config.perWordCost) {
    cost += params.wordCount * config.perWordCost
  }
  
  // Per-sentence cost
  if (params.sentenceCount && config.perSentenceCost) {
    cost += params.sentenceCount * config.perSentenceCost
  }
  
  // Per-sample cost
  if (params.sampleCount && config.perSampleCost) {
    cost += params.sampleCount * config.perSampleCost
  }
  
  // Per-iteration cost
  if (params.iterationCount && config.perIterationCost) {
    cost += params.iterationCount * config.perIterationCost
  }
  
  // Per-message cost
  if (params.messageCount && config.perMessageCost) {
    cost += params.messageCount * config.perMessageCost
  }
  
  // Model multiplier
  if (config.modelMultiplier && params.model) {
    const multiplier = MODEL_MULTIPLIERS[params.model] || 1.0
    cost *= multiplier
  }
  
  // Cap at max cost
  if (config.maxCost) {
    cost = Math.min(cost, config.maxCost)
  }
  
  return Math.round(cost * 100) / 100
}

/**
 * Estimate credits for common operations
 */
export function estimateCreditsForTask(text, task, options = {}) {
  const stats = getTextStats(text)
  
  switch (task) {
    case 'detect':
    case 'ai_detection':
      return calculateFeatureCost('ai_detection', { wordCount: stats.words })
    
    case 'analyze':
    case 'text_analysis':
      return calculateFeatureCost('text_analysis', { sentenceCount: stats.sentences })
    
    case 'rewrite':
    case 'text_rewrite':
      return calculateFeatureCost('text_rewrite', { 
        wordCount: stats.words, 
        model: options.model 
      })
    
    case 'humanize':
    case 'iterative_humanize':
      return calculateFeatureCost('iterative_humanize', { 
        wordCount: stats.words,
        iterationCount: options.maxIterations || 3
      })
    
    case 'check_humanization':
      return calculateFeatureCost('check_humanization', { wordCount: stats.words })
    
    case 'chat':
    case 'chat_message':
      return calculateFeatureCost('chat_message', { 
        wordCount: stats.words, 
        model: options.model 
      })
    
    case 'chat_humanized':
      return calculateFeatureCost('chat_humanized', { 
        wordCount: stats.words, 
        model: options.model 
      })
    
    case 'translate':
    case 'translation':
      return calculateFeatureCost('translation', { wordCount: stats.words })
    
    case 'suggestions':
    case 'improvement_suggestions':
      return calculateFeatureCost('improvement_suggestions', { sentenceCount: 1 })
    
    default:
      return 1
  }
}

/**
 * Calculate estimated credits for a request (legacy function)
 * @param {string} text 
 * @param {string} model 
 * @param {string} task 
 * @returns {CreditsEstimate}
 */
export function estimateCredits(text, model = DEFAULT_MODEL, task = 'rewrite') {
  const stats = getTextStats(text)
  const totalCredits = estimateCreditsForTask(text, task, { model })
  
  return {
    inputTokens: stats.tokens,
    outputTokens: Math.ceil(stats.tokens * 1.1),
    totalCredits,
    display: totalCredits < 0.1 
      ? '< 0.1' 
      : `~${totalCredits.toFixed(1)}`
  }
}

// Export types for documentation
/**
 * @typedef {Object} TextStats
 * @property {number} chars
 * @property {number} words
 * @property {number} sentences
 * @property {number} tokens
 * @property {number} pages
 * @property {string} language
 * @property {string} display
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {TextStats} stats
 * @property {string} model
 * @property {Object} limits
 * @property {string[]} warnings
 * @property {string[]} errors
 * @property {string|null} recommendation
 */

/**
 * @typedef {Object} ModelRecommendation
 * @property {string} model
 * @property {string} reason
 * @property {boolean} [shouldChunk]
 */

/**
 * @typedef {Object} CreditsEstimate
 * @property {number} inputTokens
 * @property {number} outputTokens
 * @property {number} inputCredits
 * @property {number} outputCredits
 * @property {number} totalCredits
 * @property {string} display
 */
