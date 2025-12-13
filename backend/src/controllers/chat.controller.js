/**
 * Chat Controller
 * Handles workspace chat operations with improved architecture
 * Supports humanization and anti-AI detection for responses
 */

const { v4: uuidv4 } = require('uuid');
const geminiService = require('../services/gemini.service');
const humanizeService = require('../services/humanize.service');
const creditService = require('../services/credit.service');
const logger = require('../utils/logger');
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
const { detectAppIntent, getPrimaryTopic, mapTopicToContextKey, detectLanguage } = require('../utils/intentDetector');
const { formatAppContext, getTopicContext } = require('../data/app-context');
const { generateFollowUpSuggestions } = require('../utils/suggestionsGenerator');

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
 * Build app context instructions when user asks about the application
 * Uses intent detection to determine if context should be injected
 * @param {Array} messages - Conversation messages
 * @param {string} userLanguage - Detected user language
 * @returns {Object} - { shouldInject, context, topics, cleanMessage }
 */
function buildAppContextInstructions(messages, userLanguage = 'en') {
  if (!messages || messages.length === 0) {
    return { shouldInject: false, context: '', topics: [], cleanMessage: null };
  }

  // Get the last user message
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUserMessage) {
    return { shouldInject: false, context: '', topics: [], cleanMessage: null };
  }

  // Detect if user is asking about the app
  const intentResult = detectAppIntent(lastUserMessage.content, userLanguage);
  
  if (!intentResult.isAppRelated) {
    return { shouldInject: false, context: '', topics: [], cleanMessage: null, isAppHelpMode: false };
  }
  
  // If message had help prefix, return the clean message for processing
  const cleanMessage = intentResult.hasHelpPrefix ? intentResult.cleanMessage : null;
  
  // Determine if this is a pure app help mode (should bypass profile/humanization)
  // App help mode is triggered by explicit help prefix OR high confidence app-related detection
  const isAppHelpMode = intentResult.isAppHelpMode || (intentResult.confidence >= 80 && intentResult.hasHelpPrefix);

  logger.info(`[APP_CONTEXT] Injecting app context for topics: ${intentResult.topics.join(', ')} (confidence: ${intentResult.confidence}%)`);

  // Get primary topic for targeted context
  const primaryTopic = getPrimaryTopic(intentResult.topics);
  const contextKey = mapTopicToContextKey(primaryTopic);

  let context = '';
  
  if (contextKey) {
    // Use targeted context for specific topics
    const topicContext = getTopicContext(contextKey);
    if (topicContext) {
      context = `
=== APP KNOWLEDGE (Topic: ${primaryTopic}) ===
${topicContext}

IMPORTANT: 
- Use this information to answer the user's question about Graphos AI Studio
- Respond in the SAME LANGUAGE as the user's message
- Be helpful and guide users to use features effectively
- If the user's language is not English, translate your response naturally
=== END APP KNOWLEDGE ===
`;
    }
  }
  
  // Fallback to full context if no specific topic or context not found
  if (!context) {
    context = formatAppContext({
      includeModels: intentResult.topics.includes('models'),
      includeFeatures: true,
      includeFaq: intentResult.confidence < 70, // Include FAQ for less confident matches
      includeTroubleshooting: false,
      maxLength: 3500
    });
    
    // Add language instruction
    context += `
IMPORTANT: Respond in the SAME LANGUAGE as the user's message. The user appears to be using: ${userLanguage}
`;
  }

  return {
    shouldInject: true,
    context,
    topics: intentResult.topics,
    confidence: intentResult.confidence,
    cleanMessage,
    // When true, controller should bypass profile/humanization for accurate app help answers
    isAppHelpMode
  };
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
      model: requestedModel = 'gemini-2.5-flash', 
      temperature = 0.7, 
      profileId = null, 
      writingPreferences = null,
      conversationSummary = null
    } = req.body;

    // Validate model
    const model = validateModel(requestedModel, 'gemini-2.5-flash');

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        success: false,
        ...l.error('invalid_input'),
        code: 'INVALID_INPUT'
      });
    }

    logger.info(`[INFO] Chat request: ${messages.length} messages, model: ${model}`);

    // Detect user language and check for app-related questions FIRST
    // This determines if we should bypass profile/humanization
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const userLanguage = lastUserMsg ? detectLanguage(lastUserMsg.content) : 'en';
    const appContextResult = buildAppContextInstructions(messages, userLanguage);
    
    // In App Help mode, bypass profile to give accurate app information
    // Profile customization doesn't make sense for app help responses
    const shouldBypassProfile = appContextResult.isAppHelpMode;
    
    // Load profile and build enhanced system prompt (skip profile in app help mode)
    const profile = shouldBypassProfile ? null : await loadProfile(profileId);
    let enhancedSystemPrompt = buildEnhancedSystemPrompt(
      systemPrompt, 
      shouldBypassProfile ? null : profile, 
      shouldBypassProfile ? null : writingPreferences
    );

    // Inject app context if user is asking about the application
    if (appContextResult.shouldInject) {
      enhancedSystemPrompt += '\n' + appContextResult.context;
      logger.info(`[APP_CONTEXT] Injected context for topics: ${appContextResult.topics.join(', ')}${shouldBypassProfile ? ' (bypassing profile)' : ''}`);
      
      // Strip [APP_HELP] prefix from message if present
      if (appContextResult.cleanMessage !== null) {
        const lastIdx = messages.length - 1;
        messages[lastIdx] = { ...messages[lastIdx], content: appContextResult.cleanMessage };
      }
    }

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
    logger.info(`[INFO] Estimated tokens: ${tokenEstimate.total}`);

    // No maxOutputTokens limit - let AI decide response length naturally
    // Credits are calculated based on actual output tokens used
    const generativeModel = geminiService.vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: temperature,
      },
    });

    // Check for multimodal content in last message
    const lastMessage = optimizedMessages[optimizedMessages.length - 1];
    let result;

    if (hasMultimodalContent(lastMessage)) {
      // Multimodal request
      logger.info('[INFO] Processing multimodal message with attachments');
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

    logger.info(`[SUCCESS] Chat response generated (${text.length} chars)`);

    // Calculate output tokens and deduct output credits (Phase 2)
    const outputTokens = Math.ceil(text.length / 4);
    const userId = req.body.user_id || req.headers['x-user-id'];
    let outputCreditResult = { outputCost: 0 };
    
    if (userId) {
      // Deduct output credits based on actual response length
      outputCreditResult = await creditService.deductOutputCredits(
        userId,
        outputTokens,
        'chat_message',
        model,
        { endpoint: req.path, inputLength: messages.reduce((sum, m) => sum + (m.content?.length || 0), 0) }
      );
      
      // Log activity with both input and output costs
      const totalCreditsUsed = (req.creditCost || 0) + outputCreditResult.outputCost;
      activityLogService.logFeatureUsage(userId, 'chat_message', {
        profileId,
        model,
        inputLength: messages.reduce((sum, m) => sum + (m.content?.length || 0), 0),
        outputLength: text.length,
        outputTokens,
        inputCredits: req.creditCost || 0,
        outputCredits: outputCreditResult.outputCost,
        creditsUsed: totalCreditsUsed,
        creditsBefore: req.creditsBefore,
        creditsAfter: (req.creditsAfter || 0) - outputCreditResult.outputCost
      });
    }

    res.json({
      message: text,
      usage: {
        inputTokens: tokenEstimate.inputTokens,
        outputTokens: outputTokens,
        totalTokens: tokenEstimate.inputTokens + outputTokens
      },
      credits: {
        inputCost: req.creditCost || 0,
        outputCost: outputCreditResult.outputCost,
        totalCost: (req.creditCost || 0) + outputCreditResult.outputCost
      },
      context: {
        wasSummarized: contextResult.wasSummarized,
        summary: contextResult.summary,
        messagesProcessed: optimizedMessages.length
      }
    });

  } catch (error) {
    logger.error('[ERROR] Chat error:', error);
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
      model: requestedModel = 'gemini-2.5-flash', 
      temperature = 0.7, 
      profileId = null, 
      writingPreferences = null,
      chatSettings = null,
      conversationSummary = null
    } = req.body;

    // Validate model
    const model = validateModel(requestedModel, 'gemini-2.5-flash');

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages array is required',
        code: 'INVALID_INPUT'
      });
    }

    logger.info(`[INFO] Chat stream request: ${messages.length} messages, model: ${model}`);

    // Detect user language and check for app-related questions FIRST
    // This determines if we should bypass profile/humanization
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const userLanguage = lastUserMsg ? detectLanguage(lastUserMsg.content) : 'en';
    const appContextResult = buildAppContextInstructions(messages, userLanguage);
    
    // In App Help mode, bypass profile to give accurate app information
    const shouldBypassProfile = appContextResult.isAppHelpMode;

    // Load profile and build enhanced system prompt (skip profile in app help mode)
    const profile = shouldBypassProfile ? null : await loadProfile(profileId);
    let enhancedSystemPrompt = buildEnhancedSystemPrompt(
      systemPrompt, 
      shouldBypassProfile ? null : profile, 
      shouldBypassProfile ? null : writingPreferences
    );
    
    // Add response style instructions if provided (skip in app help mode)
    if (!shouldBypassProfile) {
      const responseStyleInstructions = buildResponseStyleInstructions(chatSettings);
      if (responseStyleInstructions) {
        enhancedSystemPrompt += responseStyleInstructions;
      }
    }

    // Inject app context if user is asking about the application
    if (appContextResult.shouldInject) {
      enhancedSystemPrompt += '\n' + appContextResult.context;
      logger.info(`[APP_CONTEXT] Injected context for topics: ${appContextResult.topics.join(', ')}${shouldBypassProfile ? ' (bypassing profile/style)' : ''}`);
      
      // Strip [APP_HELP] prefix from message if present
      if (appContextResult.cleanMessage !== null) {
        const lastIdx = messages.length - 1;
        messages[lastIdx] = { ...messages[lastIdx], content: appContextResult.cleanMessage };
      }
    }

    // Manage conversation context (summarize if needed)
    const contextResult = await manageConversationContext(
      messages, 
      enhancedSystemPrompt, 
      conversationSummary
    );
    
    enhancedSystemPrompt = contextResult.systemPrompt;
    const optimizedMessages = contextResult.messages;

    // Set CORS headers explicitly for streaming
    const origin = req.get('Origin');
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    
    // Flush headers immediately to establish connection before AI processing
    res.flushHeaders();

    // Send context info first
    if (contextResult.wasSummarized) {
      res.write(`data: ${JSON.stringify({ 
        type: 'context', 
        wasSummarized: true,
        summarizedCount: contextResult.summarizedCount 
      })}\n\n`);
    }

    const finalSystemPrompt = enhancedSystemPrompt;
    
    // Build generation config
    // No maxOutputTokens limit - let AI decide response length naturally
    // Credits are calculated based on actual output tokens used
    const generationConfig = {
      temperature: temperature,
    };
    
    // Build model config
    const modelConfig = {
      model: model,
      generationConfig,
    };
    
    const generativeModel = geminiService.vertexAI.getGenerativeModel(modelConfig);

    const lastMessage = optimizedMessages[optimizedMessages.length - 1];
    let streamResult;

    if (hasMultimodalContent(lastMessage)) {
      // Multimodal streaming
      logger.info('[INFO] Processing multimodal stream with attachments');
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
    let fullResponseText = ''; // Collect full response for suggestions
    let finishReason = null;
    let wasIncomplete = false;
    
    for await (const chunk of streamResult.stream) {
      try {
        // Standard response handling
        let chunkText = null;
        
        if (typeof chunk.text === 'function') {
          chunkText = chunk.text();
        } else if (chunk.candidates && chunk.candidates[0]) {
          const candidate = chunk.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
            chunkText = candidate.content.parts[0].text;
          }
          // Check finish reason from candidate
          if (candidate.finishReason) {
            finishReason = candidate.finishReason;
            if (finishReason === 'MAX_TOKENS') {
              wasIncomplete = true;
              logger.warn('[WARN] Response truncated due to MAX_TOKENS limit');
            } else if (finishReason === 'SAFETY') {
              logger.warn('[WARN] Response blocked by safety filter');
            } else if (finishReason === 'RECITATION') {
              logger.warn('[WARN] Response blocked due to recitation');
            }
          }
        } else if (chunk.text) {
          chunkText = chunk.text;
        }
        
        if (chunkText) {
          totalChars += chunkText.length;
          fullResponseText += chunkText; // Collect for suggestions
          res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
        }
      } catch (chunkError) {
        logger.error('[ERROR] Error processing chunk:', chunkError);
      }
    }
    
    // Log finish reason for debugging
    if (finishReason) {
      logger.info(`[INFO] Stream finished with reason: ${finishReason}`);
    }

    // Generate follow-up suggestions (async, non-blocking)
    const lastUserMessage = optimizedMessages[optimizedMessages.length - 1]?.content || '';
    let suggestions = [];
    
    // Only generate suggestions if response is substantial and not app help mode
    if (totalChars > 100 && !appContextResult.isAppHelpMode) {
      try {
        // Use a lighter model for suggestions to minimize cost
        suggestions = await generateFollowUpSuggestions(
          fullResponseText.substring(0, 1000), // Use first 1000 chars of response
          lastUserMessage,
          userLanguage,
          { maxSuggestions: 3, model: 'gemini-2.5-flash-lite' }
        );
      } catch (suggestError) {
        logger.warn('[SUGGESTIONS] Failed to generate suggestions:', suggestError.message);
      }
    }

    // Calculate output tokens and deduct output credits (Phase 2)
    const outputTokens = Math.ceil(totalChars / 4);
    const userId = req.body.user_id || req.headers['x-user-id'];
    let outputCreditResult = { outputCost: 0 };
    
    if (userId) {
      // Deduct output credits based on actual response length
      outputCreditResult = await creditService.deductOutputCredits(
        userId,
        outputTokens,
        'chat_message',
        model,
        { endpoint: req.path, streaming: true }
      );
    }

    // Send completion with metadata, suggestions, and credit info
    res.write(`data: ${JSON.stringify({ 
      type: 'complete',
      summary: contextResult.summary,
      outputTokens: outputTokens,
      suggestions: suggestions,
      finishReason: finishReason,
      wasIncomplete: wasIncomplete,
      credits: {
        inputCost: req.creditCost || 0,
        outputCost: outputCreditResult.outputCost,
        totalCost: (req.creditCost || 0) + outputCreditResult.outputCost
      }
    })}\n\n`);
    
    res.write('data: [DONE]\n\n');
    res.end();

    // Log activity with both input and output costs
    if (userId) {
      const totalCreditsUsed = (req.creditCost || 0) + outputCreditResult.outputCost;
      activityLogService.logFeatureUsage(userId, 'chat_message', {
        profileId,
        model,
        inputLength: messages.reduce((sum, m) => sum + (m.content?.length || 0), 0),
        outputLength: totalChars,
        outputTokens,
        streaming: true,
        inputCredits: req.creditCost || 0,
        outputCredits: outputCreditResult.outputCost,
        creditsUsed: totalCreditsUsed,
        creditsBefore: req.creditsBefore,
        creditsAfter: (req.creditsAfter || 0) - outputCreditResult.outputCost
      });
    }

    logger.info(`[SUCCESS] Chat stream completed (${totalChars} chars)`);

  } catch (error) {
    logger.error('[ERROR] Chat stream error:', error);
    logger.error('[ERROR] Chat stream error details:', {
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
        logger.warn('[WARN] OCR failed:', e.message);
      }

      // Get image description
      try {
        analysis = await analyzeImage(file, mimeType, 'Briefly describe what you see in this image.');
      } catch (e) {
        logger.warn('[WARN] Image analysis failed:', e.message);
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
    logger.error('[ERROR] Upload error:', error);
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
    logger.error('[ERROR] Summarization error:', error);
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
      model: requestedModel = 'gemini-2.5-flash', 
      temperature = 0.7, 
      profileId = null, 
      writingPreferences = null,
      chatSettings = null,
      conversationSummary = null
    } = req.body;

    // Validate model
    const model = validateModel(requestedModel, 'gemini-2.5-flash');

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages array is required',
        code: 'INVALID_INPUT'
      });
    }

    // Profile is optional - humanization can work without profile using generic voice

    logger.info(`[INFO] Humanized chat request: ${messages.length} messages, model: ${model}, profileId: ${profileId || 'none'}`);

    // Detect user language and check for app-related questions FIRST
    // This determines if we should bypass profile/humanization
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const userLanguage = lastUserMsg ? detectLanguage(lastUserMsg.content) : 'en';
    const appContextResult = buildAppContextInstructions(messages, userLanguage);
    
    // In App Help mode, bypass profile AND humanization for accurate app information
    // App help responses should be clear and informative, not humanized
    const shouldBypassProfile = appContextResult.isAppHelpMode;

    // Load profile (optional - can be null for generic humanization, or bypassed for app help)
    const profile = shouldBypassProfile ? null : await loadProfile(profileId);
    
    // Use profile voice or generic voice (skip in app help mode)
    const voiceProfile = shouldBypassProfile ? null : (profile?.voice_profile || {
      tone: 'natural',
      formality_level: 5,
      key_characteristics: ['clear', 'engaging', 'authentic']
    });
    const sampleText = shouldBypassProfile ? null : (profile?.sample_text || null);

    // Build enhanced system prompt with humanization instructions (skip in app help mode)
    let enhancedSystemPrompt = buildEnhancedSystemPrompt(
      systemPrompt, 
      shouldBypassProfile ? null : profile, 
      shouldBypassProfile ? null : writingPreferences
    );
    
    // Add humanization instructions to system prompt (skip in app help mode)
    if (!shouldBypassProfile && (chatSettings?.useAntiAIDetection || chatSettings?.humanizeResponse)) {
      enhancedSystemPrompt = humanizeService.buildEnhancedRewritePrompt(
        enhancedSystemPrompt,
        voiceProfile,
        sampleText,
        { isSystemPrompt: true, writingPreferences }
      );
    }

    // Inject app context if user is asking about the application
    if (appContextResult.shouldInject) {
      enhancedSystemPrompt += '\n' + appContextResult.context;
      logger.info(`[APP_CONTEXT] Injected context for topics: ${appContextResult.topics.join(', ')}${shouldBypassProfile ? ' (bypassing profile/humanization)' : ''}`);
      
      // Strip [APP_HELP] prefix from message if present
      if (appContextResult.cleanMessage !== null) {
        const lastIdx = messages.length - 1;
        messages[lastIdx] = { ...messages[lastIdx], content: appContextResult.cleanMessage };
      }
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
    // No maxOutputTokens limit - let AI decide response length naturally
    // Credits are calculated based on actual output tokens used
    const generativeModel = geminiService.vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: chatSettings?.humanizeResponse ? 0.8 : temperature,
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

    logger.info(`[INFO] Initial response generated (${text.length} chars)`);

    // Smart humanization based on text length and settings
    // SKIP humanization entirely in App Help mode - we want accurate, clear app information
    let humanizationResult = null;
    if (!shouldBypassProfile && chatSettings?.humanizeResponse && text.length > 100) {
      const targetProbability = chatSettings.targetAIProbability || 35;
      
      try {
        // For short responses (< 500 chars), just apply imperfection injection
        if (text.length < 500) {
          text = humanizeService.injectHumanImperfections(text, voiceProfile);
          humanizationResult = { applied: true, method: 'light' };
          logger.info('[INFO] Applied light humanization for short response');
        } else {
          // For longer text, check AI probability first
          logger.info('[INFO] Checking AI probability...');
          const aiCheck = await geminiService.detectAIContentEnhanced(text);
          
          if (aiCheck.aiProbability > targetProbability + 15) {
            // AI probability significantly above target - do refinement
            logger.info(`[INFO] AI probability ${aiCheck.aiProbability}% > target, applying refinement...`);
            
            const humanized = await humanizeService.rewriteWithIterativeRefinement(
              text,
              voiceProfile,
              { sampleText, writingPreferences },
              {
                maxIterations: 1, // Single iteration for cost efficiency
                targetProbability,
                model: 'gemini-2.5-flash'
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
            
            logger.info(`[SUCCESS] Humanization: ${aiCheck.aiProbability}% -> ${humanized.aiProbability}%`);
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
            logger.info(`[INFO] AI probability ${aiCheck.aiProbability}% already below target`);
          }
        }
      } catch (humanizeError) {
        logger.error('[WARN] Humanization failed:', humanizeError.message);
        humanizationResult = { applied: false, error: humanizeError.message };
      }
    } else if (!shouldBypassProfile && chatSettings?.useAntiAIDetection && text.length > 100) {
      // Apply lighter humanization (just imperfection injection)
      text = humanizeService.injectHumanImperfections(text, voiceProfile);
      humanizationResult = { applied: true, method: 'anti-ai' };
    } else if (shouldBypassProfile) {
      // Log that we skipped humanization due to app help mode
      humanizationResult = { applied: false, reason: 'app_help_mode' };
      logger.info('[INFO] Skipped humanization - App Help mode active');
    }

    // Calculate output tokens and deduct output credits (Phase 2)
    const outputTokens = Math.ceil(text.length / 4);
    const userId = req.body.user_id || req.headers['x-user-id'];
    let outputCreditResult = { outputCost: 0 };
    
    if (userId) {
      // Deduct output credits based on actual response length
      outputCreditResult = await creditService.deductOutputCredits(
        userId,
        outputTokens,
        'chat_humanized',
        model,
        { endpoint: req.path, humanized: !!humanizationResult }
      );
      
      // Log activity with both input and output costs
      const totalCreditsUsed = (req.creditCost || 0) + outputCreditResult.outputCost;
      activityLogService.logFeatureUsage(userId, 'chat_humanized', {
        profileId,
        model,
        inputLength: messages.reduce((sum, m) => sum + (m.content?.length || 0), 0),
        outputLength: text.length,
        outputTokens,
        humanized: !!humanizationResult,
        iterations: humanizationResult?.iterations,
        inputCredits: req.creditCost || 0,
        outputCredits: outputCreditResult.outputCost,
        creditsUsed: totalCreditsUsed,
        creditsBefore: req.creditsBefore,
        creditsAfter: (req.creditsAfter || 0) - outputCreditResult.outputCost
      });
    }

    res.json({
      message: text,
      humanization: humanizationResult,
      credits: {
        inputCost: req.creditCost || 0,
        outputCost: outputCreditResult.outputCost,
        totalCost: (req.creditCost || 0) + outputCreditResult.outputCost
      },
      context: {
        wasSummarized: contextResult.wasSummarized,
        summary: contextResult.summary
      }
    });

  } catch (error) {
    logger.error('[ERROR] Humanized chat error:', error);
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
      model: requestedModel = 'gemini-2.5-flash', 
      temperature = 0.7, 
      profileId = null, 
      writingPreferences = null,
      chatSettings = null,
      conversationSummary = null
    } = req.body;

    // Validate model
    const model = validateModel(requestedModel, 'gemini-2.5-flash');

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages array is required',
        code: 'INVALID_INPUT'
      });
    }

    logger.info(`[INFO] Humanized stream request: ${messages.length} messages, model: ${model}, profileId: ${profileId || 'none'}`);

    // Detect user language and check for app-related questions FIRST
    // This determines if we should bypass profile/humanization
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const userLanguage = lastUserMsg ? detectLanguage(lastUserMsg.content) : 'en';
    const appContextResult = buildAppContextInstructions(messages, userLanguage);
    
    // In App Help mode, bypass profile AND humanization for accurate app information
    const shouldBypassProfile = appContextResult.isAppHelpMode;

    // Load profile (optional - can be null for generic humanization, or bypassed for app help)
    const profile = shouldBypassProfile ? null : await loadProfile(profileId);
    
    // Use profile voice or generic voice (skip in app help mode)
    const voiceProfile = shouldBypassProfile ? null : (profile?.voice_profile || {
      tone: 'natural',
      formality_level: 5,
      key_characteristics: ['clear', 'engaging', 'authentic']
    });
    
    // Build enhanced system prompt (skip profile in app help mode)
    let enhancedSystemPrompt = buildEnhancedSystemPrompt(
      systemPrompt, 
      shouldBypassProfile ? null : profile, 
      shouldBypassProfile ? null : writingPreferences
    );
    
    // Add response style instructions if provided (skip in app help mode)
    if (!shouldBypassProfile) {
      const responseStyleInstructions = buildResponseStyleInstructions(chatSettings);
      if (responseStyleInstructions) {
        enhancedSystemPrompt += responseStyleInstructions;
      }
    }
    
    // Add anti-AI detection rules to system prompt (skip in app help mode)
    if (!shouldBypassProfile && (chatSettings?.useAntiAIDetection || chatSettings?.humanizeResponse)) {
      
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
- Tone: ${voiceProfile?.tone || 'natural'}
- Formality: ${voiceProfile?.formality_level || 5}/10
- Characteristics: ${(voiceProfile?.key_characteristics || []).slice(0, 3).join(', ')}
${voiceProfile?.rewrite_instructions ? `- Special instructions: ${voiceProfile.rewrite_instructions}` : ''}

Write naturally as if you ARE this person, not an AI pretending to be them.`;
    }

    // Inject app context if user is asking about the application
    if (appContextResult.shouldInject) {
      enhancedSystemPrompt += '\n' + appContextResult.context;
      logger.info(`[APP_CONTEXT] Injected context for topics: ${appContextResult.topics.join(', ')}${shouldBypassProfile ? ' (bypassing profile/humanization)' : ''}`);
      
      // Strip [APP_HELP] prefix from message if present
      if (appContextResult.cleanMessage !== null) {
        const lastIdx = messages.length - 1;
        messages[lastIdx] = { ...messages[lastIdx], content: appContextResult.cleanMessage };
      }
    }

    // Manage conversation context
    const contextResult = await manageConversationContext(
      messages, 
      enhancedSystemPrompt, 
      conversationSummary
    );
    
    enhancedSystemPrompt = contextResult.systemPrompt;
    const optimizedMessages = contextResult.messages;

    // Set CORS headers explicitly for streaming
    const originHeader = req.get('Origin');
    if (originHeader) {
      res.setHeader('Access-Control-Allow-Origin', originHeader);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    
    // Flush headers immediately to establish connection before AI processing
    res.flushHeaders();

    // Send context info
    if (contextResult.wasSummarized) {
      res.write(`data: ${JSON.stringify({ 
        type: 'context', 
        wasSummarized: true,
        summarizedCount: contextResult.summarizedCount 
      })}\n\n`);
    }

    // No maxOutputTokens limit - let AI decide response length naturally
    // Credits are calculated based on actual output tokens used
    const generativeModel = geminiService.vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: chatSettings?.humanizeResponse ? 0.85 : temperature,
        topP: 0.9,
        topK: 40,
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
    let finishReason = null;
    let wasIncomplete = false;
    
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
          // Check finish reason from candidate
          if (candidate.finishReason) {
            finishReason = candidate.finishReason;
            if (finishReason === 'MAX_TOKENS') {
              wasIncomplete = true;
              logger.warn('[WARN] Humanized response truncated due to MAX_TOKENS limit');
            } else if (finishReason === 'SAFETY') {
              logger.warn('[WARN] Humanized response blocked by safety filter');
            }
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
        logger.error('[ERROR] Error processing chunk:', chunkError);
      }
    }
    
    // Log finish reason for debugging
    if (finishReason) {
      logger.info(`[INFO] Humanized stream finished with reason: ${finishReason}`);
    }

    // Smart humanization based on text length and settings
    // SKIP humanization entirely in App Help mode - we want accurate, clear app information
    let humanizationResult = null;
    let finalText = fullText;
    
    if (!shouldBypassProfile && chatSettings?.humanizeResponse && fullText.length > 100) {
      try {
        const targetProbability = chatSettings.targetAIProbability || 35;
        
        // For short responses (< 500 chars), just apply imperfection injection
        // For longer responses, do a quick AI check first
        if (fullText.length < 500) {
          // Light humanization - just imperfection injection
          finalText = humanizeService.injectHumanImperfections(fullText, voiceProfile);
          humanizationResult = { applied: true, method: 'light' };
          logger.info('[INFO] Applied light humanization for short response');
        } else {
          // For longer text, check AI probability first
          logger.info('[INFO] Checking AI probability for longer response...');
          const aiCheck = await geminiService.detectAIContentEnhanced(fullText);
          
          if (aiCheck.aiProbability > targetProbability + 15) {
            // AI probability is significantly above target - do one refinement iteration
            logger.info(`[INFO] AI probability ${aiCheck.aiProbability}% > target ${targetProbability}%, applying refinement...`);
            
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
              'gemini-2.5-flash' // Use fast model for refinement
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
            
            logger.info(`[SUCCESS] Refinement complete: ${aiCheck.aiProbability}% -> ${recheck.aiProbability}%`);
          } else if (aiCheck.aiProbability > targetProbability) {
            // AI probability slightly above target - just apply imperfections
            finalText = humanizeService.injectHumanImperfections(fullText, voiceProfile);
            humanizationResult = { 
              applied: true, 
              method: 'imperfections',
              aiProbability: aiCheck.aiProbability
            };
            logger.info(`[INFO] AI probability ${aiCheck.aiProbability}% close to target, applied imperfections only`);
          } else {
            // Already below target - no humanization needed
            humanizationResult = { 
              applied: false, 
              reason: 'already_human',
              aiProbability: aiCheck.aiProbability
            };
            logger.info(`[INFO] AI probability ${aiCheck.aiProbability}% already below target ${targetProbability}%`);
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
        logger.warn('[WARN] Post-humanization failed:', e.message);
        humanizationResult = { applied: false, error: e.message };
      }
    } else if (!shouldBypassProfile && chatSettings?.useAntiAIDetection && fullText.length > 100) {
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
        logger.warn('[WARN] Anti-AI imperfection injection failed:', e.message);
      }
    } else if (shouldBypassProfile) {
      // Log that we skipped humanization due to app help mode
      humanizationResult = { applied: false, reason: 'app_help_mode' };
      logger.info('[INFO] Skipped humanization - App Help mode active');
    }

    // Generate follow-up suggestions
    const lastUserMessage = optimizedMessages[optimizedMessages.length - 1]?.content || '';
    let suggestions = [];
    
    // Only generate suggestions if response is substantial and not app help mode
    if (totalChars > 100 && !shouldBypassProfile) {
      try {
        suggestions = await generateFollowUpSuggestions(
          finalText.substring(0, 1000),
          lastUserMessage,
          userLanguage,
          { maxSuggestions: 3, model: 'gemini-2.5-flash-lite' }
        );
      } catch (suggestError) {
        logger.warn('[SUGGESTIONS] Failed to generate suggestions:', suggestError.message);
      }
    }

    // Calculate output tokens and deduct output credits (Phase 2)
    const outputTokens = Math.ceil(totalChars / 4);
    const userId = req.body.user_id || req.headers['x-user-id'];
    let outputCreditResult = { outputCost: 0 };
    
    if (userId) {
      // Deduct output credits based on actual response length
      outputCreditResult = await creditService.deductOutputCredits(
        userId,
        outputTokens,
        'chat_humanized',
        model,
        { endpoint: req.path, streaming: true, humanized: !!humanizationResult }
      );
    }

    // Send completion with credit info
    res.write(`data: ${JSON.stringify({ 
      type: 'complete',
      summary: contextResult.summary,
      outputTokens: outputTokens,
      humanization: humanizationResult,
      suggestions: suggestions,
      finishReason: finishReason,
      wasIncomplete: wasIncomplete,
      credits: {
        inputCost: req.creditCost || 0,
        outputCost: outputCreditResult.outputCost,
        totalCost: (req.creditCost || 0) + outputCreditResult.outputCost
      }
    })}\n\n`);
    
    res.write('data: [DONE]\n\n');
    res.end();

    // Log activity with both input and output costs
    if (userId) {
      const totalCreditsUsed = (req.creditCost || 0) + outputCreditResult.outputCost;
      activityLogService.logFeatureUsage(userId, 'chat_humanized', {
        profileId,
        model,
        inputLength: messages.reduce((sum, m) => sum + (m.content?.length || 0), 0),
        outputLength: totalChars,
        outputTokens,
        streaming: true,
        humanized: !!humanizationResult,
        finishReason: finishReason,
        inputCredits: req.creditCost || 0,
        outputCredits: outputCreditResult.outputCost,
        creditsUsed: totalCreditsUsed,
        creditsBefore: req.creditsBefore,
        creditsAfter: (req.creditsAfter || 0) - outputCreditResult.outputCost
      });
    }

    logger.info(`[SUCCESS] Humanized stream completed (${totalChars} chars, finishReason: ${finishReason || 'STOP'}, outputCredits: ${outputCreditResult.outputCost})`);

  } catch (error) {
    logger.error('[ERROR] Humanized stream error:', error);
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
