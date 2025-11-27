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

/**
 * Common AI phrases to avoid - these are red flags for AI detection
 */
const AI_PHRASES_TO_AVOID = {
  en: [
    // Hedging phrases
    "it's important to note", "it should be noted", "it is worth mentioning",
    "it is essential to", "it is crucial to", "it is vital to",
    "one might argue", "it could be argued", "it can be said",
    // Transition overuse
    "furthermore", "moreover", "additionally", "consequently",
    "subsequently", "nevertheless", "nonetheless", "hence", "thus",
    "in addition to this", "on the other hand", "in light of",
    // Formal fillers
    "in today's world", "in this day and age", "at the end of the day",
    "first and foremost", "last but not least", "needless to say",
    // AI-specific patterns
    "as an ai", "i cannot", "i'm unable to", "i don't have the ability",
    "delve into", "dive into", "unpack", "leverage", "utilize",
    "facilitate", "implement", "comprehensive", "robust",
    // Conclusion patterns
    "in conclusion", "to summarize", "in summary", "to sum up",
    "all in all", "overall", "ultimately"
  ],
  vi: [
    // Formal phrases
    "it is important to note", "it is crucial", "it is essential",
    "it cannot be denied", "it is clear", "it is obvious",
    // Transition overuse
    "however", "moreover", "besides", "therefore", "thus",
    "nevertheless", "although", "yet", "but",
    // Formal fillers
    "in today's world", "in the current context",
    "first of all", "last but not least",
    // Conclusion patterns
    "in summary", "in conclusion", "to summarize", "overall"
  ]
};

/**
 * Human-like markers to encourage
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
  },
  vi: {
    fillers: ["actually", "basically", "honestly", "clearly", "truly"],
    starters: ["And", "But", "So", "Overall", "Really", "Well"],
    opinions: ["I think", "I believe", "I feel", "personally", "to me"]
  }
};

// ============================================================================
// ENHANCED PROMPT BUILDER
// ============================================================================

/**
 * Build enhanced rewrite prompt with anti-AI detection rules
 * @param {string} originalText - Text to rewrite
 * @param {Object} voiceProfile - Voice profile object
 * @param {string} sampleText - Sample text from user's writing (for few-shot)
 * @param {Object} options - Additional options
 * @returns {string} - Enhanced prompt
 */
function buildEnhancedRewritePrompt(originalText, voiceProfile, sampleText = null, options = {}) {
  const lang = analysisService.detectLanguage(originalText);
  const aiPhrases = AI_PHRASES_TO_AVOID[lang] || AI_PHRASES_TO_AVOID.en;
  
  // Build voice profile description
  let voiceDescription = '';
  if (typeof voiceProfile === 'object' && voiceProfile.tone) {
    voiceDescription = `
TONE: ${voiceProfile.tone}
FORMALITY LEVEL: ${voiceProfile.formality_level}/10
KEY CHARACTERISTICS: ${(voiceProfile.key_characteristics || []).join(', ')}
SENTENCE STARTERS: ${(voiceProfile.sentence_starters || []).join(', ')}
TRANSITION PREFERENCES: ${(voiceProfile.transition_preferences || []).join(', ')}
PUNCTUATION STYLE: ${voiceProfile.punctuation_style || 'Standard'}
SENTENCE STRUCTURE: ${voiceProfile.sentence_patterns?.structure_preference || 'varied'}
OPENING STYLE: ${voiceProfile.sentence_patterns?.opening_style || 'Natural'}`;

    if (voiceProfile.vocabulary_preferences) {
      const vocab = voiceProfile.vocabulary_preferences;
      if (vocab.common_phrases?.length > 0) {
        voiceDescription += `\nCOMMON PHRASES: ${vocab.common_phrases.join(', ')}`;
      }
      if (vocab.preferred_connectors?.length > 0) {
        voiceDescription += `\nPREFERRED CONNECTORS: ${vocab.preferred_connectors.join(', ')}`;
      }
      if (vocab.avoid_words?.length > 0) {
        voiceDescription += `\nWORDS TO AVOID: ${vocab.avoid_words.join(', ')}`;
      }
    }
  } else {
    voiceDescription = String(voiceProfile);
  }

  // Build the enhanced prompt
  let prompt = `You are an expert ghostwriter who must rewrite text to PERFECTLY match a specific human's writing style. Your goal is to make the output COMPLETELY INDISTINGUISHABLE from human writing.

═══════════════════════════════════════════════════════════════
CRITICAL ANTI-AI DETECTION RULES (MUST FOLLOW):
═══════════════════════════════════════════════════════════════

1. BANNED PHRASES - NEVER use these AI-typical phrases:
   ${aiPhrases.slice(0, 15).map(p => `"${p}"`).join(', ')}

2. SENTENCE VARIATION - Mix sentence lengths naturally:
   - Include some short punchy sentences (3-8 words)
   - Include some medium sentences (10-18 words)
   - Occasionally use longer sentences (20-30 words)
   - NEVER have 3+ sentences of similar length in a row

3. CONTRACTIONS - Use contractions naturally (${lang === 'vi' ? 'if applicable' : '60-70% of the time'}):
   - "do not" → "don't", "it is" → "it's", "cannot" → "can't"
   - Mix contracted and non-contracted forms

4. NATURAL IMPERFECTIONS - Include human-like patterns:
   - Start some sentences with "And", "But", "So" (if style allows)
   - Use occasional sentence fragments for emphasis
   - Include "..." for trailing thoughts (sparingly)
   - Don't over-explain or be too comprehensive

5. AVOID PERFECT STRUCTURE:
   - Don't use perfect parallel structure in every list
   - Vary paragraph lengths
   - Don't always have intro-body-conclusion in every section

6. PERSONAL VOICE - Add authenticity markers:
   - Include opinion phrases: "I think", "honestly", "to be fair"
   - Show personality through word choice
   - Don't be overly neutral or balanced on everything

7. TRANSITION VARIETY:
   - Don't overuse formal transitions
   - Use simple connectors: "and", "but", "so", "then"
   - Sometimes skip transitions entirely between related ideas

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

  // Add rewrite instructions from profile if available
  if (voiceProfile?.rewrite_instructions) {
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
async function rewriteWithAntiDetection(originalText, voiceProfile, context = {}, modelName = 'gemini-2.0-flash-exp') {
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
    
    // Build enhanced prompt
    const prompt = buildEnhancedRewritePrompt(
      originalText, 
      voiceProfile, 
      sampleText,
      { refinementContext: context.refinementContext }
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
  const modelName = options.model || 'gemini-2.0-flash-exp';
  
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
// EXPORTS
// ============================================================================

module.exports = {
  // Main functions
  rewriteWithAntiDetection,
  rewriteWithIterativeRefinement,
  getHumanizationSuggestions,
  
  // Utility functions
  buildEnhancedRewritePrompt,
  buildRefinementContext,
  injectHumanImperfections,
  addContractions,
  
  // Constants
  AI_PHRASES_TO_AVOID,
  HUMAN_MARKERS
};
