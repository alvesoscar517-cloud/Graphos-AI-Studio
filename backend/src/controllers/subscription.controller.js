/**
 * Subscription Controller
 * Handles subscription plans and credit packages
 */

const { db, FieldValue } = require('../config/firebase');
const { SUBSCRIPTION_PLANS, CREDIT_PACKAGES } = require('../config/pricing');
const creditService = require('../services/credit.service');
const logger = require('../utils/logger');

// ============================================================================
// GET PLANS & PACKAGES
// ============================================================================

/**
 * Get all available subscription plans
 */
exports.getPlans = async (req, res) => {
  try {
    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
      id: key,
      ...plan
    }));
    
    res.json({
      success: true,
      plans
    });
  } catch (error) {
    logger.error('Error getting plans', { error: error.message });
    res.status(500).json({ error: 'Failed to get plans' });
  }
};

/**
 * Get all available credit packages
 */
exports.getCreditPackages = async (req, res) => {
  try {
    const packages = Object.entries(CREDIT_PACKAGES).map(([key, pkg]) => ({
      id: key,
      ...pkg,
      totalCredits: pkg.credits + pkg.bonus
    }));
    
    res.json({
      success: true,
      packages
    });
  } catch (error) {
    logger.error('Error getting packages', { error: error.message });
    res.status(500).json({ error: 'Failed to get packages' });
  }
};

// ============================================================================
// USER SUBSCRIPTION
// ============================================================================

/**
 * Get user's current subscription
 */
exports.getUserSubscription = async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }
    
    const userDoc = await db.collection('users').doc(user_id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    const subscription = userData.subscription || {
      plan: 'free',
      status: 'active',
      startDate: new Date().toISOString()
    };
    
    const credits = await creditService.getUserCredits(user_id);
    const usageStats = await creditService.getUserUsageStats(user_id, 30);
    
    const planDetails = SUBSCRIPTION_PLANS[subscription.plan];
    
    res.json({
      success: true,
      subscription: {
        ...subscription,
        planDetails
      },
      credits,
      usage: usageStats
    });
  } catch (error) {
    logger.error('Error getting subscription', { error: error.message });
    res.status(500).json({ error: 'Failed to get subscription' });
  }
};

/**
 * Upgrade/Change subscription plan
 */
exports.upgradePlan = async (req, res) => {
  try {
    const { user_id, plan_id, payment_method } = req.body;
    
    if (!user_id || !plan_id) {
      return res.status(400).json({ error: 'user_id and plan_id are required' });
    }
    
    const plan = SUBSCRIPTION_PLANS[plan_id];
    
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan_id' });
    }
    
    // TODO: Process payment with payment_method
    // For now, we'll simulate successful payment
    
    const userRef = db.collection('users').doc(user_id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    const oldPlan = userData.subscription?.plan || 'free';
    
    // Update subscription
    await userRef.update({
      'subscription.plan': plan_id,
      'subscription.status': 'active',
      'subscription.startDate': new Date().toISOString(),
      'subscription.lastReset': new Date().toISOString(),
      'subscription.paymentMethod': payment_method || 'card'
    });
    
    // Add monthly credits
    await creditService.addCredits(user_id, plan.monthlyCredits, 'subscription', {
      plan: plan_id,
      upgrade: true,
      oldPlan
    });
    
    // Add signup bonus if applicable
    if (plan.bonus?.signup_credits && oldPlan === 'free') {
      await creditService.addCredits(user_id, plan.bonus.signup_credits, 'bonus', {
        type: 'signup_bonus',
        plan: plan_id
      });
    }
    
    logger.info('Plan upgraded', { user_id, oldPlan, newPlan: plan_id });
    
    res.json({
      success: true,
      message: `Successfully upgraded to ${plan.name}`,
      subscription: {
        plan: plan_id,
        planDetails: plan
      },
      creditsAdded: plan.monthlyCredits + (plan.bonus?.signup_credits || 0)
    });
  } catch (error) {
    logger.error('Error upgrading plan', { error: error.message });
    res.status(500).json({ error: 'Failed to upgrade plan' });
  }
};

/**
 * Cancel subscription
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }
    
    const userRef = db.collection('users').doc(user_id);
    
    await userRef.update({
      'subscription.status': 'cancelled',
      'subscription.cancelDate': new Date().toISOString()
    });
    
    logger.info('Subscription cancelled', { user_id });
    
    res.json({
      success: true,
      message: 'Subscription cancelled. You can continue using until the end of billing period.'
    });
  } catch (error) {
    logger.error('Error cancelling subscription', { error: error.message });
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

// ============================================================================
// CREDIT PACKAGES
// ============================================================================

/**
 * Purchase credit package
 */
exports.purchaseCreditPackage = async (req, res) => {
  try {
    const { user_id, package_id, payment_method } = req.body;
    
    if (!user_id || !package_id) {
      return res.status(400).json({ error: 'user_id and package_id are required' });
    }
    
    const pkg = CREDIT_PACKAGES[package_id];
    
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid package_id' });
    }
    
    // TODO: Process payment with payment_method
    // For now, we'll simulate successful payment
    
    const totalCredits = pkg.credits + pkg.bonus;
    
    // Add credits
    await creditService.addCredits(user_id, totalCredits, 'purchase', {
      package: package_id,
      price: pkg.price,
      baseCredits: pkg.credits,
      bonusCredits: pkg.bonus
    });
    
    // Log purchase
    await db.collection('purchases').add({
      userId: user_id,
      type: 'credit_package',
      packageId: package_id,
      amount: pkg.price,
      credits: totalCredits,
      paymentMethod: payment_method || 'card',
      timestamp: new Date().toISOString()
    });
    
    logger.info('Credit package purchased', { user_id, package_id, credits: totalCredits });
    
    res.json({
      success: true,
      message: `Successfully purchased ${totalCredits} credits`,
      package: {
        id: package_id,
        ...pkg,
        totalCredits
      },
      creditsAdded: totalCredits
    });
  } catch (error) {
    logger.error('Error purchasing package', { error: error.message });
    res.status(500).json({ error: 'Failed to purchase package' });
  }
};

// ============================================================================
// CREDIT BALANCE
// ============================================================================

/**
 * Get user's credit balance
 */
exports.getCreditBalance = async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }
    
    const credits = await creditService.getUserCredits(user_id);
    
    res.json({
      success: true,
      credits
    });
  } catch (error) {
    logger.error('Error getting credit balance', { error: error.message });
    res.status(500).json({ error: 'Failed to get credit balance' });
  }
};

/**
 * Get credit transaction history
 */
exports.getCreditHistory = async (req, res) => {
  try {
    const { user_id, limit = 50 } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }
    
    const transactionsSnapshot = await db.collection('credit_transactions')
      .where('userId', '==', user_id)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const transactions = transactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    logger.error('Error getting credit history', { error: error.message });
    res.status(500).json({ error: 'Failed to get credit history' });
  }
};

module.exports = exports;
