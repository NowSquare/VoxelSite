import assert from 'node:assert/strict';
import { test } from 'node:test';
import { webcrypto, createHash } from 'node:crypto';
import { downloadReviewedExport, pendingExport } from '../ui/src/export-workspace.js';
globalThis.crypto ??= webcrypto;
const version = `release_${'a'.repeat(32)}`, newer = `release_${'b'.repeat(32)}`;
const storage = () => { const map = new Map(); return { map, getItem: key => map.get(key), setItem: (key,value) => map.set(key,value), removeItem: key => map.delete(key) }; };
const response = (input, valid = true) => {
  const body = 'retained archive bytes';
  return new Response(body, { status: 200, headers: {
    'X-Content-SHA256': valid ? createHash('sha256').update(body).digest('hex') : 'invalid',
    'X-VoxelSite-Export-Version': input.version, 'Content-Disposition': 'attachment; filename="site.zip"',
  } });
};
test('Lost download response keeps the original operation and published version across reload', async () => {
  const store=storage(), calls=[];
  await assert.rejects(downloadReviewedExport('php',version,7,async input => { calls.push(input); throw new Error('lost response'); },store,()=>7));
  const retained=pendingExport('php',7,store);
  const result=await downloadReviewedExport('php',newer,7,async input => { calls.push(input); return response(input); },store,()=>7);
  assert.deepEqual(calls[1],calls[0]); assert.equal(retained.version,version);
  assert.equal(result.ok,true); assert.equal(result.data.filename,'site.zip'); assert.equal(store.map.size,0);
});
test('Incomplete download remains retryable without accepting bytes', async () => {
  const store=storage();
  const result=await downloadReviewedExport('html',version,7,async input=>response(input,false),store,()=>7);
  assert.equal(result.error.code,'download_incomplete'); assert.ok(pendingExport('html',7,store));
  assert.equal([...store.map.values()].join('').includes('retained archive bytes'),false);
});
test('Account changes prevent dispatch and prevent delivering a completed archive', async () => {
  const store=storage();
  const result=await downloadReviewedExport('php',version,7,()=>assert.fail(),store,()=>8);
  assert.equal(result.error.code,'permission_denied');
  let account=7;
  const completed=await downloadReviewedExport('php',version,7,async input=>{ account=8; return response(input); },store,()=>account);
  assert.equal(completed.error.code,'permission_denied'); assert.ok(pendingExport('php',7,store));
});
test('Expired archive clears its retry identity and asks for a fresh review', async () => {
  const store=storage();
  const result=await downloadReviewedExport('php',version,7,async ()=>new Response(JSON.stringify({error:{code:'export_expired',message:'Open Download again.'}}),{status:409}),store,()=>7);
  assert.equal(result.error.code,'export_expired'); assert.equal(store.map.size,0);
});
