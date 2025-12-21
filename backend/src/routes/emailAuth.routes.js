/**
 * Email Authentication Routes
 * 
 * Routes for email/password authentication:
 * - Registration and verification
 * - Login
 * - Password reset
 * - Google account linking
 */

const express = require('express');
const router = express.Router();
const emailAuthController = require('../controllers/emailAuth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

/**
 * Register new user
 * POST /auth/email/register
 * Body: { email, password, displayName, locale? }
 */
router.post('/register', emailAuthController.register);

/**
 * Verify email with OTP
 * POST /auth/email/verify
 * Body: { email, otp }
 */
router.post('/verify', emailAuthController.verifyEmail);

/**
 * Login with email and password
 * POST /auth/email/login
 * Body: { email, password }
 */
router.post('/login', emailAuthController.login);

/**
 * Resend verification OTP
 * POST /auth/email/resend-otp
 * Body: { email, locale? }
 */
router.post('/resend-otp', emailAuthController.resendOTP);

/**
 * Request password reset
 * POST /auth/email/forgot-password
 * Body: { email, locale? }
 */
router.post('/forgot-password', emailAuthController.forgotPassword);

/**
 * Login or register with Google OAuth (for Google-only users)
 * POST /auth/email/google-login
 * Body: { accessToken }
 * 
 * Creates a new user if not exists, or logs in existing Google user.
 * Returns JWT tokens and welcome credits for new users.
 */
router.post('/google-login', emailAuthController.loginWithGoogleOAuth);

/**
 * Reset password with OTP
 * POST /auth/email/reset-password
 * Body: { email, otp, newPassword }
 */
router.post('/reset-password', emailAuthController.resetPassword);

/**
 * Refresh access token
 * POST /auth/email/refresh
 * Body: { refreshToken }
 */
router.post('/refresh', emailAuthController.refreshToken);

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

/**
 * Change password
 * POST /auth/email/change-password
 * Body: { currentPassword, newPassword }
 * Requires: Bearer token
 */
router.post('/change-password', authenticate, emailAuthController.changePassword);

/**
 * Delete account
 * DELETE /auth/email/account
 * Body: { password } (required for email users)
 * Requires: Bearer token
 */
router.delete('/account', authenticate, emailAuthController.deleteAccount);

/**
 * Get active sessions
 * GET /auth/email/sessions
 * Requires: Bearer token
 */
router.get('/sessions', authenticate, emailAuthController.getSessions);

/**
 * Revoke a specific session
 * DELETE /auth/email/sessions/:sessionId
 * Requires: Bearer token
 */
router.delete('/sessions/:sessionId', authenticate, emailAuthController.revokeSession);

/**
 * Revoke all other sessions
 * POST /auth/email/sessions/revoke-others
 * Body: { currentSessionId }
 * Requires: Bearer token
 */
router.post('/sessions/revoke-others', authenticate, emailAuthController.revokeOtherSessions);

/**
 * Revoke ALL sessions (including current) - Sign out from all devices
 * POST /auth/email/sessions/revoke-all
 * Requires: Bearer token
 */
router.post('/sessions/revoke-all', authenticate, emailAuthController.revokeAllSessions);

/**
 * Get login history
 * GET /auth/email/login-history
 * Query: { limit }
 * Requires: Bearer token
 */
router.get('/login-history', authenticate, emailAuthController.getLoginHistory);

module.exports = router;
