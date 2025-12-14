/**
 * Zustand Store Type Definitions
 * 
 * Provides type safety for all Zustand stores
 */

import type {
  User,
  Profile,
  Note,
  Workspace,
  CreditBalance,
  AnalysisResult,
  Toast,
} from './index';

// ============================================================================
// AUTH STORE
// ============================================================================

export interface AuthStoreState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authMethod: 'google' | 'email' | null;
  hasGoogleLinked: boolean;
  error: string | null;
}

export interface AuthStoreActions {
  // Internal
  _setAuth: (user: User | null, token: string | null, authMethod: string | null, hasGoogleLinked?: boolean) => void;
  _clearAuth: () => void;
  
  // State setters
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuthMethod: (method: 'google' | 'email' | null) => void;
  setHasGoogleLinked: (linked: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Auth operations
  initAuth: () => Promise<void>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  verifyEmail: (email: string, otp: string) => Promise<{ success: boolean; error?: string; needsLogin?: boolean }>;
  resendVerificationOTP: (email: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: (password?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  
  // Google linking
  linkGoogleAccount: () => Promise<{ success: boolean; error?: string }>;
  unlinkGoogleAccount: () => Promise<{ success: boolean; error?: string }>;
  
  // Session management
  getActiveSessions: () => Promise<{ success: boolean; sessions: Session[]; error?: string }>;
  revokeSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  revokeAllOtherSessions: () => Promise<{ success: boolean; revokedCount?: number; error?: string }>;
  getLoginHistory: (limit?: number) => Promise<{ success: boolean; history: LoginHistoryEntry[]; error?: string }>;
  
  // Getters
  getUser: () => User | null;
  getToken: () => string | null;
  isLoggedIn: () => boolean;
}

export type AuthStore = AuthStoreState & AuthStoreActions;

// ============================================================================
// THEME STORE
// ============================================================================

export interface ThemeStoreState {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
}

export interface ThemeStoreActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

export type ThemeStore = ThemeStoreState & ThemeStoreActions;

// ============================================================================
// UI STORE
// ============================================================================

export interface UIStoreState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activePanel: string | null;
  toasts: Toast[];
  isGlobalLoading: boolean;
  loadingMessage: string | null;
}

export interface UIStoreActions {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActivePanel: (panel: string | null) => void;
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
}

export type UIStore = UIStoreState & UIStoreActions;

// ============================================================================
// NOTES STORE
// ============================================================================

export interface NotesStoreState {
  notes: Note[];
  activeNoteId: string | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: 'createdAt' | 'updatedAt' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface NotesStoreActions {
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: 'createdAt' | 'updatedAt' | 'title') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  getFilteredNotes: () => Note[];
  getActiveNote: () => Note | null;
}

export type NotesStore = NotesStoreState & NotesStoreActions;

// ============================================================================
// WORKSPACE STORE
// ============================================================================

export interface WorkspaceStoreState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface WorkspaceStoreActions {
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  setActiveWorkspace: (id: string | null) => void;
  getActiveWorkspace: () => Workspace | null;
}

export type WorkspaceStore = WorkspaceStoreState & WorkspaceStoreActions;

// ============================================================================
// AI PROCESSING STORE
// ============================================================================

export interface AIProcessingStoreState {
  isProcessing: boolean;
  currentOperation: string | null;
  progress: number;
  result: AnalysisResult | null;
  error: string | null;
  history: AIProcessingHistoryItem[];
}

export interface AIProcessingHistoryItem {
  id: string;
  operation: string;
  input: string;
  result: AnalysisResult;
  timestamp: string;
}

export interface AIProcessingStoreActions {
  startProcessing: (operation: string) => void;
  setProgress: (progress: number) => void;
  setResult: (result: AnalysisResult) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  addToHistory: (item: Omit<AIProcessingHistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

export type AIProcessingStore = AIProcessingStoreState & AIProcessingStoreActions;

// ============================================================================
// REWRITE STORE
// ============================================================================

export interface RewriteStoreState {
  originalText: string;
  rewrittenText: string;
  isRewriting: boolean;
  isStreaming: boolean;
  style: 'formal' | 'casual' | 'academic' | 'creative' | null;
  profileId: string | null;
  error: string | null;
}

export interface RewriteStoreActions {
  setOriginalText: (text: string) => void;
  setRewrittenText: (text: string) => void;
  appendRewrittenText: (chunk: string) => void;
  setStyle: (style: RewriteStoreState['style']) => void;
  setProfileId: (id: string | null) => void;
  startRewriting: () => void;
  startStreaming: () => void;
  stopStreaming: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type RewriteStore = RewriteStoreState & RewriteStoreActions;

// ============================================================================
// APP STORE
// ============================================================================

export interface AppStoreState {
  initialized: boolean;
  version: string;
  lastSyncTime: string | null;
  onlineStatus: boolean;
}

export interface AppStoreActions {
  setInitialized: (value: boolean) => void;
  setLastSyncTime: (time: string | null) => void;
  setOnlineStatus: (status: boolean) => void;
}

export type AppStore = AppStoreState & AppStoreActions;

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface Session {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface LoginHistoryEntry {
  timestamp: string;
  ipAddress: string;
  deviceInfo: string;
  success: boolean;
  failureReason?: string;
}

// Store selector types
export type StoreSelector<T, R> = (state: T) => R;

// Zustand middleware types
export type PersistOptions<T> = {
  name: string;
  partialize?: (state: T) => Partial<T>;
  storage?: Storage;
};
