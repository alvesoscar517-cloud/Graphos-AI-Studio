/**
 * Credit Controller
 * Handles credit packages purchase
 */

const { db } = require('../config/firebase');
const { CREDIT_PACKAGES } = require('../config/pricing');
const creditService = require('../services/credit.service');
const logger = require('../utils/logger');
const { createLocalizer } = require('../utils/localized-messages.util');

// ============================================================================
// GET CREDIT PACKAGES
// ============================================================================

/**
 * Get all available credit packages
 * Includes first purchase bonus info for eligible users
 */
exports.getCreditPackages = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { user_id } = req.query;
    
    // Check if user is eligible for first purchase bonus
    let isFirstPurchaseEligible = false;
    
    if (user_id) {
      const ordersSnapshot = await db.collection('orders')
        .where('userId', '==', user_id)
        .limit(1)
        .get();
      
      isFirstPurchaseEligible = ordersSnapshot.empty;
    }
    
    const packages = Object.entries(CREDIT_PACKAGES).map(([key, pkg]) => {
      const baseTotal = pkg.credits + pkg.bonus;
      // First purchase: Double the credits (x2)
      const firstPurchaseBonus = isFirstPurchaseEligible ? baseTotal : 0;
      
      return {
        id: key,
        ...pkg,
        totalCredits: baseTotal,
        // First purchase bonus info
        firstPurchaseBonus,
        totalWithFirstPurchase: baseTotal + firstPurchaseBonus
      };
    });
    
    res.json({
      success: true,
      packages,
      isFirstPurchaseEligible,
      language: l.lang
    });
  } catch (error) {
    logger.error('Error getting packages', { error: error.message });
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

// ============================================================================
// CREDIT PURCHASE
// ============================================================================

/**
 * Purchase credit package
 */
exports.purchaseCreditPackage = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { user_id, package_id, payment_method } = req.body;
    
    if (!user_id || !package_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }
    
    const pkg = CREDIT_PACKAGES[package_id];
    
    if (!pkg) {
      return res.status(400).json({ success: false, ...l.error('invalid_input'), details: 'Invalid package_id' });
    }
    
    // NOTE: Payment processing is handled via Lemon Squeezy webhooks
    // This endpoint is called after successful payment confirmation
    // See: payment.controller.js for webhook handling
    
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
      message: l.t('credits.purchase_success', { amount: totalCredits }),
      package: {
        id: package_id,
        ...pkg,
        totalCredits
      },
      creditsAdded: totalCredits,
      language: l.lang
    });
  } catch (error) {
    logger.error('Error purchasing package', { error: error.message });
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

// ============================================================================
// CREDIT BALANCE
// ============================================================================

/**
 * Get user's credit balance
 */
exports.getCreditBalance = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }
    
    const credits = await creditService.getUserCredits(user_id);
    
    res.json({
      success: true,
      credits,
      balance_message: l.t('credits.balance', { amount: credits.balance }),
      language: l.lang
    });
  } catch (error) {
    logger.error('Error getting credit balance', { error: error.message });
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

/**
 * Get credit transaction history
 */
exports.getCreditHistory = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { user_id, limit = 50 } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
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
      transactions,
      language: l.lang
    });
  } catch (error) {
    logger.error('Error getting credit history', { error: error.message });
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

module.exports = exports;
