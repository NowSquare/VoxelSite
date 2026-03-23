/**
 * VoxelSite Studio — Site Control Workspace
 *
 * Three-tab structure viewer: tree (left) + tiered sitemap diagram (center)
 * with a lightweight detail strip on selection.
 *
 * Module responsibilities:
 *   index.js        — Shell, lifecycle, event binding, refresh orchestrator
 *   state.js        — State (live let bindings + setters), graph helpers
 *   structure-nav.js — Left panel: page tree, filter, expand/collapse
 *   canvas.js       — Center panel: tier diagram, card rendering
 *   control-panel.js — Right panel: Inspect, relationship cards, SC-020 proposal
 *   node-actions.js  — Contextual action bar (stub in Phase 1)
 *
 * Data flow:
 * - On mount: GET /site-graph → normalize → buildHierarchyTree()
 * - Tree drives expansion; diagram mirrors tree state
 * - Selection syncs bidirectionally between tree and diagram
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
  activeTab,
  filterText,
  hierarchyTree,
  blastRadiusCache,
  blastRadiusLoadingFor,
  escListenerInstalled,
  impactFilterText,
  impactCollapsedSections,
  proposalRouteId,
  proposalOriginNodeId,
  proposalInputValue,
  proposalJustEntered,
  collapsedPages,
  normalizeGraph,
  buildHierarchyTree,
  getSavedSidebarWidth,
  saveSidebarWidth,
  setGraphModel,
  setSelectedNodeId,
  setLastSelectedPageId,
  setActiveTab,
  setFilterText,
  setHierarchyTree,
  setBlastRadiusLoadingFor,
  setEscListenerInstalled,
  setImpactFilterText,
  setProposalRouteId,
  setProposalOriginNodeId,
  setProposalInputValue,
  setProposalJustEntered,
  getStructureHighlight,
} from './state.js';

// ── Rendering modules ──
import { renderTree } from './structure-nav.js';
import { renderDiagram, renderDetailStrip } from './canvas.js';
import {
  renderImpact,
  renderImpactDetail,
  renderImpactEmpty,
  renderImpactSections,
  enterProposalMode,
  exitProposalMode,
} from './control-panel.js';

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
  setSelectedNodeId(null);
  setLastSelectedPageId(null);
  setActiveTab('structure');
  setFilterText('');
  blastRadiusCache.clear();
  setBlastRadiusLoadingFor(null);
  setProposalRouteId(null);
  setProposalOriginNodeId(null);
  setProposalInputValue('');
  setHierarchyTree(buildHierarchyTree());

  renderWorkspace(root);
}

// ═══════════════════════════════════════════
//  Main Workspace Render
// ═══════════════════════════════════════════

function renderWorkspace(root) {
  root.innerHTML = `
    <div class="vs-site-workspace">
      <div class="vs-site-tabs">
        <button class="vs-site-tab ${activeTab === 'structure' ? 'is-active' : ''}" data-tab="structure">Structure</button>
        <button class="vs-site-tab ${activeTab === 'impact' ? 'is-active' : ''}" data-tab="impact">Impact</button>
      </div>
      <div class="vs-site-tab-content" id="vs-site-tab-content">
        ${activeTab === 'structure' ? renderStructure() : renderImpact()}
      </div>
    </div>
  `;

  bindWorkspaceEvents(root);
}

// ═══════════════════════════════════════════
//  Structure Tab Content
// ═══════════════════════════════════════════

function renderStructure() {
  const highlight = getStructureHighlight();
  return `
    <div class="vs-site-structure">
      <div class="vs-site-tree" id="vs-site-tree"${getSavedSidebarWidth('structure')}>
        <div class="vs-site-filter">
          <input type="text" id="vs-site-search" class="vs-input vs-input-sm"
                 placeholder="Filter pages\u2026" autocomplete="off" />
        </div>
        <div class="vs-site-tree-body" id="vs-site-tree-body">
          ${renderTree(hierarchyTree, 0)}
        </div>
        <div class="vs-editor-resize" data-resize-panel="vs-site-tree"></div>
      </div>
      <div class="vs-site-diagram-area">
        <div class="vs-site-diagram" id="vs-site-diagram">
          ${renderDiagram(hierarchyTree)}
        </div>
        <div class="vs-site-detail-strip" id="vs-site-detail">
          ${highlight ? renderDetailStrip(highlight) : ''}
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════
//  Selection & Interaction
// ═══════════════════════════════════════════

/**
 * Select a node (any type). Updates lastSelectedPageId for page nodes.
 * Triggers blast-radius fetch on Impact tab.
 */
function selectNode(nodeId) {
  // Clear proposal mode on any selection change
  if (proposalRouteId) {
    setProposalRouteId(null);
    setProposalOriginNodeId(null);
    setProposalInputValue('');
  }
  setSelectedNodeId(nodeId);
  if (nodeId && nodeId.startsWith('page:')) {
    setLastSelectedPageId(nodeId);
  }
  if (activeTab === 'impact' && nodeId) {
    fetchBlastRadius(nodeId);
  }
  refreshView();
}

function deselectNode() {
  setProposalRouteId(null);
  setProposalOriginNodeId(null);
  setProposalInputValue('');
  setSelectedNodeId(null);
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
  // Prevents stale responses from clearing a newer request's loading state.
  if (blastRadiusLoadingFor !== nodeId) return;
  setBlastRadiusLoadingFor(null);
  if (ok && data) {
    blastRadiusCache.set(nodeId, data);
  }
  refreshView();
}

function toggleExpand(pageId) {
  if (collapsedPages.has(pageId)) {
    collapsedPages.delete(pageId);
  } else {
    collapsedPages.add(pageId);
  }
  refreshView();
}

function refreshView() {
  const root = document.getElementById('vs-site-root');
  if (!root) return;

  // Preserve proposal input focus/caret across re-render
  const proposalFocused = document.activeElement?.id === 'vs-proposal-url';
  const caretPos = proposalFocused ? document.activeElement.selectionStart : null;

  // Full re-render workspace (tab chrome + active tab content)
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
}

// ═══════════════════════════════════════════
//  Event Binding
// ═══════════════════════════════════════════

function bindWorkspaceEvents(root) {
  // Tab switching
  root.querySelectorAll('.vs-site-tab[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (tab === activeTab) return;
      // Clear proposal mode on tab switch
      setProposalRouteId(null);
      setProposalOriginNodeId(null);
      setProposalInputValue('');
      setActiveTab(tab);
      // Fetch blast radius if switching to Impact with existing uncached selection
      if (tab === 'impact' && selectedNodeId && !blastRadiusCache.has(selectedNodeId)) {
        fetchBlastRadius(selectedNodeId);
      }
      refreshView();
    });
  });

  // Search filter (Structure tab only)
  const searchInput = root.querySelector('#vs-site-search');
  if (searchInput) {
    // Preserve existing input handler, remove old before adding new
    const newInput = searchInput.cloneNode(true);
    newInput.value = filterText;
    searchInput.parentNode.replaceChild(newInput, searchInput);

    let debounceTimer;
    newInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setFilterText(newInput.value.trim());
        setHierarchyTree(buildHierarchyTree()); // rebuild with same data
        refreshView();
        // Refocus the new input after refresh
        document.getElementById('vs-site-search')?.focus();
      }, 150);
    });
  }

  // Tree item clicks (selection)
  root.querySelectorAll('.vs-site-tree-item[data-page-id]').forEach(el => {
    el.addEventListener('click', (e) => {
      // Don't select if clicking the toggle button
      if (e.target.closest('.vs-site-tree-toggle')) return;
      const pageId = el.dataset.pageId;
      if (pageId) selectNode(pageId);
    });
  });

  // Tree expand/collapse toggles
  root.querySelectorAll('.vs-site-tree-toggle[data-toggle-page]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pageId = btn.dataset.togglePage;
      if (pageId) toggleExpand(pageId);
    });
  });

  // Diagram card clicks (selection)
  root.querySelectorAll('.vs-site-card[data-page-id]').forEach(el => {
    el.addEventListener('click', () => {
      const pageId = el.dataset.pageId;
      if (pageId) selectNode(pageId);
    });
  });

  // Diagram background click (deselect)
  const diagram = root.querySelector('#vs-site-diagram');
  if (diagram) {
    diagram.addEventListener('click', (e) => {
      if (e.target === diagram || e.target.classList.contains('vs-site-tiers')) {
        deselectNode();
      }
    });
  }

  // ── Impact tab events ──

  // Impact filter
  const impactSearch = root.querySelector('#vs-impact-search');
  if (impactSearch) {
    const newImpactInput = impactSearch.cloneNode(true);
    newImpactInput.value = impactFilterText;
    impactSearch.parentNode.replaceChild(newImpactInput, impactSearch);

    let impactDebounce;
    newImpactInput.addEventListener('input', () => {
      clearTimeout(impactDebounce);
      impactDebounce = setTimeout(() => {
        setImpactFilterText(newImpactInput.value.trim());
        refreshView();
        document.getElementById('vs-impact-search')?.focus();
      }, 150);
    });
  }

  // Impact section collapse toggles
  root.querySelectorAll('.vs-impact-section-header[data-impact-section]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.impactSection;
      if (impactCollapsedSections.has(key)) {
        impactCollapsedSections.delete(key);
      } else {
        impactCollapsedSections.add(key);
      }
      refreshView();
    });
  });

  // Impact item clicks (selection)
  root.querySelectorAll('.vs-impact-item[data-node-id]').forEach(el => {
    el.addEventListener('click', () => {
      const nodeId = el.dataset.nodeId;
      if (nodeId) selectNode(nodeId);
    });
  });

  // Detail panel ref-item clicks (relationship navigation)
  root.querySelectorAll('.vs-impact-ref-item[data-node-id]').forEach(el => {
    el.addEventListener('click', () => {
      const nodeId = el.dataset.nodeId;
      if (nodeId) selectNode(nodeId);
    });
  });

  // Proposal mode: "Change URL" button
  root.querySelectorAll('[data-action="change-url"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (selectedNodeId) {
        enterProposalMode(selectedNodeId, refreshView);
        refreshView();
      }
    });
  });

  // Proposal mode: close buttons
  root.querySelectorAll('[data-action="close-proposal"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      exitProposalMode();
      refreshView();
    });
  });

  // Proposal mode: group header navigation
  root.querySelectorAll('[data-navigate-node]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const nodeId = el.dataset.navigateNode;
      if (nodeId) selectNode(nodeId);
    });
  });

  // Proposal mode: URL input
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
        exitProposalMode();
        refreshView();
      }
    });
    // Auto-focus only on initial entry, not on every re-render
    if (proposalJustEntered) {
      setProposalJustEntered(false);
      setTimeout(() => proposalInput.focus(), 0);
    }
  }

  // Impact background click (deselect) — target reachable empty space
  // Detail pane: deselect on any click that doesn't target an interactive element
  const impactDetail = root.querySelector('#vs-impact-detail');
  if (impactDetail) {
    impactDetail.addEventListener('click', (e) => {
      // Don't deselect if clicking interactive children
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) return;
      // Don't deselect if inside proposal panel — proposal has its own exit controls
      if (e.target.closest('.vs-proposal-panel')) return;
      deselectNode();
    });
  }

  // Sections pane: clicking below the last section (empty scroll area)
  const impactSections = root.querySelector('#vs-impact-sections');
  if (impactSections) {
    impactSections.addEventListener('click', (e) => {
      if (e.target === impactSections) {
        deselectNode();
      }
    });
  }

  // Escape key (deselect) — install once at module level
  if (!escListenerInstalled) {
    setEscListenerInstalled(true);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && selectedNodeId && document.activeElement?.tagName !== 'INPUT') {
        deselectNode();
      }
    });
  }

  // Sidebar resize handles (matching Editor pattern)
  root.querySelectorAll('.vs-editor-resize[data-resize-panel]').forEach(handle => {
    const panelId = handle.dataset.resizePanel;
    const panel = document.getElementById(panelId);
    if (!panel) return;

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handle.classList.add('is-dragging');
      const panelRect = panel.getBoundingClientRect();
      const onMove = (e2) => {
        const newWidth = Math.min(420, Math.max(200, e2.clientX - panelRect.left));
        panel.style.width = newWidth + 'px';
      };
      const onUp = () => {
        handle.classList.remove('is-dragging');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        // Persist width
        const key = panelId === 'vs-site-tree' ? 'structure' : 'impact';
        saveSidebarWidth(key, panel.offsetWidth);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  });
}
