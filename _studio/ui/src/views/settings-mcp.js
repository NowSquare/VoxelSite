import { escapeHtml, escapeAttr } from '../helpers.js';
import { apiOperation, pendingOperationInput } from '../../api.js';

export const MCP_ACCESS = {
  read: 'Read website files and preview the draft.',
  edit: 'Read and edit the draft, upload assets, and restore draft versions.',
  publish: 'Edit the draft and publish changes to the live website.',
};

const MCP_CLIENTS = { codex: 'Codex', claude: 'Claude Code', other: 'Other MCP client' };
const FIRST_TASK = 'Read the website and summarize its pages, design, and granted access. Suggest one useful draft improvement. Do not change or publish anything yet.';
const clientId = name => Object.keys(MCP_CLIENTS).find(id => MCP_CLIENTS[id] === name) || 'other';
const defaultLabel = (client, site) => `${MCP_CLIENTS[client] || MCP_CLIENTS.other} · ${site || 'My website'}`.slice(0, 100);
const timestamp = value => typeof value === 'number' && Number.isFinite(value)
  ? new Date(value * 1000).toLocaleString() : 'not recorded';

// These snippets contain variable names only. The one-time credential never
// enters a snippet, a command, or the retained mutation input.
export function mcpClientSetup(client, endpoint) {
  if (client === 'codex') return {
    instructions: 'Add this to ~/.codex/config.toml. Set VOXELSITE_MCP_TOKEN in the environment that starts Codex, then restart Codex and open /mcp.',
    snippet: `[mcp_servers.voxelsite]\nurl = ${JSON.stringify(endpoint || '')}\nbearer_token_env_var = "VOXELSITE_MCP_TOKEN"`,
    url: 'https://developers.openai.com/codex/mcp',
  };
  if (client === 'claude') return {
    instructions: 'Merge this server into .mcp.json in your project. Set VOXELSITE_MCP_TOKEN in the environment that starts Claude Code, then restart it and approve the server in /mcp.',
    snippet: JSON.stringify({ mcpServers: { voxelsite: { type: 'http', url: endpoint || '', headers: { Authorization: 'Bearer ${VOXELSITE_MCP_TOKEN}' } } } }, null, 2),
    url: 'https://code.claude.com/docs/en/mcp#environment-variable-expansion-in-mcpjson',
  };
  return {
    instructions: 'Choose a client that supports Streamable HTTP and bearer authentication. Use its secret store or documented environment-variable setting. If it cannot send an Authorization header, use Codex or Claude Code.',
    snippet: `Transport: Streamable HTTP\nURL: ${endpoint || 'Finish private draft setup first'}\nAuthentication: Bearer token from your client’s secret store`, url: null,
  };
}

function connectionStatus(connection, data) {
  const state = connection.connection_state || (connection.revoked_at ? 'revoked' : !data.enabled ? 'disabled' : 'waiting');
  const client = connection.client_name || 'your AI tool';
  const authCause = {
    audience_mismatch: 'This credential was used with the wrong interface. Use the Studio MCP endpoint and a Studio MCP credential.',
    credential_revoked: 'This credential has been revoked. Create a replacement.',
    credential_expired: 'This credential has expired. Create a replacement.',
    account_inactive: 'The account for this credential is inactive. Choose an active account.',
  }[connection.last_auth_failure?.code];
  const states = {
    waiting: [`Waiting for ${client} to connect`, 'Open the client with your credential, then check the result here.', 'View setup', 'setup'],
    authenticated: ['Authenticated request received', 'Studio verified this credential. Its granted access is listed below.', 'Start the first task', 'task'],
    used: [`Last used ${timestamp(connection.last_used_at)}`, 'This is the last successful request, not an active session.', 'View permissions', 'permissions'],
    authentication_failed: ['Authentication failed', authCause || 'Check the client’s credential variable and whether your host forwards the Authorization header. Replace the credential if it is unavailable.', 'Review setup', 'setup'],
    permission_denied: ['Insufficient permission', `The request${connection.last_permission_denial?.tool ? ` for ${connection.last_permission_denial.tool}` : ''} needs ${connection.last_permission_denial?.required_scopes?.join(', ') || 'access this credential does not have'}. Ask the owner for the required access or use a permitted task.`, 'Choose a permitted task', 'task'],
    disabled: connection.disabled_reason === 'account_inactive'
      ? ['Account is inactive', 'This credential cannot make requests for an inactive account.', 'Choose an active account', 'account']
      : ['Connections are disabled', data.configuration_override ? 'Ask your host administrator to enable connections in the server configuration.' : 'Enable connections to allow requests. Your credentials are retained.', data.configuration_override ? 'Review setup' : 'Enable connections', data.configuration_override ? 'setup' : 'enable'],
    revoked: ['Credential revoked', 'This credential no longer works. Remove it from your client.', 'Create a replacement', 'replace'],
    expired: ['Credential expired', 'Create a replacement and update your client’s secret.', 'Create a replacement', 'replace'],
  };
  return { state, values: states[state] || ['Status unavailable', 'The last result could not be determined. Check the result before creating another credential.', 'Check result', 'refresh'] };
}

export function renderMcpConnections(data, currentUserId, page = {}) {
  const esc = escapeHtml;
  const accounts = data.accounts || [];
  const accountOptions = accounts.map(user => `<option value="${Number(user.id)}" ${Number(user.id) === Number(currentUserId) ? 'selected' : ''}>${esc(user.name)} · ${esc(user.role)}</option>`).join('');
  const connections = data.connections || [];
  const rows = connections.map(connection => {
    const { state, values: [status, detail, action, kind] } = connectionStatus(connection, data);
    const inactive = ['revoked', 'expired'].includes(state);
    const account = accounts.find(user => Number(user.id) === Number(connection.user_id));
    return `<li class="py-4 border-b border-vs-border-subtle">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="text-sm font-medium text-vs-text-primary break-words">${esc(connection.label)}</p>
          <p class="text-xs text-vs-text-tertiary mt-1">${esc(account?.name || 'Unavailable account')}${connection.expires_at ? ` · Expires ${esc(timestamp(connection.expires_at))}` : ''}</p>
          <p class="text-sm text-vs-text-secondary mt-2">${esc(status)}</p>
          <p class="text-xs text-vs-text-tertiary mt-1">${esc(detail)}</p>
          ${connection.first_authenticated_at ? `<p class="text-xs text-vs-text-tertiary mt-1">First authenticated ${esc(timestamp(connection.first_authenticated_at))} · Last authenticated ${esc(timestamp(connection.last_authenticated_at))}</p>` : ''}
          ${connection.last_used_at && state !== 'used' ? `<p class="text-xs text-vs-text-tertiary mt-1">Last used ${esc(timestamp(connection.last_used_at))}</p>` : ''}
          ${state === 'authentication_failed' && connection.last_auth_failure?.at ? `<p class="text-xs text-vs-text-tertiary mt-1">Authentication failure ${esc(timestamp(connection.last_auth_failure.at))}</p>` : ''}
          <button type="button" class="vs-btn vs-btn-ghost vs-btn-sm mt-2" data-mcp-next="${kind}" data-connection="${Number(connection.id)}">${esc(action)}</button>
          <details id="mcp-permissions-${Number(connection.id)}" class="text-xs text-vs-text-tertiary mt-2"><summary class="cursor-pointer">View permissions</summary>
            <p class="mt-2 break-words">${(connection.scopes || []).map(esc).join(', ')}</p>
          </details>
        </div>
        ${inactive ? '' : `<button type="button" class="vs-btn vs-btn-ghost vs-btn-sm shrink-0" data-mcp-revoke="${Number(connection.id)}" aria-label="Revoke ${escapeAttr(connection.label)}">Revoke</button>`}
      </div>
    </li>`;
  }).join('');
  const legacy = (data.rest_connections || []).filter(key => !key.user_id);
  const pager = prefix => {
    const info = data.pages?.[prefix], offset = Number(page[`${prefix}_offset`] || 0);
    if (!info || (!offset && info.next_offset === null)) return '';
    return `<div class="flex items-center gap-3 mt-3">
      <span class="text-xs text-vs-text-tertiary">${info.total} ${prefix === 'rest' ? 'REST keys' : 'connections'}</span>
      ${offset ? `<button type="button" class="vs-btn vs-btn-secondary vs-btn-sm" data-mcp-page="${prefix}" data-offset="${Math.max(0, offset - 50)}">Previous</button>` : ''}
      ${info.next_offset !== null ? `<button type="button" class="vs-btn vs-btn-secondary vs-btn-sm" data-mcp-page="${prefix}" data-offset="${info.next_offset}">Next</button>` : ''}</div>`;
  };
  return `
    <div class="flex items-start justify-between gap-4">
      <div><h2 class="vs-settings-card-title">Connect your AI tool</h2>
        <p class="vs-settings-card-subtitle">Work on this website from a connected AI conversation.</p></div>
      <span class="text-xs text-vs-text-tertiary shrink-0">${data.enabled ? 'Enabled' : 'Disabled'}</span>
    </div>
    <p class="text-sm text-vs-text-secondary mb-4">Your conversation stays in your AI tool. Changes appear in Studio’s draft and history. Publishing needs separate access.</p>
    <p class="text-xs text-vs-text-tertiary mb-4">${esc(data.billing || '')}</p>
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <button type="button" id="mcp-toggle" class="vs-btn vs-btn-secondary vs-btn-sm" ${data.configuration_override || (!data.enabled && (!data.workspace_ready || !data.endpoint)) ? 'disabled' : ''}>${data.enabled ? 'Disable connections' : 'Enable connections'}</button>
      <button type="button" id="mcp-check-result" class="vs-btn vs-btn-ghost vs-btn-sm">Check result</button>
      ${!data.workspace_ready || !data.endpoint ? '<a href="./workspace.php" class="text-sm text-vs-text-secondary underline">Finish private draft setup</a>' : ''}
      ${data.configuration_override ? '<span class="text-xs text-vs-text-tertiary">Access is controlled by the server configuration.</span>' : ''}
    </div>
    ${data.endpoint ? `<label for="mcp-endpoint" class="block text-sm font-medium text-vs-text-secondary mb-1">Studio MCP endpoint</label>
      <div class="flex gap-2 mb-2"><input id="mcp-endpoint" type="text" readonly class="vs-input min-w-0" value="${escapeAttr(data.endpoint)}" spellcheck="false">
        <button type="button" id="mcp-copy-endpoint" class="vs-btn vs-btn-secondary vs-btn-sm shrink-0">Copy URL</button></div>
      <p class="text-xs text-vs-text-tertiary mb-4">Use remote HTTP with a bearer credential. Enter the credential in your client’s secret settings. Keep it out of shared configuration.</p>` : ''}
    <p class="text-xs text-vs-text-tertiary mb-4">${data.qualification?.status === 'qualified' ? `Client compatibility qualified for ${esc(data.qualification.product_version || 'this release')}.` : 'No qualified client run is recorded for this release. Setup below follows the client’s documented method.'}</p>
    <div id="mcp-feedback" class="text-sm text-vs-text-secondary mb-4" role="status" aria-live="polite"></div>
    <form id="mcp-create" class="flex flex-col gap-4">
      <fieldset><legend class="text-sm font-medium text-vs-text-secondary mb-2">Choose your AI tool</legend>
        <div class="flex flex-wrap gap-4">${Object.entries(MCP_CLIENTS).map(([id, name]) => `<label class="flex items-center gap-2 text-sm text-vs-text-secondary"><input type="radio" name="client" value="${id}" ${id === 'codex' ? 'checked' : ''}>${name}</label>`).join('')}</div></fieldset>
      <details id="mcp-connection-options"><summary class="text-sm text-vs-text-secondary cursor-pointer">Connection name, account, and expiry</summary>
      <div class="mt-3 mb-3"><label for="mcp-label" class="block text-sm font-medium text-vs-text-secondary mb-1">Connection name</label>
        <input id="mcp-label" name="label" class="vs-input" maxlength="100" value="${escapeAttr(defaultLabel('codex', data.site_name))}" autocomplete="off"></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label for="mcp-account" class="block text-sm font-medium text-vs-text-secondary mb-1">Account</label>
          <select id="mcp-account" name="user_id" class="vs-input">${accountOptions}</select></div>
        <div><label for="mcp-expiry" class="block text-sm font-medium text-vs-text-secondary mb-1">Expires after</label>
          <select id="mcp-expiry" name="expiry_days" class="vs-input"><option value="7">7 days</option><option value="30" selected>30 days</option><option value="90">90 days</option></select></div>
      </div>
      </details>
      <fieldset class="min-w-0"><legend class="text-sm font-medium text-vs-text-secondary mb-2">Access</legend>
        <div class="flex flex-col gap-3">${Object.entries(MCP_ACCESS).map(([preset, description]) => `
          <label class="flex items-start gap-3 cursor-pointer"><input type="radio" name="preset" value="${preset}" ${preset === 'edit' ? 'checked' : ''} class="mt-1">
            <span><span class="block text-sm font-medium text-vs-text-primary">${preset === 'read' ? 'Read the site' : preset === 'edit' ? 'Edit drafts' : 'Edit and publish'}</span>
              <span class="block text-xs text-vs-text-tertiary mt-1">${description}</span></span></label>`).join('')}</div>
      </fieldset>
      <p class="text-xs text-vs-text-tertiary">Draft editing allows trusted PHP code. Grant it only to a tool and account you trust with your server.</p>
      <label class="flex items-start gap-3 cursor-pointer"><input id="mcp-live-restore" name="live_restore" type="checkbox" class="mt-1">
        <span class="text-sm text-vs-text-secondary">Also allow restoring the live website
          <span class="block text-xs text-vs-text-tertiary mt-1">Owner accounts only. This can replace the published version while preserving the draft.</span></span></label>
      <details><summary class="text-sm text-vs-text-secondary cursor-pointer">Additional access</summary>
        <p class="text-xs text-vs-text-tertiary mt-2 mb-3">Choose only what this connection needs. Administrative approval still happens separately in Studio.</p>
        <div class="flex flex-col gap-3">${Object.entries(data.access_groups || {}).map(([id, group])=>`
          <label class="flex items-start gap-3 cursor-pointer"><input type="checkbox" name="access_groups" value="${escapeAttr(id)}" class="mt-1">
            <span class="text-sm text-vs-text-secondary">${esc(group.label)}
              <span class="block text-xs text-vs-text-tertiary mt-1">${esc(group.description)}</span></span></label>`).join('')}</div>
      </details>
      <div><button type="submit" class="vs-btn vs-btn-primary vs-btn-sm" ${!data.endpoint || !data.workspace_ready ? 'disabled' : ''}>Create credential</button></div>
    </form>
    <div id="mcp-secret" class="hidden mt-4" role="region" aria-label="New connection credential">
      <p class="text-sm font-medium text-vs-text-primary">Save this credential now</p>
      <p class="text-xs text-vs-text-tertiary mt-1 mb-2">It is shown once. Anyone with this credential has the access you selected.</p>
      <label class="sr-only" for="mcp-secret-value">New credential</label>
      <div class="flex gap-2"><input id="mcp-secret-value" type="password" readonly autocomplete="off" class="vs-input min-w-0" spellcheck="false">
        <button id="mcp-copy-secret" type="button" class="vs-btn vs-btn-secondary vs-btn-sm shrink-0">Copy credential</button></div>
      <div class="flex items-center gap-4 mt-2"><label class="text-xs text-vs-text-secondary"><input id="mcp-show-secret" type="checkbox"> Show credential</label>
        <button id="mcp-dismiss-secret" type="button" class="vs-btn vs-btn-ghost vs-btn-sm">I’ve saved it</button></div>
    </div>
    <section id="mcp-setup" class="mt-6" aria-label="Client setup">
      <h3 class="text-sm font-medium text-vs-text-primary">Add this website to your AI tool</h3>
      <p id="mcp-setup-instructions" class="text-xs text-vs-text-secondary mt-2">${esc(mcpClientSetup('codex', data.endpoint).instructions)}</p>
      <label for="mcp-config" class="block text-xs text-vs-text-secondary mt-3 mb-1">Client configuration</label>
      <textarea id="mcp-config" readonly rows="6" class="vs-input w-full font-mono text-xs" spellcheck="false">${esc(mcpClientSetup('codex', data.endpoint).snippet)}</textarea>
      <div class="flex flex-wrap items-center gap-3 mt-2"><button id="mcp-copy-config" type="button" class="vs-btn vs-btn-secondary vs-btn-sm" ${!data.endpoint ? 'disabled' : ''}>Copy configuration</button>
        <a id="mcp-setup-docs" href="https://developers.openai.com/codex/mcp" target="_blank" rel="noopener noreferrer" class="text-xs text-vs-text-secondary underline">Official setup guide</a></div>
      <p class="text-xs text-vs-text-tertiary mt-2">Requires Streamable HTTP with bearer authentication. Copying configuration does not confirm a connection. Open your client, then choose Check result.</p>
      <details class="mt-3"><summary class="text-xs text-vs-text-secondary cursor-pointer">Set the credential without putting it in shell history</summary>
        <p class="text-xs text-vs-text-tertiary mt-2">Use your secret manager to supply VOXELSITE_MCP_TOKEN, or run this in Bash or Zsh, paste the credential at the hidden prompt, and start your client from the same terminal. Never paste the credential into chat.</p>
        <pre class="text-xs whitespace-pre-wrap break-words mt-2">printf 'Credential: '; IFS= read -r -s VOXELSITE_MCP_TOKEN; printf '\\n'; export VOXELSITE_MCP_TOKEN</pre></details>
    </section>
    <section class="mt-6" aria-label="First useful task"><h3 class="text-sm font-medium text-vs-text-primary">Try your first task</h3>
      <p id="mcp-first-task" class="text-sm text-vs-text-secondary mt-2">${FIRST_TASK}</p>
      <button id="mcp-copy-task" type="button" class="vs-btn vs-btn-secondary vs-btn-sm mt-2">Copy first task</button></section>
    <div class="mt-6"><h3 class="text-sm font-medium text-vs-text-primary">Your connections</h3>
      ${rows ? `<ul>${rows}</ul>` : '<p class="text-sm text-vs-text-tertiary mt-2">Create a credential, then add this website in your AI tool.</p>'}${pager('mcp')}</div>
    ${(data.pending_secrets || []).length ? `<section class="mt-6" aria-label="Credentials ready to save">
      <h3 class="text-sm font-medium text-vs-text-primary">Credentials ready to save</h3>
      <p class="text-xs text-vs-text-tertiary mt-2">These were created from requests you approved. Claim and save each credential once within 15 minutes. If a response is lost, revoke that credential and create a replacement.</p>
      <ul>${data.pending_secrets.map(item=>`<li class="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-vs-border-subtle">
        <span class="text-sm text-vs-text-secondary break-words">${esc(item.label)} · ${item.audience==='rest'?'REST API':'Studio MCP'}</span>
        <button type="button" class="vs-btn vs-btn-secondary vs-btn-sm" data-mcp-reveal="${escapeAttr(item.plan_id)}">Claim credential</button>
      </li>`).join('')}</ul></section>`:''}
    ${legacy.length ? `<section class="mt-6" aria-labelledby="rest-migration-heading"><h3 id="rest-migration-heading" class="text-sm font-medium text-vs-text-primary">Connect existing REST keys to an account</h3>
      <p class="text-xs text-vs-text-tertiary mt-2">These REST keys could not be connected automatically. Choose an account before they can read, edit or publish. Their API audience and granted scopes stay the same.</p>
      ${legacy.map(key => `<div class="flex flex-wrap items-center gap-2 mt-3"><span class="text-sm text-vs-text-secondary">${esc(key.label)}</span>
        <label class="sr-only" for="mcp-rest-${Number(key.id)}">Account for ${esc(key.label)}</label>
        <select class="vs-input" id="mcp-rest-${Number(key.id)}">${accountOptions}</select>
        <button type="button" class="vs-btn vs-btn-secondary vs-btn-sm" data-mcp-bind="${Number(key.id)}">Connect account</button></div>`).join('')}</section>` : ''}
    ${pager('rest')}
    ${(data.approvals || []).length ? `<section class="mt-6" aria-label="Administrative approvals">
      <h3 class="text-sm font-medium text-vs-text-primary">Requests for your approval</h3>
      <p class="text-xs text-vs-text-tertiary mt-2">Review the exact effects below. Approval lasts five minutes and applies only to this connection and operation. The connection must then apply it.</p>
      <ul class="mt-3">${data.approvals.map(plan=>`<li class="py-4 border-b border-vs-border-subtle">
        <p class="text-sm font-medium text-vs-text-primary break-words">${esc(plan.review.summary)}</p>
        <p class="text-xs text-vs-text-tertiary mt-1">${esc(plan.requested_by.connection_name)} · ${plan.status==='approved'?'Approved; waiting for application':'Awaiting your review'}</p>
        <ul class="list-disc pl-5 text-sm text-vs-text-secondary mt-2">${plan.review.effects.map(effect=>`<li>${esc(effect)}</li>`).join('')}</ul>
        <p class="text-xs text-vs-text-tertiary mt-2">Preserved: ${plan.review.preserved.map(esc).join(', ')}.</p>
        ${(plan.review.files || []).length?`<details class="text-xs text-vs-text-secondary mt-2"><summary class="cursor-pointer">Exact file changes (${plan.review.files.length})</summary>
          <ul class="max-h-64 overflow-auto mt-2">${plan.review.files.map(file=>`<li class="py-1 break-all">${esc(file.effect)} · ${esc(file.path)}
            <span class="block text-vs-text-ghost">${esc(file.before_hash || 'absent')} → ${esc(file.after_hash || 'absent')}</span></li>`).join('')}</ul></details>`:''}
        ${(plan.review.tables || []).length?`<p class="text-xs text-vs-text-secondary mt-2">Records to clear: ${plan.review.tables.map(table=>`${esc(table.name)} (${Number(table.rows)})`).join(', ')}.</p>`:''}
        ${plan.review.final_boundary?`<p class="text-sm text-vs-text-secondary mt-2">${esc(plan.review.final_boundary)}</p>`:''}
        ${plan.review.secret_fields.length?`<p class="text-xs text-vs-text-tertiary mt-2">Write-only fields: ${plan.review.secret_fields.map(esc).join(', ')}. Their values remain hidden.</p>`:''}
        <details class="text-xs text-vs-text-tertiary mt-2"><summary class="cursor-pointer">Review identity</summary>
          <p class="break-all mt-1">${esc(plan.operation_id)}<br>${esc(plan.digest)}</p></details>
        <div class="flex flex-wrap gap-2 mt-3">
          <button type="button" class="vs-btn vs-btn-primary vs-btn-sm" data-mcp-approve="${escapeAttr(plan.plan_id)}" data-digest="${escapeAttr(plan.digest)}">Approve exact changes</button>
          <button type="button" class="vs-btn vs-btn-secondary vs-btn-sm" data-mcp-cancel="${escapeAttr(plan.plan_id)}" data-digest="${escapeAttr(plan.digest)}">Decline</button>
        </div></li>`).join('')}</ul></section>`:''}
  `;
}

export async function bindMcpConnections(container, { api, user, clipboard = navigator.clipboard, page = {}, client = 'codex',
  operation = apiOperation, pending = pendingOperationInput }) {
  if (!container) return;
  if (user?.role !== 'owner') {
    container.innerHTML = '<h2 class="vs-settings-card-title">Connect your AI tool</h2><p class="vs-settings-card-subtitle">Ask the site owner to create a connection for your account.</p>';
    return;
  }
  const query = new URLSearchParams(page).toString();
  let response;
  try { response = await api.get(`/settings/mcp${query ? `?${query}` : ''}`); }
  catch { response = { ok: false }; }
  if (!container.isConnected) return;
  if (!response.ok) {
    const previous = container.querySelector('#mcp-feedback');
    if (previous) {
      previous.textContent = 'Could not check the result. Last known states are still shown. Choose Check result to try again.';
      previous.classList.add('text-vs-error');
      return;
    }
    container.innerHTML = '<h2 class="vs-settings-card-title">Connect your AI tool</h2><p class="text-sm text-vs-error" role="alert">Connections could not be loaded.</p><button id="mcp-load-retry" type="button" class="vs-btn vs-btn-secondary vs-btn-sm mt-3">Check result</button>';
    container.querySelector('#mcp-load-retry').addEventListener('click', () => bindMcpConnections(container, { api, user, clipboard, page, client, operation, pending }));
    return;
  }
  const data = response.data;
  container.innerHTML = renderMcpConnections(data, user.id, page);
  let busy = false;
  let selectedClient = Object.hasOwn(MCP_CLIENTS, client) ? client : 'codex';
  const rebind = nextPage => bindMcpConnections(container, { api, user, clipboard, page: nextPage || {}, client: selectedClient, operation, pending });
  container.querySelectorAll('[data-mcp-page]').forEach(button => button.addEventListener('click', () => {
    if (secret) { feedback('Save the credential and choose “I’ve saved it” before leaving this result.'); return; }
    const prefix = button.dataset.mcpPage;
    refresh({ ...page, [`${prefix}_offset`]: button.dataset.offset, [`${prefix}_version`]: data.pages[prefix].inventory_version });
  }));
  const feedback = (message, error = false) => {
    const output = container.querySelector('#mcp-feedback');
    output.textContent = message;
    output.classList.toggle('text-vs-error', error);
  };
  const copy = async (value, label) => {
    try { await clipboard.writeText(value); feedback(`${label} copied.`); }
    catch { feedback('Copy is unavailable. Select the field and copy it manually.', true); }
  };
  let secret = '';
  const clearSecret = () => {
    secret = '';
    container.querySelector('#mcp-secret-value').value = '';
    container.querySelector('#mcp-secret').classList.add('hidden');
  };
  const showSecret = created => {
    secret = created.key;
    const input = container.querySelector('#mcp-secret-value');
    input.value = secret;
    input.type = 'password';
    container.querySelector('#mcp-show-secret').checked = false;
    container.querySelector('#mcp-secret').classList.remove('hidden');
    container.querySelector('#mcp-create').querySelector('[type="submit"]').disabled = true;
    input.focus();
  };
  const perform = async (button, operation, success, reload = true) => {
    if (busy) return null;
    if (secret) { feedback('Save the credential and choose “I’ve saved it” before changing connection access.'); return null; }
    busy = true;
    button.disabled = true;
    try {
      const result = await operation();
      if (!result.ok) { feedback(result.error?.message || 'The connection could not be updated.', true); return null; }
      if (reload) {
        await rebind();
        (container.querySelector(button.id === 'mcp-toggle' ? '#mcp-toggle' : '#mcp-check-result'))?.focus();
        feedback(success);
      }
      else feedback(success);
      return result.data;
    } catch { feedback('The request could not finish. Reload Settings to check its result.', true); return null; }
    finally { busy = false; if (button.isConnected) button.disabled = false; }
  };
  container.querySelector('#mcp-toggle')?.addEventListener('click', event => perform(event.currentTarget,
    () => operation('/settings/mcp', pending('/settings/mcp') || { enabled: !data.enabled, version: data.version }), 'Connection access updated.'));
  container.querySelector('#mcp-copy-endpoint')?.addEventListener('click', () => copy(data.endpoint, 'Endpoint'));
  const refresh = async (nextPage = page) => {
    if (busy) return;
    if (secret) { feedback('Save the credential and choose “I’ve saved it” before checking the result.'); return; }
    busy = true;
    try { await rebind(nextPage); container.querySelector('#mcp-check-result')?.focus(); }
    finally { busy = false; }
  };
  container.querySelector('#mcp-check-result').addEventListener('click', () => refresh());
  const setupChanged = () => {
    const setup = mcpClientSetup(selectedClient, data.endpoint);
    container.querySelector('#mcp-config').value = setup.snippet;
    container.querySelector('#mcp-setup-instructions').textContent = setup.instructions;
    const link = container.querySelector('#mcp-setup-docs');
    link.href = setup.url || '#mcp-setup';
    link.classList.toggle('hidden', !setup.url);
    container.querySelectorAll('[name="client"]').forEach(input => { input.checked = input.value === selectedClient; });
  };
  let automaticLabel = defaultLabel('codex', data.site_name);
  const chooseClient = next => {
    const label = container.querySelector('#mcp-label');
    if (!label.value.trim() || label.value === automaticLabel) label.value = defaultLabel(next, data.site_name);
    automaticLabel = defaultLabel(next, data.site_name);
    selectedClient = next;
    setupChanged();
  };
  container.querySelectorAll('[name="client"]').forEach(input => input.addEventListener('change', () => {
    if (input.checked) chooseClient(input.value);
  }));
  chooseClient(selectedClient);
  container.querySelector('#mcp-copy-config').addEventListener('click', () => copy(mcpClientSetup(selectedClient, data.endpoint).snippet, 'Configuration'));
  container.querySelector('#mcp-copy-task').addEventListener('click', () => copy(FIRST_TASK, 'First task'));
  container.querySelectorAll('[data-mcp-next]').forEach(button => button.addEventListener('click', () => {
    const connection = connectionsById(button.dataset.connection);
    switch (button.dataset.mcpNext) {
      case 'setup': chooseClient(clientId(connection?.client_name)); container.querySelector('#mcp-config').focus(); break;
      case 'replace': chooseClient(clientId(connection?.client_name)); container.querySelector('#mcp-create').querySelector('[type="submit"]').focus(); break;
      case 'account': container.querySelector('#mcp-connection-options').open = true; container.querySelector('#mcp-account').focus(); break;
      case 'enable': return container.querySelector('#mcp-toggle').click();
      case 'permissions': {
        const details = container.querySelector(`#mcp-permissions-${Number(button.dataset.connection)}`);
        details.open = true; details.querySelector('summary').focus(); break;
      }
      case 'task': return copy(FIRST_TASK, 'First task');
      default: return refresh();
    }
  }));
  function connectionsById(id) { return (data.connections || []).find(item => String(item.id) === id); }
  container.querySelector('#mcp-copy-secret').addEventListener('click', () => { if (secret) copy(secret, 'Credential'); });
  container.querySelector('#mcp-show-secret').addEventListener('change', event => {
    container.querySelector('#mcp-secret-value').type = event.target.checked ? 'text' : 'password';
  });
  container.querySelector('#mcp-dismiss-secret').addEventListener('click', async () => {
    clearSecret();
    await rebind();
    container.querySelector('#mcp-check-result')?.focus();
  });
  const accountChanged = () => {
    const role = data.accounts.find(account => Number(account.id) === Number(container.querySelector('#mcp-account').value))?.role;
    const live = container.querySelector('#mcp-live-restore');
    live.disabled = role !== 'owner';
    if (live.disabled) live.checked = false;
    container.querySelectorAll('[name="preset"]').forEach(input => { input.disabled = role === 'viewer' && input.value !== 'read'; });
    container.querySelectorAll('[name="access_groups"]').forEach(input => {
      input.disabled = !(data.access_groups?.[input.value]?.roles || []).includes(role);
      if (input.disabled) input.checked = false;
    });
    if (role === 'viewer') container.querySelector('[name="preset"][value="read"]').checked = true;
  };
  container.querySelector('#mcp-account').addEventListener('change', accountChanged);
  accountChanged();
  let creating = false;
  let acknowledgedCreate = false;
  const creationEndpoint = '/settings/mcp/connections';
  const createForm = container.querySelector('#mcp-create');
  const submit = createForm.querySelector('[type="submit"]');
  const current = () => container.isConnected && container.querySelector('#mcp-create') === createForm;
  if (pending(creationEndpoint)) {
    submit.textContent = 'Retry creation';
    feedback('A creation result is still unknown. Retry creation to check the same request before starting another.');
  }
  const reveal = async (planId, button = null) => {
    if (button) button.disabled = true;
    try {
      const result = await api.post(`/settings/mcp/approvals/${encodeURIComponent(planId)}/reveal`, {});
      if (!current()) return;
      if (!result.ok || typeof result.data?.key !== 'string' || !result.data.key) {
        feedback('The credential cannot be shown again. Check result, revoke that credential, and create a replacement.', true);
        submit.disabled = true;
        container.querySelector('#mcp-check-result').focus();
        return;
      }
      showSecret(result.data);
      feedback('Save this credential once, then follow the client setup below. Waiting for an authenticated request.');
      if (button) button.textContent = 'Revealed';
    } catch {
      if (!current()) return;
      feedback('The credential response was not received. Check result before retrying. If it is no longer ready to save, revoke it and create a replacement.', true);
      submit.disabled = true;
      container.querySelector('#mcp-check-result').focus();
    }
  };
  createForm.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (busy || creating || acknowledgedCreate || secret || !data.endpoint || !data.workspace_ready) return;
    const retained = pending(creationEndpoint);
    if (!retained && !form.reportValidity()) return;
    creating = true;
    busy = true;
    submit.disabled = true;
    clearSecret();
    const fields = new FormData(form);
    const input = retained || {
      user_id: Number(fields.get('user_id')), preset: fields.get('preset'), label: (fields.get('label') || '').trim() || defaultLabel(selectedClient, data.site_name),
      client_name: MCP_CLIENTS[selectedClient],
      expiry_days: Number(fields.get('expiry_days')),
      live_restore: fields.get('live_restore') === 'on',
      access_groups: fields.getAll('access_groups'),
    };
    let acknowledged = false;
    try {
      const result = await operation(creationEndpoint, input);
      if (!current()) return;
      if (!result.ok) {
        feedback(result.error?.message || 'Creation could not finish. Retry the same request to check its result.', true);
        return;
      }
      acknowledged = true;
      acknowledgedCreate = true;
      if (!result.data?.plan_id) { feedback('Creation was acknowledged. Check result to find the credential ready to save.', true); return; }
      await reveal(result.data.plan_id);
    } catch {
      if (current()) feedback('The creation result was not received. Retry creation to check the same request; do not create a second credential.', true);
    } finally {
      creating = false;
      busy = false;
      if (current()) {
        submit.disabled = acknowledged;
        if (!acknowledged && pending(creationEndpoint)) submit.textContent = 'Retry creation';
      }
    }
  });
  container.querySelectorAll('[data-mcp-reveal]').forEach(button => button.addEventListener('click',async () => {
    if (button.disabled || busy || creating || secret) return;
    busy = true;
    clearSecret();
    try { await reveal(button.dataset.mcpReveal, button); }
    finally { busy = false; }
  }));
  container.querySelectorAll('[data-mcp-revoke]').forEach(button => button.addEventListener('click', () =>
    perform(button, () => {
      const endpoint = `/settings/mcp/connections/${button.dataset.mcpRevoke}`;
      return operation(endpoint, pending(endpoint, 'delete') || { version: data.connections.find(item => String(item.id) === button.dataset.mcpRevoke)?.version }, 'delete');
    }, 'Connection revoked.')));
  for (const action of ['approve','cancel']) container.querySelectorAll(`[data-mcp-${action}]`).forEach(button =>
    button.addEventListener('click',()=>perform(button,()=>api.post(`/settings/mcp/approvals/${button.dataset[action==='approve'?'mcpApprove':'mcpCancel']}/${action}`,
      { digest:button.dataset.digest }),action==='approve'?'Exact changes approved for five minutes.':'Request declined.')));
  container.querySelectorAll('[data-mcp-bind]').forEach(button => button.addEventListener('click', () =>
    perform(button, () => operation('/settings/mcp/rest-bind', pending('/settings/mcp/rest-bind') || {
      credential_id: Number(button.dataset.mcpBind),
      version: data.rest_connections.find(item => String(item.id) === button.dataset.mcpBind)?.version,
      user_id: Number(container.querySelector(`#mcp-rest-${button.dataset.mcpBind}`).value),
    }), 'REST account connected.')));
}
