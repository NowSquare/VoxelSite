/** Session-only exact mutation identities and versions for the shipped forms/Actions screens. */
export function createFormsActionsApi(api, { actor = () => null, storage = globalThis.sessionStorage, onError = () => {} } = {}) {
  const recordVersions = new Map(), configurationVersions = new Map(), active = new Map();
  let owner = actor();
  const identity = () => { if (owner !== actor()) { owner = actor(); recordVersions.clear(); configurationVersions.clear(); } return owner; };
  const digest = async value => [...new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(x => x.toString(16).padStart(2, '0')).join('');
  const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
  const recordKey = (kind, entity, id) => `${kind}:${entity}:${id}`;
  const configKey = path => path.includes('/bar-settings') ? 'bar' : /^\/agentic\/actions\/([^/?]+)(?:\/(?:duplicate))?$/.exec(path)?.[1] || 'inventory';
  const pendingKey = (method, endpoint) => `vs_form_action:${actor()}:${method}:${endpoint}`;
  const remember = (endpoint, data) => {
    if (!data) return;
    const path = endpoint.split('?')[0];
    const records = data.records || data.submissions || (data.record ? [data.record] : []);
    for (const row of records) {
      const kind = row.kind || (path.startsWith('/forms/') ? 'form' : 'action');
      const entity = row.entity_id || row.form_id || row.action_id;
      if (entity && hash(row.version) && !recordVersions.has(recordKey(kind, entity, row.record_id ?? row.id))) recordVersions.set(recordKey(kind, entity, row.record_id ?? row.id), row.version);
    }
    if (hash(data.configuration_version)) {
      if (!configurationVersions.has(configKey(path))) configurationVersions.set(configKey(path), data.configuration_version);
      if (data.actions) for (const action of data.actions) if (!configurationVersions.has(action.id)) configurationVersions.set(action.id, data.configuration_version);
    }
    if (path.endsWith('/bar-settings') && hash(data.version) && !configurationVersions.has('bar')) configurationVersions.set('bar', data.version);
    if (hash(data.operation?.version)) {
      for (const key of configurationVersions.keys()) configurationVersions.set(key, data.operation.version);
      configurationVersions.set(configKey(path), data.operation.version);
    }
    for (const row of [...(data.changed_records || []), ...(data.operation?.versions || []).map(row => ({ ...row, kind: data.operation.kind, entity_id: data.operation.entity_id }))]) if (hash(row.version)) recordVersions.set(recordKey(row.kind, row.entity_id, row.record_id), row.version);
  };
  const fail = message => ({ ok: false, error: { code: 'content_conflict', message } });
  const changedAccount = () => fail('The signed-in account changed. Reload before continuing.');
  const read = async (endpoint, opts) => { const caller = identity(); const result = await api.get(endpoint, opts); if (identity() !== caller) return changedAccount(); if (result.ok) remember(endpoint, result.data); return result; };
  const mutate = (method, endpoint, body = {}, opts) => {
    const caller = identity();
    const path = endpoint.split('?')[0];
    // Test and manifest requests do not change records or configuration.
    if (path.endsWith('/test') || path.endsWith('/manifest')) return api[method](endpoint, body, opts).then(result => identity() === caller ? result : changedAccount());
    const key = pendingKey(method, endpoint), fingerprint = JSON.stringify(body ?? {});
    if (active.has(key)) return active.get(key).fingerprint === fingerprint ? active.get(key).promise : Promise.resolve(fail('Wait for the pending change before changing its input.'));
    const promise = (async () => {
      let pending;
      try { pending = JSON.parse(storage?.getItem(key) || 'null'); } catch {}
      let inputHash;
      try { inputHash = await digest(fingerprint); } catch { return fail('This browser cannot retain a secure change identity. Use a secure connection and retry.'); }
      if (identity() !== caller) return changedAccount();
      if (pending && pending.inputHash !== inputHash) return fail('A previous change has no confirmed response. Retry that change before starting another.');
      let wire = pending ? { ...(body || {}), ...pending.metadata } : null;
      if (!wire) {
        if (typeof globalThis.crypto.randomUUID !== 'function') return fail('This browser cannot create a secure change identity. Use a secure connection and retry.');
        wire = { ...(body || {}), request_id: `studio_${globalThis.crypto.randomUUID().replaceAll('-', '')}` };
        const form = /^\/forms\/([^/]+)\/submissions\/(\d+)$/.exec(path);
        const action = /^\/agentic\/actions\/([^/]+)\/records\/(\d+)$/.exec(path);
        if (form || action) {
          const match = form || action;
          wire.version = recordVersions.get(recordKey(form ? 'form' : 'action', decodeURIComponent(match[1]), match[2]));
          if (!wire.version) return fail('Reload this record before changing it. Its displayed version is unavailable.');
        } else if (path.endsWith('/records/bulk')) {
          const id = decodeURIComponent(path.split('/')[3]);
          wire.records = (wire.record_ids || []).map(recordId => ({ record_id: Number(recordId), version: recordVersions.get(recordKey('action', id, recordId)) }));
          if (!wire.records.length || wire.records.some(row => !row.version)) return fail('Reload the selected records before changing them.');
        } else if (path.endsWith('/records/purge')) {
          const id = decodeURIComponent(path.split('/')[3]);
          wire.before = new Date(Date.now() - Number(wire.older_than_days ?? 90) * 86400000).toISOString();
          const review = await read(`/agentic/actions/${encodeURIComponent(id)}/records?date_to=${encodeURIComponent(wire.before)}&per_page=100`);
          if (!review.ok) return review;
          wire.records = review.data.records.map(row => ({ record_id: row.id, version: row.version }));
          wire.more = review.data.total > wire.records.length;
        } else {
          wire.configuration_version = configurationVersions.get(configKey(path)) || configurationVersions.get('inventory');
          if (!wire.configuration_version) return fail('Reload Action settings before changing them. Their displayed version is unavailable.');
        }
        const metadata = Object.fromEntries(['request_id','version','configuration_version','records','before','more'].filter(key => key in wire).map(key => [key, wire[key]]));
        pending = { inputHash, metadata };
        try { storage?.setItem(key, JSON.stringify(pending)); } catch { return fail('This browser cannot retain the change identity. Enable session storage and retry.'); }
      }
      if (identity() !== caller) return changedAccount();
      const result = await api[method](endpoint, wire, opts);
      if (identity() !== caller) return changedAccount();
      if (result.ok) { try { storage?.removeItem(key); } catch {} remember(endpoint, result.data); }
      else if (result.error?.code !== 'network_error') { try { storage?.removeItem(key); } catch {} }
      if (!result.ok) onError(result, { retry: () => actor() === caller ? mutate(method, endpoint, body, opts) : Promise.resolve(fail('The signed-in account changed. Reload before retrying.')) });
      return result;
    })();
    active.set(key, { fingerprint, promise });
    promise.finally(() => active.delete(key));
    return promise;
  };
  return { get: read, post: (e,b,o) => mutate('post',e,b,o), put: (e,b,o) => mutate('put',e,b,o), delete: (e,b,o) => mutate('delete',e,b,o) };
}
