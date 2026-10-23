import { escapeAttr as escapeHtml } from '../helpers.js';
import { studioStorageKey } from '../../installation-url.js';

/** A lost restore response retains the same review; it never prepares a new job. */
export function recoveryClient(api, ownerId, storage = globalThis.sessionStorage) {
  const key = studioStorageKey(`vs_owner_recovery:${ownerId}`);
  let pending = {};
  try { pending = JSON.parse(storage.getItem(key) || '{}'); } catch {}
  const persist = () => { try { storage.setItem(key, JSON.stringify(pending)); } catch {} };
  return {
    pending: () => ({ ...pending }),
    async review(id) {
      const response = await api.post(`/settings/recovery/${encodeURIComponent(id)}/review`, {});
      if (response.ok) { pending[id] = response.data; persist(); }
      return response;
    },
    async restore(id) {
      const review = pending[id];
      if (!review) return { ok: false, error: { message: 'Review the affected state before restoring it.' } };
      const response = await api.post(`/settings/recovery/${encodeURIComponent(id)}/restore`,
        { review_id: review.review_id, digest: review.digest });
      if (response.ok && ['failed_restored', 'succeeded'].includes(response.data.status)) { delete pending[id]; persist(); }
      return response;
    },
  };
}

export function renderRecovery(items, pending = {}) {
  const byId = new Map(items.map(item => [item.recovery_id, item]));
  for (const [id, review] of Object.entries(pending)) if (!byId.has(id)) byId.set(id, review);
  return `<h2 class="vs-settings-card-title">Interrupted changes</h2>
    <p class="vs-settings-card-subtitle">Review changes that stopped before completion. Restore their original affected files even when the requesting connection has been revoked.</p>
    <div id="recovery-feedback" class="text-sm text-vs-text-secondary mb-3" role="status" aria-live="polite" tabindex="-1"></div>
    ${byId.size ? `<ul>${[...byId.values()].map(item => {
      const id = item.recovery_id; const review = pending[id];
      const actor = item.original_actor || {};
      const mail = (review || item).action === 'acknowledge_delivery';
      return `<li class="py-4 border-b border-vs-border-subtle">
        <p class="text-sm font-medium text-vs-text-primary break-words">${escapeHtml(item.kind)}</p>
        <p class="text-xs text-vs-text-tertiary mt-1 break-words">${escapeHtml(actor.client_name || `Account ${actor.user_id}`)} · ${escapeHtml(item.operation_id)}</p>
        ${item.diagnostic ? `<p class="text-sm text-vs-error mt-2">${escapeHtml(item.diagnostic)}</p>` : ''}
        ${review ? `<div class="mt-3">
          <p class="text-sm text-vs-text-secondary">${mail
            ? 'Acknowledge the retained email outcome. This does not send again or confirm delivery.'
            : 'Restore the exact original files below. This will not resume the interrupted request.'}</p>
          ${review.delivery_intent ? `<p class="text-sm text-vs-text-secondary mt-2">${escapeHtml(review.delivery_intent.recipient)} · ${escapeHtml(review.delivery_intent.delivery_status)}</p>` : ''}
          <details class="text-xs text-vs-text-secondary mt-2" open><summary class="cursor-pointer">Affected paths (${review.paths.length})</summary>
            ${review.paths.length ? `<ul class="max-h-64 overflow-auto mt-2">${review.paths.map(path => `<li class="py-2 break-all">
              ${escapeHtml(path.domain)}/${escapeHtml(path.path)} · ${escapeHtml(path.state)}
              <span class="block text-vs-text-tertiary">Current: ${escapeHtml(path.current_hash || 'absent')}</span>
              <span class="block text-vs-text-tertiary">Restore: ${escapeHtml(path.before_hash || 'absent')}</span>
            </li>`).join('')}</ul>` : '<p class="mt-2">No website files are replaced. Only the retained operation or private capture state is resolved.</p>'}
          </details>
          <button type="button" class="vs-btn vs-btn-primary vs-btn-sm mt-3" data-recovery-restore="${escapeHtml(id)}">${mail ? 'Acknowledge email outcome' : 'Restore original state'}</button>
        </div>` : ''}
        <button type="button" class="vs-btn vs-btn-secondary vs-btn-sm mt-3" data-recovery-review="${escapeHtml(id)}" ${item.eligible ? '' : 'disabled'}>${review ? 'Review current state again' : 'Review recovery'}</button>
      </li>`;
    }).join('')}</ul>` : '<p class="text-sm text-vs-text-secondary">No retained changes need recovery.</p>'}`;
}

export async function bindOwnerRecovery(container, { api, user, client = null }) {
  if (!container) return false;
  if (user?.role !== 'owner') { container.hidden = true; return false; }
  client ||= recoveryClient(api, user.id);
  const response = await api.get('/settings/recovery');
  if (!container.isConnected) return false;
  if (!response.ok) {
    container.innerHTML = `<h2 class="vs-settings-card-title">Interrupted changes</h2>
      <div id="recovery-feedback" class="text-sm text-vs-text-secondary mb-3" role="status" aria-live="polite" tabindex="-1"></div>
      <p class="text-sm text-vs-error" role="alert">${escapeHtml(response.error?.message || 'Recovery could not be loaded.')} Reload Settings to refresh the recovery list.</p>`;
    return false;
  }
  container.innerHTML = renderRecovery(response.data.items, client.pending());
  const feedback = (message, failed = false) => {
    const target = container.querySelector('#recovery-feedback');
    if (!container.isConnected || !target) return;
    target.textContent = message;
    target.classList.toggle('text-vs-error', failed);
  };
  for (const button of container.querySelectorAll('[data-recovery-review], [data-recovery-restore]')) {
    button.addEventListener('click', async () => {
      if (globalThis.window?.demoGuard?.()) return;
      const previousFocus = document.activeElement;
      button.disabled = true;
      try {
        const id = button.dataset.recoveryReview || button.dataset.recoveryRestore;
        const result = button.dataset.recoveryReview ? await client.review(id) : await client.restore(id);
        if (!result.ok) { feedback(result.error?.message || 'The request could not finish. Retry the same review to check its result.', true); return; }
        const refreshed = await bindOwnerRecovery(container, { api, user, client });
        if (!container.isConnected) return;
        const restoreFocus = !document.activeElement || document.activeElement === document.body || document.activeElement === previousFocus;
        if (button.dataset.recoveryRestore) {
          const done = ['failed_restored', 'succeeded'].includes(result.data.status);
          feedback(result.data.acknowledged ? 'Email outcome acknowledged. No message was resent.'
            : done ? 'Original affected state restored. The interrupted request will not resume.'
              : 'Recovery still needs attention. Conflicting files were preserved; review the current state again.', !done);
          if (restoreFocus) container.querySelector('#recovery-feedback')?.focus();
        } else if (restoreFocus) {
          // The review replaced its trigger. Continue at the next decision,
          // without taking focus back if the owner moved elsewhere meanwhile.
          if (refreshed) {
            [...container.querySelectorAll('[data-recovery-restore]')]
              .find(control => control.dataset.recoveryRestore === id)?.focus();
          } else {
            feedback('Recovery review saved. Reload Settings to continue from this review.');
            container.querySelector('#recovery-feedback')?.focus();
          }
        }
      } catch { feedback('The response was lost. Retry this retained review to check its result.', true); }
      finally { if (button.isConnected) button.disabled = false; }
    });
  }
  return true;
}
