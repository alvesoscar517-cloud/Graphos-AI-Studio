/**
 * Chat Controller
 * Handles workspace chat operations with improved architecture
 * Supports humanization and anti-AI detection for responses
 */

const { v4: uuidv4 } = require('uuid');
const geminiService = require('../services/gemini.service');
const humanizeService = require('../services/humanize.service');
const { 
  loadProfile, 
  buildEnhancedSystemPrompt, 
  estimateConversationTokens,
  formatError 
} = require('../utils/profileHelper');
const { manageConversationContext } = require('../utils/conversationSummarizer');
const { 
  buildMultimodalContent, 
  hasMultimodalContent
} = require('../utils/multimodalHelper');
const { validateModel } = require('../utils/validation');

/**
 * Send chat message (non-streaming)
 */
exports.sendMessage = async (req, res) => {
  try {
    const { 
      messages, 
      systemPrompt, 
      model: requestedModel = 'gemini-2.0-flash-exp', 
      temperature = 0.7, 
      profileId = null, 
      writingPreferences = null,
      conversationSummary = null
    } = req.body;

    // Validate model
    const model = validateModel(requestedModel, 'gemini-2.0-flash-exp');

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages array is required',
        code: 'INVALID_INPUT'
      });
    }

    console.log(`[INFO] Chat request: ${messages.length} messages, model: ${model}`);

    // Load profile and build enhanced system prompt
    const profile = await loadProfile(profileId);
    let enhancedSystemPrompt = buildEnhancedSystemPrompt(systemPrompt, profile, writingPreferences);

    // Manage conversation context (summarize if needed)
    const contextResult = await manageConversationContext(
      messages, 
      enhancedSystemPrompt, 
      conversationSummary
    );
    
    enhancedSystemPrompt = contextResult.systemPrompt;
    const optimizedMessages = contextResult.messages;

    // Estimate tokens
    const tokenEstimate = estimateConversationTokens(optimizedMessages, enhancedSystemPrompt);
    console.log(`[INFO] Estimated tokens: ${tokenEstimate.total}`);

    const generativeModel = geminiService.vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: 2048,
      },
    });

    // Check for multimodal content in last message
    const lastMessage = optimizedMessages[optimizedMessages.length - 1];
    let result;

    if (hasMultimodalContent(lastMessage)) {
      // Multimodal request
      console.log('[INFO] Processing multimodal message with attachments');
      const contentParts = await buildMultimodalContent(
        lastMessage.content, 
        lastMessage.attachments
      );
      
      result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: contentParts }],
        systemInstruction: enhancedSystemPrompt
      });
    } else {
      // Text-only chat
      const chatHistory = optimizedMessages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const chat = generativeModel.startChat({
        history: chatHistory,
        systemInstruction: enhancedSystemPrompt
      });

      result = await chat.sendMessage(lastMessage.content);
    }

    const response = result.response;
    
    let text;
    if (typeof response.text === 'function') {
      text = response.text();
    } else if (response.candidates && response.candidates[0]) {
      text = response.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unable to extract text from response');
    }

    console.log(`[SUCCESS] Chat response generated (${text.length} chars)`);

    res.json({
      message: text,
      usage: {
        inputTokens: tokenEstimate.inputTokens,
        outputTokens: Math.ceil(text.length / 4),
        totalTokens: tokenEstimate.inputTokens + Math.ceil(text.length / 4)
      },
      context: {
        wasSummarized: contextResult.wasSummarized,
        summary: contextResult.summary,
        messagesProcessed: optimizedMessages.length
      }
    });

  } catch (error) {
    console.error('[ERROR] Chat error:', error);
    const formattedError = formatError(error);
    res.status(500).json({ 
      error: formattedError.message,
      code: formattedError.code,
      retryAfter: formattedError.retryAfter
    });
  }
};

/**
 * Send chat message with streaming response
 */
exports.sendMessageStream = async (req, res) => {
  try {
    const { 
      messages, 
      systemPrompt, 
      model: requestedModel = 'gemini-2.0-flash-exp', 
      temperature = 0.7, 
      profileId = null, 
      writingPreferences = null,
      conversationSummary = null
    } = req.body;

    // Validate model
    const model = validateModel(requestedModel, 'gemini-2.0-flash-exp');

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages array is required',
        code: 'INVALID_INPUT'
      });
    }

    console.log(`[INFO] Chat stream request: ${messages.length} messages, model: ${model}`);

    // Load profile and build enhanced system prompt
    const profile = await loadProfile(profileId);
    let enhancedSystemPrompt = buildEnhancedSystemPrompt(systemPrompt, profile, writingPreferences);

    // Manage conversation context (summarize if needed)
    const contextResult = await manageConversationContext(
      messages, 
      enhancedSystemPrompt, 
      conversationSummary
    );
    
    enhancedSystemPrompt = contextResult.systemPrompt;
    const optimizedMessages = contextResult.messages;

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send context info first
    if (contextResult.wasSummarized) {
      res.write(`data: ${JSON.stringify({ 
        type: 'context', 
        wasSummarized: true,
        summarizedCount: contextResult.summarizedCount 
      })}\n\n`);
    }

    const generativeModel = geminiService.vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: 2048,
      },
    });

    const lastMessage = optimizedMessages[optimizedMessages.length - 1];
    let streamResult;

    if (hasMultimodalContent(lastMessage)) {
      // Multimodal streaming
      console.log('[INFO] Processing multimodal stream with attachments');
      const contentParts = await buildMultimodalContent(
        lastMessage.content, 
        lastMessage.attachments
      );
      
      streamResult = await generativeModel.generateContentStream({
        contents: [{ role: 'user', parts: contentParts }],
        systemInstruction: enhancedSystemPrompt
      });
    } else {
      // Text-only streaming
      const chatHistory = optimizedMessages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const chat = generativeModel.startChat({
        history: chatHistory,
        systemInstruction: enhancedSystemPrompt
      });

      streamResult = await chat.sendMessageStream(lastMessage.content);
    }

    let totalChars = 0;
    for await (const chunk of streamResult.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        totalChars += chunkText.length;
        res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      }
    }

    // Send completion with metadata
    res.write(`data: ${JSON.stringify({ 
      type: 'complete',
      summary: contextResult.summary,
      outputTokens: Math.ceil(totalChars / 4)
    })}\n\n`);
    
    res.write('data: [DONE]\n\n');
    res.end();

    console.log(`[SUCCESS] Chat stream completed (${totalChars} chars)`);

  } catch (error) {
    console.error('[ERROR] Chat stream error:', error);
    const formattedError = formatError(error);
    res.write(`data: ${JSON.stringify({ 
      error: formattedError.message,
      code: formattedError.code,
      retryAfter: formattedError.retryAfter
    })}\n\n`);
    res.end();
  }
};

/**
 * Upload and process file for chat
 */
exports.uploadFile = async (req, res) => {
  try {
    const { file, mimeType, fileName } = req.body;
    
    if (!file) {
      return res.status(400).json({ 
        error: 'File data is required',
        code: 'INVALID_INPUT'
      });
    }

    const { checkFileSupport, analyzeImage, extractTextFromImage } = require('../utils/multimodalHelper');
    const { supported, type } = checkFileSupport(mimeType);

    if (!supported) {
      return res.status(400).json({ 
        error: `Unsupported file type: ${mimeType}`,
        code: 'UNSUPPORTED_FILE_TYPE',
        supportedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain']
      });
    }

    const fileId = uuidv4();
    let extractedText = null;
    let analysis = null;

    if (type === 'image') {
      // Extract text from image (OCR)
      try {
        extractedText = await extractTextFromImage(file, mimeType);
        if (extractedText === 'No text found.') {
          extractedText = null;
        }
      } catch (e) {
        console.warn('[WARN] OCR failed:', e.message);
      }

      // Get image description
      try {
        analysis = await analyzeImage(file, mimeType, 'Briefly describe what you see in this image.');
      } catch (e) {
        console.warn('[WARN] Image analysis failed:', e.message);
      }
    }

    res.json({
      fileId,
      fileName: fileName || `file_${fileId}`,
      mimeType,
      type,
      extractedText,
      analysis,
      processed: true
    });

  } catch (error) {
    console.error('[ERROR] Upload error:', error);
    const formattedError = formatError(error);
    res.status(500).json({ 
      error: formattedError.message,
      code: formattedError.code
    });
  }
};

/**
 * Summarize conversation on demand
 */
exports.summarizeConversation = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: 'Messages array is required',
        code: 'INVALID_INPUT'
      });
    }

    const { summarizeConversation } = require('../utils/conversationSummarizer');
    const result = await summarizeConversation(messages);

    res.json({
      summary: result.summary,
      summarizedCount: result.summarizedCount || messages.length,
      recentMessagesCount: result.recentMessages?.length || 0
    });

  } catch (error) {
    console.error('[ERROR] Summarization error:', error);
    const formattedError = formatError(error);
    res.status(500).json({ 
      error: formattedError.message,
      code: formattedError.code
    });
  }
};

/**
 * Send chat message with humanization (non-streaming)
 * Generates response and then humanizes it to match user's voice profile
 */
exports.sendMessageHumanized = async (req, res) => {
  try {
    const { 
      messages, 
      systemPrompt, 
      model: requestedModel = 'gemini-2.0-flash-exp', 
      temperature = 0.7, 
      profileId = null, 
      writingPreferences = null,
      chatSettings = null,
      conversationSummary = null
    } = req.body;

    // Validate model
    const model = validateModel(requestedModel, 'gemini-2.0-flash-exp');

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages array is required',
        code: 'INVALID_INPUT'
      });
    }

    if (!profileId) {
      return res.status(400).json({ 
        error: 'Profile ID is required for humanized responses',
        code: 'PROFILE_REQUIRED'
      });
    }

    console.log(`[INFO] Humanized chat request: ${messages.length} messages, model: ${model}`);

    // Load profile
    const profile = await loadProfile(profileId);
    if (!profile || !profile.voice_profile) {
      return res.status(400).json({ 
        error: 'Valid voice profile is required',
        code: 'INVALID_PROFILE'
      });
    }

    // Build enhanced system prompt with humanization instructions
    let enhancedSystemPrompt = buildEnhancedSystemPrompt(systemPrompt, profile, writingPreferences);
    
    // Add humanization instructions to system prompt
    if (chatSettings?.useAntiAIDetection || chatSettings?.humanizeResponse) {
      enhancedSystemPrompt = humanizeService.buildEnhancedRewritePrompt(
        enhancedSystemPrompt,
        profile.voice_profile,
        profile.sample_text || null,
        { isSystemPrompt: true }
      );
    }

    // Manage conversation context
    const contextResult = await manageConversationContext(
      messages, 
      enhancedSystemPrompt, 
      conversationSummary
    );
    
    enhancedSystemPrompt = contextResult.systemPrompt;
    const optimizedMessages = contextResult.messages;

    // Generate initial response
    const generativeModel = geminiService.vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: chatSettings?.humanizeResponse ? 0.8 : temperature,
        maxOutputTokens: 2048,
      },
    });

    const chatHistory = optimizedMessages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = generativeModel.startChat({
      history: chatHistory,
      systemInstruction: enhancedSystemPrompt
    });

    const lastMessage = optimizedMessages[optimizedMessages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    
    let text = result.response.text ? result.response.text() : 
      result.response.candidates[0].content.parts[0].text;

    console.log(`[INFO] Initial response generated (${text.length} chars)`);

    // Apply humanization if enabled
    let humanizationResult = null;
    if (chatSettings?.humanizeResponse) {
      console.log('[INFO] Applying humanization...');
      
      try {
        const humanized = await humanizeService.rewriteWithIterativeRefinement(
          text,
          profile.voice_profile,
          { sampleText: profile.sample_text },
          {
            maxIterations: 2, // Limit iterations for chat (faster response)
            targetProbability: chatSettings.targetAIProbability || 35,
            model: 'gemini-2.0-flash-exp'
          }
        );
        
        text = humanized.text;
        humanizationResult = {
          iterations: humanized.iterations,
          aiProbability: humanized.aiProbability,
          reachedTarget: humanized.reachedTarget
        };
        
        console.log(`[SUCCESS] Humanization complete: ${humanized.aiProbability}% AI probability`);
      } catch (humanizeError) {
        console.error('[WARN] Humanization failed, using original response:', humanizeError.message);
      }
    } else if (chatSettings?.useAntiAIDetection) {
      // Apply lighter humanization (just imperfection injection)
      text = humanizeService.injectHumanImperfections(text, profile.voice_profile);
    }

    res.json({
      message: text,
      humanization: humanizationResult,
      context: {
        wasSummarized: contextResult.wasSummarized,
        summary: contextResult.summary
      }
    });

  } catch (error) {
    console.error('[ERROR] Humanized chat error:', error);
    const formattedError = formatError(error);
    res.status(500).json({ 
      error: formattedError.message,
      code: formattedError.code,
      retryAfter: formattedError.retryAfter
    });
  }
};

/**
 * Send chat message with humanization (streaming)
 * Generates response with humanization applied during generation
 */
exports.sendMessageHumanizedStream = async (req, res) => {
  try {
    const { 
      messages, 
      systemPrompt, 
      model: requestedModel = 'gemini-2.0-flash-exp', 
      temperature = 0.7, 
      profileId = null, 
      writingPreferences = null,
      chatSettings = null,
      conversationSummary = null
    } = req.body;

    // Validate model
    const model = validateModel(requestedModel, 'gemini-2.0-flash-exp');

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages array is required',
        code: 'INVALID_INPUT'
      });
    }

    console.log(`[INFO] Humanized stream request: ${messages.length} messages, model: ${model}`);

    // Load profile
    const profile = await loadProfile(profileId);
    
    // Build enhanced system prompt
    let enhancedSystemPrompt = buildEnhancedSystemPrompt(systemPrompt, profile, writingPreferences);
    
    // Add anti-AI detection rules to system prompt
    if (profile?.voice_profile && (chatSettings?.useAntiAIDetection || chatSettings?.humanizeResponse)) {
      const voiceProfile = profile.voice_profile;
      
      // Add comprehensive anti-AI instructions
      enhancedSystemPrompt += `

═══════════════════════════════════════════════════════════════
CRITICAL: WRITE LIKE A HUMAN, NOT AN AI
═══════════════════════════════════════════════════════════════

BANNED PHRASES (NEVER USE):
- "It's important to note", "It should be noted", "Furthermore", "Moreover"
- "Additionally", "In conclusion", "To summarize", "Consequently"
- "Nevertheless", "Nonetheless", "Hence", "Thus"
- "In today's world", "First and foremost", "Last but not least"

REQUIRED HUMAN PATTERNS:
1. Use contractions naturally: "don't", "can't", "it's", "I'm", "you're"
2. Vary sentence lengths: mix short (5-8 words) with medium (12-18 words)
3. Start some sentences with "And", "But", "So" (informal style)
4. Include personal touches: "I think", "honestly", "to be fair"
5. Don't be overly comprehensive - humans don't cover every angle
6. Use simple connectors: "and", "but", "so", "then" instead of formal ones

VOICE PROFILE TO MATCH:
- Tone: ${voiceProfile.tone || 'natural'}
- Formality: ${voiceProfile.formality_level || 5}/10
- Characteristics: ${(voiceProfile.key_characteristics || []).slice(0, 3).join(', ')}
${voiceProfile.rewrite_instructions ? `- Special instructions: ${voiceProfile.rewrite_instructions}` : ''}

Write naturally as if you ARE this person, not an AI pretending to be them.`;
    }

    // Manage conversation context
    const contextResult = await manageConversationContext(
      messages, 
      enhancedSystemPrompt, 
      conversationSummary
    );
    
    enhancedSystemPrompt = contextResult.systemPrompt;
    const optimizedMessages = contextResult.messages;

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Send context info
    if (contextResult.wasSummarized) {
      res.write(`data: ${JSON.stringify({ 
        type: 'context', 
        wasSummarized: true,
        summarizedCount: contextResult.summarizedCount 
      })}\n\n`);
    }

    const generativeModel = geminiService.vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: chatSettings?.humanizeResponse ? 0.85 : temperature,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    const chatHistory = optimizedMessages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = generativeModel.startChat({
      history: chatHistory,
      systemInstruction: enhancedSystemPrompt
    });

    const lastMessage = optimizedMessages[optimizedMessages.length - 1];
    const streamResult = await chat.sendMessageStream(lastMessage.content);

    let totalChars = 0;
    let fullText = '';
    
    for await (const chunk of streamResult.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        totalChars += chunkText.length;
        fullText += chunkText;
        res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      }
    }

    // If full humanization is enabled, apply post-processing
    let humanizationResult = null;
    if (chatSettings?.humanizeResponse && profile?.voice_profile && fullText.length > 100) {
      try {
        // Apply light imperfection injection (non-blocking)
        const humanizedText = humanizeService.injectHumanImperfections(fullText, profile.voice_profile);
        
        // If text changed, send the humanized version
        if (humanizedText !== fullText) {
          res.write(`data: ${JSON.stringify({ 
            type: 'humanized',
            text: humanizedText
          })}\n\n`);
        }
        
        humanizationResult = { applied: true };
      } catch (e) {
        console.warn('[WARN] Post-humanization failed:', e.message);
      }
    }

    // Send completion
    res.write(`data: ${JSON.stringify({ 
      type: 'complete',
      summary: contextResult.summary,
      outputTokens: Math.ceil(totalChars / 4),
      humanization: humanizationResult
    })}\n\n`);
    
    res.write('data: [DONE]\n\n');
    res.end();

    console.log(`[SUCCESS] Humanized stream completed (${totalChars} chars)`);

  } catch (error) {
    console.error('[ERROR] Humanized stream error:', error);
    const formattedError = formatError(error);
    res.write(`data: ${JSON.stringify({ 
      error: formattedError.message,
      code: formattedError.code,
      retryAfter: formattedError.retryAfter
    })}\n\n`);
    res.end();
  }
};

module.exports = exports;
