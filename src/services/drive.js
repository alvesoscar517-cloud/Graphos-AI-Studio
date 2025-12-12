import { logger } from '../utils/logger'
import { CONFIG } from '../utils/config'

let driveFolderId = null

/**
 * Get or create app folder in Google Drive
 */
export async function getOrCreateAppFolder() {
  try {
    // Get access token
    const result = await chrome.storage.local.get(['accessToken'])
    if (!result.accessToken) {
      throw new Error('Not authenticated')
    }

    const token = result.accessToken

    // Check if we already have the folder ID
    const folderResult = await chrome.storage.local.get(['driveFolderId'])
    if (folderResult.driveFolderId) {
      driveFolderId = folderResult.driveFolderId
      return driveFolderId
    }

    // Search for existing folder
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='Graphos AI Studio' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (!searchResponse.ok) {
      // If 403, token doesn't have Drive permission
      if (searchResponse.status === 403) {
        throw new Error('NEED_REAUTH')
      }
      throw new Error(`Failed to search folder: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()

    if (searchData.files && searchData.files.length > 0) {
      // Folder exists
      driveFolderId = searchData.files[0].id
      await chrome.storage.local.set({ driveFolderId })
      return driveFolderId
    }

    // Create new folder
    const createResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Graphos AI Studio',
          mimeType: 'application/vnd.google-apps.folder'
        })
      }
    )

    if (!createResponse.ok) {
      throw new Error(`Failed to create folder: ${createResponse.status}`)
    }

    const createData = await createResponse.json()
    driveFolderId = createData.id
    await chrome.storage.local.set({ driveFolderId })

    return driveFolderId
  } catch (error) {
    logger.error('Drive', 'Error with Drive folder', error)
    throw error
  }
}

/**
 * Sync notes to Google Drive
 */
export async function syncNotesToDrive(notes) {
  try {
    const folderId = await getOrCreateAppFolder()
    const result = await chrome.storage.local.get(['accessToken'])
    const token = result.accessToken

    for (const note of notes) {
      const fileName = `${note.title || 'Untitled'}.txt`
      const content = note.content || ''

      // Check if file exists
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(fileName)}' and '${folderId}' in parents and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const searchData = await searchResponse.json()

      if (searchData.files && searchData.files.length > 0) {
        // Update existing file
        const fileId = searchData.files[0].id
        await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'text/plain'
            },
            body: content
          }
        )
      } else {
        // Create new file
        const metadata = {
          name: fileName,
          mimeType: 'text/plain',
          parents: [folderId]
        }

        const form = new FormData()
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
        form.append('file', new Blob([content], { type: 'text/plain' }))

        await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: form
          }
        )
      }
    }

    return true
  } catch (error) {
    logger.error('Drive', 'Error syncing to Drive', error)
    throw error
  }
}

/**
 * Load notes from Google Drive
 */
export async function loadNotesFromDrive() {
  try {
    const folderId = await getOrCreateAppFolder()
    const result = await chrome.storage.local.get(['accessToken'])
    const token = result.accessToken

    // List all files in folder
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      logger.error('Drive', `Drive API error: ${response.status} ${response.statusText}`)
      
      // If 401 or 403, token doesn't have Drive permission
      if (response.status === 401 || response.status === 403) {
        throw new Error('NEED_REAUTH')
      }
      
      throw new Error(`Failed to list files: ${response.status}`)
    }

    const data = await response.json()
    const notes = []

    // Load content for each file
    for (const file of data.files || []) {
      try {
        const contentResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (contentResponse.ok) {
          const content = await contentResponse.text()
          const title = file.name.replace('.txt', '')
          
          notes.push({
            id: file.id,
            driveId: file.id,
            title: title,
            content: content,
            type: 'Chat prompt',
            updated: new Date(file.modifiedTime),
            visible: notes.length < 5 // First 5 are visible
          })
        }
      } catch (error) {
        logger.error('Drive', `Failed to load file ${file.name}`, error)
      }
    }

    return notes
  } catch (error) {
    logger.error('Drive', 'Error loading notes from Drive', error)
    throw error
  }
}

/**
 * Save single note to Drive
 */
export async function saveNoteToDrive(note) {
  try {
    const folderId = await getOrCreateAppFolder()
    const result = await chrome.storage.local.get(['accessToken'])
    const token = result.accessToken

    const fileName = `${note.title || 'Untitled'}.txt`
    const content = note.content || ''

    // If note has driveId, update it
    if (note.driveId) {
      await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${note.driveId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'text/plain'
          },
          body: content
        }
      )
      
      // Update metadata (name)
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${note.driveId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: fileName })
        }
      )
      
      return note.driveId
    }

    // Create new file
    const metadata = {
      name: fileName,
      mimeType: 'text/plain',
      parents: [folderId]
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', new Blob([content], { type: 'text/plain' }))

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      }
    )

    const data = await response.json()
    return data.id
  } catch (error) {
    logger.error('Drive', 'Error saving note to Drive', error)
    throw error
  }
}

/**
 * Delete note from Drive
 */
export async function deleteNoteFromDrive(driveId) {
  try {
    const result = await chrome.storage.local.get(['accessToken'])
    const token = result.accessToken

    await fetch(
      `https://www.googleapis.com/drive/v3/files/${driveId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    return true
  } catch (error) {
    logger.error('Drive', 'Error deleting note from Drive', error)
    throw error
  }
}

/**
 * Open Drive folder in browser
 */
export async function openDriveFolder(notes) {
  try {
    // Check if user is authenticated
    const result = await chrome.storage.local.get(['accessToken'])
    if (!result.accessToken) {
      throw new Error('Not authenticated')
    }

    const folderId = await getOrCreateAppFolder()

    // Open folder in new tab
    const driveUrl = `https://drive.google.com/drive/folders/${folderId}`
    window.open(driveUrl, '_blank')

    // Sync notes in background
    if (notes && notes.length > 0) {
      syncNotesToDrive(notes).catch(error => {
        logger.error('Drive', 'Failed to sync notes', error)
      })
    }

    return true
  } catch (error) {
    logger.error('Drive', 'Error opening Drive folder', error)
    throw error
  }
}


// ============================================
// WORKSPACE CONVERSATIONS - DRIVE SYNC
// ============================================

const CONVERSATIONS_FOLDER_NAME = 'Graphos AI Workspace'
let conversationsFolderId = null

/**
 * Get or create workspace conversations folder in Google Drive
 */
export async function getOrCreateConversationsFolder() {
  try {
    const result = await chrome.storage.local.get(['accessToken'])
    if (!result.accessToken) {
      throw new Error('Not authenticated')
    }

    const token = result.accessToken

    // Check if we already have the folder ID cached
    const folderResult = await chrome.storage.local.get(['conversationsFolderId'])
    if (folderResult.conversationsFolderId) {
      conversationsFolderId = folderResult.conversationsFolderId
      return conversationsFolderId
    }

    // Search for existing folder
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${CONVERSATIONS_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (!searchResponse.ok) {
      if (searchResponse.status === 403) throw new Error('NEED_REAUTH')
      throw new Error(`Failed to search folder: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()

    if (searchData.files && searchData.files.length > 0) {
      conversationsFolderId = searchData.files[0].id
      await chrome.storage.local.set({ conversationsFolderId })
      return conversationsFolderId
    }

    // Create new folder
    const createResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: CONVERSATIONS_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder'
        })
      }
    )

    if (!createResponse.ok) {
      throw new Error(`Failed to create folder: ${createResponse.status}`)
    }

    const createData = await createResponse.json()
    conversationsFolderId = createData.id
    await chrome.storage.local.set({ conversationsFolderId })

    return conversationsFolderId
  } catch (error) {
    logger.error('Drive', 'Error with Workspace folder', error)
    throw error
  }
}

/**
 * Sync conversations to Google Drive
 * Saves as JSON files to preserve all metadata including summary
 * @param {Array} conversations - Array of conversation objects
 */
export async function syncConversationsToDrive(conversations) {
  try {
    const folderId = await getOrCreateConversationsFolder()
    const result = await chrome.storage.local.get(['accessToken'])
    const token = result.accessToken

    let synced = 0
    
    for (const conv of conversations) {
      // Skip empty conversations
      if (!conv.messages || conv.messages.length === 0) continue
      
      const fileName = `${conv.id}.json`
      
      // Prepare conversation data (exclude large attachments to save space)
      const convData = {
        id: conv.id,
        title: conv.title,
        messages: conv.messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          // Don't sync base64 attachments - too large
          attachments: m.attachments?.map(a => ({
            name: a.name,
            mimeType: a.mimeType,
            // Only keep reference, not actual data
          }))
        })),
        summary: conv.summary, // Important: preserve summary for context
        created: conv.created,
        updated: conv.updated,
        systemPrompt: conv.systemPrompt,
        titleGenerated: conv.titleGenerated,
        userEditedTitle: conv.userEditedTitle
      }

      // Search for existing file
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and '${folderId}' in parents and trashed=false`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const searchData = await searchResponse.json()
      const content = JSON.stringify(convData, null, 2)

      if (searchData.files && searchData.files.length > 0) {
        // Update existing file
        const fileId = searchData.files[0].id
        await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: content
          }
        )
      } else {
        // Create new file
        const metadata = {
          name: fileName,
          mimeType: 'application/json',
          parents: [folderId]
        }

        const form = new FormData()
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
        form.append('file', new Blob([content], { type: 'application/json' }))

        await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form
          }
        )
      }
      
      synced++
    }

    return { synced, total: conversations.length }
  } catch (error) {
    logger.error('Drive', 'Error syncing conversations to Drive', error)
    throw error
  }
}

/**
 * Load conversations from Google Drive
 * @returns {Promise<Array>} - Array of conversation objects
 */
export async function loadConversationsFromDrive() {
  try {
    const folderId = await getOrCreateConversationsFolder()
    const result = await chrome.storage.local.get(['accessToken'])
    const token = result.accessToken

    // List all JSON files in folder
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and mimeType='application/json' and trashed=false&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('NEED_REAUTH')
      }
      throw new Error(`Failed to list files: ${response.status}`)
    }

    const data = await response.json()
    const conversations = []

    // Load content for each file
    for (const file of data.files || []) {
      try {
        const contentResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (contentResponse.ok) {
          const content = await contentResponse.text()
          const conv = JSON.parse(content)
          
          // Ensure dates are Date objects
          conv.created = conv.created ? new Date(conv.created) : new Date(file.modifiedTime)
          conv.updated = conv.updated ? new Date(conv.updated) : new Date(file.modifiedTime)
          conv.driveId = file.id
          
          // Restore message timestamps
          if (conv.messages) {
            conv.messages = conv.messages.map(m => ({
              ...m,
              timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
            }))
          }
          
          conversations.push(conv)
        }
      } catch (error) {
        logger.error('Drive', `Failed to load conversation ${file.name}`, error)
      }
    }

    return conversations
  } catch (error) {
    logger.error('Drive', 'Error loading conversations from Drive', error)
    throw error
  }
}

/**
 * Delete conversation from Drive
 * @param {string} conversationId - Conversation ID
 */
export async function deleteConversationFromDrive(conversationId) {
  try {
    const folderId = await getOrCreateConversationsFolder()
    const result = await chrome.storage.local.get(['accessToken'])
    const token = result.accessToken

    const fileName = `${conversationId}.json`
    
    // Find the file
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and '${folderId}' in parents and trashed=false`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    const searchData = await searchResponse.json()
    
    if (searchData.files && searchData.files.length > 0) {
      const fileId = searchData.files[0].id
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      )
    }

    return true
  } catch (error) {
    logger.error('Drive', 'Error deleting conversation from Drive', error)
    throw error
  }
}

/**
 * Open Workspace folder in Drive
 */
export async function openWorkspaceDriveFolder() {
  try {
    const result = await chrome.storage.local.get(['accessToken'])
    if (!result.accessToken) {
      throw new Error('Not authenticated')
    }

    const folderId = await getOrCreateConversationsFolder()
    const driveUrl = `https://drive.google.com/drive/folders/${folderId}`
    window.open(driveUrl, '_blank')

    return true
  } catch (error) {
    logger.error('Drive', 'Error opening Workspace Drive folder', error)
    throw error
  }
}
