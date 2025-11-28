/**
 * Authentication Validation Property-Based Tests
 * 
 * Tests correctness properties for password and email validation
 * Using fast-check for property-based testing
 */

const fc = require('fast-check');
const {
  validatePassword,
  isValidPassword,
  validateEmail,
  isValidEmail,
  validateDisplayName,
  normalizeEmail,
  getPasswordStrength,
  VALIDATION_CONSTANTS
} = require('../utils/authValidation');

describe('Authentication Validation', () => {
  /**
   * **Feature: email-password-auth, Property 1: Password Validation Correctness**
   * 
   * For any string input, the password validation function SHALL return true 
   * if and only if the string contains at least 8 characters, at least one 
   * uppercase letter, at least one lowercase letter, and at least one number.
   * 
   * **Validates: Requirements 1.2**
   */
  describe('Property 1: Password Validation Correctness', () => {
    // Helper to check if password meets all criteria
    const meetsAllCriteria = (password) => {
      if (typeof password !== 'string') return false;
      return (
        password.length >= 8 &&
        password.length <= 128 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password)
      );
    };

    it('should accept passwords that meet all criteria', () => {
      fc.assert(
        fc.property(
          // Generate valid passwords
          fc.tuple(
            fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'), { minLength: 1, maxLength: 10 }),
            fc.stringOf(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), { minLength: 1, maxLength: 10 }),
            fc.stringOf(fc.constantFrom(...'0123456789'), { minLength: 1, maxLength: 10 }),
            fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), { minLength: 0, maxLength: 50 })
          ),
          ([lower, upper, digit, extra]) => {
            const password = lower + upper + digit + extra;
            if (password.length >= 8 && password.length <= 128) {
              expect(isValidPassword(password)).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject passwords shorter than 8 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 7 }),
          (password) => {
            const result = validatePassword(password);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must be at least 8 characters');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject passwords without uppercase letters', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'), { minLength: 8, maxLength: 20 }),
          (password) => {
            const result = validatePassword(password);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one uppercase letter');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject passwords without lowercase letters', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), { minLength: 8, maxLength: 20 }),
          (password) => {
            const result = validatePassword(password);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one lowercase letter');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject passwords without numbers', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'), { minLength: 8, maxLength: 20 }),
          (password) => {
            const result = validatePassword(password);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one number');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be consistent: isValidPassword matches validatePassword.valid', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (password) => {
            const result = validatePassword(password);
            expect(isValidPassword(password)).toBe(result.valid);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify valid vs invalid passwords', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 100 }),
          (password) => {
            const result = isValidPassword(password);
            const expected = meetsAllCriteria(password);
            expect(result).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: email-password-auth, Property 2: Email Validation Correctness**
   * 
   * For any string input, the email validation function SHALL return true 
   * if and only if the string matches standard email format (RFC 5322 simplified).
   * 
   * **Validates: Requirements 1.4**
   */
  describe('Property 2: Email Validation Correctness', () => {
    it('should accept valid email formats', () => {
      fc.assert(
        fc.property(
          // Generate valid local parts
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789._-'), { minLength: 1, maxLength: 20 }),
          // Generate valid domain names
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'), { minLength: 1, maxLength: 20 }),
          // Generate valid TLDs
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'), { minLength: 2, maxLength: 6 }),
          (local, domain, tld) => {
            // Ensure domain doesn't start or end with hyphen
            const cleanDomain = domain.replace(/^-+|-+$/g, '') || 'example';
            const email = `${local}@${cleanDomain}.${tld}`;
            
            if (local.length > 0 && cleanDomain.length > 0 && tld.length >= 2) {
              expect(isValidEmail(email)).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject emails without @ symbol', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789.'), { minLength: 1, maxLength: 30 }),
          (str) => {
            fc.pre(!str.includes('@'));
            expect(isValidEmail(str)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject emails without domain', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'), { minLength: 1, maxLength: 20 }),
          (local) => {
            expect(isValidEmail(`${local}@`)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject emails without TLD', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'), { minLength: 1, maxLength: 10 }),
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'), { minLength: 1, maxLength: 10 }),
          (local, domain) => {
            expect(isValidEmail(`${local}@${domain}`)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty strings', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('   ')).toBe(false);
    });

    it('should reject null and undefined', () => {
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });

    it('should be consistent: isValidEmail matches validateEmail.valid', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 100 }),
          (email) => {
            const result = validateEmail(email);
            expect(isValidEmail(email)).toBe(result.valid);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Email Normalization Tests
   */
  describe('Email Normalization', () => {
    it('should lowercase all emails', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (email) => {
            const normalized = normalizeEmail(email);
            expect(normalized).toBe(normalized.toLowerCase());
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should trim whitespace', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (email) => {
            const withSpaces = `  ${email}  `;
            const normalized = normalizeEmail(withSpaces);
            expect(normalized).not.toMatch(/^\s|\s$/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty string for invalid inputs', () => {
      expect(normalizeEmail(null)).toBe('');
      expect(normalizeEmail(undefined)).toBe('');
      expect(normalizeEmail(123)).toBe('');
    });
  });

  /**
   * Display Name Validation Tests
   */
  describe('Display Name Validation', () => {
    it('should accept valid display names', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -_.'), { minLength: 2, maxLength: 50 }),
          (name) => {
            const result = validateDisplayName(name);
            expect(result.valid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject names shorter than 2 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 1 }),
          (name) => {
            const result = validateDisplayName(name);
            expect(result.valid).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject names longer than 50 characters', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'), { minLength: 51, maxLength: 100 }),
          (name) => {
            const result = validateDisplayName(name);
            expect(result.valid).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Password Strength Tests
   */
  describe('Password Strength', () => {
    it('should return higher scores for longer passwords', () => {
      const short = getPasswordStrength('Abc12345');
      const long = getPasswordStrength('Abc12345678901234');
      expect(long.score).toBeGreaterThan(short.score);
    });

    it('should return higher scores for more character variety', () => {
      const simple = getPasswordStrength('Abcd1234');
      const complex = getPasswordStrength('Abcd1234!@#$');
      expect(complex.score).toBeGreaterThan(simple.score);
    });

    it('should return score between 0 and 100', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 100 }),
          (password) => {
            const result = getPasswordStrength(password);
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return valid level strings', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (password) => {
            const result = getPasswordStrength(password);
            expect(['none', 'weak', 'fair', 'good', 'strong']).toContain(result.level);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Validation Constants Tests
   */
  describe('Validation Constants', () => {
    it('should have correct password min length of 8', () => {
      expect(VALIDATION_CONSTANTS.PASSWORD_MIN_LENGTH).toBe(8);
    });

    it('should have correct password max length of 128', () => {
      expect(VALIDATION_CONSTANTS.PASSWORD_MAX_LENGTH).toBe(128);
    });

    it('should have correct display name min length of 2', () => {
      expect(VALIDATION_CONSTANTS.DISPLAY_NAME_MIN_LENGTH).toBe(2);
    });

    it('should have correct display name max length of 50', () => {
      expect(VALIDATION_CONSTANTS.DISPLAY_NAME_MAX_LENGTH).toBe(50);
    });
  });
});
