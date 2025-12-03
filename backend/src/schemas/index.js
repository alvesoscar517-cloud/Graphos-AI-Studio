/**
 * Zod Validation Schemas
 * Centralized schema definitions for all API inputs
 * 
 * @module schemas
 */

const { z } = require('zod');

// ============================================================================
// CONSTANTS
// ============================================================================

const ALLOWED_MODELS = [
  'gemini-2.0-flash-exp',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-pro'
];

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const DISPLAY_NAME_MIN_LENGTH = 2;
const DISPLAY_NAME_MAX_LENGTH = 50;

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Email schema with normalization
 */
const emailSchema = z.string()
  .email('Invalid email format')
  .max(254, 'Email is too long')
  .transform(email => email.toLowerCase().trim());

/**
 * Profile ID schema
 */
const profileIdSchema = z.string()
  .min(10, 'Profile ID must be at least 10 characters')
  .max(50, 'Profile ID must not exceed 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Profile ID contains invalid characters');

/**
 * User ID schema
 */
const userIdSchema = z.string()
  .min(3, 'User ID must be at least 3 characters')
  .max(100, 'User ID must not exceed 100 characters')
  .regex(/^[a-zA-Z0-9_@.-]+$/, 'User ID contains invalid characters');

/**
 * Model schema with default
 */
const modelSchema = z.enum(ALLOWED_MODELS).default('gemini-2.0-flash-exp');

/**
 * Text input schema with sanitization
 */
const textSchema = z.string()
  .min(1, 'Text is required')
  .max(50000, 'Text must not exceed 50000 characters')
  .transform(text => text.trim());

/**
 * Password schema with strength validation
 */
const passwordSchema = z.string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`)
  .refine(pwd => /[A-Z]/.test(pwd), 'Password must contain at least one uppercase letter')
  .refine(pwd => /[a-z]/.test(pwd), 'Password must contain at least one lowercase letter')
  .refine(pwd => /[0-9]/.test(pwd), 'Password must contain at least one number');

/**
 * Display name schema
 */
const displayNameSchema = z.string()
  .min(DISPLAY_NAME_MIN_LENGTH, `Display name must be at least ${DISPLAY_NAME_MIN_LENGTH} characters`)
  .max(DISPLAY_NAME_MAX_LENGTH, `Display name must not exceed ${DISPLAY_NAME_MAX_LENGTH} characters`)
  .regex(/^[\p{L}\p{N}\s\-_.]+$/u, 'Display name contains invalid characters')
  .transform(name => name.trim());

// ============================================================================
// USER SCHEMAS
// ============================================================================

/**
 * User registration schema
 */
const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema.optional()
});

/**
 * User login schema
 */
const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

/**
 * Sample type enum
 */
const sampleTypeSchema = z.enum(['short', 'long']).default('short');

/**
 * Writing sample schema
 */
const writingSampleSchema = z.object({
  text: z.string()
    .min(10, 'Sample text must be at least 10 characters')
    .max(50000, 'Sample text must not exceed 50000 characters'),
  type: sampleTypeSchema,
  createdAt: z.date().optional()
});

/**
 * Profile creation schema
 */
const createProfileSchema = z.object({
  name: z.string()
    .min(1, 'Profile name is required')
    .max(100, 'Profile name must not exceed 100 characters')
    .transform(name => name.trim()),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
});

/**
 * Add sample schema
 */
const addSampleSchema = z.object({
  profile_id: profileIdSchema,
  text: z.string()
    .min(20, 'Sample text must be at least 20 characters')
    .max(50000, 'Sample text must not exceed 50000 characters'),
  type: sampleTypeSchema
});

// ============================================================================
// ANALYSIS SCHEMAS
// ============================================================================

/**
 * Text analysis request schema
 */
const analyzeTextSchema = z.object({
  profile_id: profileIdSchema,
  text: z.string()
    .min(10, 'Text must be at least 10 characters')
    .max(50000, 'Text must not exceed 50000 characters'),
  use_cache: z.boolean().default(true)
});

/**
 * AI detection schema
 */
const detectAISchema = z.object({
  text: z.string()
    .min(50, 'Text must be at least 50 characters for AI detection')
    .max(50000, 'Text must not exceed 50000 characters'),
  enhanced: z.boolean().default(true)
});

/**
 * Rewrite text schema
 */
const rewriteTextSchema = z.object({
  profile_id: profileIdSchema,
  text: z.string()
    .min(10, 'Text must be at least 10 characters')
    .max(20000, 'Text must not exceed 20000 characters'),
  model: modelSchema,
  check_ai_after: z.boolean().default(true)
});

// ============================================================================
// CHAT SCHEMAS
// ============================================================================

/**
 * Chat message schema
 */
const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Message content is required')
});

/**
 * Chat request schema
 */
const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema)
    .min(1, 'At least one message is required')
    .max(100, 'Cannot exceed 100 messages'),
  model: modelSchema,
  profile_id: profileIdSchema.optional()
});

// ============================================================================
// OTP SCHEMAS
// ============================================================================

/**
 * OTP request schema
 */
const otpRequestSchema = z.object({
  email: emailSchema,
  type: z.enum(['verification', 'password_reset']).default('verification')
});

/**
 * OTP verification schema
 */
const otpVerifySchema = z.object({
  email: emailSchema,
  code: z.string()
    .length(6, 'OTP code must be 6 digits')
    .regex(/^\d+$/, 'OTP code must contain only digits'),
  type: z.enum(['verification', 'password_reset']).default('verification')
});

// ============================================================================
// OTHER SCHEMAS
// ============================================================================

/**
 * Suggestions request schema
 */
const getSuggestionsSchema = z.object({
  profile_id: profileIdSchema,
  sentence: z.string()
    .min(3, 'Sentence must be at least 3 characters')
    .max(2000, 'Sentence must not exceed 2000 characters'),
  sentence_score: z.number().min(0).max(1).optional()
});

/**
 * Translation request schema
 */
const translateSchema = z.object({
  text: z.string()
    .min(1, 'Text is required')
    .max(10000, 'Text must not exceed 10000 characters'),
  source_lang: z.string().max(10).optional(),
  target_lang: z.string().max(10)
});

/**
 * Iterative humanize schema
 */
const iterativeHumanizeSchema = z.object({
  profile_id: profileIdSchema,
  text: z.string()
    .min(50, 'Text must be at least 50 characters')
    .max(20000, 'Text must not exceed 20000 characters'),
  max_iterations: z.number().int().min(1).max(5).default(3),
  target_probability: z.number().min(10).max(50).default(35)
});

/**
 * Password reset schema
 */
const passwordResetSchema = z.object({
  email: emailSchema,
  code: z.string().length(6).regex(/^\d+$/),
  newPassword: passwordSchema
});

/**
 * Change password schema
 */
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Constants
  ALLOWED_MODELS,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  
  // Base schemas
  emailSchema,
  profileIdSchema,
  userIdSchema,
  modelSchema,
  textSchema,
  passwordSchema,
  displayNameSchema,
  
  // User schemas
  userRegistrationSchema,
  userLoginSchema,
  
  // Profile schemas
  sampleTypeSchema,
  writingSampleSchema,
  createProfileSchema,
  addSampleSchema,
  
  // Analysis schemas
  analyzeTextSchema,
  detectAISchema,
  rewriteTextSchema,
  
  // Chat schemas
  chatMessageSchema,
  chatRequestSchema,
  
  // OTP schemas
  otpRequestSchema,
  otpVerifySchema,
  
  // Other schemas
  getSuggestionsSchema,
  translateSchema,
  iterativeHumanizeSchema,
  passwordResetSchema,
  changePasswordSchema
};
