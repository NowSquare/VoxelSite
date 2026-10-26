import assert from 'node:assert/strict';
import { test } from 'node:test';

globalThis.localStorage = { getItem: () => null, setItem() {} };
const statuses = [];
globalThis.window = { __vsSetGlobalStatus: value => statuses.push(value) };
const { api, apiStream } = await import('../ui/api.js');
const { store } = await import('../ui/state.js');

for (const [label, status, body, code] of [
  ['empty server failure', 500, '', 'server_error'],
  ['HTML proxy failure', 502, '<html>private/path secret</html>', 'server_error'],
  ['invalid successful response', 200, '<html>Sign in</html>', 'invalid_response'],
  ['JSON null', 200, 'null', 'invalid_response'],
  ['JSON array', 200, '[]', 'invalid_response'],
  ['HTTP failure with misleading success payload', 500, '{"ok":true,"data":{}}', 'server_error'],
]) {
  test(label + ' is not reported as a connection failure', async () => {
    statuses.length = 0;
    globalThis.fetch = async () => new Response(body, { status });
    const result = await api.post('/pages', {});
    assert.equal(result.ok, false);
    assert.equal(result.error.code, code);
    assert.ok(!result.error.message.includes('secret'));
    assert.deepEqual(statuses, ['saving', 'error']);
  });
}

test('only a failed fetch produces the connection error', async () => {
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
  assert.equal((await api.get('/pages')).error.code, 'network_error');
});

test('empty unauthorized response still clears the session', async () => {
  store.set('user', { id: 1 });
  globalThis.fetch = async () => new Response('', { status: 401 });
  assert.equal((await api.get('/pages')).error.code, 'unauthorized');
  assert.equal(store.get('user'), null);
});

test('intentional errors retain their details and operation recovery data', async () => {
  const error = { code: 'content_conflict', message: 'Review the current page.' };
  const data = { operation: { status: 'recovery_required' } };
  globalThis.fetch = async () => Response.json({ ok: false, error, data }, { status: 409 });
  assert.deepEqual(await api.post('/pages', {}), { ok: false, error, data });
});

test('successful wrapped and legacy object responses remain compatible', async () => {
  for (const body of [{ ok: true, data: { pages: [] } }, { pages: [] }]) {
    globalThis.fetch = async () => Response.json(body);
    assert.deepEqual(await api.get('/pages'), { ok: true, data: { pages: [] } });
  }
});

test('SSE terminal error remains authoritative without polling', async () => {
  const errors = [];
  globalThis.fetch = async () => new Response('data: {"type":"error","code":"internal_error","message":"Server failure."}\n\n', {
    headers: { 'Content-Type': 'text/event-stream' },
  });
  await apiStream('/ai/prompt', {}, { onError: error => errors.push(error), requireTerminal: true });
  assert.equal(errors.length, 1);
  assert.equal(errors[0].code, 'internal_error');
});
