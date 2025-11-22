/**
 * Analysis Service
 * Text analysis, statistics, and similarity calculations
 */

const natural = require('natural');
const compromise = require('compromise');

const tokenizer = new natural.WordTokenizer();

// ============================================================================
// TEXT STATISTICS
// ============================================================================

function calculateStatistics(text) {
  const doc = compromise(text);
  const sentences = doc.sentences().out('array');
  const words = tokenizer.tokenize(text.toLowerCase()) || [];

  const wordLengths = words.map(w => w.length);
  const avgWordLength = wordLengths.length > 0
    ? wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length
    : 0;

  const sentenceLengths = sentences.map(s => {
    const sentenceWords = tokenizer.tokenize(s) || [];
    return sentenceWords.length;
  });
  const avgSentenceLength = sentenceLengths.length > 0
    ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
    : 0;

  const uniqueWords = new Set(words);
  const vocabularyRichness = words.length > 0 ? uniqueWords.size / words.length : 0;

  const punctuationCount = (text.match(/[,;:!?]/g) || []).length;
  const punctuationRatio = words.length > 0 ? punctuationCount / words.length : 0;

  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const readabilityScore = calculateReadability(words.length, sentences.length, syllableCount);

  return {
    avgWordLength: parseFloat(avgWordLength.toFixed(2)),
    avgSentenceLength: parseFloat(avgSentenceLength.toFixed(2)),
    vocabularyRichness: parseFloat(vocabularyRichness.toFixed(3)),
    punctuationRatio: parseFloat(punctuationRatio.toFixed(3)),
    totalWords: words.length,
    totalSentences: sentences.length,
    readabilityScore: parseFloat(readabilityScore.toFixed(2))
  };
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

function splitIntoSentences(text) {
  const doc = compromise(text);
  return doc.sentences().out('array').filter(s => s.trim().length > 0);
}

// ============================================================================
// SIMILARITY CALCULATIONS
// ============================================================================

function calculateCosineSimilarity(vector1, vector2) {
  if (vector1.length !== vector2.length) return 0;

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

function compareStatisticalFeatures(features1, features2) {
  if (!features2) return 50;

  const weights = {
    avgWordLength: 0.15,
    avgSentenceLength: 0.20,
    readabilityScore: 0.20,
    vocabularyRichness: 0.15,
    punctuationRatio: 0.15
  };

  let totalSimilarity = 0;

  for (const [feature, weight] of Object.entries(weights)) {
    const val1 = features1[feature];
    const val2 = features2[feature];

    if (val1 !== undefined && val2 !== undefined) {
      const diff = val2 !== 0 ? Math.abs(val1 - val2) / Math.abs(val2) : (val1 === 0 ? 0 : 1);
      const similarity = Math.max(0, 1 - diff);
      totalSimilarity += similarity * weight;
    }
  }

  return parseFloat((totalSimilarity * 100).toFixed(2));
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

function calculateDynamicThreshold(similarities) {
  const mean = similarities.reduce((a, b) => a + b, 0) / similarities.length;
  const variance = similarities.reduce((sum, val) => 
    sum + Math.pow(val - mean, 2), 0) / similarities.length;
  const stdDev = Math.sqrt(variance);
  
  const dynamicThreshold = mean - 0.8 * stdDev;
  const absoluteThreshold = 0.75;
  
  return Math.max(0.5, Math.min(dynamicThreshold, absoluteThreshold));
}

// ============================================================================
// SENTENCE ANALYSIS
// ============================================================================

function analyzeSentenceIssues(sentence, profileStats, voiceProfile) {
  const issues = [];
  
  const words = tokenizer.tokenize(sentence) || [];
  const sentenceLength = words.length;
  
  if (sentenceLength > profileStats.avgSentenceLength * 1.8) {
    issues.push({
      type: 'length',
      severity: 'high',
      detail: `Câu quá dài (${sentenceLength} từ, trung bình: ${Math.round(profileStats.avgSentenceLength)} từ)`,
      metric: sentenceLength,
      threshold: profileStats.avgSentenceLength
    });
  }
  
  const avgWordLen = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  
  if (avgWordLen > profileStats.avgWordLength * 1.3) {
    issues.push({
      type: 'vocabulary',
      severity: 'medium',
      detail: `Từ vựng phức tạp (độ dài từ TB: ${avgWordLen.toFixed(1)}, profile: ${profileStats.avgWordLength.toFixed(1)})`,
      metric: avgWordLen,
      threshold: profileStats.avgWordLength
    });
  }
  
  if (voiceProfile && typeof voiceProfile === 'object') {
    const formalityLevel = voiceProfile.formality_level || 5;
    
    const formalWords = [
      'utilize', 'commence', 'terminate', 'endeavor', 'facilitate',
      'subsequently', 'furthermore', 'nevertheless'
    ];
    
    const sentenceLower = sentence.toLowerCase();
    const foundFormalWords = formalWords.filter(w => sentenceLower.includes(w));
    
    if (foundFormalWords.length > 0 && formalityLevel < 6) {
      issues.push({
        type: 'formality',
        severity: 'high',
        detail: `Từ vựng quá trang trọng cho profile (formality: ${formalityLevel}/10)`,
        examples: foundFormalWords.slice(0, 3),
        metric: foundFormalWords.length
      });
    }
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

module.exports = {
  calculateStatistics,
  splitIntoSentences,
  calculateCosineSimilarity,
  compareStatisticalFeatures,
  calculateCentroid,
  calculateDynamicThreshold,
  analyzeSentenceIssues,
  calculateSuggestionConfidence
};
