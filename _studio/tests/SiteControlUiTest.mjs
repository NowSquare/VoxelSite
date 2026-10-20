import assert from 'node:assert/strict';
import { test } from 'node:test';

const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
};
globalThis.localStorage = storage();
globalThis.sessionStorage = storage();
globalThis.document = {
  createElement() {
    return { set textContent(value) { this.innerHTML = String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); } };
  },
};
globalThis.window = {};
const { apiStream } = await import('../ui/api.js');
const orch = await import('../ui/src/views/site-control/orchestration-console.js');
const panel = await import('../ui/src/views/site-control/control-panel.js');
const { renderControlPanel } = panel;

test('Site stream EOF after write progress reports an unconfirmed outcome', async () => {
  globalThis.fetch = async () => new Response('data: {"type":"status","phase":"patch","message":"written"}\n\n');
  const errors = [];
  let done = 0;
  await apiStream('/site-control/apply', { plan_id: 'reviewed-plan' }, {
    requireTerminal: true, onError: error => errors.push(error), onDone: () => done++,
  });
  assert.equal(done, 0);
  assert.equal(errors.length, 1);
  assert.equal(errors[0].code, 'stream_interrupted');
  assert.equal(errors[0].outcome_unknown, true);
});

test('Site transport failure never claims rollback', async () => {
  globalThis.fetch = async () => { throw new Error('network reset'); };
  const errors = [];
  await apiStream('/site-control/apply', { plan_id: 'reviewed-plan' }, { requireTerminal: true, onError: error => errors.push(error) });
  assert.equal(errors[0].outcome_unknown, true);
  assert.equal(errors[0].rollback_clean, undefined);
});

test('Site terminal server error is delivered once without transport fallback', async () => {
  globalThis.fetch = async () => new Response('data: {"type":"error","message":"Rejected","rollback_clean":true}\n\n');
  const errors = [];
  await apiStream('/site-control/apply', {}, { requireTerminal: true, onError: error => errors.push(error) });
  assert.equal(errors.length, 1);
  assert.equal(errors[0].rollback_clean, true);
});

test('Abort after a terminal Site error cannot turn failure into success', async () => {
  let reads = 0;
  globalThis.fetch = async () => new Response(new ReadableStream({
    pull(controller) {
      if (reads++ === 0) controller.enqueue(new TextEncoder().encode('data: {"type":"error","message":"Failed","rollback_clean":true}\n\n'));
      else controller.error(new DOMException('closed', 'AbortError'));
    },
  }));
  let errors = 0;
  let done = 0;
  await apiStream('/site-control/apply', {}, { requireTerminal: true, onError: () => errors++, onDone: () => done++ });
  assert.equal(errors, 1);
  assert.equal(done, 0);
});

test('Unknown apply outcome gives recovery guidance without a restoration claim', () => {
  orch.setOrchState('apply_failed');
  orch.setOrchResult({ summary: 'Connection error during apply.', rollback_clean: null, outcome_unknown: true });
  const html = renderControlPanel();
  assert.doesNotMatch(html, /All changes have been rolled back|No files were modified/);
  assert.match(html, /[Cc]onfirm|[Uu]nconfirmed/);
});

test('Incomplete rollback identifies affected files and recovery snapshot', () => {
  orch.setOrchState('apply_failed');
  orch.setOrchResult({ rollback_clean: false, changed_files: ['about.php'], recovery_snapshot_id: 42 });
  const html = renderControlPanel();
  assert.match(html, /about\.php/);
  assert.match(html, /42/);
  assert.match(html, /Snapshots/);
});

test('Composer and clear action cannot replace an active apply', () => {
  orch.setOrchState('applying');
  orch.setOrchPrompt('Next change');
  orch.appendOrchLog({ type: 'info', message: 'Applying' });
  const html = orch.renderOrchestrationConsole();
  assert.match(html.split('</textarea>')[0], /disabled/);
  assert.match(html, /id="vs-sc-console-clear"[^>]*disabled/);
});

test('A partially valid plan cannot be approved as a smaller silent subset', () => {
  orch.setOrchState('plan');
  orch.setOrchPlan({ plan_id: 'reviewed-plan', edits: [{ file: 'about.php', anchored: true }, { file: 'contact.php', anchored: false }] });
  assert.doesNotMatch(renderControlPanel(), /id="vs-sc-orch-apply"/);
});

test('Review identifies suggested checks as pending instead of passed verification', () => {
  orch.setOrchState('plan');
  orch.setOrchPlan({ plan_id: 'reviewed-plan', edits: [{ file: 'about.php', anchored: true, verification: 'The new heading appears in preview.' }] });
  const html = renderControlPanel();
  assert.match(html, /Check after apply: The new heading appears in preview\./);
  assert.doesNotMatch(html, /✓ The new heading appears in preview/);
});

test('Planning failure reports its actual summary', () => {
  orch.setOrchState('plan_failed');
  orch.setOrchPlan(null);
  orch.setOrchResult({ summary: 'No candidate files matched this request.' });
  const html = renderControlPanel();
  assert.match(html, /No candidate files matched this request/);
  assert.doesNotMatch(html, /Orchestration complete/);
});

test('A page action cannot clear an active site apply', async () => {
  const state = await import('../ui/src/views/site-control/state.js');
  state.setGraphModel({ nodes: new Map([['page:about.php', { id: 'page:about.php', type: 'page', label: 'About' }]]) });
  orch.setOrchState('applying');
  panel.enterRenameMode('page:about.php');
  assert.equal(orch.orchState, 'applying');
  assert.equal(state.renameMode, false);
});

test('Editor tab identity follows moved and deleted files while Editor is unmounted', async () => {
  const { reconcileEditorPaths } = await import('../ui/src/views/site-control/editor-reconciliation.js');
  sessionStorage.setItem('vs-editor-state', JSON.stringify({ openTabs: ['about.php', 'contact.php', 'assets/css/style.css'], activeTab: 'about.php', fontSize: 15 }));
  reconcileEditorPaths([{ oldFilePath: 'about.php', newFilePath: 'company/about.php' }], ['contact.php']);
  const saved = JSON.parse(sessionStorage.getItem('vs-editor-state'));
  assert.deepEqual(saved.openTabs, ['company/about.php', 'assets/css/style.css']);
  assert.equal(saved.activeTab, 'company/about.php');
  assert.equal(saved.fontSize, 15);
});

test('An active reviewed apply survives a page reload as a result check', async () => {
  orch.setOrchPlan({ plan_id: 'retained-plan', edits: [] });
  orch.setOrchState('applying');
  const restored = await import('../ui/src/views/site-control/orchestration-console.js?reload-test');
  assert.equal(restored.orchPlan.plan_id, 'retained-plan');
  assert.equal(restored.orchState, 'recovering');
});

test('Interrupted apply checks the saved result without applying twice', async () => {
  const { waitForPlanResult } = await import('../ui/src/views/site-control/plan-recovery.js');
  const reads = [];
  const result = await waitForPlanResult('same-plan', {
    read: async path => { reads.push(path); return { ok: true, data: reads.length === 1 ? { status: 'applying' } : { status: 'applied', result: { files_changed: 2 } } }; },
    pause: async () => {},
  });
  assert.equal(result.status, 'applied');
  assert.equal(result.result.files_changed, 2);
  assert.deepEqual(reads, ['/site-control/plans/same-plan', '/site-control/plans/same-plan']);
});

test('Unconfirmed recovery retains the available safety snapshot', async () => {
  const { waitForPlanResult } = await import('../ui/src/views/site-control/plan-recovery.js');
  const result = await waitForPlanResult('unfinished-plan', {
    read: async () => ({ ok: true, data: { status: 'applying', recovery_snapshot_id: 42 } }), pause: async () => {}, attempts: 2,
  });
  assert.equal(result.status, 'unknown');
  assert.equal(result.recovery_snapshot_id, 42);
});

test('Deterministic mutation failure retains restoration and recovery details', async () => {
  const state = await import('../ui/src/views/site-control/state.js');
  orch.setOrchState('idle');
  state.setGraphModel(state.normalizeGraph({ nodes: [{ id: 'page:about.php', type: 'page', label: 'About', meta: { slug: 'about' } }], edges: [] }));
  state.setSelectedNodeId('page:about.php');
  state.setRenameMode(true);
  state.setRenameApplyState('error');
  state.setRenameError({ message: 'A write failed.', restored: false, snapshotId: 42 });
  const html = renderControlPanel();
  assert.match(html, /A write failed/);
  assert.match(html, /incomplete/);
  assert.match(html, /42/);
  state.resetRenameState();
});

test('Static-analysis warnings qualify impact counts and identify the source', async () => {
  const state = await import('../ui/src/views/site-control/state.js');
  orch.setOrchState('idle');
  state.setSelectedNodeId(null);
  state.setGraphModel(state.normalizeGraph({ nodes: [], edges: [], summary: { warnings: 1 }, warnings: [{ file: '_partials/nav.php', message: 'Dynamic PHP link needs review.' }] }));
  const html = renderControlPanel();
  assert.match(html, /indexed references/);
  assert.match(html, /_partials\/nav\.php/);
  assert.match(html, /Dynamic PHP link needs review/);
});

test('Change URL preserves a nested parent and directs reparenting to Move', () => {
  assert.equal(panel.validateProposalUrl('/services/people', '/services/team').valid, true);
  const reparent = panel.validateProposalUrl('/people', '/services/team');
  assert.equal(reparent.valid, false);
  assert.match(reparent.message, /Move/);
  assert.equal(panel.validateProposalUrl('/company', '/about').valid, true);
  assert.equal(panel.validateProposalUrl('/services/../people', '/services/team').valid, false);
});

test('Repeated inbound references retain their complete source identity and occurrence count', () => {
  const items = [12, 28].map(lineNumber => ({
    nodeId: 'page:services/our-team.php', label: 'Our experienced specialist team', type: 'page',
    sourcePath: 'services/our-team.php', lineNumber, meta: '→ /services/about?from=team#details', context: 'body',
  }));
  const html = panel.renderRelationCard('Linked From', items).html;
  assert.match(html, /vs-impact-card-count">2<\/span>/);
  assert.equal((html.match(/data-node-id="page:services\/our-team\.php"/g) || []).length, 2);
  assert.match(html, /services\/our-team\.php:12/);
  assert.match(html, /services\/our-team\.php:28/);
  assert.equal((html.match(/Our experienced specialist team/g) || []).length, 2);
  assert.equal((html.match(/\/services\/about\?from=team#details/g) || []).length, 2);
});

test('A resolved apply separates selected snapshot recovery from the historical failed rollback', () => {
  orch.setOrchState('apply_failed');
  orch.setOrchResult({ rollback_clean: false, restoration_verified: false,
    recovery_resolved: true, recovery_resolved_by_snapshot: 73,
    changed_files: ['about.php'], remaining_changed_files: ['about.php'], recovery_snapshot_id: 42 });
  const html = renderControlPanel();
  assert.match(html, /snapshot #73/);
  assert.match(html, /Files reported by the failed attempt/);
  assert.doesNotMatch(html, /Some changes remain|Files requiring review|restored and verified|Restore snapshot 42/);
});

test('Delete explains snapshot recovery separately from revision Undo', async () => {
  const state = await import('../ui/src/views/site-control/state.js');
  orch.setOrchState('idle');
  state.setGraphModel(state.normalizeGraph({ nodes: [{ id: 'page:about.php', type: 'page', label: 'About', meta: { slug: 'about' } }], edges: [] }));
  state.setSelectedNodeId('page:about.php');
  state.setDeleteMode(true);
  const html = renderControlPanel();
  assert.doesNotMatch(html, /This action cannot be undone/);
  assert.match(html, /safety snapshot/);
  assert.match(html, /Designs → History/);
  assert.match(html, /Chat Undo/);
  state.resetDeleteState();
});
