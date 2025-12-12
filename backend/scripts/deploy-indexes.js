#!/usr/bin/env node
/**
 * Deploy Firestore Indexes Script
 * 
 * This script deploys Firestore indexes using Google Cloud Firestore Admin API
 * Can be run manually or as part of CI/CD pipeline
 * 
 * Usage:
 *   node scripts/deploy-indexes.js
 *   node scripts/deploy-indexes.js --use-cli  (use Firebase CLI instead)
 *   
 * Environment variables:
 *   GOOGLE_APPLICATION_CREDENTIALS - Path to service account key (optional if running on GCP)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const INDEXES_FILE = path.join(__dirname, '..', 'firestore.indexes.json');
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || 'notes-sync-472107';
const DATABASE_ID = '(default)';
const USE_CLI = process.argv.includes('--use-cli');

/**
 * Deploy indexes using Google Cloud REST API
 */
async function deployViaAPI() {
  console.log('[CRITICAL] Deploying Firestore Indexes via API...');
  
  const { GoogleAuth } = require('google-auth-library');
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  if (!accessToken.token) {
    throw new Error('Could not get access token');
  }

  // Read indexes from file
  const indexesContent = JSON.parse(fs.readFileSync(INDEXES_FILE, 'utf8'));
  const indexes = indexesContent.indexes || [];
  
  console.log(`[INFO] Found ${indexes.length} indexes to deploy`);
  console.log('');

  // Get existing indexes
  const existingUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/collectionGroups/-/indexes`;
  const existingResponse = await fetch(existingUrl, {
    headers: { 'Authorization': `Bearer ${accessToken.token}` }
  });
  const existingData = await existingResponse.json();
  const existingIndexes = existingData.indexes || [];
  
  console.log(`[CHART] Found ${existingIndexes.length} existing indexes`);
  console.log('');

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const index of indexes) {
    const fields = index.fields.map(f => `${f.fieldPath}:${f.order}`).join(', ');
    
    // Check if index already exists
    const exists = existingIndexes.some(existing => {
      if (!existing.name?.includes(`/collectionGroups/${index.collectionGroup}/`)) return false;
      if (existing.queryScope !== index.queryScope) return false;
      if (!existing.fields || existing.fields.length !== index.fields.length) return false;
      
      return index.fields.every((reqField, idx) => {
        const existField = existing.fields[idx];
        return existField.fieldPath === reqField.fieldPath && 
               existField.order === reqField.order;
      });
    });

    if (exists) {
      console.log(`   [SKIP]️  ${index.collectionGroup}: ${fields} (already exists)`);
      skipped++;
      continue;
    }

    // Create index
    const createUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/collectionGroups/${index.collectionGroup}/indexes`;
    const body = {
      queryScope: index.queryScope,
      fields: index.fields
    };

    const response = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      console.log(`   [SUCCESS] ${index.collectionGroup}: ${fields} (created)`);
      created++;
    } else if (response.status === 409) {
      console.log(`   [SKIP]️  ${index.collectionGroup}: ${fields} (already building)`);
      skipped++;
    } else {
      const error = await response.text();
      console.log(`   [FAIL] ${index.collectionGroup}: ${fields} (failed: ${response.status})`);
      failed++;
    }
  }

  console.log('');
  console.log(`[CHART] Summary: ${created} created, ${skipped} skipped, ${failed} failed`);
  
  if (created > 0) {
    console.log('');
    console.log('[WAITING] Note: New indexes may take a few minutes to build.');
    console.log(`   Check status: https://console.firebase.google.com/project/${PROJECT_ID}/firestore/indexes`);
  }
}

/**
 * Deploy indexes using Firebase CLI
 */
async function deployViaCLI() {
  console.log('[CRITICAL] Deploying Firestore Indexes via Firebase CLI...');
  
  execSync(`firebase deploy --only firestore:indexes --project ${PROJECT_ID}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('');
  console.log('[SUCCESS] Indexes deployed successfully!');
}

async function deployIndexes() {
  console.log(`   Project: ${PROJECT_ID}`);
  console.log(`   Indexes file: ${INDEXES_FILE}`);
  console.log('');

  // Check if indexes file exists
  if (!fs.existsSync(INDEXES_FILE)) {
    console.error('[FAIL] Indexes file not found:', INDEXES_FILE);
    process.exit(1);
  }

  if (USE_CLI) {
    try {
      await deployViaCLI();
    } catch (error) {
      console.error('[FAIL] Firebase CLI failed:', error.message);
      console.log('');
      console.log('[HINT] Try running without --use-cli flag to use API instead');
      process.exit(1);
    }
  } else {
    try {
      await deployViaAPI();
    } catch (error) {
      console.error('[FAIL] API deployment failed:', error.message);
      console.log('');
      console.log('[HINT] Trying Firebase CLI as fallback...');
      
      try {
        await deployViaCLI();
      } catch (cliError) {
        console.error('[FAIL] Firebase CLI also failed:', cliError.message);
        console.log('');
        console.log('[INFO] To deploy indexes manually:');
        console.log('   1. Install Firebase CLI: npm install -g firebase-tools');
        console.log('   2. Login: firebase login');
        console.log(`   3. Deploy: firebase deploy --only firestore:indexes --project ${PROJECT_ID}`);
        console.log('');
        console.log('   Or deploy via Firebase Console:');
        console.log(`   https://console.firebase.google.com/project/${PROJECT_ID}/firestore/indexes`);
        process.exit(1);
      }
    }
  }
}

// Run
deployIndexes().catch(err => {
  console.error('[FAIL] Error:', err.message);
  process.exit(1);
});
