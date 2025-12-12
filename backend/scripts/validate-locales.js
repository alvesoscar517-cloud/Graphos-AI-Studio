#!/usr/bin/env node
/**
 * Locale Validation Script
 * Validates all locale files against the default (English) locale
 * 
 * Usage:
 *   node scripts/validate-locales.js [--fix] [--verbose]
 * 
 * Options:
 *   --fix      Auto-add missing keys with placeholder values
 *   --verbose  Show detailed output including all checked keys
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const DEFAULT_LANGUAGE = 'en';

// Parse command line arguments
const args = process.argv.slice(2);
const FIX_MODE = args.includes('--fix');
const VERBOSE = args.includes('--verbose');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

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
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, key) {
  return key.split('.').reduce((current, part) => {
    return current && current[part] !== undefined ? current[part] : undefined;
  }, obj);
}

/**
 * Set nested value in object using dot notation
 */
function setNestedValue(obj, key, value) {
  const parts = key.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  
  current[parts[parts.length - 1]] = value;
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
    return null;
  }
}

/**
 * Save locale file
 */
function saveLocale(lang, data) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/**
 * Get all available locale files
 */
function getAvailableLocales() {
  try {
    const files = fs.readdirSync(LOCALES_DIR);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  } catch (error) {
    console.error(`${colors.red}Error reading locales directory:${colors.reset}`, error.message);
    return [];
  }
}

/**
 * Validate a single locale against default
 */
function validateLocale(lang, defaultLocale, defaultKeys) {
  const locale = loadLocale(lang);
  
  if (!locale) {
    return {
      lang,
      error: 'Failed to load locale file',
      missing: [],
      extra: [],
      empty: []
    };
  }
  
  const localeKeys = new Set(getAllKeys(locale));
  const missing = [];
  const extra = [];
  const empty = [];
  
  // Find missing keys
  for (const key of defaultKeys) {
    if (!localeKeys.has(key)) {
      missing.push(key);
    } else {
      // Check for empty values
      const value = getNestedValue(locale, key);
      if (value === '' || value === null) {
        empty.push(key);
      }
    }
  }
  
  // Find extra keys (in locale but not in default)
  for (const key of localeKeys) {
    if (!defaultKeys.includes(key)) {
      extra.push(key);
    }
  }
  
  return { lang, missing, extra, empty, locale };
}

/**
 * Fix missing keys by adding placeholders
 */
function fixMissingKeys(lang, locale, missing, defaultLocale) {
  let fixed = 0;
  
  for (const key of missing) {
    const defaultValue = getNestedValue(defaultLocale, key);
    const placeholder = `[TODO:${lang}] ${defaultValue}`;
    setNestedValue(locale, key, placeholder);
    fixed++;
  }
  
  if (fixed > 0) {
    saveLocale(lang, locale);
  }
  
  return fixed;
}

/**
 * Main validation function
 */
function main() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}                   LOCALE VALIDATION                        ${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);
  
  // Load default locale
  const defaultLocale = loadLocale(DEFAULT_LANGUAGE);
  if (!defaultLocale) {
    console.error(`${colors.red}Error: Cannot load default locale (${DEFAULT_LANGUAGE})${colors.reset}`);
    process.exit(1);
  }
  
  const defaultKeys = getAllKeys(defaultLocale);
  console.log(`${colors.blue}Default locale (${DEFAULT_LANGUAGE}):${colors.reset} ${defaultKeys.length} keys\n`);
  
  // Get all locales
  const locales = getAvailableLocales().filter(l => l !== DEFAULT_LANGUAGE);
  console.log(`${colors.blue}Checking locales:${colors.reset} ${locales.join(', ')}\n`);
  
  let totalMissing = 0;
  let totalExtra = 0;
  let totalEmpty = 0;
  let totalFixed = 0;
  const results = [];
  
  // Validate each locale
  for (const lang of locales) {
    const result = validateLocale(lang, defaultLocale, defaultKeys);
    results.push(result);
    
    if (result.error) {
      console.log(`${colors.red}[FAIL] ${lang}:${colors.reset} ${result.error}`);
      continue;
    }
    
    const { missing, extra, empty, locale } = result;
    totalMissing += missing.length;
    totalExtra += extra.length;
    totalEmpty += empty.length;
    
    // Status icon
    const hasIssues = missing.length > 0 || empty.length > 0;
    const icon = hasIssues ? `${colors.yellow}[WARNING]${colors.reset}` : `${colors.green}[SUCCESS]${colors.reset}`;
    
    console.log(`${icon} ${colors.cyan}${lang}${colors.reset}`);
    
    if (missing.length > 0) {
      console.log(`  ${colors.red}Missing: ${missing.length} keys${colors.reset}`);
      if (VERBOSE) {
        missing.forEach(key => console.log(`    ${colors.dim}- ${key}${colors.reset}`));
      }
      
      // Fix mode
      if (FIX_MODE) {
        const fixed = fixMissingKeys(lang, locale, missing, defaultLocale);
        totalFixed += fixed;
        console.log(`  ${colors.green}Fixed: ${fixed} keys (added placeholders)${colors.reset}`);
      }
    }
    
    if (empty.length > 0) {
      console.log(`  ${colors.yellow}Empty: ${empty.length} keys${colors.reset}`);
      if (VERBOSE) {
        empty.forEach(key => console.log(`    ${colors.dim}- ${key}${colors.reset}`));
      }
    }
    
    if (extra.length > 0) {
      console.log(`  ${colors.blue}Extra: ${extra.length} keys${colors.reset}`);
      if (VERBOSE) {
        extra.forEach(key => console.log(`    ${colors.dim}- ${key}${colors.reset}`));
      }
    }
    
    if (!hasIssues && extra.length === 0) {
      console.log(`  ${colors.green}All ${defaultKeys.length} keys present${colors.reset}`);
    }
  }
  
  // Summary
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}                        SUMMARY                             ${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);
  
  console.log(`Locales checked: ${locales.length}`);
  console.log(`Total missing keys: ${totalMissing > 0 ? colors.red : colors.green}${totalMissing}${colors.reset}`);
  console.log(`Total empty values: ${totalEmpty > 0 ? colors.yellow : colors.green}${totalEmpty}${colors.reset}`);
  console.log(`Total extra keys: ${colors.blue}${totalExtra}${colors.reset}`);
  
  if (FIX_MODE && totalFixed > 0) {
    console.log(`${colors.green}Total fixed: ${totalFixed}${colors.reset}`);
  }
  
  // Exit code
  if (totalMissing > 0 || totalEmpty > 0) {
    console.log(`\n${colors.yellow}[WARNING] Validation completed with warnings${colors.reset}`);
    if (!FIX_MODE) {
      console.log(`${colors.dim}Run with --fix to auto-add missing keys${colors.reset}`);
    }
    process.exit(1);
  } else {
    console.log(`\n${colors.green}[SUCCESS] All locales are valid${colors.reset}`);
    process.exit(0);
  }
}

main();
