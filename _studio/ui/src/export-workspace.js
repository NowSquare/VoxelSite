import { studioStorageKey } from '../installation-url.js';

const versionPattern = /^(release_[a-f0-9]{32}|legacy:[a-f0-9]{64})$/;
const keyFor = (account, format) => studioStorageKey(`vs_export:${account}:${format}`);

export function pendingExport(format, account, storage) {
  try { return JSON.parse(storage.getItem(keyFor(account, format)) || 'null'); } catch { return null; }
}

/** Keep a lost response bound to the original archive, including across a reload. */
export async function downloadReviewedExport(format, version, account, send, storage, currentAccount) {
  if (!['php', 'html'].includes(format) || !versionPattern.test(version || '')) {
    return { ok: false, error: { code: 'content_conflict', message: 'Open Download again to review the published version.' } };
  }
  const key = keyFor(account, format);
  const input = pendingExport(format, account, storage) || {
    operation_id: `export_${crypto.randomUUID().replaceAll('-', '')}`, version, format,
  };
  if (currentAccount() !== account) return { ok: false, error: { code: 'permission_denied', message: 'The signed-in account changed. Open Download again.' } };
  try { storage.setItem(key, JSON.stringify(input)); } catch {}
  const response = await send(input);
  if (!response.ok) {
    let error;
    try { error = (await response.json()).error; } catch {}
    if (['content_conflict', 'export_expired', 'invalid_schema'].includes(error?.code)) {
      try { storage.removeItem(key); } catch {}
    }
    return { ok: false, error: error || { code: 'download_failed', message: 'Download failed. Retry to retrieve the same archive.' } };
  }
  const blob = await response.blob();
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())),
    byte => byte.toString(16).padStart(2, '0')).join('');
  if (response.headers.get('X-Content-SHA256') !== hash ||
      response.headers.get('X-VoxelSite-Export-Version') !== input.version) {
    return { ok: false, error: { code: 'download_incomplete', message: 'The download could not be verified. Retry to retrieve the same archive.' } };
  }
  if (currentAccount() !== account) return { ok: false, error: { code: 'permission_denied', message: 'The signed-in account changed. Open Download again.' } };
  const disposition = response.headers.get('Content-Disposition') || '';
  const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] || `site-${format}.zip`;
  try { storage.removeItem(key); } catch {}
  return { ok: true, data: { blob, filename, version: input.version } };
}
