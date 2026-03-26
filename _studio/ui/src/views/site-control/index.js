/**
 * VoxelSite Studio — Site Control Workspace
 *
 * Three-panel layout: left nav + visual canvas (center) + control panel (right).
 * No tab system — all panels are always visible.
 *
 * Module responsibilities:
 *   index.js        — Shell, lifecycle, event binding, refresh orchestrator
 *   state.js        — State (live let bindings + setters), graph helpers
 *   structure-nav.js — Left panel: page tree + entity browser (unified)
 *   canvas.js       — Center panel: tier diagram, card rendering
 *   control-panel.js — Right panel: Inspect, relationship cards, SC-020 proposal
 *   node-actions.js  — Contextual action bar (stub in Phase 1)
 *
 * Data flow:
 * - On mount: GET /site-graph → normalize → buildHierarchyTree()
 * - Tree drives expansion; diagram mirrors tree state
 * - Selection syncs bidirectionally between tree and diagram
 * - Left panel entity clicks also trigger selection
 *
 * Refresh is caller-driven: all state mutations happen via setters in
 * state.js, and only this module calls refreshView(). No other module
 * imports or calls refreshView — it is never exported.
 */

import { api } from '../../../api.js';
import { icons } from '../../icons.js';
import { escapeHtml } from '../../helpers.js';

// ── State ──
import {
  graphModel,
  selectedNodeId,
  lastSelectedPageId,
  filterText,
  hierarchyTree,
  blastRadiusCache,
  blastRadiusLoadingFor,
  escListenerInstalled,
  impactCollapsedSections,
  saveCollapsedSections,
  proposalRouteId,
  proposalOriginNodeId,
  proposalInputValue,
  proposalJustEntered,
  proposalApplyState,
  collapsedPages,
  cardPreferences,
  saveCardPreferences,
  saveSelectedNode,
  loadSelectedNode,
  moveProposalMode,
  moveTargetParentHref,
  moveTargetIndex,
  moveNormalizationRequired,
  normalizeGraph,
  buildHierarchyTree,
  getSavedSidebarWidth,
  saveSidebarWidth,
  setGraphModel,
  setSelectedNodeId,
  setLastSelectedPageId,
  setFilterText,
  setHierarchyTree,
  setBlastRadiusLoadingFor,
  setEscListenerInstalled,
  setProposalRouteId,
  setProposalOriginNodeId,
  setProposalInputValue,
  setProposalJustEntered,
  setProposalApplyState,
  setProposalApplyError,
  setProposalApplyResult,
  setLastMutationSuggestedPrompt,
  setMoveProposalMode,
  setMoveTargetParentHref,
  setMoveTargetIndex,
  setMoveNormalizationRequired,
  moveCurrentPosition,
  setMoveCurrentPosition,
  setMoveNavTree,
  moveNavTree,
  setMoveHasHomeEntry,
  setMoveNavStatus,
  setMoveIsInNav,
  setMoveIsHomepage,
  setMovePreflightLoading,
  resetMoveState,
  renameMode,
  renameApplyState,
  setRenameApplyState,
  setRenameError,
  setRenameResult,
  resetRenameState,
  deleteMode,
  deleteApplyState,
  setDeleteMode,
  setDeleteApplyState,
  setDeleteError,
  setDeleteResult,
  resetDeleteState,
  getStructureHighlight,
} from './state.js';

// ── Rendering modules ──
import { renderLeftPanel, renderTree } from './structure-nav.js';
import { renderDiagram, computeConnectors } from './canvas.js';
import {
  renderControlPanel,
  renderImpactDetail,
  renderImpactEmpty,
  enterProposalMode,
  exitProposalMode,
  enterMoveProposalMode,
  exitMoveProposalMode,
  enterRenameMode,
  exitRenameMode,
  enterDeleteMode,
  exitDeleteMode,
  validateProposalUrl,
} from './control-panel.js';

// ── Window resize: debounced connector recompute ──
let _resizeHandler = null;

// ═══════════════════════════════════════════
//  Entry Point
// ═══════════════════════════════════════════

export function renderSiteControlView() {
  setTimeout(() => loadSiteMap(), 0);

  return `
    <div id="vs-site-root" style="height: 100%;">
      <div class="vs-site-loading">
        <div class="vs-site-spinner"></div>
        <span>Building site structure…</span>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════
//  Data Loading
// ═══════════════════════════════════════════

async function loadSiteMap() {
  const root = document.getElementById('vs-site-root');
  if (!root) return;

  const { ok, data } = await api.get('/site-graph');

  if (!ok || !data) {
    root.innerHTML = `
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">${icons.globe}</div>
          <p class="vs-empty-state-title">Could not load site graph</p>
          <p class="vs-empty-state-desc">Check that your site has pages in the preview directory.</p>
          <button id="vs-site-retry" class="vs-btn vs-btn-primary vs-btn-sm">Retry</button>
        </div>
      </div>
    `;
    document.getElementById('vs-site-retry')?.addEventListener('click', () => loadSiteMap());
    return;
  }

  setGraphModel(normalizeGraph(data));
  setFilterText('');
  blastRadiusCache.clear();
  setBlastRadiusLoadingFor(null);
  setProposalRouteId(null);
  setProposalOriginNodeId(null);
  setProposalInputValue('');
  setHierarchyTree(buildHierarchyTree());

  // Restore previous selection if the node still exists in the graph
  const savedNodeId = loadSelectedNode();
  if (savedNodeId && graphModel.nodes.has(savedNodeId)) {
    setSelectedNodeId(savedNodeId);
    if (savedNodeId.startsWith('page:')) {
      setLastSelectedPageId(savedNodeId);
    }
    fetchBlastRadius(savedNodeId);
  } else {
    setSelectedNodeId(null);
    setLastSelectedPageId(null);
    saveSelectedNode(null); // Clear stale reference
  }

  renderWorkspace(root);
}

// ═══════════════════════════════════════════
//  Main Workspace Render (Three-Panel Shell)
// ═══════════════════════════════════════════

function renderWorkspace(root) {
  root.innerHTML = `
    <div class="vs-site-workspace vs-sc-three-panel">
      <div class="vs-sc-left" id="vs-sc-left"${getSavedSidebarWidth('left')}>
        ${renderLeftPanel(hierarchyTree)}
        <div class="vs-editor-resize" data-resize-panel="vs-sc-left"></div>
      </div>
      <div class="vs-sc-canvas" id="vs-sc-canvas">
        <div class="vs-site-diagram" id="vs-site-diagram">
          ${renderDiagram(hierarchyTree)}
        </div>
        <div class="vs-sc-status-bar" id="vs-sc-status-bar">
          ${renderStatusBar()}
        </div>
      </div>
      <div class="vs-sc-right" id="vs-sc-right"${getSavedSidebarWidth('right')}>
        <div class="vs-editor-resize" data-resize-panel="vs-sc-right" data-resize-side="left"></div>
        ${renderControlPanel()}
      </div>
    </div>
  `;

  bindWorkspaceEvents(root);

  // Compute SVG connectors after DOM layout is complete (double-rAF)
  requestAnimationFrame(() => requestAnimationFrame(() => computeConnectors(hierarchyTree)));
}

// ═══════════════════════════════════════════
//  Status Bar
// ═══════════════════════════════════════════

function renderStatusBar() {
  if (!graphModel) return '';

  // Count nodes by type
  let pageCount = 0, partialCount = 0, routeCount = 0;
  for (const [, node] of graphModel.nodes) {
    if (node.type === 'page') pageCount++;
    else if (node.type === 'partial') partialCount++;
    else if (node.type === 'route') routeCount++;
  }

  const stats = `${pageCount} page${pageCount !== 1 ? 's' : ''} · ${partialCount} partial${partialCount !== 1 ? 's' : ''} · ${routeCount} route${routeCount !== 1 ? 's' : ''}`;

  // Graph health: check for pages missing serving routes
  let unlinkedPages = 0;
  for (const [, node] of graphModel.nodes) {
    if (node.type === 'page') {
      const inbound = graphModel.edgesByTarget.get(node.id) || [];
      if (!inbound.some(e => e.type === 'serves')) unlinkedPages++;
    }
  }
  const isHealthy = unlinkedPages === 0;
  const healthClass = isHealthy ? 'vs-sc-status-healthy' : 'vs-sc-status-warning';
  const healthLabel = isHealthy ? 'Healthy' : `${unlinkedPages} unlinked`;

  // Right side: selection or freshness
  let rightStat = '';
  if (selectedNodeId) {
    const node = graphModel.nodes.get(selectedNodeId);
    if (node) {
      rightStat = `${escapeHtml(node.label || node.id)} selected`;
    }
  } else if (graphModel.builtAt) {
    const secs = Math.round((Date.now() - new Date(graphModel.builtAt).getTime()) / 1000);
    rightStat = secs < 60 ? `Graph built ${secs}s ago` : `Graph built ${Math.round(secs / 60)}m ago`;
  } else if (graphModel.buildTimeMs) {
    rightStat = `Built in ${graphModel.buildTimeMs}ms`;
  }

  return `
    <span class="vs-sc-status-stat">
      <span class="vs-sc-status-dot ${healthClass}"></span>
      ${stats}
      <span class="vs-sc-status-sep">·</span>
      <span class="${healthClass}">${healthLabel}</span>
    </span>
    <span class="vs-sc-status-stat">${rightStat}</span>
  `;
}

// ═══════════════════════════════════════════
//  Selection & Interaction
// ═══════════════════════════════════════════

/**
 * Select a node (any type). Updates lastSelectedPageId for page nodes.
 * Triggers blast-radius fetch.
 */
function selectNode(nodeId) {
  // Clear proposal mode on any selection change
  if (proposalRouteId) {
    setProposalRouteId(null);
    setProposalOriginNodeId(null);
    setProposalInputValue('');
    setProposalApplyState('idle');
    setProposalApplyError(null);
    setProposalApplyResult(null);
  }
  // Clear move proposal on selection change
  if (moveProposalMode) {
    resetMoveState();
    setProposalApplyState('idle');
    setProposalApplyError(null);
    setProposalApplyResult(null);
  }
  // Clear rename/delete mode on selection change
  if (renameMode) {
    exitRenameMode();
  }
  if (deleteMode) {
    exitDeleteMode();
  }
  setSelectedNodeId(nodeId);
  saveSelectedNode(nodeId);
  if (nodeId && nodeId.startsWith('page:')) {
    setLastSelectedPageId(nodeId);
  }
  if (nodeId) {
    fetchBlastRadius(nodeId);
  }
  refreshView();
}

function deselectNode() {
  setProposalRouteId(null);
  setProposalOriginNodeId(null);
  setProposalInputValue('');
  setProposalApplyState('idle');
  setProposalApplyError(null);
  setProposalApplyResult(null);
  if (moveProposalMode) {
    resetMoveState();
  }
  if (renameMode) {
    resetRenameState();
  }
  if (deleteMode) {
    resetDeleteState();
  }
  setSelectedNodeId(null);
  saveSelectedNode(null);
  refreshView();
}

/**
 * Fetch blast radius asynchronously. Caches per node ID.
 * Triggers refreshView() when data arrives.
 */
async function fetchBlastRadius(nodeId) {
  if (blastRadiusCache.has(nodeId)) return;
  setBlastRadiusLoadingFor(nodeId);
  refreshView();
  const { ok, data } = await api.get(
    '/site-graph/blast-radius?node=' + encodeURIComponent(nodeId)
  );
  // Only update state if this node is still the one we're loading for.
  if (blastRadiusLoadingFor !== nodeId) return;
  setBlastRadiusLoadingFor(null);
  if (ok && data) {
    blastRadiusCache.set(nodeId, data);
  }
  refreshView();
}

/**
 * Execute the URL rename apply — POST to backend, handle success/error.
 * Called only from the armed-confirm click handler.
 */
async function performApply() {
  if (window.demoGuard?.()) return;
  if (!proposalRouteId || !proposalInputValue) return;

  // Use the exported validator to get the canonical cleanPath —
  // this is the same normalization the proposal panel displays.
  const routeNode = graphModel?.nodes.get(proposalRouteId);
  const currentPath = routeNode?.label || routeNode?.id || '';
  const validation = validateProposalUrl(proposalInputValue, currentPath);

  // Belt-and-suspenders: don't POST if validation fails
  if (!validation.valid) {
    setProposalApplyState('idle');
    refreshView();
    return;
  }

  setProposalApplyState('applying');
  setProposalApplyError(null);
  refreshView();

  const { ok, data, error } = await api.post('/site-control/url-rename', {
    routeId: proposalRouteId,
    newPath: validation.cleanPath,
  });

  if (ok && data) {
    // ── Success ──
    setProposalApplyState('success');
    setProposalApplyResult(data);
    setLastMutationSuggestedPrompt(data.suggestedPrompt || null);

    // Set selection identity BEFORE graph reload to prevent deselection flash
    if (data.newPageId) {
      setSelectedNodeId(data.newPageId);
      setLastSelectedPageId(data.newPageId);
    }

    // Reload graph
    const graphResponse = await api.get('/site-graph');
    if (graphResponse.ok && graphResponse.data) {
      setGraphModel(normalizeGraph(graphResponse.data));
      blastRadiusCache.clear();
      setHierarchyTree(buildHierarchyTree());
    }

    // Restore blast radius for the preserved selection
    if (data.newPageId) {
      fetchBlastRadius(data.newPageId);
    }

    // Reconcile editor tabs — remap old file path to new
    if (data.oldPath && data.newPath) {
      const oldFile = data.oldPath.replace(/^\//, '') + '.php';
      const newFile = data.newPath.replace(/^\//, '') + '.php';
      window.__vsEditorPage?.reconcileMove?.(oldFile, newFile);
    }

    refreshView();

    // Auto-exit proposal after a brief success flash
    setTimeout(() => {
      exitProposalMode();
      refreshView();
    }, 1500);
  } else {
    // ── Failure ──
    setProposalApplyState('error');
    setProposalApplyError(error || { message: 'An unknown error occurred.' });
    refreshView();
  }
}

/**
 * Enter move proposal mode — preflight fetch then populate state.
 */
async function enterMoveMode(nodeId) {
  enterMoveProposalMode(nodeId);
  refreshView();

  // Fetch preflight
  const { ok, data } = await api.get(
    '/site-control/nav-preflight?pageId=' + encodeURIComponent(nodeId)
  );

  setMovePreflightLoading(false);

  if (!ok || !data) {
    setMoveNavStatus('nav_parse_error');
    refreshView();
    return;
  }

  setMoveNavStatus(data.navStatus || null);
  setMoveIsInNav(data.isInNav || false);
  setMoveIsHomepage(data.isHomepage || false);
  setMoveCurrentPosition(data.currentPosition || null);
  setMoveNavTree(data.navTree || null);
  setMoveHasHomeEntry(data.hasHomeEntry || false);
  setMoveNormalizationRequired(data.navStatus === 'needs_normalization');

  // Auto-select the current parent scope and position so the pill
  // strip renders immediately (no manual "Move to" parent selection needed)
  if (data.currentPosition) {
    setMoveTargetParentHref(data.currentPosition.parentHref ?? null);
    setMoveTargetIndex(data.currentPosition.index ?? 0);
  }

  refreshView();
}

/**
 * Execute the move apply — routes to the correct backend:
 * - Parent changed → /site-control/structural-move (filesystem + nav + references)
 * - Same parent, different position → /site-control/nav-reorder (nav only)
 */
async function performMoveApply() {
  if (window.demoGuard?.()) return;
  if (!selectedNodeId || moveTargetIndex === null) return;

  // Detect whether the parent changed
  const currentParentHref = moveCurrentPosition?.parentHref ?? null;
  const parentChanged = moveTargetParentHref !== currentParentHref;

  setProposalApplyState('applying');
  setProposalApplyError(null);
  refreshView();

  if (parentChanged) {
    // ── Structural move: filesystem-backed parent change ──
    // Convert href to slug: '/work' → 'work', null → ''
    const targetParentSlug = moveTargetParentHref
      ? moveTargetParentHref.replace(/^\//, '')
      : '';

    const { ok, data, error } = await api.post('/site-control/structural-move', {
      pageId: selectedNodeId,
      targetParent: targetParentSlug,
    });

    if (ok && data) {
      setProposalApplyState('success');
      setProposalApplyResult(data);

      // Reconcile open editor tabs: structural move changed file paths
      if (data.movedPages?.length > 0 && window.__vsEditorPage) {
        for (const mp of data.movedPages) {
          window.__vsEditorPage.reconcileMove?.(mp.oldFilePath, mp.newFilePath);
        }
      }

      // Reload graph with new structure
      const graphResponse = await api.get('/site-graph');
      if (graphResponse.ok && graphResponse.data) {
        setGraphModel(normalizeGraph(graphResponse.data));
        blastRadiusCache.clear();
        setHierarchyTree(buildHierarchyTree());
      }

      // Re-select the moved page by its new file path
      let newNodeId = selectedNodeId;
      if (data.movedPages?.length > 0) {
        const firstMoved = data.movedPages[0];
        newNodeId = 'page:' + firstMoved.newFilePath;
        setSelectedNodeId(newNodeId);
        setLastSelectedPageId(newNodeId);
        fetchBlastRadius(newNodeId);
      }

      // Apply user's chosen sibling position via nav-reorder.
      // structural-move places the page via its own nav relocation logic,
      // so we always follow up with a reorder to put it exactly where
      // the user's pill-strip indicated.
      const reorder = await api.post('/site-control/nav-reorder', {
        pageId: newNodeId,
        targetParentHref: moveTargetParentHref,
        targetIndex: moveTargetIndex,
      });

      // no_change (already at requested position) is fine — structural move
      // placed it where we wanted. Any other failure is a real problem.
      const reorderFailed = !reorder.ok
        && reorder.error?.code !== 'no_change'
        && reorder.error?.code !== 'page_not_in_nav';

      if (reorderFailed) {
        // Structural move succeeded but position placement failed.
        // Surface it so the user knows the file moved but nav position is off.
        setProposalApplyState('error');
        setProposalApplyError({
          message: 'Page moved successfully, but could not set the requested position: '
            + (reorder.error?.message || 'Unknown error'),
        });
        refreshView();
        return;
      }

      // Reload graph one more time to reflect final position
      const graphResponse2 = await api.get('/site-graph');
      if (graphResponse2.ok && graphResponse2.data) {
        setGraphModel(normalizeGraph(graphResponse2.data));
        blastRadiusCache.clear();
        setHierarchyTree(buildHierarchyTree());
      }

      refreshView();

      // Auto-exit after success flash
      setTimeout(() => {
        exitMoveProposalMode();
        refreshView();
      }, 1500);
    } else {
      // ── Failure ──
      setProposalApplyState('error');
      setProposalApplyError(error || { message: 'An unknown error occurred.' });
      refreshView();
    }
  } else {
    // ── Nav reorder only: same parent, different sibling position ──
    const body = {
      pageId: selectedNodeId,
      targetParentHref: moveTargetParentHref,
      targetIndex: moveTargetIndex,
    };

    const { ok, data, error } = await api.post('/site-control/nav-reorder', body);

    if (ok && data) {
      setProposalApplyState('success');
      setProposalApplyResult(data);

      // Preserve selection identity before graph reload
      const preserveId = selectedNodeId;
      setSelectedNodeId(preserveId);
      setLastSelectedPageId(preserveId);

      // Reload graph
      const graphResponse = await api.get('/site-graph');
      if (graphResponse.ok && graphResponse.data) {
        setGraphModel(normalizeGraph(graphResponse.data));
        blastRadiusCache.clear();
        setHierarchyTree(buildHierarchyTree());
      }

      // Restore blast radius
      fetchBlastRadius(preserveId);

      refreshView();

      // Auto-exit after success flash
      setTimeout(() => {
        exitMoveProposalMode();
        refreshView();
      }, 1500);
    } else {
      // ── Failure ──
      setProposalApplyState('error');
      setProposalApplyError(error || { message: 'An unknown error occurred.' });
      refreshView();
    }
  }
}

/**
 * Execute page rename — POST to backend, handle success/error.
 */
async function performRename(newTitle) {
  if (window.demoGuard?.()) return;
  if (!selectedNodeId || !newTitle) return;

  setRenameApplyState('applying');
  setRenameError(null);
  refreshView();

  const body = {
    pageId: selectedNodeId,
    newTitle,
  };

  const { ok, data, error } = await api.post('/site-control/page-rename', body);

  if (ok && data) {
    // ── Success ──
    setRenameApplyState('success');
    setRenameResult(data);

    // Preserve selection identity before graph reload
    const preserveId = selectedNodeId;
    setSelectedNodeId(preserveId);
    setLastSelectedPageId(preserveId);

    // Reload graph (title may have changed on the card)
    const graphResponse = await api.get('/site-graph');
    if (graphResponse.ok && graphResponse.data) {
      setGraphModel(normalizeGraph(graphResponse.data));
      blastRadiusCache.clear();
      setHierarchyTree(buildHierarchyTree());
    }

    // Restore blast radius
    fetchBlastRadius(preserveId);

    refreshView();

    // Auto-exit after success flash
    setTimeout(() => {
      exitRenameMode();
      refreshView();
    }, 1500);
  } else {
    // ── Failure ──
    setRenameApplyState('error');
    setRenameError(error?.message || 'An unknown error occurred.');
    refreshView();
  }
}

/**
 * Execute page delete — POST to backend, handle success/error.
 */
async function performDelete() {
  if (window.demoGuard?.()) return;
  if (!selectedNodeId) return;

  setDeleteApplyState('applying');
  setDeleteError(null);
  refreshView();

  const { ok, data, error } = await api.post('/site-control/page-delete', {
    pageId: selectedNodeId,
  });

  if (ok && data) {
    // ── Success ──
    setDeleteApplyState('success');
    setDeleteResult(data);
    refreshView();

    // After success flash, deselect and reload graph
    setTimeout(async () => {
      // Reconcile editor tabs — close the deleted file
      const deletedFile = data.deletedPage?.filePath;
      if (deletedFile) {
        window.__vsEditorPage?.reconcileDelete?.(deletedFile);
      }

      setSelectedNodeId(null);
      setLastSelectedPageId(null);

      const graphResponse = await api.get('/site-graph');
      if (graphResponse.ok && graphResponse.data) {
        setGraphModel(normalizeGraph(graphResponse.data));
        blastRadiusCache.clear();
        setHierarchyTree(buildHierarchyTree());
      }

      resetDeleteState();
      refreshView();
    }, 1800);
  } else {
    // ── Failure ──
    setDeleteApplyState('error');
    setDeleteError(error?.message || 'An unknown error occurred.');
    refreshView();
  }
}

function toggleExpand(pageId) {
  const group = document.querySelector(`.vs-site-tree-group[data-tree-group="${pageId}"]`);
  if (collapsedPages.has(pageId)) {
    collapsedPages.delete(pageId);
    if (group) group.classList.remove('is-collapsed');
  } else {
    collapsedPages.add(pageId);
    if (group) group.classList.add('is-collapsed');
  }
}

function refreshView() {
  const root = document.getElementById('vs-site-root');
  if (!root) return;

  // Preserve proposal input focus/caret across re-render
  const proposalFocused = document.activeElement?.id === 'vs-proposal-url';
  const caretPos = proposalFocused ? document.activeElement.selectionStart : null;

  // Preserve rename input focus/value/caret across re-render
  const renameFocused = document.activeElement?.id === 'vs-sc-rename-input';
  const renameVal = renameFocused ? document.activeElement.value : null;
  const renameCaret = renameFocused ? document.activeElement.selectionStart : null;

  // Preserve filter input focus and caret
  const filterFocused = document.activeElement?.id === 'vs-sc-search';
  const filterCaret = filterFocused ? document.activeElement.selectionStart : null;

  // Full re-render workspace
  renderWorkspace(root);

  // Restore proposal input focus/caret if it was focused before re-render
  if (proposalFocused) {
    const newInput = document.getElementById('vs-proposal-url');
    if (newInput) {
      newInput.focus();
      if (caretPos !== null) {
        newInput.setSelectionRange(caretPos, caretPos);
      }
    }
  }

  // Restore rename input focus/value/caret
  if (renameFocused) {
    const newInput = document.getElementById('vs-sc-rename-input');
    if (newInput) {
      newInput.value = renameVal;
      newInput.focus();
      if (renameCaret !== null) {
        newInput.setSelectionRange(renameCaret, renameCaret);
      }
    }
  }

  // Restore filter input focus and caret
  if (filterFocused) {
    const newInput = document.getElementById('vs-sc-search');
    if (newInput) {
      newInput.focus();
      if (filterCaret !== null) {
        newInput.setSelectionRange(filterCaret, filterCaret);
      }
    }
  }
}

// ═══════════════════════════════════════════
//  Event Binding
// ═══════════════════════════════════════════

function bindWorkspaceEvents(root) {
  // ── Left panel: filter input ──
  const searchInput = root.querySelector('#vs-sc-search');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setFilterText(searchInput.value.trim());
        setHierarchyTree(buildHierarchyTree());
        refreshView();
        document.getElementById('vs-sc-search')?.focus();
      }, 150);
    });
  }

  // ── Left panel: nav section collapse toggles ──
  root.querySelectorAll('.vs-sc-nav-section-header[data-nav-section]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.navSection;
      const section = btn.closest('.vs-sc-nav-section');
      if (!section) return;

      if (impactCollapsedSections.has(key)) {
        impactCollapsedSections.delete(key);
        section.classList.remove('is-collapsed');
      } else {
        impactCollapsedSections.add(key);
        section.classList.add('is-collapsed');
      }
      saveCollapsedSections();
    });
  });

  // ── Left panel: tree item clicks (page selection) ──
  root.querySelectorAll('.vs-site-tree-item[data-page-id]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.vs-site-tree-toggle')) return;
      const pageId = el.dataset.pageId;
      if (pageId) selectNode(pageId);
    });
  });

  // ── Left panel: tree expand/collapse toggles ──
  root.querySelectorAll('.vs-site-tree-toggle[data-toggle-page]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pageId = btn.dataset.togglePage;
      if (pageId) toggleExpand(pageId);
    });
  });

  // ── Left panel: entity item clicks ──
  root.querySelectorAll('.vs-impact-item[data-node-id]').forEach(el => {
    el.addEventListener('click', () => {
      const nodeId = el.dataset.nodeId;
      if (nodeId) selectNode(nodeId);
    });
  });

  // ── Canvas: diagram card clicks ──
  root.querySelectorAll('.vs-site-card[data-page-id]').forEach(el => {
    el.addEventListener('click', () => {
      const pageId = el.dataset.pageId;
      if (pageId) selectNode(pageId);
    });
  });

  // ── Canvas: background click (deselect) ──
  const diagram = root.querySelector('#vs-site-diagram');
  if (diagram) {
    diagram.addEventListener('click', (e) => {
      if (e.target === diagram || e.target.classList.contains('vs-site-tiers')) {
        // Armed state: disarm instead of deselecting
        if (proposalApplyState === 'armed') {
          setProposalApplyState('idle');
          refreshView();
          return;
        }
        if (deleteApplyState === 'armed') {
          setDeleteApplyState('idle');
          refreshView();
          return;
        }

        deselectNode();
      }
    });
  }

  // ── Right panel: close inspect (deselect) ──
  root.querySelectorAll('[data-action="close-inspect"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deselectNode();
    });
  });

  // ── Right panel: relationship navigation clicks ──
  root.querySelectorAll('.vs-impact-ref-item[data-node-id]').forEach(el => {
    el.addEventListener('click', () => {
      const nodeId = el.dataset.nodeId;
      if (nodeId) selectNode(nodeId);
    });
  });

  // ── Right panel: collapsible card toggles ──
  root.querySelectorAll('[data-card-toggle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cardKey = btn.dataset.cardToggle;
      if (!cardKey) return;
      const card = btn.closest('.vs-impact-card');
      const isCurrentlyCollapsed = card?.classList.contains('is-collapsed');
      // Toggle: write preference and re-render from state
      cardPreferences.set(cardKey, isCurrentlyCollapsed ? 'open' : 'closed');
      saveCardPreferences();
      refreshView();
    });
  });

  // ── Action bar: overflow toggle ──
  root.querySelectorAll('[data-action="overflow"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const overflow = btn.closest('.vs-sc-action-overflow');
      if (!overflow) return;
      const isOpen = overflow.classList.toggle('is-open');
      if (isOpen) {
        // Close on outside click
        const closeOverflow = (evt) => {
          if (!overflow.contains(evt.target)) {
            overflow.classList.remove('is-open');
            document.removeEventListener('click', closeOverflow, true);
          }
        };
        // Close on Escape
        const closeOnEsc = (evt) => {
          if (evt.key === 'Escape') {
            evt.stopPropagation();
            evt.preventDefault();
            overflow.classList.remove('is-open');
            document.removeEventListener('keydown', closeOnEsc, true);
            document.removeEventListener('click', closeOverflow, true);
          }
        };
        // Delay to avoid the current click from immediately closing
        setTimeout(() => {
          document.addEventListener('click', closeOverflow, true);
          document.addEventListener('keydown', closeOnEsc, true);
        }, 0);
      }
    });
  });

  // ── Action bar: stub actions (Phase 1) ──
  root.querySelectorAll('.vs-sc-action-bar [data-action]').forEach(btn => {
    const action = btn.dataset.action;
    // Skip actions with dedicated handlers (change-url, move, reorder, rename, delete, overflow)
    if (action === 'change-url' || action === 'move' || action === 'reorder' || action === 'rename' || action === 'delete' || action === 'overflow') return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bar = btn.closest('.vs-sc-action-bar');
      const nodeId = bar?.dataset.forNode || selectedNodeId;
      console.log('Action stub:', action, nodeId);
    });
  });

  // ── Rename mode: "✎ Rename" button ──
  root.querySelectorAll('[data-action="rename"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (selectedNodeId) {
        enterRenameMode(selectedNodeId);
        refreshView();
        // Auto-focus and auto-select the input after render
        setTimeout(() => {
          const input = document.getElementById('vs-sc-rename-input');
          if (input) {
            input.focus();
            input.select();
          }
        }, 50);
      }
    });
  });

  // ── Rename mode: close button ──
  root.querySelectorAll('[data-action="close-rename"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      exitRenameMode();
      refreshView();
    });
  });

  // ── Rename mode: input validation + enter to submit ──
  const renameInput = root.querySelector('#vs-sc-rename-input');
  if (renameInput) {
    const updateRenameValidation = () => {
      const val = renameInput.value.trim();
      const submitBtn = document.getElementById('vs-sc-rename-submit');
      const hint = document.getElementById('vs-sc-rename-hint');
      const node = graphModel?.nodes.get(selectedNodeId);
      const originalTitle = node?.label || '';

      if (!val) {
        if (submitBtn) submitBtn.disabled = true;
        if (hint) { hint.textContent = 'Title cannot be empty'; hint.className = 'vs-sc-form-hint is-error'; }
      } else if (val === originalTitle) {
        if (submitBtn) submitBtn.disabled = true;
        if (hint) { hint.textContent = 'Same as current title'; hint.className = 'vs-sc-form-hint is-neutral'; }
      } else {
        if (submitBtn) submitBtn.disabled = false;
        if (hint) { hint.textContent = ''; hint.className = 'vs-sc-form-hint'; }
      }
    };

    renameInput.addEventListener('input', updateRenameValidation);
    renameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const submitBtn = document.getElementById('vs-sc-rename-submit');
        if (submitBtn && !submitBtn.disabled) {
          performRename(renameInput.value.trim());
        }
      }
      if (e.key === 'Escape') {
        e.stopPropagation();
        exitRenameMode();
        refreshView();
      }
    });

    // Run initial validation
    updateRenameValidation();
  }

  // ── Rename mode: submit button ──
  root.querySelectorAll('[data-action="rename-submit"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const input = document.getElementById('vs-sc-rename-input');
      if (input) {
        performRename(input.value.trim());
      }
    });
  });

  // ── Delete mode: "Delete" button in More dropdown ──
  root.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (selectedNodeId) {
        enterDeleteMode(selectedNodeId);
        refreshView();
      }
    });
  });

  // ── Delete mode: close button ──
  root.querySelectorAll('[data-action="close-delete"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      exitDeleteMode();
      refreshView();
    });
  });

  // ── Delete mode: arm button ──
  root.querySelectorAll('[data-action="delete-arm"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setDeleteApplyState('armed');
      refreshView();
      // Auto-revert after 3s if not confirmed
      clearTimeout(window._vsArmTimer);
      window._vsArmTimer = setTimeout(() => {
        if (deleteApplyState === 'armed') {
          setDeleteApplyState('idle');
          refreshView();
        }
      }, 3000);
    });
  });

  // ── Delete mode: confirm (second click) ──
  root.querySelectorAll('[data-action="delete-confirm"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      performDelete();
    });
  });

  // ── Proposal mode: "Change URL" button ──
  root.querySelectorAll('[data-action="change-url"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (selectedNodeId) {
        enterProposalMode(selectedNodeId, refreshView);
        refreshView();
      }
    });
  });

  // ── Proposal mode: close buttons ──
  root.querySelectorAll('[data-action="close-proposal"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      exitProposalMode();
      refreshView();
    });
  });

  // ── Proposal apply: arm (first click) ──
  root.querySelectorAll('[data-action="apply-proposal-arm"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setProposalApplyState('armed');
      setProposalApplyError(null);
      refreshView();
      // Auto-revert after 3s if not confirmed
      clearTimeout(window._vsArmTimer);
      window._vsArmTimer = setTimeout(() => {
        if (proposalApplyState === 'armed') {
          setProposalApplyState('idle');
          refreshView();
        }
      }, 3000);
    });
  });

  // ── Proposal apply: confirm (second click — perform POST) ──
  root.querySelectorAll('[data-action="apply-proposal-confirm"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await performApply();
    });
  });

  // ── Proposal mode: group header navigation ──
  root.querySelectorAll('[data-navigate-node]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const nodeId = el.dataset.navigateNode;
      if (nodeId) selectNode(nodeId);
    });
  });


  // ── Move: "Move" action bar button ──
  // Re-exposed nav-reorder (Phase 2B) — changes sibling order in canonical nav
  root.querySelectorAll('[data-action="reorder"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bar = btn.closest('.vs-sc-action-bar');
      const nodeId = bar?.dataset.forNode || selectedNodeId;
      if (nodeId) {
        enterMoveMode(nodeId);
      }
    });
  });


  // ── Move proposal: close button ──
  root.querySelectorAll('[data-action="close-move-proposal"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      exitMoveProposalMode();
      refreshView();
    });
  });

  // ── Move proposal: parent selection ──
  root.querySelectorAll('[data-action="select-move-parent"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentHref = btn.dataset.parentHref;
      const resolvedParent = parentHref === '__root__' ? null : parentHref;
      setMoveTargetParentHref(resolvedParent);

      // If switching back to the original parent, restore the original index.
      // Otherwise, compute the end position (after all existing siblings).
      if (moveCurrentPosition &&
          resolvedParent === (moveCurrentPosition.parentHref ?? null)) {
        setMoveTargetIndex(moveCurrentPosition.index ?? 0);
      } else {
        // Compute sibling count for the new parent so moveTargetIndex
        // is always a concrete number (never null).
        const node = graphModel?.nodes.get(selectedNodeId);
        const pageHref = node?.meta?.isHomepage ? '/' : '/' + (node?.meta?.slug || '');
        let siblingCount = 0;
        if (moveNavTree) {
          if (resolvedParent === null) {
            siblingCount = moveNavTree.filter(e => e.href !== pageHref).length;
          } else {
            for (const entry of moveNavTree) {
              if (entry.href === resolvedParent) {
                siblingCount = (entry.children || []).filter(c => c.href !== pageHref).length;
                break;
              }
            }
          }
        }
        setMoveTargetIndex(siblingCount); // place at end by default
      }

      setProposalApplyState('idle');
      refreshView();
    });
  });

  // ── Move proposal: position selection ──
  root.querySelectorAll('[data-action="select-move-position"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setMoveTargetIndex(parseInt(btn.dataset.position, 10));
      setProposalApplyState('idle');
      refreshView();
    });
  });

  // ── Move proposal: arm (first click on Apply) ──
  root.querySelectorAll('[data-action="apply-move-arm"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setProposalApplyState('armed');
      setProposalApplyError(null);
      refreshView();
      // Auto-revert after 3s if not confirmed
      clearTimeout(window._vsArmTimer);
      window._vsArmTimer = setTimeout(() => {
        if (proposalApplyState === 'armed') {
          setProposalApplyState('idle');
          refreshView();
        }
      }, 3000);
    });
  });

  // ── Move proposal: confirm (second click — perform POST) ──
  root.querySelectorAll('[data-action="apply-move-confirm"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await performMoveApply();
    });
  });

  // ── Proposal mode: URL input ──
  const proposalInput = root.querySelector('#vs-proposal-url');
  if (proposalInput) {
    let debounceTimer = null;
    proposalInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setProposalInputValue(proposalInput.value);
        refreshView();
      }, 200);
    });
    proposalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') e.preventDefault();
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        // If armed, disarm instead of closing proposal
        if (proposalApplyState === 'armed') {
          setProposalApplyState('idle');
          refreshView();
          return;
        }
        exitProposalMode();
        refreshView();
      }
    });
    // Auto-focus only on initial entry
    if (proposalJustEntered) {
      setProposalJustEntered(false);
      setTimeout(() => proposalInput.focus(), 0);
    }
  }

  // ── Right panel: deselect on empty space click ──
  const rightBody = root.querySelector('#vs-sc-right-body');
  if (rightBody) {
    rightBody.addEventListener('click', (e) => {
      // Interactive elements always pass through to dedicated handlers
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) return;
      // Inside proposal panel or new form panel: disarm if armed, otherwise ignore
      if (e.target.closest('.vs-proposal-panel') || e.target.closest('.vs-sc-form')) {
        if (proposalApplyState === 'armed') {
          setProposalApplyState('idle');
          refreshView();
        }
        if (deleteApplyState === 'armed') {
          setDeleteApplyState('idle');
          refreshView();
        }
        return;
      }
      if (e.target.closest('.vs-impact-detail-content')) return;
      if (e.target.closest('.vs-sc-summary')) return;
      // Armed state: disarm instead of deselecting
      if (proposalApplyState === 'armed') {
        setProposalApplyState('idle');
        refreshView();
        return;
      }
      if (deleteApplyState === 'armed') {
        setDeleteApplyState('idle');
        refreshView();
        return;
      }
      deselectNode();
    });
  }

  // ── Left panel: deselect on empty scroll area ──
  const leftScroll = root.querySelector('#vs-sc-left-scroll');
  if (leftScroll) {
    leftScroll.addEventListener('click', (e) => {
      if (e.target === leftScroll) {
        // Armed state: disarm instead of deselecting
        if (proposalApplyState === 'armed') {
          setProposalApplyState('idle');
          refreshView();
          return;
        }
        if (deleteApplyState === 'armed') {
          setDeleteApplyState('idle');
          refreshView();
          return;
        }
        deselectNode();
      }
    });
  }

  // ── Escape key (deselect) — install once at module level ──
  if (!escListenerInstalled) {
    setEscListenerInstalled(true);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Armed state: disarm first (highest priority)
        if (proposalApplyState === 'armed') {
          setProposalApplyState('idle');
          refreshView();
          return;
        }
        // Delete armed state: disarm
        if (deleteApplyState === 'armed') {
          setDeleteApplyState('idle');
          refreshView();
          return;
        }
        // Delete mode: exit without deselecting
        if (deleteMode && document.activeElement?.tagName !== 'INPUT') {
          exitDeleteMode();
          refreshView();
          return;
        }
        // Rename mode: exit without deselecting (input handles its own Escape)
        if (renameMode && document.activeElement?.tagName !== 'INPUT') {
          exitRenameMode();
          refreshView();
          return;
        }
        // Normal deselect
        if (selectedNodeId && document.activeElement?.tagName !== 'INPUT') {
          deselectNode();
        }
      }
    });
  }

  // ── Window resize: recompute connectors when viewport changes ──
  if (_resizeHandler) window.removeEventListener('resize', _resizeHandler);
  {
    let resizeTimer;
    _resizeHandler = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        requestAnimationFrame(() => computeConnectors(hierarchyTree));
      }, 150);
    };
    window.addEventListener('resize', _resizeHandler);
  }

  // ── Sidebar resize handles (both left and right panels) ──
  root.querySelectorAll('.vs-editor-resize[data-resize-panel]').forEach(handle => {
    const panelId = handle.dataset.resizePanel;
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const isRightSide = handle.dataset.resizeSide === 'left';

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handle.classList.add('is-dragging');

      if (isRightSide) {
        // Right panel: resize from the left edge
        const onMove = (e2) => {
          const parentRect = panel.parentElement.getBoundingClientRect();
          const newWidth = Math.min(400, Math.max(240, parentRect.right - e2.clientX));
          panel.style.width = newWidth + 'px';
        };
        const onUp = () => {
          handle.classList.remove('is-dragging');
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          saveSidebarWidth('right', panel.offsetWidth);
          requestAnimationFrame(() => computeConnectors(hierarchyTree));
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      } else {
        // Left panel: resize from the right edge
        const panelRect = panel.getBoundingClientRect();
        const onMove = (e2) => {
          const newWidth = Math.min(360, Math.max(180, e2.clientX - panelRect.left));
          panel.style.width = newWidth + 'px';
        };
        const onUp = () => {
          handle.classList.remove('is-dragging');
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          saveSidebarWidth('left', panel.offsetWidth);
          requestAnimationFrame(() => computeConnectors(hierarchyTree));
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      }
    });
  });
}
