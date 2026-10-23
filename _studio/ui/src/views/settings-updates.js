import { studioUrl, api } from '../../api.js';
import { store } from '../../state.js';
import { escapeHtml } from '../helpers.js';
import { updateClient } from '../update-workspace.js';

export async function bindReviewedUpdates() {
  const zone = document.getElementById('vs-update-zone');
  if (!zone) return;
  const ownerId = store.get('user')?.id;
  if (store.get('user')?.role !== 'owner') { zone.textContent = 'A current owner account is required to review system updates.'; return; }
  const host = document.createElement('div'); host.className = 'mt-4 min-w-0 break-words'; host.setAttribute('aria-live', 'polite'); host.tabIndex = -1; zone.after(host);
  const runtimeUrl = studioUrl('update-runtime.php');
  const client = updateClient({ api, ownerId, currentOwner: () => store.get('user')?.id,
    runtime: async body => {
      const response = await fetch(runtimeUrl, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-VS-Token': store.get('sessionToken') || '' }, body: JSON.stringify(body) });
      return response.json();
    },
  });
  const button = (name, label) => `<button type="button" class="vs-btn vs-btn-primary vs-btn-sm" data-update-action="${name}">${label}</button>`;
  const render = (error = '') => {
    if (store.get('user')?.id !== ownerId) { host.replaceChildren(); return; }
    const state = client.state(); let body = '';
    if (state.operation) {
      const op = state.operation;
      body = `<p><strong>${escapeHtml(op.status === 'succeeded' ? `Updated to v${op.result.to_version}` : `Update: ${op.status.replaceAll('_', ' ')}`)}</strong></p><p class="text-sm">Operation ${escapeHtml(op.operation_id)} · checkpoint ${op.checkpoint}</p>`;
      if (op.status === 'applying' || op.status === 'prepared') body += button('continue', 'Continue update') + ' ' + button('status', 'Refresh status');
      else if (op.status === 'succeeded' || op.status === 'failed_restored') body += button('reload', 'Reload Studio');
      if (op.status === 'recovery_required') body += `<p>${escapeHtml(op.result?.error?.message || 'The retained update needs owner recovery.')}</p><a class="vs-btn vs-btn-ghost vs-btn-sm" href="${escapeHtml(runtimeUrl)}">Open update recovery</a>`;
    } else if (state.activationRequested) body = '<p>The activation response was not acknowledged. Read its retained status before another step.</p>' + button('approve', 'Check activation');
    else if (state.review) {
      const review = state.review.review;
      body = `<p><strong>${escapeHtml(review.summary)}</strong></p><ul>${review.effects.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul><p class="text-sm">${escapeHtml(review.final_boundary)}</p><details class="my-3"><summary>Review exact affected files (${review.files.length})</summary><div class="max-h-64 overflow-auto"><table><thead><tr><th>File</th><th>Before → after</th></tr></thead><tbody>${review.files.map(file => `<tr><td>${escapeHtml(file.path)}</td><td><code>${escapeHtml(file.before_hash || 'absent')} → ${escapeHtml(file.after_hash || 'absent')}</code></td></tr>`).join('')}</tbody></table></div></details><p class="text-xs break-all">Review digest: ${escapeHtml(state.review.digest)}</p>${button('approve', state.approved ? 'Start approved update' : 'Approve and start update')}`;
    } else if (state.package) {
      const pkg = state.package;
      body = `<p><strong>${escapeHtml(pkg.filename)}</strong> · ${escapeHtml(pkg.status)}</p><p class="text-sm">${pkg.next_index} of ${pkg.total_files || '?'} files validated. Website and private data remain preserved.</p>` + (pkg.status === 'staged' ? button('review', 'Review exact update') : button('validate', 'Continue package validation'));
    }
    if (state.source && !state.activationRequested) body += ' ' + button('clear', 'Choose another package');
    host.innerHTML = (error ? `<p role="alert" class="text-vs-error">${escapeHtml(error)}</p>` : '') + body;
  };
  const act = async fn => {
    if (window.demoGuard?.()) return;
    const previousFocus = document.activeElement;
    const previousAction = previousFocus?.dataset?.updateAction;
    host.querySelectorAll('button').forEach(button => { button.disabled = true; });
    try { await fn(); render(); } catch (error) { render(error.message || 'The update request was not acknowledged.'); }
    if (!host.isConnected) return;
    if (!document.activeElement || document.activeElement === document.body || document.activeElement === previousFocus) {
      const controls = [...host.querySelectorAll('button:not([disabled]),a[href]')];
      // Keep repeatable checkpoint controls in place, or continue at the next
      // review step when the previous button was replaced by new state.
      (controls.find(control => control.dataset.updateAction === previousAction) || controls[0] || zone).focus();
    }
  };
  host.addEventListener('click', event => {
    const action = event.target.closest('[data-update-action]')?.dataset.updateAction;
    if (!action) return;
    if (action === 'reload') { location.reload(); return; }
    act(() => client[action]());
  });
  const fileInput = document.getElementById('vs-update-file');
  zone.tabIndex = 0; zone.setAttribute('role', 'button'); zone.setAttribute('aria-label', 'Choose an update ZIP package');
  zone.addEventListener('keydown', event => {
    if (event.target === zone && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault(); if (!window.demoGuard?.()) fileInput?.click();
    }
  });
  zone.addEventListener('click', event => { if (event.target.closest('button,a')) return; if (!window.demoGuard?.()) fileInput.click(); });
  fileInput?.addEventListener('change', () => { const file = fileInput.files?.[0]; fileInput.value = ''; if (file) act(() => client.stageFile(file)); });
  zone.addEventListener('dragover', event => event.preventDefault());
  zone.addEventListener('drop', event => { event.preventDefault(); const file = event.dataTransfer?.files?.[0]; if (file) act(() => client.stageFile(file)); });
  render();
  const [inspection, listing] = await Promise.all([api.get('/update/inspect'), api.get('/update/dist-packages')]);
  if (store.get('user')?.id !== ownerId) return;
  const git = document.getElementById('vs-git-update-card');
  if (git && inspection.ok && inspection.data.git_supported) {
    git.innerHTML = `<div class="vs-settings-card"><h2 class="vs-settings-card-title">Git updates</h2><p class="vs-settings-card-subtitle">Fetch and stage the exact upstream revision for review. Activation preserves website and private files.</p><button type="button" class="vs-btn vs-btn-primary vs-btn-sm">Prepare Git update</button></div>`;
    git.querySelector('button').addEventListener('click', () => act(() => client.stageGit()));
  }
  const dist = document.getElementById('vs-dist-packages');
  if (dist && listing.ok) {
    dist.innerHTML = listing.data.packages.map(pkg => `<div class="flex items-center justify-between gap-3 py-2"><span>${escapeHtml(pkg.filename)} · v${escapeHtml(pkg.version)}</span><button type="button" class="vs-btn vs-btn-primary vs-btn-sm" data-package="${escapeHtml(pkg.filename)}">Prepare review</button></div>`).join('') + `<button type="button" class="vs-btn vs-btn-ghost vs-btn-sm" data-cleanup>Clean expired staging</button>`;
    dist.addEventListener('click', event => { const name = event.target.closest('[data-package]')?.dataset.package; if (name) act(() => client.stageLocal(name)); if (event.target.closest('[data-cleanup]')) act(async () => { const result = await api.post('/update/cleanup', {}); if (!result.ok) throw new Error(result.error.message); }); });
  }
  if (inspection.ok && !inspection.data.runtime_supported) render(inspection.data.message);
}
