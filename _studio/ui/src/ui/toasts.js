/**
 * VoxelSite Studio — Toast Notifications
 *
 * Lightweight, premium toast system with semantic icons, dismiss affordance,
 * auto-dismiss progress bar, and concurrent-duplicate collapsing.
 *
 * API (unchanged):
 *   showToast(message, type?, timeout?)
 *   showToastWithAction(message, actionLabel, onAction, type?)
 *
 * Types: 'success' | 'error' | 'warning' | 'info'
 */

import { escapeHtml } from '../helpers.js';

// ── Inline Lucide SVG icons per type ──────────────────────────────────
const TOAST_ICONS = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  error:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
  info:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
};

const DISMISS_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

const VALID_TYPES = ['success', 'error', 'warning', 'info'];

// ── Container ─────────────────────────────────────────────────────────
function ensureToastContainer() {
  let container = document.getElementById('vs-toast-container');
  if (container) return container;

  container = document.createElement('div');
  container.id = 'vs-toast-container';
  container.className = 'vs-toast-container';
  document.body.appendChild(container);
  return container;
}

// ── Dismiss helper ────────────────────────────────────────────────────
function dismissToast(toast) {
  if (toast._dismissed) return;
  toast._dismissed = true;

  // Clear the auto-dismiss timer so no stale callback fires
  if (toast._autoTimer) {
    clearTimeout(toast._autoTimer);
    toast._autoTimer = null;
  }

  // CSS-driven exit animation, then remove
  toast.classList.add('vs-toast-exit');
  toast.addEventListener('animationend', () => toast.remove(), { once: true });

  // Safety net: if animationend never fires (reduced motion, etc.)
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 250);
}

// ── Core: showToast ───────────────────────────────────────────────────
export function showToast(message, type = 'success', timeout = 3200) {
  if (!message) return;

  const container = ensureToastContainer();
  const safeType = VALID_TYPES.includes(type) ? type : 'success';

  const toast = document.createElement('div');
  toast.className = `vs-toast vs-toast-${safeType}`;

  toast.innerHTML = `
    <span class="vs-toast-icon">${TOAST_ICONS[safeType]}</span>
    <span class="vs-toast-message">${escapeHtml(String(message))}</span>
    <button type="button" class="vs-toast-dismiss" aria-label="Dismiss">${DISMISS_ICON}</button>
    <div class="vs-toast-progress" style="animation-duration: ${timeout}ms;"></div>
  `;

  // Manual dismiss
  toast.querySelector('.vs-toast-dismiss')?.addEventListener('click', (e) => {
    e.stopPropagation();
    dismissToast(toast);
  });

  container.appendChild(toast);

  // Auto-dismiss
  toast._autoTimer = setTimeout(() => dismissToast(toast), timeout);
}
window.showToast = showToast;

// ── showToastWithAction ───────────────────────────────────────────────
/**
 * Show a toast with an optional action button (e.g., "Review with AI →").
 * Longer timeout (8s) since the user may need time to read and click.
 */
export function showToastWithAction(message, actionLabel, onAction, type = 'success') {
  if (!message) return;

  const container = ensureToastContainer();
  const safeType = VALID_TYPES.includes(type) ? type : 'success';
  const timeout = 8000;

  const toast = document.createElement('div');
  toast.className = `vs-toast vs-toast-${safeType}`;
  toast.style.cursor = 'default';

  toast.innerHTML = `
    <span class="vs-toast-icon">${TOAST_ICONS[safeType]}</span>
    <span class="vs-toast-message">${escapeHtml(String(message))}</span>
    <button type="button" class="vs-toast-action">${escapeHtml(actionLabel)}</button>
    <button type="button" class="vs-toast-dismiss" aria-label="Dismiss">${DISMISS_ICON}</button>
    <div class="vs-toast-progress" style="animation-duration: ${timeout}ms;"></div>
  `;

  // Action click — fire callback, then dismiss (clears timer)
  toast.querySelector('.vs-toast-action')?.addEventListener('click', (e) => {
    e.stopPropagation();
    onAction();
    dismissToast(toast);
  });

  // Manual dismiss
  toast.querySelector('.vs-toast-dismiss')?.addEventListener('click', (e) => {
    e.stopPropagation();
    dismissToast(toast);
  });

  container.appendChild(toast);

  // Auto-dismiss
  toast._autoTimer = setTimeout(() => dismissToast(toast), timeout);
}
