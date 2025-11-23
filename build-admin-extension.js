import { copyFileSync, existsSync, mkdirSync, cpSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('📦 Building Admin Extension...');

const distAdmin = resolve(__dirname, 'dist-admin');

// Ensure dist-admin exists
if (!existsSync(distAdmin)) {
  mkdirSync(distAdmin, { recursive: true });
}

// Copy manifest.json
const manifestSrc = resolve(__dirname, 'admin-panel/manifest.json');
const manifestDest = resolve(distAdmin, 'manifest.json');
copyFileSync(manifestSrc, manifestDest);
console.log('✅ Copied manifest.json');

// Copy background.js
const backgroundSrc = resolve(__dirname, 'admin-panel/background.js');
const backgroundDest = resolve(distAdmin, 'background.js');
copyFileSync(backgroundSrc, backgroundDest);
console.log('✅ Copied background.js');

// Copy icon folder
const iconSrc = resolve(__dirname, 'icon');
const iconDest = resolve(distAdmin, 'icon');
if (existsSync(iconSrc)) {
  cpSync(iconSrc, iconDest, { recursive: true });
  console.log('✅ Copied icon folder');
}

console.log('✅ Admin Extension built successfully!');
console.log('📁 Output: dist-admin/');
console.log('');
console.log('To load the extension:');
console.log('1. Open Chrome → Extensions → Enable Developer Mode');
console.log('2. Click "Load unpacked"');
console.log('3. Select the "dist-admin" folder');
