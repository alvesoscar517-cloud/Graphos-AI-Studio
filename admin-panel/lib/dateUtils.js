/**
 * Date utilities using date-fns
 * Lightweight date formatting and manipulation
 */

import {
  format,
  formatDistanceToNow,
  formatRelative,
  isToday,
  isYesterday,
  isThisWeek,
  isThisYear,
  parseISO,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  addDays,
} from 'date-fns'
import { vi, enUS } from 'date-fns/locale'

// Default locale
const defaultLocale = vi

/**
 * Parse date string or timestamp to Date object
 */
export function parseDate(date) {
  if (!date) return null
  if (date instanceof Date) return date
  if (typeof date === 'string') return parseISO(date)
  if (typeof date === 'number') return new Date(date)
  return null
}

/**
 * Format date to readable string
 * @param {Date|string|number} date
 * @param {string} formatStr - date-fns format string
 */
export function formatDate(date, formatStr = 'dd/MM/yyyy') {
  const parsed = parseDate(date)
  if (!parsed) return 'N/A'
  return format(parsed, formatStr, { locale: defaultLocale })
}

/**
 * Format date with time
 */
export function formatDateTime(date) {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

/**
 * Format time only
 */
export function formatTime(date) {
  return formatDate(date, 'HH:mm')
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatTimeAgo(date) {
  const parsed = parseDate(date)
  if (!parsed) return 'N/A'
  
  return formatDistanceToNow(parsed, {
    addSuffix: true,
    locale: defaultLocale,
  })
}

/**
 * Smart date formatting based on how recent the date is
 */
export function formatSmartDate(date) {
  const parsed = parseDate(date)
  if (!parsed) return 'N/A'

  if (isToday(parsed)) {
    return `Hôm nay, ${format(parsed, 'HH:mm')}`
  }
  
  if (isYesterday(parsed)) {
    return `Hôm qua, ${format(parsed, 'HH:mm')}`
  }
  
  if (isThisWeek(parsed)) {
    return format(parsed, 'EEEE, HH:mm', { locale: defaultLocale })
  }
  
  if (isThisYear(parsed)) {
    return format(parsed, 'dd MMM, HH:mm', { locale: defaultLocale })
  }
  
  return format(parsed, 'dd/MM/yyyy', { locale: defaultLocale })
}

/**
 * Format for table display - compact
 */
export function formatTableDate(date) {
  const parsed = parseDate(date)
  if (!parsed) return 'N/A'
  
  const now = new Date()
  const diffHours = differenceInHours(now, parsed)
  
  if (diffHours < 1) {
    const diffMins = differenceInMinutes(now, parsed)
    return diffMins <= 1 ? 'Vừa xong' : `${diffMins} phút trước`
  }
  
  if (diffHours < 24) {
    return `${diffHours} giờ trước`
  }
  
  const diffDays = differenceInDays(now, parsed)
  if (diffDays < 7) {
    return `${diffDays} ngày trước`
  }
  
  return format(parsed, 'dd/MM/yyyy', { locale: defaultLocale })
}

/**
 * Get date range presets for filters
 */
export function getDateRangePresets() {
  const now = new Date()
  
  return {
    today: {
      label: 'Hôm nay',
      start: startOfDay(now),
      end: endOfDay(now),
    },
    yesterday: {
      label: 'Hôm qua',
      start: startOfDay(subDays(now, 1)),
      end: endOfDay(subDays(now, 1)),
    },
    last7Days: {
      label: '7 ngày qua',
      start: startOfDay(subDays(now, 7)),
      end: endOfDay(now),
    },
    last30Days: {
      label: '30 ngày qua',
      start: startOfDay(subDays(now, 30)),
      end: endOfDay(now),
    },
    last3Months: {
      label: '3 tháng qua',
      start: startOfDay(subMonths(now, 3)),
      end: endOfDay(now),
    },
  }
}

/**
 * Format duration in milliseconds to readable string
 */
export function formatDuration(ms) {
  if (!ms || ms < 0) return '0s'
  
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export default {
  parseDate,
  formatDate,
  formatDateTime,
  formatTime,
  formatTimeAgo,
  formatSmartDate,
  formatTableDate,
  getDateRangePresets,
  formatDuration,
}
