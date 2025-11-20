/**
 * AI Content Authenticator - Complete Backend Service
 * Powered by Google Gemini Ecosystem
 */

const express = require('express');
const cors = require('cors');
const { Firestore, FieldValue } = require('@google-cloud/firestore');
const { VertexAI } = require('@google-cloud/vertexai');
const { PredictionServiceClient, helpers } = require('@google-cloud/aiplatform');
const natural = require('natural');
const compromise = require('compromise');
const { v4: uuidv4 } = require('uuid');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORT = process.env.PORT || 8080;
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'notes-sync-472107';
const LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';

console.log(`🔧 Configuration:`);
console.log(`   Project ID: ${PROJECT_ID}`);
console.log(`   Location: ${LOCATION}`);
console.log(`   Port: ${PORT}`);

// ============================================================================
// INITIALIZE SERVICES
// ============================================================================

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Firestore
const db = new Firestore({ projectId: PROJECT_ID });
console.log('✅ Firestore initialized');

// Vertex AI
const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
console.log('✅ Vertex AI initialized');

// AI Platform for Embeddings
const aiplatformClient = new PredictionServiceClient({
  apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`
});

// Text Analysis
const tokenizer = new natural.WordTokenizer();

// ============================================================================
// CACHING SYSTEM
// ============================================================================

// Profile cache: Store profile metadata and sample vectors
const profileCache = new Map();
const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Profile centroid cache: Store averaged embedding for each profile
const centroidCache = new Map();

function getCachedProfile(profileId) {
  const cached = profileCache.get(profileId);
  if (cached && Date.now() - cached.timestamp < PROFILE_CACHE_TTL) {
    console.log(`✅ Cache HIT for profile ${profileId}`);
    return cached.data;
  }
  console.log(`❌ Cache MISS for profile ${profileId}`);
  return null;
}

function setCachedProfile(profileId, data) {
  profileCache.set(profileId, {
    data,
    timestamp: Date.now()
  });
  console.log(`💾 Cached profile ${profileId}`);
}

function invalidateProfileCache(profileId) {
  profileCache.delete(profileId);
  centroidCache.delete(profileId);
  console.log(`🗑️  Invalidated cache for profile ${profileId}`);
}

// Calculate centroid (average) of all sample vectors
function calculateCentroid(vectors) {
  if (!vectors || vectors.length === 0) return null;
  
  const dimension = vectors[0].length;
  const centroid = new Array(dimension).fill(0);
  
  for (const vector of vectors) {
    for (let i = 0; i < dimension; i++) {
      centroid[i] += vector[i];
    }
  }
  
  // Average
  for (let i = 0; i < dimension; i++) {
    centroid[i] /= vectors.length;
  }
  
  return centroid;
}

// ============================================================================
// HELPER FUNCTIONS - TEXT ANALYSIS
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

// ============================================================================
// GEMINI AI FUNCTIONS
// ============================================================================
// 
// IMPROVEMENTS APPLIED:
// 1. ✅ Removed fallback embedding - prevents storing fake vectors in production
// 2. ✅ Using gemini-2.0-flash-exp (experimental for testing)
// 3. ✅ Added responseMimeType: 'application/json' for guaranteed JSON output
// 4. ✅ Dynamic task_type for embeddings:
//    - RETRIEVAL_DOCUMENT: For storing profile samples
//    - RETRIEVAL_QUERY: For analyzing/comparing new text
//    - SEMANTIC_SIMILARITY: For general similarity comparisons
// 5. ✅ Proper error handling - throw errors instead of silent fallback
//
// NOTE: Using gemini-2.0-flash-exp for testing. Consider switching to
//       gemini-1.5-flash-002 for production stability.
// ============================================================================

async function createEmbedding(text, taskType = 'SEMANTIC_SIMILARITY') {
  try {
    // Validate text length (Gemini embedding limit: ~20K chars)
    if (text.length > 20000) {
      console.warn(`⚠️  Text too long (${text.length} chars), truncating to 20000`);
      text = text.substring(0, 20000);
    }

    const model = 'text-embedding-004';
    const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${model}`;
    
    // CRITICAL: Convert instance to Protobuf Value format
    const instanceValue = helpers.toValue({
      content: text,
      task_type: taskType
    });
    
    const request = {
      endpoint,
      instances: [instanceValue]
    };

    console.log(`🔄 Generating Gemini embedding (${taskType}) for ${text.length} chars...`);
    const [response] = await aiplatformClient.predict(request);
    
    // Convert Protobuf response to JS object
    if (!response.predictions || response.predictions.length === 0) {
      throw new Error('No predictions returned from Vertex AI');
    }
    
    const prediction = helpers.fromValue(response.predictions[0]);
    
    // Validate structure
    if (!prediction.embeddings || !prediction.embeddings.values) {
      throw new Error('Invalid embedding structure returned from Vertex AI');
    }
    
    const embedding = prediction.embeddings.values;
    console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
    return embedding;
  } catch (error) {
    console.error('❌ Embedding generation failed:', error.message);
    
    // CRITICAL FIX: Don't use fallback - throw error instead
    if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('QUOTA_EXCEEDED: Gemini API quota exhausted. Please try again later.');
    }
    
    // For other errors, also throw instead of using fake embeddings
    throw new Error(`EMBEDDING_FAILED: ${error.message}`);
  }
}

// Batch embedding for multiple texts (more efficient)
async function createBatchEmbeddings(texts, taskType = 'SEMANTIC_SIMILARITY') {
  try {
    if (!texts || texts.length === 0) {
      return [];
    }

    // Validate and truncate texts
    const validTexts = texts.map(text => {
      if (text.length > 20000) {
        console.warn(`⚠️  Text too long (${text.length} chars), truncating`);
        return text.substring(0, 20000);
      }
      return text;
    });

    const model = 'text-embedding-004';
    const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${model}`;
    
    // CRITICAL: Convert each instance to Protobuf Value format
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

    console.log(`🔄 Generating ${texts.length} Gemini embeddings in batch (${taskType})...`);
    const [response] = await aiplatformClient.predict(request);
    
    // Convert Protobuf response to JS objects
    const predictions = response.predictions.map(p => helpers.fromValue(p));
    
    // Extract embeddings with validation
    const embeddings = predictions.map((prediction, idx) => {
      if (!prediction || !prediction.embeddings || !prediction.embeddings.values) {
        throw new Error(`Invalid embedding structure for prediction ${idx + 1}`);
      }
      return prediction.embeddings.values;
    });
    
    console.log(`✅ Generated ${embeddings.length} embeddings`);
    return embeddings;
  } catch (error) {
    console.error('❌ Batch embedding generation failed:', error.message);
    
    // CRITICAL FIX: Throw error instead of fallback
    if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('QUOTA_EXCEEDED: Gemini API quota exhausted. Please try again later.');
    }
    
    throw new Error(`BATCH_EMBEDDING_FAILED: ${error.message}`);
  }
}

// REMOVED: Fallback embedding function
// This function has been removed to prevent storing fake embeddings in production.
// If embedding generation fails, the system will now throw an error and ask the user to retry.

async function detectAIContent(text) {
  try {
    const model = vertexAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json' // Force JSON output
      }
    });

    const prompt = `Bạn là chuyên gia phân tích văn bản, chuyên phát hiện nội dung được tạo bởi AI.

NHIỆM VỤ: Đánh giá khả năng văn bản dưới đây được tạo ra bởi AI (Large Language Model).

LƯU Ý QUAN TRỌNG:
- Văn bản chuyên nghiệp, báo chí, học thuật do CON NGƯỜI viết cũng có cấu trúc tốt và ngữ pháp hoàn hảo
- CHỈ đánh giá cao nếu có NHIỀU dấu hiệu AI kết hợp, không chỉ dựa vào một yếu tố
- Ưu tiên phân tích NỘI DUNG và PHONG CÁCH hơn là cấu trúc
- Nếu có thông tin cụ thể (tên người, địa điểm, số liệu, trích dẫn) → có thể do con người viết

CÁC DẤU HIỆU NHẬN BIẾT NỘI DUNG AI:

1. **Cấu trúc & Tổ chức:**
   - Cấu trúc quá hoàn hảo, có tính công thức
   - Các đoạn văn có độ dài đồng đều bất thường
   - Luôn có phần mở đầu, thân bài, kết luận rõ ràng
   - Sử dụng bullet points hoặc danh sách đánh số một cách cơ học

2. **Ngôn ngữ & Từ vựng:**
   - Sử dụng từ ngữ trang trọng, học thuật quá mức MÀ không phù hợp ngữ cảnh
   - Lặp lại cụm từ chuyển tiếp một cách cơ học: "furthermore", "moreover", "in addition", "it is important to note"
   - Sử dụng passive voice nhiều hơn active voice một cách bất thường
   - Từ vựng "an toàn", tránh từ mạnh hoặc cảm xúc
   - LƯU Ý: Văn bản chuyên nghiệp/báo chí cũng có ngữ pháp tốt, đừng chỉ dựa vào điều này

3. **Phong cách viết:**
   - Thiếu cá tính, giọng văn trung lập
   - Không có câu chuyện cá nhân, trải nghiệm thực tế
   - Thiếu cảm xúc, sắc thái tinh tế
   - Không có humor, châm biếm, hoặc ẩn dụ sáng tạo
   - Câu văn có độ dài và cấu trúc đồng đều bất thường

4. **Nội dung & Logic:**
   - Thông tin mang tính tổng quát, thiếu chi tiết cụ thể
   - Tránh đưa ra quan điểm mạnh mẽ hoặc gây tranh cãi
   - Luôn cân bằng, trình bày nhiều góc nhìn một cách cơ học
   - Thiếu ví dụ thực tế, số liệu cụ thể, hoặc trích dẫn
   - QUAN TRỌNG: Nếu có tên người thật, địa điểm cụ thể, số liệu, trích dẫn → rất có thể do con người viết

5. **Cụm từ điển hình của AI:**
   - "As an AI", "I cannot", "I apologize"
   - "It is important to note that", "It should be noted"
   - "In conclusion", "To summarize", "In summary"
   - "Delve into", "Navigate", "Landscape" (trong ngữ cảnh trừu tượng)

VĂN BẢN CẦN PHÂN TÍCH:
"""
${text}
"""

YÊU CẦU PHÂN TÍCH:
1. Đánh giá tổng thể: Đưa ra phần trăm khả năng văn bản được tạo bởi AI (0-100%)
   - 0-20%: Chắc chắn do con người viết (có nhiều chi tiết cụ thể, cá nhân hóa, hoặc thông tin thực tế)
   - 21-40%: Rất có thể do con người viết (có một số đặc điểm tự nhiên)
   - 41-60%: Không chắc chắn, cần thêm bằng chứng (có cả dấu hiệu AI và con người)
   - 61-80%: Rất có thể do AI tạo ra (có nhiều pattern AI nhưng chưa chắc chắn)
   - 81-100%: Chắc chắn do AI tạo ra (có rất nhiều dấu hiệu AI rõ ràng)

2. Bằng chứng cụ thể: Liệt kê 3-5 bằng chứng ngôn ngữ rõ ràng, dẫn chứng cụ thể từ văn bản
   - Nếu đánh giá THẤP (do con người): Chỉ ra các yếu tố tự nhiên, cá nhân, cụ thể
   - Nếu đánh giá CAO (do AI): Chỉ ra các pattern AI rõ ràng

3. Trả về kết quả theo định dạng JSON chính xác:

{
  "ai_probability": <số từ 0-100>,
  "evidence": [
    "Bằng chứng 1 với dẫn chứng cụ thể",
    "Bằng chứng 2 với dẫn chứng cụ thể",
    "Bằng chứng 3 với dẫn chứng cụ thể"
  ]
}

CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH THÊM.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates[0].content.parts[0].text.trim();

    // With responseMimeType: 'application/json', response should be pure JSON
    // But keep minimal cleanup for safety
    const parsed = JSON.parse(responseText);
    
    return {
      aiProbability: parseFloat(parsed.ai_probability || 50),
      evidence: parsed.evidence || []
    };
  } catch (error) {
    console.error('❌ AI detection failed:', error);
    return detectAIContentHeuristic(text);
  }
}

function detectAIContentHeuristic(text) {
  let score = 0;
  const evidence = [];
  const words = text.toLowerCase().split(/\s+/);

  const wordFreq = new Map();
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });
  
  const mostCommon = Array.from(wordFreq.entries()).sort((a, b) => b[1] - a[1])[0];
  
  if (mostCommon && mostCommon[1] > words.length * 0.1) {
    score += 15;
    evidence.push(`Từ "${mostCommon[0]}" lặp lại quá nhiều (${mostCommon[1]} lần)`);
  }

  const formalWords = ['furthermore', 'moreover', 'consequently', 'therefore', 'thus', 'hence'];
  const formalCount = words.filter(w => formalWords.includes(w)).length;
  if (formalCount > 2) {
    score += 10;
    evidence.push(`Sử dụng nhiều từ ngữ trang trọng (${formalCount} từ)`);
  }

  const contractions = ["n't", "'ll", "'ve", "'re", "'m", "'d"];
  const hasContractions = contractions.some(c => text.includes(c));
  if (!hasContractions && words.length > 50) {
    score += 15;
    evidence.push('Không sử dụng dạng rút gọn (contractions)');
  }

  const aiPhrases = [
    'it is important to note', 'it should be noted', 'in conclusion',
    'to summarize', 'in summary', 'as an ai', 'i cannot', 'i apologize'
  ];
  
  const textLower = text.toLowerCase();
  const foundPhrases = aiPhrases.filter(phrase => textLower.includes(phrase));
  
  if (foundPhrases.length > 0) {
    score += Math.min(foundPhrases.length * 10, 30);
    evidence.push(`Chứa cụm từ điển hình của AI: "${foundPhrases[0]}"`);
  }

  const personalPronouns = ['i', 'me', 'my', 'mine', 'we', 'us', 'our'];
  const pronounCount = words.filter(w => personalPronouns.includes(w)).length;
  if (pronounCount === 0 && words.length > 50) {
    score += 10;
    evidence.push('Thiếu đại từ nhân xưng');
  }

  return {
    aiProbability: Math.min(score, 100),
    evidence: evidence.length > 0 ? evidence : ['Phân tích heuristic cơ bản']
  };
}

async function generateVoiceSummary(sampleTexts, statisticalFeatures) {
  try {
    const model = vertexAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json' // Force JSON output
      }
    });

    const selectedSamples = sampleTexts
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(10, sampleTexts.length));

    const combinedText = selectedSamples.join('\n\n---\n\n');

    const prompt = `Phân tích phong cách viết của tác giả dựa trên các mẫu văn bản và chỉ số thống kê.

THỐNG KÊ VĂN PHONG:
- Độ dài trung bình câu: ${statisticalFeatures.avgSentenceLength} từ
- Độ dài trung bình từ: ${statisticalFeatures.avgWordLength} ký tự
- Độ phong phú từ vựng: ${statisticalFeatures.vocabularyRichness.toFixed(2)}
- Tỷ lệ dấu câu: ${statisticalFeatures.punctuationRatio.toFixed(3)}
- Điểm dễ đọc: ${statisticalFeatures.readabilityScore}/100

CÁC MẪU VĂN BẢN:
${combinedText}

NHIỆM VỤ:
Tạo hồ sơ văn phong chi tiết theo format JSON để hướng dẫn AI viết lại văn bản.

YÊU CẦU:
1. Phân tích tone (professional/casual/academic/creative/friendly)
2. Đánh giá mức độ trang trọng (1-10)
3. Liệt kê 5 đặc điểm chính với ví dụ cụ thể
4. Xác định cụm từ/từ vựng ưa thích và tránh dùng
5. Mô tả cấu trúc câu điển hình
6. Đưa ra hướng dẫn cụ thể cho việc viết lại

Trả về JSON theo format:
{
  "tone": "professional/casual/academic/creative/friendly",
  "formality_level": 1-10,
  "key_characteristics": [
    "Đặc điểm 1 với ví dụ cụ thể từ văn bản",
    "Đặc điểm 2 với ví dụ cụ thể từ văn bản",
    "Đặc điểm 3 với ví dụ cụ thể từ văn bản",
    "Đặc điểm 4 với ví dụ cụ thể từ văn bản",
    "Đặc điểm 5 với ví dụ cụ thể từ văn bản"
  ],
  "vocabulary_preferences": {
    "common_phrases": ["cụm từ thường dùng 1", "cụm từ 2", "cụm từ 3"],
    "avoid_words": ["từ nên tránh 1", "từ nên tránh 2"],
    "preferred_connectors": ["từ nối ưa thích 1", "từ nối 2"]
  },
  "sentence_patterns": {
    "typical_length": "short/medium/long",
    "structure_preference": "simple/complex/varied",
    "opening_style": "Mô tả cách thường mở đầu câu"
  },
  "rewrite_instructions": "Hướng dẫn chi tiết cho AI khi viết lại: cách dùng từ, cấu trúc câu, tone, formality"
}

CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH THÊM.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates[0].content.parts[0].text.trim();

    // With responseMimeType: 'application/json', response should be pure JSON
    const voiceProfile = JSON.parse(responseText);
    
    console.log(`✅ Generated structured voice profile:`, {
      tone: voiceProfile.tone,
      formality: voiceProfile.formality_level,
      characteristics: voiceProfile.key_characteristics?.length || 0
    });
    
    return voiceProfile;
  } catch (error) {
    console.error('❌ Voice summary generation failed:', error);
    
    // Fallback to simple summary
    console.warn('⚠️  Using fallback simple summary');
    return {
      tone: 'neutral',
      formality_level: 5,
      key_characteristics: [
        'Phong cách viết tự nhiên',
        'Sử dụng ngôn ngữ đơn giản',
        'Cấu trúc câu rõ ràng',
        'Truyền đạt ý tưởng trực tiếp',
        'Phù hợp với ngữ cảnh giao tiếp'
      ],
      vocabulary_preferences: {
        common_phrases: [],
        avoid_words: [],
        preferred_connectors: ['và', 'nhưng', 'vì']
      },
      sentence_patterns: {
        typical_length: 'medium',
        structure_preference: 'simple',
        opening_style: 'Bắt đầu với chủ ngữ rõ ràng'
      },
      rewrite_instructions: 'Viết lại văn bản giữ nguyên ý nghĩa, sử dụng ngôn ngữ tự nhiên và dễ hiểu.'
    };
  }
}

async function rewriteWithVoice(originalText, voiceProfile, context = {}) {
  try {
    const model = vertexAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp'
      // Note: No JSON mode here since we want natural text output
    });

    // Use structured voice profile if available, fallback to text summary
    let voiceDescription;
    
    if (typeof voiceProfile === 'object' && voiceProfile.tone) {
      // Structured profile
      voiceDescription = `
TONE: ${voiceProfile.tone}
MỨC ĐỘ TRANG TRỌNG: ${voiceProfile.formality_level}/10

ĐẶC ĐIỂM CHÍNH:
${voiceProfile.key_characteristics.map((c, i) => `${i + 1}. ${c}`).join('\n')}

TỪ VỰNG:
- Cụm từ ưa thích: ${voiceProfile.vocabulary_preferences.common_phrases.join(', ')}
- Từ nối thường dùng: ${voiceProfile.vocabulary_preferences.preferred_connectors.join(', ')}
${voiceProfile.vocabulary_preferences.avoid_words.length > 0 ? `- Tránh dùng: ${voiceProfile.vocabulary_preferences.avoid_words.join(', ')}` : ''}

CẤU TRÚC CÂU:
- Độ dài: ${voiceProfile.sentence_patterns.typical_length}
- Phong cách: ${voiceProfile.sentence_patterns.structure_preference}
- Cách mở đầu: ${voiceProfile.sentence_patterns.opening_style}

HƯỚNG DẪN: ${voiceProfile.rewrite_instructions}`;
    } else {
      // Text summary (backward compatibility)
      voiceDescription = voiceProfile;
    }

    const prompt = `Bạn là trợ lý biên tập chuyên nghiệp, chuyên gia viết lại văn bản.

NHIỆM VỤ: Viết lại văn bản sau sao cho phù hợp với VĂN PHONG MỤC TIÊU, nhưng TUYỆT ĐỐI giữ nguyên ý nghĩa và nội dung.

VĂN PHONG MỤC TIÊU:
${voiceDescription}

${context.targetAudience ? `ĐỐI TƯỢNG: ${context.targetAudience}` : ''}
${context.purpose ? `MỤC ĐÍCH: ${context.purpose}` : ''}

VĂN BẢN GỐC:
${originalText}

YÊU CẦU:
1. Giữ nguyên 100% ý nghĩa và thông tin
2. Điều chỉnh cách diễn đạt, cấu trúc câu, từ vựng để khớp với văn phong mục tiêu
3. Áp dụng tone và mức độ trang trọng phù hợp
4. Sử dụng cụm từ và từ nối ưa thích
5. Không thêm hoặc bớt thông tin
6. Chỉ trả về văn bản đã viết lại, không giải thích

VĂN BẢN ĐÃ VIẾT LẠI:`;

    const result = await model.generateContent(prompt);
    const rewrittenText = result.response.candidates[0].content.parts[0].text.trim();

    console.log(`✅ Rewritten text (${originalText.length} → ${rewrittenText.length} chars)`);
    return rewrittenText;
  } catch (error) {
    console.error('❌ Text rewriting failed:', error);
    throw error;
  }
}

// ============================================================================
// FIRESTORE FUNCTIONS
// ============================================================================

async function incrementUsage(userId, field) {
  try {
    await db.collection('users').doc(userId).update({
      [`usage.${field}`]: FieldValue.increment(1)
    });
  } catch (error) {
    console.warn(`Failed to increment usage for ${userId}:`, error);
  }
}

// ============================================================================
// API ROUTES
// ============================================================================

// Home
app.get('/', (req, res) => {
  res.json({
    service: 'AI Content Authenticator - Complete Backend (Node.js)',
    version: '2.0',
    status: 'running',
    powered_by: 'Google Gemini Ecosystem',
    endpoints: {
      '/authenticate': 'POST - Xác thực nội dung AI',
      '/create_profile': 'POST - Tạo voice profile mới',
      '/add_sample': 'POST - Thêm sample vào profile',
      '/add_samples_batch': 'POST - Thêm nhiều samples cùng lúc',
      '/finalize_profile': 'POST - Hoàn thiện profile',
      '/get_profile': 'GET - Lấy thông tin profile',
      '/get_profiles': 'GET - Lấy danh sách profiles của user',
      '/delete_profile': 'POST - Xóa profile',
      '/analyze': 'POST - Phân tích văn bản',
      '/suggest_improvements': 'POST - Gợi ý cải thiện câu',
      '/rewrite': 'POST - Viết lại văn bản',
      '/health': 'GET - Health check'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ai-content-authenticator',
    runtime: 'Node.js',
    timestamp: new Date().toISOString()
  });
});

// Authenticate - AI Content Detection
app.post('/authenticate', async (req, res) => {
  try {
    const { text, user_id } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const { aiProbability, evidence } = await detectAIContent(text);
    const textFeatures = calculateStatistics(text);

    const isAuthentic = aiProbability < 50;
    const confidence = Math.abs(aiProbability - 50) * 2;

    const result = {
      success: true,
      is_authentic: isAuthentic,
      ai_probability: parseFloat(aiProbability.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(2)),
      evidence,
      text_statistics: textFeatures,
      verdict: isAuthentic
        ? 'Nội dung có vẻ do con người viết'
        : 'Nội dung có thể do AI tạo ra'
    };

    if (user_id) {
      await incrementUsage(user_id, 'analysesCount');
    }

    res.json(result);
  } catch (error) {
    console.error('❌ Authentication error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Create Profile
app.post('/create_profile', async (req, res) => {
  try {
    const { user_id, profile_name = 'Hồ sơ mặc định', email, name = 'User', theme = 'work' } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const userDoc = await db.collection('users').doc(user_id).get();
    if (!userDoc.exists) {
      await db.collection('users').doc(user_id).set({
        email: email || user_id,
        name,
        tier: 'free',
        usage: { profilesCount: 0, analysesCount: 0, rewritesCount: 0 },
        createdAt: new Date()
      });
      console.log(`✅ Auto-created user: ${user_id}`);
    }

    const profileId = uuidv4();

    await db.collection('voice_profiles').doc(profileId).set({
      userId: user_id,
      name: profile_name,
      theme: theme,
      status: 'pending',
      samplesCount: 0,
      createdAt: new Date()
    });

    await incrementUsage(user_id, 'profilesCount');

    res.status(201).json({
      success: true,
      profile_id: profileId,
      profile: { userId: user_id, name: profile_name, theme: theme, status: 'pending', samplesCount: 0 }
    });
  } catch (error) {
    console.error('❌ Create profile error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Add Samples in Batch (NEW - for hybrid approach)
app.post('/add_samples_batch', async (req, res) => {
  try {
    const { profile_id, samples } = req.body;

    if (!profile_id || !samples || !Array.isArray(samples)) {
      return res.status(400).json({ error: 'profile_id and samples array are required' });
    }

    if (samples.length === 0) {
      return res.status(400).json({ error: 'At least 1 sample is required' });
    }

    if (samples.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 samples allowed per batch' });
    }

    console.log(`📦 Adding ${samples.length} samples in batch to profile ${profile_id}...`);

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Validate all samples first
    const validationErrors = [];
    samples.forEach((sample, idx) => {
      if (!sample.text || typeof sample.text !== 'string') {
        validationErrors.push(`Sample ${idx + 1}: Text is required`);
        return;
      }
      
      if (sample.text.length < 50) {
        validationErrors.push(`Sample ${idx + 1}: Text too short (min 50 chars)`);
      }
      
      if (sample.text.length > 20000) {
        validationErrors.push(`Sample ${idx + 1}: Text too long (max 20,000 chars)`);
      }
      
      const words = sample.text.split(/\s+/);
      if (words.length < 10) {
        validationErrors.push(`Sample ${idx + 1}: Text must have at least 10 words`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Create embeddings for all samples in batch
    // Use RETRIEVAL_DOCUMENT for storing profile samples
    console.log(`🔄 Creating embeddings for ${samples.length} samples...`);
    const texts = samples.map(s => s.text);
    const embeddings = await createBatchEmbeddings(texts, 'RETRIEVAL_DOCUMENT');

    // Batch insert to Firestore
    console.log(`💾 Saving ${samples.length} samples to Firestore...`);
    const batch = db.batch();
    const sampleIds = [];

    samples.forEach((sample, idx) => {
      const sampleId = uuidv4();
      sampleIds.push(sampleId);

      const sampleRef = db.collection('voice_profiles')
        .doc(profile_id)
        .collection('samples')
        .doc(sampleId);

      batch.set(sampleRef, {
        text: sample.text,
        type: sample.type || 'unknown', // 'long' or 'short'
        vector: embeddings[idx],
        vectorModel: 'text-embedding-004',
        taskType: 'RETRIEVAL_DOCUMENT', // Store for profile samples
        createdAt: new Date()
      });
    });

    // Update profile samples count
    const profileRef = db.collection('voice_profiles').doc(profile_id);
    batch.update(profileRef, {
      samplesCount: FieldValue.increment(samples.length),
      updatedAt: new Date()
    });

    await batch.commit();

    // Invalidate cache when samples are added
    invalidateProfileCache(profile_id);

    console.log(`✅ Added ${samples.length} samples successfully`);

    res.status(201).json({
      success: true,
      profile_id,
      samples_added: samples.length,
      sample_ids: sampleIds
    });
  } catch (error) {
    console.error('❌ Batch add samples error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Add Sample
app.post('/add_sample', async (req, res) => {
  try {
    const { profile_id, text } = req.body;

    if (!profile_id || !text) {
      return res.status(400).json({ error: 'profile_id and text are required' });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Use RETRIEVAL_DOCUMENT for storing profile samples
    const vector = await createEmbedding(text, 'RETRIEVAL_DOCUMENT');
    const sampleId = uuidv4();

    await db.collection('voice_profiles').doc(profile_id).collection('samples').doc(sampleId).set({
      text,
      vector,
      createdAt: new Date()
    });

    await db.collection('voice_profiles').doc(profile_id).update({
      samplesCount: FieldValue.increment(1)
    });

    // Invalidate cache when sample is added
    invalidateProfileCache(profile_id);

    res.status(201).json({
      success: true,
      sample_id: sampleId,
      sample: { text, vector_length: vector.length }
    });
  } catch (error) {
    console.error('❌ Add sample error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Finalize Profile
app.post('/finalize_profile', async (req, res) => {
  try {
    const { profile_id } = req.body;

    if (!profile_id) {
      return res.status(400).json({ error: 'profile_id is required' });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const samplesSnapshot = await db.collection('voice_profiles').doc(profile_id).collection('samples').get();
    const samples = samplesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (samples.length < 3) {
      return res.status(400).json({ error: 'Profile needs at least 3 samples' });
    }

    console.log(`🔄 Finalizing profile ${profile_id} with ${samples.length} samples...`);

    // 1. Calculate statistical features
    const allText = samples.map(s => s.text).join(' ');
    const statisticalFeatures = calculateStatistics(allText);
    console.log(`✅ Calculated statistical features`);

    // 2. Generate structured voice summary (for rewriting)
    const sampleTexts = samples.map(s => s.text);
    const voiceProfile = await generateVoiceSummary(sampleTexts, statisticalFeatures);
    console.log(`✅ Generated voice profile`);

    // 3. Create embeddings for all samples (if not already created)
    // Check if samples already have embeddings
    const samplesNeedEmbedding = samples.filter(s => !s.vector || s.vector.length === 0);
    
    if (samplesNeedEmbedding.length > 0) {
      console.log(`🔄 Creating embeddings for ${samplesNeedEmbedding.length} samples...`);
      
      // Use batch embedding for efficiency with RETRIEVAL_DOCUMENT for profile samples
      const textsToEmbed = samplesNeedEmbedding.map(s => s.text);
      const embeddings = await createBatchEmbeddings(textsToEmbed, 'RETRIEVAL_DOCUMENT');
      
      // Update samples with embeddings
      const batch = db.batch();
      samplesNeedEmbedding.forEach((sample, idx) => {
        const sampleRef = db.collection('voice_profiles')
          .doc(profile_id)
          .collection('samples')
          .doc(sample.id);
        
        batch.update(sampleRef, {
          vector: embeddings[idx],
          vectorModel: 'text-embedding-004',
          updatedAt: new Date()
        });
      });
      
      await batch.commit();
      console.log(`✅ Updated ${samplesNeedEmbedding.length} samples with embeddings`);
    } else {
      console.log(`✅ All samples already have embeddings`);
    }

    // 4. Create promptable summary text from structured profile (for backward compatibility)
    const promptableSummary = `
Tone: ${voiceProfile.tone}
Mức độ trang trọng: ${voiceProfile.formality_level}/10

Đặc điểm chính:
${voiceProfile.key_characteristics.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Từ vựng ưa thích: ${voiceProfile.vocabulary_preferences.common_phrases.join(', ')}
Từ nối thường dùng: ${voiceProfile.vocabulary_preferences.preferred_connectors.join(', ')}

Cấu trúc câu: ${voiceProfile.sentence_patterns.structure_preference}
Độ dài câu: ${voiceProfile.sentence_patterns.typical_length}

Hướng dẫn viết lại: ${voiceProfile.rewrite_instructions}
`.trim();

    // 5. Update profile with all data
    await db.collection('voice_profiles').doc(profile_id).update({
      status: 'ready',
      statisticalFeatures,
      voiceProfile, // Structured JSON for advanced use
      promptableSummary, // Text format for simple prompting
      embeddingModel: 'text-embedding-004',
      updatedAt: new Date()
    });

    // Invalidate cache when profile is finalized
    invalidateProfileCache(profile_id);

    console.log(`✅ Profile ${profile_id} finalized successfully`);

    res.json({
      success: true,
      profile_id,
      status: 'ready',
      samples_count: samples.length,
      statistical_features: statisticalFeatures,
      voice_profile: voiceProfile,
      voice_summary: promptableSummary
    });
  } catch (error) {
    console.error('❌ Finalize profile error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Get Profile (with full details)
app.get('/get_profile', async (req, res) => {
  try {
    const { profile_id } = req.query;

    if (!profile_id) {
      return res.status(400).json({ error: 'profile_id is required' });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();

    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profileData = profileDoc.data();
    const samplesSnapshot = await db.collection('voice_profiles').doc(profile_id).collection('samples').get();

    res.json({
      success: true,
      profile: {
        profile_id: profileDoc.id,
        profile_name: profileData.name,
        theme: profileData.theme || 'work',
        status: profileData.status,
        sample_count: samplesSnapshot.size,
        created_at: profileData.createdAt?.toDate().toISOString(),
        updated_at: profileData.updatedAt?.toDate().toISOString(),
        // Statistical features
        statistics: profileData.statisticalFeatures || null,
        // Voice profile
        voice_profile: profileData.voiceProfile || null,
        // Summary
        summary: profileData.promptableSummary || null,
        // Embedding model
        embedding_model: profileData.embeddingModel || null
      }
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Get All Profiles for User
app.get('/get_profiles', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Query without orderBy to avoid needing composite index
    const profilesSnapshot = await db.collection('voice_profiles')
      .where('userId', '==', user_id)
      .get();

    const profiles = [];
    
    for (const doc of profilesSnapshot.docs) {
      const profileData = doc.data();
      
      // Get sample count
      const samplesSnapshot = await db.collection('voice_profiles')
        .doc(doc.id)
        .collection('samples')
        .get();
      
      profiles.push({
        profile_id: doc.id,
        profile_name: profileData.name,
        theme: profileData.theme || 'work',
        status: profileData.status,
        sample_count: samplesSnapshot.size,
        created_at: profileData.createdAt?.toDate().toISOString(),
        updated_at: profileData.updatedAt?.toDate().toISOString(),
        summary: profileData.promptableSummary || null,
        // Statistical features
        statistics: profileData.statisticalFeatures || null,
        // Voice profile
        voice_profile: profileData.voiceProfile || null
      });
    }

    // Sort by createdAt descending in application code
    profiles.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA; // Descending order (newest first)
    });

    res.json({
      success: true,
      profiles,
      count: profiles.length
    });
  } catch (error) {
    console.error('❌ Get profiles error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Delete Profile
app.post('/delete_profile', async (req, res) => {
  try {
    const { profile_id } = req.body;

    if (!profile_id) {
      return res.status(400).json({ error: 'profile_id is required' });
    }

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();

    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Delete all samples
    const samplesSnapshot = await db.collection('voice_profiles')
      .doc(profile_id)
      .collection('samples')
      .get();
    
    const batch = db.batch();
    samplesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Delete profile
    await db.collection('voice_profiles').doc(profile_id).delete();

    // Invalidate cache
    invalidateProfileCache(profile_id);

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete profile error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Analyze Text - OPTIMIZED with caching and centroid comparison
app.post('/analyze', async (req, res) => {
  try {
    const { profile_id, text, user_id } = req.body;

    if (!profile_id || !text) {
      return res.status(400).json({ error: 'profile_id and text are required' });
    }

    console.log(`🔍 Analyzing text for profile ${profile_id}...`);
    const startTime = Date.now();

    // Try to get cached profile data
    let cachedData = getCachedProfile(profile_id);
    let profileData, sampleVectors, centroid;

    if (cachedData) {
      // Use cached data
      profileData = cachedData.profileData;
      sampleVectors = cachedData.sampleVectors;
      centroid = cachedData.centroid;
      console.log(`⚡ Using cached data (${sampleVectors.length} samples)`);
    } else {
      // Load from Firestore
      const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();
      if (!profileDoc.exists) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      profileData = profileDoc.data();

      if (profileData.status !== 'ready') {
        return res.status(400).json({ error: 'Profile is not ready for analysis' });
      }

      // OPTIMIZATION 1: Limit samples to 50 most representative
      const samplesSnapshot = await db.collection('voice_profiles')
        .doc(profile_id)
        .collection('samples')
        .limit(50)
        .get();
      
      const samples = samplesSnapshot.docs.map(doc => doc.data());

      if (samples.length === 0) {
        return res.status(400).json({ error: 'Profile has no samples' });
      }

      sampleVectors = samples.map(s => s.vector).filter(v => v && v.length > 0);

      if (sampleVectors.length === 0) {
        return res.status(400).json({ error: 'Profile samples have no embeddings. Please re-finalize the profile.' });
      }

      // OPTIMIZATION 2: Calculate centroid (average embedding)
      centroid = calculateCentroid(sampleVectors);
      
      // Cache the data
      setCachedProfile(profile_id, {
        profileData,
        sampleVectors,
        centroid
      });
      
      console.log(`💾 Loaded and cached ${sampleVectors.length} samples`);
    }

    // Split text into sentences
    const sentences = splitIntoSentences(text);
    const validSentences = sentences.filter(s => s.split(/\s+/).length >= 3);

    if (validSentences.length === 0) {
      return res.status(400).json({ error: 'Text must contain at least 1 sentence with 3+ words' });
    }

    console.log(`📝 Analyzing ${validSentences.length} sentences...`);

    // OPTIMIZATION 3: Parallel processing - embeddings and statistics
    const [sentenceVectors, textFeatures] = await Promise.all([
      createBatchEmbeddings(validSentences, 'RETRIEVAL_QUERY'),
      Promise.resolve(calculateStatistics(text))
    ]);

    // OPTIMIZATION 4: Use centroid for fast comparison
    const sentenceAnalyses = [];
    const allSimilarities = [];
    const centroidSimilarities = [];

    for (let idx = 0; idx < validSentences.length; idx++) {
      const sentence = validSentences[idx];
      const sentenceVector = sentenceVectors[idx];

      // Fast comparison with centroid
      const centroidSimilarity = calculateCosineSimilarity(sentenceVector, centroid);
      centroidSimilarities.push(centroidSimilarity);

      // For detailed analysis, compare with top-k samples (k=10)
      // Sort by similarity and take top 10
      const similarities = sampleVectors
        .map(sampleVec => calculateCosineSimilarity(sentenceVector, sampleVec))
        .sort((a, b) => b - a)
        .slice(0, 10); // Only top 10 most similar

      const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
      const maxSimilarity = similarities[0]; // Already sorted
      const minSimilarity = similarities[similarities.length - 1];

      allSimilarities.push(avgSimilarity);

      // Dynamic threshold based on distribution
      const threshold = calculateDynamicThreshold(similarities);
      const isDeviant = avgSimilarity < threshold;

      // Calculate confidence based on variance
      const variance = similarities.reduce((sum, val) => 
        sum + Math.pow(val - avgSimilarity, 2), 0) / similarities.length;
      const confidence = Math.max(0, 100 - variance * 100);

      sentenceAnalyses.push({
        sentence,
        index: idx,
        similarityScore: parseFloat(avgSimilarity.toFixed(3)),
        centroidSimilarity: parseFloat(centroidSimilarity.toFixed(3)),
        maxSimilarity: parseFloat(maxSimilarity.toFixed(3)),
        minSimilarity: parseFloat(minSimilarity.toFixed(3)),
        isDeviant,
        confidence: parseFloat(confidence.toFixed(2))
      });
    }

    // Calculate overall vector score (use centroid for speed)
    const vectorScore = centroidSimilarities.length > 0
      ? (centroidSimilarities.reduce((a, b) => a + b, 0) / centroidSimilarities.length) * 100
      : 0;

    // Calculate statistical score
    const statisticalScore = compareStatisticalFeatures(textFeatures, profileData.statisticalFeatures);

    // OPTIMIZATION 5: Adaptive weighting based on sample count
    const sampleCount = sampleVectors.length;
    const embeddingWeight = Math.min(0.8, 0.5 + (sampleCount / 100) * 0.3);
    const statisticalWeight = 1 - embeddingWeight;

    // Weighted combination
    const voiceCompatibility = vectorScore * embeddingWeight + statisticalScore * statisticalWeight;

    const processingTime = Date.now() - startTime;
    console.log(`✅ Analysis complete: ${voiceCompatibility.toFixed(2)}% compatibility (${processingTime}ms)`);

    const result = {
      success: true,
      voice_compatibility_score: parseFloat(voiceCompatibility.toFixed(2)),
      vector_score: parseFloat(vectorScore.toFixed(2)),
      statistical_score: parseFloat(statisticalScore.toFixed(2)),
      embedding_weight: parseFloat(embeddingWeight.toFixed(2)),
      statistical_weight: parseFloat(statisticalWeight.toFixed(2)),
      sentence_analysis: sentenceAnalyses,
      deviant_sentences: sentenceAnalyses.filter(s => s.isDeviant),
      statistics: textFeatures,
      profile_name: profileData.name,
      embedding_model: profileData.embeddingModel || 'text-embedding-004',
      processing_time_ms: processingTime,
      samples_used: sampleCount,
      cache_hit: cachedData !== null
    };

    if (user_id) {
      await incrementUsage(user_id, 'analysesCount');
    }

    res.json(result);
  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Helper: Calculate dynamic threshold for outlier detection
function calculateDynamicThreshold(similarities) {
  const mean = similarities.reduce((a, b) => a + b, 0) / similarities.length;
  const variance = similarities.reduce((sum, val) => 
    sum + Math.pow(val - mean, 2), 0) / similarities.length;
  const stdDev = Math.sqrt(variance);
  
  // Threshold = mean - 1.5 * stdDev (statistical outlier detection)
  // BUT: Always mark sentences below 60% as deviant (absolute threshold)
  const dynamicThreshold = mean - 1.5 * stdDev;
  const absoluteThreshold = 0.6; // 60% - sentences below this are always deviant
  
  return Math.max(0.5, Math.min(dynamicThreshold, absoluteThreshold));
}

// Rewrite Text - Summary-based generation
app.post('/rewrite', async (req, res) => {
  try {
    const { profile_id, text, user_id, context } = req.body;

    if (!profile_id || !text) {
      return res.status(400).json({ error: 'profile_id and text are required' });
    }

    console.log(`✍️  Rewriting text for profile ${profile_id}...`);

    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profileData = profileDoc.data();

    if (profileData.status !== 'ready') {
      return res.status(400).json({ error: 'Profile is not ready for rewriting' });
    }

    // Use structured voice profile if available, fallback to text summary
    const voiceProfile = profileData.voiceProfile || profileData.promptableSummary;

    if (!voiceProfile) {
      return res.status(400).json({
        error: 'Profile does not have voice profile. Please finalize profile first.'
      });
    }

    const rewrittenText = await rewriteWithVoice(text, voiceProfile, context || {});

    if (!rewrittenText) {
      return res.status(500).json({ error: 'Failed to rewrite text. Please try again.' });
    }

    console.log(`✅ Rewrite complete`);

    if (user_id) {
      await incrementUsage(user_id, 'rewritesCount');
    }

    res.json({
      success: true,
      original_text: text,
      rewritten_text: rewrittenText,
      profile_name: profileData.name,
      tone: profileData.voiceProfile?.tone || 'neutral',
      formality_level: profileData.voiceProfile?.formality_level || 5
    });
  } catch (error) {
    console.error('❌ Rewrite error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// ============================================================================
// SUGGESTION & IMPROVEMENT SYSTEM
// ============================================================================

/**
 * Analyze sentence issues compared to profile
 * Returns array of specific issues found
 */
function analyzeSentenceIssues(sentence, profileStats, voiceProfile) {
  const issues = [];
  
  // 1. Check sentence length
  const words = tokenizer.tokenize(sentence) || [];
  const sentenceLength = words.length;
  
  if (sentenceLength > profileStats.avgSentenceLength * 1.8) {
    issues.push({
      type: 'length',
      severity: 'high',
      detail: `Câu quá dài (${sentenceLength} từ, trung bình profile: ${Math.round(profileStats.avgSentenceLength)} từ)`,
      metric: sentenceLength,
      threshold: profileStats.avgSentenceLength
    });
  } else if (sentenceLength > profileStats.avgSentenceLength * 1.4) {
    issues.push({
      type: 'length',
      severity: 'medium',
      detail: `Câu hơi dài (${sentenceLength} từ, trung bình profile: ${Math.round(profileStats.avgSentenceLength)} từ)`,
      metric: sentenceLength,
      threshold: profileStats.avgSentenceLength
    });
  }
  
  // 2. Check word length (vocabulary complexity)
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
  
  // 3. Check formality based on voice profile
  if (voiceProfile && typeof voiceProfile === 'object') {
    const formalityLevel = voiceProfile.formality_level || 5;
    
    // Formal words detection
    const formalWords = [
      'utilize', 'commence', 'terminate', 'endeavor', 'facilitate',
      'subsequently', 'furthermore', 'nevertheless', 'notwithstanding',
      'ascertain', 'procure', 'implement', 'demonstrate', 'establish'
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
    
    // Casual words detection (if profile is formal)
    const casualWords = ['gonna', 'wanna', 'kinda', 'sorta', 'yeah', 'nope', 'ok', 'btw'];
    const foundCasualWords = casualWords.filter(w => sentenceLower.includes(w));
    
    if (foundCasualWords.length > 0 && formalityLevel > 6) {
      issues.push({
        type: 'formality',
        severity: 'high',
        detail: `Từ vựng quá thân mật cho profile (formality: ${formalityLevel}/10)`,
        examples: foundCasualWords.slice(0, 3),
        metric: foundCasualWords.length
      });
    }
  }
  
  // 4. Check punctuation ratio
  const punctuationCount = (sentence.match(/[,;:!?]/g) || []).length;
  const punctuationRatio = words.length > 0 ? punctuationCount / words.length : 0;
  
  if (Math.abs(punctuationRatio - profileStats.punctuationRatio) > 0.05) {
    const severity = Math.abs(punctuationRatio - profileStats.punctuationRatio) > 0.1 ? 'medium' : 'low';
    issues.push({
      type: 'punctuation',
      severity,
      detail: `Sử dụng dấu câu khác biệt (${(punctuationRatio * 100).toFixed(1)}% vs ${(profileStats.punctuationRatio * 100).toFixed(1)}%)`,
      metric: punctuationRatio,
      threshold: profileStats.punctuationRatio
    });
  }
  
  // 5. Check passive voice (Vietnamese indicators)
  const passiveIndicators = ['được', 'bị', 'do', 'bởi'];
  const hasPassive = passiveIndicators.some(indicator => {
    const regex = new RegExp(`\\s${indicator}\\s`, 'i');
    return regex.test(sentence);
  });
  
  if (hasPassive && voiceProfile?.sentence_patterns?.structure_preference === 'simple') {
    issues.push({
      type: 'voice',
      severity: 'low',
      detail: 'Sử dụng thể bị động, profile ưa thích câu chủ động',
      metric: 1
    });
  }
  
  return issues;
}

/**
 * Generate improvement suggestions using Gemini AI
 */
async function generateImprovementSuggestions(sentence, issues, voiceProfile, context) {
  try {
    const model = vertexAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    });

    // Build voice profile description
    let voiceDescription = '';
    if (typeof voiceProfile === 'object' && voiceProfile.tone) {
      voiceDescription = `
TONE: ${voiceProfile.tone}
MỨC ĐỘ TRANG TRỌNG: ${voiceProfile.formality_level}/10
ĐẶC ĐIỂM: ${voiceProfile.key_characteristics?.slice(0, 3).join(', ')}
CỤM TỪ ƯA THÍCH: ${voiceProfile.vocabulary_preferences?.common_phrases?.slice(0, 3).join(', ')}
CẤU TRÚC CÂU: ${voiceProfile.sentence_patterns?.structure_preference}`;
    } else {
      voiceDescription = String(voiceProfile);
    }

    const prompt = `Bạn là chuyên gia phân tích văn bản, chuyên đưa ra gợi ý cải thiện cụ thể.

VĂN PHONG MỤC TIÊU:
${voiceDescription}

CÂU CẦN PHÂN TÍCH:
"${sentence}"

VẤN ĐỀ PHÁT HIỆN:
${issues.map(i => `- ${i.type} (${i.severity}): ${i.detail}`).join('\n')}

${context?.previous_sentence ? `CÂU TRƯỚC: "${context.previous_sentence}"` : ''}
${context?.next_sentence ? `CÂU SAU: "${context.next_sentence}"` : ''}

NHIỆM VỤ:
Đưa ra 2-4 gợi ý cụ thể để cải thiện câu cho phù hợp với văn phong mục tiêu.

YÊU CẦU:
1. Mỗi gợi ý phải cụ thể, có thể áp dụng ngay
2. Giải thích ngắn gọn tại sao cần thay đổi
3. Đưa ra ví dụ minh họa nếu có thể
4. Ưu tiên các vấn đề severity cao

Trả về JSON theo format:
{
  "suggestions": [
    {
      "type": "vocabulary|structure|length|formality|punctuation|voice",
      "severity": "high|medium|low",
      "issue": "Mô tả vấn đề ngắn gọn (1 câu)",
      "suggestion": "Gợi ý cụ thể cách sửa (1-2 câu)",
      "example": "Ví dụ cụ thể hoặc từ thay thế (nếu có)"
    }
  ]
}

CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH THÊM.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates[0].content.parts[0].text.trim();
    const parsed = JSON.parse(responseText);
    
    // Map icon cho mỗi type
    const iconMap = {
      vocabulary: '/icon/book-open.svg',
      structure: '/icon/layout.svg',
      length: '/icon/scissors.svg',
      formality: '/icon/briefcase.svg',
      punctuation: '/icon/more-horizontal.svg',
      voice: '/icon/zap.svg',
      tone: '/icon/smile.svg'
    };
    
    return parsed.suggestions.map(s => ({
      ...s,
      icon: iconMap[s.type] || '/icon/lightbulb.svg'
    }));
  } catch (error) {
    console.error('❌ Failed to generate suggestions:', error);
    
    // Fallback to rule-based suggestions
    return generateFallbackSuggestions(issues);
  }
}

/**
 * Fallback suggestions when AI fails
 */
function generateFallbackSuggestions(issues) {
  const iconMap = {
    vocabulary: '/icon/book-open.svg',
    structure: '/icon/layout.svg',
    length: '/icon/scissors.svg',
    formality: '/icon/briefcase.svg',
    punctuation: '/icon/more-horizontal.svg',
    voice: '/icon/zap.svg'
  };
  
  return issues.map(issue => {
    let suggestion = '';
    let example = '';
    
    switch (issue.type) {
      case 'length':
        suggestion = 'Tách thành 2-3 câu ngắn hơn để dễ đọc và dễ hiểu';
        example = 'Chia tại dấu phẩy hoặc từ nối';
        break;
      case 'vocabulary':
        suggestion = 'Sử dụng từ đơn giản hơn, gần gũi hơn với văn phong mục tiêu';
        example = 'Thay từ phức tạp bằng từ thông dụng';
        break;
      case 'formality':
        if (issue.examples) {
          suggestion = `Thay thế các từ trang trọng: ${issue.examples.join(', ')}`;
          example = 'utilize → use, commence → start';
        } else {
          suggestion = 'Điều chỉnh mức độ trang trọng cho phù hợp với profile';
        }
        break;
      case 'punctuation':
        suggestion = 'Điều chỉnh cách sử dụng dấu câu cho phù hợp với phong cách';
        break;
      case 'voice':
        suggestion = 'Chuyển từ thể bị động sang thể chủ động';
        example = 'Được làm → Làm';
        break;
      default:
        suggestion = 'Điều chỉnh để phù hợp hơn với văn phong mục tiêu';
    }
    
    return {
      type: issue.type,
      severity: issue.severity,
      issue: issue.detail,
      suggestion,
      example,
      icon: iconMap[issue.type] || '/icon/lightbulb.svg'
    };
  });
}

/**
 * Calculate confidence score for suggestions
 */
function calculateSuggestionConfidence(issues, sentenceScore) {
  // Base confidence from sentence score
  let confidence = sentenceScore * 100;
  
  // Reduce confidence if many issues
  const issueCount = issues.length;
  if (issueCount > 3) {
    confidence -= (issueCount - 3) * 5;
  }
  
  // Reduce confidence for high severity issues
  const highSeverityCount = issues.filter(i => i.severity === 'high').length;
  confidence -= highSeverityCount * 10;
  
  // Ensure confidence is in valid range
  return Math.max(50, Math.min(95, Math.round(confidence)));
}

// Suggest Improvements - NEW ENDPOINT
app.post('/suggest_improvements', async (req, res) => {
  try {
    const { profile_id, sentence, sentence_score, context } = req.body;

    if (!profile_id || !sentence) {
      return res.status(400).json({ error: 'profile_id and sentence are required' });
    }

    console.log(`💡 Generating suggestions for sentence (score: ${sentence_score})...`);
    const startTime = Date.now();

    // Load profile data
    const profileDoc = await db.collection('voice_profiles').doc(profile_id).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profileData = profileDoc.data();

    if (profileData.status !== 'ready') {
      return res.status(400).json({ error: 'Profile is not ready' });
    }

    // 1. Analyze sentence issues
    const issues = analyzeSentenceIssues(
      sentence,
      profileData.statisticalFeatures,
      profileData.voiceProfile
    );

    console.log(`📊 Found ${issues.length} issues:`, issues.map(i => `${i.type}(${i.severity})`).join(', '));

    // 2. Generate AI-powered suggestions
    const suggestions = await generateImprovementSuggestions(
      sentence,
      issues,
      profileData.voiceProfile,
      context || {}
    );

    // 3. Generate rewritten sentence
    const voiceProfile = profileData.voiceProfile || profileData.promptableSummary;
    const rewritten = await rewriteWithVoice(sentence, voiceProfile, context || {});

    // 4. Calculate confidence
    const confidence = calculateSuggestionConfidence(issues, sentence_score || 0.5);

    const processingTime = Date.now() - startTime;
    console.log(`✅ Generated ${suggestions.length} suggestions (${processingTime}ms)`);

    res.json({
      success: true,
      suggestions,
      rewritten,
      confidence,
      issues_found: issues.length,
      processing_time_ms: processingTime
    });
  } catch (error) {
    console.error('❌ Suggestion generation error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(80));
  console.log('🚀 AI Content Authenticator - Backend Server');
  console.log('='.repeat(80));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`☁️  Project ID: ${PROJECT_ID}`);
  console.log(`📍 Location: ${LOCATION}`);
  console.log(`🤖 Powered by: Google Gemini Ecosystem`);
  console.log('='.repeat(80));
  console.log('');
});
