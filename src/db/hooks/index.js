/**
 * Database Hooks Index
 * 
 * Exports Firestore hooks for Notes and Conversations.
 * Profile uses API (not included here).
 */

// Firestore hooks for Notes
export { 
  useNotes, 
  useNoteMutations 
} from './useFirestore'

// Firestore hooks for Conversations and Messages
export { 
  useConversations, 
  useConversationMutations,
  useMessages,
  useMessageMutations
} from './useFirestore'

// Sync hook (no-op for Firestore)
export { useFirestoreSync as useRxDBSync } from './useFirestore'

// Clear data utility
export { clearLocalData } from './useFirestore'

// Legacy aliases for backward compatibility
export { useNotes as useNote } from './useFirestore'
export { useConversations as useConversation } from './useFirestore'
