import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createBusinessApi } from '../ui/src/business-workspace.js';

const note = (version = 'v1', body = 'saved') => ({ id: 1, title: 'Note', body, version, body_truncated: false });
const card = (version = 'v1') => ({ ...note(version), column_name: 'todo' });
const success = data => ({ ok: true, data });
const conflict = { ok: false, error: { code: 'content_conflict', message: 'Changed elsewhere' } };
const network = { ok: false, error: { code: 'network_error' } };
function fixture(overrides = {}) {
  let serial = 0;
  const calls = [], errors = [];
  const base = {
    get: async path => success(path.startsWith('/cards') ? { card: card(), board_version: 'board1' } : { note: note() }),
    put: async (path, input) => success({ note: { ...note('v2'), ...input } }),
    post: async () => success({ note: note() }),
    delete: async () => success({ note: { ...note('v2'), deleted_at: 'now' } }),
    ...overrides,
  };
  const wrapped = Object.fromEntries(Object.entries(base).map(([method, implementation]) => [method, async (...args) => {
    calls.push([method, ...args]); return implementation(...args);
  }]));
  const api = createBusinessApi(wrapped, { requestId: () => `request-${++serial}`, onError: (...args) => errors.push(args) });
  return { api, calls, errors };
}

test('Studio mutations attach the exact read version and a distinct request identity', async () => {
  const { api, calls } = fixture();
  await api.get('/notes/1'); await api.put('/notes/1', { body: 'edited' });
  assert.equal(calls[1][2].expected_version, 'v1'); assert.equal(calls[1][2].request_id, 'request-1');
  assert.equal(api.hasDirty(), false);
});
test('Summary pagination pins one collection snapshot and opens full note text separately', async () => {
  const { api, calls } = fixture({ get: async path => path.startsWith('/notes/1')
    ? success({ note: note('v1', 'full '.repeat(500)) })
    : success({ notes: [note(path.includes('offset=') ? 'v2' : 'v1', 'summary')], collection_version: 'collection1', next_offset: path.includes('offset=') ? null : 1 }) });
  assert.equal((await api.get('/notes')).data.notes.length, 2);
  assert.match(calls[1][1], /collection_version=collection1/);
  assert.equal((await api.get('/notes/1')).data.note.body.length, 2500);
});
test('A changed page cannot be appended to an earlier collection snapshot', async () => {
  const { api } = fixture({ get: async path => success({ notes: [note()], collection_version: path.includes('offset=') ? 'other' : 'original', next_offset: path.includes('offset=') ? null : 1 }) });
  assert.equal((await api.get('/notes')).ok, false);
});
test('External refresh preserves local text and its original compare-and-swap version', async () => {
  let saved = note();
  const { api, calls } = fixture({ get: async () => success({ note: saved }), put: async () => conflict });
  await api.get('/notes/1'); api.markDraft('notes', 1, { body: 'local' });
  saved = note('v2', 'external');
  const current = await api.get('/notes/1');
  assert.equal(current.data.note.body, 'local'); assert.equal(current.data.note.version, 'v1');
  await api.put('/notes/1', { body: 'local' });
  assert.equal(calls.at(-1)[2].expected_version, 'v1'); assert.equal(api.hasDirty('notes'), true);
});
test('Typing while a successful autosave is in flight survives its response', async () => {
  let release;
  const { api } = fixture({ put: async () => new Promise(resolve => { release = resolve; }) });
  await api.get('/notes/1');
  const save = api.put('/notes/1', { body: 'sent' });
  await Promise.resolve(); await Promise.resolve();
  api.markDraft('notes', 1, { body: 'typed later' });
  release(success({ note: note('v2', 'sent') }));
  const result = await save;
  assert.equal(result.data.note.body, 'typed later'); assert.deepEqual(api.draft('notes', 1), { body: 'typed later' });
});
test('Serialized saves use the preceding successful version without dropping newer edits', async () => {
  const { api, calls } = fixture({ put: async (path, input) => success({ note: note(input.body === 'first' ? 'v2' : 'v3', input.body) }) });
  await api.get('/notes/1');
  await Promise.all([api.put('/notes/1', { body: 'first' }), api.put('/notes/1', { body: 'second' })]);
  assert.equal(calls[1][2].expected_version, 'v1'); assert.equal(calls[2][2].expected_version, 'v2');
  assert.equal(api.hasDirty(), false);
});
test('A lost response retries exactly the same identity and version', async () => {
  let writes = 0;
  const { api, calls } = fixture({ put: async () => ++writes === 1 ? network : success({ note: note('v2', 'edited') }) });
  await api.get('/notes/1'); await api.put('/notes/1', { body: 'edited' });
  await api.put('/notes/1', { body: 'edited' });
  assert.deepEqual(calls[1][2], calls[2][2]); assert.equal(api.hasDirty(), false);
});
test('New typing after a lost response first resolves the original request then uses its version', async () => {
  let writes = 0;
  const { api, calls } = fixture({ put: async (path, input) => ++writes === 1 ? network : success({ note: note(writes === 2 ? 'v2' : 'v3', input.body) }) });
  await api.get('/notes/1'); await api.put('/notes/1', { body: 'first' });
  await api.put('/notes/1', { body: 'second' });
  assert.deepEqual(calls[1][2], calls[2][2]);
  assert.equal(calls[3][2].expected_version, 'v2'); assert.equal(calls[3][2].body, 'second');
  assert.equal(api.hasDirty(), false);
});
test('Lost create replies cannot produce a different duplicate until the original retry resolves', async () => {
  const { api, calls } = fixture({ post: async () => network });
  await api.post('/notes', { title: 'first' });
  assert.equal((await api.post('/notes', { title: 'second' })).ok, false);
  await api.post('/notes', { title: 'first' });
  assert.equal(calls.length, 2); assert.deepEqual(calls[0][2], calls[1][2]);
});
test('Pin-only success preserves an unsaved full note body', async () => {
  const { api } = fixture({ put: async () => success({ note: { ...note('v2'), pinned: 1 } }) });
  await api.get('/notes/1'); api.markDraft('notes', 1, { body: 'local full text' });
  await api.put('/notes/1', { pinned: 1 });
  assert.deepEqual(api.draft('notes', 1), { body: 'local full text' });
});
test('Archive/detail reads do not silently update the displayed board ordering precondition', async () => {
  const { api, calls } = fixture({
    get: async path => path.startsWith('/cards?')
      ? success({ cards: [card()], board_version: 'displayed', collection_version: 'collection', next_offset: null })
      : success({ card: card(), board_version: 'external-order' }),
    put: async () => conflict,
  });
  await api.get('/cards'); await api.get('/cards/1');
  await api.put('/cards/1/move', { column_name: 'done', position: 0 });
  assert.equal(calls.at(-1)[2].expected_board_version, 'displayed');
});
test('Note promotion binds the full source note version', async () => {
  const { api, calls } = fixture({ post: async () => success({ card: card(), board_version: 'b2' }) });
  await api.get('/notes/1'); await api.post('/cards', { title: 'Copy', source_note_id: 1 });
  assert.equal(calls.at(-1)[2].expected_source_note_version, 'v1');
});
test('Saved-version review is read-only and cancellation leaves the local draft untouched', async () => {
  const { api, calls } = fixture();
  await api.get('/notes/1'); api.markDraft('notes', 1, { body: 'local' });
  assert.equal((await api.reviewSaved('notes', 1, async () => false)).cancelled, true);
  assert.deepEqual(api.draft('notes', 1), { body: 'local' });
  assert.equal(calls.every(([method]) => method === 'get'), true);
});
test('Saved-version acceptance fails safely if the user types during review', async () => {
  const { api } = fixture(); await api.get('/notes/1');
  api.markDraft('notes', 1, { body: 'local' });
  assert.equal((await api.reviewSaved('notes', 1, async () => {
    api.markDraft('notes', 1, { body: 'new typing' }); return true;
  })).ok, false);
  assert.deepEqual(api.draft('notes', 1), { body: 'new typing' });
});
test('Only explicit saved-version acceptance replaces the draft without writing', async () => {
  const { api, calls } = fixture(); await api.get('/notes/1');
  api.markDraft('notes', 1, { body: 'local' });
  assert.equal((await api.reviewSaved('notes', 1, async () => true)).ok, true);
  assert.equal(api.hasDirty(), false); assert.equal(calls.every(([method]) => method === 'get'), true);
});
test('Pending network outcomes cannot be discarded by an overlapping saved-version review', async () => {
  const { api } = fixture({ put: async () => network }); await api.get('/notes/1');
  await api.put('/notes/1', { body: 'pending' });
  assert.equal((await api.reviewSaved('notes', 1, async () => true)).ok, false);
  assert.equal(api.hasDirty(), true);
});
test('An account change clears private cached drafts and ignores the previous account response', async () => {
  let user = 1, release;
  const api = createBusinessApi({ get: async () => new Promise(resolve => { release = resolve; }) }, { actor: () => user });
  const pending = api.get('/notes/1');
  api.markDraft('notes', 1, { body: 'private' }); user = 2;
  release(success({ note: note() }));
  assert.equal((await pending).ok, false); assert.equal(api.hasDirty(), false);
});
