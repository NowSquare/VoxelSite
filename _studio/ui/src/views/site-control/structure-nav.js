/**
 * VoxelSite Studio — Site Control: Structure Navigation
 *
 * Left-pane tree renderer for the page hierarchy.
 * Renders the expandable/collapsible page tree with filter support.
 */

import { icons } from '../../icons.js';
import { escapeHtml } from '../../helpers.js';
import {
  filterText,
  collapsedPages,
  getStructureHighlight,
} from './state.js';

// ═══════════════════════════════════════════
//  Left Pane — Site Tree
// ═══════════════════════════════════════════

export function renderTree(nodes, depth) {
  if (!nodes || nodes.length === 0) return '';

  const filter = filterText.toLowerCase();
  let html = '';

  // Cap visual depth at 2 (0-indexed), corresponding to display level 3
  const MAX_DEPTH = 2;

  for (const node of nodes) {
    // Filter check: match this node or any descendant
    if (filter && !nodeMatchesFilter(node, filter)) continue;

    const isSelected = getStructureHighlight() === node.id;
    const isCollapsed = collapsedPages.has(node.id);
    const hasChildren = node.children.length > 0;
    const cappedDepth = Math.min(depth, MAX_DEPTH);
    const isOverDepth = depth > MAX_DEPTH;
    const indent = cappedDepth * 20;

    html += `
      <div class="vs-site-tree-item ${isSelected ? 'is-selected' : ''}"
           style="padding-left: ${12 + indent}px"
           data-page-id="${escapeHtml(node.id)}">
        ${hasChildren ? `
          <button class="vs-site-tree-toggle ${isCollapsed ? 'is-collapsed' : ''}"
                  data-toggle-page="${escapeHtml(node.id)}">
            ${icons.chevronDown}
          </button>
        ` : `<span class="vs-site-tree-toggle-spacer"></span>`}
        ${node.isHomepage ? `<span class="vs-site-tree-star">★</span>` : ''}
        <span class="vs-site-tree-label">${escapeHtml(node.label)}</span>
        ${node.hierarchySource === 'inferred' ? `<span class="vs-site-tree-inferred" title="Inferred from URL structure — not explicitly authored">ⁱ</span>` : ''}
        ${isOverDepth ? `<span class="vs-site-tree-overdepth" title="Deeper than 3 levels, shown at Level 3">⁺</span>` : ''}
        ${hasChildren ? `<span class="vs-site-tree-badge">${node.childCount}</span>` : ''}
      </div>
    `;

    // Render children if not collapsed
    if (hasChildren && !isCollapsed) {
      html += renderTree(node.children, depth + 1);
    }
  }

  return html;
}

/**
 * Check if a node or any of its descendants match the filter text.
 */
export function nodeMatchesFilter(node, filter) {
  if (node.label.toLowerCase().includes(filter) || node.slug.toLowerCase().includes(filter)) {
    return true;
  }
  return node.children.some(child => nodeMatchesFilter(child, filter));
}
