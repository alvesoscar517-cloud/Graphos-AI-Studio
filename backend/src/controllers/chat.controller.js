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
const activityLogService = require('../services/activityLog.service');
const { createLocalizer } = require('../utils/localized-messages.util');

/**
 * Build response style instructions based on chatSettings
 * @param {Object} chatSettings - { responseStyle, creativityLevel }
 * @returns {string} - Instructions to add to system prompt
 */
function buildResponseStyleInstructions(chatSettings) {
  if (!chatSettings) return '';
  
  const { responseStyle, creativityLevel } = chatSettings;
  let instructions = '';
  
  // Response length style
  if (responseStyle) {
    const lengthInstructions = {
      concise: `
RESPONSE LENGTH: CONCISE
- Keep responses brief and to the point
- Use short sentences and paragraphs
- Avoid unnecessary elaboration
- Get straight to the answer
- Maximum 2-3 paragraphs unless absolutely necessary`,
      balanced: '', // Default, no special instructions
      detailed: `
RESPONSE LENGTH: DETAILED
- Provide comprehensive, thorough responses
- Include relevant examples and explanations
- Cover multiple aspects of the topic
- Use structured formatting when helpful
- Don't hesitate to elaborate on important points`
    };
    instructions += lengthInstructions[responseStyle] || '';
  }
  
  // Creativity level
  if (creativityLevel) {
    const creativityInstructions = {
      low: `
CREATIVITY LEVEL: PRECISE
- Stick closely to facts and established information
- Avoid speculation or creative interpretations
- Use formal, professional language
- Prioritize accuracy over engagement
- Be conservative with suggestions`,
      medium: '', // Default, no special instructions
      high: `
CREATIVITY LEVEL: CREATIVE
- Feel free to be creative and engaging
- Use analogies, metaphors, and vivid examples
- Suggest innovative or unconventional approaches
- Add personality and flair to responses
- Think outside the box when problem-solving`
    };
    instructions += creativityInstructions[creativityLevel] || '';
  }
  
  return instructions;
}

/**
 * Send chat message (non-streaming)
 */
exports.sendMessage = async (req, res) => {
  const l = createLocalizer(req);
  
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
        success: false,
        ...l.error('invalid_input'),
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

    // Log activity if user_id is available from request
    const userId = req.body.user_id || req.headers['x-user-id'];
    if (userId) {
      activityLogService.logFeatureUsage(userId, 'chat_message', {
        profileId,
        model,
        inputLength: messages.reduce((sum, m) => sum + (m.content?.length || 0), 0),
        outputLength: text.length,
        creditsUsed: req.creditCost || 0,
        creditsBefore: req.creditsBefore,
        creditsAfter: req.creditsAfter
      });
    }

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
 * Supports reasoning output for Pro models
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
      chatSettings = null,
      conversationSummary = null,
      include_reasoning = false
    } = req.body;

    // Validate model
    const model = validateModel(requestedModel, 'gemini-2.0-flash-exp');
    
    // Only enable thinking for 2.5 models (native thinking support from Google)
    // 2.0 models don't have native thinking - skip to save cost and time
    const is25Model = model.includes('2.5');
    const shouldIncludeReasoning = include_reasoning && is25Model;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages array is required',
        code: 'INVALID_INPUT'
      });
    }

    console.log(`[INFO] Chat stream request: ${messages.length} messages, model: ${model}${shouldIncludeReasoning ? ' (with reasoning)' : ''}`);

    // Load profile and build enhanced system prompt
    const profile = await loadProfile(profileId);
    let enhancedSystemPrompt = buildEnhancedSystemPrompt(systemPrompt, profile, writingPreferences);
    
    // Add response style instructions if provided
    const responseStyleInstructions = buildResponseStyleInstructions(chatSettings);
    if (responseStyleInstructions) {
      enhancedSystemPrompt += responseStyleInstructions;
    }

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

    // Use enhanced system prompt directly (no prompt-based reasoning needed)
    let finalSystemPrompt = enhancedSystemPrompt;
    
    // Build generation config
    const generationConfig = {
      temperature: temperature,
      maxOutputTokens: shouldIncludeReasoning ? 4096 : 2048, // More tokens for thinking
    };
    
    // Add native thinkingConfig for 2.5 models when reasoning is requested
    // Only 2.5 models support native thinking from Google
    if (shouldIncludeReasoning) {
      generationConfig.thinkingConfig = {
        thinkingBudget: 2048 // Allow up to 2048 tokens for thinking
      };
      console.log('[CHAT] Using native thinking for model:', model);
    }
    
    const generativeModel = geminiService.vertexAI.getGenerativeModel({
      model: model,
      generationConfig,
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
        systemInstruction: finalSystemPrompt
      });
    } else {
      // Text-only streaming
      const chatHistory = optimizedMessages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const chat = generativeModel.startChat({
        history: chatHistory,
        systemInstruction: finalSystemPrompt
      });

      streamResult = await chat.sendMessageStream(lastMessage.content);
    }

    let totalChars = 0;
    
    for await (const chunk of streamResult.stream) {
      try {
        // Handle native thinking response (2.5 models only)
        if (shouldIncludeReasoning && chunk.candidates && chunk.candidates[0]) {
          const candidate = chunk.candidates[0];
          
          // Check for thinking content (native thinking from Google)
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              // Native thinking content (part.thought === true)
              if (part.thought === true && part.text) {
                res.write(`data: ${JSON.stringify({ reasoning: part.text })}\n\n`);
              }
              // Regular content
              else if (part.text && part.thought !== true) {
                totalChars += part.text.length;
                res.write(`data: ${JSON.stringify({ chunk: part.text })}\n\n`);
              }
            }
          }
          continue;
        }
        
        // Standard response handling (for 2.0 models or when thinking is disabled)
        let chunkText = null;
        
        if (typeof chunk.text === 'function') {
          chunkText = chunk.text();
        } else if (chunk.candidates && chunk.candidates[0]) {
          const candidate = chunk.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
            chunkText = candidate.content.parts[0].text;
          }
        } else if (chunk.text) {
          chunkText = chunk.text;
        }
        
        if (chunkText) {
          totalChars += chunkText.length;
          res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
        }
      } catch (chunkError) {
        console.error('[ERROR] Error processing chunk:', chunkError);
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

    // Log activity if user_id is available from request
    const userId = req.body.user_id || req.headers['x-user-id'];
    if (userId) {
      activityLogService.logFeatureUsage(userId, 'chat_message', {
        profileId,
        model,
        inputLength: messages.reduce((sum, m) => sum + (m.content?.length || 0), 0),
        outputLength: totalChars,
        streaming: true,
        creditsUsed: req.creditCost || 0,
        creditsBefore: req.creditsBefore,
        creditsAfter: req.creditsAfter
      });
    }

    console.log(`[SUCCESS] Chat stream completed (${totalChars} chars)`);

  } catch (error) {
    console.error('[ERROR] Chat stream error:', error);
    console.error('[ERROR] Chat stream error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
      stack: error.stack?.substring(0, 500)
    });
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

    // Log activity if user_id is available
    const userId = req.body.user_id || req.headers['x-user-id'];
    if (userId) {
      activityLogService.logFeatureUsage(userId, 'file_upload', {
        fileId,
        fileName: fileName || `file_${fileId}`,
        mimeType,
        fileType: type,
        hasExtractedText: !!extractedText,
        creditsUsed: req.creditCost || 0,
        creditsBefore: req.creditsBefore,
        creditsAfter: req.creditsAfter
      });
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

    // Log activity if user_id is available
    const userId = req.body.user_id || req.headers['x-user-id'];
    if (userId) {
      activityLogService.logFeatureUsage(userId, 'conversation_summarize', {
        messagesCount: messages.length,
        summarizedCount: result.summarizedCount || messages.length,
        creditsUsed: req.creditCost || 0,
        creditsBefore: req.creditsBefore,
        creditsAfter: req.creditsAfter
      });
    }

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
 * Profile is optional - if not provided, uses generic humanization
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

    // Profile is optional - humanization can work without profile using generic voice

    console.log(`[INFO] Humanized chat request: ${messages.length} messages, model: ${model}, profileId: ${profileId || 'none'}`);

    // Load profile (optional - can be null for generic humanization)
    const profile = await loadProfile(profileId);
    
    // Use profile voice or generic voice
    const voiceProfile = profile?.voice_profile || {
      tone: 'natural',
      formality_level: 5,
      key_characteristics: ['clear', 'engaging', 'authentic']
    };
    const sampleText = profile?.sample_text || null;

    // Build enhanced system prompt with humanization instructions
    let enhancedSystemPrompt = buildEnhancedSystemPrompt(systemPrompt, profile, writingPreferences);
    
    // Add humanization instructions to system prompt
    if (chatSettings?.useAntiAIDetection || chatSettings?.humanizeResponse) {
      enhancedSystemPrompt = humanizeService.buildEnhancedRewritePrompt(
        enhancedSystemPrompt,
        voiceProfile,
        sampleText,
        { isSystemPrompt: true, writingPreferences }
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

    // Smart humanization based on text length and settings
    let humanizationResult = null;
    if (chatSettings?.humanizeResponse && text.length > 100) {
      const targetProbability = chatSettings.targetAIProbability || 35;
      
      try {
        // For short responses (< 500 chars), just apply imperfection injection
        if (text.length < 500) {
          text = humanizeService.injectHumanImperfections(text, voiceProfile);
          humanizationResult = { applied: true, method: 'light' };
          console.log('[INFO] Applied light humanization for short response');
        } else {
          // For longer text, check AI probability first
          console.log('[INFO] Checking AI probability...');
          const aiCheck = await geminiService.detectAIContentEnhanced(text);
          
          if (aiCheck.aiProbability > targetProbability + 15) {
            // AI probability significantly above target - do refinement
            console.log(`[INFO] AI probability ${aiCheck.aiProbability}% > target, applying refinement...`);
            
            const humanized = await humanizeService.rewriteWithIterativeRefinement(
              text,
              voiceProfile,
              { sampleText, writingPreferences },
              {
                maxIterations: 1, // Single iteration for cost efficiency
                targetProbability,
                model: 'gemini-2.0-flash-exp'
              }
            );
            
            text = humanized.text;
            humanizationResult = {
              applied: true,
              method: 'refinement',
              iterations: humanized.iterations,
              beforeAI: aiCheck.aiProbability,
              afterAI: humanized.aiProbability,
              reachedTarget: humanized.reachedTarget
            };
            
            console.log(`[SUCCESS] Humanization: ${aiCheck.aiProbability}% -> ${humanized.aiProbability}%`);
          } else if (aiCheck.aiProbability > targetProbability) {
            // Slightly above target - just apply imperfections
            text = humanizeService.injectHumanImperfections(text, voiceProfile);
            humanizationResult = { 
              applied: true, 
              method: 'imperfections',
              aiProbability: aiCheck.aiProbability
            };
          } else {
            // Already below target
            humanizationResult = { 
              applied: false, 
              reason: 'already_human',
              aiProbability: aiCheck.aiProbability
            };
            console.log(`[INFO] AI probability ${aiCheck.aiProbability}% already below target`);
          }
        }
      } catch (humanizeError) {
        console.error('[WARN] Humanization failed:', humanizeError.message);
        humanizationResult = { applied: false, error: humanizeError.message };
      }
    } else if (chatSettings?.useAntiAIDetection && text.length > 100) {
      // Apply lighter humanization (just imperfection injection)
      text = humanizeService.injectHumanImperfections(text, voiceProfile);
      humanizationResult = { applied: true, method: 'anti-ai' };
    }

    // Log activity
    const userId = req.body.user_id || req.headers['x-user-id'];
    if (userId) {
      activityLogService.logFeatureUsage(userId, 'chat_humanized', {
        profileId,
        model,
        inputLength: messages.reduce((sum, m) => sum + (m.content?.length || 0), 0),
        outputLength: text.length,
        humanized: !!humanizationResult,
        iterations: humanizationResult?.iterations,
        creditsUsed: req.creditCost || 0,
        creditsBefore: req.creditsBefore,
        creditsAfter: req.creditsAfter
      });
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

    console.log(`[INFO] Humanized stream request: ${messages.length} messages, model: ${model}, profileId: ${profileId || 'none'}`);

    // Load profile (optional - can be null for generic humanization)
    const profile = await loadProfile(profileId);
    
    // Use profile voice or generic voice
    const voiceProfile = profile?.voice_profile || {
      tone: 'natural',
      formality_level: 5,
      key_characteristics: ['clear', 'engaging', 'authentic']
    };
    
    // Build enhanced system prompt
    let enhancedSystemPrompt = buildEnhancedSystemPrompt(systemPrompt, profile, writingPreferences);
    
    // Add response style instructions if provided
    const responseStyleInstructions = buildResponseStyleInstructions(chatSettings);
    if (responseStyleInstructions) {
      enhancedSystemPrompt += responseStyleInstructions;
    }
    
    // Add anti-AI detection rules to system prompt
    if (chatSettings?.useAntiAIDetection || chatSettings?.humanizeResponse) {
      
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
      try {
        // Try different ways to extract text from chunk (same as analysis controller)
        let chunkText = null;
        
        if (typeof chunk.text === 'function') {
          chunkText = chunk.text();
        } else if (chunk.candidates && chunk.candidates[0]) {
          const candidate = chunk.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
            chunkText = candidate.content.parts[0].text;
          }
        } else if (chunk.text) {
          chunkText = chunk.text;
        }
        
        if (chunkText) {
          totalChars += chunkText.length;
          fullText += chunkText;
          res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
        }
      } catch (chunkError) {
        console.error('[ERROR] Error processing chunk:', chunkError);
      }
    }

    // Smart humanization based on text length and settings
    let humanizationResult = null;
    let finalText = fullText;
    
    if (chatSettings?.humanizeResponse && fullText.length > 100) {
      try {
        const targetProbability = chatSettings.targetAIProbability || 35;
        
        // For short responses (< 500 chars), just apply imperfection injection
        // For longer responses, do a quick AI check first
        if (fullText.length < 500) {
          // Light humanization - just imperfection injection
          finalText = humanizeService.injectHumanImperfections(fullText, voiceProfile);
          humanizationResult = { applied: true, method: 'light' };
          console.log('[INFO] Applied light humanization for short response');
        } else {
          // For longer text, check AI probability first
          console.log('[INFO] Checking AI probability for longer response...');
          const aiCheck = await geminiService.detectAIContentEnhanced(fullText);
          
          if (aiCheck.aiProbability > targetProbability + 15) {
            // AI probability is significantly above target - do one refinement iteration
            console.log(`[INFO] AI probability ${aiCheck.aiProbability}% > target ${targetProbability}%, applying refinement...`);
            
            // Send progress to client
            res.write(`data: ${JSON.stringify({ 
              type: 'humanizing',
              aiProbability: aiCheck.aiProbability,
              target: targetProbability
            })}\n\n`);
            
            // Single refinement iteration (cost-effective)
            const refinementContext = humanizeService.buildRefinementContext(
              fullText, 
              aiCheck.aiIndicators, 
              aiCheck.aiProbability
            );
            
            finalText = await humanizeService.rewriteWithAntiDetection(
              fullText,
              voiceProfile,
              { 
                sampleText: profile?.sample_text,
                refinementContext,
                writingPreferences 
              },
              'gemini-2.0-flash-exp' // Use fast model for refinement
            );
            
            // Quick re-check (optional, for logging)
            const recheck = await geminiService.detectAIContentEnhanced(finalText);
            
            humanizationResult = { 
              applied: true, 
              method: 'refinement',
              iterations: 1,
              beforeAI: aiCheck.aiProbability,
              afterAI: recheck.aiProbability,
              improved: recheck.aiProbability < aiCheck.aiProbability
            };
            
            console.log(`[SUCCESS] Refinement complete: ${aiCheck.aiProbability}% -> ${recheck.aiProbability}%`);
          } else if (aiCheck.aiProbability > targetProbability) {
            // AI probability slightly above target - just apply imperfections
            finalText = humanizeService.injectHumanImperfections(fullText, voiceProfile);
            humanizationResult = { 
              applied: true, 
              method: 'imperfections',
              aiProbability: aiCheck.aiProbability
            };
            console.log(`[INFO] AI probability ${aiCheck.aiProbability}% close to target, applied imperfections only`);
          } else {
            // Already below target - no humanization needed
            humanizationResult = { 
              applied: false, 
              reason: 'already_human',
              aiProbability: aiCheck.aiProbability
            };
            console.log(`[INFO] AI probability ${aiCheck.aiProbability}% already below target ${targetProbability}%`);
          }
        }
        
        // Send humanized text if changed
        if (finalText !== fullText) {
          res.write(`data: ${JSON.stringify({ 
            type: 'humanized',
            text: finalText
          })}\n\n`);
        }
      } catch (e) {
        console.warn('[WARN] Post-humanization failed:', e.message);
        humanizationResult = { applied: false, error: e.message };
      }
    } else if (chatSettings?.useAntiAIDetection && fullText.length > 100) {
      // Anti-AI detection only (no full humanization) - just apply imperfections
      try {
        finalText = humanizeService.injectHumanImperfections(fullText, voiceProfile);
        if (finalText !== fullText) {
          res.write(`data: ${JSON.stringify({ 
            type: 'humanized',
            text: finalText
          })}\n\n`);
        }
        humanizationResult = { applied: true, method: 'anti-ai' };
      } catch (e) {
        console.warn('[WARN] Anti-AI imperfection injection failed:', e.message);
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

    // Log activity
    const userId = req.body.user_id || req.headers['x-user-id'];
    if (userId) {
      activityLogService.logFeatureUsage(userId, 'chat_humanized', {
        profileId,
        model,
        inputLength: messages.reduce((sum, m) => sum + (m.content?.length || 0), 0),
        outputLength: totalChars,
        streaming: true,
        humanized: !!humanizationResult,
        creditsUsed: req.creditCost || 0,
        creditsBefore: req.creditsBefore,
        creditsAfter: req.creditsAfter
      });
    }

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
