/**
 * Realtime Events Service
 * Listens to Firestore realtime_events collection and broadcasts via SSE
 * 
 * This replaces the complex HTTP API approach with simple Firestore listeners.
 * Admin backend writes to realtime_events -> This service broadcasts to connected users
 */

const { db } = require('../config/firebase');
const logger = require('../utils/logger');

// Reference to realtime controller (set during initialization)
let realtimeController = null;

// Track processed events to avoid duplicates
const processedEvents = new Set();
const MAX_PROCESSED_CACHE = 1000;

// Unsubscribe function for cleanup
let unsubscribe = null;

/**
 * Initialize the realtime events listener
 * @param {object} controller - The realtime controller with broadcast methods
 */
function initialize(controller) {
  if (unsubscribe) {
    logger.info('[RealtimeEvents] Already initialized, skipping');
    return;
  }

  realtimeController = controller;
  
  // Listen to realtime_events collection for new events
  // Only listen to events created in the last minute to avoid processing old events on restart
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  
  unsubscribe = db.collection('realtime_events')
    .where('createdAt', '>=', oneMinuteAgo)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const event = { id: change.doc.id, ...change.doc.data() };
            processEvent(event);
          }
        });
      },
      (error) => {
        logger.error('[RealtimeEvents] Listener error', { error: error.message });
        // Try to reconnect after 5 seconds
        setTimeout(() => {
          unsubscribe = null;
          initialize(realtimeController);
        }, 5000);
      }
    );

  logger.info('[RealtimeEvents] Listener initialized');
  
  // Cleanup old events periodically (every 5 minutes)
  setInterval(cleanupOldEvents, 5 * 60 * 1000);
}

/**
 * Process a realtime event and broadcast to user
 */
async function processEvent(event) {
  // Skip if already processed
  if (processedEvents.has(event.id)) {
    return;
  }

  // Add to processed cache
  processedEvents.add(event.id);
  
  // Limit cache size
  if (processedEvents.size > MAX_PROCESSED_CACHE) {
    const iterator = processedEvents.values();
    for (let i = 0; i < 100; i++) {
      processedEvents.delete(iterator.next().value);
    }
  }

  const { userId, eventType, data } = event;

  if (!userId || !eventType || !realtimeController) {
    return;
  }

  logger.info('[RealtimeEvents] Processing event', { eventType, userId });

  try {
    let sent = false;

    switch (eventType) {
      case 'credits':
        sent = realtimeController.broadcastCredits(userId, data.credits || data);
        break;

      case 'notification':
        sent = realtimeController.broadcastNotification(userId, data.notification || data);
        break;

      case 'profile':
        sent = realtimeController.broadcastProfileUpdate(userId, data);
        break;

      case 'payment':
        sent = realtimeController.broadcastPayment(userId, data);
        break;

      default:
        logger.warn('[RealtimeEvents] Unknown event type', { eventType });
    }

    // Mark event as processed in Firestore
    await db.collection('realtime_events').doc(event.id).update({
      processed: true,
      processedAt: new Date(),
      sent
    });

  } catch (error) {
    logger.error('[RealtimeEvents] Error processing event', { 
      eventId: event.id, 
      error: error.message 
    });
  }
}

/**
 * Cleanup old processed events (older than 1 hour)
 */
async function cleanupOldEvents() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const snapshot = await db.collection('realtime_events')
      .where('processed', '==', true)
      .where('createdAt', '<', oneHourAgo)
      .limit(100)
      .get();

    if (snapshot.empty) return;

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    logger.info('[RealtimeEvents] Cleaned up old events', { count: snapshot.size });
  } catch (error) {
    logger.error('[RealtimeEvents] Cleanup error', { error: error.message });
  }
}

/**
 * Shutdown the listener
 */
function shutdown() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
    logger.info('[RealtimeEvents] Listener shutdown');
  }
}

module.exports = {
  initialize,
  shutdown
};
