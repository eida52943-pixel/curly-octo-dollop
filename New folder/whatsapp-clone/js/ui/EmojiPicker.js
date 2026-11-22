/**
 * Emoji Picker Component
 *
 * Accessible emoji picker with categories, search, and frequently used.
 * Supports keyboard navigation and screen readers.
 */

import { Component } from './Component.js';

export class EmojiPicker extends Component {
  constructor(options = {}) {
    super(options);
    this.categories = {
      smileys: {
        label: 'Smileys & Emotion',
        icon: '😀',
        emojis: [
          '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
          '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚',
          '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
          '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
          '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
          '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
          '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺',
          '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
          '😞', '😓', '😩', '😫', '🥱', '😤', '😠', '😡', '🤬', '😈',
          '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾',
          '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'
        ]
      },
      people: {
        label: 'People & Body',
        icon: '👤',
        emojis: [
          '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👨‍🦰', '👨‍🦱',
          '👨‍🦳', '👨‍🦲', '👩', '👩‍🦰', '👩‍🦱', '👩‍🦳', '👩‍🦲', '🧓', '👴', '👵',
          '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🙇', '🤦', '🤷', '🧑‍⚕️',
          '👨‍⚕️', '👩‍⚕️', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🧑‍🏫', '👨‍🏫', '👩‍🏫', '🧑‍⚖️', '👨‍⚖️',
          '👩‍⚖️', '🧑‍🌾', '👨‍🌾', '👩‍🌾', '🧑‍🍳', '👨‍🍳', '👩‍🍳', '🧑‍🔧', '👨‍🔧', '👩‍🔧',
          '🧑‍🏭', '👨‍🏭', '👩‍🏭', '🧑‍💼', '👨‍💼', '👩‍💼', '🧑‍🔬', '👨‍🔬', '👩‍🔬', '🧑‍💻',
          '👨‍💻', '👩‍💻', '🧑‍🎤', '👨‍🎤', '👩‍🎤', '🧑‍🎨', '👨‍🎨', '👩‍🎨', '🧑‍✈️', '👨‍✈️',
          '👩‍✈️', '🧑‍🚀', '👨‍🚀', '👩‍🚀', '🧑‍🚒', '👨‍🚒', '👩‍🚒', '👮', '👮‍♂️', '👮‍♀️',
          '🕵️', '🕵️‍♂️', '🕵️‍♀️', '💂', '💂‍♂️', '💂‍♀️', '🥷', '👷', '👷‍♂️', '👷‍♀️',
          '🤴', '👸', '👳', '👳‍♂️', '👳‍♀️', '👲', '🧕', '🤵', '🤵‍♂️', '🤵‍♀️',
          '👰', '👰‍♂️', '👰‍♀️', '🤰', '🤱', '👼', '🎅', '🤶', '🧑‍🎄', '🦸',
          '🦸‍♂️', '🦸‍♀️', '🦹', '🦹‍♂️', '🦹‍♀️', '🧙', '🧙‍♂️', '🧙‍♀️', '🧚', '🧚‍♂️',
          '🧚‍♀️', '🧛', '🧛‍♂️', '🧛‍♀️', '🧜', '🧜‍♂️', '🧜‍♀️', '🧝', '🧝‍♂️', '🧝‍♀️',
          '🧞', '🧞‍♂️', '🧞‍♀️', '🧟', '🧟‍♂️', '🧟‍♀️', '💅', '🤳', '💪', '🦾',
          '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀',
          '👁️', '👅', '👄', '💋', '🩸', '🩹', '🩺', '💊', '💉', '🩻'
        ]
      },
      activities: {
        label: 'Activities',
        icon: '⚽',
        emojis: [
          '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸',
          '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣',
          '🤿', '🥽', '🥼', '🥻', '🎽', '🛹', '🛷', '⛸️', '🎿', '🏂',
          '🏃', '🏃‍♂️', '🏃‍♀️', '💃', '🕺', '🕴️', '👯', '👯‍♂️', '👯‍♀️', '🧖',
          '🧖‍♂️', '🧖‍♀️', '🧗', '🧗‍♂️', '🧗‍♀️', '🤸', '🤸‍♂️', '🤸‍♀️', '⛹️', '⛹️‍♂️',
          '⛹️‍♀️', '🤾', '🤾‍♂️', '🤾‍♀️', '🤽', '🤽‍♂️', '🤽‍♀️', '🏋️', '🏋️‍♂️', '🏋️‍♀️',
          '🤺', '🤼', '🤼‍♂️', '🤼‍♀️', '🤾', '🤾‍♂️', '🤾‍♀️', '🏌️', '🏌️‍♂️', '🏌️‍♀️',
          '🏇', '🧘', '🧘‍♂️', '🧘‍♀️', '🛀', '🛌', '🎮', '🕹️', '🎰', '🎲',
          '🧩', '🎯', '🎳', '🎮', '🕹️', '🎰', '🎲', '🧩', '🎯', '🎳'
        ]
      },
      objects: {
        label: 'Objects',
        icon: '💻',
        emojis: [
          '📱', '📲', '☎️', '📞', '📟', '📠', '🔋', '🔌', '💻', '🖥️',
          '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '🧮', '🎥',
          '🎬', '📽️', '📹', '📷', '📸', '📹', '📷', '📸', '📹', '🎞️',
          '📼', '🔍', '🔎', '🕯️', '💡', '🔦', '🏮', '🪔', '📔', '📕',
          '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄',
          '📰', '🗞️', '📑', '🔖', '🏷️', '💰', '💴', '💵', '💶', '💷',
          '💸', '💳', '🧾', '💹', '💱', '💲', '✉️', '📧', '📨', '📩',
          '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳️', '✏️',
          '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📝', '💼', '📁', '📂', '🗂️',
          '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋', '📌',
          '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️', '🔒',
          '🔓', '🔏', '🔐', '🔑', '🗝️', '🔨', '🪓', '⛏️', '⚒️', '🛠️',
          '🗡️', '⚔️', '💣', '🪃', '🏹', '🛡️', '🪚', '🔧', '🔩', '⚙️',
          '🗜️', '⚖️', '🦯', '🔗', '⛓️', '🪝', '🧰', '🧲', '🧪', '🧫',
          '🧬', '🔬', '🔭', '📡', '💉', '🩸', '💊', '🩹', '🩺', '🚪',
          '🛏️', '🛋️', '🪑', '🚽', '🚿', '🛁', '🪒', '🧴', '🧷', '🧹',
          '🧺', '🧻', '🧼', '🧽', '🧯', '🛒', '🚬', '⚰️', '⚱️', '🪦',
          '🗿', '🪧', '🧱', '🧲', '🪝', '🪜', '🧱', '🧱', '🧱', '🧱'
        ]
      },
      symbols: {
        label: 'Symbols',
        icon: '❤️',
        emojis: [
          '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
          '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
          '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '☮️',
          '🕎', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎',
          '♏', '♐', '♑', '♒', '♓', '⛎', '🔀', '🔁', '🔂', '▶️',
          '⏩', '⏭️', '⏯️', '◀️', '⏪', '⏮️', '🔼', '⏫', '🔽', '⏬',
          '⏸️', '⏹️', '⏺️', '⏏️', '🎦', '🔅', '🔆', '📶', '📳', '📴',
          '♀️', '♂️', '⚧️', '✖️', '➕', '➖', '➗', '♾️', '‼️', '⁉️',
          '❓', '❔', '❕', '❗', '〰️', '💱', '💲', '⚕️', '♻️', '⚜️',
          '🔱', '📛', '🔰', '⭕', '✅', '☑️', '✔️', '✖️', '❌', '⭕',
          '💯', '💮', '🎓', '🎒', '🎒', '🎒', '🎒', '🎒', '🎒', '🎒'
        ]
      }
    };

    this.activeCategory = 'smileys';
    this.searchQuery = '';
    this.frequentEmojis = this._loadFrequentEmojis();
    this.filteredEmojis = [];
    this.searchDebounceTimer = null;

    // Bind event handlers
    this.on('click', 'category', this._handleCategoryClick.bind(this));
    this.on('input', 'search', this._handleSearch.bind(this));
    this.on('click', 'emoji', this._handleEmojiClick.bind(this));
    this.on('keydown', 'emoji-grid', this._handleKeyDown.bind(this));
    this.on('keydown', 'category', this._handleCategoryKeyDown.bind(this));
    this.on('click', 'close', this._handleClose.bind(this));
  }

  onMount() {
    this._filterEmojis();
    this._setupFocusTrap();
  }

  onUnmount() {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    if (this._focusTrapCleanup) {
      this._focusTrapCleanup();
    }
  }

  _loadFrequentEmojis() {
    try {
      const stored = localStorage.getItem('whatsapp_frequent_emojis');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load frequent emojis:', e);
    }
    return ['😀', '😂', '😍', '😭', '😎', '👍', '👎', '❤️', '🔥', '🎉', '🙏', '😊', '😭', '🤣', '😘', '😂'];
  }

  _saveFrequentEmojis() {
    try {
      localStorage.setItem('whatsapp_frequent_emojis', JSON.stringify(this.frequentEmojis));
    } catch (e) {
      console.error('Failed to save frequent emojis:', e);
    }
  }

  _trackEmojiUsage(emoji) {
    this.frequentEmojis = this.frequentEmojis.filter(e => e !== emoji);
    this.frequentEmojis.unshift(emoji);
    this.frequentEmojis = this.frequentEmojis.slice(0, 20);
    this._saveFrequentEmojis();
    this.update();
  }

  _filterEmojis() {
    if (!this.searchQuery.trim()) {
      this.filteredEmojis = this.categories[this.activeCategory].emojis;
    } else {
      const query = this.searchQuery.toLowerCase();
      const allEmojis = Object.values(this.categories).flatMap(c => c.emojis);
      this.filteredEmojis = allEmojis.filter(emoji => {
        // Simple emoji search by common names
        const names = this._getEmojiNames(emoji);
        return names.some(name => name.toLowerCase().includes(query));
      });
    }
  }

  _getEmojiNames(emoji) {
    // Simplified emoji name mapping for search
    const emojiNames = {
      '😀': ['grinning', 'face', 'smile', 'happy'],
      '😂': ['joy', 'laugh', 'tears', 'funny'],
      '😍': ['heart', 'eyes', 'love', 'crush'],
      '😭': ['cry', 'sad', 'tears', 'weep'],
      '😎': ['cool', 'sunglasses', 'awesome'],
      '👍': ['thumbs', 'up', 'like', 'good'],
      '👎': ['thumbs', 'down', 'dislike', 'bad'],
      '❤️': ['heart', 'love', 'red'],
      '🔥': ['fire', 'hot', 'lit', 'flame'],
      '🎉': ['party', 'celebration', 'tada', 'confetti'],
      '🙏': ['pray', 'thanks', 'please', 'namaste'],
      '😊': ['blush', 'happy', 'smile'],
      '🤣': ['rolling', 'floor', 'laugh', 'rofl'],
      '😘': ['kiss', 'heart', 'love'],
      '🤔': ['thinking', 'hmm', 'ponder'],
      '😴': ['sleep', 'tired', 'zzz'],
      '🤢': ['nauseated', 'sick', 'vomit'],
      '🤮': ['vomiting', 'sick', 'puke'],
      '🥳': ['party', 'celebration', 'woohoo'],
      '😤': ['steam', 'nose', 'angry', 'mad'],
      '😡': ['angry', 'mad', 'pouting', 'red'],
      '🤬': ['cursing', 'swearing', 'angry'],
      '😈': ['devil', 'evil', 'mischief'],
      '💀': ['skull', 'dead', 'death'],
      '☠️': ['skull', 'crossbones', 'danger'],
      '💩': ['poop', 'poo', 'shit'],
      '🤡': ['clown', 'circus', 'funny'],
      '👻': ['ghost', 'halloween', 'spooky'],
      '👽': ['alien', 'ufo', 'space'],
      '🤖': ['robot', 'ai', 'android'],
      '😺': ['cat', 'happy', 'smile'],
      '😸': ['cat', 'grin', 'smile'],
      '😹': ['cat', 'tears', 'joy'],
      '😻': ['cat', 'heart', 'eyes', 'love'],
      '😼': ['cat', 'wry', 'smirk'],
      '😽': ['cat', 'kiss', 'love'],
      '🙀': ['cat', 'weary', 'tired'],
      '😿': ['cat', 'cry', 'sad'],
      '😾': ['cat', 'pouting', 'angry'],
      '👍': ['thumbs', 'up', 'like', 'approve'],
      '👎': ['thumbs', 'down', 'dislike', 'reject'],
      '✌️': ['peace', 'victory', 'v', 'two'],
      '🤞': ['fingers', 'crossed', 'luck', 'hope'],
      '🤟': ['love', 'you', 'gesture', 'ily'],
      '🤘': ['rock', 'metal', 'horns', 'devil'],
      '👏': ['clap', 'applause', 'hands'],
      '🙌': ['raise', 'hands', 'celebration', 'praise'],
      '🙏': ['pray', 'thanks', 'please', 'namaste'],
      '❤️': ['heart', 'love', 'red', 'romance'],
      '🧡': ['heart', 'orange', 'love'],
      '💛': ['heart', 'yellow', 'love', 'friendship'],
      '💚': ['heart', 'green', 'love', 'nature'],
      '💙': ['heart', 'blue', 'love', 'trust'],
      '💜': ['heart', 'purple', 'love'],
      '🖤': ['heart', 'black', 'dark', 'sad'],
      '🤍': ['heart', 'white', 'pure', 'clean'],
      '🤎': ['heart', 'brown', 'love'],
      '💔': ['heart', 'broken', 'breakup', 'sad'],
      '🔥': ['fire', 'hot', 'flame', 'lit'],
      '✨': ['sparkles', 'magic', 'shiny', 'clean'],
      '💯': ['hundred', '100', 'perfect', 'score'],
      '🎉': ['party', 'tada', 'celebration'],
      '🎊': ['confetti', 'party', 'celebration'],
      '🎈': ['balloon', 'party', 'celebration'],
      '🎁': ['gift', 'present', 'birthday'],
      '🎂': ['cake', 'birthday', 'party'],
      '🍰': ['cake', 'slice', 'dessert'],
      '🍕': ['pizza', 'food', 'italian'],
      '🍔': ['burger', 'hamburger', 'food', 'fast'],
      '🍟': ['fries', 'french', 'food', 'potato'],
      '🌭': ['hotdog', 'sausage', 'food'],
      '🍿': ['popcorn', 'movie', 'cinema'],
      '🍩': ['donut', 'doughnut', 'sweet'],
      '🍪': ['cookie', 'biscuit', 'sweet'],
      '🍫': ['chocolate', 'bar', 'sweet'],
      '🍎': ['apple', 'red', 'fruit', 'healthy'],
      '🍏': ['apple', 'green', 'fruit', 'healthy'],
      '🍌': ['banana', 'fruit', 'yellow']
    };

    return emojiNames[emoji] || [emoji];
  }

  _handleCategoryClick(e, element) {
    const category = element.getAttribute('data-category');
    if (category && this.categories[category]) {
      this.activeCategory = category;
      this.searchQuery = '';
      const searchInput = this.getRef('searchInput');
      if (searchInput) searchInput.value = '';
      this._filterEmojis();
      this.update();
    }
  }

  _handleCategoryKeyDown(e, element) {
    const categories = Object.keys(this.categories);
    const currentIndex = categories.indexOf(this.activeCategory);

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % categories.length;
      this.activeCategory = categories[nextIndex];
      this._filterEmojis();
      this.update();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
      this.activeCategory = categories[prevIndex];
      this._filterEmojis();
      this.update();
    }
  }

  _handleSearch(e) {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = setTimeout(() => {
      this.searchQuery = e.target.value;
      this._filterEmojis();
      this.update();
    }, 100);
  }

  _handleEmojiClick(e, element) {
    const emoji = element.getAttribute('data-emoji');
    if (emoji) {
      this._trackEmojiUsage(emoji);
      this.emit('emojiSelect', emoji);
    }
  }

  _handleKeyDown(e, element) {
    const emojiItems = Array.from(element.querySelectorAll('[data-emoji]'));
    const focusedIndex = emojiItems.findIndex(el => el === document.activeElement);

    if (focusedIndex === -1) return;

    let newIndex = focusedIndex;
    const cols = 8;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = Math.min(focusedIndex + 1, emojiItems.length - 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = Math.max(focusedIndex - 1, 0);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(focusedIndex + cols, emojiItems.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(focusedIndex - cols, 0);
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = emojiItems.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        emojiItems[focusedIndex].click();
        return;
    }

    if (newIndex >= 0 && newIndex < emojiItems.length) {
      emojiItems[newIndex].focus();
    }
  }

  _handleClose() {
    this.emit('close');
  }

  _setupFocusTrap() {
    // Focus first emoji on mount
    requestAnimationFrame(() => {
      const firstEmoji = this.element.querySelector('[data-emoji]');
      firstEmoji?.focus();
    });
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    const category = this.categories[this.activeCategory];

    return `
      <div class="emoji-picker" role="dialog" aria-label="Emoji picker" aria-modal="true">
        <div class="emoji-picker-header">
          <div class="emoji-tabs" role="tablist" aria-label="Emoji categories">
            ${Object.entries(this.categories).map(([key, cat]) => `
              <button
                class="emoji-tab ${key === this.activeCategory ? 'active' : ''}"
                role="tab"
                aria-selected="${key === this.activeCategory}"
                aria-controls="emoji-panel-${key}"
                id="emoji-tab-${key}"
                data-category="${key}"
                data-action="category"
                data-action-keydown="category"
                tabindex="${key === this.activeCategory ? '0' : '-1'}"
              >${cat.icon}</button>
            `).join('')}
          </div>
          <div class="emoji-search-wrapper">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              class="emoji-search-input"
              ref="searchInput"
              placeholder="Search emojis..."
              aria-label="Search emojis"
              data-action-input="search"
              value="${this._escapeHtml(this.searchQuery)}"
            >
          </div>
        </div>

        <div class="emoji-picker-body" role="tabpanel" id="emoji-panel-${this.activeCategory}" aria-labelledby="emoji-tab-${this.activeCategory}">
          ${this.searchQuery ? `
            <div class="emoji-category">
              <h3 class="emoji-category-title">Search Results</h3>
              <div class="emoji-grid" role="listbox" aria-label="Search results" data-action-keydown="emoji-grid">
                ${this.filteredEmojis.length === 0 ? `
                  <div class="emoji-empty" role="status">No emojis found</div>
                ` : this.filteredEmojis.map(emoji => `
                  <button
                    class="emoji-item"
                    data-emoji="${this._escapeHtml(emoji)}"
                    data-action="emoji"
                    role="option"
                    tabindex="-1"
                    aria-label="${this._escapeHtml(emoji)}"
                  >${emoji}</button>
                `).join('')}
              </div>
            </div>
          ` : `
            <div class="emoji-category">
              <h3 class="emoji-category-title">${category.label}</h3>
              <div class="emoji-grid" role="listbox" aria-label="${category.label}" data-action-keydown="emoji-grid">
                ${category.emojis.map(emoji => `
                  <button
                    class="emoji-item"
                    data-emoji="${this._escapeHtml(emoji)}"
                    data-action="emoji"
                    role="option"
                    tabindex="-1"
                    aria-label="${this._escapeHtml(emoji)}"
                  >${emoji}</button>
                `).join('')}
              </div>
            </div>
          `}

          ${this.frequentEmojis.length > 0 && !this.searchQuery ? `
            <div class="emoji-category frequent">
              <h3 class="emoji-category-title">Frequently Used</h3>
              <div class="emoji-grid" role="listbox" aria-label="Frequently used emojis" data-action-keydown="emoji-grid">
                ${this.frequentEmojis.map(emoji => `
                  <button
                    class="emoji-item"
                    data-emoji="${this._escapeHtml(emoji)}"
                    data-action="emoji"
                    role="option"
                    tabindex="-1"
                    aria-label="${this._escapeHtml(emoji)}"
                  >${emoji}</button>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <button class="emoji-close" data-action="close" aria-label="Close emoji picker">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;
  }
}

export default EmojiPicker;