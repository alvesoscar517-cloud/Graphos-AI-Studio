# Requirements Document

## Introduction

Hệ thống hiện tại chỉ hỗ trợ đăng nhập bằng Google OAuth, cho phép đồng bộ dữ liệu với Google Drive. Tính năng này bổ sung phương thức đăng nhập bằng email/password tự tạo, bao gồm hệ thống đăng ký tài khoản, xác thực email qua mã OTP, và cơ chế liên kết tài khoản Google cho người dùng muốn đồng bộ Drive sau này.

## Glossary

- **Email_Auth_System**: Hệ thống xác thực người dùng bằng email và mật khẩu
- **OTP_Code**: Mã xác thực một lần gồm 6 chữ số, có hiệu lực trong 10 phút
- **User_Account**: Tài khoản người dùng trong hệ thống, bao gồm các trường: userId, email, name, picture, tier, credits, authProvider
- **Google_Link**: Cơ chế liên kết tài khoản email với tài khoản Google để sử dụng tính năng Drive sync
- **Auth_Provider**: Loại phương thức xác thực (google, email)

## Requirements

### Requirement 1

**User Story:** As a user, I want to create an account with my email and password, so that I can use the application without requiring a Google account.

#### Acceptance Criteria

1. WHEN a user submits registration form with email, password, and display name THEN THE Email_Auth_System SHALL create a pending account and send OTP_Code to the provided email
2. WHEN a user provides a password THEN THE Email_Auth_System SHALL validate that password contains minimum 8 characters, at least one uppercase letter, one lowercase letter, and one number
3. WHEN a user provides an email that already exists in the system THEN THE Email_Auth_System SHALL reject the registration and display appropriate error message
4. WHEN a user provides an invalid email format THEN THE Email_Auth_System SHALL reject the registration and display validation error
5. WHEN registration data is valid THEN THE Email_Auth_System SHALL store password using bcrypt hashing with salt rounds of 12

### Requirement 2

**User Story:** As a user, I want to verify my email address with a verification code, so that I can confirm ownership of my email and activate my account.

#### Acceptance Criteria

1. WHEN THE Email_Auth_System sends verification email THEN THE Email_Auth_System SHALL generate a 6-digit OTP_Code with 10-minute expiration
2. WHEN a user enters correct OTP_Code within expiration time THEN THE Email_Auth_System SHALL activate the account and allow login
3. WHEN a user enters incorrect OTP_Code THEN THE Email_Auth_System SHALL reject verification and increment failed attempt counter
4. WHEN failed verification attempts exceed 5 THEN THE Email_Auth_System SHALL lock the verification process for 30 minutes
5. WHEN a user requests resend verification THEN THE Email_Auth_System SHALL invalidate previous OTP_Code and generate new one with rate limit of 3 resends per hour
6. WHEN OTP_Code expires THEN THE Email_Auth_System SHALL require user to request a new verification code

### Requirement 3

**User Story:** As a user, I want to sign in with my email and password, so that I can access my account and data.

#### Acceptance Criteria

1. WHEN a user submits valid email and password THEN THE Email_Auth_System SHALL authenticate user and return Firebase ID token
2. WHEN a user submits incorrect password THEN THE Email_Auth_System SHALL reject login and increment failed attempt counter
3. WHEN failed login attempts exceed 5 within 15 minutes THEN THE Email_Auth_System SHALL lock account for 30 minutes
4. WHEN a user attempts to login with unverified email THEN THE Email_Auth_System SHALL redirect to email verification flow
5. WHEN login is successful THEN THE Email_Auth_System SHALL create user session matching existing Google auth user structure

### Requirement 4

**User Story:** As a user with email account, I want to link my Google account, so that I can use Google Drive sync feature.

#### Acceptance Criteria

1. WHEN an email user initiates Google linking THEN THE Email_Auth_System SHALL request Google OAuth consent
2. WHEN Google OAuth is successful THEN THE Email_Auth_System SHALL store Google credentials linked to existing email account
3. WHEN Google account is already linked to another email account THEN THE Email_Auth_System SHALL reject linking and display error
4. WHEN Google linking is complete THEN THE Email_Auth_System SHALL enable Drive sync features for the user
5. WHEN a user unlinks Google account THEN THE Email_Auth_System SHALL remove Google credentials and disable Drive sync

### Requirement 5

**User Story:** As a user, I want to reset my password if I forget it, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a user requests password reset THEN THE Email_Auth_System SHALL send OTP_Code to registered email
2. WHEN a user enters valid OTP_Code and new password THEN THE Email_Auth_System SHALL update password and invalidate all existing sessions
3. WHEN password reset OTP_Code expires THEN THE Email_Auth_System SHALL require user to request new reset code
4. WHEN a user requests password reset for non-existent email THEN THE Email_Auth_System SHALL display generic message without revealing email existence

### Requirement 6

**User Story:** As a system administrator, I want verification emails to have modern, minimalist design, so that users have professional experience.

#### Acceptance Criteria

1. WHEN THE Email_Auth_System sends verification email THEN THE Email_Auth_System SHALL use black and white color theme with minimalist design
2. WHEN THE Email_Auth_System renders email template THEN THE Email_Auth_System SHALL include icons from backend icon directory
3. WHEN THE Email_Auth_System sends email THEN THE Email_Auth_System SHALL support multi-language content based on user locale
4. WHEN THE Email_Auth_System displays OTP_Code in email THEN THE Email_Auth_System SHALL present code in large, clear typography with copy-friendly format

### Requirement 7

**User Story:** As a developer, I want email auth user data to match Google auth structure, so that existing features work without modification.

#### Acceptance Criteria

1. WHEN THE Email_Auth_System creates user account THEN THE Email_Auth_System SHALL populate userId, email, name, picture, tier, credits fields matching Google auth structure
2. WHEN THE Email_Auth_System authenticates user THEN THE Email_Auth_System SHALL return user object compatible with existing AuthContext interface
3. WHEN email user accesses profile features THEN THE Email_Auth_System SHALL provide same data structure as Google authenticated users
4. WHEN THE Email_Auth_System stores user THEN THE Email_Auth_System SHALL include authProvider field to distinguish authentication method
