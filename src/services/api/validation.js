import { validateTextForModel, splitTextForModel } from '../../utils/tokenUtils'

/**
 * Text validation helper - validates before API calls
 * @param {string} text 
 * @param {string} model 
 * @param {Object} options 
 * @returns {Object}
 */
export function validateTextBeforeAI(text, model = 'gemini-2.5-flash', options = {}) {
  const { task = 'analyze', showWarning = true } = options
  const validation = validateTextForModel(text, model)
  
  if (!validation.valid) {
    console.warn('❌ Text validation failed:', validation.errors)
    return { 
      valid: false, 
      errors: validation.errors,
      stats: validation.stats 
    }
  }
  
  if (validation.warnings.length > 0 && showWarning) {
    console.warn('⚠️ Text validation warnings:', validation.warnings)
  }
  
  return {
    valid: true,
    stats: validation.stats,
    warnings: validation.warnings,
    shouldChunk: validation.recommendation === 'chunk',
    chunks: validation.recommendation === 'chunk' 
      ? splitTextForModel(text, model) 
      : null
  }
}
