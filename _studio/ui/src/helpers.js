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

/** Format byte count to human-readable string (e.g. "1.2 MB"). */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/** Relative time — "2 mins ago", "Yesterday", "3 days ago". */
export function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} min${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 30) return `${diffDay} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Compact relative time — "2 min ago", "3 hr ago". */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr  = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString();
}

/** Generate a cryptographically random password. */
export function generatePassword(length = 16) {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => chars[b % chars.length]).join('');
}

/**
 * Format a reference URL for display.
 *
 * Strips protocol and `www.` prefix, removes trailing slash,
 * and truncates with `…` if the result exceeds maxLen characters.
 *
 * Examples:
 *   https://www.apple.com/nl/macbook-neo/ → apple.com/nl/macbook-neo
 *   https://stripe.com/payments           → stripe.com/payments
 *   https://very-long.com/deep/path/here  → very-long.com/deep/path/h…  (if maxLen=30)
 */
export function formatRefUrl(url, maxLen = 40) {
  if (!url) return '';
  let display = url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '');
  if (display.length > maxLen) {
    display = display.substring(0, maxLen - 1) + '\u2026';
  }
  return display;
}
