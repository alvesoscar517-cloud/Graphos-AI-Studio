import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { loadNotesFromDrive, saveNoteToDrive, deleteNoteFromDrive } from '../services/drive'
import { 
  initDB, 
  getNotesFromDB, 
  saveNotesToDB, 
  saveNoteToDB, 
  deleteNoteFromDB,
  clearNotesDB
} from '../services/indexedDB'
import { useAuth } from './AuthContext'

const NotesContext = createContext()

export const useNotes = () => {
  const context = useContext(NotesContext)
  if (!context) {
    throw new Error('useNotes must be used within NotesProvider')
  }
  return context
}

const MAX_VISIBLE_NOTES = 5

export const NotesProvider = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [notes, setNotes] = useState([])
  const [currentNote, setCurrentNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [needsReauth, setNeedsReauth] = useState(false)
  const saveTimeoutRef = useRef(null)
  const prevUserRef = useRef(null)

  // Clear notes when user changes or logs out
  useEffect(() => {
    if (authLoading) return

    const prevUser = prevUserRef.current
    const currentUserId = user?.email || user?.id
    const prevUserId = prevUser?.email || prevUser?.id

    // Detect user change
    if (prevUserId && prevUserId !== currentUserId) {
      console.log('[SECURITY] User changed, clearing notes data...')
      setNotes([])
      setCurrentNote(null)
      setNeedsReauth(false)
    }

    // User logged out
    if (!isAuthenticated && prevUser) {
      console.log('[INFO] User logged out, clearing notes')
      setNotes([])
      setCurrentNote(null)
      setNeedsReauth(false)
    }

    prevUserRef.current = user
  }, [user, isAuthenticated, authLoading])

  // Load notes on mount or when user changes
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      setLoading(false)
      return
    }
    const loadNotes = async () => {
      try {
        // Initialize IndexedDB
        await initDB()

        // First, load from IndexedDB (fast)
        let cachedNotes = await getNotesFromDB()
        
        // Migration: Remove visible flag from old notes (no longer needed)
        if (cachedNotes.length > 0) {
          cachedNotes = cachedNotes.map(note => {
            const { visible, ...rest } = note
            return rest
          })
          
          setNotes(cachedNotes)
          setLoading(false) // Stop loading immediately when we have cached data
          console.log('[SUCCESS] Loaded notes from IndexedDB:', cachedNotes.length)
        }

        // Then, sync with Drive in background (don't block UI)
        // Check if chrome.storage is available (extension context)
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
          console.log('[INFO] Not in extension context, skipping Drive sync')
          if (cachedNotes.length === 0) {
            setLoading(false)
          }
          return
        }
        
        const result = await chrome.storage.local.get(['accessToken'])
        if (!result.accessToken) {
          console.log('[INFO] Not authenticated, skipping Drive sync')
          if (cachedNotes.length === 0) {
            setLoading(false)
          }
          return
        }

        console.log('[SYNC] Syncing notes from Drive in background...')
        let driveNotes = await loadNotesFromDrive()
        
        // Migration: Remove visible flag from old notes
        driveNotes = driveNotes.map(note => {
          const { visible, ...rest } = note
          return rest
        })
        
        // Update state and cache silently
        setNotes(driveNotes)
        await saveNotesToDB(driveNotes)
        
        console.log('[SUCCESS] Synced notes from Drive:', driveNotes.length)
      } catch (error) {
        console.error('[FAIL] Failed to load notes:', error)
        
        // If need reauth, show message
        if (error.message === 'NEED_REAUTH') {
          console.warn('[WARNING] Token does not have Drive permission. User needs to re-authenticate.')
          setNeedsReauth(true)
        }
      } finally {
        // Only set loading to false if we haven't already
        setLoading(false)
      }
    }

    loadNotes()
  }, [])

  // Auto-save to Drive with debounce
  const autoSave = async (note) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Check if chrome.storage is available
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
          console.log('[INFO] Not in extension context, skipping auto-save')
          return
        }
        
        const result = await chrome.storage.local.get(['accessToken'])
        if (!result.accessToken) {
          console.log('[INFO] Not authenticated, skipping auto-save')
          return
        }

        const driveId = await saveNoteToDrive(note)
        
        // Update note with driveId if it's new
        if (!note.driveId && driveId) {
          setNotes(prev => prev.map(n => 
            n.id === note.id ? { ...n, driveId } : n
          ))
        }
        
        console.log('[SUCCESS] Auto-saved to Drive:', note.title)
      } catch (error) {
        console.error('[FAIL] Auto-save failed:', error)
      }
    }, 2000) // Save after 2 seconds of inactivity
  }

  // Check if a note has meaningful content
  const hasContent = (note) => {
    if (!note) return false
    const content = note.content?.trim() || ''
    const title = note.title?.trim() || ''
    // Note has content if it has non-empty content OR a custom title (not Untitled)
    return content.length > 0 || (title.length > 0 && title !== 'Untitled')
  }

  // Clean up empty notes (notes without content)
  const cleanupEmptyNotes = async () => {
    const emptyNotes = notes.filter(n => !hasContent(n))
    
    for (const note of emptyNotes) {
      // Don't delete current note being edited
      if (currentNote?.id === note.id) continue
      
      console.log('🧹 Removing empty note:', note.id)
      
      // Remove from state
      setNotes(prev => prev.filter(n => n.id !== note.id))
      
      // Delete from IndexedDB
      try {
        await deleteNoteFromDB(note.id)
      } catch (err) {
        console.error('Failed to delete empty note from IndexedDB:', err)
      }
      
      // Delete from Drive if exists
      if (note.driveId) {
        try {
          await deleteNoteFromDrive(note.driveId)
        } catch (err) {
          console.error('Failed to delete empty note from Drive:', err)
        }
      }
    }
    
    if (emptyNotes.length > 0) {
      console.log(`[SUCCESS] Cleaned up ${emptyNotes.length} empty notes`)
    }
  }

  const createNote = () => {
    // Clean up any existing empty notes before creating new one
    cleanupEmptyNotes()
    
    const newId = Date.now().toString() // Use timestamp as ID
    
    const newNote = {
      id: newId,
      title: 'Untitled',
      content: '',
      type: 'Chat prompt',
      updated: new Date(),
      titleGenerated: false, // Track if title was auto-generated
      userEditedTitle: false // Track if user manually edited title
    }
    
    setNotes(prev => [...prev, newNote])
    setCurrentNote(newNote)
    
    // Don't auto-save empty notes to Drive - will save when content is added
    
    return newNote
  }

  const updateNote = (id, updates, isUserTitleEdit = false) => {
    const updatedNote = notes.find(n => n.id === id)
    if (!updatedNote) return

    // If user is editing title, mark it
    const titleUpdates = isUserTitleEdit ? { userEditedTitle: true } : {}
    const newNote = { ...updatedNote, ...updates, ...titleUpdates, updated: new Date() }
    
    setNotes(prev => prev.map(note => 
      note.id === id ? newNote : note
    ))
    
    if (currentNote && currentNote.id === id) {
      setCurrentNote(newNote)
    }

    // Only save if note has content
    if (hasContent(newNote)) {
      // Save to IndexedDB immediately
      saveNoteToDB(newNote).catch(err => console.error('Failed to save to IndexedDB:', err))

      // Auto-save to Drive with debounce
      autoSave(newNote)
    }
  }

  const deleteNote = async (id) => {
    const note = notes.find(n => n.id === id)
    
    setNotes(prev => prev.filter(note => note.id !== id))
    
    if (currentNote && currentNote.id === id) {
      const remaining = notes.filter(n => n.id !== id && hasContent(n))
      setCurrentNote(remaining.length > 0 ? remaining[0] : null)
    }

    // Delete from IndexedDB
    try {
      await deleteNoteFromDB(id)
      console.log('[SUCCESS] Deleted from IndexedDB')
    } catch (error) {
      console.error('[FAIL] Failed to delete from IndexedDB:', error)
    }

    // Delete from Drive
    if (note && note.driveId) {
      try {
        await deleteNoteFromDrive(note.driveId)
        console.log('[SUCCESS] Deleted from Drive')
      } catch (error) {
        console.error('[FAIL] Failed to delete from Drive:', error)
      }
    }
  }

  const syncNotes = async () => {
    try {
      setLoading(true)
      const driveNotes = await loadNotesFromDrive()
      setNotes(driveNotes)
      
      // Update IndexedDB cache
      await saveNotesToDB(driveNotes)
      
      console.log('[SUCCESS] Synced notes from Drive:', driveNotes.length)
      return true
    } catch (error) {
      console.error('[FAIL] Failed to sync notes:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loadNote = (id) => {
    const note = notes.find(n => n.id === id)
    if (note) {
      setCurrentNote(note)
    }
  }

  const getVisibleNotes = () => {
    return notes
      .filter(n => hasContent(n)) // Show all notes with content, ignore visible flag
      .sort((a, b) => new Date(b.updated) - new Date(a.updated)) // Sort by most recent
      .slice(0, MAX_VISIBLE_NOTES) // Take top 5 most recent
  }

  // Utility: Truncate title to max 7 words
  const truncateTitleToWords = (title, maxWords = 7) => {
    if (!title) return title
    const words = title.trim().split(/\s+/)
    if (words.length <= maxWords) return title
    return words.slice(0, maxWords).join(' ') + '...'
  }

  const generateTitle = async (content) => {
    try {
      // Extract first meaningful sentence or paragraph (limit to reduce token cost)
      const firstPart = content.trim().substring(0, 150)
      
      const response = await fetch('https://ai-authenticator-472729326429.us-central1.run.app/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Create a short title (maximum 7 words) for the following content. ONLY return the title, no explanation: "${firstPart}"`
          }],
          systemPrompt: 'You are a title generation assistant. Only return a short title of maximum 7 words, no explanation, no quotes.',
          model: 'gemini-2.0-flash-lite', // Use lite model for cost efficiency
          temperature: 0.2,
          maxTokens: 30 // Limit output tokens for efficiency
        })
      })

      if (response.ok) {
        const data = await response.json()
        let title = data.message.trim().replace(/^["']|["']$/g, '') // Remove quotes
        // Enforce 7 word limit
        return truncateTitleToWords(title, 7)
      }
    } catch (err) {
      console.error('Failed to generate title:', err)
    }
    
    // Fallback: Extract first sentence or truncate
    const firstSentence = content.split(/[.!?。]/)[0]?.trim() || content
    return truncateTitleToWords(firstSentence, 7)
  }

  const value = {
    notes,
    currentNote,
    loading,
    needsReauth,
    createNote,
    updateNote,
    deleteNote,
    loadNote,
    getVisibleNotes,
    syncNotes,
    generateTitle
  }

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}
