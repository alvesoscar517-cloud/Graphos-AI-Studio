#!/usr/bin/env node

/**
 * Script để chuyển đổi <img src="/icon/..."> sang Icon component
 * Xử lý:
 * - Chuyển đổi img tags sang Icon component
 * - Loại bỏ icon-invert, brightness-0 invert, filter-icon-* classes
 * - Giữ lại opacity classes
 * - Xử lý size mapping
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Danh sách custom icons (SVG)
const CUSTOM_ICONS = [
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
]

// Mapping từ SVG icon names sang lucide-react names
const ICON_MAPPING = {
  'x': 'x',
  'plus': 'plus',
  'panel-left': 'panel-left',
  'file-text': 'file-text',
  'paperclip': 'paperclip',
  'send': 'send',
  'file': 'file',
  'trash-2': 'trash-2',
  'refresh-cw': 'refresh-cw',
  'search': 'search',
  'message-square': 'message-square',
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  'type': 'type',
  'tags': 'tags',
  'shopping-cart': 'shopping-cart',
  'info': 'info',
  'credit-card': 'credit-card',
  'gift': 'gift',
}

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

// Xác định color từ className
function extractColor(className) {
  if (className.includes('text-success')) return 'success'
  if (className.includes('text-warning')) return 'warning'
  if (className.includes('text-error')) return 'error'
  if (className.includes('text-primary')) return 'primary'
  if (className.includes('text-text-muted')) return 'muted'
  return 'default'
}

// Xác định opacity từ className
function extractOpacity(className) {
  const opacityMatch = className.match(/opacity-(\d+)/)
  return opacityMatch ? `opacity-${opacityMatch[1]}` : ''
}

// Xác định các classes khác cần giữ lại (không phải icon-invert, brightness, filter)
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
  const color = extractColor(className)
  const opacity = extractOpacity(className)
  const otherClasses = extractOtherClasses(className)

  // Xây dựng className mới
  let newClassName = otherClasses
  if (opacity) newClassName = `${newClassName} ${opacity}`.trim()

  // Xây dựng Icon component
  let iconComponent = `<Icon name="${iconName}"`
  if (alt) iconComponent += ` alt="${alt}"`
  if (size !== 'md') iconComponent += ` size="${size}"`
  if (color !== 'default') iconComponent += ` color="${color}"`
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
    // Kiểm tra xem icon này có trong CUSTOM_ICONS hoặc ICON_MAPPING không
    if (CUSTOM_ICONS.includes(iconName) || ICON_MAPPING[iconName]) {
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

// Main
const srcDir = path.join(__dirname, '../src')

// Recursive function to get all JSX files
function getAllJsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      getAllJsxFiles(filePath, fileList)
    } else if (file.endsWith('.jsx')) {
      fileList.push(path.relative(srcDir, filePath))
    }
  })
  return fileList
}

const jsxFiles = getAllJsxFiles(srcDir)

let processedCount = 0
let errorCount = 0

console.log('🔄 Converting <img src="/icon/..."> to Icon component...\n')

jsxFiles.forEach(file => {
  const filePath = path.join(srcDir, file)
  try {
    if (processFile(filePath)) {
      console.log(`✅ ${file}`)
      processedCount++
    }
  } catch (error) {
    console.error(`❌ ${file}: ${error.message}`)
    errorCount++
  }
})

console.log(`\n============================================================`)
console.log(`📊 SUMMARY`)
console.log(`============================================================`)
console.log(`✅ Files processed: ${processedCount}`)
console.log(`❌ Errors: ${errorCount}`)
console.log(`\n✨ Migration complete!`)
