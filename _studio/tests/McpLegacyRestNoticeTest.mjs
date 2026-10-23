import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('Unbound upgraded REST keys show an actionable notice without expanding details', async () => {
  const source = await readFile(new URL('../ui/src/views/settings-mcp.js', import.meta.url), 'utf8');
  const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  const context = vm.createContext({ escapeHtml: escape, escapeAttr: escape, Date });
  vm.runInContext(source.replace(/^import .*;\n/gm, '').replaceAll('export ', ''), context);
  const html = context.renderMcpConnections({ enabled: false, workspace_ready: true,
    accounts: [{ id: 1, name: 'Owner', role: 'owner' }], connections: [],
    rest_connections: [{ id: 9, label: 'Unbound <key>', user_id: null }, { id: 10, label: 'Already bound key', user_id: 1 }],
  }, 1);
  assert.match(html, /<section[^>]+aria-labelledby="rest-migration-heading"/);
  assert.match(html, /before they can read, edit or publish/);
  assert.match(html, /Their API audience and granted scopes stay the same/);
  assert.match(html, /Unbound &lt;key>/);
  assert.match(html, /data-mcp-bind="9"/);
  assert.ok(!html.includes('data-mcp-bind="10"'));
});
