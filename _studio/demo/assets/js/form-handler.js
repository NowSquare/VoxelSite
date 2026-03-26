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
        banner.style.cssText = 'margin:1rem auto;max-width:640px;padding:1.25rem 1.5rem;border:1px solid currentColor;border-radius:10px;font-size:0.95rem;line-height:1.5;text-align:center;display:flex;align-items:center;justify-content:center;gap:0.625rem;opacity:.65;';
        banner.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="currentColor" opacity=".08"/><path d="M7.5 12.25L10.5 15.25L17 8.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/></svg>';
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

  // ── Form UI system ──
  // Uses an injected <style> for animations and pseudo-elements (can't do
  // these inline) and reads the computed font from a nearby styled element
  // so errors and success states match the site's typography on ANY theme.
  // The !important rules override whatever paragraph styles the
  // AI-generated CSS might apply.
  var _formStyled = false;
  function _injectFormCSS() {
    if (_formStyled) return;
    _formStyled = true;
    var s = document.createElement('style');
    s.id = 'vx-form-ui';
    s.textContent =
      // ── Error animations + styling ──
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
      + '}'
      // ── Success state ──
      // Choreography: circle scales in → checkmark draws → message fades up.
      // Every color uses currentColor so the component adapts to any theme:
      // dark backgrounds with light text, light backgrounds with dark text,
      // or anything in between. Opacity controls visual weight.
      + '@keyframes vxCircle{from{transform:scale(.85)}to{transform:scale(1)}}'
      + '@keyframes vxDraw{to{stroke-dashoffset:0}}'
      + '@keyframes vxFadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:.5;transform:translateY(0)}}'
      + '.form-success{'
      +   'display:flex!important;flex-direction:column!important;align-items:center!important;'
      +   'gap:2rem!important;padding:3.5rem 2rem!important;text-align:center!important;'
      + '}'
      // Circle: transform-only animation. Do NOT animate opacity here —
      // it would override the SVG element's inline opacity=".06",
      // turning the subtle tint into a solid disk.
      + '.form-success-circle{animation:vxCircle .5s cubic-bezier(.4,0,.2,1) both!important}'
      // Checkmark: stroke draws in after circle settles.
      // Like opacity, do NOT use !important on stroke-dashoffset —
      // it would block the animation's forwards fill from persisting.
      + '.form-success-check{'
      +   'stroke-dasharray:32!important;stroke-dashoffset:32;'
      +   'animation:vxDraw .5s .2s cubic-bezier(.4,0,.2,1) forwards!important;'
      + '}'
      // Message: inherits font from the form (set via inline style).
      // Starts invisible; the animation fades to 50% opacity and persists
      // via fill-mode:forwards. We intentionally do NOT set a static
      // opacity:0!important because that would override the animation fill.
      + '.form-success-msg{'
      +   'font-size:.9375rem!important;font-weight:400!important;'
      +   'line-height:1.65!important;letter-spacing:-.005em!important;'
      +   'color:currentColor!important;'
      +   'max-width:340px!important;'
      +   'opacity:0;'
      +   'animation:vxFadeUp .45s .65s cubic-bezier(.4,0,.2,1) forwards!important;'
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
    _injectFormCSS();
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

          // ── Premium success state ──
          // Choreography: circle → checkmark draws → message fades up.
          // All colors use currentColor so this adapts to any theme.
          _injectFormCSS();
          var font = _resolveFont(form);
          var successDiv = document.createElement('div');
          successDiv.className = 'form-success';
          successDiv.setAttribute('role', 'status');
          successDiv.setAttribute('tabindex', '-1');
          successDiv.style.fontFamily = font;

          // Single circle + stroke-drawn checkmark.
          // Path length ≈ 31.1 (two line segments), dasharray 32 covers it.
          successDiv.innerHTML = ''
            + '<svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">'
            +   '<circle class="form-success-circle" cx="32" cy="32" r="30" fill="currentColor" opacity=".06"/>'
            +   '<path class="form-success-check" d="M22 33L29 40L44 25" '
            +     'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" '
            +     'stroke-linejoin="round" opacity=".5"/>'
            + '</svg>';

          if (data.message) {
            var msgP = document.createElement('p');
            msgP.className = 'form-success-msg';
            msgP.textContent = data.message;
            successDiv.appendChild(msgP);
          }

          form.innerHTML = '';
          form.appendChild(successDiv);
          successDiv.focus();
          successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

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
