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
    const { messages, systemPrompt, model = 'gemini-2.0-flash-exp', temperature = 0.7, profileId = null } = req.body;

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
