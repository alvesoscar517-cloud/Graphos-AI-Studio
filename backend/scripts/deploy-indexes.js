#!/usr/bin/env node
/**
 * Deploy Firestore Indexes Script
 * 
 * This script deploys Firestore indexes using the Firebase Admin SDK
 * Can be run manually or as part of CI/CD pipeline
 * 
 * Usage:
 *   node scripts/deploy-indexes.js
 *   
 * Environment variables:
 *   GOOGLE_APPLICATION_CREDENTIALS - Path to service account key (optional if running on GCP)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const INDEXES_FILE = path.join(__dirname, '..', 'firestore.indexes.json');
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || 'notes-sync-472107';

async function deployIndexes() {
  console.log('🔥 Deploying Firestore Indexes...');
  console.log(`   Project: ${PROJECT_ID}`);
  console.log(`   Indexes file: ${INDEXES_FILE}`);
  console.log('');

  // Check if indexes file exists
  if (!fs.existsSync(INDEXES_FILE)) {
    console.error('❌ Indexes file not found:', INDEXES_FILE);
    process.exit(1);
  }

  // Read and validate indexes
  const indexesContent = JSON.parse(fs.readFileSync(INDEXES_FILE, 'utf8'));
  console.log(`📋 Found ${indexesContent.indexes?.length || 0} indexes to deploy`);
  console.log('');

  // List indexes
  indexesContent.indexes?.forEach((index, i) => {
    const fields = index.fields.map(f => `${f.fieldPath} (${f.order})`).join(', ');
    console.log(`   ${i + 1}. ${index.collectionGroup}: ${fields}`);
  });
  console.log('');

  try {
    // Try using firebase CLI if available
    console.log('🚀 Deploying via Firebase CLI...');
    execSync(`firebase deploy --only firestore:indexes --project ${PROJECT_ID}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('');
    console.log('✅ Indexes deployed successfully!');
  } catch (error) {
    console.log('');
    console.log('⚠️  Firebase CLI not available or failed.');
    console.log('');
    console.log('📝 To deploy indexes manually:');
    console.log('   1. Install Firebase CLI: npm install -g firebase-tools');
    console.log('   2. Login: firebase login');
    console.log(`   3. Deploy: firebase deploy --only firestore:indexes --project ${PROJECT_ID}`);
    console.log('');
    console.log('   Or deploy via Firebase Console:');
    console.log(`   https://console.firebase.google.com/project/${PROJECT_ID}/firestore/indexes`);
    console.log('');
    
    // Don't fail the build, just warn
    console.log('⚠️  Continuing without deploying indexes...');
  }
}

// Run
deployIndexes().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
