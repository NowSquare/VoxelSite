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

// ═══════════════════════════════════════════
//  State
// ═══════════════════════════════════════════

let editorActive = false;
let selectedElement = null;
let pendingChanges = [];
let isSaving = false;
let visualEditorInitialized = false;

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

export function initVisualEditor() {
  if (visualEditorInitialized) return;
  visualEditorInitialized = true;
  window.addEventListener('message', handlePreviewMessage);

  // Safety net: if the iframe navigates while editing, cancel editing
  const iframe = document.getElementById('preview-iframe');
  if (iframe) {
    iframe.addEventListener('load', () => {
      if (richTextActive) {
        onEditingEnded();
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
      showContextToolbar(e.data);
      break;
    case 'vx-editor:text-changed':
      queueTextChange(e.data);
      break;
    case 'vx-editor:image-changed':
      saveImageChange(e.data);
      break;
    case 'vx-editor:element-deleted':
      queueDeletion(e.data);
      break;
    case 'vx-editor:deselect':
      dismissToolbar();
      dismissRichTextToolbar();
      closeStylePanel();
      selectedElement = null;
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
      if (editorActive) {
        sendToPreview({ type: 'vx-editor:toggle', active: true });
      }
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
let lastBlockTag = 'P';

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
    updateFormattingState();
    return;
  }
  // Update formatting state on the persistent bar
  lastFormatting = data.formatting || {};
  lastBlockTag = data.blockTag || lastBlockTag;
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
    <div class="vx-rt-divider"></div>
    <button class="vx-rt-btn vx-rt-btn-clear" data-cmd="removeFormat" title="Clear formatting">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>
    </button>
    `}
    <div class="vx-rt-divider"></div>
    <button class="vx-rt-btn vx-rt-btn-cancel" data-action="cancel" title="Cancel (Esc)">
      Cancel
    </button>
    <button class="vx-rt-btn vx-rt-btn-save" data-action="save" title="Save (⌘↵)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      Save
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

  // Bind Save / Cancel
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
  const url = prompt('Enter URL:');
  if (url !== null) {
    const trimmed = url.trim();
    if (trimmed) {
      sendToPreview({ type: 'vx-editor:richtext-command', command: 'insertLink', value: trimmed });
    } else {
      sendToPreview({ type: 'vx-editor:richtext-command', command: 'removeLink' });
    }
  }
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

  const { tagName, rect, hasText, hasImage } = data;
  const iframe = document.getElementById('preview-iframe');
  if (!iframe) return;

  const ir = iframe.getBoundingClientRect();
  toolbar.style.left = `${ir.left + rect.left + rect.width / 2}px`;
  toolbar.style.top = `${ir.top + rect.top - 8}px`;
  toolbar.style.transform = 'translate(-50%, -100%)';

  let buttons = '';

  if (hasText) {
    buttons += `<button class="vx-tb-btn" data-action="edit-text" title="Edit text">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
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
  if (toolbar) toolbar.classList.remove('vx-tb-visible');
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
    case 'delete':
      confirmDelete(elementData);
      break;
    case 'ask-ai':
      openAIEditPanel(elementData);
      break;
  }
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

  // Queue class change for save
  pendingChanges.push({
    type: 'class-change',
    filePath: elementData.filePath,
    originalHTML: `class="${originalClassString}"`,
    newHTML: `class="${newClassStr}"`,
    additions,
    removals,
    timestamp: Date.now(),
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
  const preview = (elementData.text || '').substring(0, 80).replace(/\s+/g, ' ').trim();

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
    ${preview ? `<div class="vx-ai-preview">${escapeHtml(preview.length >= 78 ? preview + '…' : preview)}</div>` : ''}
    <div class="vx-ai-body">
      <div class="vx-ai-input-wrap">
        <textarea class="vx-ai-input" id="vx-ai-input" rows="2" placeholder="Describe your changes…" spellcheck="false"></textarea>
        <button class="vx-ai-send" id="vx-ai-send" title="Generate (Enter)">
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

  // Position near the iframe, right side
  positionStylePanel(panel);
  panel.__vxOnResize = () => positionStylePanel(panel);
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
      closeAIEditPanel();
    }
  });

  // Send on Enter (Shift+Enter for newline)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
          sendToPreview({ type: 'vx-editor:update-ai-status', status: message || 'Working…' });
        },
        onFile() {
          sendToPreview({ type: 'vx-editor:update-ai-status', status: 'Applying changes…' });
        },
        onToken() {
          sendToPreview({ type: 'vx-editor:update-ai-status', status: 'Generating…' });
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
  const abortController = new AbortController();

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
      const formatted = tokenCount.toLocaleString();
      sendToPreview({
        type: 'vx-editor:update-ai-status',
        status: `Generating ${sectionType}… (${formatted} tokens)`,
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
        sendToPreview({ type: 'vx-editor:update-ai-status', status: message || `Adding ${sectionType}…` });
      },
      onFile() {
        sendToPreview({ type: 'vx-editor:update-ai-status', status: 'Writing files…' });
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
        sendToPreview({ type: 'vx-editor:hide-ai-overlay' });
        showSaveIndicator(err.message || 'Failed to add section', true);
      },
      onDone(res) {
        clearInterval(statusInterval);
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
    if (err.name !== 'AbortError') {
      showSaveIndicator('Failed to add section', true);
    }
    sendToPreview({ type: 'vx-editor:hide-ai-overlay' });
  }
}

function openImagePicker(elementData) {
  dismissToolbar();
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
    setTimeout(() => modal.remove(), 200);
  };
  const onKeydown = (e) => { if (e.key === 'Escape') close(); };
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
      item.addEventListener('click', () => {
        sendToPreview({ type: 'vx-editor:swap-image', src: item.dataset.path });
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
  const modal = document.createElement('div');
  modal.className = 'vx-modal-overlay';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `<div class="vx-modal vx-modal-sm"><div class="vx-modal-header"><span>Edit Link</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body">
      <div class="vx-form-group"><label class="vx-form-label">URL</label><input type="text" class="vx-form-input" id="vx-link-href" value="${escapeAttr(elementData.href || '')}" placeholder="https://… or /page" spellcheck="false"></div>
      <div class="vx-form-group"><label class="vx-form-label">Text</label><input type="text" class="vx-form-input" id="vx-link-text" value="${escapeAttr(elementData.text || '')}" placeholder="Link text"></div>
    </div>
    <div class="vx-modal-footer"><button class="vx-btn-secondary" data-close>Cancel</button><button class="vx-btn-primary" id="vx-link-save">Save</button></div></div>`;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('vx-modal-visible'));
  const close = () => {
    modal.classList.remove('vx-modal-visible');
    modal.removeEventListener('keydown', onKeydown);
    setTimeout(() => modal.remove(), 200);
  };
  const onKeydown = (e) => { if (e.key === 'Escape') close(); };
  modal.addEventListener('keydown', onKeydown);
  modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  onBackdropClick(modal, close);
  document.getElementById('vx-link-save').addEventListener('click', () => {
    sendToPreview({ type: 'vx-editor:update-link', href: document.getElementById('vx-link-href').value.trim(), text: document.getElementById('vx-link-text').value.trim() });
    close();
  });
  setTimeout(() => document.getElementById('vx-link-href')?.focus(), 100);
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
  const { filePath, oldSrc, newSrc, alt } = data;
  const fp = filePath || getCurrentPreviewPath();

  try {
    const readResult = await api.get(`/files/content?path=${encodeURIComponent(fp)}`);
    if (!readResult.ok) {
      console.warn('[VX] Cannot read file for image save:', fp);
      showSaveIndicator('Save failed', true);
      return;
    }

    let content = readResult.data.content;
    let modified = false;

    // Strategy 1a: Direct src attribute match (works for static <img src="...">)
    const literal = `src="${oldSrc}"`;
    if (content.includes(literal)) {
      content = content.replace(literal, `src="${newSrc}"`);
      modified = true;
    }

    // Strategy 1b: Quoted path value match (handles PHP arrays like 'image' => '/path')
    // Also catches background-image: url('...'), data attributes, etc.
    if (!modified && content.includes(oldSrc)) {
      // Replace the path itself regardless of surrounding context (src=, url(), =>, etc.)
      // Only replace the first occurrence to avoid unintended side effects
      content = content.replace(oldSrc, newSrc);
      modified = true;
    }

    // Strategy 2: Alt-text anchored string match in main file
    // (handles PHP-expression src like src="<?= $dish['image'] ?>")
    if (!modified && alt) {
      const altResult = replaceImgSrcByAlt(content, alt, newSrc);
      if (altResult !== false) {
        content = altResult;
        modified = true;
      }
    }

    // Save main file if modified
    if (modified) {
      const saveResult = await api.put('/files/content', { path: fp, content });
      if (saveResult.ok) {
        showSaveIndicator('Saved');
      } else {
        showSaveIndicator('Save failed', true);
      }
      return;
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

        // Try src attribute literal match
        if (partialContent.includes(literal)) {
          partialContent = partialContent.replace(literal, `src="${newSrc}"`);
          const saveResult = await api.put('/files/content', { path: file.path, content: partialContent });
          if (saveResult.ok) { showSaveIndicator(`Saved → ${file.path.split('/').pop()}`); return; }
        }

        // Try quoted path value match
        if (partialContent.includes(oldSrc)) {
          partialContent = partialContent.replace(oldSrc, newSrc);
          const saveResult = await api.put('/files/content', { path: file.path, content: partialContent });
          if (saveResult.ok) { showSaveIndicator(`Saved → ${file.path.split('/').pop()}`); return; }
        }

        // Try alt-text anchored match
        if (alt) {
          const altResult = replaceImgSrcByAlt(partialContent, alt, newSrc);
          if (altResult !== false) {
            const saveResult = await api.put('/files/content', { path: file.path, content: altResult });
            if (saveResult.ok) { showSaveIndicator(`Saved → ${file.path.split('/').pop()}`); return; }
          }
        }
      }
    }

    console.warn('[VX] Image src not found in any source file. oldSrc:', oldSrc, 'alt:', alt);
    showSaveIndicator('Save failed — source not found', true);
  } catch (err) {
    console.error('[VX] Image save error:', err);
    showSaveIndicator('Save failed', true);
  }
}

/**
 * Find an <img> tag by its alt text and replace its src attribute.
 * Uses pure string operations (no regex) to avoid catastrophic backtracking
 * when PHP tags (<?= ... ?>) are present inside img attributes.
 * Returns the modified content string, or false if no match found.
 */
function replaceImgSrcByAlt(content, alt, newSrc) {
  // Split by <img to isolate each img tag
  const parts = content.split('<img');
  for (let i = 1; i < parts.length; i++) {
    const fragment = parts[i];
    // Check if this <img fragment contains the alt text
    if (!fragment.includes(`alt="${alt}"`) && !fragment.includes(`alt='${alt}'`)) continue;

    // Find src= using indexOf (no regex)
    const srcIdx = fragment.indexOf('src=');
    if (srcIdx === -1) continue;

    const quoteChar = fragment[srcIdx + 4]; // the " or ' after src=
    if (quoteChar !== '"' && quoteChar !== "'") continue;

    const valueStart = srcIdx + 5; // just after the opening quote
    const valueEnd = fragment.indexOf(quoteChar, valueStart);
    if (valueEnd === -1) continue;

    // Replace the src value
    parts[i] = fragment.substring(0, valueStart) + newSrc + fragment.substring(valueEnd);
    return parts.join('<img');
  }
  return false;
}

function queueTextChange(data) {
  pendingChanges.push({ type: 'text', filePath: data.filePath, originalHTML: data.originalHTML, newHTML: data.newHTML, timestamp: Date.now() });
  clearTimeout(queueTextChange._timer);
  queueTextChange._timer = setTimeout(() => saveAllPending(), 800);
}

function queueDeletion(data) {
  pendingChanges.push({ type: 'delete', filePath: data.filePath, outerHTML: data.outerHTML, timestamp: Date.now() });
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
    // Group changes by file
    const byFile = {};
    for (const change of changes) {
      const fp = change.filePath || getCurrentPreviewPath();
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

        for (const change of fileChanges) {
          const needle = change.type === 'delete' ? change.outerHTML : change.originalHTML;
          if (!needle) continue;

          if (content.includes(needle)) {
            content = change.type === 'delete'
              ? content.replace(needle, '')
              : content.replace(needle, change.newHTML);
            modified = true;
          } else if (change.type === 'class-change' && change.additions) {
            // ── Subset Match ──
            // Runtime JS may add classes (is-visible, active, open) not in the source.
            // Find a class attribute whose source classes are a subset of the runtime classes,
            // then apply only our additions/removals to the source-level classes.
            const runtimeClasses = new Set(originalClassesFromNeedle(needle));
            const subsetResult = applyClassDiffSubset(content, runtimeClasses, change.additions, change.removals);
            if (subsetResult) {
              content = subsetResult;
              modified = true;
            } else {
              // Not found in main file — try partials
              const found = await findAndReplaceInPartials(filePath, change, partialSearchCache);
              if (found) { anyTailwind = true; continue; }
              console.warn('[VX] Not found in source:', needle.substring(0, 80));
            }
          } else {
            // Not found in main file — try partials
            const found = await findAndReplaceInPartials(filePath, change, partialSearchCache);
            if (found) { anyTailwind = true; continue; }
            console.warn('[VX] Not found in source:', needle.substring(0, 80));
          }
        }

        if (modified) {
          const saveResult = await api.put('/files/content', { path: filePath, content });
          if (saveResult.ok) {
            showSaveIndicator('Saved');
            if (saveResult.data?.tailwindCompiled) anyTailwind = true;
          } else {
            showSaveIndicator('Save failed', true);
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
    }
  }
}

/**
 * When edited content (e.g. nav, footer) lives in a partial file rather
 * than the main page, scan common partial directories to find the right file.
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
      if (!listResult.ok) return false;
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
          return true;
        }
      }
    }
  } catch (err) {
    console.error('[VX] Partial search error:', err);
  }
  return false;
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
    btn.title = editorActive ? 'Exit visual editor (V)' : 'Visual editor (V)';
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
