/**
 * API Service - Centralized exports
 * Modular API structure for better maintainability
 */

// Auth
export { getUserInfo } from './auth'

// Profile
export {
  loadProfiles,
  deleteProfile,
  getProfileDetails,
  createProfile,
  addSample,
  addSamplesBatch,
  finalizeProfile,
  createProfileComplete
} from './profile'

// Analysis
export {
  analyzeText,
  detectAI,
  getSuggestions,
  analyzeTextBatch,
  analyzeTextOptimized,
  getSuggestionsOptimized
} from './analysis'

// Rewrite & Humanization
export {
  rewriteText,
  rewriteTextStream,
  iterativeHumanize
} from './rewrite'

// Chat
export {
  sendChatMessageStream,
  sendChatMessage,
  sendHumanizedChatStream,
  uploadChatFile,
  summarizeConversation,
  estimateTokens
} from './chat'

// Validation
export {
  validateTextBeforeAI
} from './validation'
