/**
 * VoxelSite Studio — Site Control: Control Panel
 *
 * Right-side panel rendering: Impact tab layout, entity detail,
 * relationship cards, blast radius, and SC-020 URL proposal.
 *
 * Refresh strategy:
 * - enterProposalMode() and exitProposalMode() only mutate state.
 *   The caller in index.js is responsible for calling refreshView().
 * - prefetchBlastRadius() is async fire-and-forget. It accepts a
 *   refreshCallback so index.js can inject its refreshView function
 *   without creating a reverse import edge.
 */

import { api } from '../../../api.js';
import { icons } from '../../icons.js';
import { escapeHtml } from '../../helpers.js';
import {
  graphModel,
  selectedNodeId,
  impactFilterText,
  impactCollapsedSections,
  blastRadiusCache,
  blastRadiusLoadingFor,
  proposalRouteId,
  proposalOriginNodeId,
  proposalInputValue,
  proposalJustEntered,
  IMPACT_SECTIONS,
  getSavedSidebarWidth,
  getServingRoute,
  nodeLabel,
  nodeType,
  setProposalRouteId,
  setProposalOriginNodeId,
  setProposalInputValue,
  setProposalJustEntered,
} from './state.js';

// ═══════════════════════════════════════════
//  Impact Tab Content
// ═══════════════════════════════════════════

export function renderImpact() {
  return `
    <div class="vs-impact-layout">
      <div class="vs-impact-browser" id="vs-impact-browser"${getSavedSidebarWidth('impact')}>
        <div class="vs-impact-filter">
          <input type="text" id="vs-impact-search" class="vs-input vs-input-sm"
                 placeholder="Filter nodes\u2026" autocomplete="off" value="${escapeHtml(impactFilterText)}" />
        </div>
        <div class="vs-impact-sections" id="vs-impact-sections">
          ${renderImpactSections()}
        </div>
        <div class="vs-editor-resize" data-resize-panel="vs-impact-browser"></div>
      </div>
      <div class="vs-impact-detail" id="vs-impact-detail">
        ${selectedNodeId ? renderImpactDetail() : renderImpactEmpty()}
      </div>
    </div>
  `;
}

export function renderImpactEmpty() {
  return `
    <div class="vs-impact-empty">
      <p>Select a node to see its relationships</p>
      <p class="vs-impact-empty-hint">Browse pages, partials, tokens, routes, and assets to inspect their relationships and blast radius.</p>
    </div>
  `;
}

export function renderImpactSections() {
  if (!graphModel) return '';

  const filter = impactFilterText.toLowerCase();

  // Group nodes by type
  const groups = new Map();
  for (const section of IMPACT_SECTIONS) {
    groups.set(section.key, []);
  }
  for (const [, node] of graphModel.nodes) {
    const arr = groups.get(node.type);
    if (arr) arr.push(node);
  }

  let html = '';
  for (const section of IMPACT_SECTIONS) {
    const nodes = groups.get(section.key) || [];

    // Filter — match against both label and ID
    const filtered = filter
      ? nodes.filter(n => {
          const l = (n.label || '').toLowerCase();
          const i = n.id.toLowerCase();
          return l.includes(filter) || i.includes(filter);
        })
      : nodes;

    // Sort: pages get homepage-first + navOrder; everything else alpha
    if (section.key === 'page') {
      filtered.sort((a, b) => {
        const aHome = a.meta?.isHomepage ? 1 : 0;
        const bHome = b.meta?.isHomepage ? 1 : 0;
        if (aHome !== bHome) return bHome - aHome;
        const aNav = a.meta?.navOrder ?? 999;
        const bNav = b.meta?.navOrder ?? 999;
        if (aNav !== bNav) return aNav - bNav;
        return (a.label || a.id).localeCompare(b.label || b.id);
      });
    } else {
      filtered.sort((a, b) => (a.label || a.id).localeCompare(b.label || b.id));
    }

    const isCollapsed = impactCollapsedSections.has(section.key);
    const countBadge = filter ? `${filtered.length}/${nodes.length}` : `${nodes.length}`;

    html += `
      <div class="vs-impact-section ${isCollapsed ? 'is-collapsed' : ''}">
        <button class="vs-impact-section-header" data-impact-section="${section.key}">
          <span class="vs-impact-section-chevron">${icons.chevronDown}</span>
          <span class="vs-impact-section-label">${section.label}</span>
          <span class="vs-impact-section-count">${countBadge}</span>
        </button>
        ${!isCollapsed ? `
          <div class="vs-impact-section-items">
            ${filtered.length === 0
              ? `<div class="vs-impact-item-empty">No matches</div>`
              : filtered.map(n => renderImpactItem(n, section)).join('')
            }
          </div>
        ` : ''}
      </div>
    `;
  }

  return html;
}

export function renderImpactItem(node, section) {
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
    // Show swatch if value looks like a CSS color (hex, rgb, hsl)
    if (/^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/.test(val)) {
      swatch = `<span class="vs-impact-swatch" style="background:${escapeHtml(val)}"></span>`;
    }
  }

  return `
    <button class="vs-impact-item ${isSelected ? 'is-selected' : ''}" data-node-id="${escapeHtml(node.id)}">
      <span class="vs-impact-item-icon">${icons[section.icon] || ''}</span>
      <span class="vs-impact-item-label">${label}</span>
      ${swatch}
      ${badges}
    </button>
  `;
}

// ═══════════════════════════════════════════
//  Impact Detail Panel
// ═══════════════════════════════════════════

export function renderImpactDetail() {
  // Branch to proposal panel if in proposal mode
  if (proposalRouteId) return renderProposalPanel();

  const node = graphModel?.nodes.get(selectedNodeId);
  if (!node) return renderImpactEmpty();

  const typeLabel = node.type.charAt(0).toUpperCase() + node.type.slice(1);

  // Header badges: shared partial, global blast radius
  let headerBadges = '';
  if (node.meta?.isShared) {
    headerBadges += '<span class="vs-impact-header-badge vs-impact-header-shared">Shared</span>';
  }
  const brData = blastRadiusCache.get(node.id);
  if (brData?.is_global) {
    headerBadges += '<span class="vs-impact-header-badge vs-impact-header-global">Global</span>';
  }

  // "Change URL" button for routes and pages with a serving route
  let changeUrlBtn = '';
  if (node.type === 'route') {
    changeUrlBtn = '<button class="vs-proposal-trigger" data-action="change-url">Change URL</button>';
  } else if (node.type === 'page' && getServingRoute(node.id)) {
    changeUrlBtn = '<button class="vs-proposal-trigger" data-action="change-url">Change URL</button>';
  }

  return `
    <div class="vs-impact-detail-content">
      <div class="vs-impact-detail-header">
        <div class="vs-impact-detail-badges">
          <span class="vs-impact-type-badge vs-impact-type-${node.type}">${typeLabel}</span>
          ${headerBadges}
        </div>
        <h3 class="vs-impact-detail-title">${escapeHtml(node.label || node.id)}</h3>
        <p class="vs-impact-detail-subtitle">${escapeHtml(node.id)}</p>
        ${changeUrlBtn}
      </div>
      ${renderRelationshipCards(node)}
      ${renderBlastRadiusCard(node.id)}
    </div>
  `;
}

// ═══════════════════════════════════════════
//  URL Migration Proposal (SC-020)
// ═══════════════════════════════════════════

/**
 * Enter proposal mode for a route URL change.
 * If nodeId is a page, resolves to its serving route.
 *
 * Caller-driven: only mutates state. Caller must call refreshView().
 *
 * @param {string} nodeId
 * @param {function} refreshCallback — injected refreshView from index.js
 */
export function enterProposalMode(nodeId, refreshCallback) {
  const node = graphModel?.nodes.get(nodeId);
  if (!node) return;

  // Resolve to serving route if node is a page
  let routeId = nodeId;
  if (node.type === 'page') {
    routeId = getServingRoute(nodeId);
    if (!routeId) return;
  }
  if (node.type !== 'page' && node.type !== 'route') return;

  setProposalRouteId(routeId);
  setProposalOriginNodeId(nodeId);
  setProposalInputValue('');
  setProposalJustEntered(true);

  // Lazy-fetch blast radius for partial sources
  const inbound = graphModel.edgesByTarget.get(routeId) || [];
  for (const e of inbound) {
    if (e.type === 'links_to') {
      const srcNode = graphModel.nodes.get(e.source);
      if (srcNode?.type === 'partial' && !blastRadiusCache.has(e.source)) {
        prefetchBlastRadius(e.source, refreshCallback);
      }
    }
  }
}

/**
 * Exit proposal mode and return to normal Impact detail.
 *
 * Caller-driven: only mutates state. Caller must call refreshView().
 */
export function exitProposalMode() {
  setProposalRouteId(null);
  setProposalOriginNodeId(null);
  setProposalInputValue('');
}

/**
 * Prefetch blast radius for a node without using the single-flight guard.
 * Used by proposal mode to concurrently fetch multiple partial blast radii.
 * Each request writes to its own cache key, so concurrent calls don't race.
 *
 * @param {string} nodeId
 * @param {function} refreshCallback — injected refreshView from index.js
 */
async function prefetchBlastRadius(nodeId, refreshCallback) {
  if (blastRadiusCache.has(nodeId)) return;
  const { ok, data } = await api.get(
    '/site-graph/blast-radius?node=' + encodeURIComponent(nodeId)
  );
  if (ok && data && !blastRadiusCache.has(nodeId)) {
    blastRadiusCache.set(nodeId, data);
    if (refreshCallback) refreshCallback();
  }
}

/**
 * Render the proposal panel — full layout with header, input, validation, and body.
 */
function renderProposalPanel() {
  const routeNode = graphModel?.nodes.get(proposalRouteId);
  if (!routeNode) {
    exitProposalMode();
    return selectedNodeId ? renderImpactDetail() : renderImpactEmpty();
  }

  const currentPath = routeNode.label || routeNode.id;

  // Provenance: "Serving route for X" when entered from a page
  let provenance = '';
  if (proposalOriginNodeId && proposalOriginNodeId !== proposalRouteId) {
    const originNode = graphModel.nodes.get(proposalOriginNodeId);
    if (originNode) {
      provenance = `<p class="vs-proposal-provenance">Serving route for <strong>${escapeHtml(originNode.label || originNode.id)}</strong></p>`;
    }
  }

  // Validate current input
  const validation = validateProposalUrl(proposalInputValue, currentPath);

  return `
    <div class="vs-proposal-panel">
      <div class="vs-proposal-header">
        <div class="vs-proposal-header-top">
          <span class="vs-impact-type-badge vs-impact-type-route">Route</span>
          <h3 class="vs-proposal-title">${escapeHtml(currentPath)}</h3>
          <button class="vs-proposal-close" data-action="close-proposal" title="Close">${icons.x}</button>
        </div>
        ${provenance}
      </div>
      <div class="vs-proposal-input-area">
        <label class="vs-proposal-label" for="vs-proposal-url">New URL path</label>
        <input type="text" id="vs-proposal-url" class="vs-input vs-input-sm vs-proposal-url"
               placeholder="/new-path" autocomplete="off" spellcheck="false"
               value="${escapeHtml(proposalInputValue)}" />
        ${validation.message ? `
          <div class="vs-proposal-validation ${validation.valid ? 'is-valid' : 'is-invalid'}">
            ${validation.message}
          </div>
        ` : ''}
      </div>
      <div class="vs-proposal-body">
        ${renderProposalBody(currentPath, validation)}
      </div>
    </div>
  `;
}

/**
 * Validate a proposed URL path.
 */
function validateProposalUrl(input, currentPath) {
  if (!input || !input.trim()) {
    return { valid: false, cleanPath: '', message: '' };
  }

  let path = input.trim();

  // Must start with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  // Remove trailing slash (unless it's just /)
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // No double slashes
  if (/\/\//.test(path)) {
    return { valid: false, cleanPath: path, message: 'Path cannot contain double slashes' };
  }

  // Only valid URL characters
  if (!/^\/[a-zA-Z0-9\-_\/]*$/.test(path)) {
    return { valid: false, cleanPath: path, message: 'Path can only contain letters, numbers, hyphens, and underscores' };
  }

  // Can't be same as current
  const currentClean = currentPath.replace(/\/$/, '') || '/';
  if (path === currentClean) {
    return { valid: false, cleanPath: path, message: 'New path is the same as the current path' };
  }

  // Check for conflicts with existing routes
  if (graphModel) {
    for (const [, node] of graphModel.nodes) {
      if (node.type === 'route' && node.id !== proposalRouteId) {
        const existingPath = (node.label || node.id).replace(/\/$/, '') || '/';
        if (path === existingPath) {
          return { valid: false, cleanPath: path, message: `Path conflicts with existing route: ${existingPath}` };
        }
      }
    }
  }

  return { valid: true, cleanPath: path, message: `✓ ${path}` };
}

/**
 * Render the proposal body — list of affected references grouped by source file.
 */
function renderProposalBody(currentPath, validation) {
  const routeNode = graphModel?.nodes.get(proposalRouteId);
  if (!routeNode) return '';

  // Collect inbound links to this route
  const inbound = graphModel.edgesByTarget.get(proposalRouteId) || [];
  const linksTo = inbound.filter(e => e.type === 'links_to');

  if (linksTo.length === 0) {
    return `<div class="vs-proposal-empty">No references found to this route. The URL can be changed without affecting any links.</div>`;
  }

  return `
    ${renderProposalSummary(linksTo)}
    ${renderProposalGroups(linksTo, validation)}
  `;
}

/**
 * Render the proposal summary — total reference count.
 */
function renderProposalSummary(inbound) {
  const count = inbound.length;

  // Group by source
  const sourceMap = new Map();
  for (const edge of inbound) {
    if (!sourceMap.has(edge.source)) sourceMap.set(edge.source, []);
    sourceMap.get(edge.source).push(edge);
  }
  const fileCount = sourceMap.size;

  return `
    <div class="vs-proposal-summary">
      <span class="vs-proposal-summary-count">${count} reference${count !== 1 ? 's' : ''}</span>
      <span class="vs-proposal-summary-sep">across</span>
      <span class="vs-proposal-summary-count">${fileCount} file${fileCount !== 1 ? 's' : ''}</span>
    </div>
  `;
}

/**
 * Render grouped reference rows.
 */
function renderProposalGroups(inbound, validation) {
  // Group edges by source
  const sourceMap = new Map();
  for (const edge of inbound) {
    if (!sourceMap.has(edge.source)) sourceMap.set(edge.source, []);
    sourceMap.get(edge.source).push(edge);
  }

  let html = '<div class="vs-proposal-groups">';
  for (const [sourceId, edges] of sourceMap) {
    html += renderProposalGroup(sourceId, edges, validation);
  }
  html += '</div>';
  return html;
}

/**
 * Render a single source file group with its reference rows.
 */
function renderProposalGroup(sourceId, edges, validation) {
  const srcNode = graphModel.nodes.get(sourceId);
  if (!srcNode) return '';

  const typeLabel = srcNode.type.charAt(0).toUpperCase() + srcNode.type.slice(1);
  const refCount = edges.length;

  // Partial secondary line
  let meta = '';
  if (srcNode.type === 'partial') {
    const includeCount = srcNode.meta?.includeCount ?? 0;
    meta = `Used by ${includeCount} file${includeCount !== 1 ? 's' : ''}`;

    const brData = blastRadiusCache.get(sourceId);
    if (brData) {
      meta += ` \u00B7 Affects ${brData.affected_count} page${brData.affected_count !== 1 ? 's' : ''}`;
    }
  }

  // Sort edges by line number
  const sorted = [...edges].sort((a, b) => (a.meta?.lineNumber || 0) - (b.meta?.lineNumber || 0));

  return `<div class="vs-proposal-group">
    <div class="vs-proposal-group-header">
      <span class="vs-impact-type-badge vs-impact-type-${srcNode.type}">${typeLabel}</span>
      <span class="vs-proposal-group-label" data-navigate-node="${escapeHtml(sourceId)}">${escapeHtml(srcNode.label || srcNode.id)}</span>
      <span class="vs-proposal-group-count">${refCount} ref${refCount !== 1 ? 's' : ''}</span>
    </div>
    ${meta ? `<div class="vs-proposal-group-meta">${meta}</div>` : ''}
    <div class="vs-proposal-group-refs">
      ${sorted.map(e => renderProposalRef(e, validation)).join('')}
    </div>
  </div>`;
}

/**
 * Render a single reference row with line number, href, context, and proposed replacement.
 */
function renderProposalRef(edge, validation) {
  const lineNum = edge.meta?.lineNumber ? `L${edge.meta.lineNumber}` : '';
  const href = edge.meta?.href || '';
  const context = edge.meta?.context || 'body';

  // Compute proposed replacement — preserve query/fragment suffix
  let arrow = '';
  if (validation.valid) {
    // Preserve trailing-slash style from original href
    const hrefPathOnly = href.replace(/[?#].*/, '');
    const hadTrailingSlash = hrefPathOnly !== '/' && hrefPathOnly.endsWith('/');
    const suffixMatch = href.match(/[?#].*/);
    const suffix = suffixMatch ? suffixMatch[0] : '';
    let proposed = validation.cleanPath;
    if (hadTrailingSlash && !proposed.endsWith('/')) proposed += '/';
    proposed += suffix;
    arrow = `<span class="vs-proposal-ref-arrow">\u2192 ${escapeHtml(proposed)}</span>`;
  }

  return `<div class="vs-proposal-ref">
    <span class="vs-proposal-ref-line">${lineNum}</span>
    <span class="vs-proposal-ref-href">${escapeHtml(href)}</span>
    <span class="vs-proposal-ref-context">${context}</span>
    ${arrow}
  </div>`;
}

// ═══════════════════════════════════════════
//  Relationship Cards
// ═══════════════════════════════════════════

export function renderRelationshipCards(node) {
  const outbound = graphModel.edgesBySource.get(node.id) || [];
  const inbound = graphModel.edgesByTarget.get(node.id) || [];

  let cards = '';

  switch (node.type) {
    case 'page': {
      // ── Direct Includes ──
      const directIncludes = outbound.filter(e => e.type === 'includes');
      if (directIncludes.length > 0) {
        cards += renderRelationCard('Direct Includes', directIncludes.map(e => ({
          nodeId: e.target,
          label: nodeLabel(e.target),
          type: nodeType(e.target),
        })));
      }

      // ── Transitive Includes (2-hop max) ──
      const transitiveItems = [];
      for (const directEdge of directIncludes) {
        const secondHop = graphModel.edgesBySource.get(directEdge.target) || [];
        for (const e2 of secondHop) {
          if (e2.type === 'includes') {
            transitiveItems.push({
              nodeId: e2.target,
              label: nodeLabel(e2.target),
              type: nodeType(e2.target),
              via: nodeLabel(directEdge.target),
            });
          }
        }
      }
      if (transitiveItems.length > 0) {
        cards += renderRelationCard('Transitive Includes', transitiveItems);
      }

      // ── Links To ──
      const linksTo = outbound.filter(e => e.type === 'links_to');
      if (linksTo.length > 0) {
        cards += renderRelationCard('Links To', linksTo.map(e => ({
          nodeId: e.target,
          label: nodeLabel(e.target),
          type: nodeType(e.target),
          meta: e.meta?.href ? `→ ${e.meta.href}` : null,
          context: e.meta?.context || null,
        })));
      }

      // ── Linked From (via route indirection) ──
      const routeId = getServingRoute(node.id);
      if (routeId) {
        const routeInbound = graphModel.edgesByTarget.get(routeId) || [];
        const linkedFrom = routeInbound.filter(e => e.type === 'links_to');
        if (linkedFrom.length > 0) {
          cards += renderRelationCard('Linked From', linkedFrom.map(e => ({
            nodeId: e.source,
            label: nodeLabel(e.source),
            type: nodeType(e.source),
            meta: e.meta?.href ? `→ ${e.meta.href}` : null,
            context: e.meta?.context || null,
          })));
        }
      }
      break;
    }

    case 'partial': {
      // ── Included By ──
      const includedBy = inbound.filter(e => e.type === 'includes');
      if (includedBy.length > 0) {
        cards += renderRelationCard('Included By', includedBy.map(e => ({
          nodeId: e.source,
          label: nodeLabel(e.source),
          type: nodeType(e.source),
        })));
      }

      // ── Transitively Includes ──
      const transIncludes = outbound.filter(e => e.type === 'includes');
      if (transIncludes.length > 0) {
        cards += renderRelationCard('Includes', transIncludes.map(e => ({
          nodeId: e.target,
          label: nodeLabel(e.target),
          type: nodeType(e.target),
        })));
      }

      // ── Links To (partials can link to routes) ──
      const partialLinks = outbound.filter(e => e.type === 'links_to');
      if (partialLinks.length > 0) {
        cards += renderRelationCard('Links To', partialLinks.map(e => ({
          nodeId: e.target,
          label: nodeLabel(e.target),
          type: nodeType(e.target),
          meta: e.meta?.href ? `→ ${e.meta.href}` : null,
          context: e.meta?.context || null,
        })));
      }
      break;
    }

    case 'route': {
      // ── Serves ──
      const serves = outbound.filter(e => e.type === 'serves');
      if (serves.length > 0) {
        cards += renderRelationCard('Serves', serves.map(e => ({
          nodeId: e.target,
          label: nodeLabel(e.target),
          type: nodeType(e.target),
        })));
      }

      // ── Linked From (inbound links_to) ──
      const routeLinkedFrom = inbound.filter(e => e.type === 'links_to');
      if (routeLinkedFrom.length > 0) {
        cards += renderRelationCard('Linked From', routeLinkedFrom.map(e => ({
          nodeId: e.source,
          label: nodeLabel(e.source),
          type: nodeType(e.source),
          meta: e.meta?.href ? `→ ${e.meta.href}` : null,
          context: e.meta?.context || null,
        })));
      }
      break;
    }

    case 'token': {
      // ── Consumed By ──
      const consumedBy = inbound.filter(e => e.type === 'consumes_token');
      if (consumedBy.length > 0) {
        cards += renderRelationCard('Consumed By', consumedBy.map(e => ({
          nodeId: e.source,
          label: nodeLabel(e.source),
          type: nodeType(e.source),
        })));
      }
      break;
    }

    case 'asset': {
      // ── Consumes Tokens ──
      const consumesTokens = outbound.filter(e => e.type === 'consumes_token');
      if (consumesTokens.length > 0) {
        cards += renderRelationCard('Consumes Tokens', consumesTokens.map(e => ({
          nodeId: e.target,
          label: nodeLabel(e.target),
          type: nodeType(e.target),
        })));
      }
      break;
    }
  }

  return cards || '<p class="vs-impact-no-relations">No relationships found.</p>';
}

/**
 * Render a single relationship card.
 * @param {string} title Card heading
 * @param {Array<{nodeId: string, label: string, type: string, via?: string, meta?: string, context?: string}>} items
 */
export function renderRelationCard(title, items) {
  return `
    <div class="vs-impact-card">
      <div class="vs-impact-card-header">${escapeHtml(title)} <span class="vs-impact-card-count">${items.length}</span></div>
      <div class="vs-impact-card-list">
        ${items.map(item => {
          const typeClass = `vs-impact-ref-type-${item.type}`;
          return `
            <button class="vs-impact-ref-item" data-node-id="${escapeHtml(item.nodeId)}">
              <span class="vs-impact-ref-type ${typeClass}">${item.type}</span>
              <span class="vs-impact-ref-label">${escapeHtml(item.label)}</span>
              ${item.via ? `<span class="vs-impact-transitive-via">(via ${escapeHtml(item.via)})</span>` : ''}
              ${item.meta ? `<span class="vs-impact-ref-meta">${escapeHtml(item.meta)}</span>` : ''}
            </button>
            ${item.context ? `<div class="vs-impact-ref-context">${escapeHtml(item.context)}</div>` : ''}
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Render blast radius card — synchronous, reads from cache or shows loading.
 */
export function renderBlastRadiusCard(nodeId) {
  // Loading state
  if (blastRadiusLoadingFor === nodeId) {
    return `
      <div class="vs-impact-card vs-impact-blast-card">
        <div class="vs-impact-card-header">Blast Radius</div>
        <div class="vs-impact-blast-loading">
          <div class="vs-site-spinner" style="width:16px;height:16px"></div>
          <span>Computing…</span>
        </div>
      </div>
    `;
  }

  // Cached result
  const data = blastRadiusCache.get(nodeId);
  if (!data) return ''; // Fetch not yet triggered (shouldn't normally happen)

  const { affected_pages = [], affected_count = 0, total_pages = 0, is_global = false } = data;

  return `
    <div class="vs-impact-card vs-impact-blast-card">
      <div class="vs-impact-card-header">
        Blast Radius
        <span class="vs-impact-card-count">${affected_count} / ${total_pages}</span>
        ${is_global ? '<span class="vs-impact-blast-global">GLOBAL</span>' : ''}
      </div>
      <div class="vs-impact-card-list">
        ${affected_pages.map(page => `
          <button class="vs-impact-ref-item" data-node-id="${escapeHtml(page.id)}">
            <span class="vs-impact-ref-type vs-impact-ref-type-page">page</span>
            <span class="vs-impact-ref-label">${escapeHtml(page.label || page.id)}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}
