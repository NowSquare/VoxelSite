import assert from 'node:assert/strict';
import { test } from 'node:test';

const values = new Map();
globalThis.sessionStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
globalThis.localStorage = { getItem: () => null, setItem() {} };
const mutation = await import('../ui/src/views/site-control/mutation-recovery.js');
const mutationId = 'a'.repeat(32);

test('Deterministic mutation persists identity before writing and recovers without a second POST', async () => {
  values.clear();
  let posts = 0;
  let reads = 0;
  const statuses = [];
  globalThis.window = { __vsSetGlobalStatus: value => statuses.push(value) };
  const result = await mutation.siteMutation('/site-control/page-rename', { pageId: 'page:about.php', newTitle: 'Company' }, {
    createId: () => mutationId,
    post: async (route, body) => {
      posts++;
      assert.equal(mutation.getPendingMutation().id, mutationId);
      assert.equal(body.mutation_id, mutationId);
      return { ok: false, error: { code: 'network_error' } };
    },
    read: async path => {
      reads++;
      assert.equal(path, '/site-control/mutations/' + mutationId);
      return { ok: true, data: reads === 1 ? { status: 'applying' } : { status: 'applied', response: { ok: true, data: { newTitle: 'Company' } } } };
    },
    pause: async () => {},
  });
  assert.equal(posts, 1);
  assert.equal(reads, 2);
  assert.equal(result.data.newTitle, 'Company');
  assert.equal(mutation.getPendingMutation(), null);
  assert.deepEqual(statuses, ['saved'], 'Recovered success also clears the global network-error indicator');
});

test('Unconfirmed mutation preserves its ID and recovery snapshot across checks', async () => {
  values.clear();
  const result = await mutation.siteMutation('/site-control/page-delete', { pageId: 'page:about.php' }, {
    createId: () => mutationId,
    post: async () => ({ ok: false, error: { code: 'network_error' } }),
    read: async () => ({ ok: true, data: { status: 'applying', snapshotId: 42 } }),
    pause: async () => {}, attempts: 2,
  });
  assert.equal(result.error.outcome_unknown, true);
  assert.equal(result.error.mutation_id, mutationId);
  assert.equal(result.error.snapshotId, 42);
  assert.equal(mutation.getPendingMutation().id, mutationId);
  let posts = 0;
  await mutation.siteMutation('/site-control/page-delete', { pageId: 'page:about.php' }, {
    post: async () => { posts++; },
    read: async () => ({ ok: true, data: { status: 'failed', restored: true, snapshotId: 42, response: { ok: false, error: { message: 'Write failed.', restored: true, snapshotId: 42 } } } }),
  });
  assert.equal(posts, 0);
  assert.equal(mutation.getPendingMutation(), null);
});

test('A reloaded tab can recover stored mutation JSON and restoration details', async () => {
  values.clear();
  sessionStorage.setItem('vs-sc-pending-mutation', JSON.stringify({ id: mutationId, route: '/site-control/url-rename', body: { routeId: 'route:/about', newPath: '/company' } }));
  const result = await mutation.recoverSiteMutation({ read: async () => ({ ok: true, data: { status: 'failed', response: JSON.stringify({ ok: false, error: { message: 'Restoration incomplete.', restored: false, snapshotId: 42 } }) } }) });
  assert.equal(result.error.restored, false);
  assert.equal(result.error.snapshotId, 42);
  assert.equal(mutation.getPendingMutation(), null);
});

test('A resolved recovery displays the current snapshot outcome instead of the historical failure', async () => {
  values.clear();
  sessionStorage.setItem('vs-sc-pending-mutation', JSON.stringify({ id: mutationId }));
  const result = await mutation.recoverSiteMutation({ read: async () => ({ ok: true, data: {
    status: 'failed', response: { ok: false, error: { message: 'Restoration incomplete.', restored: false,
      recovery_resolved: true, recovery_resolved_by_snapshot: 42, recovery_note: 'Recovery completed by restoring snapshot #42.' } },
  } }) });
  assert.equal(result.error.message, 'Recovery completed by restoring snapshot #42.');
  assert.equal(result.error.restored, false, 'The historical restoration failure remains available');
});

test('An unaccepted request tombstone clears pending and permits a fresh mutation', async () => {
  values.clear();
  let reads = 0;
  const result = await mutation.siteMutation('/site-control/page-rename', { pageId: 'page:about.php', newTitle: 'Company' }, {
    createId: () => mutationId,
    post: async () => ({ ok: false, error: { code: 'network_error' } }),
    read: async () => ++reads === 1
      ? { ok: false, error: { code: 'not_found' } }
      : { ok: true, data: { status: 'failed', restored: true, response: { ok: false, error: { code: 'mutation_not_started', message: 'The request was not accepted. Nothing changed.', restored: true } } } },
    pause: async () => {},
  });
  assert.equal(reads, 2);
  assert.equal(result.error.code, 'mutation_not_started');
  assert.equal(result.error.restored, true);
  assert.equal(mutation.getPendingMutation(), null);
  let nextPosts = 0;
  const nextId = 'b'.repeat(32);
  const next = await mutation.siteMutation('/site-control/page-rename', { pageId: 'page:about.php', newTitle: 'Our Company' }, {
    createId: () => nextId,
    post: async (route, body) => { nextPosts++; assert.equal(body.mutation_id, nextId); return { ok: true, data: { newTitle: 'Our Company' } }; },
  });
  assert.equal(nextPosts, 1);
  assert.equal(next.data.newTitle, 'Our Company');
  assert.equal(mutation.getPendingMutation(), null);
});
