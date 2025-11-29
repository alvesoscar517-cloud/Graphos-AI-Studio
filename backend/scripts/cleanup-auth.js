#!/usr/bin/env node
/**
 * Cleanup Script for Authentication Data
 * 
 * This script should be run periodically (e.g., daily via cron) to:
 * - Remove expired pending registrations
 * - Clean up old login history (older than 90 days)
 * - Remove stale sessions
 * 
 * Usage:
 *   node scripts/cleanup-auth.js
 * 
 * Or via cron (daily at 3 AM):
 *   0 3 * * * cd /path/to/backend && node scripts/cleanup-auth.js >> /var/log/auth-cleanup.log 2>&1
 */

require('dotenv').config();

const { db } = require('../src/config/firebase');
const emailAuthService = require('../src/services/emailAuth.service');
const logger = require('../src/utils/logger');

async function runCleanup() {
  console.log('='.repeat(50));
  console.log(`Auth Cleanup Started: ${new Date().toISOString()}`);
  console.log('='.repeat(50));
  
  try {
    // 1. Cleanup expired pending registrations
    console.log('\n[1/3] Cleaning up expired pending registrations...');
    const registrationResult = await emailAuthService.cleanupExpiredRegistrations();
    console.log(`   Deleted: ${registrationResult.deletedCount} expired registrations`);
    
    // 2. Cleanup old login history
    console.log('\n[2/3] Cleaning up old login history...');
    const historyResult = await emailAuthService.cleanupOldLoginHistory();
    console.log(`   Deleted: ${historyResult.deletedCount} old login records`);
    
    // 3. Cleanup stale sessions (inactive for more than 30 days)
    console.log('\n[3/3] Cleaning up stale sessions...');
    const staleSessionsResult = await cleanupStaleSessions();
    console.log(`   Deleted: ${staleSessionsResult.deletedCount} stale sessions`);
    
    console.log('\n' + '='.repeat(50));
    console.log('Auth Cleanup Completed Successfully');
    console.log('='.repeat(50));
    
    // Log summary
    logger.info('Auth cleanup completed', {
      expiredRegistrations: registrationResult.deletedCount,
      oldLoginHistory: historyResult.deletedCount,
      staleSessions: staleSessionsResult.deletedCount
    });
    
    process.exit(0);
  } catch (error) {
    console.error('\nCleanup failed:', error.message);
    logger.error('Auth cleanup failed', { error: error.message });
    process.exit(1);
  }
}

/**
 * Cleanup sessions that have been inactive for more than 30 days
 */
async function cleanupStaleSessions() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  
  const staleSessionsSnapshot = await db.collection('user_sessions')
    .where('lastActiveAt', '<', cutoffDate)
    .limit(500)
    .get();
  
  if (staleSessionsSnapshot.empty) {
    return { deletedCount: 0 };
  }
  
  const batch = db.batch();
  staleSessionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  
  return { deletedCount: staleSessionsSnapshot.size };
}

// Run the cleanup
runCleanup();
