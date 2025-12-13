/**
 * Deploy Firestore Indexes Script
 * 
 * This script deploys Firestore indexes using the Firebase Admin SDK.
 * Run once after server setup or when indexes change.
 * 
 * Usage: node scripts/deploy-indexes.js
 * 
 * Note: Firestore composite indexes cannot be created programmatically via Admin SDK.
 * This script provides instructions and can be integrated with firebase CLI.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const INDEXES_FILE = path.join(__dirname, '..', 'firestore.indexes.json');

async function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function deployIndexes() {
  console.log('========================================');
  console.log('  Firestore Indexes Deployment');
  console.log('========================================\n');

  // Check if indexes file exists
  if (!fs.existsSync(INDEXES_FILE)) {
    console.error('❌ firestore.indexes.json not found!');
    process.exit(1);
  }

  // Read and display indexes
  const indexesConfig = JSON.parse(fs.readFileSync(INDEXES_FILE, 'utf8'));
  console.log(`📋 Found ${indexesConfig.indexes.length} indexes to deploy\n`);

  // Check for Firebase CLI
  const hasFirebaseCLI = await checkFirebaseCLI();

  if (hasFirebaseCLI) {
    console.log('✅ Firebase CLI detected\n');
    console.log('Deploying indexes...\n');

    try {
      // Deploy indexes using Firebase CLI
      const result = execSync('firebase deploy --only firestore:indexes', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
        timeout: 120000 // 2 minutes timeout
      });
      
      console.log('\n✅ Indexes deployed successfully!');
    } catch (error) {
      console.error('\n❌ Failed to deploy indexes:', error.message);
      console.log('\nPlease run manually:');
      console.log('  cd backend && firebase deploy --only firestore:indexes');
      process.exit(1);
    }
  } else {
    console.log('⚠️  Firebase CLI not found\n');
    console.log('To deploy indexes, please:');
    console.log('');
    console.log('1. Install Firebase CLI:');
    console.log('   npm install -g firebase-tools');
    console.log('');
    console.log('2. Login to Firebase:');
    console.log('   firebase login');
    console.log('');
    console.log('3. Deploy indexes:');
    console.log('   cd backend && firebase deploy --only firestore:indexes');
    console.log('');
    console.log('Or create indexes manually in Firebase Console:');
    console.log('https://console.firebase.google.com/project/_/firestore/indexes');
    console.log('');
    
    // Print required indexes for manual creation
    console.log('Required composite indexes for credit_transactions:');
    console.log('');
    
    const creditIndexes = indexesConfig.indexes.filter(
      idx => idx.collectionGroup === 'credit_transactions'
    );
    
    creditIndexes.forEach((idx, i) => {
      console.log(`${i + 1}. Collection: credit_transactions`);
      console.log('   Fields:');
      idx.fields.forEach(f => {
        console.log(`     - ${f.fieldPath} (${f.order})`);
      });
      console.log('');
    });
  }
}

// Run if called directly
if (require.main === module) {
  deployIndexes().catch(console.error);
}

module.exports = { deployIndexes };
