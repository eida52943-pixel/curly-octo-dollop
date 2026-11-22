/**
 * Chat Service Interface
 *
 * Abstracts the data/realtime layer from UI components.
 * Supports sending/receiving messages, typing indicators,
 * online/read status, and message drafts.
 *
 * Can be implemented with WebSocket, REST API, or mock data.
 */

export const MessageType = {
  TEXT: 'text',
  IMAGE: 'image',
  VOICE: 'voice',
  SYSTEM: 'system'
};

export const MessageStatus = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
};

export const UserStatus = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy'
};

/**
 * Message entity
 */
export class Message {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.conversationId = data.conversationId || '';
    this.senderId = data.senderId || '';
    this.type = data.type || MessageType.TEXT;
    this.content = data.content || '';
    this.mediaUrl = data.mediaUrl || null;
    this.status = data.status || MessageStatus.SENDING;
    this.timestamp = data.timestamp || Date.now();
    this.edited = data.edited || false;
    this.replyTo = data.replyTo || null;
    this.reactions = data.reactions || [];
  }
}

/**
 * Conversation entity
 */
export class Conversation {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.participants = data.participants || [];
    this.type = data.type || 'direct'; // 'direct' | 'group'
    this.name = data.name || '';
    this.avatar = data.avatar || '';
    this.lastMessage = data.lastMessage || null;
    this.unreadCount = data.unreadCount || 0;
    this.isPinned = data.isPinned || false;
    this.isMuted = data.isMuted || false;
    this.draft = data.draft || '';
    this.updatedAt = data.updatedAt || Date.now();
    this.createdAt = data.createdAt || Date.now();
  }
}

/**
 * User entity
 */
export class User {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.name = data.name || '';
    this.avatar = data.avatar || '';
    this.status = data.status || UserStatus.OFFLINE;
    this.lastSeen = data.lastSeen || null;
    this.about = data.about || '';
  }
}

/**
 * Chat Service Interface
 *
 * Implement this interface for your backend:
 * - WebSocketChatService (real-time)
 * - RestChatService (polling)
 * - MockChatService (development)
 */
export class ChatServiceInterface {
  /**
   * Initialize the service
   * @returns {Promise<void>}
   */
  async init() {
    throw new Error('init() must be implemented');
  }

  /**
   * Connect to the chat server
   * @returns {Promise<void>}
   */
  async connect() {
    throw new Error('connect() must be implemented');
  }

  /**
   * Disconnect from the chat server
   * @returns {Promise<void>}
   */
  async disconnect() {
    throw new Error('disconnect() must be implemented');
  }

  /**
   * Get all conversations for current user
   * @returns {Promise<Conversation[]>}
   */
  async getConversations() {
    throw new Error('getConversations() must be implemented');
  }

  /**
   * Get a specific conversation
   * @param {string} conversationId
   * @returns {Promise<Conversation|null>}
   */
  async getConversation(conversationId) {
    throw new Error('getConversation() must be implemented');
  }

  /**
   * Create a new conversation
   * @param {string[]} participantIds
   * @param {Object} options
   * @returns {Promise<Conversation>}
   */
  async createConversation(participantIds, options = {}) {
    throw new Error('createConversation() must be implemented');
  }

  /**
   * Get messages for a conversation
   * @param {string} conversationId
   * @param {Object} options - { limit, before, after }
   * @returns {Promise<Message[]>}
   */
  async getMessages(conversationId, options = {}) {
    throw new Error('getMessages() must be implemented');
  }

  /**
   * Send a message
   * @param {Message} message
   * @returns {Promise<Message>}
   */
  async sendMessage(message) {
    throw new Error('sendMessage() must be implemented');
  }

  /**
   * Edit a message
   * @param {string} messageId
   * @param {string} newContent
   * @returns {Promise<Message>}
   */
  async editMessage(messageId, newContent) {
    throw new Error('editMessage() must be implemented');
  }

  /**
   * Delete a message
   * @param {string} messageId
   * @param {boolean} forEveryone
   * @returns {Promise<void>}
   */
  async deleteMessage(messageId, forEveryone = false) {
    throw new Error('deleteMessage() must be implemented');
  }

  /**
   * Mark messages as read
   * @param {string} conversationId
   * @param {string[]} messageIds
   * @returns {Promise<void>}
   */
  async markAsRead(conversationId, messageIds) {
    throw new Error('markAsRead() must be implemented');
  }

  /**
   * Set typing indicator
   * @param {string} conversationId
   * @param {boolean} isTyping
   * @returns {Promise<void>}
   */
  async setTyping(conversationId, isTyping) {
    throw new Error('setTyping() must be implemented');
  }

  /**
   * Subscribe to real-time events
   * @param {Object} handlers
   * @returns {Function} unsubscribe function
   */
  subscribe(handlers) {
    throw new Error('subscribe() must be implemented');
  }

  /**
   * Update conversation draft
   * @param {string} conversationId
   * @param {string} draft
   * @returns {Promise<void>}
   */
  async updateDraft(conversationId, draft) {
    throw new Error('updateDraft() must be implemented');
  }

  /**
   * Search messages
   * @param {string} query
   * @param {Object} options
   * @returns {Promise<Message[]>}
   */
  async searchMessages(query, options = {}) {
    throw new Error('searchMessages() must be implemented');
  }

  /**
   * Get user presence
   * @param {string} userId
   * @returns {Promise<UserStatus>}
   */
  async getUserPresence(userId) {
    throw new Error('getUserPresence() must be implemented');
  }

  /**
   * Subscribe to presence changes
   * @param {string[]} userIds
   * @param {Function} callback
   * @returns {Function} unsubscribe function
   */
  subscribeToPresence(userIds, callback) {
    throw new Error('subscribeToPresence() must be implemented');
  }

  /**
   * Upload media
   * @param {File} file
   * @param {Object} options
   * @returns {Promise<string>} media URL
   */
  async uploadMedia(file, options = {}) {
    throw new Error('uploadMedia() must be implemented');
  }

  /**
   * React to a message
   * @param {string} messageId
   * @param {string} emoji
   * @returns {Promise<void>}
   */
  async reactToMessage(messageId, emoji) {
    throw new Error('reactToMessage() must be implemented');
  }

  /**
   * Pin/unpin conversation
   * @param {string} conversationId
   * @param {boolean} pinned
   * @returns {Promise<void>}
   */
  async setPinned(conversationId, pinned) {
    throw new Error('setPinned() must be implemented');
  }

  /**
   * Mute/unmute conversation
   * @param {string} conversationId
   * @param {boolean} muted
   * @param {number} duration - in milliseconds
   * @returns {Promise<void>}
   */
  async setMuted(conversationId, muted, duration = null) {
    throw new Error('setMuted() must be implemented');
  }

  /**
   * Archive/unarchive conversation
   * @param {string} conversationId
   * @param {boolean} archived
   * @returns {Promise<void>}
   */
  async setArchived(conversationId, archived) {
    throw new Error('setArchived() must be implemented');
  }
}

/**
 * Event types for real-time subscriptions
 */
export const ChatEvents = {
  MESSAGE_RECEIVED: 'message:received',
  MESSAGE_UPDATED: 'message:updated',
  MESSAGE_DELETED: 'message:deleted',
  MESSAGE_READ: 'message:read',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  PRESENCE_CHANGED: 'presence:changed',
  CONVERSATION_UPDATED: 'conversation:updated',
  CONVERSATION_CREATED: 'conversation:created',
  CONVERSATION_DELETED: 'conversation:deleted',
  DRAFT_UPDATED: 'draft:updated',
  REACTION_ADDED: 'reaction:added',
  REACTION_REMOVED: 'reaction:removed',
  ERROR: 'error',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting'
};

export default ChatServiceInterface;