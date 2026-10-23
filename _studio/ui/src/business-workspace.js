/**
 * Private note/card editing state. Versions belong to the bytes the user read;
 * a background read must never silently bless overwriting somebody else's edit.
 * No private text is persisted in browser storage.
 */
export function createBusinessApi(base, { requestId = () => crypto.randomUUID(), actor = () => '', onError = () => {} } = {}) {
  const records = new Map(), pending = new Map();
  let owner = actor(), boardVersion = null, queue = Promise.resolve();
  const key = (kind, id) => `${kind}/${id}`;
  const parse = path => /^\/(notes|cards)(?:\/(\d+))?(?:\/([^?]+))?/.exec(path.split('?')[0]);
  const failure = message => ({ ok: false, error: { code: 'content_conflict', message } });
  function identity() {
    if (owner !== actor()) {
      owner = actor(); records.clear(); pending.clear(); boardVersion = null;
    }
    return owner;
  }
  function entry(kind, id) {
    const name = key(kind, id);
    if (!records.has(name)) records.set(name, { saved: null, draft: {}, generation: 0 });
    return records.get(name);
  }
  function remember(kind, row, { mutation = false, fields = {} } = {}) {
    if (!row) return row;
    const item = entry(kind, row.id);
    if (mutation) {
      item.saved = row;
      item.generation++;
      for (const [field, value] of Object.entries(fields)) {
        if (item.draft[field] === value) delete item.draft[field];
      }
      item.conflict = false;
    } else if (!Object.keys(item.draft).length && !item.conflict && !item.uncertain && !item.inflight) {
      item.saved = row.body_truncated && item.saved?.version === row.version && !item.saved.body_truncated
        ? { ...row, body: item.saved.body, body_truncated: false } : row;
    }
    return { ...row, ...item.draft, version: item.saved?.version ?? row.version };
  }
  function ingest(result, kind, options = {}) {
    if (!result.ok || !result.data) return result;
    const data = { ...result.data }, single = kind === 'notes' ? 'note' : 'card';
    if (data[single]) data[single] = remember(kind, data[single], options);
    if (data[kind]) data[kind] = data[kind].map(row => remember(kind, row, options));
    return { ...result, data };
  }
  async function get(path, options) {
    const who = identity(), match = parse(path);
    if (!match) return base.get(path, options);
    const kind = match[1], list = !match[2];
    let url = path;
    if (list && !/[?&]limit=/.test(url)) url += `${url.includes('?') ? '&' : '?'}limit=25`;
    let result = await base.get(url, options);
    if (identity() !== who) return failure('The signed-in account changed. Open this view again.');
    if (!result.ok) return result;
    if (list && result.data?.[kind]) {
      const rows = [...result.data[kind]], version = result.data.collection_version;
      let offset = result.data.next_offset, pages = 1;
      while (offset !== null && offset !== undefined) {
        if (++pages > 200 || rows.length >= 5000) return failure('This list is too large to load. Use a narrower search.');
        const query = new URLSearchParams(url.split('?')[1] || '');
        query.set('offset', String(offset)); query.set('collection_version', version);
        const next = await base.get(`${path.split('?')[0]}?${query}`, options);
        if (identity() !== who) return failure('The signed-in account changed. Open this view again.');
        if (!next.ok) return next;
        if (next.data?.collection_version !== version || !Array.isArray(next.data[kind])
          || (next.data.next_offset !== null && next.data.next_offset <= offset)) {
          return failure('This list changed while loading. Open it again.');
        }
        rows.push(...next.data[kind]); offset = next.data.next_offset;
      }
      result = { ...result, data: { ...result.data, [kind]: rows, next_offset: null } };
    }
    // Detail/archive reads must not refresh the ordering the displayed board used.
    if (path.split('?')[0] === '/cards') boardVersion = result.data?.board_version ?? boardVersion;
    return ingest(result, kind);
  }
  function markDraft(kind, id, fields) {
    identity();
    const item = entry(kind, id);
    item.generation++;
    for (const [field, value] of Object.entries(fields)) {
      if (item.saved?.[field] === value) delete item.draft[field];
      else item.draft[field] = value;
    }
  }
  async function send(method, path, body = {}, options) {
    const who = identity(), match = parse(path);
    if (!match) return base[method](path, body, options);
    const kind = match[1], id = match[2] ? Number(match[2]) : null;
    const fields = method === 'put' && !match[3] ? body : {};
    if (id && Object.keys(fields).length) markDraft(kind, id, fields);
    const run = async () => {
      if (identity() !== who) return failure('The signed-in account changed. Open this view again.');
      const item = id ? entry(kind, id) : null;
      const name = `${method}:${path}`, fingerprint = JSON.stringify(body);
      let attempt = pending.get(name);
      if (attempt && attempt.fingerprint !== fingerprint) {
        // Resolve a lost response using its exact retained request before saving
        // newer text. Creates require the explicit original retry.
        if (!id) return failure('Retry the earlier create request before starting another.');
        const previous = await transmit(attempt);
        if (!previous.ok) return previous;
        attempt = null;
      }
      if (!attempt) {
        if (id && !item.saved?.version) return failure('Open this record before changing it.');
        const input = { ...body, request_id: requestId() };
        if (id) input.expected_version = item.saved.version;
        if (kind === 'cards' && (match[3] === 'move' || 'column_name' in fields || 'archived' in fields)) {
          if (!boardVersion) return failure('Open the board before changing its order.');
          input.expected_board_version = boardVersion;
        }
        if (kind === 'cards' && body.source_note_id) {
          const source = entry('notes', body.source_note_id).saved;
          if (!source?.version) return failure('Open this note before adding it to the board.');
          input.expected_source_note_version = source.version;
        }
        attempt = { name, method, path, input, fields, kind, id, fingerprint, who };
        pending.set(name, attempt);
      }
      return transmit(attempt);
    };
    async function transmit(attempt) {
      const started = attempt.id ? entry(attempt.kind, attempt.id) : null;
      if (started) started.inflight = true;
      const result = await base[attempt.method](attempt.path, attempt.input, options);
      if (started) started.inflight = false;
      if (identity() !== attempt.who) return failure('The signed-in account changed. Open this view again.');
      const target = attempt.id ? entry(attempt.kind, attempt.id) : null;
      if (result.ok) {
        pending.delete(attempt.name);
        if (target) target.uncertain = false;
        if (result.data?.board_version) boardVersion = result.data.board_version;
        if (attempt.kind === 'cards' && result.data?.deleted && attempt.id) records.delete(key(attempt.kind, attempt.id));
        return ingest(result, attempt.kind, { mutation: true, fields: attempt.fields });
      }
      if (result.error?.code === 'network_error') {
        if (target) target.uncertain = true;
      } else {
        pending.delete(attempt.name);
        if (target) { target.uncertain = false; target.conflict = result.error?.code === 'content_conflict'; }
      }
      onError(result, { kind: attempt.kind, id: attempt.id, retry: () => send(attempt.method, attempt.path, body, options) });
      return result;
    }
    const promise = queue.then(run);
    queue = promise.catch(() => {});
    return promise;
  }
  function hasDirty(kind, id) {
    identity();
    return [...records.entries()].some(([name, item]) =>
      (!kind || name.startsWith(`${kind}/`)) && (!id || name === key(kind, id))
      && (Object.keys(item.draft).length > 0 || item.uncertain || item.conflict || item.inflight));
  }
  async function reviewSaved(kind, id, confirm) {
    const who = identity(), item = entry(kind, id), generation = item.generation;
    // A lost response must be retried first, otherwise a late write could land
    // after the version displayed in the review.
    if (item.uncertain || item.inflight) return failure('Retry the pending save before loading a saved version.');
    const result = await base.get(`/${kind}/${id}`);
    const row = result.data?.[kind === 'notes' ? 'note' : 'card'];
    if (!result.ok || !row) return result;
    if (!await confirm(row)) return { ok: false, cancelled: true };
    if (identity() !== who || item.generation !== generation || item.uncertain || item.inflight) {
      return failure('Your local text changed during the review. Review the saved version again.');
    }
    item.saved = row; item.draft = {}; item.conflict = false; item.generation++;
    return result;
  }
  return {
    get, post: (path, body, options) => send('post', path, body, options),
    put: (path, body, options) => send('put', path, body, options),
    delete: (path, body, options) => send('delete', path, body, options),
    markDraft, hasDirty, reviewSaved,
    draft: (kind, id) => { identity(); return { ...entry(kind, id).draft }; },
  };
}
