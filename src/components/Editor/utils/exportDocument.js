/**
 * Export utilities for Tiptap editor
 * Supports export to .docx (Word) and .pdf
 */

/**
 * Export editor content to .docx file
 * Requires: npm install docx file-saver
 * 
 * @param {Object} editor - Tiptap editor instance
 * @param {string} filename - Output filename (without extension)
 * @param {Object} options - Export options
 */
export async function exportToDocx(editor, filename = 'document', options = {}) {
  if (!editor) {
    console.error('Editor instance is required')
    return
  }

  try {
    // Dynamic import to avoid bundling if not used
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx')
    const { saveAs } = await import('file-saver')

    const json = editor.getJSON()
    const children = []

    // Convert Tiptap JSON to docx paragraphs
    const processNode = (node) => {
      if (node.type === 'paragraph') {
        const textRuns = []
        
        if (node.content) {
          node.content.forEach(child => {
            if (child.type === 'text') {
              const runOptions = { text: child.text }
              
              // Apply marks (formatting)
              if (child.marks) {
                child.marks.forEach(mark => {
                  switch (mark.type) {
                    case 'bold':
                      runOptions.bold = true
                      break
                    case 'italic':
                      runOptions.italics = true
                      break
                    case 'underline':
                      runOptions.underline = {}
                      break
                    case 'strike':
                      runOptions.strike = true
                      break
                    case 'textStyle':
                      if (mark.attrs?.color) {
                        runOptions.color = mark.attrs.color.replace('#', '')
                      }
                      break
                  }
                })
              }
              
              textRuns.push(new TextRun(runOptions))
            }
          })
        }

        // Handle text alignment
        let alignment = AlignmentType.LEFT
        if (node.attrs?.textAlign) {
          switch (node.attrs.textAlign) {
            case 'center':
              alignment = AlignmentType.CENTER
              break
            case 'right':
              alignment = AlignmentType.RIGHT
              break
            case 'justify':
              alignment = AlignmentType.JUSTIFIED
              break
          }
        }

        children.push(new Paragraph({
          children: textRuns.length > 0 ? textRuns : [new TextRun('')],
          alignment,
        }))
      } 
      else if (node.type === 'heading') {
        const level = node.attrs?.level || 1
        const headingLevels = {
          1: HeadingLevel.HEADING_1,
          2: HeadingLevel.HEADING_2,
          3: HeadingLevel.HEADING_3,
          4: HeadingLevel.HEADING_4,
        }

        const textRuns = []
        if (node.content) {
          node.content.forEach(child => {
            if (child.type === 'text') {
              textRuns.push(new TextRun({ text: child.text, bold: true }))
            }
          })
        }

        children.push(new Paragraph({
          children: textRuns,
          heading: headingLevels[level] || HeadingLevel.HEADING_1,
        }))
      }
      else if (node.type === 'bulletList' || node.type === 'orderedList') {
        // Handle lists
        if (node.content) {
          node.content.forEach((listItem, index) => {
            if (listItem.content) {
              listItem.content.forEach(para => {
                const textRuns = []
                if (para.content) {
                  para.content.forEach(child => {
                    if (child.type === 'text') {
                      textRuns.push(new TextRun({ text: child.text }))
                    }
                  })
                }
                
                const bullet = node.type === 'bulletList' ? '• ' : `${index + 1}. `
                children.push(new Paragraph({
                  children: [new TextRun(bullet), ...textRuns],
                  indent: { left: 720 }, // 0.5 inch indent
                }))
              })
            }
          })
        }
      }
      else if (node.type === 'blockquote') {
        if (node.content) {
          node.content.forEach(child => {
            processNode(child)
          })
        }
      }
    }

    // Process all nodes
    if (json.content) {
      json.content.forEach(node => processNode(node))
    }

    // Create document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              width: 12240, // A4 width in twips (8.5 inches)
              height: 15840, // A4 height in twips (11 inches)
            },
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: children.length > 0 ? children : [new Paragraph({ children: [new TextRun('')] })],
      }],
      ...options,
    })

    // Generate and save
    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${filename}.docx`)
    
    return true
  } catch (error) {
    console.error('Export to DOCX failed:', error)
    
    // Check if it's a missing dependency error
    if (error.message?.includes('Cannot find module') || error.code === 'MODULE_NOT_FOUND') {
      console.error('Please install required packages: npm install docx file-saver')
    }
    
    throw error
  }
}

/**
 * Export editor content to PDF using browser print
 * 
 * @param {Object} editor - Tiptap editor instance  
 * @param {string} filename - Output filename
 */
export function exportToPdf(editor, filename = 'document') {
  if (!editor) {
    console.error('Editor instance is required')
    return
  }

  // Create a print-friendly version
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to export PDF')
    return
  }

  const html = editor.getHTML()
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        @page {
          size: A4;
          margin: 25mm;
        }
        body {
          font-family: 'Times New Roman', Georgia, serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
          max-width: 100%;
          margin: 0;
          padding: 0;
        }
        h1 { font-size: 24pt; margin: 24pt 0 12pt 0; }
        h2 { font-size: 18pt; margin: 18pt 0 9pt 0; }
        h3 { font-size: 14pt; margin: 14pt 0 7pt 0; }
        h4 { font-size: 12pt; margin: 12pt 0 6pt 0; font-weight: bold; }
        p { margin: 0 0 12pt 0; }
        ul, ol { margin: 12pt 0; padding-left: 24pt; }
        li { margin: 6pt 0; }
        blockquote {
          border-left: 3pt solid #ccc;
          padding-left: 12pt;
          margin: 12pt 0;
          font-style: italic;
        }
        code {
          font-family: 'Courier New', monospace;
          background: #f5f5f5;
          padding: 2pt 4pt;
        }
        pre {
          background: #f5f5f5;
          padding: 12pt;
          overflow-x: auto;
        }
        a { color: #0066cc; }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `)
  
  printWindow.document.close()
  
  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print()
    // Close after print dialog
    printWindow.onafterprint = () => printWindow.close()
  }
}

/**
 * Export editor content to HTML file
 * 
 * @param {Object} editor - Tiptap editor instance
 * @param {string} filename - Output filename
 */
export function exportToHtml(editor, filename = 'document') {
  if (!editor) {
    console.error('Editor instance is required')
    return
  }

  const html = editor.getHTML()
  
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    body {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 12pt;
      line-height: 1.5;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      color: #333;
    }
    h1, h2, h3, h4 { margin-top: 1.5em; margin-bottom: 0.5em; }
    p { margin: 0 0 1em 0; }
    ul, ol { margin: 1em 0; }
    blockquote {
      border-left: 3px solid #ccc;
      padding-left: 1em;
      margin: 1em 0;
      font-style: italic;
      color: #666;
    }
    code {
      background: #f5f5f5;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: monospace;
    }
    pre {
      background: #f5f5f5;
      padding: 1em;
      border-radius: 5px;
      overflow-x: auto;
    }
    a { color: #0066cc; }
  </style>
</head>
<body>
${html}
</body>
</html>`

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.html`
  a.click()
  
  URL.revokeObjectURL(url)
}
