const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Màu sắc cho console
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m'
};

const log = {
  cyan: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  green: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  yellow: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  red: (msg) => console.log(`${colors.red}${msg}${colors.reset}`),
  gray: (msg) => console.log(`${colors.gray}${msg}${colors.reset}`)
};

// Danh sách các file/folder cần xóa
const itemsToRemove = [
  'src/components/Admin',
  'src/contexts/AdminAuthContext.jsx',
  'src/services/adminApi.js'
];

// Hàm đếm số file trong thư mục
function countFiles(dir) {
  let count = 0;
  
  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath);
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else {
        count++;
      }
    });
  }
  
  traverse(dir);
  return count;
}

// Hàm xóa thư mục đệ quy
function removeDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        removeDirectory(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir);
  }
}

// Hàm hỏi xác nhận
function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

// Main function
async function main() {
  log.cyan('🔍 Kiểm tra các file admin cũ...');
  console.log('');

  // Kiểm tra sự tồn tại
  log.yellow('📋 Các file/folder sẽ bị xóa:');
  const existingItems = [];

  for (const item of itemsToRemove) {
    if (fs.existsSync(item)) {
      existingItems.push(item);
      const stat = fs.statSync(item);
      if (stat.isDirectory()) {
        const fileCount = countFiles(item);
        log.green(`  ✓ ${item} (thư mục - ${fileCount} files)`);
      } else {
        log.green(`  ✓ ${item} (file)`);
      }
    } else {
      log.gray(`  ✗ ${item} (không tồn tại)`);
    }
  }

  console.log('');

  if (existingItems.length === 0) {
    log.green('✅ Không có file nào cần xóa. Đã clean!');
    process.exit(0);
  }

  // Xác nhận trước khi xóa
  log.red(`⚠️  CẢNH BÁO: Bạn sắp xóa ${existingItems.length} item(s)`);
  console.log('');
  
  const confirmation = await askConfirmation('Bạn có chắc chắn muốn xóa? (yes/no): ');

  if (confirmation !== 'yes') {
    log.yellow('❌ Đã hủy. Không có gì bị xóa.');
    process.exit(0);
  }

  console.log('');
  log.cyan('🗑️  Đang xóa...');

  // Xóa từng item
  let successCount = 0;
  let errorCount = 0;

  for (const item of existingItems) {
    try {
      const stat = fs.statSync(item);
      if (stat.isDirectory()) {
        removeDirectory(item);
        log.green(`  ✓ Đã xóa thư mục: ${item}`);
      } else {
        fs.unlinkSync(item);
        log.green(`  ✓ Đã xóa file: ${item}`);
      }
      successCount++;
    } catch (error) {
      log.red(`  ✗ Lỗi khi xóa ${item}: ${error.message}`);
      errorCount++;
    }
  }

  console.log('');
  log.cyan('📊 Kết quả:');
  log.green(`  ✓ Thành công: ${successCount}`);
  if (errorCount > 0) {
    log.red(`  ✗ Lỗi: ${errorCount}`);
  }

  if (errorCount === 0) {
    console.log('');
    log.green('✅ Hoàn tất! Đã xóa sạch các file admin cũ.');
    log.cyan('💡 Admin panel mới vẫn hoạt động bình thường tại: admin-panel/');
  } else {
    console.log('');
    log.yellow('⚠️  Có một số lỗi xảy ra. Vui lòng kiểm tra lại.');
  }
}

// Chạy script
main().catch(error => {
  log.red(`❌ Lỗi: ${error.message}`);
  process.exit(1);
});
