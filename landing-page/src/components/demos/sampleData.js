/**
 * Sample Data for AI Detection Demo
 * 
 * Pre-computed results matching real API response format.
 * These are used for sample text selections to avoid API calls
 * and provide instant feedback to users.
 * 
 * Now supports i18n - use getSampleTexts(t) to get localized samples.
 * 
 * @module components/demos/sampleData
 */

/**
 * Get sample texts with pre-computed detection results (i18n supported)
 * @param {Function} t - i18n translation function
 * @returns {Object} Sample texts object with localized content
 */
export const getSampleTexts = (t) => ({
  ai: {
    id: 'ai',
    label: t('demo.aiText', 'AI Text'),
    labelKey: 'demo.aiText',
    text: t('demoSamples.aiDetection.ai.text', `The implementation of artificial intelligence in modern healthcare systems represents a paradigm shift in medical diagnostics and patient care. Machine learning algorithms have demonstrated remarkable accuracy in analyzing medical imaging data, often surpassing human radiologists in detecting certain conditions. Furthermore, natural language processing enables efficient extraction of relevant information from electronic health records, facilitating more informed clinical decision-making. The integration of these technologies promises to revolutionize patient outcomes while optimizing resource allocation across healthcare institutions.`),
    result: {
      success: true,
      ai_probability: 87,
      confidence: 92,
      confidence_level: 'high',
      verdict: t('demo.verdictAI', 'AI-generated'),
      human_indicators: [],
      ai_indicators: [
        t('demo.indicators.ai.consistentFormalTone', 'Consistent formal tone throughout'),
        t('demo.indicators.ai.technicalVocabulary', 'Technical vocabulary usage'),
        t('demo.indicators.ai.structuredParagraphFlow', 'Structured paragraph flow'),
        t('demo.indicators.ai.lackOfPersonalExpressions', 'Lack of personal expressions'),
        t('demoSamples.aiDetection.ai.indicators.predictablePatterns', 'Predictable sentence patterns')
      ],
      text_statistics: {
        totalWords: 89,
        totalSentences: 4,
        avgWordLength: 6.2,
        avgSentenceLength: 22.3,
        readabilityScore: 28
      }
    }
  },
  human: {
    id: 'human',
    label: t('demo.humanText', 'Human Text'),
    labelKey: 'demo.humanText',
    text: t('demoSamples.aiDetection.human.text', `I've been thinking about this problem for weeks now, and honestly? It's driving me crazy. Every time I think I've figured it out, something new pops up. My colleague Sarah suggested we try a different approach - maybe we're overcomplicating things. She's probably right. We tend to do that a lot around here, especially when deadlines are looming. Yesterday I stayed up until 2am trying to crack it, fueled by way too much coffee. Not my proudest moment, but hey, that's startup life for you.`),
    result: {
      success: true,
      ai_probability: 18,
      confidence: 88,
      confidence_level: 'high',
      verdict: t('demo.verdictHuman', 'Human-written'),
      human_indicators: [
        t('demo.indicators.human.personalPronouns', 'Personal pronouns detected'),
        t('demo.indicators.human.informalLanguage', 'Informal language patterns'),
        t('demo.indicators.human.emotionalExpressions', 'Emotional expressions present'),
        t('demo.indicators.human.variedSentenceStructure', 'Varied sentence structure'),
        t('demoSamples.aiDetection.human.indicators.conversationalTone', 'Conversational tone')
      ],
      ai_indicators: [],
      text_statistics: {
        totalWords: 98,
        totalSentences: 8,
        avgWordLength: 4.3,
        avgSentenceLength: 12.3,
        readabilityScore: 72
      }
    }
  },
  mixed: {
    id: 'mixed',
    label: t('demo.mixedText', 'Mixed'),
    labelKey: 'demo.mixedText',
    text: t('demoSamples.aiDetection.mixed.text', `Artificial intelligence has revolutionized content creation through sophisticated algorithms and neural networks. But here's the thing - I still think there's something special about human creativity that machines can't quite capture. Sure, AI can generate technically perfect prose, but can it tell you about that time I accidentally sent an embarrassing email to my entire team? I don't think so! The intersection of human intuition and machine precision creates opportunities for unprecedented innovation in creative fields.`),
    result: {
      success: true,
      ai_probability: 52,
      confidence: 75,
      confidence_level: 'medium',
      verdict: t('demo.verdictMixed', 'Mixed content'),
      human_indicators: [
        t('demo.indicators.human.personalAnecdotes', 'Personal anecdotes present'),
        t('demo.indicators.human.informalExpressions', 'Informal expressions used'),
        t('demoSamples.aiDetection.mixed.indicators.rhetoricalQuestions', 'Rhetorical questions detected')
      ],
      ai_indicators: [
        t('demo.indicators.ai.technicalTerminology', 'Technical terminology detected'),
        t('demo.indicators.ai.formalSentenceStructures', 'Formal sentence structures'),
        t('demoSamples.aiDetection.mixed.indicators.academicVocabulary', 'Academic vocabulary present')
      ],
      text_statistics: {
        totalWords: 91,
        totalSentences: 6,
        avgWordLength: 5.1,
        avgSentenceLength: 15.2,
        readabilityScore: 52
      }
    }
  }
});

// Legacy export for backward compatibility (English only)
export const SAMPLE_TEXTS = {
  ai: {
    id: 'ai',
    label: 'AI Text',
    labelKey: 'demo.aiText',
    text: `The implementation of artificial intelligence in modern healthcare systems represents a paradigm shift in medical diagnostics and patient care. Machine learning algorithms have demonstrated remarkable accuracy in analyzing medical imaging data, often surpassing human radiologists in detecting certain conditions. Furthermore, natural language processing enables efficient extraction of relevant information from electronic health records, facilitating more informed clinical decision-making. The integration of these technologies promises to revolutionize patient outcomes while optimizing resource allocation across healthcare institutions.`,
    result: {
      success: true,
      ai_probability: 87,
      confidence: 92,
      confidence_level: 'high',
      verdict: 'AI-generated',
      human_indicators: [],
      ai_indicators: [
        'Consistent formal tone throughout',
        'Technical vocabulary usage',
        'Structured paragraph flow',
        'Lack of personal expressions',
        'Predictable sentence patterns'
      ],
      text_statistics: {
        totalWords: 89,
        totalSentences: 4,
        avgWordLength: 6.2,
        avgSentenceLength: 22.3,
        readabilityScore: 28
      }
    }
  },
  human: {
    id: 'human',
    label: 'Human Text',
    labelKey: 'demo.humanText',
    text: `I've been thinking about this problem for weeks now, and honestly? It's driving me crazy. Every time I think I've figured it out, something new pops up. My colleague Sarah suggested we try a different approach - maybe we're overcomplicating things. She's probably right. We tend to do that a lot around here, especially when deadlines are looming. Yesterday I stayed up until 2am trying to crack it, fueled by way too much coffee. Not my proudest moment, but hey, that's startup life for you.`,
    result: {
      success: true,
      ai_probability: 18,
      confidence: 88,
      confidence_level: 'high',
      verdict: 'Human-written',
      human_indicators: [
        'Personal pronouns detected',
        'Informal language patterns',
        'Emotional expressions present',
        'Varied sentence structure',
        'Conversational tone'
      ],
      ai_indicators: [],
      text_statistics: {
        totalWords: 98,
        totalSentences: 8,
        avgWordLength: 4.3,
        avgSentenceLength: 12.3,
        readabilityScore: 72
      }
    }
  },
  mixed: {
    id: 'mixed',
    label: 'Mixed',
    labelKey: 'demo.mixedText',
    text: `Artificial intelligence has revolutionized content creation through sophisticated algorithms and neural networks. But here's the thing - I still think there's something special about human creativity that machines can't quite capture. Sure, AI can generate technically perfect prose, but can it tell you about that time I accidentally sent an embarrassing email to my entire team? I don't think so! The intersection of human intuition and machine precision creates opportunities for unprecedented innovation in creative fields.`,
    result: {
      success: true,
      ai_probability: 52,
      confidence: 75,
      confidence_level: 'medium',
      verdict: 'Mixed content',
      human_indicators: [
        'Personal anecdotes present',
        'Informal expressions used',
        'Rhetorical questions detected'
      ],
      ai_indicators: [
        'Technical terminology detected',
        'Formal sentence structures',
        'Academic vocabulary present'
      ],
      text_statistics: {
        totalWords: 91,
        totalSentences: 6,
        avgWordLength: 5.1,
        avgSentenceLength: 15.2,
        readabilityScore: 52
      }
    }
  }
};

/**
 * Get sample data by type
 * @param {string} type - Sample type ('ai', 'human', 'mixed')
 * @returns {Object|null} Sample data or null if not found
 */
export const getSampleByType = (type) => {
  // Use hasOwnProperty to avoid prototype chain issues
  if (Object.prototype.hasOwnProperty.call(SAMPLE_TEXTS, type)) {
    return SAMPLE_TEXTS[type];
  }
  return null;
};

/**
 * Get all sample types for rendering buttons
 * @returns {Array} Array of sample type objects
 */
export const getSampleTypes = () => {
  return Object.values(SAMPLE_TEXTS).map(({ id, label, labelKey }) => ({
    id,
    label,
    labelKey
  }));
};

/**
 * Check if a text matches any sample text exactly
 * @param {string} text - Text to check
 * @returns {string|null} Sample type if match found, null otherwise
 */
export const findMatchingSample = (text) => {
  const trimmedText = text?.trim();
  for (const [type, sample] of Object.entries(SAMPLE_TEXTS)) {
    if (sample.text.trim() === trimmedText) {
      return type;
    }
  }
  return null;
};

/**
 * Simulated loading delay range for sample results (ms)
 */
export const SAMPLE_LOADING_DELAY = {
  min: 500,
  max: 800
};

/**
 * Get random delay within the sample loading range
 * @returns {number} Delay in milliseconds
 */
export const getRandomLoadingDelay = () => {
  const { min, max } = SAMPLE_LOADING_DELAY;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export default SAMPLE_TEXTS;
