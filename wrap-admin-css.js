import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const adminComponentsDir = path.join(__dirname, 'admin-panel/components');

function wrapCSSWithScope(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already wrapped
  if (content.includes('#admin-root')) {
    return;
  }
  
  // Wrap all selectors with #admin-root
  const lines = content.split('\n');
  const wrapped = [];
  let inComment = false;
  
  for (let line of lines) {
    // Handle comments
    if (line.trim().startsWith('/*')) inComment = true;
    if (line.trim().endsWith('*/')) {
      inComment = false;
      wrapped.push(line);
      continue;
    }
    if (inComment || line.trim().startsWith('//') || line.trim() === '') {
      wrapped.push(line);
      continue;
    }
    
    // Wrap selectors
    if (line.includes('{') && !line.trim().startsWith('@')) {
      const selector = line.substring(0, line.indexOf('{')).trim();
      if (selector) {
        const wrappedSelector = selector.split(',').map(s => `#admin-root ${s.trim()}`).join(', ');
        wrapped.push(line.replace(selector, wrappedSelector));
      } else {
        wrapped.push(line);
      }
    } else {
      wrapped.push(line);
    }
  }
  
  fs.writeFileSync(filePath, wrapped.join('\n'));
  console.log(`✓ Wrapped: ${path.relative(__dirname, filePath)}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      walkDir(fullPath);
    } else if (file.name.endsWith('.css')) {
      wrapCSSWithScope(fullPath);
    }
  }
}

console.log('🎨 Wrapping all CSS with #admin-root scope...\n');
walkDir(adminComponentsDir);
console.log('\n✅ All CSS wrapped!');
