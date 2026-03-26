/**
 * VoxelSite Studio — Actions View
 *
 * Agent action definitions, bar settings, records, and template picker.
 */

import { api } from '../../api.js';
import { icons } from '../icons.js';
import { escapeHtml, escapeAttr, formatRelativeTime } from '../helpers.js';
import { showToast } from '../ui/toasts.js';
import { showConfirmModal, closeModal, onBackdropClick } from '../ui/modals.js';

const demoGuard = () => window.demoGuard?.() || false;
const viewerGuard = () => window.viewerGuard?.() || false;


/**
 * Status badge color map for action records.
 */
const ACTION_STATUS_COLORS = {
  confirmed:  { bg: 'var(--vs-success-dim)', text: 'var(--vs-success)',  label: 'Confirmed' },
  pending:    { bg: 'var(--vs-info-dim)',    text: 'var(--vs-info)',     label: 'Pending' },
  cancelled:  { bg: 'var(--vs-error-dim)',   text: 'var(--vs-error)',    label: 'Cancelled' },
  completed:  { bg: 'var(--vs-accent-dim)',  text: 'var(--vs-accent)',   label: 'Completed' },
  rejected:   { bg: 'var(--vs-error-dim)',   text: 'var(--vs-error)',    label: 'Rejected' },
  'no-show':  { bg: 'var(--vs-bg-raised)',   text: 'var(--vs-text-ghost)', label: 'No-show' },
  archived:   { bg: 'var(--vs-bg-raised)',   text: 'var(--vs-text-ghost)', label: 'Archived' },
};

/** Template icons — emoji for each template id */
const TEMPLATE_ICONS = {
  'contact':            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  'newsletter':         '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  'reservation':        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
  'appointment':        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  'event-registration': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',
  'callback':           '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  'quote-request':      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  'feedback':           '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  'waitlist':           '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
};

/**
 * Render the Actions list view.
 * Shows all action definitions with stats, status dots, and record counts.
 */
export function renderActionsView() {
  setTimeout(() => loadActions(), 0);

  return `
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="vs-page-title">Agent Actions</h1>
            <p class="vs-page-subtitle">Define what AI agents and visitors can do on your website.</p>
          </div>
          <button id="btn-new-action" class="vs-btn vs-btn-primary vs-btn-sm">New Action</button>
        </div>
      </div>
      <div id="bar-settings-card"></div>
      <div id="actions-list-container">
        <div class="flex flex-col gap-4">
          ${[1,2,3].map(() => `
            <div class="vs-form-card" style="pointer-events: none;">
              <div class="vs-form-card-icon" style="background: var(--vs-bg-raised); color: transparent;">
                <svg width="22" height="22" viewBox="0 0 24 24"></svg>
              </div>
              <div class="vs-form-card-body">
                <div style="height: 14px; width: 140px; background: var(--vs-bg-raised); border-radius: 4px; margin-bottom: 6px; animation: vs-skeleton-pulse 1.5s ease-in-out infinite;"></div>
                <div style="height: 11px; width: 220px; background: var(--vs-bg-raised); border-radius: 4px; animation: vs-skeleton-pulse 1.5s ease-in-out 0.1s infinite;"></div>
              </div>
              <div class="vs-form-card-right" style="opacity: 0.3;">
                <svg width="16" height="16" viewBox="0 0 24 24"></svg>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

async function loadActions() {
  const container = document.getElementById('actions-list-container');
  if (!container) return;

  // Bind "+ New Action" button
  document.getElementById('btn-new-action')?.addEventListener('click', async () => {
    const result = await showNewActionModal();
    if (result?.ok && result.actionId) {
      window.location.hash = `#/actions/${result.actionId}`;
    }
  });

  // ── Render Bar Settings Card ──
  const barCard = document.getElementById('bar-settings-card');
  if (barCard) {
    const { ok: barOk, data: barData } = await api.get('/agentic/actions/bar-settings');
    const barSettings = (barOk && barData?.settings) || { theme: 'bottom-bar', visibility: 'all-pages' };
    const currentTheme = barSettings.theme || 'bottom-bar';
    const currentVis = barSettings.visibility || 'all-pages';

    // Mini wireframe SVGs for each theme
    const themePreviews = {
      'bottom-bar': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
        <rect x="1" y="1" width="118" height="70" rx="6" stroke="currentColor" stroke-width="1" opacity="0.2"/>
        <rect x="8" y="8" width="40" height="4" rx="2" fill="currentColor" opacity="0.12"/>
        <rect x="8" y="16" width="70" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <rect x="8" y="22" width="55" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <rect x="0" y="56" width="120" height="16" rx="0" fill="currentColor" opacity="0.1"/>
        <circle cx="30" cy="64" r="3.5" fill="currentColor" opacity="0.35"/>
        <circle cx="52" cy="64" r="3.5" fill="currentColor" opacity="0.35"/>
        <circle cx="74" cy="64" r="3.5" fill="currentColor" opacity="0.35"/>
      </svg>`,
      'floating-fab': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
        <rect x="1" y="1" width="118" height="70" rx="6" stroke="currentColor" stroke-width="1" opacity="0.2"/>
        <rect x="8" y="8" width="40" height="4" rx="2" fill="currentColor" opacity="0.12"/>
        <rect x="8" y="16" width="70" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <rect x="8" y="22" width="55" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <circle cx="100" cy="56" r="10" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.3"/>
        <line x1="96" y1="56" x2="104" y2="56" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
        <line x1="100" y1="52" x2="100" y2="60" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
      </svg>`,
      'minimal-pill': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
        <rect x="1" y="1" width="118" height="70" rx="6" stroke="currentColor" stroke-width="1" opacity="0.2"/>
        <rect x="8" y="8" width="40" height="4" rx="2" fill="currentColor" opacity="0.12"/>
        <rect x="8" y="16" width="70" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <rect x="8" y="22" width="55" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <rect x="32" y="56" width="56" height="12" rx="6" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1" stroke-opacity="0.25"/>
        <circle cx="48" cy="62" r="2.5" fill="currentColor" opacity="0.3"/>
        <circle cx="60" cy="62" r="2.5" fill="currentColor" opacity="0.3"/>
        <circle cx="72" cy="62" r="2.5" fill="currentColor" opacity="0.3"/>
      </svg>`,
    };

    const themeLabels = { 'bottom-bar': 'Bottom Bar', 'floating-fab': 'Floating FAB', 'minimal-pill': 'Minimal Pill' };
    const visLabels = { 'all-pages': 'All Pages', 'homepage-only': 'Homepage Only', 'hidden': 'Hidden' };

    barCard.innerHTML = `
      <div class="vs-settings-card" style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <h2 class="vs-settings-card-title" style="margin-bottom: 2px;">Actions Bar</h2>
            <p style="font-size: 12px; color: var(--vs-text-tertiary); margin: 0;">How actions appear on your published site.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 12px; color: var(--vs-text-secondary); white-space: nowrap;">Show on</label>
            <select id="bar-visibility" class="vs-input" style="font-size: 12px; height: 30px; padding: 4px 8px; min-width: 130px;">
              ${Object.entries(visLabels).map(([val, label]) =>
                `<option value="${val}" ${currentVis === val ? 'selected' : ''}>${label}</option>`
              ).join('')}
            </select>
          </div>
        </div>
        <div id="bar-theme-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          ${Object.entries(themePreviews).map(([theme, svg]) => {
            const isActive = theme === currentTheme;
            return `
              <button type="button" class="bar-theme-option" data-theme="${theme}" style="
                border: 2px solid ${isActive ? 'var(--vs-accent)' : 'var(--vs-border-subtle)'};
                background: ${isActive ? 'color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))' : 'var(--vs-bg-surface)'};
                border-radius: var(--radius-lg, 10px);
                padding: 14px 12px 10px;
                cursor: pointer;
                display: flex; flex-direction: column; align-items: center; gap: 8px;
                transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.12s;
                color: ${isActive ? 'var(--vs-accent)' : 'var(--vs-text-ghost)'};
                position: relative;
                outline: none;
              "
                onmouseenter="if(!this.classList.contains('active')){this.style.borderColor='var(--vs-border-medium)';this.style.transform='translateY(-1px)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';}"
                onmouseleave="if(!this.classList.contains('active')){this.style.borderColor='var(--vs-border-subtle)';this.style.transform='';this.style.boxShadow='';}"
              >
                <div style="width: 100%; max-width: 120px;">${svg}</div>
                <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.01em;
                  color: ${isActive ? 'var(--vs-accent)' : 'var(--vs-text-secondary)'};">${themeLabels[theme]}</span>
                ${isActive ? `<div style="
                  position: absolute; top: 8px; right: 8px; width: 16px; height: 16px;
                  background: var(--vs-accent); border-radius: 50%; display: flex;
                  align-items: center; justify-content: center;
                "><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>` : ''}
              </button>
            `;
          }).join('')}
        </div>
        <div style="display: flex; gap: 20px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--vs-border-subtle); flex-wrap: wrap; align-items: flex-start;">
          <div style="min-width: 140px;">
            <label style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); display: block; margin-bottom: 8px;">Color Scheme</label>
            <div id="bar-scheme-picker" style="display: inline-flex; border: 1px solid var(--vs-border-subtle); border-radius: 8px; overflow: hidden;">
              ${['light', 'dark'].map(s => {
                const isActive = s === (barSettings.color_scheme || 'light');
                const icons = {
                  light: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
                  dark: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
                };
                return `<button type="button" class="bar-scheme-btn" data-scheme="${s}" style="
                  border: none; padding: 7px 16px; font-size: 12px; font-weight: 500; cursor: pointer;
                  background: ${isActive ? 'var(--vs-accent)' : 'var(--vs-bg-surface)'};
                  color: ${isActive ? '#fff' : 'var(--vs-text-secondary)'};
                  transition: background 0.15s, color 0.15s;
                  display: inline-flex; align-items: center; gap: 6px;
                ">${icons[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}</button>`;
              }).join('')}
            </div>
          </div>
          <div style="flex: 1; min-width: 200px;">
            <label style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); display: block; margin-bottom: 8px;">Brand Color</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <label style="position: relative; cursor: pointer; flex-shrink: 0;">
                <input type="color" id="bar-brand-color" value="${barSettings.brand_color || '#EA580C'}" style="
                  position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
                ">
                <div id="bar-color-swatch" style="
                  width: 32px; height: 32px; border-radius: 8px;
                  background: ${barSettings.brand_color || '#EA580C'};
                  border: 2px solid var(--vs-border-subtle);
                  transition: border-color 0.15s, box-shadow 0.15s;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                "></div>
              </label>
              <input type="text" id="bar-brand-hex" class="vs-input" value="${barSettings.brand_color || '#EA580C'}" placeholder="#EA580C" style="
                font-size: 12px; height: 32px; padding: 4px 8px; width: 88px; font-family: var(--font-mono, monospace); letter-spacing: 0.02em;
              ">
              <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                ${['#EA580C', '#2563EB', '#059669', '#7C3AED', '#DB2777', '#D97706', '#0891B2', '#374151'].map(c => `
                  <button type="button" class="bar-color-preset" data-color="${c}" title="${c}" style="
                    width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid transparent;
                    background: ${c}; cursor: pointer; transition: border-color 0.12s, transform 0.12s;
                    flex-shrink: 0; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
                  "
                    onmouseenter="this.style.transform='scale(1.15)';"
                    onmouseleave="this.style.transform='';"
                  ></button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind theme picker
    document.querySelectorAll('.bar-theme-option').forEach(btn => {
      btn.addEventListener('click', async () => {
        const theme = btn.dataset.theme;
        // Update UI immediately
        document.querySelectorAll('.bar-theme-option').forEach(b => {
          const isThis = b.dataset.theme === theme;
          b.style.borderColor = isThis ? 'var(--vs-accent)' : 'var(--vs-border-subtle)';
          b.style.background = isThis ? 'color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))' : 'var(--vs-bg-surface)';
          b.style.color = isThis ? 'var(--vs-accent)' : 'var(--vs-text-ghost)';
          b.classList.toggle('active', isThis);
          // Update label color
          const label = b.querySelector('span');
          if (label) label.style.color = isThis ? 'var(--vs-accent)' : 'var(--vs-text-secondary)';
          // Update checkmark
          const check = b.querySelector('[style*="position: absolute"]');
          if (check && !isThis) check.remove();
          if (isThis && !b.querySelector('[style*="position: absolute"]')) {
            const checkmark = document.createElement('div');
            checkmark.style.cssText = 'position:absolute;top:8px;right:8px;width:16px;height:16px;background:var(--vs-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;';
            checkmark.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
            b.appendChild(checkmark);
          }
        });
        // Save
        const { ok } = await api.put('/agentic/actions/bar-settings', { theme });
        if (ok) {
          btn.style.boxShadow = '0 0 0 3px var(--vs-accent-dim)';
          setTimeout(() => btn.style.boxShadow = '', 400);
          showToast('Bar style updated', 'success');
        }
      });
    });

    // Bind visibility dropdown
    document.getElementById('bar-visibility')?.addEventListener('change', async (e) => {
      const { ok } = await api.put('/agentic/actions/bar-settings', { visibility: e.target.value });
      if (ok) showToast('Bar visibility updated', 'success');
    });

    // Bind scheme picker
    document.querySelectorAll('.bar-scheme-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const scheme = btn.dataset.scheme;
        document.querySelectorAll('.bar-scheme-btn').forEach(b => {
          const isThis = b.dataset.scheme === scheme;
          b.style.background = isThis ? 'var(--vs-accent)' : 'var(--vs-bg-surface)';
          b.style.color = isThis ? '#fff' : 'var(--vs-text-secondary)';
        });
        const { ok } = await api.put('/agentic/actions/bar-settings', { color_scheme: scheme });
        if (ok) showToast('Color scheme updated', 'success');
      });
    });

    // Bind brand color — helpers
    function updateBrandColorUI(hex) {
      const swatch = document.getElementById('bar-color-swatch');
      const hexInput = document.getElementById('bar-brand-hex');
      const nativeInput = document.getElementById('bar-brand-color');
      if (swatch) swatch.style.background = hex;
      if (hexInput && hexInput !== document.activeElement) hexInput.value = hex;
      if (nativeInput) nativeInput.value = hex;
      // Highlight matching preset
      document.querySelectorAll('.bar-color-preset').forEach(p => {
        p.style.borderColor = p.dataset.color.toLowerCase() === hex.toLowerCase() ? 'var(--vs-text-primary)' : 'transparent';
      });
    }

    // Native color picker
    document.getElementById('bar-brand-color')?.addEventListener('input', (e) => {
      updateBrandColorUI(e.target.value);
    });
    document.getElementById('bar-brand-color')?.addEventListener('change', async (e) => {
      const { ok } = await api.put('/agentic/actions/bar-settings', { brand_color: e.target.value });
      if (ok) showToast('Brand color updated', 'success');
    });

    // Hex text input
    document.getElementById('bar-brand-hex')?.addEventListener('change', async (e) => {
      let hex = e.target.value.trim();
      if (!hex.startsWith('#')) hex = '#' + hex;
      if (/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex)) {
        updateBrandColorUI(hex);
        const { ok } = await api.put('/agentic/actions/bar-settings', { brand_color: hex });
        if (ok) showToast('Brand color updated', 'success');
      }
    });

    // Preset swatches
    document.querySelectorAll('.bar-color-preset').forEach(btn => {
      btn.addEventListener('click', async () => {
        const color = btn.dataset.color;
        updateBrandColorUI(color);
        const { ok } = await api.put('/agentic/actions/bar-settings', { brand_color: color });
        if (ok) showToast('Brand color updated', 'success');
      });
    });

    // Init: highlight matching preset if any
    updateBrandColorUI(barSettings.brand_color || '#EA580C');
  }

  const { ok, data } = await api.get('/agentic/actions');
  if (!ok || !data) {
    container.innerHTML = `<div class="text-sm text-vs-error py-6">Failed to load actions.</div>`;
    return;
  }

  const actions = data.actions || [];
  if (!actions.length) {
    container.innerHTML = `
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon" style="color: var(--vs-accent);">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <p class="vs-empty-state-title">No actions yet</p>
          <p class="vs-empty-state-desc">Create your first agent action to let AI assistants and website visitors interact with your business — reservations, appointments, quotes, and more.</p>
          <button id="btn-empty-new-action" class="vs-btn vs-btn-primary vs-btn-sm" style="margin-top: 12px;">${icons.plus} New Action</button>
        </div>
      </div>
    `;
    document.getElementById('btn-empty-new-action')?.addEventListener('click', async () => {
      const result = await showNewActionModal();
      if (result?.ok && result.actionId) {
        window.location.hash = `#/actions/${result.actionId}`;
      }
    });
    return;
  }

  container.innerHTML = `
    <div id="actions-list" class="flex flex-col gap-4">
      ${actions.map((action, idx) => {
        const isActive = action.active;
        const stats = action._stats || action.stats || {};
        const total = stats.total || 0;
        const lastActivity = stats.last_created_at ? formatRelativeTime(stats.last_created_at) : '—';

        const ACTION_LIST_ICONS = {
          calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
          utensils: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
          'file-text': '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
          list: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
          'shopping-bag': '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
          ticket: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',
          clock: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
          'message-square': '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
          users: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
          mail: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
          star: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
          circle: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>',
        };
        const actionIcon = ACTION_LIST_ICONS[action.icon] || ACTION_LIST_ICONS.circle;

        return `
          <div class="vs-action-list-row vs-form-card" data-action-id="${escapeHtml(action.id)}" style="cursor: pointer; transition: box-shadow 0.15s ease;">
            <div class="vs-action-reorder" style="
              display: flex; flex-direction: column; gap: 1px; flex-shrink: 0;
              padding-right: 10px; margin-right: 4px;
              border-right: 1px solid var(--vs-border-subtle);
            ">
              <button type="button" class="action-move-up" title="Move up" style="
                border: none; background: none; cursor: pointer; padding: 2px; color: var(--vs-text-ghost);
                display: flex; align-items: center; justify-content: center; border-radius: 4px;
                transition: color 0.12s, background 0.12s;
              "
                onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
                onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
              </button>
              <button type="button" class="action-move-down" title="Move down" style="
                border: none; background: none; cursor: pointer; padding: 2px; color: var(--vs-text-ghost);
                display: flex; align-items: center; justify-content: center; border-radius: 4px;
                transition: color 0.12s, background 0.12s;
              "
                onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
                onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
            <div class="vs-form-card-icon" style="color: ${isActive ? 'var(--vs-success)' : 'var(--vs-text-ghost)'}; background: ${isActive ? 'color-mix(in srgb, var(--vs-success) 10%, transparent)' : 'var(--vs-bg-raised)'};">
              ${actionIcon}
            </div>
            <div class="vs-form-card-body">
              <div class="vs-form-card-name">${escapeHtml(action.name || action.id)}</div>
              ${action.description ? `<div class="vs-form-card-desc">${escapeHtml(action.description)}</div>` : ''}
              <div class="vs-form-card-meta">
                <span class="vs-status-pill" style="
                  background: ${isActive ? 'var(--vs-success-dim)' : 'var(--vs-bg-raised)'};
                  color: ${isActive ? 'var(--vs-success)' : 'var(--vs-text-ghost)'};
                  font-size: 11px; padding: 1px 8px;
                ">${isActive ? 'Active' : 'Draft'}</span>
                <span class="vs-form-card-dot">·</span>
                <span>${total} submission${total !== 1 ? 's' : ''}</span>
                ${stats.today > 0 ? `<span class="vs-form-card-dot">·</span><span>+${stats.today} today</span>` : ''}
                <span class="vs-form-card-dot">·</span>
                <span>${lastActivity}</span>
              </div>
            </div>
            <div class="vs-form-card-right">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="vs-form-card-chevron"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Card click → navigate (skip if clicking reorder arrows)
  document.querySelectorAll('.vs-action-list-row').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.vs-action-reorder')) return;
      const actionId = row.dataset.actionId;
      if (actionId) window.location.hash = '#/actions/' + encodeURIComponent(actionId);
    });
  });

  // Bind action reorder arrows
  async function saveActionOrder() {
    const rows = document.querySelectorAll('#actions-list .vs-action-list-row');
    const order = Array.from(rows).map(r => r.dataset.actionId);
    await api.post('/agentic/actions/reorder', { order });
  }

  document.querySelectorAll('.action-move-up').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const row = btn.closest('.vs-action-list-row');
      const prev = row?.previousElementSibling;
      if (prev) {
        row.parentNode.insertBefore(row, prev);
        row.style.boxShadow = '0 0 0 2px var(--vs-accent-dim)';
        setTimeout(() => row.style.boxShadow = '', 300);
        await saveActionOrder();
      }
    });
  });

  document.querySelectorAll('.action-move-down').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const row = btn.closest('.vs-action-list-row');
      const next = row?.nextElementSibling;
      if (next) {
        row.parentNode.insertBefore(next, row);
        row.style.boxShadow = '0 0 0 2px var(--vs-accent-dim)';
        setTimeout(() => row.style.boxShadow = '', 300);
        await saveActionOrder();
      }
    });
  });
}

/**
 * Show the template picker modal for creating a new action.
 * Returns { ok: true, actionId } on success, null on cancel.
 */
async function showNewActionModal() {
  return new Promise(async (resolve) => {
    // Fetch templates
    const { ok, data } = await api.get('/agentic/actions/templates');
    const templates = (ok && data?.templates) || [];

    const overlay = document.createElement('div');
    overlay.className = 'vs-modal-overlay';
    overlay.innerHTML = `
      <div class="vs-modal" style="max-width: 580px;">
        <div class="vs-modal-header" style="display: flex; align-items: flex-start; justify-content: space-between;">
          <h2 class="vs-modal-title" style="margin: 0;">${icons.zap} New Agent Action</h2>
          <button id="close-new-action-modal" style="background: none; border: none; cursor: pointer; color: var(--vs-text-ghost); padding: 4px; margin: -4px -4px 0 0; line-height: 0; border-radius: var(--radius-md); transition: color 0.15s ease;" onmouseenter="this.style.color='var(--vs-text-primary)'" onmouseleave="this.style.color='var(--vs-text-ghost)'">${icons.x}</button>
        </div>
        <div class="vs-modal-body" style="padding: 20px;">
          <p class="text-sm text-vs-text-secondary" style="margin-bottom: 16px;">Choose a template to get started:</p>
          <div id="template-grid" style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
          ">
            ${templates.map(t => `
              <button class="vs-template-card" data-template-id="${escapeHtml(t.id)}" style="
                display: flex; flex-direction: column; align-items: center;
                padding: 16px 12px; border-radius: 10px;
                border: 1.5px solid var(--vs-border);
                background: var(--vs-bg-floating);
                cursor: pointer; transition: all 0.15s ease;
                text-align: center; gap: 6px;
              ">
                <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--vs-bg-raised); color: var(--vs-accent);">${TEMPLATE_ICONS[t.id] || icons.zap}</span>
                <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary);">${escapeHtml(t.name)}</span>
                <span style="font-size: 11px; color: var(--vs-text-tertiary); line-height: 1.3;">${escapeHtml(t.description || '')}</span>
              </button>
            `).join('')}
            <button class="vs-template-card" data-template-id="blank" style="
              display: flex; flex-direction: column; align-items: center;
              padding: 16px 12px; border-radius: 10px;
              border: 1.5px dashed var(--vs-border);
              background: transparent;
              cursor: pointer; transition: all 0.15s ease;
              text-align: center; gap: 6px;
            ">
              <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: transparent; color: var(--vs-text-ghost);">${icons.plus}</span>
              <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-secondary);">Blank</span>
              <span style="font-size: 11px; color: var(--vs-text-ghost); line-height: 1.3;">Start from scratch</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-visible'));

    const close = (result = null) => {
      document.removeEventListener('keydown', onKeydown);
      overlay.classList.remove('is-visible');
      setTimeout(() => overlay.remove(), 200);
      resolve(result);
    };
    const onKeydown = (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
    document.addEventListener('keydown', onKeydown);
    onBackdropClick(overlay, close);
    document.getElementById('close-new-action-modal')?.addEventListener('click', () => close());

    // Template card clicks
    overlay.querySelectorAll('.vs-template-card').forEach(card => {
      // Hover effect
      card.addEventListener('mouseenter', () => {
        card.style.borderColor = 'var(--vs-accent)';
        card.style.background = 'var(--vs-bg-raised)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.borderColor = card.dataset.templateId === 'blank' ? 'var(--vs-border)' : 'var(--vs-border)';
        card.style.background = card.dataset.templateId === 'blank' ? 'transparent' : 'var(--vs-bg-floating)';
      });

      card.addEventListener('click', async () => {
        const templateId = card.dataset.templateId;

        // Disable all cards while creating
        overlay.querySelectorAll('.vs-template-card').forEach(c => {
          c.style.pointerEvents = 'none';
          c.style.opacity = '0.5';
        });
        card.style.opacity = '1';
        card.style.borderColor = 'var(--vs-accent)';

        if (templateId === 'blank') {
          // Create a blank action
          const blankDef = {
            id: 'new-action-' + Date.now().toString(36).slice(-4),
            name: 'New Action',
            description: '',
            category: 'general',
            active: false,
            fields: [
              { name: 'email', type: 'email', label: 'Email', placeholder: 'you@example.com', required: true },
            ],
            responses: {
              success: 'Submission received. Your confirmation code is {confirmation_code}.',
            },
          };
          const { ok: createOk, data: createData } = await api.post('/agentic/actions', blankDef);
          if (createOk && createData?.action) {
            showToast('Action created', 'success');
            close({ ok: true, actionId: createData.action.id });
          } else {
            showToast(createData?.error?.message || 'Failed to create action', 'error');
            close();
          }
        } else {
          // Create from template
          const { ok: createOk, data: createData } = await api.post('/agentic/actions/from-template', {
            template_id: templateId,
          });
          if (createOk && createData?.action) {
            showToast(`${createData.action.name} created`, 'success');
            close({ ok: true, actionId: createData.action.id });
          } else {
            showToast(createData?.error?.message || 'Failed to create action', 'error');
            close();
          }
        }
      });
    });
  });
}

/**
 * Render the action detail view (settings + records).
 */
export function renderActionDetailView(actionId) {
  setTimeout(() => loadActionDetail(actionId), 0);

  return `
    <div>
      <div id="action-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading action...</div>
      </div>
      <div id="action-detail-body"></div>
      <div id="action-records">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading records...</div>
      </div>
    </div>
  `;
}

async function loadActionDetail(actionId) {
  const headerEl = document.getElementById('action-detail-header');
  const bodyEl   = document.getElementById('action-detail-body');
  const recsEl   = document.getElementById('action-records');
  if (!headerEl) return;

  // Load action definition + stats
  const { ok, data } = await api.get(`/agentic/actions/${encodeURIComponent(actionId)}`);
  if (!ok || !data) {
    headerEl.innerHTML = `<div class="text-sm text-vs-error py-6">Action not found.</div>`;
    if (bodyEl) bodyEl.innerHTML = '';
    if (recsEl) recsEl.innerHTML = '';
    return;
  }

  const action = data.action;
  const stats = data.stats || {};
  const isActive = action.active;

  // Render header with breadcrumb and toolbar
  headerEl.innerHTML = `
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/actions" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Actions</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${escapeHtml(action.name || actionId)}</span>
      </div>
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <h1 class="vs-page-title">${escapeHtml(action.name || actionId)}</h1>
        <div class="flex items-center gap-2">
          <button id="btn-toggle-active" class="vs-btn ${isActive ? 'vs-btn-secondary' : 'vs-btn-primary'} vs-btn-sm" title="${isActive ? 'Deactivate this action' : 'Activate this action on your website'}">
            ${isActive ? '● Live — click to deactivate' : '○ Draft — click to go live'}
          </button>
          <button id="btn-duplicate-action" class="vs-btn vs-btn-ghost vs-btn-sm" title="Duplicate">
            ${icons.copy} Duplicate
          </button>
          <button id="btn-delete-action" class="vs-btn vs-btn-ghost vs-btn-sm" style="color: var(--vs-error);" title="Delete">
            ${icons.trash}
          </button>
        </div>
      </div>
    </div>

    <div class="vs-form-stats-row">
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${stats.total || 0}</span>
        <span class="vs-form-stat-label">Total</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-info)">${stats.by_status?.pending || 0}</span>
        <span class="vs-form-stat-label">Pending</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-success)">${stats.by_status?.confirmed || 0}</span>
        <span class="vs-form-stat-label">Confirmed</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-accent)">${stats.by_status?.completed || 0}</span>
        <span class="vs-form-stat-label">Completed</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${stats.today || 0}</span>
        <span class="vs-form-stat-label">Today</span>
      </div>
    </div>
  `;

  // Render body — identity + fields summary
  if (bodyEl) {
    // ── Build Agent Preview HTML (before template literal to avoid nesting) ──
    const agentToolName = 'make_' + actionId.replace(/-/g, '_');
    const agentFieldTypeMap = { number: 'number', checkbox: 'boolean', multiselect: 'array' };
    const agentProperties = {};
    const agentRequired = [];

    (action.fields || []).forEach(f => {
      const schemaType = agentFieldTypeMap[f.type] || 'string';
      const prop = { type: schemaType };

      const desc = f.label || f.name;
      if (f.require_future) {
        prop.description = desc + ' (must be in the future)';
      } else if (desc) {
        prop.description = desc;
      }

      if (f.min !== undefined && f.min !== '') prop.minimum = f.min;
      if (f.max !== undefined && f.max !== '') prop.maximum = f.max;
      if (f.min_length) prop.minLength = f.min_length;
      if (f.max_length) prop.maxLength = f.max_length;

      if (f.options && f.options.length > 0) {
        if (f.type === 'multiselect') {
          prop.items = { type: 'string', enum: f.options };
        } else {
          prop.enum = f.options;
        }
      }

      agentProperties[f.name] = prop;
      if (f.required) agentRequired.push(f.name);
    });

    const agentSchema = {
      name: agentToolName,
      description: action.description || action.name,
      inputSchema: { type: 'object', properties: agentProperties, required: agentRequired },
    };

    const agentSchemaJson = JSON.stringify(agentSchema, null, 2);
    const agentSchemaEscaped = escapeHtml(agentSchemaJson);
    const agentStatusPill = isActive
      ? '<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-success);background:rgba(34,197,94,0.06);">● Discoverable by agents</span>'
      : '<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);">○ Draft — not visible to agents</span>';

    const agentPreviewHtml = [
      '<div style="margin-bottom: 16px;">',
        '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">',
          '<span style="font-size: 12px; color: var(--vs-text-ghost);">Tool name</span>',
          '<code style="font-size:13px;font-weight:600;font-family:\'SF Mono\',\'Fira Code\',\'Cascadia Code\',monospace;color:var(--vs-accent);background:var(--vs-bg-raised);padding:3px 10px;border-radius:var(--radius-sm);letter-spacing:-0.01em;">' + escapeHtml(agentToolName) + '</code>',
        '</div>',
        '<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">',
          '<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">',
            '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
            ' /mcp.php',
          '</span>',
          '<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">',
            '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
            ' /actions/manifest.json',
          '</span>',
          agentStatusPill,
        '</div>',
      '</div>',
      '<div style="position: relative;">',
        '<pre style="margin:0;padding:16px;border-radius:var(--radius-md);background:var(--vs-bg-surface);border:1px solid var(--vs-border-subtle);font-size:12px;line-height:1.6;overflow-x:auto;font-family:\'SF Mono\',\'Fira Code\',\'Cascadia Code\',monospace;color:var(--vs-text-secondary);-webkit-overflow-scrolling:touch;"><code id="agent-schema-json">' + agentSchemaEscaped + '</code></pre>',
        '<button id="btn-copy-schema" title="Copy schema" style="position:absolute;top:8px;right:8px;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--radius-md);border:1px solid var(--vs-border-subtle);background:var(--vs-bg-floating);color:var(--vs-text-ghost);cursor:pointer;transition:all 0.15s ease;" onmouseenter="this.style.borderColor=\'var(--vs-border)\';this.style.color=\'var(--vs-text-secondary)\';" onmouseleave="this.style.borderColor=\'var(--vs-border-subtle)\';this.style.color=\'var(--vs-text-ghost)\';">' + icons.copy + '</button>',
      '</div>',
      '<p style="margin:12px 0 0;font-size:11px;color:var(--vs-text-ghost);line-height:1.5;">',
        'This schema is generated from your fields above. AI agents receive it when they call <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">tools/list</code> on your site\'s MCP endpoint.<br>',
        'Open <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">/actions/manifest.json</code> in a browser to see the full manifest.',
      '</p>',
    ].join('');

    bodyEl.innerHTML = `
      <div class="vs-settings-card" style="margin-top: 16px;">
        <h2 class="vs-settings-card-title">Action</h2>
        <div class="flex flex-col gap-4">
          <div>
            <label for="action-name" class="block text-sm font-medium text-vs-text-secondary mb-1">Name <span style="font-weight: 400; color: var(--vs-text-ghost);">— form title and email subject</span></label>
            <input type="text" id="action-name" class="vs-input" value="${escapeHtml(action.name || '')}" />
          </div>
          <div>
            <label for="action-description" class="block text-sm font-medium text-vs-text-secondary mb-1">Description <span style="font-weight: 400; color: var(--vs-text-ghost);">— shown to visitors and AI agents</span></label>
            <input type="text" id="action-description" class="vs-input" value="${escapeHtml(action.description || '')}" placeholder="e.g. Register for our quarterly workshops" />
          </div>

          <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px; margin-top: 4px;">
            <label style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary); margin-bottom: 4px; display: block;">Actions Bar</label>
            <p style="font-size: 12px; color: var(--vs-text-ghost); margin: 0 0 12px 0;">How this action appears on your website.</p>
            <div style="margin-bottom: 12px;">
              <label for="action-button-label" class="block text-sm font-medium text-vs-text-secondary mb-1">Button Label</label>
              <input type="text" id="action-button-label" class="vs-input" value="${escapeHtml(action.bar_button_label || '')}" placeholder="${escapeAttr(action.name || 'e.g. Register')}" />
              <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Short label for the bar button. Defaults to the action name.</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-vs-text-secondary mb-1">Icon</label>
              <div id="icon-picker-grid" style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${[
                  ['calendar', 'Calendar'], ['clock', 'Clock'], ['utensils', 'Utensils'], ['file-text', 'Document'],
                  ['list', 'List'], ['shopping-bag', 'Shop'], ['ticket', 'Ticket'], ['message-square', 'Message'],
                  ['users', 'People'], ['mail', 'Mail'], ['star', 'Star'], ['circle', 'Default'],
                ].map(([key, label]) => `
                  <button type="button" class="vs-icon-pick" data-icon="${key}" title="${label}" style="
                    display: flex; align-items: center; justify-content: center;
                    width: 42px; height: 42px; border-radius: var(--radius-md);
                    border: 1.5px solid ${(action.icon || 'circle') === key ? 'var(--vs-accent)' : 'var(--vs-border)'};
                    background: ${(action.icon || 'circle') === key ? 'var(--vs-accent-dim, rgba(var(--vs-accent-rgb, 200,80,40), 0.08))' : 'var(--vs-bg-floating)'};
                    color: ${(action.icon || 'circle') === key ? 'var(--vs-accent)' : 'var(--vs-text-ghost)'};
                    cursor: pointer; transition: all 0.15s ease;
                  "><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${{
                    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
                    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
                    utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
                    'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
                    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
                    'shopping-bag': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
                    ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
                    'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
                    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
                    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
                    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
                    circle: '<circle cx="12" cy="12" r="10"/>',
                  }[key]}</svg></button>
                `).join('')}
              </div>
              <input type="hidden" id="action-icon" value="${escapeHtml(action.icon || 'circle')}" />
            </div>
          </div>

          <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px; margin-top: 4px;">
            <label style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary); margin-bottom: 4px; display: block;">Submission Rules</label>
            <p style="font-size: 12px; color: var(--vs-text-ghost); margin: 0 0 12px 0;">Control how submissions are handled.</p>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
                  <input type="checkbox" id="action-allow-duplicates" ${!(action.constraints?.uniqueness?.enabled) ? 'checked' : ''} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                  <span class="vs-toggle-track" style="
                    position: absolute; inset: 0; border-radius: 10px;
                    background: ${!(action.constraints?.uniqueness?.enabled) ? 'var(--vs-accent)' : 'var(--vs-border-medium, #ccc)'};
                    transition: background 0.2s ease;
                  "></span>
                  <span class="vs-toggle-thumb" style="
                    position: absolute; left: ${!(action.constraints?.uniqueness?.enabled) ? '18px' : '2px'}; top: 2px;
                    width: 16px; height: 16px; border-radius: 50%;
                    background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    transition: left 0.2s ease;
                  "></span>
                </span>
                <span style="font-size: 13px; color: var(--vs-text-secondary);">Same email can submit multiple times</span>
              </label>
            </div>
            <div id="action-duplicate-msg-wrap" style="${!(action.constraints?.uniqueness?.enabled) ? 'display: none;' : ''}">
              <label for="action-duplicate-msg" class="block text-sm font-medium text-vs-text-secondary mb-1">Rejection message</label>
              <input type="text" id="action-duplicate-msg" class="vs-input" value="${escapeHtml(action.responses?.duplicate || '')}"
                placeholder="You have already submitted this form." />
            </div>
          </div>
        </div>
        <div class="vs-settings-card-footer">
          <button id="btn-save-action" class="vs-btn vs-btn-primary vs-btn-sm">Save Changes</button>
        </div>
      </div>

      <div class="vs-settings-card" style="margin-top: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h2 class="vs-settings-card-title" style="margin-bottom: 0;">Fields (${(action.fields || []).length})</h2>
          <button id="btn-add-field" class="vs-btn vs-btn-secondary vs-btn-sm" style="margin-bottom: 12px;">${icons.plus || '+'} Add Field</button>
        </div>
        <div id="action-fields-builder" style="display: flex; flex-direction: column; gap: 6px;">
          ${(action.fields || []).map((field, idx) => `
            <div class="vs-field-row" data-field-idx="${idx}"
              data-field-name="${escapeAttr(field.name || '')}"
              data-placeholder="${escapeAttr(field.placeholder || '')}"
              data-default="${escapeAttr(field.default_value || field.default || '')}"
              data-min="${field.min !== undefined ? field.min : ''}"
              data-max="${field.max !== undefined ? field.max : ''}"
              data-maxlength="${field.max_length || ''}"
              data-minlength="${field.min_length || ''}"
              data-options="${escapeAttr(JSON.stringify(field.options || []))}"
              data-description="${escapeAttr(field.description || '')}"
              ${field.allowed_extensions ? `data-allowed-extensions="${escapeAttr(JSON.stringify(field.allowed_extensions))}"` : ''}
              ${field.max_size_mb ? `data-max-size-mb="${field.max_size_mb}"` : ''}
              ${field.checked_default ? 'data-checked-default="true"' : ''}
              style="
              display: grid; grid-template-columns: 44px 1.5fr 100px 44px 32px 32px; gap: 6px; align-items: center;
              padding: 8px 10px; border-radius: var(--radius-md);
              border: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface);
              transition: box-shadow 0.15s ease;
            ">
              <div style="display: flex; flex-direction: column; gap: 1px;">
                <button type="button" class="field-move-up" title="Move up" style="
                  border: none; background: none; cursor: pointer; padding: 1px; color: var(--vs-text-ghost);
                  display: flex; align-items: center; justify-content: center; border-radius: 3px;
                  transition: color 0.12s, background 0.12s;
                " ${idx === 0 ? 'disabled style="opacity:0.25;cursor:default;"' : ''}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button type="button" class="field-move-down" title="Move down" style="
                  border: none; background: none; cursor: pointer; padding: 1px; color: var(--vs-text-ghost);
                  display: flex; align-items: center; justify-content: center; border-radius: 3px;
                  transition: color 0.12s, background 0.12s;
                " ${idx === (action.fields || []).length - 1 ? 'disabled style="opacity:0.25;cursor:default;"' : ''}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
              <input type="text" class="vs-input field-label" value="${escapeHtml(field.label || '')}" placeholder="Label (e.g. Guest Name)" style="font-size: 13px; height: 32px; padding: 4px 10px;" />
              <select class="vs-input field-type" style="font-size: 12px; height: 32px; padding: 4px 6px;">
                ${['text','email','tel','number','date','time','select','multiselect','textarea','url','checkbox','radio','file','hidden'].map(t =>
                  `<option value="${t}" ${field.type === t ? 'selected' : ''}>${t === 'multiselect' ? 'multi-select' : t}</option>`
                ).join('')}
              </select>
              <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
                <input type="checkbox" class="field-required" ${field.required ? 'checked' : ''} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${field.required ? 'var(--vs-accent)' : 'var(--vs-border-medium, #ccc)'};
                  transition: background 0.2s ease;
                "></span>
                <span style="
                  position: absolute; left: ${field.required ? '18px' : '2px'}; top: 2px;
                  width: 16px; height: 16px; border-radius: 50%;
                  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                  transition: left 0.2s ease;
                "></span>
              </label>
              <button type="button" class="field-settings" title="Field settings" style="
                border: none; background: none; cursor: pointer; padding: 4px; color: var(--vs-text-ghost);
                display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md);
                transition: color 0.12s, background 0.12s;
              "
                onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
                onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
              <button type="button" class="field-delete" title="Remove field" style="
                border: none; background: none; cursor: pointer; padding: 4px; color: var(--vs-text-ghost);
                display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md);
                transition: color 0.12s, background 0.12s;
              "
                onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';"
                onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                ${icons.trash}
              </button>
            </div>
          `).join('')}
        </div>
        ${(action.fields || []).length === 0 ? '<p class="text-sm text-vs-text-ghost" style="text-align: center; padding: 20px 0;">No fields yet. Click "Add Field" to get started.</p>' : ''}
        <div class="vs-settings-card-footer">
          <button id="btn-save-fields" class="vs-btn vs-btn-primary vs-btn-sm">Save Fields</button>
        </div>
      </div>

      <details id="agent-preview-section" style="margin-top: 16px;">
        <summary class="vs-settings-card" style="cursor: pointer; user-select: none; list-style: none; display: flex; align-items: center; justify-content: space-between; padding: 16px 20px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--vs-text-ghost); flex-shrink: 0;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/>
            </svg>
            <div>
              <h2 class="vs-settings-card-title" style="margin: 0; font-size: 14px;">Agent Preview</h2>
              <p style="margin: 2px 0 0; font-size: 12px; color: var(--vs-text-ghost);">MCP tool schema — what AI agents see when they discover this action</p>
            </div>
          </div>
          <svg class="agent-preview-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--vs-text-ghost); transition: transform 0.2s ease; flex-shrink: 0;"><polyline points="6 9 12 15 18 9"/></svg>
        </summary>
        <div class="vs-settings-card" style="margin-top: -1px; border-top-left-radius: 0; border-top-right-radius: 0;">
          ${agentPreviewHtml}
        </div>
      </details>
    `;

    // ── Toggle switch behavior for existing checkboxes ──
    function bindToggleSwitch(label) {
      const checkbox = label.querySelector('.field-required');
      if (!checkbox) return;
      const track = label.querySelectorAll('span')[0];
      const thumb = label.querySelectorAll('span')[1];
      const update = () => {
        track.style.background = checkbox.checked ? 'var(--vs-accent)' : 'var(--vs-border-medium, #ccc)';
        thumb.style.left = checkbox.checked ? '18px' : '2px';
      };
      checkbox.addEventListener('change', update);
    }
    document.querySelectorAll('.field-required').forEach(cb => {
      bindToggleSwitch(cb.closest('label'));
    });

    // Bind duplicates toggle
    const dupToggle = document.getElementById('action-allow-duplicates');
    if (dupToggle) {
      const dupLabel = dupToggle.closest('label');
      const dupTrack = dupLabel?.querySelector('.vs-toggle-track');
      const dupThumb = dupLabel?.querySelector('.vs-toggle-thumb');
      dupToggle.addEventListener('change', () => {
        if (dupTrack) dupTrack.style.background = dupToggle.checked ? 'var(--vs-accent)' : 'var(--vs-border-medium, #ccc)';
        if (dupThumb) dupThumb.style.left = dupToggle.checked ? '18px' : '2px';
        const msgWrap = document.getElementById('action-duplicate-msg-wrap');
        if (msgWrap) msgWrap.style.display = dupToggle.checked ? 'none' : '';
      });
    }

    // Bind icon picker
    document.querySelectorAll('.vs-icon-pick').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        if (btn.dataset.icon !== document.getElementById('action-icon')?.value) {
          btn.style.borderColor = 'var(--vs-accent)';
          btn.style.color = 'var(--vs-text-secondary)';
        }
      });
      btn.addEventListener('mouseleave', () => {
        if (btn.dataset.icon !== document.getElementById('action-icon')?.value) {
          btn.style.borderColor = 'var(--vs-border)';
          btn.style.color = 'var(--vs-text-ghost)';
        }
      });
      btn.addEventListener('click', () => {
        document.querySelectorAll('.vs-icon-pick').forEach(b => {
          b.style.borderColor = 'var(--vs-border)';
          b.style.background = 'var(--vs-bg-floating)';
          b.style.color = 'var(--vs-text-ghost)';
        });
        btn.style.borderColor = 'var(--vs-accent)';
        btn.style.background = 'var(--vs-accent-dim, rgba(200,80,40,0.08))';
        btn.style.color = 'var(--vs-accent)';
        document.getElementById('action-icon').value = btn.dataset.icon;
      });
    });

    // Bind save (Identity & Config card)
    document.getElementById('btn-save-action')?.addEventListener('click', async () => {
      if (demoGuard()) return;
      if (viewerGuard()) return;
      const updated = { ...action };
      updated.name = document.getElementById('action-name')?.value || action.name;
      updated.bar_button_label = document.getElementById('action-button-label')?.value || '';
      updated.description = document.getElementById('action-description')?.value || '';

      updated.icon = document.getElementById('action-icon')?.value || 'circle';

      // Duplicate submissions
      const allowDuplicates = document.getElementById('action-allow-duplicates')?.checked ?? true;
      if (!allowDuplicates) {
        // Find email fields to use for uniqueness
        const emailFields = (action.fields || []).filter(f => f.type === 'email').map(f => f.name);
        const uniqueFields = emailFields.length > 0 ? emailFields : ['email'];
        updated.constraints = {
          ...(updated.constraints || {}),
          uniqueness: {
            enabled: true,
            fields: uniqueFields,
            scope_statuses: ['confirmed', 'pending'],
          },
        };
      } else {
        // Disable uniqueness
        if (updated.constraints?.uniqueness) {
          updated.constraints.uniqueness.enabled = false;
        }
      }
      const dupMsg = document.getElementById('action-duplicate-msg')?.value || '';
      if (dupMsg) {
        updated.responses = { ...(updated.responses || {}), duplicate: dupMsg };
      } else if (updated.responses?.duplicate) {
        delete updated.responses.duplicate;
      }

      const { ok: saveOk, data: saveData } = await api.put(`/agentic/actions/${encodeURIComponent(actionId)}`, updated);
      showToast(saveOk ? 'Action saved' : (saveData?.error?.message || 'Failed to save'), saveOk ? 'success' : 'error');
      if (saveOk) loadActionDetail(actionId);
    });

    // ── Field builder: helper to collect fields from the builder DOM ──
    // Slugify a label into a safe field name: "Guest Name" → "guest_name"
    function slugifyFieldName(label) {
      return label
        .toLowerCase()
        .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/[ñ]/g, 'n').replace(/[ç]/g, 'c')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/^[0-9_]+/, '')  // Must start with a letter
        .replace(/_+/g, '_')
        .replace(/_$/, '');
    }

    function collectFieldsFromBuilder() {
      const rows = document.querySelectorAll('#action-fields-builder .vs-field-row');
      const fields = [];
      const usedNames = new Set();
      rows.forEach(row => {
        const label = row.querySelector('.field-label')?.value?.trim() || '';
        const type = row.querySelector('.field-type')?.value || 'text';
        const required = row.querySelector('.field-required')?.checked || false;

        // Name: always derived from current label to stay in sync.
        // (Field names are hidden from users — they must match the label.)
        let name = label ? slugifyFieldName(label) : '';
        // Deduplicate
        if (usedNames.has(name)) {
          let i = 2;
          while (usedNames.has(name + '_' + i)) i++;
          name = name + '_' + i;
        }
        usedNames.add(name);

        if (name && label) {
          const field = { name, type, label, required };
          // Extended properties from data attributes
          const placeholder = row.dataset.placeholder;
          if (placeholder) field.placeholder = placeholder;
          const defaultVal = row.dataset.default;
          if (defaultVal) field.default_value = defaultVal;
          const description = row.dataset.description;
          if (description) field.description = description;
          const minVal = row.dataset.min;
          if (minVal !== '' && minVal !== undefined) field.min = Number(minVal);
          const maxVal = row.dataset.max;
          if (maxVal !== '' && maxVal !== undefined) field.max = Number(maxVal);
          const maxLen = row.dataset.maxlength;
          if (maxLen) field.max_length = Number(maxLen);
          const minLen = row.dataset.minlength;
          if (minLen) field.min_length = Number(minLen);
          const opts = row.dataset.options;
          if (opts) {
            try { field.options = JSON.parse(opts); } catch (e) { field.options = opts.split(',').map(o => o.trim()).filter(Boolean); }
          }
          // File field settings
          if (type === 'file') {
            const exts = row.dataset.allowedExtensions;
            if (exts) {
              try { field.allowed_extensions = JSON.parse(exts); } catch (e) { field.allowed_extensions = exts.split(',').map(e => e.trim().toLowerCase()).filter(Boolean); }
            }
            const maxSizeMb = row.dataset.maxSizeMb;
            if (maxSizeMb) field.max_size_mb = Number(maxSizeMb);
          }
          // Checkbox "selected by default"
          if (type === 'checkbox' && row.dataset.checkedDefault === 'true') {
            field.checked_default = true;
          }
          fields.push(field);
        }
      });
      return fields;
    }

    // ── Field builder: Save Fields button ──
    async function saveFields() {
      // Validate: every row must have a label
      const rows = document.querySelectorAll('#action-fields-builder .vs-field-row');
      let hasError = false;
      rows.forEach(row => {
        const labelVal = row.querySelector('.field-label')?.value?.trim();
        if (!labelVal) {
          hasError = true;
          row.style.borderColor = 'var(--vs-error, #ef4444)';
          row.style.boxShadow = '0 0 0 2px rgba(239,68,68,0.15)';
          setTimeout(() => {
            row.style.borderColor = 'var(--vs-border-subtle)';
            row.style.boxShadow = '';
          }, 2000);
        }
      });
      if (hasError) {
        showToast('Every field needs a label', 'warning');
        return;
      }

      const fields = collectFieldsFromBuilder();
      if (fields.length === 0) {
        showToast('At least one field is required', 'warning');
        return;
      }
      const updated = { ...action, fields };
      const { ok: saveOk, data: saveData } = await api.put(`/agentic/actions/${encodeURIComponent(actionId)}`, updated);
      showToast(saveOk ? 'Fields saved' : (saveData?.error?.message || 'Failed to save'), saveOk ? 'success' : 'error');
      if (saveOk) loadActionDetail(actionId);
    }
    document.getElementById('btn-save-fields')?.addEventListener('click', saveFields);

    // ── Field builder: Add Field ──
    document.getElementById('btn-add-field')?.addEventListener('click', () => {
      const builder = document.getElementById('action-fields-builder');
      if (!builder) return;
      const row = document.createElement('div');
      row.className = 'vs-field-row';
      row.dataset.fieldName = '';  // Will be auto-derived from label on save
      row.dataset.placeholder = '';
      row.dataset.default = '';
      row.dataset.min = '';
      row.dataset.max = '';
      row.dataset.maxlength = '';
      row.dataset.options = '';
      row.dataset.description = '';
      row.style.cssText = `
        display: grid; grid-template-columns: 44px 1.5fr 100px 44px 32px 32px; gap: 6px; align-items: center;
        padding: 8px 10px; border-radius: var(--radius-md);
        border: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface);
        transition: box-shadow 0.15s ease;
      `;
      const gearSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
      row.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1px;">
          <button type="button" class="field-move-up" title="Move up" style="border:none;background:none;cursor:pointer;padding:1px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:3px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button type="button" class="field-move-down" title="Move down" style="border:none;background:none;cursor:pointer;padding:1px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:3px;" disabled style="opacity:0.25;cursor:default;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
        <input type="text" class="vs-input field-label" value="" placeholder="Label (e.g. Guest Name)" style="font-size: 13px; height: 32px; padding: 4px 10px;" />
        <select class="vs-input field-type" style="font-size: 12px; height: 32px; padding: 4px 6px;">
          ${['text','email','tel','number','date','time','select','multiselect','textarea','url','checkbox','radio','file','hidden'].map(t =>
            `<option value="${t}">${t === 'multiselect' ? 'multi-select' : t}</option>`
          ).join('')}
        </select>
        <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
          <input type="checkbox" class="field-required" style="position: absolute; opacity: 0; width: 0; height: 0;" />
          <span style="position: absolute; inset: 0; border-radius: 10px; background: var(--vs-border-medium, #ccc); transition: background 0.2s ease;"></span>
          <span style="position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: left 0.2s ease;"></span>
        </label>
        <button type="button" class="field-settings" title="Field settings" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${gearSvg}
        </button>
        <button type="button" class="field-delete" title="Remove field" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${icons.trash}
        </button>
      `;
      builder.appendChild(row);
      row.querySelector('.field-label')?.focus();
      bindToggleSwitch(row.querySelector('.field-required')?.closest('label'));
      bindMoveButtons(row);
      bindDeleteButton(row.querySelector('.field-delete'));
      bindSettingsButton(row.querySelector('.field-settings'));
    });

    // ── Field builder: Move up/down ──
    function bindMoveButtons(row) {
      row.querySelector('.field-move-up')?.addEventListener('click', () => {
        const prev = row.previousElementSibling;
        if (prev) {
          row.parentNode.insertBefore(row, prev);
          row.style.boxShadow = '0 0 0 2px var(--vs-accent-dim)';
          setTimeout(() => row.style.boxShadow = '', 300);
        }
      });
      row.querySelector('.field-move-down')?.addEventListener('click', () => {
        const next = row.nextElementSibling;
        if (next) {
          row.parentNode.insertBefore(next, row);
          row.style.boxShadow = '0 0 0 2px var(--vs-accent-dim)';
          setTimeout(() => row.style.boxShadow = '', 300);
        }
      });
    }
    document.querySelectorAll('.vs-field-row').forEach(bindMoveButtons);

    // ── Field builder: Delete with confirmation ──
    function bindDeleteButton(btn) {
      btn.addEventListener('click', async () => {
        const row = btn.closest('.vs-field-row');
        const confirmed = await showConfirmModal({
          title: 'Remove Field',
          description: 'Remove this field from this action? Click Save Fields to apply the change.',
          confirmLabel: 'Remove',
          danger: true,
        });
        if (confirmed) {
          row.style.opacity = '0';
          row.style.transform = 'translateX(20px)';
          row.style.transition = 'opacity 0.2s, transform 0.2s';
          setTimeout(() => row.remove(), 200);
        }
      });
    }
    document.querySelectorAll('.field-delete').forEach(bindDeleteButton);

    // ── Field builder: Settings modal ──
    function bindSettingsButton(btn) {
      if (!btn) return;
      btn.addEventListener('click', () => {
        const row = btn.closest('.vs-field-row');
        if (!row) return;
        const fieldType = row.querySelector('.field-type')?.value || 'text';
        const fieldLabel = row.querySelector('.field-label')?.value || row.querySelector('.field-name')?.value || 'Field';
        openFieldSettingsModal(row, fieldType, fieldLabel);
      });
    }
    document.querySelectorAll('.field-settings').forEach(bindSettingsButton);

    function openFieldSettingsModal(row, fieldType, fieldLabel) {
      // Remove any existing field settings modal
      document.getElementById('vs-field-settings-modal')?.remove();

      const placeholder = row.dataset.placeholder || '';
      const defaultVal = row.dataset.default || '';
      const minVal = row.dataset.min || '';
      const maxVal = row.dataset.max || '';
      const maxLen = row.dataset.maxlength || '';
      const options = row.dataset.options || '[]';
      const description = row.dataset.description || '';

      // Build type-specific fields
      const showPlaceholder = ['text','email','tel','url','textarea'].includes(fieldType);
      const showMinMax = fieldType === 'number';
      const showMaxLength = ['text','email','tel','url','textarea'].includes(fieldType);
      const showOptions = ['select','radio','multiselect'].includes(fieldType);
      const isMultiselect = fieldType === 'multiselect';
      const isFile = fieldType === 'file';
      const isCheckbox = fieldType === 'checkbox';

      const labelStyle = 'display: block; font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;';
      const groupStyle = 'margin-bottom: 16px;';

      let fieldsHtml = '';

      if (showPlaceholder) {
        fieldsHtml += `<div style="${groupStyle}">
          <label style="${labelStyle}">Placeholder</label>
          <input type="text" id="fs-placeholder" class="vs-input" value="${escapeAttr(placeholder)}" placeholder="e.g. Enter your email…" />
        </div>`;
      }

      if (!isFile && !isCheckbox) {
        fieldsHtml += `<div style="${groupStyle}">
          <label style="${labelStyle}">Default Value</label>
          <input type="${showMinMax ? 'number' : 'text'}" id="fs-default" class="vs-input" value="${escapeAttr(defaultVal)}" placeholder="Pre-filled value" />
        </div>`;
      }

      if (isCheckbox) {
        fieldsHtml += `<div style="${groupStyle}">
          <label style="${labelStyle}">Value <span style="color: var(--vs-text-ghost); font-weight: 400;">(sent when checked — defaults to field name if empty)</span></label>
          <input type="text" id="fs-default" class="vs-input" value="${escapeAttr(defaultVal)}" placeholder="e.g. yes, true, 1" />
        </div>
        <div style="${groupStyle}">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
              <input type="checkbox" id="fs-checked-default" ${(row.dataset.checkedDefault === 'true') ? 'checked' : ''} style="position: absolute; opacity: 0; width: 0; height: 0;" />
              <span style="
                position: absolute; inset: 0; border-radius: 10px;
                background: ${(row.dataset.checkedDefault === 'true') ? 'var(--vs-accent)' : 'var(--vs-border-medium, #ccc)'};
                transition: background 0.2s ease;
              "></span>
              <span style="
                position: absolute; left: ${(row.dataset.checkedDefault === 'true') ? '18px' : '2px'}; top: 2px;
                width: 16px; height: 16px; border-radius: 50%;
                background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                transition: left 0.2s ease;
              "></span>
            </span>
            <span style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary);">Selected by default</span>
          </label>
        </div>`;
      }

      if (showMinMax) {
        fieldsHtml += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; ${groupStyle}">
          <div>
            <label style="${labelStyle}">Minimum</label>
            <input type="number" id="fs-min" class="vs-input" value="${escapeAttr(minVal)}" placeholder="No limit" />
          </div>
          <div>
            <label style="${labelStyle}">Maximum</label>
            <input type="number" id="fs-max" class="vs-input" value="${escapeAttr(maxVal)}" placeholder="No limit" />
          </div>
        </div>`;
      }

      if (showMaxLength) {
        fieldsHtml += `<div style="${groupStyle}">
          <label style="${labelStyle}">Max Length</label>
          <input type="number" id="fs-maxlength" class="vs-input" value="${escapeAttr(maxLen)}" placeholder="No limit" min="1" />
        </div>`;
      }

      if (showOptions) {
        // Parse JSON array storage to newline display
        let optList;
        try { optList = JSON.parse(options); } catch (e) { optList = options.split(',').map(o => o.trim()).filter(Boolean); }
        let optionsDisplay;
        if (isMultiselect) {
          const defaults = (row.dataset.default || '').split(',').map(d => d.trim()).filter(Boolean);
          optionsDisplay = optList.map(o => (defaults.includes(o) ? '[x] ' + o : o)).join('\n');
        } else {
          optionsDisplay = optList.join('\n');
        }
        fieldsHtml += `<div style="${groupStyle}">
          <label style="${labelStyle}">Options <span style="color: var(--vs-text-ghost); font-weight: 400;">${isMultiselect ? '(one per line, prefix [x] for default)' : '(one per line)'}</span></label>
          <textarea id="fs-options" class="vs-input" rows="5" placeholder="${isMultiselect ? 'Option 1\n[x] Option 2\n[x] Option 3\nOption 4' : 'Option 1\nOption 2\nOption 3'}" style="height: auto; resize: vertical; min-height: 64px;">${escapeHtml(optionsDisplay)}</textarea>
        </div>`;
      }

      if (isFile) {
        const existingExts = row.dataset.allowedExtensions || '';
        const existingMaxMb = row.dataset.maxSizeMb || '10';
        let currentExts;
        try { currentExts = existingExts ? JSON.parse(existingExts) : []; } catch(e) { currentExts = []; }
        const currentExtsStr = currentExts.join(', ');

        // Extension group presets
        const docExts = ['pdf','doc','docx','xls','xlsx','csv','txt'];
        const imgExts = ['jpg','jpeg','png','gif','webp'];
        const archExts = ['zip','rar'];

        const hasDoc = docExts.some(e => currentExts.includes(e));
        const hasImg = imgExts.some(e => currentExts.includes(e));
        const hasArch = archExts.some(e => currentExts.includes(e));

        fieldsHtml += `<div style="${groupStyle}">
          <label style="${labelStyle}">Allowed File Types</label>
          <div style="display: flex; gap: 12px; margin-bottom: 8px; flex-wrap: wrap;">
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(docExts)}' ${hasDoc ? 'checked' : ''} />
              <span class="vs-checkbox-box"></span>
              Documents
            </label>
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(imgExts)}' ${hasImg ? 'checked' : ''} />
              <span class="vs-checkbox-box"></span>
              Images
            </label>
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(archExts)}' ${hasArch ? 'checked' : ''} />
              <span class="vs-checkbox-box"></span>
              Archives
            </label>
          </div>
          <input type="text" id="fs-allowed-extensions" class="vs-input" value="${escapeAttr(currentExtsStr)}" placeholder="pdf, jpg, png, doc, docx" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Comma-separated extensions. Leave empty for default set.</div>
        </div>
        <div style="${groupStyle}">
          <label style="${labelStyle}">Max File Size (MB)</label>
          <input type="number" id="fs-max-size-mb" class="vs-input" value="${escapeAttr(existingMaxMb)}" placeholder="10" min="1" max="50" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Maximum: 50 MB</div>
        </div>`;
      }

      fieldsHtml += `<div style="${groupStyle}">
        <label style="${labelStyle}">Help Text <span style="color: var(--vs-text-ghost); font-weight: 400;">(shown below field)</span></label>
        <input type="text" id="fs-description" class="vs-input" value="${escapeAttr(description)}" placeholder="Optional description or instructions" />
      </div>`;

      const modal = document.createElement('div');
      modal.id = 'vs-field-settings-modal';
      modal.style.cssText = 'position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;';
      modal.innerHTML = `
        <div style="
          position: absolute; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
        " id="fs-backdrop"></div>
        <div style="
          position: relative; background: var(--vs-bg-floating, #fff); border-radius: var(--radius-lg, 12px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.2); width: 440px; max-width: 90vw; max-height: 85vh;
          overflow: hidden; animation: vsSlideUp 200ms ease-out;
        ">
          <div style="
            padding: 20px 24px 16px; border-bottom: 1px solid var(--vs-border-subtle);
            display: flex; align-items: center; justify-content: space-between;
          ">
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--vs-text-primary);">
                ${escapeHtml(fieldLabel)} Settings
              </h3>
              <span style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 2px; display: block;">
                Type: ${fieldType}
              </span>
            </div>
            <button id="fs-close" style="
              border: none; background: none; cursor: pointer; padding: 6px; color: var(--vs-text-ghost);
              display: flex; border-radius: var(--radius-md); transition: all 0.12s;
            " onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
              onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div style="padding: 20px 24px; overflow-y: auto; max-height: calc(85vh - 140px);">
            ${fieldsHtml}
          </div>
          <div style="
            padding: 16px 24px; border-top: 1px solid var(--vs-border-subtle);
            display: flex; justify-content: flex-end; gap: 8px;
          ">
            <button id="fs-cancel" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
            <button id="fs-save" class="vs-btn vs-btn-primary vs-btn-sm">Apply</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Focus first input
      setTimeout(() => modal.querySelector('input, textarea')?.focus(), 100);

      // Extension group checkboxes → update the extensions text input
      if (isFile) {
        modal.querySelectorAll('.fs-ext-group').forEach(cb => {
          cb.addEventListener('change', () => {
            const extsInput = modal.querySelector('#fs-allowed-extensions');
            if (!extsInput) return;
            let current = extsInput.value.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
            const groupExts = JSON.parse(cb.dataset.exts || '[]');
            if (cb.checked) {
              groupExts.forEach(e => { if (!current.includes(e)) current.push(e); });
            } else {
              current = current.filter(e => !groupExts.includes(e));
            }
            extsInput.value = current.join(', ');
          });
        });
      }

      // Bind the 'Selected by default' toggle switch in checkbox field settings
      if (isCheckbox) {
        const toggleLabel = modal.querySelector('#fs-checked-default')?.closest('label');
        if (toggleLabel) {
          const cb = modal.querySelector('#fs-checked-default');
          const track = toggleLabel.querySelectorAll('span > span')[0];
          const thumb = toggleLabel.querySelectorAll('span > span')[1];
          cb?.addEventListener('change', () => {
            if (track) track.style.background = cb.checked ? 'var(--vs-accent)' : 'var(--vs-border-medium, #ccc)';
            if (thumb) thumb.style.left = cb.checked ? '18px' : '2px';
          });
        }
      }

      // Close handlers
      const closeModal = () => modal.remove();
      const fsBd = modal.querySelector('#fs-backdrop');
      if (fsBd) onBackdropClick(fsBd, closeModal);
      modal.querySelector('#fs-close')?.addEventListener('click', closeModal);
      modal.querySelector('#fs-cancel')?.addEventListener('click', closeModal);

      // Escape key
      const onEsc = (e) => { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onEsc); } };
      document.addEventListener('keydown', onEsc);

      // Save
      modal.querySelector('#fs-save')?.addEventListener('click', () => {
        if (showPlaceholder) row.dataset.placeholder = modal.querySelector('#fs-placeholder')?.value || '';
        if (!isFile) row.dataset.default = modal.querySelector('#fs-default')?.value || '';
        if (isCheckbox) {
          row.dataset.checkedDefault = modal.querySelector('#fs-checked-default')?.checked ? 'true' : 'false';
        }
        if (showMinMax) {
          row.dataset.min = modal.querySelector('#fs-min')?.value || '';
          row.dataset.max = modal.querySelector('#fs-max')?.value || '';
        }
        if (showMaxLength) row.dataset.maxlength = modal.querySelector('#fs-maxlength')?.value || '';
        if (showOptions) {
          const rawOpts = modal.querySelector('#fs-options')?.value || '';
          // Parse newline-separated options (all types)
          const lines = rawOpts.split(/[\n]/).map(l => l.trim()).filter(Boolean);
          if (isMultiselect) {
            const optNames = [];
            const defaults = [];
            lines.forEach(line => {
              const match = line.match(/^\[x\]\s*(.+)$/i);
              if (match) {
                optNames.push(match[1].trim());
                defaults.push(match[1].trim());
              } else {
                optNames.push(line);
              }
            });
            row.dataset.options = JSON.stringify(optNames);
            row.dataset.default = defaults.join(',');
          } else {
            row.dataset.options = JSON.stringify(lines);
          }
        }
        // File field settings
        if (isFile) {
          const extsInput = modal.querySelector('#fs-allowed-extensions')?.value || '';
          const exts = extsInput.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
          row.dataset.allowedExtensions = exts.length > 0 ? JSON.stringify(exts) : '';
          const maxMb = modal.querySelector('#fs-max-size-mb')?.value || '10';
          row.dataset.maxSizeMb = String(Math.min(Math.max(parseInt(maxMb) || 10, 1), 50));
        }
        row.dataset.description = modal.querySelector('#fs-description')?.value || '';

        // Visual feedback: flash the row
        row.style.boxShadow = '0 0 0 2px var(--vs-accent-dim)';
        setTimeout(() => row.style.boxShadow = '', 400);

        closeModal();
        showToast('Field settings updated', 'success');
      });
    }

    // Bind copy schema
    document.getElementById('btn-copy-schema')?.addEventListener('click', () => {
      const json = document.getElementById('agent-schema-json')?.textContent || '';
      navigator.clipboard.writeText(json).then(() => {
        showToast('Schema copied', 'success');
      }).catch(() => {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = json;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Schema copied', 'success');
      });
    });

    // Bind chevron rotation for Agent Preview <details>
    document.getElementById('agent-preview-section')?.addEventListener('toggle', (e) => {
      const chevron = e.target.querySelector('.agent-preview-chevron');
      if (chevron) {
        chevron.style.transform = e.target.open ? 'rotate(180deg)' : 'rotate(0)';
      }
    });

    // Bind toggle active
    document.getElementById('btn-toggle-active')?.addEventListener('click', async () => {
      if (demoGuard()) return;
      if (viewerGuard()) return;
      const updated = { ...action, active: !isActive };
      const { ok: toggleOk } = await api.put(`/agentic/actions/${encodeURIComponent(actionId)}`, updated);
      if (toggleOk) {
        showToast(updated.active ? 'Action activated' : 'Action deactivated', 'success');
        loadActionDetail(actionId); // Re-render
      } else {
        showToast('Failed to update status', 'error');
      }
    });

    // Bind duplicate
    document.getElementById('btn-duplicate-action')?.addEventListener('click', async () => {
      if (demoGuard()) return;
      if (viewerGuard()) return;
      const confirmed = await showConfirmModal({
        title: 'Duplicate Action',
        description: `Create a copy of "${action.name}"? The copy will start as a draft.`,
        confirmLabel: 'Duplicate',
      });
      if (!confirmed) return;
      const { ok: dupOk, data: dupData } = await api.post(`/agentic/actions/${encodeURIComponent(actionId)}/duplicate`, {});
      if (dupOk && dupData?.action) {
        showToast(`"${dupData.action.name}" created`, 'success');
        window.location.hash = `#/actions/${dupData.action.id}`;
      } else {
        showToast(dupData?.error?.message || 'Failed to duplicate', 'error');
      }
    });

    // Bind delete
    document.getElementById('btn-delete-action')?.addEventListener('click', async () => {
      if (demoGuard()) return;
      if (viewerGuard()) return;
      const confirmed = await showConfirmModal({
        title: 'Delete Action',
        description: `Delete "${action.name}"? This will permanently remove the action definition. Existing records will remain in the database but will no longer be accessible.`,
        confirmLabel: 'Delete',
        danger: true,
      });
      if (confirmed) {
        const { ok: delOk } = await api.delete(`/agentic/actions/${encodeURIComponent(actionId)}`);
        if (delOk) {
          showToast('Action deleted', 'success');
          window.location.hash = '#/actions';
        } else {
          showToast('Failed to delete action', 'error');
        }
      }
    });
  }

  // Load records
  await loadActionRecords(actionId, 1);
}

async function loadActionRecords(actionId, page = 1) {
  const container = document.getElementById('action-records');
  if (!container) return;

  const status = document.getElementById('action-filter-status')?.value || 'all';
  const search = document.getElementById('action-filter-search')?.value || '';

  let url = `/agentic/actions/${encodeURIComponent(actionId)}/records?page=${page}&per_page=20`;
  if (status !== 'all') url += `&status=${encodeURIComponent(status)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const { ok, data } = await api.get(url);
  if (!ok || !data) {
    container.innerHTML = `<div class="text-sm text-vs-error py-4">Failed to load records.</div>`;
    return;
  }

  const records = data.records || [];
  const total = data.total || 0;
  const perPage = data.per_page || 20;
  const totalPages = Math.ceil(total / perPage);

  container.innerHTML = `
    <div class="vs-settings-card" style="margin-top: 16px;">
      <h2 class="vs-settings-card-title">Submissions</h2>
      <div class="vs-form-filter-bar" style="margin-bottom: 12px;">
        <div class="flex items-center gap-2 flex-wrap">
          <select id="action-filter-status" class="vs-input vs-input-compact">
            <option value="all" ${status === 'all' ? 'selected' : ''}>All statuses</option>
            <option value="pending" ${status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="completed" ${status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="cancelled" ${status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            <option value="no-show" ${status === 'no-show' ? 'selected' : ''}>No-show</option>
          </select>
          <input type="text" id="action-filter-search" class="vs-input vs-input-compact" placeholder="Search submissions..." value="${escapeHtml(search)}" style="min-width: 180px;" />
        </div>
        <div class="flex items-center gap-2">
          ${window.IS_DEMO ? '' : `<button id="btn-purge-records" class="vs-btn vs-btn-secondary vs-btn-sm" title="Remove old submissions" ${total === 0 ? 'disabled style="opacity:0.4;pointer-events:none;"' : ''}>
            ${icons.trash} Purge Old
          </button>`}

          <button id="btn-export-action-csv" class="vs-btn vs-btn-secondary vs-btn-sm" ${total === 0 ? 'disabled style="opacity:0.4;pointer-events:none;"' : ''} title="${total === 0 ? 'No submissions to export' : 'Download submissions as CSV'}">
            ${icons.download} Export CSV
          </button>
        </div>
      </div>

      ${records.length === 0 ? `
        <div style="text-align: center; padding: 32px 16px;">
          <div style="color: var(--vs-text-ghost); margin-bottom: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div class="text-sm" style="color: var(--vs-text-tertiary); font-weight: 500;">No records yet</div>
          <div style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 4px;">Test the action or wait for your first submission.</div>
        </div>
      ` : `
        <div style="overflow-x: auto;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--vs-border);">
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500; width: 32px;"></th>
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500;">Ref</th>
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500;">Summary</th>
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500;">Status</th>
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500;">Source</th>
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500;">Created</th>
                <th style="width: 32px;"></th>
              </tr>
            </thead>
            <tbody>
              ${records.map(rec => {
                const recData = typeof rec.data === 'string' ? JSON.parse(rec.data) : rec.data;
                const cleanData = Object.fromEntries(
                  Object.entries(recData || {}).filter(([k]) => !k.startsWith('_'))
                );
                const textPreview = Object.values(cleanData).filter(v => typeof v === 'string' && v.length > 0).slice(0, 2).join(' · ');
                const fileCount = Object.values(cleanData).filter(v => v && typeof v === 'object' && v.original_name).length;
                const attachIcon = fileCount > 0 ? `<span style="display: inline-flex; align-items: center; gap: 2px; color: var(--vs-text-ghost); margin-left: ${textPreview ? '6px' : '0'};" title="${fileCount} file${fileCount > 1 ? 's' : ''} attached"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>${fileCount > 1 ? '<span style="font-size: 10px;">' + fileCount + '</span>' : ''}</span>` : '';
                const preview = textPreview || (fileCount > 0 ? '' : '—');
                const sc = ACTION_STATUS_COLORS[rec.status] || ACTION_STATUS_COLORS.pending;
                const sourceLabel = rec.source === 'web' ? 'Website' : rec.source === 'mcp' ? 'MCP' : rec.source === 'api' ? 'API' : rec.source || 'Website';
                return `
                  <tr style="border-bottom: 1px solid var(--vs-border-dim);" data-record-id="${rec.id}" class="vs-record-row">
                    <td style="padding: 8px 6px 8px 12px; width: 32px; vertical-align: middle;">
                      <button type="button" class="vs-record-toggle" data-rid="${rec.id}" title="Show details" style="
                        border: none; background: none; cursor: pointer; padding: 2px; color: var(--vs-text-ghost);
                        display: flex; align-items: center; transition: transform 0.15s ease;
                      ">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </td>
                    <td style="padding: 8px 12px; font-family: var(--vs-font-mono); font-size: 12px; color: var(--vs-accent);">${escapeHtml(rec.confirmation_code || '—')}</td>
                    <td style="padding: 8px 12px; color: var(--vs-text-secondary); max-width: 280px; overflow: hidden; white-space: nowrap;"><span style="display: inline-flex; align-items: center; max-width: 100%;"><span style="overflow: hidden; text-overflow: ellipsis;">${escapeHtml(preview)}</span>${attachIcon}</span></td>
                    <td style="padding: 8px 12px;">
                      <select class="vs-input vs-input-compact vs-action-status-select" data-record-id="${rec.id}" style="font-size: 12px; padding: 2px 8px; min-width: auto;" ${window.IS_DEMO ? 'disabled title="Demo mode — read-only"' : ''}>
                        ${Object.entries(ACTION_STATUS_COLORS).map(([key, conf]) =>
                          `<option value="${key}" ${rec.status === key ? 'selected' : ''}>${conf.label}</option>`
                        ).join('')}
                      </select>
                    </td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${sourceLabel}</td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${formatRelativeTime(rec.created_at)}</td>
                    ${window.IS_DEMO ? '<td style="width: 32px;"></td>' : `<td style="padding: 8px 4px; width: 32px; text-align: center;">
                      <button type="button" class="vs-record-delete" data-rid="${rec.id}" title="Delete submission" style="
                        border: none; background: none; cursor: pointer; padding: 4px; color: var(--vs-text-ghost);
                        display: inline-flex; align-items: center; border-radius: var(--radius-md);
                        transition: color 0.12s, background 0.12s;
                      " onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';" onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>`}
                  </tr>
                  <tr class="vs-record-detail" data-detail-for="${rec.id}" style="display: none;">
                    <td colspan="7" style="padding: 0 12px 12px 44px; background: var(--vs-bg-recessed, var(--vs-bg-ghost));">
                      <div style="
                        display: grid; grid-template-columns: auto 1fr; gap: 4px 16px;
                        font-size: 12px; padding: 12px 0;
                      ">
                        ${Object.entries(cleanData).map(([key, val]) => {
                          // File fields: show download link
                          if (val && typeof val === 'object' && val.path && val.original_name) {
                            const sizeText = val.size < 1024 ? val.size + ' B' : (val.size < 1048576 ? Math.round(val.size / 1024) + ' KB' : (val.size / 1048576).toFixed(1) + ' MB');
                            return `
                              <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${escapeHtml(key.replace(/_/g, ' '))}</div>
                              <div style="color: var(--vs-text-primary);">
                                <a href="/_studio/api/router.php?_path=/agentic/actions/${encodeURIComponent(actionId)}/records/${rec.id}/files/${encodeURIComponent(key)}" target="_blank" style="
                                  color: var(--vs-accent); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
                                " title="Download file">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                  ${escapeHtml(val.original_name)} (${sizeText})
                                </a>
                              </div>
                            `;
                          }
                          return `
                            <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${escapeHtml(key.replace(/_/g, ' '))}</div>
                            <div style="color: var(--vs-text-primary); word-break: break-word; white-space: pre-wrap;">${escapeHtml(String(val || '—'))}</div>
                          `;
                        }).join('')}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        ${totalPages > 1 ? `
          <div class="flex items-center justify-between" style="padding: 12px 0; font-size: 13px;">
            <button class="vs-btn vs-btn-ghost vs-btn-sm" id="action-records-prev" ${page <= 1 ? 'disabled' : ''} data-page="${page - 1}">← Previous</button>
            <span class="text-vs-text-tertiary">Page ${page} of ${totalPages} · ${total} submission${total !== 1 ? 's' : ''}</span>
            <button class="vs-btn vs-btn-ghost vs-btn-sm" id="action-records-next" ${page >= totalPages ? 'disabled' : ''} data-page="${page + 1}">Next →</button>
          </div>
        ` : `
          <div class="text-sm text-vs-text-ghost text-center" style="padding: 8px 0;">${total} submission${total !== 1 ? 's' : ''}</div>
        `}
      `}
    </div>
  `;

  // Bind filters
  let searchDebounce = null;
  const reload = () => loadActionRecords(actionId, 1);

  document.getElementById('action-filter-status')?.addEventListener('change', reload);
  document.getElementById('action-filter-search')?.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(reload, 300);
  });

  // Bind pagination
  document.getElementById('action-records-prev')?.addEventListener('click', (e) => {
    const p = parseInt(e.currentTarget.dataset.page);
    if (p >= 1) loadActionRecords(actionId, p);
  });
  document.getElementById('action-records-next')?.addEventListener('click', (e) => {
    const p = parseInt(e.currentTarget.dataset.page);
    if (p <= totalPages) loadActionRecords(actionId, p);
  });

  // Bind inline status changes
  // Record expand/collapse
  container.querySelectorAll('.vs-record-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const rid = btn.dataset.rid;
      const detail = container.querySelector(`.vs-record-detail[data-detail-for="${rid}"]`);
      if (!detail) return;
      const isOpen = detail.style.display !== 'none';
      detail.style.display = isOpen ? 'none' : 'table-row';
      btn.style.transform = isOpen ? '' : 'rotate(90deg)';
    });
  });

  container.querySelectorAll('.vs-action-status-select').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      if (demoGuard()) { sel.value = sel.querySelector('[selected]')?.value || 'pending'; return; }
      if (viewerGuard()) return;
      const recId = e.target.dataset.recordId;
      const newStatus = e.target.value;
      const { ok: updateOk } = await api.put(`/agentic/actions/${encodeURIComponent(actionId)}/records/${recId}`, { status: newStatus });
      showToast(updateOk ? 'Status updated' : 'Failed to update', updateOk ? 'success' : 'error');
    });
  });

  document.getElementById('btn-purge-records')?.addEventListener('click', async () => {
    if (demoGuard()) return;
    if (viewerGuard()) return;
    const purgeOptions = [
      { label: 'Older than 3 days', days: 3 },
      { label: 'Older than 1 week', days: 7 },
      { label: 'Older than 2 weeks', days: 14 },
      { label: 'Older than 1 month', days: 30 },
      { label: 'Older than 3 months', days: 90 },
      { label: 'Older than 6 months', days: 180 },
      { label: 'Older than 1 year', days: 365 },
    ];

    // Use the Studio's existing modal overlay system (same as showConfirmModal)
    const existing = document.getElementById('vs-purge-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'vs-purge-overlay';
    overlay.className = 'vs-modal-overlay';
    overlay.innerHTML = `
      <div class="vs-modal" style="max-width: 400px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Purge Old Submissions</h2>
          <p class="vs-modal-desc">Remove submissions older than a chosen period. This cannot be undone.</p>
        </div>
        <div class="vs-modal-body">
          <select id="vs-purge-select" class="vs-input" style="width: 100%; font-size: 13px;">
            ${purgeOptions.map(opt =>
              `<option value="${opt.days}">${opt.label}</option>`
            ).join('')}
          </select>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-purge-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-purge-ok" class="vs-btn vs-btn-danger vs-btn-sm" type="button">Purge</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-visible'));

    const close = () => closeModal(overlay);

    onBackdropClick(overlay, close);
    document.getElementById('vs-purge-cancel')?.addEventListener('click', close);
    document.getElementById('vs-purge-ok')?.addEventListener('click', async () => {
      const select = document.getElementById('vs-purge-select');
      const days = parseInt(select?.value);
      const label = select?.selectedOptions[0]?.textContent || '';
      close();
      // Wait for close animation
      await new Promise(r => setTimeout(r, 200));
      const confirmed = await showConfirmModal({
        title: 'Confirm Purge',
        description: `This will permanently delete all records "${label.toLowerCase()}" for this action. This cannot be undone.`,
        confirmLabel: 'Purge',
        danger: true,
      });
      if (!confirmed) return;
      const { ok: purgeOk, data: purgeData } = await api.post(`/agentic/actions/${encodeURIComponent(actionId)}/records/purge`, { older_than_days: days });
      if (purgeOk) {
        showToast(`${purgeData?.purged || 0} record(s) purged`, 'success');
        loadActionRecords(actionId, 1);
      } else {
        showToast('Failed to purge records', 'error');
      }
    });
  });

  // Delete single record
  container.querySelectorAll('.vs-record-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (demoGuard()) return;
      if (viewerGuard()) return;
      const rid = btn.dataset.rid;
      const confirmed = await showConfirmModal({
        title: 'Delete Submission',
        description: 'Permanently delete this record? This cannot be undone.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;
      const { ok } = await api.delete(`/agentic/actions/${encodeURIComponent(actionId)}/records/${rid}`);
      if (ok) {
        showToast('Submission deleted', 'success');
        loadActionRecords(actionId, page);
      } else {
        showToast('Failed to delete submission', 'error');
      }
    });
  });

  // Bind Export CSV button (proper file download via fetch)
  document.getElementById('btn-export-action-csv')?.addEventListener('click', async () => {
    if (demoGuard()) return;
    const btn = document.getElementById('btn-export-action-csv');
    const origHTML = btn.innerHTML;
    btn.innerHTML = `${icons.loader} Exporting...`;
    btn.disabled = true;
    try {
      const resp = await fetch(`/_studio/api/router.php?_path=${encodeURIComponent('/agentic/actions/' + actionId + '/records/export')}`, {
        credentials: 'same-origin',
      });
      if (!resp.ok) throw new Error('Export failed');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${actionId}_records_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('CSV downloaded', 'success');
    } catch {
      showToast('Failed to export CSV', 'error');
    }
    btn.innerHTML = origHTML;
    btn.disabled = false;
  });
}

