import { studioStorageKey } from '../installation-url.js';

const KEY = studioStorageKey('vs_factory_completion_v1');
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const randomHex = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
const terminal = status => ['succeeded', 'failed_restored'].includes(status);

export function factoryClient({ api, endpoint, storage = sessionStorage, request = fetch }) {
  const read = () => { try { return JSON.parse(storage.getItem(KEY) || 'null'); } catch { return null; } };
  const save = value => { storage.setItem(KEY, JSON.stringify(value)); return value; };
  const unpack = result => {
    if (!result?.ok) {
      const error = new Error(result?.error?.message || 'Cleanup has not been verified. Keep this receipt and retry status.');
      error.details = result?.error?.details; throw error;
    }
    return result.data;
  };
  const bridge = async (method, body) => {
    const receipt = read();
    if (!receipt?.plan_id || !receipt?.token) throw new Error('Import the saved Studio completion receipt.');
    const response = await request(endpoint + (method === 'GET' ? `?id=${encodeURIComponent(receipt.plan_id)}` : ''), {
      method, cache: 'no-store', credentials: 'omit',
      headers: { 'X-VS-Reset-Token': receipt.token, ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}) },
      ...(method === 'POST' ? { body: JSON.stringify({ id: receipt.plan_id, ...body }) } : {}),
    });
    const data = unpack(await response.json());
    save({ ...receipt, state: data }); return data;
  };
  return {
    read,
    importReceipt(value) {
      if (!value || !/^factory_[a-f0-9]{32}$/.test(value.plan_id) || !/^[a-f0-9]{64}$/.test(value.token))
        throw new Error('Choose a valid completion receipt file.');
      return save({ plan_id: value.plan_id, token: value.token });
    },
    async prepare() {
      const old = read();
      if (old?.started && !terminal(old.state?.status)) throw new Error('An installation cleanup is already retained. Open its completion screen.');
      const input = old?.pending || { operation_id: `factory-${randomHex().slice(0, 32)}`,
        base_draft_version: unpack(await api.get('/site/reset-install')).draft_version };
      save({ pending: input });
      let plan;
      try { plan = unpack(await api.post('/site/reset-install/prepare', input)); }
      catch (error) {
        if (error.details?.plan_id && error.details?.digest)
          save({ pending: input, plan_id: error.details.plan_id, digest: error.details.digest });
        throw error;
      }
      save({ pending: input, plan_id: plan.plan_id, digest: plan.digest, plan });
      return plan;
    },
    async start() {
      const receipt = read();
      if (!receipt?.plan_id || !receipt?.digest) throw new Error('Prepare and read the exact installation review first.');
      // Persist a fresh capability before sending. A lost response must not lose the only cleanup authority.
      const pending = save({ ...receipt, token: receipt.token || randomHex(), started: true });
      const response = await api.post('/site/reset-install', {
        plan_id: pending.plan_id, digest: pending.digest, confirm: 'RESET INSTALLATION', receipt_token: pending.token,
      });
      if (!response?.ok && ['review_expired', 'invalid_schema', 'permission_denied', 'content_conflict', 'site_busy', 'not_found'].includes(response?.error?.code))
        save({ ...pending, started: false });
      const state = unpack(response);
      save({ ...pending, state }); return state;
    },
    async discard() {
      const receipt = read();
      if (!receipt?.plan_id || !receipt.digest || receipt.started) throw new Error('Only an unstarted review can be discarded here.');
      let result;
      for (let step = 0; step < 10; step++) {
        result = unpack(await api.post('/site/reset-install/discard', { plan_id: receipt.plan_id, digest: receipt.digest }));
        if (result.complete) { storage.removeItem(KEY); break; }
      }
      return result;
    },
    status: () => bridge('GET'),
    async advance(action = 'continue', maxSteps = 10) {
      let state = await bridge('GET');
      for (let i = 0; i < maxSteps && (!terminal(state.status) || state.maintenance_active); i++) {
        if (state.status === 'recovery_required' && action !== 'restore') break;
        state = await bridge('POST', { action: i === 0 ? action : 'continue', checkpoint: state.checkpoint });
        if (state.error_code || state.status === 'recovery_required') break;
      }
      return state;
    },
  };
}

export function renderFactoryReview(plan) {
  return `<p>${escape(plan.review.summary)}</p><p>${escape(plan.review.final_boundary)}</p>
    <details><summary>${plan.review.files.length} exact file changes</summary><ul>${plan.review.files.map(file =>
      `<li><code>${escape(file.path)}</code> — ${escape(file.effect)}<br><small>Before: ${escape(file.before_hash || 'Reviewed by table digests / absent')}<br>After: ${escape(file.after_hash || 'absent')}</small></li>`).join('')}</ul></details>
    <details><summary>${plan.review.tables.length} database tables to remove</summary><ul>${plan.review.tables.map(table =>
      `<li>${escape(table.name)} — ${table.rows} rows <code>${escape(table.sha256)}</code></li>`).join('')}</ul></details>
    <details><summary>Preserved</summary><ul>${plan.review.preserved.map(value => `<li>${escape(value)}</li>`).join('')}</ul></details>`;
}

export async function showFactoryResetReview({ api, completionUrl }) {
  const client = factoryClient({ api, endpoint: completionUrl });
  const existing = client.read();
  if (existing?.started && !terminal(existing.state?.status)) { window.location.assign(completionUrl); return; }
  document.getElementById('reset-install-modal-overlay')?.remove();
  const previousFocus = document.activeElement;
  const overlay = document.createElement('div');
  overlay.id = 'reset-install-modal-overlay'; overlay.className = 'vs-modal-overlay is-visible';
  overlay.innerHTML = `<div class="vs-modal" role="dialog" aria-modal="true" aria-labelledby="factory-review-title" style="width:min(680px,calc(100vw - 32px));max-width:680px"><div class="vs-modal-header"><h2 class="vs-modal-title" id="factory-review-title">Review installation removal</h2></div>
    <div class="vs-modal-body" style="max-height:60vh;overflow:auto;overflow-wrap:anywhere"><p id="factory-review-message" role="status">Preparing the exact deletion and preservation sets…</p><div id="factory-review"></div>
    <label class="vs-modal-confirm-label" for="factory-confirm">Type <code>RESET INSTALLATION</code> after reviewing the changes.</label>
    <input id="factory-confirm" class="vs-modal-confirm-input" autocomplete="off" spellcheck="false"></div>
    <div class="vs-modal-footer flex-wrap"><button class="vs-btn vs-btn-secondary" id="factory-close">Cancel</button>
    <button class="vs-btn vs-btn-danger" id="factory-start" disabled>Start reviewed cleanup</button></div></div>`;
  document.body.appendChild(overlay);
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    const ownedFocus = !document.activeElement || document.activeElement === document.body || overlay.contains(document.activeElement);
    overlay.remove();
    const trigger = previousFocus?.isConnected ? previousFocus : previousFocus?.id ? document.getElementById(previousFocus.id) : null;
    if (ownedFocus && trigger?.isConnected) trigger.focus();
  };
  const message = overlay.querySelector('#factory-review-message'), start = overlay.querySelector('#factory-start'), input = overlay.querySelector('#factory-confirm');
  overlay.querySelector('#factory-close').onclick = close;
  overlay.querySelector('#factory-close').focus();
  overlay.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !client.read()?.started) { event.preventDefault(); close(); }
    if (event.key === 'Tab') {
      const controls = [...overlay.querySelectorAll('button:not([disabled]),input:not([disabled]),summary')];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });
  try {
    const plan = await client.prepare(); overlay.querySelector('#factory-review').innerHTML = renderFactoryReview(plan);
    message.textContent = `Review expires ${new Date(plan.expires_at * 1000).toLocaleTimeString()}.`;
    overlay.querySelector('#factory-close').textContent = 'Discard review';
    overlay.querySelector('#factory-close').onclick = async () => {
      try {
        const result = await client.discard();
        if (result.complete) close(); else message.textContent = 'More private staging remains. Select Discard review again to finish.';
      } catch (error) { message.textContent = error.message; }
    };
    input.oninput = () => { start.disabled = plan.status !== 'ready' || input.value !== 'RESET INSTALLATION'; };
    if (plan.status === 'expired') message.textContent = 'This review expired. Discard it before preparing a new one.';
    start.onclick = async () => {
      start.disabled = true; input.disabled = true; message.textContent = 'Retaining the completion receipt and entering maintenance…';
      try { await client.start(); window.location.assign(completionUrl); }
      catch (error) {
        if (client.read()?.started) {
          message.textContent = `${error.message} The receipt is saved in this tab. Open completion to inspect the actual status.`;
          start.textContent = 'Open completion'; start.disabled = false; start.onclick = () => window.location.assign(completionUrl);
        } else {
          message.textContent = `${error.message} Discard this unstarted review and prepare the current installation.`;
        }
      }
    };
  } catch (error) {
    message.textContent = error.message;
    if (client.read()?.plan_id && !client.read()?.started) {
      overlay.querySelector('#factory-close').textContent = 'Discard retained review';
      overlay.querySelector('#factory-close').onclick = async () => {
        try {
          const result = await client.discard();
          if (result.complete) close(); else message.textContent = 'Select Discard retained review again to finish private staging cleanup.';
        } catch (failure) { message.textContent = failure.message; }
      };
    }
  }
}

export async function mountFactoryCompletion({ endpoint, installer }) {
  const client = factoryClient({ endpoint }), message = document.getElementById('factory-message');
  const controls = document.getElementById('factory-controls'), progress = document.getElementById('factory-progress');
  const download = () => {
    const receipt = client.read(); if (!receipt?.token) return;
    const blob = new Blob([JSON.stringify({ plan_id: receipt.plan_id, token: receipt.token })], { type: 'application/json' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'voxelsite-installation-completion.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };
  const show = state => {
    message.textContent = state.message;
    progress.textContent = `State: ${state.status}. Checkpoint ${state.checkpoint}. ${state.files_total} reviewed files.`;
    controls.replaceChildren();
    const button = (label, fn) => { const el = document.createElement('button'); el.className = 'vs-btn vs-btn-secondary'; el.style.minHeight = '44px'; el.textContent = label;
      el.onclick = async () => { el.disabled = true; try { await fn(); } catch (e) { message.textContent = e.message; } finally { el.disabled = false; } }; controls.appendChild(el); };
    button('Save completion receipt', download);
    button('Refresh status', async () => show(await client.status()));
    if ((!terminal(state.status) || state.maintenance_active) && state.status !== 'recovery_required') button('Continue cleanup', async () => show(await client.advance()));
    if (state.can_restore) button('Restore retained originals', async () => show(await client.advance('restore')));
    if (state.status === 'succeeded') button('Open installer', () => window.location.assign(installer));
    if (state.status === 'failed_restored') button('Open Studio', () => window.location.assign(installer.replace(/install\.php$/, '')));
  };
  document.getElementById('factory-import').onchange = async event => {
    try {
      const file = event.target.files[0]; if (!file || file.size > 8192) throw new Error('Choose a completion receipt smaller than 8 KiB.');
      client.importReceipt(JSON.parse(await file.text())); show(await client.status());
    } catch (error) { message.textContent = error.message; }
  };
  try { show(await client.status()); } catch (error) { message.textContent = error.message; }
}
