/**
 * Mock Chat Service Implementation
 *
 * In-memory implementation for development and testing.
 * Simulates network delays and real-time events.
 */

import {
  ChatServiceInterface,
  ChatEvents,
  Message,
  Conversation,
  User,
  MessageType,
  MessageStatus,
  UserStatus
} from './chatService.js';

export class MockChatService extends ChatServiceInterface {
  constructor() {
    super();
    this.currentUserId = 'current-user';
    this.conversations = new Map();
    this.messages = new Map(); // conversationId -> Message[]
    this.users = new Map();
    this.subscribers = new Set();
    this.presenceSubscribers = new Map();
    this.typingTimers = new Map();
    this.isConnected = false;
    this.connectionListeners = new Set();

    // Initialize with mock data
    this._initMockData();
  }

  _initMockData() {
    // Create mock users
    const mockUsers = [
      { id: 'user-1', name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', status: UserStatus.ONLINE, about: 'Hey there! I am using WhatsApp.' },
      { id: 'user-2', name: 'Michael Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael', status: UserStatus.OFFLINE, lastSeen: Date.now() - 3600000, about: 'Busy working' },
      { id: 'user-3', name: 'Emily Davis', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily', status: UserStatus.ONLINE, about: 'Living life to the fullest!' },
      { id: 'user-4', name: 'James Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james', status: UserStatus.OFFLINE, lastSeen: Date.now() - 86400000, about: 'At the gym' },
      { id: 'user-5', name: 'Lisa Anderson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa', status: UserStatus.AWAY, lastSeen: Date.now() - 1800000, about: 'Traveling the world ✈️' },
      { id: 'user-6', name: 'David Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', status: UserStatus.ONLINE, about: 'Software developer' },
      { id: 'user-7', name: 'Jennifer Lee', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer', status: UserStatus.OFFLINE, lastSeen: Date.now() - 172800000, about: 'Designer' },
      { id: 'user-8', name: 'Robert Taylor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert', status: UserStatus.ONLINE, about: 'Product manager' }
    ];

    mockUsers.forEach(u => this.users.set(u.id, new User(u)));

    // Current user
    this.users.set(this.currentUserId, new User({
      id: this.currentUserId,
      name: 'You',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current-user',
      status: UserStatus.ONLINE,
      about: 'Hey there! I am using WhatsApp.'
    }));

    // Create mock conversations
    const conversationsData = [
      {
        id: 'conv-1',
        participants: [this.currentUserId, 'user-1'],
        messages: [
          { senderId: 'user-1', content: 'Hey! How are you doing?', timestamp: Date.now() - 86400000, status: MessageStatus.READ },
          { senderId: this.currentUserId, content: 'I\'m doing great! Thanks for asking.', timestamp: Date.now() - 86300000, status: MessageStatus.READ },
          { senderId: 'user-1', content: 'That\'s awesome to hear!', timestamp: Date.now() - 86200000, status: MessageStatus.READ },
          { senderId: this.currentUserId, content: 'What about you?', timestamp: Date.now() - 86100000, status: MessageStatus.READ },
          { senderId: 'user-1', content: 'I\'m doing well too. Just finished a project.', timestamp: Date.now() - 86000000, status: MessageStatus.DELIVERED }
        ],
        unreadCount: 1
      },
      {
        id: 'conv-2',
        participants: [this.currentUserId, 'user-2'],
        messages: [
          { senderId: 'user-2', content: 'Did you see the latest update?', timestamp: Date.now() - 172800000, status: MessageStatus.READ },
          { senderId: this.currentUserId, content: 'Yes, it looks really good!', timestamp: Date.now() - 172700000, status: MessageStatus.READ }
        ],
        unreadCount: 0
      },
      {
        id: 'conv-3',
        participants: [this.currentUserId, 'user-3'],
        messages: [
          { senderId: this.currentUserId, content: 'Happy birthday! 🎉', timestamp: Date.now() - 43200000, status: MessageStatus.READ },
          { senderId: 'user-3', content: 'Thank you so much! 😊', timestamp: Date.now() - 43100000, status: MessageStatus.READ }
        ],
        unreadCount: 0
      },
      {
        id: 'conv-4',
        participants: [this.currentUserId, 'user-4'],
        messages: [
          { senderId: 'user-4', content: 'Meeting at 3pm?', timestamp: Date.now() - 259200000, status: MessageStatus.READ },
          { senderId: this.currentUserId, content: 'Perfect, see you there!', timestamp: Date.now() - 259100000, status: MessageStatus.READ }
        ],
        unreadCount: 2
      },
      {
        id: 'conv-5',
        participants: [this.currentUserId, 'user-5'],
        messages: [
          { senderId: this.currentUserId, content: 'How was your trip?', timestamp: Date.now() - 604800000, status: MessageStatus.READ }
        ],
        unreadCount: 0
      },
      {
        id: 'conv-6',
        participants: [this.currentUserId, 'user-6'],
        messages: [
          { senderId: 'user-6', content: 'Code review done', timestamp: Date.now() - 120000, status: MessageStatus.DELIVERED },
          { senderId: this.currentUserId, content: 'Thanks! Merging now.', timestamp: Date.now() - 110000, status: MessageStatus.SENT }
        ],
        unreadCount: 0
      },
      {
        id: 'conv-7',
        participants: [this.currentUserId, 'user-7'],
        messages: [],
        unreadCount: 0,
        draft: 'Hey, just wanted to check...'
      },
      {
        id: 'conv-8',
        participants: [this.currentUserId, 'user-8'],
        messages: [
          { senderId: 'user-8', content: 'Q3 planning doc is ready', timestamp: Date.now() - 3600000, status: MessageStatus.READ }
        ],
        unreadCount: 0
      }
    ];

    conversationsData.forEach(convData => {
      const conversation = new Conversation({
        id: convData.id,
        participants: convData.participants,
        type: 'direct',
        isPinned: convData.id === 'conv-1',
        unreadCount: convData.unreadCount || 0,
        draft: convData.draft || ''
      });

      this.conversations.set(conversation.id, conversation);

      const messages = convData.messages.map(m => new Message({
        ...m,
        conversationId: conversation.id,
        id: m.id || crypto.randomUUID()
      }));

      this.messages.set(conversation.id, messages);
      conversation.lastMessage = messages[messages.length - 1] || null;
      conversation.updatedAt = conversation.lastMessage?.timestamp || conversation.createdAt;
    });
  }

  /**
   * Simulate network delay
   */
  _delay(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Notify all subscribers
   */
  _notify(event, data) {
    this.subscribers.forEach(handler => {
      try {
        handler(event, data);
      } catch (e) {
        console.error('Subscriber error:', e);
      }
    });
  }

  /**
   * Get other participant in direct conversation
   */
  _getOtherParticipant(conversation) {
    return conversation.participants.find(p => p !== this.currentUserId);
  }

  async init() {
    await this._delay(50);
    this.isConnected = true;
    this._notify(ChatEvents.CONNECTED);
    return this;
  }

  async connect() {
    if (this.isConnected) return;
    await this._delay(200);
    this.isConnected = true;
    this._notify(ChatEvents.CONNECTED);
  }

  async disconnect() {
    this.isConnected = false;
    this._notify(ChatEvents.DISCONNECTED);
  }

  async getConversations() {
    await this._delay(50);
    return Array.from(this.conversations.values())
      .sort((a, b) => {
        // Pinned first
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        // Then by last message time
        return (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0);
      });
  }

  async getConversation(conversationId) {
    await this._delay(30);
    return this.conversations.get(conversationId) || null;
  }

  async createConversation(participantIds, options = {}) {
    await this._delay(100);

    // Check if direct conversation already exists
    if (participantIds.length === 2 && !options.type === 'group') {
      const existing = Array.from(this.conversations.values()).find(c =>
        c.type === 'direct' &&
        c.participants.length === 2 &&
        c.participants.every(p => participantIds.includes(p))
      );
      if (existing) return existing;
    }

    const conversation = new Conversation({
      participants: participantIds,
      type: options.type || 'direct',
      name: options.name || '',
      avatar: options.avatar || ''
    });

    this.conversations.set(conversation.id, conversation);
    this.messages.set(conversation.id, []);

    this._notify(ChatEvents.CONVERSATION_CREATED, conversation);
    return conversation;
  }

  async getMessages(conversationId, options = {}) {
    await this._delay(50);
    const messages = this.messages.get(conversationId) || [];
    let result = [...messages].sort((a, b) => a.timestamp - b.timestamp);

    if (options.before) {
      result = result.filter(m => m.timestamp < options.before);
    }
    if (options.after) {
      result = result.filter(m => m.timestamp > options.after);
    }
    if (options.limit) {
      result = result.slice(-options.limit);
    }

    return result;
  }

  async sendMessage(message) {
    await this._delay(100);

    const msg = message instanceof Message ? message : new Message(message);
    msg.senderId = this.currentUserId;
    msg.status = MessageStatus.SENT;

    const convMessages = this.messages.get(msg.conversationId) || [];
    convMessages.push(msg);
    this.messages.set(msg.conversationId, convMessages);

    // Update conversation
    const conversation = this.conversations.get(msg.conversationId);
    if (conversation) {
      conversation.lastMessage = msg;
      conversation.updatedAt = msg.timestamp;
      conversation.unreadCount = 0;
      conversation.draft = '';
      this._notify(ChatEvents.CONVERSATION_UPDATED, conversation);
    }

    this._notify(ChatEvents.MESSAGE_RECEIVED, msg);

    // Simulate delivery
    setTimeout(() => {
      msg.status = MessageStatus.DELIVERED;
      this._notify(ChatEvents.MESSAGE_UPDATED, msg);
    }, 300 + Math.random() * 500);

    // Simulate read
    setTimeout(() => {
      msg.status = MessageStatus.READ;
      this._notify(ChatEvents.MESSAGE_UPDATED, msg);
      this._notify(ChatEvents.MESSAGE_READ, { messageId: msg.id, conversationId: msg.conversationId });
    }, 2000 + Math.random() * 3000);

    // Simulate auto-reply for demo
    if (Math.random() > 0.5) {
      this._simulateReply(msg.conversationId);
    }

    return msg;
  }

  _simulateReply(conversationId) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return;

    const otherId = this._getOtherParticipant(conversation);
    const user = this.users.get(otherId);
    if (!user) return;

    const replies = [
      'That sounds great!',
      'Thanks for letting me know.',
      'I\'ll check it out.',
      'Sounds good to me!',
      'Let me think about it...',
      'Got it, thanks!',
      '👍',
      'Cool!',
      'Nice!',
      'Perfect!'
    ];

    setTimeout(() => {
      const reply = new Message({
        conversationId,
        senderId: otherId,
        content: replies[Math.floor(Math.random() * replies.length)],
        status: MessageStatus.SENT
      });

      const convMessages = this.messages.get(conversationId) || [];
      convMessages.push(reply);
      this.messages.set(conversationId, convMessages);

      conversation.lastMessage = reply;
      conversation.updatedAt = reply.timestamp;

      // Increment unread if not current conversation
      if (this.currentConversationId !== conversationId) {
        conversation.unreadCount++;
      }

      this._notify(ChatEvents.CONVERSATION_UPDATED, conversation);
      this._notify(ChatEvents.MESSAGE_RECEIVED, reply);

      // Simulate delivery/read
      setTimeout(() => {
        reply.status = MessageStatus.DELIVERED;
        this._notify(ChatEvents.MESSAGE_UPDATED, reply);
      }, 200);

      setTimeout(() => {
        reply.status = MessageStatus.READ;
        this._notify(ChatEvents.MESSAGE_UPDATED, reply);
      }, 1500);
    }, 1000 + Math.random() * 3000);
  }

  async editMessage(messageId, newContent) {
    await this._delay(50);
    // Find message
    for (const [convId, messages] of this.messages) {
      const msg = messages.find(m => m.id === messageId);
      if (msg) {
        msg.content = newContent;
        msg.edited = true;
        msg.timestamp = Date.now();
        this._notify(ChatEvents.MESSAGE_UPDATED, msg);
        return msg;
      }
    }
    throw new Error('Message not found');
  }

  async deleteMessage(messageId, forEveryone = false) {
    await this._delay(50);
    for (const [convId, messages] of this.messages) {
      const index = messages.findIndex(m => m.id === messageId);
      if (index !== -1) {
        const msg = messages[index];
        if (forEveryone) {
          messages.splice(index, 1);
        } else {
          msg.content = 'This message was deleted';
          msg.deleted = true;
        }
        this._notify(ChatEvents.MESSAGE_DELETED, { messageId, conversationId: convId, forEveryone });
        return;
      }
    }
    throw new Error('Message not found');
  }

  async markAsRead(conversationId, messageIds) {
    await this._delay(30);
    const messages = this.messages.get(conversationId) || [];
    messageIds.forEach(id => {
      const msg = messages.find(m => m.id === id);
      if (msg && msg.senderId !== this.currentUserId) {
        msg.status = MessageStatus.READ;
        this._notify(ChatEvents.MESSAGE_UPDATED, msg);
      }
    });

    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
      this._notify(ChatEvents.CONVERSATION_UPDATED, conversation);
    }
  }

  async setTyping(conversationId, isTyping) {
    // Simulate typing indicator for other users
    if (isTyping) {
      // Clear existing timer
      if (this.typingTimers.has(conversationId)) {
        clearTimeout(this.typingTimers.get(conversationId));
      }

      this._notify(ChatEvents.TYPING_START, { conversationId, userId: this.currentUserId });

      // Auto-stop typing after 3 seconds
      this.typingTimers.set(conversationId, setTimeout(() => {
        this._notify(ChatEvents.TYPING_STOP, { conversationId, userId: this.currentUserId });
        this.typingTimers.delete(conversationId);
      }, 3000));
    } else {
      if (this.typingTimers.has(conversationId)) {
        clearTimeout(this.typingTimers.get(conversationId));
        this.typingTimers.delete(conversationId);
      }
      this._notify(ChatEvents.TYPING_STOP, { conversationId, userId: this.currentUserId });
    }
  }

  subscribe(handlers) {
    const handler = (event, data) => {
      if (handlers[event]) {
        handlers[event](data);
      }
      if (handlers[ChatEvents.ERROR] && event === ChatEvents.ERROR) {
        handlers[ChatEvents.ERROR](data);
      }
    };

    this.subscribers.add(handler);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(handler);
    };
  }

  async updateDraft(conversationId, draft) {
    await this._delay(20);
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.draft = draft;
      this._notify(ChatEvents.DRAFT_UPDATED, { conversationId, draft });
    }
  }

  async searchMessages(query, options = {}) {
    await this._delay(50);
    const results = [];

    for (const [convId, messages] of this.messages) {
      const conversation = this.conversations.get(convId);
      if (!conversation) continue;

      messages.forEach(msg => {
        if (msg.content.toLowerCase().includes(query.toLowerCase())) {
          results.push({ ...msg, conversation });
        }
      });
    }

    return results.slice(0, options.limit || 50);
  }

  async getUserPresence(userId) {
    await this._delay(10);
    const user = this.users.get(userId);
    return user?.status || UserStatus.OFFLINE;
  }

  subscribeToPresence(userIds, callback) {
    userIds.forEach(id => {
      if (!this.presenceSubscribers.has(id)) {
        this.presenceSubscribers.set(id, new Set());
      }
      this.presenceSubscribers.get(id).add(callback);
    });

    return () => {
      userIds.forEach(id => {
        this.presenceSubscribers.get(id)?.delete(callback);
      });
    };
  }

  async uploadMedia(file, options = {}) {
    await this._delay(500 + Math.random() * 1000);
    // Return a mock URL
    return URL.createObjectURL(file);
  }

  async reactToMessage(messageId, emoji) {
    await this._delay(50);
    for (const [convId, messages] of this.messages) {
      const msg = messages.find(m => m.id === messageId);
      if (msg) {
        const existing = msg.reactions.find(r => r.emoji === emoji && r.userId === this.currentUserId);
        if (existing) {
          existing.count++;
        } else {
          msg.reactions.push({ emoji, userId: this.currentUserId, count: 1 });
        }
        this._notify(ChatEvents.REACTION_ADDED, { messageId, emoji, userId: this.currentUserId });
        return;
      }
    }
    throw new Error('Message not found');
  }

  async setPinned(conversationId, pinned) {
    await this._delay(30);
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.isPinned = pinned;
      this._notify(ChatEvents.CONVERSATION_UPDATED, conversation);
    }
  }

  async setMuted(conversationId, muted, duration = null) {
    await this._delay(30);
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.isMuted = muted;
      conversation.mutedUntil = duration ? Date.now() + duration : null;
      this._notify(ChatEvents.CONVERSATION_UPDATED, conversation);
    }
  }

  async setArchived(conversationId, archived) {
    await this._delay(30);
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.isArchived = archived;
      this._notify(ChatEvents.CONVERSATION_UPDATED, conversation);
    }
  }

  // Helper for demo
  setCurrentConversationId(id) {
    this.currentConversationId = id;
  }
}

export default MockChatService;