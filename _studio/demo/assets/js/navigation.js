/**
 * VoxelSite — Navigation
 *
 * Shipped navigation module. Handles ALL behavior for ANY nav pattern.
 * The AI generates the HTML structure and CSS styling; this file wires
 * up every interactive behavior automatically.
 *
 * AUTO-DEPLOYED: The engine copies this to assets/js/navigation.js on
 * every generation. The AI should NOT generate a navigation.js file.
 *
 * ═══════════════════════════════════════════════════════
 *  Supported HTML patterns (all work out of the box)
 * ═══════════════════════════════════════════════════════
 *
 * Pattern A — Icon swap (hamburger/X in single button):
 *   <button id="nav-toggle">
 *     <svg id="icon-menu">...</svg>
 *     <svg id="icon-close" class="hidden">...</svg>
 *   </button>
 *
 * Pattern B — Separate close button inside menu:
 *   <button id="nav-toggle">☰</button>
 *   <div id="mobile-menu">
 *     <button class="mobile-menu-close">✕</button>
 *     ...
 *   </div>
 *
 * Pattern C — Any close button (data attribute):
 *   <button data-close-menu>Close</button>
 *
 * Pattern D — No explicit close (overlay click + ESC only):
 *   Works automatically via overlay click and ESC key handlers.
 *
 * ═══════════════════════════════════════════════════════
 *  Required CSS contract
 * ═══════════════════════════════════════════════════════
 *
 *   .mobile-menu         — hidden by default (opacity:0 + pointer-events:none, OR display:none)
 *   .mobile-menu.is-open — visible (opacity:1 + pointer-events:auto, OR display:flex/block)
 *   .hidden              — display:none (for icon toggle, if used)
 */

(function () {
  'use strict';

  // Wait for full DOM before initializing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('mobile-menu');
    var header = document.getElementById('site-header');

    // ── Mobile menu ──────────────────────────────────────
    if (toggle && menu) {
      var isOpen = false;

      // Note: icon-swap elements (Pattern A) are queried inside open()/close()
      // by ID at toggle time, NOT cached here. icon-resolver.js replaces
      // <i> placeholders with <svg> elements — cached refs become detached.

      // Detect separate close button(s) (Pattern B/C) — optional
      var closeButtons = menu.querySelectorAll(
        '.mobile-menu-close, [data-close-menu], .nav-close, .menu-close'
      );

      // ── Z-index safety net ──
      // The close button (icon swap or toggle) lives inside the header.
      // If the mobile menu's z-index is >= the header's, the button is
      // unreachable. Auto-fix if detected.
      if (header) {
        var headerZ = parseInt(getComputedStyle(header).zIndex, 10) || 0;
        var menuZ = parseInt(getComputedStyle(menu).zIndex, 10) || 0;
        if (menuZ > 0 && headerZ <= menuZ) {
          header.style.zIndex = String(menuZ + 1);
        }
      }

      function open() {
        isOpen = true;
        menu.classList.add('is-open');
        menu.setAttribute('aria-hidden', 'false');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close navigation');
        document.body.style.overflow = 'hidden';

        // Pattern A: swap icons (query live DOM — refs change after hydration)
        var im = document.getElementById('icon-menu');
        var ic = document.getElementById('icon-close');
        if (im) im.classList.add('hidden');
        if (ic) ic.classList.remove('hidden');
      }

      function close() {
        isOpen = false;
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
        document.body.style.overflow = '';

        // Pattern A: swap icons back (query live DOM)
        var im = document.getElementById('icon-menu');
        var ic = document.getElementById('icon-close');
        if (im) im.classList.remove('hidden');
        if (ic) ic.classList.add('hidden');
      }

      // Toggle button opens/closes
      toggle.addEventListener('click', function () {
        isOpen ? close() : open();
      });

      // Pattern B/C: Separate close button(s)
      closeButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          close();
        });
      });

      // Close on Escape key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen) close();
      });

      // Close when a navigation link is clicked
      menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', close);
      });

      // Close on background/overlay click (click on menu container itself)
      menu.addEventListener('click', function (e) {
        if (e.target === menu) close();
      });
    }

    // ── Scroll-aware header ──────────────────────────────
    if (header) {
      var scrolled = false;
      var threshold = 20;

      function onScroll() {
        var shouldBeScrolled = window.scrollY > threshold;
        if (shouldBeScrolled !== scrolled) {
          scrolled = shouldBeScrolled;
          header.classList.toggle('is-scrolled', scrolled);
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll(); // Check initial state
    }
  }
})();
