/**
 * API Service - Main Entry Point
 * 
 * This file re-exports all API functions from modular structure
 * for backward compatibility with existing code.
 * 
 * New code should import from specific modules:
 * import { analyzeText } from './api/analysis'
 * 
 * But old code can still use:
 * import { analyzeText } from './api'
 */

// Re-export all modules for backward compatibility
export * from './api/index'

// Legacy exports (for backward compatibility)
export { getUserInfo } from './api/auth'
export { validateTextBeforeAI } from './api/validation'

// Note: All functions are now available from this file
// just like before, but the implementation is in separate modules
