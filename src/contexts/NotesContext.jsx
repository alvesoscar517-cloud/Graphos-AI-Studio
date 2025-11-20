import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { loadNotesFromDrive, saveNoteToDrive, deleteNoteFromDrive } from '../services/drive'
import { 
  initDB, 
  getNotesFromDB, 
  saveNotesToDB, 
  saveNoteToDB, 
  deleteNoteFromDB 
} from '../services/indexedDB'

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
  const [notes, setNotes] = useState([])
  const [currentNote, setCurrentNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [needsReauth, setNeedsReauth] = useState(false)
  const saveTimeoutRef = useRef(null)

  // Load notes on mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        // Initialize IndexedDB
        await initDB()

        // First, load from IndexedDB (fast)
        const cachedNotes = await getNotesFromDB()
        if (cachedNotes.length > 0) {
          setNotes(cachedNotes)
          setLoading(false) // Stop loading immediately when we have cached data
          console.log('✅ Loaded notes from IndexedDB:', cachedNotes.length)
        }

        // Then, sync with Drive in background (don't block UI)
        // Check if chrome.storage is available (extension context)
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
          console.log('ℹ️ Not in extension context, skipping Drive sync')
          if (cachedNotes.length === 0) {
            setLoading(false)
          }
          return
        }
        
        const result = await chrome.storage.local.get(['accessToken'])
        if (!result.accessToken) {
          console.log('ℹ️ Not authenticated, skipping Drive sync')
          if (cachedNotes.length === 0) {
            setLoading(false)
          }
          return
        }

        console.log('🔄 Syncing notes from Drive in background...')
        const driveNotes = await loadNotesFromDrive()
        
        // Update state and cache silently
        setNotes(driveNotes)
        await saveNotesToDB(driveNotes)
        
        console.log('✅ Synced notes from Drive:', driveNotes.length)
      } catch (error) {
        console.error('❌ Failed to load notes:', error)
        
        // If need reauth, show message
        if (error.message === 'NEED_REAUTH') {
          console.warn('⚠️ Token does not have Drive permission. User needs to re-authenticate.')
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
          console.log('ℹ️ Not in extension context, skipping auto-save')
          return
        }
        
        const result = await chrome.storage.local.get(['accessToken'])
        if (!result.accessToken) {
          console.log('ℹ️ Not authenticated, skipping auto-save')
          return
        }

        const driveId = await saveNoteToDrive(note)
        
        // Update note with driveId if it's new
        if (!note.driveId && driveId) {
          setNotes(prev => prev.map(n => 
            n.id === note.id ? { ...n, driveId } : n
          ))
        }
        
        console.log('✅ Auto-saved to Drive:', note.title)
      } catch (error) {
        console.error('❌ Auto-save failed:', error)
      }
    }, 2000) // Save after 2 seconds of inactivity
  }

  const createNote = () => {
    const newId = Date.now().toString() // Use timestamp as ID
    
    // Hide oldest visible note if at max
    const visibleNotes = notes.filter(n => n.visible)
    if (visibleNotes.length >= MAX_VISIBLE_NOTES) {
      const oldestVisible = visibleNotes[0]
      setNotes(prev => prev.map(n => 
        n.id === oldestVisible.id ? { ...n, visible: false } : n
      ))
    }
    
    const newNote = {
      id: newId,
      title: 'Untitled',
      content: '',
      visible: true,
      type: 'Chat prompt',
      updated: new Date()
    }
    
    setNotes(prev => [...prev, newNote])
    setCurrentNote(newNote)
    
    // Save to Drive
    autoSave(newNote)
    
    return newNote
  }

  const updateNote = (id, updates) => {
    const updatedNote = notes.find(n => n.id === id)
    if (!updatedNote) return

    const newNote = { ...updatedNote, ...updates, updated: new Date() }
    
    setNotes(prev => prev.map(note => 
      note.id === id ? newNote : note
    ))
    
    if (currentNote && currentNote.id === id) {
      setCurrentNote(newNote)
    }

    // Save to IndexedDB immediately
    saveNoteToDB(newNote).catch(err => console.error('Failed to save to IndexedDB:', err))

    // Auto-save to Drive with debounce
    autoSave(newNote)
  }

  const deleteNote = async (id) => {
    const note = notes.find(n => n.id === id)
    
    setNotes(prev => prev.filter(note => note.id !== id))
    
    if (currentNote && currentNote.id === id) {
      const remaining = notes.filter(n => n.id !== id && n.visible)
      setCurrentNote(remaining.length > 0 ? remaining[0] : null)
    }

    // Delete from IndexedDB
    try {
      await deleteNoteFromDB(id)
      console.log('✅ Deleted from IndexedDB')
    } catch (error) {
      console.error('❌ Failed to delete from IndexedDB:', error)
    }

    // Delete from Drive
    if (note && note.driveId) {
      try {
        await deleteNoteFromDrive(note.driveId)
        console.log('✅ Deleted from Drive')
      } catch (error) {
        console.error('❌ Failed to delete from Drive:', error)
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
      
      console.log('✅ Synced notes from Drive:', driveNotes.length)
      return true
    } catch (error) {
      console.error('❌ Failed to sync notes:', error)
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
      .filter(n => n.visible)
      .slice(-MAX_VISIBLE_NOTES)
      .reverse()
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
    syncNotes
  }

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}
