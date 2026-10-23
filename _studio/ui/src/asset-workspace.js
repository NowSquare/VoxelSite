import { studioStorageKey } from '../installation-url.js';

/** Serial uploads use the displayed draft, then only versions committed by this batch. */
export async function uploadReviewedAssets(files, version, account, send, storage, currentAccount) {
  if (!/^draft:\d+$/.test(version || '')) return { ok: false, error: { code: 'content_conflict', message: 'Load the asset list before uploading.' } };
  if (!files.length || files.length > 10) return { ok: false, error: { code: 'size_limit', message: 'Choose between 1 and 10 files.' } };
  const digest = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('');
  const manifest = [];
  for (const file of files) {
    if (file.size > 10485760) return { ok: false, error: { code: 'size_limit', message: 'Each asset must be at most 10 MiB.' } };
    manifest.push({ name: file.name, bytes: file.size, sha256: await digest(await file.arrayBuffer()) });
  }
  if (currentAccount() !== account) return { ok: false, error: { code: 'permission_denied', message: 'The signed-in account changed. Open Assets again.' } };
  const key = studioStorageKey(`vs_asset_upload:${account}`), fingerprint = JSON.stringify(manifest);
  let pending;
  try { pending = JSON.parse(storage.getItem(key) || 'null'); } catch {}
  if (pending && pending.fingerprint !== fingerprint) return { ok: false, error: { code: 'operation_pending', message: 'Choose the same files to finish the earlier upload before starting another batch.' } };
  pending ||= { id: `assets_${crypto.randomUUID().replaceAll('-', '')}`, fingerprint, index: 0, version };
  const save = () => { try { storage.setItem(key, JSON.stringify(pending)); } catch {} };
  save();
  for (let index = pending.index; index < files.length; index++) {
    if (currentAccount() !== account) return { ok: false, error: { code: 'permission_denied', message: 'The signed-in account changed. Open Assets again.' } };
    const response = await send(files[index], { request_id: `${pending.id}_${index}`, base_draft_version: pending.version });
    if (!response.ok) {
      if (['invalid_schema', 'content_conflict'].includes(response.error?.code) && !response.data?.operation) {
        try { storage.removeItem(key); } catch {}
      }
      return response;
    }
    const operation = response.data?.operation || response.data?.uploaded?.[0]?.operation;
    if (operation?.status !== 'succeeded' || !/^draft:\d+$/.test(operation.after_version || '')) {
      return { ok: false, error: { code: 'operation_pending', message: 'The upload still needs attention. Retry the same files.' } };
    }
    pending.index = index + 1; pending.version = operation.after_version; save();
  }
  try { storage.removeItem(key); } catch {}
  return { ok: true, data: { count: files.length, draft_version: pending.version } };
}
