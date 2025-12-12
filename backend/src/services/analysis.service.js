/**
 * Analysis Service
 * Text analysis, statistics, and similarity calculations
 */

const nlpUtils = require('../utils/nlp');

const logger = require('../utils/logger');
// ============================================================================
// INDUSTRY BENCHMARKS - Industry standards for comparison
// ============================================================================

const BENCHMARKS = {
  // Standards for English text
  en: {
    blog: {
      avgWordLength: { min: 4.0, max: 5.5, ideal: 4.8 },
      avgSentenceLength: { min: 12, max: 20, ideal: 15 },
      readabilityScore: { min: 60, max: 80, ideal: 70 },
      vocabularyRichness: { min: 0.4, max: 0.7, ideal: 0.55 },
      punctuationRatio: { min: 0.05, max: 0.15, ideal: 0.1 }
    },
    academic: {
      avgWordLength: { min: 5.0, max: 7.0, ideal: 5.8 },
      avgSentenceLength: { min: 18, max: 30, ideal: 22 },
      readabilityScore: { min: 30, max: 50, ideal: 40 },
      vocabularyRichness: { min: 0.5, max: 0.8, ideal: 0.65 },
      punctuationRatio: { min: 0.08, max: 0.18, ideal: 0.12 }
    },
    casual: {
      avgWordLength: { min: 3.5, max: 5.0, ideal: 4.2 },
      avgSentenceLength: { min: 8, max: 15, ideal: 12 },
      readabilityScore: { min: 70, max: 90, ideal: 80 },
      vocabularyRichness: { min: 0.35, max: 0.6, ideal: 0.45 },
      punctuationRatio: { min: 0.03, max: 0.12, ideal: 0.08 }
    },
    professional: {
      avgWordLength: { min: 4.5, max: 6.0, ideal: 5.2 },
      avgSentenceLength: { min: 14, max: 22, ideal: 18 },
      readabilityScore: { min: 45, max: 65, ideal: 55 },
      vocabularyRichness: { min: 0.45, max: 0.7, ideal: 0.58 },
      punctuationRatio: { min: 0.06, max: 0.14, ideal: 0.1 }
    }
  },
  // Standards for Vietnamese text
  vi: {
    blog: {
      avgWordLength: { min: 3.0, max: 4.5, ideal: 3.8 },
      avgSentenceLength: { min: 15, max: 25, ideal: 20 },
      readabilityScore: { min: 50, max: 75, ideal: 65 },
      vocabularyRichness: { min: 0.35, max: 0.6, ideal: 0.48 },
      punctuationRatio: { min: 0.04, max: 0.12, ideal: 0.08 }
    },
    academic: {
      avgWordLength: { min: 3.5, max: 5.0, ideal: 4.2 },
      avgSentenceLength: { min: 20, max: 35, ideal: 28 },
      readabilityScore: { min: 35, max: 55, ideal: 45 },
      vocabularyRichness: { min: 0.45, max: 0.75, ideal: 0.6 },
      punctuationRatio: { min: 0.06, max: 0.15, ideal: 0.1 }
    },
    casual: {
      avgWordLength: { min: 2.5, max: 4.0, ideal: 3.2 },
      avgSentenceLength: { min: 10, max: 18, ideal: 14 },
      readabilityScore: { min: 65, max: 85, ideal: 75 },
      vocabularyRichness: { min: 0.3, max: 0.55, ideal: 0.42 },
      punctuationRatio: { min: 0.03, max: 0.1, ideal: 0.06 }
    },
    professional: {
      avgWordLength: { min: 3.2, max: 4.8, ideal: 4.0 },
      avgSentenceLength: { min: 16, max: 26, ideal: 21 },
      readabilityScore: { min: 45, max: 65, ideal: 55 },
      vocabularyRichness: { min: 0.4, max: 0.65, ideal: 0.52 },
      punctuationRatio: { min: 0.05, max: 0.12, ideal: 0.08 }
    }
  }
};

// Extended English transition words
const VIETNAMESE_TRANSITION_WORDS = [
  // Addition/listing
  'moreover', 'furthermore', 'additionally', 'besides', 'also', 'meanwhile', 'on the other hand',
  'not only', 'not just', 'both', 'as well as', 'even', 'especially', 'in particular',
  // Cause/result
  'therefore', 'thus', 'hence', 'consequently', 'because', 'since', 'as', 'due to',
  'as a result', 'as a consequence', 'leads to', 'causes', 'from this', 'thanks to', 'because of this',
  // Contrast
  'however', 'but', 'yet', 'still', 'nevertheless', 'nonetheless', 'although', 'though',
  'even though', 'despite', 'in spite of', 'conversely', 'on the contrary', 'while',
  // Time/sequence
  'first', 'firstly', 'initially', 'first of all', 'second', 'third', 'next',
  'then', 'after that', 'finally', 'in conclusion', 'in summary', 'overall', 'in general',
  // Condition
  'if', 'suppose', 'in case', 'provided that', 'on condition that', 'unless',
  // Emphasis
  'actually', 'really', 'in fact', 'clearly', 'obviously', 'certainly',
  'indeed', 'truly', 'actually', 'clearly'
];

// ============================================================================
// TEXT STATISTICS
// ============================================================================

function calculateStatistics(text) {
  const lang = nlpUtils.detectLanguage(text);
  const sentences = nlpUtils.splitIntoSentences(text);
  const words = nlpUtils.tokenize(text.toLowerCase());

  const wordLengths = words.map(w => w.length);
  const avgWordLength = wordLengths.length > 0
    ? wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length
    : 0;

  const sentenceLengths = sentences.map(s => {
    const sentenceWords = nlpUtils.tokenize(s);
    return sentenceWords.length;
  });
  const avgSentenceLength = sentenceLengths.length > 0
    ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
    : 0;

  const uniqueWords = new Set(words);
  const vocabularyRichness = words.length > 0 ? uniqueWords.size / words.length : 0;

  const punctuationCount = (text.match(/[,;:!?]/g) || []).length;
  const punctuationRatio = words.length > 0 ? punctuationCount / words.length : 0;

  // Calculate syllable and readability by language
  const syllableCount = lang === 'vi' 
    ? countVietnameseSyllables(text)
    : words.reduce((sum, word) => sum + countSyllables(word), 0);
  
  const readabilityScore = lang === 'vi'
    ? calculateVietnameseReadability(words.length, sentences.length, avgSentenceLength, avgWordLength)
    : calculateReadability(words.length, sentences.length, syllableCount);

  // Sentence starter patterns
  const sentenceStarters = sentences.map(s => {
    const sentenceWords = nlpUtils.tokenize(s);
    return sentenceWords.slice(0, 2).join(' ').toLowerCase();
  }).filter(s => s.length > 0);
  
  const starterFreq = {};
  sentenceStarters.forEach(starter => {
    starterFreq[starter] = (starterFreq[starter] || 0) + 1;
  });
  
  const topStarters = Object.entries(starterFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([starter]) => starter);

  // Transition words frequency - by language
  const transitionWords = lang === 'vi' 
    ? VIETNAMESE_TRANSITION_WORDS
    : [
        'however', 'therefore', 'moreover', 'furthermore', 'but', 'and', 'so', 
        'because', 'although', 'while', 'meanwhile', 'thus', 'hence', 'consequently',
        'additionally', 'also', 'besides', 'nevertheless', 'nonetheless', 'yet'
      ];
  
  const textLower = text.toLowerCase();
  const transitionCounts = {};
  
  transitionWords.forEach(tw => {
    // For Vietnamese, no word boundary needed as words are separated by spaces
    const regex = lang === 'vi' 
      ? new RegExp(tw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      : new RegExp(`\\b${tw}\\b`, 'gi');
    const matches = textLower.match(regex);
    if (matches && matches.length > 0) {
      transitionCounts[tw] = matches.length;
    }
  });

  // Average paragraph length
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  const avgParagraphLength = paragraphs.length > 0
    ? paragraphs.reduce((sum, p) => {
        const pWords = nlpUtils.tokenize(p);
        return sum + pWords.length;
      }, 0) / paragraphs.length
    : 0;

  return {
    avgWordLength: parseFloat(avgWordLength.toFixed(2)),
    avgSentenceLength: parseFloat(avgSentenceLength.toFixed(2)),
    vocabularyRichness: parseFloat(vocabularyRichness.toFixed(3)),
    punctuationRatio: parseFloat(punctuationRatio.toFixed(3)),
    totalWords: words.length,
    totalSentences: sentences.length,
    totalParagraphs: paragraphs.length,
    readabilityScore: parseFloat(readabilityScore.toFixed(2)),
    topSentenceStarters: topStarters,
    transitionWordUsage: transitionCounts,
    transitionWordCount: Object.values(transitionCounts).reduce((a, b) => a + b, 0),
    avgParagraphLength: parseFloat(avgParagraphLength.toFixed(2)),
    detectedLanguage: lang
  };
}

/**
 * Count Vietnamese syllables - each Vietnamese word is typically 1 syllable
 */
function countVietnameseSyllables(text) {
  // Vietnamese: each word (separated by spaces) is typically 1 syllable
  const words = text.split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

/**
 * Calculate readability for Vietnamese
 * Based on: average sentence length and average word length
 * Custom formula for Vietnamese
 */
function calculateVietnameseReadability(wordCount, sentenceCount, avgSentenceLength, avgWordLength) {
  if (sentenceCount === 0 || wordCount === 0) return 0;
  
  // Readability formula for Vietnamese:
  // - Shorter sentences = more readable
  // - Shorter words = more readable
  // Base score: 100
  // Deduct points based on sentence and word length
  
  const sentencePenalty = Math.max(0, (avgSentenceLength - 15) * 2); // Sentences > 15 words lose points
  const wordPenalty = Math.max(0, (avgWordLength - 3.5) * 10); // Words > 3.5 characters lose points
  
  const score = 100 - sentencePenalty - wordPenalty;
  return Math.max(0, Math.min(100, score));
}

function countSyllables(word) {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

function calculateReadability(wordCount, sentenceCount, syllableCount) {
  if (sentenceCount === 0 || wordCount === 0) return 0;
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;
  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  return Math.max(0, Math.min(100, score));
}

/**
 * Compare stats with profile and benchmark
 * @param {Object} textStats - Current text statistics
 * @param {Object} profileStats - Statistics from profile (optional)
 * @param {string} styleType - Text type: 'blog', 'academic', 'casual', 'professional'
 * @returns {Object} - Comparison result with improvement suggestions
 */
function compareWithBenchmark(textStats, profileStats = null, styleType = 'blog') {
  const lang = textStats.detectedLanguage || 'en';
  const benchmark = BENCHMARKS[lang]?.[styleType] || BENCHMARKS.en.blog;
  
  const comparison = {};
  const suggestions = [];
  let overallScore = 0;
  let totalMetrics = 0;

  // Compare each metric
  const metrics = ['avgWordLength', 'avgSentenceLength', 'readabilityScore', 'vocabularyRichness', 'punctuationRatio'];
  
  metrics.forEach(metric => {
    const value = textStats[metric];
    const bench = benchmark[metric];
    const profileValue = profileStats?.[metric];
    
    if (value === undefined || !bench) return;
    
    totalMetrics++;
    
    // Calculate score against benchmark
    let benchmarkScore = 100;
    let status = 'good';
    let deviation = 0;
    
    if (value < bench.min) {
      deviation = ((bench.min - value) / bench.min) * 100;
      benchmarkScore = Math.max(0, 100 - deviation);
      status = 'low';
    } else if (value > bench.max) {
      deviation = ((value - bench.max) / bench.max) * 100;
      benchmarkScore = Math.max(0, 100 - deviation);
      status = 'high';
    } else {
      // Within good range, calculate score based on distance from ideal
      const distanceFromIdeal = Math.abs(value - bench.ideal);
      const maxDistance = Math.max(bench.ideal - bench.min, bench.max - bench.ideal);
      benchmarkScore = 100 - (distanceFromIdeal / maxDistance) * 20; // Max deduction 20 points
    }
    
    overallScore += benchmarkScore;
    
    // Compare with profile if available
    let profileComparison = null;
    if (profileValue !== undefined) {
      const profileDiff = ((value - profileValue) / profileValue) * 100;
      profileComparison = {
        profileValue: profileValue,
        difference: parseFloat(profileDiff.toFixed(1)),
        status: Math.abs(profileDiff) < 15 ? 'match' : (profileDiff > 0 ? 'higher' : 'lower')
      };
    }
    
    comparison[metric] = {
      value: value,
      benchmark: bench,
      benchmarkScore: parseFloat(benchmarkScore.toFixed(1)),
      status,
      deviation: parseFloat(deviation.toFixed(1)),
      profileComparison
    };
    
    // Generate improvement suggestions
    if (status !== 'good') {
      suggestions.push(generateSuggestion(metric, status, value, bench, lang));
    }
  });

  return {
    comparison,
    suggestions,
    overallBenchmarkScore: totalMetrics > 0 ? parseFloat((overallScore / totalMetrics).toFixed(1)) : 0,
    styleType,
    language: lang
  };
}

/**
 * Generate improvement suggestions based on metric
 */
function generateSuggestion(metric, status, value, benchmark, lang) {
  const suggestions = {
    avgWordLength: {
      low: {
        en: `Your average word length (${value.toFixed(1)}) is below the recommended range. Consider using more descriptive vocabulary.`,
        vi: `Your average word length (${value.toFixed(1)}) is below the recommended range. Consider using more descriptive vocabulary.`
      },
      high: {
        en: `Your average word length (${value.toFixed(1)}) is above the recommended range. Consider simplifying some complex words.`,
        vi: `Your average word length (${value.toFixed(1)}) is above the recommended range. Consider simplifying some complex words.`
      }
    },
    avgSentenceLength: {
      low: {
        en: `Your sentences are quite short (avg ${value.toFixed(0)} words). Consider combining some ideas for better flow.`,
        vi: `Your sentences are quite short (avg ${value.toFixed(0)} words). Consider combining some ideas for better flow.`
      },
      high: {
        en: `Your sentences are quite long (avg ${value.toFixed(0)} words). Consider breaking them into shorter sentences for clarity.`,
        vi: `Your sentences are quite long (avg ${value.toFixed(0)} words). Consider breaking them into shorter sentences for clarity.`
      }
    },
    readabilityScore: {
      low: {
        en: `Readability score (${value.toFixed(0)}) is low. Try using simpler words and shorter sentences.`,
        vi: `Readability score (${value.toFixed(0)}) is low. Try using simpler words and shorter sentences.`
      },
      high: {
        en: `Readability score (${value.toFixed(0)}) is very high. Your text might be too simple for the target audience.`,
        vi: `Readability score (${value.toFixed(0)}) is very high. Your text might be too simple for the target audience.`
      }
    },
    vocabularyRichness: {
      low: {
        en: `Vocabulary richness (${(value * 100).toFixed(0)}%) is low. Try using more varied words to avoid repetition.`,
        vi: `Vocabulary richness (${(value * 100).toFixed(0)}%) is low. Try using more varied words to avoid repetition.`
      },
      high: {
        en: `Vocabulary richness (${(value * 100).toFixed(0)}%) is very high. Consider some repetition for emphasis and clarity.`,
        vi: `Vocabulary richness (${(value * 100).toFixed(0)}%) is very high. Consider some repetition for emphasis and clarity.`
      }
    },
    punctuationRatio: {
      low: {
        en: `Punctuation usage is low. Consider adding commas or other punctuation for better rhythm.`,
        vi: `Punctuation usage is low. Consider adding commas or other punctuation for better rhythm.`
      },
      high: {
        en: `Punctuation usage is high. Consider reducing excessive commas or punctuation marks.`,
        vi: `Punctuation usage is high. Consider reducing excessive commas or punctuation marks.`
      }
    }
  };

  return {
    metric,
    status,
    currentValue: value,
    recommendedRange: `${benchmark.min} - ${benchmark.max}`,
    idealValue: benchmark.ideal,
    message: suggestions[metric]?.[status]?.[lang] || suggestions[metric]?.[status]?.en || 'Consider adjusting this metric.'
  };
}

function splitIntoSentences(text) {
  return nlpUtils.splitIntoSentences(text).filter(s => s.trim().length > 0);
}

// ============================================================================
// SIMILARITY CALCULATIONS
// ============================================================================

function calculateCosineSimilarity(vector1, vector2) {
  // Check for null/undefined vectors
  if (!vector1 || !vector2) {
    logger.warn('[WARN] calculateCosineSimilarity: null/undefined vector', { 
      hasVector1: !!vector1, 
      hasVector2: !!vector2 
    });
    return 0;
  }
  
  if (!Array.isArray(vector1) || !Array.isArray(vector2)) {
    logger.warn('[WARN] calculateCosineSimilarity: non-array vector', { 
      vector1Type: typeof vector1, 
      vector2Type: typeof vector2 
    });
    return 0;
  }
  
  if (vector1.length !== vector2.length) {
    logger.warn('[WARN] calculateCosineSimilarity: length mismatch', { 
      vector1Length: vector1.length, 
      vector2Length: vector2.length 
    });
    return 0;
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
    norm1 += vector1[i] * vector1[i];
    norm2 += vector2[i] * vector2[i];
  }

  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (norm1 * norm2);
}

/**
 * Enhanced statistical features comparison
 * Now includes sentence starters, transition words, and paragraph length
 * @param {Object} features1 - Text features to analyze
 * @param {Object} features2 - Profile features to compare against
 * @returns {Object} - { score, breakdown, confidence }
 */
function compareStatisticalFeatures(features1, features2) {
  if (!features2) return { score: 50, breakdown: {}, confidence: 0 };

  // Enhanced weights - now totaling 1.0
  const weights = {
    avgWordLength: 0.12,
    avgSentenceLength: 0.15,
    readabilityScore: 0.15,
    vocabularyRichness: 0.12,
    punctuationRatio: 0.10,
    avgParagraphLength: 0.08,
    sentenceStarterSimilarity: 0.14,
    transitionWordSimilarity: 0.14
  };

  let totalSimilarity = 0;
  let totalWeight = 0;
  const breakdown = {};

  // Basic numeric features comparison
  const numericFeatures = ['avgWordLength', 'avgSentenceLength', 'readabilityScore', 'vocabularyRichness', 'punctuationRatio', 'avgParagraphLength'];
  
  for (const feature of numericFeatures) {
    const val1 = features1[feature];
    const val2 = features2[feature];
    const weight = weights[feature] || 0;

    if (val1 !== undefined && val2 !== undefined && weight > 0) {
      const diff = val2 !== 0 ? Math.abs(val1 - val2) / Math.abs(val2) : (val1 === 0 ? 0 : 1);
      const similarity = Math.max(0, 1 - diff);
      totalSimilarity += similarity * weight;
      totalWeight += weight;
      breakdown[feature] = parseFloat((similarity * 100).toFixed(1));
    }
  }

  // Sentence starter similarity (Jaccard-like)
  if (features1.topSentenceStarters && features2.topSentenceStarters) {
    const starters1 = new Set(features1.topSentenceStarters.map(s => s.toLowerCase()));
    const starters2 = new Set(features2.topSentenceStarters.map(s => s.toLowerCase()));
    
    if (starters1.size > 0 && starters2.size > 0) {
      const intersection = [...starters1].filter(s => starters2.has(s)).length;
      const union = new Set([...starters1, ...starters2]).size;
      const starterSimilarity = union > 0 ? intersection / union : 0;
      
      totalSimilarity += starterSimilarity * weights.sentenceStarterSimilarity;
      totalWeight += weights.sentenceStarterSimilarity;
      breakdown.sentenceStarterSimilarity = parseFloat((starterSimilarity * 100).toFixed(1));
    }
  }

  // Transition word usage similarity (cosine-like)
  if (features1.transitionWordUsage && features2.transitionWordUsage) {
    const trans1 = features1.transitionWordUsage;
    const trans2 = features2.transitionWordUsage;
    
    const allWords = new Set([...Object.keys(trans1), ...Object.keys(trans2)]);
    
    if (allWords.size > 0) {
      // Normalize counts to frequencies
      const total1 = Object.values(trans1).reduce((a, b) => a + b, 0) || 1;
      const total2 = Object.values(trans2).reduce((a, b) => a + b, 0) || 1;
      
      let dotProduct = 0;
      let norm1 = 0;
      let norm2 = 0;
      
      for (const word of allWords) {
        const freq1 = (trans1[word] || 0) / total1;
        const freq2 = (trans2[word] || 0) / total2;
        dotProduct += freq1 * freq2;
        norm1 += freq1 * freq1;
        norm2 += freq2 * freq2;
      }
      
      norm1 = Math.sqrt(norm1);
      norm2 = Math.sqrt(norm2);
      
      const transitionSimilarity = (norm1 > 0 && norm2 > 0) ? dotProduct / (norm1 * norm2) : 0;
      
      totalSimilarity += transitionSimilarity * weights.transitionWordSimilarity;
      totalWeight += weights.transitionWordSimilarity;
      breakdown.transitionWordSimilarity = parseFloat((transitionSimilarity * 100).toFixed(1));
    }
  }

  // Calculate final score and confidence
  const finalScore = totalWeight > 0 ? (totalSimilarity / totalWeight) * 100 : 50;
  const confidence = Math.min(100, (totalWeight / 1.0) * 100); // Based on how many features were compared

  // For backward compatibility, return just the score if called in simple context
  const result = {
    score: parseFloat(finalScore.toFixed(2)),
    breakdown,
    confidence: parseFloat(confidence.toFixed(1))
  };

  return result;
}

/**
 * Simple version for backward compatibility
 */
function compareStatisticalFeaturesSimple(features1, features2) {
  const result = compareStatisticalFeatures(features1, features2);
  return typeof result === 'object' ? result.score : result;
}

function calculateCentroid(vectors) {
  if (!vectors || vectors.length === 0) return null;
  
  const dimension = vectors[0].length;
  const centroid = new Array(dimension).fill(0);
  
  for (const vector of vectors) {
    for (let i = 0; i < dimension; i++) {
      centroid[i] += vector[i];
    }
  }
  
  for (let i = 0; i < dimension; i++) {
    centroid[i] /= vectors.length;
  }
  
  return centroid;
}

/**
 * Calculate weighted centroid - long samples have higher weight
 * @param {Array} samples - Array of {vector, type} objects
 * @returns {Array} Weighted centroid vector
 */
function calculateWeightedCentroid(samples) {
  if (!samples || samples.length === 0) return null;
  
  const dimension = samples[0].vector.length;
  const centroid = new Array(dimension).fill(0);
  let totalWeight = 0;
  
  for (const sample of samples) {
    // Long samples (800+ words) have 2x weight, short samples (20-300 words) have 1x weight
    const weight = sample.type === 'long' ? 2.0 : 1.0;
    totalWeight += weight;
    
    for (let i = 0; i < dimension; i++) {
      centroid[i] += sample.vector[i] * weight;
    }
  }
  
  // Normalize by total weight
  for (let i = 0; i < dimension; i++) {
    centroid[i] /= totalWeight;
  }
  
  return centroid;
}

/**
 * Calculate dynamic threshold with severity levels
 * @param {Array<number>} similarities - Array of similarity scores
 * @returns {Object} - { threshold, severityThresholds }
 */
function calculateDynamicThreshold(similarities) {
  const mean = similarities.reduce((a, b) => a + b, 0) / similarities.length;
  const variance = similarities.reduce((sum, val) => 
    sum + Math.pow(val - mean, 2), 0) / similarities.length;
  const stdDev = Math.sqrt(variance);
  
  const dynamicThreshold = mean - 0.8 * stdDev;
  const absoluteThreshold = 0.75;
  const baseThreshold = Math.max(0.5, Math.min(dynamicThreshold, absoluteThreshold));
  
  // Severity thresholds for more granular deviation detection
  return {
    threshold: baseThreshold,
    severityThresholds: {
      mild: baseThreshold,                    // Below this = mild deviation
      moderate: baseThreshold - 0.1,          // Below this = moderate deviation  
      severe: baseThreshold - 0.2             // Below this = severe deviation
    },
    stats: {
      mean: parseFloat(mean.toFixed(3)),
      stdDev: parseFloat(stdDev.toFixed(3)),
      variance: parseFloat(variance.toFixed(4))
    }
  };
}

/**
 * Determine deviation severity based on similarity score
 * @param {number} similarity - Similarity score (0-1)
 * @param {Object} thresholds - Threshold object from calculateDynamicThreshold
 * @returns {string|null} - 'mild', 'moderate', 'severe', or null if not deviant
 */
function getDeviationSeverity(similarity, thresholds) {
  const { severityThresholds } = thresholds;
  
  if (similarity >= severityThresholds.mild) {
    return null; // Not deviant
  } else if (similarity >= severityThresholds.moderate) {
    return 'mild';
  } else if (similarity >= severityThresholds.severe) {
    return 'moderate';
  } else {
    return 'severe';
  }
}

/**
 * Calculate confidence score for analysis result
 * @param {Array<number>} similarities - Array of similarity scores
 * @param {number} sampleCount - Number of profile samples used
 * @returns {Object} - { confidence, factors }
 */
function calculateAnalysisConfidence(similarities, sampleCount) {
  if (!similarities || similarities.length === 0) {
    return { confidence: 0, factors: { reason: 'No similarities to analyze' } };
  }

  const mean = similarities.reduce((a, b) => a + b, 0) / similarities.length;
  const variance = similarities.reduce((sum, val) => 
    sum + Math.pow(val - mean, 2), 0) / similarities.length;
  const stdDev = Math.sqrt(variance);
  
  // Factors affecting confidence
  const factors = {};
  let confidence = 100;
  
  // 1. Variance penalty - high variance = less confident
  const variancePenalty = Math.min(30, stdDev * 100);
  confidence -= variancePenalty;
  factors.variancePenalty = parseFloat(variancePenalty.toFixed(1));
  
  // 2. Sample count bonus - more samples = more confident
  const sampleBonus = Math.min(20, (sampleCount / 50) * 20);
  confidence += sampleBonus;
  factors.sampleBonus = parseFloat(sampleBonus.toFixed(1));
  
  // 3. Sentence count factor - more sentences analyzed = more confident
  const sentenceBonus = Math.min(15, (similarities.length / 20) * 15);
  confidence += sentenceBonus;
  factors.sentenceBonus = parseFloat(sentenceBonus.toFixed(1));
  
  // 4. Mean similarity factor - very low or very high means more certain
  const meanCertainty = Math.abs(mean - 0.5) * 20;
  confidence += meanCertainty;
  factors.meanCertainty = parseFloat(meanCertainty.toFixed(1));
  
  // Clamp to 0-100
  confidence = Math.max(0, Math.min(100, confidence));
  
  return {
    confidence: parseFloat(confidence.toFixed(1)),
    factors
  };
}

// ============================================================================
// SENTENCE ANALYSIS
// ============================================================================

/**
 * Enhanced sentence issue analysis with multi-language support
 * @param {string} sentence - Sentence to analyze
 * @param {Object} profileStats - Profile statistical features
 * @param {Object} voiceProfile - Voice profile object
 * @param {Object} context - Additional context (previous/next sentences)
 * @returns {Array} - Array of detected issues
 */
function analyzeSentenceIssues(sentence, profileStats, voiceProfile, context = {}) {
  const issues = [];
  const lang = nlpUtils.detectLanguage(sentence);
  
  const words = nlpUtils.tokenize(sentence);
  const sentenceLength = words.length;
  const sentenceLower = sentence.toLowerCase();

  // 1. LENGTH ANALYSIS
  if (sentenceLength > profileStats.avgSentenceLength * 1.8) {
    issues.push({
      type: 'length',
      severity: 'high',
      detail: lang === 'vi' 
        ? `Sentence too long (${sentenceLength} words, avg: ${Math.round(profileStats.avgSentenceLength)})`
        : `Sentence too long (${sentenceLength} words, avg: ${Math.round(profileStats.avgSentenceLength)})`,
      metric: sentenceLength,
      threshold: profileStats.avgSentenceLength
    });
  } else if (sentenceLength < profileStats.avgSentenceLength * 0.4 && sentenceLength < 5) {
    issues.push({
      type: 'length',
      severity: 'low',
      detail: lang === 'vi'
        ? `Sentence too short (${sentenceLength} words)`
        : `Sentence too short (${sentenceLength} words)`,
      metric: sentenceLength,
      threshold: profileStats.avgSentenceLength
    });
  }

  // 2. VOCABULARY COMPLEXITY
  const avgWordLen = words.length > 0 
    ? words.reduce((sum, w) => sum + w.length, 0) / words.length 
    : 0;
  
  if (avgWordLen > profileStats.avgWordLength * 1.3) {
    issues.push({
      type: 'vocabulary',
      severity: 'medium',
      detail: lang === 'vi'
        ? `Complex vocabulary (avg word length: ${avgWordLen.toFixed(1)}, profile: ${profileStats.avgWordLength.toFixed(1)})`
        : `Complex vocabulary (avg word length: ${avgWordLen.toFixed(1)}, profile: ${profileStats.avgWordLength.toFixed(1)})`,
      metric: avgWordLen,
      threshold: profileStats.avgWordLength
    });
  }

  // 3. FORMALITY ANALYSIS (Multi-language)
  if (voiceProfile && typeof voiceProfile === 'object') {
    const formalityLevel = voiceProfile.formality_level || 5;
    
    // English formal words
    const formalWordsEN = [
      'utilize', 'commence', 'terminate', 'endeavor', 'facilitate',
      'subsequently', 'furthermore', 'nevertheless', 'notwithstanding',
      'aforementioned', 'henceforth', 'whereby', 'thereof', 'herein',
      'pursuant', 'heretofore', 'inasmuch', 'whereupon', 'forthwith'
    ];
    
    // Vietnamese formal words
    const formalWordsVI = [
      'implement', 'execute', 'conduct', 'basis', 'accordingly',
      'aim', 'based on', 'regarding', 'related to',
      'within', 'comply with', 'adhere', 'issue',
      'regulation', 'provision', 'resolution', 'directive', 'circular'
    ];
    
    // Informal words (opposite check)
    const informalWordsEN = [
      'gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'yeah', 'nope',
      'cool', 'awesome', 'stuff', 'things', 'guy', 'guys', 'ok', 'okay'
    ];
    
    const informalWordsVI = [
      'ok', 'okay', 'cool', 'hey', 'yeah', 'yep', 'nope', 'sure', 'alright', 'right',
      'really', 'so', 'like', 'just', 'stuff', 'things', 'awesome', 'great'
    ];
    
    const formalWords = lang === 'vi' ? formalWordsVI : formalWordsEN;
    const informalWords = lang === 'vi' ? informalWordsVI : informalWordsEN;
    
    const foundFormalWords = formalWords.filter(w => sentenceLower.includes(w));
    const foundInformalWords = informalWords.filter(w => sentenceLower.includes(w));
    
    // Too formal for casual profile
    if (foundFormalWords.length > 0 && formalityLevel < 5) {
      issues.push({
        type: 'formality',
        severity: 'high',
        detail: lang === 'vi'
          ? `Vocabulary too formal for profile (formality: ${formalityLevel}/10)`
          : `Vocabulary too formal for profile (formality: ${formalityLevel}/10)`,
        examples: foundFormalWords.slice(0, 3),
        metric: foundFormalWords.length
      });
    }
    
    // Too informal for formal profile
    if (foundInformalWords.length > 0 && formalityLevel > 7) {
      issues.push({
        type: 'formality',
        severity: 'medium',
        detail: lang === 'vi'
          ? `Vocabulary too informal for profile (formality: ${formalityLevel}/10)`
          : `Vocabulary too informal for profile (formality: ${formalityLevel}/10)`,
        examples: foundInformalWords.slice(0, 3),
        metric: foundInformalWords.length
      });
    }
  }

  // 4. TONE ANALYSIS
  const emotionalMarkersPositive = lang === 'vi'
    ? ['amazing', 'wonderful', 'excellent', 'fantastic', 'incredible', 'awesome']
    : ['amazing', 'wonderful', 'excellent', 'fantastic', 'incredible', 'awesome'];
  
  const emotionalMarkersNegative = lang === 'vi'
    ? ['terrible', 'horrible', 'awful', 'disgusting', 'dreadful', 'catastrophic']
    : ['terrible', 'horrible', 'awful', 'disgusting', 'dreadful', 'catastrophic'];
  
  const foundPositive = emotionalMarkersPositive.filter(w => sentenceLower.includes(w));
  const foundNegative = emotionalMarkersNegative.filter(w => sentenceLower.includes(w));
  
  if (voiceProfile?.tone === 'professional' || voiceProfile?.tone === 'academic') {
    if (foundPositive.length > 0 || foundNegative.length > 0) {
      issues.push({
        type: 'tone',
        severity: 'medium',
        detail: lang === 'vi'
          ? `Emotional language doesn't match ${voiceProfile.tone} tone`
          : `Emotional language doesn't match ${voiceProfile.tone} tone`,
        examples: [...foundPositive, ...foundNegative].slice(0, 3),
        metric: foundPositive.length + foundNegative.length
      });
    }
  }

  // 5. COHERENCE ANALYSIS (with context)
  if (context.previousSentence) {
    const prevWords = new Set(nlpUtils.tokenize(context.previousSentence.toLowerCase()));
    const currentWords = new Set(words.map(w => w.toLowerCase()));
    
    // Check for topic continuity
    const commonWords = [...currentWords].filter(w => prevWords.has(w) && w.length > 4);
    const hasTransition = getTransitionWords(lang).some(tw => sentenceLower.startsWith(tw));
    
    if (commonWords.length === 0 && !hasTransition && words.length > 5) {
      issues.push({
        type: 'coherence',
        severity: 'low',
        detail: lang === 'vi'
          ? 'Sentence may lack connection to previous sentence'
          : 'Sentence may lack connection to previous sentence',
        suggestion: lang === 'vi'
          ? 'Consider adding transition or reference'
          : 'Consider adding transition or reference'
      });
    }
  }

  // 6. REPETITION ANALYSIS
  const wordFreq = {};
  words.forEach(w => {
    const wLower = w.toLowerCase();
    if (wLower.length > 3) {
      wordFreq[wLower] = (wordFreq[wLower] || 0) + 1;
    }
  });
  
  const repeatedWords = Object.entries(wordFreq)
    .filter(([word, count]) => count >= 3 && word.length > 4)
    .map(([word]) => word);
  
  if (repeatedWords.length > 0) {
    issues.push({
      type: 'repetition',
      severity: 'low',
      detail: lang === 'vi'
        ? `Word repetition in sentence: ${repeatedWords.join(', ')}`
        : `Word repetition in sentence: ${repeatedWords.join(', ')}`,
      examples: repeatedWords,
      metric: repeatedWords.length
    });
  }

  // 7. PASSIVE VOICE DETECTION (English only)
  if (lang === 'en') {
    const passivePatterns = [
      /\b(is|are|was|were|been|being)\s+\w+ed\b/i,
      /\b(is|are|was|were|been|being)\s+\w+en\b/i
    ];
    
    const hasPassive = passivePatterns.some(pattern => pattern.test(sentence));
    
    if (hasPassive && voiceProfile?.sentence_patterns?.structure_preference === 'active') {
      issues.push({
        type: 'voice',
        severity: 'low',
        detail: 'Passive voice detected, profile prefers active voice',
        suggestion: 'Consider converting to active voice'
      });
    }
  }

  // 8. PUNCTUATION ANALYSIS
  const punctuationCount = (sentence.match(/[,;:!?]/g) || []).length;
  const expectedPunctuation = profileStats.punctuationRatio * words.length;
  
  if (punctuationCount > expectedPunctuation * 2 && punctuationCount > 3) {
    issues.push({
      type: 'punctuation',
      severity: 'low',
      detail: lang === 'vi'
        ? `Excessive punctuation (${punctuationCount} marks)`
        : `Excessive punctuation (${punctuationCount} marks)`,
      metric: punctuationCount,
      threshold: expectedPunctuation
    });
  }

  return issues;
}

function calculateSuggestionConfidence(issues, sentenceScore) {
  let confidence = sentenceScore * 100;
  
  const issueCount = issues.length;
  if (issueCount > 3) {
    confidence -= (issueCount - 3) * 5;
  }
  
  const highSeverityCount = issues.filter(i => i.severity === 'high').length;
  confidence -= highSeverityCount * 10;
  
  return Math.max(50, Math.min(95, Math.round(confidence)));
}

// ============================================================================
// TEXT PREPROCESSING FOR AI DETECTION
// ============================================================================

/**
 * Preprocess text for AI detection analysis
 * @param {string} text - Raw text input
 * @returns {Array<string>} - Array of text chunks for analysis
 */
function preprocessTextForDetection(text) {
  // Normalize formatting
  const cleaned = text
    .replace(/\n{3,}/g, '\n\n')  // Normalize line breaks
    .replace(/\s{2,}/g, ' ')     // Normalize spaces
    .replace(/\t/g, ' ')         // Replace tabs
    .trim();
  
  // For long texts, analyze multiple sections
  const MAX_CHUNK_SIZE = 3000;
  if (cleaned.length > MAX_CHUNK_SIZE * 1.5) {
    const chunks = [];
    // Beginning
    chunks.push(cleaned.substring(0, MAX_CHUNK_SIZE));
    // Middle
    const midStart = Math.floor(cleaned.length / 2) - MAX_CHUNK_SIZE / 2;
    chunks.push(cleaned.substring(midStart, midStart + MAX_CHUNK_SIZE));
    // End
    chunks.push(cleaned.substring(cleaned.length - MAX_CHUNK_SIZE));
    return chunks;
  }
  
  return [cleaned];
}

// ============================================================================
// LANGUAGE DETECTION & MULTI-LANGUAGE SUPPORT
// ============================================================================

// detectLanguage is now provided by nlpUtils.detectLanguage

/**
 * Get transition words for specific language
 * @param {string} lang - Language code
 * @returns {Array<string>} - List of transition words
 */
function getTransitionWords(lang) {
  const transitionWordsByLang = {
    en: [
      'however', 'therefore', 'moreover', 'furthermore', 'but', 'and', 'so', 
      'because', 'although', 'while', 'meanwhile', 'thus', 'hence', 'consequently',
      'additionally', 'also', 'besides', 'nevertheless', 'nonetheless', 'yet',
      'first', 'second', 'third', 'finally', 'then', 'next', 'lastly'
    ],
    vi: [
      'however', 'therefore', 'thus', 'moreover', 'but', 'and', 'so',
      'because', 'although', 'while', 'meanwhile', 'like', 'so',
      'additionally', 'also', 'besides', 'yet', 'still',
      'first', 'second', 'third', 'finally', 'then', 'next'
    ]
  };
  
  return transitionWordsByLang[lang] || transitionWordsByLang.en;
}

/**
 * Calculate statistics with language awareness
 * @param {string} text - Text to analyze
 * @param {string} forceLang - Force specific language (optional)
 * @returns {Object} - Statistics object with language info
 */
function calculateStatisticsMultiLang(text, forceLang = null) {
  const lang = forceLang || nlpUtils.detectLanguage(text);
  const baseStats = calculateStatistics(text);
  
  // Recalculate transition words for detected language
  const transitionWords = getTransitionWords(lang);
  const textLower = text.toLowerCase();
  const transitionCounts = {};
  
  transitionWords.forEach(tw => {
    const regex = new RegExp(`\\b${tw}\\b`, 'gi');
    const matches = textLower.match(regex);
    if (matches && matches.length > 0) {
      transitionCounts[tw] = matches.length;
    }
  });
  
  return {
    ...baseStats,
    transitionWordUsage: transitionCounts,
    detectedLanguage: lang
  };
}

// ============================================================================
// SUGGESTION CACHING
// ============================================================================

const suggestionCache = new Map();
const SUGGESTION_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_SUGGESTION_CACHE_SIZE = 500;

/**
 * Generate cache key for suggestions
 */
function getSuggestionCacheKey(sentence, profileId) {
  const crypto = require('crypto');
  const hash = crypto.createHash('md5')
    .update(`${sentence}_${profileId}`)
    .digest('hex')
    .substring(0, 12);
  return `sug_${hash}`;
}

/**
 * Get cached suggestions
 */
function getCachedSuggestions(sentence, profileId) {
  const key = getSuggestionCacheKey(sentence, profileId);
  const cached = suggestionCache.get(key);
  
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > SUGGESTION_CACHE_TTL) {
    suggestionCache.delete(key);
    return null;
  }
  
  logger.info(`[CACHE] Suggestion cache HIT for: "${sentence.substring(0, 30)}..."`);
  return cached.data;
}

/**
 * Set cached suggestions
 */
function setCachedSuggestions(sentence, profileId, suggestions) {
  // Evict oldest if cache is full
  if (suggestionCache.size >= MAX_SUGGESTION_CACHE_SIZE) {
    const firstKey = suggestionCache.keys().next().value;
    suggestionCache.delete(firstKey);
  }
  
  const key = getSuggestionCacheKey(sentence, profileId);
  suggestionCache.set(key, {
    data: suggestions,
    timestamp: Date.now()
  });
}

/**
 * Clear suggestion cache (for testing or memory management)
 */
function clearSuggestionCache() {
  suggestionCache.clear();
  logger.info('[CACHE] Suggestion cache cleared');
}

// ============================================================================
// BATCH SUGGESTIONS PROCESSING
// ============================================================================

/**
 * Process multiple sentences for suggestions in batch
 * @param {Array} sentences - Array of {sentence, score, index} objects
 * @param {string} profileId - Profile ID for caching
 * @param {Object} profileStats - Profile statistical features
 * @param {Object} voiceProfile - Voice profile object
 * @returns {Object} - Map of sentence index to suggestions
 */
function batchAnalyzeSentenceIssues(sentences, profileId, profileStats, voiceProfile) {
  const results = {};
  
  sentences.forEach((item, idx) => {
    // Check cache first
    const cached = getCachedSuggestions(item.sentence, profileId);
    if (cached) {
      results[item.index] = cached;
      return;
    }
    
    // Build context from adjacent sentences
    const context = {
      previousSentence: idx > 0 ? sentences[idx - 1].sentence : null,
      nextSentence: idx < sentences.length - 1 ? sentences[idx + 1].sentence : null
    };
    
    // Analyze issues
    const issues = analyzeSentenceIssues(item.sentence, profileStats, voiceProfile, context);
    
    results[item.index] = {
      issues,
      issues_found: issues.length,
      sentence: item.sentence,
      score: item.score
    };
    
    // Cache the result
    setCachedSuggestions(item.sentence, profileId, results[item.index]);
  });
  
  return results;
}

module.exports = {
  calculateStatistics,
  calculateStatisticsMultiLang,
  splitIntoSentences,
  calculateCosineSimilarity,
  compareStatisticalFeatures,
  compareStatisticalFeaturesSimple,
  calculateCentroid,
  calculateWeightedCentroid,
  calculateDynamicThreshold,
  getDeviationSeverity,
  calculateAnalysisConfidence,
  analyzeSentenceIssues,
  calculateSuggestionConfidence,
  preprocessTextForDetection,
  detectLanguage: nlpUtils.detectLanguage,
  getTransitionWords,
  // Caching
  getCachedSuggestions,
  setCachedSuggestions,
  clearSuggestionCache,
  batchAnalyzeSentenceIssues,
  // New: Benchmark comparison
  compareWithBenchmark,
  BENCHMARKS,
  VIETNAMESE_TRANSITION_WORDS
};
