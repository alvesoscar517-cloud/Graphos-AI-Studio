#!/usr/bin/env node
/**
 * Generate TypeScript Types from Locale Files
 * Automatically generates type definitions based on en.json structure
 * 
 * Usage:
 *   node scripts/generate-i18n-types.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const OUTPUT_FILE = path.join(__dirname, '../src/types/i18n.generated.d.ts');
const DEFAULT_LANGUAGE = 'en';

/**
 * Get all keys from an object recursively using dot notation
 */
function getAllKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

/**
 * Group keys by category (first part of dot notation)
 */
function groupKeysByCategory(keys) {
  const groups = {};
  
  for (const key of keys) {
    const category = key.split('.')[0];
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(key);
  }
  
  return groups;
}

/**
 * Convert category name to PascalCase type name
 */
function toPascalCase(str) {
  return str
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Extract interpolation params from a translation string
 */
function extractParams(value) {
  const matches = value.match(/\{\{(\w+)\}\}/g);
  if (!matches) return null;
  
  return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
}

/**
 * Load locale file
 */
function loadLocale(lang) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${lang}.json:`, error.message);
    return null;
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, key) {
  return key.split('.').reduce((current, part) => {
    return current && current[part] !== undefined ? current[part] : undefined;
  }, obj);
}

/**
 * Generate TypeScript content
 */
function generateTypeScript(locale, keys, groupedKeys) {
  const lines = [];
  
  // Header
  lines.push('/**');
  lines.push(' * Auto-generated TypeScript Types for i18n');
  lines.push(` * Generated from: ${DEFAULT_LANGUAGE}.json`);
  lines.push(` * Generated at: ${new Date().toISOString()}`);
  lines.push(' * DO NOT EDIT MANUALLY - Run generate-i18n-types.js to regenerate');
  lines.push(' */');
  lines.push('');
  
  // Supported languages
  lines.push('// Supported language codes');
  lines.push('export type SupportedLanguage =');
  lines.push("  | 'en' | 'vi' | 'zh' | 'ja' | 'ko'");
  lines.push("  | 'fr' | 'de' | 'es' | 'pt' | 'it'");
  lines.push("  | 'ru' | 'ar' | 'th' | 'id' | 'ms';");
  lines.push('');
  
  // Generate type for each category
  for (const [category, categoryKeys] of Object.entries(groupedKeys)) {
    const typeName = `${toPascalCase(category)}Key`;
    lines.push(`export type ${typeName} =`);
    
    categoryKeys.forEach((key, index) => {
      const isLast = index === categoryKeys.length - 1;
      lines.push(`  | '${key}'${isLast ? ';' : ''}`);
    });
    lines.push('');
  }
  
  // Combined type
  lines.push('// Combined translation key type');
  lines.push('export type TranslationKey =');
  const categories = Object.keys(groupedKeys);
  categories.forEach((category, index) => {
    const typeName = `${toPascalCase(category)}Key`;
    const isLast = index === categories.length - 1;
    lines.push(`  | ${typeName}${isLast ? ';' : ''}`);
  });
  lines.push('');
  
  // Generate params interface
  lines.push('// Interpolation parameters for keys that require them');
  lines.push('export interface TranslationParams {');
  
  for (const key of keys) {
    const value = getNestedValue(locale, key);
    if (typeof value === 'string') {
      const params = extractParams(value);
      if (params && params.length > 0) {
        const paramTypes = params.map(p => {
          // Infer type from param name
          if (['count', 'min', 'max', 'amount', 'required', 'available', 'seconds', 'score', 'formality', 'used', 'limit'].includes(p)) {
            return `${p}: number`;
          }
          return `${p}: string`;
        });
        lines.push(`  '${key}': { ${paramTypes.join('; ')} };`);
      }
    }
  }
  
  lines.push('}');
  lines.push('');
  
  // Helper type for type-safe translate function
  lines.push('// Type-safe translate function signature');
  lines.push('export type TranslateFunction = {');
  lines.push('  <K extends keyof TranslationParams>(key: K, lang: SupportedLanguage, params: TranslationParams[K]): string;');
  lines.push('  <K extends Exclude<TranslationKey, keyof TranslationParams>>(key: K, lang?: SupportedLanguage, params?: Record<string, unknown>): string;');
  lines.push('};');
  lines.push('');
  
  lines.push('export {};');
  
  return lines.join('\n');
}

/**
 * Main function
 */
function main() {
  console.log('Generating i18n TypeScript types...\n');
  
  // Load default locale
  const locale = loadLocale(DEFAULT_LANGUAGE);
  if (!locale) {
    console.error('Failed to load default locale');
    process.exit(1);
  }
  
  // Get all keys
  const keys = getAllKeys(locale);
  console.log(`Found ${keys.length} translation keys`);
  
  // Group by category
  const groupedKeys = groupKeysByCategory(keys);
  console.log(`Categories: ${Object.keys(groupedKeys).join(', ')}`);
  
  // Generate TypeScript
  const tsContent = generateTypeScript(locale, keys, groupedKeys);
  
  // Write output
  fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf8');
  console.log(`\nGenerated: ${OUTPUT_FILE}`);
  console.log('Done!');
}

main();
