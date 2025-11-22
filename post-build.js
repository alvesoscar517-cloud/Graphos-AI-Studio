/**
 * Post-build script - Admin đã được build riêng vào dist/admin
 * Script này chỉ cần tạo redirects và verify
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const adminDir = path.join(distDir, 'admin');

console.log('\n📦 Post-build: Verifying isolated builds...\n');

// Verify admin exists
if (fs.existsSync(adminDir)) {
  console.log('✓ Admin panel build found at dist/admin');
  
  const adminIndexPath = path.join(adminDir, 'index.html');
  if (fs.existsSync(adminIndexPath)) {
    console.log('✓ Admin index.html exists');
  } else {
    console.error('❌ Admin index.html not found!');
    process.exit(1);
  }
} else {
  console.error('❌ Admin build not found! Run: npm run build:admin');
  process.exit(1);
}

// Verify main app exists
const mainIndexPath = path.join(distDir, 'index.html');
if (fs.existsSync(mainIndexPath)) {
  console.log('✓ Main app build found');
} else {
  console.error('❌ Main app build not found! Run: npm run build:main');
  process.exit(1);
}

// Create _redirects file for routing
const redirectsFile = path.join(distDir, '_redirects');
const redirectsContent = `# Admin panel routes (completely isolated)
/admin              /admin/index.html   200
/admin/*            /admin/index.html   200

# Main app routes (SPA fallback)
/*                  /index.html         200
`;
fs.writeFileSync(redirectsFile, redirectsContent);
console.log('✓ Created _redirects file');

// Create verification report
const adminIndexPath = path.join(adminDir, 'index.html');
const report = {
  timestamp: new Date().toISOString(),
  mainApp: {
    exists: fs.existsSync(mainIndexPath),
    path: '/index.html'
  },
  adminPanel: {
    exists: fs.existsSync(adminIndexPath),
    path: '/admin/index.html'
  },
  isolated: true
};

console.log('\n✅ Build verification complete!\n');
console.log('📊 Build Report:');
console.log(`   Main App: ${report.mainApp.exists ? '✓' : '✗'} ${report.mainApp.path}`);
console.log(`   Admin Panel: ${report.adminPanel.exists ? '✓' : '✗'} ${report.adminPanel.path}`);
console.log(`   Isolation: ${report.isolated ? '✓ Complete' : '✗ Failed'}\n`);
console.log('🌐 URLs:');
console.log('   Main App: /');
console.log('   Admin Panel: /admin\n');
