/**
 * RxDB Schema for User Profiles (Writing Styles)
 * Note: With Dexie.js storage, all indexed fields MUST be in required array
 */

export const profileSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    userId: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string',
      maxLength: 200,
      default: ''
    },
    writing_style: {
      type: 'string',
      default: ''
    },
    tone: {
      type: 'string',
      maxLength: 100,
      default: ''
    },
    expertise: {
      type: 'array',
      items: {
        type: 'string'
      },
      default: []
    },
    vocabulary_preferences: {
      type: 'object',
      default: {}
    },
    key_characteristics: {
      type: 'array',
      items: {
        type: 'string'
      },
      default: []
    },
    sentence_patterns: {
      type: 'array',
      items: {
        type: 'string'
      },
      default: []
    },
    rewrite_instructions: {
      type: 'string',
      default: ''
    },
    isDefault: {
      type: 'boolean',
      default: false
    },
    created: {
      type: 'string',
      format: 'date-time',
      maxLength: 50
    },
    updated: {
      type: 'string',
      format: 'date-time',
      maxLength: 50
    }
  },
  required: ['id', 'userId', 'name', 'created', 'updated'],
  indexes: ['userId', 'updated']
}
