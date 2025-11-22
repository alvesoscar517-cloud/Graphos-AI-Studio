/**
 * Script để tách hoàn toàn Admin Panel thành project độc lập
 * Chạy: node setup-isolated-admin.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🚀 Setting up isolated Admin Panel...\n');

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
    console.log(`✓ Created ${path.relative(__dirname, dir)}`);
  }
});

// Copy Admin components
function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`⚠️  Source not found: ${src}`);
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
console.log('\n📦 Copying Admin components...');
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
console.log('✓ Admin components copied and imports fixed');

// Copy Common components (NotificationProvider, etc)
const srcCommonDir = path.join(__dirname, 'src/components/Common');
const adminCommonDir = path.join(adminComponentsDir, 'Common');
if (fs.existsSync(srcCommonDir)) {
  console.log('\n📦 Copying Common components...');
  copyAndFixImports(srcCommonDir, adminCommonDir);
  console.log('✓ Common components copied and imports fixed');
}

// Copy services
const srcServicesDir = path.join(__dirname, 'src/services');
const adminServicesDir = path.join(adminPanelDir, 'services');
if (fs.existsSync(srcServicesDir)) {
  console.log('\n📦 Copying services...');
  copyAndFixImports(srcServicesDir, adminServicesDir);
  console.log('✓ Services copied and imports fixed');
}

// Copy utils
const srcUtilsDir = path.join(__dirname, 'src/utils');
const adminUtilsDir = path.join(adminPanelDir, 'utils');
if (fs.existsSync(srcUtilsDir)) {
  console.log('\n📦 Copying utils...');
  copyAndFixImports(srcUtilsDir, adminUtilsDir);
  console.log('✓ Utils copied and imports fixed');
}

// Copy hooks
const srcHooksDir = path.join(__dirname, 'src/hooks');
const adminHooksDir = path.join(adminPanelDir, 'hooks');
if (fs.existsSync(srcHooksDir)) {
  console.log('\n📦 Copying hooks...');
  copyAndFixImports(srcHooksDir, adminHooksDir);
  console.log('✓ Hooks copied and imports fixed');
}

// Copy necessary contexts
console.log('\n📦 Copying contexts...');
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
    console.log(`✓ Copied ${file}`);
  }
});

// Update AdminApp.jsx
console.log('\n📝 Updating AdminApp.jsx...');
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
console.log('✓ AdminApp.jsx updated');

// Create admin-specific package.json info
console.log('\n📝 Creating admin README...');
const adminReadme = `# Admin Panel

Admin panel hoàn toàn tách biệt khỏi main app.

## Development

\`\`\`bash
# Chỉ chạy admin
npm run dev:admin

# Chạy cả main app và admin
npm run dev:all
\`\`\`

Admin sẽ chạy tại: http://localhost:5174

## Build

\`\`\`bash
# Build cả 2
npm run build

# Chỉ build admin
npm run build:admin
\`\`\`

## Cấu trúc

\`\`\`
admin-panel/
├── index.html          # Entry point
├── main.jsx            # React entry
├── AdminApp.jsx        # Root component
├── admin.css           # Global admin styles
├── components/         # Admin components (copied from src)
└── contexts/           # Admin contexts (copied from src)
\`\`\`

## Lưu ý

- Admin panel có CSS hoàn toàn riêng biệt
- Không share components với main app
- Build output: dist/admin/
`;
fs.writeFileSync(path.join(adminPanelDir, 'README.md'), adminReadme);
console.log('✓ README created');

console.log('\n✅ Admin Panel isolation complete!\n');
console.log('📍 Next steps:');
console.log('   1. Run: npm run dev:admin');
console.log('   2. Open: http://localhost:5174');
console.log('   3. Test admin panel independently\n');
console.log('💡 To run both apps: npm run dev:all\n');
