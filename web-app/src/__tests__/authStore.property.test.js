/**
 * Property-Based Tests for Auth Store
 * 
 * **Feature: chrome-extension-to-web-app, Property 5: Session Restoration**
 * **Feature: chrome-extension-to-web-app, Property 7: Logout Clears All Auth Data**
 * **Validates: Requirements 2.5, 4.1, 4.2, 6.4**
 * 
 * These tests verify that authentication state is correctly managed,
 * sessions are properly restored, and logout clears all data.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import {
  secureSet,
  secureGet,
  setUserData,
  getUserData,
  setTokens,
  getTokens,
  clearAuthStorage,
  setRememberMe,
  isRememberMeEnabled,
  AUTH_STORAGE_KEYS,
} from '../utils/authStorage'

describe('Auth Store - Property Tests', () => {
  beforeEach(() => {
    // Ensure we're in web app mode
    globalThis.chrome = undefined
    // Clear storage before each test
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  /**
   * **Feature: chrome-extension-to-web-app, Property 5: Session Restoration**
   * **Validates: Requirements 4.1, 4.2**
   * 
   * Property: For any valid stored authentication state,
   * reading the stored data SHALL return the correct user data
   */
  describe('Session Restoration', () => {
    it('stored user data can be restored correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            userId: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            email: fc.emailAddress(),
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => /^[a-zA-Z0-9 ]+$/.test(s)),
            hasGoogleLinked: fc.boolean()
          }),
          (userData) => {
            // Store user data
            const user = {
              ...userData,
              id: userData.userId
            }
            setUserData(user)
            
            // Restore user data
            const restored = getUserData()
            
            // Verify restoration
            expect(restored).not.toBeNull()
            expect(restored.userId).toBe(userData.userId)
            expect(restored.email).toBe(userData.email)
            expect(restored.name).toBe(userData.name)
            
            // Cleanup
            clearAuthStorage()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('stored tokens can be restored correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            accessToken: fc.tuple(
              fc.base64String({ minLength: 10, maxLength: 50 }),
              fc.base64String({ minLength: 10, maxLength: 100 }),
              fc.base64String({ minLength: 10, maxLength: 50 })
            ).map(([h, p, s]) => `${h}.${p}.${s}`),
            refreshToken: fc.tuple(
              fc.base64String({ minLength: 10, maxLength: 50 }),
              fc.base64String({ minLength: 10, maxLength: 100 }),
              fc.base64String({ minLength: 10, maxLength: 50 })
            ).map(([h, p, s]) => `${h}.${p}.${s}`),
            expiresIn: fc.integer({ min: 300, max: 86400 })
          }),
          fc.boolean(), // rememberMe
          (tokenData, rememberMe) => {
            // Set remember me preference first
            setRememberMe(rememberMe)
            
            // Store tokens
            setTokens(tokenData)
            
            // Restore tokens
            const restored = getTokens()
            
            // Verify restoration
            expect(restored.accessToken).toBe(tokenData.accessToken)
            expect(restored.refreshToken).toBe(tokenData.refreshToken)
            expect(restored.expiry).not.toBeNull()
            
            // Cleanup
            clearAuthStorage()
          }
        ),
        { numRuns: 100 }
      )
    })


    it('session persistence respects rememberMe flag', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.tuple(
            fc.base64String({ minLength: 10, maxLength: 30 }),
            fc.base64String({ minLength: 10, maxLength: 50 }),
            fc.base64String({ minLength: 10, maxLength: 30 })
          ).map(([h, p, s]) => `${h}.${p}.${s}`),
          (rememberMe, token) => {
            // Set remember me preference
            setRememberMe(rememberMe)
            expect(isRememberMeEnabled()).toBe(rememberMe)
            
            // Store a token
            secureSet(AUTH_STORAGE_KEYS.AUTH_TOKEN, token)
            
            // Check which storage has the token
            const inLocal = localStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TOKEN)
            const inSession = sessionStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TOKEN)
            
            if (rememberMe) {
              // Token should be in localStorage
              expect(inLocal).not.toBeNull()
            } else {
              // Token should be in sessionStorage
              expect(inSession).not.toBeNull()
            }
            
            // Cleanup
            clearAuthStorage()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: chrome-extension-to-web-app, Property 7: Logout Clears All Auth Data**
   * **Validates: Requirements 2.5, 6.4**
   * 
   * Property: For any logout operation, all authentication-related data
   * SHALL be removed from all storage locations
   */
  describe('Logout Clears All Auth Data', () => {
    it('clearAuthStorage removes all auth keys from storage', () => {
      fc.assert(
        fc.property(
          fc.record({
            userId: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            email: fc.emailAddress(),
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z0-9 ]+$/.test(s))
          }),
          fc.tuple(
            fc.base64String({ minLength: 10, maxLength: 30 }),
            fc.base64String({ minLength: 10, maxLength: 50 }),
            fc.base64String({ minLength: 10, maxLength: 30 })
          ).map(([h, p, s]) => `${h}.${p}.${s}`),
          fc.boolean(),
          (userData, token, rememberMe) => {
            // Setup: Store auth data
            setRememberMe(rememberMe)
            setUserData({ ...userData, id: userData.userId })
            setTokens({
              accessToken: token,
              refreshToken: token,
              expiresIn: 3600
            })
            secureSet(AUTH_STORAGE_KEYS.AUTH_METHOD, 'email')
            
            // Verify data was stored
            expect(getUserData()).not.toBeNull()
            expect(getTokens().accessToken).not.toBeNull()
            
            // Execute logout
            clearAuthStorage()
            
            // Verify all auth data is cleared
            expect(secureGet(AUTH_STORAGE_KEYS.USER)).toBeNull()
            expect(secureGet(AUTH_STORAGE_KEYS.AUTH_TOKEN)).toBeNull()
            expect(secureGet(AUTH_STORAGE_KEYS.REFRESH_TOKEN)).toBeNull()
            expect(secureGet(AUTH_STORAGE_KEYS.USER_ID)).toBeNull()
            expect(secureGet(AUTH_STORAGE_KEYS.AUTH_METHOD)).toBeNull()
            expect(secureGet(AUTH_STORAGE_KEYS.SESSION_ID)).toBeNull()
            
            // Verify both storages are cleared
            expect(localStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TOKEN)).toBeNull()
            expect(sessionStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TOKEN)).toBeNull()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('clearAuthStorage clears user-specific data patterns', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => /^[a-zA-Z0-9 ]+$/.test(s)),
          (email, conversationData) => {
            // Setup: Store user-specific data
            const userKey = `workspace_conversations_${email}`
            localStorage.setItem(userKey, conversationData)
            localStorage.setItem('notes_test', 'some notes')
            localStorage.setItem('user_preferences', 'some prefs')
            
            // Execute logout
            clearAuthStorage()
            
            // Verify user-specific data is cleared
            expect(localStorage.getItem(userKey)).toBeNull()
            expect(localStorage.getItem('notes_test')).toBeNull()
            expect(localStorage.getItem('user_preferences')).toBeNull()
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
