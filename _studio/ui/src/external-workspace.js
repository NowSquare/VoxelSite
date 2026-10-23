/** Local Studio state reconciliation. No provider/model discovery or external requests. */
export function builtInAiAvailable(store) {
  return store.get('aiConfigured') === true;
}

export function createDraftActivityPoller({ read, visible, busy, initial, changed }) {
  let version = null;
  let reading = false;
  return {
    async refresh() {
      if (reading || !visible() || busy()) return false;
      reading = true;
      try {
        const response = await read();
        const data = response?.ok ? response.data : null;
        if (!data || !/^draft:\d+$/.test(data.draft_version)) return false;
        if (version === null) await initial(data);
        else if (version !== data.draft_version) await changed(data);
        version = data.draft_version;
        return true;
      } catch {
        // Preserve the last observed version; a later successful poll can retry.
        return false;
      } finally { reading = false; }
    },
  };
}

/** Re-check local text after each await; an edit during a read always wins. */
export async function reconcileEditorTabs({ tabs, read, buffer, apply, alive = () => true, version }) {
  const conflicts = [], failed = [];
  for (const tab of [...tabs]) {
    if (!alive()) break;
    const baseline = tab.baseline, path = tab.path;
    const response = await read(path);
    if (!alive() || !tabs.includes(tab) || tab.path !== path || tab.baseline !== baseline) continue;
    const missing = !response?.ok && ['not_found', 'file_not_found'].includes(response?.error?.code);
    if (!response?.ok && !missing) { failed.push(tab.path); continue; }
    const content = missing ? null : response.data?.content;
    if (content !== null && typeof content !== 'string') { failed.push(tab.path); continue; }
    if (content === baseline) {
      tab.contentHash = response.data?.content_sha256 || null;
      tab.draftVersion = response.data?.draft_version || version;
      tab.externalConflict = null;
      continue;
    }
    const local = buffer(tab);
    if (missing || tab.dirty || local !== baseline) {
      const hash = response.data?.content_sha256 || null;
      if (tab.externalConflict?.content !== content || tab.externalConflict?.contentHash !== hash || tab.externalConflict?.missing !== missing) {
        tab.externalConflict = { content, contentHash: hash, version, missing };
      }
      conflicts.push(tab.path);
    } else {
      tab.baseline = content;
      tab.contentHash = response.data?.content_sha256 || null;
      tab.draftVersion = response.data?.draft_version || version;
      tab._buffer = content;
      tab.dirty = false;
      tab.externalConflict = null;
      apply(tab, content);
    }
  }
  return { conflicts, failed };
}

export function resolveEditorConflict(tab, choice, local) {
  const conflict = tab.externalConflict;
  if (!conflict || conflict.missing || !conflict.contentHash) return false;
  tab.baseline = conflict.content;
  tab.contentHash = conflict.contentHash;
  tab.draftVersion = conflict.version;
  tab._buffer = choice === 'saved' ? conflict.content : local;
  tab.dirty = tab._buffer !== tab.baseline;
  tab.externalConflict = null;
  return true;
}

export function retainSavedBuffer(tab, saved, hash, local) {
  tab.baseline = saved;
  tab.contentHash = hash || null;
  tab._buffer = local;
  tab.dirty = local !== saved;
}
