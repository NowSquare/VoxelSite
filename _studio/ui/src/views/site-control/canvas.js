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
  selectedNodeId,
  getStructureHighlight,
  getServingRoute,
} from './state.js';
import { nodeMatchesFilter } from './structure-nav.js';
import { renderNodeActions } from './node-actions.js';

// ═══════════════════════════════════════════
//  SVG Connector System
// ═══════════════════════════════════════════

/**
 * Compute and insert SVG hierarchy connectors between parent-child cards.
 *
 * Must be called after DOM has rendered (use double-rAF).
 * Reads card positions from the DOM, builds orthogonal elbow paths,
 * and inserts an SVG overlay into the diagram container.
 *
 * @param {Array} tree — the current hierarchy tree
 */
export function computeConnectors(tree) {
  const diagram = document.getElementById('vs-site-diagram');
  if (!diagram || !tree || tree.length === 0) return;

  // Remove existing connector SVG
  const existing = diagram.querySelector('.vs-sc-connectors');
  if (existing) existing.remove();

  // Collect all parent-child edges from the tree,
  // mirroring the visual layout of renderDiagram().
  const edges = [];

  /**
   * Collect explicit tree edges (nodes with children).
   */
  const collectTreeEdges = (nodes) => {
    for (const node of nodes) {
      if (node.children.length > 0 && !collapsedPages.has(node.id)) {
        for (const child of node.children) {
          edges.push({ parentId: node.id, childId: child.id });
        }
        collectTreeEdges(node.children);
      }
    }
  };

  // Apply the same filter as renderDiagram
  const filter = filterText.toLowerCase();
  const filterTree = (nodes) => {
    if (!filter) return nodes;
    const result = [];
    for (const node of nodes) {
      if (nodeMatchesFilter(node, filter)) {
        const filteredChildren = filterTree(node.children);
        result.push({ ...node, children: filteredChildren });
      }
    }
    return result;
  };

  const filtered = filterTree(tree);

  // The diagram places homepage at tier 0, and all other root-level pages
  // at tier 1 (visually below the homepage). We draw connectors from
  // homepage to each L1 sibling to mirror this visual parent-child layout.
  const homepage = filtered.find(n => n.isHomepage);
  const level1 = filtered.filter(n => !n.isHomepage);

  if (homepage) {
    // Homepage → L1 sibling connectors (visual hierarchy)
    for (const l1 of level1) {
      edges.push({ parentId: homepage.id, childId: l1.id });
    }
  }

  // Explicit parent-child edges from the tree data
  collectTreeEdges(filtered);

  if (edges.length === 0) return;

  // Diagram container rect (coordinate origin)
  const diagRect = diagram.getBoundingClientRect();
  const scrollLeft = diagram.scrollLeft;
  const scrollTop = diagram.scrollTop;

  // Build path data for each edge
  const paths = [];
  for (const { parentId, childId } of edges) {
    const parentEl = diagram.querySelector(`.vs-site-card[data-page-id="${CSS.escape(parentId)}"]`);
    const childEl = diagram.querySelector(`.vs-site-card[data-page-id="${CSS.escape(childId)}"]`);
    if (!parentEl || !childEl) continue;

    const pRect = parentEl.getBoundingClientRect();
    const cRect = childEl.getBoundingClientRect();

    // Convert to diagram-relative coordinates (accounting for scroll)
    const px = pRect.left - diagRect.left + scrollLeft + pRect.width / 2;
    const py = pRect.top - diagRect.top + scrollTop + pRect.height;
    const cx = cRect.left - diagRect.left + scrollLeft + cRect.width / 2;
    const cy = cRect.top - diagRect.top + scrollTop;

    // Midpoint Y for the elbow
    const midY = py + (cy - py) / 2;

    // Orthogonal elbow path: down from parent, across, down to child
    const d = `M ${px} ${py} V ${midY} H ${cx} V ${cy}`;

    // Check if this edge involves the selected node
    const isActive = selectedNodeId &&
      (parentId === selectedNodeId || childId === selectedNodeId);

    paths.push({ d, isActive });
  }

  if (paths.length === 0) return;

  // Compute SVG viewBox from scroll dimensions
  const svgWidth = diagram.scrollWidth;
  const svgHeight = diagram.scrollHeight;

  // Build SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'vs-sc-connectors');
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight);
  svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
  svg.setAttribute('aria-hidden', 'true');

  // Hierarchy rails group
  const railsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  railsGroup.setAttribute('class', 'vs-sc-hierarchy-rails');

  // Render inactive paths first, active paths on top.
  // SVG painter's model: later elements render on top.
  // Without this sort, inactive gray paths overdraw
  // shared horizontal rail segments of active orange paths.
  const inactive = paths.filter(p => !p.isActive);
  const active   = paths.filter(p => p.isActive);

  for (const { d } of inactive) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    railsGroup.appendChild(path);
  }
  for (const { d } of active) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.classList.add('active');
    railsGroup.appendChild(path);
  }

  svg.appendChild(railsGroup);

  // Impact overlays group (Phase 2 stub — empty)
  const impactGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  impactGroup.setAttribute('class', 'vs-sc-impact-overlays');
  svg.appendChild(impactGroup);

  diagram.appendChild(svg);
}

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

  /**
   * Render a tier-group container for a parent node's children.
   * Used for any page with children (homepage or L1 pages).
   */
  const renderChildGroup = (parent) => {
    if (parent.children.length === 0 || collapsedPages.has(parent.id)) return '';

    const l2Children = filter
      ? parent.children.filter(c => nodeMatchesFilter(c, filter))
      : parent.children;

    if (l2Children.length === 0) return '';

    let groupHtml = `<div class="vs-site-tier-group" data-parent-id="${escapeHtml(parent.id)}">`;
    groupHtml += `<div class="vs-site-tier-group-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>${escapeHtml(parent.label)}</div>`;
    groupHtml += `<div class="vs-site-tier-group-cards">`;

    for (const child of l2Children) {
      groupHtml += renderCard(child);

      // Level 3+ descendants (flattened from any depth)
      if (child.children.length > 0 && !collapsedPages.has(child.id)) {
        const l3Pages = collectL3Descendants(child);
        const l3Filtered = filter
          ? l3Pages.filter(p => p.label.toLowerCase().includes(filter) || p.slug.toLowerCase().includes(filter))
          : l3Pages;

        if (l3Filtered.length > 0) {
          groupHtml += `<div class="vs-site-tier-l3-inline">`;
          for (const descendant of l3Filtered) {
            groupHtml += renderCard(descendant);
          }
          groupHtml += `</div>`;
        }
      }
    }
    groupHtml += `</div></div>`;
    return groupHtml;
  };

  let html = '<div class="vs-site-tiers">';

  // Level 0: Homepage (always centered, alone in its tier)
  if (homepage) {
    html += `
      <div class="vs-site-tier vs-site-tier-home">
        ${renderCard(homepage)}
      </div>
    `;
  }

  // Level 1+: Each L1 page is a vertical column — card on top, children below.
  // Homepage children also get their own column alongside the L1 pages.
  if (level1.length > 0 || (homepage && homepage.children.length > 0 && !collapsedPages.has(homepage.id))) {
    html += `<div class="vs-site-tier vs-site-tier-l1">`;

    // Homepage children column (if any)
    if (homepage && homepage.children.length > 0 && !collapsedPages.has(homepage.id)) {
      const homepageGroup = renderChildGroup(homepage);
      if (homepageGroup) {
        html += `<div class="vs-site-tier-column">${homepageGroup}</div>`;
      }
    }

    // Each L1 page column: card + optional child group
    for (const node of level1) {
      html += `<div class="vs-site-tier-column">`;
      html += renderCard(node);
      html += renderChildGroup(node);
      html += `</div>`;
    }

    html += `</div>`;
  }

  html += '</div>';
  return html;
}

export function renderCard(node) {
  const isSelected = getStructureHighlight() === node.id;
  const isInferred = node.hierarchySource === 'inferred';

  // Resolve the serving route for this page
  const servingRouteId = getServingRoute(node.id);
  let routeLabel = '';
  if (servingRouteId) {
    const routeNode = graphModel.nodes.get(servingRouteId);
    if (routeNode) {
      const slug = routeNode.label || routeNode.id.replace('route:', '');
      routeLabel = slug;
    }
  } else if (node.isHomepage) {
    routeLabel = '/ · Homepage';
  } else if (node.slug) {
    routeLabel = '/' + node.slug;
  }

  const classes = [
    'vs-site-card',
    node.isHomepage ? 'is-homepage' : '',
    isSelected ? 'is-selected' : '',
    isInferred ? 'is-inferred' : '',
  ].filter(Boolean).join(' ');

  return `
    <div class="${classes}"
         data-page-id="${escapeHtml(node.id)}"
         title="${escapeHtml(routeLabel || node.label)}">
      <div class="vs-site-card-body">
        <div class="vs-site-card-title">
          ${node.isHomepage ? '<span class="vs-site-card-star">★</span>' : ''}
          <span class="vs-site-card-label">${escapeHtml(node.label)}</span>
        </div>
        ${routeLabel ? `<div class="vs-site-card-route">${escapeHtml(routeLabel)}</div>` : ''}
      </div>
      ${node.childCount > 0 ? `<span class="vs-site-card-count">${node.childCount}</span>` : ''}
      ${renderNodeActions(node.id)}
    </div>
  `;
}
