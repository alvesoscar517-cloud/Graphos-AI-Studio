/**
 * Clear development storage
 * Run this in browser console to clear all dev-related localStorage
 */

console.log('🧹 Clearing development storage...')

// Clear dev test profile
localStorage.removeItem('dev_test_profile')
console.log('[SUCCESS] Cleared dev_test_profile')

// Clear active profile
localStorage.removeItem('activeProfileId')
localStorage.removeItem('activeProfileName')
console.log('[SUCCESS] Cleared active profile')

// Clear profile cache invalidation flag
localStorage.removeItem('profileCacheInvalidated')
console.log('[SUCCESS] Cleared cache invalidation flag')

// List remaining items
console.log('\n📋 Remaining localStorage items:')
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  console.log(`  - ${key}`)
}

console.log('\n[SUCCESS] Development storage cleared!')
console.log('💡 Refresh the page to reload with clean state')
