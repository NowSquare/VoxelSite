/**
 * VoxelSite Studio — API Client
 *
 * Fetch wrapper that handles:
 * - JSON serialization/deserialization
 * - CSRF token injection (X-VS-Token header)
 * - Session expiry detection (auto-redirect to login)
 * - SSE streaming for AI responses
 * - Error normalization
 *
 * Usage:
 *   import { api, apiStream } from './api.js';
 *
 *   // Standard request
 *   const { ok, data, error } = await api.get('/pages');
 *   const { ok, data } = await api.post('/ai/prompt', { prompt: '...' });
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

// Call router.php directly with a _path parameter.
// This bypasses URL rewriting, so the Studio works on any server
// (Apache, Nginx, Herd) without needing rewrite rules.
const BASE = '/_studio/api/router.php';

// ═══════════════════════════════════════════
//  Core Fetch Wrapper
// ═══════════════════════════════════════════

/**
 * Make an API request.
 *
 * @param {string} method - HTTP method
 * @param {string} endpoint - API path (e.g., '/pages')
 * @param {object|null} body - Request body (auto-serialized to JSON)
 * @param {object} options - Additional fetch options
 * @returns {Promise<{ok: boolean, data?: any, error?: {code: string, message: string}}>}
 */
async function request(method, endpoint, body = null, options = {}) {
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
    ...options,
  };

  if (body !== null) {
    fetchOptions.body = JSON.stringify(body);
  }

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

      // Return the server's error if available, otherwise a generic message
      if (json?.error) {
        return { ok: false, error: json.error };
      }
      return { ok: false, error: { code: 'unauthorized', message: 'Session expired. Please sign in again.' } };
    }

    if (!json.ok && json.error) {
      // Demo mode — show toast for blocked actions automatically
      if (json.error.code === 'demo_mode') {
        if (window.showToast) {
          window.showToast(json.error.message || 'Demo mode — this action is disabled.', 'warning');
        }
      }
      return { ok: false, error: json.error };
    }

    // The server wraps successful responses as { ok: true, data: { ... } }.
    // Return the inner `data` so callers access `result.data.user` directly
    // instead of `result.data.data.user`.
    return { ok: true, data: json.data || json };
  } catch (err) {
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
 * - file_complete: { path, action } — file operation completed
 * - done: { message, files_modified, revision_id } — stream complete
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
    onFile   = () => {},
    onDone   = () => {},
    onWarning = () => {},
    onError  = () => {},
    signal   = null,
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
          onStatus(parsed.message || '');
          break;
        case 'conversation':
          trackedConversationId = parsed.conversation_id || trackedConversationId;
          onConversation(parsed.conversation_id || '');
          break;
        case 'file_complete':
          filesCompleted++;
          onFile(parsed);
          break;
        case 'done':
          receivedDone = true;
          onDone(parsed);
          break;
        case 'warning':
          onWarning(parsed.message || '');
          break;
        case 'error':
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
    // Poll for completion instead of assuming success.
    if (!receivedDone && filesCompleted > 0) {
      const convId = trackedConversationId;
      if (convId) {
        await pollForCompletion(convId, { onDone, onError, onFile, onStatus });
      } else {
        onDone({ files_modified: [], message: '', soft_close: true });
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      // User cancelled — treat as a clean stop, not an error
      onDone({ cancelled: true, message: 'Generation stopped.' });
      return;
    }

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
