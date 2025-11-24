/**
 * Initialize User Credits Script
 * Run this to add credit fields to existing users or create test user
 */

const { db } = require('../src/config/firebase');

async function initUserCredits() {
  try {
    console.log('🚀 Initializing user credits...\n');

    // Create or update dev user
    const devUserId = 'dev_user_123';
    const devUserRef = db.collection('users').doc(devUserId);
    
    const devUserDoc = await devUserRef.get();
    
    if (!devUserDoc.exists) {
      console.log('Creating dev user...');
      await devUserRef.set({
        userId: devUserId,
        email: 'dev@example.com',
        name: 'Development User',
        credits: {
          balance: 100,
          monthly: 100,
          purchased: 0,
          used: 0
        },
        subscription: {
          plan: 'free',
          status: 'active',
          startDate: new Date().toISOString(),
          lastReset: new Date().toISOString()
        },
        usage: {
          analysesCount: 0,
          rewritesCount: 0,
          chatCount: 0,
          lastActivity: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      });
      console.log('✅ Dev user created with 100 free credits\n');
    } else {
      console.log('Updating dev user credits...');
      await devUserRef.update({
        'credits.balance': 100,
        'credits.monthly': 100,
        'credits.purchased': 0,
        'credits.used': 0,
        'subscription.plan': 'free',
        'subscription.status': 'active',
        'subscription.startDate': new Date().toISOString(),
        'subscription.lastReset': new Date().toISOString()
      });
      console.log('✅ Dev user credits updated\n');
    }

    // Update all existing users
    console.log('Checking for other users...');
    const usersSnapshot = await db.collection('users').get();
    
    let updatedCount = 0;
    const batch = db.batch();
    
    usersSnapshot.forEach(doc => {
      if (doc.id === devUserId) return; // Skip dev user
      
      const userData = doc.data();
      
      // Only update if credits field doesn't exist
      if (!userData.credits) {
        const userRef = db.collection('users').doc(doc.id);
        batch.update(userRef, {
          'credits.balance': 100,
          'credits.monthly': 100,
          'credits.purchased': 0,
          'credits.used': 0,
          'subscription.plan': 'free',
          'subscription.status': 'active',
          'subscription.startDate': new Date().toISOString(),
          'subscription.lastReset': new Date().toISOString()
        });
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      await batch.commit();
      console.log(`✅ Updated ${updatedCount} existing users with credits\n`);
    } else {
      console.log('No other users need updating\n');
    }

    console.log('✨ Initialization complete!\n');
    console.log('Summary:');
    console.log(`- Dev user: dev_user_123 (100 credits)`);
    console.log(`- Other users updated: ${updatedCount}`);
    console.log('\nYou can now test the credit system!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing credits:', error);
    process.exit(1);
  }
}

// Run the script
initUserCredits();
