/**
 * VoxelSite Studio — Notes View
 *
 * A frictionless, auto-saving writing surface. Apple Notes-grade polish.
 *
 * Architecture:
 * - Split-panel: list (left) + editor (right), same pattern as Chat
 * - Auto-save: 800ms debounce after last keystroke → PUT /notes/:id
 * - Soft-delete: instant removal + undo toast (8s window)
 * - Search: instant filter (200ms debounce) with highlighted matches
 * - Flush callback: registers on window.__vsFlushCallbacks for
 *   route-change safety (spec: VoxelSite-4010-notes.md)
 *
 * Mobile: single-panel toggle between list and detail via store key.
 */

import { api } from '../../api.js';
import { store } from '../../state.js';
import { icons } from '../icons.js';
import { escapeHtml, timeAgo } from '../helpers.js';
import { showToast, showToastWithAction } from '../ui/toasts.js';

const demoGuard = () => window.demoGuard?.() || false;
const viewerGuard = () => window.viewerGuard?.() || false;

// ── State ─────────────────────────────────────────────────────────────

/** All loaded notes (cached for instant list rendering). */
let notes = [];

/** Currently selected note ID. */
let activeNoteId = null;

/** Debounce timer for auto-save. */
let saveTimer = null;

/** Debounce timer for search. */
let searchTimer = null;

/** Current search query. */
let searchQuery = '';

/** Whether the editor is in Markdown preview mode. */
let previewMode = false;

/** Body text preserved while in preview mode (textarea is gone from DOM). */
let previewBodyCache = '';

/** Save state: 'idle' | 'saving' | 'saved' | 'error' */
let saveState = 'idle';

/** Timer for the "Saved" fade-out. */
let savedFadeTimer = null;

/** Mobile view state: 'list' | 'detail' */
let mobileView = 'list';

/** Flag to prevent redundant initial loads. */
let initialLoadDone = false;

// ── Constants ─────────────────────────────────────────────────────────

const SAVE_DEBOUNCE_MS = 800;
const SEARCH_DEBOUNCE_MS = 200;
const SAVED_DISPLAY_MS = 2000;
const LIST_WIDTH_KEY = 'vs-notes-list-width';
const PREVIEW_SNIPPET_CHARS = 80;
const MAX_PINNED = 5;

// ── Flush callback registration ───────────────────────────────────────

/**
 * Register this module's flush callback on the global Map.
 * Called on every mount; the Map-key prevents duplicates.
 */
function registerFlush() {
  if (!window.__vsFlushCallbacks) {
    window.__vsFlushCallbacks = new Map();
  }
  window.__vsFlushCallbacks.set('notes', flushPendingSave);
}

/**
 * Immediately flush any pending auto-save (debounce is still waiting).
 * Called by the router's beforeEach guard before route changes.
 */
async function flushPendingSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
    await saveActiveNote();
  }
}

// ── Markdown Renderer (lightweight, no deps) ──────────────────────────

/**
 * Minimal Markdown→HTML renderer for the preview toggle.
 * Covers the subset defined in 4010: headings, bold, italic, lists,
 * links, code blocks, inline code, blockquotes, horizontal rules.
 * Output is escaped/sanitized — no raw HTML passthrough.
 */
function renderMarkdown(text) {
  if (!text) return '';

  let html = escapeHtml(text);

  // Code blocks (triple backtick) — must come before inline transforms
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="vs-note-code-block"><code>${code}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="vs-note-inline-code">$1</code>');

  // Headings (### → h3, ## → h2, # → h1)
  html = html.replace(/^### (.+)$/gm, '<h3 class="vs-note-h3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="vs-note-h2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="vs-note-h1">$1</h1>');

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="vs-note-blockquote">$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="vs-note-hr" />');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="vs-note-link">$1</a>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="vs-note-li">$1</li>');
  html = html.replace(/(<li class="vs-note-li">.*<\/li>\n?)+/g, '<ul class="vs-note-ul">$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="vs-note-li-ol">$1</li>');
  html = html.replace(/(<li class="vs-note-li-ol">.*<\/li>\n?)+/g, '<ol class="vs-note-ol">$&</ol>');

  // Paragraphs — wrap remaining loose lines
  html = html.replace(/\n\n/g, '</p><p class="vs-note-p">');
  html = '<p class="vs-note-p">' + html + '</p>';

  // Clean up empty paragraphs around block elements
  html = html.replace(/<p class="vs-note-p">(<(?:h[1-3]|pre|blockquote|hr|ul|ol)[^>]*>)/g, '$1');
  html = html.replace(/(<\/(?:h[1-3]|pre|blockquote|ul|ol)>)<\/p>/g, '$1');
  html = html.replace(/<p class="vs-note-p"><\/p>/g, '');

  return html;
}

// ═══════════════════════════════════════════
//  Editor Placeholder (empty state for right panel)
// ═══════════════════════════════════════════

/**
 * Consistent empty state for the editor panel when no note is selected.
 * Uses the shared vs-empty-state component (same as Forms, Designs, Actions)
 * with transparent background since the editor panel already has its own bg.
 */
function renderEditorPlaceholder() {
  return `
    <div class="vs-empty-state" style="border: none; background: transparent; min-height: auto; height: 100%;">
      <div class="vs-empty-state-inner" style="max-width: 280px;">
        <div class="vs-empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <p class="vs-empty-state-title">Select a note</p>
        <p class="vs-empty-state-desc">Choose a note from the list or create a new one to start writing.</p>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════
//  Render: Main Entry Point
// ═══════════════════════════════════════════

/**
 * Render the Notes view. Called by renderPageContent in app.js.
 * Returns the initial HTML shell; data loads async via setTimeout.
 */
export function renderNotesView() {
  registerFlush();
  initialLoadDone = false;

  // Kick off data load after DOM is ready
  setTimeout(() => initNotes(), 0);

  const listWidth = parseInt(localStorage.getItem(LIST_WIDTH_KEY) || '320', 10);

  return `
    <div id="vs-notes-root" class="vs-notes">
      <!-- Empty state (shown if no notes exist) -->
      <div id="vs-notes-empty" class="vs-notes-empty" style="display: none;">
        <div class="vs-empty-state" style="border: none; background: transparent; min-height: auto;">
          <div class="vs-empty-state-inner" style="max-width: 280px;">
            <div class="vs-empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <p class="vs-empty-state-title">Your thinking starts here</p>
            <p class="vs-empty-state-desc">Write ideas, draft copy, collect thoughts — then turn them into website content.</p>
            ${window.IS_DEMO ? '' : '<button id="btn-notes-first" class="vs-btn vs-btn-primary vs-btn-sm">Create your first note</button>'}
          </div>
        </div>
      </div>

      <!-- Split layout (shown when notes exist) -->
      <div id="vs-notes-split" class="vs-notes-split" style="display: none;">
        <!-- List Panel -->
        <div id="vs-notes-list-panel" class="vs-notes-list-panel" style="width: ${listWidth}px;">
          <div class="vs-notes-list-header">
            <h2 class="vs-notes-list-title">Notes</h2>
            ${window.IS_DEMO ? '' : `<button id="btn-note-new" class="vs-notes-new-btn" title="New note (⌘N)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>`}
          </div>

          <div class="vs-notes-search-wrap">
            <svg class="vs-notes-search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input id="notes-search" type="text" class="vs-notes-search" placeholder="Search notes…" autocomplete="off" />
          </div>

          <div id="vs-notes-list" class="vs-notes-list">
            <div class="vs-notes-list-loading">Loading…</div>
          </div>

          <!-- Resize Handle (absolutely positioned on right edge) -->
          <div id="vs-notes-resize" class="vs-notes-resize"></div>
        </div>

        <!-- Editor Panel -->
        <div id="vs-notes-editor-panel" class="vs-notes-editor-panel">
          <div id="vs-notes-editor-content" class="vs-notes-editor-content">
            ${renderEditorPlaceholder()}
          </div>
        </div>
      </div>

      <!-- Mobile: Detail View (overlays list) -->
      <div id="vs-notes-mobile-detail" class="vs-notes-mobile-detail" style="display: none;"></div>
    </div>
  `;
}

// ═══════════════════════════════════════════
//  Init & Data Loading
// ═══════════════════════════════════════════

async function initNotes() {
  if (initialLoadDone) return;
  initialLoadDone = true;

  await loadNotes();
  bindNotesEvents();
}

async function loadNotes() {
  let result;
  if (searchQuery) {
    result = await api.get(`/notes/search?q=${encodeURIComponent(searchQuery)}`);
  } else {
    result = await api.get('/notes');
  }

  if (!result.ok) {
    showToast('Could not load notes.', 'error');
    return;
  }

  notes = result.data.notes || [];
  renderNotesList();
  updateLayout();

  // Restore previously selected note after navigation (module state survives
  // route changes because JS modules are singletons, but the DOM was rebuilt).
  if (activeNoteId) {
    const activeNote = notes.find(n => n.id === activeNoteId);
    if (activeNote) {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      if (isMobile) {
        mobileView = 'detail';
        renderMobileDetail(activeNote);
      } else {
        renderEditor(activeNote, { restoring: true });
      }
    } else {
      // Note was deleted while we were away — clear stale reference
      activeNoteId = null;
    }
  }
}

function updateLayout() {
  const emptyEl = document.getElementById('vs-notes-empty');
  const splitEl = document.getElementById('vs-notes-split');
  if (!emptyEl || !splitEl) return;

  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  if (notes.length === 0 && !searchQuery) {
    emptyEl.style.display = 'flex';
    splitEl.style.display = 'none';
  } else {
    emptyEl.style.display = 'none';
    splitEl.style.display = isMobile ? 'block' : 'flex';
  }
}

// ═══════════════════════════════════════════
//  Note List Rendering
// ═══════════════════════════════════════════

function renderNotesList() {
  const container = document.getElementById('vs-notes-list');
  if (!container) return;

  if (notes.length === 0) {
    if (searchQuery) {
      container.innerHTML = `
        <div class="vs-notes-no-results">No notes matching "${escapeHtml(searchQuery)}"</div>
      `;
    } else {
      container.innerHTML = '';
    }
    return;
  }

  // Separate pinned and unpinned
  const pinned = notes.filter(n => n.pinned == 1);
  const unpinned = notes.filter(n => n.pinned != 1);

  let html = '';

  if (pinned.length > 0 && !searchQuery) {
    html += `<div class="vs-notes-section-label">Pinned</div>`;
    html += pinned.map(n => renderNoteListItem(n)).join('');
    if (unpinned.length > 0) {
      html += `<div class="vs-notes-section-label vs-notes-section-label--rest">Notes</div>`;
    }
  }

  html += unpinned.map(n => renderNoteListItem(n)).join('');

  container.innerHTML = html;

  // Bind click events on list items
  container.querySelectorAll('[data-note-id]').forEach(el => {
    el.addEventListener('click', () => {
      const id = parseInt(el.dataset.noteId, 10);
      selectNote(id);
    });

    // Context menu
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showNoteContextMenu(e, parseInt(el.dataset.noteId, 10));
    });
  });
}

function renderNoteListItem(note) {
  const isActive = note.id === activeNoteId;
  const isPinned = note.pinned == 1;
  const title = note.title || 'Untitled';
  const preview = getPreviewSnippet(note.body);
  const time = timeAgo(note.updated_at);

  return `
    <div class="vs-note-item ${isActive ? 'vs-note-item--active' : ''}"
         data-note-id="${note.id}" tabindex="0" role="button">
      <div class="vs-note-item-top">
        ${isPinned ? '<span class="vs-note-pin" title="Pinned">📌</span>' : ''}
        <span class="vs-note-item-title">${escapeHtml(title)}</span>
      </div>
      ${preview ? `<div class="vs-note-item-preview">${highlightSearch(escapeHtml(preview))}</div>` : ''}
      <div class="vs-note-item-time">${time}</div>
    </div>
  `;
}

function getPreviewSnippet(body) {
  if (!body) return '';
  // Strip markdown syntax for a clean preview
  let text = body
    .replace(/^#{1,3} /gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*] /gm, '')
    .replace(/^\d+\. /gm, '')
    .replace(/^> /gm, '')
    .replace(/\n/g, ' ')
    .trim();
  return text.length > PREVIEW_SNIPPET_CHARS
    ? text.substring(0, PREVIEW_SNIPPET_CHARS).trim() + '…'
    : text;
}

function highlightSearch(text) {
  if (!searchQuery) return text;
  const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}

// ═══════════════════════════════════════════
//  Note Selection & Editor
// ═══════════════════════════════════════════

/**
 * Select a note by ID. If the same note is already selected, do nothing —
 * this matches Apple Notes convention where re-clicking keeps the selection.
 * Deselection happens via Escape or clicking empty space in the list.
 */
async function selectNote(id) {
  // Already selected — no-op (Apple Notes convention)
  if (id === activeNoteId) return;

  // Flush any pending save from the previous note
  await flushPendingSave();

  activeNoteId = id;
  previewMode = false;
  saveState = 'idle';

  // Update list highlighting
  document.querySelectorAll('.vs-note-item').forEach(el => {
    el.classList.toggle('vs-note-item--active', parseInt(el.dataset.noteId, 10) === id);
  });

  const note = notes.find(n => n.id === id);
  if (!note) return;

  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  if (isMobile) {
    mobileView = 'detail';
    renderMobileDetail(note);
  } else {
    renderEditor(note);
  }
}

/**
 * Deselect the active note — flush any pending save, clear the selection,
 * update the list highlighting, and show the editor placeholder.
 *
 * Extracted as a shared function because this behavior triggers from:
 * - Click on empty space in the list panel
 * - Escape key
 * - Deleting the active note
 */
async function deselectNote() {
  await flushPendingSave();
  activeNoteId = null;
  previewMode = false;
  saveState = 'idle';

  renderNotesList();

  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  if (isMobile && mobileView === 'detail') {
    mobileView = 'list';
    const container = document.getElementById('vs-notes-mobile-detail');
    if (container) container.style.display = 'none';
  } else {
    const editorPanel = document.getElementById('vs-notes-editor-content');
    if (editorPanel) {
      editorPanel.innerHTML = renderEditorPlaceholder();
    }
  }
}

/**
 * Render the note editor in the right panel.
 *
 * @param {object} note       The note data
 * @param {object} [opts]     Options
 * @param {boolean} [opts.restoring] If true, skip auto-focus (user is returning
 *   to the view, not actively clicking to edit — auto-focus would steal
 *   attention and feel jarring).
 */
function renderEditor(note, opts = {}) {
  const editorPanel = document.getElementById('vs-notes-editor-content');
  if (!editorPanel) return;

  const isPinned = note.pinned == 1;

  editorPanel.innerHTML = `
    <div class="vs-note-editor">
      <!-- Toolbar -->
      <div class="vs-note-toolbar">
        <div class="vs-note-toolbar-left">
          <span id="vs-note-save-status" class="vs-note-save-status${window.IS_DEMO ? ' vs-note-save-status--readonly' : ''}">${window.IS_DEMO ? 'Read-only' : ''}</span>
        </div>
        <div class="vs-note-toolbar-right">
          ${window.IS_DEMO ? '' : `<button id="btn-note-pin" class="vs-note-toolbar-btn ${isPinned ? 'vs-note-toolbar-btn--active' : ''}"
                  title="${isPinned ? 'Unpin' : 'Pin'}" aria-label="${isPinned ? 'Unpin note' : 'Pin note'}">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="${isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
          </button>`}
          <button id="btn-note-preview" class="vs-note-toolbar-btn"
                  title="Preview Markdown (⌘⇧P)" aria-label="Preview Markdown">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button id="btn-note-send-chat" class="vs-note-toolbar-btn"
                  title="Send to Chat (⌘⇧C)" aria-label="Send to Chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
          ${window.IS_DEMO ? '' : `<button id="btn-note-delete" class="vs-note-toolbar-btn vs-note-toolbar-btn--danger"
                  title="Delete note (⌘⌫)" aria-label="Delete note">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>`}
        </div>
      </div>

      <!-- Editor Body -->
      <div class="vs-note-editor-body">
        <input id="vs-note-title" class="vs-note-title-input" type="text"
               value="${escapeHtml(note.title)}" placeholder="Untitled"
               autocomplete="off" spellcheck="true" ${window.IS_DEMO ? 'readonly' : ''} />
        <div id="vs-note-body-wrap" class="vs-note-body-wrap">
          <textarea id="vs-note-body" class="vs-note-body-textarea"
                    placeholder="${window.IS_DEMO ? 'Read-only in demo mode.' : 'Start writing…'}" spellcheck="true" ${window.IS_DEMO ? 'readonly' : ''}>${escapeHtml(note.body)}</textarea>
        </div>
      </div>
    </div>
  `;

  // Bind editor events
  bindEditorEvents(note);

  // Auto-grow textarea
  const textarea = document.getElementById('vs-note-body');
  if (textarea) {
    autoGrow(textarea);

    // Only auto-focus when the user explicitly selected a note (not on
    // view restoration). Restoring focus after navigation would steal
    // attention — the user may be looking at the list, not editing.
    if (!opts.restoring) {
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }, 50);
    }
  }
}

function renderMobileDetail(note) {
  const container = document.getElementById('vs-notes-mobile-detail');
  if (!container) return;

  const isPinned = note.pinned == 1;

  container.style.display = 'flex';
  container.innerHTML = `
    <div class="vs-note-mobile-header">
      <button id="btn-note-back" class="vs-note-mobile-back" aria-label="Back to notes">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Notes
      </button>
      <div class="vs-note-mobile-actions">
        <span id="vs-note-save-status" class="vs-note-save-status${window.IS_DEMO ? ' vs-note-save-status--readonly' : ''}">${window.IS_DEMO ? 'Read-only' : ''}</span>
        ${window.IS_DEMO ? '' : `<button id="btn-note-pin" class="vs-note-toolbar-btn ${isPinned ? 'vs-note-toolbar-btn--active' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="${isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
        </button>`}
        ${window.IS_DEMO ? '' : `<button id="btn-note-delete" class="vs-note-toolbar-btn vs-note-toolbar-btn--danger">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>`}
      </div>
    </div>
    <div class="vs-note-editor-body">
      <input id="vs-note-title" class="vs-note-title-input" type="text"
             value="${escapeHtml(note.title)}" placeholder="Untitled"
             autocomplete="off" spellcheck="true" ${window.IS_DEMO ? 'readonly' : ''} />
      <div id="vs-note-body-wrap" class="vs-note-body-wrap">
        <textarea id="vs-note-body" class="vs-note-body-textarea"
                  placeholder="${window.IS_DEMO ? 'Read-only in demo mode.' : 'Start writing…'}" spellcheck="true" ${window.IS_DEMO ? 'readonly' : ''}>${escapeHtml(note.body)}</textarea>
      </div>
    </div>
  `;

  // Bind
  bindEditorEvents(note);

  const backBtn = document.getElementById('btn-note-back');
  backBtn?.addEventListener('click', async () => {
    await flushPendingSave();
    mobileView = 'list';
    container.style.display = 'none';
    activeNoteId = null;
    renderNotesList();
  });

  const textarea = document.getElementById('vs-note-body');
  if (textarea) {
    autoGrow(textarea);
    setTimeout(() => textarea.focus(), 50);
  }
}

// ═══════════════════════════════════════════
//  Editor Event Binding
// ═══════════════════════════════════════════

function bindEditorEvents(note) {
  const titleInput = document.getElementById('vs-note-title');
  const bodyTextarea = document.getElementById('vs-note-body');

  // Auto-save on input
  const onInput = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveState = 'idle';
    updateSaveStatus();
    saveTimer = setTimeout(() => saveActiveNote(), SAVE_DEBOUNCE_MS);
  };

  titleInput?.addEventListener('input', onInput);
  bodyTextarea?.addEventListener('input', () => {
    autoGrow(bodyTextarea);
    onInput();
  });

  // Pin toggle
  const pinBtn = document.getElementById('btn-note-pin');
  pinBtn?.addEventListener('click', async () => {
    if (demoGuard() || viewerGuard()) return;
    const isPinned = note.pinned == 1;
    const { ok, data } = await api.put(`/notes/${note.id}`, { pinned: isPinned ? 0 : 1 });
    if (ok && data.note) {
      note.pinned = data.note.pinned;
      // Update the cached list
      const idx = notes.findIndex(n => n.id === note.id);
      if (idx >= 0) notes[idx] = { ...notes[idx], ...data.note };

      // Refresh pin button state
      pinBtn.classList.toggle('vs-note-toolbar-btn--active', data.note.pinned == 1);
      const svg = pinBtn.querySelector('svg');
      if (svg) svg.setAttribute('fill', data.note.pinned == 1 ? 'currentColor' : 'none');

      renderNotesList();

      if (data.pin_limit) {
        showToast(data.pin_limit_message || 'You can pin up to 5 notes.', 'info');
      }
    }
  });

  // Preview toggle
  const previewBtn = document.getElementById('btn-note-preview');
  previewBtn?.addEventListener('click', togglePreview);

  // Send to Chat — read live DOM content, not the stale closure `note`
  const sendBtn = document.getElementById('btn-note-send-chat');
  sendBtn?.addEventListener('click', () => sendNoteToChat());

  // Delete
  const deleteBtn = document.getElementById('btn-note-delete');
  deleteBtn?.addEventListener('click', () => deleteNote(note.id));
}

// ═══════════════════════════════════════════
//  Auto-Save
// ═══════════════════════════════════════════

async function saveActiveNote() {
  if (!activeNoteId) return;
  if (window.IS_DEMO) return; // Demo mode — never attempt writes

  const titleInput = document.getElementById('vs-note-title');
  const bodyTextarea = document.getElementById('vs-note-body');

  if (!titleInput && !bodyTextarea) return;

  const title = titleInput?.value ?? '';
  const body = bodyTextarea?.value ?? '';

  saveState = 'saving';
  updateSaveStatus();

  const { ok, data } = await api.put(`/notes/${activeNoteId}`, { title, body });

  if (ok && data?.note) {
    saveState = 'saved';
    updateSaveStatus();

    // Update cached note
    const idx = notes.findIndex(n => n.id === activeNoteId);
    if (idx >= 0) {
      notes[idx] = { ...notes[idx], ...data.note };
    }

    // Refresh list to reflect title/time changes
    renderNotesList();

    // Fade "Saved" after display period
    if (savedFadeTimer) clearTimeout(savedFadeTimer);
    savedFadeTimer = setTimeout(() => {
      saveState = 'idle';
      updateSaveStatus();
    }, SAVED_DISPLAY_MS);
  } else {
    saveState = 'error';
    updateSaveStatus();
  }
}

function updateSaveStatus() {
  const el = document.getElementById('vs-note-save-status');
  if (!el) return;

  switch (saveState) {
    case 'saving':
      el.textContent = '';
      el.className = 'vs-note-save-status';
      break;
    case 'saved':
      el.textContent = 'Saved';
      el.className = 'vs-note-save-status vs-note-save-status--saved';
      break;
    case 'error':
      el.textContent = 'Could not save';
      el.className = 'vs-note-save-status vs-note-save-status--error';
      break;
    default:
      el.textContent = '';
      el.className = 'vs-note-save-status';
  }
}

// ═══════════════════════════════════════════
//  Note Actions
// ═══════════════════════════════════════════

async function createNote() {
  if (demoGuard() || viewerGuard()) return;

  const { ok, data } = await api.post('/notes', { title: '', body: '' });
  if (ok && data?.note) {
    notes.unshift(data.note);
    renderNotesList();
    updateLayout();
    selectNote(data.note.id);
  }
}

async function deleteNote(id) {
  if (demoGuard() || viewerGuard()) return;

  const { ok } = await api.delete(`/notes/${id}`);
  if (!ok) {
    showToast('Could not delete note.', 'error');
    return;
  }

  // Remove from local list
  notes = notes.filter(n => n.id !== id);

  // If we deleted the active note, deselect (but skip flush — we just deleted)
  if (activeNoteId === id) {
    activeNoteId = null;
    previewMode = false;
    saveState = 'idle';
    const editorPanel = document.getElementById('vs-notes-editor-content');
    if (editorPanel) {
      editorPanel.innerHTML = renderEditorPlaceholder();
    }
  }

  renderNotesList();
  updateLayout();

  // Undo toast
  showToastWithAction('Note deleted', 'Undo', async () => {
    const result = await api.post(`/notes/${id}/restore`);
    if (result.ok && result.data?.note) {
      notes.unshift(result.data.note);
      renderNotesList();
      updateLayout();
      selectNote(result.data.note.id);
      showToast('Note restored.', 'success');
    }
  }, 'info');

  // On mobile, go back to list
  const mobileDetail = document.getElementById('vs-notes-mobile-detail');
  if (mobileDetail) mobileDetail.style.display = 'none';
}

function togglePreview() {
  const bodyWrap = document.getElementById('vs-note-body-wrap');
  const previewBtn = document.getElementById('btn-note-preview');
  if (!bodyWrap) return;

  if (!previewMode) {
    // Entering preview — cache the body text because we're about to
    // replace the textarea with a rendered preview div.
    const textarea = document.getElementById('vs-note-body');
    if (!textarea) return;
    previewBodyCache = textarea.value;
    previewMode = true;

    const rendered = renderMarkdown(previewBodyCache);
    bodyWrap.innerHTML = `<div id="vs-note-preview" class="vs-note-preview">${rendered}</div>`;
    previewBtn?.classList.add('vs-note-toolbar-btn--active');
  } else {
    // Exiting preview — restore the textarea from the cached body text.
    previewMode = false;

    bodyWrap.innerHTML = `<textarea id="vs-note-body" class="vs-note-body-textarea"
                    placeholder="Start writing…" spellcheck="true">${escapeHtml(previewBodyCache)}</textarea>`;
    const newTextarea = document.getElementById('vs-note-body');

    // Rebind input events
    if (newTextarea) {
      autoGrow(newTextarea);
      newTextarea.addEventListener('input', () => {
        autoGrow(newTextarea);
        if (saveTimer) clearTimeout(saveTimer);
        saveState = 'idle';
        updateSaveStatus();
        saveTimer = setTimeout(() => saveActiveNote(), SAVE_DEBOUNCE_MS);
      });
      newTextarea.focus();
    }
    previewBtn?.classList.remove('vs-note-toolbar-btn--active');
  }
}

/**
 * Read the current title and body from the live DOM, not from a cached note.
 * Falls back to previewBodyCache when the preview is active (textarea is gone).
 * Returns { title, body } — always strings, never null.
 */
function getLiveNoteContent() {
  const titleInput = document.getElementById('vs-note-title');
  const bodyTextarea = document.getElementById('vs-note-body');
  return {
    title: titleInput?.value ?? '',
    body: previewMode ? previewBodyCache : (bodyTextarea?.value ?? ''),
  };
}

/**
 * Navigate to Chat and pre-fill the prompt with note content.
 *
 * If `noteOverride` is provided (context menu on a non-active note),
 * uses its cached title/body. Otherwise reads live DOM values so
 * in-progress edits are included.
 */
async function sendNoteToChat(noteOverride) {
  await flushPendingSave();

  let title, body;
  if (noteOverride) {
    title = noteOverride.title || '';
    body = noteOverride.body || '';
  } else {
    ({ title, body } = getLiveNoteContent());
  }
  const displayTitle = title || 'Untitled';
  const prompt = `Here is my note "${displayTitle}":\n\n${body}\n\n`;

  window.location.hash = '#/chat';

  // Wait for Chat view to mount, then prefill
  setTimeout(() => {
    const input = document.getElementById('prompt-input');
    if (input) {
      input.value = prompt;
      input.focus();
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
    }
  }, 150);
}

// ═══════════════════════════════════════════
//  Context Menu
// ═══════════════════════════════════════════

function showNoteContextMenu(e, noteId) {
  // Remove any existing context menu
  document.getElementById('vs-note-ctx')?.remove();

  const note = notes.find(n => n.id === noteId);
  if (!note) return;

  const isPinned = note.pinned == 1;

  const menu = document.createElement('div');
  menu.id = 'vs-note-ctx';
  menu.className = 'vs-note-context-menu';
  menu.style.left = `${e.clientX}px`;
  menu.style.top = `${e.clientY}px`;

  menu.innerHTML = `
    ${window.IS_DEMO ? '' : `<button data-action="pin" class="vs-note-ctx-item">
      ${isPinned ? 'Unpin' : 'Pin'}
    </button>`}
    <button data-action="send" class="vs-note-ctx-item">
      Send to Chat
    </button>
    <button data-action="use" class="vs-note-ctx-item">
      Use as Prompt
    </button>
    ${window.IS_DEMO ? '' : `<div class="vs-note-ctx-divider"></div>
    <button data-action="delete" class="vs-note-ctx-item vs-note-ctx-item--danger">
      Delete
    </button>`}
  `;

  document.body.appendChild(menu);

  // Position check — make sure menu doesn't go off-screen
  requestAnimationFrame(() => {
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${window.innerWidth - rect.width - 8}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${window.innerHeight - rect.height - 8}px`;
    }
  });

  // Handle clicks
  menu.addEventListener('click', async (ev) => {
    const action = ev.target.closest('[data-action]')?.dataset.action;
    if (!action) return;

    menu.remove();

    switch (action) {
      case 'pin': {
        if (demoGuard() || viewerGuard()) return;
        const newPinned = isPinned ? 0 : 1;
        const { ok, data } = await api.put(`/notes/${noteId}`, { pinned: newPinned });
        if (ok && data.note) {
          const idx = notes.findIndex(n => n.id === noteId);
          if (idx >= 0) notes[idx] = { ...notes[idx], ...data.note };
          renderNotesList();
          if (data.pin_limit) {
            showToast(data.pin_limit_message || 'You can pin up to 5 notes.', 'info');
          }
        }
        break;
      }
      case 'send': {
        // Use live DOM for the active note; cached data for any other note
        const sendOverride = noteId !== activeNoteId ? note : undefined;
        sendNoteToChat(sendOverride);
        break;
      }
      case 'use': {
        // Paste note body into chat composer as a ready-to-send prompt
        await flushPendingSave();
        const useBody = noteId === activeNoteId
          ? getLiveNoteContent().body
          : (note.body || '');
        window.location.hash = '#/chat';
        setTimeout(() => {
          const input = document.getElementById('prompt-input');
          if (input) {
            input.value = useBody;
            input.focus();
            input.style.height = 'auto';
            input.style.height = input.scrollHeight + 'px';
          }
        }, 150);
        break;
      }
      case 'delete':
        deleteNote(noteId);
        break;
    }
  });

  // Close on outside click
  const closeHandler = (ev) => {
    if (!menu.contains(ev.target)) {
      menu.remove();
      document.removeEventListener('click', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('click', closeHandler), 0);
}

// ═══════════════════════════════════════════
//  Global Events
// ═══════════════════════════════════════════

function bindNotesEvents() {
  // New note button
  const newBtn = document.getElementById('btn-note-new');
  newBtn?.addEventListener('click', createNote);

  // Empty state button
  const firstBtn = document.getElementById('btn-notes-first');
  firstBtn?.addEventListener('click', createNote);

  // Search input
  const searchInput = document.getElementById('notes-search');
  searchInput?.addEventListener('input', () => {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = searchInput.value.trim();
      loadNotes();
    }, SEARCH_DEBOUNCE_MS);
  });

  // Click on empty space in the left panel → deselect
  // Covers the full panel area including below the search and header,
  // but excludes interactive elements (note items, buttons, inputs).
  const listPanel = document.getElementById('vs-notes-list-panel');
  listPanel?.addEventListener('click', (e) => {
    // Ignore clicks on note items, buttons, inputs, and section labels
    if (e.target.closest('.vs-note-item')) return;
    if (e.target.closest('button')) return;
    if (e.target.closest('input')) return;
    if (e.target.closest('.vs-notes-section-label')) return;
    if (activeNoteId) deselectNote();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', handleNotesKeyboard);

  // Resize handle
  initResize();
}

function handleNotesKeyboard(e) {
  // Only active on Notes route
  if (store.get('route') !== 'notes') return;

  const isMac = navigator.platform.toUpperCase().includes('MAC');
  const mod = isMac ? e.metaKey : e.ctrlKey;

  // Cmd+N → New note
  if (mod && e.key === 'n') {
    e.preventDefault();
    createNote();
    return;
  }

  // Cmd+Backspace → Delete active note
  if (mod && e.key === 'Backspace' && activeNoteId) {
    e.preventDefault();
    deleteNote(activeNoteId);
    return;
  }

  // Cmd+Shift+P → Toggle preview
  if (mod && e.shiftKey && e.key === 'p') {
    e.preventDefault();
    if (activeNoteId) togglePreview();
    return;
  }

  // Cmd+Shift+C → Send to Chat
  if (mod && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
    e.preventDefault();
    const note = notes.find(n => n.id === activeNoteId);
    if (note) sendNoteToChat(note);
    return;
  }

  // Escape → Deselect (desktop) or back (mobile)
  if (e.key === 'Escape') {
    // Don't intercept if a modal is open
    if (document.querySelector('.vs-modal-overlay.is-visible')) return;

    if (activeNoteId) {
      deselectNote();
    }
    return;
  }

  // Arrow keys for list navigation
  if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !e.metaKey && !e.ctrlKey) {
    const focusedItem = document.activeElement?.closest('.vs-note-item');
    if (!focusedItem) return;

    e.preventDefault();
    const items = [...document.querySelectorAll('.vs-note-item')];
    const currentIdx = items.indexOf(focusedItem);
    const nextIdx = e.key === 'ArrowDown'
      ? Math.min(currentIdx + 1, items.length - 1)
      : Math.max(currentIdx - 1, 0);

    items[nextIdx]?.focus();
  }

  // Enter → select focused note
  if (e.key === 'Enter') {
    const focusedItem = document.activeElement?.closest('.vs-note-item');
    if (focusedItem) {
      e.preventDefault();
      selectNote(parseInt(focusedItem.dataset.noteId, 10));
    }
  }
}

// ═══════════════════════════════════════════
//  Resize Handle
// ═══════════════════════════════════════════

function initResize() {
  const handle = document.getElementById('vs-notes-resize');
  const listPanel = document.getElementById('vs-notes-list-panel');
  if (!handle || !listPanel) return;

  let startX, startWidth;

  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startX = e.clientX;
    startWidth = listPanel.offsetWidth;

    const onMove = (ev) => {
      const newWidth = Math.max(200, Math.min(500, startWidth + ev.clientX - startX));
      listPanel.style.width = `${newWidth}px`;
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      localStorage.setItem(LIST_WIDTH_KEY, String(listPanel.offsetWidth));
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

// ═══════════════════════════════════════════
//  Textarea Auto-Grow
// ═══════════════════════════════════════════

function autoGrow(textarea) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  const maxHeight = window.innerHeight - 200; // Leave room for toolbar + title
  textarea.style.height = Math.min(maxHeight, textarea.scrollHeight) + 'px';
}

// ═══════════════════════════════════════════
//  Cleanup (called when navigating away)
// ═══════════════════════════════════════════

export function cleanupNotes() {
  document.removeEventListener('keydown', handleNotesKeyboard);
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  if (savedFadeTimer) {
    clearTimeout(savedFadeTimer);
    savedFadeTimer = null;
  }
  // Reset ephemeral view state that shouldn't leak across navigation.
  searchQuery = '';
  previewMode = false;
  previewBodyCache = '';
  initialLoadDone = false;
  // Unregister flush callback — prevents stale invocations when Notes is unmounted
  window.__vsFlushCallbacks?.delete('notes');
  // Remove context menu if open
  document.getElementById('vs-note-ctx')?.remove();
}
