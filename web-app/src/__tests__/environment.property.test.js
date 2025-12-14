/**
 * Property-Based Tests for Environment Detection Module
 * 
 * **Feature: chrome-extension-to-web-app, Property 1: Environment-Aware API Selection**
 * **Validates: Requirements 1.2, 1.4, 8.1**
 * 
 * These tests verify that the environment detection functions behave consistently
 * and correctly identify the runtime environment.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { isWebApp, isChromeExtension, getEnvironment, isChromeApiAvailable } from '../utils/environment'

describe('Environment Detection - Property Tests', () => {
  // Store original chrome object to restore after tests
  let originalChrome

  beforeEach(() => {
    originalChrome = globalThis.chrome
  })

  afterEach(() => {
    globalThis.chrome = originalChrome
  })

  /**
   * **Feature: chrome-extension-to-web-app, Property 1: Environment-Aware API Selection**
   * **Validates: Requirements 1.2, 1.4, 8.1**
   * 
   * Property: isWebApp() and isChromeExtension() are mutually exclusive
   * For any environment state, exactly one of these functions returns true
   */
  it('isWebApp and isChromeExtension are mutually exclusive', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // Whether to simulate extension environment
        (simulateExtension) => {
          // Setup environment
          if (simulateExtension) {
            globalThis.chrome = {
              runtime: {
                id: 'test-extension-id-12345'
              }
            }
          } else {
            globalThis.chrome = undefined
          }

          const webApp = isWebApp()
          const extension = isChromeExtension()

          // Exactly one should be true (XOR)
          expect(webApp !== extension).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: chrome-extension-to-web-app, Property 1: Environment-Aware API Selection**
   * **Validates: Requirements 1.2, 1.4, 8.1**
   * 
   * Property: getEnvironment() returns consistent values
   * The return value always matches the boolean detection functions
   */
  it('getEnvironment returns value consistent with detection functions', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (simulateExtension) => {
          if (simulateExtension) {
            globalThis.chrome = {
              runtime: {
                id: 'ext-' + Math.random().toString(36).substring(7)
              }
            }
          } else {
            globalThis.chrome = undefined
          }

          const env = getEnvironment()
          const webApp = isWebApp()
          const extension = isChromeExtension()

          if (env === 'web') {
            expect(webApp).toBe(true)
            expect(extension).toBe(false)
          } else {
            expect(env).toBe('extension')
            expect(webApp).toBe(false)
            expect(extension).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: chrome-extension-to-web-app, Property 1: Environment-Aware API Selection**
   * **Validates: Requirements 1.2, 1.4, 8.1**
   * 
   * Property: Environment detection is idempotent
   * Multiple calls with the same environment state return the same result
   */
  it('environment detection is idempotent', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.integer({ min: 2, max: 10 }),
        (simulateExtension, callCount) => {
          if (simulateExtension) {
            globalThis.chrome = {
              runtime: { id: 'stable-extension-id' }
            }
          } else {
            globalThis.chrome = undefined
          }

          const results = []
          for (let i = 0; i < callCount; i++) {
            results.push({
              isWebApp: isWebApp(),
              isChromeExtension: isChromeExtension(),
              getEnvironment: getEnvironment()
            })
          }

          // All results should be identical
          const first = results[0]
          results.forEach(result => {
            expect(result.isWebApp).toBe(first.isWebApp)
            expect(result.isChromeExtension).toBe(first.isChromeExtension)
            expect(result.getEnvironment).toBe(first.getEnvironment)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: chrome-extension-to-web-app, Property 1: Environment-Aware API Selection**
   * **Validates: Requirements 8.1, 8.5**
   * 
   * Property: isChromeApiAvailable handles various API paths safely
   * The function should never throw and always return a boolean
   */
  it('isChromeApiAvailable handles any API path without throwing', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        fc.boolean(),
        (pathParts, hasChrome) => {
          const apiPath = pathParts.join('.')
          
          if (hasChrome) {
            globalThis.chrome = {
              runtime: { id: 'test-id' },
              storage: { local: {} }
            }
          } else {
            globalThis.chrome = undefined
          }

          // Should never throw
          let result
          expect(() => {
            result = isChromeApiAvailable(apiPath)
          }).not.toThrow()

          // Should always return a boolean
          expect(typeof result).toBe('boolean')
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: chrome-extension-to-web-app, Property 1: Environment-Aware API Selection**
   * **Validates: Requirements 8.1**
   * 
   * Property: When chrome is undefined, all detection functions work correctly
   * This simulates the web app environment
   */
  it('web environment detection works when chrome is undefined', () => {
    globalThis.chrome = undefined

    expect(isWebApp()).toBe(true)
    expect(isChromeExtension()).toBe(false)
    expect(getEnvironment()).toBe('web')
    expect(isChromeApiAvailable('runtime')).toBe(false)
    expect(isChromeApiAvailable('storage.local')).toBe(false)
  })

  /**
   * **Feature: chrome-extension-to-web-app, Property 1: Environment-Aware API Selection**
   * **Validates: Requirements 8.1**
   * 
   * Property: Extension environment detection works with valid chrome.runtime.id
   */
  it('extension environment detection works with chrome.runtime.id', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (extensionId) => {
          globalThis.chrome = {
            runtime: { id: extensionId }
          }

          expect(isWebApp()).toBe(false)
          expect(isChromeExtension()).toBe(true)
          expect(getEnvironment()).toBe('extension')
        }
      ),
      { numRuns: 100 }
    )
  })
})
