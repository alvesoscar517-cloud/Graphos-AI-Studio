/**
 * Property-Based Tests for Token Service
 * 
 * **Feature: chrome-extension-to-web-app, Property 6: Token Refresh Before Expiry**
 * **Validates: Requirements 3.5, 4.3**
 * 
 * These tests verify that the token service correctly manages token lifecycle
 * and triggers refresh before expiration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { tokenService } from '../services/tokenService'
import {
  secureSet,
  secureGet,
  setRememberMe,
  clearAuthStorage,
  AUTH_STORAGE_KEYS,
} from '../utils/authStorage'

describe('Token Service - Property Tests', () => {
  beforeEach(() => {
    // Ensure we're in web app mode
    globalThis.chrome = undefined
    // Clear storage before each test
    localStorage.clear()
    sessionStorage.clear()
    // Clear any pending timers
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
    sessionStorage.clear()
    tokenService.clearTokens()
  })

  /**
   * **Feature: chrome-extension-to-web-app, Property 6: Token Refresh Before Expiry**
   * **Validates: Requirements 3.5, 4.3**
   * 
   * Property: For any access token approaching expiration (within threshold),
   * needsRefresh() SHALL return true
   */
  describe('Token Refresh Before Expiry', () => {
    it('needsRefresh returns true when token is within refresh threshold', () => {
      fc.assert(
        fc.property(
          // Time until expiry in milliseconds (0 to 10 minutes)
          fc.integer({ min: 0, max: 10 * 60 * 1000 }),
          (timeUntilExpiry) => {
            // Setup: Set token expiry
            const expiryTime = Date.now() + timeUntilExpiry
            secureSet(AUTH_STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString())
            
            // The refresh threshold is 5 minutes (300000ms)
            const REFRESH_THRESHOLD_MS = 5 * 60 * 1000
            
            const needsRefresh = tokenService.needsRefresh()
            const expectedNeedsRefresh = timeUntilExpiry <= REFRESH_THRESHOLD_MS
            
            expect(needsRefresh).toBe(expectedNeedsRefresh)
            
            // Cleanup
            clearAuthStorage()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('needsRefresh returns false when token has plenty of time', () => {
      fc.assert(
        fc.property(
          // Time until expiry: 10 minutes to 1 hour
          fc.integer({ min: 10 * 60 * 1000, max: 60 * 60 * 1000 }),
          (timeUntilExpiry) => {
            // Setup: Set token expiry well in the future
            const expiryTime = Date.now() + timeUntilExpiry
            secureSet(AUTH_STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString())
            
            const needsRefresh = tokenService.needsRefresh()
            
            // Should not need refresh when > 5 minutes remaining
            expect(needsRefresh).toBe(false)
            
            // Cleanup
            clearAuthStorage()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('isAccessTokenValid returns correct validity status', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.base64String({ minLength: 10, maxLength: 30 }),
            fc.base64String({ minLength: 10, maxLength: 50 }),
            fc.base64String({ minLength: 10, maxLength: 30 })
          ).map(([h, p, s]) => `${h}.${p}.${s}`),
          fc.integer({ min: -60000, max: 60000 }), // Time offset from now
          (token, timeOffset) => {
            // Setup: Store token and expiry
            setRememberMe(true)
            secureSet(AUTH_STORAGE_KEYS.AUTH_TOKEN, token)
            const expiryTime = Date.now() + timeOffset
            secureSet(AUTH_STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString())
            
            const isValid = tokenService.isAccessTokenValid()
            const expectedValid = timeOffset > 0
            
            expect(isValid).toBe(expectedValid)
            
            // Cleanup
            clearAuthStorage()
          }
        ),
        { numRuns: 100 }
      )
    })
  })


  describe('Token Storage and Retrieval', () => {
    it('setTokens and getters are consistent', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.base64String({ minLength: 10, maxLength: 30 }),
            fc.base64String({ minLength: 10, maxLength: 50 }),
            fc.base64String({ minLength: 10, maxLength: 30 })
          ).map(([h, p, s]) => `${h}.${p}.${s}`),
          fc.tuple(
            fc.base64String({ minLength: 10, maxLength: 30 }),
            fc.base64String({ minLength: 10, maxLength: 50 }),
            fc.base64String({ minLength: 10, maxLength: 30 })
          ).map(([h, p, s]) => `${h}.${p}.${s}`),
          fc.integer({ min: 300, max: 86400 }),
          (accessToken, refreshToken, expiresIn) => {
            // Setup
            setRememberMe(true)
            
            // Store tokens
            tokenService.setTokens({
              accessToken,
              refreshToken,
              expiresIn
            })
            
            // Verify retrieval
            expect(tokenService.getAccessToken()).toBe(accessToken)
            expect(tokenService.getRefreshToken()).toBe(refreshToken)
            
            const expiry = tokenService.getTokenExpiry()
            expect(expiry).not.toBeNull()
            // Expiry should be approximately now + expiresIn seconds
            const expectedExpiry = Date.now() + (expiresIn * 1000)
            expect(Math.abs(expiry - expectedExpiry)).toBeLessThan(1000) // Within 1 second
            
            // Cleanup
            tokenService.clearTokens()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('clearTokens removes all token data', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.base64String({ minLength: 10, maxLength: 30 }),
            fc.base64String({ minLength: 10, maxLength: 50 }),
            fc.base64String({ minLength: 10, maxLength: 30 })
          ).map(([h, p, s]) => `${h}.${p}.${s}`),
          (token) => {
            // Setup: Store tokens
            setRememberMe(true)
            tokenService.setTokens({
              accessToken: token,
              refreshToken: token,
              expiresIn: 3600
            })
            
            // Verify tokens exist
            expect(tokenService.getAccessToken()).not.toBeNull()
            
            // Clear tokens
            tokenService.clearTokens()
            
            // Verify tokens are cleared
            expect(tokenService.getAccessToken()).toBeNull()
            expect(tokenService.getRefreshToken()).toBeNull()
            expect(tokenService.getTokenExpiry()).toBeNull()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('hasRefreshToken correctly detects refresh token presence', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.tuple(
            fc.base64String({ minLength: 10, maxLength: 30 }),
            fc.base64String({ minLength: 10, maxLength: 50 }),
            fc.base64String({ minLength: 10, maxLength: 30 })
          ).map(([h, p, s]) => `${h}.${p}.${s}`),
          (hasToken, token) => {
            // Setup
            setRememberMe(true)
            
            if (hasToken) {
              tokenService.setTokens({
                accessToken: token,
                refreshToken: token,
                expiresIn: 3600
              })
            } else {
              tokenService.clearTokens()
            }
            
            expect(tokenService.hasRefreshToken()).toBe(hasToken)
            
            // Cleanup
            tokenService.clearTokens()
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
