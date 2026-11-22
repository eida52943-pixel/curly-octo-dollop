/**
 * Core Messaging Flow Tests
 *
 * Tests for the essential messaging functionality:
 * - Sending and receiving messages
 * - Message status updates (sent, delivered, read)
 * - Typing indicators
 * - Message editing and deletion
 * - Conversation management
 * - Draft persistence
 * - Search functionality
 */

import { assert, TestRunner, createMockChatService, waitFor } from './test-utils.js';

const runner = new TestRunner();

// ========================================
// Message Sending Tests
// ========================================

runner.test('should send a text message successfully', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);
  assert.notNull(conversation);

  const message = await service.sendMessage({
    conversationId: conversation.id,
    content: 'Hello, world!'
  });

  assert.equal(message.content, 'Hello, world!');
  assert.equal(message.senderId, 'current-user');
  assert.equal(message.status, 'sent');
  assert.notNull(message.id);
  assert.notNull(message.timestamp);
});

runner.test('should update message status to delivered then read', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);
  const message = await service.sendMessage({
    conversationId: conversation.id,
    content: 'Test message'
  });

  // Wait for status updates (simulated in mock)
  await waitFor(() => {
    const msgs = service.messages.get(conversation.id) || [];
    const msg = msgs.find(m => m.id === message.id);
    return msg && msg.status === 'read';
  }, 5000);

  const updatedMsgs = service.messages.get(conversation.id) || [];
  const updatedMsg = updatedMsgs.find(m => m.id === message.id);
  assert.equal(updatedMsg.status, 'read');
});

runner.test('should handle empty message content', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);

  // Empty message should not be sent (handled at UI level)
  // But service should accept it
  const message = await service.sendMessage({
    conversationId: conversation.id,
    content: ''
  });

  assert.equal(message.content, '');
});

// ========================================
// Message Editing Tests
// ========================================

runner.test('should edit a message', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);
  const message = await service.sendMessage({
    conversationId: conversation.id,
    content: 'Original message'
  });

  const edited = await service.editMessage(message.id, 'Edited message');

  assert.equal(edited.content, 'Edited message');
  assert.equal(edited.edited, true);
});

runner.test('should throw when editing non-existent message', async () => {
  const service = createMockChatService();
  await service.init();

  await assert.throws(
    () => service.editMessage('non-existent-id', 'New content'),
    Error,
    'Should throw when editing non-existent message'
  );
});

// ========================================
// Message Deletion Tests
// ========================================

runner.test('should delete message for everyone', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);
  const message = await service.sendMessage({
    conversationId: conversation.id,
    content: 'Message to delete'
  });

  await service.deleteMessage(message.id, true);

  const msgs = service.messages.get(conversation.id) || [];
  const deletedMsg = msgs.find(m => m.id === message.id);
  assert.isNull(deletedMsg);
});

runner.test('should mark message as deleted for self only', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);
  const message = await service.sendMessage({
    conversationId: conversation.id,
    content: 'Message to delete'
  });

  await service.deleteMessage(message.id, false);

  const msgs = service.messages.get(conversation.id) || [];
  const deletedMsg = msgs.find(m => m.id === message.id);
  assert.notNull(deletedMsg);
  assert.equal(deletedMsg.content, 'This message was deleted');
  assert.equal(deletedMsg.deleted, true);
});

// ========================================
// Conversation Management Tests
// ========================================

runner.test('should create a new conversation', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);

  assert.notNull(conversation);
  assert.equal(conversation.participants.length, 2);
  assert.equal(conversation.type, 'direct');
  assert.equal(conversation.unreadCount, 0);
});

runner.test('should return existing direct conversation', async () => {
  const service = createMockChatService();
  await service.init();

  const conv1 = await service.createConversation(['current-user', 'user-1']);
  const conv2 = await service.createConversation(['current-user', 'user-1']);

  assert.equal(conv1.id, conv2.id);
});

runner.test('should pin/unpin conversation', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);
  assert.isFalse(conversation.isPinned);

  await service.setPinned(conversation.id, true);
  const pinned = service.conversations.get(conversation.id);
  assert.isTrue(pinned.isPinned);

  await service.setPinned(conversation.id, false);
  const unpinned = service.conversations.get(conversation.id);
  assert.isFalse(unpinned.isPinned);
});

runner.test('should mute/unmute conversation', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);
  assert.isFalse(conversation.isMuted);

  await service.setMuted(conversation.id, true);
  const muted = service.conversations.get(conversation.id);
  assert.isTrue(muted.isMuted);

  await service.setMuted(conversation.id, false);
  const unmuted = service.conversations.get(conversation.id);
  assert.isFalse(unmuted.isMuted);
});

runner.test('should archive/unarchive conversation', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);
  assert.isFalse(conversation.isArchived);

  await service.setArchived(conversation.id, true);
  const archived = service.conversations.get(conversation.id);
  assert.isTrue(archived.isArchived);
});

// ========================================
// Draft Persistence Tests
// ========================================

runner.test('should persist draft message', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);

  await service.updateDraft(conversation.id, 'Draft message');
  const updated = service.conversations.get(conversation.id);

  assert.equal(updated.draft, 'Draft message');
});

runner.test('should clear draft when message sent', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);
  await service.updateDraft(conversation.id, 'Draft message');

  await service.sendMessage({
    conversationId: conversation.id,
    content: 'Sent message'
  });

  const updated = service.conversations.get(conversation.id);
  assert.equal(updated.draft, '');
});

// ========================================
// Typing Indicator Tests
// ========================================

runner.test('should handle typing indicator events', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);

  let typingStartReceived = false;
  let typingStopReceived = false;

  const unsubscribe = service.subscribe({
    'typing:start': (data) => {
      typingStartReceived = true;
      assert.equal(data.conversationId, conversation.id);
      assert.equal(data.userId, 'current-user');
    },
    'typing:stop': (data) => {
      typingStopReceived = true;
      assert.equal(data.conversationId, conversation.id);
    }
  });

  await service.setTyping(conversation.id, true);
  assert.isTrue(typingStartReceived);

  // Wait for auto-stop
  await waitFor(() => typingStopReceived, 4000);
  assert.isTrue(typingStopReceived);

  unsubscribe();
});

runner.test('should stop typing indicator immediately when set to false', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);

  let typingStopReceived = false;

  const unsubscribe = service.subscribe({
    'typing:stop': () => { typingStopReceived = true; }
  });

  await service.setTyping(conversation.id, true);
  await service.setTyping(conversation.id, false);

  assert.isTrue(typingStopReceived);

  unsubscribe();
});

// ========================================
// Message Search Tests
// ========================================

runner.test('should search messages across conversations', async () => {
  const service = createMockChatService();
  await service.init();

  const conv1 = await service.createConversation(['current-user', 'user-1']);
  const conv2 = await service.createConversation(['current-user', 'user-2']);

  await service.sendMessage({ conversationId: conv1.id, content: 'Hello world' });
  await service.sendMessage({ conversationId: conv1.id, content: 'How are you' });
  await service.sendMessage({ conversationId: conv2.id, content: 'Hello there' });

  const results = await service.searchMessages('hello');

  assert.length(results, 2);
  results.forEach(msg => {
    assert.isTrue(msg.content.toLowerCase().includes('hello'));
  });
});

runner.test('should return empty results for non-matching query', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);
  await service.sendMessage({ conversationId: conversation.id, content: 'Hello world' });

  const results = await service.searchMessages('xyz123');

  assert.length(results, 0);
});

// ========================================
// Message Reactions Tests
// ========================================

runner.test('should add reaction to message', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);
  const message = await service.sendMessage({
    conversationId: conversation.id,
    content: 'React to me'
  });

  await service.reactToMessage(message.id, '👍');

  const msgs = service.messages.get(conversation.id) || [];
  const updatedMsg = msgs.find(m => m.id === message.id);

  assert.notNull(updatedMsg.reactions);
  assert.length(updatedMsg.reactions, 1);
  assert.equal(updatedMsg.reactions[0].emoji, '👍');
  assert.equal(updatedMsg.reactions[0].count, 1);
});

runner.test('should increment reaction count for duplicate emoji', async () => {
  const service = createMockChatService();
  await service.init();

  const conversation = await service.createConversation(['current-user', 'user-1']);
  const message = await service.sendMessage({
    conversationId: conversation.id,
    content: 'React to me'
  });

  await service.reactToMessage(message.id, '👍');
  await service.reactToMessage(message.id, '👍');

  const msgs = service.messages.get(conversation.id) || [];
  const updatedMsg = msgs.find(m => m.id === message.id);

  assert.length(updatedMsg.reactions, 1);
  assert.equal(updatedMsg.reactions[0].count, 2);
});

// ========================================
// Media Upload Tests
// ========================================

runner.test('should upload media file', async () => {
  const service = createMockChatService();
  await service.init();

  const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
  const url = await service.uploadMedia(file);

  assert.isTrue(url.startsWith('blob:'));
});

// ========================================
// User Presence Tests
// ========================================

runner.test('should get user presence', async () => {
  const service = createMockChatService();
  await service.init();

  const presence = await service.getUserPresence('user-1');
  assert.equal(presence, 'online');

  const offlinePresence = await service.getUserPresence('non-existent');
  assert.equal(offlinePresence, 'offline');
});

runner.test('should subscribe to presence changes', async () => {
  const service = createMockChatService();
  await service.init();

  let presenceChanged = false;

  const unsubscribe = service.subscribeToPresence(['user-1'], (status) => {
    presenceChanged = true;
    assert.equal(status, 'online');
  });

  // Simulate presence change (in real implementation)
  // The mock doesn't actually trigger this, but the subscription should work
  unsubscribe();
});

// ========================================
// Run All Tests
// ========================================

// Export runner for manual execution
export { runner };

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.runTests = () => runner.run();
}

export default runner;