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

import { api, apiStream } from '../../../api.js';
import { store } from '../../../state.js';
import { icons } from '../../icons.js';
import { escapeHtml } from '../../helpers.js';
import { reconcileEditorPaths } from './editor-reconciliation.js';
import { waitForPlanResult } from './plan-recovery.js';
import { siteMutation, recoverSiteMutation, getPendingMutation } from './mutation-recovery.js';
import { captureSelectionFocus, restoreSelectionFocus } from './selection-focus.js';

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
import {
  renderOrchestrationConsole,
  orchState,
  isOrchBusy,
  orchPrompt,
  orchLog,
  setOrchState,
  setOrchPrompt,
  appendOrchLog,
  clearOrchLog,
  orchResult,
  setOrchResult,
  orchPlan,
  setOrchPlan,
  isConsoleCollapsed,
  saveConsoleCollapsed,
  saveConsoleHeight,
} from './orchestration-console.js';

// ── Window resize: debounced connector recompute ──
let _resizeHandler = null;
let graphRefreshFailed = false;

// ═══════════════════════════════════════════
//  Entry Point
// ═══════════════════════════════════════════

export function renderSiteControlView() {
  setTimeout(async () => {
    if (getPendingMutation()) { await recoverPendingSiteMutation(); return; }
    await loadSiteMap();
    if (orchState === 'recovering' && orchPlan?.plan_id) recoverApplyResult(orchPlan.plan_id);
  }, 0);

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
    if (orchState !== 'idle') {
      graphRefreshFailed = true;
      appendOrchLog({ type: 'error', message: 'Could not refresh site structure. Reload Site before another change.', time: Date.now() });
      refreshView();
      return;
    }
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
  graphRefreshFailed = false;
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
        <div class="vs-sc-canvas-diagram">
          <div class="vs-site-diagram" id="vs-site-diagram">
            ${graphModel ? renderDiagram(hierarchyTree) : '<div class="vs-site-diagram-empty">Site structure is not available yet</div>'}
          </div>
          <div class="vs-sc-status-bar" id="vs-sc-status-bar">
            ${renderStatusBar()}
          </div>
        </div>
        ${renderOrchestrationConsole()}
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

  const stats = [
    `${pageCount} page${pageCount !== 1 ? 's' : ''}`,
    `${partialCount} partial${partialCount !== 1 ? 's' : ''}`,
    `${routeCount} route${routeCount !== 1 ? 's' : ''}`,
  ];

  // Graph health: check for pages missing serving routes
  let unlinkedPages = 0;
  for (const [, node] of graphModel.nodes) {
    if (node.type === 'page') {
      const inbound = graphModel.edgesByTarget.get(node.id) || [];
      if (!inbound.some(e => e.type === 'serves')) unlinkedPages++;
    }
  }
  const warningCount = graphModel.summary.warnings || graphModel.warnings?.length || 0;
  const isHealthy = unlinkedPages === 0 && !graphRefreshFailed && warningCount === 0;
  const healthClass = isHealthy ? 'vs-sc-status-healthy' : 'vs-sc-status-warning';
  const healthLabel = graphRefreshFailed ? 'Structure refresh failed'
    : warningCount ? `${warningCount} item${warningCount === 1 ? '' : 's'} need review`
      : isHealthy ? 'Routes indexed' : `${unlinkedPages} unlinked`;

  // Selection is already visible in the tree, canvas and Inspect header.
  let rightStat = '';
  if (!selectedNodeId && graphModel.builtAt) {
    const secs = Math.round((Date.now() - new Date(graphModel.builtAt).getTime()) / 1000);
    rightStat = secs < 60 ? `Graph built ${secs}s ago` : `Graph built ${Math.round(secs / 60)}m ago`;
  } else if (!selectedNodeId && graphModel.buildTimeMs) {
    rightStat = `Built in ${graphModel.buildTimeMs}ms`;
  }

  return `
    <span class="vs-sc-status-stat vs-sc-status-counts">
      ${stats.map(stat => `<span>${stat}</span>`).join('')}
    </span>
    <span class="vs-sc-status-stat">
      <span class="vs-sc-status-dot ${healthClass}"></span>
      <span class="${healthClass}">${healthLabel}</span>
    </span>
    ${rightStat ? `<span class="vs-sc-status-stat">${rightStat}</span>` : ''}
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
  if (siteBusy()) return;
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
  if (siteBusy()) return;
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
  if (siteBusy()) return;
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

  const { ok, data, error } = await performSiteMutation('/site-control/url-rename', {
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
      reconcileEditorPaths([{ oldFilePath: oldFile, newFilePath: newFile }]);
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
  if (siteBusy()) return;
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
  if (siteBusy()) return;
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

    const { ok, data, error } = await performSiteMutation('/site-control/structural-move', {
      pageId: selectedNodeId,
      targetParent: targetParentSlug,
      targetIndex: moveTargetIndex,
    });

    if (ok && data) {
      setProposalApplyState('success');
      setProposalApplyResult(data);

      // Reconcile open editor tabs: structural move changed file paths
      if (data.movedPages?.length > 0) reconcileEditorPaths(data.movedPages);

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

    const { ok, data, error } = await performSiteMutation('/site-control/nav-reorder', body);

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
  if (siteBusy()) return;
  if (window.demoGuard?.()) return;
  if (!selectedNodeId || !newTitle) return;

  setRenameApplyState('applying');
  setRenameError(null);
  refreshView();

  const body = {
    pageId: selectedNodeId,
    newTitle,
  };

  const { ok, data, error } = await performSiteMutation('/site-control/page-rename', body);

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
    setRenameError(error || { message: 'An unknown error occurred.' });
    refreshView();
  }
}

/**
 * Execute page delete — POST to backend, handle success/error.
 */
async function performDelete() {
  if (siteBusy()) return;
  if (window.demoGuard?.()) return;
  if (!selectedNodeId) return;

  setDeleteApplyState('applying');
  setDeleteError(null);
  refreshView();

  const { ok, data, error } = await performSiteMutation('/site-control/page-delete', {
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
        reconcileEditorPaths([], [deletedFile]);
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
    setDeleteError(error || { message: 'An unknown error occurred.' });
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
  const toggle = group?.querySelector('.vs-site-tree-toggle');
  const expanded = !collapsedPages.has(pageId);
  toggle?.setAttribute('aria-expanded', String(expanded));
  const label = graphModel?.nodes.get(pageId)?.label || pageId;
  toggle?.setAttribute('aria-label', `${expanded ? 'Collapse' : 'Expand'} ${label}`);
}

function refreshView() {
  const root = document.getElementById('vs-site-root');
  if (!root) return;

  const selectionFocus = captureSelectionFocus(root, document.activeElement);

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
  restoreSelectionFocus(root, selectionFocus);

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
//  Orchestration — SSE Stream Handler
// ═══════════════════════════════════════════

/**
 * Start an orchestration stream.
 * Sends the prompt to POST /site-control/orchestrate, then
 * processes orch:* SSE events into the action log.
 *
 * @param {string} prompt
 */
async function startOrchestration(prompt) {
  if (siteBusy() || window.demoGuard?.()) return;
  exitProposalMode();
  resetMoveState();
  resetRenameState();
  resetDeleteState();
  setOrchState('running');
  setOrchPrompt(prompt);
  clearOrchLog();
  setOrchResult(null);
  setOrchPlan(null);
  refreshView();

  // Focus the composer back (now disabled, but keeps cursor visible)
  setTimeout(() => document.getElementById('vs-sc-composer-input')?.focus(), 0);

  try {
    await apiStream('/site-control/orchestrate', { prompt }, {
      requireTerminal: true,
      onStatus(data) {
        // Generic status events — append to log
        appendOrchLog({ type: 'info', message: data.message || 'Processing…', time: Date.now() });
        refreshOrchPanel();
      },
      onDone(data) {
        if (orchState === 'running') {
          appendOrchLog({ type: 'done', message: data.summary || data.message || 'Done.', time: Date.now() });

          // Extract payloads from the backend
          const discovery = data.discovery || null;
          const intent = data.intent || null;
          const plan = data.plan || null;

          const hasCandidates = discovery && Array.isArray(discovery.candidates) && discovery.candidates.length > 0;
          const edits = (plan && Array.isArray(plan.edits)) ? plan.edits : [];
          const planId = plan?.plan_id || data.plan_id;
          const hasAnchoredPlan = edits.length > 0 && edits.every(e => e.anchored === true) && !!planId;

          if (hasCandidates) {
            // Hydrate orchPlan with discovery + plan results
            setOrchPlan({
              plan_id: planId,
              intent,
              files: discovery.candidates.map(c => ({
                type: c.type || 'file',
                path: c.file || c.node_id,
                label: c.label || '',
                reason: c.reason || '',
              })),
              affected_pages: (discovery.affected_pages || []).map(p => ({
                label: p.label || '',
                slug: p.slug || '',
              })),
              skipped: (discovery.skipped || []).map(s => ({
                path: s.path || '',
                reason: s.reason || '',
              })),
              // Plan edits from B5
              edits,
              risk_level: plan?.risk_level || 'medium',
              plan_summary: plan?.summary || '',
              anchored_count: plan?.anchored_count || 0,
              unanchored_count: plan?.unanchored_count || 0,
            });

            // Honest state: 'plan' only when we have anchored edits
            if (hasAnchoredPlan) {
              setOrchState('plan');
            } else {
              setOrchState('plan_failed');
            }
          } else {
            setOrchState('complete');
          }

          setOrchResult({
            filesChanged: data.filesChanged || 0,
            summary: data.summary || data.message || 'Orchestration complete.',
          });
          refreshView();
        }
      },
      onError(err) {
        setOrchState('plan_failed');
        setOrchResult({ filesChanged: 0, summary: err.message || 'Orchestration failed.' });
        appendOrchLog({ type: 'error', message: err.message || 'Error during orchestration.', time: Date.now() });
        refreshView();
      },
    });
  } catch (err) {
    setOrchState('plan_failed');
    setOrchResult({ filesChanged: 0, summary: 'Connection error.' });
    appendOrchLog({ type: 'error', message: 'Connection lost during orchestration.', time: Date.now() });
    refreshView();
  }
}

/**
 * Apply approved edits via POST /site-control/apply.
 * Only called after user clicks "Approve & Apply".
 * Sends the identifier of the complete server-retained reviewed plan.
 */
async function applyPlan() {
  if (siteBusy() || window.demoGuard?.()) return;
  if (!orchPlan?.plan_id || !orchPlan.edits?.length || !orchPlan.edits.every(e => e.anchored === true)) return;
  const planId = orchPlan.plan_id;

  setOrchState('applying');
  refreshView();

  try {
    await apiStream('/site-control/apply', { plan_id: planId }, {
      requireTerminal: true,
      onStatus(data) {
        appendOrchLog({
          phase: data.phase || 'status',
          status: data.status || 'ok',
          file: data.file || '',
          message: data.message || '',
          bytes: data.bytes || null,
          ms: data.ms || null,
          time: Date.now(),
        });
        refreshOrchPanel();
      },
      onDone(data) {
        finishApply(data, true);
      },
      onError(err) {
        if (typeof err.rollback_clean === 'boolean') finishApply(err, false);
        else recoverApplyResult(planId, err.outcome_unknown ? null : err);
      },
    });
  } catch (err) {
    appendOrchLog({ phase: 'failed', status: 'error', message: 'Connection lost during apply.', time: Date.now() });
    recoverApplyResult(planId);
  }
}

function siteBusy() {
  return !!getPendingMutation() || isOrchBusy() || proposalApplyState === 'applying' || renameApplyState === 'applying' || deleteApplyState === 'applying';
}

async function performSiteMutation(route, body) {
  const response = await siteMutation(route, body);
  if (response.error?.outcome_unknown) showMutationRecoveryFailure(response.error);
  return response;
}

function showMutationRecoveryFailure(error) {
  setOrchPlan(null);
  setOrchResult({
    summary: error.message,
    rollback_clean: typeof error.restored === 'boolean' ? error.restored : null,
    recovery_snapshot_id: error.snapshotId || null,
    mutation_id: error.mutation_id || null,
    outcome_unknown: error.outcome_unknown === true,
    changed_files: error.changed_files || error.changedFiles || [],
    verification: [],
  });
  setOrchState('apply_failed');
  refreshView();
}

let mutationRecoveryPromise = null;
function recoverPendingSiteMutation() {
  if (mutationRecoveryPromise) return mutationRecoveryPromise;
  const pending = getPendingMutation();
  if (!pending) return Promise.resolve();
  setOrchPlan(null);
  setOrchState('recovering');
  refreshView();
  mutationRecoveryPromise = (async () => {
    const response = await recoverSiteMutation();
    if (!response.error?.outcome_unknown) {
      setProposalRouteId(null);
      setProposalOriginNodeId(null);
      setProposalInputValue('');
      setProposalApplyState('idle');
      resetMoveState();
      resetRenameState();
      resetDeleteState();
    }
    if (response.ok) {
      const data = response.data || {};
      let moves = data.movedPages || [];
      if (data.oldPath && data.newPath) moves = [{ oldFilePath: data.oldPath.replace(/^\//, '') + '.php', newFilePath: data.newPath.replace(/^\//, '') + '.php' }];
      const deleted = data.deletedPage?.filePath ? [data.deletedPage.filePath] : [];
      reconcileEditorPaths(moves, deleted);
      if (moves.length) saveSelectedNode('page:' + moves[0].newFilePath);
      if (deleted.length) saveSelectedNode(null);
      setOrchResult({ summary: data.message || 'The Site change completed. The result was recovered from the server.', filesChanged: data.updatedFiles?.length ?? null, verification: [] });
      setOrchState('applied');
      store.set('previewDirty', true);
      refreshView();
    } else {
      showMutationRecoveryFailure(response.error || { message: 'The mutation result could not be read.' });
    }
    await loadSiteMap();
  })().finally(() => { mutationRecoveryPromise = null; });
  return mutationRecoveryPromise;
}

function finishApply(data, success) {
  setOrchResult({
    ...data,
    filesChanged: data.filesChanged ?? data.files_changed ?? 0,
    summary: (data.recovery_resolved && data.recovery_note) || data.message || data.error || data.summary || (success ? 'Changes applied.' : 'Patch execution failed.'),
    rollback_clean: typeof data.rollback_clean === 'boolean' ? data.rollback_clean : null,
    verification: data.verification || [],
    changed_files: data.changed_files || [],
    recovery_snapshot_id: data.recovery_snapshot_id || null,
  });
  setOrchState(success ? 'applied' : 'apply_failed');
  store.set('previewDirty', true);
  refreshView();
  // Both successful apply and incomplete rollback can change the graph.
  loadSiteMap();
}

let recoveryPromise = null;
function recoverApplyResult(planId, rejection = null) {
  if (recoveryPromise) return recoveryPromise;
  setOrchState('recovering');
  refreshView();
  recoveryPromise = (async () => {
    const data = await waitForPlanResult(planId);
    if (data.status === 'applied' || data.status === 'failed') {
      finishApply(data.result || {}, data.status === 'applied');
      return;
    }
    if (data.status === 'ready') {
      setOrchState(rejection ? 'plan_failed' : 'plan');
      const message = rejection?.message || 'The apply request did not start. Review and apply the same plan when ready.';
      setOrchResult({ summary: message });
      appendOrchLog({ type: rejection ? 'error' : 'info', message, time: Date.now() });
      refreshView();
      return;
    }
    setOrchState('apply_failed');
    setOrchResult({
      summary: rejection?.message || 'The server has not confirmed the apply result. Check again before retrying.',
      rollback_clean: null,
      outcome_unknown: true,
      recovery_snapshot_id: data.recovery_snapshot_id || data.result?.recovery_snapshot_id || null,
      changed_files: [...new Set((orchPlan?.edits || []).map(edit => edit.file))],
    });
    refreshView();
    loadSiteMap();
  })().finally(() => { recoveryPromise = null; });
  return recoveryPromise;
}

/**
 * Phase icon map for the operations-console transcript.
 */
const PHASE_ICONS = {
  start:    '▶',
  snapshot: '◎',
  read:     '↓',
  anchor:   '⚓',
  patch:    '✎',
  lint:     '⌘',
  verify:   '✔',
  reject:   '⊘',
  rollback: '↺',
  done:     '✓',
  failed:   '✗',
  abort:    '⊘',
};

/**
 * Status → CSS class map.
 */
const STATUS_CLASS = {
  ok:      'is-ok',
  failed:  'is-failed',
  error:   'is-failed',
  skip:    'is-skip',
  refused: 'is-refused',
  start:   'is-info',
  partial: 'is-warning',
};

/**
 * Refresh the console log during orchestration.
 * Renders a real operations-console transcript, not a spinner with text.
 */
function refreshOrchPanel() {
  const logEl = document.getElementById('vs-sc-console-log');
  if (!logEl) return;

  const entries = orchLog.map(entry => {
    // B8 structured phase events
    if (entry.phase) {
      const icon = PHASE_ICONS[entry.phase] || '·';
      const cls = STATUS_CLASS[entry.status] || '';
      const file = entry.file ? `<span class="vs-sc-log-file">${entry.file.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</span> ` : '';
      const meta = entry.ms != null ? `<span class="vs-sc-log-meta">${entry.ms}ms</span>` :
                   entry.bytes != null ? `<span class="vs-sc-log-meta">${entry.bytes}b</span>` : '';
      const msg = (entry.message || '').replace(/&/g,'&amp;').replace(/</g,'&lt;');

      return `<div class="vs-sc-log-entry vs-sc-log-phase ${cls}">
        <span class="vs-sc-log-icon">${icon}</span>
        <span class="vs-sc-log-phase-name">${entry.phase}</span>
        ${file}<span class="vs-sc-log-text">${msg}</span>
        ${meta}
      </div>`;
    }

    // Legacy log entries (from orchestrate pipeline)
    const cls = entry.type === 'running' ? 'is-running' :
                entry.type === 'done' ? 'is-done' :
                entry.type === 'error' ? 'is-error' :
                entry.type === 'skipped' ? 'is-skipped' :
                entry.type === 'plan' ? 'is-plan' : '';
    const icon = entry.type === 'running' ? '→' :
                 entry.type === 'done' ? '✓' :
                 entry.type === 'error' ? '✗' :
                 entry.type === 'skipped' ? '⊘' :
                 entry.type === 'plan' ? '◆' :
                 entry.type === 'info' ? '→' : '·';
    return `<div class="vs-sc-log-entry ${cls}">
      <span class="vs-sc-log-icon">${icon}</span>
      <span class="vs-sc-log-text">${entry.message.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</span>
    </div>`;
  }).join('');
  logEl.innerHTML = entries;
  logEl.scrollTop = logEl.scrollHeight;
}

// ═══════════════════════════════════════════
//  Event Binding
// ═══════════════════════════════════════════

function bindWorkspaceEvents(root) {
  // Keep the active transaction visible until its terminal result arrives.
  if (siteBusy()) {
    root.querySelectorAll('.vs-sc-action-bar button, #vs-sc-console-clear, #vs-sc-composer-submit, #vs-sc-composer-input, [data-action^="close-"]').forEach(control => { control.disabled = true; });
  }
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
      const control = e.target.closest('button, input, textarea, select, a');
      if (control && !control.matches('[data-select-page]')) return;
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
    el.addEventListener('click', (e) => {
      const control = e.target.closest('button, input, textarea, select, a');
      if (control && !control.matches('[data-select-page]')) return;
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

  // ── Action bar: catch-all for any remaining stub actions ──
  root.querySelectorAll('.vs-sc-action-bar [data-action]').forEach(btn => {
    const action = btn.dataset.action;
    // Skip all actions that have dedicated handlers
    if (['change-url', 'move', 'reorder', 'rename', 'delete', 'overflow',
         'open-in-editor', 'open-in-chat'].includes(action)) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bar = btn.closest('.vs-sc-action-bar');
      const nodeId = bar?.dataset.forNode || selectedNodeId;
      console.log('Action stub:', action, nodeId);
    });
  });

  // ── "Open in Editor" — navigate to Editor with this page's file open ──
  root.querySelectorAll('[data-action="open-in-editor"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bar = btn.closest('.vs-sc-action-bar');
      const nodeId = bar?.dataset.forNode || selectedNodeId;
      if (!nodeId) return;

      // Derive file path from page node ID ("page:about.php" → "about.php")
      const filePath = nodeId.startsWith('page:') ? nodeId.slice(5) : nodeId;
      window.__vsEditorPendingFile = filePath;
      window.location.hash = '#/editor';
    });
  });

  // ── "Open in Chat" — navigate to Chat scoped to this page ──
  root.querySelectorAll('[data-action="open-in-chat"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bar = btn.closest('.vs-sc-action-bar');
      const nodeId = bar?.dataset.forNode || selectedNodeId;
      if (!nodeId) return;

      // Derive slug from graph node metadata
      const node = graphModel?.nodes.get(nodeId);
      const slug = node?.meta?.slug || nodeId.replace(/^page:/, '').replace(/\.php$/, '');
      store.set('activePageScope', slug);
      window.location.hash = '#/chat';
    });
  });

  // ── Orchestration Console: composer input ──
  const composerInput = root.querySelector('#vs-sc-composer-input');
  const composerSubmit = root.querySelector('#vs-sc-composer-submit');

  if (composerInput) {
    // Auto-resize textarea height
    const autoResize = () => {
      composerInput.style.height = 'auto';
      composerInput.style.height = Math.min(composerInput.scrollHeight, 120) + 'px';
    };

    composerInput.addEventListener('input', () => {
      setOrchPrompt(composerInput.value);
      autoResize();
      if (composerSubmit) composerSubmit.disabled = !composerInput.value.trim() || siteBusy();
    });

    composerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        // Enter = submit (unless Shift is held for newline)
        if (composerInput.value.trim() && !siteBusy()) {
          e.preventDefault();
          startOrchestration(composerInput.value.trim());
        } else {
          e.preventDefault(); // prevent empty submit
        }
      }
      // Shift+Enter = natural newline (default textarea behavior)
    });
  }

  if (composerSubmit) {
    composerSubmit.addEventListener('click', (e) => {
      e.stopPropagation();
      const prompt = orchPrompt.trim();
      if (prompt && !siteBusy()) {
        startOrchestration(prompt);
      }
    });
  }

  // ── Orchestration Console: toggle (collapse / expand) ──
  const consoleToggle = root.querySelector('#vs-sc-console-toggle');
  if (consoleToggle) {
    consoleToggle.addEventListener('click', () => {
      const collapsed = isConsoleCollapsed();
      saveConsoleCollapsed(!collapsed);
      refreshView();
    });
  }

  // ── Orchestration Console: clear log ──
  const consoleClear = root.querySelector('#vs-sc-console-clear');
  if (consoleClear) {
    consoleClear.addEventListener('click', () => {
      if (siteBusy()) return;
      clearOrchLog();
      setOrchState('idle');
      setOrchResult(null);
      setOrchPlan(null);
      setOrchPrompt('');
      refreshView();
    });
  }

  // ── Orchestration Console: vertical resize ──
  const consoleResize = root.querySelector('#vs-sc-console-resize');
  const consoleEl = root.querySelector('#vs-sc-console');
  if (consoleResize && consoleEl) {
    consoleResize.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const startY = e.clientY;
      const startHeight = consoleEl.offsetHeight;

      const onMove = (e2) => {
        const delta = startY - e2.clientY; // drag up = taller
        const newHeight = Math.min(500, Math.max(120, startHeight + delta));
        consoleEl.style.height = newHeight + 'px';
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        saveConsoleHeight(consoleEl.offsetHeight);
        requestAnimationFrame(() => computeConnectors(hierarchyTree));
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  // ── Orchestration: Dismiss button (right panel) ──
  const dismissBtn = root.querySelector('#vs-sc-orch-dismiss');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      if (siteBusy()) return;
      setOrchState('idle');
      setOrchResult(null);
      setOrchPlan(null);
      refreshView();
    });
  }

  root.querySelector('#vs-sc-orch-check')?.addEventListener('click', () => {
    if (getPendingMutation() && !isOrchBusy()) recoverPendingSiteMutation();
    else if (orchPlan?.plan_id && !siteBusy()) recoverApplyResult(orchPlan.plan_id);
  });
  root.querySelectorAll('[data-orch-open-file]').forEach(button => {
    button.addEventListener('click', () => {
      if (siteBusy()) return;
      window.__vsEditorPendingFile = button.dataset.orchOpenFile;
      window.location.hash = '#/editor';
    });
  });

  // ── Orchestration: Approve & Apply button (right panel) ──
  const applyBtn = root.querySelector('#vs-sc-orch-apply');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      applyPlan();
    });
  }

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
