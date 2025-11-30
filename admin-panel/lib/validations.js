import { z } from 'zod'

// ============================================
// Common Validators
// ============================================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters')

export const requiredString = (fieldName = 'This field') => 
  z.string().min(1, `${fieldName} is required`)

export const optionalString = z.string().optional()

// ============================================
// Login Form Schema
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

// ============================================
// User Edit Form Schema
// ============================================

export const userEditSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be at most 50 characters'),
  email: emailSchema,
  role: z.enum(['admin', 'moderator', 'user'], {
    errorMap: () => ({ message: 'Please select a role' }),
  }),
  status: z.enum(['active', 'suspended', 'banned'], {
    errorMap: () => ({ message: 'Please select a status' }),
  }),
})

// ============================================
// Notification Form Schema
// ============================================

export const notificationSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be at most 100 characters'),
  content: z
    .string()
    .min(1, 'Content is required')
    .min(10, 'Content must be at least 10 characters'),
  type: z.enum(['info', 'warning', 'promotion'], {
    errorMap: () => ({ message: 'Please select a notification type' }),
  }),
  targetAudience: z.enum(['all', 'premium', 'free'], {
    errorMap: () => ({ message: 'Please select target audience' }),
  }),
  scheduledAt: z.string().optional(),
})

// ============================================
// Support Reply Form Schema
// ============================================

export const supportReplySchema = z.object({
  content: z
    .string()
    .min(1, 'Reply content is required')
    .min(10, 'Content must be at least 10 characters'),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
})

// ============================================
// Settings Form Schema
// ============================================

export const settingsSchema = z.object({
  siteName: requiredString('Site name'),
  siteDescription: optionalString,
  maintenanceMode: z.boolean(),
  allowRegistration: z.boolean(),
})
