/**
 * VoxelSite Studio — Site Control: Structure Navigation (Left Panel)
 *
 * Unified left-pane that merges the page tree with the entity browser.
 * Renders a single filter input, an expandable page tree, and collapsible
 * sections for partials, routes, tokens, and assets.
 *
 * The hierarchy tree is passed in by the caller (index.js) to keep the
 * import graph as a strict DAG — this module never imports index.js.
 */

import { icons } from '../../icons.js';
import { escapeHtml } from '../../helpers.js';
import {
  graphModel,
  filterText,
  collapsedPages,
  selectedNodeId,
  impactCollapsedSections,
  IMPACT_SECTIONS,
  getStructureHighlight,
} from './state.js';

// ═══════════════════════════════════════════
//  Left Panel — Unified Renderer
// ═══════════════════════════════════════════

/**
 * Render the full left panel content.
 * @param {Array} hierarchyTree — the pre-built page hierarchy tree from state
 */
export function renderLeftPanel(hierarchyTree) {
  return `
    <div class="vs-sc-left-inner">
      <div class="vs-sc-filter">
        <input type="text" id="vs-sc-search" class="vs-input vs-input-sm"
               placeholder="Filter\u2026" autocomplete="off" value="${escapeHtml(filterText)}" />
      </div>
      <div class="vs-sc-left-scroll" id="vs-sc-left-scroll">
        ${renderPageTreeSection(hierarchyTree)}
        ${renderEntitySections()}
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════
//  Pages — Expandable Tree Section
// ═══════════════════════════════════════════

function renderPageTreeSection(hierarchyTree) {
  const isCollapsed = impactCollapsedSections.has('page-tree');

  // Count pages
  let pageCount = 0;
  if (graphModel) {
    for (const [, node] of graphModel.nodes) {
      if (node.type === 'page') pageCount++;
    }
  }

  return `
    <div class="vs-sc-nav-section ${isCollapsed ? 'is-collapsed' : ''}">
      <button class="vs-sc-nav-section-header" data-nav-section="page-tree">
        <span class="vs-sc-nav-section-chevron">${icons.chevronDown}</span>
        <span class="vs-sc-nav-section-label">Pages</span>
        <span class="vs-sc-nav-section-count">${pageCount}</span>
      </button>
      <div class="vs-sc-nav-section-body">
        ${renderTree(hierarchyTree, 0)}
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════
//  Page Tree Renderer
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
      <div class="vs-site-tree-group ${hasChildren && isCollapsed ? 'is-collapsed' : ''}"
           data-tree-group="${escapeHtml(node.id)}">
        <div class="vs-site-tree-item ${isSelected ? 'is-selected' : ''}"
             style="padding-left: ${12 + indent}px"
             data-page-id="${escapeHtml(node.id)}">
          ${hasChildren ? `
            <button class="vs-site-tree-toggle"
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
        ${hasChildren ? `
          <div class="vs-site-tree-children">
            ${renderTree(node.children, depth + 1)}
          </div>
        ` : ''}
      </div>
    `;
  }

  return html;
}

// ═══════════════════════════════════════════
//  Entity Sections (Partials, Routes, Tokens, Assets)
// ═══════════════════════════════════════════

function renderEntitySections() {
  if (!graphModel) return '';

  const filter = filterText.toLowerCase();

  // Group non-page nodes by type
  const groups = new Map();
  // Skip 'page' — handled by the tree section above
  const entitySections = IMPACT_SECTIONS.filter(s => s.key !== 'page');
  for (const section of entitySections) {
    groups.set(section.key, []);
  }
  for (const [, node] of graphModel.nodes) {
    const arr = groups.get(node.type);
    if (arr) arr.push(node);
  }

  let html = '';
  for (const section of entitySections) {
    const nodes = groups.get(section.key) || [];

    // Filter — match against both label and ID
    const filtered = filter
      ? nodes.filter(n => {
          const l = (n.label || '').toLowerCase();
          const i = n.id.toLowerCase();
          return l.includes(filter) || i.includes(filter);
        })
      : nodes;

    // Sort alphabetically
    filtered.sort((a, b) => (a.label || a.id).localeCompare(b.label || b.id));

    const isCollapsed = impactCollapsedSections.has(section.key);
    const countBadge = filter ? `${filtered.length}/${nodes.length}` : `${nodes.length}`;

    html += `
      <div class="vs-sc-nav-section ${isCollapsed ? 'is-collapsed' : ''}">
        <button class="vs-sc-nav-section-header" data-nav-section="${section.key}">
          <span class="vs-sc-nav-section-chevron">${icons.chevronDown}</span>
          <span class="vs-sc-nav-section-label">${section.label}</span>
          <span class="vs-sc-nav-section-count">${countBadge}</span>
        </button>
        <div class="vs-sc-nav-section-body">
          ${filtered.length === 0
            ? `<div class="vs-sc-nav-item-empty">No matches</div>`
            : filtered.map(n => renderEntityItem(n, section)).join('')
          }
        </div>
      </div>
    `;
  }

  return html;
}

/**
 * Choose the best icon for an asset based on its file extension.
 */
function assetIcon(nodeId) {
  const ext = (nodeId.split('.').pop() || '').toLowerCase();
  const map = {
    css:  'paintbrush',
    scss: 'paintbrush',
    less: 'paintbrush',
    js:   'fileCode',
    ts:   'fileCode',
    mjs:  'fileCode',
    json: 'fileJson',
    jpg:  'image',
    jpeg: 'image',
    png:  'image',
    gif:  'image',
    webp: 'image',
    avif: 'image',
    ico:  'image',
    svg:  'penTool',
    mp4:  'film',
    webm: 'film',
    mov:  'film',
    mp3:  'music',
    wav:  'music',
    ogg:  'music',
    woff: 'type',
    woff2:'type',
    ttf:  'type',
    otf:  'type',
    eot:  'type',
    pdf:  'filePdf',
  };
  return map[ext] || 'image';
}

function renderEntityItem(node, section) {
  const isSelected = selectedNodeId === node.id;
  const label = escapeHtml(node.label || node.id);
  const isShared = node.meta?.isShared === true;
  const isHomepage = node.meta?.isHomepage === true;

  let badges = '';
  if (isHomepage) badges += '<span class="vs-impact-badge vs-impact-badge-star">★</span>';
  if (isShared) badges += '<span class="vs-impact-badge vs-impact-badge-shared">shared</span>';

  // Color swatch for color tokens
  let swatch = '';
  if (section.key === 'token' && node.meta?.value) {
    const val = node.meta.value;
    if (/^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/.test(val)) {
      swatch = `<span class="vs-impact-swatch" style="background:${escapeHtml(val)}"></span>`;
    }
  }

  // Pick the right icon per entity type
  let iconKey = section.icon;
  if (section.key === 'asset') {
    iconKey = assetIcon(node.id);
  } else if (section.key === 'partial') {
    iconKey = 'puzzle';
  }

  return `
    <button class="vs-impact-item ${isSelected ? 'is-selected' : ''}" data-node-id="${escapeHtml(node.id)}">
      <span class="vs-impact-item-icon">${icons[iconKey] || icons[section.icon] || ''}</span>
      <span class="vs-impact-item-label">${label}</span>
      ${swatch}
      ${badges}
    </button>
  `;
}

// ═══════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════

/**
 * Check if a node or any of its descendants match the filter text.
 */
export function nodeMatchesFilter(node, filter) {
  if (node.label.toLowerCase().includes(filter) || node.slug.toLowerCase().includes(filter)) {
    return true;
  }
  return node.children.some(child => nodeMatchesFilter(child, filter));
}
