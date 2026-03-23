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

/** @type {'structure'|'impact'} Active sub-tab */
export let activeTab = 'structure';
export function setActiveTab(v) { activeTab = v; }

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

/** @type {string} Impact tab search filter */
export let impactFilterText = '';
export function setImpactFilterText(v) { impactFilterText = v; }

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

// ═══════════════════════════════════════════
//  Collection State (const — mutate in place)
// ═══════════════════════════════════════════

/** @type {Set<string>} Page node IDs whose children are collapsed */
export const collapsedPages = new Set();

/** @type {Map<string, object>} Cached blast-radius results by node ID */
export const blastRadiusCache = new Map();

/** @type {Set<string>} Collapsed section keys in Impact browser */
export const impactCollapsedSections = new Set();

// ═══════════════════════════════════════════
//  Constants
// ═══════════════════════════════════════════

export const SIDEBAR_STORAGE_KEY = 'vs-site-sidebar-widths';

/** Node type config for Impact browser sections */
export const IMPACT_SECTIONS = [
  { key: 'page',    label: 'Pages',    icon: 'fileCode' },
  { key: 'partial', label: 'Partials', icon: 'fileCode' },
  { key: 'route',   label: 'Routes',   icon: 'globe' },
  { key: 'token',   label: 'Tokens',   icon: 'briefcase' },
  { key: 'asset',   label: 'Assets',   icon: 'folder' },
];

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
