/**
 * Migration Script
 * Helps migrate from monolithic index.js to modular structure
 * 
 * Usage: node scripts/migrate.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Starting migration...\n');

// Check if old index.js exists
const oldIndexPath = path.join(__dirname, '..', 'index.js.old');
const newIndexPath = path.join(__dirname, '..', 'index.js');

if (!fs.existsSync(oldIndexPath)) {
  console.log('⚠️  No index.js.old found.');
  console.log('💡 If you want to migrate, rename your current index.js to index.js.old first.\n');
  process.exit(0);
}

console.log('✅ Found index.js.old');
console.log('📝 Reading old code...\n');

const oldCode = fs.readFileSync(oldIndexPath, 'utf8');

// Analyze old code
const stats = {
  totalLines: oldCode.split('\n').length,
  routes: (oldCode.match(/app\.(get|post|put|delete)\(/g) || []).length,
  functions: (oldCode.match(/function \w+\(/g) || []).length,
  asyncFunctions: (oldCode.match(/async function \w+\(/g) || []).length
};

console.log('📊 Old code statistics:');
console.log(`   Total lines: ${stats.totalLines}`);
console.log(`   Routes: ${stats.routes}`);
console.log(`   Functions: ${stats.functions}`);
console.log(`   Async functions: ${stats.asyncFunctions}\n`);

// Create new modular structure
console.log('🏗️  Creating new structure...\n');

const newIndex = `/**
 * AI Content Authenticator - Backend Entry Point
 * Modular architecture for better maintainability
 */

const express = require('express');
const config = require('./src/config');
const corsMiddleware = require('./src/middleware/cors');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const rateLimit = require('./src/middleware/rateLimit');
const logger = require('./src/utils/logger');

// Initialize Express
const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json({ limit: config.MAX_REQUEST_SIZE }));
app.use(rateLimit);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Content Authenticator',
    version: config.API_VERSION,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Warmup endpoint for Cloud Run
app.get('/_ah/warmup', (req, res) => {
  logger.info('Warmup request received');
  res.status(200).send('OK');
});

// API Routes
// TODO: Import and use route modules
// const authRoutes = require('./src/routes/auth.routes');
// const profileRoutes = require('./src/routes/profile.routes');
// app.use('/api/auth', authRoutes);
// app.use('/api/profiles', profileRoutes);

// For now, keep old routes (will be migrated gradually)
// Copy your routes from index.js.old here

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  logger.info(\`🚀 Server running on port \${PORT}\`);
  logger.info(\`📍 Environment: \${config.NODE_ENV}\`);
  logger.info(\`🔧 Project: \${config.PROJECT_ID}\`);
});

module.exports = app;
`;

// Write new index.js
fs.writeFileSync(newIndexPath, newIndex);
console.log('✅ Created new index.js');

// Create migration checklist
const checklist = `# Migration Checklist

## ✅ Completed:
- [x] Created new modular structure
- [x] Created config files
- [x] Created middleware
- [x] Created utilities

## 🔄 In Progress:
- [ ] Extract routes to separate files
- [ ] Extract controllers
- [ ] Extract services
- [ ] Update tests

## 📝 Next Steps:

### 1. Test new structure locally
\`\`\`bash
cd backend
npm install
npm start
\`\`\`

### 2. Gradually migrate routes
- Copy routes from index.js.old
- Create route files in src/routes/
- Create controllers in src/controllers/
- Test each route

### 3. Deploy
\`\`\`bash
gcloud run deploy ai-content-authenticator --source .
\`\`\`

### 4. Verify
- Test all endpoints
- Check logs
- Monitor performance

## 📊 Migration Progress:

Total routes to migrate: ${stats.routes}
- [ ] Authentication routes
- [ ] Profile routes
- [ ] Analysis routes
- [ ] Admin routes
- [ ] Notification routes

## 🆘 Need Help?

See MIGRATION_GUIDE.md for detailed instructions.
`;

fs.writeFileSync(path.join(__dirname, '..', 'MIGRATION_CHECKLIST.md'), checklist);
console.log('✅ Created MIGRATION_CHECKLIST.md\n');

console.log('🎉 Migration setup complete!\n');
console.log('📝 Next steps:');
console.log('   1. Review the new index.js');
console.log('   2. Copy your routes from index.js.old');
console.log('   3. Test locally: npm start');
console.log('   4. Deploy: gcloud run deploy --source .\n');
console.log('📚 See MIGRATION_CHECKLIST.md for detailed progress tracking.\n');
