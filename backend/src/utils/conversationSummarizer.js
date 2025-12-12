const logger = require('../utils/logger');

/**
 * Conversation Summarizer
 * Handles automatic summarization of long conversations
 * 
 * Optimized approach similar to major platforms (ChatGPT, Claude):
 * 1. Sliding window: Keep recent messages in full detail
 * 2. Progressive summarization: Older messages get summarized
 * 3. Token-aware: Estimate and limit context size
 * 4. Cost-efficient: Use lite model for summarization
 */

const { getVertexAI } = require('../config/gemini');

const vertexAI = getVertexAI();

// Configuration - Optimized for cost and performance
const MAX_CONTEXT_TOKENS = 6000; // Conservative limit to leave room for response
const SUMMARY_TRIGGER_MESSAGES = 12; // Trigger earlier for better UX
const KEEP_RECENT_MESSAGES = 4; // Keep fewer but most relevant messages
const MAX_MESSAGE_LENGTH = 800; // Truncate individual messages if too long
const SUMMARY_MAX_TOKENS = 300; // Keep summaries concise

/**
 * Estimate tokens for a single message
 * @param {Object} message - Message object
 * @returns {number}
 */
function estimateMessageTokens(message) {
  const content = message.content || '';
  // Rough estimate: ~4 chars per token for English, ~2 for Vietnamese
  const hasVietnamese = /[\u00C0-\u1EF9]/.test(content);
  const charsPerToken = hasVietnamese ? 2.5 : 4;
  return Math.ceil(content.length / charsPerToken);
}

/**
 * Check if conversation needs summarization
 * @param {Array} messages - Array of messages
 * @param {number} estimatedTokens - Estimated token count
 * @returns {boolean}
 */
function needsSummarization(messages, estimatedTokens) {
  // Trigger summarization if:
  // 1. Too many messages (even if short)
  // 2. Token count exceeds limit
  // 3. Any single message is very long (>2000 chars)
  const hasLongMessage = messages.some(m => (m.content?.length || 0) > 2000);
  return messages.length > SUMMARY_TRIGGER_MESSAGES || 
         estimatedTokens > MAX_CONTEXT_TOKENS ||
         (messages.length > 8 && hasLongMessage);
}

/**
 * Truncate message content if too long
 * @param {string} content - Message content
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
function truncateMessage(content, maxLength = MAX_MESSAGE_LENGTH) {
  if (!content || content.length <= maxLength) return content;
  // Try to truncate at sentence boundary
  const truncated = content.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  if (lastSentence > maxLength * 0.7) {
    return truncated.substring(0, lastSentence + 1) + ' [...]';
  }
  return truncated + '...';
}

/**
 * Summarize older messages in a conversation
 * Optimized for cost and quality
 * @param {Array} messages - Full message array
 * @param {string} existingSummary - Previous summary to build upon
 * @returns {Promise<Object>} - { summary, recentMessages }
 */
async function summarizeConversation(messages, existingSummary = null) {
  if (messages.length <= KEEP_RECENT_MESSAGES) {
    return {
      summary: existingSummary,
      recentMessages: messages,
      summarizedCount: 0
    };
  }
  
  try {
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite', // Use lite model for cost efficiency
      generationConfig: {
        temperature: 0.2, // Lower temp for more consistent summaries
        maxOutputTokens: SUMMARY_MAX_TOKENS
      }
    });
    
    // Split messages: older ones to summarize, recent ones to keep
    const messagesToSummarize = messages.slice(0, -KEEP_RECENT_MESSAGES);
    const recentMessages = messages.slice(-KEEP_RECENT_MESSAGES);
    
    // Format messages for summarization (truncate long messages)
    const conversationText = messagesToSummarize.map(m => {
      const role = m.role === 'user' ? 'U' : 'A'; // Shorter role labels
      const content = truncateMessage(m.content, 400); // Truncate for summarization
      return `${role}: ${content}`;
    }).join('\n');
    
    // Build prompt with existing summary context
    let prompt;
    if (existingSummary) {
      prompt = `Update this conversation summary with new messages.

PREVIOUS SUMMARY:
${existingSummary}

NEW MESSAGES:
${conversationText}

Write an updated summary (max 150 words) that:
1. Merges previous context with new information
2. Keeps only essential details for continuing the conversation
3. Notes any topic changes or key decisions`;
    } else {
      prompt = `Summarize this conversation concisely.

CONVERSATION:
${conversationText}

Write a summary (max 150 words) capturing:
1. Main topics and user's goals
2. Key information exchanged
3. Any decisions or conclusions`;
    }

    const result = await model.generateContent(prompt);
    const summary = result.response.candidates[0].content.parts[0].text.trim();
    
    logger.info(`[SUMMARIZE] ${existingSummary ? 'Updated' : 'Created'} summary: ${messagesToSummarize.length} msgs -> ${summary.length} chars`);
    
    return {
      summary,
      recentMessages,
      summarizedCount: messagesToSummarize.length
    };
  } catch (error) {
    logger.error('[ERROR] Summarization failed:', error.message);
    // Fallback: keep recent messages with existing summary
    return {
      summary: existingSummary,
      recentMessages: messages.slice(-KEEP_RECENT_MESSAGES),
      summarizedCount: 0,
      error: error.message
    };
  }
}

/**
 * Build context with summary for API call
 * Optimized to minimize tokens while preserving context
 * @param {string} existingSummary - Previous conversation summary
 * @param {Array} recentMessages - Recent messages to include
 * @param {string} systemPrompt - System prompt
 * @returns {Object} - { enhancedSystemPrompt, messages }
 */
function buildContextWithSummary(existingSummary, recentMessages, systemPrompt) {
  let enhancedSystemPrompt = systemPrompt;
  
  if (existingSummary) {
    // Inject summary as context, not as part of conversation
    enhancedSystemPrompt += `

[CONVERSATION CONTEXT]
${existingSummary}
[END CONTEXT]

Use this context to maintain continuity. Don't mention the summary directly.`;
  }
  
  // Truncate recent messages if any are too long
  const optimizedMessages = recentMessages.map(m => ({
    ...m,
    content: truncateMessage(m.content, MAX_MESSAGE_LENGTH * 2) // Allow longer for recent
  }));
  
  return {
    enhancedSystemPrompt,
    messages: optimizedMessages
  };
}

/**
 * Smart context management for long conversations
 * Implements sliding window + progressive summarization like major platforms
 * @param {Array} messages - All messages
 * @param {string} systemPrompt - System prompt
 * @param {string} existingSummary - Existing summary if any
 * @returns {Promise<Object>} - Optimized context
 */
async function manageConversationContext(messages, systemPrompt, existingSummary = null) {
  const { estimateConversationTokens } = require('./profileHelper');
  
  // Quick token estimate
  const tokenEstimate = estimateConversationTokens(messages, systemPrompt);
  
  // Fast path: short conversations don't need optimization
  if (!needsSummarization(messages, tokenEstimate.total)) {
    // Still apply message truncation for very long individual messages
    const optimizedMessages = messages.map(m => ({
      ...m,
      content: truncateMessage(m.content, MAX_MESSAGE_LENGTH * 2)
    }));
    
    return {
      systemPrompt,
      messages: optimizedMessages,
      summary: existingSummary,
      wasSummarized: false,
      tokenEstimate: tokenEstimate.total
    };
  }
  
  logger.info(`[CONTEXT] Optimizing: ${messages.length} msgs, ~${tokenEstimate.total} tokens`);
  
  // Strategy: Progressive summarization
  // 1. If we have existing summary, use it and only summarize new old messages
  // 2. Keep recent messages in full (sliding window)
  // 3. Summarize everything else
  
  const { summary, recentMessages, summarizedCount } = await summarizeConversation(
    messages, 
    existingSummary
  );
  
  // Build optimized context
  const { enhancedSystemPrompt, messages: optimizedMessages } = buildContextWithSummary(
    summary,
    recentMessages,
    systemPrompt
  );
  
  // Calculate final token estimate
  const finalTokens = estimateConversationTokens(optimizedMessages, enhancedSystemPrompt);
  
  logger.info(`[CONTEXT] Optimized: ${messages.length} -> ${optimizedMessages.length} msgs, ~${tokenEstimate.total} -> ~${finalTokens.total} tokens`);
  
  return {
    systemPrompt: enhancedSystemPrompt,
    messages: optimizedMessages,
    summary,
    wasSummarized: true,
    summarizedCount,
    tokenEstimate: finalTokens.total,
    tokenSaved: tokenEstimate.total - finalTokens.total
  };
}

module.exports = {
  needsSummarization,
  summarizeConversation,
  buildContextWithSummary,
  manageConversationContext,
  truncateMessage,
  estimateMessageTokens,
  // Export config for testing/debugging
  config: {
    MAX_CONTEXT_TOKENS,
    SUMMARY_TRIGGER_MESSAGES,
    KEEP_RECENT_MESSAGES,
    MAX_MESSAGE_LENGTH,
    SUMMARY_MAX_TOKENS
  }
};
