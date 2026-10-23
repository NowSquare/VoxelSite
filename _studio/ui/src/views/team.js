/**
 * VoxelSite Studio — Team View
 *
 * Team member management: list, add, edit, delete, password reset.
 * Includes role permissions modal. Owner-only access.
 *
 * Event architecture:
 *   - initTeamView() attaches all listeners ONCE (topbar buttons,
 *     modals, Escape key, delegated row-action handler on #team-list)
 *   - loadTeamMembers() is fetch-and-render ONLY — no listener work
 *   - Row buttons (Edit / Reset PW / Remove) use event delegation
 *     on #team-list, so dynamically injected rows work immediately
 */

import { api, apiOperation, pendingOperationInput } from '../../api.js';
import { readTeam, teamChange } from '../team-workspace.js';
import { store } from '../../state.js';
import { icons } from '../icons.js';
import { escapeHtml, escapeAttr, generatePassword } from '../helpers.js';
import { showToast } from '../ui/toasts.js';
import { showConfirmModal } from '../ui/modals.js';

/** Track whether initTeamView() has been called this mount cycle */
let _teamInitialized = false;
let _teamMembers = new Map();
let _editingMember = null;
let _passwordMember = null;
let _submitting = false;
let _modalTrigger = null;


export function renderTeamView() {
  _teamInitialized = false;
  setTimeout(() => {
    initTeamView();
    loadTeamMembers();
  }, 0);

  return `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 style="font-size: 20px; font-weight: 650; color: var(--vs-text-primary); letter-spacing: -0.025em; margin: 0;">Team</h1>
          <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 4px 0 0;">Manage who has access to this Studio.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-show-roles" class="vs-btn vs-btn-ghost vs-btn-sm" title="View role permissions">
            ${icons.shield} Roles
          </button>
          <button id="btn-add-member" class="vs-btn vs-btn-primary vs-btn-sm">
            ${icons.userPlus || icons.plus} Add Member
          </button>
        </div>
      </div>

      <div class="vs-team-table">
        <div class="vs-team-table-header">
          <span>Member</span>
          <span>Role</span>
          <span>Last active</span>
          <span></span>
        </div>
        <div id="team-list">
          <div style="padding: 32px 20px; text-align: center; font-size: 13px; color: var(--vs-text-ghost);">Loading team…</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Team modals — rendered at appRoot level so they sit above the topbar (z-100)
 * and the statusbar. `position: fixed; inset: 0` covers the full viewport.
 */
export function renderTeamModals() {
  return `
    <!-- Add/Edit Member Modal -->
    <div id="team-modal" class="vs-team-modal hidden" role="dialog" aria-modal="true" aria-labelledby="team-modal-title">
      <div class="vs-team-modal-backdrop" data-team-modal-overlay></div>
      <div class="vs-team-modal-card">
        <div class="px-6 py-5 border-b border-vs-border-subtle">
          <h2 id="team-modal-title" class="text-base font-semibold text-vs-text-primary" style="letter-spacing: -0.01em;">Add Team Member</h2>
          <p class="text-xs text-vs-text-ghost mt-1">They'll be able to sign in with these credentials.</p>
        </div>
        <div class="px-6 py-5 flex flex-col gap-4">
          <input type="hidden" id="team-edit-id" value="" />
          <div>
            <label class="vs-input-label" for="team-member-name">Name</label>
            <input type="text" id="team-member-name" class="vs-input" placeholder="Jane Smith" />
          </div>
          <div>
            <label class="vs-input-label" for="team-member-email">Email</label>
            <input type="email" id="team-member-email" class="vs-input" placeholder="jane@example.com" />
          </div>
          <div>
            <label class="vs-input-label" for="team-member-role">Role</label>
            <select id="team-member-role" class="vs-input">
              <option value="editor">Editor — can edit and publish</option>
              <option value="viewer">Viewer — read-only access</option>
            </select>
          </div>
          <div id="team-password-section">
            <label class="vs-input-label" for="team-member-password">Temporary Password</label>
            <div class="flex gap-2">
              <input type="text" id="team-member-password" class="vs-input flex-1 font-mono" placeholder="At least 8 characters" />
              <button id="btn-generate-password" class="vs-btn vs-btn-ghost vs-btn-sm" title="Generate random password">
                ${icons.rotateCcw}
              </button>
            </div>
            <p class="text-2xs text-vs-text-ghost mt-1.5">Share this password with the new team member. They can change it from their profile.</p>
          </div>
          <div id="team-modal-error" class="hidden text-sm text-vs-error" role="alert" tabindex="-1"></div>
          <button id="btn-team-review" class="vs-btn vs-btn-ghost vs-btn-sm" style="display:none">Discard these edits and review saved account</button>
        </div>
        <div class="px-6 py-4 border-t border-vs-border-subtle flex justify-end gap-2">
          <button id="btn-team-cancel" class="vs-btn vs-btn-ghost vs-btn-sm">Cancel</button>
          <button id="btn-team-save" class="vs-btn vs-btn-primary vs-btn-sm">Add Member</button>
        </div>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div id="team-pw-modal" class="vs-team-modal hidden" role="dialog" aria-modal="true" aria-labelledby="team-pw-title">
      <div class="vs-team-modal-backdrop" data-team-pw-overlay></div>
      <div class="vs-team-modal-card">
        <div class="px-6 py-5 border-b border-vs-border-subtle">
          <h2 id="team-pw-title" class="text-base font-semibold text-vs-text-primary" style="letter-spacing: -0.01em;">Reset Password</h2>
          <p id="team-pw-modal-subtitle" class="text-xs text-vs-text-ghost mt-1"></p>
        </div>
        <div class="px-6 py-5 flex flex-col gap-4">
          <input type="hidden" id="team-pw-user-id" value="" />
          <div>
            <label class="vs-input-label" for="team-new-password">New Password</label>
            <div class="flex gap-2">
              <input type="text" id="team-new-password" class="vs-input flex-1 font-mono" placeholder="At least 8 characters" />
              <button id="btn-pw-generate" class="vs-btn vs-btn-ghost vs-btn-sm" title="Generate random password">
                ${icons.rotateCcw}
              </button>
            </div>
          </div>
          <div id="team-pw-error" class="hidden text-sm text-vs-error" role="alert" tabindex="-1"></div>
          <button id="btn-pw-review" class="vs-btn vs-btn-ghost vs-btn-sm" style="display:none">Discard this reset and review current account</button>
        </div>
        <div class="px-6 py-4 border-t border-vs-border-subtle flex justify-end gap-2">
          <button id="btn-pw-cancel" class="vs-btn vs-btn-ghost vs-btn-sm">Cancel</button>
          <button id="btn-pw-save" class="vs-btn vs-btn-primary vs-btn-sm">Reset Password</button>
        </div>
      </div>
    </div>

    <!-- Role Permissions Modal -->
    <div id="team-roles-modal" class="vs-team-modal hidden" role="dialog" aria-modal="true" aria-labelledby="team-roles-title">
      <div class="vs-team-modal-backdrop" data-team-roles-overlay></div>
      <div class="vs-team-modal-card" style="width: min(520px, calc(100vw - 2rem));">
        <div class="px-6 py-5 border-b border-vs-border-subtle">
          <h2 id="team-roles-title" class="text-base font-semibold text-vs-text-primary" style="letter-spacing: -0.01em;">Role Permissions</h2>
          <p class="text-xs text-vs-text-ghost mt-1">What each role can do in this Studio.</p>
        </div>
        <div class="px-6 py-5">
          <div class="vs-role-matrix">
            <div class="vs-role-matrix-header">
              <span class="vs-role-matrix-label"></span>
              <span class="vs-role-badge vs-role-owner">Owner</span>
              <span class="vs-role-badge vs-role-editor">Editor</span>
              <span class="vs-role-badge vs-role-viewer">Viewer</span>
            </div>
            ${[
              ['Use AI chat',           true,  true,  false],
              ['Edit pages & code',     true,  true,  false],
              ['Site workspace',         true,  true,  false],
              ['Use notes',              true,  true,  false],
              ['View board',             true,  true,  true],
              ['Edit board',             true,  true,  false],
              ['Manage assets',         true,  true,  false],
              ['Publish changes',       true,  true,  false],
              ['View form submissions', true,  true,  true],
              ['Preview the site',      true,  true,  true],
              ['Manage designs',        true,  true,  false],
              ['Change settings',       true,  false, false],
              ['Manage team members',   true,  false, false],
            ].map(([label, owner, editor, viewer]) => `
              <div class="vs-role-matrix-row">
                <span class="vs-role-matrix-label">${label}</span>
                <span class="vs-role-matrix-cell">${owner  ? '✓' : '—'}</span>
                <span class="vs-role-matrix-cell">${editor ? '✓' : '—'}</span>
                <span class="vs-role-matrix-cell">${viewer ? '✓' : '—'}</span>
              </div>
            `).join('')}
          </div>
          <p style="font-size: 11px; color: var(--vs-text-ghost); margin: 12px 0 0; line-height: 1.45;">Notes are private — each team member has their own notes, separate from other users. Board is shared across the Studio team.</p>
        </div>
        <div class="px-6 py-4 border-t border-vs-border-subtle flex justify-end">
          <button id="btn-roles-close" class="vs-btn vs-btn-ghost vs-btn-sm">Close</button>
        </div>
      </div>
    </div>
  `;
}


function renderTeamMember(member) {
  const currentUser = store.get('user');
  const isCurrentUser = member.id === currentUser?.id;
  const isOwnerMember = member.role === 'owner';

  const roleBadgeClass = member.role === 'owner' ? 'vs-role-owner'
    : member.role === 'editor' ? 'vs-role-editor' : 'vs-role-viewer';

  const avatarClass = member.role === 'owner' ? 'vs-team-avatar-owner'
    : member.role === 'editor' ? 'vs-team-avatar-editor' : 'vs-team-avatar-viewer';

  const lastLogin = member.last_login_at
    ? new Date(member.last_login_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Never';

  const actions = isOwnerMember ? '<div></div>' : `
    <div class="vs-team-row-actions">
      <button class="vs-team-action team-edit-btn" data-id="${member.id}" title="Edit">
        ${icons.pencil}
      </button>
      <button class="vs-team-action team-pw-btn" data-id="${member.id}" data-name="${escapeAttr(member.name)}" title="Reset password">
        ${icons.lock}
      </button>
      <button class="vs-team-action vs-team-action-danger team-delete-btn" data-id="${member.id}" data-name="${escapeAttr(member.name)}" title="Remove">
        ${icons.trash}
      </button>
    </div>
  `;

  return `
    <div class="vs-team-row">
      <div class="vs-team-row-identity">
        <div class="vs-team-avatar ${avatarClass}">
          ${escapeHtml(member.name).charAt(0).toUpperCase()}
        </div>
        <div style="min-width: 0;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); letter-spacing: -0.01em;">${escapeHtml(member.name)}</span>
            ${isCurrentUser ? '<span style="font-size: 10px; color: var(--vs-text-ghost);">you</span>' : ''}
          </div>
          <div style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(member.email)}</div>
        </div>
      </div>
      <div>
        <span class="vs-role-badge ${roleBadgeClass} vs-role-badge-clickable" data-role-info>${member.role}</span>
      </div>
      <div class="vs-team-row-meta">${lastLogin}</div>
      ${actions}
    </div>
  `;
}


/**
 * Fetch and render team members. No event binding — that's initTeamView's job.
 */
async function loadTeamMembers() {
  const listEl = document.getElementById('team-list');
  if (!listEl) return;

  const { ok, data, error } = await readTeam(api.get);

  if (!ok) {
    listEl.innerHTML = `<div class="text-sm text-vs-error py-8 text-center">${escapeHtml(error?.message || 'Failed to load team members.')}</div>`;
    return;
  }

  const members = data?.members || [];
  _teamMembers = new Map(members.map(member => [member.id, member]));

  if (members.length === 0) {
    listEl.innerHTML = `<div class="text-sm text-vs-text-ghost py-8 text-center">No team members yet.</div>`;
  } else {
    listEl.innerHTML = members.map(m => renderTeamMember(m)).join('');
  }
}


/**
 * One-time event setup. Called once per mount cycle.
 *
 * Uses event delegation on #team-list so dynamically inserted rows
 * (after add/edit/delete) work immediately without rebinding.
 */
function initTeamView() {
  if (_teamInitialized) return;
  _teamInitialized = true;

  // ── Topbar buttons (stable DOM, never replaced) ──

  document.getElementById('btn-add-member')?.addEventListener('click', () => {
    openTeamModal();
  });

  document.getElementById('btn-show-roles')?.addEventListener('click', openRolesModal);

  // ── Delegated row-action handler on #team-list ──
  // Covers: edit, delete, password reset, role badge click
  // These survive innerHTML replacement because the listener is on the container.

  const listEl = document.getElementById('team-list');
  if (listEl) {
    listEl.addEventListener('click', async (e) => {
      const target = /** @type {HTMLElement} */ (e.target);

      // Role badge → permissions modal
      const roleBadge = target.closest('[data-role-info]');
      if (roleBadge) {
        openRolesModal();
        return;
      }

      // Edit button
      const editBtn = target.closest('.team-edit-btn');
      if (editBtn) {
        const member = _teamMembers.get(Number(editBtn.dataset.id));
        if (member) openTeamModal({ ...member });
        return;
      }

      // Delete button
      const deleteBtn = target.closest('.team-delete-btn');
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        const name = deleteBtn.dataset.name;
        const member = _teamMembers.get(Number(id));
        if (!member?.version) return;
        const confirmed = await showConfirmModal({
          title: 'Remove Team Member',
          description: `Remove ${name} from the team? They will lose access to this Studio immediately.`,
          confirmLabel: 'Remove',
          danger: true,
        });
        if (!confirmed) return;
        const pending = pendingOperationInput(`/team/${id}`, 'delete');
        const change = teamChange('delete', {}, { ...member, version: pending?.version || member.version });
        const { ok, error } = await apiOperation(change.endpoint, change.body, change.method, change.options);
        if (ok) {
          showToast(`${name} has been removed.`, 'success');
          await loadTeamMembers();
          document.getElementById('btn-add-member')?.focus();
        } else {
          if (error?.code === 'content_conflict') await loadTeamMembers();
          showToast(error?.message || 'Failed to remove member.', 'error');
        }
        return;
      }

      // Password reset button
      const pwBtn = target.closest('.team-pw-btn');
      if (pwBtn) {
        const id = pwBtn.dataset.id;
        const name = pwBtn.dataset.name;
        openPasswordResetModal(id, name);
        return;
      }
    });
  }

  // ── Modal overlay clicks — only close if mousedown AND click both land on backdrop ──

  [
    ['[data-team-modal-overlay]', closeTeamModal],
    ['[data-team-pw-overlay]', closePasswordModal],
    ['[data-team-roles-overlay]', closeRolesModal],
  ].forEach(([sel, fn]) => {
    const el = document.querySelector(sel);
    if (!el) return;
    let mdt = null;
    el.addEventListener('mousedown', (e) => { mdt = e.target; });
    el.addEventListener('click', (e) => { if (e.target === el && mdt === el) fn(); });
  });

  // ── Modal buttons ──

  document.getElementById('btn-team-cancel')?.addEventListener('click', closeTeamModal);
  document.getElementById('btn-pw-cancel')?.addEventListener('click', closePasswordModal);
  document.getElementById('btn-roles-close')?.addEventListener('click', closeRolesModal);

  // ── Generate password buttons ──

  document.getElementById('btn-generate-password')?.addEventListener('click', () => {
    const input = document.getElementById('team-member-password');
    if (input) input.value = generatePassword();
  });
  document.getElementById('btn-pw-generate')?.addEventListener('click', () => {
    const input = document.getElementById('team-new-password');
    if (input) input.value = generatePassword();
  });

  // ── Save handlers ──

  document.getElementById('btn-team-save')?.addEventListener('click', saveTeamMember);
  document.getElementById('btn-pw-save')?.addEventListener('click', saveTeamPassword);
  document.getElementById('btn-team-review')?.addEventListener('click', () => reviewCurrentMember(false));
  document.getElementById('btn-pw-review')?.addEventListener('click', () => reviewCurrentMember(true));

  // ── Escape key (global, but only one listener) ──

  document.addEventListener('keydown', handleTeamEscape);
}

function handleTeamEscape(e) {
  const activeModal = document.querySelector('.vs-team-modal:not(.hidden)');
  if (e.key === 'Tab' && activeModal) {
    const controls = [...activeModal.querySelectorAll('input:not([type="hidden"]), select, button, [tabindex="0"]')]
      .filter(control => !control.disabled && control.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (!first) { e.preventDefault(); return; }
    if (e.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !controls.includes(document.activeElement))) {
      e.preventDefault(); first.focus();
    }
    return;
  }
  if (e.key !== 'Escape') return;
  if (_submitting) return;
  const teamModal = document.getElementById('team-modal');
  const pwModal = document.getElementById('team-pw-modal');
  const rolesModal = document.getElementById('team-roles-modal');

  if (rolesModal && !rolesModal.classList.contains('hidden')) {
    closeRolesModal();
    e.stopPropagation();
  } else if (pwModal && !pwModal.classList.contains('hidden')) {
    closePasswordModal();
    e.stopPropagation();
  } else if (teamModal && !teamModal.classList.contains('hidden')) {
    closeTeamModal();
    e.stopPropagation();
  }
}

function openRolesModal() {
  _modalTrigger = document.activeElement;
  document.getElementById('team-roles-modal')?.classList.remove('hidden');
  document.querySelector('#team-roles-modal button')?.focus();
}

function closeRolesModal() {
  document.getElementById('team-roles-modal')?.classList.add('hidden');
  if (_modalTrigger?.isConnected) _modalTrigger.focus();
}

function openTeamModal(member = null) {
  const modal = document.getElementById('team-modal');
  const title = document.getElementById('team-modal-title');
  const saveBtn = document.getElementById('btn-team-save');
  const editId = document.getElementById('team-edit-id');
  const pwSection = document.getElementById('team-password-section');
  const errorEl = document.getElementById('team-modal-error');

  if (!modal) return;
  _modalTrigger = document.activeElement;
  const pending = pendingOperationInput(member ? `/team/${member.id}` : '/team', member ? 'put' : 'post');
  _editingMember = member ? { ...member, version: pending?.version || member.version } : null;

  // Reset
  document.getElementById('team-member-name').value = pending?.name ?? member?.name ?? '';
  document.getElementById('team-member-email').value = pending?.email ?? member?.email ?? '';
  document.getElementById('team-member-role').value = pending?.role ?? member?.role ?? 'editor';
  document.getElementById('team-member-password').value = '';
  errorEl.classList.add('hidden');
  errorEl.textContent = '';
  document.getElementById('btn-team-review').style.display = 'none';

  if (member) {
    // Edit mode
    title.textContent = 'Edit Team Member';
    saveBtn.textContent = 'Save Changes';
    editId.value = member.id;
    pwSection.style.display = 'none';
  } else {
    // Add mode
    title.textContent = 'Add Team Member';
    saveBtn.textContent = 'Add Member';
    editId.value = '';
    pwSection.style.display = '';
    // Pre-generate a password
    document.getElementById('team-member-password').value = pending ? pending.password || '' : generatePassword();
    if (pending && !pending.password) {
      errorEl.textContent = 'An earlier request may have completed. Enter the same password to check its result.';
      errorEl.classList.remove('hidden');
    }
  }

  modal.classList.remove('hidden');
  document.getElementById('team-member-name')?.focus();
}

function closeTeamModal() {
  if (_submitting) return;
  document.getElementById('team-modal')?.classList.add('hidden');
  const password = document.getElementById('team-member-password');
  if (password) password.value = '';
  _editingMember = null;
  if (_modalTrigger?.isConnected) _modalTrigger.focus();
}

function openPasswordResetModal(userId, userName) {
  const modal = document.getElementById('team-pw-modal');
  const subtitle = document.getElementById('team-pw-modal-subtitle');
  const errorEl = document.getElementById('team-pw-error');

  if (!modal) return;
  const member = _teamMembers.get(Number(userId));
  if (!member?.version) return;
  _modalTrigger = document.activeElement;
  const pending = pendingOperationInput(`/team/${userId}/password`);
  _passwordMember = { ...member, version: pending?.version || member.version };

  document.getElementById('team-pw-user-id').value = userId;
  document.getElementById('team-new-password').value = pending ? pending.password || '' : generatePassword();
  subtitle.textContent = `Set a new password for ${userName}.`;
  errorEl.classList.add('hidden');
  errorEl.textContent = '';
  document.getElementById('btn-pw-review').style.display = 'none';
  if (pending && !pending.password) {
    errorEl.textContent = 'An earlier reset may have completed. Enter the same password to check its result.';
    errorEl.classList.remove('hidden');
  }

  modal.classList.remove('hidden');
  document.getElementById('team-new-password')?.focus();
}

function closePasswordModal() {
  if (_submitting) return;
  document.getElementById('team-pw-modal')?.classList.add('hidden');
  const password = document.getElementById('team-new-password');
  if (password) password.value = '';
  _passwordMember = null;
  if (_modalTrigger?.isConnected) _modalTrigger.focus();
}

async function reviewCurrentMember(passwordReset) {
  if (_submitting) return;
  const member = passwordReset ? _passwordMember : _editingMember;
  if (!member) return;
  const errorEl = document.getElementById(passwordReset ? 'team-pw-error' : 'team-modal-error');
  const controls = [...document.querySelectorAll(passwordReset ? '#team-pw-modal input, #team-pw-modal button' : '#team-modal input, #team-modal select, #team-modal button')];
  _submitting = true;
  controls.forEach(control => { control.disabled = true; });
  const result = await readTeam(endpoint => api.get(endpoint));
  _submitting = false;
  controls.forEach(control => { control.disabled = false; });
  if (!result.ok) { errorEl.textContent = result.error?.message || 'Cannot read the current account.'; errorEl.focus(); return; }
  const current = result.data.members.find(item => item.id === member.id);
  if (!current) { errorEl.textContent = 'This account has been removed. Close this window to return to the team.'; errorEl.focus(); return; }
  _teamMembers.set(current.id, current);
  if (passwordReset) openPasswordResetModal(current.id, current.name);
  else openTeamModal(current);
  _modalTrigger = document.querySelector(`.team-edit-btn[data-id="${current.id}"]`);
}

async function saveTeamMember() {
  if (_submitting) return;
  const editId = document.getElementById('team-edit-id')?.value;
  const name = document.getElementById('team-member-name')?.value?.trim();
  const email = document.getElementById('team-member-email')?.value?.trim();
  const role = document.getElementById('team-member-role')?.value;
  const password = document.getElementById('team-member-password')?.value;
  const errorEl = document.getElementById('team-modal-error');
  const saveBtn = document.getElementById('btn-team-save');

  // Validate
  if (!name || name.length < 2) {
    errorEl.textContent = 'Name must be at least 2 characters.';
    errorEl.classList.remove('hidden');
    return;
  }
  if (!email || !email.includes('@')) {
    errorEl.textContent = 'Please enter a valid email address.';
    errorEl.classList.remove('hidden');
    return;
  }
  if (!editId && (!password || password.length < 8)) {
    errorEl.textContent = 'Password must be at least 8 characters.';
    errorEl.classList.remove('hidden');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = editId ? 'Saving…' : 'Adding…';
  _submitting = true;
  const controls = [...document.querySelectorAll('#team-modal input, #team-modal select, #team-modal button')];
  controls.forEach(control => { control.disabled = true; });

  const change = teamChange(editId ? 'update' : 'create', editId ? { name, email, role } : { name, email, role, password }, _editingMember);
  const result = await apiOperation(change.endpoint, change.body, change.method, change.options);

  _submitting = false;
  controls.forEach(control => { control.disabled = false; });
  saveBtn.disabled = false;
  saveBtn.textContent = editId ? 'Save Changes' : 'Add Member';

  if (result.ok) {
    closeTeamModal();
    showToast(editId ? 'Member updated.' : `${name} has been added to the team.`, 'success');
    await loadTeamMembers();
    document.querySelector(`.team-edit-btn[data-id="${result.data.member.id}"]`)?.focus();
  } else {
    errorEl.textContent = result.error?.message || 'Something went wrong.';
    errorEl.classList.remove('hidden');
    document.getElementById('btn-team-review').style.display = result.error?.code === 'content_conflict' && editId ? '' : 'none';
    errorEl.focus();
  }
}

async function saveTeamPassword() {
  if (_submitting) return;
  const userId = document.getElementById('team-pw-user-id')?.value;
  const password = document.getElementById('team-new-password')?.value;
  const errorEl = document.getElementById('team-pw-error');
  const saveBtn = document.getElementById('btn-pw-save');

  if (!password || password.length < 8) {
    errorEl.textContent = 'Password must be at least 8 characters.';
    errorEl.classList.remove('hidden');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Resetting…';
  _submitting = true;
  const controls = [...document.querySelectorAll('#team-pw-modal input, #team-pw-modal button')];
  controls.forEach(control => { control.disabled = true; });

  const change = teamChange('password', { password }, _passwordMember);
  const { ok, error } = await apiOperation(change.endpoint, change.body, change.method, change.options);

  _submitting = false;
  controls.forEach(control => { control.disabled = false; });
  saveBtn.disabled = false;
  saveBtn.textContent = 'Reset Password';

  if (ok) {
    closePasswordModal();
    showToast('Password has been reset.', 'success');
    await loadTeamMembers();
    document.querySelector(`.team-pw-btn[data-id="${userId}"]`)?.focus();
  } else {
    errorEl.textContent = error?.message || 'Failed to reset password.';
    errorEl.classList.remove('hidden');
    document.getElementById('btn-pw-review').style.display = error?.code === 'content_conflict' ? '' : 'none';
    errorEl.focus();
  }
}
