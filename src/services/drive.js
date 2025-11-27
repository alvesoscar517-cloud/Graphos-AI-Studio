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
      `https://www.googleapis.com/drive/v3/files?q=name='AI Content Authenticator' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
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
          name: 'AI Content Authenticator',
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

    console.log('[SUCCESS] Created Drive folder:', driveFolderId)
    return driveFolderId
  } catch (error) {
    console.error('[FAIL] Error with Drive folder:', error)
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

    console.log('[SUCCESS] Notes synced to Drive')
    return true
  } catch (error) {
    console.error('[FAIL] Error syncing to Drive:', error)
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

    console.log('📋 Loading notes from Drive folder:', folderId)

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
      console.error('[FAIL] Drive API error:', response.status, response.statusText)
      
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
        console.error(`[FAIL] Failed to load file ${file.name}:`, error)
      }
    }

    console.log('[SUCCESS] Loaded notes from Drive:', notes.length)
    return notes
  } catch (error) {
    console.error('[FAIL] Error loading notes from Drive:', error)
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
      
      console.log('[SUCCESS] Updated note in Drive:', fileName)
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
    console.log('[SUCCESS] Created note in Drive:', fileName)
    return data.id
  } catch (error) {
    console.error('[FAIL] Error saving note to Drive:', error)
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

    console.log('[SUCCESS] Deleted note from Drive')
    return true
  } catch (error) {
    console.error('[FAIL] Error deleting note from Drive:', error)
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
        console.error('[FAIL] Failed to sync notes:', error)
      })
    }

    return true
  } catch (error) {
    console.error('[FAIL] Error opening Drive folder:', error)
    throw error
  }
}
