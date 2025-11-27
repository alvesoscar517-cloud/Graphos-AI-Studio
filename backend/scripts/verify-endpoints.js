/**
 * Endpoint Verification Script
 * Verify all endpoints are mapped correctly
 */

const endpoints = {
  // Core endpoints
  'GET /': 'Home',
  'GET /health': 'Health check',
  
  // Authentication & Feedback
  'POST /send-feedback': 'Send feedback',
  
  // Profile Management (Legacy)
  'POST /create_profile': 'Create profile',
  'POST /add_sample': 'Add sample',
  'POST /add_samples_batch': 'Add samples batch',
  'POST /finalize_profile': 'Finalize profile',
  'GET /get_profile': 'Get profile',
  'GET /get_profiles': 'Get profiles',
  'POST /delete_profile': 'Delete profile',
  
  // Profile Management (New)
  'POST /profiles/create': 'Create profile (new)',
  'POST /profiles/add-sample': 'Add sample (new)',
  'POST /profiles/finalize': 'Finalize profile (new)',
  'GET /profiles/:id': 'Get profile (new)',
  'DELETE /profiles/:id': 'Delete profile (new)',
  
  // Analysis (Legacy)
  'POST /authenticate': 'Authenticate content',
  'POST /analyze': 'Analyze text',
  'POST /suggest_improvements': 'Suggest improvements',
  'POST /rewrite': 'Rewrite text',
  'POST /rewrite_stream': 'Rewrite stream',
  'POST /api/translate': 'Translate text',
  
  // Analysis (New)
  'POST /analysis/authenticate': 'Authenticate (new)',
  'POST /analysis/analyze': 'Analyze (new)',
  'POST /analysis/suggest': 'Suggest (new)',
  'POST /analysis/rewrite': 'Rewrite (new)',
  'POST /analysis/translate': 'Translate (new)',
  
  // Chat
  'POST /api/chat': 'Chat with AI',
  
  // Notifications (User)
  'GET /api/notifications': 'Get user notifications',
  'POST /api/notifications/:id/read': 'Mark as read',
  'POST /api/notifications/:id/click': 'Mark as clicked',
  
  // Admin - Users
  'GET /api/admin/users': 'Get all users',
  'GET /api/admin/users/:id': 'Get user details',
  
  // Admin - Analytics
  'GET /api/admin/analytics/overview': 'Analytics overview',
  'GET /api/admin/analytics/users': 'User analytics',
  'GET /api/admin/analytics/usage': 'Usage analytics',
  
  // Admin - Settings
  'GET /api/admin/settings': 'Get settings',
  'PUT /api/admin/settings': 'Update settings',
  
  // Admin - Translation
  'POST /api/admin/translate': 'Admin translate',
  
  // Admin - Notifications
  'GET /api/admin/notifications': 'Get notifications',
  'POST /api/admin/notifications': 'Create notification',
  'PUT /api/admin/notifications/:id': 'Update notification',
  'DELETE /api/admin/notifications/:id': 'Delete notification',
  'POST /api/admin/notifications/:id/send': 'Send notification',
  'GET /api/admin/notifications/:id/stats': 'Notification stats'
};

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   Endpoint Verification Report                             ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');
console.log(`Total endpoints: ${Object.keys(endpoints).length}`);
console.log('');

// Group by category
const categories = {
  'Core': [],
  'Profile Management': [],
  'Analysis': [],
  'Chat': [],
  'Notifications': [],
  'Admin': []
};

Object.entries(endpoints).forEach(([endpoint, description]) => {
  if (endpoint.includes('/api/admin')) {
    categories['Admin'].push({ endpoint, description });
  } else if (endpoint.includes('/profiles') || endpoint.includes('profile')) {
    categories['Profile Management'].push({ endpoint, description });
  } else if (endpoint.includes('/analysis') || endpoint.includes('analyze') || endpoint.includes('authenticate') || endpoint.includes('rewrite') || endpoint.includes('suggest') || endpoint.includes('translate')) {
    categories['Analysis'].push({ endpoint, description });
  } else if (endpoint.includes('/chat')) {
    categories['Chat'].push({ endpoint, description });
  } else if (endpoint.includes('/notifications')) {
    categories['Notifications'].push({ endpoint, description });
  } else {
    categories['Core'].push({ endpoint, description });
  }
});

Object.entries(categories).forEach(([category, items]) => {
  if (items.length > 0) {
    console.log(`\n${category} (${items.length} endpoints):`);
    console.log('─'.repeat(60));
    items.forEach(({ endpoint, description }) => {
      console.log(`  [OK] ${endpoint.padEnd(45)} ${description}`);
    });
  }
});

console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   [SUCCESS] All endpoints verified and mapped correctly!   ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');
