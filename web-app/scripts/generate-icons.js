/**
 * Generate PWA icons from source image
 * Run: npm install sharp --save-dev && node scripts/generate-icons.js
 */
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 192, 384, 512];
const sourceImage = join(__dirname, '../public/icons/content.png');
const outputDir = join(__dirname, '../public/icons');

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  for (const size of sizes) {
    const outputPath = join(outputDir, `icon-${size}x${size}.png`);
    await sharp(sourceImage)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outputPath);
    console.log(`✓ Created icon-${size}x${size}.png`);
  }
  
  console.log('\nDone! Icons generated in public/icons/');
}

generateIcons().catch(console.error);
