/**
 * Simple Logger Utility for Admin Panel
 * Wraps console methods with environment-aware logging
 */

const isDev = import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'development'

const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args)
    }
  },
  info: (...args) => {
    if (isDev) {
      console.info(...args)
    }
  },
  debug: (...args) => {
    if (isDev) {
      console.debug(...args)
    }
  },
  warn: (...args) => {
    console.warn(...args)
  },
  error: (...args) => {
    console.error(...args)
  },
}

export default logger
