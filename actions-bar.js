/**
 * VoxelSite Actions Bar — Shipped JavaScript
 *
 * Reads the actions manifest, renders a bottom navigation bar,
 * and displays slide-up form panels for user interaction.
 * Self-contained — no dependencies on studio.src.css or icons.js.
 *
 * Architecture:
 * - Fetches /actions/manifest.json on load
 * - Renders bar with one button per active action
 * - On click: slides up a form panel with the action's fields
 * - Submits via fetch() to /actions/submit.php
 * - Shows confirmation code on success
 */
(function () {
  'use strict';

  // ── Configuration ──
  var MANIFEST_URL = '/actions/manifest.json';
  var SUBMIT_URL = '/actions/submit.php';
  var I18N_BASE = '/actions/i18n/';
  var BAR_ID = 'vs-actions-bar';

  // ── Icons (inline SVG) ──
  var ICONS = {
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    utensils: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
    'file-text': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    'shopping-bag': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',
    'message-square': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    circle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    loader: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',
    'alert-triangle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };

  function getIcon(name) {
    return ICONS[name] || ICONS.circle;
  }

  // ── i18n ──
  var strings = {}; // Current locale translations
  var fallbackStrings = { // English fallback (always available, no network needed)
    'submit': 'Submit',
    'close': 'Close',
    'select_placeholder': 'Select\u2026',
    'aria_quick_actions': 'Quick actions',
    'validation.required_fields': 'Please fill in all required fields.',
    'validation.field_required': '{field} is required.',
    'validation.invalid_email': '{field} must be a valid email address.',
    'validation.invalid_phone': '{field} must be a valid phone number.',
    'validation.invalid_url': '{field} must be a valid URL.',
    'validation.numeric': '{field} must be a number.',
    'validation.number_min': '{field} must be at least {min}.',
    'validation.number_max': '{field} must be at most {max}.',
    'validation.too_short': '{field} must be at least {min} characters.',
    'validation.too_long': '{field} is too long.',
    'validation.date_past': '{field} must be a date in the future.',
    'validation.checkbox_required': '{field} must be checked.',
    'validation.select_min': '{field}: please select at least {min} option(s).',
    'result.success_default': 'Thank you for your submission!',
    'result.network_error': 'Network error. Please try again.',
    'result.generic_error': 'Something went wrong.',
    'stepper.increase': 'Increase',
    'stepper.decrease': 'Decrease'
  };

  /**
   * Translation lookup with interpolation.
   * t('validation.field_required', { field: 'Email' }) → "Email is required."
   */
  function t(key, params) {
    var str = strings[key] || fallbackStrings[key] || key;
    if (params) {
      Object.keys(params).forEach(function (k) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
      });
    }
    return str;
  }

  function detectLocale() {
    var lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    // Try exact match first (e.g. "fr-FR" → "fr-fr"), then base language ("fr")
    return lang.split('-')[0];
  }

  function loadTranslations(locale, callback) {
    if (locale === 'en') {
      strings = fallbackStrings;
      callback();
      return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', I18N_BASE + locale + '.json', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status === 200) {
        try {
          strings = JSON.parse(xhr.responseText);
        } catch (e) {
          strings = fallbackStrings;
        }
      } else {
        strings = fallbackStrings; // Fallback to English
      }
      callback();
    };
    xhr.send();
  }

  // ── Detect preview mode ──
  var isPreview = window.location.pathname.indexOf('/_studio/') !== -1 ||
                  window.location.search.indexOf('_path=') !== -1;

  if (isPreview) {
    MANIFEST_URL = '/_studio/api/router.php?_path=%2Fagentic%2Fmanifest';
  }

  // ── State ──
  var manifest = null;
  var activePanel = null;
  var viewportHandler = null;

  // ── Bootstrap ──
  function init() {
    if (document.getElementById(BAR_ID)) return;

    // Load translations first, then manifest
    var locale = detectLocale();
    loadTranslations(locale, function () {
      fetchManifest(function (data) {
        manifest = data;
        if (!manifest || !manifest.actions || manifest.actions.length === 0) return;

        SUBMIT_URL = manifest.submit_url || SUBMIT_URL;
        renderBar(manifest);
      });
    });
  }

  function fetchManifest(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', MANIFEST_URL, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status === 200) {
        try {
          var resp = JSON.parse(xhr.responseText);
          // Handle Studio API wrapper { ok: true, data: {...} }
          callback(resp.data || resp);
        } catch (e) {
          console.warn('[Actions Bar] Invalid manifest JSON');
        }
      }
    };
    xhr.send();
  }

  // ── Render Bar ──
  function renderBar(manifest) {
    var barSettings = manifest.bar_settings || {};
    var visibility = barSettings.visibility || 'all-pages';

    // Respect visibility setting
    if (visibility === 'hidden') return;
    if (visibility === 'homepage-only') {
      var path = window.location.pathname.replace(/\/+$/, '') || '/';
      if (path !== '/' && path !== '/index.php' && path !== '/index.html') return;
    }

    var variant = barSettings.theme || barSettings.position || 'bottom-bar';
    var colorScheme = barSettings.color_scheme || 'light';
    var brandColor = barSettings.brand_color || '';

    var bar = document.createElement('div');
    bar.id = BAR_ID;
    bar.className = 'vs-actions-bar';
    bar.setAttribute('data-variant', variant);
    bar.setAttribute('data-scheme', colorScheme);
    bar.setAttribute('role', 'navigation');
    bar.setAttribute('aria-label', t('aria_quick_actions'));

    // Apply brand color as CSS variable override
    if (brandColor) {
      bar.style.setProperty('--vs-actions-primary', brandColor);
      bar.style.setProperty('--vs-actions-primary-hover', brandColor);
    }

    var inner = document.createElement('div');
    inner.className = 'vs-actions-bar-inner';

    manifest.actions.forEach(function (action, idx) {
      var btn = document.createElement('button');
      btn.className = 'vs-actions-bar-btn';
      btn.setAttribute('data-action-id', action.id);
      btn.setAttribute('aria-label', action.name);
      btn.innerHTML =
        '<span class="vs-actions-bar-icon">' + getIcon(action.icon) + '</span>' +
        '<span class="vs-actions-bar-label">' + escapeHtml(action.name) + '</span>';

      // Stagger delay for FAB animation
      if (variant === 'floating-fab') {
        btn.style.transitionDelay = (idx * 40) + 'ms';
      }

      btn.addEventListener('click', function () {
        // Auto-collapse FAB when opening a panel
        if (variant === 'floating-fab') {
          bar.classList.remove('is-expanded');
        }
        if (activePanel && activePanel.dataset.actionId === action.id) {
          closePanel();
        } else {
          openPanel(action);
        }
      });

      inner.appendChild(btn);
    });

    bar.appendChild(inner);

    // FAB variant: add the floating trigger button
    if (variant === 'floating-fab') {
      var fabTrigger = document.createElement('button');
      fabTrigger.className = 'vs-actions-fab-trigger';
      fabTrigger.setAttribute('aria-label', t('aria_quick_actions'));
      fabTrigger.innerHTML = getIcon('plus');
      fabTrigger.addEventListener('click', function () {
        bar.classList.toggle('is-expanded');
      });
      // Append trigger AFTER inner so it renders below (column-reverse)
      bar.appendChild(fabTrigger);

      // Close FAB when clicking outside
      document.addEventListener('click', function (e) {
        if (bar.classList.contains('is-expanded') &&
            !bar.contains(e.target)) {
          bar.classList.remove('is-expanded');
        }
      });
    }

    document.body.appendChild(bar);

    // Add body padding — only for full-width bottom-bar
    if (variant === 'bottom-bar') {
      document.body.style.paddingBottom = 'calc(72px + env(safe-area-inset-bottom, 0px))';
    }
  }

  // ── Render Form Panel ──
  function openPanel(action) {
    closePanel();

    var bar = document.getElementById(BAR_ID);
    var scheme = bar ? bar.getAttribute('data-scheme') : 'light';
    var brandColor = bar ? bar.style.getPropertyValue('--vs-actions-primary') : '';

    var overlay = document.createElement('div');
    overlay.className = 'vs-actions-overlay is-visible';
    overlay.setAttribute('data-scheme', scheme);
    if (brandColor) {
      overlay.style.setProperty('--vs-actions-primary', brandColor);
      overlay.style.setProperty('--vs-actions-primary-hover', brandColor);
    }
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closePanel();
    });

    var panel = document.createElement('div');
    panel.className = 'vs-actions-panel';
    panel.dataset.actionId = action.id;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', action.name);

    // Header
    var header = document.createElement('div');
    header.className = 'vs-actions-panel-header';
    header.innerHTML =
      '<h3 class="vs-actions-panel-title">' + escapeHtml(action.name) + '</h3>' +
      '<button class="vs-actions-panel-close" aria-label="' + t('close') + '">' + getIcon('x') + '</button>';

    header.querySelector('.vs-actions-panel-close').addEventListener('click', closePanel);

    // Form
    var form = document.createElement('form');
    form.className = 'vs-actions-form';
    form.setAttribute('novalidate', '');

    action.fields.forEach(function (field) {
      if (field.type === 'hidden') {
        var hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = field.name;
        hidden.value = field.default || '';
        form.appendChild(hidden);
        return;
      }

      var group = document.createElement('div');
      group.className = 'vs-actions-form-group';

      var label = document.createElement('label');
      label.className = 'vs-actions-label';
      label.setAttribute('for', 'vs-action-' + action.id + '-' + field.name);
      label.innerHTML = escapeHtml(field.label || field.name);
      if (field.required) {
        label.innerHTML += ' <span class="vs-actions-required" aria-hidden="true">*</span>';
      }
      group.appendChild(label);

      var input = createFieldInput(action.id, field);
      group.appendChild(input);

      // Help text / description
      if (field.description) {
        var desc = document.createElement('div');
        desc.className = 'vs-actions-field-desc';
        desc.textContent = field.description;
        group.appendChild(desc);
      }

      // Error slot
      var error = document.createElement('div');
      error.className = 'vs-actions-field-error';
      error.id = 'vs-action-err-' + action.id + '-' + field.name;
      error.setAttribute('aria-live', 'polite');
      group.appendChild(error);

      form.appendChild(group);
    });

    // Submit button
    var submitGroup = document.createElement('div');
    submitGroup.className = 'vs-actions-form-actions';
    submitGroup.innerHTML =
      '<button type="submit" class="vs-actions-submit">' +
      '<span class="vs-actions-submit-text">' + t('submit') + '</span>' +
      '<span class="vs-actions-submit-loading" style="display:none">' + getIcon('loader') + '</span>' +
      '</button>';

    form.appendChild(submitGroup);

    // Result area
    var result = document.createElement('div');
    result.className = 'vs-actions-result';
    result.style.display = 'none';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitAction(action, form, result);
    });

    panel.appendChild(header);
    panel.appendChild(form);
    panel.appendChild(result);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    activePanel = panel;

    // Animate in
    requestAnimationFrame(function () {
      panel.classList.add('is-open');
    });

    // Focus first input
    var firstInput = form.querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(function () { firstInput.focus(); }, 150);
    }

    // Escape key
    document.addEventListener('keydown', handleEscape);

    // iOS keyboard handling via visualViewport
    // When the keyboard opens, the visual viewport shrinks. We adjust the
    // panel max-height so the form stays visible and scrollable.
    if (window.visualViewport) {
      viewportHandler = function () {
        var vpHeight = window.visualViewport.height;
        var offset = window.visualViewport.offsetTop;
        panel.style.maxHeight = (vpHeight - offset) + 'px';
      };
      window.visualViewport.addEventListener('resize', viewportHandler);
      window.visualViewport.addEventListener('scroll', viewportHandler);
    }

    // Auto-scroll focused inputs into view (keyboard coverage prevention)
    form.addEventListener('focusin', function (e) {
      var target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) {
        setTimeout(function () {
          target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300); // Delay for keyboard animation
      }
    });
  }

  function closePanel() {
    // Clean up visualViewport listener
    if (viewportHandler && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', viewportHandler);
      window.visualViewport.removeEventListener('scroll', viewportHandler);
      viewportHandler = null;
    }

    var overlay = document.querySelector('.vs-actions-overlay');
    if (overlay) {
      var panel = overlay.querySelector('.vs-actions-panel');
      if (panel) {
        panel.classList.remove('is-open');
        panel.style.maxHeight = ''; // Reset to CSS default
      }
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 200);
    }
    activePanel = null;
    document.removeEventListener('keydown', handleEscape);
  }

  function handleEscape(e) {
    if (e.key === 'Escape') closePanel();
  }

  // ── Field Input Factory ──
  function createFieldInput(actionId, field) {
    var id = 'vs-action-' + actionId + '-' + field.name;

    if (field.type === 'select' || (field.type === 'radio' && field.options && field.options.length > 4)) {
      var select = document.createElement('select');
      select.className = 'vs-actions-input';
      select.id = id;
      select.name = field.name;
      if (field.required) { select.required = true; select.setAttribute('aria-required', 'true'); }

      var placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = field.placeholder || t('select_placeholder');
      placeholder.disabled = true;
      placeholder.selected = true;
      select.appendChild(placeholder);

      (field.options || []).forEach(function (opt) {
        var option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (field.default_value && opt === field.default_value) option.selected = true;
        select.appendChild(option);
      });

      return select;
    }

    if (field.type === 'radio' && field.options) {
      var radioGroup = document.createElement('div');
      radioGroup.className = 'vs-actions-radio-group';
      radioGroup.setAttribute('role', 'radiogroup');
      radioGroup.setAttribute('aria-labelledby', id + '-label');

      field.options.forEach(function (opt, idx) {
        var radioLabel = document.createElement('label');
        radioLabel.className = 'vs-actions-radio-label';

        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.className = 'vs-actions-radio';
        radio.name = field.name;
        radio.value = opt;
        if (field.required && idx === 0) radio.required = true;
        if (field.default_value && opt === field.default_value) radio.checked = true;

        var dot = document.createElement('span');
        dot.className = 'vs-actions-radio-dot';

        radioLabel.appendChild(radio);
        radioLabel.appendChild(dot);
        radioLabel.appendChild(document.createTextNode(' ' + opt));
        radioGroup.appendChild(radioLabel);
      });

      return radioGroup;
    }

    if (field.type === 'multiselect' && field.options) {
      var multiGroup = document.createElement('div');
      multiGroup.className = 'vs-actions-multiselect-group';
      multiGroup.setAttribute('role', 'group');
      multiGroup.setAttribute('aria-labelledby', id + '-label');

      // Hidden input to hold the combined value for validation/collection
      var hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.id = id;
      hiddenInput.name = field.name;
      hiddenInput.value = '';
      multiGroup.appendChild(hiddenInput);

      var defaults = (field.default_value || '').split(',').map(function (v) { return v.trim(); });

      field.options.forEach(function (opt) {
        var mLabel = document.createElement('label');
        mLabel.className = 'vs-actions-checkbox-label';

        var mCheck = document.createElement('input');
        mCheck.type = 'checkbox';
        mCheck.className = 'vs-actions-multiselect-option';
        mCheck.value = opt;
        if (defaults.indexOf(opt) !== -1) mCheck.checked = true;

        var mBox = document.createElement('span');
        mBox.className = 'vs-actions-checkbox-box';

        mCheck.addEventListener('change', function () {
          var checked = multiGroup.querySelectorAll('.vs-actions-multiselect-option:checked');
          var vals = [];
          for (var i = 0; i < checked.length; i++) vals.push(checked[i].value);
          hiddenInput.value = vals.join(',');
        });

        mLabel.appendChild(mCheck);
        mLabel.appendChild(mBox);
        mLabel.appendChild(document.createTextNode(' ' + opt));
        multiGroup.appendChild(mLabel);
      });

      // Set initial value from defaults
      var initialChecked = multiGroup.querySelectorAll('.vs-actions-multiselect-option:checked');
      var initialVals = [];
      for (var ci = 0; ci < initialChecked.length; ci++) initialVals.push(initialChecked[ci].value);
      hiddenInput.value = initialVals.join(',');

      return multiGroup;
    }

    if (field.type === 'textarea') {
      var textarea = document.createElement('textarea');
      textarea.className = 'vs-actions-input';
      textarea.id = id;
      textarea.name = field.name;
      textarea.rows = 3;
      if (field.placeholder) textarea.placeholder = field.placeholder;
      if (field.default_value) textarea.value = field.default_value;
      if (field.required) { textarea.required = true; textarea.setAttribute('aria-required', 'true'); }
      if (field.max_length) textarea.maxLength = field.max_length;
      return textarea;
    }

    if (field.type === 'checkbox') {
      var checkLabel = document.createElement('label');
      checkLabel.className = 'vs-actions-checkbox-label';

      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'vs-actions-checkbox';
      checkbox.id = id;
      checkbox.name = field.name;
      checkbox.value = '1';

      var checkBox = document.createElement('span');
      checkBox.className = 'vs-actions-checkbox-box';

      checkLabel.appendChild(checkbox);
      checkLabel.appendChild(checkBox);
      checkLabel.appendChild(document.createTextNode(' ' + (field.label || field.name)));

      return checkLabel;
    }

    if (field.type === 'number') {
      var stepper = document.createElement('div');
      stepper.className = 'vs-actions-stepper';

      var minus = document.createElement('button');
      minus.type = 'button';
      minus.className = 'vs-actions-stepper-btn';
      minus.textContent = '\u2212';
      minus.setAttribute('aria-label', t('stepper.decrease'));

      var numInput = document.createElement('input');
      numInput.type = 'number';
      numInput.className = 'vs-actions-stepper-input';
      numInput.id = id;
      numInput.name = field.name;
      if (field.min !== undefined) numInput.min = field.min;
      if (field.max !== undefined) numInput.max = field.max;
      numInput.value = field.default_value || field.min || 1;
      if (field.required) { numInput.required = true; numInput.setAttribute('aria-required', 'true'); }

      var plus = document.createElement('button');
      plus.type = 'button';
      plus.className = 'vs-actions-stepper-btn';
      plus.textContent = '+';
      plus.setAttribute('aria-label', t('stepper.increase'));

      minus.addEventListener('click', function () {
        var v = parseInt(numInput.value, 10) || 0;
        var minV = field.min !== undefined ? field.min : -Infinity;
        if (v > minV) numInput.value = v - 1;
      });

      plus.addEventListener('click', function () {
        var v = parseInt(numInput.value, 10) || 0;
        var maxV = field.max !== undefined ? field.max : Infinity;
        if (v < maxV) numInput.value = v + 1;
      });

      stepper.appendChild(minus);
      stepper.appendChild(numInput);
      stepper.appendChild(plus);

      return stepper;
    }

    // Default: text, email, tel, url, date, time
    var input = document.createElement('input');
    input.className = 'vs-actions-input';
    input.id = id;
    input.name = field.name;
    input.type = mapFieldType(field.type);
    if (field.placeholder) input.placeholder = field.placeholder;
    if (field.default_value) input.value = field.default_value;
    if (field.required) { input.required = true; input.setAttribute('aria-required', 'true'); }
    if (field.max_length) input.maxLength = field.max_length;
    if (field.min !== undefined) input.min = field.min;
    if (field.max !== undefined) input.max = field.max;

    return input;
  }

  function mapFieldType(type) {
    var map = { text: 'text', email: 'email', tel: 'tel', url: 'url', date: 'date', time: 'time' };
    return map[type] || 'text';
  }

  // ── Form Submission ──
  function submitAction(action, form, resultEl) {
    // Clear previous errors
    form.querySelectorAll('.vs-actions-field-error').forEach(function (el) {
      el.textContent = '';
    });
    form.querySelectorAll('.has-error').forEach(function (el) {
      el.classList.remove('has-error');
    });

    // ── Client-side validation ──
    var hasErrors = false;
    (action.fields || []).forEach(function (field) {
      if (field.type === 'hidden') return;

      var input = document.getElementById('vs-action-' + action.id + '-' + field.name);
      var errEl = document.getElementById('vs-action-err-' + action.id + '-' + field.name);
      var label = field.label || field.name;

      // Checkbox required — special case (value is always '1', check .checked)
      if (field.type === 'checkbox') {
        if (field.required && input && !input.checked) {
          if (errEl) errEl.textContent = t('validation.checkbox_required', { field: label });
          if (input) input.classList.add('has-error');
          hasErrors = true;
        }
        return;
      }

      // Multiselect required — at least 1 option must be checked
      if (field.type === 'multiselect') {
        var msValue = input ? input.value : '';
        if (field.required && !msValue) {
          if (errEl) errEl.textContent = t('validation.select_min', { field: label, min: 1 });
          hasErrors = true;
        }
        return;
      }

      if (!input || !errEl) return;

      var value = (input.value || '').trim();

      // Required check (handles select with disabled placeholder too)
      if (field.required && !value) {
        errEl.textContent = t('validation.field_required', { field: label });
        input.classList.add('has-error');
        hasErrors = true;
        return;
      }

      if (!value) return; // Skip further validation on empty optional fields

      // Email format
      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errEl.textContent = t('validation.invalid_email', { field: label });
        input.classList.add('has-error');
        hasErrors = true;
        return;
      }

      // Phone format — allow digits, +, spaces, dashes, parens; require ≥7 digits
      if (field.type === 'tel') {
        var digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length < 7 || !/^[+\d\s\-().]+$/.test(value)) {
          errEl.textContent = t('validation.invalid_phone', { field: label });
          input.classList.add('has-error');
          hasErrors = true;
          return;
        }
      }

      // URL format
      if (field.type === 'url' && !/^https?:\/\/.+\..+/.test(value)) {
        errEl.textContent = t('validation.invalid_url', { field: label });
        input.classList.add('has-error');
        hasErrors = true;
        return;
      }

      // Number validation
      if (field.type === 'number') {
        var numVal = parseFloat(value);
        if (isNaN(numVal)) {
          errEl.textContent = t('validation.numeric', { field: label });
          input.classList.add('has-error');
          hasErrors = true;
          return;
        }
        if (field.min !== undefined && numVal < field.min) {
          errEl.textContent = t('validation.number_min', { field: label, min: field.min });
          input.classList.add('has-error');
          hasErrors = true;
          return;
        }
        if (field.max !== undefined && numVal > field.max) {
          errEl.textContent = t('validation.number_max', { field: label, max: field.max });
          input.classList.add('has-error');
          hasErrors = true;
          return;
        }
      }

      // Date — must be in the future (when require_future is set or min is "today")
      if (field.type === 'date' && (field.require_future || field.min === 'today')) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var selected = new Date(value + 'T00:00:00');
        if (selected < today) {
          errEl.textContent = t('validation.date_past', { field: label });
          input.classList.add('has-error');
          hasErrors = true;
          return;
        }
      }

      // Min length (text, textarea)
      if (field.min_length && value.length < field.min_length) {
        errEl.textContent = t('validation.too_short', { field: label, min: field.min_length });
        input.classList.add('has-error');
        hasErrors = true;
        return;
      }

      // Max length
      if (field.max_length && value.length > field.max_length) {
        errEl.textContent = t('validation.too_long', { field: label });
        input.classList.add('has-error');
        hasErrors = true;
      }
    });

    if (hasErrors) {
      showResult(resultEl, form, false, t('validation.required_fields'));
      // Scroll first error into view
      var firstErr = form.querySelector('.has-error');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Collect form data
    var data = {};
    var formData = new FormData(form);
    formData.forEach(function (value, key) {
      data[key] = value;
    });

    // Convert multiselect fields from comma strings to arrays
    (action.fields || []).forEach(function (field) {
      if (field.type === 'multiselect' && typeof data[field.name] === 'string') {
        data[field.name] = data[field.name] ? data[field.name].split(',') : [];
      }
    });

    // Source marker
    data._source = 'web';

    // Show loading state
    var btn = form.querySelector('.vs-actions-submit');
    var btnText = btn.querySelector('.vs-actions-submit-text');
    var btnLoader = btn.querySelector('.vs-actions-submit-loading');
    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-flex';

    // Submit via fetch
    var url = SUBMIT_URL;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;

      btn.disabled = false;
      btnText.style.display = '';
      btnLoader.style.display = 'none';

      try {
        var resp = JSON.parse(xhr.responseText);
        var result = resp.data || resp;

        if (result.ok) {
          showResult(resultEl, form, true, result.message || t('result.success_default'), result.confirmation_code);
        } else {
          // Show field-level errors with translated messages
          if (result.errors && Array.isArray(result.errors)) {
            result.errors.forEach(function (err) {
              showInlineError(form, action, err);
            });
          }
          showResult(resultEl, form, false, result.message || t('result.generic_error'), null, result.errors);
        }
      } catch (e) {
        showResult(resultEl, form, false, t('result.network_error'));
      }
    };

    xhr.send(JSON.stringify({ action_id: action.id, data: data }));
  }

  function showResult(resultEl, form, success, message, code, errors) {
    resultEl.style.display = 'block';
    resultEl.className = 'vs-actions-result ' + (success ? 'is-success' : 'is-error');

    var icon = success ? getIcon('check') : getIcon('alert-triangle');

    // Always use generic translated message for success — no custom server text, no confirmation codes
    var displayMessage = success ? t('result.success_default') : message;
    var bodyHtml = '<p class="vs-actions-result-message">' + escapeHtml(displayMessage) + '</p>';

    resultEl.innerHTML =
      '<div class="vs-actions-result-icon">' + icon + '</div>' +
      '<div class="vs-actions-result-body">' + bodyHtml + '</div>';

    if (success) {
      form.style.display = 'none';
    }

    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showInlineError(form, action, errorMsg) {
    // Try to match error to a field and show translated message
    action.fields.forEach(function (field) {
      var label = field.label || field.name;
      if (errorMsg.indexOf(label) !== -1 || errorMsg.indexOf(field.name) !== -1) {
        var errEl = document.getElementById('vs-action-err-' + action.id + '-' + field.name);
        if (errEl) {
          // Translate based on error pattern
          if (errorMsg.indexOf('required') !== -1 || errorMsg.indexOf('verplicht') !== -1) {
            errEl.textContent = t('validation.field_required', { field: label });
          } else if (errorMsg.indexOf('email') !== -1 || errorMsg.indexOf('e-mail') !== -1) {
            errEl.textContent = t('validation.invalid_email', { field: label });
          } else {
            errEl.textContent = errorMsg; // Fallback to server message
          }
        }

        var input = document.getElementById('vs-action-' + action.id + '-' + field.name);
        if (input) input.classList.add('has-error');
      }
    });
  }

  // ── Utilities ──
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Auto-init ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Hot-reload support ──
  window.addEventListener('message', function (e) {
    if (e.data === 'voxelsite:reload') {
      var existing = document.getElementById(BAR_ID);
      if (existing) existing.parentNode.removeChild(existing);
      closePanel();
      init();
    }
  });
})();
