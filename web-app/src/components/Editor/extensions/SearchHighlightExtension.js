import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

/**
 * SearchHighlightExtension - Highlights search matches using ProseMirror decorations
 * This is the proper way to highlight text in Tiptap/ProseMirror
 * 
 * Commands:
 * - setSearchTerm(term: string) - Set the search term and highlight matches
 * - setSearchIndex(index: number) - Set the current match index
 * - clearSearch() - Clear all search highlights
 * 
 * Storage:
 * - searchTerm: string - Current search term
 * - currentIndex: number - Current match index
 * - results: Array<{from, to, index}> - All match positions
 */

const searchHighlightPluginKey = new PluginKey('searchHighlight')

const SearchHighlightExtension = Extension.create({
  name: 'searchHighlight',

  addOptions() {
    return {
      highlightClass: 'search-highlight',
      currentHighlightClass: 'search-highlight-current',
    }
  },

  addStorage() {
    return {
      searchTerm: '',
      currentIndex: 0,
      results: [],
    }
  },

  addCommands() {
    const extensionThis = this
    return {
      setSearchTerm: (searchTerm) => ({ view }) => {
        extensionThis.storage.searchTerm = searchTerm
        // Force view update by dispatching empty transaction with metadata
        const tr = view.state.tr.setMeta(searchHighlightPluginKey, { searchTerm })
        view.dispatch(tr)
        return true
      },
      setSearchIndex: (index) => ({ view }) => {
        extensionThis.storage.currentIndex = index
        const tr = view.state.tr.setMeta(searchHighlightPluginKey, { currentIndex: index })
        view.dispatch(tr)
        return true
      },
      clearSearch: () => ({ view }) => {
        extensionThis.storage.searchTerm = ''
        extensionThis.storage.currentIndex = 0
        extensionThis.storage.results = []
        const tr = view.state.tr.setMeta(searchHighlightPluginKey, { clear: true })
        view.dispatch(tr)
        return true
      },
    }
  },

  addProseMirrorPlugins() {
    const extensionThis = this

    return [
      new Plugin({
        key: searchHighlightPluginKey,
        state: {
          init() {
            return DecorationSet.empty
          },
          apply(tr, oldDecorations, oldState, newState) {
            // Check if this is a search-related update
            const meta = tr.getMeta(searchHighlightPluginKey)
            const docChanged = tr.docChanged
            
            // Only recalculate if search changed or document changed
            if (!meta && !docChanged) {
              return oldDecorations.map(tr.mapping, tr.doc)
            }

            const searchTerm = extensionThis.storage.searchTerm
            const currentIndex = extensionThis.storage.currentIndex

            if (!searchTerm || searchTerm.trim() === '') {
              extensionThis.storage.results = []
              return DecorationSet.empty
            }

            const decorations = []
            const results = []
            const searchLower = searchTerm.toLowerCase()

            // Traverse document and find matches
            newState.doc.descendants((node, pos) => {
              if (!node.isText) return

              const text = node.text || ''
              const textLower = text.toLowerCase()
              let idx = 0

              while ((idx = textLower.indexOf(searchLower, idx)) !== -1) {
                const from = pos + idx
                const to = from + searchTerm.length

                results.push({ from, to, index: results.length })

                const isCurrentMatch = results.length - 1 === currentIndex
                const className = isCurrentMatch
                  ? `${extensionThis.options.highlightClass} ${extensionThis.options.currentHighlightClass}`
                  : extensionThis.options.highlightClass

                decorations.push(
                  Decoration.inline(from, to, {
                    class: className,
                  })
                )

                idx += 1
              }
            })

            extensionThis.storage.results = results
            return DecorationSet.create(newState.doc, decorations)
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})

export default SearchHighlightExtension
export { searchHighlightPluginKey }
