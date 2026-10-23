import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const runtime = Object.freeze({ mode: 'preview', manifest_url: '/install/_studio/api/mcp/preview.php?view=manifest', submit_url: '/install/_studio/api/mcp/preview.php?view=validate' });
function element() {
  return { style: { setProperty() {} }, children: [], setAttribute() {}, appendChild(child) { this.children.push(child); },
    scrollIntoView() {}, set textContent(value) { this.innerHTML = String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;'); } };
}
for (const embedded of [false, true]) {
  test(`Shipped forms prevent all transport in ${embedded ? 'iframe' : 'top-level'} scoped previews`, async () => {
    let submitted, notice, prevented = false;
    const button = { textContent: 'Send', after(value) { notice = value; } };
    const form = { ...element(), addEventListener(type, callback) { if (type === 'submit') submitted = callback; },
      querySelector(selector) { return selector === '[type="submit"]' ? button : null; } };
    const document = { querySelectorAll() { return [form]; }, getElementById() { return null; }, createElement: element, head: element() };
    const window = { VoxelSitePreview: runtime, location: { search: '' } };
    window.self = window; window.top = embedded ? {} : window;
    const blocked = () => { assert.fail('Preview attempted a submission transport or serialization'); };
    vm.runInNewContext(readFileSync(new URL('../static/form-handler.js', import.meta.url), 'utf8'), { window, document, URLSearchParams, fetch: blocked, FormData: blocked, XMLHttpRequest: blocked });
    await submitted({ preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
    assert.match(notice.innerHTML, /submissions are disabled/);
    assert.equal(button.textContent, 'Send');
  });
}

test('Shipped Actions pins the preview manifest target and never serializes or sends submissions', () => {
  const calls = [];
  function Xhr() {
    this.open = (method, url) => calls.push({ method, url });
    this.setRequestHeader = () => {};
    this.send = () => {
      this.readyState = 4; this.status = 200;
      this.responseText = JSON.stringify({ actions: [], submit_url: 'https://production.invalid/actions/submit.php' });
      this.onreadystatechange();
    };
  }
  const document = { readyState: 'loading', addEventListener() {}, querySelector() { return null; }, getElementById() { return null; }, createElement: element };
  const window = { VoxelSitePreview: runtime, location: { pathname: '/install/_studio/api/mcp/preview.php', search: '?path=index.php' }, addEventListener() {} };
  let source = readFileSync(new URL('../static/actions-bar.js', import.meta.url), 'utf8');
  // Expose closure functions only in the VM test copy; the shipped file stays unchanged.
  source = source.replace(/\}\)\(\);\s*$/, 'window.testPreview = { init: init, submit: submitAction, target: function() { return SUBMIT_URL; } };})();');
  vm.runInNewContext(source, { window, document, navigator: { language: 'en' }, XMLHttpRequest: Xhr, FormData() { assert.fail('Preview serialized private fields'); }, console });
  window.testPreview.init();
  assert.deepEqual(calls, [{ method: 'GET', url: runtime.manifest_url }]);
  assert.equal(window.testPreview.target(), runtime.submit_url);
  const result = element(), form = element();
  window.testPreview.submit({ fields: [{ name: 'secret' }] }, form, result);
  assert.match(result.innerHTML, /Nothing was saved or sent/);
  assert.equal(calls.length, 1);
  assert.notEqual(form.style.display, 'none');
});
