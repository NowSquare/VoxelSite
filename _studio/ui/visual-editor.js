/**
 * VoxelSite Visual Editor
 *
 * Click-and-edit overlay for the preview iframe.
 * Zero external dependencies. The browser IS the editor.
 *
 * Save Pipeline:
 *   DOM edit → extract modified HTML → find in PHP source (page or partial) →
 *   replace → PUT /files/content → revision + Tailwind recompile → preview refresh
 *
 * Engineering findings (2026-02-16):
 * - The style panel must keep explicit UI state (active color property/family) instead of
 *   inferring from classes every render, otherwise "Text/Bg/Border" tabs are not controllable.
 * - Save operations must drain pending edits that arrive while a save is in-flight; otherwise
 *   fast edits can be left unsaved.
 * - Drag listeners must be scoped/cleaned per panel instance to avoid event-leak buildup.
 * - Preview-only class changes should not emit new persistence events until the user applies.
 */

import { api, apiStream } from './api.js';
import { onBackdropClick } from './src/ui/modals.js';
import { normalizeSourceAddress, isEditableAddress, getReadOnlyMessage, isGlobalAddress } from './visual-editor-addressing.js';
import { openCodeEditorModal, ensureMonacoReady, monacoThemeForCurrentUi } from './src/views/editor.js';
import {
  OpType, opSetText, opSetClassList, opDeleteNode, opReplaceHtml, opSetAttribute,
  opFallback, invertOp, validateOp, isSupportedOp, opLabel,
  applyOp, locateByNodeKey,
} from './visual-editor-ops.js';
import {
  pushOp, peekUndoEntry, commitUndo, peekRedoEntry, commitRedo,
  canUndo, canRedo, clearHistory, invalidateFile, onHistoryChange,
} from './visual-editor-history.js';

// ═══════════════════════════════════════════
//  State
// ═══════════════════════════════════════════

let editorActive = false;
let selectedElement = null;
let selectedAddress = null; // VE-005: normalized source address for selected element
let pendingChanges = [];
let isSaving = false;

// VE-014: Operation log — records every operation for instrumentation.
// Capped at 200 entries to avoid unbounded memory growth.
const _opLog = [];
const OP_LOG_MAX = 200;
let visualEditorInitialized = false;

// VE-022: Counter to suppress history clear during controlled undo/redo replay.
// Incremented by 2 before sending replay-op (one for iframe load, one for bridge-ready).
// Each event decrements by 1. When >0, clearHistory() is skipped.
let _historyReplayInFlight = 0;

// ═══════════════════════════════════════════
//  Tailwind Data
// ═══════════════════════════════════════════

const TW = {
  sizes: ['xs','sm','base','lg','xl','2xl','3xl','4xl','5xl','6xl','7xl','8xl','9xl'],
  weights: ['thin','extralight','light','normal','medium','semibold','bold','extrabold','black'],
  aligns: ['left','center','right','justify'],
  trackings: ['tighter','tight','normal','wide','wider','widest'],
  leadings: ['none','tight','snug','normal','relaxed','loose','3','4','5','6','7','8','9','10'],
  transforms: ['normal-case','uppercase','lowercase','capitalize'],
  decorations: ['no-underline','underline','line-through'],
  positions: ['static','relative','absolute','fixed','sticky'],
  flexDirs: ['flex-row','flex-col','flex-row-reverse','flex-col-reverse'],
  justifies: ['justify-start','justify-center','justify-end','justify-between','justify-around','justify-evenly'],
  aligns_items: ['items-start','items-center','items-end','items-stretch','items-baseline'],
  gaps: ['0','1','2','3','4','5','6','8','10','12','16','20','24','32'],
  gridCols: ['1','2','3','4','5','6','8','10','12'],
  gridRows: ['1','2','3','4','5','6'],
  coordinates: ['auto','0','0.5','1','2','4','6','8','10','12','16','20','24','32','40','48','64'],
  spacings: ['0','0.5','1','1.5','2','2.5','3','3.5','4','5','6','7','8','9','10','11','12','14','16','20','24','28','32','36','40','44','48','52','56','60','64','72','80','96'],
  compactSpacings: ['0','0.5','1','2','3','4','5','6','8','10','12','16','20','24','32','40','48','64'],
  radii: ['none','sm','','md','lg','xl','2xl','3xl','full'],
  shadows: ['none','sm','','md','lg','xl','2xl','inner'],
  borderWidths: ['0','','2','4','8'],
  borderStyles: ['solid','dashed','dotted','double','none'],
  colors: [
    { name: 'slate',   shades: { 50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b',900:'#0f172a',950:'#020617' }},
    { name: 'gray',    shades: { 50:'#f9fafb',100:'#f3f4f6',200:'#e5e7eb',300:'#d1d5db',400:'#9ca3af',500:'#6b7280',600:'#4b5563',700:'#374151',800:'#1f2937',900:'#111827',950:'#030712' }},
    { name: 'red',     shades: { 50:'#fef2f2',100:'#fee2e2',200:'#fecaca',300:'#fca5a5',400:'#f87171',500:'#ef4444',600:'#dc2626',700:'#b91c1c',800:'#991b1b',900:'#7f1d1d',950:'#450a0a' }},
    { name: 'orange',  shades: { 50:'#fff7ed',100:'#ffedd5',200:'#fed7aa',300:'#fdba74',400:'#fb923c',500:'#f97316',600:'#ea580c',700:'#c2410c',800:'#9a3412',900:'#7c2d12',950:'#431407' }},
    { name: 'amber',   shades: { 50:'#fffbeb',100:'#fef3c7',200:'#fde68a',300:'#fcd34d',400:'#fbbf24',500:'#f59e0b',600:'#d97706',700:'#b45309',800:'#92400e',900:'#78350f',950:'#451a03' }},
    { name: 'yellow',  shades: { 50:'#fefce8',100:'#fef9c3',200:'#fef08a',300:'#fde047',400:'#facc15',500:'#eab308',600:'#ca8a04',700:'#a16207',800:'#854d0e',900:'#713f12',950:'#422006' }},
    { name: 'green',   shades: { 50:'#f0fdf4',100:'#dcfce7',200:'#bbf7d0',300:'#86efac',400:'#4ade80',500:'#22c55e',600:'#16a34a',700:'#15803d',800:'#166534',900:'#14532d',950:'#052e16' }},
    { name: 'emerald', shades: { 50:'#ecfdf5',100:'#d1fae5',200:'#a7f3d0',300:'#6ee7b7',400:'#34d399',500:'#10b981',600:'#059669',700:'#047857',800:'#065f46',900:'#064e3b',950:'#022c22' }},
    { name: 'teal',    shades: { 50:'#f0fdfa',100:'#ccfbf1',200:'#99f6e4',300:'#5eead4',400:'#2dd4bf',500:'#14b8a6',600:'#0d9488',700:'#0f766e',800:'#115e59',900:'#134e4a',950:'#042f2e' }},
    { name: 'cyan',    shades: { 50:'#ecfeff',100:'#cffafe',200:'#a5f3fc',300:'#67e8f9',400:'#22d3ee',500:'#06b6d4',600:'#0891b2',700:'#0e7490',800:'#155e75',900:'#164e63',950:'#083344' }},
    { name: 'sky',     shades: { 50:'#f0f9ff',100:'#e0f2fe',200:'#bae6fd',300:'#7dd3fc',400:'#38bdf8',500:'#0ea5e9',600:'#0284c7',700:'#0369a1',800:'#075985',900:'#0c4a6e',950:'#082f49' }},
    { name: 'blue',    shades: { 50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a',950:'#172554' }},
    { name: 'indigo',  shades: { 50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',500:'#6366f1',600:'#4f46e5',700:'#4338ca',800:'#3730a3',900:'#312e81',950:'#1e1b4b' }},
    { name: 'violet',  shades: { 50:'#f5f3ff',100:'#ede9fe',200:'#ddd6fe',300:'#c4b5fd',400:'#a78bfa',500:'#8b5cf6',600:'#7c3aed',700:'#6d28d9',800:'#5b21b6',900:'#4c1d95',950:'#2e1065' }},
    { name: 'purple',  shades: { 50:'#faf5ff',100:'#f3e8ff',200:'#e9d5ff',300:'#d8b4fe',400:'#c084fc',500:'#a855f7',600:'#9333ea',700:'#7e22ce',800:'#6b21a8',900:'#581c87',950:'#3b0764' }},
    { name: 'pink',    shades: { 50:'#fdf2f8',100:'#fce7f3',200:'#fbcfe8',300:'#f9a8d4',400:'#f472b6',500:'#ec4899',600:'#db2777',700:'#be185d',800:'#9d174d',900:'#831843',950:'#500724' }},
    { name: 'rose',    shades: { 50:'#fff1f2',100:'#ffe4e6',200:'#fecdd3',300:'#fda4af',400:'#fb7185',500:'#f43f5e',600:'#e11d48',700:'#be123c',800:'#9f1239',900:'#881337',950:'#4c0519' }},
  ],
  specialColors: [
    { name: 'white', hex: '#ffffff' },
    { name: 'black', hex: '#000000' },
    { name: 'transparent', hex: 'transparent' },
  ],
};

// ═══════════════════════════════════════════
//  Public API
// ═══════════════════════════════════════════

export function toggleVisualEditor() {
  editorActive = !editorActive;
  updateEditorUI();
  sendToPreview({ type: 'vx-editor:toggle', active: editorActive });
  if (!editorActive) {
    dismissToolbar();
    dismissRichTextToolbar();
    closeStylePanel();
    closeAIEditPanel();
    selectedElement = null;
    richTextActive = false;
  }
}

export function isVisualEditorActive() { return editorActive; }
export function hasVisualEditorSelection() { return editorActive && selectedElement !== null; }
export function hasVisualEditorFloatingPanel() {
  return !!document.getElementById('vx-style-panel') || !!document.getElementById('vx-ai-panel');
}

/**
 * Close floating panels (style editor, AI panel) without deselecting.
 * The element remains selected and the context toolbar returns.
 */
export function closeVisualEditorPanels() {
  closeStylePanel();
  closeAIEditPanel();
}

/**
 * Cancel an in-flight AI generation started from the visual editor.
 * Returns true if a generation was actually cancelled, false if idle.
 */
export function cancelVisualEditorAI() {
  if (aiEditAbortController) {
    aiEditAbortController.abort();
    aiEditAbortController = null;
    sendToPreview({ type: 'vx-editor:hide-ai-overlay' });
    // Don't show indicator here — onDone({ cancelled: true }) handles it
    return true;
  }
  return false;
}

export function deactivateVisualEditor() {
  if (!editorActive) return;
  editorActive = false;
  updateEditorUI();
  sendToPreview({ type: 'vx-editor:toggle', active: false });
  dismissToolbar();
  dismissRichTextToolbar();
  closeStylePanel();
  closeAIEditPanel();
  selectedElement = null;
  richTextActive = false;
}

/**
 * Clear the active selection and all floating UI (toolbar, rich text bar,
 * style panel, AI panel) without deactivating the editor.
 *
 * Used by undo/redo: the preview iframe is about to reload, so any
 * selection referencing the old DOM must be cleared. The editor itself
 * stays active — the user can re-select after the preview refreshes.
 */
export function dismissVisualEditorSelection() {
  dismissToolbar();
  dismissRichTextToolbar();
  closeStylePanel();
  closeAIEditPanel();
  selectedElement = null;
  selectedAddress = null;
  richTextActive = false;
  // Tell the bridge to deselect (remove highlight outline in preview)
  sendToPreview({ type: 'vx-editor:deselect-from-parent' });
}

export function initVisualEditor() {
  if (visualEditorInitialized) return;
  visualEditorInitialized = true;
  window.addEventListener('message', handlePreviewMessage);

  // ⌘E / Ctrl+E → Open Code Editor for read-only element
  document.addEventListener('keydown', (e) => {
    if (!editorActive) return;
    if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
      // Don't hijack the shortcut when focus is in a form control,
      // contentEditable, or the code editor modal
      const el = document.activeElement;
      if (el) {
        const tag = el.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
        if (el.isContentEditable) return;
        if (el.closest('.vs-modal, .vs-code-editor')) return;
      }
      const address = selectedAddress;
      if (address && !isEditableAddress(address) && address.sourceFile) {
        e.preventDefault();
        openCodeEditorModal(address.sourceFile);
        dismissToolbar();
      }
    }
  });

  // VE-021: ⌘Z / Ctrl+Z → Undo, ⌘⇧Z / Ctrl+⇧Z → Redo
  document.addEventListener('keydown', (e) => {
    if (!editorActive) return;
    if (!(e.metaKey || e.ctrlKey) || e.key !== 'z') return;

    // Don't hijack undo/redo in form controls, contentEditable, or Monaco
    const el = document.activeElement;
    if (el) {
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (el.isContentEditable) return;
      if (el.closest('.vs-modal, .vs-code-editor, .monaco-editor')) return;
    }

    e.preventDefault();
    if (e.shiftKey) {
      handleRedo();
    } else {
      handleUndo();
    }
  });

  // Safety net: if the iframe navigates while editing, cancel editing
  const iframe = document.getElementById('preview-iframe');
  if (iframe) {
    iframe.addEventListener('load', () => {
      if (richTextActive) {
        onEditingEnded();
      }
      // VE-023: Invalidate history on preview reload — unless this is a controlled
      // undo/redo replay (flag set by handleUndo/handleRedo before sending replay-op)
      if (_historyReplayInFlight > 0) {
        _historyReplayInFlight--;
      } else {
        clearHistory('preview iframe reloaded');
      }
      // Re-send editor state after iframe reload (fallback for bridge-ready race)
      if (editorActive) {
        setTimeout(() => sendToPreview({ type: 'vx-editor:toggle', active: true }), 200);
      }
    });
  }
}

// ═══════════════════════════════════════════
//  Message Handling
// ═══════════════════════════════════════════

function handlePreviewMessage(e) {
  if (!e.data || typeof e.data !== 'object') return;
  if (!e.data.type || !e.data.type.startsWith('vx-editor:')) return;
  if (e.origin !== window.location.origin) return;

  switch (e.data.type) {
    case 'vx-editor:select':
      selectedElement = e.data;
      selectedAddress = normalizeSourceAddress(e.data.sourceAddress);
      closeStylePanel();
      closeAIEditPanel();
      showContextToolbar(e.data);
      break;
    case 'vx-editor:text-changed':
      queueTextChange(e.data);
      // Text edits from explicit Apply — save immediately (no debounce).
      // Class changes from the style panel use changeKind 'class' and
      // don't show per-element saving state, so they keep the debounce.
      if (!e.data.changeKind) {
        clearTimeout(queueTextChange._timer);
        (async () => {
          // If another save is in flight, wait for it to finish first.
          // Its finally-drain will pick up our queued change automatically.
          while (isSaving) {
            await new Promise(r => setTimeout(r, 50));
          }
          // Save our change (may be no-op if the drain already handled it).
          // Enforce a minimum 400ms visible duration for the saving animation.
          await Promise.all([
            saveAllPending(),
            new Promise(r => setTimeout(r, 400))
          ]);
          sendToPreview({ type: 'vx-editor:text-save-complete' });
        })();
      }
      break;
    case 'vx-editor:source-edit-changed':
      saveSourceEdit(e.data);
      break;
    case 'vx-editor:element-deleted':
      queueDeletion(e.data);
      break;
    case 'vx-editor:deselect':
      dismissToolbar();
      dismissRichTextToolbar();
      closeStylePanel();
      closeAIEditPanel();
      selectedElement = null;
      selectedAddress = null;
      break;
    case 'vx-editor:save-request':
      saveAllPending();
      break;
    // Rich text events
    case 'vx-editor:editing-started':
      onEditingStarted(e.data);
      break;
    case 'vx-editor:editing-ended':
      onEditingEnded();
      break;
    case 'vx-editor:selection-state':
      onSelectionState(e.data);
      break;
    case 'vx-editor:element-rect':
      onElementRectUpdate(e.data);
      break;
    case 'vx-editor:richtext-link-request':
      promptForLink();
      break;
    case 'vx-editor:add-section-request':
      openSectionPicker(e.data);
      break;
    case 'vx-editor:section-moved':
      persistSectionMove(e.data);
      break;
    case 'vx-editor:bridge-ready':
      // Bridge just initialized (after iframe reload). Re-send editor state.
      // VE-023: Clear history — unless this is a controlled undo/redo replay
      if (_historyReplayInFlight > 0) {
        _historyReplayInFlight--;
      } else {
        clearHistory('bridge re-initialized');
      }
      if (editorActive) {
        sendToPreview({ type: 'vx-editor:toggle', active: true });
      }
      break;
    case 'vx-editor:source-edit-ready':
      openInlineSourceEditor(e.data);
      break;
    case 'vx-editor:escape-pressed':
      // Escape pressed in the iframe — bridge already deselected if needed.
      // Handle cancellation or editor deactivation on the parent side.
      if (cancelVisualEditorAI()) break;
      if (hasVisualEditorFloatingPanel()) { closeVisualEditorPanels(); break; }
      deactivateVisualEditor();
      break;
  }
}

// ═══════════════════════════════════════════
//  Rich Text Editing Bar
// ═══════════════════════════════════════════

let richTextActive = false;
let richTextHasPhp = false;
let richTextElementRect = null; // rect of the element being edited (iframe-relative)
let lastFormatting = {};
let lastLink = null;
let lastLinkClasses = [];
let lastBlockTag = null;

function onEditingStarted(data) {
  richTextActive = true;
  richTextHasPhp = !!data.hasPhp;
  richTextElementRect = data.rect || null;
  lastFormatting = {};
  lastBlockTag = data.tagName || 'P';
  dismissToolbar(); // hide the context toolbar while editing
  showEditingBar();
}

function onEditingEnded() {
  richTextActive = false;
  richTextHasPhp = false;
  richTextElementRect = null;
  lastFormatting = {};
  dismissEditingBar();
}

function onSelectionState(data) {
  if (!richTextActive) return;
  // Update element rect for toolbar repositioning
  if (data.elementRect) {
    richTextElementRect = data.elementRect;
    repositionEditingBar();
  }
  if (!data.hasSelection) {
    // Even without a selection, keep the bar visible — just clear active states
    lastFormatting = {};
    lastLink = null;
    lastLinkClasses = [];
    updateFormattingState();
    return;
  }
  // Update formatting state on the persistent bar
  lastFormatting = data.formatting || {};
  lastBlockTag = data.blockTag || lastBlockTag;
  lastLink = data.link || null;
  lastLinkClasses = data.linkClasses || [];
  updateFormattingState();
}

/** Handle element rect update (e.g., element grew after Enter) */
function onElementRectUpdate(data) {
  if (!richTextActive) return;
  if (data.rect) {
    richTextElementRect = data.rect;
    repositionEditingBar();
  }
}

/** Reposition the editing bar based on the current element rect. */
function repositionEditingBar() {
  const bar = document.getElementById('vx-richtext-toolbar');
  if (bar) positionEditingBar(bar);
}

/** Show the persistent editing bar anchored above the element. */
function showEditingBar() {
  let bar = document.getElementById('vx-richtext-toolbar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'vx-richtext-toolbar';
    bar.className = 'vx-richtext-toolbar';
    // Prevent clicks from stealing focus from the contenteditable
    bar.addEventListener('mousedown', (e) => e.preventDefault());
    document.body.appendChild(bar);
  }

  positionEditingBar(bar);
  renderEditingBarContent(bar);
  bar.classList.add('vx-rt-visible');
}

function positionEditingBar(bar) {
  if (!richTextElementRect) return;
  const iframe = document.getElementById('preview-iframe');
  if (!iframe) return;

  const ir = iframe.getBoundingClientRect();
  const elLeft = ir.left + richTextElementRect.left;
  const elTop = ir.top + richTextElementRect.top;
  const elWidth = richTextElementRect.width;

  bar.style.left = `${elLeft + elWidth / 2}px`;
  bar.style.top = `${elTop - 6}px`;
}

function renderEditingBarContent(bar) {
  const fmt = lastFormatting;
  const phpMode = richTextHasPhp;

  bar.innerHTML = `<div class="vx-rt-actions">
    ${phpMode ? `<span class="vx-rt-php-hint" title="This element contains PHP code. Use the Code Editor for full control.">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      PHP detected
    </span>` : `
    <button class="vx-rt-btn${fmt.bold ? ' vx-rt-active' : ''}" data-cmd="bold" title="Bold (⌘B)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
    </button>
    <button class="vx-rt-btn${fmt.italic ? ' vx-rt-active' : ''}" data-cmd="italic" title="Italic (⌘I)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
    </button>
    <div class="vx-rt-divider"></div>
    <button class="vx-rt-btn" data-cmd="insertLink" title="Link (⌘K)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
    </button>
    `}
    <div class="vx-rt-divider"></div>
    <button class="vx-rt-btn vx-rt-btn-cancel" data-action="cancel" title="Cancel (Esc)">
      Cancel <kbd>Esc</kbd>
    </button>
    <button class="vx-rt-btn vx-rt-btn-save" data-action="save" title="Apply (⌘↵)">
      Apply <kbd>${navigator.platform?.includes('Mac') ? '⌘↵' : 'Ctrl+↵'}</kbd>
    </button>
  </div>`;

  // Bind formatting buttons
  bar.querySelectorAll('[data-cmd]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cmd = btn.dataset.cmd;

      if (cmd === 'insertLink') {
        promptForLink();
        return;
      }

      sendToPreview({ type: 'vx-editor:richtext-command', command: cmd });
    });
  });

  // Bind Apply / Cancel
  const cancelBtn = bar.querySelector('[data-action="cancel"]');
  const saveBtn = bar.querySelector('[data-action="save"]');
  if (cancelBtn) cancelBtn.addEventListener('click', (e) => { e.stopPropagation(); sendToPreview({ type: 'vx-editor:cancel-edit' }); });
  if (saveBtn) saveBtn.addEventListener('click', (e) => { e.stopPropagation(); sendToPreview({ type: 'vx-editor:save-edit' }); });
}

/** Update the active/inactive state of formatting buttons without re-rendering. */
function updateFormattingState() {
  const bar = document.getElementById('vx-richtext-toolbar');
  if (!bar) return;
  const fmt = lastFormatting;
  const stateMap = { bold: fmt.bold, italic: fmt.italic };
  bar.querySelectorAll('[data-cmd]').forEach(btn => {
    const cmd = btn.dataset.cmd;
    if (cmd in stateMap) {
      btn.classList.toggle('vx-rt-active', !!stateMap[cmd]);
    }
  });
}

function dismissEditingBar() {
  const bar = document.getElementById('vx-richtext-toolbar');
  if (bar) bar.classList.remove('vx-rt-visible');
}

// Keep backward compat alias  
function dismissRichTextToolbar() { dismissEditingBar(); }

function promptForLink() {
  // Don't dismiss the editing bar — we want it to stay visible
  // (the modal z-index 200000 is well above the toolbar's 100000)
  
  const existingHref = lastLink ? lastLink.href : '';
  const existingTarget = lastLink ? lastLink.target : '';
  const existingClass = lastLink ? (lastLink.className || '') : '';

  // Build class options from discovered page classes
  const hasClasses = lastLinkClasses.length > 0 || !!existingClass;
  let classOptionsHtml = `<option value=""${!existingClass ? ' selected' : ''}>No class</option>`;
  if (lastLinkClasses.length > 0) {
    const classInList = lastLinkClasses.includes(existingClass);
    classOptionsHtml += lastLinkClasses.map(cls =>
      `<option value="${escapeAttr(cls)}"${existingClass === cls ? ' selected' : ''}>${escapeHtml(cls)}</option>`
    ).join('');
    // If existing class isn't in the discovered list, show it as custom
    if (existingClass && !classInList) {
      classOptionsHtml += `<option value="${escapeAttr(existingClass)}" selected>${escapeHtml(existingClass)}</option>`;
    }
  } else if (existingClass) {
    // No discovered classes but element has one — show it
    classOptionsHtml += `<option value="${escapeAttr(existingClass)}" selected>${escapeHtml(existingClass)}</option>`;
  }

  const modal = document.createElement('div');
  modal.className = 'vx-modal-overlay';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  
  modal.innerHTML = `
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>${existingHref ? 'Edit' : 'Insert'} Link</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <div class="vx-form-group"><label class="vx-form-label">URL</label>
          <input type="url" id="vx-link-url" class="vx-form-input" value="${escapeAttr(existingHref)}" placeholder="https://" autocomplete="off" spellcheck="false">
        </div>
        ${hasClasses ? `<div class="vx-form-group"><label class="vx-form-label">Link Style</label>
          <select class="vx-form-input" id="vx-link-class">${classOptionsHtml}</select>
        </div>` : ''}
        <div class="vx-form-group" style="margin-bottom:0;">
          <label class="vs-checkbox-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; position: relative;">
            <input type="checkbox" id="vx-link-blank" class="vs-checkbox" ${existingTarget === '_blank' ? 'checked' : ''}>
            <span class="vs-checkbox-box"></span>
            <span style="font: 400 13px/1.4 var(--font-sans); color: var(--vs-text-primary);">Open in new window</span>
          </label>
        </div>
      </div>
      <div class="vx-modal-footer">
        ${existingHref ? `<button class="vx-btn-danger" data-remove style="margin-right: auto;">Remove</button>` : ''}
        <button class="vx-btn-secondary" data-close>Cancel</button>
        <button class="vx-btn-primary" data-confirm>Apply</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.offsetHeight; // trigger reflow for animation
  modal.classList.add('vx-modal-visible');

  // Make draggable by header — same behavior as the class/style panel
  makeModalDraggable(modal);

  const urlInput = modal.querySelector('#vx-link-url');
  setTimeout(() => { urlInput.focus(); urlInput.select(); }, 50);

  const close = () => {
    modal.classList.remove('vx-modal-visible');
    if (modal.__vxDestroyDrag) modal.__vxDestroyDrag();
    setTimeout(() => modal.remove(), 200);
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  modal.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', close));

  const removeBtn = modal.querySelector('[data-remove]');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      sendToPreview({ type: 'vx-editor:richtext-command', command: 'removeLink' });
      close();
    });
  }

  const applyBtn = modal.querySelector('[data-confirm]');
  const applyLink = () => {
    const url = urlInput.value.trim();
    if (url) {
      const isBlank = modal.querySelector('#vx-link-blank').checked;
      const linkClassEl = modal.querySelector('#vx-link-class');
      const linkClass = linkClassEl ? linkClassEl.value : '';
      sendToPreview({ type: 'vx-editor:richtext-command', command: 'insertLink', value: { url, targetBlank: isBlank, linkClass } });
    } else {
      sendToPreview({ type: 'vx-editor:richtext-command', command: 'removeLink' });
    }
    close();
  };

  applyBtn.addEventListener('click', applyLink);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
    if (e.key === 'Escape') { e.preventDefault(); close(); }
  });
}

// ═══════════════════════════════════════════
//  Context Toolbar
// ═══════════════════════════════════════════

function showContextToolbar(data) {
  let toolbar = document.getElementById('vx-context-toolbar');
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.id = 'vx-context-toolbar';
    toolbar.className = 'vx-context-toolbar';
    document.body.appendChild(toolbar);
  }

  const { tagName, rect, hasText, canInlineEdit, hasImage } = data;
  const iframe = document.getElementById('preview-iframe');
  if (!iframe) return;

  const ir = iframe.getBoundingClientRect();
  const toolbarX = ir.left + rect.left + rect.width / 2;
  const toolbarTopAbove = ir.top + rect.top - 8;
  const toolbarTopBelow = ir.top + rect.top + rect.height + 8;

  toolbar.style.left = `${toolbarX}px`;

  // Flip below if not enough room above (toolbar height ~120px estimate)
  const flipBelow = toolbarTopAbove < 120;
  if (flipBelow) {
    toolbar.style.top = `${toolbarTopBelow}px`;
    toolbar.classList.add('vx-tb-below');
  } else {
    toolbar.style.top = `${toolbarTopAbove}px`;
    toolbar.classList.remove('vx-tb-below');
  }
  toolbar.style.transform = ''; // Let CSS class handle transform

  // ── VE-005: Address-aware toolbar gating ──
  const address = selectedAddress;
  const editable = isEditableAddress(address);
  const isGlobal = isGlobalAddress(address);
  const readOnlyMsg = getReadOnlyMessage(address);

  // If not editable (unsafe/loop), show read-only toolbar
  if (!editable) {
    const sourceFile = address?.sourceFile || '';
    const hasFile = sourceFile.length > 0;
    const kindLabel = address?.sourceKind === 'loop' ? 'Loop' : 'Dynamic PHP';
    const isMac = navigator.platform?.includes('Mac');
    const shortcutKey = isMac ? '⌘E' : 'Ctrl+E';

    // Header: show file badge only when provenance is known
    const fileBadge = hasFile
      ? `<span class="vx-tb-readonly-sep"></span><span class="vx-tb-readonly-file">${escapeHtml(sourceFile)}</span>`
      : '';

    // Actions: show Code Editor button only when we know which file to open
    const actionsHtml = hasFile
      ? `<div class="vx-tb-readonly-actions">
          <button class="vx-tb-btn-primary" data-action="open-code-editor" data-file="${escapeHtml(sourceFile)}" title="Open in Code Editor (${shortcutKey})">
            Open in Code Editor
            <kbd>${shortcutKey}</kbd>
          </button>
        </div>`
      : '';

    toolbar.innerHTML = `
      <div class="vx-tb-readonly">
        <div class="vx-tb-readonly-header">
          <svg class="vx-tb-readonly-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span class="vx-tb-readonly-kind">${escapeHtml(kindLabel)}</span>
          ${fileBadge}
        </div>
        <p class="vx-tb-readonly-msg">${escapeHtml(readOnlyMsg)}</p>
        ${actionsHtml}
      </div>`;
    toolbar.classList.add('vx-tb-visible');
    if (hasFile) {
      toolbar.querySelector('[data-action="open-code-editor"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const fileToOpen = e.currentTarget.dataset.file;
        openCodeEditorModal(fileToOpen);
        dismissToolbar();
      });
    }
    return;
  }

  let buttons = '';

  // VE-005: Global-impact cue for partial/component elements
  if (isGlobal && address?.sourceFile) {
    buttons += `<div class="vx-tb-global-cue" title="Changes affect all pages that include this file">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      <span>Global — ${escapeHtml(address.sourceFile)}</span>
    </div>`;
  }

  if (canInlineEdit && tagName !== 'IMG') {
    // I-beam (text cursor) icon — "enter text editing mode"
    // Safe for elements containing only inline children (a, em, strong, span, br, etc.).
    // Elements with block-level children (div, ul, section) must use Source editing.
    buttons += `<button class="vx-tb-btn" data-action="edit-text" title="Edit text">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1"/><path d="M7 22h1a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4H7"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
      <span>Edit</span></button>`;
  }

  if (hasImage) {
    buttons += `<button class="vx-tb-btn" data-action="swap-image" title="Change image">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      <span>Image</span></button>`;
  }

  buttons += `<button class="vx-tb-btn" data-action="edit-style" title="Edit styles">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>
    <span>Style</span></button>`;

  if (tagName === 'A') {
    buttons += `<button class="vx-tb-btn" data-action="edit-link" title="Edit link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span>Link</span></button>`;
  }

  // Source button — open the element's PHP source in the Code Editor.
  // Only shown when we have an honest source file (not in fail-safe mode).
  if (address?.sourceFile) {
    buttons += `<button class="vx-tb-btn" data-action="open-source" title="Edit source code" data-file="${escapeHtml(address.sourceFile)}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      <span>Source</span></button>`;
  }

  // Delete button — always last, visually separated
  buttons += `<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-danger" data-action="delete" title="Delete element">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>`;

  // AI button — always present, placed after divider with its own accent
  buttons += `<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-ai" data-action="ask-ai" title="Edit with AI">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>AI</span></button>`;

  const label = getElementLabel(tagName, data.classList);
  toolbar.innerHTML = `<div class="vx-tb-label">${label}</div><div class="vx-tb-actions">${buttons}</div>`;
  toolbar.classList.add('vx-tb-visible');

  toolbar.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleToolbarAction(btn.dataset.action, data);
    });
  });
}

function dismissToolbar() {
  const toolbar = document.getElementById('vx-context-toolbar');
  if (toolbar) {
    toolbar.classList.remove('vx-tb-visible');
    toolbar.classList.remove('vx-tb-below');
  }
}

function getElementLabel(tagName, classList) {
  const labels = {
    'H1':'Heading 1','H2':'Heading 2','H3':'Heading 3','H4':'Heading 4','H5':'Heading 5','H6':'Heading 6',
    'P':'Text','SPAN':'Text','A':'Link','IMG':'Image','VIDEO':'Video','BUTTON':'Button','INPUT':'Input',
    'UL':'List','OL':'Numbered List','LI':'List Item','NAV':'Navigation','HEADER':'Header','FOOTER':'Footer',
    'SECTION':'Section','DIV':'Block','MAIN':'Main','ARTICLE':'Article','ASIDE':'Sidebar',
    'FORM':'Form','TABLE':'Table','SVG':'Icon','I':'Icon','BLOCKQUOTE':'Quote',
  };
  return labels[tagName] || tagName.toLowerCase();
}

// ═══════════════════════════════════════════
//  Toolbar Actions
// ═══════════════════════════════════════════

function handleToolbarAction(action, elementData) {
  switch (action) {
    case 'edit-text':
      sendToPreview({ type: 'vx-editor:start-edit', mode: 'text' });
      dismissToolbar();
      break;
    case 'swap-image':
      openImagePicker(elementData);
      break;
    case 'edit-style':
      openStyleEditor(elementData);
      break;
    case 'edit-link':
      openLinkEditor(elementData);
      break;
    case 'open-source': {
      // Start inline source editing — bridge will respond with vx-editor:source-edit-ready
      dismissToolbar();
      sendToPreview({ type: 'vx-editor:start-source-edit' });
      break;
    }
    case 'delete':
      confirmDelete(elementData);
      break;
    case 'ask-ai':
      openAIEditPanel(elementData);
      break;
  }
}

// ═══════════════════════════════════════════
//  Inline Source Editor (Monaco projected at element position)
// ═══════════════════════════════════════════

let inlineSourceEditor = null; // { container, monacoInstance, originalHTML }

/**
 * Rough HTML pretty-printer for readability in the inline editor.
 * Only handles simple cases — good enough for outerHTML of a single element.
 */
function prettyFormatHTML(html) {
  // Normalize to single line first
  let result = html.replace(/>\s+</g, '><').trim();
  // Insert newlines after closing tags and after self-closing tags
  result = result.replace(/(<\/[^>]+>)(<)/g, '$1\n$2');
  result = result.replace(/(\/?>)(<[^/])/g, '$1\n$2');

  // Indent
  const lines = result.split('\n');
  let indent = 0;
  const formatted = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Closing tag decreases indent
    if (/^<\//.test(line) && indent > 0) indent--;

    formatted.push('  '.repeat(indent) + line);

    // Opening tag (not self-closing, not closing) increases indent
    if (/^<[^/!][^>]*[^/]>$/.test(line) && !/^<(br|hr|img|input|meta|link)/i.test(line)) {
      indent++;
    }
  }
  return formatted.join('\n');
}

/**
 * Open the inline source editor at the element's position.
 * Called when the bridge responds to `start-source-edit`.
 */

/**
 * Extract an element's raw source text from a file using the nodeKey
 * from the PHP annotation system.
 *
 * The PHP renderer assigns nodeKey = '{file}:{index}' where `index` is
 * the sequential count of annotatable opening tags in the RENDERED output.
 * We mirror that counting logic here to find the Nth element in the SOURCE.
 *
 * IMPORTANT: The PHP counter counts tags in the rendered HTML (after PHP
 * execution), while we're counting in the raw source (before execution).
 * For static HTML elements, these match perfectly. For PHP-generated
 * elements (loops, conditionals), they may not align. In that case we
 * return null and the caller should route to the code editor.
 *
 * @param {string} fileContent - raw source file content
 * @param {string} nodeKey     - e.g. 'partials/hero.php:3'
 * @param {string} tagName     - expected tag name (e.g. 'SECTION')
 * @returns {string|null}      - extracted source text, or null
 */
function extractSourceElementByNodeKey(fileContent, nodeKey, tagName) {
  // Parse the index from nodeKey (format: '{file}:{index}')
  const colonIdx = nodeKey.lastIndexOf(':');
  if (colonIdx === -1) return null;
  const targetIndex = parseInt(nodeKey.substring(colonIdx + 1), 10);
  if (isNaN(targetIndex) || targetIndex < 0) return null;

  // Tags the PHP annotator skips (must match preview.php skipTags exactly)
  const SKIP_TAGS = new Set([
    'html','head','body','script','style','link','meta','noscript',
    'br','hr','wbr','col','colgroup','iframe','template',
    'svg','path','circle','line','polyline','rect','ellipse',
    'polygon','g','defs','use','symbol','clippath','mask',
  ]);

  // Count annotatable opening tags in the source, matching how PHP does it
  const tagPattern = /<([a-z][a-z0-9]*)[\s>]/gi;
  let match;
  let counter = 0;

  while ((match = tagPattern.exec(fileContent)) !== null) {
    const foundTag = match[1].toLowerCase();
    if (SKIP_TAGS.has(foundTag)) continue;
    // Skip tags that already have data-vx-source (already annotated by include)
    // In source files, this shouldn't happen, but guard against it
    const nearbyChars = fileContent.substring(match.index, match.index + 500);
    if (nearbyChars.includes('data-vx-source')) continue;

    if (counter === targetIndex) {
      // This is our element — extract the full tag
      const extracted = extractFullElement(fileContent, match.index, foundTag);
      // Verify the tag name matches (sanity check)
      if (extracted && foundTag === tagName.toLowerCase()) {
        return extracted;
      }
      // Tag doesn't match — the PHP counter and source counter diverged
      // (likely due to PHP-generated content). Return null to signal
      // that we can't deterministically locate this element.
      return null;
    }
    counter++;
  }

  return null; // index out of range
}

/**
 * Like extractSourceElementByNodeKey but takes a raw integer index
 * and does NOT verify the tag name. Used by the save pipeline's
 * nodeKey fallback when we don't know the expected tag.
 */
function extractSourceElementByIndex(fileContent, targetIndex) {
  if (targetIndex < 0) return null;

  const SKIP_TAGS = new Set([
    'html','head','body','script','style','link','meta','noscript',
    'br','hr','wbr','col','colgroup','iframe','template',
    'svg','path','circle','line','polyline','rect','ellipse',
    'polygon','g','defs','use','symbol','clippath','mask',
  ]);

  const tagPattern = /<([a-z][a-z0-9]*)[\s>]/gi;
  let match;
  let counter = 0;

  while ((match = tagPattern.exec(fileContent)) !== null) {
    const foundTag = match[1].toLowerCase();
    if (SKIP_TAGS.has(foundTag)) continue;
    const nearbyChars = fileContent.substring(match.index, match.index + 500);
    if (nearbyChars.includes('data-vx-source')) continue;

    if (counter === targetIndex) {
      return extractFullElement(fileContent, match.index, foundTag);
    }
    counter++;
  }

  return null;
}

/**
 * Extract the opening tag string starting at `pos` in `content`.
 * Handles quoted attributes (can contain >) and PHP blocks.
 */
function extractOpeningTag(content, pos) {
  let i = pos;
  let inDouble = false;
  let inSingle = false;

  while (i < content.length) {
    const ch = content[i];

    if (ch === '"' && !inSingle) { inDouble = !inDouble; }
    else if (ch === "'" && !inDouble) { inSingle = !inSingle; }
    else if (ch === '>' && !inDouble && !inSingle) {
      return content.substring(pos, i + 1);
    }
    i++;

    // Safety: don't scan more than 2000 chars for an opening tag
    if (i - pos > 2000) return null;
  }
  return null;
}

/**
 * Extract a full element (opening tag through matching closing tag)
 * from `content` starting at `pos` for tag name `tag`.
 * Uses a nesting counter to handle nested same-name elements.
 */
function extractFullElement(content, pos, tag) {
  // First, check if it's a self-closing or void element
  const openTag = extractOpeningTag(content, pos);
  if (!openTag) return null;

  const VOID_TAGS = new Set([
    'area','base','br','col','embed','hr','img','input',
    'link','meta','source','track','wbr',
  ]);

  if (VOID_TAGS.has(tag) || openTag.trimEnd().endsWith('/>')) {
    return openTag;
  }

  // Find the matching closing tag, respecting nesting
  const afterOpen = pos + openTag.length;
  const openRe = new RegExp(`<${tag}[\\s>]`, 'gi');
  const closeRe = new RegExp(`</${tag}\\s*>`, 'gi');

  // Start with depth 1 (we've found the opening tag)
  let depth = 1;
  let searchPos = afterOpen;

  // Safety limit
  const maxLen = Math.min(content.length, pos + 50000);

  while (searchPos < maxLen && depth > 0) {
    // Find the next opening or closing tag for this tag name
    openRe.lastIndex = searchPos;
    closeRe.lastIndex = searchPos;

    const nextOpen = openRe.exec(content);
    const nextClose = closeRe.exec(content);

    if (!nextClose) {
      // No closing tag found — return what we have up to end of file
      return null;
    }

    const openPos = nextOpen ? nextOpen.index : Infinity;
    const closePos = nextClose.index;

    if (openPos < closePos && openPos < maxLen) {
      // Another opening tag before the next closing tag — increase depth
      depth++;
      searchPos = openPos + nextOpen[0].length;
    } else {
      // Closing tag — decrease depth
      depth--;
      searchPos = closePos + nextClose[0].length;
    }
  }

  if (depth !== 0) return null;

  return content.substring(pos, searchPos);
}
async function openInlineSourceEditor(data) {
  // Close any existing inline source editor
  closeInlineSourceEditor(false);

  const { html, tagName, rect, filePath, sourceAddress } = data;
  const iframe = document.getElementById('preview-iframe');
  if (!iframe || !html) return;

  const ir = iframe.getBoundingClientRect();

  // ── Position & size ──
  const minW = 450;
  const minH = 180;
  const maxW = ir.width - 40; // 20px padding on each side
  const editorW = Math.max(minW, Math.min(rect.width + 40, maxW));
  const editorH = Math.max(minH, Math.min(rect.height + 60, 400));
  let editorX = ir.left + rect.left + (rect.width / 2) - (editorW / 2);
  let editorY = ir.top + rect.top;

  // Clamp to iframe bounds
  editorX = Math.max(ir.left + 10, Math.min(editorX, ir.right - editorW - 10));
  editorY = Math.max(ir.top + 10, Math.min(editorY, ir.bottom - editorH - 10));

  // ── Container ──
  const container = document.createElement('div');
  container.className = 'vx-source-editor';
  container.style.left = `${editorX}px`;
  container.style.top = `${editorY}px`;
  container.style.width = `${editorW}px`;
  container.style.height = `${editorH}px`;

  const isMac = navigator.platform?.includes('Mac');
  const saveKey = isMac ? '⌘S' : 'Ctrl+S';

  container.innerHTML = `
    <div class="vx-source-header">
      <div class="vx-source-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        <span>Source</span>
      </div>
      <div class="vx-source-actions">
        <button class="vx-source-btn vx-source-btn-cancel" data-action="cancel">Cancel <kbd>Esc</kbd></button>
        <button class="vx-source-btn vx-source-btn-apply" data-action="apply">Apply <kbd>${saveKey}</kbd></button>
      </div>
    </div>
    <div class="vx-source-warn" hidden></div>
    <div class="vx-source-body"></div>
  `;

  document.body.appendChild(container);

  // Make draggable by header
  const header = container.querySelector('.vx-source-header');
  let dragStart = null;
  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('button')) return;
    dragStart = { x: e.clientX - container.offsetLeft, y: e.clientY - container.offsetTop };
    e.preventDefault();
  });
  const onDragMove = (e) => {
    if (!dragStart) return;
    container.style.left = `${e.clientX - dragStart.x}px`;
    container.style.top = `${e.clientY - dragStart.y}px`;
  };
  const onDragEnd = () => { dragStart = null; };
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);

  // Make resizable
  const body = container.querySelector('.vx-source-body');

  // ── Resolve source text (deterministic when possible) ──
  // Use the sourceAddress.nodeKey to deterministically locate the element
  // in the source file. If extraction fails, fall back to DOM-normalized
  // HTML — the pessimistic save will catch any mismatch gracefully.
  const sourceFile = sourceAddress?.sourceFile || filePath || getCurrentPreviewPath();
  const nodeKey = sourceAddress?.nodeKey || '';
  let sourceText = null; // the raw source text from the file (save needle)

  if (nodeKey) {
    try {
      const readResult = await api.get(`/files/content?path=${encodeURIComponent(sourceFile)}`);
      if (readResult.ok && readResult.data?.content) {
        sourceText = extractSourceElementByNodeKey(readResult.data.content, nodeKey, tagName);
      }
    } catch { /* extraction failed — fall back to DOM HTML */ }
  }

  // Use source text if we found it, otherwise fall back to DOM-normalized HTML.
  // The pessimistic save handles any needle mismatch gracefully.
  const usingFallback = !sourceText;
  const editorContent = sourceText || html;
  const formatted = prettyFormatHTML(editorContent);

  // Preflight state — tracks whether current editor content is valid
  const applyBtn = container.querySelector('[data-action="apply"]');
  const warnBar = container.querySelector('.vx-source-warn');
  let preflightValid = true; // starts valid (content is the original HTML)
  let _monacoRef = null; // set after Monaco loads, used by runPreflight for markers

  // Show a subtle notice when falling back to DOM HTML
  if (usingFallback) {
    warnBar.textContent = 'ℹ Live HTML — save may not work for this element';
    warnBar.hidden = false;
    warnBar.style.color = 'var(--vs-text-ghost)';
    warnBar.style.background = 'transparent';
  }

  /** Run preflight and update UI. Returns true if valid. */
  function runPreflight(editorValue) {
    const result = preflightSourceHTML(editorValue, tagName);
    if (result) {
      // Reset any inline ghost styles from fallback info notice
      warnBar.style.color = '';
      warnBar.style.background = '';
      warnBar.textContent = `⚠ ${result.message}`;
      warnBar.hidden = false;
      applyBtn.disabled = true;
      applyBtn.classList.add('vx-source-btn-disabled');
      preflightValid = false;

      // Place Monaco marker on the problem line
      if (_monacoRef && result.line) {
        try {
          const model = _monacoRef.getModel();
          if (model) {
            const monaco = window.monaco || globalThis.monaco;
            if (monaco?.editor) {
              monaco.editor.setModelMarkers(model, 'preflight', [{
                startLineNumber: result.line,
                startColumn: 1,
                endLineNumber: result.line,
                endColumn: model.getLineMaxColumn(result.line),
                message: result.message,
                severity: monaco.MarkerSeverity.Error,
              }]);
            }
          }
        } catch { /* markers are best-effort */ }
      }
    } else {
      // Valid — restore fallback info notice if applicable, otherwise hide
      if (usingFallback) {
        warnBar.textContent = 'ℹ Live HTML — save may not work for this element';
        warnBar.hidden = false;
        warnBar.style.color = 'var(--vs-text-ghost)';
        warnBar.style.background = 'transparent';
      } else {
        warnBar.hidden = true;
        warnBar.style.color = '';
        warnBar.style.background = '';
      }
      applyBtn.disabled = false;
      applyBtn.classList.remove('vx-source-btn-disabled');
      preflightValid = true;

      // Clear any markers
      if (_monacoRef) {
        try {
          const model = _monacoRef.getModel();
          const monaco = window.monaco || globalThis.monaco;
          if (model && monaco?.editor) {
            monaco.editor.setModelMarkers(model, 'preflight', []);
          }
        } catch {}
      }
    }
    return preflightValid;
  }

  let monacoInstance = null;
  try {
    const monaco = await ensureMonacoReady();
    if (!monaco?.editor) throw new Error('Monaco unavailable');

    const editorTheme = monacoThemeForCurrentUi();
    monaco.editor.setTheme(editorTheme);

    monacoInstance = monaco.editor.create(body, {
      value: formatted,
      language: 'html',
      theme: editorTheme,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 12,
      lineHeight: 18,
      tabSize: 2,
      insertSpaces: true,
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'off',
      glyphMargin: false,
      folding: false,
      renderLineHighlight: 'none',
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: false,
      scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
      padding: { top: 8, bottom: 8 },
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    });

    // Expose to runPreflight for marker support
    _monacoRef = monacoInstance;
    // ⌘S / Ctrl+S to apply — blocked when preflight fails
    monacoInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (preflightValid) applyInlineSourceEdit();
    });

    // Escape to cancel
    monacoInstance.addCommand(monaco.KeyCode.Escape, () => {
      closeInlineSourceEditor(false);
    });

    // Live preflight on content change (debounced 400ms)
    let preflightTimer = null;
    monacoInstance.onDidChangeModelContent(() => {
      clearTimeout(preflightTimer);
      preflightTimer = setTimeout(() => {
        runPreflight(monacoInstance.getValue());
      }, 400);
    });

    // Focus the editor and signal the bridge that loading is complete
    setTimeout(() => { monacoInstance.focus(); sendToPreview({ type: 'vx-editor:source-editor-mounted' }); }, 100);

  } catch {
    // Fallback: textarea
    body.innerHTML = `<textarea class="vx-source-fallback" spellcheck="false">${escapeHtml(formatted)}</textarea>`;
    const ta = body.querySelector('textarea');
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeInlineSourceEditor(false); }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (preflightValid) applyInlineSourceEdit();
      }
    });
    // Live preflight for the textarea fallback
    let taPfTimer = null;
    ta.addEventListener('input', () => {
      clearTimeout(taPfTimer);
      taPfTimer = setTimeout(() => runPreflight(ta.value), 400);
    });
    setTimeout(() => { ta.focus(); sendToPreview({ type: 'vx-editor:source-editor-mounted' }); }, 100);
  }

  // ── Button handlers ──
  applyBtn.addEventListener('click', () => {
    if (preflightValid) applyInlineSourceEdit();
  });
  container.querySelector('[data-action="cancel"]').addEventListener('click', () => closeInlineSourceEditor(false));

  // Store state — include tagName for preflight, sourceFile for save
  inlineSourceEditor = {
    container,
    monacoInstance,
    originalHTML: editorContent,   // raw source text — the save needle
    formattedHTML: formatted,       // what Monaco started with — for has-changed check
    tagName,
    sourceFile,
    cleanupDrag: () => {
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    },
  };

  // Animate in
  requestAnimationFrame(() => container.classList.add('vx-source-visible'));
}

async function applyInlineSourceEdit() {
  if (!inlineSourceEditor) return;
  if (window.demoGuard?.()) return;
  const { monacoInstance, container, tagName, originalHTML, formattedHTML, sourceFile, cleanupDrag } = inlineSourceEditor;
  let newHTML;
  if (monacoInstance) {
    newHTML = monacoInstance.getValue().trim();
  } else {
    const ta = container.querySelector('textarea');
    newHTML = ta?.value?.trim() || '';
  }

  // Final preflight gate — block if invalid
  const result = preflightSourceHTML(newHTML, tagName);
  if (result) {
    const warnBar = container.querySelector('.vx-source-warn');
    if (warnBar) {
      warnBar.textContent = `⚠ ${result.message}`;
      warnBar.hidden = false;
    }
    return; // do NOT close or apply
  }

  // No change? Just close without saving.
  if (newHTML === formattedHTML) {
    closeInlineSourceEditor(false);
    return;
  }

  // ── Close editor UI immediately ──
  // The element's dim/hatch is underneath the editor, invisible to the user.
  // Close the editor first so the saving state is visible.
  if (monacoInstance) { try { monacoInstance.dispose(); } catch {} }
  cleanupDrag();
  container.classList.remove('vx-source-visible');
  setTimeout(() => container.remove(), 200);
  inlineSourceEditor = null;

  // VE-011: Produce a semantic replace_html operation
  const op = opReplaceHtml(selectedAddress, originalHTML, newHTML, sourceFile);
  logOp(op, 'created');

  // ── Transition element to saving state ──
  // Bridge still has the dim/hatch from startSourceEdit().
  // Switch to animated saving state (pulse + stronger hatch).
  sendToPreview({ type: 'vx-editor:source-edit-saving' });

  // ── Pessimistic save ──
  // Enforce a minimum 500ms duration so the animated saving state is
  // actually visible to the user on fast local environments before clearing.
  const [saved] = await Promise.all([
    saveSourceEdit({ filePath: sourceFile, originalHTML, newHTML }),
    new Promise(resolve => setTimeout(resolve, 500))
  ]);

  // VE-014: Log save outcome
  logOp(op, saved ? 'persisted' : 'failed');

  // ── Tell bridge to finalize ──
  if (saved) {
    // Does the new source contain PHP? If so, we can't replace outerHTML
    // client-side — the browser would strip <?php ?> tags. Instead, clear
    // the element's visual state and refresh the preview iframe so the
    // server renders the PHP correctly.
    const containsPhp = /\<\?(?:php\b|=)/.test(newHTML);
    if (containsPhp) {
      sendToPreview({ type: 'vx-editor:end-source-edit', apply: false });
      // History push before refresh (pushOp is done by saveSourceEdit; op
      // log already recorded above). Refresh the preview to render the PHP.
      const iframe = document.getElementById('preview-iframe');
      if (iframe) iframe.contentWindow.location.reload();
    } else {
      // Pure HTML — safe to replace in the live DOM
      sendToPreview({ type: 'vx-editor:end-source-edit', apply: true, html: newHTML });
    }
  } else {
    // Save failed — restore element to original state (cancel)
    sendToPreview({ type: 'vx-editor:end-source-edit', apply: false });
  }
}

/**
 * Preflight check for inline source editor HTML.
 * Returns null if valid, or an object { message, line?, tag? } if invalid.
 *
 * This is a GATE — when it returns a non-null value, Apply is blocked.
 *
 * Checks:
 *  1. Not empty
 *  2. No <script>, <iframe>, or inline on*= handlers
 *  3. Exactly one top-level element (via <template> parse)
 *  4. Root tag must match the original element's tag
 *  5. Tag balance: every opening tag must have a matching close
 *     (excludes HTML void elements: br, img, hr, input, etc.)
 */
function preflightSourceHTML(html, expectedTagName) {
  if (!html || !html.trim()) {
    return { message: 'HTML is empty' };
  }

  const trimmed = html.trim();

  // ── Security ──
  if (/<script\b/i.test(trimmed)) {
    return { message: '<script> elements are not allowed' };
  }
  if (/<iframe\b/i.test(trimmed)) {
    return { message: '<iframe> elements are not allowed' };
  }
  if (/\bon[a-z]+\s*=/i.test(trimmed)) {
    return { message: 'Inline event handlers (on*=) are not allowed' };
  }

  // ── Structure: one root element ──
  const tpl = document.createElement('template');
  tpl.innerHTML = trimmed;
  const fragment = tpl.content;

  const topElements = Array.from(fragment.childNodes).filter(
    n => n.nodeType === Node.ELEMENT_NODE
  );

  if (topElements.length === 0) {
    return { message: 'No HTML element found' };
  }
  if (topElements.length > 1) {
    return { message: `Expected 1 root element, found ${topElements.length}` };
  }

  // Stray text outside root
  for (const node of fragment.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      return { message: 'Text found outside root element — check for broken tags' };
    }
  }

  // ── Root tag unchanged ──
  const rootEl = topElements[0];
  const expectedTag = (expectedTagName || '').toUpperCase();
  if (expectedTag && rootEl.tagName !== expectedTag) {
    return {
      message: `Root changed: <${expectedTag.toLowerCase()}> → <${rootEl.tagName.toLowerCase()}>`,
      line: 1,
    };
  }

  // ── Tag balance ──
  // Skip strict tag-balance checking when the source contains PHP control-flow
  // constructs (foreach, for, while, if). These create tag pairs that appear
  // once in source but are replicated at runtime — the static checker can't
  // reason about their balance. Security and root-element checks still ran.
  const hasPhpControlFlow = /\<\?(?:php\s+)?(?:foreach|for|while|if|else|elseif|switch)\b/.test(trimmed)
    || /\<\?(?:php\s+)?(?:endforeach|endfor|endwhile|endif|endswitch)\b/.test(trimmed);

  if (hasPhpControlFlow) {
    return null; // pass — can't validate balance with PHP control flow
  }

  // Count opening vs closing tags per tag name, tracking line numbers.
  const VOID_TAGS = new Set([
    'area','base','br','col','embed','hr','img','input',
    'link','meta','source','track','wbr',
  ]);

  const lines = trimmed.split('\n');
  // Stack of { tag, line } for each unclosed opening tag
  const stack = [];

  for (let i = 0; i < lines.length; i++) {
    const lineContent = lines[i];

    // Find all opening tags (excluding self-closing />)
    // The regex properly handles quoted attribute values (which can contain < and >)
    // but does NOT allow bare < in the attribute area — this catches missing > errors.
    const openRe = /<([a-z][a-z0-9]*)\b(?:[^<>"']|"[^"]*"|'[^']*')*(\/?)\s*>/gi;
    let m;
    while ((m = openRe.exec(lineContent)) !== null) {
      const tag = m[1].toLowerCase();
      const selfClosing = m[2] === '/';
      if (VOID_TAGS.has(tag) || selfClosing) continue;
      stack.push({ tag, line: i + 1 }); // 1-indexed
    }

    // Find all closing tags
    const closeRe = /<\/([a-z][a-z0-9]*)\s*>/gi;
    while ((m = closeRe.exec(lineContent)) !== null) {
      const tag = m[1].toLowerCase();
      if (VOID_TAGS.has(tag)) continue;

      // Strict nesting: closing tag MUST match the top of the stack.
      // If it doesn't, the HTML is misnested (crossed tags).
      if (stack.length === 0) {
        return {
          message: `Extra </${tag}> — no matching opening tag`,
          line: i + 1,
          tag,
        };
      }

      const top = stack[stack.length - 1];
      if (top.tag !== tag) {
        return {
          message: `Misnested: </${tag}> but <${top.tag}> is still open (line ${top.line})`,
          line: i + 1,
          tag,
        };
      }

      stack.pop(); // correct match — pop the top
    }
  }

  // Anything left on the stack is unclosed
  if (stack.length > 0) {
    const first = stack[stack.length - 1]; // deepest unclosed
    return {
      message: `Unclosed <${first.tag}> (line ${first.line})`,
      line: first.line,
      tag: first.tag,
    };
  }

  return null; // all checks passed
}

function closeInlineSourceEditor(apply, newHTML) {
  if (!inlineSourceEditor) return;
  const { container, monacoInstance, cleanupDrag } = inlineSourceEditor;

  // Tell the bridge: apply = true means "replace live DOM + restore styles",
  // apply = false means "restore styles only (cancel)".
  // At this point, the file has ALREADY been saved (if apply is true).
  sendToPreview({
    type: 'vx-editor:end-source-edit',
    apply: !!apply,
    html: apply ? newHTML : undefined,
  });

  // Clean up Monaco
  if (monacoInstance) {
    try { monacoInstance.dispose(); } catch {}
  }
  cleanupDrag();

  // Animate out
  container.classList.remove('vx-source-visible');
  setTimeout(() => container.remove(), 200);

  inlineSourceEditor = null;
}

// ═══════════════════════════════════════════
//  Delete Element
// ═══════════════════════════════════════════

function confirmDelete(elementData) {
  dismissToolbar();
  const label = getElementLabel(elementData.tagName, elementData.classList);
  const preview = (elementData.text || '').substring(0, 60);

  const modal = document.createElement('div');
  modal.className = 'vx-modal-overlay';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>Delete ${label}?</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <p style="margin:0;font-size:13px;color:var(--vs-text-secondary);line-height:1.5">
          This will remove the element${preview ? ` <strong>"${escapeHtml(preview)}…"</strong>` : ''} from the page source.
        </p>
      </div>
      <div class="vx-modal-footer">
        <button class="vx-btn-secondary" data-close>Cancel</button>
        <button class="vx-btn-danger" id="vx-delete-confirm">Delete</button>
      </div>
    </div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('vx-modal-visible'));

  const close = () => {
    modal.classList.remove('vx-modal-visible');
    modal.removeEventListener('keydown', onKeydown);
    setTimeout(() => modal.remove(), 200);
  };
  const onKeydown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };
  modal.addEventListener('keydown', onKeydown);
  modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  onBackdropClick(modal, close);
  modal.tabIndex = -1;
  modal.focus();

  document.getElementById('vx-delete-confirm').addEventListener('click', () => {
    if (window.demoGuard?.()) return;
    sendToPreview({ type: 'vx-editor:delete-element' });
    close();
  });
}

// ═══════════════════════════════════════════
//  Style Editor Panel — Redesigned
// ═══════════════════════════════════════════

let currentClasses = new Set();
let originalClassString = '';
let activeColorFamily = null;
let activeColorProp = 'text';
let activeSpaceMode = 'padding';
let activeSpaceSide = 'all';
let activeRadiusMode = 'all';
let activeRadiusCorner = 'tl';
let activeBreakpoint = '';
let stylePanelDirty = false;

function closeStylePanel({ revertUnsaved = true } = {}) {
  if (revertUnsaved && stylePanelDirty && originalClassString) {
    sendToPreview({
      type: 'vx-editor:update-classes',
      classes: originalClassString.split(' ').filter(Boolean),
      silent: true,
    });
    currentClasses = new Set(originalClassString.split(' ').filter(Boolean));
  }

  const p = document.getElementById('vx-style-panel');
  if (p) {
    if (typeof p.__vxOnResize === 'function') {
      window.removeEventListener('resize', p.__vxOnResize);
    }
    if (typeof p.__vxDestroyDrag === 'function') {
      p.__vxDestroyDrag();
    }
    p.classList.remove('vx-sp-visible');
    setTimeout(() => p.remove(), 200);
  }

  stylePanelDirty = false;
  activeColorFamily = null;
  activeColorProp = 'text';
  activeSpaceMode = 'padding';
  activeSpaceSide = 'all';
  activeRadiusMode = 'all';
  activeRadiusCorner = 'tl';
  activeBreakpoint = '';
}

function openStyleEditor(elementData) {
  dismissToolbar();
  closeStylePanel();

  const classes = (elementData.classList || []).filter(c => c.trim());
  currentClasses = new Set(classes);
  originalClassString = classes.join(' ');
  stylePanelDirty = false;
  activeColorFamily = null;
  activeColorProp = detectActiveColorProp(classes);
  activeSpaceMode = 'padding';
  activeSpaceSide = 'all';
  activeRadiusMode = 'all';
  activeRadiusCorner = 'tl';
  activeBreakpoint = '';

  const panel = document.createElement('div');
  panel.id = 'vx-style-panel';
  panel.className = 'vx-style-panel';
  panel.tabIndex = -1;

  // Icon-based segmented navigation — Jony Ive: reduce, clarify
  const tabs = [
    { id: 'typography', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>', tip: 'Typography' },
    { id: 'spacing', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M19 3v18"/><path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/></svg>', tip: 'Spacing' },
    { id: 'colors', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>', tip: 'Colors' },
    { id: 'layout', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>', tip: 'Layout' },
    { id: 'borders', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>', tip: 'Borders' },
    { id: 'effects', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m13.9 0-1.41 1.41M6.46 17.54l-1.41 1.41"/></svg>', tip: 'Effects' },
    { id: 'classes', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>', tip: 'All Classes' },
  ];

  panel.innerHTML = `
    <div class="vx-sp-header" id="vx-sp-drag-handle">
      <span class="vx-sp-title">${getElementLabel(elementData.tagName, classes)}</span>
      <div class="vx-sp-header-actions">
        <span class="vx-sp-drag-hint">⋮⋮</span>
        <button class="vx-sp-close" id="vx-style-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="vx-sp-nav" id="vx-sp-nav">
      ${tabs.map((t, i) => `<button class="vx-sp-seg${i===0?' vx-sp-seg-active':''}" data-tab="${t.id}" title="${t.tip}" aria-label="${t.tip}">${t.icon}</button>`).join('')}
    </div>
    <div class="vx-sp-breakpoints" id="vx-sp-breakpoints">
      ${renderBreakpointBar()}
    </div>
    <div class="vx-sp-body" id="vx-sp-body"></div>
    <div class="vx-sp-footer">
      <button class="vx-sp-reset vx-sp-footer-btn" id="vx-style-reset">Reset</button>
      <button class="vx-sp-apply vx-sp-footer-btn" id="vx-style-apply"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Apply & Compile</button>
    </div>`;

  document.body.appendChild(panel);

  positionStylePanel(panel);
  panel.__vxOnResize = () => positionStylePanel(panel);
  window.addEventListener('resize', panel.__vxOnResize);

  requestAnimationFrame(() => panel.classList.add('vx-sp-visible'));
  panel.__vxDestroyDrag = makeDraggable(panel, panel.querySelector('#vx-sp-drag-handle'));
  panel.focus();

  // Segmented nav
  panel.querySelector('#vx-sp-nav').addEventListener('click', (e) => {
    const seg = e.target.closest('[data-tab]');
    if (!seg) return;
    panel.querySelectorAll('.vx-sp-seg').forEach(s => s.classList.remove('vx-sp-seg-active'));
    seg.classList.add('vx-sp-seg-active');
    activeColorFamily = null;
    renderTabContent(seg.dataset.tab);
  });

  panel.querySelector('#vx-style-close').addEventListener('click', () => closeStylePanel());
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeStylePanel();
    }
  });
  panel.querySelector('#vx-style-reset').addEventListener('click', () => {
    currentClasses = new Set(originalClassString.split(' ').filter(Boolean));
    stylePanelDirty = false;
    sendToPreview({ type: 'vx-editor:update-classes', classes: [...currentClasses], silent: true });
    renderTabContent(getActiveTab());
  });
  panel.querySelector('#vx-style-apply').addEventListener('click', () => applyAndCompile(elementData));

  // Breakpoint bar
  panel.querySelector('#vx-sp-breakpoints').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-bp]');
    if (!btn) return;
    activeBreakpoint = btn.dataset.bp || '';
    panel.querySelector('#vx-sp-breakpoints').innerHTML = renderBreakpointBar();
    renderTabContent(getActiveTab());
  });

  renderTabContent('typography');
}

function renderBreakpointBar() {
  const breakpoints = [
    { id: '', label: 'Base', tip: 'No breakpoint' },
    { id: 'sm', label: 'sm', tip: '≥640px' },
    { id: 'md', label: 'md', tip: '≥768px' },
    { id: 'lg', label: 'lg', tip: '≥1024px' },
    { id: 'xl', label: 'xl', tip: '≥1280px' },
    { id: '2xl', label: '2xl', tip: '≥1536px' },
  ];
  return breakpoints.map(bp => {
    const isActive = activeBreakpoint === bp.id;
    const hasClasses = bp.id
      ? [...currentClasses].some(c => c.startsWith(bp.id + ':'))
      : true; // base always has classes
    return `<button class="vx-sp-bp${isActive ? ' vx-sp-bp-active' : ''}" data-bp="${bp.id}" title="${bp.tip}">
      ${bp.label}${hasClasses && bp.id ? '<span class="vx-sp-bp-dot"></span>' : ''}
    </button>`;
  }).join('');
}

function getActiveTab() {
  return document.querySelector('.vx-sp-seg-active')?.dataset.tab || 'typography';
}

function renderTabContent(tab) {
  const body = document.getElementById('vx-sp-body');
  if (!body) return;

  const renderers = {
    typography: renderTypographyTab,
    spacing: renderSpacingTab,
    colors: renderColorsTab,
    layout: renderLayoutTab,
    borders: renderBordersTab,
    effects: renderEffectsTab,
    classes: renderClassesTab,
  };
  body.innerHTML = (renderers[tab] || renderers.classes)();
  bindTabControls(body);

  // Scroll active color into view inside the compact matrix
  const activeCell = body.querySelector('.vx-cm-active');
  if (activeCell) activeCell.scrollIntoView({ block: 'nearest' });
}

// ── Tab renderers ──

function renderTypographyTab() {
  const family = findCurrent(/^font-(sans|serif|mono)$/) || '';
  const size = findCurrent(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/) || 'text-base';
  const weight = findCurrent(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/) || 'font-normal';
  const align = findCurrent(/^text-(left|center|right|justify)$/) || 'text-left';
  const leading = findCurrent(/^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/) || 'leading-normal';
  const tracking = findCurrent(/^tracking-(tighter|tight|normal|wide|wider|widest)$/) || 'tracking-normal';
  const transform = findCurrent(/^(normal-case|uppercase|lowercase|capitalize)$/) || 'normal-case';
  const decoration = findCurrent(/^(no-underline|underline|line-through)$/) || 'no-underline';

  return `
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${renderSelectField('Font', '^font-(sans|serif|mono)$', family, [
          { label: 'Default', value: '' },
          { label: 'Sans', value: 'font-sans' },
          { label: 'Serif', value: 'font-serif' },
          { label: 'Mono', value: 'font-mono' },
        ])}
        ${renderSelectField('Size', '^text-(xs|sm|base|lg|xl|[2-9]xl)$', size, TW.sizes.map(v => ({ label: v, value: `text-${v}` })))}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${renderSelectField('Weight', '^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$', weight, TW.weights.map(v => ({ label: v, value: `font-${v}` })))}
        <div class="vx-sp-control">
          <label class="vx-sp-field-label">Align</label>
          ${renderIconSegment(TW.aligns.map(v => ({ value: `text-${v}`, label: v, icon: alignIcon(v) })), align, '^text-(left|center|right|justify)$')}
        </div>
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2 vx-sp-grid-compact">
        ${renderSelectField('Leading', '^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$', leading, TW.leadings.map(v => ({ label: v, value: `leading-${v}` })))}
        ${renderSelectField('Tracking', '^tracking-(tighter|tight|normal|wide|wider|widest)$', tracking, TW.trackings.map(v => ({ label: v, value: `tracking-${v}` })))}
        ${renderSelectField('Case', '^(normal-case|uppercase|lowercase|capitalize)$', transform, TW.transforms.map(v => ({ label: v, value: v })))}
        ${renderSelectField('Decoration', '^(no-underline|underline|line-through)$', decoration, TW.decorations.map(v => ({ label: v, value: v })))}
      </div>
    </div>
  `;
}

function renderSpacingTab() {
  const modes = {
    padding: { label: 'Padding', sides: ['all','x','y','t','r','b','l'], prefixes: { all: 'p', x: 'px', y: 'py', t: 'pt', r: 'pr', b: 'pb', l: 'pl' } },
    margin: { label: 'Margin', sides: ['all','x','y','t','r','b','l'], prefixes: { all: 'm', x: 'mx', y: 'my', t: 'mt', r: 'mr', b: 'mb', l: 'ml' } },
    gap: { label: 'Gap', sides: ['all','x','y'], prefixes: { all: 'gap', x: 'gap-x', y: 'gap-y' } },
  };

  if (!modes[activeSpaceMode]) activeSpaceMode = 'padding';
  if (!modes[activeSpaceMode].prefixes[activeSpaceSide]) activeSpaceSide = 'all';

  const mode = modes[activeSpaceMode];
  const prefix = mode.prefixes[activeSpaceSide];
  const pattern = spacingPatternForPrefix(prefix);
  const currentValue = findSpacingToken(prefix) || '';
  const showAuto = activeSpaceMode === 'margin';

  return `
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Property</label>
      ${renderSegment(
        Object.keys(modes).map(id => ({ value: id, label: modes[id].label })),
        activeSpaceMode,
        'data-space-mode',
        3
      )}
    </div>
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Target Side</label>
      <div class="vx-side-picker">
        ${mode.sides.map(side => `
          <button class="vx-side-btn${activeSpaceSide === side ? ' vx-side-btn-active' : ''}" data-space-side="${side}" title="${sideLabel(side)}">
            ${sideIcon(side)}
          </button>
        `).join('')}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-value-header">
        <span class="vx-sp-field-label">Value</span>
        <span class="vx-sp-value-readout">${mode.label} ${sideLabel(activeSpaceSide)}: ${currentValue || 'none'}</span>
      </div>
      <div class="vx-value-strip">
        ${TW.compactSpacings.map(v => {
          const cls = `${prefix}-${v}`;
          const active = hasCurrentClass(cls);
          return `<button class="vx-sp-pill vx-sp-pill-compact${active ? ' vx-sp-pill-active' : ''}" data-set="${cls}" data-pattern="${pattern}" data-toggle="false">${v}</button>`;
        }).join('')}
        ${showAuto ? `<button class="vx-sp-pill vx-sp-pill-compact${hasCurrentClass(`${prefix}-auto`) ? ' vx-sp-pill-active' : ''}" data-set="${prefix}-auto" data-pattern="${pattern}" data-toggle="false">auto</button>` : ''}
      </div>
    </div>
  `;
}

function renderColorsTab() {
  const colorProps = [
    { id: 'text', label: 'Text' },
    { id: 'bg', label: 'Bg' },
    { id: 'border', label: 'Border' },
  ];

  const activeProp = activeColorProp || 'text';
  const prefix = activeProp;
  const colorPattern = colorClassPattern(prefix);
  let html = `<div class="vx-sp-section">
    <div class="vx-sp-color-props">${colorProps.map(p =>
      `<button class="vx-sp-cprop${p.id === activeProp ? ' vx-sp-cprop-active' : ''}" data-cprop="${p.id}">${p.label}</button>`
    ).join('')}</div>
  </div>`;

  html += `<div class="vx-sp-section">
    <div class="vx-sp-section-title">Special</div>
    <div class="vx-sp-color-specials">${TW.specialColors.map(sc => {
      const cls = `${prefix}-${sc.name}`;
      const bgStyle = sc.hex === 'transparent'
        ? 'background:repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 50%/8px 8px'
        : `background:${sc.hex}`;
      const border = sc.name === 'white' ? ';border:1px solid #e5e7eb' : '';
      return `<button class="vx-sp-color-dot${hasCurrentClass(cls) ? ' vx-sp-dot-active' : ''}" data-set="${cls}" data-pattern="${colorPattern}" style="${bgStyle}${border}" title="${sc.name}"></button>`;
    }).join('')}</div>
  </div>`;

  // ── Flat Color Matrix ──
  // Every family × every shade in one compact grid. One tap, no navigation.
  const shadeKeys = ['50','100','200','300','400','500','600','700','800','900','950'];
  html += `<div class="vx-sp-section">
    <div class="vx-sp-section-title">Palette</div>
    <div class="vx-color-matrix">
      ${TW.colors.map(color => `
        <div class="vx-cm-row" title="${color.name}">
          ${shadeKeys.map(shade => {
            const cls = `${prefix}-${color.name}-${shade}`;
            const isActive = hasCurrentClass(cls);
            return `<button class="vx-cm-cell${isActive ? ' vx-cm-active' : ''}" data-set="${cls}" data-pattern="${colorPattern}" data-toggle="false" style="background:${color.shades[shade]}" title="${color.name}-${shade}"></button>`;
          }).join('')}
        </div>
      `).join('')}
    </div>
  </div>`;

  return html;
}


function renderLayoutTab() {
  const display = detectDisplayMode();
  const position = findCurrent(/^(static|relative|absolute|fixed|sticky)$/) || 'static';
  const isFlex = display === 'flex';
  const isGrid = display === 'grid';
  const showCoords = position === 'absolute' || position === 'fixed';
  const gapClass = findCurrent(/^gap(?:-[xy])?-/) || '';
  const cols = findCurrent(/^grid-cols-\d+$/) || '';
  const rows = findCurrent(/^grid-rows-\d+$/) || '';

  return `
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Display</label>
      ${renderDisplayRow(display)}
    </div>

    ${isFlex ? `
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Flex Layout</div>
        <div class="vx-sp-grid-2">
          ${renderSelectField('Direction', '^flex-(row|col|row-reverse|col-reverse)$', findCurrent(/^flex-(row|col|row-reverse|col-reverse)$/) || 'flex-row', [
            { label: 'Row', value: 'flex-row' },
            { label: 'Column', value: 'flex-col' },
            { label: 'Row Rev', value: 'flex-row-reverse' },
            { label: 'Col Rev', value: 'flex-col-reverse' },
          ])}
          ${renderSelectField('Justify', '^justify-(start|center|end|between|around|evenly)$', findCurrent(/^justify-(start|center|end|between|around|evenly)$/) || 'justify-start', [
            { label: 'Start', value: 'justify-start' },
            { label: 'Center', value: 'justify-center' },
            { label: 'End', value: 'justify-end' },
            { label: 'Between', value: 'justify-between' },
            { label: 'Around', value: 'justify-around' },
            { label: 'Evenly', value: 'justify-evenly' },
          ])}
          ${renderSelectField('Align', '^items-(start|center|end|stretch|baseline)$', findCurrent(/^items-(start|center|end|stretch|baseline)$/) || 'items-stretch', [
            { label: 'Start', value: 'items-start' },
            { label: 'Center', value: 'items-center' },
            { label: 'End', value: 'items-end' },
            { label: 'Stretch', value: 'items-stretch' },
            { label: 'Baseline', value: 'items-baseline' },
          ])}
          ${renderSelectField('Gap', '^gap(?:-[xy])?-[\\d.]+$', gapClass, [
            { label: 'None', value: '' },
            ...TW.gaps.map(v => ({ label: v, value: `gap-${v}` })),
          ])}
        </div>
      </div>
    ` : ''}

    ${isGrid ? `
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Grid Layout</div>
        <div class="vx-sp-grid-3">
          ${renderSelectField('Cols', '^grid-cols-\\d+$', cols, [{ label: 'Auto', value: '' }, ...TW.gridCols.map(v => ({ label: v, value: `grid-cols-${v}` }))])}
          ${renderSelectField('Rows', '^grid-rows-\\d+$', rows, [{ label: 'Auto', value: '' }, ...TW.gridRows.map(v => ({ label: v, value: `grid-rows-${v}` }))])}
          ${renderSelectField('Gap', '^gap(?:-[xy])?-[\\d.]+$', gapClass, [{ label: '0', value: 'gap-0' }, ...TW.gaps.slice(1).map(v => ({ label: v, value: `gap-${v}` }))])}
        </div>
      </div>
    ` : ''}

    <div class="vx-sp-section">
      ${renderSelectField('Position', '^(static|relative|absolute|fixed|sticky)$', position, TW.positions.map(v => ({ label: v, value: v })))}
    </div>

    ${showCoords ? `
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Offset</div>
        <div class="vx-sp-grid-2">
          ${renderSelectField('Top', '^top-', findCurrent(/^top-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/) || '', TW.coordinates.map(v => ({ label: v, value: `top-${v}` })))}
          ${renderSelectField('Right', '^right-', findCurrent(/^right-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/) || '', TW.coordinates.map(v => ({ label: v, value: `right-${v}` })))}
          ${renderSelectField('Bottom', '^bottom-', findCurrent(/^bottom-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/) || '', TW.coordinates.map(v => ({ label: v, value: `bottom-${v}` })))}
          ${renderSelectField('Left', '^left-', findCurrent(/^left-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/) || '', TW.coordinates.map(v => ({ label: v, value: `left-${v}` })))}
        </div>
      </div>
    ` : ''}
  `;
}

function renderBordersTab() {
  const radiusLabels = { none: '0', sm: 'sm', '': 'base', md: 'md', lg: 'lg', xl: 'xl', '2xl': '2xl', '3xl': '3xl', full: 'full' };
  const radiusTarget = activeRadiusMode === 'all' ? 'all' : activeRadiusCorner;

  return `
    <div class="vx-sp-section vx-sp-grid-2">
      <div>
        <label class="vx-sp-field-label">Width</label>
        <div class="vx-sp-pills">${TW.borderWidths.map(v => {
          const cls = v === '' ? 'border' : `border-${v}`;
          const active = hasCurrentClass(cls);
          const label = v === '' ? '1' : v;
          return `<button class="vx-sp-pill vx-sp-pill-compact${active ? ' vx-sp-pill-active' : ''}" data-set="${cls}" data-pattern="^border(?:-(0|2|4|8))?$" data-toggle="false">${label}</button>`;
        }).join('')}</div>
      </div>
      <div>
        ${renderSelectField('Style', '^border-(solid|dashed|dotted|double|none)$', findCurrent(/^border-(solid|dashed|dotted|double|none)$/) || '', [
          { label: 'Default', value: '' },
          ...TW.borderStyles.map(v => ({ label: v, value: `border-${v}` })),
        ])}
      </div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-section-title">Radius</div>
      ${renderSegment([
        { value: 'all', label: 'All corners' },
        { value: 'corners', label: 'Individual' },
      ], activeRadiusMode === 'all' ? 'all' : 'corners', 'data-radius-mode')}
      <div class="vx-radius-widget">
        <div class="vx-radius-card">
          <button class="vx-radius-corner${activeRadiusCorner === 'tl' ? ' vx-radius-corner-active' : ''}" data-radius-corner="tl">TL</button>
          <button class="vx-radius-corner${activeRadiusCorner === 'tr' ? ' vx-radius-corner-active' : ''}" data-radius-corner="tr">TR</button>
          <button class="vx-radius-corner${activeRadiusCorner === 'bl' ? ' vx-radius-corner-active' : ''}" data-radius-corner="bl">BL</button>
          <button class="vx-radius-corner${activeRadiusCorner === 'br' ? ' vx-radius-corner-active' : ''}" data-radius-corner="br">BR</button>
          <div class="vx-radius-center">${activeRadiusMode === 'all' ? 'ALL' : activeRadiusCorner.toUpperCase()}</div>
        </div>
      </div>
      <div class="vx-value-strip">
        ${TW.radii.map(v => {
          const cls = radiusClassFor(radiusTarget, v);
          const active = hasCurrentClass(cls);
          return `<button class="vx-sp-pill vx-sp-pill-compact${active ? ' vx-sp-pill-active' : ''}" data-set="${cls}" data-pattern="${radiusPatternFor(radiusTarget)}" data-toggle="false">${radiusLabels[v]}</button>`;
        }).join('')}
      </div>
    </div>
  `;
}

function renderEffectsTab() {
  const opacity = parseOpacity();
  const shadows = [
    { label: 'Flat', value: 'shadow-none', style: 'box-shadow:none' },
    { label: 'Soft', value: 'shadow-sm', style: 'box-shadow:0 1px 2px rgba(0,0,0,.08)' },
    { label: 'Base', value: 'shadow', style: 'box-shadow:0 4px 10px rgba(0,0,0,.12)' },
    { label: 'Lift', value: 'shadow-md', style: 'box-shadow:0 10px 20px rgba(0,0,0,.16)' },
    { label: 'High', value: 'shadow-xl', style: 'box-shadow:0 18px 38px rgba(0,0,0,.22)' },
  ];

  return `
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">Shadow</div>
      <div class="vx-shadow-list">${shadows.map(item => {
        const active = hasCurrentClass(item.value);
        return `<button class="vx-shadow-card${active ? ' vx-shadow-card-active' : ''}" data-set="${item.value}" data-pattern="^shadow(?:-(none|sm|md|lg|xl|2xl|inner))?$" data-toggle="false">
          <span class="vx-shadow-preview" style="${item.style}"></span>
          <span class="vx-shadow-label">${item.label}</span>
        </button>`;
      }).join('')}</div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-value-header">
        <span class="vx-sp-field-label">Opacity</span>
        <span class="vx-sp-value-readout"><span id="vx-opacity-val">${opacity}</span>%</span>
      </div>
      <input id="vx-opacity-slider" class="vx-opacity-slider" type="range" min="0" max="100" step="5" value="${opacity}" />
    </div>
  `;
}

function renderClassesTab() {
  return `
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">All Classes</div>
      <div class="vx-sp-class-editor">
        <input type="text" class="vx-sp-class-input" id="vx-add-class" placeholder="Add class…" autocomplete="off" spellcheck="false">
      </div>
      <div class="vx-sp-classes" id="vx-all-classes">
        ${[...currentClasses].map(c => `<span class="vx-sp-class" data-class="${c}">${c} <button class="vx-sp-class-remove">×</button></span>`).join('')}
      </div>
    </div>`;
}

// ── Render helpers ──

function renderSelectField(label, pattern, selected, options) {
  return `<div class="vx-sp-control">
    <label class="vx-sp-field-label">${label}</label>
    <select class="vx-sp-select" data-select-pattern="${pattern}">
      ${options.map(o => `<option value="${escapeAttr(o.value)}"${selected === o.value ? ' selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}
    </select>
  </div>`;
}

function renderSegment(options, active, attrName, cols) {
  const colClass = cols === 3 ? ' vx-sp-segment-3col' : '';
  return `<div class="vx-sp-segment${colClass}">
    ${options.map(opt => `<button class="vx-sp-segment-btn${opt.value === active ? ' vx-sp-segment-btn-active' : ''}" ${attrName}="${opt.value}">${escapeHtml(opt.label)}</button>`).join('')}
  </div>`;
}

function renderIconSegment(options, active, pattern) {
  return `<div class="vx-icon-segment">
    ${options.map(opt => `
      <button class="vx-icon-segment-btn${opt.value === active ? ' vx-icon-segment-btn-active' : ''}" data-set="${opt.value}" data-pattern="${pattern}" data-toggle="false" title="${escapeAttr(opt.label)}">
        ${opt.icon}
      </button>
    `).join('')}
  </div>`;
}

function renderDisplayRow(active) {
  const lucide = (d) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const options = [
    { value: 'block', label: 'Block', icon: lucide('<rect x="3" y="3" width="18" height="18" rx="2"/>') },
    { value: 'flex', label: 'Flex', icon: lucide('<path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/>') },
    { value: 'grid', label: 'Grid', icon: lucide('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>') },
    { value: 'inline', label: 'Inline', icon: lucide('<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>') },
    { value: 'hidden', label: 'Hide', icon: lucide('<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><line x1="2" y1="2" x2="22" y2="22"/>') },
  ];
  return `<div class="vx-display-row">
    ${options.map(o => `
      <button class="vx-display-btn${active === o.value ? ' vx-display-btn-active' : ''}" data-set="${o.value}" data-pattern="^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$" data-toggle="false">
        <span class="vx-display-icon">${o.icon}</span>
        <span class="vx-display-label">${o.label}</span>
      </button>
    `).join('')}
  </div>`;
}

function detectDisplayMode() {
  const displayClass = findCurrent(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/) || 'block';
  if (displayClass === 'inline-flex') return 'flex';
  if (displayClass === 'inline-grid') return 'grid';
  if (displayClass === 'inline-block') return 'block';
  return displayClass;
}

function spacingPatternForPrefix(prefix) {
  if (prefix === 'gap') return '^gap(?:-[xy])?-(?:[\\d.]+)$';
  if (prefix === 'gap-x') return '^gap-x-(?:[\\d.]+)$';
  if (prefix === 'gap-y') return '^gap-y-(?:[\\d.]+)$';
  return `^${prefix}-(?:auto|[\\d.]+)$`;
}

function colorClassPattern(prefix) {
  return `^${prefix}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`;
}

function findSpacingToken(prefix) {
  const cls = findCurrent(new RegExp(`^${prefix}-(auto|[\\d.]+)$`));
  if (!cls) return '';
  return cls.replace(`${prefix}-`, '');
}

function sideLabel(side) {
  return {
    all: 'All',
    x: 'X-Axis',
    y: 'Y-Axis',
    t: 'Top',
    r: 'Right',
    b: 'Bottom',
    l: 'Left',
  }[side] || side;
}

function sideIcon(side) {
  const i = (d) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  return {
    all: i('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/>'),
    x: i('<path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>'),
    y: i('<path d="M12 5v14"/><path d="m8 9 4-4 4 4"/><path d="m8 15 4 4 4-4"/>'),
    t: i('<path d="M12 5v14"/><path d="m18 11-6-6-6 6"/>'),
    r: i('<path d="M5 12h14"/><path d="m13 18 6-6-6-6"/>'),
    b: i('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),
    l: i('<path d="M5 12h14"/><path d="m11 18-6-6 6-6"/>'),
  }[side] || side;
}

function alignIcon(value) {
  const i = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  return {
    left: i('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>'),
    center: i('<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>'),
    right: i('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>'),
    justify: i('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>'),
  }[value] || value;
}

function radiusClassFor(target, radiusToken) {
  const suffix = radiusToken === '' ? '' : `-${radiusToken}`;
  if (target === 'all') return radiusToken === '' ? 'rounded' : `rounded${suffix}`;
  const prefix = { tl: 'rounded-tl', tr: 'rounded-tr', br: 'rounded-br', bl: 'rounded-bl' }[target] || 'rounded-tl';
  return radiusToken === '' ? prefix : `${prefix}${suffix}`;
}

function radiusPatternFor(target) {
  if (target === 'all') return '^rounded';
  const prefix = { tl: 'rounded-tl', tr: 'rounded-tr', br: 'rounded-br', bl: 'rounded-bl' }[target] || 'rounded-tl';
  return `^${prefix}(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$`;
}

function parseOpacity() {
  const cls = findCurrent(/^opacity-(\d+)$/);
  if (!cls) return 100;
  const value = parseInt(cls.replace('opacity-', ''), 10);
  if (Number.isNaN(value)) return 100;
  return Math.min(100, Math.max(0, value));
}

function hasCurrentClass(cls) {
  const bp = activeBreakpoint;
  return currentClasses.has(bp ? bp + ':' + cls : cls);
}

function applyClassMutation(setClass, patternSource, { toggle = true, rerender = true } = {}) {
  const bp = activeBreakpoint;
  const prefix = bp ? bp + ':' : '';
  const pattern = patternSource ? new RegExp(patternSource) : null;
  const prefixedSetClass = setClass ? prefix + setClass : '';
  const wasActive = !!prefixedSetClass && currentClasses.has(prefixedSetClass);

  if (pattern) {
    for (const cls of [...currentClasses]) {
      // Only remove classes matching the current breakpoint scope
      if (bp) {
        if (cls.startsWith(prefix)) {
          const unprefixed = cls.slice(prefix.length);
          if (pattern.test(unprefixed)) currentClasses.delete(cls);
        }
      } else {
        // Base scope: only remove un-prefixed matches
        if (!/^(sm|md|lg|xl|2xl):/.test(cls) && pattern.test(cls)) currentClasses.delete(cls);
      }
    }
  }

  if (prefixedSetClass && (!toggle || !wasActive)) {
    currentClasses.add(prefixedSetClass);
  }

  stylePanelDirty = true;
  sendToPreview({ type: 'vx-editor:update-classes', classes: [...currentClasses], silent: true });
  // Update breakpoint dots
  const bpBar = document.getElementById('vx-sp-breakpoints');
  if (bpBar) bpBar.innerHTML = renderBreakpointBar();
  if (rerender) {
    // Preserve color matrix scroll position across re-render
    const matrix = document.querySelector('.vx-color-matrix');
    const scrollY = matrix ? matrix.scrollTop : 0;
    renderTabContent(getActiveTab());
    if (scrollY) {
      const m2 = document.querySelector('.vx-color-matrix');
      if (m2) m2.scrollTop = scrollY;
    }
  }
}

function findCurrent(pattern) {
  const bp = activeBreakpoint;
  for (const cls of currentClasses) {
    if (bp) {
      // When a breakpoint is active, look for `bp:value`
      if (cls.startsWith(bp + ':')) {
        const unprefixed = cls.slice(bp.length + 1);
        if (pattern.test(unprefixed)) return unprefixed;
      }
    } else {
      // Base: only match classes without any breakpoint prefix
      if (!/^(sm|md|lg|xl|2xl):/.test(cls) && pattern.test(cls)) return cls;
    }
  }
  return null;
}

// ── Tab event binding ──

function bindTabControls(container) {
  // Class set buttons
  container.querySelectorAll('[data-set]').forEach(btn => {
    btn.addEventListener('click', () => {
      const setClass = btn.dataset.set || '';
      const pattern = btn.dataset.pattern || '';
      const toggle = btn.dataset.toggle !== 'false';
      applyClassMutation(setClass, pattern, { toggle, rerender: true });
    });
  });

  // Select inputs (compact controls)
  container.querySelectorAll('[data-select-pattern]').forEach(sel => {
    sel.addEventListener('change', () => {
      const pattern = sel.dataset.selectPattern || '';
      const value = sel.value || '';
      applyClassMutation(value, pattern, { toggle: false, rerender: true });
    });
  });

  // Color family selection
  container.querySelectorAll('[data-family]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeColorFamily = activeColorFamily === btn.dataset.family ? null : btn.dataset.family;
      renderTabContent('colors');
    });
  });
  container.querySelectorAll('[data-family-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeColorFamily = null;
      renderTabContent('colors');
    });
  });

  // Color property tabs
  container.querySelectorAll('[data-cprop]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeColorProp = btn.dataset.cprop || 'text';
      activeColorFamily = null;
      renderTabContent('colors');
    });
  });

  // Spacing mode + side
  container.querySelectorAll('[data-space-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSpaceMode = btn.dataset.spaceMode || 'padding';
      activeSpaceSide = 'all';
      renderTabContent('spacing');
    });
  });
  container.querySelectorAll('[data-space-side]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSpaceSide = btn.dataset.spaceSide || 'all';
      renderTabContent('spacing');
    });
  });

  // Radius mode + corner
  container.querySelectorAll('[data-radius-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeRadiusMode = (btn.dataset.radiusMode === 'corners') ? 'corners' : 'all';
      renderTabContent('borders');
    });
  });
  container.querySelectorAll('[data-radius-corner]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeRadiusCorner = btn.dataset.radiusCorner || 'tl';
      activeRadiusMode = 'corners';
      renderTabContent('borders');
    });
  });

  // Opacity slider
  const opacitySlider = container.querySelector('#vx-opacity-slider');
  if (opacitySlider) {
    const syncOpacityLabel = () => {
      const value = String(opacitySlider.value || '100');
      const label = container.querySelector('#vx-opacity-val');
      if (label) label.textContent = value;
    };
    const applyOpacity = () => {
      const value = String(opacitySlider.value || '100');
      applyClassMutation(`opacity-${value}`, '^opacity-(\\d+)$', { toggle: false, rerender: false });
      syncOpacityLabel();
    };
    opacitySlider.addEventListener('input', applyOpacity);
    opacitySlider.addEventListener('change', () => renderTabContent('effects'));
  }

  // Raw class input
  const input = container.querySelector('#vx-add-class');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        e.preventDefault();
        const newClasses = input.value.trim().split(/\s+/);
        newClasses.forEach(c => {
          currentClasses.add(c);
        });
        stylePanelDirty = true;
        sendToPreview({ type: 'vx-editor:update-classes', classes: [...currentClasses], silent: true });
        input.value = '';
        renderTabContent('classes');
      }
    });
  }

  // Remove class tags
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('vx-sp-class-remove')) {
      const tag = e.target.closest('.vx-sp-class');
      if (tag) {
        const cls = tag.dataset.class;
        currentClasses.delete(cls);
        stylePanelDirty = true;
        sendToPreview({ type: 'vx-editor:update-classes', classes: [...currentClasses], silent: true });
        tag.remove();
      }
    }
  });
}


// ── Apply + Compile + Reload ──

async function applyAndCompile(elementData) {
  const newClassStr = [...currentClasses].join(' ');
  if (newClassStr === originalClassString) {
    closeStylePanel({ revertUnsaved: false });
    return;
  }

  // Compute the diff between the original and new class sets.
  // We store the diff so the save path can apply it to source-level classes
  // even when they differ from the runtime classes (e.g., JS adds 'is-visible').
  const origSet = new Set(originalClassString.split(' ').filter(Boolean));
  const newSet = new Set(newClassStr.split(' ').filter(Boolean));
  const additions = [...newSet].filter(c => !origSet.has(c));
  const removals = [...origSet].filter(c => !newSet.has(c));

  // VE-012: Produce a semantic set_class_list operation
  const address = normalizeSourceAddress(elementData.sourceAddress || selectedAddress);
  const op = opSetClassList(address, originalClassString, newClassStr, additions, removals, elementData.filePath);
  logOp(op, 'created');

  // Queue class change for save
  pendingChanges.push({
    type: 'class-change',
    filePath: elementData.filePath,
    originalHTML: `class="${originalClassString}"`,
    newHTML: `class="${newClassStr}"`,
    additions,
    removals,
    timestamp: Date.now(),
    // VE-012: attach the semantic operation
    _op: op,
  });

  stylePanelDirty = false;
  closeStylePanel({ revertUnsaved: false });
  showSaveIndicator('Saving & compiling…');

  await saveAllPending();

  // Trigger a full page reload so the Tailwind-compiled CSS takes effect
  sendToPreview({ type: 'vx-editor:update-classes', classes: [...currentClasses], silent: true });
  setTimeout(() => {
    const iframe = document.getElementById('preview-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage('voxelsite:reload', '*');
    }
  }, 500);
}

// ═══════════════════════════════════════════
//  Draggable Panel
// ═══════════════════════════════════════════

function makeDraggable(panel, handle) {
  let isDragging = false;
  let startX, startY, initialLeft, initialTop;
  let moveActive = false;

  const onDown = (e) => {
    if (e.target.closest('button, input, select')) return;
    isDragging = true;
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
    const rect = panel.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    handle.style.cursor = 'grabbing';
    e.preventDefault();

    if (!moveActive) {
      moveActive = true;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchend', onUp);
    }
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches ? e.touches[0] : e;
    const gutter = 12;
    const panelRect = panel.getBoundingClientRect();
    const width = panelRect.width || 300;
    const height = panelRect.height || 500;
    const unclampedLeft = initialLeft + touch.clientX - startX;
    const unclampedTop = initialTop + touch.clientY - startY;
    const minLeft = gutter;
    const maxLeft = Math.max(gutter, window.innerWidth - width - gutter);
    const minTop = 52;
    const maxTop = Math.max(minTop, window.innerHeight - height - gutter);
    const clampedLeft = Math.min(Math.max(unclampedLeft, minLeft), maxLeft);
    const clampedTop = Math.min(Math.max(unclampedTop, minTop), maxTop);
    panel.style.left = `${clampedLeft}px`;
    panel.style.top = `${clampedTop}px`;
    panel.style.right = 'auto';
  };

  const onUp = () => {
    if (!isDragging) return;
    isDragging = false;
    handle.style.cursor = '';

    if (moveActive) {
      moveActive = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchend', onUp);
    }
  };

  handle.addEventListener('mousedown', onDown);
  handle.addEventListener('touchstart', onDown, { passive: false });

  return () => {
    handle.removeEventListener('mousedown', onDown);
    handle.removeEventListener('touchstart', onDown);
    if (moveActive) {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchend', onUp);
    }
  };
}

/**
 * Make a .vx-modal-overlay's inner panel draggable by its header.
 * Bridges the flexbox-centered modal layout with makeDraggable().
 * On first drag, switches the inner panel from flex-centered to fixed positioning.
 */
function makeModalDraggable(overlay) {
  const panel = overlay.querySelector('.vx-modal');
  const header = overlay.querySelector('.vx-modal-header');
  if (!panel || !header) return;

  header.style.cursor = 'grab';
  let converted = false;

  // Convert from flex-centered to fixed before first drag
  const convertToFixed = () => {
    if (converted) return;
    converted = true;
    const rect = panel.getBoundingClientRect();
    // Remove flex centering from overlay — it stays as a backdrop only
    overlay.style.display = 'block';
    // Position the panel with fixed coords
    panel.style.position = 'fixed';
    panel.style.left = `${rect.left}px`;
    panel.style.top = `${rect.top}px`;
    panel.style.margin = '0';
  };

  // Wrap the header mousedown to convert before drag starts
  const origDown = (e) => {
    if (e.target.closest('button, input, select')) return;
    convertToFixed();
  };
  header.addEventListener('mousedown', origDown, { capture: true });
  header.addEventListener('touchstart', origDown, { capture: true, passive: true });

  const destroyDrag = makeDraggable(panel, header);

  overlay.__vxDestroyDrag = () => {
    header.removeEventListener('mousedown', origDown, { capture: true });
    header.removeEventListener('touchstart', origDown, { capture: true });
    destroyDrag();
  };
}

// ═══════════════════════════════════════════
//  AI Section Edit Panel
// ═══════════════════════════════════════════

let aiEditAbortController = null;

function closeAIEditPanel() {
  const panel = document.getElementById('vx-ai-panel');
  if (!panel) return;
  if (aiEditAbortController) {
    aiEditAbortController.abort();
    aiEditAbortController = null;
  }
  if (typeof panel.__vxDestroyDrag === 'function') panel.__vxDestroyDrag();
  if (typeof panel.__vxOnResize === 'function') window.removeEventListener('resize', panel.__vxOnResize);
  panel.classList.remove('vx-ai-visible');
  setTimeout(() => panel.remove(), 180);
}

function openAIEditPanel(elementData) {
  dismissToolbar();
  closeStylePanel();
  closeAIEditPanel();

  const label = getElementLabel(elementData.tagName, elementData.classList);

  const panel = document.createElement('div');
  panel.id = 'vx-ai-panel';
  panel.className = 'vx-ai-panel';
  panel.tabIndex = -1;
  panel.innerHTML = `
    <div class="vx-ai-header" id="vx-ai-drag-handle">
      <div class="vx-ai-header-left">
        <svg class="vx-ai-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="vx-ai-title">Edit ${escapeHtml(label)}</span>
      </div>
      <div class="vx-ai-header-right">
        <span class="vx-sp-drag-hint">⋮⋮</span>
        <button class="vx-sp-close" id="vx-ai-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="vx-ai-body">
      <div class="vx-ai-input-wrap">
        <textarea class="vx-ai-input" id="vx-ai-input" rows="1" placeholder="Describe your changes…" spellcheck="false"></textarea>
        <button class="vx-ai-send" id="vx-ai-send" title="Generate (⌘↵)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
        </button>
        <button class="vx-ai-cancel" id="vx-ai-cancel-btn" hidden title="Cancel generation">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
        </button>
      </div>
      <div class="vx-ai-status" id="vx-ai-status" hidden>
        <div class="vx-ai-spinner"><i></i><i></i><i></i></div>
        <span id="vx-ai-status-text">Thinking…</span>
      </div>
    </div>`;

  document.body.appendChild(panel);

  // Position centered above/below the element
  positionAIPanel(panel, null, elementData.rect);
  panel.__vxOnResize = () => positionAIPanel(panel, null, elementData.rect);
  window.addEventListener('resize', panel.__vxOnResize);

  requestAnimationFrame(() => panel.classList.add('vx-ai-visible'));
  panel.__vxDestroyDrag = makeDraggable(panel, panel.querySelector('#vx-ai-drag-handle'));

  const input = panel.querySelector('#vx-ai-input');
  const sendBtn = panel.querySelector('#vx-ai-send');
  const cancelBtn = panel.querySelector('#vx-ai-cancel-btn');
  const statusEl = panel.querySelector('#vx-ai-status');
  const statusText = panel.querySelector('#vx-ai-status-text');
  const closeBtn = panel.querySelector('#vx-ai-close');

  // Focus the input after panel animates in
  setTimeout(() => input?.focus(), 200);

  // Close
  closeBtn.addEventListener('click', () => closeAIEditPanel());
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation(); // Don't let it bubble to the global Escape handler
      closeAIEditPanel();
    }
  });

  // Auto-grow textarea (max ~6 rows)
  const autoGrow = () => {
    input.style.height = 'auto';
    const maxHeight = parseFloat(getComputedStyle(input).lineHeight || '20') * 6 + 28; // 6 lines + padding
    input.style.height = Math.min(input.scrollHeight, maxHeight) + 'px';
  };
  input.addEventListener('input', autoGrow);

  // ⌘Enter / Ctrl+Enter to send (Enter for newline)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      doSend();
    }
  });
  sendBtn.addEventListener('click', doSend);

  // Cancel
  cancelBtn.addEventListener('click', () => {
    if (aiEditAbortController) {
      aiEditAbortController.abort();
      aiEditAbortController = null;
    }
    setIdle();
  });

  function setGenerating() {
    input.disabled = true;
    sendBtn.hidden = true;
    cancelBtn.hidden = false;
    statusEl.hidden = false;
    statusText.textContent = 'Reading your site…';
  }

  function setIdle() {
    input.disabled = false;
    sendBtn.hidden = false;
    cancelBtn.hidden = true;
    statusEl.hidden = true;
    input.focus();
  }

  async function doSend() {
    const instruction = input.value.trim();
    if (!instruction) return;

    // Close the panel immediately — the overlay on the element shows progress
    closeAIEditPanel();

    // Show the AI overlay on the selected element in the preview iframe
    sendToPreview({ type: 'vx-editor:show-ai-overlay', status: 'AI is editing…' });

    aiEditAbortController = new AbortController();
    const sectionHtml = elementData.outerHTML || '';
    const filePath = elementData.filePath || getCurrentPreviewPath();
    let tokenCount = 0;

    try {
      await apiStream('/ai/prompt', {
        user_prompt: instruction,
        action_type: 'section_edit',
        page_scope: filePath,
        action_data: {
          path: filePath,
          sectionHtml: sectionHtml.substring(0, 15000),
        },
      }, {
        signal: aiEditAbortController.signal,
        onStatus(message) {
          sendToPreview({ type: 'vx-editor:update-ai-status', status: message || 'Working…', tokens: tokenCount });
        },
        onFile() {
          sendToPreview({ type: 'vx-editor:update-ai-status', status: 'Applying changes…', tokens: tokenCount });
        },
        onToken() {
          tokenCount++;
          sendToPreview({ type: 'vx-editor:update-ai-status', status: 'Generating…', tokens: tokenCount });
        },
        onError(err) {
          sendToPreview({ type: 'vx-editor:hide-ai-overlay' });
          showSaveIndicator(err.message || 'AI edit failed', true);
        },
        onDone(res) {
          aiEditAbortController = null;
          sendToPreview({ type: 'vx-editor:hide-ai-overlay' });

          if (res.cancelled) {
            showSaveIndicator('Generation cancelled', false);
            return;
          }
          const filesModified = res.files_modified || [];
          if (filesModified.length > 0) {
            showSaveIndicator('Section updated ✓');
            setTimeout(() => {
              const iframe = document.getElementById('preview-iframe');
              if (iframe?.contentWindow) {
                iframe.contentWindow.postMessage('voxelsite:reload', '*');
              }
            }, 400);
          } else if (!res.partial) {
            showSaveIndicator('No changes made', false);
          }
        },
        onWarning(message) {
          if (typeof window.showToast === 'function') window.showToast(message, 'warning');
        },
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        showSaveIndicator('AI edit failed', true);
      }
      sendToPreview({ type: 'vx-editor:hide-ai-overlay' });
    }
  }
}

// ═══════════════════════════════════════════
//  Section / Block Picker
// ═══════════════════════════════════════════

const SECTION_TYPES = [
  { id: 'hero',         label: 'Hero',         description: 'Bold headline, subtitle, and call-to-action',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>` },
  { id: 'features',     label: 'Features',     description: 'Feature cards with icons or images',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>` },
  { id: 'about',        label: 'About',        description: 'Story, mission, or biography section',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
  { id: 'testimonials', label: 'Testimonials', description: 'Customer reviews and social proof',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1"/></svg>` },
  { id: 'team',         label: 'Team',         description: 'Team member cards with photos',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
  { id: 'pricing',      label: 'Pricing',      description: 'Pricing plans, packages, or menu',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>` },
  { id: 'faq',          label: 'FAQ',          description: 'Frequently asked questions',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>` },
  { id: 'cta',          label: 'Call to Action', description: 'Conversion-focused banner',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>` },
  { id: 'gallery',      label: 'Gallery',      description: 'Image or project showcase',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>` },
  { id: 'contact',      label: 'Contact',      description: 'Contact details, map, or form',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>` },
  { id: 'stats',        label: 'Stats',        description: 'Key figures, counters, or metrics',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>` },
  { id: 'content',      label: 'Content',      description: 'Rich text, article, or story block',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>` },
];

function openSectionPicker(requestData) {
  dismissToolbar();
  closeStylePanel();
  closeAIEditPanel();

  // Detect which section types already exist on the page
  const existingLower = (requestData.existingSections || '').toLowerCase();
  const existingTypes = new Set();
  for (const st of SECTION_TYPES) {
    // Check if the section type name or id appears in the existing sections summary
    if (existingLower.includes(st.id) || existingLower.includes(st.label.toLowerCase())) {
      existingTypes.add(st.id);
    }
  }

  const modal = document.createElement('div');
  modal.className = 'vx-modal-overlay vx-section-picker-overlay';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Add section');

  const posLabel = requestData.insertAfterIndex === -1
    ? 'at the top of the page'
    : `after section ${requestData.insertAfterIndex + 1} of ${requestData.totalSections}`;

  modal.innerHTML = `
    <div class="vx-modal vx-section-picker">
      <div class="vx-section-picker-header">
        <div class="vx-section-picker-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add Section</span>
        </div>
        <div class="vx-section-picker-meta">${escapeHtml(posLabel)}</div>
        <button class="vx-modal-close" data-close aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="vx-section-picker-grid">
        ${SECTION_TYPES.map(st => {
          const exists = existingTypes.has(st.id);
          return `
            <button class="vx-section-card${exists ? ' vx-section-card-exists' : ''}" data-section-type="${st.id}" data-section-label="${escapeAttr(st.label)}" data-section-desc="${escapeAttr(st.description)}">
              <div class="vx-section-card-icon">${st.icon}</div>
              <div class="vx-section-card-label">${st.label}</div>
              <div class="vx-section-card-desc">${st.description}</div>
              ${exists ? '<div class="vx-section-card-badge">On page</div>' : ''}
            </button>`;
        }).join('')}
      </div>
      <div class="vx-section-picker-footer" id="vx-section-footer" hidden>
        <div class="vx-section-footer-selected">
          <span class="vx-section-footer-type" id="vx-section-footer-type"></span>
          <button class="vx-section-footer-change" id="vx-section-change">Change</button>
        </div>
        <div class="vx-section-footer-input-row">
          <input type="text" class="vx-section-footer-input" id="vx-section-instruction" placeholder="Optional: describe what you want…" spellcheck="false" />
          <button class="vx-section-footer-generate" id="vx-section-generate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Generate
          </button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('vx-modal-visible'));

  // Keyboard and click bindings
  const close = () => {
    modal.classList.remove('vx-modal-visible');
    modal.removeEventListener('keydown', onKeydown);
    setTimeout(() => modal.remove(), 200);
  };
  const onKeydown = (e) => { if (e.key === 'Escape') close(); };
  modal.addEventListener('keydown', onKeydown);
  modal.querySelector('[data-close]').addEventListener('click', close);
  onBackdropClick(modal, close);
  modal.tabIndex = -1;
  modal.focus();

  // State
  let selectedType = null;
  let selectedDesc = null;
  const footer = modal.querySelector('#vx-section-footer');
  const footerType = modal.querySelector('#vx-section-footer-type');
  const instructionInput = modal.querySelector('#vx-section-instruction');
  const generateBtn = modal.querySelector('#vx-section-generate');
  const changeBtn = modal.querySelector('#vx-section-change');
  const grid = modal.querySelector('.vx-section-picker-grid');

  // Example placeholders per section type
  const placeholders = {
    'Hero': 'e.g. "with a background image and two CTAs"',
    'Features': 'e.g. "3 features with icons"',
    'About': 'e.g. "about our 20-year history in sustainable farming"',
    'Testimonials': 'e.g. "3 customer quotes with star ratings"',
    'Team': 'e.g. "4 team members with photos and roles"',
    'Pricing': 'e.g. "3 tiers: starter, pro, enterprise"',
    'FAQ': 'e.g. "5 questions about our delivery process"',
    'Call to Action': 'e.g. "book a free consultation"',
    'Gallery': 'e.g. "6 project photos in a masonry grid"',
    'Contact': 'e.g. "with a contact form and office address"',
    'Stats': 'e.g. "4 key numbers: years, clients, projects, awards"',
    'Content': 'e.g. "about our sustainability practices"',
  };

  // Card click → show instruction footer
  modal.querySelectorAll('.vx-section-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedType = card.dataset.sectionLabel;
      selectedDesc = card.dataset.sectionDesc;

      // Highlight the selected card
      modal.querySelectorAll('.vx-section-card').forEach(c => c.classList.remove('vx-section-card-selected'));
      card.classList.add('vx-section-card-selected');

      // Show the footer
      footerType.textContent = selectedType;
      instructionInput.placeholder = placeholders[selectedType] || 'Optional: describe what you want…';
      instructionInput.value = '';
      footer.hidden = false;
      grid.classList.add('vx-section-grid-collapsed');

      // Focus the instruction input
      setTimeout(() => instructionInput.focus(), 100);
    });
  });

  // Change button → go back to grid
  changeBtn.addEventListener('click', () => {
    selectedType = null;
    selectedDesc = null;
    footer.hidden = true;
    grid.classList.remove('vx-section-grid-collapsed');
    modal.querySelectorAll('.vx-section-card').forEach(c => c.classList.remove('vx-section-card-selected'));
  });

  // Generate button
  const doGenerate = () => {
    if (!selectedType) return;
    const userInstruction = instructionInput.value.trim();
    close();
    generateSection(requestData, selectedType, selectedDesc, userInstruction);
  };

  generateBtn.addEventListener('click', doGenerate);

  // Enter in instruction input → generate
  instructionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doGenerate();
    }
  });
}

/** AI-generate a section and insert it at the specified position. */
async function generateSection(requestData, sectionType, sectionDescription, userInstruction = '') {
  // Show AI overlay in the iframe — use a full-page overlay since we're inserting, not editing
  sendToPreview({ type: 'vx-editor:show-ai-overlay', status: `Adding ${sectionType}…` });

  const filePath = requestData.filePath || getCurrentPreviewPath();
  aiEditAbortController = new AbortController();
  const abortController = aiEditAbortController;

  // Build the user prompt — include instruction if provided
  let userPrompt = `Add a ${sectionType} section to this page.`;
  if (userInstruction) {
    userPrompt += ` ${userInstruction}`;
  }

  // Token counter — shows "Generating Content… (2,450 tokens)" to prove the AI is writing
  const startTime = Date.now();
  let tokenCount = 0;
  const updateOverlayStatus = () => {
    if (tokenCount > 0) {
      sendToPreview({
        type: 'vx-editor:update-ai-status',
        status: `Generating ${sectionType}…`,
        tokens: tokenCount,
      });
    } else {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      if (elapsed >= 6) {
        sendToPreview({
          type: 'vx-editor:update-ai-status',
          status: `Preparing ${sectionType}…`,
        });
      }
    }
  };
  // Update every second during the "preparing" phase
  const statusInterval = setInterval(updateOverlayStatus, 1000);
  // Throttle token updates to avoid flooding the iframe with messages
  let lastTokenUpdate = 0;

  // The section index where the new content will appear
  const newSectionIndex = requestData.insertAfterIndex === -1
    ? 0
    : requestData.insertAfterIndex + 1;

  try {
    await apiStream('/ai/prompt', {
      user_prompt: userPrompt,
      action_type: 'add_section',
      page_scope: filePath,
      action_data: {
        path: filePath,
        sectionType,
        sectionDescription,
        insertPosition: requestData.insertAfterIndex === -1
          ? 'At the very beginning of the main content, before the first section'
          : `After section ${requestData.insertAfterIndex + 1}`,
        existingSections: requestData.existingSections || '',
      },
    }, {
      signal: abortController.signal,
      onStatus(message) {
        sendToPreview({ type: 'vx-editor:update-ai-status', status: message || `Adding ${sectionType}…`, tokens: tokenCount });
      },
      onFile() {
        sendToPreview({ type: 'vx-editor:update-ai-status', status: 'Writing files…', tokens: tokenCount });
      },
      onToken() {
        tokenCount++;
        // Throttle status updates to every 500ms to avoid flooding
        const now = Date.now();
        if (now - lastTokenUpdate > 500) {
          lastTokenUpdate = now;
          updateOverlayStatus();
        }
      },
      onError(err) {
        clearInterval(statusInterval);
        aiEditAbortController = null;
        sendToPreview({ type: 'vx-editor:hide-ai-overlay' });
        showSaveIndicator(err.message || 'Failed to add section', true);
      },
      onDone(res) {
        clearInterval(statusInterval);
        aiEditAbortController = null;
        sendToPreview({ type: 'vx-editor:hide-ai-overlay' });

        if (res.cancelled) {
          showSaveIndicator('Generation cancelled', false);
          return;
        }
        const filesModified = res.files_modified || [];
        if (filesModified.length > 0) {
          showSaveIndicator(`${sectionType} added ✓`);
          setTimeout(() => {
            const iframe = document.getElementById('preview-iframe');
            if (iframe?.contentWindow) {
              iframe.contentWindow.postMessage('voxelsite:reload', '*');
            }
            // After reload: re-activate the bridge, scroll to the new section, and rebuild dividers
            setTimeout(() => {
              // The iframe reloaded — the bridge resets to active=false.
              // Re-send the toggle to re-activate overlay + cursor + dividers.
              sendToPreview({ type: 'vx-editor:toggle', active: true });
              // Give the bridge a moment to activate before scrolling/rebuilding
              setTimeout(() => {
                sendToPreview({
                  type: 'vx-editor:scroll-to-section',
                  sectionIndex: newSectionIndex,
                });
                sendToPreview({ type: 'vx-editor:rebuild-section-dividers' });
              }, 200);
            }, 800);
          }, 400);
        } else if (!res.partial) {
          showSaveIndicator('No changes made', false);
        }
      },
      onWarning(message) {
        if (typeof window.showToast === 'function') window.showToast(message, 'warning');
      },
    });
  } catch (err) {
    clearInterval(statusInterval);
    aiEditAbortController = null;
    if (err.name !== 'AbortError') {
      showSaveIndicator('Failed to add section', true);
    }
    sendToPreview({ type: 'vx-editor:hide-ai-overlay' });
  }
}

function openImagePicker(elementData) {
  dismissToolbar();
  let imageSelected = false;
  const modal = document.createElement('div');
  modal.className = 'vx-modal-overlay';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `<div class="vx-modal"><div class="vx-modal-header"><span>Choose Image</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body"><div class="vx-img-grid" id="vx-img-grid"><div class="vx-img-loading">Loading assets…</div></div></div></div>`;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('vx-modal-visible'));
  const close = () => {
    modal.classList.remove('vx-modal-visible');
    modal.removeEventListener('keydown', onKeydown);
    setTimeout(() => {
      modal.remove();
      // Restore toolbar if no image was selected and an element is still selected
      if (!imageSelected && selectedElement) {
        showContextToolbar(selectedElement);
      }
    }, 200);
  };
  const onKeydown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation(); // Prevent global Escape handler from also deselecting
      e.preventDefault();
      close();
    }
  };
  modal.addEventListener('keydown', onKeydown);
  modal.querySelector('[data-close]').addEventListener('click', close);
  onBackdropClick(modal, close);
  modal.tabIndex = -1;
  modal.focus();
  loadAssetImages(modal);
}

async function loadAssetImages(modal) {
  const grid = modal.querySelector('#vx-img-grid');
  try {
    const result = await api.get('/assets');
    if (!result.ok) {
      grid.innerHTML = `<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p class="vx-img-empty-title">Failed to load assets</p>
        <p class="vx-img-empty-desc">Check the browser console for details.</p>
      </div>`;
      return;
    }
    const images = (result.data.assets || []).filter(f => /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(f.path));
    if (!images.length) {
      grid.innerHTML = `<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <p class="vx-img-empty-title">No images yet</p>
        <p class="vx-img-empty-desc">Upload images in the Assets tab first.</p>
      </div>`;
      return;
    }
    grid.innerHTML = images.map(img => {
      const thumbSrc = img.thumbnail || img.path;
      return `<button class="vx-img-item" data-path="${img.path}"><img src="${thumbSrc}" alt="" loading="lazy"><span class="vx-img-name">${(img.filename || img.path).split('/').pop()}</span></button>`;
    }).join('');
    grid.querySelectorAll('.vx-img-item').forEach(item => {
      item.addEventListener('click', async () => {
        const newSrc = item.dataset.path;
        const oldSrc = selectedElement?.src || '';
        // Prefer the real source file from the address, not the preview page path
        const fp = selectedAddress?.sourceFile || selectedElement?.filePath || getCurrentPreviewPath();

        // Pessimistic save: persist to file FIRST, update preview only on success
        const saved = await saveImageChange({
          filePath: fp,
          oldSrc,
          newSrc,
          alt: selectedElement?.outerHTML?.match(/alt="([^"]*)"/)?.[1] || '',
          sourceAddress: selectedAddress,
        });

        if (saved) {
          // File write succeeded — now update the live preview
          sendToPreview({ type: 'vx-editor:swap-image', src: newSrc });
        }
        // If save failed, preview stays at last durable state

        // Deselect the element — the image changed, clean slate
        dismissVisualEditorSelection();

        modal.classList.remove('vx-modal-visible');
        setTimeout(() => modal.remove(), 200);
      });
    });
  } catch { grid.innerHTML = `<div class="vx-img-empty">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p class="vx-img-empty-title">Failed to load assets</p>
    <p class="vx-img-empty-desc">Check the browser console for details.</p>
  </div>`; }
}

// ═══════════════════════════════════════════
//  Link Editor  (unchanged from v1)
// ═══════════════════════════════════════════

function openLinkEditor(elementData) {
  dismissToolbar();

  const curHref = elementData.href || '';
  const curText = elementData.text || '';
  const curTarget = elementData.target || '';
  const curClass = elementData.linkClass || '';
  const discoveredClasses = elementData.linkClasses || [];
  const filePath = selectedAddress?.sourceFile || elementData.filePath || getCurrentPreviewPath();

  // Build class options from discovered page classes
  let classOptionsHtml = `<option value=""${!curClass ? ' selected' : ''}>No class</option>`;
  const classInList = discoveredClasses.includes(curClass);
  discoveredClasses.forEach(cls => {
    classOptionsHtml += `<option value="${escapeAttr(cls)}"${curClass === cls ? ' selected' : ''}>${escapeHtml(cls)}</option>`;
  });
  // If current class isn't in the discovered list, show it as custom
  if (curClass && !classInList) {
    classOptionsHtml += `<option value="${escapeAttr(curClass)}" selected>${escapeHtml(curClass)}</option>`;
  }

  const modal = document.createElement('div');
  modal.className = 'vx-modal-overlay';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  modal.innerHTML = `<div class="vx-modal vx-modal-sm"><div class="vx-modal-header"><span>Edit Link</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body">
      <div class="vx-form-group"><label class="vx-form-label">URL</label><input type="text" class="vx-form-input" id="vx-link-href" value="${escapeAttr(curHref)}" placeholder="https://… or /page" spellcheck="false"></div>
      <div class="vx-form-group"><label class="vx-form-label">Text</label><input type="text" class="vx-form-input" id="vx-link-text" value="${escapeAttr(curText)}" placeholder="Link text"></div>
      ${discoveredClasses.length > 0 || curClass ? `<div class="vx-form-group"><label class="vx-form-label">Link Style</label>
        <select class="vx-form-input" id="vx-link-style">${classOptionsHtml}</select>
      </div>` : ''}
      <div class="vx-form-group" style="margin-bottom:0;">
        <label class="vs-checkbox-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; position: relative;">
          <input type="checkbox" id="vx-link-target" class="vs-checkbox" ${curTarget === '_blank' ? 'checked' : ''}>
          <span class="vs-checkbox-box"></span>
          <span style="font: 400 13px/1.4 var(--font-sans); color: var(--vs-text-primary);">Open in new window</span>
        </label>
      </div>
    </div>
    <div class="vx-modal-footer"><button class="vx-btn-secondary" data-close>Cancel</button><button class="vx-btn-primary" id="vx-link-save">Save</button></div></div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('vx-modal-visible'));

  // Make draggable by header — same behavior as the class/style panel
  makeModalDraggable(modal);

  const close = () => {
    modal.classList.remove('vx-modal-visible');
    modal.removeEventListener('keydown', onKeydown);
    if (modal.__vxDestroyDrag) modal.__vxDestroyDrag();
    setTimeout(() => modal.remove(), 200);
  };
  const onKeydown = (e) => { if (e.key === 'Escape') close(); };
  modal.addEventListener('keydown', onKeydown);
  modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  onBackdropClick(modal, close);

  document.getElementById('vx-link-save').addEventListener('click', async () => {
    if (window.demoGuard?.()) { close(); return; }

    const newHref = document.getElementById('vx-link-href').value.trim();
    const newText = document.getElementById('vx-link-text').value.trim();
    const newTarget = document.getElementById('vx-link-target').checked ? '_blank' : '';
    const styleEl = document.getElementById('vx-link-style');
    const newClass = styleEl ? styleEl.value : '';

    // Collect semantic operations for all changed attributes
    const address = selectedAddress;
    const linkOps = [];
    if (newHref !== curHref) {
      linkOps.push(opSetAttribute(address, 'href', curHref, newHref, filePath));
    }
    if (newTarget !== curTarget) {
      linkOps.push(opSetAttribute(address, 'target', curTarget || null, newTarget || null, filePath));
    }
    if (newClass !== curClass) {
      linkOps.push(opSetAttribute(address, 'class', curClass || null, newClass || null, filePath));
    }
    if (newText !== curText) {
      linkOps.push(opSetText(address, curText, newText, filePath));
    }
    linkOps.forEach(op => logOp(op, 'created'));

    // Pessimistic save: persist to source FIRST, update preview only on success
    const saved = await saveLinkToSource(filePath, {
      oldHref: curHref, oldText: curText, oldTarget: curTarget, oldClass: curClass,
      newHref, newText, newTarget, newClass,
    }, linkOps);

    if (saved) {
      // File write succeeded — now update the live preview
      sendToPreview({ type: 'vx-editor:update-link', href: newHref, text: newText, target: newTarget, className: newClass });
      setTimeout(() => sendToPreview({ type: 'vx-editor:refresh-highlight' }), 100);
    }
    // If save failed, preview stays at last durable state — no optimistic mutation

    close();
  });

  setTimeout(() => document.getElementById('vx-link-href')?.focus(), 100);
}

/**
 * Try to find and replace a link in the given file content.
 *
 * Pure search-and-replace: does NOT read or write files, does NOT recurse.
 * Returns:
 *   - modified content string on unique match + success
 *   - 'ambiguous' if multiple <a> tags match the same href (refuse to edit)
 *   - null on no match
 */
function tryLinkReplaceInContent(content, { oldHref, oldText, oldTarget, oldClass, newHref, newText, newTarget, newClass }) {
  const escRx = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hrefPattern = escRx(oldHref);

  // Match <a with href="oldHref" (anywhere in attributes), then content, then </a>
  const tagRegex = new RegExp(
    `(<a\\s[^>]*?href=["']${hrefPattern}["'][^>]*>)([\\s\\S]*?)(</a>)`,
    'gi'  // global flag to count all matches
  );

  // Count matches — refuse if ambiguous
  const allMatches = [...content.matchAll(tagRegex)];
  if (allMatches.length === 0) return null;
  if (allMatches.length > 1) return 'ambiguous';

  const match = allMatches[0];
  let openingTag = match[1];
  let innerContent = match[2];
  const closingTag = match[3];

  // --- Apply attribute changes to the opening tag ---
  // href
  if (newHref !== oldHref) {
    openingTag = openingTag.replace(
      new RegExp(`href=["']${escRx(oldHref)}["']`),
      `href="${newHref}"`
    );
  }

  // target
  if (newTarget !== oldTarget) {
    if (newTarget && openingTag.includes('target=')) {
      openingTag = openingTag.replace(/target=["'][^"']*["']/, `target="${newTarget}"`);
    } else if (newTarget && !openingTag.includes('target=')) {
      openingTag = openingTag.replace(/>$/, ` target="${newTarget}" rel="noopener">`);
    } else if (!newTarget && openingTag.includes('target=')) {
      openingTag = openingTag.replace(/\s*target=["'][^"']*["']/, '');
      openingTag = openingTag.replace(/\s*rel=["'][^"']*["']/, '');
    }
  }

  // class
  if (newClass !== oldClass) {
    if (newClass && openingTag.includes('class=')) {
      openingTag = openingTag.replace(/class=["'][^"']*["']/, `class="${newClass}"`);
    } else if (newClass && !openingTag.includes('class=')) {
      openingTag = openingTag.replace(/>$/, ` class="${newClass}">`);
    } else if (!newClass && openingTag.includes('class=')) {
      openingTag = openingTag.replace(/\s*class=["'][^"']*["']/, '');
    }
  }

  // text content — only replace if it's simple text (no nested HTML)
  if (newText !== oldText && !innerContent.includes('<')) {
    innerContent = newText;
  }

  const newElement = openingTag + innerContent + closingTag;
  const newContent = content.replace(match[0], newElement);

  // If nothing actually changed after all replacements, treat as a no-op success
  return newContent !== content ? newContent : content;
}

/**
 * Save link attribute changes to the source file.
 *
 * Searches the main file first, then iterates partials — flat, no recursion.
 * Accepts an optional `ops` array for lifecycle logging.
 */
async function saveLinkToSource(filePath, linkData, ops) {
  const fp = filePath || getCurrentPreviewPath();

  try {
    // --- Strategy 1: Try the main file ---
    const readResult = await api.get(`/files/content?path=${encodeURIComponent(fp)}`);
    if (!readResult.ok) {
      if (ops) ops.forEach(op => logOp(op, 'failed', { reason: 'cannot read file' }));
      showSaveIndicator('Cannot read source file', true);
      return false;
    }

    const mainContent = readResult.data.content;
    const modified = tryLinkReplaceInContent(mainContent, linkData);

    // Ambiguous match — refuse to write (multiple <a> tags with the same href)
    if (modified === 'ambiguous') {
      if (ops) ops.forEach(op => logOp(op, 'failed', { reason: 'ambiguous match — multiple links share this href' }));
      showSaveIndicator('Save failed — link appears multiple times. Edit in the Code Editor instead.', true);
      return false;
    }

    if (modified !== null) {
      const saveResult = await api.put('/files/content', { path: fp, content: modified });
      if (saveResult.ok) {
        if (ops) ops.forEach(op => logOp(op, 'persisted', { strategy: 'contentMatch' }));
        showSaveIndicator(`Saved → ${fp.split('/').pop()}`);
        return true;
      } else {
        if (ops) ops.forEach(op => logOp(op, 'failed', { reason: 'API write failed' }));
        showSaveIndicator('Save failed', true);
        return false;
      }
    }

    // --- Strategy 2: Search partials (flat iteration, no recursion) ---
    const listResult = await api.get('/files');
    if (listResult.ok) {
      const candidates = (listResult.data.files || [])
        .filter(f => f.path.endsWith('.php') && f.path !== fp);

      for (const file of candidates) {
        const partialRead = await api.get(`/files/content?path=${encodeURIComponent(file.path)}`);
        if (!partialRead.ok || !partialRead.data?.content) continue;

        const partialModified = tryLinkReplaceInContent(partialRead.data.content, linkData);

        // Ambiguous — stop (same discipline as main file)
        if (partialModified === 'ambiguous') {
          if (ops) ops.forEach(op => logOp(op, 'failed', { reason: 'ambiguous match in partial', file: file.path }));
          showSaveIndicator('Save failed — link appears multiple times. Edit in the Code Editor instead.', true);
          return false;
        }

        if (partialModified !== null) {
          const saveResult = await api.put('/files/content', { path: file.path, content: partialModified });
          if (saveResult.ok) {
            if (ops) ops.forEach(op => logOp(op, 'persisted', { strategy: 'partialSearch' }));
            showSaveIndicator(`Saved → ${file.path.split('/').pop()}`);
            return true;
          } else {
            // Write failed — terminal, don't keep searching (Fix 2: accurate error)
            if (ops) ops.forEach(op => logOp(op, 'failed', { reason: 'API write failed in partial', file: file.path }));
            showSaveIndicator('Save failed', true);
            return false;
          }
        }
      }
    }

    // --- Not found anywhere ---
    if (ops) ops.forEach(op => logOp(op, 'failed', { reason: 'link not found in source' }));
    showSaveIndicator('Save failed — link not found in source', true);
    return false;
  } catch (err) {
    console.error('[VX] saveLinkToSource error:', err);
    if (ops) ops.forEach(op => logOp(op, 'failed', { reason: 'exception', error: err.message }));
    showSaveIndicator('Save failed — unexpected error', true);
    return false;
  }
}

// ═══════════════════════════════════════════
//  Save Pipeline  (enhanced with partial search)
// ═══════════════════════════════════════════

/**
 * Save an image swap immediately (no debounce — user already committed via the modal).
 * Uses multiple strategies to locate the correct `src` attribute in the source file:
 *   1. Direct literal match: `src="oldSrc"` → `src="newSrc"` (main file)
 *   2. Direct literal match across partials / other editable files
 *   3. Alt-text anchored regex: find the `<img>` tag by its alt text and replace src
 *      (handles PHP-expression sources like `src="<?= $dish['image'] ?>"`)
 */
async function saveImageChange(data) {
  if (window.demoGuard?.()) return false;
  const { filePath, oldSrc, newSrc, alt } = data;
  const fp = filePath || getCurrentPreviewPath();

  // Produce a semantic set_attribute operation for src
  const address = normalizeSourceAddress(data.sourceAddress || selectedAddress);
  const op = opSetAttribute(address, 'src', oldSrc, newSrc, fp);
  logOp(op, 'created');

  try {
    const readResult = await api.get(`/files/content?path=${encodeURIComponent(fp)}`);
    if (!readResult.ok) {
      console.warn('[VX] Cannot read file for image save:', fp);
      logOp(op, 'failed', { reason: 'cannot read file' });
      showSaveIndicator('Save failed', true);
      return false;
    }

    let content = readResult.data.content;
    let modified = false;

    // Strategy 1a: Direct src attribute match (works for static <img src="...">)
    const literal = `src="${oldSrc}"`;
    const literalCount = content.split(literal).length - 1;
    if (literalCount > 1) {
      // Ambiguous — multiple elements share this src. Refuse to write.
      logOp(op, 'failed', { reason: 'ambiguous match — multiple elements share this src' });
      showSaveIndicator('Save failed — image source appears multiple times. Edit in the Code Editor instead.', true);
      return false;
    }
    if (literalCount === 1) {
      content = content.replace(literal, `src="${newSrc}"`);
      modified = true;
    }

    // Strategy 1b: Quoted path value match (handles PHP arrays like 'image' => '/path')
    // Also catches background-image: url('...'), data attributes, etc.
    if (!modified && content.includes(oldSrc)) {
      const pathCount = content.split(oldSrc).length - 1;
      if (pathCount > 1) {
        // Ambiguous — the path appears in multiple contexts. Refuse to write.
        logOp(op, 'failed', { reason: 'ambiguous match — image path appears multiple times in source' });
        showSaveIndicator('Save failed — image path appears multiple times. Edit in the Code Editor instead.', true);
        return false;
      }
      content = content.replace(oldSrc, newSrc);
      modified = true;
    }

    // Strategy 2: Alt-text anchored string match in main file
    // (handles PHP-expression src like src="<?= $dish['image'] ?>")
    if (!modified && alt) {
      const altResult = replaceImgSrcByAlt(content, alt, newSrc);
      if (altResult === 'ambiguous') {
        logOp(op, 'failed', { reason: 'ambiguous alt-anchor match — multiple images share this alt text' });
        showSaveIndicator('Save failed — multiple images share this alt text. Edit in the Code Editor instead.', true);
        return false;
      }
      if (altResult !== false) {
        content = altResult;
        modified = true;
      }
    }

    // Save main file if modified
    if (modified) {
      const saveResult = await api.put('/files/content', { path: fp, content });
      if (saveResult.ok) {
        logOp(op, 'persisted', { strategy: 'contentMatch' });
        showSaveIndicator(`Saved → ${fp.split('/').pop()}`);
        return true;
      } else {
        logOp(op, 'failed', { reason: 'API write failed' });
        showSaveIndicator('Save failed', true);
        return false;
      }
    }

    // Strategy 3: Search ALL other editable PHP files (partials, other pages)
    const listResult = await api.get('/files');
    if (listResult.ok) {
      const otherFiles = (listResult.data.files || [])
        .filter(f => f.path.endsWith('.php') && f.path !== fp);

      for (const file of otherFiles) {
        const partialRead = await api.get(`/files/content?path=${encodeURIComponent(file.path)}`);
        if (!partialRead.ok || !partialRead.data.content) continue;
        let partialContent = partialRead.data.content;

        // Try src attribute literal match (with ambiguity check)
        const partialLiteralCount = partialContent.split(literal).length - 1;
        if (partialLiteralCount > 1) {
          logOp(op, 'failed', { reason: 'ambiguous match in partial', file: file.path });
          showSaveIndicator('Save failed — image source appears multiple times. Edit in the Code Editor instead.', true);
          return false;
        }
        if (partialLiteralCount === 1) {
          partialContent = partialContent.replace(literal, `src="${newSrc}"`);
          const saveResult = await api.put('/files/content', { path: file.path, content: partialContent });
          if (saveResult.ok) { logOp(op, 'persisted', { strategy: 'partialSearch' }); showSaveIndicator(`Saved → ${file.path.split('/').pop()}`); return true; }
          // Write failed — terminal
          logOp(op, 'failed', { reason: 'API write failed in partial', file: file.path });
          showSaveIndicator('Save failed', true);
          return false;
        }

        // Try quoted path value match (with ambiguity check)
        if (partialContent.includes(oldSrc)) {
          const partialPathCount = partialContent.split(oldSrc).length - 1;
          if (partialPathCount > 1) {
            logOp(op, 'failed', { reason: 'ambiguous match in partial', file: file.path });
            showSaveIndicator('Save failed — image path appears multiple times. Edit in the Code Editor instead.', true);
            return false;
          }
          partialContent = partialContent.replace(oldSrc, newSrc);
          const saveResult = await api.put('/files/content', { path: file.path, content: partialContent });
          if (saveResult.ok) { logOp(op, 'persisted', { strategy: 'partialSearch' }); showSaveIndicator(`Saved → ${file.path.split('/').pop()}`); return true; }
          // Write failed — terminal
          logOp(op, 'failed', { reason: 'API write failed in partial', file: file.path });
          showSaveIndicator('Save failed', true);
          return false;
        }

        if (alt) {
          const altResult = replaceImgSrcByAlt(partialContent, alt, newSrc);
          if (altResult === 'ambiguous') {
            logOp(op, 'failed', { reason: 'ambiguous alt-anchor match in partial', file: file.path });
            showSaveIndicator('Save failed — multiple images share this alt text. Edit in the Code Editor instead.', true);
            return false;
          }
          if (altResult !== false) {
            const saveResult = await api.put('/files/content', { path: file.path, content: altResult });
            if (saveResult.ok) { logOp(op, 'persisted', { strategy: 'altAnchor' }); showSaveIndicator(`Saved → ${file.path.split('/').pop()}`); return true; }
            // Write failed — terminal
            logOp(op, 'failed', { reason: 'API write failed in partial', file: file.path });
            showSaveIndicator('Save failed', true);
            return false;
          }
        }
      }
    }

    console.warn('[VX] Image src not found in any source file. oldSrc:', oldSrc, 'alt:', alt);
    logOp(op, 'failed', { reason: 'source not found' });
    showSaveIndicator('Save failed — source not found', true);
    return false;
  } catch (err) {
    console.error('[VX] Image save error:', err);
    logOp(op, 'failed', { reason: 'exception', error: err.message });
    showSaveIndicator('Save failed', true);
    return false;
  }
}

/**
 * Find an <img> tag by its alt text and replace its src attribute.
 * Uses pure string operations (no regex) to avoid catastrophic backtracking
 * when PHP tags (<?= ... ?>) are present inside img attributes.
 * Returns:
 *   - modified content string on unique match
 *   - 'ambiguous' if multiple <img> tags share this alt text
 *   - false if no match found
 */
function replaceImgSrcByAlt(content, alt, newSrc) {
  // Split by <img to isolate each img tag
  const parts = content.split('<img');

  // First pass: count matching fragments
  const matchingIndices = [];
  for (let i = 1; i < parts.length; i++) {
    const fragment = parts[i];
    if (fragment.includes(`alt="${alt}"`) || fragment.includes(`alt='${alt}'`)) {
      // Verify it has a src= we can replace
      const srcIdx = fragment.indexOf('src=');
      if (srcIdx !== -1) {
        const quoteChar = fragment[srcIdx + 4];
        if ((quoteChar === '"' || quoteChar === "'") && fragment.indexOf(quoteChar, srcIdx + 5) !== -1) {
          matchingIndices.push(i);
        }
      }
    }
  }

  if (matchingIndices.length === 0) return false;
  if (matchingIndices.length > 1) return 'ambiguous';

  // Unique match — apply the replacement
  const idx = matchingIndices[0];
  const fragment = parts[idx];
  const srcIdx = fragment.indexOf('src=');
  const quoteChar = fragment[srcIdx + 4];
  const valueStart = srcIdx + 5;
  const valueEnd = fragment.indexOf(quoteChar, valueStart);
  parts[idx] = fragment.substring(0, valueStart) + newSrc + fragment.substring(valueEnd);
  return parts.join('<img');
}

function queueTextChange(data) {
  if (window.demoGuard?.()) return;

  // VE-011: Produce a semantic set_text operation
  const address = normalizeSourceAddress(data.sourceAddress);
  const op = opSetText(address, data.originalHTML, data.newHTML, data.filePath);
  logOp(op, 'created');

  pendingChanges.push({
    type: 'text',
    filePath: data.filePath,
    originalHTML: data.originalHTML,
    newHTML: data.newHTML,
    sourceAddress: data.sourceAddress || null,
    timestamp: Date.now(),
    // VE-011: attach the semantic operation
    _op: op,
  });
  clearTimeout(queueTextChange._timer);
  queueTextChange._timer = setTimeout(() => saveAllPending(), 800);
}

/**
 * Save an inline source editor change with strict match verification.
 *
 * Unlike the generic text-edit queue (saveAllPending), this function:
 *  - Saves immediately (no debounce — user explicitly clicked Apply)
 *  - Requires EXACTLY ONE match of the needle in the source file
 *  - Fails loud when zero matches (needle not found)
 *  - Fails loud when multiple matches (ambiguous replacement)
 *  - Searches partials if the main file has no match
 *  - Shows clear error messages in the save indicator
 */
async function saveSourceEdit(data) {
  const { filePath, originalHTML: needle, newHTML } = data;
  if (!needle || !newHTML) {
    showSaveIndicator('Source edit failed — missing data', true);
    return false;
  }

  const fp = filePath || getCurrentPreviewPath();

  try {
    // ── Try main file first ──
    const readResult = await api.get(`/files/content?path=${encodeURIComponent(fp)}`);
    if (!readResult.ok) {
      showSaveIndicator('Cannot read source file', true);
      return false;
    }

    let content = readResult.data.content;
    const status = await attemptExactReplace(fp, content, needle, newHTML);
    if (status === 'saved') return true;
    if (status === 'ambiguous') return false; // STOP — do NOT search other files

    // ── 'not_found' — search partials ──
    const listResult = await api.get('/files');
    if (!listResult.ok) {
      showSaveIndicator('Save failed — source not found in file', true);
      return false;
    }

    const candidates = (listResult.data.files || [])
      .filter(f => f.path.endsWith('.php') && f.path !== fp);

    for (const file of candidates) {
      const partialRead = await api.get(`/files/content?path=${encodeURIComponent(file.path)}`);
      if (!partialRead.ok || !partialRead.data.content) continue;

      const partialStatus = await attemptExactReplace(file.path, partialRead.data.content, needle, newHTML);
      if (partialStatus === 'saved') return true;
      if (partialStatus === 'ambiguous') return false; // STOP on ambiguity anywhere
    }

    // Nothing matched anywhere
    console.warn('[VX] Source edit needle not found in any file:', needle.substring(0, 100));
    showSaveIndicator('Save failed — source not found. The file may have changed.', true);
    return false;

  } catch (err) {
    console.error('[VX] Source edit save error:', err);
    showSaveIndicator('Save failed', true);
    return false;
  }
}

/**
 * Attempt to replace `needle` with `replacement` in `content`.
 * Returns a status string:
 *  - 'saved'     — exactly 1 match, replaced and saved successfully
 *  - 'not_found' — 0 matches in this file
 *  - 'ambiguous'  — 2+ matches, refused to replace (error shown to user)
 */
async function attemptExactReplace(filePath, content, needle, replacement) {
  // Count occurrences
  let matchCount = 0;
  let searchPos = 0;
  while (true) {
    const idx = content.indexOf(needle, searchPos);
    if (idx === -1) break;
    matchCount++;
    searchPos = idx + needle.length;
    if (matchCount > 1) break; // we already know it's ambiguous
  }

  if (matchCount === 0) {
    return 'not_found';
  }

  if (matchCount > 1) {
    showSaveIndicator('Save failed — source fragment appears multiple times. Edit in the Code Editor instead.', true);
    return 'ambiguous';
  }

  // Exactly one match — safe to replace
  const newContent = content.replace(needle, replacement);
  const saveResult = await api.put('/files/content', { path: filePath, content: newContent });

  if (saveResult.ok) {
    const fileName = filePath.split('/').pop();
    showSaveIndicator(`Saved → ${fileName}`);

    // Reload CSS if Tailwind was recompiled
    if (saveResult.data?.tailwindCompiled) {
      setTimeout(() => {
        const iframe = document.getElementById('preview-iframe');
        if (iframe?.contentWindow) iframe.contentWindow.postMessage('voxelsite:reload-css', '*');
      }, 300);
    }
    return 'saved';
  } else {
    showSaveIndicator('Save failed', true);
    return 'not_found';
  }
}

function queueDeletion(data) {
  if (window.demoGuard?.()) return;

  // Produce a semantic delete_node operation with reinsertion context
  const address = normalizeSourceAddress(data.sourceAddress);
  const parentAddress = data.parentAddress ? normalizeSourceAddress(data.parentAddress) : null;
  const siblingIndex = typeof data.siblingIndex === 'number' ? data.siblingIndex : -1;
  const op = opDeleteNode(address, data.outerHTML, data.filePath, parentAddress, siblingIndex);
  logOp(op, 'created');

  pendingChanges.push({
    type: 'delete',
    filePath: data.filePath,
    outerHTML: data.outerHTML,
    sourceAddress: data.sourceAddress || null,
    timestamp: Date.now(),
    _op: op,
  });
  clearTimeout(queueDeletion._timer);
  queueDeletion._timer = setTimeout(() => saveAllPending(), 300);
}

/** Extract class names from a needle string like 'class="foo bar baz"' */
function originalClassesFromNeedle(needle) {
  const m = needle.match(/class="([^"]*)"/);
  return m ? m[1].split(/\s+/).filter(Boolean) : [];
}

/**
 * Subset match: find a class="..." attribute in `content` whose source classes
 * are a subset of `runtimeClasses`, then apply additions/removals to the
 * source-level classes (avoiding writing runtime-only classes into the file).
 *
 * Returns the modified content string, or null if no match was found.
 */
function applyClassDiffSubset(content, runtimeClasses, additions, removals) {
  // Common classes added by JS at runtime — never in source
  const RUNTIME_ONLY = new Set(['is-visible', 'is-active', 'is-open', 'active', 'open',
    'show', 'shown', 'visible', 'in', 'entered', 'transitioning']);

  const classAttrRe = /class="([^"]*)"/g;
  let match;
  while ((match = classAttrRe.exec(content)) !== null) {
    const sourceClasses = match[1].split(/\s+/).filter(Boolean);
    if (sourceClasses.length === 0) continue;

    // Check: every source class should be in the runtime set
    const allInRuntime = sourceClasses.every(c => runtimeClasses.has(c));
    if (!allInRuntime) continue;

    // The runtime set should be the source set PLUS only runtime-only, additions, or removals
    const extraInRuntime = [...runtimeClasses].filter(c => !sourceClasses.includes(c));
    const allExtraAreRuntime = extraInRuntime.every(c =>
      RUNTIME_ONLY.has(c) || additions.includes(c) || removals.includes(c)
    );
    if (!allExtraAreRuntime) continue;

    // Found! Apply the diff to source-level classes
    const resultClasses = sourceClasses.filter(c => !removals.includes(c));
    for (const add of additions) {
      if (!RUNTIME_ONLY.has(add) && !resultClasses.includes(add)) {
        resultClasses.push(add);
      }
    }

    const oldAttr = match[0];
    const newAttr = `class="${resultClasses.join(' ')}"`;
    // Ensure unique replacement (only replace this specific occurrence)
    return content.substring(0, match.index) + newAttr + content.substring(match.index + oldAttr.length);
  }
  return null;
}

async function saveAllPending() {
  if (isSaving || pendingChanges.length === 0) return;
  isSaving = true;
  const changes = [...pendingChanges];
  pendingChanges = [];

  try {
    // Group changes by RESOLVED source file (prefer op address, then change filePath)
    const byFile = {};
    for (const change of changes) {
      const fp = change._op?.address?.sourceFile
        || change.sourceAddress?.sourceFile
        || change.filePath
        || getCurrentPreviewPath();
      if (!byFile[fp]) byFile[fp] = [];
      byFile[fp].push(change);
    }

    let anyTailwind = false;
    const partialSearchCache = {
      filesByMain: new Map(),
      contentByPath: new Map(),
    };

    for (const [filePath, fileChanges] of Object.entries(byFile)) {
      try {
        const readResult = await api.get(`/files/content?path=${encodeURIComponent(filePath)}`);
        if (!readResult.ok) { console.error('[VX] Cannot read:', filePath); continue; }

        let content = readResult.data.content;
        let modified = false;
        // Collect ops applied to this file — commit to log/history only after write success
        const pendingOps = [];

        for (const change of fileChanges) {
          // ═══════════════════════════════════════════
          //  VE-013: Try op-based persistence FIRST
          // ═══════════════════════════════════════════
          if (change._op && change._op.type !== OpType.FALLBACK) {
            const result = applyOp(change._op, content);
            if (result.applied) {
              content = result.content;
              modified = true;
              pendingOps.push({ op: change._op, strategy: result.strategy });
              continue; // Success — skip legacy path entirely
            }
            // Op path failed — log the exact reason and try legacy
            console.warn('[VX] applyOp failed:', result.reason, '— falling back to legacy for', change._op.type);
            logOp(change._op, 'fallback', { fallbackReason: result.reason, via: 'applyOp' });
          }

          // ═══════════════════════════════════════════
          //  Legacy fallback path
          // ═══════════════════════════════════════════
          const needle = change.type === 'delete' ? change.outerHTML : change.originalHTML;
          if (!needle) continue;

          // ── Legacy Strategy 1: nodeKey-based replacement ──
          if (change.sourceAddress?.nodeKey && change.type === 'text') {
            const sa = change.sourceAddress;
            const saFile = sa.sourceFile || filePath;
            let saContent = content;
            if (saFile !== filePath) {
              try {
                const saRead = await api.get(`/files/content?path=${encodeURIComponent(saFile)}`);
                if (saRead.ok && saRead.data?.content) saContent = saRead.data.content;
              } catch {}
            }

            const colonIdx = sa.nodeKey.lastIndexOf(':');
            let nodeKeySaved = false;
            if (colonIdx !== -1) {
              const targetIndex = parseInt(sa.nodeKey.substring(colonIdx + 1), 10);
              if (!isNaN(targetIndex)) {
                const sourceElement = extractSourceElementByIndex(saContent, targetIndex);
                if (sourceElement) {
                  const openTag = extractOpeningTag(saContent, saContent.indexOf(sourceElement));
                  if (openTag) {
                    const innerStart = openTag.length;
                    const closeTagStart = sourceElement.lastIndexOf('</');
                    if (closeTagStart > innerStart) {
                      const closeTag = sourceElement.substring(closeTagStart);
                      const newElement = openTag + change.newHTML + closeTag;
                      if (saFile !== filePath) {
                        // Cross-file: immediate write — log at point of completion
                        const newFileContent = saContent.replace(sourceElement, newElement);
                        const saResult = await api.put('/files/content', { path: saFile, content: newFileContent });
                        if (saResult.ok) {
                          showSaveIndicator(`Saved → ${saFile.split('/').pop()}`);
                          if (saResult.data?.tailwindCompiled) anyTailwind = true;
                          nodeKeySaved = true;
                          if (change._op) {
                            logOp(change._op, 'persisted', { strategy: 'nodeKey', via: 'legacy' });
                            pushOp(change._op, saFile);
                          }
                        }
                      } else {
                        // Same-file: defer log/history to after batched write
                        content = content.replace(sourceElement, newElement);
                        modified = true;
                        nodeKeySaved = true;
                        if (change._op) {
                          pendingOps.push({ op: change._op, strategy: 'nodeKey', via: 'legacy' });
                        }
                      }
                    }
                  }
                }
              }
            }

            if (nodeKeySaved) {
              continue;
            }

            console.warn('[VX] Legacy nodeKey extraction failed for', sa.nodeKey, '— trying content match');
            if (change._op) logOp(change._op, 'fallback', { fallbackReason: 'legacy nodeKey extraction failed', nodeKey: sa.nodeKey });
          }

          // ── Legacy Strategy 2: direct substring match ──
          if (content.includes(needle)) {
            content = change.type === 'delete'
              ? content.replace(needle, '')
              : content.replace(needle, change.newHTML);
            modified = true;
            // Same-file: defer log/history to after batched write
            if (change._op) {
              pendingOps.push({ op: change._op, strategy: 'contentMatch', via: 'legacy' });
            }
          } else if (change.type === 'class-change' && change.additions) {
            // ── Legacy Strategy 3: Subset Match for class changes ──
            const runtimeClasses = new Set(originalClassesFromNeedle(needle));
            const subsetResult = applyClassDiffSubset(content, runtimeClasses, change.additions, change.removals);
            if (subsetResult) {
              content = subsetResult;
              modified = true;
              // Same-file: defer log/history to after batched write
              if (change._op) {
                pendingOps.push({ op: change._op, strategy: 'subsetMatch', via: 'legacy' });
              }
            } else {
              // Partial search: does its own immediate write
              const partialResult = await findAndReplaceInPartials(filePath, change, partialSearchCache);
              if (partialResult.status === 'saved') {
                if (change._op) {
                  logOp(change._op, 'persisted', { strategy: 'partialSearch', via: 'legacy', sourceFile: partialResult.path });
                  pushOp(change._op, partialResult.path);
                }
                anyTailwind = true; continue;
              }
              if (partialResult.status === 'write_failed') {
                if (change._op) logOp(change._op, 'failed', { reason: 'partial write failed', file: partialResult.path });
              } else {
                console.warn('[VX] Not found in source:', needle.substring(0, 80));
                if (change._op) logOp(change._op, 'failed', { reason: 'source not found' });
                showSaveIndicator('Save failed — source not found', true);
              }
            }
          } else {
            // ── Legacy Strategy 4: partial file search ──
            // Does its own immediate write — log at point of completion
            const partialResult = await findAndReplaceInPartials(filePath, change, partialSearchCache);
            if (partialResult.status === 'saved') {
              if (change._op) {
                logOp(change._op, 'persisted', { strategy: 'partialSearch', via: 'legacy', sourceFile: partialResult.path });
                pushOp(change._op, partialResult.path);
              }
              anyTailwind = true; continue;
            }
            if (partialResult.status === 'write_failed') {
              if (change._op) logOp(change._op, 'failed', { reason: 'partial write failed', file: partialResult.path });
            } else {
              console.warn('[VX] Not found in source:', needle.substring(0, 80));
              if (change._op) logOp(change._op, 'failed', { reason: 'source not found' });
              showSaveIndicator('Save failed — source not found', true);
            }
          }
        }

        if (modified) {
          const saveResult = await api.put('/files/content', { path: filePath, content });
          if (saveResult.ok) {
            showSaveIndicator(`Saved → ${filePath.split('/').pop()}`);
            if (saveResult.data?.tailwindCompiled) anyTailwind = true;
            // NOW commit op log + history entries — write succeeded
            for (const { op, strategy, via } of pendingOps) {
              logOp(op, 'persisted', { strategy, via: via || 'applyOp' });
              pushOp(op, filePath);
            }
          } else {
            showSaveIndicator('Save failed', true);
            // Write failed — log ops as failed, do NOT push to history
            for (const { op, via } of pendingOps) {
              logOp(op, 'failed', { reason: 'file write failed', via: via || 'applyOp' });
            }
          }
        }
      } catch (err) {
        console.error('[VX] Save error:', err);
        showSaveIndicator('Save failed', true);
      }
    }

    // Reload CSS if Tailwind was recompiled
    if (anyTailwind) {
      setTimeout(() => {
        const iframe = document.getElementById('preview-iframe');
        if (iframe?.contentWindow) iframe.contentWindow.postMessage('voxelsite:reload-css', '*');
      }, 300);
    }
  } finally {
    isSaving = false;
    if (pendingChanges.length > 0) {
      // Drain edits that arrived while the previous save was in flight.
      setTimeout(() => saveAllPending(), 0);
    } else {
      // All saves complete — clear the saving treatment in the preview
      sendToPreview({ type: 'vx-editor:save-feedback' });
    }
  }
}

/**
 * When edited content (e.g. nav, footer) lives in a partial file rather
 * than the main page, scan common partial directories to find the right file.
 *
 * Returns a structured result:
 *   { status: 'saved',        path: '/actual/partial.php' }
 *   { status: 'write_failed', path: '/actual/partial.php' }
 *   { status: 'not_found' }
 */
async function findAndReplaceInPartials(mainFile, change, cacheParam = null) {
  const needle = change.type === 'delete' ? change.outerHTML : change.originalHTML;
  const partialDirs = ['partials', 'includes', 'components', 'layouts', 'sections', 'blocks'];
  const cache = cacheParam || { filesByMain: new Map(), contentByPath: new Map() };

  // Get file list
  try {
    let phpFiles = cache.filesByMain.get(mainFile);
    if (!phpFiles) {
      const listResult = await api.get('/files');
      if (!listResult.ok) return { status: 'not_found' };
      phpFiles = (listResult.data.files || [])
        .filter(f => f.path.endsWith('.php') && f.path !== mainFile)
        .filter(f => partialDirs.some(d => f.path.includes(d + '/')) || f.path.includes('partial') || f.path.includes('header') || f.path.includes('footer') || f.path.includes('nav'));
      cache.filesByMain.set(mainFile, phpFiles);
    }

    for (const file of phpFiles) {
      let fileContent = cache.contentByPath.get(file.path);
      if (fileContent == null) {
        const readResult = await api.get(`/files/content?path=${encodeURIComponent(file.path)}`);
        if (!readResult.ok || !readResult.data.content) continue;
        fileContent = readResult.data.content;
        cache.contentByPath.set(file.path, fileContent);
      }

      if (fileContent.includes(needle)) {
        let newContent = change.type === 'delete'
          ? fileContent.replace(needle, '')
          : fileContent.replace(needle, change.newHTML);

        const saveResult = await api.put('/files/content', { path: file.path, content: newContent });
        if (saveResult.ok) {
          cache.contentByPath.set(file.path, newContent);
          showSaveIndicator(`Saved → ${file.path.split('/').pop()}`);
          return { status: 'saved', path: file.path };
        }
        // Matched but write failed — stop searching, don't pretend it's not found
        showSaveIndicator('Save failed', true);
        return { status: 'write_failed', path: file.path };
      }
    }
  } catch (err) {
    console.error('[VX] Partial search error:', err);
  }
  return { status: 'not_found' };
}

// ═══════════════════════════════════════════
//  Section Reorder — Source-Level Persistence
// ═══════════════════════════════════════════

/**
 * Persist a section move by swapping two section blocks in the PHP source file.
 *
 * The DOM swap already happened in the bridge (instant visual feedback).
 * This function reads the PHP source, finds the section blocks by index,
 * swaps them (including any preceding HTML comments), and writes back.
 *
 * If the sections can't be matched in source (e.g., generated by PHP loops),
 * a toast guides the user to ask the AI instead.
 */
async function persistSectionMove(data) {
  const { filePath, sectionIndex, neighborIndex } = data;
  const file = filePath || getCurrentPreviewPath();

  try {
    const readResult = await api.get(`/files/content?path=${encodeURIComponent(file)}`);
    if (!readResult.ok) {
      showSaveIndicator('Could not read file', true);
      return;
    }

    const source = readResult.data.content;
    const blocks = findSectionBlocks(source);

    if (sectionIndex >= blocks.length || neighborIndex >= blocks.length) {
      showSaveIndicator('Section not found in source. Try asking the AI to move it.', true);
      return;
    }

    const swapped = swapSectionBlocks(source, blocks, sectionIndex, neighborIndex);
    if (!swapped) {
      showSaveIndicator('Could not swap sections in source', true);
      return;
    }

    const saveResult = await api.put('/files/content', { path: file, content: swapped });
    if (saveResult.ok) {
      showSaveIndicator('Section moved');
      if (saveResult.data?.tailwindCompiled) {
        setTimeout(() => {
          const iframe = document.getElementById('preview-iframe');
          if (iframe?.contentWindow) iframe.contentWindow.postMessage('voxelsite:reload-css', '*');
        }, 300);
      }
    } else {
      showSaveIndicator('Save failed', true);
    }
  } catch (err) {
    console.error('[VX] Section move error:', err);
    showSaveIndicator('Section move failed', true);
  }
}

/**
 * Find all top-level <section> blocks in PHP source, including any
 * preceding HTML comment (e.g., <!-- Hero Section -->).
 *
 * Returns an array of { start, end, content } where:
 * - start: character index of the block start (comment or <section)
 * - end: character index after </section>
 * - content: the full block substring
 *
 * Uses depth counting to handle nested <section> tags correctly
 * (rare in VoxelSite output, but defensive coding matters).
 */
function findSectionBlocks(source) {
  const blocks = [];
  const openRe = /<section\b/gi;
  let match;

  while ((match = openRe.exec(source)) !== null) {
    let openPos = match.index;

    // Check for a preceding HTML comment (up to 500 chars before the tag).
    // Comments like <!-- Hero Section --> or <!-- ═══ Features ═══ -->
    // should travel with their section.
    const lookback = source.substring(Math.max(0, openPos - 500), openPos);
    const commentMatch = lookback.match(/(<!--[\s\S]*?-->\s*)$/);
    if (commentMatch) {
      openPos -= commentMatch[0].length;
    }

    // Find the matching </section> with depth tracking
    const closeTag = '</section>';
    let depth = 1;
    let searchPos = match.index + match[0].length;

    while (depth > 0 && searchPos < source.length) {
      const nextOpen = source.indexOf('<section', searchPos);
      const nextClose = source.indexOf(closeTag, searchPos);

      if (nextClose === -1) break; // malformed — stop

      if (nextOpen !== -1 && nextOpen < nextClose) {
        // Check it's actually a tag, not text containing "<section"
        const charAfter = source[nextOpen + 8];
        if (charAfter === ' ' || charAfter === '>' || charAfter === '\n' || charAfter === '\r' || charAfter === '\t' || charAfter === '/') {
          depth++;
        }
        searchPos = nextOpen + 9;
      } else {
        depth--;
        if (depth === 0) {
          const closeEnd = nextClose + closeTag.length;
          blocks.push({
            start: openPos,
            end: closeEnd,
            content: source.substring(openPos, closeEnd),
          });
        }
        searchPos = nextClose + closeTag.length;
      }
    }
  }

  return blocks;
}

/**
 * Swap two section blocks in the source string by index.
 *
 * Strategy: split the source into five parts:
 *   [before A] [block A] [between A and B] [block B] [after B]
 * Then reassemble as:
 *   [before A] [block B] [between A and B] [block A] [after B]
 *
 * This preserves all whitespace and content between/around the sections.
 */
function swapSectionBlocks(source, blocks, indexA, indexB) {
  if (indexA === indexB) return source;

  // Ensure first < second for consistent slicing
  const firstIdx = Math.min(indexA, indexB);
  const secondIdx = Math.max(indexA, indexB);
  const first = blocks[firstIdx];
  const second = blocks[secondIdx];

  if (!first || !second) return null;
  if (first.end > second.start) return null; // overlapping — shouldn't happen

  const before = source.substring(0, first.start);
  const middle = source.substring(first.end, second.start);
  const after = source.substring(second.end);

  return before + second.content + middle + first.content + after;
}

// ═══════════════════════════════════════════
//  UI Helpers
// ═══════════════════════════════════════════

function updateEditorUI() {
  const btn = document.getElementById('btn-visual-editor');
  if (btn) {
    btn.classList.toggle('vx-editor-active', editorActive);
    btn.title = editorActive ? 'Exit visual editor (V)' : 'Enter visual editor (V)';
    btn.setAttribute('aria-pressed', String(editorActive));
  }
  document.body.classList.toggle('vx-editing', editorActive);
}

function showSaveIndicator(message, isError = false) {
  // Use the system toast for consistent UX across the app
  if (typeof window.showToast === 'function') {
    window.showToast(message, isError ? 'error' : 'success', 2000);
    return;
  }
  // Fallback: custom indicator (only if system toast not loaded yet)
  let indicator = document.getElementById('vx-save-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'vx-save-indicator';
    indicator.className = 'vx-save-indicator';
    document.body.appendChild(indicator);
  }
  indicator.textContent = message;
  indicator.classList.toggle('vx-save-error', isError);
  indicator.classList.add('vx-save-visible');
  clearTimeout(showSaveIndicator._timer);
  showSaveIndicator._timer = setTimeout(() => indicator.classList.remove('vx-save-visible'), 2000);
}

function sendToPreview(data) {
  const iframe = document.getElementById('preview-iframe');
  if (iframe?.contentWindow) {
    try { iframe.contentWindow.postMessage(data, '*'); } catch {}
  }
}

function getCurrentPreviewPath() { return window.__vsCurrentPreviewPath || 'index.php'; }
function positionStylePanel(panel) {
  const iframe = document.getElementById('preview-iframe');
  const panelWidth = panel.offsetWidth || 300;
  const panelHeight = panel.offsetHeight || 520;
  const gutter = 32; // stronger right breathing room to avoid scrollbar-cramped feel
  const minTop = 56;

  if (!iframe) {
    panel.style.left = `${Math.max(gutter, window.innerWidth - panelWidth - gutter)}px`;
    panel.style.top = `${Math.min(Math.max(80, minTop), Math.max(minTop, window.innerHeight - panelHeight - gutter))}px`;
    return;
  }

  const ir = iframe.getBoundingClientRect();
  const desiredLeft = ir.right - panelWidth - gutter;
  const minLeft = Math.max(gutter, ir.left + 10);
  const maxLeft = Math.max(gutter, window.innerWidth - panelWidth - gutter);
  const clampedLeft = Math.min(Math.max(desiredLeft, minLeft), maxLeft);
  const desiredTop = Math.max(ir.top + 12, minTop);
  const maxTop = Math.max(minTop, window.innerHeight - panelHeight - gutter);
  const clampedTop = Math.min(desiredTop, maxTop);

  panel.style.left = `${clampedLeft}px`;
  panel.style.top = `${clampedTop}px`;
  panel.style.right = 'auto';
}

/**
 * Position the AI edit panel above the selected element, centered horizontally.
 * Panel bottom sits just above the element top (4px gap).
 * Falls below the element if insufficient room above.
 * anchorRect: DOMRect of the AI button (screen-space coords) — unused for vertical, used for initial horizontal.
 * elementRect: element rect from the bridge (iframe-relative coords) — primary positioning source.
 */
function positionAIPanel(panel, anchorRect, elementRect) {
  const panelWidth = panel.offsetWidth || 380;
  const panelHeight = panel.offsetHeight || 180;
  const gutter = 16;
  const minTop = 56;

  const iframe = document.getElementById('preview-iframe');
  if (!iframe || !elementRect) {
    positionStylePanel(panel);
    return;
  }

  const ir = iframe.getBoundingClientRect();
  const elemTop = ir.top + elementRect.top;
  const elemBottom = ir.top + elementRect.top + elementRect.height;
  const elemCenterX = ir.left + elementRect.left + elementRect.width / 2;

  // Horizontal: center-align with the element (same pattern as toolbar)
  let desiredLeft = elemCenterX - panelWidth / 2;

  // Vertical: panel bottom sits just above the element top (4px gap)
  let desiredTop;
  const aboveTop = elemTop - panelHeight - 4;
  if (aboveTop >= minTop) {
    desiredTop = aboveTop;
  } else {
    // Not enough room above — place below the element
    desiredTop = elemBottom + 8;
  }

  // Clamp within viewport
  const maxLeft = Math.max(gutter, window.innerWidth - panelWidth - gutter);
  const minLeft = gutter;
  const clampedLeft = Math.min(Math.max(desiredLeft, minLeft), maxLeft);
  const maxTop = Math.max(minTop, window.innerHeight - panelHeight - gutter);
  const clampedTop = Math.min(Math.max(desiredTop, minTop), maxTop);

  panel.style.left = `${clampedLeft}px`;
  panel.style.top = `${clampedTop}px`;
  panel.style.right = 'auto';
}
function detectActiveColorProp(classes) {
  const isColorToken = (c, prefix) =>
    new RegExp(`^${prefix}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`).test(c);
  if (classes.some(c => isColorToken(c, 'bg'))) return 'bg';
  if (classes.some(c => isColorToken(c, 'border'))) return 'border';
  if (classes.some(c => isColorToken(c, 'text'))) return 'text';
  return 'text';
}
function escapeAttr(s) { return (s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escapeHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ═══════════════════════════════════════════
//  VE-014: Operation Instrumentation
// ═══════════════════════════════════════════

/**
 * Log an operation event for instrumentation.
 * Events: 'created', 'persisted', 'fallback', 'failed'
 *
 * @param {VxOperation} op     - the operation
 * @param {string}      event  - lifecycle event
 * @param {Object}      [meta] - extra context (fallbackReason, error, etc.)
 */
function logOp(op, event, meta = {}) {
  const entry = {
    opId:       op?.id || 'unknown',
    type:       op?.type || 'unknown',
    event,
    sourceKind: op?.address?.sourceKind || 'unknown',
    sourceFile: op?.address?.sourceFile || op?.filePath || 'unknown',
    timestamp:  Date.now(),
    ...meta,
  };

  _opLog.push(entry);
  if (_opLog.length > OP_LOG_MAX) _opLog.shift();

  // Console output for development visibility
  if (event === 'failed' || event === 'fallback') {
    console.warn(`[VX-OPS] ${event}:`, opLabel(op?.type), entry);
  } else {
    console.debug(`[VX-OPS] ${event}:`, opLabel(op?.type), entry.sourceFile);
  }
}

/**
 * Get the operation log for diagnostics.
 * @returns {Array}
 */
export function getOpLog() { return [..._opLog]; }


// ═══════════════════════════════════════════
//  VE-021 / VE-022: Undo & Redo Handlers
// ═══════════════════════════════════════════

/**
 * Handle an undo action: peek entry, apply inverse op, save, then commit stack move.
 * Two-phase: stack is only modified after successful file write.
 */
async function handleUndo() {
  const entry = peekUndoEntry();
  if (!entry) {
    showSaveIndicator('Nothing to undo');
    return;
  }

  const fp = entry.filePath;
  if (!fp) {
    showSaveIndicator('Undo failed — no file path', true);
    return;
  }

  try {
    const readResult = await api.get(`/files/content?path=${encodeURIComponent(fp)}`);
    if (!readResult.ok) {
      showSaveIndicator('Undo failed — cannot read file', true);
      return;
    }

    const result = applyOp(entry.inverseOp, readResult.data.content);
    if (!result.applied) {
      console.warn('[VX History] Undo applyOp failed:', result.reason);
      showSaveIndicator('Undo failed — source has changed', true);
      return;
    }

    const saveResult = await api.put('/files/content', { path: fp, content: result.content });
    if (!saveResult.ok) {
      showSaveIndicator('Undo failed — save error', true);
      return;
    }

    // File write succeeded — NOW commit the stack move
    commitUndo();
    logOp(entry.inverseOp, 'persisted', { strategy: result.strategy, via: 'undo' });
    showSaveIndicator('Undone');

    // VE-022: Replay in preview — suppress history clear for this controlled reload.
    // Increment by 2: one for iframe load event, one for bridge-ready event.
    _historyReplayInFlight += 2;
    sendToPreview({
      type: 'vx-editor:replay-op',
      op: entry.inverseOp,
    });

    if (saveResult.data?.tailwindCompiled) {
      setTimeout(() => {
        const iframe = document.getElementById('preview-iframe');
        if (iframe?.contentWindow) iframe.contentWindow.postMessage('voxelsite:reload-css', '*');
      }, 300);
    }
  } catch (err) {
    console.error('[VX History] Undo error:', err);
    showSaveIndicator('Undo failed', true);
  }
}

/**
 * Handle a redo action: peek entry, apply forward op, save, then commit stack move.
 * Two-phase: stack is only modified after successful file write.
 */
async function handleRedo() {
  const entry = peekRedoEntry();
  if (!entry) {
    showSaveIndicator('Nothing to redo');
    return;
  }

  const fp = entry.filePath;
  if (!fp) {
    showSaveIndicator('Redo failed — no file path', true);
    return;
  }

  try {
    const readResult = await api.get(`/files/content?path=${encodeURIComponent(fp)}`);
    if (!readResult.ok) {
      showSaveIndicator('Redo failed — cannot read file', true);
      return;
    }

    const result = applyOp(entry.forwardOp, readResult.data.content);
    if (!result.applied) {
      console.warn('[VX History] Redo applyOp failed:', result.reason);
      showSaveIndicator('Redo failed — source has changed', true);
      return;
    }

    const saveResult = await api.put('/files/content', { path: fp, content: result.content });
    if (!saveResult.ok) {
      showSaveIndicator('Redo failed — save error', true);
      return;
    }

    // File write succeeded — NOW commit the stack move
    commitRedo();
    logOp(entry.forwardOp, 'persisted', { strategy: result.strategy, via: 'redo' });
    showSaveIndicator('Redone');

    // VE-022: Replay in preview — suppress history clear for this controlled reload.
    // Increment by 2: one for iframe load event, one for bridge-ready event.
    _historyReplayInFlight += 2;
    sendToPreview({
      type: 'vx-editor:replay-op',
      op: entry.forwardOp,
    });

    if (saveResult.data?.tailwindCompiled) {
      setTimeout(() => {
        const iframe = document.getElementById('preview-iframe');
        if (iframe?.contentWindow) iframe.contentWindow.postMessage('voxelsite:reload-css', '*');
      }, 300);
    }
  } catch (err) {
    console.error('[VX History] Redo error:', err);
    showSaveIndicator('Redo failed', true);
  }
}
