/**
 * Multimodal Helper
 * Handles image and file processing for Gemini Vision
 */

const { getVertexAI } = require('../config/gemini');
const path = require('path');

const vertexAI = getVertexAI();

// Supported image types
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

// Supported document types for text extraction
const SUPPORTED_DOC_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json'
];

// Max file sizes (in bytes)
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Check if file type is supported for multimodal
 * @param {string} mimeType - MIME type of file
 * @returns {Object} - { supported, type }
 */
function checkFileSupport(mimeType) {
  if (SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
    return { supported: true, type: 'image' };
  }
  if (SUPPORTED_DOC_TYPES.includes(mimeType)) {
    return { supported: true, type: 'document' };
  }
  return { supported: false, type: null };
}

/**
 * Convert base64 image to Gemini format
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} mimeType - MIME type
 * @returns {Object} - Gemini image part
 */
function createImagePart(base64Data, mimeType) {
  // Remove data URL prefix if present
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  
  return {
    inlineData: {
      mimeType: mimeType,
      data: cleanBase64
    }
  };
}

/**
 * Process attachments for Gemini multimodal request
 * @param {Array} attachments - Array of attachment objects
 * @returns {Promise<Array>} - Array of Gemini content parts
 */
async function processAttachments(attachments) {
  if (!attachments || attachments.length === 0) {
    return [];
  }
  
  const parts = [];
  
  for (const attachment of attachments) {
    const { supported, type } = checkFileSupport(attachment.mimeType || attachment.type);
    
    if (!supported) {
      console.warn(`[WARN] Unsupported file type: ${attachment.mimeType || attachment.type}`);
      continue;
    }
    
    if (type === 'image') {
      // Check size
      if (attachment.size && attachment.size > MAX_IMAGE_SIZE) {
        console.warn(`[WARN] Image too large: ${attachment.size} bytes`);
        continue;
      }
      
      if (attachment.base64) {
        parts.push(createImagePart(attachment.base64, attachment.mimeType || attachment.type));
      } else if (attachment.data) {
        // If data is a Buffer, convert to base64
        const base64 = Buffer.isBuffer(attachment.data) 
          ? attachment.data.toString('base64')
          : attachment.data;
        parts.push(createImagePart(base64, attachment.mimeType || attachment.type));
      }
    } else if (type === 'document') {
      // For documents, extract text content
      if (attachment.text || attachment.content) {
        parts.push({
          text: `[Document: ${attachment.name || 'file'}]\n${attachment.text || attachment.content}`
        });
      }
    }
  }
  
  return parts;
}

/**
 * Build multimodal message content
 * @param {string} textContent - Text message
 * @param {Array} attachments - Attachments array
 * @returns {Promise<Array>} - Content parts for Gemini
 */
async function buildMultimodalContent(textContent, attachments) {
  const parts = [];
  
  // Process attachments first
  const attachmentParts = await processAttachments(attachments);
  parts.push(...attachmentParts);
  
  // Add text content
  if (textContent) {
    parts.push({ text: textContent });
  }
  
  return parts;
}

/**
 * Analyze image with Gemini Vision
 * @param {string} base64Image - Base64 encoded image
 * @param {string} mimeType - Image MIME type
 * @param {string} prompt - Analysis prompt
 * @returns {Promise<string>} - Analysis result
 */
async function analyzeImage(base64Image, mimeType, prompt = 'Describe this image in detail.') {
  try {
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024
      }
    });
    
    const imagePart = createImagePart(base64Image, mimeType);
    
    const result = await model.generateContent([
      imagePart,
      { text: prompt }
    ]);
    
    return result.response.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('[ERROR] Image analysis failed:', error.message);
    throw error;
  }
}

/**
 * Extract text from image (OCR)
 * @param {string} base64Image - Base64 encoded image
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromImage(base64Image, mimeType) {
  return analyzeImage(
    base64Image,
    mimeType,
    'Extract and return all text visible in this image. If no text is found, respond with "No text found."'
  );
}

/**
 * Check if message has multimodal content
 * @param {Object} message - Message object
 * @returns {boolean}
 */
function hasMultimodalContent(message) {
  return message.attachments && 
         message.attachments.length > 0 && 
         message.attachments.some(a => {
           const { supported } = checkFileSupport(a.mimeType || a.type);
           return supported;
         });
}

module.exports = {
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_DOC_TYPES,
  MAX_IMAGE_SIZE,
  MAX_DOC_SIZE,
  checkFileSupport,
  createImagePart,
  processAttachments,
  buildMultimodalContent,
  analyzeImage,
  extractTextFromImage,
  hasMultimodalContent
};
