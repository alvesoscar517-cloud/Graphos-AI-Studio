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

function hashText(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

function getCachedEmbedding(text, taskType) {
  const key = `${hashText(text)}_${taskType}`;
  const cached = embeddingCache.get(key);
  
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > EMBEDDING_CACHE_TTL) {
    embeddingCache.delete(key);
    return null;
  }
  
  console.log(`⚡ Embedding cache HIT`);
  return cached.embedding;
}

function setCachedEmbedding(text, taskType, embedding) {
  if (embeddingCache.size >= MAX_EMBEDDING_CACHE_SIZE) {
    const firstKey = embeddingCache.keys().next().value;
    embeddingCache.delete(firstKey);
  }
  
  const key = `${hashText(text)}_${taskType}`;
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
    const cached = getCachedEmbedding(text, taskType);
    if (cached) return cached;
    
    if (text.length > 20000) {
      console.warn(`⚠️  Text too long (${text.length} chars), truncating to 20000`);
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

    console.log(`🔄 Generating Gemini embedding (${taskType}) for ${text.length} chars...`);
    const [response] = await aiplatformClient.predict(request);
    
    if (!response.predictions || response.predictions.length === 0) {
      throw new Error('No predictions returned from Vertex AI');
    }
    
    const prediction = helpers.fromValue(response.predictions[0]);
    
    if (!prediction.embeddings || !prediction.embeddings.values) {
      throw new Error('Invalid embedding structure returned from Vertex AI');
    }
    
    const embedding = prediction.embeddings.values;
    console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
    
    setCachedEmbedding(text, taskType, embedding);
    
    return embedding;
  } catch (error) {
    console.error('❌ Embedding generation failed:', error.message);
    
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
    
    texts.forEach((text, idx) => {
      const cached = getCachedEmbedding(text, taskType);
      if (cached) {
        embeddings[idx] = cached;
      } else {
        textsToFetch.push(text);
        fetchIndices.push(idx);
      }
    });
    
    if (textsToFetch.length === 0) {
      console.log(`⚡ All ${texts.length} embeddings from cache`);
      return embeddings;
    }
    
    console.log(`📊 Cache: ${texts.length - textsToFetch.length} hits, ${textsToFetch.length} misses`);

    const validTexts = textsToFetch.map(text => {
      if (text.length > 20000) {
        console.warn(`⚠️  Text too long (${text.length} chars), truncating`);
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

    console.log(`🔄 Generating ${textsToFetch.length} Gemini embeddings in batch (${taskType})...`);
    const [response] = await aiplatformClient.predict(request);
    
    const predictions = response.predictions.map(p => helpers.fromValue(p));
    
    const newEmbeddings = predictions.map((prediction, idx) => {
      if (!prediction || !prediction.embeddings || !prediction.embeddings.values) {
        throw new Error(`Invalid embedding structure for prediction ${idx + 1}`);
      }
      const embedding = prediction.embeddings.values;
      
      setCachedEmbedding(textsToFetch[idx], taskType, embedding);
      
      return embedding;
    });
    
    fetchIndices.forEach((originalIdx, newIdx) => {
      embeddings[originalIdx] = newEmbeddings[newIdx];
    });
    
    console.log(`✅ Generated ${newEmbeddings.length} new embeddings (${texts.length - newEmbeddings.length} from cache)`);
    return embeddings;
  } catch (error) {
    console.error('❌ Batch embedding generation failed:', error.message);
    
    if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('QUOTA_EXCEEDED: Gemini API quota exhausted. Please try again later.');
    }
    
    throw new Error(`BATCH_EMBEDDING_FAILED: ${error.message}`);
  }
}

// ============================================================================
// AI CONTENT DETECTION
// ============================================================================

async function detectAIContent(text) {
  try {
    const model = vertexAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const prompt = `Bạn là chuyên gia phân tích văn bản, chuyên phát hiện nội dung được tạo bởi AI.

NHIỆM VỤ: Đánh giá khả năng văn bản dưới đây được tạo ra bởi AI (Large Language Model).

VĂN BẢN CẦN PHÂN TÍCH:
"""
${text}
"""

YÊU CẦU PHÂN TÍCH:
1. Đánh giá tổng thể: Đưa ra phần trăm khả năng văn bản được tạo bởi AI (0-100%)
2. Bằng chứng cụ thể: Liệt kê 3-5 bằng chứng ngôn ngữ rõ ràng

Trả về JSON:
{
  "ai_probability": <số từ 0-100>,
  "evidence": ["Bằng chứng 1", "Bằng chứng 2", "Bằng chứng 3"]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates[0].content.parts[0].text.trim();
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

  return {
    aiProbability: Math.min(score, 100),
    evidence: evidence.length > 0 ? evidence : ['Phân tích heuristic cơ bản']
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

    const prompt = `Phân tích phong cách viết của tác giả dựa trên các mẫu văn bản.

THỐNG KÊ VĂN PHONG:
- Độ dài trung bình câu: ${statisticalFeatures.avgSentenceLength} từ
- Độ dài trung bình từ: ${statisticalFeatures.avgWordLength} ký tự
- Độ phong phú từ vựng: ${statisticalFeatures.vocabularyRichness.toFixed(2)}

CÁC MẪU VĂN BẢN:
${combinedText}

Trả về JSON theo format:
{
  "tone": "professional/casual/academic/creative/friendly",
  "formality_level": 1-10,
  "key_characteristics": ["Đặc điểm 1", "Đặc điểm 2", "Đặc điểm 3", "Đặc điểm 4", "Đặc điểm 5"],
  "vocabulary_preferences": {
    "common_phrases": ["cụm từ 1", "cụm từ 2"],
    "avoid_words": ["từ 1", "từ 2"],
    "preferred_connectors": ["từ nối 1", "từ nối 2"]
  },
  "sentence_patterns": {
    "typical_length": "short/medium/long",
    "structure_preference": "simple/complex/varied",
    "opening_style": "Mô tả cách mở đầu"
  },
  "rewrite_instructions": "Hướng dẫn chi tiết"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates[0].content.parts[0].text.trim();
    const voiceProfile = JSON.parse(responseText);
    
    console.log(`✅ Generated voice profile: ${voiceProfile.tone}, formality: ${voiceProfile.formality_level}`);
    
    return voiceProfile;
  } catch (error) {
    console.error('❌ Voice summary generation failed:', error);
    
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

async function rewriteWithVoice(originalText, voiceProfile, context = {}, modelName = 'gemini-2.0-flash-exp') {
  try {
    const model = vertexAI.getGenerativeModel({ 
      model: modelName
    });

    let voiceDescription;
    
    if (typeof voiceProfile === 'object' && voiceProfile.tone) {
      voiceDescription = `
TONE: ${voiceProfile.tone}
MỨC ĐỘ TRANG TRỌNG: ${voiceProfile.formality_level}/10
ĐẶC ĐIỂM: ${voiceProfile.key_characteristics.slice(0, 3).join(', ')}
CỤM TỪ ƯA THÍCH: ${voiceProfile.vocabulary_preferences.common_phrases.join(', ')}`;
    } else {
      voiceDescription = String(voiceProfile);
    }

    let prompt = `Viết lại văn bản sau sao cho phù hợp với văn phong mục tiêu, giữ nguyên ý nghĩa.

VĂN PHONG MỤC TIÊU:
${voiceDescription}`;

    // Add writing preferences if provided (based on profile data)
    if (context.writingPreferences && typeof voiceProfile === 'object') {
      const prefs = context.writingPreferences;
      let preferencesText = '';
      
      // Vocabulary Preferences
      if (prefs.useVocabularyPreferences && voiceProfile.vocabulary_preferences) {
        const vocabPrefs = voiceProfile.vocabulary_preferences;
        if (vocabPrefs.common_phrases?.length > 0 || vocabPrefs.preferred_connectors?.length > 0 || vocabPrefs.avoid_words?.length > 0) {
          preferencesText += '\n\nTỪ VỰNG ƯA THÍCH:';
          if (vocabPrefs.common_phrases?.length > 0) {
            preferencesText += '\nCỤM TỪ THƯỜNG DÙNG: ' + vocabPrefs.common_phrases.join(', ');
          }
          if (vocabPrefs.preferred_connectors?.length > 0) {
            preferencesText += '\nTỪ NỐI ƯA THÍCH: ' + vocabPrefs.preferred_connectors.join(', ');
          }
          if (vocabPrefs.avoid_words?.length > 0) {
            preferencesText += '\nTỪ NÊN TRÁNH: ' + vocabPrefs.avoid_words.join(', ');
          }
        }
      }
      
      // Key characteristics
      if (prefs.useKeyCharacteristics && voiceProfile.key_characteristics?.length > 0) {
        preferencesText += '\n\nĐẶC ĐIỂM CHÍNH: ' + voiceProfile.key_characteristics.join(', ');
      }
      
      // Sentence Patterns
      if (prefs.useSentencePatterns && voiceProfile.sentence_patterns) {
        const sentencePatterns = voiceProfile.sentence_patterns;
        if (sentencePatterns.opening_style || sentencePatterns.structure_preference) {
          preferencesText += '\n\nCẤU TRÚC CÂU:';
          if (sentencePatterns.opening_style) {
            preferencesText += '\nPHONG CÁCH MỞ ĐẦU: ' + sentencePatterns.opening_style;
          }
          if (sentencePatterns.structure_preference) {
            preferencesText += '\nCẤU TRÚC: ' + sentencePatterns.structure_preference;
          }
        }
      }
      
      // Rewrite instructions
      if (prefs.useRewriteInstructions && voiceProfile.rewrite_instructions) {
        preferencesText += '\n\nHƯỚNG DẪN VIẾT LẠI: ' + voiceProfile.rewrite_instructions;
      }
      
      if (preferencesText) {
        prompt += preferencesText;
      }
    }

    prompt += `

VĂN BẢN GỐC:
${originalText}

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
// IMPROVEMENT SUGGESTIONS
// ============================================================================

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

module.exports = {
  createEmbedding,
  createBatchEmbeddings,
  detectAIContent,
  generateVoiceSummary,
  rewriteWithVoice,
  generateImprovementSuggestions,
  vertexAI
};
