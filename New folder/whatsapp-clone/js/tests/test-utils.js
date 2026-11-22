/**
 * Test Utilities
 *
 * Common utilities for testing the WhatsApp clone components
 */

// Simple assertion library
export const assert = {
  equal(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    }
  },

  deepEqual(actual, expected, message = '') {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new Error(`${message}\nExpected: ${expectedStr}\nActual: ${actualStr}`);
    }
  },

  isTrue(value, message = '') {
    if (value !== true) {
      throw new Error(`${message}\nExpected: true\nActual: ${value}`);
    }
  },

  isFalse(value, message = '') {
    if (value !== false) {
      throw new Error(`${message}\nExpected: false\nActual: ${value}`);
    }
  },

  isNull(value, message = '') {
    if (value !== null) {
      throw new Error(`${message}\nExpected: null\nActual: ${value}`);
    }
  },

  notNull(value, message = '') {
    if (value === null || value === undefined) {
      throw new Error(`${message}\nExpected not null/undefined\nActual: ${value}`);
    }
  },

  throws(fn, expectedError, message = '') {
    try {
      fn();
      throw new Error(`${message}\nExpected function to throw`);
    } catch (e) {
      if (expectedError && !(e instanceof expectedError)) {
        throw new Error(`${message}\nExpected error type: ${expectedError.name}\nActual: ${e.constructor.name}: ${e.message}`);
      }
    }
  },

  includes(array, item, message = '') {
    if (!array.includes(item)) {
      throw new Error(`${message}\nExpected array to include: ${item}\nActual: ${JSON.stringify(array)}`);
    }
  },

  length(array, expectedLength, message = '') {
    if (array.length !== expectedLength) {
      throw new Error(`${message}\nExpected length: ${expectedLength}\nActual: ${array.length}`);
    }
  }
};

/**
 * Test runner
 */
export class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log(`Running ${this.tests.length} tests...\n`);

    let passed = 0;
    let failed = 0;

    for (const test of this.tests) {
      try {
        await test.fn();
        this.results.push({ name: test.name, passed: true });
        console.log(`✓ ${test.name}`);
        passed++;
      } catch (error) {
        this.results.push({ name: test.name, passed: false, error: error.message });
        console.log(`✗ ${test.name}`);
        console.log(`  ${error.message.split('\n').join('\n  ')}`);
        failed++;
      }
    }

    console.log(`\n${passed} passed, ${failed} failed`);
    return { passed, failed, results: this.results };
  }
}

/**
 * Mock DOM environment for testing
 */
export function createMockDOM() {
  // Create a minimal document if not in browser
  if (typeof document === 'undefined') {
    global.document = {
      createElement: (tag) => ({
        tagName: tag.toUpperCase(),
        children: [],
        attributes: {},
        classList: {
          add: function() {},
          remove: function() {},
          toggle: function() {},
          contains: function() { return false; }
        },
        style: {},
        setAttribute: function(name, value) { this.attributes[name] = value; },
        getAttribute: function(name) { return this.attributes[name]; },
        removeAttribute: function(name) { delete this.attributes[name]; },
        appendChild: function(child) { this.children.push(child); return child; },
        removeChild: function(child) { this.children = this.children.filter(c => c !== child); },
        querySelector: function() { return null; },
        querySelectorAll: function() { return []; },
        addEventListener: function() {},
        removeEventListener: function() {},
        dispatchEvent: function() { return true; },
        focus: function() {},
        blur: function() {},
        value: '',
        textContent: '',
        innerHTML: '',
        outerHTML: '',
        parentElement: null,
        closest: function() { return null; }
      }),
      createTextNode: (text) => ({ textContent: text }),
      body: {
        appendChild: function() {},
        removeChild: function() {}
      },
      documentElement: {
        appendChild: function() {}
      },
      getElementById: function() { return null; },
      querySelector: function() { return null; },
      querySelectorAll: function() { return []; },
      addEventListener: function() {},
      removeEventListener: function() {}
    };

    global.window = {
      innerWidth: 1024,
      innerHeight: 768,
      addEventListener: function() {},
      removeEventListener: function() {},
      requestAnimationFrame: (cb) => setTimeout(cb, 16),
      cancelAnimationFrame: (id) => clearTimeout(id),
      localStorage: {
        getItem: function() { return null; },
        setItem: function() {},
        removeItem: function() {}
      },
      matchMedia: function() { return { matches: false, addEventListener: () => {}, removeEventListener: () => {} }; },
      crypto: {
        randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        })
      }
    };

    global.navigator = {
      userAgent: 'node.js'
    };

    global.HTMLElement = class {};
    global.Element = class {};
    global.Event = class {};
    global.KeyboardEvent = class {};
    global.IntersectionObserver = class {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
}

/**
 * Async test helper
 */
export function waitFor(condition, timeout = 1000, interval = 50) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - start > timeout) {
        reject(new Error('waitFor timed out'));
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
}

/**
 * Mock chat service for testing
 */
export function createMockChatService() {
  const messages = new Map();
  const conversations = new Map();
  const subscribers = new Set();

  return {
    currentUserId: 'current-user',
    users: new Map([
      ['current-user', { id: 'current-user', name: 'You', avatar: '', status: 'online' }],
      ['user-1', { id: 'user-1', name: 'Test User', avatar: '', status: 'online' }]
    ]),
    conversations,
    messages,

    async init() { return this; },
    async connect() {},
    async disconnect() {},

    async getConversations() {
      return Array.from(conversations.values());
    },

    async getConversation(id) {
      return conversations.get(id) || null;
    },

    async createConversation(participantIds) {
      const id = `conv-${Date.now()}`;
      const conv = {
        id,
        participants: participantIds,
        type: 'direct',
        lastMessage: null,
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        draft: '',
        updatedAt: Date.now(),
        createdAt: Date.now()
      };
      conversations.set(id, conv);
      messages.set(id, []);
      return conv;
    },

    async getMessages(conversationId, options = {}) {
      const msgs = messages.get(conversationId) || [];
      return [...msgs].sort((a, b) => a.timestamp - b.timestamp);
    },

    async sendMessage(message) {
      const msg = {
        ...message,
        id: message.id || `msg-${Date.now()}`,
        senderId: this.currentUserId,
        status: 'sent',
        timestamp: message.timestamp || Date.now()
      };

      const convMessages = messages.get(msg.conversationId) || [];
      convMessages.push(msg);
      messages.set(msg.conversationId, convMessages);

      const conv = conversations.get(msg.conversationId);
      if (conv) {
        conv.lastMessage = msg;
        conv.updatedAt = msg.timestamp;
      }

      this._notify('message:received', msg);
      return msg;
    },

    async editMessage(messageId, newContent) {
      for (const [convId, msgs] of messages) {
        const msg = msgs.find(m => m.id === messageId);
        if (msg) {
          msg.content = newContent;
          msg.edited = true;
          this._notify('message:updated', msg);
          return msg;
        }
      }
      throw new Error('Message not found');
    },

    async deleteMessage(messageId, forEveryone = false) {
      for (const [convId, msgs] of messages) {
        const index = msgs.findIndex(m => m.id === messageId);
        if (index !== -1) {
          if (forEveryone) {
            msgs.splice(index, 1);
          } else {
            msgs[index].content = 'This message was deleted';
            msgs[index].deleted = true;
          }
          this._notify('message:deleted', { messageId, conversationId: convId, forEveryone });
          return;
        }
      }
      throw new Error('Message not found');
    },

    async markAsRead(conversationId, messageIds) {
      const msgs = messages.get(conversationId) || [];
      messageIds.forEach(id => {
        const msg = msgs.find(m => m.id === id);
        if (msg) {
          msg.status = 'read';
          this._notify('message:updated', msg);
        }
      });
    },

    async setTyping(conversationId, isTyping) {
      this._notify(isTyping ? 'typing:start' : 'typing:stop', { conversationId, userId: this.currentUserId });
    },

    subscribe(handlers) {
      const handler = (event, data) => {
        if (handlers[event]) handlers[event](data);
      };
      subscribers.add(handler);
      return () => subscribers.delete(handler);
    },

    _notify(event, data) {
      subscribers.forEach(h => h(event, data));
    },

    async updateDraft(conversationId, draft) {
      const conv = conversations.get(conversationId);
      if (conv) {
        conv.draft = draft;
        this._notify('draft:updated', { conversationId, draft });
      }
    },

    async searchMessages(query) {
      const results = [];
      for (const [convId, msgs] of messages) {
        msgs.forEach(msg => {
          if (msg.content.toLowerCase().includes(query.toLowerCase())) {
            results.push(msg);
          }
        });
      }
      return results;
    },

    async getUserPresence(userId) {
      return this.users.get(userId)?.status || 'offline';
    },

    subscribeToPresence(userIds, callback) {
      return () => {};
    },

    async uploadMedia(file) {
      return URL.createObjectURL(file);
    },

    async reactToMessage(messageId, emoji) {
      for (const [convId, msgs] of messages) {
        const msg = msgs.find(m => m.id === messageId);
        if (msg) {
          const existing = msg.reactions?.find(r => r.emoji === emoji && r.userId === this.currentUserId);
          if (existing) existing.count++;
          else msg.reactions = [...(msg.reactions || []), { emoji, userId: this.currentUserId, count: 1 }];
          this._notify('reaction:added', { messageId, emoji, userId: this.currentUserId });
          return;
        }
      }
      throw new Error('Message not found');
    },

    async setPinned(conversationId, pinned) {
      const conv = conversations.get(conversationId);
      if (conv) {
        conv.isPinned = pinned;
        this._notify('conversation:updated', conv);
      }
    },

    async setMuted(conversationId, muted, duration = null) {
      const conv = conversations.get(conversationId);
      if (conv) {
        conv.isMuted = muted;
        conv.mutedUntil = duration ? Date.now() + duration : null;
        this._notify('conversation:updated', conv);
      }
    },

    async setArchived(conversationId, archived) {
      const conv = conversations.get(conversationId);
      if (conv) {
        conv.isArchived = archived;
        this._notify('conversation:updated', conv);
      }
    }
  };
}

export default {
  assert,
  TestRunner,
  createMockDOM,
  waitFor,
  createMockChatService
};