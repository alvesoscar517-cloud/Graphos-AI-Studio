/**
 * Pre-Release Check Script
 * Kiểm tra các vấn đề phổ biến trước khi release production
 * 
 * Usage: node scripts/pre-release-check.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}=== ${msg} ===${colors.reset}\n`)
};

let issues = { critical: 0, warning: 0, info: 0 };

// Helper to read file content
function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(rootDir, filePath), 'utf8');
  } catch (e) {
    return null;
  }
}

// Helper to check if file exists
function fileExists(filePath) {
  return fs.existsSync(path.join(rootDir, filePath));
}

// Check for console.log statements
function checkConsoleLogs() {
  log.header('Checking Console Statements');
  
  const filesToCheck = [
    'src/utils/devConfig.js',
    'src/utils/modal.js',
    'src/utils/storageCleanup.js',
    'src/utils/profileDetailCache.js',
    'src/utils/profileCache.js',
    'src/utils/creditHandler.js',
    'src/utils/credentialManager.js'
  ];

  let found = 0;
  filesToCheck.forEach(file => {
    const content = readFile(file);
    if (content) {
      const matches = content.match(/console\.(log|debug|info)/g);
      if (matches) {
        log.warn(`${file}: ${matches.length} console statement(s) found`);
        found += matches.length;
        issues.warning++;
      }
    }
  });

  if (found === 0) {
    log.success('No unprotected console statements found');
  } else {
    log.info(`Total: ${found} console statements need review`);
  }
}

// Check for TODO/FIXME comments
function checkTodoComments() {
  log.header('Checking TODO/FIXME Comments');
  
  const criticalFiles = [
    'backend/src/middleware/cors.js',
    'backend-admin/src/middleware/cors.js',
    'backend/src/controllers/credit.controller.js'
  ];

  criticalFiles.forEach(file => {
    const content = readFile(file);
    if (content) {
      // Count TODO/FIXME occurrences
      const todos = (content.match(/TODO:/gi) || []).length;
      const fixmes = (content.match(/FIXME:/gi) || []).length;
      const total = todos + fixmes;
      
      if (total > 0) {
        log.warn(`${file} contains ${total} TODO/FIXME comment(s) - review before release`);
        issues.warning++;
      } else {
        log.success(`${file} - no TODO/FIXME comments`);
      }
    }
  });
}

// Check environment files
function checkEnvFiles() {
  log.header('Checking Environment Configuration');

  // Check .env files are not committed
  const envFiles = ['.env', 'admin-panel/.env', 'backend/.env', 'backend-admin/.env'];
  envFiles.forEach(file => {
    if (fileExists(file)) {
      log.warn(`${file} exists - ensure it's in .gitignore`);
      issues.warning++;
    }
  });

  // Check .env.example files exist
  const exampleFiles = ['.env.example', 'admin-panel/.env.example', 'backend/.env.example', 'backend-admin/.env.example'];
  exampleFiles.forEach(file => {
    if (!fileExists(file)) {
      log.error(`Missing ${file}`);
      issues.critical++;
    } else {
      log.success(`${file} exists`);
    }
  });

  // Check for hardcoded secrets in .env.example
  const backendEnv = readFile('backend/.env.example');
  if (backendEnv && backendEnv.includes('gai_internal_7f3a9c2e8b1d4f6a0e5c3b9d2a8f1e4c7b0d3a6e9f2c5b8a1d4e7f0c3b6a9d2e')) {
    log.warn('backend/.env.example contains sample INTERNAL_API_KEY - change in production');
    issues.warning++;
  }
}

// Check CORS configuration
function checkCorsConfig() {
  log.header('Checking CORS Configuration');

  const corsFiles = ['backend/src/middleware/cors.js', 'backend-admin/src/middleware/cors.js'];
  
  corsFiles.forEach(file => {
    const content = readFile(file);
    if (!content) return;
    
    // Check if localhost is allowed WITHOUT production check
    // Pattern: allowing localhost without checking IS_PRODUCTION or IS_DEVELOPMENT
    const hasProductionCheck = content.includes('IS_PRODUCTION') || content.includes('IS_DEVELOPMENT');
    const allowsLocalhostUnconditionally = 
      content.includes('localhost') && 
      !hasProductionCheck &&
      (content.includes('return true') || content.includes('callback(null, true)'));
    
    if (allowsLocalhostUnconditionally) {
      log.error(`CRITICAL: ${file} allows localhost without production check`);
      issues.critical++;
    } else if (content.includes('localhost') && hasProductionCheck) {
      log.success(`${file} - localhost restricted to development mode`);
    } else {
      log.success(`${file} - CORS configured`);
    }
  });
}

// Check manifest.json
function checkManifest() {
  log.header('Checking Chrome Extension Manifest');

  const manifest = readFile('manifest.json');
  if (!manifest) {
    log.error('manifest.json not found');
    issues.critical++;
    return;
  }

  try {
    const json = JSON.parse(manifest);
    
    // Check version
    log.info(`Version: ${json.version}`);
    
    // Check permissions
    if (json.permissions && json.permissions.length > 0) {
      log.info(`Permissions: ${json.permissions.join(', ')}`);
    }

    // Check host_permissions
    if (json.host_permissions) {
      json.host_permissions.forEach(hp => {
        if (hp.includes('localhost') || hp.includes('127.0.0.1')) {
          log.warn(`Host permission includes localhost: ${hp}`);
          issues.warning++;
        }
      });
    }

    log.success('manifest.json is valid JSON');
  } catch (e) {
    log.error('manifest.json is invalid JSON');
    issues.critical++;
  }
}

// Check i18n files
function checkI18n() {
  log.header('Checking Internationalization');

  const localesDir = 'src/i18n/locales';
  const backendLocalesDir = 'backend/src/locales';

  // Check frontend locales
  if (fs.existsSync(path.join(rootDir, localesDir))) {
    const files = fs.readdirSync(path.join(rootDir, localesDir));
    log.info(`Frontend locales: ${files.length} languages`);
    
    // Check if en.json exists as base
    if (!files.includes('en.json')) {
      log.error('Missing en.json (base locale)');
      issues.critical++;
    }

    // Check each locale file is valid JSON
    files.forEach(file => {
      try {
        const content = readFile(`${localesDir}/${file}`);
        JSON.parse(content);
      } catch (e) {
        log.error(`Invalid JSON in ${localesDir}/${file}`);
        issues.critical++;
      }
    });
  }

  // Check backend locales
  if (fs.existsSync(path.join(rootDir, backendLocalesDir))) {
    const files = fs.readdirSync(path.join(rootDir, backendLocalesDir));
    log.info(`Backend locales: ${files.length} languages`);
  }
}

// Check Firestore rules
function checkFirestoreRules() {
  log.header('Checking Firestore Security Rules');

  const rules = readFile('firestore.rules');
  if (!rules) {
    log.error('firestore.rules not found');
    issues.critical++;
    return;
  }

  // Check for overly permissive rules
  if (rules.includes('allow read, write: if true')) {
    log.error('CRITICAL: Firestore rules allow unrestricted access');
    issues.critical++;
  } else {
    log.success('Firestore rules do not have unrestricted access');
  }

  // Check for default deny
  if (rules.includes('allow read, write: if false')) {
    log.success('Firestore rules have default deny');
  }
}

// Check package.json for production readiness
function checkPackageJson() {
  log.header('Checking Package Configuration');

  const pkg = readFile('package.json');
  if (!pkg) {
    log.error('package.json not found');
    issues.critical++;
    return;
  }

  try {
    const json = JSON.parse(pkg);
    
    log.info(`Name: ${json.name}`);
    log.info(`Version: ${json.version}`);
    
    // Check for build script
    if (json.scripts && json.scripts.build) {
      log.success('Build script exists');
    } else {
      log.error('No build script found');
      issues.critical++;
    }

    // Check for lint script
    if (json.scripts && json.scripts.lint && !json.scripts.lint.includes('not configured')) {
      log.success('Lint script configured');
    } else {
      log.warn('Lint script not properly configured');
      issues.warning++;
    }

  } catch (e) {
    log.error('package.json is invalid JSON');
    issues.critical++;
  }
}

// Check for .gitignore
function checkGitignore() {
  log.header('Checking .gitignore');

  const gitignore = readFile('.gitignore');
  if (!gitignore) {
    log.error('.gitignore not found');
    issues.critical++;
    return;
  }

  const requiredEntries = ['.env', 'node_modules', 'dist', '.env.local'];
  requiredEntries.forEach(entry => {
    if (gitignore.includes(entry)) {
      log.success(`${entry} is ignored`);
    } else {
      log.warn(`${entry} might not be ignored`);
      issues.warning++;
    }
  });
}

// Main execution
function main() {
  console.log(`\n${colors.bold}🔍 Pre-Release Check for Graphos AI Studio${colors.reset}`);
  console.log('='.repeat(50));

  checkConsoleLogs();
  checkTodoComments();
  checkEnvFiles();
  checkCorsConfig();
  checkManifest();
  checkI18n();
  checkFirestoreRules();
  checkPackageJson();
  checkGitignore();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`${colors.bold}📊 SUMMARY${colors.reset}`);
  console.log('='.repeat(50));
  
  if (issues.critical > 0) {
    log.error(`Critical issues: ${issues.critical}`);
  }
  if (issues.warning > 0) {
    log.warn(`Warnings: ${issues.warning}`);
  }
  if (issues.info > 0) {
    log.info(`Info: ${issues.info}`);
  }

  console.log('\n');
  
  if (issues.critical > 0) {
    console.log(`${colors.red}${colors.bold}❌ NOT READY FOR PRODUCTION${colors.reset}`);
    console.log(`${colors.red}Please fix ${issues.critical} critical issue(s) before release.${colors.reset}`);
    process.exit(1);
  } else if (issues.warning > 0) {
    console.log(`${colors.yellow}${colors.bold}⚠️  REVIEW WARNINGS BEFORE PRODUCTION${colors.reset}`);
    console.log(`${colors.yellow}${issues.warning} warning(s) should be reviewed.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.green}${colors.bold}✅ READY FOR PRODUCTION${colors.reset}`);
    process.exit(0);
  }
}

main();
