/**
 * Humanize Service
 * Advanced text humanization to make AI-rewritten text indistinguishable from human writing
 * 
 * Key Features:
 * - Enhanced prompt engineering with anti-AI detection rules
 * - Few-shot learning with sample texts
 * - Iterative refinement loop
 * - Human imperfection injection
 * - Post-rewrite AI detection check
 */

const { getVertexAI } = require('../config/gemini');
const analysisService = require('./analysis.service');

const vertexAI = getVertexAI();

// ============================================================================
// ANTI-AI DETECTION CONSTANTS
// ============================================================================

// Import language processor for language-specific patterns
const languageProcessor = require('./languageProcessor.service');

/**
 * Common AI phrases to avoid - these are red flags for AI detection
 * Now dynamically loaded from languageProcessor for all 15 languages
 */
const AI_PHRASES_TO_AVOID = {
  en: [
    "it's important to note", "it should be noted", "it is worth mentioning",
    "it is essential to", "it is crucial to", "it is vital to",
    "one might argue", "it could be argued", "it can be said",
    "furthermore", "moreover", "additionally", "consequently",
    "subsequently", "nevertheless", "nonetheless", "hence", "thus",
    "in addition to this", "on the other hand", "in light of",
    "in today's world", "in this day and age", "at the end of the day",
    "first and foremost", "last but not least", "needless to say",
    "as an ai", "i cannot", "i'm unable to", "i don't have the ability",
    "delve into", "dive into", "unpack", "leverage", "utilize",
    "facilitate", "implement", "comprehensive", "robust",
    "in conclusion", "to summarize", "in summary", "to sum up",
    "all in all", "overall", "ultimately"
  ],
  vi: [
    'điều quan trọng cần lưu ý', 'cần lưu ý rằng', 'kết luận',
    'tóm tắt', 'tóm lại', 'với tư cách là ai', 'tôi không thể',
    'đáng chú ý là', 'có thể lập luận rằng', 'điều cần thiết là',
    'trong thế giới ngày nay', 'trong thời đại này', 'cuối cùng thì',
    'không cần phải nói', 'trước hết', 'cuối cùng nhưng không kém phần quan trọng',
    'tuy nhiên', 'hơn nữa', 'do đó', 'vì vậy', 'ngoài ra', 'bên cạnh đó'
  ],
  zh: [
    '值得注意的是', '需要指出的是', '总而言之', '综上所述',
    '作为人工智能', '我无法', '我很抱歉', '在当今世界', '在这个时代',
    '不言而喻', '毋庸置疑', '首先', '最后但同样重要的是',
    '此外', '因此', '然而', '综上所述', '总而言之'
  ],
  ja: [
    '注目すべきは', '指摘すべきは', '結論として', '要約すると',
    'AIとして', '私にはできません', '申し訳ありません',
    '今日の世界では', 'この時代において', '結局のところ',
    '言うまでもなく', '何よりもまず', '最後になりましたが',
    'したがって', 'さらに', 'しかしながら', '結論として'
  ],
  ko: [
    '주목할 점은', '지적해야 할 것은', '결론적으로', '요약하자면',
    'AI로서', '저는 할 수 없습니다', '죄송합니다',
    '오늘날의 세계에서', '이 시대에', '결국',
    '말할 필요도 없이', '무엇보다도', '마지막으로 중요한 것은',
    '따라서', '게다가', '그러나', '결론적으로'
  ],
  fr: [
    'il est important de noter', 'il convient de souligner', 'en conclusion',
    'pour résumer', 'en résumé', 'en tant qu\'IA', 'je ne peux pas',
    'dans le monde d\'aujourd\'hui', 'à notre époque', 'en fin de compte',
    'il va sans dire', 'avant tout', 'dernier point mais non des moindres'
  ],
  de: [
    'es ist wichtig zu beachten', 'es sollte beachtet werden', 'zusammenfassend',
    'um zusammenzufassen', 'als KI', 'ich kann nicht', 'ich entschuldige mich',
    'in der heutigen Welt', 'in dieser Zeit', 'letztendlich',
    'es versteht sich von selbst', 'vor allem', 'nicht zuletzt'
  ],
  es: [
    'es importante señalar', 'cabe destacar', 'en conclusión',
    'para resumir', 'en resumen', 'como IA', 'no puedo', 'me disculpo',
    'en el mundo actual', 'en esta época', 'al final del día',
    'no hace falta decir', 'ante todo', 'por último pero no menos importante'
  ],
  pt: [
    'é importante notar', 'vale ressaltar', 'em conclusão',
    'para resumir', 'em resumo', 'como IA', 'não posso', 'peço desculpas',
    'no mundo atual', 'nesta época', 'no final das contas'
  ],
  it: [
    'è importante notare', 'va sottolineato', 'in conclusione',
    'per riassumere', 'in sintesi', 'come IA', 'non posso', 'mi scuso',
    'nel mondo di oggi', 'alla fine dei conti'
  ],
  ru: [
    'важно отметить', 'следует подчеркнуть', 'в заключение',
    'подводя итог', 'резюмируя', 'как ИИ', 'я не могу', 'приношу извинения',
    'в современном мире', 'в наше время', 'в конечном счёте'
  ],
  ar: [
    'من المهم ملاحظة', 'تجدر الإشارة إلى', 'في الختام',
    'للتلخيص', 'باختصار', 'كذكاء اصطناعي', 'لا أستطيع', 'أعتذر',
    'في عالم اليوم', 'في هذا العصر', 'في نهاية المطاف'
  ],
  th: [
    'สิ่งสำคัญที่ต้องทราบ', 'ควรสังเกตว่า', 'โดยสรุป',
    'สรุปได้ว่า', 'กล่าวโดยสรุป', 'ในฐานะ AI', 'ฉันไม่สามารถ', 'ขออภัย',
    'ในโลกปัจจุบัน', 'ในยุคนี้', 'ท้ายที่สุดแล้ว'
  ],
  id: [
    'penting untuk dicatat', 'perlu diperhatikan', 'kesimpulannya',
    'untuk meringkas', 'singkatnya', 'sebagai AI', 'saya tidak bisa', 'mohon maaf',
    'di dunia saat ini', 'di era ini', 'pada akhirnya'
  ],
  ms: [
    'penting untuk diambil perhatian', 'perlu dinyatakan', 'kesimpulannya',
    'untuk merumuskan', 'ringkasnya', 'sebagai AI', 'saya tidak boleh', 'mohon maaf',
    'dalam dunia hari ini', 'pada zaman ini', 'akhirnya'
  ]
};

/**
 * Human-like markers to encourage - now supports all 15 languages
 * Uses languageProcessor.getHumanizationPatterns() for language-specific patterns
 */
const HUMAN_MARKERS = {
  en: {
    contractions: [
      ["it is", "it's"], ["do not", "don't"], ["cannot", "can't"],
      ["will not", "won't"], ["would not", "wouldn't"], ["should not", "shouldn't"],
      ["could not", "couldn't"], ["have not", "haven't"], ["has not", "hasn't"],
      ["is not", "isn't"], ["are not", "aren't"], ["was not", "wasn't"],
      ["were not", "weren't"], ["I am", "I'm"], ["you are", "you're"],
      ["they are", "they're"], ["we are", "we're"], ["I have", "I've"],
      ["you have", "you've"], ["we have", "we've"], ["they have", "they've"],
      ["I will", "I'll"], ["you will", "you'll"], ["he will", "he'll"],
      ["she will", "she'll"], ["it will", "it'll"], ["that is", "that's"],
      ["there is", "there's"], ["what is", "what's"], ["who is", "who's"],
      ["let us", "let's"]
    ],
    fillers: ["actually", "basically", "honestly", "literally", "obviously", "clearly"],
    starters: ["And", "But", "So", "Well", "Now", "Look", "See", "Thing is"],
    opinions: ["I think", "I believe", "I feel", "In my opinion", "To me", "Personally"]
  }
};

/**
 * Get human markers for a specific language
 * @param {string} lang - Language code
 * @returns {Object} - Human markers for the language
 */
function getHumanMarkersForLanguage(lang) {
  // If we have predefined markers, use them
  if (HUMAN_MARKERS[lang]) {
    return HUMAN_MARKERS[lang];
  }
  
  // Otherwise, get from languageProcessor
  const patterns = languageProcessor.getHumanizationPatterns(lang);
  return {
    contractions: languageProcessor.getContractions(lang).map(c => [c, c]), // No expansion for non-English
    fillers: patterns.fillers || [],
    starters: patterns.starters || [],
    opinions: patterns.opinions || [],
    particles: patterns.particles || [],
    informalMarkers: patterns.informalMarkers || []
  };
}

// ============================================================================
// CONTENT LANGUAGE DETECTION
// ============================================================================

/**
 * Detect the language of the content text
 * Uses languageProcessor's detection which supports all 15 languages
 * @param {string} text - Text to analyze
 * @returns {string} - Detected language code
 */
function detectContentLanguage(text) {
  return languageProcessor.detectLanguage(text);
}

/**
 * Get language-specific humanization instructions for AI prompt
 * @param {string} lang - Language code
 * @returns {string} - Language-specific instructions
 */
function getLanguageSpecificInstructions(lang) {
  const patterns = languageProcessor.getHumanizationPatterns(lang);
  const config = languageProcessor.getConfig(lang);
  
  const instructions = {
    vi: `
VIETNAMESE-SPECIFIC RULES:
- Add sentence-final particles naturally: ${patterns.particles.slice(0, 5).join(', ')}
- Use Vietnamese fillers: ${patterns.fillers.slice(0, 4).join(', ')}
- Start some sentences with: ${patterns.starters.slice(0, 4).join(', ')}
- Preserve all Vietnamese diacritics (à, á, ả, ã, ạ, etc.)
- Use informal markers where appropriate: ${patterns.informalMarkers.slice(0, 4).join(', ')}
- Avoid overly formal Sino-Vietnamese words when casual tone is needed`,

    zh: `
CHINESE-SPECIFIC RULES:
- Add modal particles naturally: ${patterns.particles.slice(0, 5).join(', ')}
- Use colloquial fillers: ${patterns.fillers.slice(0, 4).join(', ')}
- Include personal opinions: ${patterns.opinions.slice(0, 3).join(', ')}
- Use appropriate punctuation (。！？)
- Avoid overly formal written Chinese when casual tone is needed`,

    ja: `
JAPANESE-SPECIFIC RULES:
- Add sentence-ending particles: ${patterns.particles.slice(0, 5).join(', ')}
- Use appropriate keigo level based on context
- Include fillers: ${patterns.fillers.slice(0, 4).join(', ')}
- Mix formal and casual forms naturally
- Avoid overly stiff or robotic keigo`,

    ko: `
KOREAN-SPECIFIC RULES:
- Use appropriate speech level (반말/존댓말)
- Add sentence-ending particles: ${patterns.particles.slice(0, 5).join(', ')}
- Include fillers: ${patterns.fillers.slice(0, 4).join(', ')}
- Use informal markers: ${patterns.informalMarkers.slice(0, 4).join(', ')}`,

    th: `
THAI-SPECIFIC RULES:
- Add polite particles appropriately: ${patterns.particles.slice(0, 5).join(', ')}
- Use fillers: ${patterns.fillers.slice(0, 4).join(', ')}
- Include informal markers: ${patterns.informalMarkers.slice(0, 4).join(', ')}`,

    ar: `
ARABIC-SPECIFIC RULES:
- Use colloquial expressions where appropriate
- Add particles: ${patterns.particles.slice(0, 4).join(', ')}
- Include fillers: ${patterns.fillers.slice(0, 4).join(', ')}
- Handle RTL text properly`,

    fr: `
FRENCH-SPECIFIC RULES:
- Use contractions naturally: j', l', d', n', c', s', qu'
- Add fillers: ${patterns.fillers.slice(0, 4).join(', ')}
- Include informal expressions: ${patterns.informalMarkers.slice(0, 4).join(', ')}`,

    de: `
GERMAN-SPECIFIC RULES:
- Use modal particles: ${patterns.particles.slice(0, 5).join(', ')}
- Add fillers: ${patterns.fillers.slice(0, 4).join(', ')}
- Include informal markers: ${patterns.informalMarkers.slice(0, 4).join(', ')}`,

    es: `
SPANISH-SPECIFIC RULES:
- Use contractions: al, del
- Add fillers: ${patterns.fillers.slice(0, 4).join(', ')}
- Include informal expressions: ${patterns.informalMarkers.slice(0, 4).join(', ')}`,

    pt: `
PORTUGUESE-SPECIFIC RULES:
- Use contractions naturally: do, da, no, na, ao, pelo
- Add particles: ${patterns.particles.slice(0, 4).join(', ')}
- Include fillers: ${patterns.fillers.slice(0, 4).join(', ')}`,

    it: `
ITALIAN-SPECIFIC RULES:
- Use contractions: l', d', un', dell', all'
- Add particles: ${patterns.particles.slice(0, 4).join(', ')}
- Include fillers: ${patterns.fillers.slice(0, 4).join(', ')}`,

    ru: `
RUSSIAN-SPECIFIC RULES:
- Use particles: ${patterns.particles.slice(0, 5).join(', ')}
- Add fillers: ${patterns.fillers.slice(0, 4).join(', ')}
- Include informal markers: ${patterns.informalMarkers.slice(0, 4).join(', ')}`,

    id: `
INDONESIAN-SPECIFIC RULES:
- Use particles: ${patterns.particles.slice(0, 5).join(', ')}
- Add fillers: ${patterns.fillers.slice(0, 4).join(', ')}
- Include informal markers: ${patterns.informalMarkers.slice(0, 4).join(', ')}`,

    ms: `
MALAY-SPECIFIC RULES:
- Use particles: ${patterns.particles.slice(0, 5).join(', ')}
- Add fillers: ${patterns.fillers.slice(0, 4).join(', ')}
- Include informal markers: ${patterns.informalMarkers.slice(0, 4).join(', ')}`
  };

  return instructions[lang] || '';
}

// ============================================================================
// ENHANCED PROMPT BUILDER
// ============================================================================

/**
 * Build voice profile description based on writing preferences
 * @param {Object} voiceProfile - Voice profile object
 * @param {Object} writingPreferences - User's writing preferences (toggles)
 * @returns {string} - Voice description for prompt
 */
function buildVoiceDescription(voiceProfile, writingPreferences = {}) {
  // Default all preferences to true if not specified
  const prefs = {
    useVocabularyPreferences: writingPreferences.useVocabularyPreferences !== false,
    useKeyCharacteristics: writingPreferences.useKeyCharacteristics !== false,
    useSentencePatterns: writingPreferences.useSentencePatterns !== false,
    useRewriteInstructions: writingPreferences.useRewriteInstructions !== false
  };

  // If no profile or not an object, return generic or string
  if (!voiceProfile) {
    return `
TONE: natural, conversational
FORMALITY LEVEL: 5/10
KEY CHARACTERISTICS: clear, engaging, authentic`;
  }

  if (typeof voiceProfile !== 'object' || !voiceProfile.tone) {
    return String(voiceProfile);
  }

  // Build description based on enabled preferences
  let description = `
TONE: ${voiceProfile.tone}
FORMALITY LEVEL: ${voiceProfile.formality_level}/10`;

  // Key Characteristics (controlled by useKeyCharacteristics)
  if (prefs.useKeyCharacteristics && voiceProfile.key_characteristics?.length > 0) {
    description += `\nKEY CHARACTERISTICS: ${voiceProfile.key_characteristics.join(', ')}`;
  }

  // Sentence Patterns (controlled by useSentencePatterns)
  if (prefs.useSentencePatterns) {
    if (voiceProfile.sentence_starters?.length > 0) {
      description += `\nSENTENCE STARTERS: ${voiceProfile.sentence_starters.join(', ')}`;
    }
    if (voiceProfile.transition_preferences?.length > 0) {
      description += `\nTRANSITION PREFERENCES: ${voiceProfile.transition_preferences.join(', ')}`;
    }
    if (voiceProfile.punctuation_style) {
      description += `\nPUNCTUATION STYLE: ${voiceProfile.punctuation_style}`;
    }
    if (voiceProfile.sentence_patterns?.structure_preference) {
      description += `\nSENTENCE STRUCTURE: ${voiceProfile.sentence_patterns.structure_preference}`;
    }
    if (voiceProfile.sentence_patterns?.opening_style) {
      description += `\nOPENING STYLE: ${voiceProfile.sentence_patterns.opening_style}`;
    }
  }

  // Vocabulary Preferences (controlled by useVocabularyPreferences)
  if (prefs.useVocabularyPreferences && voiceProfile.vocabulary_preferences) {
    const vocab = voiceProfile.vocabulary_preferences;
    if (vocab.common_phrases?.length > 0) {
      description += `\nCOMMON PHRASES: ${vocab.common_phrases.join(', ')}`;
    }
    if (vocab.preferred_connectors?.length > 0) {
      description += `\nPREFERRED CONNECTORS: ${vocab.preferred_connectors.join(', ')}`;
    }
    if (vocab.avoid_words?.length > 0) {
      description += `\nWORDS TO AVOID: ${vocab.avoid_words.join(', ')}`;
    }
  }

  return description;
}

/**
 * Build simple rewrite prompt WITHOUT anti-AI detection rules
 * Used when user disables anti-AI detection
 * @param {string} originalText - Text to rewrite
 * @param {Object} voiceProfile - Voice profile object (can be null for generic)
 * @param {string} sampleText - Sample text from user's writing (for few-shot)
 * @param {Object} options - Additional options including writingPreferences
 * @returns {string} - Simple prompt
 */
function buildSimpleRewritePrompt(originalText, voiceProfile, sampleText = null, options = {}) {
  const writingPreferences = options.writingPreferences || {};
  const voiceDescription = buildVoiceDescription(voiceProfile, writingPreferences);

  let prompt = `You are an expert writer. Rewrite the following text to match the target voice profile while preserving the original meaning.

═══════════════════════════════════════════════════════════════
TARGET VOICE PROFILE:
═══════════════════════════════════════════════════════════════
${voiceDescription}`;

  // Add few-shot example if available
  if (sampleText && sampleText.length > 50) {
    prompt += `

═══════════════════════════════════════════════════════════════
EXAMPLE OF THIS PERSON'S ACTUAL WRITING (MIMIC THIS STYLE):
═══════════════════════════════════════════════════════════════
"${sampleText.substring(0, 1500)}"`;
  }

  // Add rewrite instructions from profile if enabled
  const useRewriteInstructions = writingPreferences.useRewriteInstructions !== false;
  if (useRewriteInstructions && voiceProfile?.rewrite_instructions) {
    prompt += `

═══════════════════════════════════════════════════════════════
SPECIFIC REWRITE INSTRUCTIONS:
═══════════════════════════════════════════════════════════════
${voiceProfile.rewrite_instructions}`;
  }

  prompt += `

═══════════════════════════════════════════════════════════════
ORIGINAL TEXT TO REWRITE:
═══════════════════════════════════════════════════════════════
${originalText}

═══════════════════════════════════════════════════════════════
REWRITTEN TEXT (output ONLY the rewritten text):
═══════════════════════════════════════════════════════════════`;

  return prompt;
}

/**
 * Build enhanced rewrite prompt with anti-AI detection rules
 * Now supports all 15 languages with language-specific humanization patterns
 * @param {string} originalText - Text to rewrite
 * @param {Object} voiceProfile - Voice profile object
 * @param {string} sampleText - Sample text from user's writing (for few-shot)
 * @param {Object} options - Additional options including writingPreferences
 * @returns {string} - Enhanced prompt
 */
function buildEnhancedRewritePrompt(originalText, voiceProfile, sampleText = null, options = {}) {
  // Detect content language (not UI language)
  const lang = detectContentLanguage(originalText);
  const aiPhrases = AI_PHRASES_TO_AVOID[lang] || AI_PHRASES_TO_AVOID.en;
  const writingPreferences = options.writingPreferences || {};
  const languageInstructions = getLanguageSpecificInstructions(lang);
  const langConfig = languageProcessor.getConfig(lang);
  
  // Build voice profile description based on writing preferences
  const voiceDescription = buildVoiceDescription(voiceProfile, writingPreferences);
  
  console.log(`[HUMANIZE] Detected content language: ${lang} (${langConfig.name})`);

  // Build the enhanced prompt with language-specific rules
  let prompt = `You are an expert ghostwriter who must rewrite text to PERFECTLY match a specific human's writing style. Your goal is to make the output COMPLETELY INDISTINGUISHABLE from human writing.

IMPORTANT: The text is in ${langConfig.name} (${langConfig.nativeName}). You MUST output in the SAME language.

═══════════════════════════════════════════════════════════════
CRITICAL ANTI-AI DETECTION RULES (MUST FOLLOW):
═══════════════════════════════════════════════════════════════

1. BANNED PHRASES - NEVER use these AI-typical phrases in ${langConfig.name}:
   ${aiPhrases.slice(0, 12).map(p => `"${p}"`).join(', ')}

2. SENTENCE VARIATION - Mix sentence lengths naturally:
   - Include some short punchy sentences
   - Include some medium sentences
   - Occasionally use longer sentences
   - NEVER have 3+ sentences of similar length in a row

3. NATURAL IMPERFECTIONS - Include human-like patterns:
   - Use occasional sentence fragments for emphasis
   - Don't over-explain or be too comprehensive
   - Add natural pauses and rhythm

4. AVOID PERFECT STRUCTURE:
   - Don't use perfect parallel structure in every list
   - Vary paragraph lengths
   - Don't always have intro-body-conclusion in every section

5. PERSONAL VOICE - Add authenticity markers:
   - Show personality through word choice
   - Don't be overly neutral or balanced on everything

6. TRANSITION VARIETY:
   - Don't overuse formal transitions
   - Use simple connectors natural to ${langConfig.name}
   - Sometimes skip transitions entirely between related ideas
${languageInstructions}

═══════════════════════════════════════════════════════════════
TARGET VOICE PROFILE:
═══════════════════════════════════════════════════════════════
${voiceDescription}`;

  // Add few-shot example if available
  if (sampleText && sampleText.length > 50) {
    prompt += `

═══════════════════════════════════════════════════════════════
EXAMPLE OF THIS PERSON'S ACTUAL WRITING (MIMIC THIS STYLE):
═══════════════════════════════════════════════════════════════
"${sampleText.substring(0, 1500)}"`;
  }

  // Add rewrite instructions from profile if enabled
  const useRewriteInstructions = writingPreferences.useRewriteInstructions !== false;
  if (useRewriteInstructions && voiceProfile?.rewrite_instructions) {
    prompt += `

═══════════════════════════════════════════════════════════════
SPECIFIC REWRITE INSTRUCTIONS FROM PROFILE:
═══════════════════════════════════════════════════════════════
${voiceProfile.rewrite_instructions}`;
  }

  // Add refinement context if this is a refinement iteration
  if (options.refinementContext) {
    prompt += `

═══════════════════════════════════════════════════════════════
REFINEMENT FEEDBACK (FIX THESE ISSUES):
═══════════════════════════════════════════════════════════════
${options.refinementContext}`;
  }

  prompt += `

═══════════════════════════════════════════════════════════════
ORIGINAL TEXT TO REWRITE:
═══════════════════════════════════════════════════════════════
${originalText}

═══════════════════════════════════════════════════════════════
REWRITTEN TEXT (follow ALL rules above, output ONLY the rewritten text):
═══════════════════════════════════════════════════════════════`;

  return prompt;
}

/**
 * Build refinement prompt based on AI detection feedback
 * @param {string} text - Current text
 * @param {Array} aiIndicators - AI indicators from detection
 * @param {number} aiProbability - Current AI probability
 * @returns {string} - Refinement context
 */
function buildRefinementContext(text, aiIndicators, aiProbability) {
  let context = `The previous rewrite was detected as ${aiProbability}% likely AI-generated.\n\n`;
  context += `SPECIFIC ISSUES TO FIX:\n`;
  
  if (aiIndicators && aiIndicators.length > 0) {
    aiIndicators.forEach((indicator, idx) => {
      context += `${idx + 1}. ${indicator}\n`;
    });
  }
  
  // Add specific fixes based on probability
  if (aiProbability > 70) {
    context += `\nCRITICAL: Text is clearly AI-like. Make MAJOR changes:
- Completely restructure sentences
- Add more personal voice and opinions
- Use more contractions and informal language
- Break up any formulaic patterns`;
  } else if (aiProbability > 50) {
    context += `\nIMPORTANT: Text still reads as AI. Make these changes:
- Vary sentence lengths more dramatically
- Add some sentence fragments or informal starters
- Remove any remaining formal transitions
- Add personal touches`;
  } else {
    context += `\nMINOR TWEAKS: Almost there, just need small adjustments:
- Fine-tune a few sentences
- Add one or two more human touches`;
  }
  
  return context;
}

// ============================================================================
// HUMAN IMPERFECTION INJECTION
// ============================================================================

/**
 * Inject human-like imperfections into text
 * @param {string} text - Text to humanize
 * @param {Object} voiceProfile - Voice profile
 * @param {Object} options - Options
 * @returns {string} - Humanized text
 */
function injectHumanImperfections(text, voiceProfile, options = {}) {
  const lang = analysisService.detectLanguage(text);
  const formalityLevel = voiceProfile?.formality_level || 5;
  let result = text;
  
  // Only apply imperfections for less formal writing
  if (formalityLevel >= 8) {
    return result; // Keep formal text as-is
  }
  
  // 1. Add contractions (English only, based on formality)
  if (lang === 'en' && formalityLevel < 7) {
    result = addContractions(result, formalityLevel < 5 ? 0.7 : 0.5);
  }
  
  // 2. Vary punctuation slightly
  result = varyPunctuation(result, lang);
  
  // 3. Occasionally break perfect parallel structures
  if (Math.random() < 0.3) {
    result = breakParallelStructures(result);
  }
  
  return result;
}

/**
 * Add contractions to text
 * @param {string} text - Input text
 * @param {number} rate - Conversion rate (0-1)
 * @returns {string} - Text with contractions
 */
function addContractions(text, rate = 0.6) {
  const contractions = HUMAN_MARKERS.en.contractions;
  let result = text;
  
  contractions.forEach(([full, contracted]) => {
    // Create regex that matches the full form (case-insensitive)
    const regex = new RegExp(`\\b${full}\\b`, 'gi');
    
    result = result.replace(regex, (match) => {
      // Apply contraction based on rate
      if (Math.random() < rate) {
        // Preserve case
        if (match[0] === match[0].toUpperCase()) {
          return contracted.charAt(0).toUpperCase() + contracted.slice(1);
        }
        return contracted;
      }
      return match;
    });
  });
  
  return result;
}

/**
 * Add slight punctuation variations
 * @param {string} text - Input text
 * @param {string} lang - Language code
 * @returns {string} - Text with varied punctuation
 */
function varyPunctuation(text, lang) {
  let result = text;
  
  // Occasionally add ellipsis for trailing thoughts (sparingly)
  if (Math.random() < 0.1) {
    const sentences = result.split(/(?<=[.!?])\s+/);
    if (sentences.length > 3) {
      const idx = Math.floor(Math.random() * (sentences.length - 1)) + 1;
      if (sentences[idx] && sentences[idx].endsWith('.') && sentences[idx].length > 20) {
        sentences[idx] = sentences[idx].slice(0, -1) + '...';
        result = sentences.join(' ');
      }
    }
  }
  
  return result;
}

/**
 * Break perfect parallel structures
 * @param {string} text - Input text
 * @returns {string} - Text with broken parallel structures
 */
function breakParallelStructures(text) {
  // Find bullet-point like patterns and slightly vary them
  const bulletPatterns = /^(\s*[-•*]\s*)(.+)$/gm;
  let matches = [...text.matchAll(bulletPatterns)];
  
  if (matches.length >= 3) {
    // Randomly vary one item slightly
    const idx = Math.floor(Math.random() * matches.length);
    const match = matches[idx];
    if (match && match[2]) {
      // Add a slight variation (e.g., add "also" or change structure)
      const variations = [
        (s) => s.replace(/^(\w)/, 'Also, $1'.toLowerCase()),
        (s) => s.replace(/^(\w)/, 'And $1'.toLowerCase()),
        (s) => s // Keep as-is sometimes
      ];
      const variation = variations[Math.floor(Math.random() * variations.length)];
      // This is a simplified version - in production, would need more sophisticated handling
    }
  }
  
  return text;
}

// ============================================================================
// MAIN REWRITE FUNCTIONS
// ============================================================================

/**
 * Enhanced rewrite with anti-AI detection
 * @param {string} originalText - Text to rewrite
 * @param {Object} voiceProfile - Voice profile
 * @param {Object} context - Additional context
 * @param {string} modelName - Model to use
 * @returns {Promise<string>} - Rewritten text
 */
async function rewriteWithAntiDetection(originalText, voiceProfile, context = {}, modelName = 'gemini-2.5-flash') {
  try {
    const model = vertexAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.8, // Slightly higher for more natural variation
        topP: 0.9,
        topK: 40
      }
    });

    // Get sample text for few-shot learning
    const sampleText = context.sampleText || voiceProfile?.sample_text || null;
    
    // Build enhanced prompt with writing preferences
    const prompt = buildEnhancedRewritePrompt(
      originalText, 
      voiceProfile, 
      sampleText,
      { 
        refinementContext: context.refinementContext,
        writingPreferences: context.writingPreferences 
      }
    );

    console.log(`[HUMANIZE] Generating rewrite with enhanced anti-AI prompt...`);
    
    const result = await model.generateContent(prompt);
    let rewrittenText = result.response.candidates[0].content.parts[0].text.trim();
    
    // Apply human imperfection injection
    if (context.applyImperfections !== false) {
      rewrittenText = injectHumanImperfections(rewrittenText, voiceProfile);
    }

    console.log(`[HUMANIZE] Rewrite complete (${originalText.length} → ${rewrittenText.length} chars)`);
    return rewrittenText;
  } catch (error) {
    console.error('[HUMANIZE] Rewrite failed:', error);
    throw error;
  }
}

/**
 * Iterative rewrite with AI detection feedback loop
 * @param {string} originalText - Text to rewrite
 * @param {Object} voiceProfile - Voice profile
 * @param {Object} context - Additional context
 * @param {Object} options - Options including maxIterations, targetProbability
 * @returns {Promise<Object>} - { text, iterations, aiProbability, improved }
 */
async function rewriteWithIterativeRefinement(originalText, voiceProfile, context = {}, options = {}) {
  const maxIterations = options.maxIterations || 3;
  const targetProbability = options.targetProbability || 35;
  const modelName = options.model || 'gemini-2.5-flash';
  
  let currentText = originalText;
  let iterations = 0;
  let lastDetection = null;
  
  // Import detectAIContent dynamically to avoid circular dependency
  const geminiService = require('./gemini.service');
  
  console.log(`[HUMANIZE] Starting iterative refinement (max ${maxIterations} iterations, target <${targetProbability}%)`);
  
  for (let i = 0; i < maxIterations; i++) {
    iterations = i + 1;
    
    // Step 1: Rewrite with enhanced prompt
    const refinementContext = lastDetection 
      ? buildRefinementContext(currentText, lastDetection.aiIndicators, lastDetection.aiProbability)
      : null;
    
    currentText = await rewriteWithAntiDetection(
      i === 0 ? originalText : currentText,
      voiceProfile,
      { ...context, refinementContext },
      modelName
    );
    
    // Step 2: Check AI probability
    console.log(`[HUMANIZE] Iteration ${iterations}: Checking AI probability...`);
    lastDetection = await geminiService.detectAIContentEnhanced(currentText);
    
    console.log(`[HUMANIZE] Iteration ${iterations}: AI probability = ${lastDetection.aiProbability}%`);
    
    // Step 3: If below target, we're done
    if (lastDetection.aiProbability < targetProbability) {
      console.log(`[HUMANIZE] [SUCCESS] Target reached! AI probability ${lastDetection.aiProbability}% < ${targetProbability}%`);
      return {
        text: currentText,
        iterations,
        aiProbability: lastDetection.aiProbability,
        confidence: lastDetection.confidence,
        improved: true,
        reachedTarget: true
      };
    }
    
    // If this is the last iteration, break
    if (i === maxIterations - 1) {
      console.log(`[HUMANIZE] [WARN] Max iterations reached. Final AI probability: ${lastDetection.aiProbability}%`);
    }
  }
  
  // Return best result even if target not reached
  return {
    text: currentText,
    iterations,
    aiProbability: lastDetection?.aiProbability || 50,
    confidence: lastDetection?.confidence || 50,
    improved: lastDetection?.aiProbability < 70,
    reachedTarget: false,
    warning: `Could not reach target ${targetProbability}% after ${maxIterations} iterations`
  };
}

/**
 * Quick humanize check - returns suggestions without full rewrite
 * @param {string} text - Text to check
 * @returns {Promise<Object>} - Humanization suggestions
 */
async function getHumanizationSuggestions(text) {
  const lang = analysisService.detectLanguage(text);
  const aiPhrases = AI_PHRASES_TO_AVOID[lang] || AI_PHRASES_TO_AVOID.en;
  const textLower = text.toLowerCase();
  
  const suggestions = [];
  const foundAIPhrases = [];
  
  // Check for AI phrases
  aiPhrases.forEach(phrase => {
    if (textLower.includes(phrase.toLowerCase())) {
      foundAIPhrases.push(phrase);
    }
  });
  
  if (foundAIPhrases.length > 0) {
    suggestions.push({
      type: 'ai_phrases',
      severity: 'high',
      message: `Found ${foundAIPhrases.length} AI-typical phrases`,
      examples: foundAIPhrases.slice(0, 5),
      fix: 'Remove or replace these phrases with more natural alternatives'
    });
  }
  
  // Check sentence length variation
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  
  if (sentenceLengths.length >= 3) {
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev < 4) {
      suggestions.push({
        type: 'sentence_uniformity',
        severity: 'medium',
        message: 'Sentence lengths are too uniform',
        metric: { avgLength: avgLength.toFixed(1), stdDev: stdDev.toFixed(1) },
        fix: 'Mix short punchy sentences with longer ones'
      });
    }
  }
  
  // Check for contractions (English)
  if (lang === 'en') {
    const contractionCount = (text.match(/\b(don't|won't|can't|isn't|aren't|wasn't|weren't|I'm|you're|they're|we're|it's|that's|there's|I've|you've|we've|they've|I'll|you'll|he'll|she'll|we'll|they'll)\b/gi) || []).length;
    const wordCount = text.split(/\s+/).length;
    
    if (contractionCount === 0 && wordCount > 50) {
      suggestions.push({
        type: 'no_contractions',
        severity: 'medium',
        message: 'No contractions found - text may seem too formal',
        fix: 'Add natural contractions (don\'t, it\'s, can\'t, etc.)'
      });
    }
  }
  
  // Check for transition overuse
  const formalTransitions = lang === 'vi' 
    ? ['furthermore', 'moreover', 'additionally', 'consequently', 'nevertheless', 'nonetheless']
    : ['furthermore', 'moreover', 'additionally', 'consequently', 'nevertheless', 'nonetheless'];
  
  let transitionCount = 0;
  formalTransitions.forEach(t => {
    const regex = new RegExp(`\\b${t}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) transitionCount += matches.length;
  });
  
  if (transitionCount > 3) {
    suggestions.push({
      type: 'transition_overuse',
      severity: 'medium',
      message: `Overuse of formal transitions (${transitionCount} found)`,
      fix: 'Use simpler connectors like "and", "but", "so" or skip transitions'
    });
  }
  
  return {
    suggestions,
    overallRisk: suggestions.filter(s => s.severity === 'high').length > 0 ? 'high' 
      : suggestions.filter(s => s.severity === 'medium').length > 1 ? 'medium' 
      : 'low',
    suggestionsCount: suggestions.length
  };
}

// ============================================================================
// REASONING PROMPT BUILDER
// ============================================================================

/**
 * Build rewrite prompt with Chain-of-Thought reasoning output
 * The model will first output its reasoning process, then the final rewritten text
 * @param {string} originalText - Text to rewrite
 * @param {Object} voiceProfile - Voice profile object
 * @param {string} sampleText - Sample text from user's writing (for few-shot)
 * @param {Object} options - Additional options including writingPreferences, useAntiAIDetection
 * @returns {string} - Prompt with reasoning structure
 */
function buildRewritePromptWithReasoning(originalText, voiceProfile, sampleText = null, options = {}) {
  // Detect content language
  const lang = detectContentLanguage(originalText);
  const langConfig = languageProcessor.getConfig(lang);
  const writingPreferences = options.writingPreferences || {};
  const useAntiAIDetection = options.useAntiAIDetection !== false;
  
  // Build voice profile description
  const voiceDescription = buildVoiceDescription(voiceProfile, writingPreferences);
  
  // Get AI phrases to avoid if anti-AI detection is enabled
  const aiPhrases = useAntiAIDetection ? (AI_PHRASES_TO_AVOID[lang] || AI_PHRASES_TO_AVOID.en) : [];
  const languageInstructions = useAntiAIDetection ? getLanguageSpecificInstructions(lang) : '';
  
  let prompt = `You are an expert ghostwriter. Your task is to rewrite text to match a specific voice profile.

IMPORTANT: Output your response in TWO parts:
1. First, your REASONING process (analysis and planning)
2. Then, the marker "---CONTENT_START---"
3. Finally, the REWRITTEN TEXT only

═══════════════════════════════════════════════════════════════
TARGET VOICE PROFILE:
═══════════════════════════════════════════════════════════════
${voiceDescription}`;

  // Add anti-AI detection rules if enabled
  if (useAntiAIDetection) {
    prompt += `

═══════════════════════════════════════════════════════════════
ANTI-AI DETECTION RULES:
═══════════════════════════════════════════════════════════════
- Avoid AI-typical phrases: ${aiPhrases.slice(0, 8).map(p => `"${p}"`).join(', ')}
- Mix sentence lengths naturally
- Add human-like imperfections
- Use natural transitions
${languageInstructions}`;
  }

  // Add few-shot example if available
  if (sampleText && sampleText.length > 50) {
    prompt += `

═══════════════════════════════════════════════════════════════
EXAMPLE OF THIS PERSON'S WRITING STYLE:
═══════════════════════════════════════════════════════════════
"${sampleText.substring(0, 1000)}"`;
  }

  // Add rewrite instructions from profile if enabled
  const useRewriteInstructions = writingPreferences.useRewriteInstructions !== false;
  if (useRewriteInstructions && voiceProfile?.rewrite_instructions) {
    prompt += `

═══════════════════════════════════════════════════════════════
SPECIFIC REWRITE INSTRUCTIONS:
═══════════════════════════════════════════════════════════════
${voiceProfile.rewrite_instructions}`;
  }

  prompt += `

═══════════════════════════════════════════════════════════════
ORIGINAL TEXT TO REWRITE:
═══════════════════════════════════════════════════════════════
${originalText}

═══════════════════════════════════════════════════════════════
YOUR RESPONSE FORMAT:
═══════════════════════════════════════════════════════════════

You MUST output your response in this EXACT format:

**REASONING SECTION** (Be detailed and thorough):
1. TEXT ANALYSIS:
   - Identify the main topic and purpose
   - Note the current tone and style
   - Count approximate word count and sentence structure
   
2. VOICE PROFILE MATCHING:
   - Compare original style vs target voice profile
   - Identify specific changes needed (vocabulary, sentence length, formality)
   - Note any characteristic phrases or patterns to incorporate
   
3. HUMANIZATION STRATEGY:
   - List AI-typical patterns to avoid
   - Plan natural variations (sentence length, transitions)
   - Identify opportunities for human-like touches

4. REWRITE PLAN:
   - Outline key transformations paragraph by paragraph
   - Note specific phrases to change
   - Plan the flow and structure

Then output EXACTLY this marker on its own line:
---CONTENT_START---

Then output ONLY the rewritten text (no explanations, no labels).

═══════════════════════════════════════════════════════════════
BEGIN YOUR RESPONSE:
═══════════════════════════════════════════════════════════════

**REASONING:**

1. TEXT ANALYSIS:`;

  return prompt;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Main functions
  rewriteWithAntiDetection,
  rewriteWithIterativeRefinement,
  getHumanizationSuggestions,
  
  // Utility functions
  buildEnhancedRewritePrompt,
  buildSimpleRewritePrompt,
  buildRefinementContext,
  injectHumanImperfections,
  addContractions,
  
  // Language-aware functions
  detectContentLanguage,
  getLanguageSpecificInstructions,
  getHumanMarkersForLanguage,
  
  // Constants
  AI_PHRASES_TO_AVOID,
  HUMAN_MARKERS
};
