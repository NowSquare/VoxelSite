/**
 * VoxelSite Visual Editor — History Module (VE-020 to VE-023)
 *
 * Operation-based undo/redo for the Visual Editor.
 * Each history entry stores a forward op and its computed inverse.
 * Undo applies the inverse; redo re-applies the forward.
 *
 * Design principles:
 *   1. History operates on semantic operations, not DOM snapshots.
 *   2. Inverse operations are computed at creation time via invertOp().
 *   3. Unsupported inverses (null from invertOp) are rejected — no partial undo.
 *   4. History is invalidated on preview reload, page navigation, or source refresh.
 *   5. The module is state-only — keyboard bindings live in visual-editor.js.
 *
 * Related:
 *   - visual-editor-ops.js: operation schema, applyOp(), invertOp()
 *   - visual-editor.js: keyboard bindings, save integration
 */

import { invertOp, validateOp, applyOp, OpType } from './visual-editor-ops.js';

// ═══════════════════════════════════════════
//  Constants
// ═══════════════════════════════════════════

/** Maximum undo stack depth */
const MAX_HISTORY = 50;

// ═══════════════════════════════════════════
//  State
// ═══════════════════════════════════════════

/**
 * @typedef {Object} HistoryEntry
 * @property {VxOperation}  forwardOp   - the operation that was applied
 * @property {VxOperation}  inverseOp   - the inverse to undo it
 * @property {number}       timestamp   - when the entry was created
 * @property {string}       filePath    - resolved file path at time of commit
 */

/** @type {HistoryEntry[]} */
let undoStack = [];

/** @type {HistoryEntry[]} */
let redoStack = [];

/** @type {Set<Function>} */
const listeners = new Set();


// ═══════════════════════════════════════════
//  Core API
// ═══════════════════════════════════════════

/**
 * Push a committed (successfully persisted) operation onto the undo stack.
 *
 * Computes the inverse at push time. If the op is not invertible,
 * the push is rejected and returns false — callers should not assume
 * history will be available for every edit.
 *
 * @param {VxOperation} op        - the persisted forward operation
 * @param {string}      filePath  - the resolved file path where it was persisted
 * @returns {boolean} true if the entry was pushed, false if rejected
 */
export function pushOp(op, filePath) {
  if (!op) return false;

  // Compute inverse
  const inverse = invertOp(op);
  if (!inverse) {
    console.warn('[VX History] Op is not invertible — skipping history entry:', op.type, op.id);
    return false;
  }

  // Validate the inverse
  const validation = validateOp(inverse);
  if (!validation.valid) {
    console.warn('[VX History] Inverse op failed validation — skipping:', validation.reason);
    return false;
  }

  // Push entry
  undoStack.push({
    forwardOp: op,
    inverseOp: inverse,
    timestamp: Date.now(),
    filePath:  filePath || op.filePath || '',
  });

  // Cap size
  if (undoStack.length > MAX_HISTORY) {
    undoStack = undoStack.slice(undoStack.length - MAX_HISTORY);
  }

  // Branching: clear redo stack (new branch)
  redoStack = [];

  notifyListeners();
  return true;
}

/**
 * Peek at the most recent undo entry WITHOUT moving it.
 * Caller should attempt the undo, then call commitUndo() on success.
 *
 * @returns {HistoryEntry|null}
 */
export function peekUndoEntry() {
  if (undoStack.length === 0) return null;
  return undoStack[undoStack.length - 1];
}

/**
 * Commit the most recent undo: moves entry from undo to redo stack.
 * Only call this AFTER the undo operation has been successfully persisted.
 *
 * @returns {HistoryEntry|null}
 */
export function commitUndo() {
  if (undoStack.length === 0) return null;
  const entry = undoStack.pop();
  redoStack.push(entry);
  notifyListeners();
  return entry;
}

/**
 * Peek at the most recent redo entry WITHOUT moving it.
 * Caller should attempt the redo, then call commitRedo() on success.
 *
 * @returns {HistoryEntry|null}
 */
export function peekRedoEntry() {
  if (redoStack.length === 0) return null;
  return redoStack[redoStack.length - 1];
}

/**
 * Commit the most recent redo: moves entry from redo back to undo stack.
 * Only call this AFTER the redo operation has been successfully persisted.
 *
 * @returns {HistoryEntry|null}
 */
export function commitRedo() {
  if (redoStack.length === 0) return null;
  const entry = redoStack.pop();
  undoStack.push(entry);
  notifyListeners();
  return entry;
}


// ═══════════════════════════════════════════
//  Reconciliation (VE-023)
// ═══════════════════════════════════════════

/**
 * Invalidate all history entries.
 *
 * Called when:
 *   - Preview reloads (DOM state changed externally)
 *   - Page navigation (different file context)
 *   - Source refresh (file content changed outside editor)
 *
 * @param {string} reason - human-readable reason for the invalidation
 */
export function clearHistory(reason) {
  const hadEntries = undoStack.length > 0 || redoStack.length > 0;
  undoStack = [];
  redoStack = [];
  if (hadEntries) {
    console.info('[VX History] Cleared:', reason);
  }
  notifyListeners();
}

/**
 * Invalidate history entries that reference a specific file.
 * Used when a file is saved externally (e.g., code editor save)
 * while the visual editor has unsaved ops targeting that file.
 *
 * @param {string} filePath
 * @param {string} reason
 */
export function invalidateFile(filePath, reason) {
  const beforeUndo = undoStack.length;
  const beforeRedo = redoStack.length;
  undoStack = undoStack.filter(e => e.filePath !== filePath);
  redoStack = redoStack.filter(e => e.filePath !== filePath);
  const removed = (beforeUndo - undoStack.length) + (beforeRedo - redoStack.length);
  if (removed > 0) {
    console.info(`[VX History] Removed ${removed} entries for ${filePath}:`, reason);
    notifyListeners();
  }
}


// ═══════════════════════════════════════════
//  State Queries
// ═══════════════════════════════════════════

/** @returns {boolean} */
export function canUndo() { return undoStack.length > 0; }

/** @returns {boolean} */
export function canRedo() { return redoStack.length > 0; }

/** @returns {number} */
export function undoDepth() { return undoStack.length; }

/** @returns {number} */
export function redoDepth() { return redoStack.length; }

/**
 * Get a description of the pending undo action (for UI tooltips).
 * @returns {string|null}
 */
export function peekUndoLabel() {
  if (undoStack.length === 0) return null;
  const entry = undoStack[undoStack.length - 1];
  return entry.forwardOp?.type || 'unknown';
}

/**
 * Get a description of the pending redo action (for UI tooltips).
 * @returns {string|null}
 */
export function peekRedoLabel() {
  if (redoStack.length === 0) return null;
  const entry = redoStack[redoStack.length - 1];
  return entry.forwardOp?.type || 'unknown';
}


// ═══════════════════════════════════════════
//  Change Notification
// ═══════════════════════════════════════════

/**
 * Subscribe to history state changes.
 * Listener is called with no arguments whenever undo/redo availability changes.
 *
 * @param {Function} fn
 * @returns {Function} unsubscribe function
 */
export function onHistoryChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notifyListeners() {
  for (const fn of listeners) {
    try { fn(); } catch (e) { console.error('[VX History] Listener error:', e); }
  }
}
