/**
 * Credit Middleware
 * Validates and deducts credits before processing requests
 */

const creditService = require('../services/credit.service');
const logger = require('../utils/logger');

/**
 * Middleware to check and deduct credits for a feature
 */
function requireCredits(featureName, costCalculator) {
  return async (req, res, next) => {
    try {
      const userId = req.body.user_id || req.query.user_id;
      
      if (!userId) {
        return res.status(401).json({ 
          error: 'User ID required',
          code: 'USER_ID_REQUIRED'
        });
      }
      
      // Check if monthly credits need reset
      await creditService.checkAndResetMonthlyCredits(userId);
      
      // Calculate cost based on request
      const cost = costCalculator(req);
      
      // Check if user has enough credits
      const hasEnough = await creditService.hasEnoughCredits(userId, cost);
      
      if (!hasEnough) {
        const credits = await creditService.getUserCredits(userId);
        return res.status(402).json({ 
          error: 'Insufficient credits',
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
          error: 'Insufficient credits',
          code: 'INSUFFICIENT_CREDITS'
        });
      }
      
      return res.status(500).json({ 
        error: 'Credit validation failed',
        details: error.message
      });
    }
  };
}

/**
 * Cost calculators for different features
 */
const costCalculators = {
  aiDetection: (req) => {
    const { text } = req.body;
    const userPlan = req.user?.subscription?.plan || 'free';
    return creditService.calculateAIDetectionCost(text, userPlan);
  },
  
  textAnalysis: (req) => {
    const { text } = req.body;
    const userPlan = req.user?.subscription?.plan || 'free';
    return creditService.calculateAnalysisCost(text, userPlan);
  },
  
  textRewrite: (req) => {
    const { text, model } = req.body;
    const userPlan = req.user?.subscription?.plan || 'free';
    return creditService.calculateRewriteCost(text, model, userPlan);
  },
  
  improvementSuggestions: (req) => {
    const { sentence } = req.body;
    const userPlan = req.user?.subscription?.plan || 'free';
    // Estimate 1 sentence
    return creditService.calculateSuggestionsCost(1, userPlan);
  },
  
  chatMessage: (req) => {
    const { messages, model } = req.body;
    const lastMessage = messages[messages.length - 1];
    const userPlan = req.user?.subscription?.plan || 'free';
    return creditService.calculateChatCost(lastMessage.content, model, userPlan);
  }
};

/**
 * Middleware factory for different features
 */
const creditMiddleware = {
  aiDetection: requireCredits('ai_detection', costCalculators.aiDetection),
  textAnalysis: requireCredits('text_analysis', costCalculators.textAnalysis),
  textRewrite: requireCredits('text_rewrite', costCalculators.textRewrite),
  improvementSuggestions: requireCredits('improvement_suggestions', costCalculators.improvementSuggestions),
  chatMessage: requireCredits('chat_message', costCalculators.chatMessage)
};

module.exports = creditMiddleware;
