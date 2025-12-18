/**
 * Deploy Firestore Indexes Script
 * 
 * Auto-creates Firestore composite indexes using Google Cloud API.
 * Runs automatically on server startup.
 * 
 * Usage: node scripts/deploy-indexes.js
 */

const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

const INDEXES_FILE = path.join(__dirname, '..', 'firestore.indexes.json');
const DEPLOYED_INDEXES_CACHE = path.join(__dirname, '..', '.indexes-deployed');

// Track deployed indexes to avoid re-deploying
let deployedIndexesCache = new Set();

/**
 * Load cache of already deployed indexes
 */
function loadDeployedCache() {
  try {
    if (fs.existsSync(DEPLOYED_INDEXES_CACHE)) {
      const data = fs.readFileSync(DEPLOYED_INDEXES_CACHE, 'utf8');
      deployedIndexesCache = new Set(JSON.parse(data));
    }
  } catch {
    deployedIndexesCache = new Set();
  }
}

/**
 * Save cache of deployed indexes
 */
function saveDeployedCache() {
  try {
    fs.writeFileSync(DEPLOYED_INDEXES_CACHE, JSON.stringify([...deployedIndexesCache]));
  } catch {
    // Ignore write errors (e.g., read-only filesystem)
  }
}

/**
 * Generate unique key for an index
 */
function getIndexKey(index) {
  const fields = index.fields.map(f => `${f.fieldPath}:${f.order}`).join(',');
  return `${index.collectionGroup}|${fields}`;
}

/**
 * Convert index config to Firestore API format
 */
function toFirestoreIndexFormat(index, projectId, databaseId = '(default)') {
  return {
    queryScope: index.queryScope || 'COLLECTION',
    fields: index.fields.map(f => ({
      fieldPath: f.fieldPath,
      order: f.order === 'DESCENDING' ? 'DESCENDING' : 'ASCENDING'
    }))
  };
}

/**
 * Deploy indexes using Google Cloud Firestore Admin API
 */
async function deployIndexes() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  
  if (!projectId) {
    console.log('[INDEXES] No project ID found, skipping index deployment');
    return;
  }

  // Check if indexes file exists
  if (!fs.existsSync(INDEXES_FILE)) {
    console.log('[INDEXES] firestore.indexes.json not found, skipping');
    return;
  }

  loadDeployedCache();

  const indexesConfig = JSON.parse(fs.readFileSync(INDEXES_FILE, 'utf8'));
  const indexes = indexesConfig.indexes || [];
  
  if (indexes.length === 0) {
    console.log('[INDEXES] No indexes defined');
    return;
  }

  // Filter out already deployed indexes
  const newIndexes = indexes.filter(idx => !deployedIndexesCache.has(getIndexKey(idx)));
  
  if (newIndexes.length === 0) {
    console.log(`[INDEXES] All ${indexes.length} indexes already deployed`);
    return;
  }

  console.log(`[INDEXES] Checking ${newIndexes.length} indexes...`);

  try {
    // Use Google Auth to get access token
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();
    const accessToken = (await client.getAccessToken()).token;

    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups`;

    // Get existing indexes
    const existingIndexes = await getExistingIndexes(accessToken, projectId);
    
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const index of newIndexes) {
      const indexKey = getIndexKey(index);
      
      // Check if index already exists
      if (indexExists(existingIndexes, index)) {
        deployedIndexesCache.add(indexKey);
        skipped++;
        continue;
      }

      try {
        const url = `${baseUrl}/${index.collectionGroup}/indexes`;
        const body = toFirestoreIndexFormat(index, projectId);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (response.ok || response.status === 409) {
          // 409 = already exists
          deployedIndexesCache.add(indexKey);
          if (response.ok) {
            created++;
            console.log(`[INDEXES] Created: ${index.collectionGroup} (${index.fields.map(f => f.fieldPath).join(', ')})`);
          } else {
            skipped++;
          }
        } else {
          const error = await response.json().catch(() => ({}));
          // Don't log error for "already exists" cases
          if (!error.error?.message?.includes('already exists')) {
            console.warn(`[INDEXES] Failed to create ${index.collectionGroup}:`, error.error?.message || response.status);
            errors++;
          } else {
            deployedIndexesCache.add(indexKey);
            skipped++;
          }
        }
      } catch (err) {
        console.warn(`[INDEXES] Error creating ${index.collectionGroup}:`, err.message);
        errors++;
      }
    }

    saveDeployedCache();
    
    if (created > 0 || errors > 0) {
      console.log(`[INDEXES] Summary: ${created} created, ${skipped} existed, ${errors} errors`);
    }

  } catch (error) {
    // Don't crash server if index deployment fails
    console.warn('[INDEXES] Deployment check failed:', error.message);
  }
}

/**
 * Get existing indexes from Firestore
 */
async function getExistingIndexes(accessToken, projectId) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups/-/indexes`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (response.ok) {
      const data = await response.json();
      return data.indexes || [];
    }
  } catch {
    // Ignore errors
  }
  return [];
}

/**
 * Check if index already exists
 */
function indexExists(existingIndexes, newIndex) {
  return existingIndexes.some(existing => {
    // Extract collection from name: projects/.../collectionGroups/{collection}/indexes/...
    const nameParts = existing.name?.split('/') || [];
    const collectionIdx = nameParts.indexOf('collectionGroups');
    const existingCollection = collectionIdx >= 0 ? nameParts[collectionIdx + 1] : '';
    
    if (existingCollection !== newIndex.collectionGroup) return false;
    if (existing.fields?.length !== newIndex.fields?.length) return false;
    
    return newIndex.fields.every((field, i) => {
      const existingField = existing.fields[i];
      return existingField?.fieldPath === field.fieldPath &&
             (existingField?.order || 'ASCENDING') === (field.order || 'ASCENDING');
    });
  });
}

// Run if called directly
if (require.main === module) {
  deployIndexes()
    .then(() => console.log('[INDEXES] Done'))
    .catch(err => console.error('[INDEXES] Error:', err.message));
}

module.exports = { deployIndexes };
