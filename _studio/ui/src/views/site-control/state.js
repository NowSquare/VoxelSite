/**
 * VoxelSite Studio — Site Control State
 *
 * Centralized state for the Site Control workspace.
 *
 * Pattern:
 * - All state is exported as live `let` bindings (ES modules guarantee
 *   importing modules always read the current value — no getters needed).
 * - Setter functions are provided for reassignment from other modules
 *   (only the declaring module can reassign an exported `let`).
 * - Set/Map objects are exported as `const` — mutations like .add(),
 *   .delete(), .set(), .clear() work cross-module without setters.
 */

// ═══════════════════════════════════════════
//  Scalar State (live let bindings + setters)
// ═══════════════════════════════════════════

/** @type {{ nodes: Map, edges: Array, summary: Object, builtAt: string|null, buildTimeMs: number, edgesBySource: Map, edgesByTarget: Map } | null} */
export let graphModel = null;
export function setGraphModel(v) { graphModel = v; }

/** @type {string|null} Currently selected node ID (any type) */
export let selectedNodeId = null;
export function setSelectedNodeId(v) { selectedNodeId = v; }

/** @type {string|null} Last selected page node ID (for Structure tab highlight) */
export let lastSelectedPageId = null;
export function setLastSelectedPageId(v) { lastSelectedPageId = v; }

// activeTab removed — three-panel layout has no tabs

/** @type {string} Current search filter */
export let filterText = '';
export function setFilterText(v) { filterText = v; }

/** @type {Array|null} Computed hierarchy tree */
export let hierarchyTree = null;
export function setHierarchyTree(v) { hierarchyTree = v; }

/** @type {string|null} Node ID currently loading blast radius for */
export let blastRadiusLoadingFor = null;
export function setBlastRadiusLoadingFor(v) { blastRadiusLoadingFor = v; }

/** @type {boolean} Whether the global Escape keydown listener has been installed */
export let escListenerInstalled = false;
export function setEscListenerInstalled(v) { escListenerInstalled = v; }

// impactFilterText removed — merged into single filterText for unified left-panel filter

/** @type {string|null} Route node ID being proposed for URL change */
export let proposalRouteId = null;
export function setProposalRouteId(v) { proposalRouteId = v; }

/** @type {string|null} Node that triggered proposal (may be a page or route) */
export let proposalOriginNodeId = null;
export function setProposalOriginNodeId(v) { proposalOriginNodeId = v; }

/** @type {string} Current value in the proposal URL input */
export let proposalInputValue = '';
export function setProposalInputValue(v) { proposalInputValue = v; }

/** @type {boolean} Whether proposal mode was just entered (for one-shot auto-focus) */
export let proposalJustEntered = false;
export function setProposalJustEntered(v) { proposalJustEntered = v; }

// ── Proposal Apply State ──

/** @type {'idle'|'armed'|'applying'|'success'|'error'} */
export let proposalApplyState = 'idle';
export function setProposalApplyState(v) { proposalApplyState = v; }

/** @type {object|null} Server error from failed apply */
export let proposalApplyError = null;
export function setProposalApplyError(v) { proposalApplyError = v; }

/** @type {object|null} Success result from apply response */
export let proposalApplyResult = null;
export function setProposalApplyResult(v) { proposalApplyResult = v; }

/** @type {string|null} Suggested prompt from last mutation (for future propulsion dock) */
export let lastMutationSuggestedPrompt = null;
export function setLastMutationSuggestedPrompt(v) { lastMutationSuggestedPrompt = v; }

// ── Move Proposal State (Phase 2B) ──

/** @type {boolean} Whether move proposal mode is active */
export let moveProposalMode = false;
export function setMoveProposalMode(v) { moveProposalMode = v; }

/** @type {string|null} Target parent href for the move (null = root) */
export let moveTargetParentHref = undefined; // undefined = not chosen, null = root
export function setMoveTargetParentHref(v) { moveTargetParentHref = v; }

/** @type {number|null} Target insertion index */
export let moveTargetIndex = null;
export function setMoveTargetIndex(v) { moveTargetIndex = v; }

/** @type {boolean} Whether normalization is required before moving */
export let moveNormalizationRequired = false;
export function setMoveNormalizationRequired(v) { moveNormalizationRequired = v; }

/** @type {object|null} Current position from preflight: { parentHref, index, siblingCount } */
export let moveCurrentPosition = null;
export function setMoveCurrentPosition(v) { moveCurrentPosition = v; }

/** @type {Array|null} Movable nav tree from preflight (excludes pinned Home) */
export let moveNavTree = null;
export function setMoveNavTree(v) { moveNavTree = v; }

/** @type {boolean} Whether the nav has an explicit Home entry */
export let moveHasHomeEntry = false;
export function setMoveHasHomeEntry(v) { moveHasHomeEntry = v; }

/** @type {string|null} Nav status from preflight (canonical, needs_normalization, unsupported_layout, nav_missing, nav_parse_error) */
export let moveNavStatus = null;
export function setMoveNavStatus(v) { moveNavStatus = v; }

/** @type {boolean} Whether the page is in the nav */
export let moveIsInNav = false;
export function setMoveIsInNav(v) { moveIsInNav = v; }

/** @type {boolean} Whether the page is the homepage */
export let moveIsHomepage = false;
export function setMoveIsHomepage(v) { moveIsHomepage = v; }

/** @type {boolean} Whether preflight is currently loading */
export let movePreflightLoading = false;
export function setMovePreflightLoading(v) { movePreflightLoading = v; }

/**
 * Reset all move proposal state.
 */
export function resetMoveState() {
  moveProposalMode = false;
  moveTargetParentHref = undefined;
  moveTargetIndex = null;
  moveNormalizationRequired = false;
  moveCurrentPosition = null;
  moveNavTree = null;
  moveHasHomeEntry = false;
  moveNavStatus = null;
  moveIsInNav = false;
  moveIsHomepage = false;
  movePreflightLoading = false;
}

// ── Rename State (Phase 2B.5) ──

/** @type {boolean} Whether rename mode is active */
export let renameMode = false;
export function setRenameMode(v) { renameMode = v; }

/** @type {string} The original title when rename mode was entered */
export let renameOriginalTitle = '';
export function setRenameOriginalTitle(v) { renameOriginalTitle = v; }

/** @type {'idle'|'applying'|'success'|'error'} */
export let renameApplyState = 'idle';
export function setRenameApplyState(v) { renameApplyState = v; }

/** @type {string|null} Server error message from failed rename */
export let renameError = null;
export function setRenameError(v) { renameError = v; }

/** @type {object|null} Success result from rename response */
export let renameResult = null;
export function setRenameResult(v) { renameResult = v; }

/**
 * Reset all rename state.
 */
export function resetRenameState() {
  renameMode = false;
  renameOriginalTitle = '';
  renameApplyState = 'idle';
  renameError = null;
  renameResult = null;
}

// ── Delete State (Phase 2C) ──

/** @type {boolean} Whether delete mode is active */
export let deleteMode = false;
export function setDeleteMode(v) { deleteMode = v; }

/** @type {'idle'|'armed'|'applying'|'success'|'error'} */
export let deleteApplyState = 'idle';
export function setDeleteApplyState(v) { deleteApplyState = v; }

/** @type {string|null} Server error message from failed delete */
export let deleteError = null;
export function setDeleteError(v) { deleteError = v; }

/** @type {object|null} Success result from delete response */
export let deleteResult = null;
export function setDeleteResult(v) { deleteResult = v; }

/**
 * Reset all delete state.
 */
export function resetDeleteState() {
  deleteMode = false;
  deleteApplyState = 'idle';
  deleteError = null;
  deleteResult = null;
}


export const SELECTION_STORAGE_KEY = 'vs-site-selected-node';

// ═══════════════════════════════════════════
//  Selection Persistence
// ═══════════════════════════════════════════

/**
 * Save the current selected node ID to sessionStorage.
 * Called on every select/deselect so the selection survives tab navigation.
 */
export function saveSelectedNode(nodeId) {
  try {
    if (nodeId) {
      sessionStorage.setItem(SELECTION_STORAGE_KEY, nodeId);
    } else {
      sessionStorage.removeItem(SELECTION_STORAGE_KEY);
    }
  } catch { /* ignore */ }
}

/**
 * Load the previously selected node ID from sessionStorage.
 * Returns null if nothing was saved or if sessionStorage is unavailable.
 */
export function loadSelectedNode() {
  try {
    return sessionStorage.getItem(SELECTION_STORAGE_KEY) || null;
  } catch { return null; }
}

// ═══════════════════════════════════════════
//  Collection State (const — mutate in place)
// ═══════════════════════════════════════════

/** @type {Set<string>} Page node IDs whose children are collapsed */
export const collapsedPages = new Set();

/**
 * Card disclosure preferences — global, persisted in sessionStorage.
 * Key = card slug (e.g. 'direct-includes'), Value = 'open' | 'closed'.
 * Missing keys fall back to CARD_DEFAULTS.
 */
const CARD_PREFS_KEY = 'vs-site-card-prefs';

/** Default expand state per card type — the information hierarchy */
export const CARD_DEFAULTS = {
  'direct-includes':     'open',
  'transitive-includes': 'closed',
  'links-to':            'closed',
  'linked-from':         'open',
  'blast-radius':        'closed',
};

function loadCardPreferences() {
  try {
    const raw = sessionStorage.getItem(CARD_PREFS_KEY);
    if (raw) return new Map(Object.entries(JSON.parse(raw)));
  } catch { /* ignore */ }
  return new Map();
}

/** @type {Map<string, 'open'|'closed'>} */
export const cardPreferences = loadCardPreferences();

export function saveCardPreferences() {
  try {
    sessionStorage.setItem(CARD_PREFS_KEY, JSON.stringify(Object.fromEntries(cardPreferences)));
  } catch { /* ignore */ }
}

/**
 * Determine if a card should be collapsed.
 * User preference overrides default; missing preferences fall back to CARD_DEFAULTS.
 */
export function isCardCollapsed(cardKey) {
  const pref = cardPreferences.get(cardKey);
  if (pref) return pref === 'closed';
  return (CARD_DEFAULTS[cardKey] || 'closed') === 'closed';
}

/** @type {Map<string, object>} Cached blast-radius results by node ID */
export const blastRadiusCache = new Map();

// ═══════════════════════════════════════════
//  Constants
// ═══════════════════════════════════════════

export const SIDEBAR_STORAGE_KEY = 'vs-site-sidebar-widths';
export const SECTIONS_STORAGE_KEY = 'vs-site-section-state';

/** Default collapsed sections — everything except page-tree */
const DEFAULT_COLLAPSED = ['partial', 'route', 'asset', 'token'];

/** Node type config for Impact browser sections */
export const IMPACT_SECTIONS = [
  { key: 'page',    label: 'Pages',    icon: 'fileText' },
  { key: 'partial', label: 'Partials', icon: 'fileCode' },
  { key: 'route',   label: 'Routes',   icon: 'globe' },
  { key: 'asset',   label: 'Assets',   icon: 'image' },
  { key: 'token',   label: 'Tokens',   icon: 'palette' },
];

// ═══════════════════════════════════════════
//  Section State Persistence
// ═══════════════════════════════════════════

function loadCollapsedSections() {
  try {
    const raw = sessionStorage.getItem(SECTIONS_STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set(DEFAULT_COLLAPSED);
}

export function saveCollapsedSections() {
  try {
    sessionStorage.setItem(
      SECTIONS_STORAGE_KEY,
      JSON.stringify([...impactCollapsedSections])
    );
  } catch { /* ignore */ }
}

/** @type {Set<string>} Collapsed section keys in Impact browser */
export const impactCollapsedSections = loadCollapsedSections();

// ═══════════════════════════════════════════
//  Sidebar Width Persistence
// ═══════════════════════════════════════════

export function getSavedSidebarWidths() {
  try { return JSON.parse(sessionStorage.getItem(SIDEBAR_STORAGE_KEY)) || {}; }
  catch { return {}; }
}

export function saveSidebarWidth(panel, width) {
  const widths = getSavedSidebarWidths();
  widths[panel] = width;
  try { sessionStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(widths)); }
  catch { /* ignore */ }
}

export function getSavedSidebarWidth(panel) {
  const widths = getSavedSidebarWidths();
  return widths[panel] ? ` style="width: ${widths[panel]}px;"` : '';
}

// ═══════════════════════════════════════════
//  Graph Normalization
// ═══════════════════════════════════════════

/**
 * Normalize flat nodes/edges arrays into fast lookup structures.
 */
export function normalizeGraph(data) {
  const nodes = new Map();
  const edges = data.edges || [];

  for (const node of (data.nodes || [])) {
    nodes.set(node.id, node);
  }

  const edgesBySource = new Map();
  const edgesByTarget = new Map();

  for (const edge of edges) {
    if (!edgesBySource.has(edge.source)) edgesBySource.set(edge.source, []);
    edgesBySource.get(edge.source).push(edge);

    if (!edgesByTarget.has(edge.target)) edgesByTarget.set(edge.target, []);
    edgesByTarget.get(edge.target).push(edge);
  }

  return {
    nodes,
    edges,
    summary: data.summary || {},
    builtAt: data.built_at || null,
    buildTimeMs: data.build_time_ms || 0,
    edgesBySource,
    edgesByTarget,
  };
}

// ═══════════════════════════════════════════
//  Hierarchy Tree Builder
// ═══════════════════════════════════════════

/**
 * Build the hierarchy tree from page nodes.
 * Returns an array of root-level tree nodes, each with a `children` array.
 */
export function buildHierarchyTree() {
  if (!graphModel) return [];

  const pageNodes = [];
  for (const [, node] of graphModel.nodes) {
    if (node.type === 'page') pageNodes.push(node);
  }

  // Build lookup: nodeId → tree entry
  const lookup = new Map();
  for (const node of pageNodes) {
    lookup.set(node.id, {
      id: node.id,
      label: node.label || node.id.replace('page:', ''),
      slug: node.meta?.slug || '',
      level: node.meta?.level || 1,
      childCount: node.meta?.childCount || 0,
      parentPageId: node.meta?.parentPageId || null,
      hierarchySource: node.meta?.hierarchySource || null,
      isHomepage: node.meta?.isHomepage || false,
      navOrder: node.meta?.navOrder || 0,
      children: [],
    });
  }

  const roots = [];

  for (const [, entry] of lookup) {
    if (entry.parentPageId && lookup.has(entry.parentPageId)) {
      lookup.get(entry.parentPageId).children.push(entry);
    } else {
      roots.push(entry);
    }
  }

  // Sort: homepage first, then by navOrder, then title
  const sortFn = (a, b) => {
    if (a.isHomepage !== b.isHomepage) return a.isHomepage ? -1 : 1;
    if (a.navOrder !== b.navOrder) return a.navOrder - b.navOrder;
    return a.label.localeCompare(b.label);
  };

  roots.sort(sortFn);
  for (const [, entry] of lookup) {
    if (entry.children.length > 0) entry.children.sort(sortFn);
  }

  return roots;
}

// ═══════════════════════════════════════════
//  Graph Helpers
// ═══════════════════════════════════════════

/**
 * Find the route node that serves this page (via 'serves' edge where target === pageId).
 */
export function getServingRoute(pageId) {
  const inbound = graphModel.edgesByTarget.get(pageId) || [];
  const servesEdge = inbound.find(e => e.type === 'serves');
  return servesEdge ? servesEdge.source : null;
}

/**
 * Get label for a node ID — used in relationship cards.
 */
export function nodeLabel(nodeId) {
  const n = graphModel.nodes.get(nodeId);
  return n ? (n.label || n.id) : nodeId;
}

/**
 * Get type for a node ID.
 */
export function nodeType(nodeId) {
  const n = graphModel.nodes.get(nodeId);
  return n ? n.type : 'unknown';
}

/**
 * Derived display: Structure tab highlights from lastSelectedPageId
 * only when there is an active selection.
 */
export function getStructureHighlight() {
  return selectedNodeId ? lastSelectedPageId : null;
}
