/**
 * Base Component Class
 *
 * Provides a lightweight component system with:
 * - Virtual DOM-like rendering
 * - State management
 * - Lifecycle hooks
 * - Event delegation
 * - Accessibility helpers
 */

export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.refs = {};
    this.eventHandlers = new Map();
    this.element = null;
    this.children = [];
    this._mounted = false;
    this._renderScheduled = false;
  }

  /**
   * Create element from HTML string
   */
  static createElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
  }

  /**
   * Create text node
   */
  static createText(text) {
    return document.createTextNode(text);
  }

  /**
   * Set state and schedule re-render
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.scheduleRender();
  }

  /**
   * Schedule a render (batched)
   */
  scheduleRender() {
    if (!this._renderScheduled && this._mounted) {
      this._renderScheduled = true;
      requestAnimationFrame(() => {
        this._renderScheduled = false;
        this.render();
      });
    }
  }

  /**
   * Render the component
   * Override in subclasses
   */
  render() {
    return '';
  }

  /**
   * Called after component is mounted to DOM
   */
  onMount() {}

  /**
   * Called before component is unmounted
   */
  onUnmount() {}

  /**
   * Called when props change
   */
  onPropsChange(newProps, oldProps) {}

  /**
   * Mount component to DOM element
   */
  mount(container) {
    if (this.element) {
      this.unmount();
    }

    const html = this.render();
    this.element = Component.createElement(html);
    this._bindRefs(this.element);
    this._bindEvents(this.element);
    container.appendChild(this.element);
    this._mounted = true;
    this.onMount();
    return this.element;
  }

  /**
   * Update component in place
   */
  update() {
    if (!this.element || !this._mounted) return;

    const oldElement = this.element;
    const html = this.render();
    const newElement = Component.createElement(html);

    this._bindRefs(newElement);
    this._bindEvents(newElement);
    oldElement.replaceWith(newElement);
    this.element = newElement;
  }

  /**
   * Unmount component
   */
  unmount() {
    if (this.element) {
      this.onUnmount();
      this._unbindEvents();
      this.element.remove();
      this.element = null;
      this._mounted = false;
    }
  }

  /**
   * Bind refs to elements
   */
  _bindRefs(element) {
    this.refs = {};
    const refElements = element.querySelectorAll('[ref]');
    refElements.forEach(el => {
      const ref = el.getAttribute('ref');
      this.refs[ref] = el;
    });
  }

  /**
   * Bind event handlers with delegation
   */
  _bindEvents(element) {
    this._unbindEvents();

    // Click delegation
    const clickHandler = (e) => {
      const action = e.target.closest('[data-action]');
      if (action) {
        const actionName = action.getAttribute('data-action');
        const handler = this.eventHandlers.get(`click:${actionName}`);
        if (handler) {
          handler(e, action);
        }
      }
    };

    // Input delegation
    const inputHandler = (e) => {
      const action = e.target.closest('[data-action-input]');
      if (action) {
        const actionName = action.getAttribute('data-action-input');
        const handler = this.eventHandlers.get(`input:${actionName}`);
        if (handler) {
          handler(e, action);
        }
      }
    };

    // Keydown delegation
    const keydownHandler = (e) => {
      const action = e.target.closest('[data-action-keydown]');
      if (action) {
        const actionName = action.getAttribute('data-action-keydown');
        const handler = this.eventHandlers.get(`keydown:${actionName}`);
        if (handler) {
          handler(e, action);
        }
      }
    };

    // Focus delegation
    const focusHandler = (e) => {
      const action = e.target.closest('[data-action-focus]');
      if (action) {
        const actionName = action.getAttribute('data-action-focus');
        const handler = this.eventHandlers.get(`focus:${actionName}`);
        if (handler) {
          handler(e, action);
        }
      }
    };

    // Blur delegation
    const blurHandler = (e) => {
      const action = e.target.closest('[data-action-blur]');
      if (action) {
        const actionName = action.getAttribute('data-action-blur');
        const handler = this.eventHandlers.get(`blur:${actionName}`);
        if (handler) {
          handler(e, action);
        }
      }
    };

    this._eventHandlers = { clickHandler, inputHandler, keydownHandler, focusHandler, blurHandler };

    element.addEventListener('click', clickHandler);
    element.addEventListener('input', inputHandler);
    element.addEventListener('keydown', keydownHandler);
    element.addEventListener('focus', focusHandler, true);
    element.addEventListener('blur', blurHandler, true);
  }

  /**
   * Unbind event handlers
   */
  _unbindEvents() {
    if (this._eventHandlers && this.element) {
      this.element.removeEventListener('click', this._eventHandlers.clickHandler);
      this.element.removeEventListener('input', this._eventHandlers.inputHandler);
      this.element.removeEventListener('keydown', this._eventHandlers.keydownHandler);
      this.element.removeEventListener('focus', this._eventHandlers.focusHandler, true);
      this.element.removeEventListener('blur', this._eventHandlers.blurHandler, true);
    }
  }

  /**
   * Register event handler
   */
  on(event, action, handler) {
    this.eventHandlers.set(`${event}:${action}`, handler.bind(this));
  }

  /**
   * Get ref element
   */
  getRef(name) {
    return this.refs[name];
  }

  /**
   * Accessibility helpers
   */

  /**
   * Generate unique ID for ARIA
   */
  static generateId(prefix = 'comp') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create ARIA live region
   */
  static createLiveRegion(politeness = 'polite') {
    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    region.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    return region;
  }

  /**
   * Announce to screen readers
   */
  static announce(message, politeness = 'polite') {
    const region = Component.createLiveRegion(politeness);
    document.body.appendChild(region);
    region.textContent = message;
    setTimeout(() => region.remove(), 1000);
  }

  /**
   * Trap focus within element
   */
  static trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTab);
    };
  }
}

/**
 * Fragment component for rendering multiple siblings
 */
export class Fragment extends Component {
  constructor(children = []) {
    super();
    this.children = children;
  }

  render() {
    return this.children.map(child => {
      if (typeof child === 'string') return child;
      if (child instanceof Component) return child.render();
      return '';
    }).join('');
  }

  mount(container) {
    this.children.forEach(child => {
      if (child instanceof Component) {
        child.mount(container);
      }
    });
  }

  unmount() {
    this.children.forEach(child => {
      if (child instanceof Component) {
        child.unmount();
      }
    });
  }
}

export default Component;