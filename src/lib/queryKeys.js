/**
 * Centralized Query Keys for TanStack Query
 * Factory pattern for type-safe and consistent cache keys
 */

export const queryKeys = {
  // User & Auth
  user: {
    all: ['user'],
    current: () => [...queryKeys.user.all, 'current'],
    profile: () => [...queryKeys.user.all, 'profile'],
    credits: () => [...queryKeys.user.all, 'credits'],
    sessions: () => [...queryKeys.user.all, 'sessions'],
  },

  // Profiles (Voice Profiles)
  profiles: {
    all: ['profiles'],
    list: () => [...queryKeys.profiles.all, 'list'],
    detail: (id) => [...queryKeys.profiles.all, 'detail', id],
    current: () => [...queryKeys.profiles.all, 'current'],
  },

  // Analysis
  analysis: {
    all: ['analysis'],
    history: (filters) => [...queryKeys.analysis.all, 'history', filters],
    detail: (id) => [...queryKeys.analysis.all, 'detail', id],
    stats: () => [...queryKeys.analysis.all, 'stats'],
  },

  // Notes
  notes: {
    all: ['notes'],
    list: () => [...queryKeys.notes.all, 'list'],
    detail: (id) => [...queryKeys.notes.all, 'detail', id],
  },

  // Workspace / Conversations
  workspace: {
    all: ['workspace'],
    conversations: () => [...queryKeys.workspace.all, 'conversations'],
    conversation: (id) => [...queryKeys.workspace.all, 'conversation', id],
  },

  // Notifications
  notifications: {
    all: ['notifications'],
    list: () => [...queryKeys.notifications.all, 'list'],
    unread: () => [...queryKeys.notifications.all, 'unread'],
  },

  // Payment & Subscription
  payment: {
    all: ['payment'],
    subscription: () => [...queryKeys.payment.all, 'subscription'],
    history: () => [...queryKeys.payment.all, 'history'],
    plans: () => [...queryKeys.payment.all, 'plans'],
    packages: () => [...queryKeys.payment.all, 'packages'],
  },

  // Share
  share: {
    all: ['share'],
    detail: (id) => [...queryKeys.share.all, 'detail', id],
  },

  // Feedback
  feedback: {
    all: ['feedback'],
  },
}

export default queryKeys
