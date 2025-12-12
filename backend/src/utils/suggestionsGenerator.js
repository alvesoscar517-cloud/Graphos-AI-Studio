/**
 * Suggestions Generator
 * Generates follow-up question suggestions based on AI response
 * Supports multiple languages and optimizes for cost/performance
 */

const geminiService = require('../services/gemini.service');
const logger = require('./logger');

/**
 * Generate follow-up suggestions based on AI response and user's last message
 * @param {string} aiResponse - The AI's response text
 * @param {string} userMessage - The user's last message
 * @param {string} userLanguage - Detected user language (e.g., 'vi', 'en')
 * @param {Object} options - Additional options
 * @returns {Promise<string[]>} - Array of 3 suggestion strings
 */
async function generateFollowUpSuggestions(aiResponse, userMessage, userLanguage = 'en', options = {}) {
  const { maxSuggestions = 3, model = 'gemini-2.5-flash-lite' } = options;
  
  // Skip if response is too short (likely error or simple acknowledgment)
  if (!aiResponse || aiResponse.length < 100) {
    return [];
  }

  try {
    const generativeModel = geminiService.vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256,
      },
    });

    // Build prompt based on language
    const languageInstructions = getLanguageInstructions(userLanguage);
    
    const prompt = `Based on this conversation, generate exactly ${maxSuggestions} follow-up questions that the user might want to ask next.

USER'S QUESTION: "${userMessage.substring(0, 200)}"

AI'S RESPONSE (summary): "${aiResponse.substring(0, 500)}..."

${languageInstructions}

RULES:
- Generate exactly ${maxSuggestions} questions
- Questions should be natural continuations of the topic
- Keep questions concise (under 60 characters if possible)
- Questions should be diverse (don't repeat similar questions)
- Make questions actionable and specific

Return ONLY a JSON array of strings, no other text:
["Question 1", "Question 2", "Question 3"]`;

    const result = await generativeModel.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON response
    const suggestions = parseJsonSuggestions(responseText, maxSuggestions);
    
    logger.info(`[SUGGESTIONS] Generated ${suggestions.length} follow-up suggestions`);
    return suggestions;

  } catch (error) {
    logger.error('[SUGGESTIONS] Error generating suggestions:', error.message);
    return [];
  }
}

/**
 * Get language-specific instructions for suggestion generation
 * @param {string} lang - Language code
 * @returns {string} - Language instructions
 */
function getLanguageInstructions(lang) {
  const instructions = {
    vi: 'LANGUAGE: Generate questions in Vietnamese (Tiếng Việt). Use natural Vietnamese phrasing.',
    en: 'LANGUAGE: Generate questions in English.',
    ko: 'LANGUAGE: Generate questions in Korean (한국어).',
    ja: 'LANGUAGE: Generate questions in Japanese (日本語).',
    zh: 'LANGUAGE: Generate questions in Chinese (中文).',
    th: 'LANGUAGE: Generate questions in Thai (ภาษาไทย).',
    id: 'LANGUAGE: Generate questions in Indonesian (Bahasa Indonesia).',
    es: 'LANGUAGE: Generate questions in Spanish (Español).',
    fr: 'LANGUAGE: Generate questions in French (Français).',
    de: 'LANGUAGE: Generate questions in German (Deutsch).',
    it: 'LANGUAGE: Generate questions in Italian (Italiano).',
    pt: 'LANGUAGE: Generate questions in Portuguese (Português).',
    ru: 'LANGUAGE: Generate questions in Russian (Русский).',
  };
  
  return instructions[lang] || instructions.en;
}

/**
 * Parse JSON suggestions from AI response
 * @param {string} responseText - Raw AI response
 * @param {number} maxSuggestions - Maximum number of suggestions
 * @returns {string[]} - Parsed suggestions array
 */
function parseJsonSuggestions(responseText, maxSuggestions) {
  try {
    // Try to extract JSON array from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(s => typeof s === 'string' && s.trim().length > 0)
          .slice(0, maxSuggestions)
          .map(s => s.trim());
      }
    }
    
    // Fallback: try to parse entire response as JSON
    const parsed = JSON.parse(responseText);
    if (Array.isArray(parsed)) {
      return parsed
        .filter(s => typeof s === 'string' && s.trim().length > 0)
        .slice(0, maxSuggestions)
        .map(s => s.trim());
    }
    
    return [];
  } catch (e) {
    logger.warn('[SUGGESTIONS] Failed to parse JSON suggestions:', e.message);
    return [];
  }
}

module.exports = {
  generateFollowUpSuggestions,
  getLanguageInstructions,
  parseJsonSuggestions
};
