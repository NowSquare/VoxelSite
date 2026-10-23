import assert from 'node:assert/strict';
import { test } from 'node:test';
import { builtInAiAvailable, createDraftActivityPoller, reconcileEditorTabs, resolveEditorConflict, retainSavedBuffer } from '../ui/src/external-workspace.js';
const read = content => ({ ok: true, data: { content, content_sha256: 'saved-hash' } });
function fixture(tab) {
  const tabs = [tab], applied = [];
  return { tabs, applied, buffer: item => item._buffer ?? item.baseline, apply: (item, content) => applied.push(content), version: 'draft:2' };
}

test('Only explicit configured metadata enables built-in AI', () => {
  for (const value of [undefined, null, false, 'true', 1]) assert.equal(builtInAiAvailable({ get: () => value }), false);
  assert.equal(builtInAiAvailable({ get: () => true }), true);
});
test('Activity polls only the provided local read and distinguishes baseline from a changed version', async () => {
  let visible = true, busy = false, calls = 0, version = 'draft:1';
  const initial = [], changed = [];
  const poller = createDraftActivityPoller({ read: async () => { calls++; return { ok: true, data: { draft_version: version } }; },
    visible: () => visible, busy: () => busy, initial: data => initial.push(data.draft_version), changed: data => changed.push(data.draft_version) });
  await poller.refresh(); await poller.refresh();
  assert.deepEqual(initial, ['draft:1']); assert.deepEqual(changed, []);
  visible = false; await poller.refresh(); busy = true; visible = true; await poller.refresh(); assert.equal(calls, 2);
  busy = false; version = 'draft:2'; await poller.refresh(); assert.deepEqual(changed, ['draft:2']);
});
test('Failed reconciliation retries the same version and parallel polls do not duplicate reads', async () => {
  let version = 'draft:1', attempts = 0, release;
  const poller = createDraftActivityPoller({ read: async () => ({ ok: true, data: { draft_version: version } }), visible: () => true, busy: () => false,
    initial: () => {}, changed: async () => { attempts++; if (attempts === 1) throw new Error('offline'); await new Promise(resolve => { release = resolve; }); } });
  await poller.refresh(); version = 'draft:2'; assert.equal(await poller.refresh(), false);
  const pending = poller.refresh(); await Promise.resolve(); assert.equal(await poller.refresh(), false); release(); await pending;
  assert.equal(attempts, 2); assert.equal(await poller.refresh(), true);
});
test('Clean tabs reload their saved bytes and hash', async () => {
  const tab = { path: 'index.php', baseline: 'before', dirty: false }, f = fixture(tab);
  assert.deepEqual(await reconcileEditorTabs({ ...f, read: async () => read('after') }), { conflicts: [], failed: [] });
  assert.deepEqual(f.applied, ['after']); assert.equal(tab.baseline, 'after'); assert.equal(tab.contentHash, 'saved-hash');
});
test('Dirty buffers remain untouched and retain a reviewable saved version', async () => {
  const tab = { path: 'index.php', baseline: 'before', _buffer: 'my edits', dirty: true }, f = fixture(tab);
  await reconcileEditorTabs({ ...f, read: async () => read('external') });
  assert.equal(tab._buffer, 'my edits'); assert.equal(tab.baseline, 'before'); assert.deepEqual(f.applied, []);
  assert.equal(tab.externalConflict.content, 'external');
});
test('Repeating the same saved conflict preserves the open review identity', async () => {
  const tab = { path: 'index.php', baseline: 'before', _buffer: 'my edits', dirty: true }, f = fixture(tab);
  await reconcileEditorTabs({ ...f, read: async () => read('external') });
  const conflict = tab.externalConflict;
  await reconcileEditorTabs({ ...f, read: async () => read('external'), version: 'draft:3' });
  assert.equal(tab.externalConflict, conflict);
  await reconcileEditorTabs({ ...f, read: async () => read('new external'), version: 'draft:4' });
  assert.notEqual(tab.externalConflict, conflict);
});
test('Returning to the original saved bytes clears a stale conflict without touching local edits', async () => {
  const tab = { path: 'index.php', baseline: 'before', _buffer: 'my edits', dirty: true }, f = fixture(tab);
  await reconcileEditorTabs({ ...f, read: async () => read('external') });
  await reconcileEditorTabs({ ...f, read: async () => read('before') });
  assert.equal(tab.externalConflict, null); assert.equal(tab._buffer, 'my edits'); assert.equal(tab.dirty, true);
  assert.equal(tab.contentHash, 'saved-hash'); assert.deepEqual(f.applied, []);
});
test('Typing while the server read is pending cannot be overwritten', async () => {
  const tab = { path: 'index.php', baseline: 'before', dirty: false }, f = fixture(tab);
  await reconcileEditorTabs({ ...f, read: async () => { tab._buffer = 'typed during fetch'; return read('external'); } });
  assert.equal(tab._buffer, 'typed during fetch'); assert.deepEqual(f.applied, []); assert.ok(tab.externalConflict);
});
test('Closing, moving or saving a tab during its read invalidates the stale response', async () => {
  for (const change of [(tab, f) => f.tabs.pop(), tab => { tab.path = 'other.php'; }, tab => { tab.baseline = 'newly saved'; }]) {
    const tab = { path: 'index.php', baseline: 'before', dirty: false }, f = fixture(tab);
    await reconcileEditorTabs({ ...f, read: async () => { change(tab, f); return read('external'); } });
    assert.deepEqual(f.applied, []); assert.equal(tab.externalConflict, undefined);
  }
});
test('Deleted files retain local work and cannot be resolved to an invented saved baseline', async () => {
  const tab = { path: 'index.php', baseline: 'before', _buffer: 'my edits', dirty: true }, f = fixture(tab);
  await reconcileEditorTabs({ ...f, read: async () => ({ ok: false, error: { code: 'not_found' } }) });
  assert.equal(tab._buffer, 'my edits'); assert.equal(tab.externalConflict.missing, true);
  assert.equal(resolveEditorConflict(tab, 'local', tab._buffer), false);
});
test('Keeping local edits adopts only the reviewed saved baseline for the next compare-and-swap', async () => {
  const tab = { path: 'index.php', baseline: 'before', _buffer: 'my edits', dirty: true }, f = fixture(tab);
  await reconcileEditorTabs({ ...f, read: async () => read('external') });
  assert.equal(resolveEditorConflict(tab, 'local', tab._buffer), true);
  assert.equal(tab._buffer, 'my edits'); assert.equal(tab.baseline, 'external'); assert.equal(tab.contentHash, 'saved-hash'); assert.equal(tab.dirty, true);
});
test('Choosing the saved version replaces only the explicit editor buffer and does not write', async () => {
  const tab = { path: 'index.php', baseline: 'before', _buffer: 'my edits', dirty: true }, f = fixture(tab);
  await reconcileEditorTabs({ ...f, read: async () => read('external') });
  assert.equal(resolveEditorConflict(tab, 'saved', tab._buffer), true); assert.equal(tab._buffer, 'external'); assert.equal(tab.dirty, false);
});
test('A successful save keeps edits typed while that save was pending', () => {
  const tab = { baseline: 'before', _buffer: 'sent version', dirty: true };
  retainSavedBuffer(tab, 'sent version', 'saved-hash', 'new typing');
  assert.equal(tab.baseline, 'sent version'); assert.equal(tab._buffer, 'new typing'); assert.equal(tab.dirty, true);
});
test('Read failures never clear a buffer or pretend a file was deleted', async () => {
  const tab = { path: 'index.php', baseline: 'before', _buffer: 'mine', dirty: true }, f = fixture(tab);
  const result = await reconcileEditorTabs({ ...f, read: async () => ({ ok: false, error: { code: 'permission_denied' } }) });
  assert.deepEqual(result.failed, ['index.php']); assert.equal(tab._buffer, 'mine'); assert.equal(tab.externalConflict, undefined);
});
