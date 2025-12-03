/**
 * Auth Components barrel export
 * All components use React Hook Form + Zod for validation
 */

// Main components
export { default as LoginOverlay } from './LoginOverlay'
export { default as EmailLoginForm } from './EmailLoginForm'
export { default as OTPVerification } from './OTPVerification'

// V2 components (React Hook Form + Zod) - Primary exports
export { default as EmailRegisterForm } from './EmailRegisterFormV2'
export { default as ForgotPassword } from './ForgotPasswordV2'

// Legacy aliases for backward compatibility
export { default as EmailRegisterFormV2 } from './EmailRegisterFormV2'
export { default as ForgotPasswordV2 } from './ForgotPasswordV2'

// Settings & Account
export { default as AccountSettings } from './AccountSettings'
export { default as SecuritySettings } from './SecuritySettings'
export { default as ChangePasswordV2 } from './ChangePasswordV2'

// Google linking
export { default as LinkGoogleAccount } from './LinkGoogleAccount'
export { default as LinkGooglePrompt } from './LinkGooglePrompt'
