/**
 * OTP Service Property-Based Tests
 * 
 * Tests correctness properties for OTP generation and verification
 * Using fast-check for property-based testing
 */

const fc = require('fast-check');
const { 
  generateOTPCode, 
  hashOTP, 
  OTP_CONSTANTS 
} = require('../services/otp.service');

// Mock Firestore for unit tests
jest.mock('../config/firebase', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      }))
    }))
  },
  FieldValue: {
    increment: jest.fn()
  }
}));

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

describe('OTP Service', () => {
  /**
   * **Feature: email-password-auth, Property 3: OTP Generation Format**
   * 
   * For any OTP generation request, the generated code SHALL be exactly 
   * 6 digits (000000-999999) and the expiration time SHALL be exactly 
   * 10 minutes from generation time.
   * 
   * **Validates: Requirements 2.1, 5.1**
   */
  describe('Property 3: OTP Generation Format', () => {
    it('should always generate exactly 6-digit codes', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }), // Run multiple times
          () => {
            const code = generateOTPCode();
            
            // Must be exactly 6 characters
            expect(code).toHaveLength(6);
            
            // Must be all digits
            expect(code).toMatch(/^\d{6}$/);
            
            // Must be in valid range (000000-999999)
            const numericValue = parseInt(code, 10);
            expect(numericValue).toBeGreaterThanOrEqual(0);
            expect(numericValue).toBeLessThanOrEqual(999999);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate codes with leading zeros when needed', () => {
      // Generate many codes and verify format is preserved
      const codes = new Set();
      for (let i = 0; i < 1000; i++) {
        const code = generateOTPCode();
        codes.add(code);
        expect(code).toHaveLength(6);
      }
      
      // Should have reasonable variety (not all same code)
      expect(codes.size).toBeGreaterThan(100);
    });

    it('should have correct expiry constant of 10 minutes', () => {
      expect(OTP_CONSTANTS.OTP_EXPIRY_MINUTES).toBe(10);
    });

    it('should have correct OTP length constant of 6', () => {
      expect(OTP_CONSTANTS.OTP_LENGTH).toBe(6);
    });
  });

  /**
   * OTP Hashing Tests
   */
  describe('OTP Hashing', () => {
    it('should produce consistent hashes for same input', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 6, maxLength: 6 }),
          (code) => {
            const hash1 = hashOTP(code);
            const hash2 = hashOTP(code);
            expect(hash1).toBe(hash2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce different hashes for different inputs', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 6, maxLength: 6 }),
          fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 6, maxLength: 6 }),
          (code1, code2) => {
            fc.pre(code1 !== code2); // Only test when codes are different
            const hash1 = hashOTP(code1);
            const hash2 = hashOTP(code2);
            expect(hash1).not.toBe(hash2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce 64-character hex hashes (SHA-256)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (input) => {
            const hash = hashOTP(input);
            expect(hash).toHaveLength(64);
            expect(hash).toMatch(/^[a-f0-9]{64}$/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Rate Limiting Constants Tests
   */
  describe('Rate Limiting Constants', () => {
    it('should have correct max verification attempts of 5', () => {
      expect(OTP_CONSTANTS.MAX_VERIFICATION_ATTEMPTS).toBe(5);
    });

    it('should have correct lockout duration of 30 minutes', () => {
      expect(OTP_CONSTANTS.LOCKOUT_MINUTES).toBe(30);
    });

    it('should have correct max resends per hour of 3', () => {
      expect(OTP_CONSTANTS.MAX_RESENDS_PER_HOUR).toBe(3);
    });

    it('should have correct resend window of 60 minutes', () => {
      expect(OTP_CONSTANTS.RESEND_WINDOW_MINUTES).toBe(60);
    });
  });
});


/**
 * OTP Verification Integration Tests
 * These tests require mocked Firestore interactions
 */
describe('OTP Verification Logic', () => {
  const { generateOTP, verifyOTP, invalidateOTP, checkRateLimit } = require('../services/otp.service');
  const { db } = require('../config/firebase');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * **Feature: email-password-auth, Property 4: OTP Verification Correctness**
   * 
   * For any valid OTP code and email pair, verifying with the correct code 
   * before expiration SHALL return success, and verifying with incorrect 
   * code SHALL return failure and increment attempt counter.
   * 
   * **Validates: Requirements 2.2, 2.3**
   */
  describe('Property 4: OTP Verification Correctness', () => {
    it('should return success for correct OTP within expiration', async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            email: 'test@example.com',
            codeHash: hashOTP('123456'),
            type: 'verification',
            expiresAt: { toDate: () => new Date(Date.now() + 5 * 60 * 1000) }, // 5 min from now
            attempts: 0,
            lockedUntil: null
          })
        }),
        delete: jest.fn().mockResolvedValue()
      };

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      const result = await verifyOTP('test@example.com', '123456', 'verification');
      
      expect(result.success).toBe(true);
      expect(mockDocRef.delete).toHaveBeenCalled();
    });

    it('should return failure and increment attempts for incorrect OTP', async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            email: 'test@example.com',
            codeHash: hashOTP('123456'),
            type: 'verification',
            expiresAt: { toDate: () => new Date(Date.now() + 5 * 60 * 1000) },
            attempts: 0,
            lockedUntil: null
          })
        }),
        update: jest.fn().mockResolvedValue()
      };

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      const result = await verifyOTP('test@example.com', '654321', 'verification');
      
      expect(result.success).toBe(false);
      expect(result.remainingAttempts).toBe(4);
      expect(mockDocRef.update).toHaveBeenCalledWith(
        expect.objectContaining({ attempts: 1 })
      );
    });

    it('should lock after max failed attempts', async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            email: 'test@example.com',
            codeHash: hashOTP('123456'),
            type: 'verification',
            expiresAt: { toDate: () => new Date(Date.now() + 5 * 60 * 1000) },
            attempts: 4, // One more attempt will lock
            lockedUntil: null
          })
        }),
        update: jest.fn().mockResolvedValue()
      };

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      const result = await verifyOTP('test@example.com', '654321', 'verification');
      
      expect(result.success).toBe(false);
      expect(result.locked).toBe(true);
      expect(mockDocRef.update).toHaveBeenCalledWith(
        expect.objectContaining({ 
          attempts: 5,
          lockedUntil: expect.any(Date)
        })
      );
    });

    it('should reject expired OTP', async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            email: 'test@example.com',
            codeHash: hashOTP('123456'),
            type: 'verification',
            expiresAt: { toDate: () => new Date(Date.now() - 1000) }, // Expired
            attempts: 0,
            lockedUntil: null
          })
        })
      };

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      const result = await verifyOTP('test@example.com', '123456', 'verification');
      
      expect(result.success).toBe(false);
      expect(result.expired).toBe(true);
    });
  });

  /**
   * **Feature: email-password-auth, Property 5: OTP Invalidation on Resend**
   * 
   * For any OTP resend request, the previous OTP code SHALL become invalid 
   * and a new code SHALL be generated.
   * 
   * **Validates: Requirements 2.5**
   */
  describe('Property 5: OTP Invalidation on Resend', () => {
    it('should invalidate previous OTP when generating new one', async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            email: 'test@example.com',
            codeHash: hashOTP('111111'),
            type: 'verification',
            expiresAt: { toDate: () => new Date(Date.now() + 5 * 60 * 1000) },
            attempts: 0,
            resendCount: 1,
            lastResendAt: { toDate: () => new Date(Date.now() - 10 * 60 * 1000) }, // 10 min ago
            lockedUntil: null
          })
        }),
        set: jest.fn().mockResolvedValue()
      };

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      const result = await generateOTP('test@example.com', 'verification');
      
      // New code should be generated
      expect(result.code).toHaveLength(6);
      expect(result.expiresAt).toBeInstanceOf(Date);
      
      // Should overwrite with new data (set, not update)
      expect(mockDocRef.set).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          type: 'verification',
          codeHash: expect.any(String)
        })
      );
    });

    it('should track resend count within rate limit window', async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            email: 'test@example.com',
            resendCount: 1,
            lastResendAt: { toDate: () => new Date(Date.now() - 5 * 60 * 1000) }, // 5 min ago (within window)
            lockedUntil: null
          })
        }),
        set: jest.fn().mockResolvedValue()
      };

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      await generateOTP('test@example.com', 'verification');
      
      // Should increment resend count
      expect(mockDocRef.set).toHaveBeenCalledWith(
        expect.objectContaining({
          resendCount: 2
        })
      );
    });

    it('should reject when rate limit exceeded', async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            email: 'test@example.com',
            resendCount: 3, // Max reached
            lastResendAt: { toDate: () => new Date(Date.now() - 5 * 60 * 1000) }, // Within window
            lockedUntil: null
          })
        })
      };

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      await expect(generateOTP('test@example.com', 'verification'))
        .rejects.toThrow('RATE_LIMITED');
    });

    it('should reset resend count after window expires', async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            email: 'test@example.com',
            resendCount: 3,
            lastResendAt: { toDate: () => new Date(Date.now() - 70 * 60 * 1000) }, // 70 min ago (outside window)
            lockedUntil: null
          })
        }),
        set: jest.fn().mockResolvedValue()
      };

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      await generateOTP('test@example.com', 'verification');
      
      // Should reset to 1
      expect(mockDocRef.set).toHaveBeenCalledWith(
        expect.objectContaining({
          resendCount: 1
        })
      );
    });
  });
});
