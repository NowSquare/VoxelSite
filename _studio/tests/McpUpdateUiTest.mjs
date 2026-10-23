import assert from 'node:assert/strict';
import { test } from 'node:test';
import { webcrypto } from 'node:crypto';
import { updateClient } from '../ui/src/update-workspace.js';
function fixture() {
  const values = new Map(), calls = []; let current = 1; let handler = async (path, input) => ({ package_id: 'update_fixture', status: 'staged', next_index: 2, received_bytes: 0 });
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const request = async (path, input) => { calls.push({ path, input: structuredClone(input) }); return { ok: true, data: await handler(path, input) }; };
  const options = { api: { post: request }, runtime: input => request('runtime', input), ownerId: 1, currentOwner: () => current, storage, crypto: webcrypto };
  return { options, client: updateClient(options), calls, values, handler: value => { handler = value; }, owner: value => { current = value; } };
}
test('lost staging acknowledgement retains the exact source and request across reload', async () => {
  const f = fixture(); f.handler(async () => { throw new Error('lost response'); });
  await assert.rejects(f.client.stageLocal('update.zip')); const first = f.calls[0];
  const reloaded = updateClient(f.options); await assert.rejects(reloaded.stageLocal('update.zip')); assert.deepEqual(f.calls[1], first);
  await assert.rejects(reloaded.stageLocal('different.zip')); assert.equal(f.calls.length, 2);
});
test('review identity and digest remain exact through approval and lost activation', async () => {
  const f = fixture(); await f.client.stageLocal('update.zip');
  f.handler(async path => path === '/update/prepare' ? { plan_id: 'admin_fixture', digest: 'a'.repeat(64), review: {} } : {});
  await f.client.review(); const request = f.calls.at(-1).input;
  let lost = true;
  f.handler(async (path, input) => { if (path === '/update/approve') return { plan_id: input.plan_id, digest: input.digest }; if (path === '/update/apply' && lost) { lost = false; throw new Error('lost response'); } if (path === 'runtime') return { operation_id: request.operation_id, status: 'applying', checkpoint: 1 }; return {}; });
  await assert.rejects(f.client.approve()); const writes = f.calls.filter(call => call.path === '/update/approve' || call.path === '/update/apply');
  assert.deepEqual(writes.map(call => call.input), [{ plan_id: 'admin_fixture', digest: 'a'.repeat(64) }, { plan_id: 'admin_fixture', digest: 'a'.repeat(64) }]);
  const reloaded = updateClient(f.options); await reloaded.approve(); assert.equal(f.calls.at(-1).path, 'runtime'); assert.equal(f.calls.filter(call => call.path === '/update/apply').length, 1);
});
test('continuation uses the captured checkpoint and never runs a server loop', async () => {
  const f = fixture(); await f.client.stageLocal('update.zip'); f.handler(async () => ({ operation_id: 'op-request', status: 'applying', checkpoint: 7 })); await f.client.status();
  const before = f.calls.length; await f.client.continue(); assert.equal(f.calls.length, before + 1); assert.equal(f.calls.at(-1).input.checkpoint, 7);
});
test('account changes discard an in-flight update response', async () => {
  const f = fixture(); let finish; f.handler(() => new Promise(resolve => { finish = resolve; })); const pending = f.client.stageGit(); f.owner(2); finish({ package_id: 'private_package' }); await assert.rejects(pending, /account changed/);
  assert(!JSON.stringify([...f.values.values()]).includes('private_package')); assert.throws(() => f.client.state(), /account changed/);
});
test('parallel clicks cannot allocate competing update intents', async () => {
  const f = fixture(); let finish; f.handler(() => new Promise(resolve => { finish = resolve; })); const pending = f.client.stageLocal('a.zip'); await assert.rejects(f.client.stageGit(), /current update request/); finish({ package_id: 'a' }); await pending; assert.equal(f.calls.length, 1);
});
test('bounded uploads hash exact bytes and retain stable chunk identities', async () => {
  const f = fixture(); const bytes = new Uint8Array(262150).fill(41); let received = 0;
  f.handler(async (path, input) => { if (path === '/update/package-begin') return { package_id: 'update_fixture', received_bytes: received, next_index: 0 }; received += Buffer.from(input.data_base64, 'base64').length; return { package_id: 'update_fixture', received_bytes: received, next_index: 0 }; });
  await f.client.stageFile({ name: 'update.zip', size: bytes.length, arrayBuffer: async () => bytes.buffer });
  const chunks = f.calls.filter(call => call.path === '/update/package-chunk'); assert.equal(chunks.length, 2); assert.deepEqual(chunks.map(call => call.input.offset), [0, 262144]); assert.match(chunks[0].input.sha256, /^[a-f0-9]{64}$/);
  assert(!JSON.stringify([...f.values.values()]).includes('data_base64')); await f.client.stageFile({ name: 'update.zip', size: bytes.length, arrayBuffer: async () => bytes.buffer }); assert.equal(f.calls.filter(call => call.path === '/update/package-chunk').length, 2);
});
test('activation cannot be cleared until its terminal outcome is read', async () => {
  const f = fixture(); await f.client.stageLocal('update.zip'); f.handler(async () => ({ plan_id: 'admin_fixture', digest: 'b'.repeat(64) })); await f.client.review(); f.handler(async path => path === '/update/apply' ? { status: 'applying', checkpoint: 1 } : {}); await f.client.approve(); assert.throws(() => f.client.clear(), /finish or recover/);
  f.handler(async () => ({ status: 'succeeded', checkpoint: 2 })); await f.client.status(); f.client.clear(); assert.deepEqual(f.client.state(), {});
});
test('unavailable secure randomness refuses staging before dispatch', async () => {
  const f = fixture(); const client = updateClient({ ...f.options, crypto: {} }); await assert.rejects(client.stageGit(), /Secure request identities/); assert.equal(f.calls.length, 0);
});
