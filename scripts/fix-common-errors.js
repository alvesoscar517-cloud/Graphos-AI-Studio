#!/usr/bin/env node

/**
 * Automatic Error Fixer
 * Detects and fixes common development errors
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Running automatic error fixer...\n');

let fixCount = 0;

// 1. Check for corrupted package-lock.json
function checkPackageLock() {
  const lockPath = path.join(__dirname, '..', 'package-lock.json');
  try {
    if (fs.existsSync(lockPath)) {
      const content = fs.readFileSync(lockPath, 'utf8');
      JSON.parse(content);
      console.log('✅ package-lock.json is valid');
    }
  } catch (e) {
    console.log('❌ package-lock.json is corrupted');
    console.log('🔧 Fixing: Removing corrupted package-lock.json');
    fs.unlinkSync(lockPath);
    console.log('💡 Run: npm install');
    fixCount++;
  }
}

// 2. Check for Vite cache issues
function checkViteCache() {
  const cachePath = path.join(__dirname, '..', 'node_modules', '.vite');
  if (fs.existsSync(cachePath)) {
    console.log('🔧 Clearing Vite cache...');
    fs.rmSync(cachePath, { recursive: true, force: true });
    console.log('✅ Vite cache cleared');
    fixCount++;
  } else {
    console.log('✅ No Vite cache to clear');
  }
}

// 3. Check for missing .env files
function checkEnvFiles() {
  const envExample = path.join(__dirname, '..', '.env.example');
  const env = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(env) && fs.existsSync(envExample)) {
    console.log('⚠️  .env file not found');
    console.log('💡 Copy .env.example to .env and fill in your values');
  } else {
    console.log('✅ .env file exists');
  }
  
  // Backend
  const backendEnvExample = path.join(__dirname, '..', 'backend', '.env.example');
  const backendEnv = path.join(__dirname, '..', 'backend', '.env');
  
  if (!fs.existsSync(backendEnv) && fs.existsSync(backendEnvExample)) {
    console.log('⚠️  backend/.env file not found');
    console.log('💡 Copy backend/.env.example to backend/.env and fill in your values');
  } else {
    console.log('✅ backend/.env file exists');
  }
}

// 4. Check for node_modules
function checkNodeModules() {
  const nodeModules = path.join(__dirname, '..', 'node_modules');
  if (!fs.existsSync(nodeModules)) {
    console.log('⚠️  node_modules not found');
    console.log('💡 Run: npm install');
  } else {
    console.log('✅ node_modules exists');
  }
  
  const backendNodeModules = path.join(__dirname, '..', 'backend', 'node_modules');
  if (!fs.existsSync(backendNodeModules)) {
    console.log('⚠️  backend/node_modules not found');
    console.log('💡 Run: cd backend && npm install');
  } else {
    console.log('✅ backend/node_modules exists');
  }
}

// 5. Check for common syntax errors in key files
function checkSyntaxErrors() {
  const filesToCheck = [
    'src/App.jsx',
    'src/main.jsx',
    'src/contexts/ProfileContext.jsx',
    'src/utils/devConfig.js'
  ];
  
  filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Basic checks
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        const openParens = (content.match(/\(/g) || []).length;
        const closeParens = (content.match(/\)/g) || []).length;
        
        if (openBraces !== closeBraces) {
          console.log(`⚠️  ${file}: Mismatched braces (${openBraces} open, ${closeBraces} close)`);
        } else if (openParens !== closeParens) {
          console.log(`⚠️  ${file}: Mismatched parentheses (${openParens} open, ${closeParens} close)`);
        } else {
          console.log(`✅ ${file}: No obvious syntax errors`);
        }
      } catch (e) {
        console.log(`❌ ${file}: Cannot read file`);
      }
    } else {
      console.log(`⚠️  ${file}: File not found`);
    }
  });
}

// Run all checks
console.log('📋 Checking package files...');
checkPackageLock();

console.log('\n📋 Checking cache...');
checkViteCache();

console.log('\n📋 Checking environment files...');
checkEnvFiles();

console.log('\n📋 Checking dependencies...');
checkNodeModules();

console.log('\n📋 Checking syntax...');
checkSyntaxErrors();

console.log('\n' + '='.repeat(60));
if (fixCount > 0) {
  console.log(`✅ Fixed ${fixCount} issue(s)`);
  console.log('💡 Restart your dev server to apply changes');
} else {
  console.log('✅ No issues found');
}
console.log('='.repeat(60));
