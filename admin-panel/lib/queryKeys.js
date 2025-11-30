/**
 * Centralized query key definitions for TanStack Query
 * Using factory pattern for type-safe and consistent keys
 */

export const queryKeys = {
  // Users
  users: {
    all: ['users'],
    lists: () => [...queryKeys.users.all, 'list'],
    list: (filters) => [...queryKeys.users.lists(), filters],
    details: () => [...queryKeys.users.all, 'detail'],
    detail: (id) => [...queryKeys.users.details(), id],
    logs: (id) => [...queryKeys.users.all, 'logs', id],
  },

  // Analytics
  analytics: {
    all: ['analytics'],
    dashboard: (range) => [...queryKeys.analytics.all, 'dashboard', range],
    users: (range) => [...queryKeys.analytics.all, 'users', range],
    revenue: (range) => [...queryKeys.analytics.all, 'revenue', range],
  },

  // Support Tickets
  support: {
    all: ['support'],
    lists: () => [...queryKeys.support.all, 'list'],
    list: (filters) => [...queryKeys.support.lists(), filters],
    details: () => [...queryKeys.support.all, 'detail'],
    detail: (id) => [...queryKeys.support.details(), id],
    replies: (ticketId) => [...queryKeys.support.all, 'replies', ticketId],
  },

  // Notifications
  notifications: {
    all: ['notifications'],
    lists: () => [...queryKeys.notifications.all, 'list'],
    list: (filters) => [...queryKeys.notifications.lists(), filters],
    detail: (id) => [...queryKeys.notifications.all, 'detail', id],
  },

  // Orders
  orders: {
    all: ['orders'],
    lists: () => [...queryKeys.orders.all, 'list'],
    list: (filters) => [...queryKeys.orders.lists(), filters],
    detail: (id) => [...queryKeys.orders.all, 'detail', id],
  },

  // Settings
  settings: {
    all: ['settings'],
    general: () => [...queryKeys.settings.all, 'general'],
    security: () => [...queryKeys.settings.all, 'security'],
  },

  // Logs
  logs: {
    all: ['logs'],
    system: (filters) => [...queryKeys.logs.all, 'system', filters],
    activity: (filters) => [...queryKeys.logs.all, 'activity', filters],
  },
}

export default queryKeys
