/**
 * VoxelSite Studio — Site Control: Control Panel (Right Panel)
 *
 * Right-side Inspect panel: entity detail, properties, relationship cards,
 * blast radius, and SC-020 URL proposal.
 *
 * In the three-panel layout, this module renders the right panel content.
 * When nothing is selected, it shows a site summary. When an entity is
 * selected, it shows the detailed Inspect view.
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
  blastRadiusCache,
  blastRadiusLoadingFor,
  proposalRouteId,
  proposalOriginNodeId,
  proposalInputValue,
  proposalJustEntered,
  proposalApplyState,
  proposalApplyError,
  proposalApplyResult,
  moveProposalMode,
  moveTargetParentHref,
  moveTargetIndex,
  moveNormalizationRequired,
  moveCurrentPosition,
  moveNavTree,
  moveHasHomeEntry,
  moveNavStatus,
  moveIsInNav,
  moveIsHomepage,
  movePreflightLoading,
  IMPACT_SECTIONS,
  getServingRoute,
  nodeLabel,
  nodeType,
  setProposalRouteId,
  setProposalOriginNodeId,
  setProposalInputValue,
  setProposalJustEntered,
  setProposalApplyState,
  setProposalApplyError,
  setProposalApplyResult,
  setMoveProposalMode,
  setMoveTargetParentHref,
  setMoveTargetIndex,
  setMoveNormalizationRequired,
  setMoveCurrentPosition,
  setMoveNavTree,
  setMoveHasHomeEntry,
  setMoveNavStatus,
  setMoveIsInNav,
  setMoveIsHomepage,
  setMovePreflightLoading,
  resetMoveState,
  renameMode,
  renameOriginalTitle,
  renameApplyState,
  renameError,
  renameResult,
  setRenameMode,
  setRenameOriginalTitle,
  setRenameApplyState,
  setRenameError,
  setRenameResult,
  resetRenameState,
  deleteMode,
  deleteApplyState,
  deleteError,
  deleteResult,
  setDeleteMode,
  setDeleteApplyState,
  setDeleteError,
  setDeleteResult,
  resetDeleteState,

  hierarchyTree,
  cardPreferences,
  saveCardPreferences,
  isCardCollapsed,
} from './state.js';

// ═══════════════════════════════════════════
//  Right Panel — Entry Point
// ═══════════════════════════════════════════

/**
 * Render the full right-panel content.
 * - Header: "Site Control" when nothing selected; entity name + type badge when selected.
 * - Body: site summary (idle) or Inspect detail (selected).
 * - Footer: contextual prompt placeholder (non-functional in Phase 1).
 */
export function renderControlPanel() {
  const hasSelection = selectedNodeId && graphModel && graphModel.nodes.get(selectedNodeId);
  const node = hasSelection ? graphModel.nodes.get(selectedNodeId) : null;

  return `
    <div class="vs-sc-right-inner ${!hasSelection ? 'vs-sc-idle' : ''}">
      <div class="vs-sc-right-header">
        ${hasSelection ? `
          <span class="vs-sc-right-title">${escapeHtml(node.label || selectedNodeId)}</span>
          <button class="vs-impact-close-btn" data-action="close-inspect" title="Close" aria-label="Close inspect panel">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        ` : `
          <span class="vs-sc-right-title vs-sc-right-title-idle">Site Control</span>
        `}
      </div>
      <div class="vs-sc-right-body" id="vs-sc-right-body">
        ${hasSelection ? renderImpactDetail() : renderSiteSummary()}
      </div>
    </div>
  `;
}

/**
 * Render the panel header — adapts to selection state.
 */
function renderPanelHeader() {
  if (!selectedNodeId || !graphModel) {
    return '';
  }

  const node = graphModel.nodes.get(selectedNodeId);
  if (!node) {
    return '';
  }

  const label = escapeHtml(node.label || node.id);

  return `
    <span class="vs-sc-right-title">${label}</span>
  `;
}

// ═══════════════════════════════════════════
//  Site Summary (nothing selected)
// ═══════════════════════════════════════════

function renderSiteSummary() {
  if (!graphModel) return renderImpactEmpty();

  return `
    <div class="vs-sc-summary-empty">
      <div class="vs-empty-state vs-empty-state--panel">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            ${icons.box}
          </div>
          <p class="vs-empty-state-title">Select a page</p>
        </div>
      </div>
    </div>
  `;
}

export function renderImpactEmpty() {
  return `
    <div class="vs-sc-summary-empty">
      <div class="vs-empty-state vs-empty-state--panel">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            ${icons.box}
          </div>
          <p class="vs-empty-state-title">Select a page</p>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════
//  Impact Detail Panel
// ═══════════════════════════════════════════

export function renderImpactDetail() {
  // Branch to delete panel if in delete mode
  if (deleteMode) return renderDeletePanel();

  // Branch to rename panel if in rename mode
  if (renameMode) return renderRenamePanel();

  // Branch to move proposal if in move mode
  if (moveProposalMode) return renderMoveProposalPanel();

  // Branch to URL proposal if in proposal mode
  if (proposalRouteId) return renderProposalPanel();

  const node = graphModel?.nodes.get(selectedNodeId);
  if (!node) return renderImpactEmpty();

  // Contextual subtitle: route for pages, "shared" for partials, type label for others
  let subtitle = '';
  if (node.type === 'page') {
    const routeId = getServingRoute(node.id);
    if (routeId) {
      const routeNode = graphModel.nodes.get(routeId);
      subtitle = routeNode ? (routeNode.label || routeId) : '';
    }
  } else if (node.type === 'route') {
    subtitle = node.label || node.id;
  } else {
    subtitle = node.id;
  }

  // Inline status badges
  let badges = '';
  if (node.meta?.isShared) {
    badges += '<span class="vs-impact-header-badge vs-impact-header-shared">Shared</span>';
  }
  const brData = blastRadiusCache.get(node.id);
  if (brData?.is_global) {
    badges += '<span class="vs-impact-header-badge vs-impact-header-global">Global</span>';
  }

  // Collect all cards, then sort: expanded first, collapsed at bottom
  const allCards = [];
  collectRelationshipCards(node, allCards);
  collectBlastRadiusCard(node.id, allCards);

  const expandedCards = allCards.filter(c => !c.collapsed).map(c => c.html);
  const collapsedCardsList = allCards.filter(c => c.collapsed).map(c => c.html);

  return `
    <div class="vs-impact-detail-content">
      <div class="vs-impact-detail-header">
        ${subtitle ? `<p class="vs-impact-detail-subtitle">${escapeHtml(subtitle)}</p>` : ''}
        ${badges ? `<div class="vs-impact-detail-badges">${badges}</div>` : ''}
      </div>
      ${expandedCards.join('')}
      ${collapsedCardsList.join('')}
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

  // Clear other modes — panels are mutually exclusive
  resetRenameState();
  resetMoveState();
  resetDeleteState();


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
  setProposalApplyState('idle');
  setProposalApplyError(null);
  setProposalApplyResult(null);

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
  setProposalApplyState('idle');
  setProposalApplyError(null);
  setProposalApplyResult(null);
}

/**
 * Enter move proposal mode for a page.
 * Fetches preflight data from the server.
 *
 * Caller-driven: only mutates state. Caller must call refreshView() and trigger preflight.
 *
 * @param {string} nodeId
 */
export function enterMoveProposalMode(nodeId) {
  const node = graphModel?.nodes.get(nodeId);
  if (!node || node.type !== 'page') return;

  // Clear other modes — panels are mutually exclusive
  resetRenameState();
  exitProposalMode();
  resetDeleteState();


  resetMoveState();
  setMoveProposalMode(true);
  setMovePreflightLoading(true);
  setProposalApplyState('idle');
  setProposalApplyError(null);
  setProposalApplyResult(null);
}

/**
 * Exit move proposal mode and return to Inspect.
 *
 * Caller-driven: only mutates state. Caller must call refreshView().
 */
export function exitMoveProposalMode() {
  resetMoveState();
  setProposalApplyState('idle');
  setProposalApplyError(null);
  setProposalApplyResult(null);
}

/**
 * Enter rename mode for a page.
 *
 * Caller-driven: only mutates state. Caller must call refreshView().
 *
 * @param {string} nodeId
 */
export function enterRenameMode(nodeId) {
  const node = graphModel?.nodes.get(nodeId);
  if (!node || node.type !== 'page') return;

  // Clear other modes — panels are mutually exclusive
  exitProposalMode();
  resetMoveState();
  resetDeleteState();


  resetRenameState();
  setRenameMode(true);
  setRenameOriginalTitle(node.label || '');
}

/**
 * Exit rename mode and return to Inspect.
 *
 * Caller-driven: only mutates state. Caller must call refreshView().
 */
export function exitRenameMode() {
  resetRenameState();
}

/**
 * Enter delete mode for a page.
 *
 * Caller-driven: only mutates state. Caller must call refreshView().
 *
 * @param {string} nodeId
 */
export function enterDeleteMode(nodeId) {
  const node = graphModel?.nodes.get(nodeId);
  if (!node || node.type !== 'page') return;

  // Cannot delete the homepage
  if (node.meta?.isHomepage) return;

  // Clear other modes — panels are mutually exclusive
  exitProposalMode();
  resetMoveState();
  resetRenameState();


  resetDeleteState();
  setDeleteMode(true);
}

/**
 * Exit delete mode and return to Inspect.
 *
 * Caller-driven: only mutates state. Caller must call refreshView().
 */
export function exitDeleteMode() {
  resetDeleteState();
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
  const isHomepage = currentPath === '/' || routeNode.id === 'route:/';

  // ── Success state ──
  if (proposalApplyState === 'success' && proposalApplyResult) {
    return `
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Change URL</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${icons.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">URL updated</p>
            <p class="vs-sc-form-result-detail">${escapeHtml(proposalApplyResult.oldPath)} → ${escapeHtml(proposalApplyResult.newPath)}</p>
            ${proposalApplyResult.referenceCount > 0
              ? `<p class="vs-sc-form-result-detail">${proposalApplyResult.referenceCount} reference${proposalApplyResult.referenceCount !== 1 ? 's' : ''} updated across ${(proposalApplyResult.updatedFiles || []).length} file${(proposalApplyResult.updatedFiles || []).length !== 1 ? 's' : ''}</p>`
              : ''}
            ${proposalApplyResult.snapshotId
              ? `<p class="vs-sc-form-result-detail">Safety snapshot created</p>`
              : ''}
          </div>
        </div>
      </div>
    `;
  }

  // ── Error state ──
  if (proposalApplyState === 'error' && proposalApplyError) {
    return `
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Change URL</h3>
        <div class="vs-sc-form-result is-error">
          <div class="vs-sc-form-result-icon">${icons.alertTriangle || '⚠'}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Rename failed</p>
            <p class="vs-sc-form-result-detail">${escapeHtml(proposalApplyError.message || 'Unknown error')}</p>
          </div>
        </div>
        <div class="vs-sc-form-actions">
          <button class="vs-sc-form-cancel" data-action="close-proposal">Dismiss</button>
        </div>
      </div>
    `;
  }

  // ── Applying state ──
  if (proposalApplyState === 'applying') {
    return `
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Change URL</h3>
        <div class="vs-sc-form-loading">
          <div class="vs-sc-move-loading-spinner"></div>
          <span>Applying…</span>
        </div>
      </div>
    `;
  }

  // ── Validate current input ──
  const validation = validateProposalUrl(proposalInputValue, currentPath);

  // ── Collect inbound references ──
  const inbound = graphModel.edgesByTarget.get(proposalRouteId) || [];
  const linksTo = inbound.filter(e => e.type === 'links_to');
  const sourceFiles = new Set(linksTo.map(e => e.source));

  // ── Build CTA based on state ──
  let ctaHtml = '';
  if (isHomepage) {
    ctaHtml = `
      <div class="vs-sc-form-actions">
        <div class="vs-sc-form-hint">Homepage URL cannot be renamed.</div>
      </div>
    `;
  } else if (proposalApplyState === 'armed') {
    ctaHtml = `
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn is-armed" data-action="apply-proposal-confirm">
          Confirm
        </button>
      </div>
    `;
  } else if (validation.valid) {
    ctaHtml = `
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn" data-action="apply-proposal-arm">Apply</button>
        <button class="vs-sc-form-cancel" data-action="close-proposal">Cancel</button>
      </div>
    `;
  } else {
    ctaHtml = `
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-cancel" data-action="close-proposal">Cancel</button>
      </div>
    `;
  }

  // ── Input disabled during armed state ──
  const inputDisabled = proposalApplyState === 'armed' ? 'disabled' : '';

  // ── Validation hint ──
  let validationHint = '';
  if (validation.message) {
    const hintClass = validation.valid ? 'is-valid' : 'is-error';
    validationHint = `<div class="vs-sc-form-hint ${hintClass}">${validation.message}</div>`;
  }

  // ── Reference impact section ──
  let refsHtml = '';
  if (!isHomepage && linksTo.length > 0) {
    const refCount = linksTo.length;
    const fileCount = sourceFiles.size;
    refsHtml = `
      <div class="vs-sc-delete-section">
        <div class="vs-sc-delete-section-header">
          <span class="vs-sc-form-label" title="Links to this URL in other files will be automatically updated">References updated</span>
          <span class="vs-sc-delete-section-count">${refCount} across ${fileCount} file${fileCount !== 1 ? 's' : ''}</span>
        </div>
        ${renderProposalGroups(linksTo, validation)}
      </div>
    `;
  } else if (!isHomepage && linksTo.length === 0 && proposalInputValue) {
    refsHtml = `<div class="vs-sc-form-hint">No references to update.</div>`;
  }

  return `
    <div class="vs-sc-form">
      <h3 class="vs-sc-form-section">Change URL</h3>
      <p class="vs-sc-form-context">Current path: <strong>${escapeHtml(currentPath)}</strong></p>
      <div class="vs-sc-form-field">
        <label class="vs-sc-form-label" for="vs-proposal-url">New URL path</label>
        <input
          type="text"
          id="vs-proposal-url"
          class="vs-sc-form-input"
          placeholder="${escapeHtml(currentPath)}"
          autocomplete="off"
          spellcheck="false"
          value="${escapeHtml(proposalInputValue)}"
          ${inputDisabled}
        />
        ${validationHint}
      </div>
      ${refsHtml}
      ${ctaHtml}
    </div>
  `;
}

/**
 * Validate a proposed URL path.
 *
 * Normalization matches the backend's contract exactly:
 * - lowercase
 * - [^a-z0-9-] → hyphens (underscores, spaces, uppercase all become -)
 * - strip leading/trailing hyphens
 * - strip .php suffix
 * - reject multi-segment paths (Phase 2A: single segment only)
 *
 * Exported so performApply() uses the same canonical cleanPath.
 */
export function validateProposalUrl(input, currentPath) {
  if (!input || !input.trim()) {
    return { valid: false, cleanPath: '', message: '' };
  }

  let raw = input.trim();

  // Strip leading slash for processing
  if (raw.startsWith('/')) raw = raw.slice(1);
  // Strip trailing slash
  if (raw.endsWith('/')) raw = raw.slice(0, -1);

  // Reject multi-segment paths (Phase 2A: single segment only)
  if (raw.includes('/')) {
    return { valid: false, cleanPath: '/' + raw, message: 'Nested paths (e.g. /services/web-design) are not supported yet' };
  }

  // Strip .php suffix
  if (raw.endsWith('.php')) raw = raw.slice(0, -4);

  // Normalize to match backend: lowercase + replace non-alphanumeric-hyphen with hyphens
  let slug = raw.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');

  if (!slug) {
    return { valid: false, cleanPath: '/', message: 'Path cannot be empty after normalization' };
  }

  const cleanPath = '/' + slug;

  // Show normalization if input differs from canonical
  const inputNormalized = raw.toLowerCase() !== slug;
  const normNote = inputNormalized ? ` (normalized from "${raw}")` : '';

  // Can't be same as current
  const currentClean = currentPath.replace(/\/$/, '') || '/';
  if (cleanPath === currentClean) {
    return { valid: false, cleanPath, message: 'New path is the same as the current path' };
  }

  // Check for conflicts with existing routes
  if (graphModel) {
    for (const [, node] of graphModel.nodes) {
      if (node.type === 'route' && node.id !== proposalRouteId) {
        const existingPath = (node.label || node.id).replace(/\/$/, '') || '/';
        if (cleanPath === existingPath) {
          return { valid: false, cleanPath, message: `Path conflicts with existing route: ${existingPath}` };
        }
      }
    }
  }

  return { valid: true, cleanPath, message: `✓ ${cleanPath}${normNote}` };
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

export function collectRelationshipCards(node, cards) {
  const outbound = graphModel.edgesBySource.get(node.id) || [];
  const inbound = graphModel.edgesByTarget.get(node.id) || [];

  const startLen = cards.length;

  switch (node.type) {
    case 'page': {
      // ── Direct Includes ──
      const directIncludes = outbound.filter(e => e.type === 'includes');
      if (directIncludes.length > 0) {
        cards.push(renderRelationCard('Direct Includes', directIncludes.map(e => ({
          nodeId: e.target,
          label: nodeLabel(e.target),
          type: nodeType(e.target),
        }))));
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
        cards.push(renderRelationCard('Transitive Includes', transitiveItems));
      }

      // ── Links To ──
      const linksTo = outbound.filter(e => e.type === 'links_to');
      if (linksTo.length > 0) {
        cards.push(renderRelationCard('Links To', linksTo.map(e => ({
          nodeId: e.target,
          label: nodeLabel(e.target),
          type: nodeType(e.target),
          meta: e.meta?.href ? `→ ${e.meta.href}` : null,
          context: e.meta?.context || null,
        }))));
      }

      // ── Linked From (via route indirection) ──
      const routeId = getServingRoute(node.id);
      if (routeId) {
        const routeInbound = graphModel.edgesByTarget.get(routeId) || [];
        const linkedFrom = routeInbound.filter(e => e.type === 'links_to');
        if (linkedFrom.length > 0) {
          cards.push(renderRelationCard('Linked From', linkedFrom.map(e => ({
            nodeId: e.source,
            label: nodeLabel(e.source),
            type: nodeType(e.source),
            meta: e.meta?.href ? `→ ${e.meta.href}` : null,
            context: e.meta?.context || null,
          }))));
        }
      }
      break;
    }

    case 'partial': {
      // ── Included By ──
      const includedBy = inbound.filter(e => e.type === 'includes');
      if (includedBy.length > 0) {
        cards.push(renderRelationCard('Included By', includedBy.map(e => ({
          nodeId: e.source,
          label: nodeLabel(e.source),
          type: nodeType(e.source),
        }))));
      }

      // ── Transitively Includes ──
      const transIncludes = outbound.filter(e => e.type === 'includes');
      if (transIncludes.length > 0) {
        cards.push(renderRelationCard('Includes', transIncludes.map(e => ({
          nodeId: e.target,
          label: nodeLabel(e.target),
          type: nodeType(e.target),
        }))));
      }

      // ── Links To (partials can link to routes) ──
      const partialLinks = outbound.filter(e => e.type === 'links_to');
      if (partialLinks.length > 0) {
        cards.push(renderRelationCard('Links To', partialLinks.map(e => ({
          nodeId: e.target,
          label: nodeLabel(e.target),
          type: nodeType(e.target),
          meta: e.meta?.href ? `→ ${e.meta.href}` : null,
          context: e.meta?.context || null,
        }))));
      }
      break;
    }

    case 'route': {
      // ── Serves ──
      const serves = outbound.filter(e => e.type === 'serves');
      if (serves.length > 0) {
        cards.push(renderRelationCard('Serves', serves.map(e => ({
          nodeId: e.target,
          label: nodeLabel(e.target),
          type: nodeType(e.target),
        }))));
      }

      // ── Linked From (inbound links_to) ──
      const routeLinkedFrom = inbound.filter(e => e.type === 'links_to');
      if (routeLinkedFrom.length > 0) {
        cards.push(renderRelationCard('Linked From', routeLinkedFrom.map(e => ({
          nodeId: e.source,
          label: nodeLabel(e.source),
          type: nodeType(e.source),
          meta: e.meta?.href ? `→ ${e.meta.href}` : null,
          context: e.meta?.context || null,
        }))));
      }
      break;
    }

    case 'token': {
      // ── Consumed By ──
      const consumedBy = inbound.filter(e => e.type === 'consumes_token');
      if (consumedBy.length > 0) {
        cards.push(renderRelationCard('Consumed By', consumedBy.map(e => ({
          nodeId: e.source,
          label: nodeLabel(e.source),
          type: nodeType(e.source),
        }))));
      }
      break;
    }

    case 'asset': {
      // ── Consumes Tokens ──
      const consumesTokens = outbound.filter(e => e.type === 'consumes_token');
      if (consumesTokens.length > 0) {
        cards.push(renderRelationCard('Consumes Tokens', consumesTokens.map(e => ({
          nodeId: e.target,
          label: nodeLabel(e.target),
          type: nodeType(e.target),
        }))));
      }
      break;
    }
  }

  if (cards.length === startLen) {
    cards.push({ collapsed: false, html: '<p class="vs-impact-no-relations">No relationships found.</p>' });
  }
}

/**
 * Render a single relationship card.
 * Returns { collapsed: boolean, html: string } for sorting.
 */
export function renderRelationCard(title, items) {
  const cardKey = title.toLowerCase().replace(/\s+/g, '-');
  const collapsed = isCardCollapsed(cardKey);
  const collapsedClass = collapsed ? ' is-collapsed' : '';

  const html = `
    <div class="vs-impact-card${collapsedClass}">
      <button class="vs-impact-card-header" data-card-toggle="${cardKey}">
        <span class="vs-impact-card-chevron">${icons.chevronDown}</span>
        <span class="vs-impact-card-title">${escapeHtml(title)}</span>
        <span class="vs-impact-card-count">${items.length}</span>
      </button>
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

  return { collapsed, html };
}

/**
 * Collect blast radius card into the cards array.
 */
export function collectBlastRadiusCard(nodeId, cards) {
  const cardKey = 'blast-radius';

  if (blastRadiusLoadingFor === nodeId) {
    cards.push({ collapsed: false, html: `
      <div class="vs-impact-card vs-impact-blast-card">
        <button class="vs-impact-card-header" data-card-toggle="${cardKey}">
          <span class="vs-impact-card-chevron">${icons.chevronDown}</span>
          <span class="vs-impact-card-title">Blast Radius</span>
        </button>
        <div class="vs-impact-blast-loading">
          <div class="vs-site-spinner" style="width:16px;height:16px"></div>
          <span>Computing\u2026</span>
        </div>
      </div>
    ` });
    return;
  }

  const data = blastRadiusCache.get(nodeId);
  if (!data) return;

  const { affected_pages = [], affected_count = 0, total_pages = 0, is_global = false } = data;
  const collapsed = isCardCollapsed(cardKey);
  const collapsedClass = collapsed ? ' is-collapsed' : '';

  cards.push({ collapsed, html: `
    <div class="vs-impact-card vs-impact-blast-card${collapsedClass}">
      <button class="vs-impact-card-header" data-card-toggle="${cardKey}">
        <span class="vs-impact-card-chevron">${icons.chevronDown}</span>
        <span class="vs-impact-card-title">Blast Radius</span>
        <span class="vs-impact-card-count">${affected_count} / ${total_pages}</span>
        ${is_global ? '<span class="vs-impact-blast-global">GLOBAL</span>' : ''}
      </button>
      <div class="vs-impact-card-list">
        ${affected_pages.map(page => `
          <button class="vs-impact-ref-item" data-node-id="${escapeHtml(page.id)}">
            <span class="vs-impact-ref-type vs-impact-ref-type-page">page</span>
            <span class="vs-impact-ref-label">${escapeHtml(page.label || page.id)}</span>
          </button>
        `).join('')}
      </div>
    </div>
  ` });
}

// ═══════════════════════════════════════════
//  Move Panel (Phase 2B) — calm inline form
// ═══════════════════════════════════════════

/**
 * Render the reorder panel — calm inline settings sheet.
 *
 * Structure:
 * - Section title
 * - Pill strip (hero interaction) with ← → arrows
 * - Position context sentence
 * - Normalization hint (if needed)
 * - One CTA
 */
function renderMoveProposalPanel() {
  const node = graphModel?.nodes.get(selectedNodeId);
  if (!node) {
    exitMoveProposalMode();
    return selectedNodeId ? renderImpactDetail() : renderImpactEmpty();
  }

  const pageLabel = escapeHtml(node.label || node.id);

  // ── Loading state ──
  if (movePreflightLoading) {
    return `
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Move</h3>
        <div class="vs-sc-form-loading">
          <div class="vs-sc-move-loading-spinner"></div>
          <span>Loading navigation…</span>
        </div>
      </div>
    `;
  }

  // ── Success state ──
  if (proposalApplyState === 'success' && proposalApplyResult) {
    const isStructural = !!proposalApplyResult.movedPages;
    const successTitle = isStructural ? 'Page moved' : 'Navigation updated';
    let successDetail = '';

    if (isStructural) {
      const moved = proposalApplyResult.totalPagesMoved || 1;
      const refs  = proposalApplyResult.totalAffectedReferences || 0;
      const parts = [];
      parts.push(`Moved ${moved} page${moved !== 1 ? 's' : ''}`);
      if (refs > 0) parts.push(`updated ${refs} reference${refs !== 1 ? 's' : ''}`);
      successDetail = parts.join(', ');
    } else {
      successDetail = escapeHtml(proposalApplyResult.message || 'Page order has been changed.');
    }

    return `
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Move</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${icons.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">${successTitle}</p>
            <p class="vs-sc-form-result-detail">${successDetail}</p>
            ${proposalApplyResult.normalized
              ? '<p class="vs-sc-form-result-detail">Navigation was standardized</p>'
              : ''}
            ${proposalApplyResult.snapshotId
              ? '<p class="vs-sc-form-result-detail">Safety snapshot created</p>'
              : ''}
          </div>
        </div>
      </div>
    `;
  }

  // ── Blocked states ──
  if (moveIsHomepage) {
    return renderMoveBlocked(pageLabel, 'The homepage is always first and cannot be reordered.');
  }
  if (moveNavStatus === 'nav_missing') {
    return renderMoveBlocked(pageLabel, 'No navigation file found.');
  }
  if (moveNavStatus === 'unsupported_layout') {
    return renderMoveBlocked(pageLabel, 'This navigation layout doesn\'t support reordering yet.');
  }
  if (moveNavStatus === 'nav_parse_error') {
    return renderMoveBlocked(pageLabel, 'The navigation file has a problem and can\'t be read right now.');
  }
  if (!moveIsInNav) {
    return renderMoveBlocked(pageLabel, 'This page isn\'t in the navigation yet.');
  }

  // ── Build pill strip ──
  const positionChooser = renderMovePositionChooser(node);

  // ── Parent chooser ──
  const parentOptions = renderMoveParentChooser(node);

  // ── Normalization hint ──
  const normHint = moveNormalizationRequired
    ? '<div class="vs-sc-form-hint">Navigation will be standardized first. Current links and order are preserved.</div>'
    : '';

  // ── Error banner ──
  let errorBanner = '';
  if (proposalApplyState === 'error' && proposalApplyError) {
    errorBanner = `
      <div class="vs-sc-form-result is-error">
        <div class="vs-sc-form-result-icon">${icons.alertTriangle || '⚠'}</div>
        <div class="vs-sc-form-result-text">
          <p class="vs-sc-form-result-title">Move failed</p>
          <p class="vs-sc-form-result-detail">${escapeHtml(proposalApplyError.message || 'Unknown error')}</p>
        </div>
      </div>
    `;
  }

  // ── CTA ──
  const isNoOp = isMoveNoOp();
  let ctaHtml = '';

  if (proposalApplyState === 'applying') {
    ctaHtml = `
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn is-loading" disabled>
          <span class="vs-sc-move-loading-spinner"></span>
          Applying…
        </button>
      </div>
    `;
  } else if (proposalApplyState === 'armed') {
    ctaHtml = `
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn is-armed" data-action="apply-move-confirm">
          Confirm
        </button>
      </div>
    `;
  } else if (!isNoOp) {
    const idleLabel = moveNormalizationRequired ? 'Standardize & move' : 'Apply';
    ctaHtml = `
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn" data-action="apply-move-arm">${idleLabel}</button>
        <button class="vs-sc-form-cancel" data-action="close-move-proposal">Cancel</button>
      </div>
    `;
  } else if (isNoOp) {
    ctaHtml = `
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn" disabled>Apply</button>
        <button class="vs-sc-form-cancel" data-action="close-move-proposal">Cancel</button>
      </div>
    `;
  }

  return `
    <div class="vs-sc-form">
      <h3 class="vs-sc-form-section">Move</h3>
      ${parentOptions}
      ${positionChooser}
      ${normHint}
      ${errorBanner}
      ${ctaHtml}
    </div>
  `;
}

/**
 * Render blocked reorder panel — calm inline form with message.
 */
function renderMoveBlocked(pageLabel, message) {
  return `
    <div class="vs-sc-form">
      <h3 class="vs-sc-form-section">Move</h3>
      <p class="vs-sc-form-context">${escapeHtml(message)}</p>
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-cancel" data-action="close-move-proposal">Dismiss</button>
      </div>
    </div>
  `;
}

/**
 * Render the parent chooser — Root + root-level non-self pages.
 */
function renderMoveParentChooser(node) {
  if (!moveNavTree || moveNavTree.length === 0) return '';

  const pageHref = node.meta?.isHomepage ? '/' : '/' + (node.meta?.slug || '');

  const isRootSelected = moveTargetParentHref === null;

  let options = `
    <button class="vs-move-parent-option ${isRootSelected ? 'is-selected' : ''}"
            data-action="select-move-parent" data-parent-href="__root__">
      Root
    </button>
  `;

  for (const entry of moveNavTree) {
    if (entry.href === pageHref) continue;
    const isSelected = moveTargetParentHref === entry.href;
    options += `
      <button class="vs-move-parent-option ${isSelected ? 'is-selected' : ''}"
              data-action="select-move-parent" data-parent-href="${escapeHtml(entry.href)}">
        ${escapeHtml(entry.label)}
      </button>
    `;
  }

  return `
    <div class="vs-sc-form-field">
      <label class="vs-sc-form-label">Parent page</label>
      <div class="vs-move-parent-chooser">
        ${options}
      </div>
    </div>
  `;
}

/**
 * Render the position chooser — ← → arrow buttons with a horizontal
 * pill strip showing the live sibling order.
 *
 * UX: One click = one position shift. Visual, not technical.
 */
function renderMovePositionChooser(node) {
  if (moveTargetParentHref === undefined) return '';
  if (!moveNavTree) return '';

  const pageHref = node.meta?.isHomepage ? '/' : '/' + (node.meta?.slug || '');
  const pageLabel = node.label || node.meta?.slug || '';

  let siblings = [];
  if (moveTargetParentHref === null) {
    siblings = moveNavTree.filter(e => e.href !== pageHref);
  } else {
    for (const entry of moveNavTree) {
      if (entry.href === moveTargetParentHref) {
        siblings = (entry.children || []).filter(c => c.href !== pageHref);
        break;
      }
    }
  }

  if (siblings.length === 0) {
    return `
      <div class="vs-sc-form-field">
        <label class="vs-sc-form-label">Position</label>
        <div class="vs-move-position-strip">
          <div class="vs-move-strip-pill is-self">${escapeHtml(pageLabel)}</div>
        </div>
        <div class="vs-sc-form-hint">Only page at this level</div>
      </div>
    `;
  }

  const currentIndex = moveTargetIndex ?? siblings.length;
  const fullOrder = [...siblings];
  fullOrder.splice(currentIndex, 0, { href: pageHref, label: pageLabel, isSelf: true });

  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < siblings.length;

  const pills = fullOrder.map(entry => {
    if (entry.isSelf) {
      return `<div class="vs-move-strip-pill is-self">${escapeHtml(entry.label)}</div>`;
    }
    return `<div class="vs-move-strip-pill">${escapeHtml(entry.label)}</div>`;
  }).join('');

  let positionContext = '';
  if (currentIndex === 0) {
    positionContext = 'First in navigation';
  } else if (currentIndex >= siblings.length) {
    positionContext = 'Last in navigation';
  } else {
    const after = siblings[currentIndex - 1]?.label || '';
    const before = siblings[currentIndex]?.label || '';
    positionContext = `After ${after}, before ${before}`;
  }

  return `
    <div class="vs-sc-form-field">
      <label class="vs-sc-form-label">Position</label>
      <div class="vs-move-reorder-controls">
        <button class="vs-move-arrow-btn ${canGoLeft ? '' : 'is-disabled'}"
                ${canGoLeft ? `data-action="select-move-position" data-position="${currentIndex - 1}"` : 'disabled'}
                aria-label="Move left">
          ←
        </button>
        <div class="vs-move-position-strip">
          ${pills}
        </div>
        <button class="vs-move-arrow-btn ${canGoRight ? '' : 'is-disabled'}"
                ${canGoRight ? `data-action="select-move-position" data-position="${currentIndex + 1}"` : 'disabled'}
                aria-label="Move right">
          →
        </button>
      </div>
      <div class="vs-sc-form-hint">${escapeHtml(positionContext)}</div>
    </div>
  `;
}

/**
 * Check whether the chosen destination is the same as the current position.
 */
function isMoveNoOp() {
  if (!moveCurrentPosition) return false;
  if (moveTargetParentHref === undefined || moveTargetIndex === null) return false;
  return moveTargetParentHref === moveCurrentPosition.parentHref
      && moveTargetIndex === moveCurrentPosition.index;
}
// ═══════════════════════════════════════════
//  Rename Panel (Phase 2B.5)
// ═══════════════════════════════════════════

/**
 * Render the rename panel — text input for new page title.
 *
 * States: idle (input + button), applying (spinner), success (banner), error (banner + retry).
 */
function renderRenamePanel() {
  const node = graphModel?.nodes.get(selectedNodeId);
  if (!node) return renderImpactEmpty();

  const title = escapeHtml(node.label || '');
  const original = escapeHtml(renameOriginalTitle);

  // ── Success state ──
  if (renameApplyState === 'success' && renameResult) {
    const r = renameResult;
    const navNote = r.navLabelUpdated
      ? '<p class="vs-sc-form-result-detail">Nav label updated</p>'
      : '';

    return `
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Rename</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${icons.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Page renamed</p>
            <p class="vs-sc-form-result-detail">"${escapeHtml(r.oldTitle)}" → "${escapeHtml(r.newTitle)}"</p>
            ${navNote}
          </div>
        </div>
      </div>
    `;
  }

  // ── Error state ──
  if (renameApplyState === 'error' && renameError) {
    return `
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Rename</h3>
        <div class="vs-sc-form-result is-error">
          <div class="vs-sc-form-result-icon">${icons.alertTriangle || '⚠'}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Rename failed</p>
            <p class="vs-sc-form-result-detail">${escapeHtml(renameError)}</p>
          </div>
        </div>
        <div class="vs-sc-form-actions">
          <button class="vs-sc-form-cancel" data-action="close-rename">Dismiss</button>
        </div>
      </div>
    `;
  }

  // ── Applying state ──
  if (renameApplyState === 'applying') {
    return `
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Rename</h3>
        <div class="vs-sc-form-loading">
          <div class="vs-sc-move-loading-spinner"></div>
          <span>Renaming…</span>
        </div>
      </div>
    `;
  }

  // ── Idle state — input form ──
  return `
    <div class="vs-sc-form">
      <h3 class="vs-sc-form-section">Rename</h3>
      <p class="vs-sc-form-context">Current title: <strong>${original}</strong></p>
      <div class="vs-sc-form-field">
        <label class="vs-sc-form-label" for="vs-sc-rename-input">New title</label>
        <input
          type="text"
          id="vs-sc-rename-input"
          class="vs-sc-form-input"
          value="${title}"
          autocomplete="off"
          spellcheck="false"
        />
        <div class="vs-sc-form-hint" id="vs-sc-rename-hint"></div>
      </div>
      <div class="vs-sc-form-actions">
        <button
          class="vs-sc-form-btn"
          id="vs-sc-rename-submit"
          data-action="rename-submit"
          disabled
        >Rename</button>
        <button class="vs-sc-form-cancel" data-action="close-rename">Cancel</button>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════
//  Delete Panel (Phase 2C)
// ═══════════════════════════════════════════

/**
 * Render the delete confirmation panel — armed inline pattern.
 *
 * States: idle (confirmation + blast radius), armed (red pulse),
 * applying (spinner), success (banner), error (banner + dismiss).
 */
function renderDeletePanel() {
  const node = graphModel?.nodes.get(selectedNodeId);
  if (!node) return renderImpactEmpty();

  const title = escapeHtml(node.label || '');
  const filePath = node.id.replace('page:', '');

  // ── Success state ──
  if (deleteApplyState === 'success' && deleteResult) {
    const r = deleteResult;
    return `
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Delete</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${icons.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">"${escapeHtml(r.deletedPage?.title || '')}" has been removed</p>
            ${r.navEntryRemoved ? '<p class="vs-sc-form-result-detail">Nav entry removed</p>' : ''}
            ${r.navChildrenPromoted > 0 ? `<p class="vs-sc-form-result-detail">${r.navChildrenPromoted} child nav ${r.navChildrenPromoted === 1 ? 'entry' : 'entries'} promoted</p>` : ''}
            ${r.referencesCleanedUp > 0 ? `<p class="vs-sc-form-result-detail">${r.referencesCleanedUp} ${r.referencesCleanedUp === 1 ? 'file' : 'files'} cleaned up</p>` : ''}
            ${r.totalAffectedReferences > 0 && !r.referencesCleanedUp ? `<p class="vs-sc-form-result-detail">${r.totalAffectedReferences} ${r.totalAffectedReferences === 1 ? 'reference' : 'references'} may need review</p>` : ''}
            ${r.snapshotId ? '<p class="vs-sc-form-result-detail">Safety snapshot created</p>' : ''}
          </div>
        </div>
      </div>
    `;
  }

  // ── Error state ──
  if (deleteApplyState === 'error' && deleteError) {
    return `
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Delete</h3>
        <div class="vs-sc-form-result is-error">
          <div class="vs-sc-form-result-icon">${icons.alertTriangle || '⚠'}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Delete failed</p>
            <p class="vs-sc-form-result-detail">${escapeHtml(deleteError)}</p>
          </div>
        </div>
        <div class="vs-sc-form-actions">
          <button class="vs-sc-form-cancel" data-action="close-delete">Dismiss</button>
        </div>
      </div>
    `;
  }

  // ── Applying state ──
  if (deleteApplyState === 'applying') {
    return `
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Delete</h3>
        <div class="vs-sc-form-loading">
          <div class="vs-sc-move-loading-spinner"></div>
          <span>Deleting page…</span>
        </div>
      </div>
    `;
  }

  // ── Compute affected references from graph ──
  // These are inbound links that will be cleaned up during delete, not left broken.
  const routeId = getServingRoute(selectedNodeId);
  let affectedRefs = [];
  if (routeId) {
    const inbound = graphModel.edgesByTarget.get(routeId) || [];
    const refMap = new Map();
    for (const e of inbound) {
      if (e.type === 'links_to') {
        const src = graphModel.nodes.get(e.source);
        if (src) {
          const existing = refMap.get(e.source) || { id: e.source, label: src.label || e.source, type: src.type, count: 0 };
          existing.count++;
          refMap.set(e.source, existing);
        }
      }
    }
    affectedRefs = Array.from(refMap.values());
  }

  const totalRefs = affectedRefs.reduce((sum, r) => sum + r.count, 0);

  // ── Build CTA based on state ──
  let ctaHtml = '';
  if (deleteApplyState === 'armed') {
    ctaHtml = `
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn vs-sc-form-btn-danger is-armed" data-action="delete-confirm">
          Confirm
        </button>
      </div>
    `;
  } else {
    ctaHtml = `
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn vs-sc-form-btn-danger" data-action="delete-arm">
          Delete this page
        </button>
        <button class="vs-sc-form-cancel" data-action="close-delete">Cancel</button>
      </div>
      <p class="vs-sc-delete-warning">This action cannot be undone.</p>
    `;
  }

  // ── Idle state — consequence disclosure ──
  const checklistItems = [
    { label: `Page file: ${escapeHtml(filePath)}`, icon: icons.fileText },
    { label: 'Database entry', icon: icons.database },
  ];

  const checklist = checklistItems.map(item => `
    <li class="vs-sc-delete-checklist-item">
      <span class="vs-sc-delete-checklist-icon">${item.icon}</span>
      <span>${item.label}</span>
    </li>
  `).join('');

  // References cleaned — grouped by cleanup action, tooltips for detail
  let affectedRefsHtml = '';
  if (affectedRefs.length > 0) {
    // Split into pages (unlinked) vs partials (removed)
    const pageRefs = affectedRefs.filter(r => r.type !== 'partial');
    const partialRefs = affectedRefs.filter(r => r.type === 'partial');

    let groupsHtml = '';

    if (pageRefs.length > 0) {
      const chips = pageRefs.map(r => `<span class="vs-sc-delete-ref-chip">${escapeHtml(r.label)}</span>`).join('');
      groupsHtml += `
        <div class="vs-sc-delete-ref-group">
          <span class="vs-sc-delete-ref-group-action" title="Links to this page will have their href set to # — the element and its styling are preserved">Unlinked</span>
          <div class="vs-sc-delete-ref-chips">${chips}</div>
        </div>
      `;
    }

    if (partialRefs.length > 0) {
      const chips = partialRefs.map(r => `<span class="vs-sc-delete-ref-chip">${escapeHtml(r.label)}</span>`).join('');
      groupsHtml += `
        <div class="vs-sc-delete-ref-group">
          <span class="vs-sc-delete-ref-group-action" title="Navigation and footer entries linking to this page will be fully removed">Removed</span>
          <div class="vs-sc-delete-ref-chips">${chips}</div>
        </div>
      `;
    }

    affectedRefsHtml = `
      <div class="vs-sc-delete-section">
        <div class="vs-sc-delete-section-header">
          <span class="vs-sc-form-label" title="Links to this page in other files will be automatically cleaned up during deletion">References cleaned</span>
          <span class="vs-sc-delete-section-count">${totalRefs}</span>
        </div>
        ${groupsHtml}
      </div>
    `;
  }

  return `
    <div class="vs-sc-form">
      <h3 class="vs-sc-form-section">Delete</h3>
      <p class="vs-sc-form-context">${escapeHtml(filePath)}</p>
      <div class="vs-sc-delete-section">
        <span class="vs-sc-form-label">Will be removed</span>
        <ul class="vs-sc-delete-checklist">
          ${checklist}
        </ul>
      </div>
      ${affectedRefsHtml}
      ${ctaHtml}
    </div>
  `;
}



