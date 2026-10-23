import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readTeam, teamChange } from '../ui/src/team-workspace.js';
import { webcrypto } from 'node:crypto';
const stored = new Map();
globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.sessionStorage = { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key) };
globalThis.window = {}; globalThis.crypto ??= webcrypto;
const { apiOperation } = await import('../ui/api.js');
const member = { id: 4, version: 'reviewed-version', name: 'Reviewed editor' };
test('Team edits retain the exact captured member version', () => {
  const change = teamChange('update', { name: 'Changed', role: 'viewer' }, member);
  member.version = 'later-version';
  assert.equal(change.body.version, 'reviewed-version');
  assert.equal(change.endpoint, '/team/4'); assert.equal(change.method, 'put');
});
test('Team removal and password reset require an explicitly read member', () => {
  for (const action of ['update','delete','password']) assert.throws(() => teamChange(action, {}), /current team member/);
  assert.equal(teamChange('delete', {}, member).body.version, 'later-version');
  assert.equal(teamChange('password', { password: 'write-only' }, member).endpoint, '/team/4/password');
});
test('Password mutation plans never persist plaintext secrets in browser storage input', () => {
  for (const action of ['create','password']) {
    const change = teamChange(action, { name: 'Editor', email: 'editor@example.invalid', role: 'editor', password: 'private-secret' }, action === 'create' ? null : member);
    assert.equal(change.body.password, 'private-secret'); assert.equal(change.options.retainInput, false);
    assert.equal(JSON.stringify(change.options).includes('private-secret'), false);
  }
});
test('Team list drains all pages using its original pinned inventory version', async () => {
  const calls=[];
  const result=await readTeam(async path => {
    calls.push(path); return { ok:true, data:{members:[{id:calls.length}],inventory_version:'fixed',next_offset:calls.length===1?1:null} };
  });
  assert.deepEqual(result.data.members,[{id:1},{id:2}]); assert.match(calls[1],/inventory_version=fixed/);
});
test('Changed team inventory cannot be merged with earlier page contents', async () => {
  let calls=0;
  const result=await readTeam(async () => ({ok:true,data:{members:[{id:++calls}],inventory_version:calls===1?'before':'after',next_offset:calls===1?1:null}}));
  assert.equal(result.ok,false); assert.equal(result.error.code,'content_conflict');
});
test('The real operation client retains a lost team request identity without storing its password', async () => {
  const sent = [], secret = 'team-fixture-secret';
  globalThis.fetch = async (url, options) => {
    sent.push(JSON.parse(options.body));
    if (sent.length === 1) throw new Error('Lost response after commit');
    return { status: 201, json: async () => ({ ok: true, data: { operation: { status: 'succeeded', result: {} } } }) };
  };
  const change = teamChange('create', { name: 'Fixture', email: 'fixture@example.invalid', password: secret, role: 'editor' });
  assert.equal((await apiOperation(change.endpoint, change.body, change.method, change.options)).ok, false);
  assert.equal([...stored.values()].join('').includes(secret), false);
  assert.equal((await apiOperation(change.endpoint, change.body, change.method, change.options)).ok, true);
  assert.equal(sent[0].operation_id, sent[1].operation_id);
  assert.equal(stored.size, 0);
});
