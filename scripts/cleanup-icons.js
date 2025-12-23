/**
 * Script dọn dẹp sau khi migrate sang lucide-react:
 * 1. Xóa các icon SVG không cần thiết (chỉ giữ custom icons)
 * 2. Clean code - loại bỏ icon-invert, brightness-0 invert, filter hacks
 * 
 * Cách sử dụng:
 *   node scripts/cleanup-icons.js [--dry-run]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

// Danh sách icon custom cần GIỮ LẠI
const CUSTOM_ICONS_TO_KEEP = [
  'coins.svg',
  'gift-banner.svg',
  'x2-credits.svg',
  'x2-badge.svg',
  'lemonsqueezy-with-name.svg',
  'lemonsqueezy.svg',
  'crown-power.svg',
  'crown-basic.svg',
  'crown-pro.svg',
  'crown-pro-plus.svg',
  'crown-ultimate.svg',
  'lightbulb.svg',
  'lightbulb-off.svg',
  'graphos-ai-studio-logo.svg',
  'Gemini.svg',
  'google-drive-svgrepo-com.svg',
  // Thêm các icon custom khác nếu cần
]

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

console.log('🧹 Icon Cleanup Script')
console.log('======================')
if (dryRun) {
  console.log('🔍 DRY RUN MODE - No files will be deleted\n')
}

// 1. Xóa icon SVG không cần thiết
const iconDir = path.join(ROOT_DIR, 'public', 'icon')
if (fs.existsSync(iconDir)) {
  const files = fs.readdirSync(iconDir)
  let deletedCount = 0
  let keptCount = 0
  
  console.log('\n📁 Cleaning public/icon directory...')
  
  for (const file of files) {
    if (!file.endsWith('.svg')) continue
    
    if (CUSTOM_ICONS_TO_KEEP.includes(file)) {
      keptCount++
      console.log(`  ✅ Keeping: ${file}`)
    } else {
      deletedCount++
      if (!dryRun) {
        fs.unlinkSync(path.join(iconDir, file))
      }
    }
  }
  
  console.log(`\n  📊 Icons deleted: ${deletedCount}`)
  console.log(`  📊 Icons kept: ${keptCount}`)
}

// 2. Clean code - loại bỏ icon-invert và filter hacks
console.log('\n📝 Cleaning code files...')

function findJsxFiles(dir, files = []) {
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory() && !item.includes('node_modules')) {
      findJsxFiles(fullPath, files)
    } else if (item.endsWith('.jsx') || item.endsWith('.tsx')) {
      files.push(fullPath)
    }
  }
  
  return files
}

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')
  const originalContent = content
  
  // Patterns to remove/clean
  const cleanPatterns = [
    // Remove icon-invert class
    { pattern: /\s*icon-invert(-reverse)?/g, replacement: '' },
    // Remove brightness-0 invert (used for forcing white icons)
    { pattern: /\s*brightness-0\s+invert/g, replacement: '' },
    { pattern: /\s*brightness-0/g, replacement: '' },
    // Remove standalone invert (but keep as part of other words)
    { pattern: /\s+invert(?=["'\s}])/g, replacement: '' },
    // Clean up filter-icon-* classes (these are now handled by text color)
    // Keep these for now as they might still be used for SVG fallbacks
  ]
  
  for (const { pattern, replacement } of cleanPatterns) {
    content = content.replace(pattern, replacement)
  }
  
  // Clean up double spaces in className
  content = content.replace(/className="([^"]*)\s{2,}([^"]*)"/g, 'className="$1 $2"')
  content = content.replace(/className="\s+/g, 'className="')
  content = content.replace(/\s+"/g, '"')
  
  if (content !== originalContent) {
    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf-8')
    }
    return true
  }
  return false
}

const srcDir = path.join(ROOT_DIR, 'src')
const files = findJsxFiles(srcDir)
let cleanedCount = 0

for (const file of files) {
  if (cleanFile(file)) {
    cleanedCount++
    console.log(`  🧹 Cleaned: ${path.relative(ROOT_DIR, file)}`)
  }
}

console.log(`\n  📊 Files cleaned: ${cleanedCount}`)

console.log('\n======================')
console.log('✅ Cleanup complete!')
if (dryRun) {
  console.log('🔍 This was a dry run. Run without --dry-run to apply changes.')
}
