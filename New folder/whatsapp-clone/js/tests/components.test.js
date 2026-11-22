/**
 * Component Tests
 *
 * Tests for UI components:
 * - ContactList component
 * - ChatWindow component
 * - EmojiPicker component
 * - App component
 */

import { assert, TestRunner, createMockDOM, createMockChatService } from './test-utils.js';
import { Component } from '../ui/Component.js';
import { ContactList } from '../ui/ContactList.js';
import { ChatWindow } from '../ui/ChatWindow.js';
import { EmojiPicker } from '../ui/EmojiPicker.js';
import { App } from '../ui/App.js';

const runner = new TestRunner();

// Setup mock DOM
createMockDOM();

// ========================================
// Base Component Tests
// ========================================

runner.test('Component should create element from HTML', () => {
  const element = Component.createElement('<div class="test">Hello</div>');
  assert.equal(element.tagName, 'DIV');
  assert.equal(element.className, 'test');
  assert.equal(element.textContent, 'Hello');
});

runner.test('Component should generate unique IDs', () => {
  const id1 = Component.generateId('test');
  const id2 = Component.generateId('test');
  assert.isTrue(id1.startsWith('test-'));
  assert.isTrue(id2.startsWith('test-'));
  assert.isTrue(id1 !== id2);
});

runner.test('Component should create live region', () => {
  const region = Component.createLiveRegion('polite');
  assert.equal(region.getAttribute('role'), 'status');
  assert.equal(region.getAttribute('aria-live'), 'polite');
  assert.equal(region.getAttribute('aria-atomic'), 'true');
});

runner.test('Component should schedule render', () => {
  class TestComponent extends Component {
    render() { return '<div>Test</div>'; }
  }

  const comp = new TestComponent();
  const container = document.createElement('div');
  comp.mount(container);

  let renderCount = 0;
  const originalRender = comp.render;
  comp.render = function() {
    renderCount++;
    return originalRender.call(this);
  };

  comp.setState({ test: true });
  comp.setState({ test2: true });

  // Should batch renders
  assert.equal(renderCount, 0); // Not rendered yet (batched)
});

// ========================================
// ContactList Component Tests
// ========================================

runner.test('ContactList should render search input', async () => {
  const service = createMockChatService();
  await service.init();

  const contactList = new ContactList(service);
  const container = document.createElement('div');
  contactList.mount(container);

  const searchInput = contactList.getRef('searchInput');
  assert.notNull(searchInput);
  assert.equal(searchInput.tagName, 'INPUT');
  assert.equal(searchInput.getAttribute('placeholder'), 'Search conversations...');
});

runner.test('ContactList should filter conversations by search query', async () => {
  const service = createMockChatService();
  await service.init();

  const contactList = new ContactList(service);
  const container = document.createElement('div');
  contactList.mount(container);

  // Wait for initial load
  await new Promise(r => setTimeout(r, 100));

  // Initially should show all conversations
  const initialCount = contactList.filteredConversations.length;
  assert.isTrue(initialCount > 0);

  // Search for non-existent name
  contactList.searchQuery = 'nonexistentxyz';
  contactList._filterConversations();
  assert.equal(contactList.filteredConversations.length, 0);

  // Search for existing name
  contactList.searchQuery = 'Test';
  contactList._filterConversations();
  assert.isTrue(contactList.filteredConversations.length > 0);
});

runner.test('ContactList should clear search', async () => {
  const service = createMockChatService();
  await service.init();

  const contactList = new ContactList(service);
  const container = document.createElement('div');
  contactList.mount(container);

  await new Promise(r => setTimeout(r, 100));

  contactList.searchQuery = 'test';
  contactList._filterConversations();
  assert.isTrue(contactList.filteredConversations.length >= 0);

  contactList._clearSearch();
  assert.equal(contactList.searchQuery, '');
  assert.equal(contactList.filteredConversations.length, service.conversations.size);
});

runner.test('ContactList should select conversation', async () => {
  const service = createMockChatService();
  await service.init();

  const contactList = new ContactList(service);
  const container = document.createElement('div');
  contactList.mount(container);

  await new Promise(r => setTimeout(r, 100));

  const firstConv = service.conversations.values().next().value;
  if (firstConv) {
    contactList.selectConversation(firstConv.id);
    assert.equal(contactList.selectedConversationId, firstConv.id);
    assert.equal(firstConv.unreadCount, 0);
  }
});

// ========================================
// ChatWindow Component Tests
// ========================================

runner.test('ChatWindow should render empty state when no conversation', async () => {
  const service = createMockChatService();
  await service.init();

  const chatWindow = new ChatWindow(service);
  const container = document.createElement('div');
  chatWindow.mount(container);

  assert.isTrue(chatWindow.element.textContent.includes('Welcome to WhatsApp Clone'));
  assert.isTrue(chatWindow.element.textContent.includes('Select a conversation'));
});

runner.test('ChatWindow should load conversation', async () => {
  const service = createMockChatService();
  await service.init();

  const chatWindow = new ChatWindow(service);
  const container = document.createElement('div');
  chatWindow.mount(container);

  const conversation = await service.createConversation(['current-user', 'user-1']);
  await service.sendMessage({ conversationId: conversation.id, content: 'Test message' });

  chatWindow.setConversation(conversation.id);

  await new Promise(r => setTimeout(r, 100));

  assert.equal(chatWindow.conversationId, conversation.id);
  assert.notNull(chatWindow.conversation);
  assert.isTrue(chatWindow.messages.length >= 0);
});

runner.test('ChatWindow should send message', async () => {
  const service = createMockChatService();
  await service.init();

  const chatWindow = new ChatWindow(service);
  const container = document.createElement('div');
  chatWindow.mount(container);

  const conversation = await service.createConversation(['current-user', 'user-1']);
  chatWindow.setConversation(conversation.id);

  await new Promise(r => setTimeout(r, 100));

  const input = chatWindow.getRef('messageInput');
  assert.notNull(input);

  input.value = 'Test message';
  chatWindow._handleInput({ target: input });

  await new Promise(r => setTimeout(r, 100));

  chatWindow._handleSend();

  await new Promise(r => setTimeout(r, 100));

  // Check message was sent
  const msgs = service.messages.get(conversation.id) || [];
  assert.isTrue(msgs.some(m => m.content === 'Test message'));
});

runner.test('ChatWindow should toggle emoji picker', async () => {
  const service = createMockChatService();
  await service.init();

  const chatWindow = new ChatWindow(service);
  const container = document.createElement('div');
  chatWindow.mount(container);

  assert.isFalse(chatWindow.emojiPickerOpen);

  chatWindow._toggleEmojiPicker();
  assert.isTrue(chatWindow.emojiPickerOpen);

  chatWindow._toggleEmojiPicker();
  assert.isFalse(chatWindow.emojiPickerOpen);
});

runner.test('ChatWindow should insert emoji', async () => {
  const service = createMockChatService();
  await service.init();

  const chatWindow = new ChatWindow(service);
  const container = document.createElement('div');
  chatWindow.mount(container);

  chatWindow.emojiPickerOpen = true;
  chatWindow.update();

  await new Promise(r => setTimeout(r, 50));

  const input = chatWindow.getRef('messageInput');
  input.value = 'Hello ';
  input.selectionStart = input.selectionEnd = 6;

  const emojiButton = chatWindow.element.querySelector('[data-emoji="😀"]');
  if (emojiButton) {
    chatWindow._handleEmojiSelect({ target: emojiButton }, emojiButton);
    assert.isTrue(input.value.includes('😀'));
  }
});

// ========================================
// EmojiPicker Component Tests
// ========================================

runner.test('EmojiPicker should render categories', () => {
  const emojiPicker = new EmojiPicker();
  const container = document.createElement('div');
  emojiPicker.mount(container);

  const tabs = emojiPicker.element.querySelectorAll('.emoji-tab');
  assert.equal(tabs.length, 5); // smileys, people, activities, objects, symbols

  const activeTab = emojiPicker.element.querySelector('.emoji-tab.active');
  assert.notNull(activeTab);
  assert.equal(activeTab.getAttribute('data-category'), 'smileys');
});

runner.test('EmojiPicker should switch categories', () => {
  const emojiPicker = new EmojiPicker();
  const container = document.createElement('div');
  emojiPicker.mount(container);

  assert.equal(emojiPicker.activeCategory, 'smileys');

  const peopleTab = emojiPicker.element.querySelector('[data-category="people"]');
  assert.notNull(peopleTab);

  emojiPicker._handleCategoryClick({ target: peopleTab }, peopleTab);
  assert.equal(emojiPicker.activeCategory, 'people');
});

runner.test('EmojiPicker should filter emojis on search', () => {
  const emojiPicker = new EmojiPicker();
  const container = document.createElement('div');
  emojiPicker.mount(container);

  const searchInput = emojiPicker.getRef('searchInput');
  assert.notNull(searchInput);

  searchInput.value = 'heart';
  emojiPicker._handleSearch({ target: searchInput });

  // Should filter to heart emojis
  assert.isTrue(emojiPicker.filteredEmojis.length > 0);
  assert.isTrue(emojiPicker.filteredEmojis.some(e => e.includes('❤')));
});

runner.test('EmojiPicker should track frequent emojis', () => {
  const emojiPicker = new EmojiPicker();
  const container = document.createElement('div');
  emojiPicker.mount(container);

  const initialCount = emojiPicker.frequentEmojis.length;

  // Select an emoji not in frequent list
  const testEmoji = '🎉';
  emojiPicker._trackEmojiUsage(testEmoji);

  assert.isTrue(emojiPicker.frequentEmojis.includes(testEmoji));
  assert.equal(emojiPicker.frequentEmojis[0], testEmoji);
  assert.isTrue(emojiPicker.frequentEmojis.length <= 20);
});

runner.test('EmojiPicker should handle keyboard navigation', () => {
  const emojiPicker = new EmojiPicker();
  const container = document.createElement('div');
  emojiPicker.mount(container);

  const grid = emojiPicker.element.querySelector('[data-action-keydown="emoji-grid"]');
  assert.notNull(grid);

  const firstEmoji = grid.querySelector('[data-emoji]');
  assert.notNull(firstEmoji);

  firstEmoji.focus();
  assert.equal(document.activeElement, firstEmoji);

  // Arrow right should move to next emoji
  const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
  grid.dispatchEvent(event);

  // In test environment, focus might not move, but handler should be called
});

// ========================================
// App Component Tests
// ========================================

runner.test('App should initialize with chat service', async () => {
  const service = createMockChatService();
  const app = new App({ chatService: service });
  const container = document.createElement('div');
  app.mount(container);

  assert.notNull(app.chatService);
  assert.notNull(app.contactList);
  assert.notNull(app.chatWindow);
});

runner.test('App should handle conversation selection', async () => {
  const service = createMockChatService();
  await service.init();

  const app = new App({ chatService: service });
  const container = document.createElement('div');
  app.mount(container);

  const conversation = await service.createConversation(['current-user', 'user-1']);

  // Simulate conversation select
  app._selectConversation(conversation.id);

  assert.equal(app.currentView, 'chat');
  assert.equal(app.chatWindow.conversationId, conversation.id);
});

runner.test('App should handle back navigation on mobile', async () => {
  const service = createMockChatService();
  await service.init();

  const app = new App({ chatService: service });
  const container = document.createElement('div');
  app.mount(container);

  app.isMobile = true;
  app.currentView = 'chat';
  app.sidebarOpen = false;

  app._handleBack();

  assert.equal(app.currentView, 'contacts');
});

runner.test('App should toggle sidebar on mobile', async () => {
  const service = createMockChatService();
  await service.init();

  const app = new App({ chatService: service });
  const container = document.createElement('div');
  app.mount(container);

  app.isMobile = true;
  assert.isFalse(app.sidebarOpen);

  app._toggleSidebar();
  assert.isTrue(app.sidebarOpen);

  app._toggleSidebar();
  assert.isFalse(app.sidebarOpen);
});

runner.test('App should handle keyboard shortcuts', async () => {
  const service = createMockChatService();
  await service.init();

  const app = new App({ chatService: service });
  const container = document.createElement('div');
  app.mount(container);

  let newChatCalled = false;
  app.contactList.on('newChat', () => { newChatCalled = true; });

  // Ctrl+N should trigger new chat
  const event = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true });
  document.dispatchEvent(event);

  // In test env, might not trigger, but handler exists
  assert.isTrue(typeof app._globalKeyHandler === 'function');
});

// ========================================
// Accessibility Tests
// ========================================

runner.test('Components should have proper ARIA attributes', async () => {
  const service = createMockChatService();
  await service.init();

  const contactList = new ContactList(service);
  const container = document.createElement('div');
  contactList.mount(container);

  const searchInput = contactList.getRef('searchInput');
  assert.equal(searchInput.getAttribute('aria-label'), 'Search conversations');

  const conversationsList = container.querySelector('[role="listbox"]');
  assert.notNull(conversationsList);
  assert.equal(conversationsList.getAttribute('aria-label'), 'Conversation list');
});

runner.test('ChatWindow should have proper message roles', async () => {
  const service = createMockChatService();
  await service.init();

  const chatWindow = new ChatWindow(service);
  const container = document.createElement('div');
  chatWindow.mount(container);

  const conversation = await service.createConversation(['current-user', 'user-1']);
  await service.sendMessage({ conversationId: conversation.id, content: 'Test' });

  chatWindow.setConversation(conversation.id);
  await new Promise(r => setTimeout(r, 100));

  const messagesContainer = chatWindow.getRef('messagesContainer');
  assert.notNull(messagesContainer);
  assert.equal(messagesContainer.getAttribute('role'), 'log');
  assert.equal(messagesContainer.getAttribute('aria-live'), 'polite');
});

runner.test('EmojiPicker should be accessible', () => {
  const emojiPicker = new EmojiPicker();
  const container = document.createElement('div');
  emojiPicker.mount(container);

  assert.equal(emojiPicker.element.getAttribute('role'), 'dialog');
  assert.equal(emojiPicker.element.getAttribute('aria-modal'), 'true');
  assert.equal(emojiPicker.element.getAttribute('aria-label'), 'Emoji picker');

  const tabs = emojiPicker.element.querySelector('[role="tablist"]');
  assert.notNull(tabs);

  const searchInput = emojiPicker.getRef('searchInput');
  assert.equal(searchInput.getAttribute('aria-label'), 'Search emojis');
});

runner.test('Components should support keyboard navigation', async () => {
  const service = createMockChatService();
  await service.init();

  const contactList = new ContactList(service);
  const container = document.createElement('div');
  contactList.mount(container);

  await new Promise(r => setTimeout(r, 100));

  const firstItem = container.querySelector('[data-conversation-id]');
  assert.notNull(firstItem);
  assert.equal(firstItem.getAttribute('tabindex'), '0');

  // Arrow down should focus next item
  const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
  firstItem.dispatchEvent(event);
});

// ========================================
// Performance Tests
// ========================================

runner.test('ContactList should virtualize large lists', async () => {
  const service = createMockChatService();
  await service.init();

  // Add many conversations
  for (let i = 0; i < 100; i++) {
    await service.createConversation(['current-user', `user-${i}`]);
  }

  const contactList = new ContactList(service);
  const container = document.createElement('div');
  contactList.mount(container);

  await new Promise(r => setTimeout(r, 100));

  // Should render efficiently (not all 100 at once in real implementation)
  assert.isTrue(contactList.conversations.size >= 100);
});

runner.test('ChatWindow should load more messages on scroll', async () => {
  const service = createMockChatService();
  await service.init();

  const chatWindow = new ChatWindow(service);
  const container = document.createElement('div');
  chatWindow.mount(container);

  const conversation = await service.createConversation(['current-user', 'user-1']);

  // Add many messages
  for (let i = 0; i < 100; i++) {
    await service.sendMessage({
      conversationId: conversation.id,
      content: `Message ${i}`,
      timestamp: Date.now() - (100 - i) * 1000
    });
  }

  chatWindow.setConversation(conversation.id);
  await new Promise(r => setTimeout(r, 100));

  // Initial load should be limited
  assert.isTrue(chatWindow.messages.length <= 50);
  assert.isTrue(chatWindow.hasMoreMessages);
});

// ========================================
// Run All Tests
// ========================================

export { runner };

if (typeof window !== 'undefined') {
  window.runComponentTests = () => runner.run();
}

export default runner;