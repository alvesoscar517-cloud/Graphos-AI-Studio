/**
 * Credit Middleware - REFACTORED
 * 
 * CRITICAL CHANGE: Credits are now deducted AFTER successful processing
 * using a "reserve -> process -> commit/rollback" pattern
 * 
 * This prevents users from losing credits when API calls fail
 * 
 * Supports both:
 * - Regular JSON responses (res.json)
 * - Streaming responses (res.write/res.end) - SSE endpoints
 */

const creditService = require('../services/credit.service');
const activityLogService = require('../services/activityLog.service');
const logger = require('../utils/logger');
const localization = require('../services/localization.service');
const { getLanguage } = require('./language.middleware');

/**
 * Helper function to deduct credits and log
 */
async function commitCreditDeduction(req) {
  if (!req.creditReservation || req.creditReservation.deducted) {
    return false;
  }
  
  try {
    await creditService.deductCredits(
      req.creditReservation.userId, 
      req.creditReservation.cost, 
      req.creditReservation.featureName, 
      {
        endpoint: req.path,
        method: req.method
      }
    );
    
    // Track usage
    await creditService.trackFeatureUsage(
      req.creditReservation.userId, 
      req.creditReservation.featureName, 
      req.creditReservation.cost, 
      { endpoint: req.path }
    );
    
    // Log credit usage to activity logs
    const creditsAfter = req.creditReservation.creditsBefore - req.creditReservation.cost;
    activityLogService.logCreditUsage(
      req.creditReservation.userId, 
      req.creditReservation.featureName, 
      req.creditReservation.cost, 
      {
        creditsBefore: req.creditReservation.creditsBefore,
        creditsAfter,
        endpoint: req.path,
        method: req.method,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent')?.substring(0, 100),
        source: req.get('X-Source') || 'extension'
      }
    ).catch(err => logger.warn('Failed to log credit usage', { error: err.message }));
    
    // Mark as deducted
    req.creditReservation.deducted = true;
    req.creditCost = req.creditReservation.cost;
    req.creditsBefore = req.creditReservation.creditsBefore;
    req.creditsAfter = creditsAfter;
    
    logger.info('Credits deducted after success', { 
      userId: req.creditReservation.userId, 
      feature: req.creditReservation.featureName, 
      cost: req.creditReservation.cost,
      creditsAfter
    });
    
    return { creditsAfter, cost: req.creditReservation.cost };
  } catch (deductError) {
    logger.error('Failed to deduct credits after success', { 
      error: deductError.message,
      userId: req.creditReservation.userId
    });
    return false;
  }
}

/**
 * Reserve credits before processing (soft lock)
 * Credits are only actually deducted after successful response
 */
function requireCredits(featureName, costCalculator) {
  return async (req, res, next) => {
    const lang = getLanguage(req);
    
    try {
      // Try multiple sources for userId:
      // 1. req.userId from auth middleware (most reliable)
      // 2. req.body.user_id from request body
      // 3. req.query.user_id from query params
      const userId = req.userId || req.body.user_id || req.query.user_id;
      
      logger.info('Credit middleware started', { 
        featureName, 
        userId: userId ? 'present' : 'missing',
        source: req.userId ? 'auth_middleware' : (req.body.user_id ? 'body' : 'query'),
        hasBody: !!req.body,
        bodyKeys: req.body ? Object.keys(req.body) : []
      });
      
      if (!userId) {
        logger.warn('Credit middleware: user_id missing from all sources', { 
          featureName,
          hasReqUserId: !!req.userId,
          hasBodyUserId: !!req.body.user_id,
          hasQueryUserId: !!req.query.user_id
        });
        return res.status(401).json({ 
          success: false,
          error: localization.translate('errors.unauthorized', lang),
          code: 'USER_ID_REQUIRED'
        });
      }
      
      // Calculate cost based on request
      let cost;
      try {
        cost = costCalculator(req);
      } catch (costError) {
        logger.error('Credit middleware: cost calculation failed', { 
          featureName, 
          error: costError.message 
        });
        throw costError;
      }
      
      // Check if user has enough credits (but don't deduct yet!)
      logger.info('Credit middleware: checking credits', { featureName, userId, cost });
      let hasEnough;
      try {
        hasEnough = await creditService.hasEnoughCredits(userId, cost);
      } catch (creditCheckError) {
        logger.error('Credit middleware: credit check failed', { 
          featureName, 
          userId,
          error: creditCheckError.message,
          stack: creditCheckError.stack?.substring(0, 300)
        });
        throw creditCheckError;
      }
      
      if (!hasEnough) {
        const credits = await creditService.getUserCredits(userId);
        return res.status(402).json({ 
          success: false,
          error: localization.translate('credits.insufficient', lang, { 
            required: cost, 
            available: credits.balance 
          }),
          code: 'INSUFFICIENT_CREDITS',
          required: cost,
          available: credits.balance,
          shortfall: cost - credits.balance
        });
      }
      
      // Store credit info for later deduction (after successful processing)
      req.creditReservation = {
        userId,
        cost,
        featureName,
        creditsBefore: (await creditService.getUserCredits(userId)).balance,
        reserved: true,
        deducted: false,
        streamingSuccess: false, // Track if streaming completed successfully
        streamingStarted: false
      };
      
      // Expose commit function for streaming endpoints to call manually
      req.commitCredits = () => commitCreditDeduction(req);
      
      // Override res.json to intercept successful responses and deduct credits
      const originalJson = res.json.bind(res);
      res.json = async function(data) {
        // Only deduct credits if response is successful
        if (data && data.success !== false && req.creditReservation && !req.creditReservation.deducted) {
          const result = await commitCreditDeduction(req);
          if (result) {
            // Add credit info to response
            data.credits_used = result.cost;
            data.credits_remaining = result.creditsAfter;
          }
        } else if (data && data.success === false) {
          // Log that credits were NOT deducted due to failure
          logger.info('Credits NOT deducted - request failed', { 
            userId: req.creditReservation?.userId, 
            feature: req.creditReservation?.featureName,
            error: data.error
          });
        }
        
        return originalJson(data);
      };
      
      // Override res.write to track streaming
      const originalWrite = res.write.bind(res);
      res.write = function(chunk, encoding, callback) {
        if (req.creditReservation) {
          req.creditReservation.streamingStarted = true;
          
          // Check if this is a [DONE] marker (SSE completion)
          const chunkStr = chunk?.toString() || '';
          if (chunkStr.includes('[DONE]')) {
            req.creditReservation.streamingSuccess = true;
          }
          // Check for error in stream
          if (chunkStr.includes('"error"')) {
            req.creditReservation.streamingSuccess = false;
          }
        }
        return originalWrite(chunk, encoding, callback);
      };
      
      // Override res.end to deduct credits for successful streaming
      const originalEnd = res.end.bind(res);
      res.end = async function(chunk, encoding, callback) {
        // For streaming responses, deduct credits if streaming completed successfully
        if (req.creditReservation && 
            req.creditReservation.streamingStarted && 
            req.creditReservation.streamingSuccess && 
            !req.creditReservation.deducted) {
          await commitCreditDeduction(req);
        } else if (req.creditReservation && 
                   req.creditReservation.streamingStarted && 
                   !req.creditReservation.streamingSuccess) {
          logger.info('Credits NOT deducted - streaming failed or incomplete', { 
            userId: req.creditReservation?.userId, 
            feature: req.creditReservation?.featureName
          });
        }
        
        return originalEnd(chunk, encoding, callback);
      };
      
      logger.info('Credits reserved', { 
        userId, 
        feature: featureName, 
        cost, 
        creditsBefore: req.creditReservation.creditsBefore 
      });
      
      next();
    } catch (error) {
      logger.error('Credit middleware error', { 
        featureName,
        error: error.message,
        stack: error.stack?.substring(0, 500)
      });
      
      if (error.message === 'Insufficient credits') {
        return res.status(402).json({ 
          success: false,
          error: localization.translate('errors.insufficient_credits', lang),
          code: 'INSUFFICIENT_CREDITS'
        });
      }
      
      return res.status(500).json({ 
        success: false,
        error: localization.translate('errors.server_error', lang),
        code: 'CREDIT_MIDDLEWARE_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
}

/**
 * Cost calculators for different features
 */
const costCalculators = {
  // === Detection ===
  aiDetection: (req) => {
    const { text } = req.body;
    return creditService.calculateAIDetectionCost(text);
  },
  
  // === Analysis ===
  textAnalysis: (req) => {
    const { text } = req.body;
    return creditService.calculateAnalysisCost(text);
  },
  
  improvementSuggestions: (req) => {
    const { sentence } = req.body;
    // Updated: Dec 2025 - now uses word count for fair pricing
    return creditService.calculateSuggestionsCost(sentence || '');
  },
  
  // === Rewrite & Humanization ===
  textRewrite: (req) => {
    const { text, model } = req.body;
    return creditService.calculateRewriteCost(text, model);
  },
  
  checkHumanization: (req) => {
    const { text } = req.body;
    return creditService.calculateCheckHumanizationCost(text);
  },
  
  iterativeHumanize: (req) => {
    const { text, actual_iterations, max_iterations = 3 } = req.body;
    // Updated: Dec 2025 - use actual_iterations if available, otherwise estimate with 1
    // Actual cost will be recalculated after job completion based on real iterations
    const iterations = actual_iterations || 1;
    return creditService.calculateIterativeHumanizeCost(text, iterations);
  },
  
  // === Chat ===
  chatMessage: (req) => {
    const { messages, model } = req.body;
    const lastMessage = messages[messages.length - 1];
    return creditService.calculateChatCost(lastMessage.content, model);
  },
  
  chatHumanized: (req) => {
    const { messages, model } = req.body;
    const lastMessage = messages[messages.length - 1];
    return creditService.calculateHumanizedChatCost(lastMessage.content, model);
  },
  
  conversationSummarize: (req) => {
    const { messages } = req.body;
    return creditService.calculateSummarizeCost(messages?.length || 0);
  },
  
  // === Profile Operations ===
  profileSampleAdd: (req) => {
    const { text } = req.body;
    return creditService.calculateProfileSampleCost(text);
  },
  
  profileSamplesBatch: (req) => {
    const { samples } = req.body;
    return creditService.calculateProfileBatchCost(samples || []);
  },
  
  profileFinalize: (req) => {
    // Estimate based on typical sample count (will be refined in controller)
    return creditService.calculateVoiceProfileCost(5);
  },
  
  profileComplete: (req) => {
    const { samples } = req.body;
    if (!samples || !Array.isArray(samples)) {
      logger.warn('[CREDIT] Invalid samples in profileComplete cost calculation:', typeof samples);
      return 0; // Will be caught by controller validation
    }
    return creditService.calculateProfileCompleteCost(samples);
  },
  
  // === Translation ===
  translation: (req) => {
    const { text } = req.body;
    return creditService.calculateTranslationCost(text);
  },
  
  // === File Upload ===
  fileUpload: (req) => {
    const { mimeType } = req.body;
    return creditService.calculateFileUploadCost(mimeType);
  }
};

/**
 * Middleware factory for different features
 */
const creditMiddleware = {
  // Detection
  aiDetection: requireCredits('ai_detection', costCalculators.aiDetection),
  
  // Analysis
  textAnalysis: requireCredits('text_analysis', costCalculators.textAnalysis),
  improvementSuggestions: requireCredits('improvement_suggestions', costCalculators.improvementSuggestions),
  
  // Rewrite & Humanization
  textRewrite: requireCredits('text_rewrite', costCalculators.textRewrite),
  checkHumanization: requireCredits('check_humanization', costCalculators.checkHumanization),
  iterativeHumanize: requireCredits('iterative_humanize', costCalculators.iterativeHumanize),
  
  // Chat
  chatMessage: requireCredits('chat_message', costCalculators.chatMessage),
  chatHumanized: requireCredits('chat_humanized', costCalculators.chatHumanized),
  conversationSummarize: requireCredits('conversation_summarize', costCalculators.conversationSummarize),
  
  // Profile
  profileSampleAdd: requireCredits('profile_sample_add', costCalculators.profileSampleAdd),
  profileSamplesBatch: requireCredits('profile_samples_batch', costCalculators.profileSamplesBatch),
  profileFinalize: requireCredits('voice_profile_generation', costCalculators.profileFinalize),
  profileComplete: requireCredits('profile_complete', costCalculators.profileComplete),
  
  // Translation
  translation: requireCredits('translation', costCalculators.translation),
  
  // File Upload
  fileUpload: requireCredits('file_upload_image', costCalculators.fileUpload)
};

module.exports = creditMiddleware;
