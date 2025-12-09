import { Mark } from '@tiptap/core'

/**
 * DeviationMarkExtension - Custom mark for highlighting AI-detected issues
 * Renders with severity-based colors and handles click events for tooltips
 */

const DeviationMark = Mark.create({
  name: 'deviation',

  addOptions() {
    return {
      HTMLAttributes: {},
      onDeviationClick: null,
    }
  },

  addAttributes() {
    return {
      level: {
        default: 'low',
        parseHTML: element => element.getAttribute('data-level'),
        renderHTML: attributes => ({
          'data-level': attributes.level,
        }),
      },
      sentenceId: {
        default: '',
        parseHTML: element => element.getAttribute('data-sentence-id'),
        renderHTML: attributes => ({
          'data-sentence-id': attributes.sentenceId,
        }),
      },
      suggestions: {
        default: null,
        parseHTML: element => {
          const data = element.getAttribute('data-suggestions')
          return data ? JSON.parse(data) : null
        },
        renderHTML: attributes => ({
          'data-suggestions': attributes.suggestions ? JSON.stringify(attributes.suggestions) : null,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-deviation]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const level = HTMLAttributes['data-level'] || 'low'
    
    // Severity-based background colors
    const bgColors = {
      high: 'rgba(220, 38, 38, 0.15)',
      medium: 'rgba(234, 88, 12, 0.15)',
      low: 'rgba(202, 138, 4, 0.15)',
    }
    
    return [
      'span',
      {
        'data-deviation': 'true',
        'data-level': level,
        'data-sentence-id': HTMLAttributes['data-sentence-id'],
        class: `deviation-mark deviation-${level}`,
        style: `background-color: ${bgColors[level] || bgColors.low}; cursor: pointer; border-radius: 2px; padding: 1px 0;`,
        ...this.options.HTMLAttributes,
      },
      0,
    ]
  },

  addCommands() {
    return {
      setDeviation: (attributes) => ({ commands }) => {
        return commands.setMark(this.name, attributes)
      },
      toggleDeviation: (attributes) => ({ commands }) => {
        return commands.toggleMark(this.name, attributes)
      },
      unsetDeviation: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },
})

export default DeviationMark
