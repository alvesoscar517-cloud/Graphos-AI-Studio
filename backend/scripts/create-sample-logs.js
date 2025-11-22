/**
 * Script to create sample activity logs for testing
 */

const { db } = require('../src/config/firebase');

async function createSampleLogs() {
  try {
    console.log('🔄 Creating sample activity logs...');

    // Get first user
    const usersSnapshot = await db.collection('users').limit(1).get();
    
    if (usersSnapshot.empty) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    const userId = usersSnapshot.docs[0].id;
    console.log(`✅ Using user: ${userId}`);

    // Sample logs
    const logs = [
      {
        userId,
        type: 'login',
        action: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 days ago
      },
      {
        userId,
        type: 'profile',
        action: 'created',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6) // 6 days ago
      },
      {
        userId,
        type: 'analysis',
        action: 'completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) // 5 days ago
      },
      {
        userId,
        type: 'rewrite',
        action: 'completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4) // 4 days ago
      },
      {
        userId,
        type: 'notification',
        action: 'received',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
      },
      {
        userId,
        type: 'login',
        action: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
      },
      {
        userId,
        type: 'profile',
        action: 'updated',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      },
      {
        userId,
        type: 'login',
        action: 'success',
        timestamp: new Date() // now
      }
    ];

    // Create logs
    const batch = db.batch();
    logs.forEach(log => {
      const logRef = db.collection('activity_logs').doc();
      batch.set(logRef, log);
    });

    await batch.commit();

    console.log(`✅ Created ${logs.length} sample logs for user ${userId}`);
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  createSampleLogs()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { createSampleLogs };
