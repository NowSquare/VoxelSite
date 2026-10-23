import assert from 'node:assert/strict';
import { test } from 'node:test';
import { webcrypto } from 'node:crypto';
import { executeReviewedReset, prepareReviewedReset } from '../ui/src/reset-workspace.js';
globalThis.crypto ??= webcrypto;
const review = { plan_id: 'admin_exact', digest: 'exact-digest', operation_id: 'reset_exact' };
const state = (status, checkpoint = 0) => ({ kind: 'site.reset', operation_id: review.operation_id, status, checkpoint });
test('Reset execution submits only the exact displayed review and continues its checkpoint', async () => {
  const calls = [];
  const result = await executeReviewedReset(review, async (path, body) => {
    calls.push({ path, body });
    return { ok: true, data: state(calls.length === 1 ? 'applying' : 'succeeded', calls.length) };
  }, () => assert.fail('No read fallback expected'));
  assert.equal(result.ok, true);
  assert.deepEqual(calls[0].body, { plan_id: review.plan_id, digest: review.digest, confirm: 'RESET' });
  assert.deepEqual(calls[1].body, { operation_id: review.operation_id, checkpoint: 1 });
});
test('A lost reset response is read without submitting a new reset identity', async () => {
  let writes = 0;
  const result = await executeReviewedReset(review, async () => { writes++; return { ok: false, error: { code: 'network_error' } }; },
    async path => { assert.match(path, /operation_id=reset_exact/); return { ok: true, data: state('succeeded', 3) }; });
  assert.equal(writes, 1); assert.equal(result.ok, true);
});
test('Partial failure is never reported as success or automatically recovered', async () => {
  const result = await executeReviewedReset(review, async () => ({ ok: true, data: { ...state('recovery_required'), result: { error: { code: 'content_conflict', message: 'A path changed.' } } } }),
    () => assert.fail('Recovery must be explicit'));
  assert.equal(result.ok, false); assert.equal(result.error.code, 'content_conflict');
});
test('A worker with an unchanged checkpoint is not busy-polled', async () => {
  let calls = 0;
  const result = await executeReviewedReset(review, async () => { calls++; return { ok: true, data: state('applying', 1) }; }, () => assert.fail());
  assert.equal(calls, 2); assert.equal(result.error.code, 'site_busy');
});
test('Reset preparation retains identity and displayed version after lost response', async () => {
  const data = new Map(), requests = [];
  const storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
  const api = { get: async () => ({ ok: true, data: { draft_version: 'draft:9' } }), post: async (path, body) => {
    requests.push(body); return requests.length === 1 ? { ok: false, error: { code: 'network_error' } } : { ok: true, data: review };
  } };
  await prepareReviewedReset(7, api, storage, () => 7);
  api.get = () => assert.fail('A retry must not refresh its version');
  await prepareReviewedReset(7, api, storage, () => 7);
  assert.deepEqual(requests[0], requests[1]); assert.equal(requests[1].base_draft_version, 'draft:9');
  assert.deepEqual(JSON.parse([...data.values()][0]), { plan_id: review.plan_id });
});
test('An account change before preparation blocks dispatch', async () => {
  const storage = { getItem: () => null, setItem: () => assert.fail() };
  const result = await prepareReviewedReset(7, { get: async () => ({ ok: true, data: { draft_version: 'draft:9' } }), post: () => assert.fail() }, storage, () => 8);
  assert.equal(result.error.code, 'permission_denied');
});
