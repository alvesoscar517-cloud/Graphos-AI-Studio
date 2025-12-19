/**
 * Credit Controller
 * Handles credit packages purchase
 */

const { db } = require('../config/firebase');
const { CREDIT_PACKAGES, getCreditPackages } = require('../config/pricing');
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
    
    // Use getCreditPackages() to get latest config from Firestore
    const packages = Object.entries(getCreditPackages()).map(([key, pkg]) => {
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
    
    const pkg = getCreditPackages()[package_id];
    
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
 * Get credit transaction history with filters
 */
exports.getCreditHistory = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { 
      user_id, 
      limit = 50, 
      type, // 'deduction' | 'addition' | 'all'
      feature, // filter by feature name
      start_date, // ISO date string
      end_date, // ISO date string
      cursor // pagination cursor (last doc id)
    } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }
    
    const parsedLimit = parseInt(limit);
    
    // Try with composite index first, fallback to in-memory filtering if index not available
    let transactions = [];
    let hasMore = false;
    
    try {
      // Build query with filters (requires composite indexes)
      let query = db.collection('credit_transactions')
        .where('userId', '==', user_id);
      
      // Filter by type (requires userId + type + timestamp index)
      if (type && type !== 'all') {
        query = query.where('type', '==', type);
      }
      
      // Filter by feature (requires userId + feature + timestamp index)
      if (feature && feature !== 'all') {
        query = query.where('feature', '==', feature);
      }
      
      // Order and limit
      query = query.orderBy('timestamp', 'desc').limit(parsedLimit + 1);
      
      // Pagination cursor
      if (cursor) {
        const cursorDoc = await db.collection('credit_transactions').doc(cursor).get();
        if (cursorDoc.exists) {
          query = query.startAfter(cursorDoc);
        }
      }
      
      const transactionsSnapshot = await query.get();
      
      transactionsSnapshot.docs.forEach((doc, index) => {
        if (index < parsedLimit) {
          transactions.push({
            id: doc.id,
            ...doc.data()
          });
        } else {
          hasMore = true;
        }
      });
    } catch (indexError) {
      // Fallback: fetch all and filter in memory (when composite index not available)
      logger.warn('Credit history index not available, using fallback', { 
        error: indexError.message,
        type,
        feature 
      });
      
      let query = db.collection('credit_transactions')
        .where('userId', '==', user_id)
        .orderBy('timestamp', 'desc')
        .limit(500); // Fetch more to filter in memory
      
      const transactionsSnapshot = await query.get();
      
      let allTransactions = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter in memory
      if (type && type !== 'all') {
        allTransactions = allTransactions.filter(tx => tx.type === type);
      }
      if (feature && feature !== 'all') {
        allTransactions = allTransactions.filter(tx => tx.feature === feature);
      }
      
      // Handle cursor pagination in memory
      if (cursor) {
        const cursorIndex = allTransactions.findIndex(tx => tx.id === cursor);
        if (cursorIndex !== -1) {
          allTransactions = allTransactions.slice(cursorIndex + 1);
        }
      }
      
      // Apply limit
      hasMore = allTransactions.length > parsedLimit;
      transactions = allTransactions.slice(0, parsedLimit);
    }
    
    // Filter by date range (always in memory for simplicity)
    if (start_date || end_date) {
      transactions = transactions.filter(tx => {
        const txDate = new Date(tx.timestamp);
        if (start_date && txDate < new Date(start_date)) return false;
        if (end_date && txDate > new Date(end_date)) return false;
        return true;
      });
    }
    
    // Get next cursor
    const nextCursor = hasMore && transactions.length > 0 
      ? transactions[transactions.length - 1].id 
      : null;
    
    res.json({
      success: true,
      transactions,
      hasMore,
      nextCursor,
      language: l.lang
    });
  } catch (error) {
    logger.error('Error getting credit history', { error: error.message });
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

/**
 * Get credit history summary (stats)
 */
exports.getCreditHistorySummary = async (req, res) => {
  const l = createLocalizer(req);
  
  try {
    const { user_id, days = 30 } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ success: false, ...l.error('invalid_input') });
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Query without timestamp filter first (to avoid index issues)
    // Then filter in memory
    const transactionsSnapshot = await db.collection('credit_transactions')
      .where('userId', '==', user_id)
      .orderBy('timestamp', 'desc')
      .limit(500) // Limit to avoid memory issues
      .get();
    
    // Calculate summary
    const summary = {
      totalTransactions: 0,
      totalDeducted: 0,
      totalAdded: 0,
      byFeature: {},
      byDay: {}
    };
    
    transactionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Parse timestamp - handle both string and Firestore Timestamp
      let txDate;
      if (data.timestamp) {
        if (typeof data.timestamp === 'string') {
          txDate = new Date(data.timestamp);
        } else if (data.timestamp.toDate) {
          txDate = data.timestamp.toDate();
        } else {
          txDate = new Date(data.timestamp);
        }
      }
      
      // Filter by date range in memory
      if (txDate && (txDate < startDate || txDate > endDate)) {
        return; // Skip transactions outside date range
      }
      
      summary.totalTransactions++;
      
      const amount = Math.abs(data.amount || 0);
      
      if (data.type === 'deduction') {
        summary.totalDeducted += amount;
        
        // Group by feature
        const feature = data.feature || 'unknown';
        if (!summary.byFeature[feature]) {
          summary.byFeature[feature] = { count: 0, total: 0 };
        }
        summary.byFeature[feature].count++;
        summary.byFeature[feature].total += amount;
      } else if (data.type === 'addition') {
        summary.totalAdded += amount;
      }
      
      // Group by day
      const day = txDate ? txDate.toISOString().split('T')[0] : 'unknown';
      if (!summary.byDay[day]) {
        summary.byDay[day] = { deducted: 0, added: 0 };
      }
      if (data.type === 'deduction') {
        summary.byDay[day].deducted += amount;
      } else {
        summary.byDay[day].added += amount;
      }
    });
    
    // Round values
    summary.totalDeducted = Math.round(summary.totalDeducted * 100) / 100;
    summary.totalAdded = Math.round(summary.totalAdded * 100) / 100;
    
    res.json({
      success: true,
      summary,
      period: { startDate: startDate.toISOString(), endDate: endDate.toISOString(), days: parseInt(days) },
      language: l.lang
    });
  } catch (error) {
    logger.error('Error getting credit history summary', { error: error.message });
    res.status(500).json({ success: false, ...l.error('server_error') });
  }
};

module.exports = exports;
