import { studioStorageKey } from '../installation-url.js';

/** Reviewed updates retain exact identities across lost responses and account changes. */
export function updateClient({ api, runtime, ownerId, currentOwner, storage = globalThis.sessionStorage, crypto = globalThis.crypto }) {
  const key = studioStorageKey(`vs-reviewed-update:${ownerId}`);
  let state = {}; let busy = false;
  try { state = JSON.parse(storage?.getItem(key) || '{}'); } catch {}
  const guard = () => { if (currentOwner() !== ownerId) throw new Error('The Studio account changed. Reopen Updates from the current account.'); };
  const save = () => { guard(); storage?.setItem(key, JSON.stringify(state)); };
  const call = async (path, input, bridge = false) => {
    guard(); const response = await (bridge ? runtime(input) : api.post(path, input)); guard();
    if (!response?.ok) { const error = new Error(response?.error?.message || 'The update request was not acknowledged. Retry the same step.'); error.code = response?.error?.code; throw error; }
    return response.data;
  };
  const run = async callback => { guard(); if (busy) throw new Error('Wait for the current update request.'); busy = true; try { return await callback(); } finally { busy = false; } };
  const id = () => { if (!crypto?.randomUUID) throw new Error('Secure request identities are unavailable in this browser.'); return crypto.randomUUID(); };
  const select = source => {
    if (state.source && JSON.stringify(state.source) !== JSON.stringify(source)) throw new Error('Finish the retained update or clear its completed review before selecting another package.');
    if (!state.source) { state = { source, request_id: id(), operation_id: id() }; save(); }
  };
  const hash = async bytes => { if (!crypto?.subtle) throw new Error('This browser cannot verify update upload hashes.'); return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(x => x.toString(16).padStart(2, '0')).join(''); };
  const base64 = bytes => { let text = ''; for (let i = 0; i < bytes.length; i += 8192) text += String.fromCharCode(...bytes.subarray(i, i + 8192)); return btoa(text); };
  return {
    state: () => { guard(); return structuredClone(state); },
    stageLocal: filename => run(async () => { select({ kind: 'local', filename }); state.package = await call('/update/apply-local', { request_id: state.request_id, filename }); save(); return state.package; }),
    stageGit: () => run(async () => { select({ kind: 'git' }); state.package = await call('/update/git-update', { request_id: state.request_id }); save(); return state.package; }),
    stageFile: file => run(async () => {
      if (file.size < 1 || file.size > 134217728 || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,119}\.zip$/.test(file.name)) throw new Error('Choose a ZIP package with a simple filename, up to 128 MiB.');
      const bytes = new Uint8Array(await file.arrayBuffer()); guard(); const sha256 = await hash(bytes); guard(); select({ kind: 'upload', filename: file.name, bytes: bytes.length, sha256 });
      state.package = await call('/update/package-begin', { request_id: state.request_id, filename: file.name, bytes: bytes.length, sha256 }); save();
      for (let offset = state.package.received_bytes; offset < bytes.length;) {
        const chunk = bytes.subarray(offset, Math.min(offset + 262144, bytes.length));
        const input = { package_id: state.package.package_id, request_id: `${state.request_id}_${offset}`, offset, data_base64: base64(chunk), sha256: await hash(chunk) };
        state.package = await call('/update/package-chunk', input); save();
        if (state.package.received_bytes <= offset) throw new Error('The server did not acknowledge this upload chunk.'); offset = state.package.received_bytes;
      }
      return state.package;
    }),
    validate: () => run(async () => { state.package = await call('/update/package-finish', { package_id: state.package.package_id, expected_index: state.package.next_index }); save(); return state.package; }),
    review: () => run(async () => { state.review = await call('/update/prepare', { package_id: state.package.package_id, operation_id: state.operation_id }); save(); return state.review; }),
    approve: () => run(async () => {
      const exact = { plan_id: state.review.plan_id, digest: state.review.digest };
      if (state.activationRequested) {
        try { state.operation = await call(null, { action: 'status', operation_id: state.operation_id }, true); save(); return state.operation; } catch (error) { guard(); }
      }
      if (!state.approved) { state.review = await call('/update/approve', exact); state.approved = true; save(); }
      state.activationRequested = true; save(); state.operation = await call('/update/apply', exact); save(); return state.operation;
    }),
    status: () => run(async () => { state.operation = await call(null, { action: 'status', operation_id: state.operation_id }, true); save(); return state.operation; }),
    continue: () => run(async () => { state.operation = await call(null, { action: 'continue', operation_id: state.operation_id, checkpoint: state.operation.checkpoint }, true); save(); return state.operation; }),
    clear: () => { guard(); if (state.activationRequested && !['succeeded', 'failed_restored', 'expired', 'cancelled'].includes(state.operation?.status)) throw new Error('Read and finish or recover the retained operation before clearing it.'); state = {}; storage?.removeItem(key); },
  };
}
