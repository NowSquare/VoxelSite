/** Capture exactly the member the owner reviewed; never fetch a replacement version at save time. */
export function teamChange(action, fields, member = null) {
  const supported = ['create', 'update', 'delete', 'password'];
  if (!supported.includes(action)) throw new Error('Unknown team action.');
  if (action !== 'create' && (!member?.id || !member.version)) throw new Error('Open the current team member before making this change.');
  const endpoint = action === 'create' ? '/team' : `/team/${member.id}${action === 'password' ? '/password' : ''}`;
  const method = action === 'update' ? 'put' : action === 'delete' ? 'delete' : 'post';
  const body = { ...fields, ...(member ? { version: member.version } : {}) };
  const { password, ...publicInput } = body;
  return { endpoint, method, body, options: { retainInput: false, publicInput } };
}

/** Team inventory is bounded and pinned while draining the existing list UI. */
export async function readTeam(get) {
  let result = await get('/team?limit=50');
  if (!result.ok) return result;
  const members = [...result.data.members], version = result.data.inventory_version;
  let offset = result.data.next_offset, pages = 1;
  while (offset !== null && offset !== undefined) {
    if (++pages > 200 || members.length >= 10000) return { ok: false, error: { code: 'size_limit', message: 'The team list exceeds the supported limit.' } };
    const next = await get(`/team?limit=50&offset=${offset}&inventory_version=${encodeURIComponent(version)}`);
    if (!next.ok) return next;
    if (next.data.inventory_version !== version || (next.data.next_offset !== null && next.data.next_offset <= offset)) {
      return { ok: false, error: { code: 'content_conflict', message: 'The team changed while loading. Open the list again.' } };
    }
    members.push(...next.data.members); offset = next.data.next_offset;
  }
  return { ...result, data: { ...result.data, members, next_offset: null } };
}
