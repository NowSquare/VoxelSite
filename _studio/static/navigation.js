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

      // ── Padding safety net ──
      // The header sits above the menu (higher z-index). If the menu's
      // top padding doesn't clear the header height, links hide behind
      // the header bar. Auto-fix: measure once, pad if needed.
      if (header) {
        var headerH = header.offsetHeight;
        var menuPadTop = parseInt(getComputedStyle(menu).paddingTop, 10) || 0;
        if (menuPadTop < headerH) {
          menu.style.paddingTop = headerH + 'px';
        }
      }

      // ── Animated hamburger ↔ X variant system ──
      // The AI sets data-nav-style on the toggle to pick a personality.
      // Each variant defines bar count, gap, per-bar overrides (width,
      // alignment), and the CSS rules for the open-state X morph.
      // Defaults to 'classic' if no attribute is specified.
      var _navVariants = {
        classic:    { bars: 3, gap: 5, spans: [null, null, null],
          open: '.nav-toggle--open .vx-hamburger span:nth-child(1){transform:translateY(7px) rotate(45deg)}'
              + '.nav-toggle--open .vx-hamburger span:nth-child(2){opacity:0;transform:scaleX(0)}'
              + '.nav-toggle--open .vx-hamburger span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}' },
        minimal:    { bars: 2, gap: 8, spans: [null, null],
          open: '.nav-toggle--open .vx-hamburger span:nth-child(1){transform:translateY(5px) rotate(45deg)}'
              + '.nav-toggle--open .vx-hamburger span:nth-child(2){transform:translateY(-5px) rotate(-45deg)}' },
        asymmetric: { bars: 3, gap: 5, spans: [null, 'width:66%', 'width:33%'],
          open: '.nav-toggle--open .vx-hamburger span:nth-child(1){transform:translateY(7px) rotate(45deg)}'
              + '.nav-toggle--open .vx-hamburger span:nth-child(2){opacity:0;transform:scaleX(0);width:100%!important}'
              + '.nav-toggle--open .vx-hamburger span:nth-child(3){transform:translateY(-7px) rotate(-45deg);width:100%!important}' },
        refined:    { bars: 3, gap: 5, spans: [null, 'width:50%;align-self:center', null],
          open: '.nav-toggle--open .vx-hamburger span:nth-child(1){transform:translateY(7px) rotate(45deg)}'
              + '.nav-toggle--open .vx-hamburger span:nth-child(2){opacity:0;transform:scaleX(0);width:100%!important;align-self:stretch!important}'
              + '.nav-toggle--open .vx-hamburger span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}' }
      };

      var _navStyled = false;
      function _injectNavCSS(variantKey) {
        if (_navStyled) return;
        _navStyled = true;
        var v = _navVariants[variantKey] || _navVariants.classic;
        var s = document.createElement('style');
        s.id = 'vx-nav-anim';
        s.textContent =
          '.vx-hamburger{display:flex;flex-direction:column;justify-content:center;width:24px;height:24px;cursor:pointer}'
          + '.vx-hamburger span{display:block;height:2px;background:currentColor;border-radius:1px;width:100%;'
          +   'transition:transform .3s cubic-bezier(.16,1,.3,1),opacity .2s ease,width .3s cubic-bezier(.16,1,.3,1)}'
          + v.open;
        document.head.appendChild(s);
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
        if (im && ic) {
          im.classList.add('hidden');
          ic.classList.remove('hidden');
        }
        // Animated hamburger: add open class for CSS morph
        toggle.classList.add('nav-toggle--open');
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
        if (im && ic) {
          im.classList.remove('hidden');
          ic.classList.add('hidden');
        }
        // Animated hamburger: remove open class
        toggle.classList.remove('nav-toggle--open');
      }

      // Toggle button opens/closes
      toggle.addEventListener('click', function () {
        isOpen ? close() : open();
      });

      // ── Upgrade static icon-swap to animated hamburger ──
      // If the toggle has #icon-menu/#icon-close (Lucide icons), replace
      // them with a CSS-animated hamburger that morphs into an X.
      // The AI picks the variant via data-nav-style on the toggle button.
      var iconMenu = document.getElementById('icon-menu');
      var iconClose = document.getElementById('icon-close');
      if (iconMenu && iconClose && toggle.contains(iconMenu)) {
        var variantKey = toggle.getAttribute('data-nav-style') || 'classic';
        var variant = _navVariants[variantKey] || _navVariants.classic;
        _injectNavCSS(variantKey);
        // Replace the two SVGs with a single animated hamburger
        iconMenu.remove();
        iconClose.remove();
        var bars = document.createElement('div');
        bars.className = 'vx-hamburger';
        bars.style.gap = variant.gap + 'px';
        bars.setAttribute('aria-hidden', 'true');
        for (var i = 0; i < variant.bars; i++) {
          var span = document.createElement('span');
          if (variant.spans[i]) span.style.cssText = variant.spans[i];
          bars.appendChild(span);
        }
        toggle.appendChild(bars);
      }

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

      // ── Auto-close on viewport widen ──
      // When the user resizes past the mobile breakpoint (device rotation,
      // window resize), the desktop nav appears and the toggle is hidden.
      // If the mobile menu was left open, close it to prevent a stuck overlay.
      // Checks if the toggle became display:none (= desktop CSS kicked in).
      var _resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(function () {
          if (isOpen && getComputedStyle(toggle).display === 'none') {
            close();
          }
        }, 150);
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
