/**
 * Demo Samples Data - Internationalized
 * 
 * This file contains all demo text samples for the landing page demos.
 * All texts are retrieved from i18n translations to support multiple languages.
 * 
 * @module components/demos/demoSamples
 */

/**
 * Get AI Detection sample texts with pre-computed results
 * @param {Function} t - i18n translation function
 * @returns {Object} Sample texts object
 */
export const getAIDetectionSamples = (t) => ({
  ai: {
    id: 'ai',
    label: t('demo.aiText', 'AI Text'),
    labelKey: 'demo.aiText',
    text: t('demoSamples.aiDetection.ai.text'),
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
    text: t('demoSamples.aiDetection.human.text'),
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
    text: t('demoSamples.aiDetection.mixed.text'),
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

/**
 * Get Humanization sample texts
 * @param {Function} t - i18n translation function
 * @returns {Array} Array of sample objects
 */
export const getHumanizationSamples = (t) => [
  {
    id: 'formal',
    label: t('demo.samples.formalText', 'Formal Text'),
    original: t('demoSamples.humanization.formal.original'),
    humanized: t('demoSamples.humanization.formal.humanized')
  },
  {
    id: 'academic',
    label: t('demo.samples.academic', 'Academic'),
    original: t('demoSamples.humanization.academic.original'),
    humanized: t('demoSamples.humanization.academic.humanized')
  },
  {
    id: 'technical',
    label: t('demo.samples.technical', 'Technical'),
    original: t('demoSamples.humanization.technical.original'),
    humanized: t('demoSamples.humanization.technical.humanized')
  }
];

/**
 * Get Compatibility Score sample texts
 * @param {Function} t - i18n translation function
 * @returns {Array} Array of sample objects
 */
export const getCompatibilitySamples = (t) => [
  {
    id: 'high',
    label: t('demo.samples.highMatch', 'High Match'),
    text: t('demoSamples.compatibility.high.text'),
    score: 92,
    vectorScore: 94,
    statisticalScore: 89,
    confidence: 87,
    deviations: { mild: 1, moderate: 0, severe: 0 }
  },
  {
    id: 'medium',
    label: t('demo.samples.mediumMatch', 'Medium Match'),
    text: t('demoSamples.compatibility.medium.text'),
    score: 68,
    vectorScore: 72,
    statisticalScore: 63,
    confidence: 82,
    deviations: { mild: 2, moderate: 1, severe: 0 }
  },
  {
    id: 'low',
    label: t('demo.samples.lowMatch', 'Low Match'),
    text: t('demoSamples.compatibility.low.text'),
    score: 34,
    vectorScore: 38,
    statisticalScore: 29,
    confidence: 91,
    deviations: { mild: 1, moderate: 2, severe: 2 }
  }
];

/**
 * Get Deviations sample texts
 * @param {Function} t - i18n translation function
 * @returns {Array} Array of sample objects
 */
export const getDeviationsSamples = (t) => [
  {
    id: 'few',
    label: t('demo.samples.fewDeviations', 'Few Deviations'),
    text: t('demoSamples.deviations.few.text'),
    score: 88,
    avgSimilarity: 78,
    totalDeviant: 1,
    sentences: [
      { text: t('demoSamples.deviations.few.sentences.0'), isDeviant: false, severity: null, similarity: 0.92 },
      { text: t('demoSamples.deviations.few.sentences.1'), isDeviant: false, severity: null, similarity: 0.89 },
      { text: t('demoSamples.deviations.few.sentences.2'), isDeviant: true, severity: 'mild', similarity: 0.45 },
      { text: t('demoSamples.deviations.few.sentences.3'), isDeviant: false, severity: null, similarity: 0.87 }
    ],
    summary: { mild: 1, moderate: 0, severe: 0 }
  },
  {
    id: 'some',
    label: t('demo.samples.someDeviations', 'Some Deviations'),
    text: t('demoSamples.deviations.some.text'),
    score: 65,
    avgSimilarity: 48,
    totalDeviant: 3,
    sentences: [
      { text: t('demoSamples.deviations.some.sentences.0'), isDeviant: true, severity: 'moderate', similarity: 0.35 },
      { text: t('demoSamples.deviations.some.sentences.1'), isDeviant: true, severity: 'severe', similarity: 0.22 },
      { text: t('demoSamples.deviations.some.sentences.2'), isDeviant: true, severity: 'mild', similarity: 0.48 },
      { text: t('demoSamples.deviations.some.sentences.3'), isDeviant: false, severity: null, similarity: 0.85 }
    ],
    summary: { mild: 1, moderate: 1, severe: 1 }
  },
  {
    id: 'many',
    label: t('demo.samples.manyDeviations', 'Many Deviations'),
    text: t('demoSamples.deviations.many.text'),
    score: 32,
    avgSimilarity: 27,
    totalDeviant: 4,
    sentences: [
      { text: t('demoSamples.deviations.many.sentences.0'), isDeviant: true, severity: 'severe', similarity: 0.18 },
      { text: t('demoSamples.deviations.many.sentences.1'), isDeviant: true, severity: 'severe', similarity: 0.21 },
      { text: t('demoSamples.deviations.many.sentences.2'), isDeviant: true, severity: 'moderate', similarity: 0.32 },
      { text: t('demoSamples.deviations.many.sentences.3'), isDeviant: true, severity: 'moderate', similarity: 0.38 }
    ],
    summary: { mild: 0, moderate: 2, severe: 2 }
  }
];

/**
 * Get Statistics sample texts
 * @param {Function} t - i18n translation function
 * @returns {Array} Array of sample objects
 */
export const getStatisticsSamples = (t) => [
  {
    id: 'blog',
    label: t('demo.samples.blogPost', 'Blog Post'),
    text: t('demoSamples.statistics.blog.text'),
    stats: {
      totalWords: 48,
      totalSentences: 6,
      totalParagraphs: 1,
      avgWordLength: 4.6,
      avgSentenceLength: 8.0,
      vocabularyRichness: 0.85,
      punctuationRatio: 0.10,
      readabilityScore: 78,
      topSentenceStarters: ['writing', 'it\'s', 'short', 'they', 'longer'],
      transitionWordCount: 3
    },
    styleMatch: 'blog',
    benchmarkScore: 92
  },
  {
    id: 'academic',
    label: t('demo.samples.academic', 'Academic'),
    text: t('demoSamples.statistics.academic.text'),
    stats: {
      totalWords: 47,
      totalSentences: 2,
      totalParagraphs: 1,
      avgWordLength: 7.2,
      avgSentenceLength: 23.5,
      vocabularyRichness: 0.91,
      punctuationRatio: 0.06,
      readabilityScore: 28,
      topSentenceStarters: ['the implementation', 'furthermore'],
      transitionWordCount: 2
    },
    styleMatch: 'academic',
    benchmarkScore: 85
  },
  {
    id: 'casual',
    label: t('demo.samples.casual', 'Casual'),
    text: t('demoSamples.statistics.casual.text'),
    stats: {
      totalWords: 35,
      totalSentences: 6,
      totalParagraphs: 1,
      avgWordLength: 4.1,
      avgSentenceLength: 5.8,
      vocabularyRichness: 0.77,
      punctuationRatio: 0.14,
      readabilityScore: 89,
      topSentenceStarters: ['hey', 'so i', 'it was', 'the vibes', 'definitely'],
      transitionWordCount: 1
    },
    styleMatch: 'casual',
    benchmarkScore: 88
  }
];

/**
 * Get Rewrite sample texts
 * @param {Function} t - i18n translation function
 * @returns {Array} Array of sample objects
 */
export const getRewriteSamples = (t) => [
  {
    id: 'professional',
    label: t('demo.samples.professional', 'Professional'),
    original: t('demoSamples.rewrite.professional.original'),
    rewritten: t('demoSamples.rewrite.professional.rewritten')
  },
  {
    id: 'casual',
    label: t('demo.samples.casual', 'Casual'),
    original: t('demoSamples.rewrite.casual.original'),
    rewritten: t('demoSamples.rewrite.casual.rewritten')
  },
  {
    id: 'concise',
    label: t('demo.samples.concise', 'Concise'),
    original: t('demoSamples.rewrite.concise.original'),
    rewritten: t('demoSamples.rewrite.concise.rewritten')
  }
];

/**
 * Get Workspace demo response
 * @param {Function} t - i18n translation function
 * @returns {string} Demo response text
 */
export const getWorkspaceDemoResponse = (t) => t('demoSamples.workspace.response');

export default {
  getAIDetectionSamples,
  getHumanizationSamples,
  getCompatibilitySamples,
  getDeviationsSamples,
  getStatisticsSamples,
  getRewriteSamples,
  getWorkspaceDemoResponse
};
