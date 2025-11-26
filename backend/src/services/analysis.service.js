/**
 * Analysis Service
 * Text analysis, statistics, and similarity calculations
 */

const natural = require('natural');
const compromise = require('compromise');

const tokenizer = new natural.WordTokenizer();

// ============================================================================
// INDUSTRY BENCHMARKS - Chuẩn ngành để so sánh
// ============================================================================

const BENCHMARKS = {
  // Chuẩn cho văn bản tiếng Anh
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
  // Chuẩn cho văn bản tiếng Việt
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

// Từ nối tiếng Việt mở rộng
const VIETNAMESE_TRANSITION_WORDS = [
  // Bổ sung/liệt kê
  'ngoài ra', 'thêm vào đó', 'hơn nữa', 'bên cạnh đó', 'cũng', 'đồng thời', 'mặt khác',
  'không những', 'chẳng những', 'vừa', 'lại còn', 'thậm chí', 'nhất là', 'đặc biệt',
  // Nguyên nhân/kết quả
  'vì vậy', 'do đó', 'vì thế', 'cho nên', 'bởi vì', 'vì', 'do', 'bởi', 'nên',
  'kết quả là', 'hậu quả là', 'dẫn đến', 'gây ra', 'từ đó', 'nhờ đó', 'nhờ vậy',
  // Tương phản
  'tuy nhiên', 'nhưng', 'song', 'mà', 'thế nhưng', 'tuy vậy', 'dù vậy', 'mặc dù',
  'dù', 'cho dù', 'dẫu', 'tuy', 'ngược lại', 'trái lại', 'trong khi đó',
  // Thời gian/trình tự
  'đầu tiên', 'trước hết', 'trước tiên', 'thứ nhất', 'thứ hai', 'thứ ba', 'tiếp theo',
  'sau đó', 'tiếp đến', 'cuối cùng', 'kết luận', 'tóm lại', 'nói chung', 'nhìn chung',
  // Điều kiện
  'nếu', 'giả sử', 'trong trường hợp', 'miễn là', 'với điều kiện', 'trừ khi',
  // Nhấn mạnh
  'thực ra', 'thật ra', 'trên thực tế', 'rõ ràng', 'hiển nhiên', 'chắc chắn',
  'quả thật', 'đúng là', 'thực sự', 'rõ ràng là'
];

// ============================================================================
// TEXT STATISTICS
// ============================================================================

function calculateStatistics(text) {
  const lang = detectLanguage(text);
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

  // Tính syllable và readability theo ngôn ngữ
  const syllableCount = lang === 'vi' 
    ? countVietnameseSyllables(text)
    : words.reduce((sum, word) => sum + countSyllables(word), 0);
  
  const readabilityScore = lang === 'vi'
    ? calculateVietnameseReadability(words.length, sentences.length, avgSentenceLength, avgWordLength)
    : calculateReadability(words.length, sentences.length, syllableCount);

  // Sentence starter patterns
  const sentenceStarters = sentences.map(s => {
    const sentenceWords = tokenizer.tokenize(s) || [];
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

  // Transition words frequency - theo ngôn ngữ
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
    // Với tiếng Việt, không cần word boundary vì từ được phân cách bằng dấu cách
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
        const pWords = tokenizer.tokenize(p) || [];
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
 * Đếm âm tiết tiếng Việt - mỗi từ tiếng Việt thường là 1 âm tiết
 */
function countVietnameseSyllables(text) {
  // Tiếng Việt: mỗi từ (phân cách bằng dấu cách) thường là 1 âm tiết
  const words = text.split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

/**
 * Tính readability cho tiếng Việt
 * Dựa trên: độ dài câu trung bình và độ dài từ trung bình
 * Công thức tùy chỉnh cho tiếng Việt
 */
function calculateVietnameseReadability(wordCount, sentenceCount, avgSentenceLength, avgWordLength) {
  if (sentenceCount === 0 || wordCount === 0) return 0;
  
  // Công thức readability cho tiếng Việt:
  // - Câu ngắn hơn = dễ đọc hơn
  // - Từ ngắn hơn = dễ đọc hơn
  // Điểm cơ sở: 100
  // Trừ điểm theo độ dài câu và từ
  
  const sentencePenalty = Math.max(0, (avgSentenceLength - 15) * 2); // Câu > 15 từ bị trừ điểm
  const wordPenalty = Math.max(0, (avgWordLength - 3.5) * 10); // Từ > 3.5 ký tự bị trừ điểm
  
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
 * So sánh stats với profile và benchmark
 * @param {Object} textStats - Thống kê văn bản hiện tại
 * @param {Object} profileStats - Thống kê từ profile (optional)
 * @param {string} styleType - Loại văn bản: 'blog', 'academic', 'casual', 'professional'
 * @returns {Object} - Kết quả so sánh với gợi ý cải thiện
 */
function compareWithBenchmark(textStats, profileStats = null, styleType = 'blog') {
  const lang = textStats.detectedLanguage || 'en';
  const benchmark = BENCHMARKS[lang]?.[styleType] || BENCHMARKS.en.blog;
  
  const comparison = {};
  const suggestions = [];
  let overallScore = 0;
  let totalMetrics = 0;

  // So sánh từng metric
  const metrics = ['avgWordLength', 'avgSentenceLength', 'readabilityScore', 'vocabularyRichness', 'punctuationRatio'];
  
  metrics.forEach(metric => {
    const value = textStats[metric];
    const bench = benchmark[metric];
    const profileValue = profileStats?.[metric];
    
    if (value === undefined || !bench) return;
    
    totalMetrics++;
    
    // Tính điểm so với benchmark
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
      // Trong khoảng tốt, tính điểm dựa trên khoảng cách với ideal
      const distanceFromIdeal = Math.abs(value - bench.ideal);
      const maxDistance = Math.max(bench.ideal - bench.min, bench.max - bench.ideal);
      benchmarkScore = 100 - (distanceFromIdeal / maxDistance) * 20; // Tối đa trừ 20 điểm
    }
    
    overallScore += benchmarkScore;
    
    // So sánh với profile nếu có
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
    
    // Tạo gợi ý cải thiện
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
 * Tạo gợi ý cải thiện dựa trên metric
 */
function generateSuggestion(metric, status, value, benchmark, lang) {
  const suggestions = {
    avgWordLength: {
      low: {
        en: `Your average word length (${value.toFixed(1)}) is below the recommended range. Consider using more descriptive vocabulary.`,
        vi: `Độ dài từ trung bình (${value.toFixed(1)}) thấp hơn khuyến nghị. Hãy sử dụng từ vựng phong phú hơn.`
      },
      high: {
        en: `Your average word length (${value.toFixed(1)}) is above the recommended range. Consider simplifying some complex words.`,
        vi: `Độ dài từ trung bình (${value.toFixed(1)}) cao hơn khuyến nghị. Hãy đơn giản hóa một số từ phức tạp.`
      }
    },
    avgSentenceLength: {
      low: {
        en: `Your sentences are quite short (avg ${value.toFixed(0)} words). Consider combining some ideas for better flow.`,
        vi: `Câu của bạn khá ngắn (TB ${value.toFixed(0)} từ). Hãy kết hợp một số ý để văn bản mạch lạc hơn.`
      },
      high: {
        en: `Your sentences are quite long (avg ${value.toFixed(0)} words). Consider breaking them into shorter sentences for clarity.`,
        vi: `Câu của bạn khá dài (TB ${value.toFixed(0)} từ). Hãy chia thành các câu ngắn hơn để dễ đọc.`
      }
    },
    readabilityScore: {
      low: {
        en: `Readability score (${value.toFixed(0)}) is low. Try using simpler words and shorter sentences.`,
        vi: `Điểm dễ đọc (${value.toFixed(0)}) thấp. Hãy dùng từ đơn giản và câu ngắn hơn.`
      },
      high: {
        en: `Readability score (${value.toFixed(0)}) is very high. Your text might be too simple for the target audience.`,
        vi: `Điểm dễ đọc (${value.toFixed(0)}) rất cao. Văn bản có thể quá đơn giản cho đối tượng mục tiêu.`
      }
    },
    vocabularyRichness: {
      low: {
        en: `Vocabulary richness (${(value * 100).toFixed(0)}%) is low. Try using more varied words to avoid repetition.`,
        vi: `Độ phong phú từ vựng (${(value * 100).toFixed(0)}%) thấp. Hãy dùng từ đa dạng hơn để tránh lặp.`
      },
      high: {
        en: `Vocabulary richness (${(value * 100).toFixed(0)}%) is very high. Consider some repetition for emphasis and clarity.`,
        vi: `Độ phong phú từ vựng (${(value * 100).toFixed(0)}%) rất cao. Có thể lặp lại một số từ để nhấn mạnh.`
      }
    },
    punctuationRatio: {
      low: {
        en: `Punctuation usage is low. Consider adding commas or other punctuation for better rhythm.`,
        vi: `Sử dụng dấu câu ít. Hãy thêm dấu phẩy hoặc dấu câu khác để văn bản có nhịp điệu hơn.`
      },
      high: {
        en: `Punctuation usage is high. Consider reducing excessive commas or punctuation marks.`,
        vi: `Sử dụng dấu câu nhiều. Hãy giảm bớt dấu phẩy hoặc dấu câu thừa.`
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
  const lang = detectLanguage(sentence);
  
  const words = tokenizer.tokenize(sentence) || [];
  const sentenceLength = words.length;
  const sentenceLower = sentence.toLowerCase();

  // 1. LENGTH ANALYSIS
  if (sentenceLength > profileStats.avgSentenceLength * 1.8) {
    issues.push({
      type: 'length',
      severity: 'high',
      detail: lang === 'vi' 
        ? `Câu quá dài (${sentenceLength} từ, trung bình: ${Math.round(profileStats.avgSentenceLength)} từ)`
        : `Sentence too long (${sentenceLength} words, avg: ${Math.round(profileStats.avgSentenceLength)})`,
      metric: sentenceLength,
      threshold: profileStats.avgSentenceLength
    });
  } else if (sentenceLength < profileStats.avgSentenceLength * 0.4 && sentenceLength < 5) {
    issues.push({
      type: 'length',
      severity: 'low',
      detail: lang === 'vi'
        ? `Câu quá ngắn (${sentenceLength} từ)`
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
        ? `Từ vựng phức tạp (độ dài từ TB: ${avgWordLen.toFixed(1)}, profile: ${profileStats.avgWordLength.toFixed(1)})`
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
      'triển khai', 'thực hiện', 'tiến hành', 'căn cứ', 'theo đó',
      'nhằm mục đích', 'trên cơ sở', 'đối với', 'liên quan đến',
      'trong khuôn khổ', 'phù hợp với', 'tuân thủ', 'ban hành',
      'quy định', 'điều khoản', 'nghị quyết', 'chỉ thị', 'thông tư'
    ];
    
    // Informal words (opposite check)
    const informalWordsEN = [
      'gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'yeah', 'nope',
      'cool', 'awesome', 'stuff', 'things', 'guy', 'guys', 'ok', 'okay'
    ];
    
    const informalWordsVI = [
      'oke', 'ok', 'đc', 'dc', 'ko', 'k', 'nha', 'nhé', 'hen', 'hén',
      'vậy á', 'dzậy', 'zậy', 'bùn', 'buồn', 'vui ghê', 'quá trời'
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
          ? `Từ vựng quá trang trọng cho profile (formality: ${formalityLevel}/10)`
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
          ? `Từ vựng quá thân mật cho profile (formality: ${formalityLevel}/10)`
          : `Vocabulary too informal for profile (formality: ${formalityLevel}/10)`,
        examples: foundInformalWords.slice(0, 3),
        metric: foundInformalWords.length
      });
    }
  }

  // 4. TONE ANALYSIS
  const emotionalMarkersPositive = lang === 'vi'
    ? ['tuyệt vời', 'xuất sắc', 'tuyệt hảo', 'hoàn hảo', 'tốt đẹp', 'rất tốt']
    : ['amazing', 'wonderful', 'excellent', 'fantastic', 'incredible', 'awesome'];
  
  const emotionalMarkersNegative = lang === 'vi'
    ? ['tệ hại', 'kinh khủng', 'thảm họa', 'tồi tệ', 'ghê tởm', 'khủng khiếp']
    : ['terrible', 'horrible', 'awful', 'disgusting', 'dreadful', 'catastrophic'];
  
  const foundPositive = emotionalMarkersPositive.filter(w => sentenceLower.includes(w));
  const foundNegative = emotionalMarkersNegative.filter(w => sentenceLower.includes(w));
  
  if (voiceProfile?.tone === 'professional' || voiceProfile?.tone === 'academic') {
    if (foundPositive.length > 0 || foundNegative.length > 0) {
      issues.push({
        type: 'tone',
        severity: 'medium',
        detail: lang === 'vi'
          ? `Ngôn ngữ cảm xúc không phù hợp với tone ${voiceProfile.tone}`
          : `Emotional language doesn't match ${voiceProfile.tone} tone`,
        examples: [...foundPositive, ...foundNegative].slice(0, 3),
        metric: foundPositive.length + foundNegative.length
      });
    }
  }

  // 5. COHERENCE ANALYSIS (with context)
  if (context.previousSentence) {
    const prevWords = new Set(tokenizer.tokenize(context.previousSentence.toLowerCase()) || []);
    const currentWords = new Set(words.map(w => w.toLowerCase()));
    
    // Check for topic continuity
    const commonWords = [...currentWords].filter(w => prevWords.has(w) && w.length > 4);
    const hasTransition = getTransitionWords(lang).some(tw => sentenceLower.startsWith(tw));
    
    if (commonWords.length === 0 && !hasTransition && words.length > 5) {
      issues.push({
        type: 'coherence',
        severity: 'low',
        detail: lang === 'vi'
          ? 'Câu có thể thiếu liên kết với câu trước'
          : 'Sentence may lack connection to previous sentence',
        suggestion: lang === 'vi'
          ? 'Cân nhắc thêm từ nối hoặc tham chiếu'
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
        ? `Lặp từ trong câu: ${repeatedWords.join(', ')}`
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
        ? `Quá nhiều dấu câu (${punctuationCount} dấu)`
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
  let cleaned = text
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

/**
 * Detect language of text (simple heuristic-based)
 * @param {string} text - Text to analyze
 * @returns {string} - Language code ('en', 'vi', 'unknown')
 */
function detectLanguage(text) {
  const textLower = text.toLowerCase();
  
  // Vietnamese indicators
  const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/;
  const vietnameseWords = ['của', 'và', 'là', 'trong', 'có', 'được', 'cho', 'này', 'với', 'không', 'những', 'một', 'các', 'để', 'người'];
  
  // Check for Vietnamese characters
  if (vietnameseChars.test(textLower)) {
    return 'vi';
  }
  
  // Check for Vietnamese words
  const words = textLower.split(/\s+/);
  const vietnameseWordCount = words.filter(w => vietnameseWords.includes(w)).length;
  if (vietnameseWordCount > words.length * 0.05) {
    return 'vi';
  }
  
  // Default to English
  return 'en';
}

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
      'tuy nhiên', 'vì vậy', 'do đó', 'ngoài ra', 'nhưng', 'và', 'nên',
      'bởi vì', 'mặc dù', 'trong khi', 'đồng thời', 'như vậy', 'vì thế',
      'thêm vào đó', 'cũng', 'bên cạnh đó', 'tuy vậy', 'song',
      'đầu tiên', 'thứ hai', 'thứ ba', 'cuối cùng', 'sau đó', 'tiếp theo'
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
  const lang = forceLang || detectLanguage(text);
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
  
  console.log(`[CACHE] Suggestion cache HIT for: "${sentence.substring(0, 30)}..."`);
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
  console.log('[CACHE] Suggestion cache cleared');
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
  detectLanguage,
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
