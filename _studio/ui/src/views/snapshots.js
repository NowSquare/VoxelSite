/**
 * VoxelSite Studio — Snapshots View
 *
 * Timeline of restore points with create, preview, restore, delete.
 */

import { api } from '../../api.js';
import { icons } from '../icons.js';
import { escapeHtml, timeAgo } from '../helpers.js';
import { showToast } from '../ui/toasts.js';
import { showConfirmModal, closeModal, onBackdropClick } from '../ui/modals.js';


export function renderSnapshotsView() {
  setTimeout(() => loadSnapshots(), 0);

  return `
    <div>
      <div class="flex items-center justify-between mb-8">
        <div class="vs-page-header" style="margin-bottom: 0;">
          <h1 class="vs-page-title">Project History</h1>
          <p class="vs-page-subtitle">Restore points for your website. Experiment fearlessly.</p>
        </div>
        <button id="btn-create-snapshot" class="vs-btn vs-btn-primary vs-btn-sm">Create Snapshot</button>
      </div>
      <div id="snapshots-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading snapshots...</div>
      </div>
    </div>
  `;
}

async function loadSnapshots() {
  const container = document.getElementById('snapshots-list');
  if (!container) return;

  // ─── Bind create button → shows modal with description ───
  const createBtn = document.getElementById('btn-create-snapshot');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      showSnapshotCreateModal();
    });
  }

  const { ok, data } = await api.get('/snapshots');

  if (!ok || !data?.snapshots?.length) {
    container.innerHTML = `
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <p class="vs-empty-state-title">No snapshots yet</p>
          <p class="vs-empty-state-desc">Create your first restore point. Experiment fearlessly.</p>
          <button id="btn-empty-create-snapshot" class="vs-btn vs-btn-primary vs-btn-sm">Create Snapshot</button>
        </div>
      </div>
    `;
    const emptyBtn = document.getElementById('btn-empty-create-snapshot');
    if (emptyBtn) emptyBtn.addEventListener('click', () => showSnapshotCreateModal());
    return;
  }

  const snapshots = data.snapshots;

  container.innerHTML = `
    <div class="vs-timeline">
      ${snapshots.map((snap, i) => {
        const ago = timeAgo(snap.created_at);
        const fullDate = new Date(snap.created_at).toLocaleString();
        const sizeKB = snap.size_bytes ? (snap.size_bytes / 1024).toFixed(0) + ' KB' : '—';
        const isLast = i === snapshots.length - 1;

        // Color coding: green = pre_publish (safe), amber = manual (intentional), gray = auto
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
                <button data-delete-id="${snap.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
                  ${icons.trash2}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // ─── Preview buttons ───
  container.querySelectorAll('[data-preview-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const snap = JSON.parse(btn.dataset.snap);
      showSnapshotPreviewModal(snap);
    });
  });

  // ─── Restore buttons ───
  container.querySelectorAll('[data-restore-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
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
        showToast('Snapshot restored.', 'success');
        loadSnapshots();
      } else {
        showToast(error?.message || 'Failed to restore snapshot.', 'error');
        btn.innerHTML = `${icons.rotateCcw} Restore`;
        btn.disabled = false;
      }
    });
  });

  // ─── Delete buttons ───
  container.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteId;
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
        loadSnapshots();
      } else {
        showToast(error?.message || 'Failed to delete snapshot.', 'error');
        btn.innerHTML = `${icons.trash2}`;
        btn.disabled = false;
      }
    });
  });
}

/** Create Snapshot Modal — prompts for optional description */
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

  // Enter key submits
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
      loadSnapshots();
    } else {
      showToast(error?.message || 'Failed to create snapshot.', 'error');
    }
  });
}

/** Snapshot Preview Modal — shows details without restoring */
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

