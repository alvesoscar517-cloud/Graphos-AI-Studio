/**
 * TypeScript Type Definitions for Graphos AI Studio Frontend
 * 
 * These types provide IntelliSense support for JavaScript files
 * and can be used for gradual TypeScript migration.
 */

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface User {
  id: string;
  userId: string;
  email: string;
  name?: string;
  displayName?: string;
  picture?: string;
  emailVerified?: boolean;
  authProvider?: 'google' | 'email';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authMethod: 'google' | 'email' | null;
  error: string | null;
}

export interface AuthActions {
  initAuth: () => Promise<void>;
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<AuthResult>;
  verifyEmail: (email: string, otp: string) => Promise<AuthResult>;
  resendVerificationOTP: (email: string) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<AuthResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
  deleteAccount: (password?: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  getActiveSessions: () => Promise<SessionsResult>;
  revokeSession: (sessionId: string) => Promise<AuthResult>;
  revokeAllOtherSessions: () => Promise<AuthResult>;
  getLoginHistory: (limit?: number) => Promise<LoginHistoryResult>;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  code?: string;
  pendingVerification?: boolean;
  needsLogin?: boolean;
  message?: string;
}

export interface Session {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface SessionsResult {
  success: boolean;
  sessions: Session[];
  error?: string;
}

export interface LoginHistoryEntry {
  timestamp: string;
  ipAddress: string;
  deviceInfo: string;
  success: boolean;
  failureReason?: string;
}

export interface LoginHistoryResult {
  success: boolean;
  history: LoginHistoryEntry[];
  error?: string;
}

// ============================================================================
// PROFILE TYPES
// ============================================================================

export interface Profile {
  id: string;
  name: string;
  description?: string;
  sampleCount: number;
  status: 'draft' | 'finalized';
  voiceProfile?: VoiceProfile;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceProfile {
  vocabulary: string[];
  sentencePatterns: string[];
  styleMarkers: string[];
  averageSentenceLength: number;
  formalityScore: number;
}

export interface Sample {
  id: string;
  text: string;
  wordCount: number;
  addedAt: string;
}

export interface ProfileState {
  profiles: Profile[];
  activeProfile: Profile | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// ANALYSIS TYPES
// ============================================================================

export interface AnalysisResult {
  aiProbability: number;
  confidence: number;
  evidence: string[];
  humanIndicators: string[];
  aiIndicators: string[];
  summary?: string;
  multiPass?: boolean;
  keyFactor?: string;
  chunksAnalyzed?: number;
}

export interface TextAnalysisResult {
  similarity: number;
  matchScore: number;
  styleMatch: StyleMatch;
  suggestions: string[];
}

export interface StyleMatch {
  vocabulary: number;
  sentenceStructure: number;
  formality: number;
  overall: number;
}

export interface RewriteResult {
  originalText: string;
  rewrittenText: string;
  changes: Change[];
  styleScore: number;
}

export interface Change {
  type: 'addition' | 'deletion' | 'modification';
  original: string;
  replacement: string;
  reason: string;
}

export interface HumanizationResult {
  text: string;
  score: number;
  iterations: number;
  improvements: string[];
}

// ============================================================================
// CHAT TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'file';
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isStreaming: boolean;
  error: string | null;
}

// ============================================================================
// CREDIT TYPES
// ============================================================================

export interface CreditBalance {
  balance: number;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  monthlyCredits: number;
  usedThisMonth: number;
  resetDate: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  popular?: boolean;
  savings?: number;
}

export interface CreditTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'bonus' | 'refund';
  amount: number;
  balance: number;
  description: string;
  operation?: string;
  timestamp: string;
}

export interface CreditState {
  balance: CreditBalance | null;
  packages: CreditPackage[];
  history: CreditTransaction[];
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
}

// ============================================================================
// WORKSPACE TYPES
// ============================================================================

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  profileId?: string;
  settings: WorkspaceSettings;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceSettings {
  defaultLanguage: string;
  autoSave: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// NOTE TYPES
// ============================================================================

export interface Note {
  id: string;
  title: string;
  content: string;
  workspaceId?: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotesState {
  notes: Note[];
  activeNote: Note | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  errorId?: string;
  details?: Record<string, unknown>;
  retryAfter?: number;
}

// ============================================================================
// UI TYPES
// ============================================================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  component: React.ComponentType<unknown>;
  props?: Record<string, unknown>;
  onClose?: () => void;
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  toasts: Toast[];
  modals: Modal[];
  isLoading: boolean;
}

// ============================================================================
// STORE TYPES
// ============================================================================

export type AuthStore = AuthState & AuthActions;

export interface AppStore {
  initialized: boolean;
  version: string;
  setInitialized: (value: boolean) => void;
}

export interface ThemeStore {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  initTheme: () => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type AsyncFunction<T = void> = () => Promise<T>;

export type EventHandler<T = Event> = (event: T) => void;

// ============================================================================
// CHROME EXTENSION TYPES
// ============================================================================

export interface ChromeMessage {
  action: string;
  [key: string]: unknown;
}

export interface ChromeResponse {
  success: boolean;
  [key: string]: unknown;
}

declare global {
  interface Window {
    modal: {
      show: (options: ModalOptions) => void;
      hide: () => void;
    };
  }
}

export interface ModalOptions {
  title: string;
  content: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type?: 'info' | 'warning' | 'error' | 'confirm';
}
