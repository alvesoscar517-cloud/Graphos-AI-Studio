/**
 * Formatting utilities for admin panel
 * Number, currency, and text formatting
 */

/**
 * Format number with locale
 * @param {number} value
 * @param {object} options - Intl.NumberFormat options
 */
export function formatNumber(value, options = {}) {
  if (value === null || value === undefined) return 'N/A'
  return new Intl.NumberFormat('vi-VN', options).format(value)
}

/**
 * Format currency (VND)
 * @param {number} value
 * @param {string} currency - Currency code (default: VND)
 */
export function formatCurrency(value, currency = 'VND') {
  if (value === null || value === undefined) return 'N/A'
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format USD currency
 */
export function formatUSD(value) {
  if (value === null || value === undefined) return 'N/A'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format percentage
 * @param {number} value - Value between 0 and 100
 * @param {number} decimals - Decimal places
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return 'N/A'
  return `${value.toFixed(decimals)}%`
}

/**
 * Format large numbers with abbreviations
 * @param {number} value
 */
export function formatCompact(value) {
  if (value === null || value === undefined) return 'N/A'
  
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

/**
 * Format file size
 * @param {number} bytes
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  if (!bytes) return 'N/A'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Format user ID for display (shortened)
 * @param {string} id
 */
export function formatUserId(id) {
  if (!id) return 'N/A'
  if (id.length <= 12) return id
  return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`
}

/**
 * Format email for display (partially hidden)
 * @param {string} email
 */
export function formatEmailHidden(email) {
  if (!email) return 'N/A'
  const [local, domain] = email.split('@')
  if (!domain) return email
  
  const hiddenLocal = local.length > 3 
    ? `${local.substring(0, 2)}***${local.substring(local.length - 1)}`
    : `${local[0]}***`
  
  return `${hiddenLocal}@${domain}`
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convert snake_case or kebab-case to Title Case
 */
export function toTitleCase(str) {
  if (!str) return ''
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default {
  formatNumber,
  formatCurrency,
  formatUSD,
  formatPercent,
  formatCompact,
  formatFileSize,
  truncateText,
  formatUserId,
  formatEmailHidden,
  capitalize,
  toTitleCase,
}
