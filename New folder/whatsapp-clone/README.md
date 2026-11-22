# WhatsApp Web Clone

A professional, accessible WhatsApp Web clone built with clean architecture, featuring a decoupled UI layer and chat service interface that can connect to WebSocket/REST APIs.

## Features

### Core Messaging
- **Real-time messaging** - Send/receive text messages with status tracking (sent, delivered, read)
- **Typing indicators** - Shows when other users are typing
- **Message editing & deletion** - Edit or delete messages (for self or everyone)
- **Message reactions** - React to messages with emojis
- **Message search** - Full-text search across conversations
- **Draft persistence** - Auto-save message drafts per conversation

### Conversation Management
- **Contact list** - Searchable, filterable conversation list with unread badges
- **Pin conversations** - Keep important chats at the top
- **Mute conversations** - Silence notifications with optional duration
- **Archive conversations** - Hide conversations without deleting
- **New chat creation** - Start conversations with any contact

### Rich Media Support
- **Emoji picker** - Categorized emoji picker with search and frequently used
- **Image messages** - Send and display images
- **Voice messages** - Play voice recordings
- **File attachments** - Upload and share files

### Accessibility (WCAG 2.1 AA)
- **Keyboard navigation** - Full keyboard support for all interactions
- **Screen reader support** - Proper ARIA labels, roles, and live regions
- **Focus management** - Visible focus indicators, focus trapping in modals
- **High contrast mode** - Automatic adaptation
- **Reduced motion** - Respects user preferences
- **Semantic HTML** - Proper heading structure, landmarks, and roles

### Performance Optimizations
- **Virtualized lists** - Efficient rendering of large conversation/message lists
- **Lazy loading** - Images and emojis load on demand
- **Debounced search** - Reduces API calls during typing
- **Message pagination** - Load older messages on scroll
- **Batched renders** - Component updates batched in requestAnimationFrame

### Architecture
- **Clean separation** - UI components completely decoupled from data layer
- **Service interface** - `ChatServiceInterface` abstracts WebSocket/REST implementations
- **Event-driven** - Real-time updates via pub/sub event system
- **Type-safe** - JSDoc types for all entities and methods
- **Testable** - Mock service for development, comprehensive test suite

## Project Structure

```
whatsapp-clone/
├── index.html              # Main entry point
├── test.html               # Test runner UI
├── css/
│   └── style.css          # Complete styling with design tokens
├── js/
│   ├── services/
│   │   ├── chatService.js      # Chat service interface (abstract)
│   │   └── mockChatService.js  # In-memory implementation
│   ├── ui/
│   │   ├── Component.js        # Base component class
│   │   ├── App.js              # Main application orchestrator
│   │   ├── ContactList.js      # Conversation list component
│   │   ├── ChatWindow.js       # Message display + input component
│   │   └── EmojiPicker.js      # Emoji picker component
│   ├── tests/
│   │   ├── test-utils.js       # Testing utilities & mocks
│   │   ├── messaging-flows.test.js  # Core messaging tests
│   │   └── components.test.js  # Component tests
│   └── utils/               # Utility functions (future)
└── assets/                  # Static assets (future)
```

## Getting Started

### Prerequisites
- Modern browser with ES modules support
- Local web server (for ES modules and fetch)

### Installation

```bash
# Clone or navigate to project
cd whatsapp-clone

# Start a local server (choose one)
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

Open `http://localhost:8000` in your browser.

### Running Tests

Open `test.html` in your browser, or run tests programmatically:

```javascript
// In browser console
await runTests();  // Runs all tests via test.html UI
```

Or via module imports:

```javascript
import { runner as messagingRunner } from './js/tests/messaging-flows.test.js';
import { runner as componentRunner } from './js/tests/components.test.js';

await messagingRunner.run();
await componentRunner.run();
```

## Architecture Overview

### Chat Service Interface

The `ChatServiceInterface` defines the contract for all chat operations:

```javascript
class ChatServiceInterface {
  // Connection
  async init()
  async connect()
  async disconnect()

  // Conversations
  async getConversations()
  async getConversation(id)
  async createConversation(participantIds, options)
  async setPinned(id, pinned)
  async setMuted(id, muted, duration)
  async setArchived(id, archived)

  // Messages
  async getMessages(conversationId, options)
  async sendMessage(message)
  async editMessage(messageId, content)
  async deleteMessage(messageId, forEveryone)
  async markAsRead(conversationId, messageIds)

  // Real-time
  async setTyping(conversationId, isTyping)
  subscribe(handlers)
  subscribeToPresence(userIds, callback)

  // Media & Reactions
  async uploadMedia(file)
  async reactToMessage(messageId, emoji)
  async searchMessages(query)
}
```

### Implementing a Real Backend

Create a new class extending `ChatServiceInterface`:

```javascript
import { ChatServiceInterface, ChatEvents } from './services/chatService.js';

class WebSocketChatService extends ChatServiceInterface {
  constructor(config) {
    super();
    this.ws = null;
    this.config = config;
  }

  async connect() {
    this.ws = new WebSocket(this.config.url);
    this.ws.onmessage = (event) => this._handleMessage(event.data);
    // ...
  }

  async sendMessage(message) {
    this.ws.send(JSON.stringify({ type: 'send', payload: message }));
  }

  // ... implement all abstract methods
}

// Usage
const chatService = new WebSocketChatService({ url: 'wss://api.example.com/ws' });
const app = new App({ chatService });
```

### Event System

Real-time events flow through the subscription system:

```javascript
const unsubscribe = chatService.subscribe({
  [ChatEvents.MESSAGE_RECEIVED]: (message) => { /* UI update */ },
  [ChatEvents.TYPING_START]: (data) => { /* Show typing */ },
  [ChatEvents.PRESENCE_CHANGED]: (data) => { /* Update status */ },
  // ...
});

// Cleanup
unsubscribe();
```

## Component Architecture

### Base Component (`Component.js`)

Lightweight component base with:
- Virtual DOM-like rendering
- State management with batched updates
- Event delegation
- Refs system
- Accessibility helpers
- Lifecycle hooks (`onMount`, `onUnmount`)

### ContactList (`ContactList.js`)

Features:
- Search with debouncing
- Keyboard navigation (arrows, enter, delete)
- Conversation selection
- Unread badges, pin/mute indicators
- Virtualized rendering ready

### ChatWindow (`ChatWindow.js`)

Features:
- Message virtualization with IntersectionObserver
- Typing indicators
- Emoji picker integration
- Message status icons (sent/delivered/read)
- Reply preview
- Reactions display
- Infinite scroll for older messages

### EmojiPicker (`EmojiPicker.js`)

Features:
- 5 categories (smileys, people, activities, objects, symbols)
- Search with name mapping
- Frequently used tracking (localStorage)
- Full keyboard navigation (grid, tabs)
- Focus trapping
- ARIA-compliant dialog

## Design System (CSS)

### Design Tokens

All visual properties defined as CSS custom properties:

```css
:root {
  --color-bg-primary: #f0f2f5;
  --color-text-primary: #111b21;
  --color-accent-primary: #00a884;
  --font-family: 'Instrument Sans', system-ui;
  --spacing-4: 16px;
  --radius-lg: 12px;
  --shadow-md: 0 2px 8px rgba(0,0,0,0.1);
  /* ... */
}
```

### Responsive Breakpoints

- **Desktop**: > 1024px (full sidebar)
- **Tablet**: 768px - 1024px (collapsible sidebar)
- **Mobile**: < 768px (drawer sidebar, bottom sheets)

### Themes

- Light (default)
- Dark (auto via `prefers-color-scheme`)
- High contrast (auto via `prefers-contrast`)

## Accessibility Checklist

- [x] Semantic HTML5 elements
- [x] ARIA roles, states, properties
- [x] Keyboard navigation for all interactive elements
- [x] Focus indicators visible
- [x] Focus trapping in modals/pickers
- [x] Live regions for dynamic content
- [x] Alt text for images
- [x] Color contrast ratios (WCAG AA)
- [x] Reduced motion support
- [x] High contrast mode support
- [x] Screen reader announcements
- [x] Form labels and descriptions

## Testing

### Test Structure

```
js/tests/
├── test-utils.js              # Assertions, runners, mocks
├── messaging-flows.test.js    # 25+ tests for messaging logic
└── components.test.js         # 15+ tests for UI components
```

### Test Coverage Areas

1. **Message sending/receiving** - Status transitions, content validation
2. **Message editing/deletion** - For self/everyone, soft deletes
3. **Conversation management** - Create, pin, mute, archive
4. **Draft persistence** - Auto-save, clear on send
5. **Typing indicators** - Start/stop, auto-timeout
6. **Search** - Cross-conversation, case-insensitive
7. **Reactions** - Add, increment counts
8. **Media upload** - Blob URL generation
9. **Presence** - Online/offline status
10. **Component rendering** - Props, state, events
11. **Keyboard navigation** - Arrows, enter, escape
12. **ARIA compliance** - Roles, labels, live regions
13. **Performance** - Virtualization, pagination

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires ES2020+ features: `crypto.randomUUID`, `IntersectionObserver`, `matchMedia`.

## Future Enhancements

- [ ] WebSocketChatService implementation
- [ ] RestChatService with polling fallback
- [ ] End-to-end encryption (Signal protocol)
- [ ] Message translation
- [ ] Voice/video call integration (WebRTC)
- [ ] Progressive Web App (PWA) support
- [ ] Offline-first with Service Workers
- [ ] Group chat admin features
- [ ] Message threading/replies
- [ ] Custom emoji packs
- [ ] Themes (user-selectable)
- [ ] Message scheduling
- [ ] Read receipts privacy controls

## License

MIT License - Feel free to use for learning or commercial projects.

## Credits

- UI inspired by WhatsApp Web
- Icons: Custom SVG, emoji from Unicode
- Font: Instrument Sans (Google Fonts)
- Avatars: DiceBear Avataaars API