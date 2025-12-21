/**
 * Email CID (Content-ID) Helper
 * Handles embedding images in emails using CID references
 * This ensures images display correctly without being blocked by email providers
 * 
 * @module utils/emailCid
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

// Path to email icons directory
const ICONS_DIR = path.join(__dirname, '../../assets/email-icons');

// Icon file mapping (same as emailTemplate.service.js)
const ICON_FILES = {
  check: 'circle-check',
  message: 'message-square',
  mail: 'mail',
  creditCard: 'credit-card',
  file: 'file-text',
  database: 'database',
  download: 'download',
  barChart: 'chart-bar',
  info: 'info',
  user: 'user',
  calendar: 'calendar',
  alertCircle: 'circle-alert',
  logo: 'content',
  // New icons for purchase/notification emails
  gift: 'gift',
  rocket: 'rocket',
  sparkles: 'sparkles',
  zap: 'zap'
};

// ============================================================================
// CID HELPERS
// ============================================================================

/**
 * Generate a CID for an icon
 * @param {string} iconName - Icon name (e.g., 'check', 'mail')
 * @param {string} color - Color variant ('black' or 'white')
 * @returns {string} CID string
 */
function getCid(iconName, color = 'black') {
  const fileName = ICON_FILES[iconName] || iconName;
  if (iconName === 'logo') {
    return 'logo_content';
  }
  return `${fileName}-${color}`.replace(/-/g, '_');
}

/**
 * Get the file path for an icon
 * @param {string} iconName - Icon name
 * @param {string} color - Color variant
 * @returns {string} Full file path
 */
function getIconPath(iconName, color = 'black') {
  const fileName = ICON_FILES[iconName] || iconName;
  if (iconName === 'logo') {
    return path.join(ICONS_DIR, 'content.png');
  }
  return path.join(ICONS_DIR, `${fileName}-${color}.png`);
}

/**
 * Generate CID-based img src
 * @param {string} iconName - Icon name
 * @param {string} color - Color variant
 * @returns {string} CID src string for use in HTML
 */
function cidSrc(iconName, color = 'black') {
  return `cid:${getCid(iconName, color)}`;
}

/**
 * Generate HTML img tag with CID
 * @param {string} iconName - Icon name
 * @param {string} color - Color variant
 * @param {number} size - Icon size in pixels
 * @returns {string} HTML img tag
 */
function cidIcon(iconName, color = 'black', size = 20) {
  const colorVariant = (color === 'white' || color === '#ffffff') ? 'white' : 'black';
  return `<img src="${cidSrc(iconName, colorVariant)}" alt="${iconName}" width="${size}" height="${size}" style="display:block;margin:0 auto;"/>`;
}

/**
 * Generate HTML img tag for logo with CID
 * @param {number} size - Logo size in pixels
 * @returns {string} HTML img tag
 */
function cidLogo(size = 36) {
  return `<img src="${cidSrc('logo')}" alt="Graphos AI Studio" width="${size}" height="${size}" style="display:block;border-radius:10px;"/>`;
}

/**
 * Generate header icon with circular background using CID
 * @param {string} iconName - Icon name
 * @param {string} color - Color variant
 * @param {number} iconSize - Icon size
 * @param {number} circleSize - Circle background size
 * @returns {string} HTML table structure
 */
function cidHeaderIcon(iconName, color = 'black', iconSize = 32, circleSize = 80) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 24px;">
  <tr>
    <td style="width:${circleSize}px;height:${circleSize}px;background-color:#f5f5f7;border-radius:50%;text-align:center;vertical-align:middle;">
      ${cidIcon(iconName, color, iconSize)}
    </td>
  </tr>
</table>`;
}

/**
 * Parse HTML content and extract all CID references
 * @param {string} html - HTML content
 * @returns {Set<string>} Set of CID names found in HTML
 */
function extractCidsFromHtml(html) {
  const cidRegex = /cid:([a-zA-Z0-9_]+)/g;
  const cids = new Set();
  let match;
  while ((match = cidRegex.exec(html)) !== null) {
    cids.add(match[1]);
  }
  return cids;
}

/**
 * Generate nodemailer attachments array for CID images
 * @param {string} html - HTML content with CID references
 * @returns {Array} Array of attachment objects for nodemailer
 */
function generateCidAttachments(html) {
  const cids = extractCidsFromHtml(html);
  const attachments = [];
  
  for (const cid of cids) {
    let filePath;
    
    if (cid === 'logo_content') {
      filePath = path.join(ICONS_DIR, 'content.png');
    } else {
      // Convert CID back to filename (e.g., 'circle_check_black' -> 'circle-check-black.png')
      const fileName = cid.replace(/_/g, '-') + '.png';
      filePath = path.join(ICONS_DIR, fileName);
    }
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      attachments.push({
        filename: path.basename(filePath),
        path: filePath,
        cid: cid,
        contentDisposition: 'inline'
      });
    }
  }
  
  return attachments;
}

/**
 * Get all available icon attachments (for bulk emails)
 * @returns {Array} Array of all icon attachment objects
 */
function getAllIconAttachments() {
  const attachments = [];
  
  // Add logo
  const logoPath = path.join(ICONS_DIR, 'content.png');
  if (fs.existsSync(logoPath)) {
    attachments.push({
      filename: 'content.png',
      path: logoPath,
      cid: 'logo_content',
      contentDisposition: 'inline'
    });
  }
  
  // Add all icons in both colors
  const colors = ['black', 'white'];
  for (const [name, fileName] of Object.entries(ICON_FILES)) {
    if (name === 'logo') continue;
    
    for (const color of colors) {
      const fullFileName = `${fileName}-${color}.png`;
      const filePath = path.join(ICONS_DIR, fullFileName);
      const cid = `${fileName}-${color}`.replace(/-/g, '_');
      
      if (fs.existsSync(filePath)) {
        attachments.push({
          filename: fullFileName,
          path: filePath,
          cid: cid,
          contentDisposition: 'inline'
        });
      }
    }
  }
  
  return attachments;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // CID generation
  getCid,
  cidSrc,
  
  // HTML helpers (CID versions)
  cidIcon,
  cidLogo,
  cidHeaderIcon,
  
  // Attachment generation
  generateCidAttachments,
  getAllIconAttachments,
  extractCidsFromHtml,
  
  // Paths
  getIconPath,
  ICONS_DIR,
  ICON_FILES
};
