/**
 * CORS Middleware Configuration
 */

const cors = require('cors');

const corsOptions = {
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Admin-Key', 'Authorization'],
  credentials: false,
  maxAge: 86400 // 24 hours
};

module.exports = cors(corsOptions);
