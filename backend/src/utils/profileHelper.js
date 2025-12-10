/**
 * Profile Helper
 * Centralized profile loading and system prompt generation
 */

const { db } = require('../config/firebase');

/**
 * Load profile from database
 * @param {string} profileId - Profile ID
 * @returns {Promise<Object|null>} - Profile data or null
 */
async function loadProfile(profileId) {
  if (!profileId) return null;
  
  try {
    const profileDoc = await db.collection('profiles').doc(profileId).get();
    
    if (!profileDoc.exists) {
      console.warn(`[WARN] Profile ${profileId} not found`);
      return null;
    }
    
    return profileDoc.data();
  } catch (error) {
    console.error(`[ERROR] Error loading profile ${profileId}:`, error.message);
    return null;
  }
}

/**
 * Build enhanced system prompt with profile data
 * @param {string} basePrompt - Base system prompt
 * @param {Object} profile - Profile data
 * @param {Object} writingPreferences - Writing preferences flags
 * @returns {string} - Enhanced system prompt
 */
function buildEnhancedSystemPrompt(basePrompt, profile, writingPreferences) {
  let enhancedPrompt = basePrompt || 'You are a smart and helpful AI assistant.';
  
  if (!profile || !profile.voice_profile) {
    return enhancedPrompt;
  }
  
  const voiceProfile = profile.voice_profile;
  
  // Add basic style info
  enhancedPrompt += `

IMPORTANT - RESPONSE STYLE:
TONE: ${voiceProfile.tone || 'neutral'}
FORMALITY LEVEL: ${voiceProfile.formality_level || 5}/10
CHARACTERISTICS: ${voiceProfile.key_characteristics?.slice(0, 3).join(', ') || 'N/A'}

Please respond EXACTLY according to the style above.`;

  // Add writing preferences if enabled
  if (writingPreferences) {
    let preferencesText = '';
    
    // Vocabulary Preferences
    if (writingPreferences.useVocabularyPreferences && voiceProfile.vocabulary_preferences) {
      const vocabPrefs = voiceProfile.vocabulary_preferences;
      if (vocabPrefs.common_phrases?.length > 0 || 
          vocabPrefs.preferred_connectors?.length > 0 || 
          vocabPrefs.avoid_words?.length > 0) {
        preferencesText += '\n\nVOCABULARY PREFERENCES:';
        if (vocabPrefs.common_phrases?.length > 0) {
          preferencesText += '\nCOMMON PHRASES: ' + vocabPrefs.common_phrases.join(', ');
        }
        if (vocabPrefs.preferred_connectors?.length > 0) {
          preferencesText += '\nPREFERRED CONNECTORS: ' + vocabPrefs.preferred_connectors.join(', ');
        }
        if (vocabPrefs.avoid_words?.length > 0) {
          preferencesText += '\nWORDS TO AVOID: ' + vocabPrefs.avoid_words.join(', ');
        }
      }
    }
    
    // Key characteristics
    if (writingPreferences.useKeyCharacteristics && voiceProfile.key_characteristics?.length > 0) {
      preferencesText += '\n\nKEY CHARACTERISTICS: ' + voiceProfile.key_characteristics.join(', ');
    }
    
    // Sentence Patterns
    if (writingPreferences.useSentencePatterns && voiceProfile.sentence_patterns) {
      const sentencePatterns = voiceProfile.sentence_patterns;
      if (sentencePatterns.opening_style || sentencePatterns.structure_preference) {
        preferencesText += '\n\nSENTENCE STRUCTURE:';
        if (sentencePatterns.opening_style) {
          preferencesText += '\nOPENING STYLE: ' + sentencePatterns.opening_style;
        }
        if (sentencePatterns.structure_preference) {
          preferencesText += '\nSTRUCTURE: ' + sentencePatterns.structure_preference;
        }
      }
    }
    
    // Rewrite instructions
    if (writingPreferences.useRewriteInstructions && voiceProfile.rewrite_instructions) {
      preferencesText += '\n\nREWRITE INSTRUCTIONS: ' + voiceProfile.rewrite_instructions;
    }
    
    if (preferencesText) {
      enhancedPrompt += preferencesText;
    }
  }
  
  return enhancedPrompt;
}

/**
 * Estimate token count for text (approximate)
 * Uses a more accurate estimation than simple word count
 * @param {string} text - Text to estimate
 * @returns {number} - Estimated token count
 */
function estimateTokens(text) {
  if (!text) return 0;
  
  // Average: 1 token ≈ 4 characters for English
  // For mixed content, use 3.5 characters per token
  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  
  // Use weighted average of character-based and word-based estimation
  const charBasedEstimate = Math.ceil(charCount / 3.5);
  const wordBasedEstimate = Math.ceil(wordCount * 1.3); // Words typically = 1.3 tokens
  
  return Math.ceil((charBasedEstimate + wordBasedEstimate) / 2);
}

/**
 * Estimate total tokens for a conversation
 * @param {Array} messages - Array of message objects
 * @param {string} systemPrompt - System prompt
 * @returns {Object} - Token estimates
 */
function estimateConversationTokens(messages, systemPrompt) {
  let inputTokens = estimateTokens(systemPrompt);
  
  messages.forEach(msg => {
    inputTokens += estimateTokens(msg.content);
    // Add overhead for role markers
    inputTokens += 4;
  });
  
  return {
    inputTokens,
    estimatedOutputTokens: 500, // Default estimate
    total: inputTokens + 500
  };
}

/**
 * Format error message for client
 * @param {Error} error - Error object
 * @returns {Object} - Formatted error
 */
function formatError(error) {
  const message = error.message || 'Unknown error';
  const errorCode = error.code || '';
  
  // Log full error for debugging
  console.error('[formatError] Processing error:', {
    message,
    code: errorCode,
    name: error.name,
    details: error.details
  });
  
  // Quota errors
  if (message.includes('quota') || message.includes('RESOURCE_EXHAUSTED') || errorCode === 8) {
    return {
      code: 'QUOTA_EXCEEDED',
      message: 'API quota exceeded. Please try again later.',
      retryAfter: 60
    };
  }
  
  // Rate limit errors
  if (message.includes('rate') || message.includes('429')) {
    return {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please slow down.',
      retryAfter: 10
    };
  }
  
  // Permission errors
  if (message.includes('PERMISSION_DENIED') || message.includes('permission') || errorCode === 7) {
    return {
      code: 'PERMISSION_DENIED',
      message: 'AI service permission error. Check service account.',
      retryAfter: 0
    };
  }
  
  // Authentication errors
  if (message.includes('UNAUTHENTICATED') || message.includes('credentials') || errorCode === 16) {
    return {
      code: 'AUTH_ERROR',
      message: 'AI service authentication failed. Check credentials.',
      retryAfter: 0
    };
  }
  
  // Service unavailable
  if (message.includes('UNAVAILABLE') || message.includes('unavailable') || errorCode === 14) {
    return {
      code: 'SERVICE_UNAVAILABLE',
      message: 'AI service temporarily unavailable. Please try again.',
      retryAfter: 30
    };
  }
  
  // Invalid input
  if (message.includes('invalid') || message.includes('Invalid')) {
    return {
      code: 'INVALID_INPUT',
      message: 'Invalid input provided. Please check your request.',
      retryAfter: 0
    };
  }
  
  // Content safety
  if (message.includes('safety') || message.includes('blocked')) {
    return {
      code: 'CONTENT_BLOCKED',
      message: 'Content was blocked due to safety filters.',
      retryAfter: 0
    };
  }
  
  // Model errors
  if (message.includes('model') || message.includes('Model')) {
    return {
      code: 'MODEL_ERROR',
      message: 'AI model error. Please try a different model.',
      retryAfter: 0
    };
  }
  
  // Default error - include original message for debugging
  return {
    code: 'INTERNAL_ERROR',
    message: `Something went wrong. Please try again.`,
    retryAfter: 5,
    debug: process.env.NODE_ENV !== 'production' ? message : undefined
  };
}

module.exports = {
  loadProfile,
  buildEnhancedSystemPrompt,
  estimateTokens,
  estimateConversationTokens,
  formatError
};
