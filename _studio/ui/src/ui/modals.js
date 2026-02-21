/**
 * VoxelSite Studio — Modal Utilities
 *
 * Reusable confirm and prompt modals with full keyboard support.
 * Both modals support Escape to dismiss and proper focus management.
 */

import { escapeHtml } from '../helpers.js';

/**
 * Close a modal overlay with CSS transition.
 */
export function closeModal(overlay) {
  overlay.classList.remove('is-visible');
  setTimeout(() => overlay.remove(), 350);
}

/**
 * Show a confirmation dialog.  Returns a Promise<boolean>.
 * Escape or overlay‑click resolves `false`. Confirm button resolves `true`.
 */
export function showConfirmModal({
  title = 'Confirm Action',
  description = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
}) {
  return new Promise((resolve) => {
    const existing = document.getElementById('vs-confirm-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'vs-confirm-overlay';
    overlay.className = 'vs-modal-overlay';
    overlay.innerHTML = `
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${escapeHtml(title)}</h2>
          <p class="vs-modal-desc">${escapeHtml(description)}</p>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-confirm-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">${escapeHtml(cancelLabel)}</button>
          <button id="vs-confirm-ok" class="vs-btn ${danger ? 'vs-btn-danger' : 'vs-btn-primary'} vs-btn-sm" type="button">${escapeHtml(confirmLabel)}</button>
        </div>
      </div>
    `;

    // Single close function — cleans up global listener, removes overlay, resolves promise
    const onKeydown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(false); }
    };
    const close = (value) => {
      document.removeEventListener('keydown', onKeydown);
      closeModal(overlay);
      resolve(value);
    };

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-visible'));

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
    document.getElementById('vs-confirm-cancel')?.addEventListener('click', () => close(false));
    document.getElementById('vs-confirm-ok')?.addEventListener('click', () => close(true));
    document.addEventListener('keydown', onKeydown);

    // Focus the confirm button — Enter submits, Shift+Tab reaches cancel
    setTimeout(() => document.getElementById('vs-confirm-ok')?.focus(), 220);
  });
}

/**
 * Show a prompt dialog with a text input or textarea.
 * Returns a Promise<string|null>.  Escape or cancel resolves `null`.
 */
export function showPromptModal({
  title = 'Enter Value',
  description = '',
  label = 'Value',
  placeholder = '',
  initialValue = '',
  confirmLabel = 'Continue',
  inputType = 'text',
}) {
  return new Promise((resolve) => {
    const existing = document.getElementById('vs-prompt-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'vs-prompt-overlay';
    overlay.className = 'vs-modal-overlay';

    const inputHtml = inputType === 'textarea'
      ? `<textarea id="vs-prompt-input" class="vs-input w-full" rows="4" placeholder="${escapeHtml(placeholder)}" style="resize: vertical;">${escapeHtml(initialValue)}</textarea>`
      : `<input id="vs-prompt-input" type="text" class="vs-input w-full" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(initialValue)}">`;

    overlay.innerHTML = `
      <div class="vs-modal" style="max-width: 560px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${escapeHtml(title)}</h2>
          ${description ? `<p class="vs-modal-desc">${escapeHtml(description)}</p>` : ''}
        </div>
        <div class="vs-modal-body">
          ${label ? `<label class="block text-sm text-vs-text-secondary mb-1">${escapeHtml(label)}</label>` : ''}
          ${inputHtml}
        </div>
        <div class="vs-modal-footer">
          <button id="vs-prompt-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-prompt-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${escapeHtml(confirmLabel)}</button>
        </div>
      </div>
    `;

    const close = (value) => {
      closeModal(overlay);
      resolve(value);
    };

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-visible'));

    const input = overlay.querySelector('#vs-prompt-input');
    setTimeout(() => input?.focus(), 220);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(null); });
    overlay.querySelector('#vs-prompt-cancel')?.addEventListener('click', () => close(null));
    overlay.querySelector('#vs-prompt-ok')?.addEventListener('click', () => {
      close((input?.value || '').trim());
    });
    input?.addEventListener('keydown', (event) => {
      if (inputType === 'textarea') {
        // Textarea: Cmd+Enter to submit, Enter adds newline naturally
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          close((input?.value || '').trim());
        }
      } else {
        // Text input: Enter submits
        if (event.key === 'Enter') {
          event.preventDefault();
          close((input?.value || '').trim());
        }
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        close(null);
      }
    });
  });
}
