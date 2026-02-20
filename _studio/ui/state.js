/**
 * VoxelSite Studio — Reactive State Store
 *
 * A simple pub/sub reactive store. No framework, no library.
 * Components subscribe to state changes and re-render when
 * their slice of state updates.
 *
 * Usage:
 *   import { store } from './state.js';
 *
 *   // Read
 *   const user = store.get('user');
 *
 *   // Write (triggers subscribers)
 *   store.set('user', { name: 'Admin' });
 *
 *   // Subscribe to changes
 *   store.on('user', (newValue, oldValue) => { ... });
 *
 *   // Subscribe to any change
 *   store.on('*', (key, newValue, oldValue) => { ... });
 *
 *   // Batch updates (single notification at end)
 *   store.batch(() => {
 *     store.set('loading', true);
 *     store.set('error', null);
 *   });
 */

class Store {
  /** @type {Map<string, any>} */
  #state = new Map();

  /** @type {Map<string, Set<Function>>} */
  #listeners = new Map();

  /** @type {boolean} */
  #batching = false;

  /** @type {Map<string, { newValue: any, oldValue: any }>} */
  #batchedChanges = new Map();

  /**
   * Create the store with initial state.
   * @param {Record<string, any>} initialState
   */
  constructor(initialState = {}) {
    for (const [key, value] of Object.entries(initialState)) {
      this.#state.set(key, value);
    }
  }

  /**
   * Get a value from state.
   * @param {string} key
   * @param {any} [fallback]
   * @returns {any}
   */
  get(key, fallback = undefined) {
    return this.#state.has(key) ? this.#state.get(key) : fallback;
  }

  /**
   * Set a value in state and notify subscribers.
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    const oldValue = this.#state.get(key);

    // Skip if value hasn't changed (shallow equality)
    if (oldValue === value) return;

    this.#state.set(key, value);

    if (this.#batching) {
      // During batch, accumulate changes
      if (!this.#batchedChanges.has(key)) {
        this.#batchedChanges.set(key, { newValue: value, oldValue });
      } else {
        this.#batchedChanges.get(key).newValue = value;
      }
    } else {
      this.#notify(key, value, oldValue);
    }
  }

  /**
   * Update state from an object (sets multiple keys).
   * Automatically batches for efficiency.
   * @param {Record<string, any>} updates
   */
  update(updates) {
    this.batch(() => {
      for (const [key, value] of Object.entries(updates)) {
        this.set(key, value);
      }
    });
  }

  /**
   * Subscribe to changes on a specific key or all keys.
   *
   * @param {string} key - State key, or '*' for all changes
   * @param {Function} callback - (newValue, oldValue) for key, (key, newValue, oldValue) for '*'
   * @returns {Function} Unsubscribe function
   */
  on(key, callback) {
    if (!this.#listeners.has(key)) {
      this.#listeners.set(key, new Set());
    }
    this.#listeners.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      this.#listeners.get(key)?.delete(callback);
    };
  }

  /**
   * Batch multiple state changes into a single notification.
   * @param {Function} fn
   */
  batch(fn) {
    if (this.#batching) {
      // Already in a batch, just run
      fn();
      return;
    }

    this.#batching = true;
    this.#batchedChanges.clear();

    try {
      fn();
    } finally {
      this.#batching = false;

      // Notify all changes
      for (const [key, { newValue, oldValue }] of this.#batchedChanges) {
        this.#notify(key, newValue, oldValue);
      }
      this.#batchedChanges.clear();
    }
  }

  /**
   * Get a snapshot of the full state (for debugging).
   * @returns {Record<string, any>}
   */
  toJSON() {
    return Object.fromEntries(this.#state);
  }

  /**
   * Notify subscribers of a state change.
   * @param {string} key
   * @param {any} newValue
   * @param {any} oldValue
   */
  #notify(key, newValue, oldValue) {
    // Specific key listeners
    const keyListeners = this.#listeners.get(key);
    if (keyListeners) {
      for (const cb of keyListeners) {
        try { cb(newValue, oldValue); } catch (e) { console.error(`[state] Error in "${key}" listener:`, e); }
      }
    }

    // Wildcard listeners
    const wildcardListeners = this.#listeners.get('*');
    if (wildcardListeners) {
      for (const cb of wildcardListeners) {
        try { cb(key, newValue, oldValue); } catch (e) { console.error('[state] Error in wildcard listener:', e); }
      }
    }
  }
}

// ═══════════════════════════════════════════
//  Default Store Instance
// ═══════════════════════════════════════════

export const store = new Store({
  // Auth
  user: null,
  sessionToken: null,

  // Navigation
  route: 'chat',
  routeParams: {},

  // UI state
  theme: localStorage.getItem('vs-theme') || 'forge',
  sidebarWidth: parseInt(localStorage.getItem('vs-sidebar-width') || '440', 10),
  mobileView: 'chat',  // 'chat' | 'preview'

  // Conversation
  activeConversationId: null,
  activePageScope: null, // null = all pages, otherwise page slug
  messages: [],
  conversations: [],

  // AI state
  aiStreaming: false,
  aiStreamContent: '',

  // Page data
  pages: [],
  currentPage: null,

  // Preview
  previewUrl: null,
  previewDirty: false,

  // Global UI
  loading: false,
  error: null,
  toast: null,
});

// ═══════════════════════════════════════════
//  Persist certain keys to localStorage
// ═══════════════════════════════════════════

store.on('theme', (value) => {
  localStorage.setItem('vs-theme', value);
  document.documentElement.setAttribute('data-theme', value);
});

store.on('sidebarWidth', (value) => {
  localStorage.setItem('vs-sidebar-width', String(value));
});

export default store;
