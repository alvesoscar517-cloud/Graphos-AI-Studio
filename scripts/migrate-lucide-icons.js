#!/usr/bin/env node

/**
 * Script để chuyển đổi lucide-react icons từ <img src="/icon/..."> sang Icon component
 * Xử lý các icon như: x, plus, panel-left, file-text, v.v.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Danh sách lucide-react icons (có trong /icon/ folder nhưng cũng có trong lucide-react)
const LUCIDE_ICONS = [
  'x',
  'plus',
  'panel-left',
  'file-text',
  'paperclip',
  'send',
  'file',
  'trash-2',
  'refresh-cw',
  'search',
  'message-square',
  'chevron-left',
  'chevron-right',
  'type',
  'tags',
  'shopping-cart',
  'info',
  'credit-card',
  'gift',
]

// Size mapping từ CSS classes sang Icon size prop
const SIZE_MAPPING = {
  'w-icon-2xs': 'xs',
  'w-icon-xs': 'xs',
  'w-icon-sm': 'sm',
  'w-icon-md': 'md',
  'w-icon-lg': 'lg',
  'w-icon-xl': 'xl',
  'w-icon-2xl': '2xl',
  'w-2.5': 'xs',
  'w-3': 'xs',
  'w-3.5': 'sm',
  'w-4': 'md',
  'w-5': 'lg',
  'w-6': 'xl',
  'w-7': '2xl',
  'w-20': '2xl',
}

// Xác định size từ className
function extractSize(className) {
  const sizeClasses = Object.keys(SIZE_MAPPING)
  for (const sizeClass of sizeClasses) {
    if (className.includes(sizeClass)) {
      return SIZE_MAPPING[sizeClass]
    }
  }
  return 'md' // default
}

// Xác định opacity từ className
function extractOpacity(className) {
  const opacityMatch = className.match(/opacity-(\d+)/)
  return opacityMatch ? `opacity-${opacityMatch[1]}` : ''
}

// Xác định các classes khác cần giữ lại
function extractOtherClasses(className) {
  const classesToRemove = [
    'icon-invert',
    'brightness-0',
    'invert',
    /filter-icon-\w+/,
    /brightness-\[\d+\]/,
    /saturate\(\d+%\)/,
    /hue-rotate\(\d+deg\)/,
    /sepia\(\d+%\)/,
    /contrast\(\d+%\)/,
    /invert\(\d+%\)/,
    /w-icon-\w+/,
    /h-icon-\w+/,
    /w-\d+\.?\d*/,
    /h-\d+\.?\d*/,
  ]

  let result = className
  classesToRemove.forEach(toRemove => {
    if (typeof toRemove === 'string') {
      result = result.replace(new RegExp(`\\b${toRemove}\\b`, 'g'), '')
    } else {
      result = result.replace(toRemove, '')
    }
  })

  // Clean up multiple spaces
  result = result.replace(/\s+/g, ' ').trim()
  return result
}

// Chuyển đổi img tag sang Icon component
function convertImgToIcon(imgTag, iconName) {
  const classMatch = imgTag.match(/className=["']([^"']*)["']/)
  const className = classMatch ? classMatch[1] : ''
  const altMatch = imgTag.match(/alt=["']([^"']*)["']/)
  const alt = altMatch ? altMatch[1] : ''

  const size = extractSize(className)
  const opacity = extractOpacity(className)
  const otherClasses = extractOtherClasses(className)

  // Xây dựng className mới
  let newClassName = otherClasses
  if (opacity) newClassName = `${newClassName} ${opacity}`.trim()

  // Xây dựng Icon component
  let iconComponent = `<Icon name="${iconName}"`
  if (alt) iconComponent += ` alt="${alt}"`
  if (size !== 'md') iconComponent += ` size="${size}"`
  if (newClassName) iconComponent += ` className="${newClassName}"`
  iconComponent += ' />'

  return iconComponent
}

// Xử lý một file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')
  let modified = false

  // Regex để tìm img tags với /icon/
  const imgRegex = /<img\s+src=["']\/icon\/([^"']+)\.svg["'][^>]*>/g

  content = content.replace(imgRegex, (match, iconName) => {
    // Chỉ xử lý lucide-react icons
    if (LUCIDE_ICONS.includes(iconName)) {
      modified = true
      return convertImgToIcon(match, iconName)
    }
    return match
  })

  // Nếu có thay đổi, kiểm tra xem file có import Icon không
  if (modified) {
    if (!content.includes("import Icon from")) {
      // Tìm vị trí import đầu tiên
      const importMatch = content.match(/^import\s+/m)
      if (importMatch) {
        const insertPos = content.indexOf('\n', importMatch.index) + 1
        content = content.slice(0, insertPos) + "import Icon from '../Common/Icon'\n" + content.slice(insertPos)
      }
    }

    fs.writeFileSync(filePath, content, 'utf-8')
    return true
  }

  return false
}

// Recursive function to get all JSX files
function getAllJsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      getAllJsxFiles(filePath, fileList)
    } else if (file.endsWith('.jsx')) {
      fileList.push(filePath)
    }
  })
  return fileList
}

// Main
const srcDir = path.join(__dirname, '../src')
const jsxFiles = getAllJsxFiles(srcDir)

let processedCount = 0
let errorCount = 0

console.log('🔄 Converting lucide-react <img src="/icon/..."> to Icon component...\n')

jsxFiles.forEach(filePath => {
  try {
    if (processFile(filePath)) {
      console.log(`✅ ${path.relative(srcDir, filePath)}`)
      processedCount++
    }
  } catch (error) {
    console.error(`❌ ${path.relative(srcDir, filePath)}: ${error.message}`)
    errorCount++
  }
})

console.log(`\n============================================================`)
console.log(`📊 SUMMARY`)
console.log(`============================================================`)
console.log(`✅ Files processed: ${processedCount}`)
console.log(`❌ Errors: ${errorCount}`)
console.log(`\n✨ Migration complete!`)
