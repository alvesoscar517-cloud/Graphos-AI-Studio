/**
 * Email Authentication Service
 * 
 * Handles email/password authentication:
 * - User registration with email verification
 * - Login with email/password
 * - Password reset
 * - Google account linking
 */

const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const { db, FieldValue } = require('../config/firebase');
const otpService = require('./otp.service');
const { validatePassword, validateEmail, validateDisplayName, normalizeEmail } = require('../utils/authValidation');
const logger = require('../utils/logger');
const { FREE_CREDITS } = require('../config/pricing');

// Collections
const USERS_COLLECTION = 'users';
const PENDING_REGISTRATIONS_COLLECTION = 'pending_registrations';

// Constants
const BCRYPT_SALT_ROUNDS = 12;
const PENDING_REGISTRATION_EXPIRY_HOURS = 24;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MINUTES = 30;
const LOGIN_ATTEMPT_WINDOW_MINUTES = 15;

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
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new Error(`AUTH_WEAK_PASSWORD: ${passwordValidation.errors.join('. ')}`);
  }
  
  const nameValidation = validateDisplayName(displayName);
  if (!nameValidation.valid) {
    throw new Error(`AUTH_INVALID_NAME: ${nameValidation.error}`);
  }
  
  const normalizedEmail = normalizeEmail(email);
  
  // Check if email already exists in users collection
  const existingUser = await db.collection(USERS_COLLECTION)
    .where('email', '==', normalizedEmail)
    .limit(1)
    .get();
  
  if (!existingUser.empty) {
    throw new Error('AUTH_EMAIL_EXISTS: This email is already registered');
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  
  // Create pending registration
  const now = new Date();
  const expiresAt = new Date(now.getTime() + PENDING_REGISTRATION_EXPIRY_HOURS * 60 * 60 * 1000);
  
  const pendingData = {
    email: normalizedEmail,
    passwordHash,
    displayName: displayName.trim(),
    locale,
    createdAt: now,
    expiresAt
  };
  
  await db.collection(PENDING_REGISTRATIONS_COLLECTION).doc(normalizedEmail).set(pendingData);
  
  // Generate and send OTP
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
    firebaseUser = await admin.auth().createUser({
      email: normalizedEmail,
      emailVerified: true,
      displayName: pendingData.displayName,
      disabled: false
    });
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      throw new Error('AUTH_EMAIL_EXISTS: This email is already registered');
    }
    throw error;
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
  
  // Delete pending registration
  await db.collection(PENDING_REGISTRATIONS_COLLECTION).doc(normalizedEmail).delete();
  
  // Generate custom token for client
  const token = await admin.auth().createCustomToken(userId);
  
  logger.info('User registered and verified', { userId, email: normalizedEmail });
  
  return {
    success: true,
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
  
  // Check if account is locked
  if (userData.lockedUntil) {
    const lockedUntil = userData.lockedUntil.toDate();
    if (lockedUntil > new Date()) {
      const waitMinutes = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
      throw new Error(`AUTH_ACCOUNT_LOCKED: Account is locked. Please try again in ${waitMinutes} minutes.`);
    }
  }
  
  // Check if email is verified
  if (!userData.emailVerified) {
    throw new Error('AUTH_EMAIL_NOT_VERIFIED: Please verify your email before logging in');
  }
  
  // Verify password
  const isValidPassword = await bcrypt.compare(password, userData.passwordHash);
  
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
  await db.collection(USERS_COLLECTION).doc(userId).update({
    failedLoginAttempts: 0,
    lastFailedLoginAt: null,
    lockedUntil: null,
    lastLoginAt: new Date()
  });
  
  // Generate custom token
  const token = await admin.auth().createCustomToken(userId);
  
  logger.info('User logged in', { userId, email: normalizedEmail });
  
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
    token
  };
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
  
  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
  
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

module.exports = {
  register,
  verifyEmail,
  login,
  requestPasswordReset,
  resetPassword,
  linkGoogle,
  unlinkGoogle,
  resendVerificationOTP,
  getUserByEmail
};
