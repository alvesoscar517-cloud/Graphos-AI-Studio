/**
 * Query Hooks barrel export
 */

export {
  useCredits,
  useConsumeCredits,
  useHasCredits,
} from './useCredits'

export {
  useProfiles,
  useProfilesQuery,
  useProfile,
  useCreateProfile,
  useUpdateProfile,
  useDeleteProfile,
  useActiveProfile,
  useInvalidateProfiles,
} from './useProfiles'

export {
  useNotifications,
  useUnreadNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDismissNotification,
} from './useNotifications'

export {
  useAnalysisHistory,
  useAnalysisDetail,
  useDeleteAnalysis,
  useAnalysisStats,
} from './useAnalysis'

export {
  useConversations,
  useCreateConversation,
  useUpdateConversation,
  useDeleteConversation,
  useAddMessage,
} from './useWorkspace'

export {
  useSubscription,
  usePlans,
  usePaymentHistory,
  useCreatePayment,
  useVerifyPayment,
  useCancelSubscription,
  useHasSubscription,
  usePackages,
  useCreateCheckout,
} from './usePayment'

export {
  useSendFeedback,
  useSendBillingSupport,
  useSendErrorReport,
} from './useFeedback'

export {
  useCreditHistory,
  useCreditHistorySummary,
} from './useCreditHistory'

export {
  useNotes,
  useNote,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useSearchNotes,
  useVisibleNotes,
  useCurrentNote,
  useSyncNotes,
  useCurrentNoteWithStore,
} from './useNotes'

export {
  useCurrentUser,
  useUpdateUser,
  useUpdateSettings,
  useSessions,
  useRevokeSession,
  useRevokeAllSessions,
} from './useUser'

// Firestore hooks (new sync system)
export {
  useFirestoreNotes,
  useFirestoreNote,
  useCreateFirestoreNote,
  useUpdateFirestoreNote,
  useDeleteFirestoreNote,
  useSearchFirestoreNotes,
  useVisibleFirestoreNotes,
  useSyncFirestoreNotes,
  useGenerateNoteTitle,
  useCurrentFirestoreNote,
} from './useFirestoreNotes'

export {
  useFirestoreConversations,
  useFirestoreConversation,
  useCreateFirestoreConversation,
  useUpdateFirestoreConversation,
  useDeleteFirestoreConversation,
  useRecentConversations,
  useSearchConversations,
} from './useFirestoreConversations'

export {
  useFirestoreMessages,
  useInfiniteFirestoreMessages,
  useAddFirestoreMessage,
  useUpdateFirestoreMessage,
  useDeleteFirestoreMessage,
  useBatchAddMessages,
  useMessageCount,
  useLastMessage,
} from './useFirestoreMessages'
