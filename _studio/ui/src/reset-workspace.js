/** Persist identity and public version only; an account switch never reuses another review. */
export async function prepareReviewedReset(account, api, storage, currentAccount) {
  const key = `vs_reset_review:${account}`;
  let pending;
  try { pending = JSON.parse(storage.getItem(key) || 'null'); } catch {}
  if (pending?.plan_id) return api.get(`/site/reset?plan_id=${encodeURIComponent(pending.plan_id)}`);
  if (!pending) {
    const read = await api.get('/site/reset');
    if (!read.ok) return read;
    if (currentAccount() !== account) return { ok: false, error: { code: 'permission_denied', message: 'The signed-in account changed. Open the review again.' } };
    pending = { operation_id: `reset_${crypto.randomUUID().replaceAll('-', '')}`, base_draft_version: read.data.draft_version };
    try { storage.setItem(key, JSON.stringify(pending)); } catch {}
  }
  const response = await api.post('/site/reset/prepare', pending);
  if (response.ok) {
    try { storage.setItem(key, JSON.stringify({ plan_id: response.data.plan_id })); } catch {}
  } else if (['content_conflict', 'review_expired', 'invalid_schema'].includes(response.error?.code)) {
    try { storage.removeItem(key); } catch {}
  }
  return response;
}

/** Exact reviewed identity is reused after a lost response; recovery is always explicit. */
export async function executeReviewedReset(review, post, get) {
  const body = { plan_id: review.plan_id, digest: review.digest, confirm: 'RESET' };
  let response = await post('/site/reset', body);
  if (!response.ok && response.error?.code === 'network_error') {
    response = await get(`/site/reset?operation_id=${encodeURIComponent(review.operation_id)}`);
  }
  if (!response.ok) return response;
  let operation = response.data, steps = 0;
  while (['prepared', 'applying'].includes(operation.status)) {
    if (operation.kind !== 'site.reset' || operation.operation_id !== review.operation_id || ++steps > 100) {
      return { ok: false, error: { code: 'recovery_required', message: 'Inspect the retained reset operation in Connections before continuing.' } };
    }
    const previous = operation.checkpoint;
    response = await post('/site/reset/continue', { operation_id: operation.operation_id, checkpoint: previous });
    if (!response.ok && ['network_error', 'content_conflict'].includes(response.error?.code)) {
      response = await get(`/site/reset?operation_id=${encodeURIComponent(review.operation_id)}`);
    }
    if (!response.ok) return response;
    operation = response.data;
    if (operation.status === 'applying' && operation.checkpoint <= previous) {
      return { ok: false, data: operation, error: { code: 'site_busy', message: 'The reset worker is still active. Retry to read its retained result.' } };
    }
  }
  if (operation.status !== 'succeeded') {
    return { ok: false, data: operation, error: operation.result?.error || { code: 'recovery_required', message: 'The reset needs review in Connections.' } };
  }
  return { ok: true, data: operation };
}
