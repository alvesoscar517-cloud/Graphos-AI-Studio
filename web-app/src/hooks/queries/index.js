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
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useVisibleNotes,
  useSyncNotes,
} from './useNotes'

export {
  useCurrentUser,
  useUpdateUser,
  useUpdateSettings,
  useSessions,
  useRevokeSession,
  useRevokeAllSessions,
} from './useUser'

// Firestore hooks - re-exported from db/hooks for convenience
export {
  useNotes as useFirestoreNotes,
  useConversations as useFirestoreConversations,
  useMessages as useFirestoreMessages,
} from '../../db/hooks'
