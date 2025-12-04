/**
 * API Request/Response Type Definitions
 * 
 * Types for all API endpoints to ensure type safety
 */

import type {
  User,
  Profile,
  Sample,
  AnalysisResult,
  TextAnalysisResult,
  RewriteResult,
  HumanizationResult,
  CreditBalance,
  CreditPackage,
  CreditTransaction,
  Notification,
  ChatMessage,
  Conversation,
} from './index';

// ============================================================================
// AUTH API
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  expiresIn: number;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
  locale?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  pendingVerification: boolean;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: User;
  needsLogin?: boolean;
  message?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
  locale?: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============================================================================
// PROFILE API
// ============================================================================

export interface CreateProfileRequest {
  name: string;
  description?: string;
}

export interface CreateProfileResponse {
  success: boolean;
  profile: Profile;
}

export interface AddSampleRequest {
  profileId: string;
  text: string;
}

export interface AddSampleResponse {
  success: boolean;
  sample: Sample;
  profile: Profile;
}

export interface AddSamplesBatchRequest {
  profileId: string;
  samples: string[];
}

export interface AddSamplesBatchResponse {
  success: boolean;
  addedCount: number;
  profile: Profile;
}

export interface FinalizeProfileRequest {
  profileId: string;
}

export interface FinalizeProfileResponse {
  success: boolean;
  profile: Profile;
}

export interface GetProfilesResponse {
  success: boolean;
  profiles: Profile[];
}

export interface GetProfileResponse {
  success: boolean;
  profile: Profile;
}

export interface DeleteProfileResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// ANALYSIS API
// ============================================================================

export interface AuthenticateContentRequest {
  text: string;
}

export interface AuthenticateContentResponse {
  success: boolean;
  result: AnalysisResult;
  creditsUsed: number;
}

export interface AnalyzeTextRequest {
  text: string;
  profileId: string;
}

export interface AnalyzeTextResponse {
  success: boolean;
  result: TextAnalysisResult;
  creditsUsed: number;
}

export interface SuggestImprovementsRequest {
  text: string;
  profileId: string;
}

export interface SuggestImprovementsResponse {
  success: boolean;
  suggestions: string[];
  creditsUsed: number;
}

export interface RewriteTextRequest {
  text: string;
  profileId: string;
  style?: 'formal' | 'casual' | 'academic' | 'creative';
  preserveTone?: boolean;
}

export interface RewriteTextResponse {
  success: boolean;
  result: RewriteResult;
  creditsUsed: number;
}

export interface TranslateTextRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslateTextResponse {
  success: boolean;
  translatedText: string;
  detectedLanguage?: string;
  creditsUsed: number;
}

export interface CheckHumanizationRequest {
  text: string;
}

export interface CheckHumanizationResponse {
  success: boolean;
  score: number;
  analysis: {
    aiProbability: number;
    humanIndicators: string[];
    aiIndicators: string[];
  };
  creditsUsed: number;
}

export interface IterativeHumanizeRequest {
  text: string;
  targetScore?: number;
  maxIterations?: number;
  profileId?: string;
}

export interface IterativeHumanizeResponse {
  success: boolean;
  result: HumanizationResult;
  creditsUsed: number;
}

// ============================================================================
// CHAT API
// ============================================================================

export interface SendMessageRequest {
  message: string;
  workspaceId?: string;
  conversationId?: string;
  attachments?: string[];
}

export interface SendMessageResponse {
  success: boolean;
  message: ChatMessage;
  conversationId: string;
  creditsUsed: number;
}

export interface SendMessageHumanizedRequest extends SendMessageRequest {
  humanizationLevel?: 'light' | 'moderate' | 'heavy';
}

export interface UploadFileRequest {
  file: File;
  workspaceId?: string;
}

export interface UploadFileResponse {
  success: boolean;
  fileId: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface SummarizeConversationRequest {
  conversationId: string;
  maxLength?: number;
}

export interface SummarizeConversationResponse {
  success: boolean;
  summary: string;
  keyPoints: string[];
  creditsUsed: number;
}

// ============================================================================
// CREDIT API
// ============================================================================

export interface GetCreditBalanceResponse {
  success: boolean;
  data: CreditBalance;
}

export interface GetCreditPackagesResponse {
  success: boolean;
  packages: CreditPackage[];
}

export interface PurchaseCreditPackageRequest {
  packageId: string;
  paymentMethod?: string;
}

export interface PurchaseCreditPackageResponse {
  success: boolean;
  checkoutUrl: string;
  orderId: string;
}

export interface GetCreditHistoryRequest {
  limit?: number;
  offset?: number;
  type?: 'purchase' | 'usage' | 'bonus' | 'refund';
}

export interface GetCreditHistoryResponse {
  success: boolean;
  history: CreditTransaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ============================================================================
// NOTIFICATION API
// ============================================================================

export interface GetNotificationsRequest {
  unreadOnly?: boolean;
  limit?: number;
}

export interface GetNotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
}

export interface MarkNotificationReadResponse {
  success: boolean;
}

export interface MarkAllNotificationsReadResponse {
  success: boolean;
  markedCount: number;
}

// ============================================================================
// FEEDBACK API
// ============================================================================

export interface SendFeedbackRequest {
  type: 'feedback' | 'billing_support';
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  content: string;
  images?: string[];
  userEmail?: string;
  userName?: string;
}

export interface SendFeedbackResponse {
  success: boolean;
  ticketId: string;
  message: string;
}

// ============================================================================
// REALTIME API (SSE)
// ============================================================================

export interface RealtimeEvent {
  type: 'notification' | 'credit_update' | 'analysis_complete' | 'message';
  data: unknown;
  timestamp: string;
}

export interface StreamChunk {
  type: 'content' | 'done' | 'error';
  content?: string;
  error?: string;
  metadata?: {
    creditsUsed?: number;
    totalTokens?: number;
  };
}
