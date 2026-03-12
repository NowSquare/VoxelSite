/**
 * VoxelSite Studio — Designs View
 *
 * Merges the Design Library (Gallery) and Project History (Snapshots)
 * into a single tabbed view. The Gallery tab shows saved designs as
 * CSS-variable preview cards. The History tab is the existing snapshots
 * timeline moved here.
 *
 * Design cards render using the design's actual CSS tokens as inline
 * custom properties — a dark theme shows a dark card, a serif font
 * shows serif headings. The card IS the preview.
 */

import { api } from '../../api.js';
import { store } from '../../state.js';
import { icons } from '../icons.js';
import { escapeHtml, escapeAttr, timeAgo } from '../helpers.js';
import { showToast } from '../ui/toasts.js';
import { showConfirmModal, closeModal, onBackdropClick } from '../ui/modals.js';
import { router } from '../../router.js';

const SAVE_DESIGN_PREF_KEY = 'vs-newdesign-save-pref';


// ═══════════════════════════════════════════
//  Main View
// ═══════════════════════════════════════════

/** Currently active tab: 'gallery' or 'history' */
let activeTab = 'gallery';

export function renderDesignsView() {
  setTimeout(() => initDesignsView(), 0);

  return `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div class="vs-page-header" style="margin-bottom: 0;">
          <h1 class="vs-page-title">Designs</h1>
          <p class="vs-page-subtitle">Save, compare, and switch between different looks.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-new-design" class="vs-btn vs-btn-ghost vs-btn-sm" title="Start fresh with a new design">
            New Design
          </button>
          <button id="btn-save-design" class="vs-btn vs-btn-primary vs-btn-sm">
            Save Design
          </button>
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="vs-tab-bar" style="margin-bottom: 24px;">
        <button class="vs-tab ${activeTab === 'gallery' ? 'vs-tab-active' : ''}" data-tab="gallery">
          ${icons.layoutGrid} Gallery
        </button>
        <button class="vs-tab ${activeTab === 'history' ? 'vs-tab-active' : ''}" data-tab="history">
          ${icons.history} History
        </button>
      </div>

      <!-- Tab Content -->
      <div id="designs-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading…</div>
      </div>
    </div>
  `;
}

function initDesignsView() {
  // Tab switching
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      // Update tab active states
      document.querySelectorAll('.vs-tab').forEach(t => t.classList.remove('vs-tab-active'));
      btn.classList.add('vs-tab-active');
      loadActiveTab();
    });
  });

  // Save button
  document.getElementById('btn-save-design')?.addEventListener('click', () => {
    if (window.demoGuard?.()) return;
    if (window.viewerGuard?.()) return;
    showSaveDesignModal();
  });

  // New Design button
  document.getElementById('btn-new-design')?.addEventListener('click', () => {
    if (window.demoGuard?.()) return;
    if (window.viewerGuard?.()) return;
    confirmNewDesign();
  });

  loadActiveTab();
}

function loadActiveTab() {
  if (activeTab === 'gallery') {
    loadGallery();
  } else {
    loadHistory();
  }
}

// ═══════════════════════════════════════════
//  Gallery Tab
// ═══════════════════════════════════════════

async function loadGallery() {
  const container = document.getElementById('designs-content');
  if (!container) return;

  const { ok, data } = await api.get('/designs');

  if (!ok || !data?.designs?.length) {
    container.innerHTML = `
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
          </div>
          <p class="vs-empty-state-title">No saved designs</p>
          <p class="vs-empty-state-desc">Save your current design and try different looks. Switch back anytime.</p>
          <button id="btn-empty-save" class="vs-btn vs-btn-primary vs-btn-sm">${icons.save} Save Current Design</button>
        </div>
      </div>
    `;
    document.getElementById('btn-empty-save')?.addEventListener('click', () => {
      if (window.demoGuard?.()) return;
      showSaveDesignModal();
    });
    return;
  }

  const activeId = data.active_id;
  const designs = data.designs;

  container.innerHTML = `
    <div class="vs-design-grid">
      ${designs.map(d => renderDesignCard(d, d.id === activeId)).join('')}
    </div>
  `;

  bindGalleryEvents(container);
  scalePreviewIframes(container);
}

/**
 * Scale preview iframes to fit their container width.
 * Called once after gallery render — the iframe is 1440px wide,
 * so scale = containerWidth / 1440.
 */
function scalePreviewIframes(container) {
  container.querySelectorAll('.vs-design-card-preview').forEach(preview => {
    const iframe = preview.querySelector('iframe');
    if (!iframe) return;

    // Wait for next frame so the container has its layout dimensions
    requestAnimationFrame(() => {
      const containerWidth = preview.offsetWidth;
      if (containerWidth > 0) {
        const scale = containerWidth / 1440;
        iframe.style.transform = `scale(${scale})`;
      }
    });
  });
}

/**
 * Render a single design card with scaled iframe preview.
 */
function renderDesignCard(design, isActive) {
  const name = escapeHtml(design.name || 'Untitled');
  const desc = design.description ? escapeHtml(design.description) : '';
  const prompt = design.initial_prompt ? escapeHtml(design.initial_prompt) : '';
  // Show description if user wrote one, otherwise fall back to initial_prompt excerpt
  const subtitle = desc || (prompt.length > 100 ? prompt.substring(0, 100) + '…' : prompt);
  const siteName = escapeHtml(design.site_name || '');
  const pageCount = design.page_count || 0;
  const date = design.created_at ? timeAgo(design.created_at) : '';
  const corrupted = design._corrupted;

  // Meta line: "Site Name · 4 pages" or just "4 pages" if site name matches design name
  const metaLeft = siteName && siteName !== name
    ? `${siteName} · ${pageCount} ${pageCount === 1 ? 'page' : 'pages'}`
    : `${pageCount} ${pageCount === 1 ? 'page' : 'pages'}`;

  // Preview URL for browsing the full design in a new tab
  const previewUrl = `/_studio/api/router.php?_path=%2Fdesigns%2F${encodeURIComponent(design.id)}%2Fpreview&path=index.php`;
  // Embed URL adds &embed=1 so the backend injects reveal-animation overrides
  const embedUrl = `${previewUrl}&embed=1`;

  return `
    <div class="vs-design-card${isActive ? ' vs-design-card-active' : ''}${corrupted ? ' vs-design-card-corrupted' : ''}"
         data-design-id="${escapeAttr(design.id)}">
      <div class="vs-design-card-preview">
        ${corrupted ? `<div class="vs-design-card-empty">Preview unavailable</div>` : `
          <iframe src="${embedUrl}" tabindex="-1" loading="lazy"
                  sandbox="allow-same-origin"
                  title="Preview of ${escapeAttr(design.name || 'design')}"></iframe>
        `}
      </div>
      <div class="vs-design-card-info">
        <h3>${name}</h3>
        ${subtitle ? `<p class="vs-design-card-desc">${subtitle}</p>` : ''}
        <div class="vs-design-card-meta">
          <span>${metaLeft}</span>
          <span>${date}</span>
        </div>
      </div>
      <div class="vs-design-card-actions">
        ${isActive ? `<span class="vs-design-badge-active">Active</span>` : `
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-load-id="${escapeAttr(design.id)}" ${corrupted ? 'disabled' : ''}>
            ${icons.rotateCcw} Load
          </button>
        `}
        <a class="vs-btn vs-btn-ghost vs-btn-xs" href="${previewUrl}" target="_blank" rel="noopener" title="Browse this design">
          ${icons.eye}
        </a>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-edit-id="${escapeAttr(design.id)}"
                data-edit-name="${escapeAttr(design.name || '')}"
                data-edit-desc="${escapeAttr(design.description || '')}">
          ${icons.pencil}
        </button>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-delete-id="${escapeAttr(design.id)}" style="color: var(--vs-text-ghost);">
          ${icons.trash2}
        </button>
      </div>
    </div>
  `;
}

function bindGalleryEvents(container) {
  // Load buttons
  container.querySelectorAll('[data-load-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (window.demoGuard?.()) return;
      if (window.viewerGuard?.()) return;

      const id = btn.dataset.loadId;
      const card = btn.closest('.vs-design-card');
      const designName = card?.querySelector('h3')?.textContent || 'this design';

      const result = await showSwitchDesignModal(designName);
      if (!result) return; // cancelled

      btn.innerHTML = `${icons.rotateCcw} Loading…`;
      btn.disabled = true;

      // If user chose to save, save explicitly first
      if (result.saveDesign) {
        const siteName = store.get('siteName') || 'Untitled';
        const saveResult = await api.post('/designs', {
          name: `${siteName}`,
          description: 'Saved before switching designs',
        });

        if (!saveResult.ok) {
          showToast(saveResult.error?.message || 'Failed to save design.', 'error');
          btn.innerHTML = `${icons.rotateCcw} Load`;
          btn.disabled = false;
          return;
        }
      }

      // Load the selected design; skip auto-save if user already saved (or opted out)
      const { ok, data, error } = await api.post(`/designs/${id}/load`, {
        skip_auto_save: true,
      });

      if (ok) {
        showToast('Design loaded.', 'success');

        // Post-switch frontend sync
        await refreshAfterDesignSwitch();

        // Navigate to Chat so the user sees their loaded design immediately
        window.location.hash = '#/chat';
      } else {
        showToast(error?.message || 'Failed to load design.', 'error');
        btn.innerHTML = `${icons.rotateCcw} Load`;
        btn.disabled = false;
      }
    });
  });

  // Edit buttons
  container.querySelectorAll('[data-edit-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.demoGuard?.()) return;
      if (window.viewerGuard?.()) return;

      const id = btn.dataset.editId;
      const name = btn.dataset.editName;
      const desc = btn.dataset.editDesc;
      showEditDesignModal(id, name, desc);
    });
  });

  // Delete buttons
  container.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (window.demoGuard?.()) return;
      if (window.viewerGuard?.()) return;

      const id = btn.dataset.deleteId;
      const confirmed = await showConfirmModal({
        title: 'Delete Design',
        description: 'This design will be removed permanently. This cannot be undone.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;

      btn.innerHTML = `Deleting…`;
      btn.disabled = true;

      const { ok, error } = await api.delete(`/designs/${id}`);

      if (ok) {
        showToast('Design deleted.', 'success');
        loadGallery();
      } else {
        showToast(error?.message || 'Failed to delete design.', 'error');
        btn.innerHTML = `${icons.trash2}`;
        btn.disabled = false;
      }
    });
  });
}

// ═══════════════════════════════════════════
//  History Tab (Snapshots)
// ═══════════════════════════════════════════

async function loadHistory() {
  const container = document.getElementById('designs-content');
  if (!container) return;

  // Create snapshot button inside History tab
  container.innerHTML = `
    <div class="flex justify-end mb-4">
      <button id="btn-create-snapshot" class="vs-btn vs-btn-ghost vs-btn-sm">
        ${icons.camera} Create Snapshot
      </button>
    </div>
    <div id="snapshots-list">
      <div class="text-sm text-vs-text-ghost py-8 text-center">Loading snapshots…</div>
    </div>
  `;

  document.getElementById('btn-create-snapshot')?.addEventListener('click', () => {
    if (window.demoGuard?.()) return;
    if (window.viewerGuard?.()) return;
    showSnapshotCreateModal();
  });

  const listEl = document.getElementById('snapshots-list');
  if (!listEl) return;

  const { ok, data } = await api.get('/snapshots');

  if (!ok || !data?.snapshots?.length) {
    listEl.innerHTML = `
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <p class="vs-empty-state-title">No snapshots yet</p>
          <p class="vs-empty-state-desc">Create your first restore point. Experiment fearlessly.</p>
          <button id="btn-empty-create-snapshot" class="vs-btn vs-btn-primary vs-btn-sm">${icons.camera} Create Snapshot</button>
        </div>
      </div>
    `;
    document.getElementById('btn-empty-create-snapshot')?.addEventListener('click', () => {
      if (window.demoGuard?.()) return;
      showSnapshotCreateModal();
    });
    return;
  }

  const snapshots = data.snapshots;

  listEl.innerHTML = `
    <div class="vs-timeline">
      ${snapshots.map((snap, i) => {
        const ago = timeAgo(snap.created_at);
        const fullDate = new Date(snap.created_at).toLocaleString();
        const sizeKB = snap.size_bytes ? (snap.size_bytes / 1024).toFixed(0) + ' KB' : '—';
        const isLast = i === snapshots.length - 1;

        let dotColor, badgeClass, badgeLabel;
        if (snap.snapshot_type === 'pre_publish') {
          dotColor = 'var(--vs-success)';
          badgeClass = 'vs-snap-badge-green';
          badgeLabel = 'Pre-publish';
        } else if (snap.snapshot_type === 'manual') {
          dotColor = 'var(--vs-accent)';
          badgeClass = 'vs-snap-badge-amber';
          badgeLabel = 'Manual';
        } else {
          dotColor = 'var(--vs-text-ghost)';
          badgeClass = 'vs-snap-badge-gray';
          badgeLabel = 'Auto';
        }

        const description = snap.description
          ? `<p class="vs-timeline-desc">${escapeHtml(snap.description)}</p>`
          : '';

        return `
          <div class="vs-timeline-item${isLast ? ' vs-timeline-last' : ''}">
            <div class="vs-timeline-rail">
              <div class="vs-timeline-dot" style="background: ${dotColor}; box-shadow: 0 0 0 3px color-mix(in srgb, ${dotColor} 20%, transparent);"></div>
              <div class="vs-timeline-connector"></div>
            </div>
            <div class="vs-timeline-card">
              <div class="vs-timeline-card-header">
                <div class="flex items-center gap-2">
                  <span class="${badgeClass}">${badgeLabel}</span>
                  <span class="vs-timeline-label">${escapeHtml(snap.label || 'Snapshot #' + snap.id)}</span>
                </div>
                <span class="vs-timeline-ago" title="${fullDate}">${ago}</span>
              </div>
              ${description}
              <div class="vs-timeline-meta">${snap.file_count} files · ${sizeKB}</div>
              <div class="vs-timeline-actions">
                <button data-preview-id="${snap.id}" data-snap='${JSON.stringify({ label: snap.label, description: snap.description, type: snap.snapshot_type, files: snap.file_count, size: sizeKB, date: fullDate }).replace(/'/g, '&#39;')}' class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${icons.eye} Preview
                </button>
                <button data-restore-id="${snap.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${icons.rotateCcw} Restore
                </button>
                <button data-delete-snap-id="${snap.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
                  ${icons.trash2}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  bindHistoryEvents(listEl);
}

function bindHistoryEvents(container) {
  // Preview buttons
  container.querySelectorAll('[data-preview-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const snap = JSON.parse(btn.dataset.snap);
      showSnapshotPreviewModal(snap);
    });
  });

  // Restore buttons
  container.querySelectorAll('[data-restore-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (window.demoGuard?.()) return;
      if (window.viewerGuard?.()) return;

      const id = btn.dataset.restoreId;
      const confirmed = await showConfirmModal({
        title: 'Restore Snapshot',
        description: 'This will overwrite your current preview. A safety snapshot of your current state will be created automatically.',
        confirmLabel: 'Restore',
      });
      if (!confirmed) return;

      btn.innerHTML = `${icons.rotateCcw} Restoring…`;
      btn.disabled = true;

      const { ok, error } = await api.post(`/snapshots/${id}/restore`);

      if (ok) {
        const statusEl = document.getElementById('status-text');
        if (statusEl) {
          statusEl.textContent = '✓ Snapshot restored';
          setTimeout(() => { if (statusEl) statusEl.textContent = 'Ready'; }, 4000);
        }
        showToast('Snapshot restored.', 'success');
        loadHistory();
      } else {
        showToast(error?.message || 'Failed to restore snapshot.', 'error');
        btn.innerHTML = `${icons.rotateCcw} Restore`;
        btn.disabled = false;
      }
    });
  });

  // Delete buttons
  container.querySelectorAll('[data-delete-snap-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (window.demoGuard?.()) return;
      if (window.viewerGuard?.()) return;

      const id = btn.dataset.deleteSnapId;
      const confirmed = await showConfirmModal({
        title: 'Delete Snapshot',
        description: 'This snapshot will be removed permanently.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;

      btn.innerHTML = `Deleting…`;
      btn.disabled = true;

      const { ok, error } = await api.delete(`/snapshots/${id}`);

      if (ok) {
        showToast('Snapshot deleted.', 'success');
        loadHistory();
      } else {
        showToast(error?.message || 'Failed to delete snapshot.', 'error');
        btn.innerHTML = `${icons.trash2}`;
        btn.disabled = false;
      }
    });
  });
}

// ═══════════════════════════════════════════
//  Modals — Save Design
// ═══════════════════════════════════════════

export function showSaveDesignModal() {
  const existing = document.getElementById('vs-design-save-overlay');
  if (existing) existing.remove();

  const siteName = store.get('siteName') || '';

  const overlay = document.createElement('div');
  overlay.id = 'vs-design-save-overlay';
  overlay.className = 'vs-modal-overlay';
  overlay.innerHTML = `
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${icons.save} Save Design</h2>
        <p class="vs-modal-desc">Save a snapshot of your current design. You can switch back to it anytime.</p>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Name</label>
            <input id="design-name" type="text" class="vs-input w-full" placeholder="e.g. Dark Forest Theme" value="${escapeAttr(siteName)}" autofocus>
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Description <span class="text-vs-text-ghost">(optional)</span></label>
            <input id="design-desc" type="text" class="vs-input w-full" placeholder="e.g. Warm wood tones with dark greens">
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="design-save-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
        <button id="design-save-confirm" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${icons.save} Save Design</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-visible'));

  const close = () => closeModal(overlay);

  // Escape key to close
  const onKeydown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
  };
  document.addEventListener('keydown', onKeydown);

  // Clean up keydown listener when the overlay is removed
  const observer = new MutationObserver(() => {
    if (!document.body.contains(overlay)) {
      document.removeEventListener('keydown', onKeydown);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true });

  onBackdropClick(overlay, close);
  document.getElementById('design-save-cancel')?.addEventListener('click', close);

  const nameInput = document.getElementById('design-name');
  const descInput = document.getElementById('design-desc');
  const saveBtn = document.getElementById('design-save-confirm');

  // Enter key submits
  const onEnter = (e) => { if (e.key === 'Enter') saveBtn?.click(); };
  nameInput?.addEventListener('keydown', onEnter);
  descInput?.addEventListener('keydown', onEnter);

  // Select text for easy replacement
  nameInput?.select();

  saveBtn?.addEventListener('click', async () => {
    const name = nameInput?.value?.trim() || '';
    const description = descInput?.value?.trim() || '';

    if (!name) {
      nameInput?.focus();
      return;
    }

    saveBtn.innerHTML = 'Saving…';
    saveBtn.disabled = true;

    const { ok, error } = await api.post('/designs', { name, description });

    close();

    if (ok) {
      showToast('Design saved.', 'success');
      activeTab = 'gallery';
      // Re-render if we're on the designs page
      const content = document.getElementById('designs-content');
      if (content) {
        document.querySelectorAll('.vs-tab').forEach(t => {
          t.classList.toggle('vs-tab-active', t.dataset.tab === 'gallery');
        });
        loadGallery();
      }
    } else {
      showToast(error?.message || 'Failed to save design.', 'error');
    }
  });
}

// ═══════════════════════════════════════════
//  Modals — Edit Design
// ═══════════════════════════════════════════

function showEditDesignModal(id, currentName, currentDesc) {
  const existing = document.getElementById('vs-design-edit-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'vs-design-edit-overlay';
  overlay.className = 'vs-modal-overlay';
  overlay.innerHTML = `
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${icons.pencil} Edit Design</h2>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Name</label>
            <input id="edit-design-name" type="text" class="vs-input w-full" value="${escapeAttr(currentName)}" autofocus>
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Description <span class="text-vs-text-ghost">(optional)</span></label>
            <input id="edit-design-desc" type="text" class="vs-input w-full" value="${escapeAttr(currentDesc)}">
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="edit-design-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
        <button id="edit-design-save" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Save</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-visible'));

  const close = () => closeModal(overlay);

  onBackdropClick(overlay, close);
  document.getElementById('edit-design-cancel')?.addEventListener('click', close);

  const nameInput = document.getElementById('edit-design-name');
  const descInput = document.getElementById('edit-design-desc');
  const saveBtn = document.getElementById('edit-design-save');

  nameInput?.select();

  const onEnter = (e) => { if (e.key === 'Enter') saveBtn?.click(); };
  nameInput?.addEventListener('keydown', onEnter);
  descInput?.addEventListener('keydown', onEnter);

  saveBtn?.addEventListener('click', async () => {
    const name = nameInput?.value?.trim() || '';
    const description = descInput?.value?.trim() || '';

    if (!name) {
      nameInput?.focus();
      return;
    }

    saveBtn.innerHTML = 'Saving…';
    saveBtn.disabled = true;

    const { ok, error } = await api.put(`/designs/${id}`, { name, description });

    close();

    if (ok) {
      showToast('Design updated.', 'success');
      loadGallery();
    } else {
      showToast(error?.message || 'Failed to update design.', 'error');
    }
  });
}

// ═══════════════════════════════════════════
//  Modals — Switch Design Confirmation
// ═══════════════════════════════════════════

/**
 * Custom Switch Design modal with optional save-before-switch.
 * Returns null if cancelled, or { saveDesign: boolean } on confirm.
 * Shares the same localStorage preference key as the New Design modal.
 */
function showSwitchDesignModal(designName) {
  return new Promise((resolve) => {
    const existing = document.getElementById('vs-switch-design-overlay');
    if (existing) existing.remove();

    const checkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    const savedPref = localStorage.getItem(SAVE_DESIGN_PREF_KEY);

    const overlay = document.createElement('div');
    overlay.id = 'vs-switch-design-overlay';
    overlay.className = 'vs-modal-overlay';
    overlay.innerHTML = `
      <div class="vs-modal" style="max-width: 480px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Switch Design</h2>
          <p class="vs-modal-desc">Switch to "${escapeHtml(designName)}"?</p>
          <label class="vs-modal-option" for="vs-switch-save-cb">
            <input type="checkbox" id="vs-switch-save-cb" ${savedPref !== 'false' ? 'checked' : ''}>
            <span class="vs-modal-option-check">${checkSvg}</span>
            <span class="vs-modal-option-label">Save current design to the Designs library</span>
          </label>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-switch-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-switch-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Switch</button>
        </div>
      </div>
    `;

    const onKeydown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(null); }
    };
    const close = (value) => {
      document.removeEventListener('keydown', onKeydown);
      closeModal(overlay);
      resolve(value);
    };

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-visible'));

    const cb = document.getElementById('vs-switch-save-cb');

    onBackdropClick(overlay, () => close(null));
    document.getElementById('vs-switch-cancel')?.addEventListener('click', () => close(null));
    document.getElementById('vs-switch-ok')?.addEventListener('click', () => {
      const saveDesign = cb ? cb.checked : false;

      // Persist preference on confirmation only
      localStorage.setItem(SAVE_DESIGN_PREF_KEY, saveDesign ? 'true' : 'false');

      close({ saveDesign });
    });

    document.addEventListener('keydown', onKeydown);

    // Focus the Switch button
    setTimeout(() => document.getElementById('vs-switch-ok')?.focus(), 220);
  });
}

// ═══════════════════════════════════════════
//  Modals — New Design Confirmation
// ═══════════════════════════════════════════

export async function confirmNewDesign() {
  const result = await showNewDesignModal();
  if (!result) return; // cancelled

  // If user chose to save, save with their chosen name first
  if (result.saveDesign && result.designName) {
    const saveResult = await api.post('/designs', {
      name: result.designName,
      description: '',
    });

    if (!saveResult.ok) {
      showToast(saveResult.error?.message || 'Failed to save design.', 'error');
      return;
    }

    showToast('Design saved.', 'success');
  }

  // Clear the workspace
  // Always skip auto-save: either the user saved explicitly above,
  // or they unchecked the checkbox (opted out of saving entirely).
  const { ok, error } = await api.post('/designs/new', {
    skip_auto_save: true,
  });

  if (ok) {
    showToast('Workspace cleared. Start building.', 'success');
    await refreshAfterDesignSwitch();

    // Clear conversation state so Chat shows the fresh empty state
    store.set('messages', []);
    store.set('activeConversationId', null);
    store.set('conversations', []);
    try { localStorage.removeItem('vs-active-conversation'); } catch (_) {}

    // Navigate to Chat — the empty state will show "What are we building?"
    // since the workspace is now empty (0 pages).
    // Use router.navigate for cross-route, router.refresh for same-route
    // (the router skips re-renders when hash hasn't changed).
    if (window.location.hash !== '#/chat') {
      router.navigate('chat');
    } else {
      router.refresh();
    }
  } else {
    showToast(error?.message || 'Failed to start new design.', 'error');
  }
}

/**
 * Custom New Design modal with save-to-library checkbox.
 *
 * Returns null if cancelled, or { saveDesign: boolean, designName: string }
 * if confirmed. Follows the same pattern as showPublishConfirmModal.
 */

function showNewDesignModal() {
  return new Promise((resolve) => {
    const existing = document.getElementById('vs-new-design-overlay');
    if (existing) existing.remove();

    const siteName = store.get('siteName') || '';
    const checkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

    const overlay = document.createElement('div');
    overlay.id = 'vs-new-design-overlay';
    overlay.className = 'vs-modal-overlay';
    overlay.innerHTML = `
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Start New Design</h2>
          <p class="vs-modal-desc">This will clear your workspace for a fresh start.</p>
          <label class="vs-modal-option" for="vs-newdesign-save-cb">
            <input type="checkbox" id="vs-newdesign-save-cb" ${localStorage.getItem(SAVE_DESIGN_PREF_KEY) !== 'false' ? 'checked' : ''}>
            <span class="vs-modal-option-check">${checkSvg}</span>
            <span class="vs-modal-option-label">Save current design to the Designs library</span>
          </label>
        </div>
        <div class="vs-modal-body" id="vs-newdesign-name-row" style="${localStorage.getItem(SAVE_DESIGN_PREF_KEY) === 'false' ? 'display:none' : ''}">
          <label class="vs-input-label">Name</label>
          <input id="vs-newdesign-name" type="text" class="vs-input w-full" placeholder="e.g. Dark Forest Theme" value="${escapeAttr(siteName)}">
        </div>
        <div class="vs-modal-footer">
          <button id="vs-newdesign-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-newdesign-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Start Fresh</button>
        </div>
      </div>
    `;

    const onKeydown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(null); }
    };
    const close = (value) => {
      document.removeEventListener('keydown', onKeydown);
      closeModal(overlay);
      resolve(value);
    };

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-visible'));

    const cb = document.getElementById('vs-newdesign-save-cb');
    const nameRow = document.getElementById('vs-newdesign-name-row');
    const nameInput = document.getElementById('vs-newdesign-name');

    // Toggle name input visibility based on checkbox — simple show/hide
    const toggleNameRow = () => {
      if (cb.checked) {
        nameRow.style.display = '';
        setTimeout(() => nameInput?.focus(), 80);
      } else {
        nameRow.style.display = 'none';
      }
    };

    cb?.addEventListener('change', toggleNameRow);

    // Enter key in name input submits
    nameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('vs-newdesign-ok')?.click();
      }
    });

    onBackdropClick(overlay, () => close(null));
    document.getElementById('vs-newdesign-cancel')?.addEventListener('click', () => close(null));
    document.getElementById('vs-newdesign-ok')?.addEventListener('click', () => {
      const saveDesign = cb ? cb.checked : false;
      const designName = nameInput?.value?.trim() || '';

      // If save is checked, name is required
      if (saveDesign && !designName) {
        nameInput?.focus();
        return;
      }

      // Persist checkbox preference on confirmation (not on cancel)
      localStorage.setItem(SAVE_DESIGN_PREF_KEY, saveDesign ? 'true' : 'false');

      close({ saveDesign, designName });
    });

    document.addEventListener('keydown', onKeydown);

    // Focus: if checkbox is checked, focus the name input; otherwise focus Start Fresh
    setTimeout(() => {
      if (cb?.checked && nameInput) {
        nameInput.select();
      } else {
        document.getElementById('vs-newdesign-ok')?.focus();
      }
    }, 220);
  });
}

// ═══════════════════════════════════════════
//  Modals — Snapshot Create
// ═══════════════════════════════════════════

function showSnapshotCreateModal() {
  const existing = document.getElementById('vs-snapshot-create-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'vs-snapshot-create-overlay';
  overlay.className = 'vs-modal-overlay';
  overlay.innerHTML = `
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${icons.camera} Create Snapshot</h2>
        <p class="vs-modal-desc">Save a restore point of your current site state.</p>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Description <span class="text-vs-text-ghost">(optional)</span></label>
            <input id="snap-desc" type="text" class="vs-input w-full" placeholder="e.g. Before redesigning the header" autofocus>
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="snap-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
        <button id="snap-save" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${icons.camera} Create Snapshot</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-visible'));

  const close = () => closeModal(overlay);

  onBackdropClick(overlay, close);
  document.getElementById('snap-cancel')?.addEventListener('click', close);

  const descInput = document.getElementById('snap-desc');
  const saveBtn = document.getElementById('snap-save');

  descInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveBtn?.click();
  });

  saveBtn?.addEventListener('click', async () => {
    const description = descInput?.value?.trim() || '';
    saveBtn.innerHTML = 'Creating…';
    saveBtn.disabled = true;

    const { ok, error } = await api.post('/snapshots', {
      type: 'manual',
      label: 'Manual snapshot',
      description,
    });

    close();

    if (ok) {
      showToast('Snapshot created.', 'success');
      loadHistory();
    } else {
      showToast(error?.message || 'Failed to create snapshot.', 'error');
    }
  });
}

// ═══════════════════════════════════════════
//  Modals — Snapshot Preview
// ═══════════════════════════════════════════

function showSnapshotPreviewModal(snap) {
  const existing = document.getElementById('vs-snapshot-preview-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'vs-snapshot-preview-overlay';
  overlay.className = 'vs-modal-overlay';

  let dotColor, typeName;
  if (snap.type === 'pre_publish') { dotColor = 'var(--vs-success)'; typeName = 'Pre-publish'; }
  else if (snap.type === 'manual') { dotColor = 'var(--vs-accent)'; typeName = 'Manual'; }
  else { dotColor = 'var(--vs-text-ghost)'; typeName = 'Auto'; }

  overlay.innerHTML = `
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${icons.eye} Snapshot Details</h2>
      </div>
      <div class="vs-modal-body">
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 13px;">
          <span style="color: var(--vs-text-ghost);">Type</span>
          <span style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${dotColor}; display: inline-block;"></span>
            ${typeName}
          </span>
          <span style="color: var(--vs-text-ghost);">Label</span>
          <span style="color: var(--vs-text-primary);">${escapeHtml(snap.label || '—')}</span>
          <span style="color: var(--vs-text-ghost);">Description</span>
          <span style="color: var(--vs-text-primary);">${escapeHtml(snap.description || '—')}</span>
          <span style="color: var(--vs-text-ghost);">Date</span>
          <span style="color: var(--vs-text-primary);">${snap.date}</span>
          <span style="color: var(--vs-text-ghost);">Files</span>
          <span style="color: var(--vs-text-primary);">${snap.files} files</span>
          <span style="color: var(--vs-text-ghost);">Size</span>
          <span style="color: var(--vs-text-primary);">${snap.size}</span>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="snap-preview-close" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-visible'));

  onBackdropClick(overlay, () => closeModal(overlay));
  document.getElementById('snap-preview-close')?.addEventListener('click', () => closeModal(overlay));
}

// ═══════════════════════════════════════════
//  Post-Switch Sync
// ═══════════════════════════════════════════

/**
 * Refresh frontend state after a design switch or new design.
 *
 * 1. Refresh pages list from server
 * 2. Update site name in the store
 * 3. Reload preview iframe
 * 4. Update status bar
 */
async function refreshAfterDesignSwitch() {
  try {
    // Refresh pages from server (page registry was synced server-side)
    const pagesResult = await api.get('/pages');
    if (pagesResult.ok && Array.isArray(pagesResult.data?.pages)) {
      store.set('pages', pagesResult.data.pages);
    }

    // Refresh session to get updated site name
    const sessionResult = await api.get('/auth/session');
    if (sessionResult.ok && sessionResult.data?.site_name) {
      store.set('siteName', sessionResult.data.site_name);
      document.title = `Studio — ${sessionResult.data.site_name}`;
    }

    // Reload preview iframe
    const iframe = document.getElementById('preview-iframe');
    if (iframe) {
      iframe.src = iframe.src;
    }

    // Update status bar
    const statusEl = document.getElementById('status-text');
    if (statusEl) {
      statusEl.textContent = '✓ Design switched';
      setTimeout(() => { if (statusEl) statusEl.textContent = 'Ready'; }, 4000);
    }
  } catch (e) {
    // Non-critical — the page will be correct on next navigation
    console.warn('[designs] Post-switch refresh failed:', e);
  }
}
