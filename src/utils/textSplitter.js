/**
 * Split text into chunks for profile samples
 * @param {string} text - Text to split
 * @param {object} options - Split options
 * @returns {array} Array of text chunks
 */
export function splitTextIntoChunks(text, options = {}) {
  const {
    minLength = 200,
    maxLength = 2000,
    method = 'paragraph'
  } = options

  if (!text || text.length < minLength) {
    return text ? [text] : []
  }

  if (method === 'paragraph') {
    return splitByParagraph(text, minLength, maxLength)
  } else if (method === 'sentence') {
    return splitBySentence(text, minLength, maxLength)
  } else {
    return splitByLength(text, minLength, maxLength)
  }
}

/**
 * Split by paragraphs (double newline)
 */
function splitByParagraph(text, minLength, maxLength) {
  // Split by double newline or more
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)
  
  const chunks = []
  let currentChunk = ''
  
  for (const para of paragraphs) {
    const trimmedPara = para.trim()
    
    // If paragraph is too long, split it by sentences
    if (trimmedPara.length > maxLength) {
      // Save current chunk if exists
      if (currentChunk.length >= minLength) {
        chunks.push(currentChunk.trim())
        currentChunk = ''
      }
      
      // Split long paragraph by sentences
      const sentences = trimmedPara.match(/[^.!?]+[.!?]+/g) || [trimmedPara]
      for (const sent of sentences) {
        if (currentChunk.length + sent.length > maxLength) {
          if (currentChunk.length >= minLength) {
            chunks.push(currentChunk.trim())
          }
          currentChunk = sent
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sent
        }
      }
    } else {
      // Check if adding this paragraph exceeds maxLength
      if (currentChunk.length + trimmedPara.length > maxLength) {
        // Save current chunk if it meets minLength
        if (currentChunk.length >= minLength) {
          chunks.push(currentChunk.trim())
        }
        currentChunk = trimmedPara
      } else {
        // Add paragraph to current chunk
        currentChunk += (currentChunk ? '\n\n' : '') + trimmedPara
      }
    }
  }
  
  // Add remaining chunk
  if (currentChunk.length >= minLength) {
    chunks.push(currentChunk.trim())
  } else if (currentChunk.length > 0 && chunks.length > 0) {
    // Merge small remaining chunk with last chunk
    chunks[chunks.length - 1] += '\n\n' + currentChunk.trim()
  } else if (currentChunk.length > 0) {
    // If it's the only chunk, keep it even if small
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}

/**
 * Split by sentences
 */
function splitBySentence(text, minLength, maxLength) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  
  const chunks = []
  let currentChunk = ''
  
  for (const sent of sentences) {
    if (currentChunk.length + sent.length > maxLength) {
      if (currentChunk.length >= minLength) {
        chunks.push(currentChunk.trim())
      }
      currentChunk = sent
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sent
    }
  }
  
  if (currentChunk.length >= minLength) {
    chunks.push(currentChunk.trim())
  } else if (currentChunk.length > 0 && chunks.length > 0) {
    chunks[chunks.length - 1] += ' ' + currentChunk.trim()
  } else if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}

/**
 * Split by fixed length
 */
function splitByLength(text, minLength, maxLength) {
  const chunks = []
  
  for (let i = 0; i < text.length; i += maxLength) {
    const chunk = text.substring(i, i + maxLength)
    if (chunk.length >= minLength) {
      chunks.push(chunk.trim())
    }
  }
  
  return chunks
}

/**
 * Validate sample text
 */
export function validateSampleText(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Invalid text' }
  }
  
  if (text.length < 50) {
    return { valid: false, error: 'Text too short (minimum 50 characters)' }
  }
  
  if (text.length > 20000) {
    return { valid: false, error: 'Text too long (maximum 20,000 characters)' }
  }
  
  const words = text.split(/\s+/)
  if (words.length < 10) {
    return { valid: false, error: 'Text must have at least 10 words' }
  }
  
  // Check if too repetitive
  const uniqueWords = new Set(words.map(w => w.toLowerCase()))
  const diversity = uniqueWords.size / words.length
  if (diversity < 0.2) {
    return { valid: false, error: 'Text too repetitive, needs more variety' }
  }
  
  return { valid: true }
}
