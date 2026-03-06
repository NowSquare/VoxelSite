/**
 * VoxelSite Studio — Forms View
 *
 * Form list, form detail, submissions list, submission detail panel.
 */

import { api } from '../../api.js';
import { icons } from '../icons.js';
import { escapeHtml, formatRelativeTime } from '../helpers.js';
import { showToast } from '../ui/toasts.js';
import { showConfirmModal, closeModal } from '../ui/modals.js';

const demoGuard = () => window.demoGuard?.() || false;
const viewerGuard = () => window.viewerGuard?.() || false;

/**
 * Status badge color map for form submissions.
 */
const SUBMISSION_STATUS_COLORS = {
  new:      { bg: 'var(--vs-info-dim)',    text: 'var(--vs-info)',     label: 'New' },
  read:     { bg: 'var(--vs-accent-dim)',  text: 'var(--vs-accent)',   label: 'Read' },
  replied:  { bg: 'var(--vs-success-dim)', text: 'var(--vs-success)',  label: 'Replied' },
  archived: { bg: 'var(--vs-bg-raised)',   text: 'var(--vs-text-ghost)', label: 'Archived' },
};

/**
 * Render the Forms list view.
 * Shows all form schemas with submission counts and unread badges.
 */
export function renderFormsView() {
  setTimeout(() => loadForms(), 0);

  return `
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <h1 class="vs-page-title">Forms</h1>
        <p class="vs-page-subtitle">View and manage submissions from your website's forms.</p>
      </div>
      <div id="forms-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading forms...</div>
      </div>
    </div>
  `;
}

async function loadForms() {
  const container = document.getElementById('forms-list');
  if (!container) return;

  const { ok, data } = await api.get('/forms');
  if (!ok || !data) {
    container.innerHTML = `<div class="text-sm text-vs-error py-6">Failed to load forms.</div>`;
    return;
  }

  const forms = data.forms || [];
  if (!forms.length) {
    container.innerHTML = `
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/></svg>
          </div>
          <p class="vs-empty-state-title">No forms yet</p>
          <p class="vs-empty-state-desc">Form entries will appear here when forms on a published website are submitted.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="flex flex-col gap-4">
      ${forms.map(form => `
        <a href="#/forms/${encodeURIComponent(form.id)}" class="vs-form-card" data-form-id="${escapeHtml(form.id)}">
          <div class="vs-form-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/><path d="M8 13h3"/><path d="M8 17h6"/></svg>
          </div>
          <div class="vs-form-card-body">
            <div class="vs-form-card-name">${escapeHtml(form.name)}</div>
            ${form.description ? `<div class="vs-form-card-desc">${escapeHtml(form.description)}</div>` : ''}
            <div class="vs-form-card-meta">
              <span>${form.fields} field${form.fields !== 1 ? 's' : ''}</span>
              <span class="vs-form-card-dot">·</span>
              <span>${form.total} submission${form.total !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div class="vs-form-card-right">
            ${form.unread > 0 ? `<span class="vs-form-unread-badge">${form.unread}</span>` : ''}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="vs-form-card-chevron"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </a>
      `).join('')}
    </div>
  `;
}

/**
 * Render the form detail view with submissions list.
 */
export function renderFormDetailView(formId) {
  setTimeout(() => loadFormDetail(formId), 0);

  return `
    <div>
      <div id="form-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading form...</div>
      </div>
      <div id="form-submissions">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading submissions...</div>
      </div>
    </div>
  `;
}

async function loadFormDetail(formId) {
  const headerEl = document.getElementById('form-detail-header');
  const subsEl   = document.getElementById('form-submissions');
  if (!headerEl) return;

  // Load form details
  const { ok: formOk, data: formData } = await api.get(`/forms/${encodeURIComponent(formId)}`);
  if (!formOk || !formData) {
    headerEl.innerHTML = `<div class="text-sm text-vs-error py-6">Form not found.</div>`;
    if (subsEl) subsEl.innerHTML = '';
    return;
  }

  const form = formData.form;
  const stats = formData.stats;

  // Render header with breadcrumb and stats
  headerEl.innerHTML = `
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/forms" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Forms</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${escapeHtml(form.name || formId)}</span>
      </div>
      <h1 class="vs-page-title">${escapeHtml(form.name || formId)}</h1>
      ${form.description ? `<p class="vs-page-subtitle">${escapeHtml(form.description)}</p>` : ''}
    </div>

    <div class="vs-form-stats-row">
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${stats.total}</span>
        <span class="vs-form-stat-label">Total</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${stats.new || 0}</span>
        <span class="vs-form-stat-label">New</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-accent)">${stats.read || 0}</span>
        <span class="vs-form-stat-label">Read</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-success)">${stats.replied || 0}</span>
        <span class="vs-form-stat-label">Replied</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-text-ghost)">${stats.archived || 0}</span>
        <span class="vs-form-stat-label">Archived</span>
      </div>
    </div>

    <div class="vs-form-filter-bar">
      <div class="flex items-center gap-2 flex-wrap">
        <select id="form-filter-status" class="vs-input vs-input-compact">
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
        <select id="form-filter-source" class="vs-input vs-input-compact">
          <option value="all">All sources</option>
          <option value="web">Web</option>
          <option value="mcp">MCP / Agent</option>
        </select>
        <input type="text" id="form-filter-search" class="vs-input vs-input-compact" placeholder="Search submissions..." style="min-width: 180px;" />
      </div>
      <div class="flex items-center gap-2">
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-upgrade-to-action" title="Convert this form into an agent action">
          ${icons.zap} Upgrade to Action
        </button>
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-export-csv" ${stats.total === 0 ? 'disabled style="opacity:0.4;pointer-events:none;"' : ''} title="${stats.total === 0 ? 'No submissions to export' : 'Download submissions as CSV'}">
          ${icons.download} Export CSV
        </button>
      </div>
    </div>
  `;

  // Bind filters
  const statusFilter = document.getElementById('form-filter-status');
  const sourceFilter = document.getElementById('form-filter-source');
  const searchInput  = document.getElementById('form-filter-search');

  let searchDebounce = null;
  const reload = () => loadFormSubmissions(formId, 1);

  statusFilter?.addEventListener('change', reload);
  sourceFilter?.addEventListener('change', reload);
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(reload, 300);
  });

  // Bind Export CSV button (proper file download via fetch)
  document.getElementById('btn-export-csv')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-export-csv');
    const origHTML = btn.innerHTML;
    btn.innerHTML = `${icons.loader} Exporting...`;
    btn.disabled = true;
    try {
      const resp = await fetch(`/_studio/api/router.php?_path=${encodeURIComponent('/forms/' + formId + '/submissions/export')}`, {
        credentials: 'same-origin',
      });
      if (!resp.ok) throw new Error('Export failed');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formId}_submissions_${new Date().toISOString().slice(0, 10)}.csv`;
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

  // Bind "Upgrade to Action" button
  document.getElementById('btn-upgrade-to-action')?.addEventListener('click', async () => {
    if (demoGuard()) return;
    if (viewerGuard()) return;

    // Confirm before converting
    const fieldCount = (form.fields || []).length;
    const confirmed = await showConfirmModal({
      title: 'Upgrade to Agent Action',
      description: `This will create a new agent action with${fieldCount > 0 ? ` the ${fieldCount} field${fieldCount !== 1 ? 's' : ''} from` : ''} this form. It starts as a draft so you can review before going live. Your original form stays unchanged.`,
      confirmLabel: 'Create Action',
    });
    if (!confirmed) return;

    const btn = document.getElementById('btn-upgrade-to-action');
    const origHTML = btn.innerHTML;
    btn.innerHTML = `${icons.loader} Converting...`;
    btn.disabled = true;
    btn.style.opacity = '0.6';

    try {
      // Field type mapping: form → action (direct for most types)
      const FORM_TO_ACTION_TYPE = {
        text: 'text', email: 'email', number: 'number',
        select: 'select', date: 'date', textarea: 'textarea',
        tel: 'tel', url: 'url', checkbox: 'checkbox',
        radio: 'radio', hidden: 'hidden',
      };

      // Map form fields → action fields
      const actionFields = [];
      let skippedFiles = 0;

      (form.fields || []).forEach(f => {
        const actionType = FORM_TO_ACTION_TYPE[f.type];
        if (!actionType) {
          // Unsupported type (e.g. file) — skip with count
          skippedFiles++;
          return;
        }

        const actionField = {
          name: f.name,
          label: f.label || f.name,
          type: actionType,
          required: f.required || false,
        };

        // Carry over options for select/radio
        if ((actionType === 'select' || actionType === 'radio') && f.options) {
          actionField.options = f.options;
        }

        // Carry over placeholder
        if (f.placeholder) {
          actionField.placeholder = f.placeholder;
        }

        actionFields.push(actionField);
      });

      if (skippedFiles > 0) {
        showToast(`${skippedFiles} file upload field(s) skipped — actions don't support file uploads.`, 'warning');
      }

      // Build the action definition from the form
      // Append short suffix to avoid collisions if upgrading the same form twice
      const actionSlug = formId.replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const suffix = Date.now().toString(36).slice(-4);
      const actionDef = {
        id: actionSlug + '-' + suffix,
        name: form.name || formId,
        description: form.description || `Converted from form: ${formId}`,
        category: 'general',
        icon: 'circle',
        active: false, // Start as draft so the owner can review
        fields: actionFields,
        responses: {
          success: 'Thank you! Your submission has been received. Your confirmation code is {confirmation_code}.',
        },
      };

      const { ok: createOk, data: createData } = await api.post('/agentic/actions', actionDef);
      if (createOk && createData?.action) {
        showToast(`"${createData.action.name}" created as agent action`, 'success');
        window.location.hash = `#/actions/${createData.action.id}`;
      } else {
        // Show helpful message for duplicate/conflict errors
        const errCode = createData?.error?.code || '';
        const errMsg = (errCode === 'already_exists')
          ? 'An action based on this form already exists. Check the Actions tab.'
          : (createData?.error?.message || 'Failed to create action');
        showToast(errMsg, 'error');
        btn.innerHTML = origHTML;
        btn.disabled = false;
        btn.style.opacity = '';
      }
    } catch (err) {
      showToast('Failed to convert form to action', 'error');
      btn.innerHTML = origHTML;
      btn.disabled = false;
      btn.style.opacity = '';
    }
  });

  // Load initial submissions
  await loadFormSubmissions(formId, 1);
}

async function loadFormSubmissions(formId, page = 1) {
  const container = document.getElementById('form-submissions');
  if (!container) return;

  const status = document.getElementById('form-filter-status')?.value || 'all';
  const source = document.getElementById('form-filter-source')?.value || 'all';
  const search = document.getElementById('form-filter-search')?.value || '';

  let url = `/forms/${encodeURIComponent(formId)}/submissions?page=${page}&per_page=20`;
  if (status !== 'all') url += `&status=${encodeURIComponent(status)}`;
  if (source !== 'all') url += `&source=${encodeURIComponent(source)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const { ok, data } = await api.get(url);
  if (!ok || !data) {
    container.innerHTML = `<div class="text-sm text-vs-error py-4">Failed to load submissions.</div>`;
    return;
  }

  const submissions = data.submissions || [];
  const total = data.total || 0;
  const perPage = data.per_page || 20;
  const totalPages = Math.ceil(total / perPage);

  if (!submissions.length) {
    container.innerHTML = `
      <div class="vs-empty-state" style="min-height: 200px;">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <p class="vs-empty-state-title">No submissions yet</p>
          <p class="vs-empty-state-desc">Form submissions will appear here once visitors start using your forms.</p>
        </div>
      </div>
    `;
    return;
  }

  // Load the form schema so we can map field names to labels
  const { data: fData } = await api.get(`/forms/${encodeURIComponent(formId)}`);
  const formSchema = fData?.form;
  const fieldLabels = {};
  if (formSchema?.fields) {
    formSchema.fields.forEach(f => { fieldLabels[f.name] = f.label || f.name; });
  }

  container.innerHTML = `
    <div class="flex flex-col gap-4" id="submissions-list">
      ${submissions.map(sub => {
        const statusConf = SUBMISSION_STATUS_COLORS[sub.status] || SUBMISSION_STATUS_COLORS.new;
        // Extract preview fields: show first 2-3 meaningful data fields
        const previewFields = Object.entries(sub.data || {})
          .filter(([k]) => !k.startsWith('_'))
          .slice(0, 3)
          .map(([k, v]) => {
            const label = fieldLabels[k] || k;
            const val = Array.isArray(v) ? v.join(', ') : String(v);
            return `<span class="vs-sub-field"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(val.substring(0, 80))}${val.length > 80 ? '…' : ''}</span>`;
          }).join('');

        const timeAgo = formatRelativeTime(sub.created_at);
        const isMcp = sub.source === 'mcp';

        return `
          <div class="vs-submission-card" data-sub-id="${sub.id}" data-form-id="${escapeHtml(formId)}" style="border-left-color: ${statusConf.text};">
            <div class="vs-submission-header">
              <div class="flex items-center gap-2">
                <span class="vs-status-pill" style="background: ${statusConf.bg}; color: ${statusConf.text};">${statusConf.label}</span>
                ${isMcp ? '<span class="vs-mcp-badge">MCP</span>' : ''}
              </div>
              <span class="vs-submission-time">${escapeHtml(timeAgo)}</span>
            </div>
            <div class="vs-submission-preview">
              ${previewFields || '<span class="text-vs-text-ghost text-xs">No data</span>'}
            </div>
            <div class="vs-submission-actions">
              <button class="vs-btn-ghost vs-btn-sm vs-sub-view-btn" data-sub-id="${sub.id}" title="View details">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
              <select class="vs-sub-status-select vs-input-compact" data-sub-id="${sub.id}" style="font-size: 11px; height: 26px; padding: 2px 8px;">
                ${Object.entries(SUBMISSION_STATUS_COLORS).map(([key, conf]) =>
                  `<option value="${key}" ${sub.status === key ? 'selected' : ''}>${conf.label}</option>`
                ).join('')}
              </select>
              <button class="vs-btn-ghost vs-btn-sm vs-sub-delete-btn" data-sub-id="${sub.id}" title="Delete submission" style="color: var(--vs-text-ghost);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    ${totalPages > 1 ? `
      <div class="vs-pagination">
        ${page > 1 ? `<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${page - 1}" data-form-id="${escapeHtml(formId)}">← Previous</button>` : '<span></span>'}
        <span class="text-xs text-vs-text-ghost">Page ${page} of ${totalPages} · ${total} submission${total !== 1 ? 's' : ''}</span>
        ${page < totalPages ? `<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${page + 1}" data-form-id="${escapeHtml(formId)}">Next →</button>` : '<span></span>'}
      </div>
    ` : `
      <div class="text-center py-3">
        <span class="text-xs text-vs-text-ghost">${total} submission${total !== 1 ? 's' : ''}</span>
      </div>
    `}
  `;

  // Bind submission events
  bindSubmissionEvents(formId, page);
}

function bindSubmissionEvents(formId, currentPage) {
  // View buttons → open detail panel
  document.querySelectorAll('.vs-sub-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const subId = btn.dataset.subId;
      openSubmissionDetail(formId, subId);
    });
  });

  // Status selects → update status inline
  document.querySelectorAll('.vs-sub-status-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      const subId = sel.dataset.subId;
      const { ok } = await api.put(`/forms/${encodeURIComponent(formId)}/submissions/${subId}`, { status: sel.value });
      if (ok) {
        showToast('Status updated', 'success');
        // Refresh the card's left border color
        const card = sel.closest('.vs-submission-card');
        const conf = SUBMISSION_STATUS_COLORS[sel.value];
        if (card && conf) {
          card.style.borderLeftColor = conf.text;
          const pill = card.querySelector('.vs-status-pill');
          if (pill) {
            pill.style.background = conf.bg;
            pill.style.color = conf.text;
            pill.textContent = conf.label;
          }
        }
      } else {
        showToast('Failed to update status', 'error');
      }
    });
  });

  // Delete buttons
  document.querySelectorAll('.vs-sub-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const subId = btn.dataset.subId;
      const confirmed = await showConfirmModal({
        title: 'Delete Submission',
        description: 'This submission will be permanently deleted.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;

      const { ok } = await api.delete(`/forms/${encodeURIComponent(formId)}/submissions/${subId}`);
      if (ok) {
        showToast('Submission deleted', 'success');
        loadFormSubmissions(formId, currentPage);
      } else {
        showToast('Failed to delete submission', 'error');
      }
    });
  });

  // Pagination
  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pg = parseInt(btn.dataset.page);
      loadFormSubmissions(formId, pg);
    });
  });

  // Card click (anywhere except buttons/selects) → view detail
  document.querySelectorAll('.vs-submission-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('select')) return;
      const subId = card.dataset.subId;
      openSubmissionDetail(formId, subId);
    });
  });
}

/**
 * Open the slide-in panel showing full submission details.
 */
async function openSubmissionDetail(formId, subId) {
  // Remove existing panel
  document.getElementById('submission-detail-overlay')?.remove();

  // Find the submission data from the DOM cards
  // We re-fetch to get the latest data
  const { ok, data } = await api.get(`/forms/${encodeURIComponent(formId)}/submissions?page=1&per_page=1000`);
  if (!ok || !data) return;

  const sub = (data.submissions || []).find(s => String(s.id) === String(subId));
  if (!sub) {
    showToast('Submission not found', 'error');
    return;
  }

  // Load field labels
  const { data: fData } = await api.get(`/forms/${encodeURIComponent(formId)}`);
  const formSchema = fData?.form;
  const fieldLabels = {};
  if (formSchema?.fields) {
    formSchema.fields.forEach(f => { fieldLabels[f.name] = f.label || f.name; });
  }

  // Auto-mark as read if new
  if (sub.status === 'new') {
    await api.put(`/forms/${encodeURIComponent(formId)}/submissions/${subId}`, { status: 'read' });
    sub.status = 'read';
    // Update inline status in the list
    const sel = document.querySelector(`.vs-sub-status-select[data-sub-id="${subId}"]`);
    if (sel) sel.value = 'read';
    const card = document.querySelector(`.vs-submission-card[data-sub-id="${subId}"]`);
    if (card) {
      card.style.borderLeftColor = SUBMISSION_STATUS_COLORS.read.text;
      const pill = card.querySelector('.vs-status-pill');
      if (pill) {
        pill.style.background = SUBMISSION_STATUS_COLORS.read.bg;
        pill.style.color = SUBMISSION_STATUS_COLORS.read.text;
        pill.textContent = 'Read';
      }
    }
  }

  const statusConf = SUBMISSION_STATUS_COLORS[sub.status] || SUBMISSION_STATUS_COLORS.new;

  const overlay = document.createElement('div');
  overlay.id = 'submission-detail-overlay';
  overlay.className = 'vs-slide-overlay';
  overlay.innerHTML = `
    <div class="vs-slide-panel" id="submission-detail-panel">
      <div class="vs-slide-panel-header">
        <h2 class="text-md font-semibold text-vs-text-primary">Submission #${sub.id}</h2>
        <button id="close-sub-detail" class="vs-btn-ghost vs-btn-icon" title="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div class="vs-slide-panel-body">
        <div class="vs-sub-detail-meta">
          <div class="vs-sub-detail-row">
            <span class="vs-sub-detail-label">Status</span>
            <span class="vs-status-pill" style="background: ${statusConf.bg}; color: ${statusConf.text};">${statusConf.label}</span>
          </div>
          <div class="vs-sub-detail-row">
            <span class="vs-sub-detail-label">Source</span>
            <span class="text-sm text-vs-text-primary">${sub.source === 'mcp' ? 'MCP / Agent' : 'Web Form'}</span>
          </div>
          <div class="vs-sub-detail-row">
            <span class="vs-sub-detail-label">Submitted</span>
            <span class="text-sm text-vs-text-primary">${new Date(sub.created_at).toLocaleString()}</span>
          </div>
          ${sub.ip_address ? `
            <div class="vs-sub-detail-row">
              <span class="vs-sub-detail-label">IP Address</span>
              <span class="text-sm text-vs-text-tertiary font-mono">${escapeHtml(sub.ip_address)}</span>
            </div>
          ` : ''}
          ${sub.referrer ? `
            <div class="vs-sub-detail-row">
              <span class="vs-sub-detail-label">Referrer</span>
              <span class="text-sm text-vs-text-tertiary" style="word-break: break-all;">${escapeHtml(sub.referrer)}</span>
            </div>
          ` : ''}
        </div>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Submitted Data</h3>
        <div class="vs-sub-detail-fields">
          ${Object.entries(sub.data || {}).filter(([k]) => !k.startsWith('_')).map(([key, value]) => {
            const label = fieldLabels[key] || key;
            const displayVal = Array.isArray(value) ? value.join(', ') : String(value);
            return `
              <div class="vs-sub-detail-field">
                <div class="vs-sub-detail-field-label">${escapeHtml(label)}</div>
                <div class="vs-sub-detail-field-value">${escapeHtml(displayVal)}</div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Internal Notes</h3>
        <textarea id="sub-detail-notes" class="vs-input" style="min-height: 80px; resize: vertical;" placeholder="Add private notes about this submission...">${escapeHtml(sub.notes || '')}</textarea>
        <button id="btn-save-sub-notes" class="vs-btn vs-btn-secondary vs-btn-sm" style="margin-top: 8px;">Save Notes</button>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Change Status</h3>
        <select id="sub-detail-status" class="vs-input">
          ${Object.entries(SUBMISSION_STATUS_COLORS).map(([key, conf]) =>
            `<option value="${key}" ${sub.status === key ? 'selected' : ''}>${conf.label}</option>`
          ).join('')}
        </select>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
  });

  // Bind events
  const closePanel = () => {
    overlay.classList.remove('is-visible');
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });
  document.getElementById('close-sub-detail')?.addEventListener('click', closePanel);

  // Save notes
  document.getElementById('btn-save-sub-notes')?.addEventListener('click', async () => {
    const notes = document.getElementById('sub-detail-notes')?.value || '';
    const { ok } = await api.put(`/forms/${encodeURIComponent(formId)}/submissions/${subId}`, { notes });
    showToast(ok ? 'Notes saved' : 'Failed to save notes', ok ? 'success' : 'error');
  });

  // Status change from detail panel
  document.getElementById('sub-detail-status')?.addEventListener('change', async (e) => {
    const newStatus = e.target.value;
    const { ok } = await api.put(`/forms/${encodeURIComponent(formId)}/submissions/${subId}`, { status: newStatus });
    if (ok) {
      showToast('Status updated', 'success');
      // Update the list card too
      const sel = document.querySelector(`.vs-sub-status-select[data-sub-id="${subId}"]`);
      if (sel) sel.value = newStatus;
      const card = document.querySelector(`.vs-submission-card[data-sub-id="${subId}"]`);
      const conf = SUBMISSION_STATUS_COLORS[newStatus];
      if (card && conf) {
        card.style.borderLeftColor = conf.text;
        const pill = card.querySelector('.vs-status-pill');
        if (pill) {
          pill.style.background = conf.bg;
          pill.style.color = conf.text;
          pill.textContent = conf.label;
        }
      }
    } else {
      showToast('Failed to update status', 'error');
    }
  });
}
