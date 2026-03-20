/**
 * VoxelSite — Icon Resolver
 *
 * Shipped icon hydration module. Turns lightweight placeholder markup
 * into inline SVGs fetched from the canonical icon set at /assets/icons/.
 *
 * AUTO-DEPLOYED: The engine copies this to assets/js/icon-resolver.js on
 * every generation. The AI should NOT generate an icon-resolver.js file.
 *
 * ═══════════════════════════════════════════════════════
 *  HTML contract
 * ═══════════════════════════════════════════════════════
 *
 *   <i class="icon" data-lucide="phone" aria-hidden="true"></i>
 *
 *   - The AI outputs only the placeholder tag with data-lucide="name".
 *   - This script resolves the name to an inline <svg> at runtime.
 *   - Classes, id, style, role, aria-* are preserved on the <svg>.
 *   - Size is controlled via .icon / .icon-sm / .icon-lg / .icon-xl.
 *   - Stroke color follows currentColor (inherits text-* classes).
 *
 * ═══════════════════════════════════════════════════════
 *  Public API
 * ═══════════════════════════════════════════════════════
 *
 *   window.VoxelSiteIcons.hydrate(root?)
 *     Manually re-hydrate all [data-lucide] elements within `root`
 *     (defaults to document). Use after dynamic DOM insertion.
 */

(function () {
  'use strict';

  // ── Alias map for common AI hallucinations ──
  // ONLY alias names that do NOT exist as .svg files in /assets/icons/.
  // If a name has a real file on disk, let it resolve normally — the AI
  // (or user) may have chosen that specific icon deliberately.
  // Verified against the installed Lucide icon set.
  var ALIASES = {
    'email':       'mail',
    'location':    'map-pin',
    'time':        'clock',
    'cancel':      'x',
    'telephone':   'phone',
    'call':        'phone',
    'address':     'map-pin',
    'envelope':    'mail',
    'right-arrow': 'arrow-right',
    'left-arrow':  'arrow-left',
    'down-arrow':  'arrow-down',
    'up-arrow':    'arrow-up',
    'tick':        'check',
    'checkmark':   'check',
    'remove':      'x',
    'pencil-edit': 'pencil',
    'gear':        'settings',
    'question':    'help-circle',
    'login':       'log-in',
    'logout':      'log-out',
    'signin':      'log-in',
    'signout':     'log-out',
    'profile':     'user',
    'account':     'user',
    'person':      'user',
    'people':      'users',
    'team':        'users',
    'photo':       'image',
    'picture':     'image',
    'hide':        'eye-off',
    'visible':     'eye',
    'invisible':   'eye-off',
    'mute':        'volume-x',
    'print':       'printer',
    'refresh':     'refresh-cw',
    'reload':      'refresh-cw',
    'sync':        'refresh-cw',
    'cart':        'shopping-cart',
    'basket':      'shopping-cart',
    'bag':         'shopping-bag',
    'shop':        'store',
    'payment':     'credit-card',
    'dollar':      'dollar-sign',
    'money':       'dollar-sign',
    'price':       'tag',
    'lightning':   'zap',
    'fast':        'zap',
    'speed':       'zap',
    'magic':       'sparkles',
    'like':        'thumbs-up',
    'dislike':     'thumbs-down',
    'happy':       'smile',
    'sad':         'frown',
    'directions':  'map',
    'chart':       'bar-chart-2',
    'graph':       'bar-chart-2',
    'analytics':   'bar-chart-2',
    'trending':    'trending-up',
    'growth':      'trending-up',
    'sort':        'arrow-up-down',
    'stop':        'square'
  };

  var FALLBACK_ICON = 'circle';

  // ── SVG content cache (name → SVG inner nodes string) ──
  var cache = {};       // name → Promise<string|null>
  var resolved = {};    // name → string (resolved SVG markup) or null

  /**
   * Normalize an icon name: trim, lowercase, underscores to hyphens,
   * then resolve aliases.
   */
  function normalizeName(raw) {
    var name = (raw || '').trim().toLowerCase().replace(/_/g, '-');
    return ALIASES[name] || name;
  }

  /**
   * Fetch an icon SVG file and extract the inner child nodes.
   * Returns a promise that resolves to the SVG markup string or null.
   */
  function fetchIcon(name) {
    if (cache[name]) return cache[name];

    cache[name] = new Promise(function (resolve) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/assets/icons/' + name + '.svg', true);
      xhr.onload = function () {
        if (xhr.status === 200 && xhr.responseText) {
          // Validate response is actually SVG, not a soft-404 HTML page.
          // Some servers (Valet, Nginx) return 200 + HTML for missing files.
          // Lucide SVG files may start with a license comment before <svg>.
          var text = xhr.responseText.trim();
          var lower = text.toLowerCase();
          if (lower.indexOf('<svg') !== -1
              && lower.indexOf('<!doctype') === -1
              && lower.indexOf('<html') === -1) {
            resolved[name] = text;
            resolve(text);
          } else {
            resolved[name] = null;
            resolve(null);
          }
        } else {
          resolved[name] = null;
          resolve(null);
        }
      };
      xhr.onerror = function () {
        resolved[name] = null;
        resolve(null);
      };
      xhr.send();
    });

    return cache[name];
  }

  /**
   * Parse an SVG string and create a properly attributed <svg> element.
   * Copies inner nodes from the source SVG. Preserves attributes from
   * the placeholder element.
   */
  function createSvgElement(svgText, placeholder, iconName) {
    // Parse the fetched SVG to extract its children and viewBox
    var parser = new DOMParser();
    var doc = parser.parseFromString(svgText, 'image/svg+xml');
    var sourceSvg = doc.querySelector('svg');

    if (!sourceSvg) return null;

    // Create the inline SVG element
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    // Copy viewBox and standard Lucide attributes from the source
    var viewBox = sourceSvg.getAttribute('viewBox') || '0 0 24 24';
    svg.setAttribute('viewBox', viewBox);

    // Standard Lucide stroke attributes
    svg.setAttribute('fill', sourceSvg.getAttribute('fill') || 'none');
    svg.setAttribute('stroke', sourceSvg.getAttribute('stroke') || 'currentColor');
    svg.setAttribute('stroke-width', sourceSvg.getAttribute('stroke-width') || '2');
    svg.setAttribute('stroke-linecap', sourceSvg.getAttribute('stroke-linecap') || 'round');
    svg.setAttribute('stroke-linejoin', sourceSvg.getAttribute('stroke-linejoin') || 'round');

    // Transfer preserved attributes from the placeholder
    var preserve = ['class', 'id', 'style', 'role', 'width', 'height'];
    for (var i = 0; i < preserve.length; i++) {
      var val = placeholder.getAttribute(preserve[i]);
      if (val !== null && val !== '') {
        svg.setAttribute(preserve[i], val);
      }
    }

    // Transfer all aria-* and data-* attributes (except data-lucide)
    var attrs = placeholder.attributes;
    for (var j = 0; j < attrs.length; j++) {
      var attr = attrs[j];
      if ((attr.name.indexOf('aria-') === 0 || attr.name.indexOf('data-') === 0)
          && attr.name !== 'data-lucide'
          && attr.name !== 'data-lucide-missing') {
        svg.setAttribute(attr.name, attr.value);
      }
    }

    // Mark as resolved for debugging
    svg.setAttribute('data-lucide', iconName);

    // Copy all child nodes from the source SVG
    while (sourceSvg.firstChild) {
      svg.appendChild(sourceSvg.firstChild);
    }

    return svg;
  }

  /**
   * Hydrate a single placeholder element.
   */
  function hydrateElement(el) {
    var rawName = el.getAttribute('data-lucide');
    if (!rawName) return;

    // Skip already-hydrated elements (SVGs that already have data-lucide)
    if (el.tagName.toLowerCase() === 'svg') return;

    var name = normalizeName(rawName);

    // Fast path: already resolved
    if (resolved[name] !== undefined) {
      if (resolved[name] === null) {
        // Primary name missing — try fallback
        handleMissing(el, rawName, name);
      } else {
        replaceWithSvg(el, resolved[name], name);
      }
      return;
    }

    // Async path: fetch and replace
    fetchIcon(name).then(function (svgText) {
      // Element might have been removed from DOM during fetch
      if (!el.parentNode) return;

      if (svgText) {
        replaceWithSvg(el, svgText, name);
      } else {
        handleMissing(el, rawName, name);
      }
    });
  }

  /**
   * Replace a placeholder element with an inline SVG.
   */
  function replaceWithSvg(el, svgText, iconName) {
    var svg = createSvgElement(svgText, el, iconName);
    if (svg && el.parentNode) {
      el.parentNode.replaceChild(svg, el);
    }
  }

  /**
   * Handle a missing icon: warn, mark, and fall back.
   */
  function handleMissing(el, rawName, normalizedName) {
    console.warn('[VoxelSiteIcons] Missing icon: "' + rawName + '"'
      + (normalizedName !== rawName ? ' (normalized: "' + normalizedName + '")' : ''));

    // Try the fallback icon
    if (normalizedName !== FALLBACK_ICON) {
      fetchIcon(FALLBACK_ICON).then(function (svgText) {
        if (!el.parentNode) return;

        if (svgText) {
          var svg = createSvgElement(svgText, el, FALLBACK_ICON);
          if (svg && el.parentNode) {
            svg.setAttribute('data-lucide-missing', rawName);
            el.parentNode.replaceChild(svg, el);
          }
        }
        // If even the fallback is missing, leave the placeholder in place
      });
    }
  }

  /**
   * Hydrate all [data-lucide] placeholders within a root element.
   */
  function hydrate(root) {
    var container = root || document;
    var elements = container.querySelectorAll('[data-lucide]');

    for (var i = 0; i < elements.length; i++) {
      // Skip SVGs (already hydrated)
      if (elements[i].tagName.toLowerCase() !== 'svg') {
        hydrateElement(elements[i]);
      }
    }
  }

  // ── Initialize ──

  function init() {
    // Hydrate all existing placeholders
    hydrate(document);

    // Observe for dynamically added placeholders
    if (typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var node = added[j];
            if (node.nodeType !== 1) continue; // element nodes only

            // Check the node itself
            if (node.hasAttribute && node.hasAttribute('data-lucide')
                && node.tagName.toLowerCase() !== 'svg') {
              hydrateElement(node);
            }

            // Check descendants
            if (node.querySelectorAll) {
              var descendants = node.querySelectorAll('[data-lucide]');
              for (var k = 0; k < descendants.length; k++) {
                if (descendants[k].tagName.toLowerCase() !== 'svg') {
                  hydrateElement(descendants[k]);
                }
              }
            }
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  // Wait for full DOM before initializing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Public API ──
  window.VoxelSiteIcons = { hydrate: hydrate };
})();
