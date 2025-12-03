/**
 * Email Authentication Service
 * 
 * Handles email/password authentication:
 * - User registration with email verification
 * - Login with email/password
 * - Password reset
 * - Google account linking
 */

const { getAdmin } = require('../config/firebaseAdmin');
const admin = getAdmin();
const { hashPassword, verifyPassword, verifyAndRehash } = require('../utils/password');
const { db, FieldValue } = require('../config/firebase');
const otpService = require('./otp.service');
const { validatePassword, validateEmail, validateDisplayName, normalizeEmail } = require('../utils/authValidation');
const logger = require('../utils/logger');
const { FREE_CREDITS } = require('../config/pricing');
const config = require('../config');
const { sendWelcomeNotification } = require('./autoNotification.service');
const { get: httpGet } = require('../utils/httpClient');

// Collections
const USERS_COLLECTION = 'users';
const PENDING_REGISTRATIONS_COLLECTION = 'pending_registrations';

// Constants
const PENDING_REGISTRATION_EXPIRY_HOURS = 24;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MINUTES = 30;
const LOGIN_ATTEMPT_WINDOW_MINUTES = 15;
const PASSWORD_HISTORY_COUNT = 5; // Number of previous passwords to check
const SESSION_COLLECTION = 'user_sessions';
const LOGIN_HISTORY_COLLECTION = 'login_history';

// Disposable email domains (common ones)
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com',
  'temp-mail.org', '10minutemail.com', 'fakeinbox.com', 'trashmail.com',
  'yopmail.com', 'getnada.com', 'tempail.com', 'dispostable.com',
  'mailnesia.com', 'tempr.email', 'discard.email', 'spamgourmet.com'
];

/**
 * Register a new user with email and password
 * Creates a pending registration and sends OTP for verification
 * 
 * @param {Object} data - Registration data
 * @param {string} data.email - User email
 * @param {string} data.password - User password
 * @param {string} data.displayName - Display name
 * @param {string} [data.locale='en'] - User locale for emails
 * @returns {Promise<{success: boolean, pendingVerification: boolean, message: string}>}
 */
async function register({ email, password, displayName, locale = 'en' }) {
  // Validate inputs
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    throw new Error(`AUTH_INVALID_EMAIL: ${emailValidation.error}`);
  }
  
  // Check for disposable email
  const normalizedEmail = normalizeEmail(email);
  const emailDomain = normalizedEmail.split('@')[1];
  if (DISPOSABLE_EMAIL_DOMAINS.includes(emailDomain)) {
    throw new Error('AUTH_DISPOSABLE_EMAIL: Disposable email addresses are not allowed');
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new Error(`AUTH_WEAK_PASSWORD: ${passwordValidation.errors.join('. ')}`);
  }
  
  const nameValidation = validateDisplayName(displayName);
  if (!nameValidation.valid) {
    throw new Error(`AUTH_INVALID_NAME: ${nameValidation.error}`);
  }
  
  // Check if email already exists in users collection (fully registered)
  const existingUser = await db.collection(USERS_COLLECTION)
    .where('email', '==', normalizedEmail)
    .limit(1)
    .get();
  
  if (!existingUser.empty) {
    throw new Error('AUTH_EMAIL_EXISTS: This email is already registered');
  }
  
  // Check if there's a pending registration - allow re-registration with new OTP
  const existingPending = await db.collection(PENDING_REGISTRATIONS_COLLECTION).doc(normalizedEmail).get();
  if (existingPending.exists) {
    logger.info('Re-registration for pending email, updating registration', { email: normalizedEmail });
  }
  
  // Hash password with argon2 (OWASP recommended)
  const passwordHash = await hashPassword(password);
  
  // Create/update pending registration
  const now = new Date();
  const expiresAt = new Date(now.getTime() + PENDING_REGISTRATION_EXPIRY_HOURS * 60 * 60 * 1000);
  
  const pendingData = {
    email: normalizedEmail,
    passwordHash,
    displayName: displayName.trim(),
    locale,
    createdAt: existingPending.exists ? existingPending.data().createdAt : now,
    updatedAt: now,
    expiresAt
  };
  
  await db.collection(PENDING_REGISTRATIONS_COLLECTION).doc(normalizedEmail).set(pendingData);
  
  // Invalidate old OTP if exists, then generate new one
  await otpService.invalidateOTP(normalizedEmail, 'verification');
  const { code, expiresAt: otpExpiresAt } = await otpService.generateOTP(normalizedEmail, 'verification');
  
  logger.info('Registration pending', { email: normalizedEmail });
  
  return {
    success: true,
    pendingVerification: true,
    otpCode: code, // Return for email sending
    otpExpiresAt,
    message: 'Please check your email for verification code'
  };
}

/**
 * Verify email with OTP and activate account
 * 
 * @param {string} email - User email
 * @param {string} otp - OTP code
 * @returns {Promise<{success: boolean, user: Object, token: string}>}
 */
async function verifyEmail(email, otp) {
  const normalizedEmail = normalizeEmail(email);
  
  logger.info('Starting email verification', { email: normalizedEmail });
  
  // Verify OTP
  const otpResult = await otpService.verifyOTP(normalizedEmail, otp, 'verification');
  
  if (!otpResult.success) {
    throw new Error(`AUTH_INVALID_OTP: ${otpResult.error}`);
  }
  
  // Get pending registration
  const pendingDoc = await db.collection(PENDING_REGISTRATIONS_COLLECTION).doc(normalizedEmail).get();
  
  if (!pendingDoc.exists) {
    throw new Error('AUTH_REGISTRATION_EXPIRED: Registration has expired. Please register again.');
  }
  
  const pendingData = pendingDoc.data();
  
  // Check if pending registration expired
  if (pendingData.expiresAt.toDate() < new Date()) {
    await db.collection(PENDING_REGISTRATIONS_COLLECTION).doc(normalizedEmail).delete();
    throw new Error('AUTH_REGISTRATION_EXPIRED: Registration has expired. Please register again.');
  }
  
  // Create user in Firebase Auth
  let firebaseUser;
  try {
    logger.info('Creating Firebase Auth user', { 
      email: normalizedEmail,
      adminAppsCount: admin.apps.length,
      projectId: config.PROJECT_ID
    });
    
    firebaseUser = await admin.auth().createUser({
      email: normalizedEmail,
      emailVerified: true,
      displayName: pendingData.displayName,
      disabled: false
    });
    
    logger.info('Firebase Auth user created', { email: normalizedEmail, uid: firebaseUser.uid });
  } catch (error) {
    logger.error('Firebase Auth createUser failed', { 
      email: normalizedEmail, 
      error: error.message, 
      code: error.code,
      errorName: error.name,
      errorDetails: error.errorInfo || null,
      stack: error.stack 
    });
    
    if (error.code === 'auth/email-already-exists') {
      // Clean up OTP since email already exists
      await otpService.invalidateOTP(normalizedEmail, 'verification');
      throw new Error('AUTH_EMAIL_EXISTS: This email is already registered');
    }
    
    // Check for permission/credential errors
    if (error.code === 'auth/insufficient-permission' || 
        error.code === 'auth/invalid-credential' ||
        error.message?.includes('PERMISSION_DENIED') ||
        error.message?.includes('credential')) {
      logger.error('Firebase Auth permission error - check service account roles', {
        email: normalizedEmail,
        code: error.code
      });
      throw new Error('AUTH_SERVICE_ERROR: Service configuration error. Please contact support.');
    }
    
    if (error.message?.includes('Firebase') || error.message?.includes('initializeApp') || error.code?.startsWith('app/')) {
      throw new Error('AUTH_SERVICE_UNAVAILABLE: Authentication service is temporarily unavailable. Please try again later.');
    }
    // Don't clean up OTP on other errors so user can retry
    throw new Error(`AUTH_SERVICE_ERROR: Unable to create account. Please try again later. [${error.code || 'UNKNOWN'}]`);
  }
  
  // Create user document in Firestore
  const userId = firebaseUser.uid;
  const now = new Date();
  
  const userData = {
    email: normalizedEmail,
    name: pendingData.displayName,
    picture: '', // Default empty for email users
    tier: 'free',
    credits: {
      balance: FREE_CREDITS,
      purchased: 0,
      used: 0,
      free: FREE_CREDITS
    },
    usage: {
      profilesCount: 0,
      analysesCount: 0,
      rewritesCount: 0
    },
    authProvider: 'email',
    emailVerified: true,
    passwordHash: pendingData.passwordHash,
    createdAt: now,
    lastLoginAt: now
  };
  
  await db.collection(USERS_COLLECTION).doc(userId).set(userData);
  
  // Send welcome notification for new user
  try {
    await sendWelcomeNotification(userId, FREE_CREDITS);
    logger.info('Welcome notification sent', { userId, email: normalizedEmail });
  } catch (notifError) {
    logger.warn('Failed to send welcome notification', { userId, error: notifError.message });
  }
  
  // Delete pending registration and OTP (cleanup after successful user creation)
  await db.collection(PENDING_REGISTRATIONS_COLLECTION).doc(normalizedEmail).delete();
  await otpService.invalidateOTP(normalizedEmail, 'verification');
  
  // Generate custom token for client
  let token = null;
  try {
    token = await admin.auth().createCustomToken(userId);
  } catch (error) {
    logger.error('Failed to create custom token', { userId, error: error.message, code: error.code });
    // Don't throw - account is created, user can login manually
    // This happens when service account doesn't have "Service Account Token Creator" role
  }

  logger.info('User registered and verified', { userId, email: normalizedEmail, hasToken: !!token });

  return {
    success: true,
    needsLogin: !token, // Flag to tell frontend user needs to login manually
    user: {
      userId,
      email: normalizedEmail,
      name: pendingData.displayName,
      picture: '',
      tier: 'free',
      authProvider: 'email'
    },
    token
  };
}

/**
 * Login with email and password
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, user: Object, token: string}>}
 */
async function login(email, password) {
  const normalizedEmail = normalizeEmail(email);
  
  // Find user by email
  const usersSnapshot = await db.collection(USERS_COLLECTION)
    .where('email', '==', normalizedEmail)
    .where('authProvider', '==', 'email')
    .limit(1)
    .get();
  
  if (usersSnapshot.empty) {
    // Don't reveal if email exists
    throw new Error('AUTH_INVALID_CREDENTIALS: Invalid email or password');
  }
  
  const userDoc = usersSnapshot.docs[0];
  const userData = userDoc.data();
  const userId = userDoc.id;
  
  // Check if account is deleted (soft delete by admin)
  if (userData.deleted === true) {
    logger.warn('Login attempt on deleted account', { userId, email: normalizedEmail });
    throw new Error('AUTH_ACCOUNT_DELETED: This account has been deleted. Please contact support if you believe this is an error.');
  }
  
  // Check if account is locked by admin
  if (userData.locked === true) {
    logger.warn('Login attempt on admin-locked account', { userId, email: normalizedEmail, reason: userData.lockReason });
    throw new Error(`AUTH_ACCOUNT_SUSPENDED: Your account has been suspended.${userData.lockReason ? ` Reason: ${userData.lockReason}` : ''} Please contact support.`);
  }
  
  // Check if account is temporarily locked (due to failed login attempts)
  if (userData.lockedUntil) {
    const lockedUntil = userData.lockedUntil.toDate();
    if (lockedUntil > new Date()) {
      const waitMinutes = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
      throw new Error(`AUTH_ACCOUNT_LOCKED: Account is temporarily locked. Please try again in ${waitMinutes} minutes.`);
    }
  }
  
  // Check if email is verified
  if (!userData.emailVerified) {
    throw new Error('AUTH_EMAIL_NOT_VERIFIED: Please verify your email before logging in');
  }
  
  // Verify password (supports both argon2 and legacy bcrypt hashes)
  const { valid: isValidPassword, newHash } = await verifyAndRehash(userData.passwordHash, password);
  
  // If password was verified with old bcrypt hash, upgrade to argon2
  if (isValidPassword && newHash) {
    await db.collection(USERS_COLLECTION).doc(userId).update({ passwordHash: newHash });
    logger.info('Password hash upgraded to argon2', { userId });
  }
  
  if (!isValidPassword) {
    // Track failed attempts
    const now = new Date();
    const windowStart = new Date(now.getTime() - LOGIN_ATTEMPT_WINDOW_MINUTES * 60 * 1000);
    
    let failedAttempts = userData.failedLoginAttempts || 0;
    const lastFailedAt = userData.lastFailedLoginAt?.toDate();
    
    // Reset counter if outside window
    if (!lastFailedAt || lastFailedAt < windowStart) {
      failedAttempts = 0;
    }
    
    failedAttempts++;
    
    const updateData = {
      failedLoginAttempts: failedAttempts,
      lastFailedLoginAt: now
    };
    
    // Lock account if too many attempts
    if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
      updateData.lockedUntil = new Date(now.getTime() + LOGIN_LOCKOUT_MINUTES * 60 * 1000);
      await db.collection(USERS_COLLECTION).doc(userId).update(updateData);
      
      logger.warn('Account locked due to failed attempts', { userId, email: normalizedEmail });
      throw new Error(`AUTH_ACCOUNT_LOCKED: Too many failed attempts. Account locked for ${LOGIN_LOCKOUT_MINUTES} minutes.`);
    }
    
    await db.collection(USERS_COLLECTION).doc(userId).update(updateData);
    
    const remaining = MAX_LOGIN_ATTEMPTS - failedAttempts;
    throw new Error(`AUTH_INVALID_CREDENTIALS: Invalid email or password. ${remaining} attempts remaining.`);
  }
  
  // Successful login - reset failed attempts
  const now = new Date();
  await db.collection(USERS_COLLECTION).doc(userId).update({
    failedLoginAttempts: 0,
    lastFailedLoginAt: null,
    lockedUntil: null,
    lastLoginAt: now
  });
  
  // Generate custom token
  let token = null;
  try {
    token = await admin.auth().createCustomToken(userId);
  } catch (error) {
    logger.error('Failed to create custom token on login', {
      userId,
      error: error.message,
      code: error.code
    });
    // Don't throw - we'll use a workaround with user data
  }

  logger.info('User logged in', { userId, email: normalizedEmail, hasToken: !!token });

  return {
    success: true,
    user: {
      userId,
      email: normalizedEmail,
      name: userData.name,
      picture: userData.picture || '',
      tier: userData.tier,
      authProvider: 'email',
      hasGoogleLinked: !!userData.googleLinked
    },
    token,
    // If no token, frontend will use userId + passwordHash verification
    useDirectAuth: !token
  };
}

/**
 * Login with device info tracking for new device notifications
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} deviceInfo - Device information
 * @returns {Promise<{success: boolean, user: Object, token: string, isNewDevice: boolean}>}
 */
async function loginWithDeviceTracking(email, password, deviceInfo = {}) {
  const result = await login(email, password);
  
  if (result.success) {
    const { userId } = result.user;
    const now = new Date();
    
    // Create device fingerprint
    const deviceFingerprint = createDeviceFingerprint(deviceInfo);
    
    // Check if this is a new device
    const existingSession = await db.collection(SESSION_COLLECTION)
      .where('userId', '==', userId)
      .where('deviceFingerprint', '==', deviceFingerprint)
      .limit(1)
      .get();
    
    const isNewDevice = existingSession.empty;
    
    // Record login history
    await db.collection(LOGIN_HISTORY_COLLECTION).add({
      userId,
      email: result.user.email,
      deviceInfo: {
        ...deviceInfo,
        fingerprint: deviceFingerprint
      },
      ipAddress: deviceInfo.ipAddress || 'unknown',
      userAgent: deviceInfo.userAgent || 'unknown',
      loginAt: now,
      isNewDevice
    });
    
    // Create/update session
    if (isNewDevice) {
      await db.collection(SESSION_COLLECTION).add({
        userId,
        deviceFingerprint,
        deviceInfo,
        createdAt: now,
        lastActiveAt: now
      });
    } else {
      const sessionDoc = existingSession.docs[0];
      await sessionDoc.ref.update({ lastActiveAt: now });
    }
    
    return { ...result, isNewDevice };
  }
  
  return result;
}

/**
 * Create device fingerprint from device info
 */
function createDeviceFingerprint(deviceInfo) {
  const crypto = require('crypto');
  const data = `${deviceInfo.userAgent || ''}-${deviceInfo.platform || ''}-${deviceInfo.language || ''}`;
  return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * Request password reset - sends OTP to email
 * 
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function requestPasswordReset(email) {
  const normalizedEmail = normalizeEmail(email);
  
  // Always return success to not reveal if email exists (security)
  const genericResponse = {
    success: true,
    message: 'If this email is registered, you will receive a password reset code'
  };
  
  // Find user
  const usersSnapshot = await db.collection(USERS_COLLECTION)
    .where('email', '==', normalizedEmail)
    .where('authProvider', '==', 'email')
    .limit(1)
    .get();
  
  if (usersSnapshot.empty) {
    // Don't reveal email doesn't exist
    logger.info('Password reset requested for non-existent email', { email: normalizedEmail });
    return genericResponse;
  }
  
  // Generate OTP
  try {
    const { code, expiresAt } = await otpService.generateOTP(normalizedEmail, 'password_reset');
    
    logger.info('Password reset OTP generated', { email: normalizedEmail });
    
    return {
      ...genericResponse,
      otpCode: code, // Return for email sending
      otpExpiresAt: expiresAt
    };
  } catch (error) {
    if (error.message.includes('RATE_LIMITED')) {
      throw error; // Pass through rate limit errors
    }
    logger.error('Password reset OTP generation failed', { email: normalizedEmail, error: error.message });
    return genericResponse;
  }
}

/**
 * Reset password with OTP
 * 
 * @param {string} email - User email
 * @param {string} otp - OTP code
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function resetPassword(email, otp, newPassword) {
  const normalizedEmail = normalizeEmail(email);
  
  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    throw new Error(`AUTH_WEAK_PASSWORD: ${passwordValidation.errors.join('. ')}`);
  }
  
  // Verify OTP
  const otpResult = await otpService.verifyOTP(normalizedEmail, otp, 'password_reset');
  
  if (!otpResult.success) {
    throw new Error(`AUTH_INVALID_OTP: ${otpResult.error}`);
  }
  
  // Find user
  const usersSnapshot = await db.collection(USERS_COLLECTION)
    .where('email', '==', normalizedEmail)
    .where('authProvider', '==', 'email')
    .limit(1)
    .get();
  
  if (usersSnapshot.empty) {
    throw new Error('AUTH_USER_NOT_FOUND: User not found');
  }
  
  const userDoc = usersSnapshot.docs[0];
  const userId = userDoc.id;
  
  // Hash new password with argon2
  const passwordHash = await hashPassword(newPassword);
  
  // Update password and reset security fields
  await db.collection(USERS_COLLECTION).doc(userId).update({
    passwordHash,
    failedLoginAttempts: 0,
    lastFailedLoginAt: null,
    lockedUntil: null,
    passwordChangedAt: new Date()
  });
  
  // Revoke all existing sessions by revoking refresh tokens
  try {
    await admin.auth().revokeRefreshTokens(userId);
  } catch (error) {
    logger.warn('Failed to revoke refresh tokens', { userId, error: error.message });
  }
  
  logger.info('Password reset successful', { userId, email: normalizedEmail });
  
  return {
    success: true,
    message: 'Password has been reset successfully. Please login with your new password.'
  };
}

/**
 * Link Google account to email user
 * 
 * @param {string} userId - User ID
 * @param {string} googleIdToken - Google ID token
 * @returns {Promise<{success: boolean, googleEmail: string}>}
 */
async function linkGoogle(userId, googleIdToken) {
  // Verify Google token
  const decodedToken = await admin.auth().verifyIdToken(googleIdToken);
  const googleId = decodedToken.uid;
  const googleEmail = decodedToken.email;
  
  // Check if Google account is already linked to another user
  const existingLink = await db.collection(USERS_COLLECTION)
    .where('googleLinked.googleId', '==', googleId)
    .limit(1)
    .get();
  
  if (!existingLink.empty && existingLink.docs[0].id !== userId) {
    throw new Error('AUTH_GOOGLE_ALREADY_LINKED: This Google account is already linked to another user');
  }
  
  // Get user document
  const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
  
  if (!userDoc.exists) {
    throw new Error('AUTH_USER_NOT_FOUND: User not found');
  }
  
  const userData = userDoc.data();
  
  if (userData.authProvider !== 'email') {
    throw new Error('AUTH_INVALID_OPERATION: Only email users can link Google accounts');
  }
  
  // Link Google account
  await db.collection(USERS_COLLECTION).doc(userId).update({
    googleLinked: {
      googleId,
      googleEmail,
      linkedAt: new Date()
    }
  });
  
  logger.info('Google account linked', { userId, googleEmail });
  
  return {
    success: true,
    googleEmail
  };
}

/**
 * Unlink Google account from email user
 * 
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean}>}
 */
async function unlinkGoogle(userId) {
  const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
  
  if (!userDoc.exists) {
    throw new Error('AUTH_USER_NOT_FOUND: User not found');
  }
  
  const userData = userDoc.data();
  
  if (!userData.googleLinked) {
    throw new Error('AUTH_NO_GOOGLE_LINKED: No Google account is linked');
  }
  
  await db.collection(USERS_COLLECTION).doc(userId).update({
    googleLinked: FieldValue.delete()
  });
  
  logger.info('Google account unlinked', { userId });
  
  return { success: true };
}

/**
 * Resend verification OTP
 * 
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, otpCode: string, otpExpiresAt: Date}>}
 */
async function resendVerificationOTP(email) {
  const normalizedEmail = normalizeEmail(email);
  
  // Check if pending registration exists
  const pendingDoc = await db.collection(PENDING_REGISTRATIONS_COLLECTION).doc(normalizedEmail).get();
  
  if (!pendingDoc.exists) {
    throw new Error('AUTH_NO_PENDING_REGISTRATION: No pending registration found for this email');
  }
  
  // Generate new OTP (this invalidates the old one)
  const { code, expiresAt } = await otpService.generateOTP(normalizedEmail, 'verification');
  
  logger.info('Verification OTP resent', { email: normalizedEmail });
  
  return {
    success: true,
    otpCode: code,
    otpExpiresAt: expiresAt
  };
}

/**
 * Get user by email (for checking existence)
 * 
 * @param {string} email - User email
 * @returns {Promise<Object|null>}
 */
async function getUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  
  const usersSnapshot = await db.collection(USERS_COLLECTION)
    .where('email', '==', normalizedEmail)
    .limit(1)
    .get();
  
  if (usersSnapshot.empty) {
    return null;
  }
  
  const userDoc = usersSnapshot.docs[0];
  return {
    userId: userDoc.id,
    ...userDoc.data()
  };
}

/**
 * Change password for authenticated user
 * 
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function changePassword(userId, currentPassword, newPassword) {
  // Get user document
  const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
  
  if (!userDoc.exists) {
    throw new Error('AUTH_USER_NOT_FOUND: User not found');
  }
  
  const userData = userDoc.data();
  
  if (userData.authProvider !== 'email') {
    throw new Error('AUTH_INVALID_OPERATION: Password change is only available for email users');
  }
  
  // Verify current password (supports both argon2 and legacy bcrypt)
  const isValidPassword = await verifyPassword(userData.passwordHash, currentPassword);
  if (!isValidPassword) {
    throw new Error('AUTH_INVALID_PASSWORD: Current password is incorrect');
  }
  
  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    throw new Error(`AUTH_WEAK_PASSWORD: ${passwordValidation.errors.join('. ')}`);
  }
  
  // Check password history (supports both argon2 and legacy bcrypt)
  const passwordHistory = userData.passwordHistory || [];
  for (const oldHash of passwordHistory) {
    const isSameAsOld = await verifyPassword(oldHash, newPassword);
    if (isSameAsOld) {
      throw new Error(`AUTH_PASSWORD_REUSED: Cannot reuse one of your last ${PASSWORD_HISTORY_COUNT} passwords`);
    }
  }
  
  // Also check current password
  const isSameAsCurrent = await verifyPassword(userData.passwordHash, newPassword);
  if (isSameAsCurrent) {
    throw new Error('AUTH_PASSWORD_SAME: New password must be different from current password');
  }
  
  // Hash new password with argon2
  const newPasswordHash = await hashPassword(newPassword);
  
  // Update password history (keep last N passwords)
  const newHistory = [userData.passwordHash, ...passwordHistory].slice(0, PASSWORD_HISTORY_COUNT);
  
  // Update user document
  await db.collection(USERS_COLLECTION).doc(userId).update({
    passwordHash: newPasswordHash,
    passwordHistory: newHistory,
    passwordChangedAt: new Date()
  });
  
  // Revoke all existing sessions
  try {
    await admin.auth().revokeRefreshTokens(userId);
  } catch (error) {
    logger.warn('Failed to revoke refresh tokens', { userId, error: error.message });
  }
  
  logger.info('Password changed successfully', { userId });
  
  return {
    success: true,
    message: 'Password changed successfully. Please login again with your new password.'
  };
}

/**
 * Delete user account
 * 
 * @param {string} userId - User ID
 * @param {string} password - User password for confirmation
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function deleteAccount(userId, password) {
  // Get user document
  const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
  
  if (!userDoc.exists) {
    throw new Error('AUTH_USER_NOT_FOUND: User not found');
  }
  
  const userData = userDoc.data();
  
  // For email users, verify password
  if (userData.authProvider === 'email') {
    if (!password) {
      throw new Error('AUTH_PASSWORD_REQUIRED: Password is required to delete account');
    }
    
    const isValidPassword = await verifyPassword(userData.passwordHash, password);
    if (!isValidPassword) {
      throw new Error('AUTH_INVALID_PASSWORD: Password is incorrect');
    }
  }
  
  // Delete user sessions
  const sessionsSnapshot = await db.collection(SESSION_COLLECTION)
    .where('userId', '==', userId)
    .get();
  
  const batch = db.batch();
  sessionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  
  // Delete login history
  const historySnapshot = await db.collection(LOGIN_HISTORY_COLLECTION)
    .where('userId', '==', userId)
    .get();
  
  historySnapshot.docs.forEach(doc => batch.delete(doc.ref));
  
  // Delete user document
  batch.delete(db.collection(USERS_COLLECTION).doc(userId));
  
  await batch.commit();
  
  // Delete from Firebase Auth
  try {
    await admin.auth().deleteUser(userId);
  } catch (error) {
    logger.warn('Failed to delete Firebase Auth user', { userId, error: error.message });
  }
  
  logger.info('Account deleted', { userId, email: userData.email });
  
  return {
    success: true,
    message: 'Your account has been permanently deleted.'
  };
}

/**
 * Get user's active sessions
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
async function getActiveSessions(userId) {
  const sessionsSnapshot = await db.collection(SESSION_COLLECTION)
    .where('userId', '==', userId)
    .orderBy('lastActiveAt', 'desc')
    .get();
  
  return sessionsSnapshot.docs.map(doc => ({
    sessionId: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    lastActiveAt: doc.data().lastActiveAt?.toDate()
  }));
}

/**
 * Revoke a specific session
 * 
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID to revoke
 * @returns {Promise<{success: boolean}>}
 */
async function revokeSession(userId, sessionId) {
  const sessionDoc = await db.collection(SESSION_COLLECTION).doc(sessionId).get();
  
  if (!sessionDoc.exists) {
    throw new Error('AUTH_SESSION_NOT_FOUND: Session not found');
  }
  
  if (sessionDoc.data().userId !== userId) {
    throw new Error('AUTH_UNAUTHORIZED: Not authorized to revoke this session');
  }
  
  await sessionDoc.ref.delete();
  
  logger.info('Session revoked', { userId, sessionId });
  
  return { success: true };
}

/**
 * Revoke all sessions except current
 * 
 * @param {string} userId - User ID
 * @param {string} currentSessionId - Current session ID to keep
 * @returns {Promise<{success: boolean, revokedCount: number}>}
 */
async function revokeAllOtherSessions(userId, currentSessionId) {
  const sessionsSnapshot = await db.collection(SESSION_COLLECTION)
    .where('userId', '==', userId)
    .get();
  
  const batch = db.batch();
  let revokedCount = 0;
  
  sessionsSnapshot.docs.forEach(doc => {
    if (doc.id !== currentSessionId) {
      batch.delete(doc.ref);
      revokedCount++;
    }
  });
  
  await batch.commit();
  
  logger.info('All other sessions revoked', { userId, revokedCount });
  
  return { success: true, revokedCount };
}

/**
 * Get login history
 * 
 * @param {string} userId - User ID
 * @param {number} limit - Number of records to return
 * @returns {Promise<Array>}
 */
async function getLoginHistory(userId, limit = 10) {
  const historySnapshot = await db.collection(LOGIN_HISTORY_COLLECTION)
    .where('userId', '==', userId)
    .orderBy('loginAt', 'desc')
    .limit(limit)
    .get();
  
  return historySnapshot.docs.map(doc => ({
    ...doc.data(),
    loginAt: doc.data().loginAt?.toDate()
  }));
}

/**
 * Cleanup expired pending registrations
 * Should be called by a scheduled job
 * 
 * @returns {Promise<{deletedCount: number}>}
 */
async function cleanupExpiredRegistrations() {
  const now = new Date();
  
  const expiredSnapshot = await db.collection(PENDING_REGISTRATIONS_COLLECTION)
    .where('expiresAt', '<', now)
    .get();
  
  if (expiredSnapshot.empty) {
    return { deletedCount: 0 };
  }
  
  const batch = db.batch();
  expiredSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  
  logger.info('Cleaned up expired registrations', { deletedCount: expiredSnapshot.size });
  
  return { deletedCount: expiredSnapshot.size };
}

/**
 * Cleanup old login history (older than 90 days)
 * Should be called by a scheduled job
 * 
 * @returns {Promise<{deletedCount: number}>}
 */
async function cleanupOldLoginHistory() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  
  const oldHistorySnapshot = await db.collection(LOGIN_HISTORY_COLLECTION)
    .where('loginAt', '<', cutoffDate)
    .limit(500) // Process in batches
    .get();
  
  if (oldHistorySnapshot.empty) {
    return { deletedCount: 0 };
  }
  
  const batch = db.batch();
  oldHistorySnapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  
  logger.info('Cleaned up old login history', { deletedCount: oldHistorySnapshot.size });
  
  return { deletedCount: oldHistorySnapshot.size };
}

/**
 * Link Google account using OAuth access token (for Chrome extension)
 * This allows email users to link Google for Drive sync
 * 
 * @param {string} userId - User ID
 * @param {Object} googleData - Google OAuth data
 * @param {string} googleData.accessToken - OAuth access token
 * @param {string} googleData.email - Google email
 * @param {string} googleData.name - Google display name
 * @returns {Promise<{success: boolean, googleEmail: string}>}
 */
async function linkGoogleWithOAuth(userId, googleData) {
  const { accessToken, email, name } = googleData;
  
  // Verify the access token by calling Google API
  try {
    const googleUserInfo = await httpGet('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    // Verify email matches
    if (googleUserInfo.email !== email) {
      throw new Error('AUTH_INVALID_TOKEN: Email mismatch');
    }
  } catch (error) {
    if (error.message.startsWith('AUTH_')) {
      throw error;
    }
    logger.error('Google token verification failed', { error: error.message });
    throw new Error('AUTH_INVALID_TOKEN: Failed to verify Google token');
  }
  
  // Check if Google email is already linked to another user
  const existingLink = await db.collection(USERS_COLLECTION)
    .where('googleLinked.googleEmail', '==', email)
    .limit(1)
    .get();
  
  if (!existingLink.empty && existingLink.docs[0].id !== userId) {
    throw new Error('AUTH_GOOGLE_ALREADY_LINKED: This Google account is already linked to another user');
  }
  
  // Get user document
  const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
  
  if (!userDoc.exists) {
    throw new Error('AUTH_USER_NOT_FOUND: User not found');
  }
  
  const userData = userDoc.data();
  
  if (userData.authProvider !== 'email') {
    throw new Error('AUTH_INVALID_OPERATION: Only email users can link Google accounts');
  }
  
  // Link Google account
  await db.collection(USERS_COLLECTION).doc(userId).update({
    googleLinked: {
      googleEmail: email,
      googleName: name || email.split('@')[0],
      linkedAt: new Date(),
      driveEnabled: true // Flag to indicate Drive sync is available
    }
  });
  
  logger.info('Google account linked via OAuth', { userId, googleEmail: email });
  
  return {
    success: true,
    googleEmail: email
  };
}

// ============================================================================
// TOKEN REFRESH
// ============================================================================

// Refresh token storage (in production, use Redis or database)
const refreshTokens = new Map();
const REFRESH_TOKEN_EXPIRY_DAYS = 30;
const ACCESS_TOKEN_EXPIRY_SECONDS = 3600; // 1 hour

/**
 * Generate tokens for user
 * @param {string} userId - User ID
 * @returns {Promise<{accessToken: string, refreshToken: string, expiresIn: number}>}
 */
async function generateTokens(userId) {
  const crypto = require('crypto');
  
  // Generate access token (custom token from Firebase)
  let accessToken;
  try {
    accessToken = await admin.auth().createCustomToken(userId);
  } catch (error) {
    logger.error('Failed to create access token', { userId, error: error.message });
    throw new Error('AUTH_TOKEN_GENERATION_FAILED: Unable to generate access token');
  }
  
  // Generate refresh token (random secure token)
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  // Store refresh token
  refreshTokens.set(refreshToken, {
    userId,
    expiresAt,
    createdAt: new Date()
  });
  
  // Also store in Firestore for persistence across restarts
  await db.collection('refresh_tokens').doc(refreshToken.substring(0, 32)).set({
    tokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'),
    userId,
    expiresAt,
    createdAt: new Date()
  });
  
  logger.info('Tokens generated', { userId });
  
  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS
  };
}

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<{accessToken: string, refreshToken: string, expiresIn: number}>}
 */
async function refreshAccessToken(refreshToken) {
  const crypto = require('crypto');
  
  if (!refreshToken) {
    throw new Error('AUTH_INVALID_REFRESH_TOKEN: Refresh token is required');
  }
  
  // Check in-memory cache first
  let tokenData = refreshTokens.get(refreshToken);
  
  // If not in memory, check Firestore
  if (!tokenData) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const tokenDocs = await db.collection('refresh_tokens')
      .where('tokenHash', '==', tokenHash)
      .limit(1)
      .get();
    
    if (!tokenDocs.empty) {
      const doc = tokenDocs.docs[0];
      tokenData = {
        userId: doc.data().userId,
        expiresAt: doc.data().expiresAt.toDate(),
        docId: doc.id
      };
    }
  }
  
  if (!tokenData) {
    throw new Error('AUTH_INVALID_REFRESH_TOKEN: Invalid refresh token');
  }
  
  // Check if expired
  if (tokenData.expiresAt < new Date()) {
    // Clean up expired token
    refreshTokens.delete(refreshToken);
    if (tokenData.docId) {
      await db.collection('refresh_tokens').doc(tokenData.docId).delete();
    }
    throw new Error('AUTH_REFRESH_TOKEN_EXPIRED: Refresh token has expired');
  }
  
  const { userId } = tokenData;
  
  // Verify user still exists and is not locked
  const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
  if (!userDoc.exists) {
    throw new Error('AUTH_USER_NOT_FOUND: User not found');
  }
  
  const userData = userDoc.data();
  if (userData.locked || userData.deleted) {
    throw new Error('AUTH_ACCOUNT_SUSPENDED: Account is suspended');
  }
  
  // Invalidate old refresh token (token rotation for security)
  refreshTokens.delete(refreshToken);
  if (tokenData.docId) {
    await db.collection('refresh_tokens').doc(tokenData.docId).delete();
  }
  
  // Generate new tokens
  const newTokens = await generateTokens(userId);
  
  logger.info('Access token refreshed', { userId });
  
  return newTokens;
}

/**
 * Invalidate all refresh tokens for a user
 * @param {string} userId - User ID
 */
async function invalidateAllRefreshTokens(userId) {
  // Clear from memory
  for (const [token, data] of refreshTokens.entries()) {
    if (data.userId === userId) {
      refreshTokens.delete(token);
    }
  }
  
  // Clear from Firestore
  const tokenDocs = await db.collection('refresh_tokens')
    .where('userId', '==', userId)
    .get();
  
  const batch = db.batch();
  tokenDocs.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  
  logger.info('All refresh tokens invalidated', { userId });
}

/**
 * Cleanup expired refresh tokens (run periodically)
 */
async function cleanupExpiredRefreshTokens() {
  const now = new Date();
  
  // Clear from memory
  for (const [token, data] of refreshTokens.entries()) {
    if (data.expiresAt < now) {
      refreshTokens.delete(token);
    }
  }
  
  // Clear from Firestore
  const expiredDocs = await db.collection('refresh_tokens')
    .where('expiresAt', '<', now)
    .limit(100)
    .get();
  
  if (!expiredDocs.empty) {
    const batch = db.batch();
    expiredDocs.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    logger.info('Cleaned up expired refresh tokens', { count: expiredDocs.size });
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
  loginWithDeviceTracking,
  requestPasswordReset,
  resetPassword,
  changePassword,
  deleteAccount,
  linkGoogle,
  linkGoogleWithOAuth,
  unlinkGoogle,
  resendVerificationOTP,
  getUserByEmail,
  getActiveSessions,
  revokeSession,
  revokeAllOtherSessions,
  getLoginHistory,
  cleanupExpiredRegistrations,
  cleanupOldLoginHistory,
  // Token management
  generateTokens,
  refreshAccessToken,
  invalidateAllRefreshTokens,
  cleanupExpiredRefreshTokens
};
