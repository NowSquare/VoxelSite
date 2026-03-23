/**
 * VoxelSite Studio — Site Control: Visual Canvas
 *
 * Center-pane tiered diagram renderer.
 * Renders the hierarchical site map with cards grouped by tier level.
 */

import { icons } from '../../icons.js';
import { escapeHtml } from '../../helpers.js';
import {
  graphModel,
  filterText,
  collapsedPages,
  getStructureHighlight,
  getServingRoute,
} from './state.js';
import { nodeMatchesFilter } from './structure-nav.js';

// ═══════════════════════════════════════════
//  Center Pane — Tiered Diagram
// ═══════════════════════════════════════════

export function renderDiagram(tree) {
  if (!tree || tree.length === 0) return '<div class="vs-site-diagram-empty">No pages found</div>';

  const filter = filterText.toLowerCase();

  // Recursively filter nodes and their children at every level
  const filterTree = (nodes) => {
    if (!filter) return nodes;
    const result = [];
    for (const node of nodes) {
      if (nodeMatchesFilter(node, filter)) {
        // Include this node, but also filter its children recursively
        const filteredChildren = filterTree(node.children);
        result.push({ ...node, children: filteredChildren });
      }
    }
    return result;
  };

  /**
   * Collect all descendants at level 3+ beneath a Level 2 page.
   * Flattens level-4+ pages into the L3 row per spec.
   */
  const collectL3Descendants = (node) => {
    const result = [];
    for (const child of node.children) {
      result.push(child);
      // Flatten grandchildren (L4+) into the same L3 row
      if (child.children.length > 0 && !collapsedPages.has(child.id)) {
        result.push(...collectAllDeep(child));
      }
    }
    return result;
  };

  /** Recursively collect all descendants of a node (for L4+ flattening). */
  const collectAllDeep = (node) => {
    const result = [];
    for (const child of node.children) {
      result.push(child);
      if (child.children.length > 0 && !collapsedPages.has(child.id)) {
        result.push(...collectAllDeep(child));
      }
    }
    return result;
  };

  // Separate homepage from siblings
  const filtered = filterTree(tree);
  const homepage = filtered.find(n => n.isHomepage);
  const level1 = filtered.filter(n => !n.isHomepage);

  let html = '<div class="vs-site-tiers">';

  // Level 0: Homepage
  if (homepage) {
    html += `
      <div class="vs-site-tier vs-site-tier-home">
        ${renderCard(homepage)}
      </div>
    `;
  }

  // Level 1: Top-level pages
  if (level1.length > 0) {
    html += `<div class="vs-site-tier vs-site-tier-l1">`;
    for (const node of level1) {
      html += renderCard(node);
    }
    html += `</div>`;
  }

  // Level 2+: Children of Level 1 pages (+ homepage children)
  // Level 4+ pages are flattened into the L3 row beneath their L2 ancestor
  const allL1 = homepage ? [homepage, ...level1] : level1;
  const l2Groups = allL1.filter(n => n.children.length > 0 && !collapsedPages.has(n.id));

  if (l2Groups.length > 0) {
    html += `<div class="vs-site-tier vs-site-tier-l2">`;
    for (const parent of l2Groups) {
      html += `<div class="vs-site-tier-group" data-parent-id="${escapeHtml(parent.id)}">`;
      html += `<div class="vs-site-tier-group-label">${escapeHtml(parent.label)}</div>`;
      html += `<div class="vs-site-tier-group-cards">`;

      // Filter L2 children
      const l2Children = filter
        ? parent.children.filter(c => nodeMatchesFilter(c, filter))
        : parent.children;

      for (const child of l2Children) {
        html += renderCard(child);

        // Level 3+ descendants (flattened from any depth)
        if (child.children.length > 0 && !collapsedPages.has(child.id)) {
          const l3Pages = collectL3Descendants(child);
          const l3Filtered = filter
            ? l3Pages.filter(p => p.label.toLowerCase().includes(filter) || p.slug.toLowerCase().includes(filter))
            : l3Pages;

          if (l3Filtered.length > 0) {
            html += `<div class="vs-site-tier-l3-inline">`;
            for (const descendant of l3Filtered) {
              html += renderCard(descendant);
            }
            html += `</div>`;
          }
        }
      }
      html += `</div></div>`;
    }
    html += `</div>`;
  }

  html += '</div>';
  return html;
}

export function renderCard(node) {
  const isSelected = getStructureHighlight() === node.id;
  const isInferred = node.hierarchySource === 'inferred';

  return `
    <div class="vs-site-card ${node.isHomepage ? 'is-homepage' : ''} ${isSelected ? 'is-selected' : ''} ${isInferred ? 'is-inferred' : ''}"
         data-page-id="${escapeHtml(node.id)}"
         title="${escapeHtml(node.isHomepage ? '/' : '/' + node.slug)}">
      ${node.isHomepage ? '<span class="vs-site-card-star">★</span>' : ''}
      <span class="vs-site-card-label">${escapeHtml(node.label)}</span>
      ${isInferred ? '<span class="vs-site-card-inferred">ⁱ</span>' : ''}
      ${node.childCount > 0 ? `<span class="vs-site-card-children">${node.childCount}</span>` : ''}
    </div>
  `;
}

// ═══════════════════════════════════════════
//  Bottom — Detail Strip
// ═══════════════════════════════════════════

export function renderDetailStrip(pageId) {
  if (!graphModel || !pageId) return '';

  const node = graphModel.nodes.get(pageId);
  if (!node) return '';

  const meta = node.meta || {};

  // Find shared partials affecting this page
  const includesEdges = graphModel.edgesBySource.get(pageId) || [];
  const sharedPartials = includesEdges
    .filter(e => e.type === 'includes')
    .map(e => graphModel.nodes.get(e.target))
    .filter(n => n && n.meta?.isShared)
    .map(n => n.label || n.id.replace('partial:_partials/', ''));

  const level = meta.level || 1;
  const childCount = meta.childCount || 0;
  const source = meta.hierarchySource;
  const navOrder = meta.navOrder;
  const isInNav = navOrder !== undefined && navOrder !== null && navOrder > 0;

  return `
    <div class="vs-site-detail-content">
      <span class="vs-site-detail-icon">${icons.fileText}</span>
      <span class="vs-site-detail-title">${escapeHtml(node.label || node.id)}</span>
      <span class="vs-site-detail-sep">·</span>
      <span class="vs-site-detail-meta">Level ${level}</span>
      ${childCount > 0 ? `
        <span class="vs-site-detail-sep">·</span>
        <span class="vs-site-detail-meta">${childCount} ${childCount === 1 ? 'child' : 'children'}</span>
      ` : ''}
      ${sharedPartials.length > 0 ? `
        <span class="vs-site-detail-sep">·</span>
        <span class="vs-site-detail-meta">Shared: ${escapeHtml(sharedPartials.join(', '))}</span>
      ` : ''}
      ${isInNav ? `
        <span class="vs-site-detail-sep">·</span>
        <span class="vs-site-detail-meta">In nav (order: ${navOrder})</span>
      ` : ''}
      ${source === 'inferred' ? `
        <span class="vs-site-detail-sep">·</span>
        <span class="vs-site-detail-inferred">ⁱ Inferred from URL</span>
      ` : ''}
    </div>
  `;
}
