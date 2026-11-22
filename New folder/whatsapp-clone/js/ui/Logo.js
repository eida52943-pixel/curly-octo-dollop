/**
 * Logo Component
 *
 * A refined, modern logo for the WhatsApp Web Clone.
 * Features a stylized chat bubble with a simplified, elegant design.
 * Pure SVG, no external assets.
 */

import { Component } from './Component.js';

export class Logo extends Component {
  constructor(size = 40, options = {}) {
    super(options);
    this.size = size;
  }

  render() {
    return `
      <div class="logo-container" style="display:flex;align-items:center;gap:12px;font-weight:600;font-size:1.25rem;color:var(--color-text-primary);">
        <svg
          width="${this.size}"
          height="${this.size}"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <!-- Chat Bubble Shape -->
          <path
            d="M24 4C13.5 4 5 11.8 5 21.5c0 5.5 3 10.4 7.7 13.6-.3 1.7-1.2 3.9-2.9 5.9-.3.3-.1.9.3.9 3.6.2 6.9-.9 9.2-2.2 1.5.4 3.1.6 4.7.6 10.5 0 19-7.8 19-17.5S34.5 4 24 4z"
            fill="#00A884"
          />
          <!-- Inner Chat Detail -->
          <path
            d="M31 18.5c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6 6 2.7 6 6z"
            fill="#ffffff"
            fill-opacity="0.2"
          />
          <!-- Minimalist Sparkle -->
          <circle cx="34" cy="15" r="2" fill="#ffffff" opacity="0.8"/>
        </svg>
        <span style="letter-spacing:-0.5px;">WhatsApp<span style="color:var(--color-accent-primary);">Clone</span></span>
      </div>
    `;
  }
}

export default Logo;