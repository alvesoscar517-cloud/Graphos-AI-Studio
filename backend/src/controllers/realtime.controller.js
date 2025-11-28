/**
 * Realtime Controller
 * Unified SSE endpoint for all real-time updates
 * 
 * Handles:
 * - Credits balance changes
 * - Payment notifications  
 * - Profile updates
 * - System notifications
 */

const { db } = require('../config/firebase');
const logger = require('../utils/logger');
const { createLocalizer } = require('../utils/localized-messages.util');

// Store active SSE connections by userId
const activeConnections = new Map();

/**
 * Get all connections for a user
 */
const getUserConnections = (userId) => {
  if (!activeConnections.has(userId)) {
    activeConnections.set(userId, new Set());
  }
  return activeConnections.get(userId);
};

/**
 * Broadcast event to user's SSE connections
 */
const broadcastToUser = (userId, eventType, data) => {
  const connections = activeConnections.get(userId);
  if (!connections || connections.size === 0) {
    return false;
  }

  const eventData = JSON.stringify(data);
  let sent = 0;

  connections.forEach(res => {
    try {
      res.write(`event: ${eventType}\ndata: ${eventData}\n\n`);
      sent++;
    } catch (e) {
      logger.error('Failed to send SSE event', { userId, eventType, error: e.message });
    }
  });

  logger.info('Broadcasted event', { userId, eventType, connections: sent });
  return sent > 0;
};

/**
 * SSE endpoint - single connection for all real-time updates
 */
exports.events = async (req, res) => {
  const l = createLocalizer(req);
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, ...l.error('invalid_input') });
  }

  // Setup SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send connection confirmation
  res.write(`event: connected\ndata: ${JSON.stringify({ 
    userId, 
    timestamp: Date.now(),
    events: ['credits', 'payment', 'notification', 'profile']
  })}\n\n`);

  // Store connection
  getUserConnections(userId).add(res);
  logger.info('SSE connection opened', { userId, total: getUserConnections(userId).size });

  // Send initial credits balance
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const credits = userDoc.data().credits;
      if (credits) {
        res.write(`event: credits\ndata: ${JSON.stringify({
          type: 'initial',
          credits: {
            balance: credits.balance || 0,
            used: credits.used || 0,
            purchased: credits.purchased || 0
          }
        })}\n\n`);
      }
    }
  } catch (e) {
    logger.error('Failed to send initial credits', { userId, error: e.message });
  }

  // Heartbeat every 30s
  const heartbeat = setInterval(() => {
    try {
      res.write(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`);
    } catch (e) {
      clearInterval(heartbeat);
    }
  }, 30000);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    const connections = activeConnections.get(userId);
    if (connections) {
      connections.delete(res);
      if (connections.size === 0) {
        activeConnections.delete(userId);
      }
    }
    logger.info('SSE connection closed', { userId });
  });
};

/**
 * Broadcast credits update to user
 */
exports.broadcastCredits = (userId, credits) => {
  return broadcastToUser(userId, 'credits', {
    type: 'update',
    credits: {
      balance: credits.balance || 0,
      used: credits.used || 0,
      purchased: credits.purchased || 0
    },
    timestamp: Date.now()
  });
};

/**
 * Broadcast payment event to user
 */
exports.broadcastPayment = (userId, paymentData) => {
  return broadcastToUser(userId, 'payment', {
    type: paymentData.type || 'order_created',
    order: paymentData.order,
    credits: paymentData.credits,
    timestamp: Date.now()
  });
};

/**
 * Broadcast notification to user
 */
exports.broadcastNotification = (userId, notification) => {
  return broadcastToUser(userId, 'notification', {
    type: 'new',
    notification,
    timestamp: Date.now()
  });
};

/**
 * Broadcast profile update to user
 */
exports.broadcastProfileUpdate = (userId, profileData) => {
  return broadcastToUser(userId, 'profile', {
    type: profileData.type || 'updated',
    profile: profileData.profile,
    timestamp: Date.now()
  });
};

/**
 * Get connection stats (for monitoring)
 */
exports.getStats = (req, res) => {
  const stats = {
    totalUsers: activeConnections.size,
    totalConnections: 0,
    users: []
  };

  activeConnections.forEach((connections, userId) => {
    stats.totalConnections += connections.size;
    stats.users.push({ userId, connections: connections.size });
  });

  res.json({ success: true, stats });
};

module.exports = exports;
