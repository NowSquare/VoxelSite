/** Captured source preconditions; this module never fetches a fresher version at save time. */
import { api, apiOperation } from '../api.js';
const snapshots = new Map();
const lists = new Map();
export async function readAuthoringFile(path) {
  const response = await api.get(`/files/content?path=${encodeURIComponent(path)}`);
  if (response.ok && response.data?.content_sha256 && response.data?.draft_version) {
    const source = response.data;
    snapshots.set(`${path}:${source.content_sha256}`, { hash: source.content_sha256, version: source.draft_version, content: source.content });
  }
  return response;
}
export function captureAuthoringList(data) {
  if (!data?.draft_version) return;
  for (const file of data.files || []) lists.set(file.path, { hash: file.content_sha256, version: data.draft_version });
}
const conflict = () => ({ ok: false, error: { code: 'content_conflict', message: 'Read and review this source before changing it.' } });
export async function saveAuthoringFile(body, source = null) {
  let captured;
  if (source?.draft_version) captured = { hash: source.content_sha256, version: source.draft_version };
  else if (typeof source === 'string') {
    const bytes = new TextEncoder().encode(source);
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), x => x.toString(16).padStart(2, '0')).join('');
    captured = snapshots.get(`${body.path}:${hash}`);
  } else captured = snapshots.get(`${body.path}:${body.expected_content_sha256}`);
  if (!captured?.hash || !captured?.version) return conflict();
  const input = { path: body.path, content: body.content, expected_content_sha256: captured.hash, base_draft_version: body.base_draft_version || captured.version };
  const response = await apiOperation('/files/content', input, 'put', { retainInput: false, publicInput: { path: input.path, expected_content_sha256: input.expected_content_sha256, base_draft_version: input.base_draft_version } });
  if (response.ok && response.data?.content_sha256) snapshots.set(`${body.path}:${response.data.content_sha256}`, { hash: response.data.content_sha256, version: response.data.draft_version, content: body.content });
  return response;
}
export function createAuthoringFile(path, version) {
  if (!version) return Promise.resolve(conflict());
  return apiOperation('/files/create', { path, base_draft_version: version, expected_content_sha256: null });
}
export function deleteAuthoringFile(path) {
  const captured = lists.get(path);
  if (!captured?.hash) return Promise.resolve(conflict());
  return apiOperation(`/files?path=${encodeURIComponent(path)}`, { base_draft_version: captured.version, expected_content_sha256: captured.hash }, 'delete');
}
export function compileAuthoringStyles(version) {
  if (!version) return Promise.resolve(conflict());
  return apiOperation('/files/compile-tailwind', { base_draft_version: version });
}
