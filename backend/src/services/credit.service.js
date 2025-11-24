/**
 * Credit Service
 * Manages user credits, transactions, and usage tracking
 */

const { db, FieldValue } = require('../config/firebase');
const { 
  calculateFeatureCost, 
  countWords, 
  countSentences,
  SUBSCRIPTION_PLANS 
} = require('../config/pricing');
const logger = require('../utils/logger');

// ============================================================================
// CREDIT BALANCE OPERATIONS
// ============================================================================

/**
 * Get user's current credit balance
 */
async function getUserCredits(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const credits = userData.credits || {
      balance: 0,
      monthly: 0,
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
    
    logger.info('Credits deducted', { userId, amount, featureName });
    
    return true;
  } catch (error) {
    logger.error('Error deducting credits', { userId, amount, error: error.message });
    throw error;
  }
}

/**
 * Add credits to user balance
 */
async function addCredits(userId, amount, source, metadata = {}) {
  try {
    const userRef = db.collection('users').doc(userId);
    
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const currentBalance = userData.credits?.balance || 0;
      
      // Determine which credit pool to increment
      const updateData = {
        'credits.balance': FieldValue.increment(amount)
      };
      
      if (source === 'subscription') {
        updateData['credits.monthly'] = FieldValue.increment(amount);
      } else if (source === 'purchase') {
        updateData['credits.purchased'] = FieldValue.increment(amount);
      }
      
      transaction.update(userRef, updateData);
      
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
function calculateAIDetectionCost(text, userPlan = 'free') {
  const wordCount = countWords(text);
  const plan = SUBSCRIPTION_PLANS[userPlan];
  
  return calculateFeatureCost('ai_detection', {
    wordCount,
    discount: plan?.discount
  });
}

/**
 * Calculate cost for text analysis
 */
function calculateAnalysisCost(text, userPlan = 'free') {
  const wordCount = countWords(text);
  const sentenceCount = countSentences(text);
  const plan = SUBSCRIPTION_PLANS[userPlan];
  
  return calculateFeatureCost('text_analysis', {
    wordCount,
    sentenceCount,
    discount: plan?.discount
  });
}

/**
 * Calculate cost for text rewriting
 */
function calculateRewriteCost(text, model = 'gemini-2.0-flash-exp', userPlan = 'free') {
  const wordCount = countWords(text);
  const plan = SUBSCRIPTION_PLANS[userPlan];
  
  return calculateFeatureCost('text_rewrite', {
    wordCount,
    model,
    discount: plan?.discount
  });
}

/**
 * Calculate cost for improvement suggestions
 */
function calculateSuggestionsCost(sentenceCount, userPlan = 'free') {
  const plan = SUBSCRIPTION_PLANS[userPlan];
  
  return calculateFeatureCost('improvement_suggestions', {
    sentenceCount,
    discount: plan?.discount
  });
}

/**
 * Calculate cost for chat message
 */
function calculateChatCost(text, model = 'gemini-2.0-flash-exp', userPlan = 'free') {
  const wordCount = countWords(text);
  const plan = SUBSCRIPTION_PLANS[userPlan];
  
  return calculateFeatureCost('chat_message', {
    wordCount,
    model,
    discount: plan?.discount
  });
}

/**
 * Calculate cost for voice profile generation
 */
function calculateVoiceProfileCost(sampleCount, userPlan = 'free') {
  const plan = SUBSCRIPTION_PLANS[userPlan];
  
  return calculateFeatureCost('voice_profile_generation', {
    sampleCount,
    discount: plan?.discount
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

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Reset monthly credits for subscription users
 */
async function resetMonthlyCredits(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const planName = userData.subscription?.plan || 'free';
    const plan = SUBSCRIPTION_PLANS[planName];
    
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }
    
    // Add monthly credits
    await addCredits(userId, plan.monthlyCredits, 'subscription', {
      plan: planName,
      resetDate: new Date().toISOString()
    });
    
    // Update last reset date
    await db.collection('users').doc(userId).update({
      'subscription.lastReset': new Date().toISOString()
    });
    
    logger.info('Monthly credits reset', { userId, plan: planName, credits: plan.monthlyCredits });
    
    return true;
  } catch (error) {
    logger.error('Error resetting monthly credits', { userId, error: error.message });
    throw error;
  }
}

/**
 * Check if user needs monthly credit reset
 */
async function checkAndResetMonthlyCredits(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return false;
    }
    
    const userData = userDoc.data();
    const lastReset = userData.subscription?.lastReset;
    
    if (!lastReset) {
      // First time - reset now
      await resetMonthlyCredits(userId);
      return true;
    }
    
    const lastResetDate = new Date(lastReset);
    const now = new Date();
    
    // Check if a month has passed
    const monthsPassed = (now.getFullYear() - lastResetDate.getFullYear()) * 12 
                       + (now.getMonth() - lastResetDate.getMonth());
    
    if (monthsPassed >= 1) {
      await resetMonthlyCredits(userId);
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Error checking monthly reset', { userId, error: error.message });
    return false;
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
  getUserUsageStats,
  resetMonthlyCredits,
  checkAndResetMonthlyCredits
};
