import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

/**
 * DeviationHighlightExtension - Highlights deviation sentences using ProseMirror decorations
 * This applies highlights directly to text, so they scroll with content
 * 
 * Commands:
 * - setDeviationAnalysis(analysis, dismissedSet) - Set analysis data and update highlights
 * - clearDeviationHighlights() - Clear all deviation highlights
 * - dismissDeviation(sentence) - Dismiss a specific sentence
 * 
 * Storage:
 * - analysis: object - Current analysis data
 * - dismissedSentences: Set - Dismissed sentence texts
 * - highlights: Array - Parsed highlight data
 */

export const deviationHighlightPluginKey = new PluginKey('deviationHighlight')

const DeviationHighlightExtension = Extension.create({
  name: 'deviationHighlight',

  addOptions() {
    return {
      showHighlights: true,
      onHighlightClick: null, // Callback when highlight is clicked
    }
  },

  addStorage() {
    return {
      analysis: null,
      dismissedSentences: new Set(),
      highlights: [],
      showHighlights: true,
    }
  },

  addCommands() {
    const extensionThis = this
    return {
      setDeviationAnalysis: (analysis, dismissedSet = new Set()) => ({ view }) => {
        extensionThis.storage.analysis = analysis
        extensionThis.storage.dismissedSentences = dismissedSet
        // Force view update
        const tr = view.state.tr.setMeta(deviationHighlightPluginKey, { 
          analysis, 
          dismissedSentences: dismissedSet 
        })
        view.dispatch(tr)
        return true
      },
      clearDeviationHighlights: () => ({ view }) => {
        extensionThis.storage.analysis = null
        extensionThis.storage.highlights = []
        const tr = view.state.tr.setMeta(deviationHighlightPluginKey, { clear: true })
        view.dispatch(tr)
        return true
      },
      dismissDeviation: (sentence) => ({ view }) => {
        extensionThis.storage.dismissedSentences.add(sentence)
        const tr = view.state.tr.setMeta(deviationHighlightPluginKey, { 
          dismissedSentences: extensionThis.storage.dismissedSentences 
        })
        view.dispatch(tr)
        return true
      },
      setDeviationShowHighlights: (show) => ({ view }) => {
        extensionThis.storage.showHighlights = show
        const tr = view.state.tr.setMeta(deviationHighlightPluginKey, { showHighlights: show })
        view.dispatch(tr)
        return true
      },
    }
  },

  addProseMirrorPlugins() {
    const extensionThis = this

    return [
      new Plugin({
        key: deviationHighlightPluginKey,
        state: {
          init() {
            return DecorationSet.empty
          },
          apply(tr, oldDecorations, oldState, newState) {
            const meta = tr.getMeta(deviationHighlightPluginKey)
            const docChanged = tr.docChanged

            // Only recalculate if analysis changed or document changed
            if (!meta && !docChanged) {
              return oldDecorations.map(tr.mapping, tr.doc)
            }

            // Check if cleared
            if (meta?.clear) {
              extensionThis.storage.highlights = []
              return DecorationSet.empty
            }

            // Check if highlights should be shown
            if (!extensionThis.storage.showHighlights) {
              return DecorationSet.empty
            }

            const analysis = extensionThis.storage.analysis
            const dismissedSentences = extensionThis.storage.dismissedSentences

            if (!analysis || !analysis.sentence_suggestions) {
              extensionThis.storage.highlights = []
              return DecorationSet.empty
            }

            const decorations = []
            const highlights = []

            // Get full text content for position mapping
            let fullText = ''
            const textPositions = [] // Maps text index to doc position
            
            newState.doc.descendants((node, pos) => {
              if (node.isText) {
                const startIdx = fullText.length
                fullText += node.text
                for (let i = 0; i < node.text.length; i++) {
                  textPositions[startIdx + i] = pos + i
                }
              } else if (node.isBlock && fullText.length > 0) {
                // Add newline for block boundaries
                fullText += '\n'
                textPositions[fullText.length - 1] = pos
              }
            })

            // Process each sentence with issues
            Object.entries(analysis.sentence_suggestions).forEach(([sentence, suggestionData]) => {
              if (suggestionData.issues_found <= 0) return
              
              const isDismissed = dismissedSentences.has(sentence)

              // Find sentence position in full text
              const textIndex = fullText.indexOf(sentence)
              if (textIndex === -1) return

              // Map text index to document position
              const from = textPositions[textIndex]
              const toTextIndex = textIndex + sentence.length - 1
              const to = textPositions[toTextIndex] !== undefined 
                ? textPositions[toTextIndex] + 1 
                : from + sentence.length

              if (from === undefined || to === undefined) return

              // Determine severity level
              let level = suggestionData.severity || 'low'
              if (!['high', 'medium', 'low', 'mild', 'moderate', 'severe'].includes(level)) {
                const issuesCount = suggestionData.issues_found || 0
                if (issuesCount >= 3) level = 'high'
                else if (issuesCount >= 2) level = 'medium'
                else level = 'low'
              }
              
              // Map API severity to display level
              if (level === 'severe') level = 'high'
              if (level === 'moderate') level = 'medium'
              if (level === 'mild') level = 'low'

              const highlightData = {
                sentence,
                from,
                to,
                level,
                suggestions: suggestionData,
                isDismissed,
              }
              highlights.push(highlightData)

              // Create decoration with data attributes for click handling
              const className = isDismissed 
                ? 'deviation-mark deviation-dismissed'
                : `deviation-mark deviation-${level}`

              decorations.push(
                Decoration.inline(from, to, {
                  class: className,
                  'data-deviation': 'true',
                  'data-sentence': sentence,
                  'data-level': level,
                  'data-dismissed': isDismissed ? 'true' : 'false',
                })
              )
            })

            extensionThis.storage.highlights = highlights
            return DecorationSet.create(newState.doc, decorations)
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
          handleClick(view, pos, event) {
            // Check if clicked on a deviation mark
            const target = /** @type {HTMLElement} */ (event.target)
            if (!target?.classList?.contains('deviation-mark')) return false
            if (target.dataset?.dismissed === 'true') return false

            const sentence = target.dataset?.sentence
            const level = target.dataset?.level
            
            if (!sentence) return false

            // Find the highlight data
            const highlight = extensionThis.storage.highlights.find(h => h.sentence === sentence)
            if (!highlight) return false

            // Call the click handler if provided
            if (extensionThis.options.onHighlightClick) {
              const rect = target.getBoundingClientRect()
              extensionThis.options.onHighlightClick({
                targetRect: rect,
                suggestions: highlight.suggestions,
                level: highlight.level,
                originalText: highlight.sentence,
              })
              return true
            }

            return false
          },
        },
      }),
    ]
  },
})

export default DeviationHighlightExtension
