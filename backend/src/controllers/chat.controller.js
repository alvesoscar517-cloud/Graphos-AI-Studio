/**
 * Chat Controller
 * Handles workspace chat operations
 */

const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/firebase');
const geminiService = require('../services/gemini.service');
const logger = require('../utils/logger');

exports.sendMessage = async (req, res) => {
  try {
    const { messages, systemPrompt, model = 'gemini-2.0-flash-exp', temperature = 0.7, profileId = null, writingPreferences = null } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    console.log(`💬 Chat request: ${messages.length} messages, model: ${model}`);

    let enhancedSystemPrompt = systemPrompt || 'Bạn là một trợ lý AI thông minh và hữu ích.';
    
    if (profileId) {
      try {
        const profileDoc = await db.collection('profiles').doc(profileId).get();
        
        if (profileDoc.exists) {
          const profile = profileDoc.data();
          const voiceProfile = profile.voice_profile;
          
          if (voiceProfile) {
            enhancedSystemPrompt = `${systemPrompt || 'Bạn là một trợ lý AI thông minh và hữu ích.'}

QUAN TRỌNG - PHONG CÁCH TRẢ LỜI:
TONE: ${voiceProfile.tone}
MỨC ĐỘ TRANG TRỌNG: ${voiceProfile.formality_level}/10
ĐẶC ĐIỂM: ${voiceProfile.key_characteristics?.slice(0, 3).join(', ') || ''}

Hãy trả lời theo CHÍNH XÁC phong cách trên.`;
          }
        }
      } catch (profileError) {
        console.error(`❌ Error loading profile ${profileId}:`, profileError);
      }
    }

    // Add writing preferences to system prompt (based on profile data)
    if (writingPreferences && profileId) {
      try {
        const profileDoc = await db.collection('profiles').doc(profileId).get();
        if (profileDoc.exists) {
          const profile = profileDoc.data();
          const voiceProfile = profile.voice_profile;
          
          if (voiceProfile) {
            let preferencesText = '';
            
            // Vocabulary Preferences (common phrases, connectors, avoid words)
            if (writingPreferences.useVocabularyPreferences && voiceProfile.vocabulary_preferences) {
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
            if (writingPreferences.useKeyCharacteristics && voiceProfile.key_characteristics?.length > 0) {
              preferencesText += '\n\nĐẶC ĐIỂM CHÍNH: ' + voiceProfile.key_characteristics.join(', ');
            }
            
            // Sentence Patterns (opening style, structure)
            if (writingPreferences.useSentencePatterns && voiceProfile.sentence_patterns) {
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
            if (writingPreferences.useRewriteInstructions && voiceProfile.rewrite_instructions) {
              preferencesText += '\n\nHƯỚNG DẪN VIẾT LẠI: ' + voiceProfile.rewrite_instructions;
            }
            
            if (preferencesText) {
              enhancedSystemPrompt += preferencesText;
            }
          }
        }
      } catch (prefError) {
        console.error(`❌ Error loading preferences:`, prefError);
      }
    }

    const generativeModel = geminiService.vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: 2048,
      },
    });

    const chatHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = generativeModel.startChat({
      history: chatHistory,
      systemInstruction: enhancedSystemPrompt
    });

    const lastMessage = messages[messages.length - 1];
    
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    
    let text;
    if (typeof response.text === 'function') {
      text = response.text();
    } else if (response.candidates && response.candidates[0]) {
      text = response.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unable to extract text from response');
    }

    console.log(`✅ Chat response generated (${text.length} chars)`);

    res.json({
      message: text,
      usage: {
        tokens: text.split(' ').length,
        cost: 0
      }
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
};

exports.sendMessageStream = async (req, res) => {
  try {
    const { messages, systemPrompt, model = 'gemini-2.0-flash-exp', temperature = 0.7, profileId = null, writingPreferences = null } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    console.log(`💬 Chat stream request: ${messages.length} messages, model: ${model}`);

    let enhancedSystemPrompt = systemPrompt || 'Bạn là một trợ lý AI thông minh và hữu ích.';
    
    if (profileId) {
      try {
        const profileDoc = await db.collection('profiles').doc(profileId).get();
        
        if (profileDoc.exists) {
          const profile = profileDoc.data();
          const voiceProfile = profile.voice_profile;
          
          if (voiceProfile) {
            enhancedSystemPrompt = `${systemPrompt || 'Bạn là một trợ lý AI thông minh và hữu ích.'}

QUAN TRỌNG - PHONG CÁCH TRẢ LỜI:
TONE: ${voiceProfile.tone}
MỨC ĐỘ TRANG TRỌNG: ${voiceProfile.formality_level}/10
ĐẶC ĐIỂM: ${voiceProfile.key_characteristics?.slice(0, 3).join(', ') || ''}

Hãy trả lời theo CHÍNH XÁC phong cách trên.`;
          }
        }
      } catch (profileError) {
        console.error(`❌ Error loading profile ${profileId}:`, profileError);
      }
    }

    // Add writing preferences to system prompt
    if (writingPreferences && profileId) {
      try {
        const profileDoc = await db.collection('profiles').doc(profileId).get();
        if (profileDoc.exists) {
          const profile = profileDoc.data();
          const voiceProfile = profile.voice_profile;
          
          if (voiceProfile) {
            let preferencesText = '';
            
            if (writingPreferences.useVocabularyPreferences && voiceProfile.vocabulary_preferences) {
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
            
            if (writingPreferences.useKeyCharacteristics && voiceProfile.key_characteristics?.length > 0) {
              preferencesText += '\n\nĐẶC ĐIỂM CHÍNH: ' + voiceProfile.key_characteristics.join(', ');
            }
            
            if (writingPreferences.useSentencePatterns && voiceProfile.sentence_patterns) {
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
            
            if (writingPreferences.useRewriteInstructions && voiceProfile.rewrite_instructions) {
              preferencesText += '\n\nHƯỚNG DẪN VIẾT LẠI: ' + voiceProfile.rewrite_instructions;
            }
            
            if (preferencesText) {
              enhancedSystemPrompt += preferencesText;
            }
          }
        }
      } catch (prefError) {
        console.error(`❌ Error loading preferences:`, prefError);
      }
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const generativeModel = geminiService.vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: 2048,
      },
    });

    const chatHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = generativeModel.startChat({
      history: chatHistory,
      systemInstruction: enhancedSystemPrompt
    });

    const lastMessage = messages[messages.length - 1];
    
    const result = await chat.sendMessageStream(lastMessage.content);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

    console.log(`✅ Chat stream completed`);

  } catch (error) {
    console.error('❌ Chat stream error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

exports.uploadFile = async (req, res) => {
  try {
    // TODO: Implement file upload
    res.json({
      fileId: uuidv4(),
      url: '',
      type: 'text/plain',
      extractedText: ''
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

module.exports = exports;
