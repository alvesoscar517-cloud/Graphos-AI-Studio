/**
 * Zod Validation Schemas
 * Centralized validation for forms and API data
 */

import { z } from 'zod'

// ============================================
// Common Validators
// ============================================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address')

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters')

export const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const requiredString = (fieldName = 'This field') =>
  z.string().min(1, `${fieldName} is required`)

export const optionalString = z.string().optional()

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be at most 50 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  newPassword: strongPasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: strongPasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// ============================================
// Profile Schemas
// ============================================

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Profile name is required')
    .max(50, 'Profile name must be at most 50 characters'),
  description: z.string().max(200, 'Description must be at most 200 characters').optional(),
  writingStyle: z.string().optional(),
  tone: z.string().optional(),
  expertise: z.array(z.string()).optional(),
})

export const profileSampleTextSchema = z.object({
  text: z
    .string()
    .min(100, 'Sample text must be at least 100 characters')
    .max(10000, 'Sample text must be at most 10,000 characters'),
})

// ============================================
// Analysis Schemas
// ============================================

export const analysisInputSchema = z.object({
  text: z
    .string()
    .min(50, 'Text must be at least 50 characters for accurate analysis')
    .max(50000, 'Text must be at most 50,000 characters'),
})

// ============================================
// Note Schemas
// ============================================

export const noteSchema = z.object({
  title: z.string().max(100, 'Title must be at most 100 characters').optional(),
  content: z.string().max(50000, 'Content must be at most 50,000 characters'),
  type: z.enum(['Chat prompt', 'Note', 'Template']).optional(),
})

// ============================================
// Feedback Schema
// ============================================

export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'general']),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be at most 100 characters'),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(2000, 'Message must be at most 2000 characters'),
  email: emailSchema.optional(),
})

// ============================================
// Settings Schema
// ============================================

export const settingsSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be at most 50 characters')
    .optional(),
  language: z.enum(['en', 'vi', 'ja', 'ko', 'zh']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    marketing: z.boolean().optional(),
  }).optional(),
})

// ============================================
// Search Schema
// ============================================

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200, 'Search query too long'),
  filters: z.object({
    type: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }).optional(),
})

// ============================================
// Utility Functions
// ============================================

/**
 * Calculate simple text statistics for form validation
 * For detailed text analysis, use src/utils/validation.js
 */
export function calculateSimpleTextStats(text) {
  if (!text) {
    return { charCount: 0, wordCount: 0, sentenceCount: 0 }
  }
  
  const charCount = text.length
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
  
  return { charCount, wordCount, sentenceCount }
}

// Alias for backward compatibility
export const calculateTextStats = calculateSimpleTextStats

/**
 * Validate password strength
 * @returns {{ score: number, feedback: string[] }}
 */
export function validatePasswordStrength(password) {
  const feedback = []
  let score = 0
  
  if (!password) {
    return { score: 0, feedback: ['Password is required'] }
  }
  
  if (password.length >= 8) score++
  else feedback.push('At least 8 characters')
  
  if (password.length >= 12) score++
  
  if (/[A-Z]/.test(password)) score++
  else feedback.push('At least one uppercase letter')
  
  if (/[a-z]/.test(password)) score++
  else feedback.push('At least one lowercase letter')
  
  if (/[0-9]/.test(password)) score++
  else feedback.push('At least one number')
  
  if (/[^A-Za-z0-9]/.test(password)) score++
  else feedback.push('At least one special character (recommended)')
  
  return { score: Math.min(score, 5), feedback }
}

export default {
  // Auth
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  otpSchema,
  // Profile
  profileSchema,
  profileSampleTextSchema,
  // Analysis
  analysisInputSchema,
  // Notes
  noteSchema,
  // Feedback
  feedbackSchema,
  // Settings
  settingsSchema,
  // Search
  searchSchema,
  // Utilities
  calculateTextStats,
  calculateSimpleTextStats,
  validatePasswordStrength,
}
