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

      // Clear previous errors
      form.querySelectorAll('.field-error').forEach(function(el) { el.remove(); });
      form.querySelectorAll('[aria-invalid]').forEach(function(el) { el.removeAttribute('aria-invalid'); });

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
            if (el) {
              el.setAttribute('aria-invalid', 'true');
              var err = document.createElement('p');
              err.className = 'field-error';
              err.setAttribute('role', 'alert');
              err.id = 'error-' + field;
              err.textContent = msg;
              el.setAttribute('aria-describedby', err.id);
              el.parentNode.appendChild(err);
              if (!firstErrorField) firstErrorField = el;
            }
          });

          // Focus first error field for accessibility
          if (firstErrorField) {
            firstErrorField.focus();
          }

          btn.textContent = origText;
          btn.disabled = false;

          // Announce to screen readers
          liveRegion.textContent = 'There were errors in your submission. Please correct them and try again.';
        } else {
          var err = document.createElement('p');
          err.className = 'field-error';
          err.setAttribute('role', 'alert');
          err.textContent = data.message || 'Something went wrong. Please try again.';
          btn.parentNode.appendChild(err);
          btn.textContent = origText;
          btn.disabled = false;
        }
      } catch (ex) {
        var err = document.createElement('p');
        err.className = 'field-error';
        err.setAttribute('role', 'alert');
        err.textContent = ex.message && !ex.message.includes('Failed to fetch')
          ? ex.message
          : 'Network error. Please check your connection and try again.';
        btn.parentNode.appendChild(err);
        btn.textContent = origText;
        btn.disabled = false;
      }
    });
  });
})();
