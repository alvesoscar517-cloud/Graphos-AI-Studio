/**
 * Response Compression Middleware
 * Brotli-first compression with gzip fallback
 * 
 * Brotli provides 15-20% better compression than gzip
 * 
 * @module middleware/compression
 */

const compression = require('compression');
const zlib = require('zlib');

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Default compression threshold (1KB)
 * Responses smaller than this won't be compressed
 */
const DEFAULT_THRESHOLD = 1024;

/**
 * Gzip compression level (1-9, higher = better compression but slower)
 */
const DEFAULT_LEVEL = 6;

/**
 * Brotli quality level (0-11, 4 is good balance for dynamic content)
 */
const BROTLI_QUALITY = 4;

/**
 * Content types to compress
 */
const COMPRESSIBLE_TYPES = [
  'text/html',
  'text/css',
  'text/plain',
  'text/xml',
  'text/javascript',
  'application/json',
  'application/javascript',
  'application/xml',
  'application/x-javascript',
  'image/svg+xml'
];

// ============================================================================
// FILTER FUNCTION
// ============================================================================

/**
 * Determine if response should be compressed
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {boolean} True if should compress
 */
function shouldCompress(req, res) {
  // Don't compress if client requests no compression
  if (req.headers['x-no-compression']) {
    return false;
  }
  
  // Don't compress if already compressed
  if (res.getHeader('Content-Encoding')) {
    return false;
  }
  
  // Don't compress SSE/streaming responses
  const contentType = res.getHeader('Content-Type');
  if (contentType && contentType.includes('text/event-stream')) {
    return false;
  }
  
  // Use default compression filter
  return compression.filter(req, res);
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Create compression middleware with default options
 */
const compressionMiddleware = compression({
  // Minimum size to compress
  threshold: DEFAULT_THRESHOLD,
  
  // Compression level
  level: DEFAULT_LEVEL,
  
  // Filter function
  filter: shouldCompress,
  
  // Memory level (1-9)
  memLevel: 8,
  
  // Window bits (8-15)
  windowBits: 15,
  
  // Chunk size
  chunkSize: 16 * 1024
});

/**
 * Create custom compression middleware
 * @param {Object} options - Compression options
 * @returns {Function} Express middleware
 */
function createCompressionMiddleware(options = {}) {
  const {
    threshold = DEFAULT_THRESHOLD,
    level = DEFAULT_LEVEL,
    filter = shouldCompress
  } = options;
  
  return compression({
    threshold,
    level,
    filter,
    memLevel: options.memLevel || 8,
    windowBits: options.windowBits || 15,
    chunkSize: options.chunkSize || 16 * 1024
  });
}

/**
 * Brotli compression middleware
 * Uses Node.js native zlib brotli support
 * Falls back to gzip if brotli not supported by client
 */
function brotliCompressionMiddleware(req, res, next) {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  // Check if client supports brotli
  if (acceptEncoding.includes('br')) {
    // Store original write and end
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);
    
    const chunks = [];
    let headersSent = false;
    let isStreaming = false;
    
    // Track if headers are sent (streaming mode)
    const originalFlushHeaders = res.flushHeaders.bind(res);
    res.flushHeaders = function() {
      headersSent = true;
      isStreaming = true;
      return originalFlushHeaders();
    };
    
    res.write = function(chunk, encoding, callback) {
      // If streaming (headers already sent), write directly without buffering
      if (isStreaming || headersSent || res.headersSent) {
        return originalWrite(chunk, encoding, callback);
      }
      
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      }
      if (callback) callback();
      return true;
    };
    
    res.end = function(chunk, encoding, callback) {
      // If streaming, end directly without compression
      if (isStreaming || headersSent || res.headersSent) {
        return originalEnd(chunk, encoding, callback);
      }
      
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      }
      
      const body = Buffer.concat(chunks);
      
      // Only compress if above threshold
      if (body.length < DEFAULT_THRESHOLD) {
        originalWrite(body);
        originalEnd(null, null, callback);
        return;
      }
      
      // Compress with brotli
      zlib.brotliCompress(body, {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY // Balance between speed and compression
        }
      }, (err, compressed) => {
        if (err) {
          // Fallback to uncompressed
          originalWrite(body);
          originalEnd(null, null, callback);
          return;
        }
        
        res.setHeader('Content-Encoding', 'br');
        res.setHeader('Content-Length', compressed.length);
        originalWrite(compressed);
        originalEnd(null, null, callback);
      });
    };
    
    next();
  } else {
    // Fall back to gzip compression
    compressionMiddleware(req, res, next);
  }
}

/**
 * Compression middleware for API responses only
 * Skips compression for static files
 */
const apiCompressionMiddleware = compression({
  threshold: DEFAULT_THRESHOLD,
  level: DEFAULT_LEVEL,
  filter: (req, res) => {
    // Only compress API routes
    if (!req.path.startsWith('/api')) {
      return false;
    }
    return shouldCompress(req, res);
  }
});

// ============================================================================
// SMART COMPRESSION MIDDLEWARE (Brotli-first)
// ============================================================================

/**
 * Smart compression middleware that uses Brotli when supported, falls back to gzip
 * Brotli provides 15-20% better compression than gzip
 */
function smartCompressionMiddleware(req, res, next) {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  // Skip if client requests no compression
  if (req.headers['x-no-compression']) {
    return next();
  }
  
  // Skip compression for SSE/streaming endpoints
  // These endpoints set Content-Type: text/event-stream
  const streamingPaths = [
    // Chat streaming
    '/api/chat/stream',
    '/api/chat/humanized/stream',
    // Analysis/Rewrite streaming
    '/api/analysis/rewrite-stream',
    '/api/analysis/iterative-humanize/stream',
    // Profile creation streaming
    '/create_profile_complete/stream',
    // Realtime events
    '/api/realtime/events'
  ];
  if (streamingPaths.some(path => req.path.includes(path) || req.path.endsWith('/stream'))) {
    return next();
  }
  
  // Use Brotli if client supports it (most modern browsers do)
  if (acceptEncoding.includes('br')) {
    return brotliCompressionMiddleware(req, res, next);
  }
  
  // Fall back to gzip
  return compressionMiddleware(req, res, next);
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export smart compression as default (Brotli-first)
module.exports = smartCompressionMiddleware;
module.exports.smartCompressionMiddleware = smartCompressionMiddleware;
module.exports.gzipMiddleware = compressionMiddleware;
module.exports.createCompressionMiddleware = createCompressionMiddleware;
module.exports.apiCompressionMiddleware = apiCompressionMiddleware;
module.exports.brotliCompressionMiddleware = brotliCompressionMiddleware;
module.exports.shouldCompress = shouldCompress;
module.exports.DEFAULT_THRESHOLD = DEFAULT_THRESHOLD;
module.exports.DEFAULT_LEVEL = DEFAULT_LEVEL;
module.exports.BROTLI_QUALITY = BROTLI_QUALITY;
module.exports.COMPRESSIBLE_TYPES = COMPRESSIBLE_TYPES;
