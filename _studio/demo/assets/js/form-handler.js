/**
 * VoxelSite Form Handler — shipped code, never AI-generated.
 *
 * Auto-binds to all forms targeting submit.php.
 * Features:
 *  - Studio preview detection (scoped — production iframes work fine)
 *  - AJAX submission with JSON response handling
 *  - Field-level error display with accessibility (aria-invalid, aria-live, focus)
 *  - Success redirect support (from schema success_redirect)
 *  - Non-AJAX fallback banners (form_success / form_error query params)
 *  - Loading state on submit button
 */
(function() {
  'use strict';

  // ── Robust form selector ──
  // Matches action="/submit.php", action='/submit.php', and variations
  // with trailing slashes or query strings.
  var forms = document.querySelectorAll(
    'form[action="/submit.php"], form[action=\'/submit.php\'], form[action="/submit.php/"], form[action="/submit.php?"]'
  );
  // Fallback: also match forms whose action attribute contains submit.php
  if (forms.length === 0) {
    forms = document.querySelectorAll('form');
    forms = Array.prototype.filter.call(forms, function(f) {
      var action = (f.getAttribute('action') || '').replace(/^https?:\/\/[^/]+/, '');
      return action === '/submit.php' || action === '/submit.php/' || action.startsWith('/submit.php?');
    });
  }

  // ── Preview detection (scoped to Studio only) ──
  // Only block submissions when inside the Studio preview iframe,
  // not in any arbitrary iframe (production embeds should work fine).
  function isStudioPreview() {
    try {
      // Studio adds a data attribute to its preview iframe
      if (window.frameElement && window.frameElement.hasAttribute('data-voxelsite-preview')) {
        return true;
      }
      // Fallback: check if parent has VoxelSite Studio markers
      if (window.self !== window.top && window.parent.document.getElementById('app')) {
        var studioMeta = window.parent.document.querySelector('meta[name="voxelsite-studio"]');
        if (studioMeta) return true;
      }
    } catch (_) {
      // Cross-origin iframe — not Studio preview, allow submission
    }
    return false;
  }

  var inPreview = isStudioPreview();

  // ── Non-AJAX fallback: render banners from query params ──
  var urlParams = new URLSearchParams(window.location.search);
  var formSuccess = urlParams.get('form_success');
  var formError = urlParams.get('form_error');

  if (formSuccess || formError) {
    // Find the form to show the banner near, or use the first form on page
    var targetForm = forms.length > 0 ? (forms[0].form || forms[0]) : null;
    if (targetForm || document.querySelector('main')) {
      var banner = document.createElement('div');
      banner.setAttribute('role', 'alert');
      banner.setAttribute('aria-live', 'assertive');

      if (formSuccess) {
        banner.className = 'form-banner form-banner-success';
        banner.style.cssText = 'margin:1rem auto;max-width:640px;padding:1.25rem 1.5rem;background:#ecfdf5;border:2px solid #10b981;border-radius:10px;color:#065f46;font-size:0.95rem;line-height:1.5;text-align:center;display:flex;align-items:center;justify-content:center;gap:0.625rem;';
        banner.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#d1fae5"/><path d="M7.5 12.25L10.5 15.25L17 8.5" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      } else {
        banner.className = 'form-banner form-banner-error';
        banner.style.cssText = 'margin:1rem auto;max-width:640px;padding:1rem 1.25rem;background:#fef2f2;border:2px solid #ef4444;border-radius:10px;color:#991b1b;font-size:0.95rem;line-height:1.5;text-align:center;';
        banner.textContent = formError;
      }

      if (targetForm) {
        targetForm.parentNode.insertBefore(banner, targetForm);
      } else {
        var main = document.querySelector('main');
        if (main && main.firstChild) {
          main.insertBefore(banner, main.firstChild);
        }
      }

      // Clean URL without reloading
      var cleanUrl = window.location.pathname;
      urlParams.delete('form_success');
      urlParams.delete('form_error');
      var remaining = urlParams.toString();
      if (remaining) cleanUrl += '?' + remaining;
      window.history.replaceState(null, '', cleanUrl);
    }
  }

  // ── Error display system ──
  // Uses an injected <style> for animation + ::before dot (can't do these
  // inline) and reads the computed font from a nearby styled element so
  // errors match the site's typography on ANY theme. The !important rules
  // override whatever paragraph styles the AI-generated CSS might apply.
  var _errStyled = false;
  function _injectErrorCSS() {
    if (_errStyled) return;
    _errStyled = true;
    var s = document.createElement('style');
    s.id = 'vx-form-errors';
    s.textContent =
      '@keyframes vxErrIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}'
      + '.field-error{'
      +   'margin:8px 0 0!important;padding:0!important;'
      +   'background:none!important;border:none!important;box-shadow:none!important;'
      +   'font-size:0.8125rem!important;font-weight:500!important;'
      +   'line-height:1.4!important;letter-spacing:0.01em!important;'
      +   'color:#dc2626!important;'
      +   'display:flex!important;align-items:center!important;gap:6px!important;'
      +   'animation:vxErrIn .2s ease-out both!important;'
      +   'max-width:100%!important;box-sizing:border-box!important;'
      + '}'
      + '.field-error strong{font-weight:700!important}'
      + '.field-error::before{'
      +   'content:""!important;flex-shrink:0!important;'
      +   'width:6px!important;height:6px!important;'
      +   'border-radius:50%!important;background:currentColor!important;'
      + '}';
    document.head.appendChild(s);
  }

  // Read the actual computed font from the form — VoxelSite sites apply
  // fonts via Tailwind classes (.font-body) on individual elements, not on
  // <body>, so `inherit` falls through to the browser's default serif.
  // We probe a label or input inside the form, then fall back to body.
  function _resolveFont(form) {
    var probe = form.querySelector('label') || form.querySelector('input') || document.body;
    return window.getComputedStyle(probe).fontFamily;
  }

  function createFieldError(message, id, form) {
    _injectErrorCSS();
    var el = document.createElement('p');
    el.className = 'field-error';
    el.setAttribute('role', 'alert');
    if (id) el.id = id;
    // Bold the field name portion: "Email Address is required" → "<strong>Email Address</strong> is required"
    var parts = message.match(/^(.+?)(\s+(?:is|must|should|cannot|can't|has|are)\b.+)$/i);
    if (parts) {
      var strong = document.createElement('strong');
      strong.textContent = parts[1];
      el.appendChild(strong);
      el.appendChild(document.createTextNode(parts[2]));
    } else {
      el.textContent = message;
    }
    // Set the font explicitly — the only inline style we need.
    el.style.fontFamily = _resolveFont(form || document.body);
    return el;
  }

  // ── Bind AJAX submission to each form ──
  Array.prototype.forEach.call(forms, function(form) {
    // Create an aria-live region for screen readers
    var liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;';
    form.appendChild(liveRegion);

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      if (!btn) return;
      var origText = btn.textContent;

      // Preview check (scoped to Studio)
      if (inPreview) {
        var existing = form.querySelector('.form-preview-notice');
        if (existing) existing.remove();
        var notice = document.createElement('div');
        notice.className = 'form-preview-notice';
        notice.setAttribute('role', 'status');
        notice.style.cssText = 'margin-top:1rem;padding:1rem 1.25rem;background:#fffbeb;border:2px solid #f59e0b;border-radius:10px;color:#92400e;font-size:0.9rem;line-height:1.5;';
        notice.innerHTML = '<strong>Preview Mode</strong> — Form submissions are disabled in the preview.<br>Publish your site to enable form submissions.';
        btn.after(notice);
        return;
      }

      btn.textContent = 'Sending...';
      btn.disabled = true;

      // Clear previous errors + reset field styling
      form.querySelectorAll('.field-error').forEach(function(el) { el.remove(); });
      form.querySelectorAll('[aria-invalid]').forEach(function(el) {
        el.removeAttribute('aria-invalid');
        el.style.removeProperty('border-color');
      });

      try {
        var res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        var contentType = res.headers.get('content-type') || '';
        var data = null;

        if (contentType.includes('application/json')) {
          data = await res.json();
        } else if (res.ok) {
          // HTTP 200 but non-JSON (e.g. HTML or empty) — treat as success
          // since the server accepted the submission
          data = { success: true };
        } else {
          throw new Error('Server returned an unexpected response (HTTP ' + res.status + '). Please try again.');
        }

        if (data.success) {
          // Check for redirect URL
          if (data.redirect) {
            window.location.href = data.redirect;
            return;
          }

          // Replace form with a single iconic checkmark
          var successDiv = document.createElement('div');
          successDiv.className = 'form-success';
          successDiv.setAttribute('role', 'status');
          successDiv.setAttribute('tabindex', '-1');
          successDiv.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:1.25rem;padding:3.5rem 1.5rem;text-align:center;';
          successDiv.innerHTML = ''
            + '<svg width="72" height="72" viewBox="0 0 72 72" fill="none" style="flex-shrink:0;">'
            +   '<circle cx="36" cy="36" r="36" fill="#ecfdf5"/>'
            +   '<circle cx="36" cy="36" r="30" fill="#d1fae5"/>'
            +   '<path d="M24 36.5L32.5 45L50 27" stroke="#059669" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
            + '</svg>';
          if (data.message) {
            var msgSpan = document.createElement('span');
            msgSpan.style.cssText = 'font-size:0.95rem;color:#065f46;max-width:340px;line-height:1.5;';
            msgSpan.textContent = data.message;
            successDiv.appendChild(msgSpan);
          }
          form.innerHTML = '';
          form.appendChild(successDiv);
          successDiv.focus();

          // Announce to screen readers
          liveRegion.textContent = data.message || 'Form submitted successfully.';
        } else if (data.errors) {
          var firstErrorField = null;
          Object.entries(data.errors).forEach(function(entry) {
            var field = entry[0], msg = entry[1];
            var el = form.querySelector('[name="' + field + '"]');
            if (!el) {
              // Multiselect: checkboxes use name="field[]" in HTML
              el = form.querySelector('[name="' + field + '[]"]');
            }
            if (el) {
              el.setAttribute('aria-invalid', 'true');
              var isCheckable = (el.type === 'checkbox' || el.type === 'radio');
              if (!isCheckable) {
                el.style.borderColor = '#f87171';
              }
              var err = createFieldError(msg, 'error-' + field, form);
              el.setAttribute('aria-describedby', err.id);
              // For checkboxes/radios, insert after the entire group container
              // (fieldset or wrapping div), not after an individual label.
              var anchor = el;
              if (isCheckable) {
                anchor = el.closest('fieldset') || el.closest('[class*="group"]') || el.closest('div:has(input[type="' + el.type + '"])') || el.parentNode;
                // Walk up to the outermost wrapper that contains all same-name inputs
                while (anchor.parentNode && anchor.parentNode !== form && anchor.parentNode.querySelectorAll('[name="' + el.name + '"]').length > 0) {
                  anchor = anchor.parentNode;
                }
              }
              anchor.parentNode.insertBefore(err, anchor.nextSibling);
              if (!firstErrorField) firstErrorField = el;
            }
          });

          // Scroll to and focus the first error so the user sees what failed
          if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Delay focus slightly so scrollIntoView finishes first
            setTimeout(function() { firstErrorField.focus({ preventScroll: true }); }, 350);
          }

          btn.textContent = origText;
          btn.disabled = false;

          // Announce to screen readers
          liveRegion.textContent = 'There were errors in your submission. Please correct them and try again.';
        } else {
          var err = createFieldError(data.message || 'Something went wrong. Please try again.', null, form);
          err.style.setProperty('margin-top', '1rem', 'important');
          btn.parentNode.insertBefore(err, btn.nextSibling);
          btn.textContent = origText;
          btn.disabled = false;
        }
      } catch (ex) {
        var msg = ex.message && !ex.message.includes('Failed to fetch')
          ? ex.message
          : 'Network error. Please check your connection and try again.';
        var err = createFieldError(msg, null, form);
        err.style.setProperty('margin-top', '1rem', 'important');
        btn.parentNode.insertBefore(err, btn.nextSibling);
        btn.textContent = origText;
        btn.disabled = false;
      }
    });
  });
})();
