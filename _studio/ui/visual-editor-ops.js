/**
 * VoxelSite Visual Editor — Semantic Operation Module (VE-010)
 *
 * Single source of truth for the operation vocabulary used by the Visual Editor.
 * Every visual edit — text change, class toggle, attribute mutation, structural
 * action — is expressed as an explicit operation with a defined payload and
 * a computable inverse.
 *
 * Design principles:
 *   1. Operations are plain JSON-serializable objects — no DOM references.
 *   2. Each operation carries the source address of its target element.
 *   3. Every supported operation has an inverse rule for undo.
 *   4. Unsupported edit types produce a `fallback` op that records intent
 *      but relies on the legacy save path.
 *   5. The module is pure functions — no side effects, no DOM access, no I/O.
 *
 * Consumers:
 *   - visual-editor.js: creates operations when the user edits
 *   - visual-editor-history.js (future): stores operations for undo/redo
 *   - save pipeline: persists operations to source files
 *   - instrumentation: logs failures by operation type
 *
 * Related: visual-editor-addressing.js (source address contract)
 */

// ═══════════════════════════════════════════
//  Operation Types
// ═══════════════════════════════════════════

/**
 * Canonical operation types.
 * Each type defines a specific, deterministic source-level mutation.
 *
 * @enum {string}
 */
export const OpType = Object.freeze({
  /** Replace the text content of an element (innerHTML for rich text) */
  SET_TEXT:            'set_text',

  /** Set or remove an HTML attribute (src, href, alt, id, aria-*, etc.) */
  SET_ATTRIBUTE:       'set_attribute',

  /** Add a single Tailwind utility class token */
  ADD_CLASS_TOKEN:     'add_class_token',

  /** Remove a single Tailwind utility class token */
  REMOVE_CLASS_TOKEN:  'remove_class_token',

  /** Batch class mutation — multiple additions and removals in one operation */
  SET_CLASS_LIST:      'set_class_list',

  /** Move an element before a sibling (reorder within parent) */
  MOVE_BEFORE:         'move_before',

  /** Move an element after a sibling (reorder within parent) */
  MOVE_AFTER:          'move_after',

  /** Insert a new DOM node as a child of the target */
  INSERT_NODE:         'insert_node',

  /** Delete an element from its parent */
  DELETE_NODE:         'delete_node',

  /** Replace the full outerHTML of an element (inline source editor) */
  REPLACE_HTML:        'replace_html',

  /**
   * Legacy fallback — the edit cannot be expressed as a supported operation.
   * Recorded for instrumentation; uses the existing raw-replacement save path.
   */
  FALLBACK:            'fallback',
});


// ═══════════════════════════════════════════
//  Operation Shape
// ═══════════════════════════════════════════

/**
 * @typedef {Object} SourceAddress
 * @property {string}   sourceFile   - e.g. "index.php", "_partials/header.php"
 * @property {string}   sourceKind   - "page"|"partial"|"component"|"loop"|"unsafe"
 * @property {string}   nodeKey      - stable key: "{sourceFile}:{index}"
 * @property {string[]} includeChain - ancestry of includes
 * @property {string}   instanceKey  - unique composite key
 * @property {boolean}  editable     - server-side editability flag
 */

/**
 * @typedef {Object} VxOperation
 * @property {string}        id        - unique ID (timestamp + random)
 * @property {string}        type      - one of OpType values
 * @property {SourceAddress} address   - target element's source address
 * @property {Object}        payload   - type-specific data
 * @property {number}        timestamp - Date.now() when created
 * @property {string}        [filePath]- resolved file path for persistence
 */


// ═══════════════════════════════════════════
//  ID Generator
// ═══════════════════════════════════════════

let _seq = 0;

/**
 * Generate a unique operation ID.
 * Format: `op_{timestamp}_{sequence}_{random4}`
 */
function generateOpId() {
  _seq++;
  const rand = Math.random().toString(36).substring(2, 6);
  return `op_${Date.now()}_${_seq}_${rand}`;
}


// ═══════════════════════════════════════════
//  Operation Builders
// ═══════════════════════════════════════════

/**
 * Create a set_text operation.
 *
 * @param {SourceAddress} address  - target element address
 * @param {string}        oldText  - original innerHTML
 * @param {string}        newText  - replacement innerHTML
 * @param {string}        [filePath] - resolved file path
 * @returns {VxOperation}
 */
export function opSetText(address, oldText, newText, filePath) {
  return {
    id:        generateOpId(),
    type:      OpType.SET_TEXT,
    address,
    payload:   { oldText, newText },
    filePath:  filePath || address?.sourceFile || '',
    timestamp: Date.now(),
  };
}

/**
 * Create a set_attribute operation.
 *
 * @param {SourceAddress} address   - target element address
 * @param {string}        attrName  - attribute name (e.g. 'src', 'href', 'alt')
 * @param {string|null}   oldValue  - previous value (null = attribute didn't exist)
 * @param {string|null}   newValue  - new value (null = remove attribute)
 * @param {string}        [filePath]
 * @returns {VxOperation}
 */
export function opSetAttribute(address, attrName, oldValue, newValue, filePath) {
  return {
    id:        generateOpId(),
    type:      OpType.SET_ATTRIBUTE,
    address,
    payload:   { attrName, oldValue, newValue },
    filePath:  filePath || address?.sourceFile || '',
    timestamp: Date.now(),
  };
}

/**
 * Create an add_class_token operation.
 *
 * @param {SourceAddress} address - target element address
 * @param {string}        token   - Tailwind class to add (e.g. 'text-xl')
 * @param {string}        [filePath]
 * @returns {VxOperation}
 */
export function opAddClassToken(address, token, filePath) {
  return {
    id:        generateOpId(),
    type:      OpType.ADD_CLASS_TOKEN,
    address,
    payload:   { token },
    filePath:  filePath || address?.sourceFile || '',
    timestamp: Date.now(),
  };
}

/**
 * Create a remove_class_token operation.
 *
 * @param {SourceAddress} address - target element address
 * @param {string}        token   - Tailwind class to remove
 * @param {string}        [filePath]
 * @returns {VxOperation}
 */
export function opRemoveClassToken(address, token, filePath) {
  return {
    id:        generateOpId(),
    type:      OpType.REMOVE_CLASS_TOKEN,
    address,
    payload:   { token },
    filePath:  filePath || address?.sourceFile || '',
    timestamp: Date.now(),
  };
}

/**
 * Create a set_class_list operation (batch class mutation).
 * This is the primary operation the style panel produces:
 * one set of additions and one set of removals applied atomically.
 *
 * @param {SourceAddress} address      - target element address
 * @param {string}        oldClassStr  - original class="" value
 * @param {string}        newClassStr  - new class="" value
 * @param {string[]}      additions    - classes added
 * @param {string[]}      removals     - classes removed
 * @param {string}        [filePath]
 * @returns {VxOperation}
 */
export function opSetClassList(address, oldClassStr, newClassStr, additions, removals, filePath) {
  return {
    id:        generateOpId(),
    type:      OpType.SET_CLASS_LIST,
    address,
    payload:   { oldClassStr, newClassStr, additions, removals },
    filePath:  filePath || address?.sourceFile || '',
    timestamp: Date.now(),
  };
}

/**
 * Create a delete_node operation.
 *
 * The payload carries enough context for a deterministic undo:
 *  - outerHTML: full markup of the deleted element
 *  - parentAddress: source address of the parent element (for reinsertion target)
 *  - siblingIndex: child index within parent (for reinsertion position)
 *
 * Without parentAddress and siblingIndex, the deletion can still be persisted
 * (source-level string removal), but undo via INSERT_NODE will be best-effort.
 *
 * @param {SourceAddress} address         - target element address
 * @param {string}        outerHTML       - full element markup for undo
 * @param {string}        [filePath]
 * @param {SourceAddress} [parentAddress] - source address of parent element
 * @param {number}        [siblingIndex]  - child index within parent
 * @returns {VxOperation}
 */
export function opDeleteNode(address, outerHTML, filePath, parentAddress, siblingIndex) {
  return {
    id:        generateOpId(),
    type:      OpType.DELETE_NODE,
    address,
    payload:   {
      outerHTML,
      parentAddress: parentAddress || null,
      siblingIndex:  typeof siblingIndex === 'number' ? siblingIndex : -1,
    },
    filePath:  filePath || address?.sourceFile || '',
    timestamp: Date.now(),
  };
}

/**
 * Create a replace_html operation (inline source editor).
 *
 * @param {SourceAddress} address     - target element address
 * @param {string}        oldHTML     - original source HTML (needle)
 * @param {string}        newHTML     - replacement HTML
 * @param {string}        [filePath]
 * @returns {VxOperation}
 */
export function opReplaceHtml(address, oldHTML, newHTML, filePath) {
  return {
    id:        generateOpId(),
    type:      OpType.REPLACE_HTML,
    address,
    payload:   { oldHTML, newHTML },
    filePath:  filePath || address?.sourceFile || '',
    timestamp: Date.now(),
  };
}

/**
 * Create a move_before operation.
 *
 * @param {SourceAddress} address       - element to move
 * @param {number}        fromIndex     - original sibling index
 * @param {number}        toIndex       - target sibling index
 * @param {string}        [filePath]
 * @returns {VxOperation}
 */
export function opMoveBefore(address, fromIndex, toIndex, filePath) {
  return {
    id:        generateOpId(),
    type:      OpType.MOVE_BEFORE,
    address,
    payload:   { fromIndex, toIndex },
    filePath:  filePath || address?.sourceFile || '',
    timestamp: Date.now(),
  };
}

/**
 * Create a fallback operation for edits that can't be expressed
 * as supported operations. Recorded for instrumentation.
 *
 * @param {SourceAddress} address      - target element address (may be null)
 * @param {string}        reason       - why this is a fallback
 * @param {string}        [changeType] - the legacy change type (e.g. 'text', 'class-change')
 * @param {Object}        [rawChange]  - the legacy change payload for the save pipeline
 * @returns {VxOperation}
 */
export function opFallback(address, reason, changeType, rawChange) {
  return {
    id:        generateOpId(),
    type:      OpType.FALLBACK,
    address:   address || null,
    payload:   { reason, changeType, rawChange },
    filePath:  address?.sourceFile || rawChange?.filePath || '',
    timestamp: Date.now(),
  };
}


// ═══════════════════════════════════════════
//  Inverse Operations (for Undo)
// ═══════════════════════════════════════════

/**
 * Compute the inverse of an operation.
 * The inverse, when applied, undoes the original operation.
 *
 * Returns a new operation object that reverses the effect,
 * or null if the operation type is not invertible.
 *
 * @param {VxOperation} op
 * @returns {VxOperation|null}
 */
export function invertOp(op) {
  if (!op || !op.type) return null;

  switch (op.type) {
    case OpType.SET_TEXT:
      return {
        ...op,
        id:      generateOpId(),
        payload: { oldText: op.payload.newText, newText: op.payload.oldText },
      };

    case OpType.SET_ATTRIBUTE:
      return {
        ...op,
        id:      generateOpId(),
        payload: { attrName: op.payload.attrName, oldValue: op.payload.newValue, newValue: op.payload.oldValue },
      };

    case OpType.ADD_CLASS_TOKEN:
      return {
        ...op,
        id:   generateOpId(),
        type: OpType.REMOVE_CLASS_TOKEN,
        // payload.token stays the same — removing it undoes the add
      };

    case OpType.REMOVE_CLASS_TOKEN:
      return {
        ...op,
        id:   generateOpId(),
        type: OpType.ADD_CLASS_TOKEN,
        // payload.token stays the same — adding it back undoes the remove
      };

    case OpType.SET_CLASS_LIST:
      return {
        ...op,
        id:      generateOpId(),
        payload: {
          oldClassStr: op.payload.newClassStr,
          newClassStr: op.payload.oldClassStr,
          additions:   op.payload.removals,
          removals:    op.payload.additions,
        },
      };

    case OpType.DELETE_NODE:
      // Undo deletion by reinserting the element at its original position.
      // Requires parentAddress and siblingIndex for deterministic reinsertion.
      // When those are absent (siblingIndex === -1), the inverse is recorded
      // but flagged as best-effort — the history module should warn the user.
      return {
        ...op,
        id:   generateOpId(),
        type: OpType.INSERT_NODE,
        payload: {
          html:          op.payload.outerHTML,
          parentAddress: op.payload.parentAddress || null,
          siblingIndex:  op.payload.siblingIndex ?? -1,
        },
      };

    case OpType.REPLACE_HTML:
      return {
        ...op,
        id:      generateOpId(),
        payload: { oldHTML: op.payload.newHTML, newHTML: op.payload.oldHTML },
      };

    case OpType.MOVE_BEFORE:
    case OpType.MOVE_AFTER:
      // Reverse the indices
      return {
        ...op,
        id:      generateOpId(),
        payload: { fromIndex: op.payload.toIndex, toIndex: op.payload.fromIndex },
      };

    case OpType.FALLBACK:
      // Fallback operations are not invertible through the operation system.
      // They rely on the revision system for undo.
      return null;

    default:
      return null;
  }
}


// ═══════════════════════════════════════════
//  Validation
// ═══════════════════════════════════════════

/**
 * Validate that an operation has the required fields.
 *
 * @param {VxOperation} op
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateOp(op) {
  if (!op) return { valid: false, reason: 'Operation is null' };
  if (!op.type) return { valid: false, reason: 'Missing operation type' };
  if (!op.id) return { valid: false, reason: 'Missing operation ID' };

  // Fallback ops have relaxed requirements
  if (op.type === OpType.FALLBACK) {
    return { valid: true };
  }

  if (!op.address) return { valid: false, reason: 'Missing source address' };

  switch (op.type) {
    case OpType.SET_TEXT:
      if (typeof op.payload?.newText !== 'string') return { valid: false, reason: 'SET_TEXT requires payload.newText' };
      break;

    case OpType.SET_ATTRIBUTE:
      if (!op.payload?.attrName) return { valid: false, reason: 'SET_ATTRIBUTE requires payload.attrName' };
      break;

    case OpType.ADD_CLASS_TOKEN:
    case OpType.REMOVE_CLASS_TOKEN:
      if (!op.payload?.token) return { valid: false, reason: `${op.type} requires payload.token` };
      break;

    case OpType.SET_CLASS_LIST:
      if (!Array.isArray(op.payload?.additions) || !Array.isArray(op.payload?.removals)) {
        return { valid: false, reason: 'SET_CLASS_LIST requires payload.additions and payload.removals arrays' };
      }
      break;

    case OpType.DELETE_NODE:
      if (!op.payload?.outerHTML) return { valid: false, reason: 'DELETE_NODE requires payload.outerHTML' };
      break;

    case OpType.INSERT_NODE:
      if (!op.payload?.html) return { valid: false, reason: 'INSERT_NODE requires payload.html' };
      if (typeof op.payload?.siblingIndex !== 'number' || op.payload.siblingIndex < 0) {
        return { valid: false, reason: 'INSERT_NODE requires payload.siblingIndex (>= 0) for deterministic reinsertion' };
      }
      if (!op.payload?.parentAddress) {
        return { valid: false, reason: 'INSERT_NODE requires payload.parentAddress for reinsertion target' };
      }
      break;

    case OpType.REPLACE_HTML:
      if (!op.payload?.oldHTML || !op.payload?.newHTML) return { valid: false, reason: 'REPLACE_HTML requires payload.oldHTML and payload.newHTML' };
      break;

    case OpType.MOVE_BEFORE:
    case OpType.MOVE_AFTER:
      if (typeof op.payload?.fromIndex !== 'number') return { valid: false, reason: `${op.type} requires payload.fromIndex` };
      if (typeof op.payload?.toIndex !== 'number') return { valid: false, reason: `${op.type} requires payload.toIndex` };
      break;
  }

  return { valid: true };
}


// ═══════════════════════════════════════════
//  Utility
// ═══════════════════════════════════════════

/**
 * Check whether an operation type is supported for persistence
 * (vs. a fallback that relies on the legacy save path).
 *
 * @param {string} type
 * @returns {boolean}
 */
export function isSupportedOp(type) {
  return type !== OpType.FALLBACK && Object.values(OpType).includes(type);
}

/**
 * Human-readable label for an operation type.
 *
 * @param {string} type
 * @returns {string}
 */
export function opLabel(type) {
  const labels = {
    [OpType.SET_TEXT]:           'Text edit',
    [OpType.SET_ATTRIBUTE]:      'Attribute change',
    [OpType.ADD_CLASS_TOKEN]:    'Add class',
    [OpType.REMOVE_CLASS_TOKEN]: 'Remove class',
    [OpType.SET_CLASS_LIST]:     'Style change',
    [OpType.MOVE_BEFORE]:        'Move element',
    [OpType.MOVE_AFTER]:         'Move element',
    [OpType.INSERT_NODE]:        'Insert element',
    [OpType.DELETE_NODE]:        'Delete element',
    [OpType.REPLACE_HTML]:       'Source edit',
    [OpType.FALLBACK]:           'Legacy edit',
  };
  return labels[type] || type;
}


// ═══════════════════════════════════════════
//  Operation Persistence Adapter (VE-013)
// ═══════════════════════════════════════════

/**
 * Tags the PHP annotator skips (must match preview.php SKIP_TAGS).
 * Shared between locateByNodeKey and extractSourceElementByIndex.
 */
const SKIP_TAGS = new Set([
  'html','head','body','script','style','link','meta','noscript',
  'br','hr','wbr','col','colgroup','iframe','template',
  'svg','path','circle','line','polyline','rect','ellipse',
  'polygon','g','defs','use','symbol','clippath','mask',
]);

const VOID_TAGS = new Set([
  'area','base','br','col','embed','hr','img','input',
  'link','meta','source','track','wbr',
]);

/**
 * Extract the opening tag string starting at `pos` in `content`.
 * Handles quoted attributes (can contain >) and PHP blocks.
 * @returns {string|null}
 */
function parseOpeningTag(content, pos) {
  let i = pos;
  let inDouble = false;
  let inSingle = false;
  while (i < content.length) {
    const ch = content[i];
    if (ch === '"' && !inSingle) { inDouble = !inDouble; }
    else if (ch === "'" && !inDouble) { inSingle = !inSingle; }
    else if (ch === '>' && !inDouble && !inSingle) {
      return content.substring(pos, i + 1);
    }
    i++;
    if (i - pos > 2000) return null;
  }
  return null;
}

/**
 * Extract a full element (opening through matching closing tag)
 * from `content` starting at `pos` for a given tag name.
 * Returns { element, startIndex, endIndex } or null.
 */
function extractElement(content, pos, tag) {
  const openTag = parseOpeningTag(content, pos);
  if (!openTag) return null;

  if (VOID_TAGS.has(tag) || openTag.trimEnd().endsWith('/>')) {
    return { element: openTag, startIndex: pos, endIndex: pos + openTag.length };
  }

  const afterOpen = pos + openTag.length;
  const openRe = new RegExp(`<${tag}[\\s>]`, 'gi');
  const closeRe = new RegExp(`</${tag}\\s*>`, 'gi');
  let depth = 1;
  let searchPos = afterOpen;
  const maxLen = Math.min(content.length, pos + 50000);

  while (searchPos < maxLen && depth > 0) {
    openRe.lastIndex = searchPos;
    closeRe.lastIndex = searchPos;
    const nextOpen = openRe.exec(content);
    const nextClose = closeRe.exec(content);
    if (!nextClose) return null;
    const openPos = nextOpen ? nextOpen.index : Infinity;
    const closePos = nextClose.index;
    if (openPos < closePos && openPos < maxLen) {
      depth++;
      searchPos = openPos + nextOpen[0].length;
    } else {
      depth--;
      searchPos = closePos + nextClose[0].length;
    }
  }

  if (depth !== 0) return null;
  return { element: content.substring(pos, searchPos), startIndex: pos, endIndex: searchPos };
}

/**
 * Locate an element in file content by nodeKey (index-based targeting).
 *
 * @param {string} content  - raw file content
 * @param {string} nodeKey  - e.g. 'partials/hero.php:3'
 * @returns {{ element: string, tag: string, startIndex: number, endIndex: number }|null}
 */
export function locateByNodeKey(content, nodeKey) {
  if (!nodeKey) return null;
  const colonIdx = nodeKey.lastIndexOf(':');
  if (colonIdx === -1) return null;
  const targetIndex = parseInt(nodeKey.substring(colonIdx + 1), 10);
  if (isNaN(targetIndex) || targetIndex < 0) return null;

  const tagPattern = /<([a-z][a-z0-9]*)[\s>]/gi;
  let match;
  let counter = 0;

  while ((match = tagPattern.exec(content)) !== null) {
    const foundTag = match[1].toLowerCase();
    if (SKIP_TAGS.has(foundTag)) continue;
    const nearbyChars = content.substring(match.index, match.index + 500);
    if (nearbyChars.includes('data-vx-source')) continue;

    if (counter === targetIndex) {
      const result = extractElement(content, match.index, foundTag);
      if (!result) return null;
      return { ...result, tag: foundTag };
    }
    counter++;
  }
  return null;
}

/**
 * Replace a specific attribute value in an opening tag string. 
 * Returns the modified tag, or null if the attribute was not found.
 */
function replaceAttrInTag(openTag, attrName, oldValue, newValue) {
  // Remove attribute entirely
  if (newValue === null || newValue === undefined) {
    const removeRe = new RegExp(`\\s+${attrName}=["'][^"']*["']`, 'i');
    if (removeRe.test(openTag)) {
      return openTag.replace(removeRe, '');
    }
    return null;
  }

  // Update existing attribute
  const updateRe = new RegExp(`(${attrName}=["'])([^"']*)(["'])`, 'i');
  const match = openTag.match(updateRe);
  if (match) {
    return openTag.replace(updateRe, `$1${newValue}$3`);
  }

  // Add new attribute (before closing >)
  if (oldValue === null || oldValue === undefined) {
    return openTag.replace(/>$/, ` ${attrName}="${newValue}">`);
  }

  return null;
}

/**
 * Apply a semantic operation to file content.
 *
 * Pure function: no I/O, no DOM, no side effects.
 *
 * @param {VxOperation} op       - the operation to apply
 * @param {string}      content  - raw source file content
 * @returns {{ content: string, applied: boolean, reason?: string, strategy?: string }}
 */
export function applyOp(op, content) {
  if (!op || !op.type) {
    return { content, applied: false, reason: 'null or untyped operation' };
  }

  const validation = validateOp(op);
  if (!validation.valid) {
    return { content, applied: false, reason: `validation failed: ${validation.reason}` };
  }

  if (op.type === OpType.FALLBACK) {
    return { content, applied: false, reason: 'fallback ops are not persistable via applyOp' };
  }

  switch (op.type) {
    case OpType.SET_TEXT:
      return applySetText(op, content);
    case OpType.SET_ATTRIBUTE:
      return applySetAttribute(op, content);
    case OpType.SET_CLASS_LIST:
      return applySetClassList(op, content);
    case OpType.REPLACE_HTML:
      return applyReplaceHtml(op, content);
    case OpType.DELETE_NODE:
      return applyDeleteNode(op, content);
    case OpType.INSERT_NODE:
      return applyInsertNode(op, content);
    default:
      return { content, applied: false, reason: `unsupported op type: ${op.type}` };
  }
}

// ─── SET_TEXT ─────────────────────────────────

function applySetText(op, content) {
  const { oldText, newText } = op.payload;

  // Strategy 1: nodeKey-based targeting
  const nodeKey = op.address?.nodeKey;
  if (nodeKey) {
    const loc = locateByNodeKey(content, nodeKey);
    if (loc) {
      const openTag = parseOpeningTag(content, loc.startIndex);
      if (openTag && !VOID_TAGS.has(loc.tag)) {
        const closeTagStart = loc.element.lastIndexOf('</');
        if (closeTagStart > openTag.length) {
          // Verify: current inner HTML must match the op's expected oldText
          const currentInner = loc.element.substring(openTag.length, closeTagStart);
          if (oldText && normalizeWS(currentInner) !== normalizeWS(oldText)) {
            // Source has changed since op was created — refuse nodeKey path
          } else {
            const closeTag = loc.element.substring(closeTagStart);
            const newElement = openTag + newText + closeTag;
            const newContent = content.substring(0, loc.startIndex) + newElement + content.substring(loc.endIndex);
            return { content: newContent, applied: true, strategy: 'nodeKey' };
          }
        }
      }
    }
    // nodeKey targeting failed or verification failed — fall through to content match
  }

  // Strategy 2: content match with uniqueness check
  if (oldText) {
    const count = content.split(oldText).length - 1;
    if (count === 0) return { content, applied: false, reason: 'oldText not found in source' };
    if (count > 1) return { content, applied: false, reason: 'ambiguous: oldText appears multiple times' };
    const newContent = content.replace(oldText, newText);
    return { content: newContent, applied: true, strategy: 'contentMatch' };
  }

  return { content, applied: false, reason: 'no targeting data (no nodeKey, no oldText)' };
}

// ─── SET_ATTRIBUTE ───────────────────────────

function applySetAttribute(op, content) {
  const { attrName, oldValue, newValue } = op.payload;

  // Strategy 1: nodeKey-based targeting
  const nodeKey = op.address?.nodeKey;
  if (nodeKey) {
    const loc = locateByNodeKey(content, nodeKey);
    if (loc) {
      const openTag = parseOpeningTag(content, loc.startIndex);
      if (openTag) {
        // Verify: opening tag must contain the expected old attribute value
        if (oldValue !== null && oldValue !== undefined) {
          const hasDouble = openTag.includes(`${attrName}="${oldValue}"`);
          const hasSingle = openTag.includes(`${attrName}='${oldValue}'`);
          if (!hasDouble && !hasSingle) {
            // Source has changed — refuse nodeKey path, fall through
          } else {
            const modified = replaceAttrInTag(openTag, attrName, oldValue, newValue);
            if (modified !== null) {
              const newContent = content.substring(0, loc.startIndex) + modified + content.substring(loc.startIndex + openTag.length);
              return { content: newContent, applied: true, strategy: 'nodeKey' };
            }
          }
        } else {
          // Adding a new attribute (oldValue is null) — no verification needed
          const modified = replaceAttrInTag(openTag, attrName, oldValue, newValue);
          if (modified !== null) {
            const newContent = content.substring(0, loc.startIndex) + modified + content.substring(loc.startIndex + openTag.length);
            return { content: newContent, applied: true, strategy: 'nodeKey' };
          }
        }
      }
    }
    // nodeKey targeting failed or verification failed — fall through
  }

  // Strategy 2: content match — find the attribute by old value
  if (oldValue !== null && oldValue !== undefined) {
    const literal = `${attrName}="${oldValue}"`;
    const count = content.split(literal).length - 1;
    if (count === 0) {
      // Try single-quoted variant
      const singleQuoted = `${attrName}='${oldValue}'`;
      const sCount = content.split(singleQuoted).length - 1;
      if (sCount === 0) return { content, applied: false, reason: `attribute ${attrName}="${oldValue}" not found` };
      if (sCount > 1) return { content, applied: false, reason: `ambiguous: ${attrName}='${oldValue}' appears multiple times` };
      if (newValue === null) {
        return { content: content.replace(new RegExp(`\\s*${attrName}='${escapeForRegex(oldValue)}'`), ''), applied: true, strategy: 'contentMatch' };
      }
      return { content: content.replace(singleQuoted, `${attrName}='${newValue}'`), applied: true, strategy: 'contentMatch' };
    }
    if (count > 1) return { content, applied: false, reason: `ambiguous: ${attrName}="${oldValue}" appears multiple times` };
    if (newValue === null) {
      return { content: content.replace(new RegExp(`\\s*${attrName}="${escapeForRegex(oldValue)}"`), ''), applied: true, strategy: 'contentMatch' };
    }
    return { content: content.replace(literal, `${attrName}="${newValue}"`), applied: true, strategy: 'contentMatch' };
  }

  return { content, applied: false, reason: 'no targeting data for set_attribute' };
}

// ─── SET_CLASS_LIST ──────────────────────────

function applySetClassList(op, content) {
  const { oldClassStr, newClassStr } = op.payload;

  // Strategy 1: nodeKey-based targeting
  const nodeKey = op.address?.nodeKey;
  if (nodeKey) {
    const loc = locateByNodeKey(content, nodeKey);
    if (loc) {
      const openTag = parseOpeningTag(content, loc.startIndex);
      if (openTag) {
        // Verify: opening tag must contain the expected old class string
        if (oldClassStr && !openTag.includes(`class="${oldClassStr}"`) && !openTag.includes(`class='${oldClassStr}'`)) {
          // Source has changed — refuse nodeKey path, fall through
        } else {
          const modified = replaceAttrInTag(openTag, 'class', oldClassStr, newClassStr);
          if (modified !== null) {
            const newContent = content.substring(0, loc.startIndex) + modified + content.substring(loc.startIndex + openTag.length);
            return { content: newContent, applied: true, strategy: 'nodeKey' };
          }
        }
      }
    }
  }

  // Strategy 2: content match on old class string
  if (oldClassStr) {
    const literal = `class="${oldClassStr}"`;
    const count = content.split(literal).length - 1;
    if (count === 0) return { content, applied: false, reason: `class="${oldClassStr}" not found in source` };
    if (count > 1) return { content, applied: false, reason: `ambiguous: class="${oldClassStr}" appears multiple times` };
    return { content: content.replace(literal, `class="${newClassStr}"`), applied: true, strategy: 'contentMatch' };
  }

  return { content, applied: false, reason: 'no targeting data for set_class_list' };
}

// ─── REPLACE_HTML ────────────────────────────

function applyReplaceHtml(op, content) {
  const { oldHTML, newHTML } = op.payload;

  // Unique content match — this is the only strategy for replace_html
  const count = content.split(oldHTML).length - 1;
  if (count === 0) return { content, applied: false, reason: 'oldHTML not found in source' };
  if (count > 1) return { content, applied: false, reason: 'ambiguous: oldHTML appears multiple times' };

  return { content: content.replace(oldHTML, newHTML), applied: true, strategy: 'contentMatch' };
}

// ─── DELETE_NODE ─────────────────────────────

function applyDeleteNode(op, content) {
  const { outerHTML } = op.payload;

  // Strategy 1: nodeKey-based targeting with payload verification
  const nodeKey = op.address?.nodeKey;
  if (nodeKey) {
    const loc = locateByNodeKey(content, nodeKey);
    if (loc) {
      // Verify: located element must match the op's expected outerHTML
      if (outerHTML && normalizeWS(loc.element) !== normalizeWS(outerHTML)) {
        // Source has changed since op was created — refuse nodeKey delete
      } else {
        const newContent = content.substring(0, loc.startIndex) + content.substring(loc.endIndex);
        return { content: newContent, applied: true, strategy: 'nodeKey' };
      }
    }
  }

  // Strategy 2: content match on outerHTML with uniqueness check
  if (outerHTML) {
    const count = content.split(outerHTML).length - 1;
    if (count === 0) return { content, applied: false, reason: 'element outerHTML not found in source' };
    if (count > 1) return { content, applied: false, reason: 'ambiguous: element outerHTML appears multiple times' };
    return { content: content.replace(outerHTML, ''), applied: true, strategy: 'contentMatch' };
  }

  return { content, applied: false, reason: 'no targeting data for delete_node' };
}

// ─── INSERT_NODE ─────────────────────────────

function applyInsertNode(op, content) {
  const { html, parentAddress, siblingIndex } = op.payload;

  if (!parentAddress?.nodeKey) {
    return { content, applied: false, reason: 'insert_node requires parentAddress.nodeKey' };
  }

  // Locate the parent element by nodeKey
  const parentLoc = locateByNodeKey(content, parentAddress.nodeKey);
  if (!parentLoc) {
    return { content, applied: false, reason: 'parent element not found by nodeKey' };
  }

  // Parse the parent's opening tag to find the insertion zone
  const parentOpenTag = parseOpeningTag(content, parentLoc.startIndex);
  if (!parentOpenTag) {
    return { content, applied: false, reason: 'cannot parse parent opening tag' };
  }

  const innerStart = parentLoc.startIndex + parentOpenTag.length;
  const closeTagStart = parentLoc.element.lastIndexOf('</');
  if (closeTagStart <= parentOpenTag.length) {
    return { content, applied: false, reason: 'cannot determine parent inner content' };
  }

  const innerContent = parentLoc.element.substring(parentOpenTag.length, closeTagStart);
  const absoluteInnerStart = parentLoc.startIndex + parentOpenTag.length;

  // Count child elements to find the insertion position
  const childTagPattern = /<([a-z][a-z0-9]*)[\s>]/gi;
  let childMatch;
  let childCount = 0;
  let insertPos = 0; // relative to innerStart

  while ((childMatch = childTagPattern.exec(innerContent)) !== null) {
    const childTag = childMatch[1].toLowerCase();
    if (SKIP_TAGS.has(childTag)) continue;

    if (childCount === siblingIndex) {
      insertPos = childMatch.index;
      break;
    }

    // Skip past this child element entirely
    const childLoc = extractElement(innerContent, childMatch.index, childTag);
    if (childLoc) {
      childTagPattern.lastIndex = childLoc.endIndex;
    }
    childCount++;
  }

  // If siblingIndex is beyond existing children, append at end
  if (childCount < siblingIndex) {
    insertPos = innerContent.length;
  }

  const absoluteInsertPos = absoluteInnerStart + insertPos;
  const newContent = content.substring(0, absoluteInsertPos) + html + content.substring(absoluteInsertPos);
  return { content: newContent, applied: true, strategy: 'nodeKey' };
}


// ─── Internal Helpers ────────────────────────

function escapeForRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalize whitespace for comparison: collapse runs of whitespace to single space, trim.
 * Used for payload verification — source formatting may differ from DOM innerHTML.
 */
function normalizeWS(s) {
  return (s || '').replace(/\s+/g, ' ').trim();
}
