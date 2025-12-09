import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

/**
 * StreamingExtension - Handles streaming text from AI responses
 * Provides commands for starting, appending, ending, and aborting streams
 */

const streamingPluginKey = new PluginKey('streaming')

const StreamingExtension = Extension.create({
  name: 'streaming',

  addOptions() {
    return {
      onStreamStart: null,
      onStreamEnd: null,
      onStreamAbort: null,
    }
  },

  addStorage() {
    return {
      isStreaming: false,
      originalContent: null,
      streamBuffer: '',
    }
  },

  addCommands() {
    return {
      /**
       * Start streaming - clears content and locks editor
       */
      startStreaming: () => ({ editor, tr }) => {
        // Save original content for potential abort
        this.storage.originalContent = editor.getJSON()
        this.storage.isStreaming = true
        this.storage.streamBuffer = ''
        
        // Clear editor content
        editor.commands.setContent({ type: 'doc', content: [{ type: 'paragraph' }] })
        
        // Lock editor
        editor.setEditable(false)
        
        // Notify callback
        this.options.onStreamStart?.()
        
        // Update plugin state
        editor.view.dispatch(tr.setMeta(streamingPluginKey, { streaming: true }))
        
        return true
      },

      /**
       * Append text chunk to stream buffer
       */
      appendStreamChunk: (chunk) => ({ editor }) => {
        if (!this.storage.isStreaming) return false
        
        this.storage.streamBuffer += chunk
        
        // Update editor content with current buffer
        const content = this.storage.streamBuffer
        editor.commands.setContent(content, false, { preserveWhitespace: 'full' })
        
        // Move cursor to end
        editor.commands.focus('end')
        
        return true
      },

      /**
       * End streaming - unlock editor and finalize content
       */
      endStreaming: () => ({ editor, tr, chain }) => {
        if (!this.storage.isStreaming) return false
        
        this.storage.isStreaming = false
        
        // Unlock editor
        editor.setEditable(true)
        
        // Focus at end
        editor.commands.focus('end')
        
        // Notify callback
        this.options.onStreamEnd?.()
        
        // Update plugin state
        editor.view.dispatch(tr.setMeta(streamingPluginKey, { streaming: false }))
        
        // Clear storage
        this.storage.originalContent = null
        this.storage.streamBuffer = ''
        
        return true
      },

      /**
       * Abort streaming - restore original content
       */
      abortStreaming: () => ({ editor, tr }) => {
        if (!this.storage.isStreaming) return false
        
        this.storage.isStreaming = false
        
        // Restore original content
        if (this.storage.originalContent) {
          editor.commands.setContent(this.storage.originalContent)
        }
        
        // Unlock editor
        editor.setEditable(true)
        
        // Notify callback
        this.options.onStreamAbort?.()
        
        // Update plugin state
        editor.view.dispatch(tr.setMeta(streamingPluginKey, { streaming: false }))
        
        // Clear storage
        this.storage.originalContent = null
        this.storage.streamBuffer = ''
        
        return true
      },

      /**
       * Check if currently streaming
       */
      isStreaming: () => () => {
        return this.storage.isStreaming
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: streamingPluginKey,
        state: {
          init() {
            return { streaming: false }
          },
          apply(tr, value) {
            const meta = tr.getMeta(streamingPluginKey)
            if (meta !== undefined) {
              return { streaming: meta.streaming }
            }
            return value
          },
        },
      }),
    ]
  },
})

export default StreamingExtension
