/**
 * Post-build script for Chrome Extension
 * Admin is a separate system - not included in extension build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const adminDir = path.join(distDir, 'admin');

console.log('\n[PACKAGE] Post-build: Chrome Extension build...\n');

// Remove admin folder if exists (admin is separate system)
if (fs.existsSync(adminDir)) {
  fs.rmSync(adminDir, { recursive: true, force: true });
  console.log('[OK] Removed admin folder (separate system)');
}

// Verify main app exists
const mainIndexPath = path.join(distDir, 'index.html');
if (fs.existsSync(mainIndexPath)) {
  console.log('[OK] Main app build found');
} else {
  console.error('[FAIL] Main app build not found!');
  process.exit(1);
}

console.log('\n[SUCCESS] Extension build ready!\n');
