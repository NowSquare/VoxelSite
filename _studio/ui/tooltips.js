/**
 * VoxelSite Studio — Custom Tooltip System
 *
 * Automatically intercepts native `title` attributes and replaces them
 * with styled, positioned tooltips. Zero changes required to existing
 * HTML or JS — any element with a `title` attribute gets a custom tooltip.
 *
 * Design:
 *   - Dark pill, 11px Inter medium, compact padding
 *   - 80ms debounce before show, 100ms fade entrance, 60ms fade-out
 *   - CSS arrow, auto-flips above/below, clamped to viewport
 *   - Keyboard shortcut badges: (⌘S) → styled <kbd>
 *   - position: fixed + z-index: 10003 (above toasts, below VX overlays)
 *
 * Usage:
 *   import { initTooltips } from './tooltips.js';
 *   initTooltips();
 *
 * Elements can also use `data-tooltip="..."` directly (no native title).
 * To suppress the tooltip on an element, add `data-tooltip-skip`.
 */

// ═══════════════════════════════════════════
//  State
// ═══════════════════════════════════════════

let _tooltip = null;     // Singleton tooltip DOM element
let _arrow = null;       // Arrow child element for positioning
let _activeEl = null;    // Element currently bound to the visible tooltip
let _pendingEl = null;   // Element waiting for the debounce to fire
let _hideTimer = null;   // Timeout for fade-out removal
let _showTimer = null;   // Debounce timeout before showing
let _initialized = false;

// ═══════════════════════════════════════════
//  Constants
// ═══════════════════════════════════════════

const SHOW_DELAY = 80;        // ms debounce — prevents flash on quick sweeps
const FADE_IN_DURATION = 100; // ms (CSS transition)
const FADE_OUT_DURATION = 60; // ms (CSS transition)
const GAP = 5;                // px between trigger and tooltip
const VIEWPORT_PAD = 6;       // px margin from viewport edges

// ═══════════════════════════════════════════
//  Keyboard shortcut detection
// ═══════════════════════════════════════════

/**
 * Transform tooltip text into HTML, rendering keyboard shortcut patterns
 * as styled <kbd> badges. Matches parenthesized modifier+key combos.
 */
function renderTooltipHTML(text) {
  return text.replace(/\(([⌘⇧⌥⌃\w+↵←→↑↓⌫]+)\)/g, (_, shortcut) => {
    return `<kbd class="vs-tooltip-kbd">${escapeHTML(shortcut)}</kbd>`;
  });
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ═══════════════════════════════════════════
//  Tooltip element (singleton)
// ═══════════════════════════════════════════

function ensureTooltipEl() {
  if (_tooltip) return;

  const el = document.createElement('div');
  el.className = 'vs-tooltip';
  el.setAttribute('role', 'tooltip');

  const content = document.createElement('span');
  content.className = 'vs-tooltip-content';

  const arrow = document.createElement('span');
  arrow.className = 'vs-tooltip-arrow';

  el.appendChild(content);
  el.appendChild(arrow);
  document.body.appendChild(el);

  _tooltip = el;
  _arrow = arrow;
}

// ═══════════════════════════════════════════
//  Positioning (viewport-relative, fixed)
// ═══════════════════════════════════════════

function positionTooltip(triggerEl) {
  if (!_tooltip) return;

  const triggerRect = triggerEl.getBoundingClientRect();
  const tooltipRect = _tooltip.getBoundingClientRect();

  // Vertical — prefer above, flip below if clipped
  let top;
  let placement = 'above';

  const spaceAbove = triggerRect.top;
  const spaceBelow = window.innerHeight - triggerRect.bottom;

  if (spaceAbove >= tooltipRect.height + GAP + VIEWPORT_PAD) {
    top = triggerRect.top - tooltipRect.height - GAP;
  } else if (spaceBelow >= tooltipRect.height + GAP + VIEWPORT_PAD) {
    top = triggerRect.bottom + GAP;
    placement = 'below';
  } else if (spaceAbove >= spaceBelow) {
    top = VIEWPORT_PAD;
  } else {
    top = triggerRect.bottom + GAP;
    placement = 'below';
  }

  // Horizontal — centered on trigger, clamped to viewport
  const triggerCenter = triggerRect.left + triggerRect.width / 2;
  let left = triggerCenter - tooltipRect.width / 2;
  left = Math.max(VIEWPORT_PAD, Math.min(left, window.innerWidth - VIEWPORT_PAD - tooltipRect.width));

  // Arrow — tracks trigger center, clamped to tooltip edges
  const arrowLeft = triggerCenter - left;
  const clampedArrow = Math.max(8, Math.min(tooltipRect.width - 8, arrowLeft));

  // Apply — no scroll offsets because position: fixed
  _tooltip.style.top = `${top}px`;
  _tooltip.style.left = `${left}px`;
  _arrow.style.left = `${clampedArrow}px`;

  _tooltip.classList.remove('vs-tooltip--above', 'vs-tooltip--below');
  _tooltip.classList.add(`vs-tooltip--${placement}`);
}

// ═══════════════════════════════════════════
//  Show / Hide
// ═══════════════════════════════════════════

function show(el) {
  const text = el.getAttribute('data-tooltip') || el.getAttribute('title');
  if (!text || !text.trim()) return;

  // Stash title → data-tooltip to suppress native tooltip
  if (el.hasAttribute('title')) {
    el.setAttribute('data-tooltip', el.getAttribute('title'));
    el.removeAttribute('title');
  }

  // Cancel pending hide
  if (_hideTimer) { clearTimeout(_hideTimer); _hideTimer = null; }

  _activeEl = el;
  _pendingEl = null;

  ensureTooltipEl();

  // Set content
  _tooltip.querySelector('.vs-tooltip-content').innerHTML = renderTooltipHTML(text.trim());

  // Make visible but transparent for measurement
  _tooltip.classList.remove('vs-tooltip--visible', 'vs-tooltip--hiding');
  _tooltip.style.display = 'flex';
  _tooltip.style.opacity = '0';

  // Single rAF — position then reveal in same frame
  requestAnimationFrame(() => {
    if (_activeEl !== el) return;
    positionTooltip(el);
    _tooltip.classList.add('vs-tooltip--visible');
    _tooltip.style.opacity = '';
  });
}

function hide() {
  if (!_tooltip) return;

  // Restore title on the element that was active
  if (_activeEl) {
    restoreTitle(_activeEl);
    _activeEl = null;
  }

  _tooltip.classList.remove('vs-tooltip--visible');
  _tooltip.classList.add('vs-tooltip--hiding');

  _hideTimer = setTimeout(() => {
    if (_tooltip) {
      _tooltip.style.display = 'none';
      _tooltip.classList.remove('vs-tooltip--hiding');
    }
    _hideTimer = null;
  }, FADE_OUT_DURATION);
}

/** Instantly hide — no fade, no delay. Used on mousedown / scroll. */
function hideInstant() {
  if (_showTimer) { clearTimeout(_showTimer); _showTimer = null; }
  _pendingEl = null;

  if (_activeEl) {
    restoreTitle(_activeEl);
    _activeEl = null;
  }

  if (_hideTimer) { clearTimeout(_hideTimer); _hideTimer = null; }

  if (_tooltip) {
    _tooltip.style.display = 'none';
    _tooltip.classList.remove('vs-tooltip--visible', 'vs-tooltip--hiding');
  }
}

function restoreTitle(el) {
  if (!el) return;
  const text = el.getAttribute('data-tooltip');
  if (text && !el.hasAttribute('title')) {
    el.setAttribute('title', text);
    el.removeAttribute('data-tooltip');
  }
}

// ═══════════════════════════════════════════
//  Event Handlers
// ═══════════════════════════════════════════

/**
 * Walk up from `el` to find the nearest tooltip-bearing ancestor.
 * Short-circuits on `data-tooltip-skip` and stops at body.
 */
function findTooltipTarget(el) {
  while (el && el !== document.body) {
    if (el.nodeType !== Node.ELEMENT_NODE) { el = el.parentElement; continue; }
    if (el.hasAttribute('data-tooltip-skip')) return null;
    if (el.hasAttribute('title') || el.hasAttribute('data-tooltip')) return el;
    el = el.parentElement;
  }
  return null;
}

function onMouseOver(e) {
  // Ignore mouse moves with buttons pressed (dragging)
  if (e.buttons !== 0) return;

  const target = findTooltipTarget(e.target);

  // No tooltip target under cursor — cancel pending and hide
  if (!target) {
    if (_showTimer) { clearTimeout(_showTimer); _showTimer = null; }
    _pendingEl = null;
    if (_activeEl) hide();
    return;
  }

  // Same element that's already showing — nothing to do
  if (target === _activeEl) return;

  // Same element that's already pending — let the timer fire
  if (target === _pendingEl) return;

  // New target — cancel any pending show, schedule new one
  if (_showTimer) { clearTimeout(_showTimer); _showTimer = null; }

  // If switching directly from one tooltip target to another,
  // hide the old one first (instant, no fade)
  if (_activeEl) {
    restoreTitle(_activeEl);
    _activeEl = null;
    if (_hideTimer) { clearTimeout(_hideTimer); _hideTimer = null; }
    if (_tooltip) {
      _tooltip.style.display = 'none';
      _tooltip.classList.remove('vs-tooltip--visible', 'vs-tooltip--hiding');
    }
  }

  _pendingEl = target;
  _showTimer = setTimeout(() => {
    _showTimer = null;
    if (_pendingEl === target) {
      show(target);
    }
  }, SHOW_DELAY);
}

function onMouseOut(e) {
  const target = findTooltipTarget(e.target);
  if (!target) return;

  // Only act if leaving the active or pending element
  if (target === _activeEl) {
    // Check if mouse moved to a child of the same target (bubbling artifact)
    const related = e.relatedTarget;
    if (related && target.contains(related)) return;

    if (_showTimer) { clearTimeout(_showTimer); _showTimer = null; }
    _pendingEl = null;
    hide();
  } else if (target === _pendingEl) {
    if (_showTimer) { clearTimeout(_showTimer); _showTimer = null; }
    _pendingEl = null;
  }
}

function onScroll() {
  if (_activeEl || _pendingEl) hideInstant();
}

function onKeyDown() {
  if (_activeEl || _pendingEl) hideInstant();
}

function onMouseDown() {
  if (_activeEl || _pendingEl) hideInstant();
}

// ═══════════════════════════════════════════
//  Public API
// ═══════════════════════════════════════════

/**
 * Initialize the custom tooltip system.
 * Call once after the DOM is ready. Uses event delegation on document
 * to automatically handle all current and future elements with `title`
 * or `data-tooltip` attributes — no per-element binding needed.
 */
export function initTooltips() {
  if (_initialized) return;
  _initialized = true;

  document.addEventListener('mouseover', onMouseOver, { passive: true });
  document.addEventListener('mouseout', onMouseOut, { passive: true });
  document.addEventListener('scroll', onScroll, { passive: true, capture: true });
  document.addEventListener('keydown', onKeyDown, { passive: true });
  document.addEventListener('mousedown', onMouseDown, { passive: true });

  window.addEventListener('resize', () => {
    if (_activeEl) hideInstant();
  }, { passive: true });
}
