/**
 * Credit Controller
 * Handles credit packages purchase
 */

const { db } = require('../config/firebase');
const { CREDIT_PACKAGES } = require('../config/pricing');
const creditService = require('../services/credit.service');
const logger = require('../utils/logger');

// ============================================================================
// GET CREDIT PACKAGES
// ============================================================================

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
// CREDIT PURCHASE
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
