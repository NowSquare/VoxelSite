import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

const source = await readFile(new URL('../ui/api.js', import.meta.url), 'utf8');
const installation = await readFile(new URL('../ui/installation-url.js', import.meta.url), 'utf8');
const editor = await readFile(new URL('../ui/src/views/editor.js', import.meta.url), 'utf8');
const script = value => value.replace(/^import .*;\n/gm, '').replace(/^export \{[^}]*\};?\s*$/gm, '')
  .replace(/^export default .*;\s*$/gm, '').replaceAll('export ', '');
function browser(pathname) {
  const calls = [];
  const window = { location: { pathname, origin: 'https://example.invalid' } };
  const context = vm.createContext({
    window, location: window.location, TextDecoder, console,
    store: { get: () => null }, document: { cookie: '' },
    fetch: async (url, options) => {
      calls.push({ url, options });
      return { ok: true, status: 200, json: async () => ({ ok: true, data: {} }),
        body: { getReader: () => ({ read: async () => ({ done: true }) }) } };
    },
  });
  vm.runInContext(script(installation) + '\n' + script(source), context);
  return { context, calls, window };
}

for (const prefix of ['', '/tenant', '/tenant/second', '/caf%C3%A9', '/tenant&copy;']) {
  test(`JSON and streamed requests remain inside ${prefix || 'the root'} installation`, async () => {
    const { context, calls } = browser(`${prefix}/_studio/index.php`);
    await vm.runInContext("api.get('/pages?limit=1')", context);
    await vm.runInContext("apiStream('/ai/prompt?mode=edit', { prompt: 'Fixture' })", context);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, `${prefix.replaceAll('&', '%26')}/_studio/api/router.php?_path=%2Fpages&limit=1`);
    assert.equal(calls[1].url, `${prefix.replaceAll('&', '%26')}/_studio/api/router.php?_path=%2Fai%2Fprompt&mode=edit`);
    assert.equal(calls[1].options.credentials, 'same-origin');
  });
}

test('Monaco loader, modules and worker use the same nested installation', async () => {
  const { context, window } = browser('/tenant/_studio/');
  let config;
  const scripts = [];
  window.require = (_, done) => { window.monaco = { editor: {} }; done(); };
  window.require.config = value => { config = value; };
  context.document = {
    getElementById: () => null, createElement: () => ({}),
    head: { appendChild: node => { scripts.push(node); node.onload(); } },
  };
  vm.runInContext(script(editor), context);
  await vm.runInContext('ensureMonacoReady()', context);
  assert.equal(scripts[0].src, '/tenant/_studio/ui/lib/monaco/vs/loader.js');
  assert.equal(config.paths.vs, '/tenant/_studio/ui/lib/monaco/vs');
  const worker = decodeURIComponent(window.MonacoEnvironment.getWorkerUrl().split(',').slice(1).join(','));
  assert.ok(worker.includes('https://example.invalid/tenant/_studio/ui/lib/monaco/'));
  assert.ok(worker.includes('https://example.invalid/tenant/_studio/ui/lib/monaco/vs/base/worker/workerMain.js'));
});

test('Studio font remains relative to the served stylesheet', async () => {
  const font = await readFile(new URL('../ui/fonts/inter/inter.css', import.meta.url), 'utf8');
  const path = font.match(/src:\s*url\(['"]?([^'")]+)/)?.[1];
  assert.equal(new URL(path, 'https://example.invalid/tenant/_studio/ui/fonts/inter/inter.css').pathname,
    '/tenant/_studio/ui/fonts/inter/inter-var.woff2');
});

test('Pending edits from another installation never become this installation’s retry', async () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key), get length() { return data.size; }, key: index => [...data.keys()][index] };
  const first = browser('/one/_studio/');
  const second = browser('/two/_studio/');
  for (const item of [first, second]) {
    item.context.sessionStorage = storage;
    item.context.crypto = webcrypto;
    item.context.fetch = async () => { throw new Error('Lost acknowledgement'); };
    item.context.console = { error() {} };
  }
  await vm.runInContext("apiOperation('/designs/example', { version: 'first-site' }, 'delete')", first.context);
  assert.equal(vm.runInContext("pendingOperationInput('/designs/example', 'delete')", second.context), null);
  assert.equal(vm.runInContext("pendingOperationEntries('/designs/', 'delete').length", second.context), 0);
  await vm.runInContext("apiOperation('/designs/example', { version: 'second-site' }, 'delete')", second.context);
  assert.equal(vm.runInContext("pendingOperationInput('/designs/example', 'delete').version", first.context), 'first-site');
  assert.equal(vm.runInContext("pendingOperationInput('/designs/example', 'delete').version", second.context), 'second-site');
});

function sharedStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key) };
}
async function workspaceBrowser(prefix, file, storage) {
  const instance = browser(`${prefix}/_studio/`);
  Object.assign(instance.context, { crypto: webcrypto, sessionStorage: storage, structuredClone });
  const helper = await readFile(new URL(`../ui/src/${file}`, import.meta.url), 'utf8');
  vm.runInContext(script(helper), instance.context);
  return instance.context;
}

test('Lost asset uploads retain separate IDs and draft versions for installations sharing storage', async () => {
  const storage = sharedStorage(), calls = [];
  const first = await workspaceBrowser('/one', 'asset-workspace.js', storage);
  const second = await workspaceBrowser('/two', 'asset-workspace.js', storage);
  for (const context of [first, second]) Object.assign(context, {
    files: [{ name: 'same.txt', size: 3, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer }],
    send: async (_, input) => { calls.push(structuredClone(input)); throw new Error('Lost acknowledgement'); },
  });
  await assert.rejects(vm.runInContext("uploadReviewedAssets(files, 'draft:1', 7, send, sessionStorage, () => 7)", first), /Lost acknowledgement/);
  await assert.rejects(vm.runInContext("uploadReviewedAssets(files, 'draft:9', 7, send, sessionStorage, () => 7)", second), /Lost acknowledgement/);
  await assert.rejects(vm.runInContext("uploadReviewedAssets(files, 'draft:2', 7, send, sessionStorage, () => 7)", first), /Lost acknowledgement/);
  assert.notEqual(calls[0].request_id, calls[1].request_id);
  assert.deepEqual(calls[2], calls[0]);
  assert.equal(calls[1].base_draft_version, 'draft:9');
});

test('Lost exports cannot reuse another installation’s release or operation ID', async () => {
  const storage = sharedStorage(), calls = [];
  const first = await workspaceBrowser('/one', 'export-workspace.js', storage);
  const second = await workspaceBrowser('/two', 'export-workspace.js', storage);
  for (const context of [first, second]) context.send = async input => {
    calls.push(structuredClone(input)); throw new Error('Lost acknowledgement');
  };
  const versionA = `release_${'a'.repeat(32)}`, versionB = `release_${'b'.repeat(32)}`;
  await assert.rejects(vm.runInContext(`downloadReviewedExport('php', '${versionA}', 7, send, sessionStorage, () => 7)`, first), /Lost acknowledgement/);
  assert.equal(vm.runInContext("pendingExport('php', 7, sessionStorage)", second), null);
  await assert.rejects(vm.runInContext(`downloadReviewedExport('php', '${versionB}', 7, send, sessionStorage, () => 7)`, second), /Lost acknowledgement/);
  assert.notEqual(calls[0].operation_id, calls[1].operation_id);
  assert.equal(vm.runInContext("pendingExport('php', 7, sessionStorage).version", first), versionA);
  assert.equal(vm.runInContext("pendingExport('php', 7, sessionStorage).version", second), versionB);
});

test('Reviewed update retries remain scoped to the installation and selected package', async () => {
  const storage = sharedStorage(), calls = [];
  const first = await workspaceBrowser('/one', 'update-workspace.js', storage);
  const second = await workspaceBrowser('/two', 'update-workspace.js', storage);
  for (const context of [first, second]) {
    context.send = async (_, input) => { calls.push(structuredClone(input)); throw new Error('Lost acknowledgement'); };
    vm.runInContext('var client = updateClient({api: {post: send}, runtime: send, ownerId: 7, currentOwner: () => 7})', context);
  }
  await assert.rejects(vm.runInContext("client.stageLocal('first.zip')", first), /Lost acknowledgement/);
  assert.equal(vm.runInContext('Object.keys(client.state()).length', second), 0);
  await assert.rejects(vm.runInContext("client.stageLocal('second.zip')", second), /Lost acknowledgement/);
  await assert.rejects(vm.runInContext("client.stageLocal('first.zip')", first), /Lost acknowledgement/);
  assert.notEqual(calls[0].request_id, calls[1].request_id);
  assert.deepEqual(calls[2], calls[0]);
});

test('Factory review retries and completion capabilities never cross installations', async () => {
  const storage = sharedStorage(), calls = [];
  const first = await workspaceBrowser('/one', 'factory-reset-workspace.js', storage);
  const second = await workspaceBrowser('/two', 'factory-reset-workspace.js', storage);
  for (const context of [first, second]) {
    context.send = async (_, input) => { calls.push(structuredClone(input)); throw new Error('Lost acknowledgement'); };
    vm.runInContext("var client = factoryClient({api: {get: async () => ({ok: true, data: {draft_version: 'draft:1'}}), post: send}, endpoint: '/completion'})", context);
  }
  await assert.rejects(vm.runInContext('client.prepare()', first), /Lost acknowledgement/);
  assert.equal(vm.runInContext('client.read()', second), null);
  await assert.rejects(vm.runInContext('client.prepare()', second), /Lost acknowledgement/);
  assert.notEqual(calls[0].operation_id, calls[1].operation_id);
  vm.runInContext(`client.importReceipt({plan_id: 'factory_${'a'.repeat(32)}', token: '${'b'.repeat(64)}'})`, first);
  assert.equal(vm.runInContext('client.read().token', second), undefined);
  assert.equal(vm.runInContext('client.read().token', first), 'b'.repeat(64));
});

test('Owner recovery reviews cannot be reused by another installation with the same account ID', async () => {
  const storage = sharedStorage(), calls = [];
  const first = await workspaceBrowser('/one', 'views/settings-recovery.js', storage);
  const second = await workspaceBrowser('/two', 'views/settings-recovery.js', storage);
  for (const [index, context] of [first, second].entries()) {
    context.send = async (url, body) => {
      calls.push({ installation: index, url, body: structuredClone(body) });
      return { ok: true, data: url.endsWith('/review')
        ? { review_id: `review-${index}`, digest: `digest-${index}` } : { status: 'failed_restored' } };
    };
    vm.runInContext('var client = recoveryClient({post: send}, 7, sessionStorage)', context);
  }
  await vm.runInContext("client.review('same-operation-id')", first);
  vm.runInContext('client = recoveryClient({post: send}, 7, sessionStorage)', second);
  assert.equal(vm.runInContext('Object.keys(client.pending()).length', second), 0);
  assert.equal((await vm.runInContext("client.restore('same-operation-id')", second)).ok, false);
  assert.equal(calls.length, 1);
  await vm.runInContext("client.restore('same-operation-id')", first);
  assert.deepEqual(calls[1].body, { review_id: 'review-0', digest: 'digest-0' });
});
