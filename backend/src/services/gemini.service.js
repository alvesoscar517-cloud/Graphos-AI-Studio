/**
 * Gemini AI Service
 * Handles all AI operations: embeddings, content detection, voice analysis
 */

const { helpers } = require('@google-cloud/aiplatform');
const { getVertexAI, getAIPlatformClient, config } = require('../config/gemini');

// Get services (lazy initialization)
const vertexAI = getVertexAI();
const aiplatformClient = getAIPlatformClient();

const PROJECT_ID = config.PROJECT_ID;
const LOCATION = config.LOCATION;

// ============================================================================
// EMBEDDING CACHE
// ============================================================================

const embeddingCache = new Map();
const EMBEDDING_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_EMBEDDING_CACHE_SIZE = 1000;

const crypto = require('crypto');
const redisService = require('./redis.service');

function hashText(text) {
  // Use SHA256 for better collision resistance
  return crypto.createHash('sha256').update(text).digest('hex').substring(0, 16);
}

async function getCachedEmbedding(text, taskType) {
  const textHash = hashText(text);
  
  // Try Redis/distributed cache first
  const redisCached = await redisService.embeddingCache.get(textHash, taskType);
  if (redisCached) {
    console.log(`[CACHE] Embedding cache HIT (distributed)`);
    return redisCached;
  }
  
  // Fallback to local memory cache
  const key = `${textHash}_${taskType}`;
  const cached = embeddingCache.get(key);
  
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > EMBEDDING_CACHE_TTL) {
    embeddingCache.delete(key);
    return null;
  }
  
  console.log(`[CACHE] Embedding cache HIT (memory)`);
  return cached.embedding;
}

async function setCachedEmbedding(text, taskType, embedding) {
  const textHash = hashText(text);
  
  // Save to Redis/distributed cache
  await redisService.embeddingCache.set(textHash, taskType, embedding);
  
  // Also save to local memory cache for faster access
  if (embeddingCache.size >= MAX_EMBEDDING_CACHE_SIZE) {
    const firstKey = embeddingCache.keys().next().value;
    embeddingCache.delete(firstKey);
  }
  
  const key = `${textHash}_${taskType}`;
  embeddingCache.set(key, {
    embedding,
    timestamp: Date.now()
  });
}

// ============================================================================
// EMBEDDING FUNCTIONS
// ============================================================================

async function createEmbedding(text, taskType = 'SEMANTIC_SIMILARITY') {
  try {
    const cached = await getCachedEmbedding(text, taskType);
    if (cached) return cached;
    
    if (text.length > 20000) {
      console.warn(`[WARN] Text too long (${text.length} chars), truncating to 20000`);
      text = text.substring(0, 20000);
    }

    const model = 'text-embedding-004';
    const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${model}`;
    
    const instanceValue = helpers.toValue({
      content: text,
      task_type: taskType
    });
    
    const request = {
      endpoint,
      instances: [instanceValue]
    };

    console.log(`[PROCESS] Generating Gemini embedding (${taskType}) for ${text.length} chars...`);
    const [response] = await aiplatformClient.predict(request);
    
    if (!response.predictions || response.predictions.length === 0) {
      throw new Error('No predictions returned from Vertex AI');
    }
    
    const prediction = helpers.fromValue(response.predictions[0]);
    
    if (!prediction.embeddings || !prediction.embeddings.values) {
      throw new Error('Invalid embedding structure returned from Vertex AI');
    }
    
    const embedding = prediction.embeddings.values;
    console.log(`[SUCCESS] Generated embedding with ${embedding.length} dimensions`);
    
    await setCachedEmbedding(text, taskType, embedding);
    
    return embedding;
  } catch (error) {
    console.error('[ERROR] Embedding generation failed:', error.message);
    
    if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('QUOTA_EXCEEDED: Gemini API quota exhausted. Please try again later.');
    }
    
    throw new Error(`EMBEDDING_FAILED: ${error.message}`);
  }
}

async function createBatchEmbeddings(texts, taskType = 'SEMANTIC_SIMILARITY') {
  try {
    if (!texts || texts.length === 0) return [];

    const embeddings = [];
    const textsToFetch = [];
    const fetchIndices = [];
    
    // Check cache for each text (in parallel for better performance)
    const cacheChecks = await Promise.all(
      texts.map(text => getCachedEmbedding(text, taskType))
    );
    
    texts.forEach((text, idx) => {
      if (cacheChecks[idx]) {
        embeddings[idx] = cacheChecks[idx];
      } else {
        textsToFetch.push(text);
        fetchIndices.push(idx);
      }
    });
    
    if (textsToFetch.length === 0) {
      console.log(`[CACHE] All ${texts.length} embeddings from cache`);
      return embeddings;
    }
    
    console.log(`[CACHE] Hits: ${texts.length - textsToFetch.length}, Misses: ${textsToFetch.length}`);

    const validTexts = textsToFetch.map(text => {
      if (text.length > 20000) {
        console.warn(`[WARN] Text too long (${text.length} chars), truncating`);
        return text.substring(0, 20000);
      }
      return text;
    });

    const model = 'text-embedding-004';
    const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${model}`;
    
    const instances = validTexts.map(text => {
      const instanceData = {
        content: text,
        task_type: taskType
      };
      return helpers.toValue(instanceData);
    });

    const request = { 
      endpoint, 
      instances
    };

    console.log(`[PROCESS] Generating ${textsToFetch.length} Gemini embeddings in batch (${taskType})...`);
    const [response] = await aiplatformClient.predict(request);
    
    const predictions = response.predictions.map(p => helpers.fromValue(p));
    
    const newEmbeddings = predictions.map((prediction, idx) => {
      if (!prediction || !prediction.embeddings || !prediction.embeddings.values) {
        throw new Error(`Invalid embedding structure for prediction ${idx + 1}`);
      }
      return prediction.embeddings.values;
    });
    
    // Cache all new embeddings in parallel
    await Promise.all(
      newEmbeddings.map((embedding, idx) => 
        setCachedEmbedding(textsToFetch[idx], taskType, embedding)
      )
    );
    
    fetchIndices.forEach((originalIdx, newIdx) => {
      embeddings[originalIdx] = newEmbeddings[newIdx];
    });
    
    console.log(`[SUCCESS] Generated ${newEmbeddings.length} new embeddings (${texts.length - newEmbeddings.length} from cache)`);
    return embeddings;
  } catch (error) {
    console.error('[ERROR] Batch embedding generation failed:', error.message);
    
    if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('QUOTA_EXCEEDED: Gemini API quota exhausted. Please try again later.');
    }
    
    throw new Error(`BATCH_EMBEDDING_FAILED: ${error.message}`);
  }
}

// ============================================================================
// AI CONTENT DETECTION - ENHANCED VERSION
// ============================================================================

/**
 * Preprocess text for AI detection
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

/**
 * Enhanced AI detection with improved prompt
 * @param {string} text - Text to analyze
 * @returns {Promise<Object>} - Detection result
 */
async function detectAIContent(text) {
  try {
    const chunks = preprocessTextForDetection(text);
    
    // If multiple chunks, analyze each and combine results
    if (chunks.length > 1) {
      console.log(`[PROCESS] Analyzing ${chunks.length} text chunks for AI detection...`);
      const results = await Promise.all(chunks.map(chunk => detectAIContentSingle(chunk)));
      return combineDetectionResults(results);
    }
    
    return await detectAIContentSingle(chunks[0]);
  } catch (error) {
    console.error('[ERROR] AI detection failed:', error);
    return detectAIContentHeuristic(text);
  }
}

/**
 * Analyze a single text chunk for AI content
 */
async function detectAIContentSingle(text) {
  try {
    const model = vertexAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1 // Low temperature for consistent results
      }
    });

    const prompt = `You are an expert linguist specializing in detecting AI-generated content. Analyze the text with extreme precision.

TEXT TO ANALYZE:
"""
${text}
"""

ANALYZE THESE SPECIFIC INDICATORS:

1. LEXICAL PATTERNS (Weight: 25%):
   - Repetitive sentence structures or openings
   - Overuse of transitional phrases (however, moreover, furthermore, additionally)
   - Generic/vague language vs specific details
   - Unusual or overly formal word combinations
   - Hedging language ("It's important to note", "One might argue")

2. SEMANTIC PATTERNS (Weight: 25%):
   - Lack of personal anecdotes, opinions, or unique perspectives
   - Overly balanced/neutral tone without strong stance
   - Missing emotional depth or authentic voice
   - Generic examples without cultural/temporal specificity
   - Absence of humor, sarcasm, idioms, or colloquialisms

3. STRUCTURAL PATTERNS (Weight: 25%):
   - Predictable paragraph structure (intro-body-conclusion in every section)
   - Uniform sentence length throughout
   - Excessive use of lists or bullet-point style writing
   - Perfect grammar without natural errors or variations
   - Mechanical transitions between ideas

4. CONTENT PATTERNS (Weight: 25%):
   - Lack of controversial or strong personal opinions
   - Missing specific names, dates, places, or verifiable details
   - Overly comprehensive coverage (trying to cover all angles)
   - Repetitive reinforcement of main points
   - Generic conclusions that could apply to any topic

SCORING GUIDE:
- 0-15%: Clearly human (unique voice, personal details, natural imperfections, specific references)
- 15-35%: Likely human (mostly authentic with minor AI-like patterns)
- 35-55%: Uncertain (mixed signals, could be either)
- 55-75%: Likely AI (multiple AI patterns, lacks authenticity markers)
- 75-100%: Clearly AI (formulaic, generic, multiple red flags across categories)

Return JSON:
{
  "ai_probability": <number 0-100>,
  "confidence": <number 0-100>,
  "evidence": [
    {
      "category": "lexical|semantic|structural|content",
      "finding": "specific observation about the text",
      "impact": "high|medium|low"
    }
  ],
  "human_indicators": ["list of human-like traits found, if any"],
  "ai_indicators": ["list of AI-like traits found, if any"],
  "analysis_summary": "2-3 sentence summary of the analysis"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates[0].content.parts[0].text.trim();
    const parsed = JSON.parse(responseText);
    
    // Format evidence for display
    const formattedEvidence = [];
    if (parsed.evidence && Array.isArray(parsed.evidence)) {
      parsed.evidence.forEach(e => {
        if (typeof e === 'object' && e.finding) {
          formattedEvidence.push(`[${e.category?.toUpperCase() || 'GENERAL'}] ${e.finding}`);
        } else if (typeof e === 'string') {
          formattedEvidence.push(e);
        }
      });
    }
    
    // Add human/AI indicators to evidence
    if (parsed.human_indicators?.length > 0) {
      formattedEvidence.push(`[OK] Human indicators: ${parsed.human_indicators.slice(0, 2).join(', ')}`);
    }
    if (parsed.ai_indicators?.length > 0) {
      formattedEvidence.push(`⚠ AI indicators: ${parsed.ai_indicators.slice(0, 2).join(', ')}`);
    }
    
    return {
      aiProbability: parseFloat(parsed.ai_probability || 50),
      confidence: parseFloat(parsed.confidence || 70),
      evidence: formattedEvidence.length > 0 ? formattedEvidence : ['Analysis completed'],
      humanIndicators: parsed.human_indicators || [],
      aiIndicators: parsed.ai_indicators || [],
      summary: parsed.analysis_summary || ''
    };
  } catch (error) {
    console.error('[ERROR] Single chunk AI detection failed:', error);
    throw error;
  }
}

/**
 * Deep analysis for uncertain results (40-60% range)
 */
async function detectAIContentDeep(text) {
  try {
    const model = vertexAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const prompt = `You are performing a DEEP ANALYSIS to determine if this text is AI-generated. The initial analysis was inconclusive.

TEXT:
"""
${text}
"""

FOCUS ON SUBTLE INDICATORS:

1. MICRO-PATTERNS:
   - Word choice consistency (does vocabulary level stay uniform?)
   - Sentence rhythm and flow (natural variation vs mechanical)
   - Use of filler words, contractions, informal language
   - Typos, minor grammatical variations (humans make these)

2. AUTHENTICITY MARKERS:
   - Specific personal experiences or anecdotes
   - Cultural references, slang, or regional expressions
   - Emotional language that feels genuine
   - Incomplete thoughts or tangents (human tendency)
   - Strong opinions or biases

3. AI FINGERPRINTS:
   - "As a [role]" or "I cannot" patterns
   - Excessive qualifiers ("It's worth noting", "It's important to")
   - Perfect parallel structure in lists
   - Overly diplomatic or balanced viewpoints
   - Generic examples (e.g., "For example, consider...")

4. WRITING QUIRKS:
   - Unique metaphors or analogies
   - Humor attempts (successful or not)
   - Self-references or meta-commentary
   - Inconsistent formatting (human tendency)

Return JSON:
{
  "ai_probability": <number 0-100>,
  "confidence": <number 0-100>,
  "deep_evidence": ["detailed finding 1", "detailed finding 2", "detailed finding 3"],
  "authenticity_score": <number 0-100>,
  "key_determination_factor": "the single most important factor in this analysis"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates[0].content.parts[0].text.trim();
    const parsed = JSON.parse(responseText);
    
    return {
      aiProbability: parseFloat(parsed.ai_probability || 50),
      confidence: parseFloat(parsed.confidence || 60),
      evidence: parsed.deep_evidence || [],
      authenticityScore: parsed.authenticity_score,
      keyFactor: parsed.key_determination_factor
    };
  } catch (error) {
    console.error('[ERROR] Deep AI detection failed:', error);
    throw error;
  }
}

/**
 * Combine results from multiple chunk analyses
 */
function combineDetectionResults(results) {
  if (!results || results.length === 0) {
    return { aiProbability: 50, confidence: 0, evidence: ['No results to combine'] };
  }
  
  // Weighted average - give more weight to higher confidence results
  let totalWeight = 0;
  let weightedProbability = 0;
  let allEvidence = [];
  let allHumanIndicators = [];
  let allAiIndicators = [];
  
  results.forEach(result => {
    const weight = result.confidence || 50;
    totalWeight += weight;
    weightedProbability += result.aiProbability * weight;
    
    if (result.evidence) allEvidence.push(...result.evidence);
    if (result.humanIndicators) allHumanIndicators.push(...result.humanIndicators);
    if (result.aiIndicators) allAiIndicators.push(...result.aiIndicators);
  });
  
  const avgProbability = totalWeight > 0 ? weightedProbability / totalWeight : 50;
  const avgConfidence = results.reduce((sum, r) => sum + (r.confidence || 50), 0) / results.length;
  
  // Deduplicate evidence
  const uniqueEvidence = [...new Set(allEvidence)].slice(0, 6);
  
  return {
    aiProbability: parseFloat(avgProbability.toFixed(2)),
    confidence: parseFloat(avgConfidence.toFixed(2)),
    evidence: uniqueEvidence,
    humanIndicators: [...new Set(allHumanIndicators)].slice(0, 3),
    aiIndicators: [...new Set(allAiIndicators)].slice(0, 3),
    chunksAnalyzed: results.length
  };
}

/**
 * Enhanced AI detection with multi-pass for uncertain results
 */
async function detectAIContentEnhanced(text) {
  try {
    // Pass 1: Standard detection
    const quickResult = await detectAIContent(text);
    
    console.log(`[AI-DETECT] Pass 1 result: ${quickResult.aiProbability}% (confidence: ${quickResult.confidence}%)`);
    
    // If result is uncertain (35-65%) AND confidence is low, run deep analysis
    if (quickResult.aiProbability >= 35 && quickResult.aiProbability <= 65 && quickResult.confidence < 75) {
      console.log('[AI-DETECT] Result uncertain, running deep analysis...');
      
      try {
        const deepResult = await detectAIContentDeep(text);
        
        // Combine results with weighted average
        const combinedProbability = (quickResult.aiProbability * 0.4 + deepResult.aiProbability * 0.6);
        const combinedConfidence = Math.max(quickResult.confidence, deepResult.confidence);
        
        console.log(`[AI-DETECT] Deep analysis: ${deepResult.aiProbability}% → Combined: ${combinedProbability.toFixed(1)}%`);
        
        return {
          aiProbability: parseFloat(combinedProbability.toFixed(2)),
          confidence: parseFloat(combinedConfidence.toFixed(2)),
          evidence: [...quickResult.evidence, ...deepResult.evidence].slice(0, 6),
          humanIndicators: quickResult.humanIndicators || [],
          aiIndicators: quickResult.aiIndicators || [],
          multiPass: true,
          keyFactor: deepResult.keyFactor
        };
      } catch (deepError) {
        console.error('[WARN] Deep analysis failed, using quick result:', deepError.message);
        return quickResult;
      }
    }
    
    return quickResult;
  } catch (error) {
    console.error('[ERROR] Enhanced AI detection failed:', error);
    return detectAIContentHeuristic(text);
  }
}

/**
 * Enhanced heuristic fallback with comprehensive checks
 */
function detectAIContentHeuristic(text) {
  let score = 0;
  const evidence = [];
  const humanIndicators = [];
  const aiIndicators = [];
  
  const textLower = text.toLowerCase();
  const words = textLower.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (words.length < 10) {
    return {
      aiProbability: 50,
      confidence: 20,
      evidence: ['Text too short for reliable analysis'],
      humanIndicators: [],
      aiIndicators: []
    };
  }

  // 1. AI Phrases Detection (expanded list)
  const aiPhrases = [
    // Classic AI phrases
    'it is important to note', 'it should be noted', 'in conclusion',
    'to summarize', 'in summary', 'as an ai', 'i cannot', 'i apologize',
    // Hedging phrases
    'it is worth mentioning', 'one might argue', 'it is essential',
    'it is crucial', 'it is vital', 'it is imperative',
    // Filler phrases
    'in today\'s world', 'in this day and age', 'at the end of the day',
    'it goes without saying', 'needless to say', 'first and foremost',
    'last but not least', 'in light of', 'with that being said',
    'having said that', 'that being said',
    // AI-specific verbs
    'delve into', 'dive into', 'explore the', 'unpack the',
    'leverage', 'utilize', 'facilitate', 'implement',
    // Transition overuse
    'furthermore', 'moreover', 'additionally', 'consequently',
    'subsequently', 'nevertheless', 'nonetheless', 'hence', 'thus'
  ];
  
  const foundPhrases = aiPhrases.filter(phrase => textLower.includes(phrase));
  if (foundPhrases.length > 0) {
    const phraseScore = Math.min(foundPhrases.length * 7, 35);
    score += phraseScore;
    aiIndicators.push(`Contains ${foundPhrases.length} typical AI phrases`);
    evidence.push(`AI phrases found: "${foundPhrases.slice(0, 3).join('", "')}"`);
  }

  // 2. Sentence Length Uniformity
  if (sentences.length >= 4) {
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev < 4 && sentences.length > 5) {
      score += 12;
      aiIndicators.push('Very uniform sentence length');
      evidence.push(`Uniform sentence length (std dev: ${stdDev.toFixed(1)}) - typical of AI`);
    } else if (stdDev > 10) {
      humanIndicators.push('Natural sentence length variation');
    }
  }

  // 3. Contraction Analysis
  const contractions = [
    "don't", "won't", "can't", "isn't", "aren't", "wasn't", "weren't",
    "i'm", "you're", "they're", "we're", "it's", "that's", "there's",
    "here's", "what's", "who's", "let's", "i've", "you've", "we've",
    "they've", "i'll", "you'll", "he'll", "she'll", "we'll", "they'll",
    "i'd", "you'd", "he'd", "she'd", "we'd", "they'd", "couldn't",
    "wouldn't", "shouldn't", "hasn't", "haven't", "hadn't"
  ];
  
  const contractionCount = contractions.filter(c => textLower.includes(c)).length;
  const contractionDensity = contractionCount / (words.length / 100);
  
  if (contractionCount === 0 && words.length > 100) {
    score += 10;
    aiIndicators.push('No contractions used');
    evidence.push('No contractions found - formal AI style');
  } else if (contractionDensity > 2) {
    humanIndicators.push('Natural use of contractions');
    score -= 5;
  }

  // 4. Transition Word Overuse
  const transitions = ['however', 'moreover', 'furthermore', 'additionally', 
    'consequently', 'therefore', 'nevertheless', 'nonetheless', 
    'subsequently', 'accordingly', 'hence', 'thus'];
  const transitionCount = transitions.filter(t => textLower.includes(t)).length;
  
  if (transitionCount > 4) {
    score += Math.min(transitionCount * 4, 20);
    aiIndicators.push('Excessive transition words');
    evidence.push(`Excessive transition words (${transitionCount} found)`);
  }

  // 5. Perfect Structure Detection
  const hasIntro = sentences[0]?.length > 50;
  const lastSentence = sentences[sentences.length - 1]?.toLowerCase() || '';
  const hasConclusion = lastSentence.includes('in conclusion') || 
                        lastSentence.includes('to summarize') ||
                        lastSentence.includes('in summary') ||
                        lastSentence.includes('overall');
  
  if (hasIntro && hasConclusion && sentences.length > 5) {
    score += 8;
    aiIndicators.push('Perfect intro-conclusion structure');
    evidence.push('Formulaic structure detected');
  }

  // 6. Word Repetition Analysis
  const wordFreq = new Map();
  const contentWords = words.filter(w => w.length > 4 && !['which', 'there', 'their', 'would', 'could', 'should', 'about', 'these', 'those'].includes(w));
  contentWords.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });
  
  const sortedWords = Array.from(wordFreq.entries()).sort((a, b) => b[1] - a[1]);
  const topWord = sortedWords[0];
  
  if (topWord && topWord[1] > words.length * 0.05 && topWord[1] > 5) {
    score += 8;
    aiIndicators.push('Repetitive vocabulary');
    evidence.push(`Word "${topWord[0]}" repeats ${topWord[1]} times`);
  }

  // 7. Personal Pronouns & Authenticity
  const personalPronouns = ['i ', 'my ', 'me ', 'myself'];
  const hasPersonal = personalPronouns.some(p => textLower.includes(p));
  const opinionPhrases = ['i think', 'i believe', 'in my opinion', 'i feel', 'personally'];
  const hasOpinion = opinionPhrases.some(p => textLower.includes(p));
  
  if (hasPersonal && hasOpinion) {
    humanIndicators.push('Personal voice and opinions');
    score -= 10;
  } else if (!hasPersonal && words.length > 150) {
    score += 5;
    aiIndicators.push('Lacks personal voice');
  }

  // 8. Informal Language / Slang
  const informalMarkers = ['gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'yeah', 'nope', 'yep', 'ok ', 'okay', 'lol', 'btw', 'tbh', 'imo', 'imho'];
  const hasInformal = informalMarkers.some(m => textLower.includes(m));
  
  if (hasInformal) {
    humanIndicators.push('Uses informal language');
    score -= 8;
  }

  // 9. Question Usage
  const questionCount = (text.match(/\?/g) || []).length;
  if (questionCount > 0 && questionCount < sentences.length * 0.3) {
    humanIndicators.push('Natural question usage');
    score -= 3;
  }

  // 10. Exclamation & Emotion
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 0 && exclamationCount < 5) {
    humanIndicators.push('Emotional expression');
    score -= 3;
  }

  // Calculate final score
  const finalScore = Math.max(0, Math.min(95, score));
  
  // Calculate confidence based on evidence strength
  const evidenceCount = evidence.length + humanIndicators.length + aiIndicators.length;
  const confidence = Math.min(70, 30 + evidenceCount * 8);

  return {
    aiProbability: finalScore,
    confidence: confidence,
    evidence: evidence.length > 0 ? evidence : ['Heuristic analysis completed'],
    humanIndicators: humanIndicators,
    aiIndicators: aiIndicators
  };
}

// ============================================================================
// VOICE PROFILE GENERATION
// ============================================================================

async function generateVoiceSummary(sampleTexts, statisticalFeatures) {
  try {
    const model = vertexAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const selectedSamples = sampleTexts
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(10, sampleTexts.length));

    const combinedText = selectedSamples.join('\n\n---\n\n');

    const prompt = `Analyze the author's writing style based on text samples.

WRITING STYLE STATISTICS:
- Average sentence length: ${statisticalFeatures.avgSentenceLength} words
- Average word length: ${statisticalFeatures.avgWordLength} characters
- Vocabulary richness: ${statisticalFeatures.vocabularyRichness.toFixed(2)}
- Top sentence starters: ${statisticalFeatures.topSentenceStarters?.join(', ') || 'N/A'}
- Transition word usage: ${Object.keys(statisticalFeatures.transitionWordUsage || {}).slice(0, 5).join(', ') || 'N/A'}

TEXT SAMPLES:
${combinedText}

ANALYZE DEEPLY:
1. How does the author typically START sentences? (Subject-first, Adverb-first, Question, etc.)
2. What TRANSITION WORDS does the author prefer? (however, therefore, but, and, etc.)
3. What PUNCTUATION PATTERNS are distinctive? (em-dashes, semicolons, exclamation marks, commas)
4. What EMOTIONAL MARKERS appear? (I think, I feel, In my opinion, etc.)
5. What is the typical PARAGRAPH STRUCTURE? (Topic sentence first, examples, conclusion)
6. What SENTENCE OPENING patterns are common? (Time markers, Conjunctions, Adverbs, etc.)

Return JSON in this format:
{
  "tone": "professional/casual/academic/creative/friendly",
  "formality_level": 1-10,
  "key_characteristics": ["Characteristic 1", "Characteristic 2", "Characteristic 3", "Characteristic 4", "Characteristic 5"],
  "sentence_starters": ["Common starter 1", "Common starter 2", "Common starter 3"],
  "transition_preferences": ["transition 1", "transition 2", "transition 3"],
  "punctuation_style": "Description of punctuation usage (e.g., 'Uses commas frequently, avoids semicolons')",
  "vocabulary_preferences": {
    "common_phrases": ["phrase 1", "phrase 2", "phrase 3"],
    "avoid_words": ["word 1", "word 2"],
    "preferred_connectors": ["connector 1", "connector 2", "connector 3"]
  },
  "sentence_patterns": {
    "typical_length": "short/medium/long",
    "structure_preference": "simple/complex/varied",
    "opening_style": "Description of opening style (e.g., 'Often starts with subject, occasionally uses time markers')"
  },
  "rewrite_instructions": "Detailed instructions on how to rewrite text to match this style, including specific examples"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates[0].content.parts[0].text.trim();
    const voiceProfile = JSON.parse(responseText);
    
    console.log(`[SUCCESS] Generated voice profile: ${voiceProfile.tone}, formality: ${voiceProfile.formality_level}`);
    
    return voiceProfile;
  } catch (error) {
    console.error('[ERROR] Voice summary generation failed:', error);
    
    return {
      tone: 'neutral',
      formality_level: 5,
      key_characteristics: [
        'Natural writing style',
        'Uses simple language',
        'Clear sentence structure',
        'Direct idea expression',
        'Suitable for communication context'
      ],
      sentence_starters: ['The', 'I', 'It'],
      transition_preferences: ['and', 'but', 'however'],
      punctuation_style: 'Uses standard punctuation, prefers commas and periods',
      vocabulary_preferences: {
        common_phrases: [],
        avoid_words: [],
        preferred_connectors: ['and', 'but', 'because']
      },
      sentence_patterns: {
        typical_length: 'medium',
        structure_preference: 'simple',
        opening_style: 'Start with clear subject'
      },
      rewrite_instructions: 'Rewrite text while preserving meaning, using natural and easy-to-understand language.'
    };
  }
}

/**
 * Enhanced rewrite with anti-AI detection
 * Uses humanize.service for advanced humanization
 */
async function rewriteWithVoice(originalText, voiceProfile, context = {}, modelName = 'gemini-2.0-flash-exp') {
  try {
    // Import humanize service
    const humanizeService = require('./humanize.service');
    
    // Check if iterative refinement is requested
    if (context.useIterativeRefinement) {
      console.log('[REWRITE] Using iterative refinement mode...');
      const result = await humanizeService.rewriteWithIterativeRefinement(
        originalText,
        voiceProfile,
        context,
        {
          maxIterations: context.maxIterations || 2,
          targetProbability: context.targetProbability || 40,
          model: modelName
        }
      );
      return result.text;
    }
    
    // Use enhanced anti-AI detection rewrite
    console.log('[REWRITE] Using enhanced anti-AI detection mode...');
    const rewrittenText = await humanizeService.rewriteWithAntiDetection(
      originalText,
      voiceProfile,
      {
        ...context,
        sampleText: context.sampleText || null,
        applyImperfections: context.applyImperfections !== false
      },
      modelName
    );

    console.log(`[SUCCESS] Rewritten text (${originalText.length} → ${rewrittenText.length} chars)`);
    return rewrittenText;
  } catch (error) {
    console.error('[ERROR] Text rewriting failed:', error);
    
    // Fallback to basic rewrite if humanize service fails
    console.log('[REWRITE] Falling back to basic rewrite...');
    return await rewriteWithVoiceBasic(originalText, voiceProfile, context, modelName);
  }
}

/**
 * Basic rewrite (fallback) - original implementation
 */
async function rewriteWithVoiceBasic(originalText, voiceProfile, context = {}, modelName = 'gemini-2.0-flash-exp') {
  try {
    const model = vertexAI.getGenerativeModel({ 
      model: modelName
    });

    let voiceDescription;
    
    if (typeof voiceProfile === 'object' && voiceProfile.tone) {
      voiceDescription = `
TONE: ${voiceProfile.tone}
FORMALITY LEVEL: ${voiceProfile.formality_level}/10
CHARACTERISTICS: ${(voiceProfile.key_characteristics || []).slice(0, 3).join(', ')}
PREFERRED PHRASES: ${(voiceProfile.vocabulary_preferences?.common_phrases || []).join(', ')}`;
    } else {
      voiceDescription = String(voiceProfile);
    }

    let prompt = `Rewrite the following text to match the target writing style while preserving meaning.

TARGET WRITING STYLE:
${voiceDescription}`;

    // Add writing preferences if provided (based on profile data)
    if (context.writingPreferences && typeof voiceProfile === 'object') {
      const prefs = context.writingPreferences;
      let preferencesText = '';
      
      // Vocabulary Preferences
      if (prefs.useVocabularyPreferences && voiceProfile.vocabulary_preferences) {
        const vocabPrefs = voiceProfile.vocabulary_preferences;
        if (vocabPrefs.common_phrases?.length > 0 || vocabPrefs.preferred_connectors?.length > 0 || vocabPrefs.avoid_words?.length > 0) {
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
      if (prefs.useKeyCharacteristics && voiceProfile.key_characteristics?.length > 0) {
        preferencesText += '\n\nKEY CHARACTERISTICS: ' + voiceProfile.key_characteristics.join(', ');
      }
      
      // Sentence Patterns
      if (prefs.useSentencePatterns && voiceProfile.sentence_patterns) {
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
      if (prefs.useRewriteInstructions && voiceProfile.rewrite_instructions) {
        preferencesText += '\n\nREWRITE INSTRUCTIONS: ' + voiceProfile.rewrite_instructions;
      }
      
      if (preferencesText) {
        prompt += preferencesText;
      }
    }

    prompt += `

ORIGINAL TEXT:
${originalText}

REWRITTEN TEXT:`;

    const result = await model.generateContent(prompt);
    const rewrittenText = result.response.candidates[0].content.parts[0].text.trim();

    return rewrittenText;
  } catch (error) {
    console.error('[ERROR] Basic text rewriting failed:', error);
    throw error;
  }
}

// ============================================================================
// IMPROVEMENT SUGGESTIONS (with caching)
// ============================================================================

const suggestionAICache = new Map();
const SUGGESTION_AI_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getSuggestionAICacheKey(sentence, profileId) {
  const hash = crypto.createHash('md5')
    .update(`${sentence}_${profileId}`)
    .digest('hex')
    .substring(0, 12);
  return `ai_sug_${hash}`;
}

async function generateImprovementSuggestions(sentence, issues, voiceProfile, context, profileId = null) {
  // Check cache first
  if (profileId) {
    const cacheKey = getSuggestionAICacheKey(sentence, profileId);
    const cached = suggestionAICache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < SUGGESTION_AI_CACHE_TTL) {
      console.log(`[CACHE] AI suggestion cache HIT`);
      return cached.data;
    }
  }

  try {
    const model = vertexAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.5 // Lower temperature for more consistent results
      }
    });

    // Build voice profile description
    let voiceDescription = '';
    if (typeof voiceProfile === 'object' && voiceProfile.tone) {
      voiceDescription = `
TONE: ${voiceProfile.tone}
FORMALITY LEVEL: ${voiceProfile.formality_level}/10
CHARACTERISTICS: ${voiceProfile.key_characteristics?.slice(0, 3).join(', ')}
PREFERRED PHRASES: ${voiceProfile.vocabulary_preferences?.common_phrases?.slice(0, 3).join(', ')}
SENTENCE STRUCTURE: ${voiceProfile.sentence_patterns?.structure_preference}`;
    } else {
      voiceDescription = String(voiceProfile);
    }

    const prompt = `You are a text analysis expert specializing in providing specific improvement suggestions.

TARGET WRITING STYLE:
${voiceDescription}

SENTENCE TO ANALYZE:
"${sentence}"

DETECTED ISSUES:
${issues.map(i => `- ${i.type} (${i.severity}): ${i.detail}`).join('\n')}

${context?.previous_sentence ? `PREVIOUS SENTENCE: "${context.previous_sentence}"` : ''}
${context?.next_sentence ? `NEXT SENTENCE: "${context.next_sentence}"` : ''}

TASK:
Provide 2-4 specific suggestions to improve the sentence to match the target writing style.

REQUIREMENTS:
1. Each suggestion must be specific and immediately applicable
2. Briefly explain why the change is needed
3. Provide concrete examples if possible
4. Prioritize high severity issues

Return JSON in this format:
{
  "suggestions": [
    {
      "type": "vocabulary|structure|length|formality|punctuation|voice",
      "severity": "high|medium|low",
      "issue": "Brief problem description (1 sentence)",
      "suggestion": "Specific fix suggestion (1-2 sentences)",
      "example": "Concrete example or replacement word (if applicable)"
    }
  ]
}

RETURN ONLY JSON, NO ADDITIONAL EXPLANATION.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates[0].content.parts[0].text.trim();
    const parsed = JSON.parse(responseText);
    
    // Map icon for each type (using CDN icons)
    const iconMap = {
      vocabulary: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/book-open.svg',
      structure: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/layout.svg',
      length: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/scissors.svg',
      formality: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/briefcase.svg',
      punctuation: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/more-horizontal.svg',
      voice: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/zap.svg',
      tone: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/smile.svg',
      coherence: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/link.svg',
      repetition: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/repeat.svg'
    };
    
    const suggestions = parsed.suggestions.map(s => ({
      ...s,
      icon: iconMap[s.type] || 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/lightbulb.svg'
    }));

    // Cache the result
    if (profileId) {
      const cacheKey = getSuggestionAICacheKey(sentence, profileId);
      suggestionAICache.set(cacheKey, {
        data: suggestions,
        timestamp: Date.now()
      });
    }
    
    return suggestions;
  } catch (error) {
    console.error('[ERROR] Failed to generate suggestions:', error);
    
    // Fallback to rule-based suggestions
    return generateFallbackSuggestions(issues);
  }
}

function generateFallbackSuggestions(issues) {
  const iconMap = {
    vocabulary: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/book-open.svg',
    structure: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/layout.svg',
    length: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/scissors.svg',
    formality: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/briefcase.svg',
    punctuation: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/more-horizontal.svg',
    voice: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/zap.svg'
  };
  
  return issues.map(issue => {
    let suggestion = '';
    let example = '';
    
    switch (issue.type) {
      case 'length':
        suggestion = 'Break into 2-3 shorter sentences for better readability and clarity';
        example = 'Split at commas or conjunctions';
        break;
      case 'vocabulary':
        suggestion = 'Use simpler words that better match the target writing style';
        example = 'Replace complex words with common ones';
        break;
      case 'formality':
        if (issue.examples) {
          suggestion = `Replace formal words: ${issue.examples.join(', ')}`;
          example = 'utilize → use, commence → start';
        } else {
          suggestion = 'Adjust formality level to match the profile';
        }
        break;
      case 'punctuation':
        suggestion = 'Adjust punctuation usage to match the writing style';
        break;
      case 'voice':
        suggestion = 'Convert from passive to active voice';
        example = 'Was done → Did';
        break;
      default:
        suggestion = 'Adjust to better match the target writing style';
    }
    
    return {
      type: issue.type,
      severity: issue.severity,
      issue: issue.detail,
      suggestion,
      example,
      icon: iconMap[issue.type] || 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/lightbulb.svg'
    };
  });
}

module.exports = {
  createEmbedding,
  createBatchEmbeddings,
  detectAIContent,
  detectAIContentEnhanced,
  detectAIContentHeuristic,
  generateVoiceSummary,
  rewriteWithVoice,
  generateImprovementSuggestions,
  vertexAI
};
