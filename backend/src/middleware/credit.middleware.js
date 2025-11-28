/**
 * Credit Middleware
 * Validates and deducts credits before processing requests
 */

const creditService = require('../services/credit.service');
const logger = require('../utils/logger');
const localization = require('../services/localization.service');
const { getLanguage } = require('./language.middleware');

/**
 * Middleware to check and deduct credits for a feature
 */
function requireCredits(featureName, costCalculator) {
  return async (req, res, next) => {
    const lang = getLanguage(req);
    
    try {
      const userId = req.body.user_id || req.query.user_id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: localization.translate('errors.unauthorized', lang),
          code: 'USER_ID_REQUIRED'
        });
      }
      
      // Calculate cost based on request
      const cost = costCalculator(req);
      
      // Check if user has enough credits
      const hasEnough = await creditService.hasEnoughCredits(userId, cost);
      
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
      
      // Deduct credits
      await creditService.deductCredits(userId, cost, featureName, {
        endpoint: req.path,
        method: req.method
      });
      
      // Track usage
      await creditService.trackFeatureUsage(userId, featureName, cost, {
        endpoint: req.path
      });
      
      // Attach cost info to request for response
      req.creditCost = cost;
      
      logger.info('Credits deducted', { userId, feature: featureName, cost });
      
      next();
    } catch (error) {
      logger.error('Credit middleware error', { error: error.message });
      
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
        details: error.message
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
    return creditService.calculateSuggestionsCost(1);
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
    const { text, max_iterations = 3 } = req.body;
    return creditService.calculateIterativeHumanizeCost(text, max_iterations);
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
    return creditService.calculateProfileCompleteCost(samples || []);
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
