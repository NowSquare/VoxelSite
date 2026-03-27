/**
 * VoxelSite Studio — Site Control: Orchestration Console
 *
 * Bottom panel of the center column — the primary interaction surface
 * for site-wide orchestration. Think VS Code terminal, not search bar.
 *
 * Layout:
 *   ┌──────────────────────────────────┐
 *   │  Step log (scrollable)           │
 *   │  ...                             │
 *   │  ...                             │
 *   ├──────────────────────────────────┤
 *   │  Multi-line composer             │
 *   │  [Enter to run / Shift+Enter]    │
 *   └──────────────────────────────────┘
 *
 * States:
 *   idle      — composer enabled, log may show previous run
 *   running   — composer disabled, log is streaming
 *   plan      — plan ready, waiting for approval
 *   complete  — run finished, log shows results
 */

import { escapeHtml } from '../../helpers.js';
import { icons } from '../../icons.js';

// ═══════════════════════════════════════════
//  Orchestration State
// ═══════════════════════════════════════════

/** @type {'idle' | 'running' | 'plan' | 'plan_failed' | 'applying' | 'applied' | 'apply_failed' | 'complete'} */
export let orchState = 'idle';
export function setOrchState(s) { orchState = s; }

/** @type {string} Current composer value */
export let orchPrompt = '';
export function setOrchPrompt(v) { orchPrompt = v; }

/** @type {Array<{type: string, message: string, time: number}>} */
export let orchLog = [];
export function appendOrchLog(entry) { orchLog.push(entry); }
export function clearOrchLog() { orchLog = []; }

/** @type {object|null} Plan received from backend */
export let orchPlan = null;
export function setOrchPlan(p) { orchPlan = p; }

/** @type {object|null} Final results */
export let orchResult = null;
export function setOrchResult(r) { orchResult = r; }

// ═══════════════════════════════════════════
//  Console Height Persistence
// ═══════════════════════════════════════════

const CONSOLE_HEIGHT_KEY = 'vs-sc-console-height';
const CONSOLE_COLLAPSED_KEY = 'vs-sc-console-collapsed';

export function getSavedConsoleHeight() {
  try {
    const h = sessionStorage.getItem(CONSOLE_HEIGHT_KEY);
    return h ? parseInt(h, 10) : null;
  } catch { return null; }
}

export function saveConsoleHeight(h) {
  try { sessionStorage.setItem(CONSOLE_HEIGHT_KEY, String(h)); }
  catch { /* ignore */ }
}

export function isConsoleCollapsed() {
  try { return sessionStorage.getItem(CONSOLE_COLLAPSED_KEY) === '1'; }
  catch { return false; }
}

export function saveConsoleCollapsed(v) {
  try { sessionStorage.setItem(CONSOLE_COLLAPSED_KEY, v ? '1' : '0'); }
  catch { /* ignore */ }
}

// ═══════════════════════════════════════════
//  Render — Console Shell
// ═══════════════════════════════════════════

/**
 * Render the full orchestration console.
 * @returns {string}
 */
export function renderOrchestrationConsole() {
  const collapsed = isConsoleCollapsed();
  const savedHeight = getSavedConsoleHeight();
  const height = collapsed ? 36 : (savedHeight || 220);

  return `
    <div class="vs-sc-console ${collapsed ? 'is-collapsed' : ''}"
         id="vs-sc-console"
         style="height: ${height}px;">
      <div class="vs-sc-console-resize" id="vs-sc-console-resize">
        <div class="vs-sc-console-resize-grip"></div>
      </div>
      <div class="vs-sc-console-header" id="vs-sc-console-header">
        <button class="vs-sc-console-toggle" id="vs-sc-console-toggle"
                title="${collapsed ? 'Expand console' : 'Collapse console'}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="${collapsed ? '6 9 12 15 18 9' : '18 15 12 9 6 15'}"/>
          </svg>
        </button>
        <span class="vs-sc-console-title">Orchestration</span>
        ${orchState !== 'idle' ? `
          <span class="vs-sc-console-status is-${orchState}">
            ${stateLabel(orchState)}
          </span>
        ` : ''}
        ${orchLog.length > 0 ? `
          <button class="vs-sc-console-clear" id="vs-sc-console-clear" title="Clear log">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        ` : ''}
      </div>
      ${collapsed ? '' : `
        <div class="vs-sc-console-body">
          <div class="vs-sc-console-log" id="vs-sc-console-log">
            ${renderStepLog()}
          </div>
          <div class="vs-sc-console-composer" id="vs-sc-console-composer">
            ${renderComposer()}
          </div>
        </div>
      `}
    </div>
  `;
}

// ═══════════════════════════════════════════
//  Render — Step Log
// ═══════════════════════════════════════════

function renderStepLog() {
  if (orchLog.length === 0) {
    return `
      <div class="vs-sc-console-empty">
        <span class="vs-sc-console-empty-text">
          Describe a change — the orchestrator will plan and execute it across your site.
        </span>
      </div>
    `;
  }

  return orchLog.map(entry => {
    // B8: structured phase events (from apply transcript)
    if (entry.phase) {
      const icon = phaseIcon(entry.phase);
      const cls = phaseClass(entry.status);
      const file = entry.file
        ? `<span class="vs-sc-log-file">${escapeHtml(entry.file)}</span> `
        : '';
      const meta = entry.ms != null
        ? `<span class="vs-sc-log-meta">${entry.ms}ms</span>`
        : entry.bytes != null
          ? `<span class="vs-sc-log-meta">${entry.bytes}b</span>`
          : '';
      return `
        <div class="vs-sc-log-entry vs-sc-log-phase ${cls}">
          <span class="vs-sc-log-icon">${icon}</span>
          <span class="vs-sc-log-phase-name">${entry.phase}</span>
          ${file}<span class="vs-sc-log-text">${escapeHtml(entry.message || '')}</span>
          ${meta}
        </div>
      `;
    }

    // Legacy: orchestrate pipeline entries
    const cls = entryClass(entry.type);
    const icon = entryIcon(entry.type);
    return `
      <div class="vs-sc-log-entry ${cls}">
        <span class="vs-sc-log-icon">${icon}</span>
        <span class="vs-sc-log-text">${escapeHtml(entry.message)}</span>
      </div>
    `;
  }).join('');
}

// ═══════════════════════════════════════════
//  Render — Composer
// ═══════════════════════════════════════════

function renderComposer() {
  const isRunning = orchState === 'running';
  const placeholder = isRunning
    ? 'Orchestrating…'
    : 'Describe a change across your site…';

  return `
    <div class="vs-sc-composer-wrap">
      <textarea
        id="vs-sc-composer-input"
        class="vs-sc-composer-input"
        placeholder="${escapeHtml(placeholder)}"
        autocomplete="off"
        spellcheck="false"
        rows="1"
        ${isRunning ? 'disabled' : ''}
      >${escapeHtml(orchPrompt)}</textarea>
      <div class="vs-sc-composer-actions">
        <span class="vs-sc-composer-hint">
          ${isRunning ? '' : '<kbd>Enter</kbd> to run · <kbd>Shift+Enter</kbd> for newline'}
        </span>
        <button
          id="vs-sc-composer-submit"
          class="vs-sc-composer-submit"
          title="Run"
          ${isRunning || !orchPrompt.trim() ? 'disabled' : ''}
        >
          ${isRunning
            ? `<span class="vs-sc-command-spinner"></span>`
            : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`
          }
        </button>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════

function stateLabel(state) {
  switch (state) {
    case 'running':      return 'Analyzing…';
    case 'plan':         return 'Plan Ready';
    case 'plan_failed':  return 'Plan Failed';
    case 'applying':     return 'Applying…';
    case 'applied':      return 'Applied';
    case 'apply_failed': return 'Apply Failed';
    case 'complete':     return 'Done';
    default:             return '';
  }
}

function entryIcon(type) {
  switch (type) {
    case 'running':  return '●';
    case 'done':     return '✓';
    case 'error':    return '✗';
    case 'skipped':  return '⊘';
    case 'info':     return '→';
    case 'plan':     return '◆';
    default:         return '·';
  }
}

function entryClass(type) {
  switch (type) {
    case 'running':  return 'is-running';
    case 'done':     return 'is-done';
    case 'error':    return 'is-error';
    case 'skipped':  return 'is-skipped';
    case 'plan':     return 'is-plan';
    default:         return '';
  }
}

function phaseIcon(phase) {
  const icons = {
    start: '▶', snapshot: '◎', read: '↓', anchor: '⚓',
    patch: '✎', lint: '⌘', verify: '✔', reject: '⊘',
    rollback: '↺', done: '✓', failed: '✗', abort: '⊘',
  };
  return icons[phase] || '·';
}

function phaseClass(status) {
  const classes = {
    ok: 'is-ok', failed: 'is-failed', error: 'is-failed',
    skip: 'is-skip', refused: 'is-refused',
    start: 'is-info', partial: 'is-warning',
  };
  return classes[status] || '';
}
