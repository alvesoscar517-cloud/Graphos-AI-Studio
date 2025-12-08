/**
 * Firestore Index Service
 * 
 * Automatically creates required Firestore indexes on server startup
 * Uses Google Cloud Firestore Admin API
 */

const { Firestore } = require('@google-cloud/firestore');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// Required indexes for the application
const REQUIRED_INDEXES = [
  {
    collectionGroup: 'voice_profiles',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'ASCENDING' }
    ],
    queryScope: 'COLLECTION'
  },
  {
    collectionGroup: 'voice_profiles',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ],
    queryScope: 'COLLECTION'
  },
  {
    collectionGroup: 'voice_profiles',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'name', order: 'ASCENDING' }
    ],
    queryScope: 'COLLECTION'
  }
];

class FirestoreIndexService {
  constructor() {
    this.projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || 'notes-sync-472107';
    this.databaseId = '(default)';
    this.initialized = false;
  }

  /**
   * Initialize and ensure all required indexes exist
   * Called on server startup
   */
  async ensureIndexes() {
    if (this.initialized) {
      return;
    }

    logger.info('Checking Firestore indexes...');

    try {
      // Use Google Cloud Firestore Admin API via REST
      const { GoogleAuth } = require('google-auth-library');
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });

      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();

      if (!accessToken.token) {
        logger.warn('Could not get access token for Firestore Admin API');
        this.initialized = true;
        return;
      }

      // Get existing indexes
      const existingIndexes = await this.listIndexes(accessToken.token);
      logger.info(`Found ${existingIndexes.length} existing indexes`);

      // Check and create missing indexes
      let createdCount = 0;
      for (const requiredIndex of REQUIRED_INDEXES) {
        const exists = this.indexExists(existingIndexes, requiredIndex);
        
        if (!exists) {
          logger.info(`Creating missing index for ${requiredIndex.collectionGroup}...`, {
            fields: requiredIndex.fields.map(f => `${f.fieldPath}:${f.order}`).join(', ')
          });
          
          const created = await this.createIndex(accessToken.token, requiredIndex);
          if (created) {
            createdCount++;
          }
        }
      }

      if (createdCount > 0) {
        logger.info(`Created ${createdCount} new indexes. They may take a few minutes to build.`);
      } else {
        logger.info('All required indexes already exist');
      }

      this.initialized = true;
    } catch (error) {
      // Don't fail server startup if index creation fails
      logger.warn('Could not ensure Firestore indexes', { 
        error: error.message,
        hint: 'Indexes can be created manually via Firebase Console or CLI'
      });
      this.initialized = true;
    }
  }

  /**
   * List existing indexes via REST API
   */
  async listIndexes(accessToken) {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/${this.databaseId}/collectionGroups/-/indexes`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        logger.warn('Failed to list indexes', { status: response.status, error });
        return [];
      }

      const data = await response.json();
      return data.indexes || [];
    } catch (error) {
      logger.warn('Error listing indexes', { error: error.message });
      return [];
    }
  }

  /**
   * Check if an index already exists
   */
  indexExists(existingIndexes, requiredIndex) {
    return existingIndexes.some(existing => {
      // Check collection group
      if (!existing.name?.includes(`/collectionGroups/${requiredIndex.collectionGroup}/`)) {
        return false;
      }

      // Check query scope
      if (existing.queryScope !== requiredIndex.queryScope) {
        return false;
      }

      // Check fields (order matters)
      if (!existing.fields || existing.fields.length !== requiredIndex.fields.length) {
        return false;
      }

      return requiredIndex.fields.every((reqField, idx) => {
        const existField = existing.fields[idx];
        return existField.fieldPath === reqField.fieldPath && 
               existField.order === reqField.order;
      });
    });
  }

  /**
   * Create a new index via REST API
   */
  async createIndex(accessToken, indexConfig) {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/${this.databaseId}/collectionGroups/${indexConfig.collectionGroup}/indexes`;
      
      const body = {
        queryScope: indexConfig.queryScope,
        fields: indexConfig.fields
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.text();
        // Index might already exist or be building
        if (response.status === 409) {
          logger.info(`Index already exists or is building for ${indexConfig.collectionGroup}`);
          return false;
        }
        logger.warn('Failed to create index', { 
          collection: indexConfig.collectionGroup,
          status: response.status, 
          error 
        });
        return false;
      }

      const data = await response.json();
      logger.info(`Index creation started for ${indexConfig.collectionGroup}`, {
        operation: data.name
      });
      return true;
    } catch (error) {
      logger.warn('Error creating index', { 
        collection: indexConfig.collectionGroup,
        error: error.message 
      });
      return false;
    }
  }
}

// Singleton instance
const firestoreIndexService = new FirestoreIndexService();

module.exports = firestoreIndexService;
