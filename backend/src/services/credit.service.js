/**
 * Credit Service
 * Manages user credits, transactions, and usage tracking
 */

const { db, FieldValue } = require('../config/firebase');
const { 
  calculateFeatureCost, 
  countWords, 
  countSentences
} = require('../config/pricing');
const logger = require('../utils/logger');

// Lazy load realtime controller to avoid circular dependency
let realtimeController = null;
const getRealtimeController = () => {
  if (!realtimeController) {
    realtimeController = require('../controllers/realtime.controller');
  }
  return realtimeController;
};

// ============================================================================
// CREDIT BALANCE OPERATIONS
// ============================================================================

/**
 * Default credits for new users
 */
const DEFAULT_NEW_USER_CREDITS = 10;

/**
 * Get user's current credit balance
 * Auto-creates user with default credits if not exists
 */
async function getUserCredits(userId) {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    // Auto-create user with default credits if not exists
    if (!userDoc.exists) {
      const defaultCredits = {
        balance: DEFAULT_NEW_USER_CREDITS,
        purchased: 0,
        used: 0,
        bonus: DEFAULT_NEW_USER_CREDITS
      };
      
      await userRef.set({
        userId,
        credits: defaultCredits,
        createdAt: new Date().toISOString(),
        usage: {
          lastActivity: new Date().toISOString()
        }
      });
      
      logger.info('New user created with default credits', { userId, credits: DEFAULT_NEW_USER_CREDITS });
      
      return defaultCredits;
    }
    
    const userData = userDoc.data();
    const credits = userData.credits || {
      balance: 0,
      purchased: 0,
      used: 0
    };
    
    return credits;
  } catch (error) {
    logger.error('Error getting user credits', { userId, error: error.message });
    throw error;
  }
}

/**
 * Check if user has enough credits
 */
async function hasEnoughCredits(userId, requiredCredits) {
  const credits = await getUserCredits(userId);
  return credits.balance >= requiredCredits;
}

/**
 * Deduct credits from user balance
 */
async function deductCredits(userId, amount, featureName, metadata = {}) {
  try {
    const userRef = db.collection('users').doc(userId);
    
    // Use transaction to ensure atomic operation
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const currentBalance = userData.credits?.balance || 0;
      
      if (currentBalance < amount) {
        throw new Error('Insufficient credits');
      }
      
      // Deduct from balance and increment used
      transaction.update(userRef, {
        'credits.balance': FieldValue.increment(-amount),
        'credits.used': FieldValue.increment(amount),
        'usage.lastActivity': new Date().toISOString()
      });
      
      // Log transaction
      const transactionRef = db.collection('credit_transactions').doc();
      transaction.set(transactionRef, {
        userId,
        type: 'deduction',
        amount: -amount,
        feature: featureName,
        metadata,
        timestamp: new Date().toISOString(),
        balanceAfter: currentBalance - amount
      });
    });
    
    // Get updated balance and broadcast via SSE
    const updatedCredits = await getUserCredits(userId);
    getRealtimeController().broadcastCredits(userId, updatedCredits);
    
    logger.info('Credits deducted', { userId, amount, featureName });
    
    return true;
  } catch (error) {
    logger.error('Error deducting credits', { userId, amount, error: error.message });
    throw error;
  }
}

/**
 * Add credits to user balance
 * Auto-creates user if not exists
 */
async function addCredits(userId, amount, source, metadata = {}) {
  try {
    const userRef = db.collection('users').doc(userId);
    
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      let currentBalance = 0;
      
      if (!userDoc.exists) {
        // Create new user with the credits being added
        transaction.set(userRef, {
          userId,
          credits: {
            balance: amount,
            purchased: amount,
            used: 0
          },
          createdAt: new Date().toISOString(),
          usage: {
            lastActivity: new Date().toISOString()
          }
        });
      } else {
        const userData = userDoc.data();
        currentBalance = userData.credits?.balance || 0;
        
        // Update credit balance
        const updateData = {
          'credits.balance': FieldValue.increment(amount),
          'credits.purchased': FieldValue.increment(amount)
        };
        
        transaction.update(userRef, updateData);
      }
      
      // Log transaction
      const transactionRef = db.collection('credit_transactions').doc();
      transaction.set(transactionRef, {
        userId,
        type: 'addition',
        amount,
        source,
        metadata,
        timestamp: new Date().toISOString(),
        balanceAfter: currentBalance + amount
      });
    });
    
    // Get updated balance and broadcast via SSE
    const updatedCredits = await getUserCredits(userId);
    getRealtimeController().broadcastCredits(userId, updatedCredits);
    
    logger.info('Credits added', { userId, amount, source });
    
    return true;
  } catch (error) {
    logger.error('Error adding credits', { userId, amount, error: error.message });
    throw error;
  }
}

// ============================================================================
// FEATURE COST CALCULATION
// ============================================================================

/**
 * Calculate cost for AI detection
 */
function calculateAIDetectionCost(text) {
  const wordCount = countWords(text);
  
  return calculateFeatureCost('ai_detection', {
    wordCount
  });
}

/**
 * Calculate cost for text analysis
 */
function calculateAnalysisCost(text) {
  const wordCount = countWords(text);
  const sentenceCount = countSentences(text);
  
  return calculateFeatureCost('text_analysis', {
    wordCount,
    sentenceCount
  });
}

/**
 * Calculate cost for text rewriting
 */
function calculateRewriteCost(text, model = 'gemini-2.0-flash-exp') {
  const wordCount = countWords(text);
  
  return calculateFeatureCost('text_rewrite', {
    wordCount,
    model
  });
}

/**
 * Calculate cost for improvement suggestions
 */
function calculateSuggestionsCost(sentenceCount) {
  return calculateFeatureCost('improvement_suggestions', {
    sentenceCount
  });
}

/**
 * Calculate cost for chat message
 */
function calculateChatCost(text, model = 'gemini-2.0-flash-exp') {
  const wordCount = countWords(text);
  
  return calculateFeatureCost('chat_message', {
    wordCount,
    model
  });
}

/**
 * Calculate cost for voice profile generation
 */
function calculateVoiceProfileCost(sampleCount) {
  return calculateFeatureCost('voice_profile_generation', {
    sampleCount
  });
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

/**
 * Track feature usage
 */
async function trackFeatureUsage(userId, featureName, cost, metadata = {}) {
  try {
    const usageRef = db.collection('feature_usage').doc();
    
    await usageRef.set({
      userId,
      feature: featureName,
      cost,
      metadata,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0] // For daily aggregation
    });
    
    // Update user's feature usage counter
    await db.collection('users').doc(userId).update({
      [`usage.${featureName}Count`]: FieldValue.increment(1),
      'usage.lastActivity': new Date().toISOString()
    });
    
    logger.info('Feature usage tracked', { userId, featureName, cost });
  } catch (error) {
    logger.error('Error tracking usage', { userId, featureName, error: error.message });
    // Don't throw - tracking failure shouldn't block the operation
  }
}

/**
 * Get user's usage statistics
 */
async function getUserUsageStats(userId, days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    const usageSnapshot = await db.collection('feature_usage')
      .where('userId', '==', userId)
      .where('date', '>=', startDateStr)
      .get();
    
    const stats = {
      totalCost: 0,
      featureBreakdown: {},
      dailyUsage: {}
    };
    
    usageSnapshot.forEach(doc => {
      const data = doc.data();
      
      stats.totalCost += data.cost;
      
      // Feature breakdown
      if (!stats.featureBreakdown[data.feature]) {
        stats.featureBreakdown[data.feature] = {
          count: 0,
          totalCost: 0
        };
      }
      stats.featureBreakdown[data.feature].count++;
      stats.featureBreakdown[data.feature].totalCost += data.cost;
      
      // Daily usage
      if (!stats.dailyUsage[data.date]) {
        stats.dailyUsage[data.date] = 0;
      }
      stats.dailyUsage[data.date] += data.cost;
    });
    
    return stats;
  } catch (error) {
    logger.error('Error getting usage stats', { userId, error: error.message });
    throw error;
  }
}

module.exports = {
  getUserCredits,
  hasEnoughCredits,
  deductCredits,
  addCredits,
  calculateAIDetectionCost,
  calculateAnalysisCost,
  calculateRewriteCost,
  calculateSuggestionsCost,
  calculateChatCost,
  calculateVoiceProfileCost,
  trackFeatureUsage,
  getUserUsageStats
};
