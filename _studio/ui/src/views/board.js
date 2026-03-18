/**
 * VoxelSite Studio — Board View (Kanban)
 *
 * A shared cork-board with three columns: To Do, In Progress, Done.
 * Cards are edited inline (Trello-style) — no modal popups.
 *
 * Architecture:
 *   - renderBoardView() returns the initial HTML shell
 *   - initBoardView() attaches delegated event listeners once per mount
 *   - loadBoard() fetches card data and renders columns
 *   - Clicking a card expands it in-place for editing
 *   - Three-dot menu on each card for archive/delete
 *   - All column changes route through /cards/:id/move (server-side positions)
 *   - Drag-and-drop is owner/editor only — no handles for viewers
 *   - Auto-save with debounce + visual "Saved ✓" feedback
 */

import { api } from '../../api.js';
import { store } from '../../state.js';
import { icons } from '../icons.js';
import { escapeHtml, escapeAttr } from '../helpers.js';
import { showToast, showToastWithAction } from '../ui/toasts.js';
import { showConfirmModal, closeModal, onBackdropClick } from '../ui/modals.js';

/** Track whether initBoardView() has been called this mount cycle */
let _boardInitialized = false;

/** Drag state */
let _dragState = null;

/** Currently expanded card ID (only one at a time) */
let _expandedCardId = null;

/** Auto-save debounce timer */
let _saveTimer = null;

/** Pending save promise — prevents close from racing with save */
let _pendingSave = null;

/** Pending draft fields — accumulates all field edits before flush.
 *  e.g. { cardId: 42, fields: { title: 'new', body: 'updated body' } }
 */
let _pendingDraft = null;

const COLUMNS = [
  { id: 'todo',        label: 'To Do',        dotColor: 'var(--vs-text-ghost)' },
  { id: 'in_progress', label: 'In Progress',  dotColor: 'var(--vs-accent)' },
  { id: 'done',        label: 'Done',          dotColor: 'var(--vs-success)' },
];

/** Check if current user can edit the board. */
function canEdit() {
  const role = store.get('user')?.role;
  return role === 'owner' || role === 'editor';
}

export function renderBoardView() {
  _boardInitialized = false;
  _expandedCardId = null;
  setTimeout(() => {
    initBoardView();
    loadBoard();
  }, 0);

  const editable = canEdit();

  return `
    <div class="vs-board" id="board-root">
      <div class="vs-board-header">
        <h1 class="vs-board-title">Board</h1>
        ${editable ? `
          <button id="btn-board-add" class="vs-btn vs-btn-primary vs-btn-sm">
            New Card
          </button>
        ` : ''}
      </div>
      <div class="vs-board-columns" id="board-columns">
        ${COLUMNS.map(col => `
          <div class="vs-board-column" data-column="${col.id}" id="col-${col.id}">
            <div class="vs-board-column-header">
              <span class="vs-board-column-label">${col.label}</span>
              <span class="vs-board-column-count" data-count="${col.id}">0</span>
            </div>
            <div class="vs-board-column-cards" data-col-cards="${col.id}">
              <div class="vs-board-loading">Loading…</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div id="board-archived-link" class="vs-board-archived-link hidden"></div>
    </div>
  `;
}


// ═══════════════════════════════════════════
//  Data Loading
// ═══════════════════════════════════════════

async function loadBoard() {
  const { ok, data } = await api.get('/cards');
  if (!ok) {
    showToast('Failed to load board.', 'error');
    return;
  }

  const cards = data?.cards || [];
  store.set('cards', cards);
  store.set('cardsLoaded', true);
  renderColumns(cards);

  // Also load archived count
  const archived = await api.get('/cards/archived');
  if (archived.ok) {
    const archivedCards = archived.data?.cards || [];
    renderArchivedLink(archivedCards.length);
  }
}

function renderColumns(cards) {
  const editable = canEdit();

  for (const col of COLUMNS) {
    const colCards = cards.filter(c => c.column_name === col.id);
    const container = document.querySelector(`[data-col-cards="${col.id}"]`);
    const countEl = document.querySelector(`[data-count="${col.id}"]`);

    if (countEl) countEl.textContent = colCards.length;
    if (!container) continue;

    if (colCards.length === 0) {
      if (col.id === 'todo' && cards.length === 0) {
        container.innerHTML = editable
          ? `<div class="vs-board-empty">
              <p style="font-size: 13px; color: var(--vs-text-ghost); margin: 0 0 12px;">Your board is empty</p>
              <p style="font-size: 12px; color: var(--vs-text-ghost); margin: 0 0 16px;">Add your first task or promote a note from the Notes section.</p>
              <button class="vs-btn vs-btn-ghost vs-btn-sm board-empty-add">Add a card</button>
            </div>`
          : `<div class="vs-board-empty">
              <p style="font-size: 13px; color: var(--vs-text-ghost); margin: 0;">No tasks on the board yet.</p>
            </div>`;
      } else if (editable) {
        container.innerHTML = `<div class="vs-board-drop-zone">Drop a card here</div>`;
      } else {
        container.innerHTML = '';
      }
      continue;
    }

    container.innerHTML = colCards.map(card => {
      const isExpanded = card.id === _expandedCardId;
      return isExpanded
        ? renderCardExpanded(card, col, editable)
        : renderCardCollapsed(card, col, editable);
    }).join('');

    // If an expanded card was re-rendered, re-bind its events
    if (_expandedCardId) {
      const expandedEl = container.querySelector(`[data-card-id="${_expandedCardId}"].vs-board-card-expanded`);
      if (expandedEl && editable) {
        bindExpandedCardEvents(expandedEl, _expandedCardId);
      }
    }
  }
}


// ═══════════════════════════════════════════
//  Card Rendering — Collapsed (list item)
// ═══════════════════════════════════════════

function renderCardCollapsed(card, col, editable) {
  // CSS `-webkit-line-clamp: 3` handles visual truncation;
  // we pass enough text for 3 lines but cap at 200 chars for DOM efficiency
  const bodyPreview = card.body
    ? `<div class="vs-board-card-body">${escapeHtml(card.body.substring(0, 200))}</div>`
    : '';

  const linkedPage = card.linked_page
    ? `<div class="vs-board-card-footer"><span class="vs-board-card-link" data-page="${escapeAttr(card.linked_page)}"><span class="vs-board-card-link-icon">${icons.link}</span>${escapeHtml(resolvePageTitle(card.linked_page))}</span></div>`
    : '';

  return `
    <div class="vs-board-card ${editable ? 'vs-board-card-draggable' : ''}"
         data-card-id="${card.id}"
         data-column="${card.column_name}"
         ${editable ? 'draggable="true"' : ''}>
      <div class="vs-board-card-title">
        <span class="vs-status-dot" style="background: ${col.dotColor};"></span>
        <span class="vs-board-card-title-text">${escapeHtml(card.title || 'Untitled')}</span>
        ${editable ? `
          <button class="vs-board-card-menu-btn" data-card-menu="${card.id}" title="Card actions">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        ` : ''}
      </div>
      ${bodyPreview}
      ${linkedPage}
    </div>
  `;
}


// ═══════════════════════════════════════════
//  Card Rendering — Expanded (inline edit)
// ═══════════════════════════════════════════

function renderCardExpanded(card, col, editable) {
  const pages = store.get('pages') || [];

  if (!editable) {
    // Viewer: read-only expanded view
    return `
      <div class="vs-board-card vs-board-card-expanded"
           data-card-id="${card.id}" data-column="${card.column_name}">
        <div class="vs-board-card-expand-header">
          <div class="vs-board-card-title">
            <span class="vs-status-dot" style="background: ${col.dotColor};"></span>
            <span class="vs-board-card-title-text">${escapeHtml(card.title || 'Untitled')}</span>
          </div>
          <button class="vs-board-card-close-btn" data-card-close="${card.id}" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        ${card.body
          ? `<div class="vs-board-card-body-full">${escapeHtml(card.body)}</div>`
          : `<div class="vs-board-card-body-empty">No description.</div>`
        }
        ${card.linked_page ? `
          <div class="vs-board-card-footer">
            <span class="vs-board-card-link" data-page="${escapeAttr(card.linked_page)}"><span class="vs-board-card-link-icon">${icons.link}</span>${escapeHtml(resolvePageTitle(card.linked_page))}</span>
          </div>
        ` : ''}
        <div class="vs-board-card-meta">
          Created ${formatDate(card.created_at)}${card.updated_at !== card.created_at ? ` · Updated ${formatDate(card.updated_at)}` : ''}
        </div>
      </div>
    `;
  }

  // Owner/Editor: editable expanded view
  return `
    <div class="vs-board-card vs-board-card-expanded vs-board-card-editing"
         data-card-id="${card.id}" data-column="${card.column_name}">
      <div class="vs-board-card-expand-header">
        <input type="text"
               class="vs-board-inline-title"
               data-field="title"
               data-card-id="${card.id}"
               value="${escapeAttr(card.title)}"
               placeholder="Card title" />
        <button class="vs-board-card-close-btn" data-card-close="${card.id}" title="Close (Esc)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <textarea class="vs-board-inline-body"
                data-field="body"
                data-card-id="${card.id}"
                rows="3"
                placeholder="Add details…">${escapeHtml(card.body || '')}</textarea>
      <div class="vs-board-inline-row">
        <label class="vs-board-inline-label">Column</label>
        <select class="vs-board-inline-select" data-field="column" data-card-id="${card.id}">
          ${COLUMNS.map(c => `<option value="${c.id}" ${c.id === card.column_name ? 'selected' : ''}>${c.label}</option>`).join('')}
        </select>
      </div>
      <div class="vs-board-inline-row">
        <label class="vs-board-inline-label">Linked page</label>
        <select class="vs-board-inline-select" data-field="linked_page" data-card-id="${card.id}">
          <option value="">None</option>
          ${pages.map(p => `<option value="${escapeAttr(p.slug)}" ${p.slug === card.linked_page ? 'selected' : ''}>${escapeHtml(p.title || p.slug)}</option>`).join('')}
        </select>
      </div>
      <div class="vs-board-card-expand-footer">
        <div class="vs-board-card-save-status" data-save-status="${card.id}"></div>
        <div class="vs-board-card-actions">
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-card-archive="${card.id}">Archive</button>
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-card-delete="${card.id}" style="color: var(--vs-error);">Delete</button>
        </div>
      </div>
      <div class="vs-board-card-meta">
        Created ${formatDate(card.created_at)}${card.updated_at !== card.created_at ? ` · Updated ${formatDate(card.updated_at)}` : ''}
      </div>
    </div>
  `;
}


// ═══════════════════════════════════════════
//  Inline Editing — Event Binding
// ═══════════════════════════════════════════

/**
 * Bind editing events on an expanded card element.
 * Called after the expanded card is rendered into the DOM.
 */
function bindExpandedCardEvents(cardEl, cardId) {
  const titleInput = cardEl.querySelector('[data-field="title"]');
  const bodyTextarea = cardEl.querySelector('[data-field="body"]');
  const columnSelect = cardEl.querySelector('[data-field="column"]');
  const pageSelect = cardEl.querySelector('[data-field="linked_page"]');

  // Auto-save title on input (debounced)
  titleInput?.addEventListener('input', () => {
    scheduleSave(cardId, { title: titleInput.value.trim() });
  });

  // Auto-save body on input (debounced)
  bodyTextarea?.addEventListener('input', () => {
    autoResizeTextarea(bodyTextarea);
    scheduleSave(cardId, { body: bodyTextarea.value });
  });

  // Column change — route through MOVE endpoint (position handled server-side)
  columnSelect?.addEventListener('change', async () => {
    if (window.IS_DEMO) {
      showSaveStatus(cardId, 'saved');
      return;
    }
    const newColumn = columnSelect.value;
    showSaveStatus(cardId, 'saving');
    const { ok } = await api.put(`/cards/${cardId}/move`, {
      column_name: newColumn,
      position: 0, // 0 = server picks top position
    });
    if (ok) {
      showSaveStatus(cardId, 'saved');
      // Re-render columns — card moved to a different column
      _expandedCardId = null; // collapse since it moved
      await loadBoard();
    } else {
      showSaveStatus(cardId, 'error');
    }
  });

  // Linked page change
  pageSelect?.addEventListener('change', async () => {
    if (window.IS_DEMO) {
      showSaveStatus(cardId, 'saved');
      return;
    }
    showSaveStatus(cardId, 'saving');
    const { ok } = await api.put(`/cards/${cardId}`, {
      linked_page: pageSelect.value || null,
    });
    showSaveStatus(cardId, ok ? 'saved' : 'error');
  });

  // Auto-resize textarea on mount
  if (bodyTextarea) {
    autoResizeTextarea(bodyTextarea);
  }
}

/**
 * Schedule a debounced save for card fields.
 * Multiple field edits within the debounce window are MERGED into
 * a single draft, so title + body edits don't clobber each other.
 */
function scheduleSave(cardId, fields) {
  // Merge into pending draft
  if (_pendingDraft && _pendingDraft.cardId === cardId) {
    Object.assign(_pendingDraft.fields, fields);
  } else {
    _pendingDraft = { cardId, fields: { ...fields } };
  }

  showSaveStatus(cardId, 'saving');
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => flushSave(), 600);
}

/**
 * Immediately flush the pending draft to the server.
 * Called by the debounce timer, and also called synchronously by
 * collapseCard() / cleanupBoard() / router flush so edits are never dropped.
 */
async function flushSave() {
  clearTimeout(_saveTimer);
  _saveTimer = null;

  if (!_pendingDraft) {
    // Nothing to save — just await any in-flight request
    if (_pendingSave) await _pendingSave;
    return;
  }

  const { cardId, fields } = _pendingDraft;
  _pendingDraft = null;

  // Demo mode — fake save success without hitting the API
  if (window.IS_DEMO) {
    showSaveStatus(cardId, 'saved');
    return;
  }

  _pendingSave = api.put(`/cards/${cardId}`, fields);
  const { ok } = await _pendingSave;
  _pendingSave = null;
  showSaveStatus(cardId, ok ? 'saved' : 'error');
}

/**
 * Show save status in the expanded card footer.
 */
function showSaveStatus(cardId, status) {
  const el = document.querySelector(`[data-save-status="${cardId}"]`);
  if (!el) return;

  switch (status) {
    case 'saving':
      el.textContent = 'Saving…';
      el.className = 'vs-board-card-save-status vs-board-save-active';
      break;
    case 'saved':
      el.textContent = 'Saved ✓';
      el.className = 'vs-board-card-save-status vs-board-save-done';
      // Fade out after 2s
      setTimeout(() => {
        if (el.textContent === 'Saved ✓') {
          el.className = 'vs-board-card-save-status vs-board-save-fade';
        }
      }, 2000);
      break;
    case 'error':
      el.textContent = 'Save failed';
      el.className = 'vs-board-card-save-status vs-board-save-error';
      break;
    default:
      el.textContent = '';
      el.className = 'vs-board-card-save-status';
  }
}

function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.max(60, textarea.scrollHeight) + 'px';
}


// ═══════════════════════════════════════════
//  Card Expand / Collapse
// ═══════════════════════════════════════════

async function expandCard(cardId) {
  // Collapse any currently expanded card first
  if (_expandedCardId && _expandedCardId !== cardId) {
    await collapseCard();
  }

  // Fetch latest card data
  const { ok, data } = await api.get(`/cards/${cardId}`);
  if (!ok || !data?.card) {
    showToast('Card not found.', 'error');
    return;
  }

  _expandedCardId = cardId;
  const card = data.card;
  const col = COLUMNS.find(c => c.id === card.column_name) || COLUMNS[0];
  const editable = canEdit();

  // Find the card element and replace it with the expanded version
  const cardEl = document.querySelector(`[data-card-id="${cardId}"]`);
  if (!cardEl) return;

  const expandedHtml = renderCardExpanded(card, col, editable);
  cardEl.outerHTML = expandedHtml;

  // Bind events on the new expanded element
  const newCardEl = document.querySelector(`[data-card-id="${cardId}"]`);
  if (newCardEl && editable) {
    bindExpandedCardEvents(newCardEl, cardId);
    // Focus title
    setTimeout(() => newCardEl.querySelector('.vs-board-inline-title')?.focus(), 50);
  }

  // Scroll the card into view
  newCardEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function collapseCard() {
  if (!_expandedCardId) return;

  // Flush any pending draft immediately — don't lose edits
  await flushSave();

  _expandedCardId = null;

  // Reload the board to collapse the card back to its list form
  // with the latest data (in case fields were edited)
  await loadBoard();
}


// ═══════════════════════════════════════════
//  Three-dot Card Menu
// ═══════════════════════════════════════════

function showCardMenu(cardId, anchorEl) {
  // Remove any existing menu
  closeCardMenu();

  const menu = document.createElement('div');
  menu.className = 'vs-board-card-dropdown';
  menu.id = 'vs-board-card-dropdown';
  menu.innerHTML = `
    <button class="vs-board-card-dropdown-item" data-action="archive" data-id="${cardId}">
      Archive
    </button>
    <button class="vs-board-card-dropdown-item vs-board-card-dropdown-danger" data-action="delete" data-id="${cardId}">
      Delete
    </button>
  `;

  // Position below the anchor button
  const rect = anchorEl.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.top = `${rect.bottom + 4}px`;
  menu.style.right = `${window.innerWidth - rect.right}px`;
  menu.style.zIndex = '1000';

  document.body.appendChild(menu);
  requestAnimationFrame(() => menu.classList.add('is-visible'));

  // Close on click outside
  const closeOnClick = (e) => {
    if (!menu.contains(e.target) && e.target !== anchorEl) {
      closeCardMenu();
      document.removeEventListener('click', closeOnClick);
    }
  };
  // Delay to avoid the current click from immediately closing
  setTimeout(() => document.addEventListener('click', closeOnClick), 10);

  // Close on escape
  const closeOnEsc = (e) => {
    if (e.key === 'Escape') {
      closeCardMenu();
      document.removeEventListener('keydown', closeOnEsc);
    }
  };
  document.addEventListener('keydown', closeOnEsc);

  // Handle menu item clicks
  menu.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id, 10);
    closeCardMenu();

    if (action === 'archive') {
      if (window.IS_DEMO) {
        showToast('Demo mode — this action is disabled.', 'warning');
        return;
      }
      const { ok } = await api.post(`/cards/${id}/archive`);
      if (ok) {
        if (_expandedCardId === id) _expandedCardId = null;
        showToastWithAction('Card archived.', 'Undo', async () => {
          await api.post(`/cards/${id}/restore`);
          await loadBoard();
        });
        await loadBoard();
      }
    } else if (action === 'delete') {
      if (window.IS_DEMO) {
        showToast('Demo mode — this action is disabled.', 'warning');
        return;
      }
      const confirmed = await showConfirmModal({
        title: 'Delete Card',
        description: 'Permanently delete this card? This cannot be undone.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;
      const { ok } = await api.delete(`/cards/${id}`);
      if (ok) {
        if (_expandedCardId === id) _expandedCardId = null;
        showToast('Card deleted.', 'success');
        await loadBoard();
      }
    }
  });
}

function closeCardMenu() {
  const existing = document.getElementById('vs-board-card-dropdown');
  if (existing) existing.remove();
}

function renderArchivedLink(count) {
  const el = document.getElementById('board-archived-link');
  if (!el) return;
  if (count === 0) {
    el.classList.add('hidden');
    return;
  }
  el.classList.remove('hidden');
  el.innerHTML = `<button class="vs-board-show-archived">${icons.archive || ''} Archived (${count})</button>`;
}


// ═══════════════════════════════════════════
//  Event Initialization (delegated)
// ═══════════════════════════════════════════

function initBoardView() {
  if (_boardInitialized) return;
  _boardInitialized = true;

  const editable = canEdit();

  // Add card button
  document.getElementById('btn-board-add')?.addEventListener('click', openCreateModal);

  // Delegated events on the columns container
  const columnsEl = document.getElementById('board-columns');
  if (columnsEl) {
    columnsEl.addEventListener('click', handleColumnsClick);

    // Drag and drop (owner/editor only)
    if (editable) {
      initDragAndDrop(columnsEl);
    }
  }

  // Archived link
  document.getElementById('board-archived-link')?.addEventListener('click', (e) => {
    if (e.target.closest('.vs-board-show-archived')) {
      showArchivedCards();
    }
  });

  // Global escape to collapse expanded card
  document.addEventListener('keydown', handleBoardKeydown);

  // Click outside expanded card to collapse
  document.addEventListener('mousedown', handleOutsideClick);

  // Populate pages cache for create/detail modals
  populatePagesCache();

  // Register with the router's flush system so navigating away
  // flushes any pending card edits (defense-in-depth alongside cleanupBoard)
  if (!window.__vsFlushCallbacks) window.__vsFlushCallbacks = new Map();
  window.__vsFlushCallbacks.set('board', () => flushSave());
}

function handleColumnsClick(e) {
  const target = /** @type {HTMLElement} */ (e.target);

  // Empty state add button
  if (target.closest('.board-empty-add')) {
    openCreateModal();
    return;
  }

  // Three-dot menu button
  const menuBtn = target.closest('[data-card-menu]');
  if (menuBtn) {
    e.stopPropagation();
    const cardId = parseInt(menuBtn.dataset.cardMenu, 10);
    showCardMenu(cardId, menuBtn);
    return;
  }

  // Close button on expanded card
  const closeBtn = target.closest('[data-card-close]');
  if (closeBtn) {
    e.stopPropagation();
    collapseCard();
    return;
  }

  // Archive button (in expanded card)
  const archiveBtn = target.closest('[data-card-archive]');
  if (archiveBtn) {
    e.stopPropagation();
    handleArchive(parseInt(archiveBtn.dataset.cardArchive, 10));
    return;
  }

  // Delete button (in expanded card)
  const deleteBtn = target.closest('[data-card-delete]');
  if (deleteBtn) {
    e.stopPropagation();
    handleDelete(parseInt(deleteBtn.dataset.cardDelete, 10));
    return;
  }

  // Linked page click
  const pageLink = target.closest('.vs-board-card-link');
  if (pageLink) {
    e.stopPropagation();
    const slug = pageLink.dataset.page;
    if (slug) handlePageLinkClick(slug);
    return;
  }

  // Card click → expand (unless already expanded or clicking inside form elements)
  if (target.closest('input, textarea, select, button')) return;
  const cardEl = target.closest('.vs-board-card');
  if (cardEl && !cardEl.classList.contains('vs-board-card-expanded')) {
    const cardId = parseInt(cardEl.dataset.cardId, 10);
    expandCard(cardId);
    return;
  }
}

function handleBoardKeydown(e) {
  if (e.key === 'Escape' && _expandedCardId) {
    // Don't collapse if a confirm modal or create modal is open
    if (document.querySelector('.vs-modal-overlay')) return;
    e.preventDefault();
    collapseCard();
  }
}

function handleOutsideClick(e) {
  if (!_expandedCardId) return;
  const target = /** @type {HTMLElement} */ (e.target);

  // Don't collapse if clicking within the expanded card itself
  const expandedEl = document.querySelector('.vs-board-card-expanded');
  if (expandedEl && expandedEl.contains(target)) return;

  // Don't collapse if clicking on a modal overlay
  if (target.closest('.vs-modal-overlay')) return;

  // Don't collapse if clicking on the card dropdown
  if (target.closest('.vs-board-card-dropdown')) return;

  collapseCard();
}

async function handleArchive(cardId) {
  if (window.IS_DEMO) {
    showToast('Demo mode — this action is disabled.', 'warning');
    return;
  }
  const { ok } = await api.post(`/cards/${cardId}/archive`);
  if (ok) {
    _expandedCardId = null;
    showToastWithAction('Card archived.', 'Undo', async () => {
      await api.post(`/cards/${cardId}/restore`);
      await loadBoard();
    });
    await loadBoard();
  }
}

async function handleDelete(cardId) {
  if (window.IS_DEMO) {
    showToast('Demo mode — this action is disabled.', 'warning');
    return;
  }
  const confirmed = await showConfirmModal({
    title: 'Delete Card',
    description: 'Permanently delete this card? This cannot be undone.',
    confirmLabel: 'Delete',
    danger: true,
  });
  if (!confirmed) return;
  const { ok } = await api.delete(`/cards/${cardId}`);
  if (ok) {
    _expandedCardId = null;
    showToast('Card deleted.', 'success');
    await loadBoard();
  }
}


// ═══════════════════════════════════════════
//  Create Card (uses standard vs-modal-overlay)
// ═══════════════════════════════════════════

function openCreateModal() {
  const existing = document.getElementById('vs-board-create-overlay');
  if (existing) existing.remove();

  const pages = store.get('pages') || [];

  const overlay = document.createElement('div');
  overlay.id = 'vs-board-create-overlay';
  overlay.className = 'vs-modal-overlay';
  overlay.innerHTML = `
    <div class="vs-modal" style="max-width: 440px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">New Card</h2>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1" for="card-new-title">Title</label>
            <input type="text" id="card-new-title" class="vs-input w-full" placeholder="What needs doing?" autofocus />
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1" for="card-new-column">Column</label>
            <select id="card-new-column" class="vs-input w-full">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1" for="card-new-page">Link a page <span class="text-vs-text-ghost">(optional)</span></label>
            <select id="card-new-page" class="vs-input w-full">
              <option value="">None</option>
              ${pages.map(p => `<option value="${escapeAttr(p.slug)}">${escapeHtml(p.title || p.slug)}</option>`).join('')}
            </select>
          </div>
          <div id="card-create-error" class="hidden text-sm" style="color: var(--vs-error);"></div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="btn-card-cancel" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
        <button id="btn-card-create" class="vs-btn vs-btn-primary vs-btn-sm">Create</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-visible'));

  const close = () => closeModal(overlay);

  onBackdropClick(overlay, close);
  document.getElementById('btn-card-cancel')?.addEventListener('click', close);

  // Escape
  const onKeydown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
  };
  document.addEventListener('keydown', onKeydown);
  const observer = new MutationObserver(() => {
    if (!document.body.contains(overlay)) {
      document.removeEventListener('keydown', onKeydown);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true });

  // Enter key submits
  document.getElementById('card-new-title')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-card-create')?.click();
  });

  document.getElementById('btn-card-create')?.addEventListener('click', async () => {
    const title = document.getElementById('card-new-title')?.value?.trim();
    const columnName = document.getElementById('card-new-column')?.value;
    const linkedPage = document.getElementById('card-new-page')?.value || null;
    const errorEl = document.getElementById('card-create-error');
    const createBtn = document.getElementById('btn-card-create');

    if (!title) {
      if (errorEl) {
        errorEl.textContent = 'Please enter a card title.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    createBtn.disabled = true;
    createBtn.textContent = 'Creating…';

    if (window.IS_DEMO) {
      close();
      showToast('Demo mode — this action is disabled.', 'warning');
      return;
    }

    const { ok, error } = await api.post('/cards', {
      title,
      column_name: columnName,
      linked_page: linkedPage,
    });

    if (ok) {
      close();
      showToast('Card created.', 'success');
      await loadBoard();
    } else {
      createBtn.disabled = false;
      createBtn.textContent = 'Create';
      if (errorEl) {
        errorEl.textContent = error?.message || 'Failed to create card.';
        errorEl.classList.remove('hidden');
      }
    }
  });

  // Focus title
  setTimeout(() => document.getElementById('card-new-title')?.focus(), 80);
}

async function populatePagesCache() {
  const pages = store.get('pages') || [];
  if (pages.length > 0) return;

  const { ok, data } = await api.get('/pages');
  if (ok && Array.isArray(data?.pages)) {
    store.set('pages', data.pages);
  }
}


// ═══════════════════════════════════════════
//  Drag and Drop (owner/editor only)
// ═══════════════════════════════════════════

function initDragAndDrop(container) {
  container.addEventListener('dragstart', (e) => {
    const cardEl = e.target.closest('.vs-board-card');
    if (!cardEl || cardEl.classList.contains('vs-board-card-expanded')) return;

    _dragState = {
      cardId: parseInt(cardEl.dataset.cardId, 10),
      sourceColumn: cardEl.dataset.column,
    };

    cardEl.classList.add('vs-board-card-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardEl.dataset.cardId);
  });

  container.addEventListener('dragend', (e) => {
    const cardEl = e.target.closest('.vs-board-card');
    if (cardEl) cardEl.classList.remove('vs-board-card-dragging');
    _dragState = null;
    container.querySelectorAll('.vs-board-drop-indicator').forEach(el => el.remove());
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const colCards = e.target.closest('[data-col-cards]');
    if (!colCards) return;

    // Remove existing indicators
    container.querySelectorAll('.vs-board-drop-indicator').forEach(el => el.remove());

    // Find where to insert
    const cardEls = [...colCards.querySelectorAll('.vs-board-card:not(.vs-board-card-dragging)')];
    const mouseY = e.clientY;

    let insertBefore = null;
    for (const cardEl of cardEls) {
      const rect = cardEl.getBoundingClientRect();
      if (mouseY < rect.top + rect.height / 2) {
        insertBefore = cardEl;
        break;
      }
    }

    const indicator = document.createElement('div');
    indicator.className = 'vs-board-drop-indicator';

    if (insertBefore) {
      colCards.insertBefore(indicator, insertBefore);
    } else {
      colCards.appendChild(indicator);
    }
  });

  container.addEventListener('drop', async (e) => {
    e.preventDefault();
    if (!_dragState) return;

    const colCards = e.target.closest('[data-col-cards]');
    if (!colCards) return;

    const targetColumn = colCards.dataset.colCards;

    // Get cards for this column (excluding the dragged card)
    const cards = store.get('cards') || [];
    const columnCards = cards
      .filter(c => c.column_name === targetColumn && c.id !== _dragState.cardId)
      .sort((a, b) => a.position - b.position);

    // Find insertion index from mouse position
    const existingEls = [...colCards.querySelectorAll('.vs-board-card:not(.vs-board-card-dragging)')]
      .map(el => ({
        id: parseInt(el.dataset.cardId, 10),
        rect: el.getBoundingClientRect(),
      }));

    const mouseY = e.clientY;
    let insertIdx = existingEls.length;
    for (let i = 0; i < existingEls.length; i++) {
      if (mouseY < existingEls[i].rect.top + existingEls[i].rect.height / 2) {
        insertIdx = i;
        break;
      }
    }

    let newPosition;
    if (columnCards.length === 0) {
      // Empty column — let server decide
      newPosition = 0;
    } else if (insertIdx === 0) {
      // Insert before first — send 0 so server uses getTopPosition()
      // which has headroom-aware rebalancing
      newPosition = 0;
    } else if (insertIdx >= columnCards.length) {
      newPosition = columnCards[columnCards.length - 1].position + 1000;
    } else {
      newPosition = Math.floor(
        (columnCards[insertIdx - 1].position + columnCards[insertIdx].position) / 2
      );
    }

    // Remove drop indicators
    container.querySelectorAll('.vs-board-drop-indicator').forEach(el => el.remove());

    // Demo mode — visual move happened, just reload without persisting
    if (window.IS_DEMO) {
      await loadBoard();
      _dragState = null;
      return;
    }

    // Send move request — server handles rebalancing
    const { ok } = await api.put(`/cards/${_dragState.cardId}/move`, {
      column_name: targetColumn,
      position: newPosition,
    });

    if (ok) {
      await loadBoard();
    } else {
      showToast('Failed to move card.', 'error');
    }

    _dragState = null;
  });
}


// ═══════════════════════════════════════════
//  Archived Cards (uses standard vs-modal-overlay)
// ═══════════════════════════════════════════

async function showArchivedCards() {
  const { ok, data } = await api.get('/cards/archived');
  if (!ok) {
    showToast('Failed to load archived cards.', 'error');
    return;
  }

  const cards = data?.cards || [];
  const editable = canEdit();

  const existing = document.getElementById('vs-board-archived-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'vs-board-archived-overlay';
  overlay.className = 'vs-modal-overlay';
  overlay.innerHTML = `
    <div class="vs-modal" style="max-width: 520px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">Archived Cards</h2>
      </div>
      <div class="vs-modal-body" style="max-height: 60vh; overflow-y: auto;">
        ${cards.length === 0
          ? '<p style="font-size: 13px; color: var(--vs-text-ghost);">No archived cards.</p>'
          : cards.map(card => `
            <div class="vs-board-archived-item" data-card-id="${card.id}">
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(card.title || 'Untitled')}</div>
                <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 2px;">Archived ${formatDate(card.updated_at)}</div>
              </div>
              ${editable ? `
                <div class="flex gap-2">
                  <button class="vs-btn vs-btn-ghost vs-btn-xs archived-restore-btn" data-id="${card.id}">Restore</button>
                  <button class="vs-btn vs-btn-ghost vs-btn-xs archived-delete-btn" data-id="${card.id}" style="color: var(--vs-error);">Delete</button>
                </div>
              ` : ''}
            </div>
          `).join('')
        }
      </div>
      <div class="vs-modal-footer">
        <button id="btn-archived-close" class="vs-btn vs-btn-secondary vs-btn-sm">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-visible'));

  const close = () => closeModal(overlay);

  onBackdropClick(overlay, close);
  document.getElementById('btn-archived-close')?.addEventListener('click', close);

  // Delegated archive actions
  if (editable) {
    const modalEl = overlay.querySelector('.vs-modal');
    modalEl?.addEventListener('click', async (e) => {
      const restoreBtn = e.target.closest('.archived-restore-btn');
      if (restoreBtn) {
        const id = restoreBtn.dataset.id;
        const { ok } = await api.post(`/cards/${id}/restore`);
        if (ok) {
          showToast('Card restored.', 'success');
          close();
          await loadBoard();
        }
        return;
      }

      const deleteBtn = e.target.closest('.archived-delete-btn');
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        const confirmed = await showConfirmModal({
          title: 'Delete Permanently',
          description: 'This card will be permanently deleted. This cannot be undone.',
          confirmLabel: 'Delete',
          danger: true,
        });
        if (!confirmed) return;
        const { ok } = await api.delete(`/cards/${id}`);
        if (ok) {
          showToast('Card deleted.', 'success');
          close();
          await loadBoard();
        }
      }
    });
  }
}


// ═══════════════════════════════════════════
//  Page Link Navigation
// ═══════════════════════════════════════════

function handlePageLinkClick(slug) {
  const editable = canEdit();

  if (editable) {
    // Set page scope — renderDashboardLayout() will load the preview for this page
    store.set('activePageScope', slug);
    window.location.hash = '#/chat';
  } else {
    const previewBase = window.location.origin;
    const publicPath = slug === 'index' ? '/' : `/${slug}`;
    window.open(`${previewBase}${publicPath}`, '_blank');
  }
}


// ═══════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Resolve a page slug to its display title.
 * Falls back to a prettified slug if the page isn't in the store.
 */
function resolvePageTitle(slug) {
  if (!slug) return '';
  // Homepage is always "Home" — the <title> tag content isn't a useful label
  if (slug === 'index' || slug === 'index.php') return 'Home';
  const pages = store.get('pages') || [];
  const page = pages.find(p => p.slug === slug);
  if (page?.title) return page.title;
  // Prettify slug: strip extension, title-case, replace hyphens/slashes
  let pretty = slug.replace(/\.(php|html)$/i, '');
  const last = pretty.split('/').pop();
  return last.split('-').filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || slug;
}


// ═══════════════════════════════════════════
//  Cleanup
// ═══════════════════════════════════════════

/**
 * Cleanup function called when navigating away from the Board.
 * Flushes any pending draft so edits are never dropped.
 */
export async function cleanupBoard() {
  // Flush pending draft to server before teardown
  await flushSave();

  _dragState = null;
  _expandedCardId = null;
  _pendingDraft = null;
  _boardInitialized = false;
  closeCardMenu();
  document.removeEventListener('keydown', handleBoardKeydown);
  document.removeEventListener('mousedown', handleOutsideClick);

  // Unregister from the router flush system
  if (window.__vsFlushCallbacks) {
    window.__vsFlushCallbacks.delete('board');
  }
}
