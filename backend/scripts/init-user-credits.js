/**
 * Initialize User Credits Script
 * Run this to add credit fields to existing users or create test user
 */

const { db } = require('../src/config/firebase');

async function initUserCredits() {
  try {
    console.log('[INFO] Initializing user credits...\n');

    // Create or update dev user - simulating Google OAuth login
    const devUserId = 'google_oauth_test_12345678901234567890';
    const devUserRef = db.collection('users').doc(devUserId);
    
    const devUserDoc = await devUserRef.get();
    
    if (!devUserDoc.exists) {
      console.log('Creating dev user...');
      await devUserRef.set({
        userId: devUserId,
        email: 'nguyen.vantest@gmail.com',
        name: 'Nguyễn Văn Test',
        displayName: 'Nguyễn Văn Test',
        photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        emailVerified: true,
        providerId: 'google.com',
        credits: {
          balance: 100,
          purchased: 100,
          used: 0
        },
        usage: {
          analysesCount: 0,
          rewritesCount: 0,
          chatCount: 0,
          lastActivity: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      });
      console.log('[SUCCESS] Dev user created with 100 free credits\n');
    } else {
      console.log('[INFO] Updating dev user credits...');
      await devUserRef.update({
        'credits.balance': 100,
        'credits.purchased': 100,
        'credits.used': 0
      });
      console.log('[SUCCESS] Dev user credits updated\n');
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
          'credits.purchased': 100,
          'credits.used': 0
        });
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      await batch.commit();
      console.log(`[SUCCESS] Updated ${updatedCount} existing users with credits\n`);
    } else {
      console.log('[INFO] No other users need updating\n');
    }

    console.log('[SUCCESS] Initialization complete!\n');
    console.log('Summary:');
    console.log(`- Dev user: google_oauth_test_12345678901234567890 (nguyen.vantest@gmail.com) - 100 credits`);
    console.log(`- Other users updated: ${updatedCount}`);
    console.log('\nYou can now test the credit system!');
    
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Error initializing credits:', error);
    process.exit(1);
  }
}

// Run the script
initUserCredits();
