/**
 * VoxelSite Studio — Toast Notifications
 *
 * Lightweight toast system. Importable from any view module.
 */

import { escapeHtml } from '../helpers.js';

function ensureToastContainer() {
  let container = document.getElementById('vs-toast-container');
  if (container) return container;

  container = document.createElement('div');
  container.id = 'vs-toast-container';
  container.className = 'vs-toast-container';
  document.body.appendChild(container);
  return container;
}

export function showToast(message, type = 'success', timeout = 3200) {
  if (!message) return;
  const container = ensureToastContainer();

  const toast = document.createElement('div');
  const safeType = ['success', 'error', 'warning'].includes(type) ? type : 'success';
  toast.className = `vs-toast vs-toast-${safeType}`;
  toast.innerHTML = `<span>${escapeHtml(String(message))}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    setTimeout(() => toast.remove(), 220);
  }, timeout);
}
window.showToast = showToast;

/**
 * Show a toast with an optional action button (e.g., "Review with AI →").
 * The toast stays longer and includes a clickable action.
 */
export function showToastWithAction(message, actionLabel, onAction, type = 'success') {
  if (!message) return;
  const container = ensureToastContainer();

  const toast = document.createElement('div');
  const safeType = ['success', 'error', 'warning'].includes(type) ? type : 'success';
  toast.className = `vs-toast vs-toast-${safeType}`;
  toast.style.cursor = 'default';
  toast.innerHTML = `
    <span>${escapeHtml(String(message))}</span>
    <button type="button" class="vs-toast-action" style="
      margin-left: 12px;
      background: none;
      border: none;
      color: inherit;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
      font-size: inherit;
      padding: 0;
      opacity: 0.9;
    ">${escapeHtml(actionLabel)}</button>
  `;

  toast.querySelector('.vs-toast-action')?.addEventListener('click', (e) => {
    e.stopPropagation();
    onAction();
    toast.remove();
  });

  container.appendChild(toast);

  // Longer timeout since user may need time to read and click
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    setTimeout(() => toast.remove(), 220);
  }, 8000);
}
