/**
 * Script tự động chuyển đổi từ SVG icon offline sang lucide-react
 * 
 * Cách sử dụng:
 *   node scripts/migrate-to-lucide-react.js [--dry-run] [--file=path/to/file.jsx]
 * 
 * Options:
 *   --dry-run    Chỉ hiển thị các thay đổi, không ghi file
 *   --file=...   Chỉ xử lý một file cụ thể
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

// Danh sách icon KHÔNG chuyển đổi (icon custom, không có trong lucide-react)
const EXCLUDED_ICONS = [
  'coins',
  'gift-banner', 
  'x2-credits',
  'lemonsqueezy-with-name',
  'crown-power',
  'lightbulb', // có thể dùng Lightbulb từ lucide nhưng style khác
]

// Mapping tên icon kebab-case sang PascalCase component name
const ICON_NAME_MAP = {
  'panel-left': 'PanelLeft',
  'panel-right': 'PanelRight',
  'message-circle': 'MessageCircle',
  'message-square': 'MessageSquare',
  'wand-sparkles': 'WandSparkles',
  'scan-search': 'ScanSearch',
  'bar-chart': 'BarChart',
  'plus-circle': 'PlusCircle',
  'minus-circle': 'MinusCircle',
  'rotate-ccw': 'RotateCcw',
  'refresh-cw': 'RefreshCw',
  'chevron-down': 'ChevronDown',
  'chevron-up': 'ChevronUp',
  'chevron-left': 'ChevronLeft',
  'chevron-right': 'ChevronRight',
  'check-circle': 'CheckCircle',
  'file-text': 'FileText',
  'book-open': 'BookOpen',
  'align-left': 'AlignLeft',
  'eye-off': 'EyeOff',
  'trash-2': 'Trash2',
  'edit-2': 'Edit2',
  'user-check': 'UserCheck',
  'shield-check': 'ShieldCheck',
  'credit-card': 'CreditCard',
  'shopping-cart': 'ShoppingCart',
  'dollar-sign': 'DollarSign',
  'trending-up': 'TrendingUp',
  'audio-lines': 'AudioLines',
}

/**
 * Chuyển đổi tên icon từ kebab-case sang PascalCase
 */
function toComponentName(name) {
  if (ICON_NAME_MAP[name]) {
    return ICON_NAME_MAP[name]
  }
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/**
 * Chuyển đổi size class sang pixel size
 */
function extractSizeFromClass(className) {
  // Mapping từ Tailwind class sang pixel size
  const sizePatterns = [
    { pattern: /w-icon-2xs/, size: 10 },
    { pattern: /w-3\s|w-3$|h-3\s|h-3$/, size: 12 },
    { pattern: /w-3\.5|h-3\.5|w-icon-sm/, size: 14 },
    { pattern: /w-4\s|w-4$|h-4\s|h-4$|w-icon-md/, size: 16 },
    { pattern: /w-5\s|w-5$|h-5\s|h-5$|w-icon-lg/, size: 20 },
    { pattern: /w-6\s|w-6$|h-6\s|h-6$|w-icon-xl/, size: 24 },
    { pattern: /w-icon-2xl/, size: 28 },
    { pattern: /w-8\s|w-8$|h-8\s|h-8$/, size: 32 },
    { pattern: /w-16\s|w-16$|h-16\s|h-16$/, size: 64 },
  ]
  
  for (const { pattern, size } of sizePatterns) {
    if (pattern.test(className)) {
      return size
    }
  }
  return 16 // default md
}

/**
 * Loại bỏ các class liên quan đến size và icon-invert
 */
function cleanClassName(className) {
  return className
    // Loại bỏ size classes
    .replace(/w-\d+(\.\d+)?\s*/g, '')
    .replace(/h-\d+(\.\d+)?\s*/g, '')
    .replace(/w-icon-\w+\s*/g, '')
    .replace(/h-icon-\w+\s*/g, '')
    // Loại bỏ icon-invert (lucide-react tự động handle)
    .replace(/icon-invert(-reverse)?\s*/g, '')
    // Loại bỏ brightness/invert filters
    .replace(/brightness-0\s*/g, '')
    .replace(/invert\s*/g, '')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Xử lý một file JSX
 */
function processFile(filePath, dryRun = false) {
  const content = fs.readFileSync(filePath, 'utf-8')
  let newContent = content
  let hasChanges = false
  const iconsUsed = new Set()
  const skippedIcons = new Set()

  // Pattern 1: <img src="/icon/xxx.svg" ... />
  // Regex để match các img tag với icon
  const imgPattern = /<img\s+([^>]*?)src=["'](\/icon\/([a-z0-9-]+)\.svg)["']([^>]*?)\s*\/?>/gi
  
  newContent = newContent.replace(imgPattern, (match, beforeSrc, fullPath, iconName, afterSrc) => {
    // Kiểm tra icon có trong danh sách loại trừ không
    if (EXCLUDED_ICONS.includes(iconName)) {
      skippedIcons.add(iconName)
      return match // Giữ nguyên
    }

    hasChanges = true
    const componentName = toComponentName(iconName)
    iconsUsed.add(componentName)

    // Lấy className từ attributes
    const classMatch = (beforeSrc + afterSrc).match(/className=["']([^"']+)["']/)
    const className = classMatch ? classMatch[1] : ''
    
    // Xác định size từ className
    const size = extractSizeFromClass(className)
    
    // Clean className
    const cleanedClass = cleanClassName(className)
    
    // Tạo component mới
    let newComponent = `<${componentName}`
    if (size !== 16) {
      newComponent += ` size={${size}}`
    }
    if (cleanedClass) {
      newComponent += ` className="${cleanedClass}"`
    }
    newComponent += ' />'
    
    return newComponent
  })

  // Pattern 2: src={`/icon/${variable}.svg`} - dynamic icons
  // Cần xử lý riêng vì không thể chuyển đổi tự động
  const dynamicPattern = /src=\{`\/icon\/\$\{([^}]+)\}\.svg`\}/g
  const dynamicMatches = content.match(dynamicPattern)
  if (dynamicMatches) {
    console.log(`  ⚠️  Found ${dynamicMatches.length} dynamic icon(s) - manual review needed`)
  }

  // Pattern 3: icon: '/icon/xxx.svg' trong object
  const objectPattern = /icon:\s*['"]\/icon\/([a-z0-9-]+)\.svg['"]/gi
  newContent = newContent.replace(objectPattern, (match, iconName) => {
    if (EXCLUDED_ICONS.includes(iconName)) {
      skippedIcons.add(iconName)
      return match
    }
    hasChanges = true
    iconsUsed.add(toComponentName(iconName))
    return `icon: '${iconName}'`
  })

  // Thêm import statement nếu có thay đổi
  if (iconsUsed.size > 0) {
    const importStatement = `import { ${Array.from(iconsUsed).sort().join(', ')} } from 'lucide-react'`
    
    // Kiểm tra xem đã có import lucide-react chưa
    if (!newContent.includes("from 'lucide-react'")) {
      // Tìm vị trí import cuối cùng
      const lastImportMatch = newContent.match(/^import .+ from ['"][^'"]+['"];?\s*$/gm)
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1]
        const insertPos = newContent.lastIndexOf(lastImport) + lastImport.length
        newContent = newContent.slice(0, insertPos) + '\n' + importStatement + newContent.slice(insertPos)
      } else {
        // Không có import nào, thêm vào đầu file
        newContent = importStatement + '\n' + newContent
      }
    } else {
      // Đã có import, cần merge
      newContent = newContent.replace(
        /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/,
        (match, existingImports) => {
          const existing = existingImports.split(',').map(s => s.trim()).filter(Boolean)
          const merged = [...new Set([...existing, ...iconsUsed])].sort()
          return `import { ${merged.join(', ')} } from 'lucide-react'`
        }
      )
    }
  }

  // Output results
  if (hasChanges) {
    console.log(`\n📄 ${path.relative(ROOT_DIR, filePath)}`)
    console.log(`   ✅ Icons converted: ${Array.from(iconsUsed).join(', ')}`)
    if (skippedIcons.size > 0) {
      console.log(`   ⏭️  Icons skipped: ${Array.from(skippedIcons).join(', ')}`)
    }
    
    if (!dryRun) {
      fs.writeFileSync(filePath, newContent, 'utf-8')
      console.log(`   💾 File saved`)
    } else {
      console.log(`   🔍 Dry run - no changes written`)
    }
  }

  return { hasChanges, iconsUsed, skippedIcons }
}

/**
 * Tìm tất cả file JSX trong thư mục src
 */
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

// Main execution
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const fileArg = args.find(a => a.startsWith('--file='))
const specificFile = fileArg ? fileArg.split('=')[1] : null

console.log('🚀 Lucide React Migration Script')
console.log('================================')
if (dryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified\n')
}

let totalFiles = 0
let modifiedFiles = 0
const allIcons = new Set()

if (specificFile) {
  const filePath = path.resolve(ROOT_DIR, specificFile)
  if (fs.existsSync(filePath)) {
    const result = processFile(filePath, dryRun)
    if (result.hasChanges) modifiedFiles++
    result.iconsUsed.forEach(i => allIcons.add(i))
    totalFiles = 1
  } else {
    console.error(`❌ File not found: ${specificFile}`)
    process.exit(1)
  }
} else {
  const srcDir = path.join(ROOT_DIR, 'src')
  const files = findJsxFiles(srcDir)
  totalFiles = files.length
  
  for (const file of files) {
    const result = processFile(file, dryRun)
    if (result.hasChanges) modifiedFiles++
    result.iconsUsed.forEach(i => allIcons.add(i))
  }
}

console.log('\n================================')
console.log(`📊 Summary:`)
console.log(`   Total files scanned: ${totalFiles}`)
console.log(`   Files modified: ${modifiedFiles}`)
console.log(`   Unique icons used: ${allIcons.size}`)
if (allIcons.size > 0) {
  console.log(`   Icons: ${Array.from(allIcons).sort().join(', ')}`)
}
