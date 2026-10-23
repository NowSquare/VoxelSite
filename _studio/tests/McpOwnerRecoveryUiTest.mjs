import assert from 'node:assert/strict';
import { test } from 'node:test';
import { recoveryClient, renderRecovery, bindOwnerRecovery } from '../ui/src/views/settings-recovery.js';

const review = { recovery_id: 'op_fixture', review_id: 'recovery_fixture', digest: 'sealed',
  operation_id: 'request_fixture', kind: 'changes.apply', action: 'restore_before', eligible: true,
  original_actor: { user_id: 2, client_name: '<script>author</script>' },
  paths: [{ domain: 'draft', path: 'index.php', state: 'after', current_hash: 'after', before_hash: 'before' }] };
const memory = () => {
  const data = new Map();
  return { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
};
test('Recovery review shows original attribution and exact current and restore hashes safely', () => {
  const html = renderRecovery([review], { op_fixture: review });
  assert.match(html, /&lt;script&gt;author&lt;\/script&gt;/);
  assert.match(html, /draft\/index.php/);
  assert.match(html, /Current: after/);
  assert.match(html, /Restore: before/);
  assert.match(html, /will not resume/);
});
test('Lost restore response retains the exact receipt across reloads', async () => {
  const storage = memory(); const calls = [];
  const api = { post: async (url, body) => {
    calls.push({ url, body });
    if (url.endsWith('/review')) return { ok: true, data: review };
    if (calls.length === 2) throw new Error('Lost response');
    return { ok: true, data: { status: 'failed_restored' } };
  } };
  const first = recoveryClient(api, 1, storage);
  await first.review('op_fixture');
  await assert.rejects(first.restore('op_fixture'), /Lost response/);
  const reloaded = recoveryClient(api, 1, storage);
  assert.ok(reloaded.pending().op_fixture);
  assert.equal((await reloaded.restore('op_fixture')).data.status, 'failed_restored');
  assert.deepEqual(calls[1], calls[2]);
  assert.deepEqual(reloaded.pending(), {});
  assert.equal(calls.filter(call => call.url.endsWith('/review')).length, 1);
});
test('Recovery-required outcome stays visible and never starts another review automatically', async () => {
  const calls = [];
  const api = { post: async (url, body) => { calls.push({ url, body }); return { ok: true, data: url.endsWith('/review') ? review : { status: 'recovery_required' } }; } };
  const client = recoveryClient(api, 1, memory());
  await client.review('op_fixture'); await client.restore('op_fixture');
  assert.ok(client.pending().op_fixture);
  assert.equal(calls.length, 2);
  assert.match(renderRecovery([], client.pending()), /Restore original state/);
});
test('Mail intent offers acknowledgement without a delivery or rollback claim', () => {
  const mail = { ...review, action: 'acknowledge_delivery', paths: [],
    delivery_intent: { recipient: 'owner@example.invalid', delivery_status: 'unknown' } };
  const html = renderRecovery([mail], { op_fixture: mail });
  assert.match(html, /Acknowledge email outcome/);
  assert.match(html, /does not send again or confirm delivery/);
  assert.match(html, /unknown/);
  assert.doesNotMatch(html, />Restore original state</);
});
test('One owner cannot reuse another owner’s browser receipt', async () => {
  const storage = memory();
  const api = { post: async () => ({ ok: true, data: review }) };
  await recoveryClient(api, 1, storage).review('op_fixture');
  assert.deepEqual(recoveryClient(api, 3, storage).pending(), {});
});

for (const moveFocus of [false, true]) {
  test(`Successful restore survives a failed list refresh${moveFocus ? ' without stealing moved focus' : ' with reachable outcome feedback'}`, async () => {
    const previousDocument = globalThis.document;
    const elsewhere = { focus() { globalThis.document.activeElement = this; } };
    const document = { body: {}, activeElement: null };
    globalThis.document = document;
    let markup = '', controls = [], feedback = null, handler;
    const container = {
      isConnected: true,
      set innerHTML(value) {
        for (const control of controls) {
          control.isConnected = false;
          if (document.activeElement === control) document.activeElement = document.body;
        }
        markup = value;
        feedback = value.includes('id="recovery-feedback"') ? {
          textContent: '', classList: { toggle() {} },
          focus() { document.activeElement = this; },
        } : null;
        controls = value.includes('data-recovery-restore=') ? [{
          dataset: { recoveryRestore: review.recovery_id }, isConnected: true,
          addEventListener(name, fn) { handler = fn; },
        }] : [];
      },
      querySelector() { return feedback; },
      querySelectorAll() { return controls; },
    };
    let reads = 0;
    const calls = [];
    const api = {
      async get() {
        if (++reads === 1) return { ok: true, data: { items: [review] } };
        if (moveFocus) elsewhere.focus();
        return { ok: false, error: { message: 'Storage is temporarily busy.' } };
      },
      async post(path, body) {
        calls.push({ path, body });
        return { ok: true, data: path.endsWith('/review') ? review : { status: 'failed_restored' } };
      },
    };
    try {
      const client = recoveryClient(api, 1, memory());
      await client.review(review.recovery_id);
      await bindOwnerRecovery(container, { api, user: { id: 1, role: 'owner' }, client });
      document.activeElement = controls[0];
      await assert.doesNotReject(handler());
      assert.match(feedback.textContent, /Original affected state restored/);
      assert.match(markup, /Storage is temporarily busy/);
      assert.match(markup, /Reload Settings/);
      assert.deepEqual(client.pending(), {});
      assert.equal(calls.filter(call => call.path.endsWith('/restore')).length, 1);
      assert.equal(calls.filter(call => call.path.endsWith('/review')).length, 1);
      assert.equal(document.activeElement, moveFocus ? elsewhere : feedback);
    } finally {
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
    }
  });
}
