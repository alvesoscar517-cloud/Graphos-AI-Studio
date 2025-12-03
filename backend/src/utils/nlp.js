/**
 * NLP Utility Module
 * Lightweight NLP processing using wink-nlp
 * Replaces heavy natural + compromise libraries
 */

const winkNLP = require('wink-nlp');
const model = require('wink-eng-lite-web-model');

// Initialize wink-nlp with the English model
const nlp = winkNLP(model);
const its = nlp.its;
const as = nlp.as;

/**
 * Tokenize text into words
 * @param {string} text - Input text
 * @returns {string[]} Array of word tokens
 */
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  const doc = nlp.readDoc(text);
  return doc.tokens()
    .filter(t => t.out(its.type) === 'word')
    .out();
}

/**
 * Split text into sentences
 * @param {string} text - Input text
 * @returns {string[]} Array of sentences
 */
function splitIntoSentences(text) {
  if (!text || typeof text !== 'string') return [];
  const doc = nlp.readDoc(text);
  return doc.sentences().out();
}

/**
 * Get sentence count
 * @param {string} text - Input text
 * @returns {number} Number of sentences
 */
function getSentenceCount(text) {
  if (!text || typeof text !== 'string') return 0;
  const doc = nlp.readDoc(text);
  return doc.sentences().length();
}

/**
 * Get word count
 * @param {string} text - Input text
 * @returns {number} Number of words
 */
function getWordCount(text) {
  if (!text || typeof text !== 'string') return 0;
  const doc = nlp.readDoc(text);
  return doc.tokens().filter(t => t.out(its.type) === 'word').length();
}


/**
 * Get tokens with their types (word, punctuation, etc.)
 * @param {string} text - Input text
 * @returns {Array<{token: string, type: string}>} Array of token objects
 */
function getTokensWithTypes(text) {
  if (!text || typeof text !== 'string') return [];
  const doc = nlp.readDoc(text);
  return doc.tokens().out(its.detail);
}

/**
 * Get Part-of-Speech tags for words
 * @param {string} text - Input text
 * @returns {Array<{word: string, pos: string}>} Array of word-POS pairs
 */
function getPOSTags(text) {
  if (!text || typeof text !== 'string') return [];
  const doc = nlp.readDoc(text);
  return doc.tokens()
    .filter(t => t.out(its.type) === 'word')
    .out(its.detail)
    .map(t => ({ word: t.value, pos: t.pos }));
}

/**
 * Extract named entities from text
 * @param {string} text - Input text
 * @returns {Array<{text: string, type: string}>} Array of entities
 */
function extractEntities(text) {
  if (!text || typeof text !== 'string') return [];
  const doc = nlp.readDoc(text);
  return doc.entities().out(its.detail);
}

/**
 * Get unique words (vocabulary)
 * @param {string} text - Input text
 * @returns {Set<string>} Set of unique lowercase words
 */
function getUniqueWords(text) {
  const words = tokenize(text);
  return new Set(words.map(w => w.toLowerCase()));
}

/**
 * Calculate vocabulary richness (type-token ratio)
 * @param {string} text - Input text
 * @returns {number} Ratio of unique words to total words
 */
function calculateVocabularyRichness(text) {
  const words = tokenize(text);
  if (words.length === 0) return 0;
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  return uniqueWords.size / words.length;
}

/**
 * Get average word length
 * @param {string} text - Input text
 * @returns {number} Average word length
 */
function getAverageWordLength(text) {
  const words = tokenize(text);
  if (words.length === 0) return 0;
  const totalLength = words.reduce((sum, word) => sum + word.length, 0);
  return totalLength / words.length;
}

/**
 * Get average sentence length (in words)
 * @param {string} text - Input text
 * @returns {number} Average sentence length
 */
function getAverageSentenceLength(text) {
  const sentences = splitIntoSentences(text);
  if (sentences.length === 0) return 0;
  
  const totalWords = sentences.reduce((sum, sentence) => {
    const doc = nlp.readDoc(sentence);
    return sum + doc.tokens().filter(t => t.out(its.type) === 'word').length();
  }, 0);
  
  return totalWords / sentences.length;
}

/**
 * Count syllables in a word (English)
 * @param {string} word - Input word
 * @returns {number} Number of syllables
 */
function countSyllables(word) {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

/**
 * Calculate Flesch Reading Ease score
 * @param {string} text - Input text
 * @returns {number} Readability score (0-100)
 */
function calculateReadability(text) {
  const words = tokenize(text);
  const sentences = splitIntoSentences(text);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllableCount / words.length;
  
  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  return Math.max(0, Math.min(100, score));
}

/**
 * Detect language based on character patterns
 * Simple heuristic for common languages
 * @param {string} text - Input text
 * @returns {string} Language code (en, vi, zh, ja, ko, etc.)
 */
function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';
  
  // Vietnamese detection - diacritics
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  if (vietnamesePattern.test(text)) return 'vi';
  
  // Chinese detection
  const chinesePattern = /[\u4e00-\u9fff]/;
  if (chinesePattern.test(text)) return 'zh';
  
  // Japanese detection (Hiragana, Katakana)
  const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
  if (japanesePattern.test(text)) return 'ja';
  
  // Korean detection (Hangul)
  const koreanPattern = /[\uac00-\ud7af\u1100-\u11ff]/;
  if (koreanPattern.test(text)) return 'ko';
  
  // Default to English
  return 'en';
}

/**
 * Get sentence starters (first 2 words of each sentence)
 * @param {string} text - Input text
 * @returns {string[]} Array of sentence starters
 */
function getSentenceStarters(text) {
  const sentences = splitIntoSentences(text);
  return sentences.map(sentence => {
    const words = tokenize(sentence);
    return words.slice(0, 2).join(' ').toLowerCase();
  }).filter(s => s.length > 0);
}

/**
 * Count punctuation marks
 * @param {string} text - Input text
 * @returns {number} Number of punctuation marks
 */
function countPunctuation(text) {
  if (!text) return 0;
  const matches = text.match(/[,;:!?]/g);
  return matches ? matches.length : 0;
}

/**
 * Get punctuation ratio (punctuation per word)
 * @param {string} text - Input text
 * @returns {number} Punctuation ratio
 */
function getPunctuationRatio(text) {
  const wordCount = getWordCount(text);
  if (wordCount === 0) return 0;
  return countPunctuation(text) / wordCount;
}

module.exports = {
  // Core functions
  tokenize,
  splitIntoSentences,
  getSentenceCount,
  getWordCount,
  getTokensWithTypes,
  getPOSTags,
  extractEntities,
  
  // Statistics
  getUniqueWords,
  calculateVocabularyRichness,
  getAverageWordLength,
  getAverageSentenceLength,
  countSyllables,
  calculateReadability,
  
  // Language detection
  detectLanguage,
  
  // Text analysis helpers
  getSentenceStarters,
  countPunctuation,
  getPunctuationRatio,
  
  // Export nlp instance for advanced usage
  nlp,
  its,
  as
};
