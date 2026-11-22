/**
 * Main Application Component
 *
 * Orchestrates the entire WhatsApp clone UI:
 * - Contact list sidebar
 * - Chat window
 * - Mobile responsive behavior
 * - Global keyboard shortcuts
 * - Theme management
 */

import { Component } from './Component.js';
import { ContactList } from './ContactList.js';
import { ChatWindow } from './ChatWindow.js';
import { EmojiPicker } from './EmojiPicker.js';
import { Logo } from './Logo.js';
import { MockChatService } from '../services/mockChatService.js';
import { ChatEvents } from '../services/chatService.js';

export class App extends Component {
  constructor(options = {}) {
    super(options);
    this.chatService = options.chatService || new MockChatService();
    this.contactList = null;
    this.chatWindow = null;
    this.currentView = 'contacts'; // 'contacts' | 'chat'
    this.isMobile = window.innerWidth <= 768;
    this.sidebarOpen = false;
    this.unsubscribeResize = null;

    // Bind event handlers
    this.on('click', 'back', this._handleBack.bind(this));
    this.on('click', 'menu-toggle', this._toggleSidebar.bind(this));
    this.on('keydown', 'document', this._handleGlobalKeyDown.bind(this));
  }

  async onMount() {
    // Initialize chat service
    await this.chatService.init();
    this.chatService.setCurrentConversationId(this.chatService.currentConversationId);

    // Create child components
    this.contactList = new ContactList(this.chatService);
    this.chatWindow = new ChatWindow(this.chatService);

    // Mount child components
    this.contactList.mount(this.getRef('sidebar'));
    this.chatWindow.mount(this.getRef('chatArea'));

    // Subscribe to child events
    this.contactList.on('conversationSelect', (conversationId) => this._selectConversation(conversationId));
    this.contactList.on('newChat', () => this._handleNewChat());
    this.contactList.on('conversationDelete', (conversationId) => this._handleDeleteConversation(conversationId));
    this.contactList.on('conversationPin', (conversationId) => this._handlePinConversation(conversationId));

    this.chatWindow.on('messageAction', (data) => this._handleMessageAction(data));

    // Setup responsive handling
    this._setupResponsive();
    this._setupGlobalKeyboardShortcuts();

    // Initial render
    this.update();
  }

  onUnmount() {
    if (this.unsubscribeResize) {
      window.removeEventListener('resize', this.unsubscribeResize);
    }
    if (this.contactList) this.contactList.unmount();
    if (this.chatWindow) this.chatWindow.unmount();
    this.chatService.disconnect();
  }

  _setupResponsive() {
    const handleResize = () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;

      if (wasMobile !== this.isMobile) {
        if (!this.isMobile) {
          this.sidebarOpen = false;
        }
        this.update();
      }
    };

    this.unsubscribeResize = handleResize;
    window.addEventListener('resize', handleResize);
  }

  _setupGlobalKeyboardShortcuts() {
    this._globalKeyHandler = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        this._handleNewChat();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = this.contactList?.getRef('searchInput');
        searchInput?.focus();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        // Focus message input if in chat view
        if (this.currentView === 'chat') {
          const msgInput = this.chatWindow?.getRef('messageInput');
          msgInput?.focus();
        }
      } else if (e.key === 'Escape') {
        if (this.isMobile && this.sidebarOpen) {
          this._toggleSidebar();
        }
        this.chatWindow?._closeEmojiPicker();
      }
    };

    document.addEventListener('keydown', this._globalKeyHandler);
  }

  _selectConversation(conversationId) {
    this.chatWindow.setConversation(conversationId);
    this.currentView = 'chat';

    if (this.isMobile) {
      this.sidebarOpen = false;
    }
    this.update();
  }

  _handleBack() {
    this.currentView = 'contacts';
    this.chatWindow.setConversation(null);
    this.update();
  }

  _toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.update();
  }

  _handleNewChat() {
    // For now, just select the first conversation without messages
    const conversations = this.chatService.conversations || [];
    const emptyConv = conversations.find(c => !c.lastMessage && c.type === 'direct');
    if (emptyConv) {
      this._selectConversation(emptyConv.id);
    } else {
      // Create a new conversation with the first available user
      const users = Array.from(this.chatService.users.values()).filter(u => u.id !== this.chatService.currentUserId);
      if (users.length > 0) {
        this.chatService.createConversation([this.chatService.currentUserId, users[0].id]).then(conv => {
          this._selectConversation(conv.id);
        });
      }
    }
  }

  _handleDeleteConversation(conversationId) {
    if (confirm('Delete this conversation?')) {
      this.chatService.setArchived(conversationId, true);
      if (this.currentView === 'chat' && this.chatWindow.conversationId === conversationId) {
        this._handleBack();
      }
    }
  }

  _handlePinConversation(conversationId) {
    const conversation = this.chatService.conversations.get(conversationId);
    if (conversation) {
      this.chatService.setPinned(conversationId, !conversation.isPinned);
    }
  }

  _handleMessageAction(data) {
    switch (data.action) {
      case 'reply':
        // TODO: Implement reply
        break;
      case 'delete':
        this.chatService.deleteMessage(data.messageId, true);
        break;
    }
  }

  _handleGlobalKeyDown(e) {
    this._globalKeyHandler(e);
  }

  render() {
    const sidebarClass = this.sidebarOpen ? 'open' : '';
    const chatAreaClass = this.currentView === 'chat' ? 'active' : '';

    return `
      <div class="app ${this.isMobile ? 'mobile' : ''} ${this.sidebarOpen ? 'sidebar-open' : ''}" role="application">
        <!-- Sidebar -->
        <aside class="sidebar ${sidebarClass}" ref="sidebar" role="complementary" aria-label="Conversations">
          ${this.isMobile ? `
            <button class="sidebar-overlay" data-action="menu-toggle" aria-label="Close sidebar" aria-hidden="true"></button>
          ` : ''}
        </aside>

        <!-- Main Chat Area -->
        <main class="chat-area ${chatAreaClass}" ref="chatArea" role="main" aria-label="Chat">
          ${this.isMobile && this.currentView === 'chat' ? `
            <button class="back-btn" data-action="back" aria-label="Back to conversations">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
            </button>
          ` : ''}
        </main>

        <!-- Mobile Menu Button -->
        ${this.isMobile ? `
          <button class="mobile-menu-btn" data-action="menu-toggle" aria-label="${this.sidebarOpen ? 'Close menu' : 'Open menu'}" aria-expanded="${this.sidebarOpen}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${this.sidebarOpen ? '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' : '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>'}
            </svg>
          </button>
        ` : ''}

        <!-- Live Region for Announcements -->
        <div class="sr-only" aria-live="polite" aria-atomic="true" ref="liveRegion"></div>
      </div>
    `;
  }
}

export default App;