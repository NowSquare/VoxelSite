/**
 * VoxelSite Studio — Assets View
 *
 * Asset grid, upload, lightbox, drag-and-drop, category filters.
 */

import { api } from '../../api.js';
import { store } from '../../state.js';
import { icons } from '../icons.js';
import { escapeHtml, formatBytes } from '../helpers.js';
import { showToast } from '../ui/toasts.js';
import { showConfirmModal } from '../ui/modals.js';
import { openCodeEditorModal } from './editor.js';

const demoGuard = () => window.demoGuard?.() || false;
const viewerGuard = () => window.viewerGuard?.() || false;

export function renderAssetsView() {
  setTimeout(() => loadAssets(), 0);

  return `
    <div>
      <div class="flex items-center justify-between mb-8">
        <div class="vs-page-header" style="margin-bottom: 0;">
          <h1 class="vs-page-title">Assets</h1>
          <p class="vs-page-subtitle">Images, documents, and files for your website.</p>
        </div>
        <div class="flex items-center gap-2">
          <input type="file" id="asset-file-input" multiple class="hidden" />
          <button id="btn-upload-asset" class="vs-btn vs-btn-primary vs-btn-sm">
            Upload Files
          </button>
        </div>
      </div>

      <!-- Drop zone -->
      <div id="asset-dropzone" class="vs-dropzone mb-5">
        <div class="vs-dropzone-icon">${icons.upload}</div>
        <p class="vs-dropzone-title">Drag & drop files here, or click to upload</p>
        <p class="vs-dropzone-hint">Images, documents, and fonts</p>
      </div>

      <!-- Filter tabs -->
      <div class="flex gap-1 mb-4" id="asset-filters">
        <button data-filter="all" class="vs-device-btn vs-device-btn-active">All</button>
        <button data-filter="images" class="vs-device-btn">Images</button>
        <button data-filter="code" class="vs-device-btn">Code</button>
        <button data-filter="files" class="vs-device-btn">Documents</button>
        <button data-filter="fonts" class="vs-device-btn">Fonts</button>
      </div>

      <!-- Asset grid -->
      <div id="assets-grid" class="flex flex-col gap-4">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading assets...</div>
      </div>
    </div>
  `;
}

async function loadAssets(filter = 'all') {
  const container = document.getElementById('assets-grid');
  if (!container) return;

  // Bind upload button
  const uploadBtn = document.getElementById('btn-upload-asset');
  const fileInput = document.getElementById('asset-file-input');
  if (uploadBtn && fileInput) {
    uploadBtn.onclick = () => fileInput.click();
    fileInput.onchange = async () => {
      if (fileInput.files.length === 0) return;
      await uploadAssets(fileInput.files);
      fileInput.value = '';
      loadAssets(filter);
    };
  }

  // Bind drag & drop + click-to-upload
  const dropzone = document.getElementById('asset-dropzone');
  if (dropzone) {
    // Click anywhere on the dropzone to trigger file picker
    dropzone.onclick = (e) => {
      // Don't trigger if they clicked a button inside the dropzone
      if (e.target.closest('button')) return;
      fileInput?.click();
    };
    dropzone.ondragover = (e) => { e.preventDefault(); dropzone.classList.add('is-dragover'); };
    dropzone.ondragleave = () => { dropzone.classList.remove('is-dragover'); };
    dropzone.ondrop = async (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
      if (e.dataTransfer.files.length > 0) {
        await uploadAssets(e.dataTransfer.files);
        loadAssets(filter);
      }
    };
  }

  // Bind filter tabs
  const filterContainer = document.getElementById('asset-filters');
  if (filterContainer) {
    filterContainer.querySelectorAll('[data-filter]').forEach(btn => {
      btn.onclick = () => {
        filterContainer.querySelectorAll('[data-filter]').forEach(b => {
          b.className = 'vs-device-btn';
        });
        btn.className = 'vs-device-btn vs-device-btn-active';
        loadAssets(btn.dataset.filter);
      };
    });
  }

  // Fetch assets — "code" filter needs to fetch all and filter client-side
  const isCodeFilter = filter === 'code';
  const params = (!isCodeFilter && filter !== 'all') ? `?category=${filter}` : '';
  const { ok, data } = await api.get(`/assets${params}`);

  if (!ok || !data?.assets?.length) {
    container.innerHTML = `
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <p class="vs-empty-state-title">No files yet</p>
          <p class="vs-empty-state-desc">Upload images, documents, or fonts by dropping them here.</p>
          <button id="btn-empty-upload" class="vs-btn vs-btn-primary vs-btn-sm">Upload Files</button>
        </div>
      </div>
    `;
    const emptyUploadBtn = document.getElementById('btn-empty-upload');
    const headerUploadBtn = document.getElementById('btn-upload-asset');
    if (emptyUploadBtn && headerUploadBtn) {
      emptyUploadBtn.addEventListener('click', () => headerUploadBtn.click());
    }
    return;
  }

  let assets = data.assets;

  // Client-side filter for "code" tab
  if (isCodeFilter) {
    assets = assets.filter(a => a.category === 'css' || a.category === 'js');
    if (assets.length === 0) {
      container.innerHTML = `
        <div class="vs-empty-state">
          <div class="vs-empty-state-inner">
            <div class="vs-empty-state-icon">${icons.fileCode}</div>
            <p class="vs-empty-state-title">No code files</p>
            <p class="vs-empty-state-desc">CSS and JS files will appear here.</p>
          </div>
        </div>
      `;
      return;
    }
  }

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'];
  const images = assets.filter(a => a.category === 'images' && imageExts.includes(a.extension));
  const others = assets.filter(a => !imageExts.includes(a.extension) || a.category !== 'images');

  // ─── Icon map: extension → Lucide icon (replaces emojis) ───
  function getAssetIcon(ext, category) {
    if (ext === 'css') return icons.fileCode;
    if (ext === 'js')  return icons.fileCode;
    if (ext === 'json') return icons.fileJson;
    if (ext === 'pdf') return icons.filePdf;
    if (['woff2', 'woff', 'ttf', 'otf'].includes(ext)) return icons.type;
    if (['mp4', 'webm'].includes(ext)) return icons.film;
    if (['mp3', 'wav', 'ogg'].includes(ext)) return icons.music;
    if (['txt', 'md', 'csv'].includes(ext)) return icons.fileText;
    if (['doc', 'docx', 'xls', 'xlsx'].includes(ext)) return icons.fileText;
    if (category === 'images') return icons.image;
    return icons.fileText;
  }

  // Editable file extensions (can be opened in code editor)
  const editableExts = ['css', 'js', 'json', 'svg'];

  let html = '';

  // ─── Image grid ───
  if (images.length > 0) {
    html += `<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">`;
    images.forEach((asset, idx) => {
      const sizeStr = formatBytes(asset.size);
      const dims = asset.width ? `${asset.width}×${asset.height}` : '';
      const isSvg = asset.extension === 'svg';
      html += `
        <div class="vs-asset-card" data-lightbox-idx="${idx}">
          <div class="vs-asset-card-thumb${isSvg ? ' is-svg' : ''}" style="cursor:pointer">
            <img src="${asset.thumbnail || asset.path}" alt="${escapeHtml(asset.meta?.alt || asset.filename)}"
              loading="lazy" />
          </div>
          <div class="vs-asset-card-info">
            <p class="vs-asset-card-name" title="${escapeHtml(asset.filename)}">${escapeHtml(asset.filename)}</p>
            <p class="vs-asset-card-meta">${dims ? dims + ' · ' : ''}${sizeStr}</p>
          </div>
          <div class="vs-asset-card-actions">
            <button data-copy-path="${asset.path}" title="Copy web path"
              class="vs-asset-overlay-btn">${icons.copy}</button>
            <button data-delete-asset="${asset.path}" title="Delete"
              class="vs-asset-overlay-btn vs-asset-overlay-btn--danger">${icons.x}</button>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }

  // ─── File list ───
  if (others.length > 0) {
    others.forEach(asset => {
      const sizeStr = formatBytes(asset.size);
      const isEditable = editableExts.includes(asset.extension);
      html += `
        <div class="vs-asset-row group">
          <div class="flex items-center gap-3 min-w-0">
            <span class="vs-asset-row-icon">${getAssetIcon(asset.extension, asset.category)}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-vs-text-primary truncate">${escapeHtml(asset.filename)}</p>
              <p class="text-xs text-vs-text-ghost">${asset.category} · ${sizeStr}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${isEditable ? `
              <button data-edit-asset="${asset.path}" title="Edit in code editor"
                class="vs-asset-action-btn">${icons.pencil}</button>
            ` : ''}
            <button data-copy-path="${asset.path}" title="Copy web path"
              class="vs-asset-action-btn">${icons.copy}</button>
            ${asset.category !== 'css' && asset.category !== 'js' ? `
              <button data-delete-asset="${asset.path}" title="Delete"
                class="vs-asset-action-btn vs-asset-action-btn--danger">${icons.trash2}</button>
            ` : ''}
          </div>
        </div>
      `;
    });
  }

  container.innerHTML = html;

  // ─── Bind lightbox on image card click ───
  container.querySelectorAll('[data-lightbox-idx]').forEach(card => {
    const thumb = card.querySelector('.vs-asset-card-thumb');
    if (thumb) {
      thumb.addEventListener('click', () => {
        const idx = parseInt(card.dataset.lightboxIdx, 10);
        openAssetLightbox(images, idx, filter);
      });
    }
  });

  // ─── Bind copy path (icon shows ✓ feedback) ───
  container.querySelectorAll('[data-copy-path]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copyPath).then(() => {
        const origHTML = btn.innerHTML;
        btn.innerHTML = '✓';
        btn.classList.add('vs-asset-action-copied');
        setTimeout(() => { btn.innerHTML = origHTML; btn.classList.remove('vs-asset-action-copied'); }, 1200);
      });
    });
  });

  // ─── Bind edit buttons → open code editor ───
  container.querySelectorAll('[data-edit-asset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const assetPath = btn.dataset.editAsset;
      // Convert web path to preview file path for code editor
      // e.g. /assets/css/style.css → assets/css/style.css
      const filePath = assetPath.replace(/^\//, '');
      openCodeEditorModal(filePath);
    });
  });

  // ─── Bind delete buttons ───
  container.querySelectorAll('[data-delete-asset]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const confirmed = await showConfirmModal({
        title: 'Delete Asset',
        description: `Delete ${btn.dataset.deleteAsset}?`,
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;
      const { ok } = await api.delete('/assets', { path: btn.dataset.deleteAsset });
      if (ok) {
        showToast('Asset deleted.', 'success');
        loadAssets(filter);
      } else {
        showToast('Could not delete asset.', 'error');
      }
    });
  });
}

// ─── Asset Lightbox — Cream Edition ───
// Centered vertical stack: image → filename → details → actions.
function openAssetLightbox(imageAssets, startIndex, currentFilter) {
  let currentIdx = startIndex;

  function fmtBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Remove any existing lightbox
  const existing = document.getElementById('vs-lightbox');
  if (existing) existing.remove();

  function renderInner() {
    const asset = imageAssets[currentIdx];
    const dims = asset.width ? `${asset.width}×${asset.height}` : '';
    const sizeStr = fmtBytes(asset.size);
    const detailParts = [dims, sizeStr, asset.extension?.toUpperCase()].filter(Boolean);
    const hasNav = imageAssets.length > 1;

    return `
      ${hasNav ? `
        <button class="vs-lightbox-nav vs-lightbox-nav--prev" id="lightbox-prev" title="Previous (←)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="vs-lightbox-nav vs-lightbox-nav--next" id="lightbox-next" title="Next (→)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      ` : ''}

      <div class="vs-lightbox-stage">
        <div class="vs-lightbox-center">
          <div class="vs-lightbox-image-wrap${['svg', 'png'].includes(asset.extension) ? ' is-transparent' : ''}">
            <img src="${asset.path}" alt="${escapeHtml(asset.meta?.alt || asset.filename)}" />
          </div>

          <div class="vs-lightbox-info">
            <span class="vs-lightbox-filename">${escapeHtml(asset.filename)}</span>
            <span class="vs-lightbox-details">${detailParts.join(' · ')}${hasNav ? ` · ${currentIdx + 1} / ${imageAssets.length}` : ''}</span>
          </div>

          <div class="vs-lightbox-actions">
            <button class="vs-lightbox-btn" id="lightbox-copy" title="Copy web path">
              ${icons.copy}<span>Copy path</span>
            </button>
          </div>
        </div>
      </div>

      <button class="vs-lightbox-close" id="lightbox-close" title="Close (Esc)">
        ${icons.x}
      </button>
    `;
  }

  // Create the outer shell once — only update innerHTML for navigation
  const shell = document.createElement('div');
  shell.id = 'vs-lightbox';
  shell.className = 'vs-lightbox';
  shell.setAttribute('role', 'dialog');
  shell.setAttribute('aria-label', 'Image preview');
  shell.innerHTML = renderInner();
  document.body.appendChild(shell);

  // Animate open
  requestAnimationFrame(() => {
    requestAnimationFrame(() => shell.classList.add('is-visible'));
  });

  function close() {
    shell.classList.remove('is-visible');
    setTimeout(() => shell.remove(), 400);
    document.removeEventListener('keydown', onKey);
  }

  function navigateTo(idx) {
    currentIdx = idx;
    shell.innerHTML = renderInner();
    bindLightboxEvents();
  }

  function onKey(e) {
    // Don't close lightbox if a modal (e.g. confirm delete) is open
    if (e.key === 'Escape') {
      const modal = document.querySelector('.vs-modal-overlay.is-visible');
      if (modal) return; // let the modal handle Escape
      close(); e.preventDefault();
    }
    if (e.key === 'ArrowRight' && imageAssets.length > 1) {
      navigateTo((currentIdx + 1) % imageAssets.length);
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft' && imageAssets.length > 1) {
      navigateTo((currentIdx - 1 + imageAssets.length) % imageAssets.length);
      e.preventDefault();
    }
  }

  function bindLightboxEvents() {
    // Close button
    shell.querySelector('#lightbox-close')?.addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });

    // Click backdrop (the stage area outside center) to close
    shell.addEventListener('click', (e) => {
      if (e.target === shell || e.target.classList.contains('vs-lightbox-stage')) close();
    });

    // Nav buttons
    shell.querySelector('#lightbox-prev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateTo((currentIdx - 1 + imageAssets.length) % imageAssets.length);
    });
    shell.querySelector('#lightbox-next')?.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateTo((currentIdx + 1) % imageAssets.length);
    });

    // Copy path — inline feedback on the button itself
    const copyBtn = shell.querySelector('#lightbox-copy');
    copyBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const asset = imageAssets[currentIdx];
      navigator.clipboard.writeText(asset.path).then(() => {
        // Inline feedback: swap to checkmark + "Copied!" for 2s
        const origHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = `${icons.check}<span>Copied!</span>`;
        copyBtn.style.borderColor = 'var(--vs-success)';
        copyBtn.style.color = 'var(--vs-success)';
        setTimeout(() => {
          copyBtn.innerHTML = origHtml;
          copyBtn.style.borderColor = '';
          copyBtn.style.color = '';
        }, 2000);
        showToast('Path copied!', 'success');
      });
    });
  }

  document.addEventListener('keydown', onKey);
  bindLightboxEvents();
}

async function uploadAssets(fileList) {
  if (demoGuard()) return;
  if (viewerGuard()) return;

  const statusEl = document.getElementById('status-text');
  if (statusEl) statusEl.textContent = `Uploading ${fileList.length} file(s)...`;

  const formData = new FormData();
  for (const file of fileList) {
    formData.append('file[]', file);
  }

  const token = store.get('sessionToken');
  const headers = token ? { 'X-VS-Token': token } : {};

  try {
    const resp = await fetch('/_studio/api/router.php?_path=%2Fassets%2Fupload', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
      headers,
    });
    const result = await resp.json();
    if (result.ok) {
      const count = result.data?.uploaded?.length || 0;
      showToast(`${count} file(s) uploaded.`, 'success');
      if (statusEl) statusEl.textContent = `✓ ${count} file(s) uploaded`;
    } else {
      const msg = result.error?.message || 'Upload failed';
      showToast(msg, 'error');
      if (statusEl) statusEl.textContent = '✗ ' + msg;
    }
    if (statusEl) setTimeout(() => { if (statusEl) statusEl.textContent = 'Ready'; }, 4000);
  } catch (e) {
    showToast('Upload failed.', 'error');
    if (statusEl) {
      statusEl.textContent = '✗ Upload failed';
      setTimeout(() => { if (statusEl) statusEl.textContent = 'Ready'; }, 4000);
    }
  }
}

