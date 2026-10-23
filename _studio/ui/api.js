/**
 * VoxelSite Studio — API Client
 *
 * Fetch wrapper that handles:
 * - JSON serialization/deserialization
 * - CSRF token injection (X-VS-Token header)
 * - Session expiry detection (auto-redirect to login)
 * - SSE streaming for AI responses
 * - Error normalization
 * - Global status indicator (centrally wired)
 *
 * Usage:
 *   import { api, apiStream } from './api.js';
 *
 *   // Standard request
 *   const { ok, data, error } = await api.get('/pages');
 *   const { ok, data } = await api.post('/ai/prompt', { prompt: '...' });
 *
 *   // Silent request (won't trigger the global status indicator)
 *   const { ok, data } = await api.get('/preview/diff', { silent: true });
 *
 *   // SSE streaming
 *   await apiStream('/ai/prompt', { prompt: '...' }, {
 *     onToken: (text) => { ... },
 *     onFile: (file) => { ... },
 *     onDone: (result) => { ... },
 *     onError: (err) => { ... },
 *   });
 */

import { store } from './state.js';
import { studioUrl, studioStorageKey } from './installation-url.js';
export { studioUrl };

// Call router.php directly with a _path parameter.
// This bypasses URL rewriting, so the Studio works on any server
// (Apache, Nginx, Herd) without needing rewrite rules.
const BASE = studioUrl('api/router.php');

// ═══════════════════════════════════════════
//  Global Status — Flight Counter
// ═══════════════════════════════════════════
//
// The indicator is INVISIBLE by default: silence = healthy (Figma/Notion).
// It only appears when mutation requests are in-flight or flashing a result.
//
// - Mutation starts (POST/PUT/DELETE): "Saving…" with pulsing amber dot
// - Mutation succeeds: flashes "Saved" with green dot → fades out after 2s
// - Any error: flashes error with red dot → fades out after 4s
// - GET requests: silent (too fast to warrant an indicator)
// - Background/polling: opt out with { silent: true }

let _inflightMutations = 0;

function notifyRequestStart(method, silent) {
  if (silent) return;
  if (!['POST', 'PUT', 'DELETE'].includes(method)) return;

  _inflightMutations++;
  if (_inflightMutations === 1) {
    window.__vsSetGlobalStatus?.('saving');
  }
}

function notifyRequestEnd(method, ok, silent) {
  if (silent) return;
  if (!['POST', 'PUT', 'DELETE'].includes(method)) return;

  _inflightMutations = Math.max(0, _inflightMutations - 1);

  if (_inflightMutations === 0) {
    if (ok) {
      window.__vsSetGlobalStatus?.('saved');
    } else {
      window.__vsSetGlobalStatus?.('error');
    }
  }
}

// ═══════════════════════════════════════════
//  Core Fetch Wrapper
// ═══════════════════════════════════════════

/**
 * Make an API request.
 *
 * @param {string} method - HTTP method
 * @param {string} endpoint - API path (e.g., '/pages')
 * @param {object|null} body - Request body (auto-serialized to JSON)
 * @param {object} options - Additional fetch options. Pass { silent: true }
 *                           to suppress the global status indicator.
 * @returns {Promise<{ok: boolean, data?: any, error?: {code: string, message: string}}>}
 */
async function request(method, endpoint, body = null, options = {}) {
  const { silent = false, ...fetchOverrides } = options;

  const headers = {
    'Accept': 'application/json',
  };

  // Add CSRF token for state-changing methods
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    const token = getSessionToken();
    if (token) {
      headers['X-VS-Token'] = token;
    }
  }

  if (body !== null) {
    headers['Content-Type'] = 'application/json';
  }

  const fetchOptions = {
    method,
    headers,
    credentials: 'same-origin', // Send cookies
    ...fetchOverrides,
  };

  if (body !== null) {
    fetchOptions.body = JSON.stringify(body);
  }

  notifyRequestStart(method, silent);

  try {
    // Build URL: append _path as query param, preserve any existing query params in the endpoint
    const [epPath, epQuery] = endpoint.split('?');
    const url = `${BASE}?_path=${encodeURIComponent(epPath)}${epQuery ? '&' + epQuery : ''}`;
    const res = await fetch(url, fetchOptions);

    // Parse the response body first — we need the actual error message
    // from the server, not a generic fallback.
    const json = await res.json();

    // Handle 401 — could be session expiry OR a login failure.
    // Parse the body first so we can return the server's actual message
    // (e.g. "Email or password is incorrect") instead of always "Session expired."
    if (res.status === 401) {
      // Only clear user state if we HAD an active session (session expiry).
      // Don't clear during login attempts — there's no session to clear.
      if (store.get('user')) {
        store.set('user', null);
      }

      notifyRequestEnd(method, false, silent);

      // Return the server's error if available, otherwise a generic message
      if (json?.error) {
        return { ok: false, error: json.error };
      }
      return { ok: false, error: { code: 'unauthorized', message: 'Session expired. Please sign in again.' } };
    }

    if (!json.ok && json.error) {
      // Demo mode — show toast for blocked actions automatically.
      // Don't flash the error indicator — the toast is sufficient.
      if (json.error.code === 'demo_mode') {
        if (window.showToast) {
          window.showToast(json.error.message || 'Demo mode — this action is disabled.', 'warning');
        }
        // Suppress the indicator entirely — it's not a real save.
        // Directly reset to idle to balance the inflight counter.
        if (!silent && ['POST', 'PUT', 'DELETE'].includes(method)) {
          _inflightMutations = Math.max(0, _inflightMutations - 1);
          if (_inflightMutations === 0) window.__vsSetGlobalStatus?.('idle');
        }
      } else {
        notifyRequestEnd(method, false, silent);
      }
      return { ok: false, error: json.error, ...(json.data?.operation ? { data: json.data } : {}) };
    }

    notifyRequestEnd(method, true, silent);

    // The server wraps successful responses as { ok: true, data: { ... } }.
    // Return the inner `data` so callers access `result.data.user` directly
    // instead of `result.data.data.user`.
    return { ok: true, data: json.data || json };
  } catch (err) {
    notifyRequestEnd(method, false, silent);
    return {
      ok: false,
      error: {
        code: 'network_error',
        message: 'Cannot reach the server. Check your connection.',
      },
    };
  }
}

// ═══════════════════════════════════════════
//  Public API Methods
// ═══════════════════════════════════════════

export const api = {
  get:    (endpoint, opts) => request('GET',    endpoint, null, opts),
  post:   (endpoint, body, opts) => request('POST',   endpoint, body, opts),
  put:    (endpoint, body, opts) => request('PUT',    endpoint, body, opts),
  delete: (endpoint, body, opts) => request('DELETE', endpoint, body, opts),
};

const websiteOperationRequests = new Map();
const pendingWebsiteOperations = new Map();
const operationAccount = () => store.get('user')?.id ?? 'anonymous';
const operationKey = (endpoint, method) => studioStorageKey(`vs_pending_website:${operationAccount()}:${method}:${endpoint}`);

export function pendingOperationInput(endpoint, method = 'post') {
  const key = operationKey(endpoint, method);
  let pending = pendingWebsiteOperations.get(key);
  if (!pending) { try { pending = JSON.parse(sessionStorage.getItem(key) || 'null'); } catch {} }
  return pending?.body ? { ...pending.body } : null;
}

/** Find this account's retained requests even after their source row was removed. */
export function pendingOperationEntries(endpointPrefix, method = 'post') {
  const prefix = operationKey(endpointPrefix, method);
  const keys = new Set(pendingWebsiteOperations.keys());
  try { for (let i = 0; i < sessionStorage.length; i++) keys.add(sessionStorage.key(i)); } catch {}
  const entries = [];
  for (const key of keys) {
    if (typeof key !== 'string' || !key.startsWith(prefix)) continue;
    const endpoint = endpointPrefix + key.slice(prefix.length);
    const body = pendingOperationInput(endpoint, method);
    if (body) entries.push({ endpoint, body });
  }
  return entries;
}

/** Retain an action identity through lost responses; only explicit checkpoints advance it. */
export function apiOperation(endpoint, body = {}, method = 'post', options = {}) {
  const key = operationKey(endpoint, method);
  const fingerprint = JSON.stringify(Object.fromEntries(Object.entries(body).sort(([a], [b]) => a.localeCompare(b))));
  const active = websiteOperationRequests.get(key);
  if (active) {
    return active.fingerprint === fingerprint ? active.promise : Promise.resolve({
      ok: false, error: { code: 'operation_pending', message: 'This action is still running. Wait for its result before changing the request.' },
    });
  }
  const promise = runWebsiteOperation(key, endpoint, body, fingerprint, method, options)
    .finally(() => websiteOperationRequests.delete(key));
  websiteOperationRequests.set(key, { fingerprint, promise });
  return promise;
}

async function runWebsiteOperation(key, endpoint, body, fingerprint, method, options) {
  const account = operationAccount();
  if (!['post', 'put', 'delete'].includes(method)) throw new Error('Unsupported website mutation method.');
  let pending = pendingWebsiteOperations.get(key);
  if (!pending) {
    try { pending = JSON.parse(sessionStorage.getItem(key) || 'null'); } catch {}
  }
  if (pending?.fingerprint && pending.fingerprint !== fingerprint) return {
    ok: false, error: { code: 'operation_pending', message: 'An earlier request for this action still needs attention. Retry that request before starting another.' },
  };
  if (!pending) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    pending = { id: `website_${Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('')}`, fingerprint, body };
  }
  // Retain identity and reviewed public versions across reloads without placing
  // write-only passwords or API keys in browser storage. The server binds the
  // complete secret request with a keyed digest on every replay.
  pending = { ...pending, fingerprint, body };
  pendingWebsiteOperations.set(key, pending);
  const persisted = options.retainInput === false ? { id: pending.id, body: options.publicInput || {}, sensitive: true } : pending;
  try { sessionStorage.setItem(key, JSON.stringify(persisted)); } catch {}
  const input = { ...body, operation_id: pending.id };
  let response = await api[method](endpoint, input);
  let steps = 0;
  while (response.ok && response.data?.operation?.status === 'applying' && steps++ < 100) {
    if (operationAccount() !== account) return { ok: false, error: {
      code: 'permission_denied', message: 'The signed-in account changed. Reopen this view before continuing.',
    } };
    response = await api[method](endpoint, { ...input, checkpoint: response.data.operation.checkpoint });
  }
  if (operationAccount() !== account) return { ok: false, error: {
    code: 'permission_denied', message: 'The signed-in account changed. Reopen this view to inspect the result.',
  } };
  const operation = response.data?.operation;
  if (['succeeded', 'failed_restored', 'expired', 'cancelled'].includes(operation?.status)
      || (!operation && ['invalid_schema', 'content_conflict', 'review_expired'].includes(response.error?.code))) {
    pendingWebsiteOperations.delete(key);
    try { sessionStorage.removeItem(key); } catch {}
  }
  if (operation?.status === 'succeeded') return response;
  if (operation) return {
    ...response, ok: false, error: operation.result?.error || {
      code: operation.status,
      message: operation.status === 'recovery_required'
        ? 'This change needs recovery. Its operation and backup are retained; do not start another website change.'
        : 'This change is still pending. Retry the same action to continue its retained operation.',
    },
  };
  return response;
}

// ═══════════════════════════════════════════
//  SSE Streaming
// ═══════════════════════════════════════════

/**
 * Stream an AI response via Server-Sent Events.
 *
 * The AI endpoint returns an SSE stream. Each event has a `type`
 * and `data` field. This function connects, parses events, and
 * calls the appropriate callback.
 *
 * Event types (in data.type):
 * - token: { content } — a chunk of streaming text
 * - status: { message } — status update ("Reading your site...")
 * - conversation: { conversation_id } — active conversation identifier
 * - prompt_id: { prompt_id } — prompt_log ID for cancellation
 * - file_complete: { path, action } — file operation completed
 * - done: { message, files_modified, revision_id } — stream complete
 * - evaluation: { issues } — post-generation quality review results
 * - warning: { message } — non-fatal issue
 * - error: { message, code } — fatal error
 *
 * @param {string} endpoint
 * @param {object} body
 * @param {object} callbacks
 * @returns {Promise<void>}
 */
export async function apiStream(endpoint, body, callbacks = {}) {
  const {
    onToken  = () => {},
    onStatus = () => {},
    onConversation = () => {},
    onPromptId = () => {},
    onFile   = () => {},
    onDone   = () => {},
    onEvaluation = () => {},
    onWarning = () => {},
    onError  = () => {},
    signal   = null,
    requireTerminal = false,
  } = callbacks;

  const token = getSessionToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  };

  if (token) {
    headers['X-VS-Token'] = token;
  }

  // Track stream state for smarter error handling
  let receivedDone = false;
  let filesCompleted = 0;
  let tokensReceived = 0;
  let trackedConversationId = body.conversation_id || null;

  try {
    const fetchOptions = {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify(body),
    };
    if (signal) fetchOptions.signal = signal;

    const [epPath, epQuery] = endpoint.split('?');
    const url = `${BASE}?_path=${encodeURIComponent(epPath)}${epQuery ? '&' + epQuery : ''}`;
    const res = await fetch(url, fetchOptions);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      onError({
        code: data?.error?.code || 'http_error',
        message: data?.error?.message || `Server error (${res.status})`,
      });
      return;
    }

    // Parse the SSE stream
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    // Helper: extract and dispatch a single SSE event block
    function processEvent(event) {
      if (!event.trim()) return;

      // The server sends: data: {"type":"token","content":"..."}
      // Also sends `: keepalive` comments to prevent connection drops
      let eventData = '';

      for (const line of event.split('\n')) {
        // Skip SSE comments (e.g. ": keepalive")
        if (line.startsWith(':')) continue;
        if (line.startsWith('data: ')) {
          eventData += line.slice(6);
        }
      }

      if (!eventData) return;

      let parsed;
      try {
        parsed = JSON.parse(eventData);
      } catch (e) {
        // Non-JSON event data — probably a keep-alive or comment
        return;
      }

      const eventType = parsed.type || 'message';

      switch (eventType) {
        case 'token':
          tokensReceived++;
          onToken(parsed.content || '');
          break;
        case 'status':
          onStatus(parsed);
          break;
        case 'conversation':
          trackedConversationId = parsed.conversation_id || trackedConversationId;
          onConversation(parsed.conversation_id || '');
          break;
        case 'prompt_id':
          onPromptId(parsed.prompt_id || 0);
          break;
        case 'file_complete':
          filesCompleted++;
          onFile(parsed);
          break;
        case 'done':
          receivedDone = true;
          onDone(parsed);
          break;
        case 'evaluation':
          onEvaluation(parsed);
          break;
        case 'warning':
          onWarning(parsed.message || '');
          break;
        case 'error':
          receivedDone = true; // error is also a terminal event
          onError(parsed);
          break;
      }
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by double newlines
      const events = buffer.split('\n\n');
      buffer = events.pop(); // Keep incomplete event in buffer

      for (const event of events) {
        processEvent(event);
      }
    }

    // Process any remaining data in the buffer after the stream ends.
    // The server's emitSSE() always appends \n\n, but network chunking
    // can split the final event so the trailing \n\n arrives in the
    // last (empty) read. Process whatever is left to ensure the 'done'
    // event is never silently lost.
    if (buffer.trim()) {
      processEvent(buffer);
    }

    // Stream ended naturally without a 'done' event.
    // The server may still be processing (ignore_user_abort=true).
    // Poll for completion if we have a conversation ID —
    // this handles connection drops by Herd/Nginx during long generations.
    if (!receivedDone) {
      if (requireTerminal) {
        onError({ code: 'stream_interrupted', message: 'The connection closed before the server confirmed the result.', outcome_unknown: true });
        return;
      }
      const convId = trackedConversationId;
      if (convId) {
        onStatus('Waiting for server to finish...');
        await pollForCompletion(convId, { onDone, onError, onFile, onStatus });
      } else if (filesCompleted > 0 || tokensReceived > 0) {
        // Some progress was made but no conversation to poll — best effort
        onDone({ files_modified: [], message: '', soft_close: true });
      }
      // else: no conversation, no tokens, no files — silent close (e.g. empty response)
    }
  } catch (err) {
    // A terminal server event remains authoritative if closing the reader
    // subsequently throws, including an AbortError.
    if (receivedDone) return;
    // Site applies have a durable plan result. A transport outcome cannot
    // establish whether the server changed or restored files.
    if (requireTerminal && !receivedDone) {
      onError({ code: 'stream_interrupted', message: 'The connection closed before the server confirmed the result.', outcome_unknown: true });
      return;
    }
    if (err.name === 'AbortError') {
      // User cancelled — treat as a clean stop, not an error
      onDone({ cancelled: true, message: 'Generation stopped.' });
      return;
    }

    // If the stream already delivered a terminal event (done/error),
    // the connection close is expected — don't override with an error.
    if (receivedDone) return;

    // Connection dropped. The server has ignore_user_abort(true), so it
    // continues processing even after disconnect. Poll for completion
    // instead of giving up — the server will finish and update prompt_log.
    if (filesCompleted > 0 || tokensReceived > 0) {
      const convId = trackedConversationId;
      if (convId) {
        onStatus('Server is still generating — waiting for completion...');
        await pollForCompletion(convId, { onDone, onError, onFile, onStatus });
      } else {
        // No conversation ID to poll — best effort
        onDone({
          files_modified: [],
          message: '',
          soft_close: true,
        });
      }
    } else {
      // No data at all — likely a timeout or network issue
      onError({
        code: 'stream_error',
        message: 'Could not connect to the AI. Check your internet connection and API key, then try again.',
      });
    }
  }
}

/**
 * Poll the conversation endpoint until the latest prompt is no longer 'streaming'.
 *
 * Used as a fallback when the SSE connection drops but the server is still
 * generating (ignore_user_abort=true). This makes VoxelSite work on shared
 * hosting where connections time out after 30-60 seconds.
 */
async function pollForCompletion(conversationId, { onDone, onError, onFile, onStatus }) {
  const maxAttempts = 120; // 6 minutes at 3s intervals
  let lastFileCount = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(r => setTimeout(r, 3000));

    try {
      const { ok, data } = await api.get(`/ai/conversations/${conversationId}`);
      if (!ok || !data?.conversation?.prompts) continue;

      const prompts = data.conversation.prompts;
      const latest = prompts[prompts.length - 1];
      if (!latest) continue;

      // Report newly completed files during polling
      const serverFiles = latest.files_modified ? JSON.parse(latest.files_modified) : [];
      if (serverFiles.length > lastFileCount) {
        for (let i = lastFileCount; i < serverFiles.length; i++) {
          onFile({ path: serverFiles[i], action: 'write' });
        }
        lastFileCount = serverFiles.length;
      }

      if (latest.status === 'streaming') {
        // Still going — show progress
        const elapsed = Math.round((Date.now() - new Date(latest.created_at).getTime()) / 1000);
        onStatus(`Server is still generating... (${elapsed}s)`);
        continue;
      }

      // Generation finished!
      if (latest.status === 'success') {
        onDone({
          message: latest.ai_message || '',
          files_modified: serverFiles,
          revision_id: latest.revision_id || null,
          polled: true,
        });
      } else if (latest.status === 'partial') {
        onDone({
          message: latest.ai_message || '',
          files_modified: serverFiles,
          partial: true,
          polled: true,
        });
      } else {
        onError({
          code: 'generation_failed',
          message: latest.error_message || 'Generation failed on the server.',
        });
      }
      return;
    } catch (_) {
      // Network error during polling — keep trying
    }
  }

  // Timed out polling — treat as partial
  onDone({
    files_modified: [],
    message: '',
    partial: true,
    soft_close: true,
  });
}

// ═══════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════

/**
 * Get the session token from the cookie.
 *
 * The session cookie (vs_session) is HttpOnly, so we can't read
 * it directly. Instead, we use it as the CSRF token value —
 * the server stores the session ID and verifies the X-VS-Token
 * header matches. But since it's HttpOnly, we need the server to
 * tell us the token via the /auth/session endpoint.
 *
 * We cache it in the store after the initial session check.
 */
function getSessionToken() {
  return store.get('sessionToken');
}

export default api;
