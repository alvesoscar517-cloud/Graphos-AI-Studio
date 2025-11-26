/**
 * Conversation Summarizer
 * Handles automatic summarization of long conversations
 */

const { getVertexAI } = require('../config/gemini');

const vertexAI = getVertexAI();

// Configuration
const MAX_CONTEXT_TOKENS = 8000; // Safe limit for context
const SUMMARY_TRIGGER_MESSAGES = 20; // Trigger summarization after this many messages
const KEEP_RECENT_MESSAGES = 6; // Keep this many recent messages unsummarized

/**
 * Check if conversation needs summarization
 * @param {Array} messages - Array of messages
 * @param {number} estimatedTokens - Estimated token count
 * @returns {boolean}
 */
function needsSummarization(messages, estimatedTokens) {
  return messages.length > SUMMARY_TRIGGER_MESSAGES || estimatedTokens > MAX_CONTEXT_TOKENS;
}

/**
 * Summarize older messages in a conversation
 * @param {Array} messages - Full message array
 * @returns {Promise<Object>} - { summary, recentMessages }
 */
async function summarizeConversation(messages) {
  if (messages.length <= KEEP_RECENT_MESSAGES) {
    return {
      summary: null,
      recentMessages: messages
    };
  }
  
  try {
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite', // Use lite model for cost efficiency
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500
      }
    });
    
    // Split messages: older ones to summarize, recent ones to keep
    const messagesToSummarize = messages.slice(0, -KEEP_RECENT_MESSAGES);
    const recentMessages = messages.slice(-KEEP_RECENT_MESSAGES);
    
    // Format messages for summarization
    const conversationText = messagesToSummarize.map(m => 
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.substring(0, 500)}${m.content.length > 500 ? '...' : ''}`
    ).join('\n\n');
    
    const prompt = `Summarize this conversation concisely, capturing:
1. Main topics discussed
2. Key decisions or conclusions
3. Important context for continuing the conversation

CONVERSATION:
${conversationText}

Provide a brief summary (max 200 words) that preserves essential context:`;

    const result = await model.generateContent(prompt);
    const summary = result.response.candidates[0].content.parts[0].text.trim();
    
    console.log(`[SUMMARIZE] Summarized ${messagesToSummarize.length} messages into ${summary.length} chars`);
    
    return {
      summary,
      recentMessages,
      summarizedCount: messagesToSummarize.length
    };
  } catch (error) {
    console.error('[ERROR] Summarization failed:', error.message);
    // Fallback: just keep recent messages without summary
    return {
      summary: null,
      recentMessages: messages.slice(-KEEP_RECENT_MESSAGES),
      error: error.message
    };
  }
}

/**
 * Build context with summary for API call
 * @param {string} existingSummary - Previous conversation summary
 * @param {Array} recentMessages - Recent messages to include
 * @param {string} systemPrompt - System prompt
 * @returns {Object} - { enhancedSystemPrompt, messages }
 */
function buildContextWithSummary(existingSummary, recentMessages, systemPrompt) {
  let enhancedSystemPrompt = systemPrompt;
  
  if (existingSummary) {
    enhancedSystemPrompt += `

PREVIOUS CONVERSATION CONTEXT:
${existingSummary}

Continue the conversation naturally, referencing the context above when relevant.`;
  }
  
  return {
    enhancedSystemPrompt,
    messages: recentMessages
  };
}

/**
 * Smart context management for long conversations
 * @param {Array} messages - All messages
 * @param {string} systemPrompt - System prompt
 * @param {string} existingSummary - Existing summary if any
 * @returns {Promise<Object>} - Optimized context
 */
async function manageConversationContext(messages, systemPrompt, existingSummary = null) {
  const { estimateConversationTokens } = require('./profileHelper');
  const tokenEstimate = estimateConversationTokens(messages, systemPrompt);
  
  // Check if we need to summarize
  if (!needsSummarization(messages, tokenEstimate.total)) {
    return {
      systemPrompt,
      messages,
      summary: existingSummary,
      wasSummarized: false
    };
  }
  
  console.log(`[CONTEXT] Conversation too long (${messages.length} msgs, ~${tokenEstimate.total} tokens), summarizing...`);
  
  // Summarize older messages
  const { summary, recentMessages, summarizedCount } = await summarizeConversation(messages);
  
  // Combine with existing summary if present
  let combinedSummary = summary;
  if (existingSummary && summary) {
    combinedSummary = `${existingSummary}\n\nLATER: ${summary}`;
  } else if (existingSummary && !summary) {
    combinedSummary = existingSummary;
  }
  
  // Build optimized context
  const { enhancedSystemPrompt, messages: optimizedMessages } = buildContextWithSummary(
    combinedSummary,
    recentMessages,
    systemPrompt
  );
  
  return {
    systemPrompt: enhancedSystemPrompt,
    messages: optimizedMessages,
    summary: combinedSummary,
    wasSummarized: true,
    summarizedCount
  };
}

module.exports = {
  needsSummarization,
  summarizeConversation,
  buildContextWithSummary,
  manageConversationContext,
  MAX_CONTEXT_TOKENS,
  SUMMARY_TRIGGER_MESSAGES,
  KEEP_RECENT_MESSAGES
};
