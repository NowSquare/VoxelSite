import assert from 'node:assert/strict';
import { test } from 'node:test';
import { webcrypto } from 'node:crypto';
import { uploadReviewedAssets } from '../ui/src/asset-workspace.js';
globalThis.crypto ??= webcrypto;
const file = (name, body) => ({ name, size: body.length, arrayBuffer: async () => new TextEncoder().encode(body).buffer });
const storage = () => { const map = new Map(); return { map, getItem: key => map.get(key), setItem: (key,value) => map.set(key,value), removeItem: key => map.delete(key) }; };
test('Batch upload advances only from its own committed draft version', async () => {
  const calls = [], store = storage();
  const result = await uploadReviewedAssets([file('a.txt','a'),file('b.txt','b')], 'draft:5', 7, async (_, input) => {
    calls.push(input); return { ok: true, data: { operation: { status: 'succeeded', after_version: `draft:${5 + calls.length}` } } };
  }, store, () => 7);
  assert.equal(result.ok, true); assert.deepEqual(calls.map(call => call.base_draft_version), ['draft:5','draft:6']);
  assert.notEqual(calls[0].request_id, calls[1].request_id); assert.equal(store.map.size, 0);
});
test('Lost upload response reuses the same bytes identity and original version', async () => {
  const calls = [], store = storage(), files = [file('a.txt','private file bytes')];
  const send = async (_, input) => { calls.push(input); return calls.length === 1 ? { ok:false,error:{code:'network_error'} } : {ok:true,data:{operation:{status:'succeeded',after_version:'draft:6'}}}; };
  await uploadReviewedAssets(files,'draft:5',7,send,store,()=>7);
  assert.equal([...store.map.values()].join('').includes('private file bytes'),false);
  await uploadReviewedAssets(files,'draft:100',7,send,store,()=>7);
  assert.deepEqual(calls[0],calls[1]);
});
test('A later upload cannot reuse an unresolved identity for different bytes', async () => {
  const store=storage();
  await uploadReviewedAssets([file('a.txt','before')],'draft:5',7,async()=>({ok:false,error:{code:'network_error'}}),store,()=>7);
  const result=await uploadReviewedAssets([file('a.txt','after')],'draft:6',7,()=>assert.fail(),store,()=>7);
  assert.equal(result.error.code,'operation_pending');
});
test('Account change during file hashing prevents dispatch', async () => {
  const result=await uploadReviewedAssets([file('a.txt','a')],'draft:1',7,()=>assert.fail(),storage(),()=>8);
  assert.equal(result.error.code,'permission_denied');
});
