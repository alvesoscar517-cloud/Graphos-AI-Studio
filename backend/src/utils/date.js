/**
 * Date Utilities - Powered by date-fns
 * Lightweight, immutable date operations
 * 
 * @module utils/date
 */

const {
  format,
  formatISO,
  parseISO,
  isValid,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInSeconds,
  addMinutes,
  addHours,
  addDays,
  subMinutes,
  subHours,
  subDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isBefore,
  isAfter,
  isEqual,
  compareAsc,
  compareDesc
} = require('date-fns');

const { formatInTimeZone, toZonedTime, fromZonedTime } = require('date-fns-tz');

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format date to string
 * @param {Date|string|number} date - Date to format
 * @param {string} pattern - Format pattern (default: 'yyyy-MM-dd HH:mm:ss')
 * @returns {string} Formatted date string
 */
function formatDate(date, pattern = 'yyyy-MM-dd HH:mm:ss') {
  const dateObj = ensureDate(date);
  if (!dateObj) return '';
  return format(dateObj, pattern);
}

/**
 * Format date to ISO string
 * @param {Date|string|number} date - Date to format
 * @returns {string} ISO formatted date string
 */
function toISO(date) {
  const dateObj = ensureDate(date);
  if (!dateObj) return '';
  return formatISO(dateObj);
}

/**
 * Format date with timezone
 * @param {Date|string|number} date - Date to format
 * @param {string} timezone - Timezone (e.g., 'America/New_York')
 * @param {string} pattern - Format pattern
 * @returns {string} Formatted date string in timezone
 */
function formatWithTimezone(date, timezone, pattern = 'yyyy-MM-dd HH:mm:ss zzz') {
  const dateObj = ensureDate(date);
  if (!dateObj) return '';
  return formatInTimeZone(dateObj, timezone, pattern);
}

// ============================================================================
// PARSING
// ============================================================================

/**
 * Parse ISO date string
 * @param {string} dateString - ISO date string
 * @returns {Date|null} Parsed date or null if invalid
 */
function parseDate(dateString) {
  if (!dateString) return null;
  
  try {
    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Ensure value is a Date object
 * @param {Date|string|number} value - Value to convert
 * @returns {Date|null} Date object or null if invalid
 */
function ensureDate(value) {
  if (!value) return null;
  
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  
  if (typeof value === 'string') {
    return parseDate(value);
  }
  
  if (typeof value === 'number') {
    const date = new Date(value);
    return isValid(date) ? date : null;
  }
  
  return null;
}

/**
 * Check if date string is valid
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid
 */
function isValidDate(dateString) {
  return parseDate(dateString) !== null;
}

// ============================================================================
// DIFFERENCES
// ============================================================================

/**
 * Get difference in minutes between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Difference in minutes
 */
function getMinutesDiff(date1, date2) {
  const d1 = ensureDate(date1);
  const d2 = ensureDate(date2);
  if (!d1 || !d2) return 0;
  return differenceInMinutes(d1, d2);
}

/**
 * Get difference in hours between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Difference in hours
 */
function getHoursDiff(date1, date2) {
  const d1 = ensureDate(date1);
  const d2 = ensureDate(date2);
  if (!d1 || !d2) return 0;
  return differenceInHours(d1, d2);
}

/**
 * Get difference in days between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Difference in days
 */
function getDaysDiff(date1, date2) {
  const d1 = ensureDate(date1);
  const d2 = ensureDate(date2);
  if (!d1 || !d2) return 0;
  return differenceInDays(d1, d2);
}

/**
 * Get difference in seconds between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Difference in seconds
 */
function getSecondsDiff(date1, date2) {
  const d1 = ensureDate(date1);
  const d2 = ensureDate(date2);
  if (!d1 || !d2) return 0;
  return differenceInSeconds(d1, d2);
}

// ============================================================================
// MANIPULATION
// ============================================================================

/**
 * Add time to date
 * @param {Date|string} date - Base date
 * @param {number} amount - Amount to add
 * @param {string} unit - Unit ('minutes', 'hours', 'days')
 * @returns {Date|null} New date
 */
function addTime(date, amount, unit = 'minutes') {
  const dateObj = ensureDate(date);
  if (!dateObj) return null;
  
  switch (unit) {
    case 'minutes':
      return addMinutes(dateObj, amount);
    case 'hours':
      return addHours(dateObj, amount);
    case 'days':
      return addDays(dateObj, amount);
    default:
      return addMinutes(dateObj, amount);
  }
}

/**
 * Subtract time from date
 * @param {Date|string} date - Base date
 * @param {number} amount - Amount to subtract
 * @param {string} unit - Unit ('minutes', 'hours', 'days')
 * @returns {Date|null} New date
 */
function subtractTime(date, amount, unit = 'minutes') {
  const dateObj = ensureDate(date);
  if (!dateObj) return null;
  
  switch (unit) {
    case 'minutes':
      return subMinutes(dateObj, amount);
    case 'hours':
      return subHours(dateObj, amount);
    case 'days':
      return subDays(dateObj, amount);
    default:
      return subMinutes(dateObj, amount);
  }
}

// ============================================================================
// COMPARISONS
// ============================================================================

/**
 * Check if date is before another
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if date1 is before date2
 */
function isDateBefore(date1, date2) {
  const d1 = ensureDate(date1);
  const d2 = ensureDate(date2);
  if (!d1 || !d2) return false;
  return isBefore(d1, d2);
}

/**
 * Check if date is after another
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if date1 is after date2
 */
function isDateAfter(date1, date2) {
  const d1 = ensureDate(date1);
  const d2 = ensureDate(date2);
  if (!d1 || !d2) return false;
  return isAfter(d1, d2);
}

/**
 * Check if date is expired (before now)
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
function isExpired(date) {
  return isDateBefore(date, new Date());
}

// ============================================================================
// TIMEZONE
// ============================================================================

/**
 * Convert date to timezone
 * @param {Date|string} date - Date to convert
 * @param {string} timezone - Target timezone
 * @returns {Date|null} Date in timezone
 */
function toTimezone(date, timezone) {
  const dateObj = ensureDate(date);
  if (!dateObj) return null;
  return toZonedTime(dateObj, timezone);
}

/**
 * Convert date from timezone to UTC
 * @param {Date|string} date - Date in timezone
 * @param {string} timezone - Source timezone
 * @returns {Date|null} UTC date
 */
function fromTimezone(date, timezone) {
  const dateObj = ensureDate(date);
  if (!dateObj) return null;
  return fromZonedTime(dateObj, timezone);
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Formatting
  formatDate,
  toISO,
  formatWithTimezone,
  
  // Parsing
  parseDate,
  ensureDate,
  isValidDate,
  
  // Differences
  getMinutesDiff,
  getHoursDiff,
  getDaysDiff,
  getSecondsDiff,
  
  // Manipulation
  addTime,
  subtractTime,
  
  // Comparisons
  isDateBefore,
  isDateAfter,
  isExpired,
  
  // Timezone
  toTimezone,
  fromTimezone,
  
  // Re-export commonly used date-fns functions
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  compareAsc,
  compareDesc,
  isValid
};
