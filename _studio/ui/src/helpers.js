/**
 * VoxelSite Studio — Shared Helpers
 *
 * Pure utility functions used across multiple views.
 * Zero dependencies on state, API, icons, or DOM frameworks.
 */

/**
 * Escape a string for safe insertion into HTML.
 * Uses a reusable text node to avoid per-call DOM element creation.
 */
const _escapeEl = typeof document !== 'undefined' ? document.createElement('span') : null;
export function escapeHtml(str) {
  if (!str) return '';
  _escapeEl.textContent = str;
  return _escapeEl.innerHTML;
}

/**
 * Escape a string for safe insertion into an HTML attribute value.
 */
export function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Map a file path to a Monaco editor language identifier.
 */
const EXTENSION_MAP = {
  '.php':  'php',
  '.css':  'css',
  '.json': 'json',
  '.js':   'javascript',
  '.html': 'html',
  '.htm':  'html',
  '.md':   'markdown',
  '.xml':  'xml',
  '.svg':  'xml',
  '.txt':  'plaintext',
};

export function getCodeLanguage(path = '') {
  const lower = String(path || '').toLowerCase();
  for (const [ext, lang] of Object.entries(EXTENSION_MAP)) {
    if (lower.endsWith(ext)) return lang;
  }
  return 'plaintext';
}
