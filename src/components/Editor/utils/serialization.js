/**
 * Serialization utilities for Tiptap editor
 * Converts between Tiptap JSON document and plain text
 */

/**
 * Extract text from node content recursively
 * @param {Array} content - Node content array
 * @returns {string} Extracted text
 */
function extractTextFromContent(content) {
  if (!content) return ''
  
  return content
    .map(child => {
      if (child.type === 'text') {
        return child.text || ''
      }
      if (child.type === 'hardBreak') {
        return '\n'
      }
      return ''
    })
    .join('')
}

/**
 * Serialize Tiptap document to plain text
 * @param {Object} doc - Tiptap JSON document
 * @returns {string} Plain text with paragraph breaks
 */
export function serializeToPlainText(doc) {
  if (!doc || !doc.content) {
    return ''
  }

  return doc.content
    .map(node => {
      // Handle different block types
      switch (node.type) {
        case 'paragraph':
        case 'heading':
          return extractTextFromContent(node.content)
        
        case 'bulletList':
        case 'orderedList':
          if (!node.content) return ''
          return node.content
            .map(listItem => {
              if (listItem.type === 'listItem' && listItem.content) {
                return listItem.content
                  .map(p => extractTextFromContent(p.content))
                  .join('\n')
              }
              return ''
            })
            .join('\n')
        
        case 'blockquote':
          if (!node.content) return ''
          return node.content
            .map(p => extractTextFromContent(p.content))
            .join('\n')
        
        case 'codeBlock':
          return extractTextFromContent(node.content)
        
        case 'horizontalRule':
          return '---'
        
        default:
          return extractTextFromContent(node.content)
      }
    })
    .join('\n\n')
}

/**
 * Parse plain text into Tiptap document structure
 * @param {string} text - Plain text input
 * @returns {Object} Tiptap JSON document
 */
export function parseFromPlainText(text) {
  if (!text || typeof text !== 'string') {
    return {
      type: 'doc',
      content: [{ type: 'paragraph', content: [] }]
    }
  }

  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/)

  const content = paragraphs.map(paragraph => {
    if (!paragraph) {
      return { type: 'paragraph', content: [] }
    }

    // Handle single newlines within paragraphs as hard breaks
    const parts = paragraph.split('\n')
    const paragraphContent = []

    parts.forEach((part, index) => {
      if (part) {
        paragraphContent.push({ type: 'text', text: part })
      }
      // Add hard break between parts (not after last)
      if (index < parts.length - 1) {
        paragraphContent.push({ type: 'hardBreak' })
      }
    })

    return {
      type: 'paragraph',
      content: paragraphContent.length > 0 ? paragraphContent : []
    }
  })

  // Ensure at least one paragraph
  if (content.length === 0) {
    content.push({ type: 'paragraph', content: [] })
  }

  return {
    type: 'doc',
    content
  }
}

/**
 * Get plain text from editor instance
 * @param {Object} editor - Tiptap editor instance
 * @returns {string} Plain text content
 */
export function getPlainText(editor) {
  if (!editor) return ''
  return serializeToPlainText(editor.getJSON())
}

/**
 * Set content from plain text
 * @param {Object} editor - Tiptap editor instance
 * @param {string} text - Plain text to set
 */
export function setPlainText(editor, text) {
  if (!editor) return
  const doc = parseFromPlainText(text)
  editor.commands.setContent(doc)
}
