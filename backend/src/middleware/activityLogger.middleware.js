/**
 * Activity Logger Middleware
 * Tự động ghi log hoạt động người dùng khi API được gọi
 * Tối ưu: Không block request, ghi log async
 */

const activityLogService = require('../services/activityLog.service');
const logger = require('../utils/logger');

// Map routes to activity types
const ROUTE_ACTIVITY_MAP = {
  // Analysis routes
  'POST /api/analysis/detect': 'ai_detection',
  'POST /api/analysis/analyze': 'text_analysis',
  'POST /api/analysis/analyze-text': 'text_analysis',
  
  // Rewrite routes
  'POST /api/analysis/rewrite': 'text_rewrite',
  'POST /api/analysis/humanize': 'humanize',
  'POST /api/analysis/iterative-humanize': 'iterative_humanize',
  
  // Chat routes
  'POST /api/chat/message': 'chat_message',
  'POST /api/chat/humanized': 'chat_humanized',
  'POST /api/chat/summarize': 'conversation_summarize',
  
  // Profile routes
  'POST /api/profile/create': 'profile_create',
  'PUT /api/profile/update': 'profile_update',
  'DELETE /api/profile/delete': 'profile_delete',
  'POST /api/profile/sample': 'profile_sample_add',
  'POST /api/profile/finalize': 'profile_finalize',
  
  // Translation
  'POST /api/translate': 'translation',
  
  // File upload
  'POST /api/upload': 'file_upload',
  
  // Credit purchase
  'POST /api/credits/purchase': 'credit_purchase'
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
  
  // Response info
  if (responseBody) {
    if (responseBody.creditsUsed !== undefined) {
      metadata.creditsUsed = responseBody.creditsUsed;
    }
    if (responseBody.credits_used !== undefined) {
      metadata.creditsUsed = responseBody.credits_used;
    }
    if (responseBody.result?.length) {
      metadata.outputLength = responseBody.result.length;
    }
    if (responseBody.rewritten_text?.length) {
      metadata.outputLength = responseBody.rewritten_text.length;
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
