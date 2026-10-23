import assert from 'node:assert/strict';
import { test } from 'node:test';
import { webcrypto } from 'node:crypto';

const stored = new Map();
globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.sessionStorage = { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key) };
globalThis.window = {};
globalThis.crypto ??= webcrypto;
const { apiOperation, pendingOperationEntries } = await import('../ui/api.js');
const { store } = await import('../ui/state.js');
const response = (status, checkpoint = 0, ok = true) => ({
  status: ok ? 200 : 409,
  json: async () => ({ ok, data: { operation: { status, checkpoint, result: {} } }, error: ok ? null : { code: status, message: 'Retained outcome' } }),
});

test('Lost response preserves the action identity for replay and confirmed success clears it', async () => {
  const ids = [];
  globalThis.fetch = async (_, options) => {
    ids.push(JSON.parse(options.body).operation_id);
    if (ids.length === 1) throw new Error('Connection lost after commit');
    return response('succeeded');
  };
  assert.equal((await apiOperation('/designs', { name: 'Saved' })).error.code, 'network_error');
  assert.equal((await apiOperation('/designs', { name: 'Saved' })).ok, true);
  assert.equal(ids[0], ids[1]);
  assert.equal(stored.has('vs_pending_website:anonymous:post:/designs'), false);
});

test('Explicit checkpoints advance one identity with a bounded loop', async () => {
  const inputs = [];
  globalThis.fetch = async (_, options) => {
    inputs.push(JSON.parse(options.body));
    return response('applying', inputs.length);
  };
  const result = await apiOperation('/revisions/undo');
  assert.equal(inputs.length, 101);
  assert.equal(new Set(inputs.map(input => input.operation_id)).size, 1);
  assert.equal(inputs[1].checkpoint, 1);
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'applying');
  assert.ok(stored.has('vs_pending_website:anonymous:post:/revisions/undo'));
});

test('Recovery-required responses keep operation details and forbid silently starting changed input', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return response('recovery_required', 1, false); };
  const result = await apiOperation('/designs/example/load', { base_draft_version: 'draft:4' });
  assert.equal(result.ok, false);
  assert.equal(result.data.operation.status, 'recovery_required');
  assert.match(result.error.message, /needs recovery/);
  const blocked = await apiOperation('/designs/example/load', { base_draft_version: 'draft:5' });
  assert.equal(blocked.error.code, 'operation_pending');
  assert.equal(calls, 1);
});

test('A restored terminal failure clears the retained identity', async () => {
  globalThis.fetch = async () => response('failed_restored', 1, false);
  const result = await apiOperation('/designs/example', {}, 'delete');
  assert.equal(result.ok, false);
  assert.equal(result.data.operation.status, 'failed_restored');
  assert.equal(stored.has('vs_pending_website:anonymous:delete:/designs/example'), false);
});

test('Concurrent matching calls share their request; changed input waits', async () => {
  let release;
  let calls = 0;
  globalThis.fetch = async () => { calls++; await new Promise(resolve => { release = resolve; }); return response('succeeded'); };
  const first = apiOperation('/designs/new', { name: 'First' });
  const second = apiOperation('/designs/new', { name: 'First' });
  assert.equal(first, second);
  assert.equal((await apiOperation('/designs/new', { name: 'Other' })).error.code, 'operation_pending');
  release();
  assert.equal((await first).ok, true);
  assert.equal(calls, 1);
});

test('Unavailable browser storage still retains an uncertain operation within the open tab', async () => {
  const original = globalThis.sessionStorage;
  globalThis.sessionStorage = { getItem() { throw new Error('Disabled'); }, setItem() { throw new Error('Disabled'); }, removeItem() {} };
  const ids = [];
  globalThis.fetch = async (_, options) => {
    ids.push(JSON.parse(options.body).operation_id);
    if (ids.length === 1) throw new Error('Lost');
    return response('succeeded');
  };
  try {
    await apiOperation('/publish/unpublish');
    assert.equal((await apiOperation('/publish/unpublish')).ok, true);
    assert.equal(ids[0], ids[1]);
  } finally { globalThis.sessionStorage = original; }
});

test('Write-only secrets never enter storage and reload retries the retained identity', async () => {
  const secret = 'fixture-private-password';
  const ids = [];
  globalThis.fetch = async (_, options) => {
    ids.push(JSON.parse(options.body).operation_id);
    if (ids.length === 1) throw new Error('Lost after possible commit');
    return response('succeeded');
  };
  const body = { values: { 'mail.smtp.password': secret }, versions: { mail: 'reviewed-version' } };
  const options = { retainInput: false, publicInput: { versions: body.versions } };
  await apiOperation('/settings/mail', body, 'post', options);
  const saved = stored.get('vs_pending_website:anonymous:post:/settings/mail');
  assert.ok(saved);
  assert.equal(saved.includes(secret), false);
  assert.equal(saved.includes('fingerprint'), false);
  assert.deepEqual(JSON.parse(saved).body, options.publicInput);
  const freshTab = await import(`../ui/api.js?secret-reload=${Date.now()}`);
  assert.equal((await freshTab.apiOperation('/settings/mail', body, 'post', options)).ok, true);
  assert.equal(ids[0], ids[1]);
});
test('Account change stops continuation and keeps pending inputs isolated', async () => {
  const ids=[];
  store.set('user',{id:1});
  globalThis.fetch=async (_,options)=>{
    ids.push(JSON.parse(options.body).operation_id);
    store.set('user',{id:2});
    return response('applying',1);
  };
  const first=await apiOperation('/settings/mcp/connections',{label:'Owner one'});
  assert.equal(first.error.code,'permission_denied'); assert.equal(ids.length,1);
  const { pendingOperationInput }=await import('../ui/api.js');
  assert.equal(pendingOperationInput('/settings/mcp/connections'),null);
  globalThis.fetch=async (_,options)=>{ ids.push(JSON.parse(options.body).operation_id); return response('succeeded'); };
  await apiOperation('/settings/mcp/connections',{label:'Owner two'});
  assert.notEqual(ids[0],ids[1]);
  store.set('user',{id:1});
  assert.equal(pendingOperationInput('/settings/mcp/connections').label,'Owner one');
  store.set('user',null);
});

test('A lost deletion response remains discoverable after its history row disappears', async () => {
  const endpoint = '/snapshots/snapshot_' + 'a'.repeat(32);
  const sent = [];
  globalThis.fetch = async (_, options) => {
    sent.push(JSON.parse(options.body));
    if (sent.length === 1) throw new Error('Response lost after deletion committed');
    return response('succeeded');
  };
  const input = { version: 'b'.repeat(64) };
  assert.equal((await apiOperation(endpoint, input, 'delete')).ok, false);
  assert.deepEqual(pendingOperationEntries('/snapshots/', 'delete'), [{ endpoint, body: input }]);
  store.set('user', { id: 29 });
  assert.deepEqual(pendingOperationEntries('/snapshots/', 'delete'), []);
  store.set('user', null);
  await apiOperation(endpoint, input, 'delete');
  assert.equal(sent[0].operation_id, sent[1].operation_id);
  assert.deepEqual(pendingOperationEntries('/snapshots/', 'delete'), []);
});
