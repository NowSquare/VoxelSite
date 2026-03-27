/**
 * VoxelSite Studio — Site Control: Action Log
 *
 * Renders a step-by-step execution log in the right panel
 * during orchestration. Each SSE event appends a line.
 *
 * Replaces the right panel body temporarily during orchestration.
 */

import { escapeHtml } from '../../helpers.js';
import { orchLog, orchState, orchResult } from './orchestration-console.js';

// ═══════════════════════════════════════════
//  Render
// ═══════════════════════════════════════════

/**
 * Render the action log panel for the right side.
 * Called from control-panel.js when orchState !== 'idle'.
 *
 * @returns {string} HTML
 */
export function renderActionLog() {
  if (orchLog.length === 0 && orchState === 'running') {
    return `
      <div class="vs-sc-orch-log">
        <div class="vs-sc-orch-log-entry is-running">
          <span class="vs-sc-orch-log-icon">●</span>
          <span class="vs-sc-orch-log-text">Starting orchestration…</span>
        </div>
      </div>
    `;
  }

  const entries = orchLog.map(entry => {
    const iconClass = entryIconClass(entry.type);
    const icon = entryIcon(entry.type);
    return `
      <div class="vs-sc-orch-log-entry ${iconClass}">
        <span class="vs-sc-orch-log-icon">${icon}</span>
        <span class="vs-sc-orch-log-text">${escapeHtml(entry.message)}</span>
      </div>
    `;
  }).join('');

  // Results summary (shown after completion)
  let resultHtml = '';
  if (orchState === 'complete' && orchResult) {
    const { filesChanged, summary } = orchResult;
    resultHtml = `
      <div class="vs-sc-orch-result">
        <div class="vs-sc-orch-result-title">
          ${filesChanged || 0} file${filesChanged !== 1 ? 's' : ''} changed
        </div>
        ${summary ? `<div class="vs-sc-orch-result-detail">${escapeHtml(summary)}</div>` : ''}
        <button class="vs-sc-orch-done-btn" id="vs-sc-orch-done">Done</button>
      </div>
    `;
  }

  return `
    <div class="vs-sc-orch-log" id="vs-sc-orch-log">
      ${entries}
    </div>
    ${resultHtml}
  `;
}

// ═══════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════

function entryIcon(type) {
  switch (type) {
    case 'running':  return '●';
    case 'done':     return '✓';
    case 'error':    return '✗';
    case 'skipped':  return '⊘';
    case 'info':     return '→';
    default:         return '·';
  }
}

function entryIconClass(type) {
  switch (type) {
    case 'running':  return 'is-running';
    case 'done':     return 'is-done';
    case 'error':    return 'is-error';
    case 'skipped':  return 'is-skipped';
    default:         return '';
  }
}
