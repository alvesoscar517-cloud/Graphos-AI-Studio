/**
 * Activity Logger Middleware
 * Automatically logs user activity when API is called
 * Optimization: Non-blocking request, async logging
 */

const activityLogService = require('../services/activityLog.service');
const logger = require('../utils/logger');

// Map routes to activity types
const ROUTE_ACTIVITY_MAP = {
  // Analysis routes (mounted at /analysis)
  'POST /analysis/authenticate': 'ai_detection',
  'POST /analysis/analyze': 'text_analysis',
  'POST /analysis/suggest-improvements': 'text_analysis',
  'POST /analysis/rewrite': 'text_rewrite',
  'POST /analysis/rewrite-stream': 'text_rewrite',
  'POST /analysis/translate': 'translation',
  'POST /analysis/check-humanization': 'check_humanization',
  'POST /analysis/iterative-humanize': 'iterative_humanize',
  
  // Chat routes (mounted at /api/chat)
  'POST /api/chat': 'chat_message',
  'POST /api/chat/': 'chat_message',
  'POST /api/chat/stream': 'chat_message',
  'POST /api/chat/humanized': 'chat_humanized',
  'POST /api/chat/humanized/stream': 'chat_humanized',
  'POST /api/chat/upload': 'file_upload',
  'POST /api/chat/summarize': 'conversation_summarize',
  
  // Profile routes (mounted at /profiles)
  'POST /profiles/create': 'profile_create',
  'POST /profiles/add-sample': 'profile_sample_add',
  'POST /profiles/add-samples-batch': 'profile_sample_add',
  'POST /profiles/finalize': 'profile_finalize',
  'DELETE /profiles/:id': 'profile_delete',
  
  // Legacy routes (root level)
  'POST /authenticate': 'ai_detection',
  'POST /analyze': 'text_analysis',
  'POST /rewrite': 'text_rewrite',
  'POST /rewrite_stream': 'text_rewrite',
  'POST /create_profile': 'profile_create',
  'POST /create_profile_complete': 'profile_create',
  'POST /add_sample': 'profile_sample_add',
  'POST /add_samples_batch': 'profile_sample_add',
  'POST /finalize_profile': 'profile_finalize',
  'POST /delete_profile': 'profile_delete',
  'POST /suggest_improvements': 'text_analysis',
  'POST /check-humanization': 'check_humanization',
  'POST /iterative-humanize': 'iterative_humanize',
  'POST /api/translate': 'translation',
  
  // Credit routes
  'POST /api/credits/purchase': 'credit_purchase',
  
  // Notification routes
  'GET /api/notifications': 'notification_received'
};

/**
 * Extract user ID from request
 */
function extractUserId(req) {
  // Try different sources
  return req.body?.user_id || 
         req.body?.userId || 
         req.query?.user_id || 
         req.query?.userId ||
         req.user?.id ||
         req.user?.uid ||
         null;
}

/**
 * Extract relevant metadata from request/response
 */
function extractMetadata(req, res, responseBody) {
  const metadata = {};
  
  // Request info
  if (req.body?.text) {
    metadata.inputLength = req.body.text.length;
    metadata.wordCount = req.body.text.split(/\s+/).length;
  }
  
  if (req.body?.model) {
    metadata.model = req.body.model;
  }
  
  if (req.body?.profile_id || req.body?.profileId) {
    metadata.profileId = req.body.profile_id || req.body.profileId;
  }
  
  // Get credits info from request (set by credit middleware)
  if (req.creditCost !== undefined) {
    metadata.creditsUsed = req.creditCost;
  }
  if (req.creditsBefore !== undefined) {
    metadata.creditsBefore = req.creditsBefore;
  }
  if (req.creditsAfter !== undefined) {
    metadata.creditsAfter = req.creditsAfter;
  }
  
  // Response info (fallback if not set by middleware)
  if (responseBody) {
    if (metadata.creditsUsed === undefined && responseBody.creditsUsed !== undefined) {
      metadata.creditsUsed = responseBody.creditsUsed;
    }
    if (metadata.creditsUsed === undefined && responseBody.credits_used !== undefined) {
      metadata.creditsUsed = responseBody.credits_used;
    }
    if (responseBody.result?.length) {
      metadata.outputLength = responseBody.result.length;
    }
    if (responseBody.rewritten_text?.length) {
      metadata.outputLength = responseBody.rewritten_text.length;
    }
    if (responseBody.message?.length) {
      metadata.outputLength = responseBody.message.length;
    }
  }
  
  // Request metadata
  metadata.ip = req.ip || req.connection?.remoteAddress;
  metadata.userAgent = req.get('User-Agent')?.substring(0, 100);
  metadata.source = req.get('X-Source') || 'extension';
  
  return metadata;
}

/**
 * Activity Logger Middleware
 * Intercepts responses to log activity
 */
function activityLoggerMiddleware(req, res, next) {
  // Store original json method
  const originalJson = res.json.bind(res);
  const startTime = Date.now();
  
  // Override json method to capture response
  res.json = function(body) {
    // Restore original method
    res.json = originalJson;
    
    // Log activity asynchronously (don't block response)
    setImmediate(() => {
      try {
        const routeKey = `${req.method} ${req.baseUrl}${req.path}`.replace(/\/[a-zA-Z0-9_-]{20,}/, '/:id');
        const activityType = ROUTE_ACTIVITY_MAP[routeKey];
        
        if (activityType) {
          const userId = extractUserId(req);
          
          if (userId) {
            const metadata = extractMetadata(req, res, body);
            metadata.duration = Date.now() - startTime;
            metadata.success = res.statusCode >= 200 && res.statusCode < 300;
            
            if (body?.error) {
              metadata.error = body.error;
            }
            
            activityLogService.logActivity(userId, activityType, metadata)
              .catch(err => logger.error('Activity log error', { error: err.message }));
          }
        }
      } catch (err) {
        logger.error('Activity logger middleware error', { error: err.message });
      }
    });
    
    // Send original response
    return originalJson(body);
  };
  
  next();
}

/**
 * Manual activity logging helper
 * Use this when you need more control over what gets logged
 */
async function logUserActivity(userId, type, data = {}) {
  if (!userId) return;
  
  try {
    await activityLogService.logActivity(userId, type, data);
  } catch (err) {
    logger.error('Manual activity log error', { userId, type, error: err.message });
  }
}

module.exports = {
  activityLoggerMiddleware,
  logUserActivity
};
