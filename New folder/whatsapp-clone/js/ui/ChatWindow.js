/**
 * Chat Window Component
 *
 * Displays messages for a selected conversation with:
 * - Virtualized message list for performance
 * - Message bubbles with status indicators
 * - Typing indicator
 * - Message input with emoji picker
 * - Keyboard shortcuts
 * - Full accessibility support
 */

import { Component } from './Component.js';
import { ChatEvents, MessageType, MessageStatus } from '../services/chatService.js';

export class ChatWindow extends Component {
  constructor(chatService, options = {}) {
    super(options);
    this.chatService = chatService;
    this.conversationId = null;
    this.conversation = null;
    this.messages = [];
    this.unsubscribe = null;
    this.typingUsers = new Set();
    this.isLoading = false;
    this.hasMoreMessages = true;
    this.loadMoreThreshold = 100;
    this.draft = '';
    this.emojiPickerOpen = false;
    this.unsubscribePresence = null;
    this.scrollObserver = null;

    // Bind event handlers
    this.on('click', 'send', this._handleSend.bind(this));
    this.on('input', 'message-input', this._handleInput.bind(this));
    this.on('keydown', 'message-input', this._handleKeyDown.bind(this));
    this.on('click', 'emoji-toggle', this._toggleEmojiPicker.bind(this));
    this.on('click', 'emoji-item', this._handleEmojiSelect.bind(this));
    this.on('click', 'emoji-close', this._closeEmojiPicker.bind(this));
    this.on('click', 'attach', this._handleAttach.bind(this));
    this.on('click', 'message', this._handleMessageClick.bind(this));
    this.on('keydown', 'message', this._handleMessageKeyDown.bind(this));
    this.on('scroll', 'messages-container', this._handleScroll.bind(this));
    this.on('focus', 'message-input', this._handleFocus.bind(this));
    this.on('blur', 'message-input', this._handleBlur.bind(this));
  }

  async onMount() {
    this._setupScrollObserver();
  }

  onUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.unsubscribePresence) {
      this.unsubscribePresence();
    }
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
    this._closeEmojiPicker();
  }

  setConversation(conversationId) {
    if (this.conversationId === conversationId) return;

    this.conversationId = conversationId;
    this.messages = [];
    this.hasMoreMessages = true;
    this.typingUsers.clear();

    this._loadConversation();
    this._subscribeToEvents();
    this._loadMessages();
  }

  async _loadConversation() {
    this.conversation = await this.chatService.getConversation(this.conversationId);
    if (this.conversation) {
      this.draft = this.conversation.draft || '';
      this.update();
    }
  }

  _subscribeToEvents() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    this.unsubscribe = this.chatService.subscribe({
      [ChatEvents.MESSAGE_RECEIVED]: (message) => this._handleMessageReceived(message),
      [ChatEvents.MESSAGE_UPDATED]: (message) => this._handleMessageUpdated(message),
      [ChatEvents.MESSAGE_DELETED]: (data) => this._handleMessageDeleted(data),
      [ChatEvents.MESSAGE_READ]: (data) => this._handleMessageRead(data),
      [ChatEvents.TYPING_START]: (data) => this._handleTypingStart(data),
      [ChatEvents.TYPING_STOP]: (data) => this._handleTypingStop(data),
      [ChatEvents.CONVERSATION_UPDATED]: (conversation) => this._handleConversationUpdated(conversation),
      [ChatEvents.DRAFT_UPDATED]: (data) => this._handleDraftUpdated(data)
    });

    // Subscribe to presence for other participant
    if (this.conversation && this.conversation.type === 'direct') {
      const otherId = this.conversation.participants.find(p => p !== this.chatService.currentUserId);
      if (otherId) {
        this.unsubscribePresence = this.chatService.subscribeToPresence([otherId], (status) => {
          this._handlePresenceChange(otherId, status);
        });
      }
    }
  }

  async _loadMessages(before = null) {
    if (this.isLoading || !this.hasMoreMessages) return;

    this.isLoading = true;
    this.update();

    try {
      const newMessages = await this.chatService.getMessages(this.conversationId, {
        limit: 50,
        before
      });

      if (newMessages.length < 50) {
        this.hasMoreMessages = false;
      }

      if (before) {
        // Prepend older messages
        this.messages = [...newMessages, ...this.messages];
      } else {
        // Initial load or refresh
        this.messages = newMessages;
      }

      // Mark as read
      const unreadMessages = this.messages.filter(m =>
        m.senderId !== this.chatService.currentUserId &&
        m.status !== MessageStatus.READ
      );
      if (unreadMessages.length > 0) {
        await this.chatService.markAsRead(
          this.conversationId,
          unreadMessages.map(m => m.id)
        );
      }

      this.update();

      // Scroll to bottom on initial load
      if (!before) {
        this._scrollToBottom(false);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      Component.announce('Failed to load messages', 'assertive');
    } finally {
      this.isLoading = false;
      this.update();
    }
  }

  _setupScrollObserver() {
    // Use IntersectionObserver to detect when to load more messages
    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoading && this.hasMoreMessages) {
          const firstMessage = this.messages[0];
          if (firstMessage) {
            this._loadMessages(firstMessage.timestamp);
          }
        }
      });
    }, { rootMargin: '100px' });

    // Observe after render
    requestAnimationFrame(() => {
      const sentinel = this.getRef('load-more-sentinel');
      if (sentinel) {
        this.scrollObserver.observe(sentinel);
      }
    });
  }

  _subscribeToEvents() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    this.unsubscribe = this.chatService.subscribe({
      [ChatEvents.MESSAGE_RECEIVED]: (message) => this._handleMessageReceived(message),
      [ChatEvents.MESSAGE_UPDATED]: (message) => this._handleMessageUpdated(message),
      [ChatEvents.MESSAGE_DELETED]: (data) => this._handleMessageDeleted(data),
      [ChatEvents.MESSAGE_READ]: (data) => this._handleMessageRead(data),
      [ChatEvents.TYPING_START]: (data) => this._handleTypingStart(data),
      [ChatEvents.TYPING_STOP]: (data) => this._handleTypingStop(data),
      [ChatEvents.CONVERSATION_UPDATED]: (conversation) => this._handleConversationUpdated(conversation),
      [ChatEvents.DRAFT_UPDATED]: (data) => this._handleDraftUpdated(data)
    });
  }

  _handleMessageReceived(message) {
    if (message.conversationId !== this.conversationId) return;

    // Check if message already exists
    if (!this.messages.find(m => m.id === message.id)) {
      this.messages.push(message);
      this.update();
      this._scrollToBottom(true);
      Component.announce(`New message from ${this._getSenderName(message)}`);
    }
  }

  _handleMessageUpdated(message) {
    if (message.conversationId !== this.conversationId) return;

    const index = this.messages.findIndex(m => m.id === message.id);
    if (index !== -1) {
      this.messages[index] = message;
      this.update();
    }
  }

  _handleMessageDeleted(data) {
    if (data.conversationId !== this.conversationId) return;

    if (data.forEveryone) {
      this.messages = this.messages.filter(m => m.id !== data.messageId);
    } else {
      const msg = this.messages.find(m => m.id === data.messageId);
      if (msg) {
        msg.content = 'This message was deleted';
        msg.deleted = true;
      }
    }
    this.update();
  }

  _handleMessageRead(data) {
    if (data.conversationId !== this.conversationId) return;

    const msg = this.messages.find(m => m.id === data.messageId);
    if (msg) {
      msg.status = MessageStatus.READ;
      this.update();
    }
  }

  _handleTypingStart(data) {
    if (data.conversationId !== this.conversationId) return;
    if (data.userId !== this.chatService.currentUserId) {
      this.typingUsers.add(data.userId);
      this.update();
    }
  }

  _handleTypingStop(data) {
    if (data.conversationId !== this.conversationId) return;
    this.typingUsers.delete(data.userId);
    this.update();
  }

  _handleConversationUpdated(conversation) {
    if (conversation.id === this.conversationId) {
      this.conversation = conversation;
      this.update();
    }
  }

  _handleDraftUpdated(data) {
    if (data.conversationId === this.conversationId) {
      this.draft = data.draft;
      const input = this.getRef('messageInput');
      if (input && document.activeElement !== input) {
        input.value = data.draft;
      }
    }
  }

  _handlePresenceChange(userId, status) {
    this.update();
  }

  _handleSend() {
    const input = this.getRef('messageInput');
    if (!input) return;

    const content = input.value.trim();
    if (!content) return;

    const message = new (class extends Object {
      constructor(data) { Object.assign(this, data); }
    })({
      conversationId: this.conversationId,
      senderId: this.chatService.currentUserId,
      content,
      type: 'text'
    });

    this.chatService.sendMessage(message);
    input.value = '';
    this._updateDraft('');
    this._closeEmojiPicker();
    this._scrollToBottom(true);
  }

  _handleInput(e) {
    const value = e.target.value;
    this.draft = value;
    this._updateDraft(value);
    this._handleTyping();
  }

  _handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this._handleSend();
    } else if (e.key === 'Escape') {
      this._closeEmojiPicker();
      e.target.blur();
    }
  }

  _handleFocus() {
    this._closeEmojiPicker();
  }

  _handleBlur() {
    // Keep draft saved
  }

  _handleTyping() {
    clearTimeout(this._typingTimer);
    this.chatService.setTyping(this.conversationId, true);
    this._typingTimer = setTimeout(() => {
      this.chatService.setTyping(this.conversationId, false);
    }, 2000);
  }

  _updateDraft(draft) {
    this.draft = draft;
    this.chatService.updateDraft(this.conversationId, draft);
  }

  _handleAttach() {
    // TODO: Implement file attachment
    Component.announce('Attachment feature coming soon', 'polite');
  }

  _handleMessageClick(e, element) {
    const messageId = element.getAttribute('data-message-id');
    if (messageId) {
      this.emit('messageAction', { messageId, action: 'click' });
    }
  }

  _handleMessageKeyDown(e, element) {
    const messageId = element.getAttribute('data-message-id');
    if (!messageId) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.emit('messageAction', { messageId, action: 'reply' });
        break;
      case 'Delete':
        e.preventDefault();
        this.emit('messageAction', { messageId, action: 'delete' });
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._focusPreviousMessage(element);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this._focusNextMessage(element);
        break;
    }
  }

  _focusNextMessage(currentElement) {
    const items = Array.from(this.element.querySelectorAll('[data-message-id]'));
    const currentIndex = items.indexOf(currentElement);
    if (currentIndex < items.length - 1) {
      items[currentIndex + 1].focus();
    }
  }

  _focusPreviousMessage(currentElement) {
    const items = Array.from(this.element.querySelectorAll('[data-message-id]'));
    const currentIndex = items.indexOf(currentElement);
    if (currentIndex > 0) {
      items[currentIndex - 1].focus();
    }
  }

  _handleScroll() {
    const container = this.getRef('messagesContainer');
    if (container && container.scrollTop < this.loadMoreThreshold && !this.isLoading && this.hasMoreMessages) {
      const firstMessage = this.messages[0];
      if (firstMessage) {
        this._loadMessages(firstMessage.timestamp);
      }
    }
  }

  _toggleEmojiPicker() {
    this.emojiPickerOpen = !this.emojiPickerOpen;
    this.update();

    if (this.emojiPickerOpen) {
      // Focus first emoji after render
      requestAnimationFrame(() => {
        const firstEmoji = this.element.querySelector('.emoji-item');
        firstEmoji?.focus();
      });
    }
  }

  _closeEmojiPicker() {
    if (this.emojiPickerOpen) {
      this.emojiPickerOpen = false;
      this.update();
    }
  }

  _handleEmojiSelect(e, element) {
    const emoji = element.getAttribute('data-emoji');
    if (emoji) {
      const input = this.getRef('messageInput');
      if (input) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        input.value = input.value.slice(0, start) + emoji + input.value.slice(end);
        input.selectionStart = input.selectionEnd = start + emoji.length;
        input.dispatchEvent(new Event('input'));
        input.focus();
      }
    }
  }

  _scrollToBottom(smooth = true) {
    const container = this.getRef('messagesContainer');
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant'
      });
    }
  }

  _getSenderName(message) {
    if (message.senderId === this.chatService.currentUserId) {
      return 'You';
    }
    if (this.conversation && this.conversation.type === 'direct') {
      const otherId = this.conversation.participants.find(p => p !== this.chatService.currentUserId);
      const user = this.chatService.users?.get(otherId);
      return user?.name || 'Someone';
    }
    return 'Someone';
  }

  _formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
      date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  _getStatusIcon(status) {
    switch (status) {
      case MessageStatus.READ:
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 6L7 17l-5-5"/><path d="M22 10L11 21l-5-5"/></svg>`;
      case MessageStatus.DELIVERED:
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L7 17l-5-5"/><path d="M22 10L11 21l-5-5"/></svg>`;
      case MessageStatus.FAILED:
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
      default:
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;
    }
  }

  _getStatusLabel(status) {
    switch (status) {
      case MessageStatus.SENDING: return 'Sending...';
      case MessageStatus.SENT: return 'Sent';
      case MessageStatus.DELIVERED: return 'Delivered';
      case MessageStatus.READ: return 'Read';
      case MessageStatus.FAILED: return 'Failed to send';
      default: return '';
    }
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  _renderEmojiPicker() {
    const emojis = [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚',
      '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
      '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
      '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲',
      '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱',
      '😭', '😤', '😠', '😡', '🤬', '😈', '👿', '💀', '☠️', '💩',
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏', '🙌', '🙏',
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '🔥', '✨', '💯', '🎉', '🎊', '🎈', '🎁', '🎂', '🍰', '🍕',
      '🍔', '🍟', '🌭', '🍿', '🍩', '🍪', '🍫', '🍎', '🍏', '🍌'
    ];

    return emojis.map(emoji => `
      <button
        class="emoji-item"
        data-emoji="${emoji}"
        data-action="emoji-item"
        role="option"
        tabindex="-1"
        aria-label="${emoji}"
      >${emoji}</button>
    `).join('');
  }

  render() {
    if (!this.conversationId) {
      return this._renderEmptyState();
    }

    const otherParticipant = this._getOtherParticipant();
    const isOnline = otherParticipant?.status === 'online';

    return `
      <div class="chat-window" role="region" aria-label="Chat with ${otherParticipant?.name || 'Unknown'}">
        ${!this.conversation ? this._renderLoading() : ''}

        <header class="chat-header" ${!this.conversation ? 'style="display:none"' : ''}>
          <div class="chat-header-avatar">
            <img src="${otherParticipant?.avatar || ''}" alt="" width="40" height="40" loading="lazy">
            ${isOnline ? '<span class="online-indicator" aria-label="Online"></span>' : ''}
          </div>
          <div class="chat-header-info">
            <h2 class="chat-name">${this._escapeHtml(otherParticipant?.name || 'Unknown')}</h2>
            <span class="chat-status" aria-live="polite">
              ${isOnline ? 'Online' : (otherParticipant?.lastSeen ? `Last seen ${this._formatTime(otherParticipant.lastSeen)}` : 'Offline')}
              ${this.typingUsers.size > 0 ? `, ${Array.from(this.typingUsers).map(id => this.chatService.users?.get(id)?.name).join(', ')} typing...` : ''}
            </span>
          </div>
          <div class="chat-header-actions">
            <button class="icon-btn" data-action="attach" aria-label="Attach file">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
              </svg>
            </button>
            <button class="icon-btn" aria-label="Voice call">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </button>
            <button class="icon-btn" aria-label="Video call">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </button>
            <button class="icon-btn" aria-label="More options">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="19" cy="12" r="1"/>
                <circle cx="5" cy="12" r="1"/>
              </svg>
            </button>
          </div>
        </header>

        <div class="messages-container" ref="messagesContainer" role="log" aria-live="polite" aria-label="Messages" tabindex="0">
          <div ref="loadMoreSentinel" class="load-more-sentinel" aria-hidden="true"></div>
          ${this.messages.length === 0 ? `
            <div class="no-messages" role="status">
              <p>No messages yet</p>
              <p class="hint">Send a message to start the conversation</p>
            </div>
          ` : this.messages.map(msg => this._renderMessage(msg)).join('')}
        </div>

        ${this.typingUsers.size > 0 ? `
          <div class="typing-indicator" aria-live="polite">
            <span class="typing-dots">
              <span></span><span></span><span></span>
            </span>
            <span>${Array.from(this.typingUsers).map(id => this.chatService.users?.get(id)?.name).join(', ')} typing...</span>
          </div>
        ` : ''}

        <footer class="message-input-area" ${!this.conversation ? 'style="display:none"' : ''}>
          <div class="input-wrapper">
            <button class="icon-btn emoji-toggle" data-action="emoji-toggle" aria-label="${this.emojiPickerOpen ? 'Close emoji picker' : 'Open emoji picker'}" aria-expanded="${this.emojiPickerOpen}">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </button>
            <div class="input-container">
              <textarea
                class="message-input"
                ref="messageInput"
                placeholder="Type a message..."
                aria-label="Message input"
                rows="1"
                data-action-input="message-input"
                data-action-keydown="message-input"
                data-action-focus="message-input"
                data-action-blur="message-input"
              >${this._escapeHtml(this.draft)}</textarea>
            </div>
            <button class="icon-btn send-btn" data-action="send" aria-label="Send message" ${!this.draft.trim() ? 'disabled' : ''}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>

          ${this.emojiPickerOpen ? `
            <div class="emoji-picker" role="dialog" aria-label="Emoji picker">
              <div class="emoji-picker-header">
                <div class="emoji-tabs" role="tablist">
                  <button class="emoji-tab active" role="tab" aria-selected="true" data-category="smileys">😀</button>
                  <button class="emoji-tab" role="tab" aria-selected="false" data-category="people">👤</button>
                  <button class="emoji-tab" role="tab" aria-selected="false" data-category="activities">⚽</button>
                  <button class="emoji-tab" role="tab" aria-selected="false" data-category="objects">🍕</button>
                  <button class="emoji-tab" role="tab" aria-selected="false" data-category="symbols">❤️</button>
                </div>
              </div>
              <div class="emoji-picker-body" role="tabpanel" aria-label="Emojis">
                ${this._renderEmojiPicker()}
              </div>
              <button class="emoji-close" data-action="emoji-close" aria-label="Close emoji picker">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ` : ''}
        </footer>
      </div>
    `;
  }

  _renderEmptyState() {
    return `
      <div class="chat-empty-state" role="status">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <circle cx="60" cy="60" r="60" fill="#E8F5E9"/>
          <path d="M85 35L60 52L35 39V70C35 79.0457 42.4543 86.5 51.5 86.5H68.5C77.5457 86.5 85 79.0457 85 70V35Z" fill="#00A884"/>
        </svg>
        <h2>Welcome to WhatsApp Clone</h2>
        <p>Select a conversation or start a new chat to begin messaging</p>
      </div>
    `;
  }

  _renderLoading() {
    return `
      <div class="chat-loading" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <p>Loading conversation...</p>
      </div>
    `;
  }

  _renderMessage(message) {
    const isOwn = message.senderId === this.chatService.currentUserId;
    const showSender = !isOwn && this.conversation?.type === 'group';
    const time = this._formatTime(message.timestamp);
    const statusIcon = isOwn ? this._getStatusIcon(message.status) : '';
    const statusLabel = isOwn ? this._getStatusLabel(message.status) : '';

    let content = '';
    switch (message.type) {
      case 'image':
        content = `<img src="${message.mediaUrl}" alt="${this._escapeHtml(message.content || 'Image')}" class="message-image" loading="lazy">`;
        break;
      case 'voice':
        content = `
          <div class="voice-message">
            <button class="voice-play" aria-label="Play voice message">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
            </button>
            <div class="voice-wave"></div>
            <span class="voice-duration">${message.content || '0:00'}</span>
          </div>
        `;
        break;
      default:
        content = `<span class="message-text">${this._escapeHtml(message.content)}</span>`;
    }

    const replyHtml = message.replyTo ? `
      <div class="message-reply">
        <span class="reply-name">${this._escapeHtml(message.replyTo.senderName)}</span>
        <span class="reply-text">${this._escapeHtml(message.replyTo.content)}</span>
      </div>
    ` : '';

    return `
      <div
        class="message ${isOwn ? 'sent' : 'received'} ${message.edited ? 'edited' : ''} ${message.deleted ? 'deleted' : ''}"
        data-message-id="${message.id}"
        data-action="message"
        data-action-keydown="message"
        role="listitem"
        tabindex="0"
        aria-label="${isOwn ? 'Your message' : 'Message from ' + this._getSenderName(message)} ${content.replace(/<[^>]*>/g, '')}, ${time}${message.edited ? ', edited' : ''}"
      >
        ${showSender ? `<span class="message-sender" aria-hidden="true">${this._escapeHtml(this._getSenderName(message))}</span>` : ''}
        <div class="message-bubble">
          ${replyHtml}
          <div class="message-content">${content}</div>
          <div class="message-meta">
            <time class="message-time" datetime="${new Date(message.timestamp).toISOString()}">${time}</time>
            ${isOwn ? `
              <span class="message-status" aria-label="${statusLabel}">
                ${statusIcon}
              </span>
            ` : ''}
          </div>
        </div>
        ${message.reactions && message.reactions.length > 0 ? `
          <div class="message-reactions" aria-label="Reactions">
            ${message.reactions.map(r => `
              <span class="reaction" aria-label="${r.emoji}, ${r.count} ${r.count === 1 ? 'reaction' : 'reactions'}">
                ${r.emoji}${r.count > 1 ? `<span class="reaction-count">${r.count}</span>` : ''}
              </span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  _getOtherParticipant() {
    if (!this.conversation) return null;
    if (this.conversation.type === 'group') return this.conversation;
    const otherId = this.conversation.participants.find(p => p !== this.chatService.currentUserId);
    return this.chatService.users?.get(otherId) || { name: 'Unknown', avatar: '', status: 'offline' };
  }
}

export default ChatWindow;