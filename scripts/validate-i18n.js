/**
 * i18n Locale Files Validator
 * Validates all locale JSON files and checks for missing/extra keys
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function validateLocales(localesDir, name) {
  console.log(`\n=== ${name} Locales Validation ===\n`);
  
  const fullPath = path.join(rootDir, localesDir);
  if (!fs.existsSync(fullPath)) {
    console.log(`${colors.yellow}Directory not found: ${localesDir}${colors.reset}`);
    return { errors: 0, warnings: 0 };
  }

  let files = fs.readdirSync(fullPath).filter(f => f.endsWith('.json'));
  // Sort to ensure en.json is processed first
  files = files.sort((a, b) => {
    if (a === 'en.json') return -1;
    if (b === 'en.json') return 1;
    return a.localeCompare(b);
  });
  
  let errors = 0;
  let warnings = 0;
  let baseKeys = null;

  files.forEach(file => {
    const filePath = path.join(fullPath, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(content);
      const topLevelKeys = Object.keys(json);
      
      if (file === 'en.json') {
        baseKeys = new Set(getAllKeys(json));
        console.log(`${colors.green}✅ ${file}: ${topLevelKeys.length} sections, ${baseKeys.size} total keys (BASE)${colors.reset}`);
      } else {
        const currentKeys = new Set(getAllKeys(json));
        const missing = [...baseKeys].filter(k => !currentKeys.has(k));
        const extra = [...currentKeys].filter(k => !baseKeys.has(k));
        
        if (missing.length > 0) {
          console.log(`${colors.yellow}⚠️  ${file}: Missing ${missing.length} keys${colors.reset}`);
          warnings++;
        } else if (extra.length > 0) {
          console.log(`${colors.green}✅ ${file}: ${topLevelKeys.length} sections (+${extra.length} extra keys)${colors.reset}`);
        } else {
          console.log(`${colors.green}✅ ${file}: ${topLevelKeys.length} sections - Complete${colors.reset}`);
        }
      }
    } catch (e) {
      console.log(`${colors.red}❌ ${file}: Invalid JSON - ${e.message}${colors.reset}`);
      errors++;
    }
  });

  return { errors, warnings, total: files.length };
}

// Validate frontend locales
const frontend = validateLocales('src/i18n/locales', 'Frontend');

// Validate backend locales
const backend = validateLocales('backend/src/locales', 'Backend');

// Summary
console.log('\n' + '='.repeat(50));
console.log('SUMMARY');
console.log('='.repeat(50));
console.log(`Frontend: ${frontend.total || 0} files, ${frontend.errors} errors, ${frontend.warnings} warnings`);
console.log(`Backend: ${backend.total || 0} files, ${backend.errors} errors, ${backend.warnings} warnings`);

const totalErrors = (frontend.errors || 0) + (backend.errors || 0);
if (totalErrors > 0) {
  console.log(`\n${colors.red}❌ ${totalErrors} error(s) found${colors.reset}`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}✅ All locale files are valid JSON${colors.reset}`);
}
