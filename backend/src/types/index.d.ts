/**
 * TypeScript Type Definitions for Backend
 * 
 * These types provide IntelliSense support for JavaScript files
 */

import { Request, Response, NextFunction } from 'express';

// ============================================================================
// EXPRESS EXTENSIONS
// ============================================================================

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      userId?: string;
      authMethod?: 'firebase' | 'email' | 'api_key';
      correlationId?: string;
      rawBody?: Buffer;
      language?: string;
    }
  }
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface AuthenticatedUser {
  userId: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
  isService?: boolean;
}

export interface FirebaseDecodedToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

export interface EmailAuthUser {
  userId: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  hasGoogleLinked?: boolean;
  authProvider: 'email';
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActive: Date;
  expiresAt: Date;
}

export interface LoginHistory {
  userId: string;
  timestamp: Date;
  ipAddress: string;
  deviceInfo: string;
  success: boolean;
  failureReason?: string;
}

// ============================================================================
// PROFILE TYPES
// ============================================================================

export interface Profile {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'draft' | 'finalized';
  sampleCount: number;
  samples?: Sample[];
  voiceProfile?: VoiceProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sample {
  id: string;
  text: string;
  wordCount: number;
  embedding?: number[];
  addedAt: Date;
}

export interface VoiceProfile {
  vocabulary: string[];
  sentencePatterns: string[];
  styleMarkers: string[];
  averageSentenceLength: number;
  formalityScore: number;
  embedding?: number[];
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
  styleMatch: {
    vocabulary: number;
    sentenceStructure: number;
    formality: number;
    overall: number;
  };
  suggestions: string[];
}

export interface RewriteResult {
  originalText: string;
  rewrittenText: string;
  changes: Array<{
    type: 'addition' | 'deletion' | 'modification';
    original: string;
    replacement: string;
    reason: string;
  }>;
  styleScore: number;
}

export interface HumanizationResult {
  text: string;
  score: number;
  iterations: number;
  improvements: string[];
}

// ============================================================================
// CREDIT TYPES
// ============================================================================

export interface CreditBalance {
  userId: string;
  balance: number;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  monthlyCredits: number;
  usedThisMonth: number;
  resetDate: Date;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'usage' | 'bonus' | 'refund';
  amount: number;
  balance: number;
  description: string;
  operation?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
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

// ============================================================================
// CHAT TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
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
  userId: string;
  title: string;
  messages: ChatMessage[];
  workspaceId?: string;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Date;
}

// ============================================================================
// SUPPORT TYPES
// ============================================================================

export interface SupportTicket {
  id: string;
  type: 'feedback' | 'billing_support';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  content: string;
  images?: string[];
  userEmail: string;
  userName: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  replies: TicketReply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketReply {
  id: string;
  content: string;
  isAdmin: boolean;
  authorName: string;
  createdAt: Date;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  language?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    errorId: string;
    details?: Record<string, unknown>;
    retryAfter?: number;
    stack?: string[];
  };
  language?: string;
}

// ============================================================================
// MIDDLEWARE TYPES
// ============================================================================

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type ErrorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

// ============================================================================
// CONFIG TYPES
// ============================================================================

export interface AppConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  IS_DEVELOPMENT: boolean;
  IS_PRODUCTION: boolean;
  PROJECT_ID: string;
  LOCATION: string;
  GEMINI_MODEL: string;
  MAX_TEXT_LENGTH: number;
  MAX_REQUEST_SIZE: string;
  FEATURES: {
    ENABLE_CACHING: boolean;
    ENABLE_RATE_LIMITING: boolean;
    ENABLE_ANALYTICS: boolean;
    ENABLE_DEBUG_ENDPOINTS: boolean;
  };
  SECURITY: {
    SANITIZE_INPUT: boolean;
  };
  CACHE_TTL: {
    EMBEDDING: number;
    ANALYSIS: number;
  };
  CACHE_MAX_SIZE: {
    EMBEDDING: number;
  };
  AI_DETECTION: {
    MAX_CHUNK_SIZE: number;
    UNCERTAIN_RANGE_LOW: number;
    UNCERTAIN_RANGE_HIGH: number;
    DEEP_ANALYSIS_CONFIDENCE_THRESHOLD: number;
  };
  API_KEYS?: string[];
  ADMIN_PANEL_URL: string;
  CONFIG_WARNINGS?: string[];
}

// ============================================================================
// QUEUE TYPES
// ============================================================================

export interface QueueJob<T = unknown> {
  id: string;
  name: string;
  data: T;
  opts?: {
    delay?: number;
    attempts?: number;
    backoff?: {
      type: 'exponential' | 'fixed';
      delay: number;
    };
  };
}

export interface EmailJob {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
  locale?: string;
}

export interface AnalysisJob {
  userId: string;
  text: string;
  profileId?: string;
  operation: 'detect' | 'analyze' | 'rewrite' | 'humanize';
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export interface LemonSqueezyWebhook {
  meta: {
    event_name: string;
    custom_data?: Record<string, unknown>;
  };
  data: {
    id: string;
    type: string;
    attributes: Record<string, unknown>;
  };
}
