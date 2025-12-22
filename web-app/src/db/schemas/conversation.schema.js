/**
 * RxDB Schema for Conversations
 * Note: With Dexie.js storage, all indexed fields MUST be in required array
 */

export const conversationSchema = {
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
    systemPrompt: {
      type: 'string',
      default: ''
    },
    type: {
      type: 'string',
      maxLength: 50,
      default: 'chat'
    },
    titleGenerated: {
      type: 'boolean',
      default: false
    },
    userEditedTitle: {
      type: 'boolean',
      default: false
    },
    summary: {
      type: ['string', 'null'],
      default: null
    },
    messageCount: {
      type: 'number',
      default: 0
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
  required: ['id', 'userId', 'title', 'type', 'created', 'updated'],
  indexes: ['userId', 'updated']
}
