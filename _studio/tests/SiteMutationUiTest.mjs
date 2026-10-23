import assert from 'node:assert/strict';
import { test } from 'node:test';

const values = new Map();
globalThis.sessionStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
globalThis.localStorage = { getItem: () => null, setItem() {} };
const mutation = await import('../ui/src/views/site-control/mutation-recovery.js');
const mutationId = 'a'.repeat(32);

test('Structural request persists its captured graph before the shared operation starts', async () => {
  values.clear();
  const body = { pageId: 'page:about.php', newTitle: 'Company', base_draft_version: 'draft:8' };
  const result = await mutation.siteMutation('/site-control/page-rename', body, {
    createId: () => mutationId,
    operation: async (route, input) => {
      assert.equal(mutation.getPendingMutation().id, mutationId);
      assert.deepEqual(input, body);assert.equal(route, '/site-control/page-rename');
      return {ok:true,data:{newTitle:'Company',operation:{status:'succeeded'}}};
    },
  });
  assert.equal(result.data.newTitle,'Company');assert.equal(mutation.getPendingMutation(),null);
});

test('Lost structural response resumes only the original retained body', async () => {
  values.clear();const body={pageId:'page:about.php',base_draft_version:'draft:9'};
  const result=await mutation.siteMutation('/site-control/page-delete',body,{
    createId:()=>mutationId,operation:async()=>({ok:false,error:{code:'network_error'}}),
  });
  assert.equal(result.error.outcome_unknown,true);assert.deepEqual(mutation.getPendingMutation().body,body);
  const recovered=await mutation.siteMutation('/site-control/page-delete',{...body,pageId:'page:other.php'},{
    operation:async(route,input)=>{assert.deepEqual(input,body);return {ok:true,data:{operation:{status:'succeeded'}}};},
  });
  assert.equal(recovered.ok,true);assert.equal(mutation.getPendingMutation(),null);
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

test('A stale structural request clears its pending request for explicit review', async () => {
  values.clear();
  const result=await mutation.siteMutation('/site-control/page-rename',{pageId:'page:about.php',newTitle:'Company',base_draft_version:'draft:1'},{
    createId:()=>mutationId,operation:async()=>({ok:false,error:{code:'content_conflict',message:'Review the current graph.'}}),
  });
  assert.equal(result.error.code,'content_conflict');assert.equal(mutation.getPendingMutation(),null);
});
