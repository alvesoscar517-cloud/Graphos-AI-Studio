import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Copy a file
function copyFile(src, dest) {
  try {
    const destDir = dirname(dest)
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true })
    }
    copyFileSync(src, dest)
    console.log(`[OK] Copied: ${src} -> ${dest}`)
  } catch (error) {
    console.error(`[ERROR] Error copying ${src}:`, error.message)
  }
}

// Copy directory recursively
function copyDir(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true })
  }

  const entries = readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

console.log('[BUILD] Building Chrome Extension...\n')

// Create dist directory if it doesn't exist
if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true })
}

// Copy manifest.json
copyFile('manifest.json', 'dist/manifest.json')

// Copy background.js
copyFile('background.js', 'dist/background.js')

// Copy icons
if (existsSync('icons')) {
  console.log('[FOLDER] Copying icons...')
  copyDir('icons', 'dist/icons')
}

// Copy icon folder
if (existsSync('icon')) {
  console.log('[FOLDER] Copying icon...')
  copyDir('icon', 'dist/icon')
}

// Copy animation folder
if (existsSync('animation')) {
  console.log('[FOLDER] Copying animations...')
  copyDir('animation', 'dist/animation')
}

// Copy public folder contents
if (existsSync('public')) {
  console.log('[FOLDER] Copying public assets...')
  const publicFiles = readdirSync('public')
  publicFiles.forEach(file => {
    const srcPath = join('public', file)
    const destPath = join('dist', file)
    
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFile(srcPath, destPath)
    }
  })
}

console.log('\n[SUCCESS] Extension files copied successfully!')
console.log('\n[PACKAGE] Next steps:')
console.log('1. Run: npm run build:watch')
console.log('2. Open Chrome and go to: chrome://extensions/')
console.log('3. Enable "Developer mode"')
console.log('4. Click "Load unpacked" and select the "dist" folder')
console.log('5. Make changes to your code - the extension will auto-rebuild!')
