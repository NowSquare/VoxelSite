import { api, apiOperation } from '../../../api.js';

const PENDING_KEY = 'vs-sc-pending-mutation';

export function getPendingMutation() {
  try {
    const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null');
    return pending && /^[a-f0-9]{32}$/.test(pending.id) ? pending : null;
  } catch { return null; }
}

function createMutationId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), value => value.toString(16).padStart(2, '0')).join('');
}

function unpackResponse(response) {
  if (typeof response === 'string') {
    try { response = JSON.parse(response); } catch { return null; }
  }
  if (response?.ok === true) return { ok: true, data: response.data || response };
  if (response?.ok === false) return { ok: false, error: response.error || { message: 'The mutation failed.' } };
  return null;
}

/** Save a stable request ID before the write; uncertain results are read back. */
export async function siteMutation(route, body, options = {}) {
  if (getPendingMutation()) return recoverSiteMutation(options);
  const pending = { id: (options.createId || createMutationId)(), kind: 'shared', route, body };
  try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending)); }
  catch { return { ok: false, error: { code: 'recovery_unavailable', message: 'Your browser could not save the recovery identifier. Enable session storage, then try again.' } }; }
  return resumeSharedMutation(pending, options);
}
async function resumeSharedMutation(pending, options = {}) {
  const response = await (options.operation || apiOperation)(pending.route, pending.body);
  if (response.ok || ['invalid_schema','invalid_path','content_conflict','idempotency_conflict','permission_denied','review_expired'].includes(response.error?.code)
      || ['succeeded','failed_restored','expired','cancelled'].includes(response.data?.operation?.status)) {
    sessionStorage.removeItem(PENDING_KEY);
    return response;
  }
  return { ...response, ok: false, error: { ...response.error, outcome_unknown: true,
    message: response.error?.message || 'This operation is still retained. Retry to read or continue the same request.' } };
}

/** New requests resume the same retained operation; old requests only read their legacy journal. */
export async function recoverSiteMutation({
  read = path => api.get(path, { silent: true }),
  pause = () => new Promise(resolve => setTimeout(resolve, 1000)),
  attempts = 15,
  operation = apiOperation,
} = {}) {
  const pending = getPendingMutation();
  if (!pending) return { ok: false, error: { code: 'no_pending_mutation', message: 'No Site mutation needs recovery.' } };
  if (pending.kind === 'shared') return resumeSharedMutation(pending, { operation });
  let latest = {};
  for (let attempt = 0; attempt < attempts; attempt++) {
    const response = await read('/site-control/mutations/' + pending.id);
    if (response.ok && response.data) {
      latest = response.data;
      if (['complete', 'applied', 'failed'].includes(latest.status)) {
        const result = unpackResponse(latest.response) || { ok: false, error: { code: 'mutation_failed', message: 'The mutation failed. Review the restoration details before continuing.' } };
        if (!result.ok) result.error = { ...result.error, restored: result.error.restored ?? latest.restored ?? null, snapshotId: result.error.snapshotId || latest.snapshotId || null };
        if (result.error?.recovery_resolved && result.error.recovery_note) result.error.message = result.error.recovery_note;
        sessionStorage.removeItem(PENDING_KEY);
        globalThis.window?.__vsSetGlobalStatus?.(result.ok ? 'saved' : 'error');
        return result;
      }
    }
    if (attempt + 1 < attempts) await pause();
  }
  const updated = { ...pending, snapshotId: latest.snapshotId || pending.snapshotId || null };
  try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(updated)); } catch { /* the original identifier remains available */ }
  return { ok: false, error: {
    code: 'mutation_unconfirmed', message: 'The server has not confirmed this change. Check the result before editing or retrying.',
    outcome_unknown: true, mutation_id: pending.id, snapshotId: updated.snapshotId, restored: null,
  } };
}
