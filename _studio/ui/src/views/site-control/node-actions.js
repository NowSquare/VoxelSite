/**
 * VoxelSite Studio — Site Control: Contextual Action Bar
 *
 * Renders a compact action toolbar below a selected page card.
 * Actions:
 *   Primary: ✎ Rename
 *   Overflow: Open in Editor, Open in Chat, Change URL, Move, Delete
 */

import { escapeHtml } from '../../helpers.js';
import { selectedNodeId, graphModel } from './state.js';

// ═══════════════════════════════════════════
//  Render
// ═══════════════════════════════════════════

/**
 * Returns HTML for the contextual action bar if the given node is selected.
 * Returns empty string otherwise.
 *
 * @param {string} nodeId — the page node ID to check
 * @returns {string} HTML string
 */
export function renderNodeActions(nodeId) {
  if (!selectedNodeId || selectedNodeId !== nodeId) return '';

  // Check if this is the homepage — Delete is not available for homepage
  const node = graphModel?.nodes.get(nodeId);
  const isHomepage = node?.meta?.isHomepage || false;

  const deleteButton = isHomepage
    ? `<button class="vs-sc-action-drop-item vs-sc-action-danger is-disabled" disabled title="The homepage cannot be deleted">Delete</button>`
    : `<button class="vs-sc-action-drop-item vs-sc-action-danger" data-action="delete">Delete</button>`;

  // Move = change parent page and/or sibling position
  const moveButton = isHomepage
    ? `<button class="vs-sc-action-drop-item is-disabled" disabled title="The homepage cannot be moved">Move</button>`
    : `<button class="vs-sc-action-drop-item" data-action="reorder">Move</button>`;

  return `
    <div class="vs-sc-action-bar" data-for-node="${escapeHtml(nodeId)}">
      <button class="vs-sc-action vs-sc-action-primary" data-action="rename" title="Rename this page"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg> Rename</button>
      <div class="vs-sc-action-overflow">
        <button class="vs-sc-action" data-action="overflow" title="More actions">⋯ More</button>
        <div class="vs-sc-action-dropdown">
          <button class="vs-sc-action-drop-item" data-action="open-in-editor">Open in Editor</button>
          <button class="vs-sc-action-drop-item" data-action="open-in-chat">Open in Chat</button>
          <div class="vs-sc-action-drop-divider"></div>
          <button class="vs-sc-action-drop-item" data-action="change-url">Change URL</button>
          ${moveButton}
          ${deleteButton}
        </div>
      </div>
    </div>
  `;
}
