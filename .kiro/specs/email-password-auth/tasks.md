# Implementation Plan

## Phase 1: Backend Foundation

- [x] 1. Set up backend authentication infrastructure




  - [ ] 1.1 Create OTP service with generation and verification logic
    - Create `backend/src/services/otp.service.js`
    - Implement `generateOTP()` - 6 digit code with 10 min expiry
    - Implement `verifyOTP()` with attempt tracking
    - Implement `invalidateOTP()` for resend flow


    - Implement rate limiting checks


    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [ ] 1.2 Write property test for OTP generation format
    - **Property 3: OTP Generation Format**





    - **Validates: Requirements 2.1, 5.1**
  - [ ] 1.3 Write property test for OTP verification correctness
    - **Property 4: OTP Verification Correctness**

    - **Validates: Requirements 2.2, 2.3**
  - [x] 1.4 Write property test for OTP invalidation on resend


    - **Property 5: OTP Invalidation on Resend**

    - **Validates: Requirements 2.5**


- [ ] 2. Create validation utilities
  - [ ] 2.1 Implement password validation function
    - Create validation in `backend/src/utils/authValidation.js`



    - Validate: min 8 chars, uppercase, lowercase, number
    - Return detailed error messages
    - _Requirements: 1.2_
  - [x] 2.2 Implement email validation function

    - RFC 5322 simplified email format validation
    - _Requirements: 1.4_
  - [ ] 2.3 Write property test for password validation
    - **Property 1: Password Validation Correctness**

    - **Validates: Requirements 1.2**
  - [ ] 2.4 Write property test for email validation
    - **Property 2: Email Validation Correctness**
    - **Validates: Requirements 1.4**

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Email Auth Service

- [ ] 4. Implement email authentication service
  - [ ] 4.1 Create email auth service core
    - Create `backend/src/services/emailAuth.service.js`
    - Implement `register()` - create pending registration, send OTP
    - Implement `verifyEmail()` - activate account on valid OTP
    - Implement `login()` - authenticate and return Firebase token
    - _Requirements: 1.1, 2.2, 3.1, 3.5_
  - [ ] 4.2 Implement password reset functionality
    - Implement `requestPasswordReset()` - send OTP
    - Implement `resetPassword()` - update password, invalidate sessions

    - Ensure generic response for non-existent emails
    - _Requirements: 5.1, 5.2, 5.4_
  - [ ] 4.3 Implement Google account linking
    - Implement `linkGoogle()` - store Google credentials


    - Implement `unlinkGoogle()` - remove credentials

    - Check for duplicate Google links
    - _Requirements: 4.2, 4.3, 4.5_
  - [ ] 4.4 Write property test for login authentication
    - **Property 6: Login Authentication Correctness**

    - **Validates: Requirements 3.1, 3.2**
  - [ ] 4.5 Write property test for duplicate email prevention
    - **Property 8: Duplicate Email Prevention**
    - **Validates: Requirements 1.3**
  - [ ] 4.6 Write property test for Google link uniqueness
    - **Property 9: Google Link Uniqueness**
    - **Validates: Requirements 4.3**
  - [ ] 4.7 Write property test for password reset security
    - **Property 10: Password Reset Security**

    - **Validates: Requirements 5.4**

  - [ ] 4.8 Write property test for session invalidation
    - **Property 12: Session Invalidation on Password Reset**
    - **Validates: Requirements 5.2**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Email Templates

- [ ] 6. Create email templates for authentication
  - [ ] 6.1 Create OTP verification email template
    - Add to `backend/src/services/emailTemplate.service.js`
    - Black and white minimalist design
    - Large, clear OTP display
    - Use icons from backend icon directory
    - Support 15 languages (existing i18n structure)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ] 6.2 Create password reset email template
    - Same design language as verification email
    - Clear instructions for reset process
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ] 6.3 Write property test for email template localization
    - **Property 11: Email Template Localization**
    - **Validates: Requirements 6.3**

## Phase 4: Backend Routes

- [ ] 7. Create authentication API routes
  - [x] 7.1 Create email auth routes

    - Create `backend/src/routes/emailAuth.routes.js`
    - POST `/auth/email/register` - registration
    - POST `/auth/email/verify` - OTP verification
    - POST `/auth/email/login` - login
    - POST `/auth/email/resend-otp` - resend verification
    - _Requirements: 1.1, 2.2, 3.1, 2.5_

  - [ ] 7.2 Create password reset routes
    - POST `/auth/email/forgot-password` - request reset
    - POST `/auth/email/reset-password` - complete reset

    - _Requirements: 5.1, 5.2_
  - [ ] 7.3 Create Google linking routes
    - POST `/auth/email/link-google` - link Google account

    - POST `/auth/email/unlink-google` - unlink Google account
    - _Requirements: 4.2, 4.5_
  - [ ] 7.4 Create email auth controller
    - Create `backend/src/controllers/emailAuth.controller.js`
    - Handle request validation and error responses

    - Implement rate limiting middleware
    - _Requirements: 2.4, 3.3_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Frontend Components

- [-] 9. Create frontend authentication components


  - [x] 9.1 Create email login form component

    - Create `src/components/Auth/EmailLoginForm.jsx`
    - Email and password inputs with validation
    - Error handling and loading states
    - Link to registration and forgot password
    - _Requirements: 3.1_

  - [ ] 9.2 Create email registration form component
    - Create `src/components/Auth/EmailRegisterForm.jsx`
    - Email, password, confirm password, display name inputs
    - Real-time password strength indicator
    - Client-side validation matching backend rules

    - _Requirements: 1.1, 1.2_
  - [ ] 9.3 Create OTP verification component
    - Create `src/components/Auth/OTPVerification.jsx`
    - 6-digit input with auto-focus
    - Countdown timer for expiration

    - Resend button with rate limit display
    - _Requirements: 2.2, 2.5_
  - [ ] 9.4 Create forgot password component
    - Create `src/components/Auth/ForgotPassword.jsx`
    - Email input for reset request

    - OTP verification step
    - New password input with validation
    - _Requirements: 5.1, 5.2_
  - [ ] 9.5 Create Google linking component
    - Create `src/components/Auth/LinkGoogleAccount.jsx`


    - Show link/unlink button based on status

    - Display linked Google email when connected
    - _Requirements: 4.1, 4.5_

- [ ] 10. Update LoginOverlay component
  - [ ] 10.1 Add email auth option to LoginOverlay
    - Update `src/components/Auth/LoginOverlay.jsx`


    - Add tabs/toggle between Google and Email login

    - Integrate EmailLoginForm and EmailRegisterForm
    - Maintain existing Google login functionality
    - _Requirements: 3.1, 1.1_

## Phase 6: AuthContext Integration


- [ ] 11. Update AuthContext for email authentication
  - [ ] 11.1 Add email auth methods to AuthContext
    - Update `src/contexts/AuthContext.prod.jsx`

    - Add `signInWithEmail()` method
    - Add `registerWithEmail()` method
    - Add `verifyEmail()` method
    - Add `requestPasswordReset()` method
    - Add `resetPassword()` method
    - _Requirements: 3.1, 1.1, 2.2, 5.1, 5.2_
  - [x] 11.2 Add Google linking methods to AuthContext

    - Add `linkGoogleAccount()` method
    - Add `unlinkGoogleAccount()` method
    - Add `hasGoogleLinked` state
    - _Requirements: 4.1, 4.5_
  - [-] 11.3 Ensure user data structure compatibility


    - Verify email auth returns same user structure as Google auth
    - Add `authMethod` to context state
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ] 11.4 Write property test for user data structure
    - **Property 7: User Data Structure Compatibility**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**


- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: Styling and Polish

- [ ] 13. Create styles for auth components
  - [ ] 13.1 Create email auth component styles
    - Create `src/components/Auth/EmailAuth.css`
    - Match existing LoginOverlay design language
    - Responsive design for different screen sizes
    - Dark/light mode support
    - _Requirements: 6.1_
  - [x] 13.2 Add i18n translations for email auth

    - Update `src/i18n/locales/*.json` files
    - Add translations for all auth-related strings
    - Support all 15 existing languages
    - _Requirements: 6.3_

## Phase 8: Settings Integration

- [-] 14. Add Google linking to settings


  - [x] 14.1 Update settings/profile page

    - Add Google account linking section
    - Show current auth method
    - Display Drive sync status for linked accounts
    - _Requirements: 4.1, 4.4, 4.5_


- [x] 15. Final Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.
