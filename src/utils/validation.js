/**
 * Text Validation Utilities
 * Common validation functions for text processing
 */

import { CONFIG } from './config'

/**
 * Validate text input
 * @param {string} text - Text to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export function validateText(text, options = {}) {
  const {
    minLength = 10,
    maxLength = CONFIG?.MAX_TEXT_LENGTH || 100000,
    minWords = 3,
    task = 'analyze'
  } = options

  const errors = []
  const warnings = []

  // Check if text exists
  if (!text || typeof text !== 'string') {
    return {
      valid: false,
      errors: ['Text is required'],
      warnings: [],
      stats: null
    }
  }

  const trimmed = text.trim()
  const stats = calculateTextStats(trimmed)

  // Check minimum length
  if (trimmed.length < minLength) {
    errors.push(`Text must be at least ${minLength} characters (currently ${trimmed.length})`)
  }

  // Check maximum length
  if (trimmed.length > maxLength) {
    errors.push(`Text exceeds maximum length of ${maxLength} characters`)
  }

  // Check minimum words
  if (stats.words < minWords) {
    errors.push(`Text must contain at least ${minWords} words (currently ${stats.words})`)
  }

  // Warnings for short text
  if (task === 'detect' && stats.words < 20) {
    warnings.push('Short text may produce less accurate AI detection results')
  }

  // Warning for very long text
  if (stats.words > 5000) {
    warnings.push('Very long text may take longer to process')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats
  }
}

/**
 * Calculate text statistics
 * @param {string} text - Text to analyze
 * @returns {Object} - Text statistics
 */
export function calculateTextStats(text) {
  if (!text || typeof text !== 'string') {
    return {
      characters: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      avgWordLength: 0,
      avgSentenceLength: 0
    }
  }

  const trimmed = text.trim()
  
  // Count characters (excluding whitespace)
  const characters = trimmed.replace(/\s/g, '').length
  
  // Count words
  const words = trimmed.split(/\s+/).filter(w => w.length > 0).length
  
  // Count sentences (rough estimate)
  const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0).length
  
  // Count paragraphs
  const paragraphs = trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || 1

  // Calculate averages
  const avgWordLength = words > 0 ? Math.round(characters / words * 10) / 10 : 0
  const avgSentenceLength = sentences > 0 ? Math.round(words / sentences * 10) / 10 : 0

  return {
    characters,
    words,
    sentences,
    paragraphs,
    avgWordLength,
    avgSentenceLength
  }
}

/**
 * Sanitize text input
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text
    // Remove null bytes
    .replace(/\0/g, '')
    // Normalize whitespace
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive newlines (more than 3)
    .replace(/\n{4,}/g, '\n\n\n')
    // Remove excessive spaces
    .replace(/ {3,}/g, '  ')
    // Trim
    .trim()
}

/**
 * Check if text is likely AI-generated (simple heuristics)
 * @param {string} text - Text to check
 * @returns {Object} - Heuristic results
 */
export function checkTextHeuristics(text) {
  if (!text || typeof text !== 'string') {
    return { suspicious: false, reasons: [] }
  }

  const reasons = []
  const stats = calculateTextStats(text)

  // Check for very uniform sentence length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  if (sentences.length > 5) {
    const lengths = sentences.map(s => s.trim().split(/\s+/).length)
    const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLen, 2), 0) / lengths.length
    
    if (variance < 5 && avgLen > 10) {
      reasons.push('Very uniform sentence length')
    }
  }

  // Check for common AI phrases
  const aiPhrases = [
    'it is important to note',
    'in conclusion',
    'furthermore',
    'moreover',
    'in summary',
    'as mentioned earlier',
    'it is worth noting'
  ]
  
  const lowerText = text.toLowerCase()
  const foundPhrases = aiPhrases.filter(phrase => lowerText.includes(phrase))
  if (foundPhrases.length >= 3) {
    reasons.push('Contains multiple common AI phrases')
  }

  return {
    suspicious: reasons.length > 0,
    reasons,
    stats
  }
}

export default {
  validateText,
  calculateTextStats,
  sanitizeText,
  checkTextHeuristics
}
