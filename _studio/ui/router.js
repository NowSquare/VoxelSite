/**
 * VoxelSite Studio — Hash Router
 *
 * Client-side routing using hash fragments. Simple, no-library,
 * works everywhere including shared hosting with no server config.
 *
 * Routes:
 *   #/chat              → Conversation + Preview (default)
 *   #/pages             → Page manager
 *   #/pages/:slug       → Single page editor
 *   #/assets            → Asset manager
 *   #/collections       → Collections
 *   #/collections/:slug → Single collection
 *   #/snapshots         → Snapshot manager
 *   #/settings          → Settings
 *
 * Usage:
 *   import { router } from './router.js';
 *
 *   router.on('chat', (params) => renderChat());
 *   router.on('pages', (params) => renderPages());
 *   router.on('pages/:slug', (params) => renderPage(params.slug));
 *
 *   router.start();  // Begin listening
 *   router.navigate('pages');  // Programmatic navigation
 */

import { store } from './state.js';

class Router {
  /** @type {Array<{pattern: string, regex: RegExp, paramNames: string[], handler: Function}>} */
  #routes = [];

  /** @type {Function|null} */
  #notFound = null;

  /** @type {boolean} */
  #started = false;

  /** @type {Function|null} */
  #beforeEach = null;

  /** @type {string|null} */
  #lastPath = null;

  /** @type {boolean} */
  #resolving = false;

  /**
   * Register a route handler.
   *
   * @param {string} pattern - Route pattern like 'pages' or 'pages/:slug'
   * @param {Function} handler - (params: Record<string, string>) => void
   * @returns {Router} this (for chaining)
   */
  on(pattern, handler) {
    const paramNames = [];

    // Convert :param to named capture groups
    const regexStr = pattern.replace(/:([a-zA-Z_]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });

    this.#routes.push({
      pattern,
      regex: new RegExp(`^${regexStr}$`),
      paramNames,
      handler,
    });

    return this;
  }

  /**
   * Register a 404 handler.
   * @param {Function} handler
   * @returns {Router}
   */
  onNotFound(handler) {
    this.#notFound = handler;
    return this;
  }

  /**
   * Register a hook that runs before every navigation.
   * If the handler returns false or a Promise resolving to false, navigation is cancelled.
   * @param {Function} handler - async (toPath, fromPath) => boolean
   * @returns {Router}
   */
  beforeEach(handler) {
    this.#beforeEach = handler;
    return this;
  }

  /**
   * Start listening for hash changes.
   * Also triggers the initial route match.
   */
  start() {
    if (this.#started) return;
    this.#started = true;

    window.addEventListener('hashchange', () => this.#resolve());
    this.#resolve();
  }

  /**
   * Navigate to a route programmatically.
   * @param {string} path - Route path without # (e.g., 'pages/about')
   */
  navigate(path) {
    window.location.hash = `/${path}`;
  }

  /**
   * Get the current route path (without the #/).
   * @returns {string}
   */
  get current() {
    return this.#parsePath();
  }

  /**
   * Resolve the current hash against registered routes.
   */
  async #resolve() {
    if (this.#resolving) return;
    
    const path = this.#parsePath();
    const oldPath = this.#lastPath;

    if (path === oldPath && this.#started) return;

    if (this.#beforeEach && oldPath !== null) {
      this.#resolving = true;
      try {
        const proceed = await this.#beforeEach(path, oldPath);
        if (proceed === false) {
          // Revert hash silently to old path without triggering another resolve
          window.history.replaceState(null, '', `#/${oldPath}`);
          return;
        }
      } finally {
        this.#resolving = false;
      }
    }

    this.#lastPath = path;

    for (const route of this.#routes) {
      const match = path.match(route.regex);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, i) => {
          params[name] = decodeURIComponent(match[i + 1]);
        });

        // Update store with current route
        store.batch(() => {
          store.set('route', route.pattern);
          store.set('routeParams', params);
        });

        route.handler(params);
        return;
      }
    }

    // No match
    if (this.#notFound) {
      store.set('route', '404');
      this.#notFound(path);
    } else {
      // Default to chat
      this.navigate('chat');
    }
  }

  /**
   * Extract the path from the hash, stripping the #/ prefix.
   * @returns {string}
   */
  #parsePath() {
    const hash = window.location.hash || '#/chat';
    return hash.replace(/^#\/?/, '');
  }
}

export const router = new Router();
export default router;
