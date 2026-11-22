/**
 * Contact List Component
 *
 * Displays list of conversations with search, filtering, and virtualization.
 * Fully accessible with keyboard navigation.
 */

import { Component } from './Component.js';
import { ChatEvents } from '../services/chatService.js';
import { Logo } from './Logo.js';

export class ContactList extends Component {
  constructor(chatService, options = {}) {
    super(options);
    this.chatService = chatService;
    this.logo = new Logo(32);
    this.conversations = [];
    this.filteredConversations = [];
    this.searchQuery = '';
    this.selectedConversationId = null;
    this.unsubscribe = null;
    this.searchDebounceTimer = null;

    // Bind event handlers
    this.on('click', 'conversation', this._handleConversationClick.bind(this));
    this.on('input', 'search', this._handleSearch.bind(this));
    this.on('click', 'clear-search', this._clearSearch.bind(this));
    this.on('click', 'new-chat', this._handleNewChat.bind(this));
    this.on('keydown', 'conversation', this._handleKeyDown.bind(this));
    this.on('keydown', 'search', this._handleSearchKeyDown.bind(this));
  }

  async onMount() {
    await this._loadConversations();
    this._subscribeToEvents();
    this._renderConversations();
  }

  onUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
  }

  async _loadConversations() {
    try {
      this.conversations = await this.chatService.getConversations();
      this.filteredConversations = [...this.conversations];
      this.update();
    } catch (error) {
      console.error('Failed to load conversations:', error);
      Component.announce('Failed to load conversations', 'assertive');
    }
  }

  _subscribeToEvents() {
    this.unsubscribe = this.chatService.subscribe({
      [ChatEvents.CONVERSATION_CREATED]: (conversation) => this._handleConversationCreated(conversation),
      [ChatEvents.CONVERSATION_UPDATED]: (conversation) => this._handleConversationUpdated(conversation),
      [ChatEvents.CONVERSATION_DELETED]: (conversationId) => this._handleConversationDeleted(conversationId),
      [ChatEvents.MESSAGE_RECEIVED]: (message) => this._handleMessageReceived(message),
      [ChatEvents.DRAFT_UPDATED]: ({ conversationId, draft }) => this._handleDraftUpdated(conversationId, draft)
    });
  }

  _handleConversationCreated(conversation) {
    this.conversations.unshift(conversation);
    this._filterConversations();
    this.update();
  }

  _handleConversationUpdated(conversation) {
    const index = this.conversations.findIndex(c => c.id === conversation.id);
    if (index !== -1) {
      this.conversations[index] = conversation;
      // Re-sort
      this.conversations.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0);
      });
      this._filterConversations();
      this.update();
    }
  }

  _handleConversationDeleted(conversationId) {
    this.conversations = this.conversations.filter(c => c.id !== conversationId);
    this._filterConversations();
    if (this.selectedConversationId === conversationId) {
      this.selectedConversationId = null;
    }
    this.update();
  }

  _handleMessageReceived(message) {
    const conversation = this.conversations.find(c => c.id === message.conversationId);
    if (conversation) {
      conversation.lastMessage = message;
      conversation.updatedAt = message.timestamp;
      if (message.senderId !== this.chatService.currentUserId && this.selectedConversationId !== conversation.id) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      }
      this.conversations.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0);
      });
      this._filterConversations();
      this.update();
    }
  }

  _handleDraftUpdated(conversationId, draft) {
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.draft = draft;
      this.update();
    }
  }

  _handleConversationClick(e, element) {
    const conversationId = element.getAttribute('data-conversation-id');
    if (conversationId) {
      this.selectConversation(conversationId);
      this.emit('conversationSelect', conversationId);
    }
  }

  _handleKeyDown(e, element) {
    const conversationId = element.getAttribute('data-conversation-id');
    if (!conversationId) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.selectConversation(conversationId);
        this.emit('conversationSelect', conversationId);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this._focusNextConversation(element);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._focusPreviousConversation(element);
        break;
      case 'Delete':
        e.preventDefault();
        this.emit('conversationDelete', conversationId);
        break;
      case 'Enter':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.emit('conversationPin', conversationId);
        }
        break;
    }
  }

  _handleSearch(e, element) {
    const query = e.target.value;

    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = setTimeout(() => {
      this.searchQuery = query;
      this._filterConversations();
      this.update();
    }, 150);
  }

  _handleSearchKeyDown(e, element) {
    if (e.key === 'Escape') {
      element.blur();
      this._clearSearch();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const firstConv = this.element.querySelector('[data-conversation-id]');
      firstConv?.focus();
    }
  }

  _clearSearch() {
    this.searchQuery = '';
    const searchInput = this.getRef('searchInput');
    if (searchInput) {
      searchInput.value = '';
    }
    this._filterConversations();
    this.update();
  }

  _handleNewChat() {
    this.emit('newChat');
  }

  _filterConversations() {
    if (!this.searchQuery.trim()) {
      this.filteredConversations = [...this.conversations];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredConversations = this.conversations.filter(conv => {
        const otherParticipant = this._getOtherParticipant(conv);
        if (!otherParticipant) return false;
        return otherParticipant.name.toLowerCase().includes(query);
      });
    }
  }

  _getOtherParticipant(conversation) {
    if (conversation.type === 'group') return conversation;
    const otherId = conversation.participants.find(p => p !== this.chatService.currentUserId);
    return this.chatService.users?.get(otherId) || { name: 'Unknown', avatar: '' };
  }

  selectConversation(conversationId) {
    this.selectedConversationId = conversationId;
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
      this.chatService.markAsRead(conversationId, []);
    }
    this.update();
  }

  _focusNextConversation(currentElement) {
    const items = Array.from(this.element.querySelectorAll('[data-conversation-id]'));
    const currentIndex = items.indexOf(currentElement);
    if (currentIndex < items.length - 1) {
      items[currentIndex + 1].focus();
    }
  }

  _focusPreviousConversation(currentElement) {
    const items = Array.from(this.element.querySelectorAll('[data-conversation-id]'));
    const currentIndex = items.indexOf(currentElement);
    if (currentIndex > 0) {
      items[currentIndex - 1].focus();
    }
  }

  _formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  _getStatusIcon(status) {
    switch (status) {
      case 'read':
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 6L7 17l-5-5"/><path d="M22 10L11 21l-5-5"/></svg>`;
      case 'delivered':
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L7 17l-5-5"/><path d="M22 10L11 21l-5-5"/></svg>`;
      default:
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;
    }
  }

  render() {
    const logoHtml = this.logo.render();
    return `
      <div class="contact-list" role="list" aria-label="Conversations">
        <div class="sidebar-header">
          ${logoHtml}
        </div>
        <div class="contact-list-header">
          <div class="search-wrapper" ref="searchWrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              class="search-input"
              ref="searchInput"
              placeholder="Search conversations..."
              aria-label="Search conversations"
              data-action-input="search"
              autocomplete="off"
              value="${this.searchQuery}"
            >
            ${this.searchQuery ? `
              <button class="clear-search" data-action="clear-search" aria-label="Clear search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            ` : ''}
          </div>
        </div>

        <button class="new-chat-btn" data-action="new-chat" aria-label="New chat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>New Chat</span>
        </button>

        <div class="conversations-list" role="listbox" aria-label="Conversation list">
          ${this.filteredConversations.length === 0 ? `
            <div class="no-conversations" role="status">
              <p>${this.searchQuery ? 'No conversations found' : 'No conversations yet'}</p>
              ${!this.searchQuery ? '<button class="btn-primary" data-action="new-chat">Start a new chat</button>' : ''}
            </div>
          ` : this.filteredConversations.map(conv => this._renderConversation(conv)).join('')}
        </div>
      </div>
    `;
  }

  _renderConversation(conversation) {
    const otherParticipant = this._getOtherParticipant(conversation);
    const lastMessage = conversation.lastMessage;
    const isSelected = this.selectedConversationId === conversation.id;
    const isOnline = otherParticipant.status === 'online';
    const unreadCount = conversation.unreadCount || 0;
    const hasDraft = conversation.draft && conversation.draft.trim();

    let lastMessageContent = '';
    let lastMessageTime = '';
    let statusIcon = '';

    if (lastMessage) {
      const isOwn = lastMessage.senderId === this.chatService.currentUserId;
      const prefix = isOwn ? 'You: ' : '';
      lastMessageContent = `${prefix}${lastMessage.content}`;
      lastMessageTime = this._formatTime(lastMessage.timestamp);
      statusIcon = isOwn ? this._getStatusIcon(lastMessage.status) : '';
    } else if (hasDraft) {
      lastMessageContent = `Draft: ${conversation.draft}`;
      lastMessageTime = '';
    } else {
      lastMessageContent = 'No messages yet';
      lastMessageTime = '';
    }

    const statusClass = isOnline ? 'online' : 'offline';
    const selectedClass = isSelected ? 'selected' : '';
    const unreadClass = unreadCount > 0 ? 'unread' : '';
    const pinnedClass = conversation.isPinned ? 'pinned' : '';
    const mutedClass = conversation.isMuted ? 'muted' : '';

    return `
      <div
        class="conversation-item ${selectedClass} ${unreadClass} ${pinnedClass} ${mutedClass}"
        data-conversation-id="${conversation.id}"
        data-action="conversation"
        data-action-keydown="conversation"
        role="option"
        aria-selected="${isSelected}"
        tabindex="${isSelected ? '0' : '-1'}"
        aria-label="${otherParticipant.name}${unreadCount > 0 ? `, ${unreadCount} unread messages` : ''}${conversation.isMuted ? ', muted' : ''}${conversation.isPinned ? ', pinned' : ''}"
      >
        <div class="conversation-avatar">
          <img src="${otherParticipant.avatar}" alt="" loading="lazy" width="48" height="48">
          ${isOnline ? '<span class="online-indicator" aria-label="Online"></span>' : ''}
          ${conversation.isMuted ? '<span class="muted-indicator" aria-label="Muted"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg></span>' : ''}
        </div>
        <div class="conversation-info">
          <div class="conversation-header">
            <h3 class="conversation-name">${this._escapeHtml(otherParticipant.name)}</h3>
            <time class="conversation-time" datetime="${lastMessage ? new Date(lastMessage.timestamp).toISOString() : ''}">${lastMessageTime}</time>
          </div>
          <div class="conversation-preview">
            ${statusIcon}
            <span class="${hasDraft ? 'draft' : ''}">${this._escapeHtml(lastMessageContent)}</span>
            ${unreadCount > 0 ? `<span class="unread-badge" aria-label="${unreadCount} unread">${unreadCount}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default ContactList;