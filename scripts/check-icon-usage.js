/**
 * Script kiểm tra và liệt kê tất cả icon đang được sử dụng trong code
 * So sánh với danh sách custom icons để tìm những icon cần chuyển sang lucide-react
 * 
 * Cách sử dụng:
 *   node scripts/check-icon-usage.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

// Danh sách icon custom (không có trong lucide-react)
const CUSTOM_ICONS = new Set([
  'coins',
  'gift-banner',
  'x2-credits',
  'x2-badge',
  'lemonsqueezy-with-name',
  'lemonsqueezy',
  'crown-power',
  'crown-basic',
  'crown-pro',
  'crown-pro-plus',
  'crown-ultimate',
  'lightbulb',
  'lightbulb-off',
  'graphos-ai-studio-logo',
  'Gemini',
  'google-drive-svgrepo-com',
])

// Tìm tất cả file JSX/TSX
function findFiles(dir, extensions, files = []) {
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('dist')) {
      findFiles(fullPath, extensions, files)
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath)
    }
  }
  
  return files
}

// Tìm tất cả icon được sử dụng trong một file
function findIconsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const icons = new Set()
  
  // Pattern 1: src="/icon/xxx.svg"
  const pattern1 = /src=["'](\/icon\/([a-zA-Z0-9-]+)\.svg)["']/g
  let match
  while ((match = pattern1.exec(content)) !== null) {
    icons.add({ name: match[2], fullPath: match[1], type: 'static' })
  }
  
  // Pattern 2: src={`/icon/${xxx}.svg`}
  const pattern2 = /src=\{`\/icon\/\$\{([^}]+)\}\.svg`\}/g
  while ((match = pattern2.exec(content)) !== null) {
    icons.add({ name: `DYNAMIC: ${match[1]}`, fullPath: 'dynamic', type: 'dynamic' })
  }
  
  // Pattern 3: icon: '/icon/xxx.svg'
  const pattern3 = /icon:\s*['"]\/icon\/([a-zA-Z0-9-]+)\.svg['"]/g
  while ((match = pattern3.exec(content)) !== null) {
    icons.add({ name: match[1], fullPath: `/icon/${match[1]}.svg`, type: 'config' })
  }
  
  // Pattern 4: '/icon/xxx.svg' (string literal)
  const pattern4 = /['"]\/icon\/([a-zA-Z0-9-]+)\.svg['"]/g
  while ((match = pattern4.exec(content)) !== null) {
    icons.add({ name: match[1], fullPath: `/icon/${match[1]}.svg`, type: 'string' })
  }
  
  return Array.from(icons)
}

console.log('🔍 Checking icon usage in codebase...\n')

const srcDir = path.join(ROOT_DIR, 'src')
const files = findFiles(srcDir, ['.jsx', '.tsx', '.js', '.ts'])

const allIcons = new Map() // icon name -> [{ file, type }]
const fileIconMap = new Map() // file -> [icons]

for (const file of files) {
  const icons = findIconsInFile(file)
  if (icons.length > 0) {
    const relPath = path.relative(ROOT_DIR, file)
    fileIconMap.set(relPath, icons)
    
    for (const icon of icons) {
      if (!allIcons.has(icon.name)) {
        allIcons.set(icon.name, [])
      }
      allIcons.get(icon.name).push({ file: relPath, type: icon.type })
    }
  }
}

// Phân loại icons
const customIconsUsed = []
const lucideIconsUsed = []
const dynamicIcons = []

for (const [iconName, usages] of allIcons) {
  if (iconName.startsWith('DYNAMIC:')) {
    dynamicIcons.push({ name: iconName, usages })
  } else if (CUSTOM_ICONS.has(iconName)) {
    customIconsUsed.push({ name: iconName, usages })
  } else {
    lucideIconsUsed.push({ name: iconName, usages })
  }
}

console.log('=' .repeat(60))
console.log('📊 SUMMARY')
console.log('=' .repeat(60))
console.log(`Total unique icons found: ${allIcons.size}`)
console.log(`Custom icons (keep SVG): ${customIconsUsed.length}`)
console.log(`Lucide icons (need migration): ${lucideIconsUsed.length}`)
console.log(`Dynamic icons (manual review): ${dynamicIcons.length}`)

if (lucideIconsUsed.length > 0) {
  console.log('\n' + '=' .repeat(60))
  console.log('⚠️  ICONS THAT NEED MIGRATION TO LUCIDE-REACT')
  console.log('=' .repeat(60))
  
  for (const { name, usages } of lucideIconsUsed.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`\n📌 ${name}`)
    for (const { file, type } of usages) {
      console.log(`   └─ ${file} (${type})`)
    }
  }
}

if (dynamicIcons.length > 0) {
  console.log('\n' + '=' .repeat(60))
  console.log('🔄 DYNAMIC ICONS (MANUAL REVIEW NEEDED)')
  console.log('=' .repeat(60))
  
  for (const { name, usages } of dynamicIcons) {
    console.log(`\n📌 ${name}`)
    for (const { file, type } of usages) {
      console.log(`   └─ ${file}`)
    }
  }
}

if (customIconsUsed.length > 0) {
  console.log('\n' + '=' .repeat(60))
  console.log('✅ CUSTOM ICONS (KEEP AS SVG)')
  console.log('=' .repeat(60))
  
  for (const { name, usages } of customIconsUsed.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`\n📌 ${name}`)
    for (const { file, type } of usages) {
      console.log(`   └─ ${file} (${type})`)
    }
  }
}

// Export danh sách cần migrate
if (lucideIconsUsed.length > 0) {
  console.log('\n' + '=' .repeat(60))
  console.log('📝 FILES THAT NEED UPDATES')
  console.log('=' .repeat(60))
  
  const filesToUpdate = new Set()
  for (const { usages } of lucideIconsUsed) {
    for (const { file } of usages) {
      filesToUpdate.add(file)
    }
  }
  
  for (const file of Array.from(filesToUpdate).sort()) {
    const icons = fileIconMap.get(file).filter(i => !CUSTOM_ICONS.has(i.name) && !i.name.startsWith('DYNAMIC:'))
    console.log(`\n📄 ${file}`)
    console.log(`   Icons: ${icons.map(i => i.name).join(', ')}`)
  }
}
