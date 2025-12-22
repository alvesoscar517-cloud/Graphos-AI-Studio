/**
 * RxDB Schema for Messages
 * Note: With Dexie.js storage, all indexed fields MUST be in required array
 */

export const messageSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    conversationId: {
      type: 'string',
      maxLength: 100
    },
    userId: {
      type: 'string',
      maxLength: 100
    },
    role: {
      type: 'string',
      enum: ['user', 'assistant', 'system'],
      maxLength: 20
    },
    content: {
      type: 'string',
      default: ''
    },
    attachments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          mimeType: { type: 'string' },
          base64: { type: 'string' }
        }
      },
      default: []
    },
    timestamp: {
      type: 'string',
      format: 'date-time',
      maxLength: 50
    }
  },
  required: ['id', 'conversationId', 'userId', 'role', 'content', 'timestamp'],
  indexes: ['conversationId', 'timestamp']
}
