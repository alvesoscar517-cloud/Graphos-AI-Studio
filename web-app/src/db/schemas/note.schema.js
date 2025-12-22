/**
 * RxDB Schema for Notes
 * Note: With Dexie.js storage, all indexed fields MUST be in required array
 */

export const noteSchema = {
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
    title: {
      type: 'string',
      maxLength: 500,
      default: ''
    },
    content: {
      type: 'string',
      default: ''
    },
    tags: {
      type: 'array',
      items: {
        type: 'string'
      },
      default: []
    },
    folder: {
      type: ['string', 'null'],
      maxLength: 200,
      default: null
    },
    isPinned: {
      type: 'boolean',
      default: false
    },
    isArchived: {
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
  required: ['id', 'userId', 'title', 'content', 'isPinned', 'isArchived', 'created', 'updated'],
  indexes: ['userId', 'updated']
}
