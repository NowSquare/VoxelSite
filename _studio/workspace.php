<?php
declare(strict_types=1);
require_once __DIR__ . '/engine/bootstrap.php';

if (\VoxelSite\DemoMode::isActive()) { header('Location: ./'); exit; }
if (!isInstalled()) { header('Location: install.php'); exit; }
$db = \VoxelSite\Database::getInstance();
$workspace = new \VoxelSite\SiteWorkspace($db);
if ($workspace->status()['ready']) { header('Location: ./'); exit; }
$user = (new \VoxelSite\Auth($db))->getCurrentUser();
$owner = ($user['role'] ?? null) === 'owner';
$settings = new \VoxelSite\Settings($db);
$base = $owner ? $settings->get('workspace_base_url', $settings->get('site_url', '')) : '';
$token = $user === null ? '' : ($_COOKIE['vs_session'] ?? '');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
header('Referrer-Policy: no-referrer');
$escape = static fn(string $value): string => htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
?>
<!doctype html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Prepare private drafts — VoxelSite</title>
  <link rel="stylesheet" href="ui/fonts/inter/inter.css">
  <link rel="stylesheet" href="ui/dist/studio.css">
</head>
<body class="bg-vs-bg-base text-vs-text-primary min-h-screen">
<main class="mx-auto px-6 py-12" style="max-width: 640px">
  <p class="text-sm font-medium text-vs-accent mb-4">VoxelSite · Workspace setup</p>
  <h1 class="text-3xl font-semibold mb-4">Prepare private drafts</h1>
  <p class="text-base text-vs-text-secondary mb-8" style="line-height:1.7">
    This update gives your draft its own files. Setup checks access protection, copies existing assets,
    and verifies the copy before enabling editing. Your published website stays available.
  </p>
  <?php if ($user === null): ?>
  <form id="login" class="flex flex-col gap-4">
    <p class="text-sm text-vs-text-secondary">Sign in as the site owner to continue.</p>
    <label class="text-sm font-medium">Email
      <input class="block w-full mt-2 px-4 py-3 bg-vs-bg-input border border-vs-border-subtle rounded-lg"
        type="email" name="email" autocomplete="username" required>
    </label>
    <label class="text-sm font-medium">Password
      <input class="block w-full mt-2 px-4 py-3 bg-vs-bg-input border border-vs-border-subtle rounded-lg"
        type="password" name="password" autocomplete="current-password" required>
    </label>
    <button class="px-6 py-3 rounded-lg bg-vs-accent text-white font-semibold" type="submit">Sign in</button>
  </form>
  <?php elseif (!$owner): ?>
  <p class="text-sm text-vs-text-secondary mb-6">The site owner needs to finish this setup before editing resumes.</p>
  <button id="logout" class="px-6 py-3 border border-vs-border-subtle rounded-lg">Sign out</button>
  <?php else: ?>
  <form id="upgrade" class="flex flex-col gap-4">
    <label class="text-sm font-medium" for="base-url">Configured website URL</label>
    <input id="base-url" class="w-full px-4 py-3 bg-vs-bg-input border border-vs-border-subtle rounded-lg"
      type="url" name="base_url" value="<?= $escape(is_string($base) ? $base : '') ?>"
      placeholder="https://example.com" autocomplete="url" required aria-describedby="url-help">
    <p id="url-help" class="text-sm text-vs-text-tertiary">
      Use the public URL configured for this installation. Include its subdirectory if it has one.
      Setup checks this address against the same server, without signing in.
    </p>
    <div class="flex flex-wrap gap-3 mt-4">
      <button id="continue" class="px-6 py-3 rounded-lg bg-vs-accent text-white font-semibold" type="submit">Check and prepare drafts</button>
      <button id="pause" class="px-6 py-3 border border-vs-border-subtle rounded-lg" type="button" hidden>Pause after this batch</button>
      <button id="rollback" class="px-6 py-3 border border-vs-border-subtle rounded-lg" type="button">Roll back setup</button>
    </div>
  </form>
  <details class="mt-8 border-t border-vs-border-subtle pt-6">
    <summary class="text-sm font-medium cursor-pointer">Hosting configuration</summary>
    <div class="text-sm text-vs-text-secondary mt-4" style="line-height:1.7">
      <p>Apache must honor the draft directory’s access rules. For Nginx, add this rule inside the site’s server block, ahead of PHP routing:</p>
      <pre class="bg-vs-bg-input rounded-lg p-4 mt-4 mb-4" style="white-space:pre-wrap;overflow-wrap:anywhere"><code id="nginx-rule">location ^~ /_studio/preview/ { return 404; }</code></pre>
      <p>Reload the web server after changing its configuration. Setup requires successful direct-access checks for PHP, CSS, JavaScript, JSON, images, and fonts. An unavailable check leaves editing disabled.</p>
      <p class="mt-4">If your host blocks same-server HTTP requests, uses a reverse proxy that this check cannot reach, or has only one PHP worker, ask the host to make the configured installation reachable. A manual acknowledgement cannot replace the check.</p>
    </div>
  </details>
  <?php endif; ?>
  <p id="status" class="mt-8 text-sm text-vs-text-secondary" role="status" aria-live="polite" style="white-space:pre-wrap;overflow-wrap:anywhere"></p>
</main>
<script>
(() => {
  const token = <?= json_encode($token, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
  const status = document.getElementById('status');
  const report = (text, failed = false) => {
    status.textContent = text;
    status.classList.toggle('text-vs-error', failed);
  };
  const request = async (path, body) => {
    const response = await fetch('api/router.php?_path=' + encodeURIComponent(path), {
      method: 'POST', credentials: 'same-origin', cache: 'no-store',
      headers: {'Content-Type': 'application/json', 'X-VS-Token': token},
      body: JSON.stringify(body)
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error?.message || 'Setup could not continue. Please retry.');
    return result.data;
  };
  document.getElementById('login')?.addEventListener('submit', async event => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button');
    button.disabled = true;
    try { await request('/auth/login', Object.fromEntries(new FormData(event.currentTarget))); location.reload(); }
    catch (error) { report(error.message, true); button.disabled = false; }
  });
  document.getElementById('logout')?.addEventListener('click', async () => {
    try { await request('/auth/logout', {}); location.reload(); } catch (error) { report(error.message, true); }
  });
  const form = document.getElementById('upgrade');
  if (!form) return;
  const submit = document.getElementById('continue');
  const rollback = document.getElementById('rollback');
  const pause = document.getElementById('pause');
  const input = document.getElementById('base-url');
  let stopped = false;
  const busy = active => { submit.disabled = active; rollback.disabled = active; input.disabled = active; pause.hidden = !active; };
  pause.addEventListener('click', () => { stopped = true; report('Pausing after the current batch finishes.'); });
  const updateRule = () => {
    try {
      const prefix = new URL(input.value).pathname.replace(/\/$/, '');
      document.getElementById('nginx-rule').textContent = 'location ^~ ' + prefix + '/_studio/preview/ { return 404; }';
    } catch {}
  };
  input.addEventListener('input', updateRule); updateRule();
  form.addEventListener('submit', async event => {
    event.preventDefault(); stopped = false; busy(true);
    report('Checking that direct draft URLs are blocked…');
    try {
      do {
        const result = await request('/workspace/migrate', {base_url: input.value});
        if (result.status === 'complete') { report('Private drafts are ready. Opening Studio…'); location.assign('./'); return; }
        report('Verified ' + result.copied + ' of ' + result.total + ' files. Published files are unchanged.');
      } while (!stopped);
      report('Setup paused. Continue when you are ready; the verified checkpoint is retained.');
    } catch (error) { report(error.message, true); }
    finally { busy(false); }
  });
  rollback.addEventListener('click', async () => {
    busy(true);
    try { await request('/workspace/rollback', {}); report('Previous draft layout restored. Editing stays disabled until setup succeeds.'); }
    catch (error) { report(error.message, true); }
    finally { busy(false); }
  });
})();
</script>
</body>
</html>
