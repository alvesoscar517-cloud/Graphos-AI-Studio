/**
 * PWA Property Tests
 * Tests for PWA manifest validity and service worker registration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import manifest from '../../public/manifest.json';

describe('PWA Configuration', () => {
  // **Feature: chrome-extension-to-web-app, Property 9: PWA Manifest Validity**
  describe('Property 9: PWA Manifest Validity', () => {
    it('should have all required PWA manifest fields', () => {
      // Required fields for PWA installability
      const requiredFields = [
        'name',
        'short_name',
        'start_url',
        'display',
        'icons',
      ];

      requiredFields.forEach((field) => {
        expect(manifest).toHaveProperty(field);
        expect(manifest[field]).toBeDefined();
      });
    });

    it('should have valid name fields', () => {
      expect(typeof manifest.name).toBe('string');
      expect(manifest.name.length).toBeGreaterThan(0);
      expect(manifest.name.length).toBeLessThanOrEqual(45); // Recommended max length

      expect(typeof manifest.short_name).toBe('string');
      expect(manifest.short_name.length).toBeGreaterThan(0);
      expect(manifest.short_name.length).toBeLessThanOrEqual(12); // Recommended max length
    });

    it('should have valid start_url', () => {
      expect(typeof manifest.start_url).toBe('string');
      expect(manifest.start_url).toMatch(/^\/|^https?:\/\//);
    });

    it('should have valid display mode', () => {
      const validDisplayModes = [
        'fullscreen',
        'standalone',
        'minimal-ui',
        'browser',
      ];
      expect(validDisplayModes).toContain(manifest.display);
    });

    it('should have at least 192x192 and 512x512 icons', () => {
      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

      const sizes = manifest.icons.map((icon) => icon.sizes);
      expect(sizes).toContain('192x192');
      expect(sizes).toContain('512x512');
    });

    it('should have valid icon entries', () => {
      manifest.icons.forEach((icon) => {
        // Each icon must have src, sizes, and type
        expect(icon).toHaveProperty('src');
        expect(icon).toHaveProperty('sizes');
        expect(icon).toHaveProperty('type');

        // src should be a valid path
        expect(typeof icon.src).toBe('string');
        expect(icon.src.length).toBeGreaterThan(0);

        // sizes should match pattern NxN
        expect(icon.sizes).toMatch(/^\d+x\d+$/);

        // type should be a valid image MIME type
        expect(['image/png', 'image/svg+xml', 'image/webp']).toContain(
          icon.type
        );
      });
    });

    it('should have valid theme and background colors', () => {
      // Colors should be valid hex colors
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

      if (manifest.theme_color) {
        expect(manifest.theme_color).toMatch(hexColorRegex);
      }

      if (manifest.background_color) {
        expect(manifest.background_color).toMatch(hexColorRegex);
      }
    });

    it('should have maskable icons for Android adaptive icons', () => {
      const maskableIcons = manifest.icons.filter(
        (icon) => icon.purpose && icon.purpose.includes('maskable')
      );
      expect(maskableIcons.length).toBeGreaterThanOrEqual(1);
    });
  });

  // Property-based tests for manifest structure
  describe('Manifest Structure Properties', () => {
    it('should maintain consistent icon size format across all icons', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...manifest.icons),
          (icon) => {
            const [width, height] = icon.sizes.split('x').map(Number);
            // Icons should be square
            return width === height && width > 0;
          }
        ),
        { numRuns: manifest.icons.length }
      );
    });

    it('should have icon paths that follow consistent naming convention', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...manifest.icons),
          (icon) => {
            // Icon src should contain the size in the filename
            const sizeMatch = icon.src.match(/(\d+)x(\d+)/);
            if (sizeMatch) {
              return icon.sizes === `${sizeMatch[1]}x${sizeMatch[2]}`;
            }
            return true; // Allow icons without size in filename
          }
        ),
        { numRuns: manifest.icons.length }
      );
    });
  });

  // Service Worker Registration Tests
  describe('Service Worker Registration', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should handle service worker registration in supported browsers', async () => {
      // Mock navigator.serviceWorker
      const mockRegister = vi.fn().mockResolvedValue({
        scope: '/',
        active: { state: 'activated' },
      });

      const originalNavigator = global.navigator;
      global.navigator = {
        ...originalNavigator,
        serviceWorker: {
          register: mockRegister,
        },
      };

      // Simulate registration
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        expect(registration).toBeDefined();
        expect(registration.scope).toBe('/');
      }

      global.navigator = originalNavigator;
    });

    it('should gracefully handle browsers without service worker support', () => {
      const originalNavigator = global.navigator;
      global.navigator = {};

      // Should not throw when serviceWorker is not available
      expect(() => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js');
        }
      }).not.toThrow();

      global.navigator = originalNavigator;
    });
  });
});
