/**
 * Script to completely separate Admin Panel into an independent project
 * Run: node setup-isolated-admin.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n[LAUNCH] Setting up isolated Admin Panel...\n');

// Directories
const srcAdminDir = path.join(__dirname, 'src/components/Admin');
const srcContextsDir = path.join(__dirname, 'src/contexts');
const adminPanelDir = path.join(__dirname, 'admin-panel');
const adminComponentsDir = path.join(adminPanelDir, 'components');
const adminContextsDir = path.join(adminPanelDir, 'contexts');

// Create directories
[adminComponentsDir, adminContextsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[OK] Created ${path.relative(__dirname, dir)}`);
  }
});

// Copy Admin components
function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`[WARNING]  Source not found: ${src}`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // Update imports to use relative paths
      content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/contexts\//g, "from '../contexts/");
      content = content.replace(/from ['"]\.\.\/\.\.\/contexts\//g, "from '../contexts/");
      content = content.replace(/from ['"]\.\.\/contexts\//g, "from '../contexts/");
      content = content.replace(/from ['"]@\/contexts\//g, "from '../contexts/");
      
      fs.writeFileSync(destPath, content);
    }
  }
}

// Copy Admin components
console.log('\n[PACKAGE] Copying Admin components...');
function copyAndFixImports(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyAndFixImports(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // Fix imports
      content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/contexts\//g, "from '../contexts/");
      content = content.replace(/from ['"]\.\.\/\.\.\/contexts\//g, "from '../contexts/");
      content = content.replace(/from ['"]\.\.\/contexts\//g, "from '../contexts/");
      content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/services\//g, "from '../../services/");
      content = content.replace(/from ['"]\.\.\/\.\.\/services\//g, "from '../../services/");
      content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/utils\//g, "from '../../utils/");
      content = content.replace(/from ['"]\.\.\/\.\.\/utils\//g, "from '../../utils/");
      content = content.replace(/from ['"]\.\.\/\.\.\/Common\//g, "from '../Common/");
      content = content.replace(/from ['"]\.\.\/Common\//g, "from '../Common/");
      content = content.replace(/from ['"]\.\/Common\//g, "from '../Common/");
      
      fs.writeFileSync(destPath, content);
    }
  }
}

copyAndFixImports(srcAdminDir, adminComponentsDir);
console.log('[OK] Admin components copied and imports fixed');

// Copy Common components (NotificationProvider, etc)
const srcCommonDir = path.join(__dirname, 'src/components/Common');
const adminCommonDir = path.join(adminComponentsDir, 'Common');
if (fs.existsSync(srcCommonDir)) {
  console.log('\n[PACKAGE] Copying Common components...');
  copyAndFixImports(srcCommonDir, adminCommonDir);
  console.log('[OK] Common components copied and imports fixed');
}

// Copy services
const srcServicesDir = path.join(__dirname, 'src/services');
const adminServicesDir = path.join(adminPanelDir, 'services');
if (fs.existsSync(srcServicesDir)) {
  console.log('\n[PACKAGE] Copying services...');
  copyAndFixImports(srcServicesDir, adminServicesDir);
  console.log('[OK] Services copied and imports fixed');
}

// Copy utils
const srcUtilsDir = path.join(__dirname, 'src/utils');
const adminUtilsDir = path.join(adminPanelDir, 'utils');
if (fs.existsSync(srcUtilsDir)) {
  console.log('\n[PACKAGE] Copying utils...');
  copyAndFixImports(srcUtilsDir, adminUtilsDir);
  console.log('[OK] Utils copied and imports fixed');
}

// Copy hooks
const srcHooksDir = path.join(__dirname, 'src/hooks');
const adminHooksDir = path.join(adminPanelDir, 'hooks');
if (fs.existsSync(srcHooksDir)) {
  console.log('\n[PACKAGE] Copying hooks...');
  copyAndFixImports(srcHooksDir, adminHooksDir);
  console.log('[OK] Hooks copied and imports fixed');
}

// Copy necessary contexts
console.log('\n[PACKAGE] Copying contexts...');
const contextsToKeep = ['AdminAuthContext.jsx', 'AdminAuthContext.js'];
const allContextFiles = fs.readdirSync(srcContextsDir);

allContextFiles.forEach(file => {
  if (file.includes('Admin') || contextsToKeep.includes(file)) {
    const srcPath = path.join(srcContextsDir, file);
    const destPath = path.join(adminContextsDir, file);
    
    let content = fs.readFileSync(srcPath, 'utf8');
    // Update any imports if needed
    content = content.replace(/from ['"]\.\/(?!Admin)/g, "from '../src/contexts/");
    
    fs.writeFileSync(destPath, content);
    console.log(`[OK] Copied ${file}`);
  }
});

// Update AdminApp.jsx
console.log('\n[NOTE] Updating AdminApp.jsx...');
const adminAppPath = path.join(adminPanelDir, 'AdminApp.jsx');
const adminAppContent = `import { BrowserRouter as Router } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminRoutes from './components/AdminRoutes';

export default function AdminApp() {
  return (
    <Router basename="/admin">
      <AdminAuthProvider>
        <AdminRoutes />
      </AdminAuthProvider>
    </Router>
  );
}
`;
fs.writeFileSync(adminAppPath, adminAppContent);
console.log('[OK] AdminApp.jsx updated');

// Create admin-specific package.json info
console.log('\n[NOTE] Creating admin README...');
const adminReadme = `# Admin Panel

Admin panel is completely separated from main app.

## Development

\`\`\`bash
# Run admin only
npm run dev:admin

# Run both main app and admin
npm run dev:all
\`\`\`

Admin will run at: http://localhost:5174

## Build

\`\`\`bash
# Build both
npm run build

# Build admin only
npm run build:admin
\`\`\`

## Structure

\`\`\`
admin-panel/
├── index.html          # Entry point
├── main.jsx            # React entry
├── AdminApp.jsx        # Root component
├── admin.css           # Global admin styles
├── components/         # Admin components (copied from src)
└── contexts/           # Admin contexts (copied from src)
\`\`\`

## Notes

- Admin panel has completely separate CSS
- Does not share components with main app
- Build output: dist/admin/
`;
fs.writeFileSync(path.join(adminPanelDir, 'README.md'), adminReadme);
console.log('[OK] README created');

console.log('\n[SUCCESS] Admin Panel isolation complete!\n');
console.log('📍 Next steps:');
console.log('   1. Run: npm run dev:admin');
console.log('   2. Open: http://localhost:5174');
console.log('   3. Test admin panel independently\n');
console.log('💡 To run both apps: npm run dev:all\n');
