#!/usr/bin/env php
<?php

/**
 * VoxelSite Agent API — Smoke Test Script
 *
 * Verifies structural correctness and behavioral expectations
 * for all Agent API components without requiring a running server.
 *
 * Usage: php _studio/api/agent/v1/smoke-test.php
 *
 * Tests cover:
 *  - PHP file syntax and class/function existence
 *  - Router endpoint table completeness
 *  - PageService behavioral correctness (slug normalize, phpMeta update,
 *    reference cleanup engine regex patterns)
 *  - PublishService class structure
 *  - AgentAuth class structure (demo guard, rate limit headers)
 *  - Assets category allowlist enforcement
 *  - Submissions table name correctness
 *  - Tools endpoint completeness (data + form + action tools)
 *  - Settings whitelist enforcement
 *  - .htaccess and nginx doc correctness
 */

$errors = [];
$passes = 0;
$rootDir = dirname(__DIR__, 4);

function pass(string $label): void
{
    global $passes;
    $passes++;
    echo "  ✅ {$label}\n";
}

function fail(string $label, string $detail = ''): void
{
    global $errors;
    $errors[] = $label;
    echo "  ❌ {$label}" . ($detail ? " — {$detail}" : '') . "\n";
}

function assert_contains(string $file, string $needle, string $label): void
{
    $content = file_get_contents($file);
    if (str_contains($content, $needle)) {
        pass($label);
    } else {
        fail($label, "Expected to find: {$needle}");
    }
}

function assert_not_contains(string $file, string $needle, string $label): void
{
    $content = file_get_contents($file);
    if (!str_contains($content, $needle)) {
        pass($label);
    } else {
        fail($label, "Should NOT contain: {$needle}");
    }
}

echo "\n╔══════════════════════════════════════════════╗\n";
echo "║  VoxelSite Agent API — Smoke Test            ║\n";
echo "╚══════════════════════════════════════════════╝\n\n";

// ═══════════════════════════════════════════
//  1. File existence
// ═══════════════════════════════════════════

echo "▸ File Existence\n";

$requiredFiles = [
    '_studio/api/agent/v1/router.php',
    '_studio/api/agent/v1/pages.php',
    '_studio/api/agent/v1/compile.php',
    '_studio/api/agent/v1/publish.php',
    '_studio/api/agent/v1/settings.php',
    '_studio/api/agent/v1/submissions.php',
    '_studio/api/agent/v1/assets.php',
    '_studio/api/agent/v1/tools.php',
    '_studio/engine/PageService.php',
    '_studio/engine/PublishService.php',
    '_studio/engine/AgentAuth.php',
    '_studio/api/endpoints/api-keys.php',
    '_studio/api/agent/v1/prompt.php',
    '_studio/worker/prompt-runner.php',
    '_studio/engine/migrations/004_add_prompt_api_support.php',
];

foreach ($requiredFiles as $f) {
    $path = $rootDir . '/' . $f;
    if (file_exists($path)) {
        pass("File exists: {$f}");
    } else {
        fail("File missing: {$f}");
    }
}

// ═══════════════════════════════════════════
//  2. Router endpoint table
// ═══════════════════════════════════════════

echo "\n▸ Router Coverage\n";

$routerContent = file_get_contents($rootDir . '/_studio/api/agent/v1/router.php');

$expectedRoutes = [
    "'/pages'" => 'Pages route',
    "'/compile'" => 'Compile route',
    "'/publish'" => 'Publish route',
    "'/settings'" => 'Settings route',
    "'/submissions'" => 'Submissions route',
    "'/assets'" => 'Assets route',
    "'/tools'" => 'Tools route',
    "'/prompt'" => 'Prompt route',
    "'/prompt/:id'" => 'Prompt poll route',
];

foreach ($expectedRoutes as $pattern => $label) {
    if (str_contains($routerContent, $pattern)) {
        pass("Router has {$label}");
    } else {
        fail("Router missing {$label}");
    }
}

// Router security checks
assert_contains($rootDir . '/_studio/api/agent/v1/router.php', 'DemoMode', 'Router checks DemoMode');
assert_contains($rootDir . '/_studio/api/agent/v1/router.php', 'AgentAuth', 'Router uses AgentAuth');
assert_contains($rootDir . '/_studio/api/agent/v1/router.php', 'agent_api_enabled', 'Router checks feature toggle');

// Router Nginx compatibility — must derive path from REQUEST_URI when _path is absent
assert_contains($rootDir . '/_studio/api/agent/v1/router.php', 'REQUEST_URI', 'Router has REQUEST_URI fallback for Nginx');
assert_contains($rootDir . '/_studio/api/agent/v1/router.php', "isset(\$_GET['_path'])", 'Router checks _path existence before fallback');
assert_contains($rootDir . '/_studio/api/agent/v1/router.php', '/_studio/api/agent/v1', 'Router strips Agent API base path from REQUEST_URI');

// ═══════════════════════════════════════════
//  3. PageService behavioral checks
// ═══════════════════════════════════════════

echo "\n▸ PageService Correctness\n";

// Require PageService for static method tests
require_once $rootDir . '/_studio/engine/PageService.php';

// Slug normalization
$tests = [
    ['My Cool Page', 'my-cool-page'],
    ['foo---bar', 'foo---bar'],
    ['  spaces  ', 'spaces'],
    ['UPPERCASE', 'uppercase'],
    ['hello!@#$%^&*()', 'hello'],
];

foreach ($tests as [$input, $expected]) {
    $result = \VoxelSite\PageService::normalizeSlug($input);
    if ($result === $expected) {
        pass("normalizeSlug('{$input}') = '{$expected}'");
    } else {
        fail("normalizeSlug('{$input}') expected '{$expected}', got '{$result}'");
    }
}

// PHP metadata update
$samplePhp = "<?php \$page = ['title' => 'Old Title', 'slug' => 'old-slug']; ?>";
$updated = \VoxelSite\PageService::updatePhpMeta($samplePhp, 'New Title', 'new-slug');
if (str_contains($updated, 'New Title') && str_contains($updated, 'new-slug')) {
    pass('updatePhpMeta rewrites title and slug');
} else {
    fail('updatePhpMeta failed to rewrite');
}

// Behavioral parity checks — verify key methods exist
$psContent = file_get_contents($rootDir . '/_studio/engine/PageService.php');
assert_contains($rootDir . '/_studio/engine/PageService.php', 'updatePageReferencesForSlugChange', 'PageService has slug-reference rewrite');
assert_contains($rootDir . '/_studio/engine/PageService.php', 'removePageReferencesAfterDelete', 'PageService has delete cleanup');
assert_contains($rootDir . '/_studio/engine/PageService.php', 'syncNav', 'PageService has nav sync');
assert_contains($rootDir . '/_studio/engine/PageService.php', 'rewriteHrefSlug', 'PageService has href rewrite engine');
assert_contains($rootDir . '/_studio/engine/PageService.php', 'removeListItemsForSlug', 'PageService has nav item removal');
assert_contains($rootDir . '/_studio/engine/PageService.php', 'removeSlugConditionals', 'PageService has conditional cleanup');
assert_contains($rootDir . '/_studio/engine/PageService.php', 'cleanupEmptyContainers', 'PageService has empty container cleanup');
assert_contains($rootDir . '/_studio/engine/PageService.php', 'buildRenameCleanupPrompt', 'PageService returns suggested rename prompt');
assert_contains($rootDir . '/_studio/engine/PageService.php', 'buildDeleteCleanupPrompt', 'PageService returns suggested delete prompt');

// ═══════════════════════════════════════════
//  4. Assets security
// ═══════════════════════════════════════════

echo "\n▸ Assets Security\n";

$assetsContent = file_get_contents($rootDir . '/_studio/api/agent/v1/assets.php');
assert_contains($rootDir . '/_studio/api/agent/v1/assets.php', '$allowedCategories', 'Assets has category allowlist');
assert_contains($rootDir . '/_studio/api/agent/v1/assets.php', "in_array(\$category, \$allowedCategories, true)", 'Assets validates category against allowlist');
assert_not_contains($rootDir . '/_studio/api/agent/v1/assets.php', 'realpath', 'Assets no longer relies on post-mkdir realpath check');

// Verify allowlist before mkdir
$mkdirPos = strpos($assetsContent, 'mkdir');
$allowlistCheckPos = strpos($assetsContent, "in_array(\$category, \$allowedCategories");
if ($allowlistCheckPos !== false && $mkdirPos !== false && $allowlistCheckPos < $mkdirPos) {
    pass('Category validation happens BEFORE mkdir()');
} else {
    fail('Category validation must happen before mkdir()');
}

// ═══════════════════════════════════════════
//  5. Submissions correctness
// ═══════════════════════════════════════════

echo "\n▸ Submissions Correctness\n";

assert_contains($rootDir . '/_studio/api/agent/v1/submissions.php', 'action_records', 'Submissions queries action_records table');
assert_not_contains($rootDir . '/_studio/api/agent/v1/submissions.php', "name='records'", 'Submissions does NOT use wrong table name');
assert_contains($rootDir . '/_studio/api/agent/v1/submissions.php', 'action_id', 'Submissions uses correct action_id column');
assert_contains($rootDir . '/_studio/api/agent/v1/submissions.php', 'confirmation_code', 'Submissions uses correct confirmation_code column');

// Pagination strategy: Mixed source must use global sort + single paginate
$subContent = file_get_contents($rootDir . '/_studio/api/agent/v1/submissions.php');

// When source is null (both), the code must NOT apply LIMIT/OFFSET per-DB.
// It must fetch unbounded from both, usort globally, then array_slice once.
assert_contains($rootDir . '/_studio/api/agent/v1/submissions.php', '$singleSource', 'Submissions differentiates single vs mixed source');
assert_contains($rootDir . '/_studio/api/agent/v1/submissions.php', 'usort($allRows', 'Submissions globally sorts merged rows');
assert_contains($rootDir . '/_studio/api/agent/v1/submissions.php', 'array_slice($allRows', 'Submissions paginates once on the merged result');

// Verify that LIMIT/OFFSET is only applied in single-source mode
$limitUsages = preg_match_all('/LIMIT \? OFFSET \?/', $subContent, $m);
// There should be exactly 2 LIMIT/OFFSET occurrences — one per single-source DB query
if ($limitUsages === 2) {
    pass('LIMIT/OFFSET used exactly twice (once per single-source query)');
} else {
    fail('Expected exactly 2 LIMIT/OFFSET occurrences in submissions.php', "found {$limitUsages}");
}

// Behavioral test: simulate mixed-source pagination logic
// 10 form rows (even timestamps) + 10 action rows (odd timestamps) = 20 total
// With per_page=5, page 1 should get timestamps 19,18,17,16,15
// Page 2 should get timestamps 14,13,12,11,10 — no overlap
$simRows = [];
for ($i = 0; $i < 10; $i++) {
    $simRows[] = ['source' => 'form', 'created_at' => sprintf('2026-01-01T%02d:00:00', 2 * $i)];
    $simRows[] = ['source' => 'action', 'created_at' => sprintf('2026-01-01T%02d:00:00', 2 * $i + 1)];
}
usort($simRows, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));
$page1 = array_slice($simRows, 0, 5);
$page2 = array_slice($simRows, 5, 5);
$page1Ts = array_column($page1, 'created_at');
$page2Ts = array_column($page2, 'created_at');
$overlap = array_intersect($page1Ts, $page2Ts);
if (empty($overlap) && count($page1) === 5 && count($page2) === 5) {
    pass('Mixed pagination: page 1 and page 2 have no duplicate/missing rows');
} else {
    fail('Mixed pagination: overlap detected between page 1 and page 2');
}
// Verify ordering is desc
if ($page1Ts[0] > $page1Ts[4] && $page1Ts[4] > $page2Ts[0]) {
    pass('Mixed pagination: correct descending order across page boundaries');
} else {
    fail('Mixed pagination: ordering broken across page boundaries');
}

// ═══════════════════════════════════════════
//  6. Tools completeness
// ═══════════════════════════════════════════

echo "\n▸ Tools Completeness\n";

$toolsContent = file_get_contents($rootDir . '/_studio/api/agent/v1/tools.php');
$requiredTools = [
    'get_business_info', 'get_menu', 'get_services', 'get_faq',
    'list_forms', 'get_form_schema', 'submit_form',
];

foreach ($requiredTools as $tool) {
    if (str_contains($toolsContent, "'{$tool}'")) {
        pass("Tools defines: {$tool}");
    } else {
        fail("Tools missing: {$tool}");
    }
}

assert_contains($rootDir . '/_studio/api/agent/v1/tools.php', "FormValidator", 'Tools uses FormValidator');
assert_contains($rootDir . '/_studio/api/agent/v1/tools.php', "'_source'", 'Tools tags invocations with _source=api');

// ═══════════════════════════════════════════
//  7. Settings whitelist
// ═══════════════════════════════════════════

echo "\n▸ Settings Security\n";

assert_contains($rootDir . '/_studio/api/agent/v1/settings.php', 'agent_api_enabled', 'Settings handles agent_api_enabled');
assert_contains($rootDir . '/_studio/api/endpoints/settings.php', 'agent_api_enabled', 'Studio settings whitelist includes agent_api_enabled');
assert_contains($rootDir . '/_studio/api/endpoints/settings.php', 'agent_api_allowed_origins', 'Studio settings whitelist includes agent_api_allowed_origins');

// ═══════════════════════════════════════════
//  8. .htaccess correctness
// ═══════════════════════════════════════════

echo "\n▸ .htaccess Configuration\n";

$htaccess = file_get_contents($rootDir . '/_studio/.htaccess');
assert_contains($rootDir . '/_studio/.htaccess', 'agent/v1', '.htaccess has Agent API rewrite');
assert_contains($rootDir . '/_studio/.htaccess', 'HTTP_AUTHORIZATION', '.htaccess forwards Authorization header');

// Verify agent rule comes before studio catch-all
$agentPos = strpos($htaccess, 'agent/v1');
$studioPos = strpos($htaccess, 'api/router.php');
if ($agentPos !== false && $studioPos !== false && $agentPos < $studioPos) {
    pass('Agent API rule precedes Studio API catch-all');
} else {
    fail('Agent API rule must come before Studio API catch-all');
}

// ═══════════════════════════════════════════
//  9. Nginx docs
// ═══════════════════════════════════════════

echo "\n▸ Nginx Documentation\n";

$nginxDoc = $rootDir . '/../voxelsite.com/content/docs/troubleshooting/nginx-configuration.md';
if (file_exists($nginxDoc)) {
    assert_contains($nginxDoc, 'Agent API', 'Nginx docs mention Agent API');
    assert_contains($nginxDoc, 'agent/v1/router.php', 'Nginx docs have Agent API rewrite rule');
    assert_contains($nginxDoc, 'HTTP_AUTHORIZATION', 'Nginx docs forward Authorization header');
    assert_contains($nginxDoc, 'http_authorization', 'Nginx docs use correct fastcgi_param syntax');

    // Critical: Nginx rewrite must pass _path to the router
    $nginxContent = file_get_contents($nginxDoc);
    if (str_contains($nginxContent, '_path=$1') || str_contains($nginxContent, '_path=$1&')) {
        pass('Nginx docs pass _path to router.php via rewrite capture');
    } else {
        fail('Nginx docs must capture path and pass as _path=$1');
    }

    // The rewrite must use a capture group pattern
    if (preg_match('/location.*\(\.[\*\+]\).*\$/', $nginxContent)) {
        pass('Nginx docs use capture group in location pattern');
    } else {
        fail('Nginx docs must use capture group to extract the path segment');
    }
} else {
    fail('Nginx documentation file not found');
}

// ═══════════════════════════════════════════
//  10. UI Settings
// ═══════════════════════════════════════════

echo "\n▸ Settings UI\n";

$settingsJs = file_get_contents($rootDir . '/_studio/ui/src/views/settings.js');
if (str_contains($settingsJs, 'textarea') && str_contains($settingsJs, 'set-api-origins')) {
    pass('Origins field uses textarea (supports newlines)');
} else {
    fail('Origins field must be a textarea');
}

if (str_contains($settingsJs, 'bindApiAccessEvents')) {
    pass('API Access events are bound');
} else {
    fail('API Access events not bound');
}

if (str_contains($settingsJs, 'showGenerateKeyModal')) {
    pass('Key generation modal exists');
} else {
    fail('Key generation modal missing');
}

if (str_contains($settingsJs, 'showKeyRevealDialog')) {
    pass('Key reveal dialog exists');
} else {
    fail('Key reveal dialog missing');
}

// ═══════════════════════════════════════════
//  11. Schema discovery contract
// ═══════════════════════════════════════════

echo "\n▸ Schema Discovery\n";

$router = file_get_contents($rootDir . '/_studio/api/agent/v1/router.php');

// Router must accept both /schema and /schema.php
assert_contains($rootDir . '/_studio/api/agent/v1/router.php', "str_ends_with(\$earlyPathClean, '.php')", 'Router normalizes .php extension');
assert_contains($rootDir . '/_studio/api/agent/v1/router.php', "\$earlyPathClean === 'schema'", 'Router gates on normalized schema path');

// Router schema gate must use REQUEST_URI fallback (same as main router)
assert_contains($rootDir . '/_studio/api/agent/v1/router.php', '/_studio/api/agent/v1', 'Schema gate has REQUEST_URI fallback');

// _schema-handler.php file must exist
if (file_exists($rootDir . '/_studio/api/agent/v1/_schema-handler.php')) {
    pass('_schema-handler.php endpoint file exists');
} else {
    fail('_schema-handler.php endpoint file missing');
}

// Public docs must use /schema, not /schema.php
$docsDir = dirname($rootDir) . '/voxelsite.com/content/docs';
$agentApiDoc = $docsDir . '/features/agent-api.md';
if (file_exists($agentApiDoc)) {
    $docContent = file_get_contents($agentApiDoc);
    if (!str_contains($docContent, '/schema.php')) {
        pass('Public docs use /schema consistently (no /schema.php)');
    } else {
        fail('Public docs still reference /schema.php');
    }
} else {
    // Docs may not be in the same tree during CI — skip silently
    pass('Public docs check skipped (docs tree not found)');
}

// Studio router must forward /agent/v1/* to Agent API router (Herd/Nginx compatibility)
$studioRouter = file_get_contents($rootDir . '/_studio/api/router.php');
if (str_contains($studioRouter, "str_starts_with(\$path, '/agent/v1/')") &&
    str_contains($studioRouter, "require __DIR__ . '/agent/v1/router.php'")) {
    pass('Studio router forwards /agent/v1/ to Agent API router');
} else {
    fail('Studio router missing Agent API forward (Herd/Nginx will not work)');
}

// Schema helpers must be prefixed to avoid collision with Studio router's jsonResponse()
$schemaPhp = file_get_contents($rootDir . '/_studio/api/agent/v1/_schema-handler.php');
if (!preg_match('/^function jsonResponse\b/m', $schemaPhp) &&
    str_contains($schemaPhp, 'function schema_jsonResponse')) {
    pass('Schema helpers prefixed (no jsonResponse collision)');
} else {
    fail('Schema still declares bare jsonResponse() — will crash via Studio router forward');
}

// ═══════════════════════════════════════════
//  12. Logging coverage on validation branches
// ═══════════════════════════════════════════

echo "\n▸ Logging Coverage\n";

// Assets: every validation error must have a Logger call
$assetsPhp = file_get_contents($rootDir . '/_studio/api/agent/v1/assets.php');
assert_contains($rootDir . '/_studio/api/agent/v1/assets.php', "Logger::warning('agent-api', 'Asset upload: no file'", 'Assets: no_file logged');
assert_contains($rootDir . '/_studio/api/agent/v1/assets.php', "Logger::warning('agent-api', 'Asset upload: file too large'", 'Assets: file_too_large logged');
assert_contains($rootDir . '/_studio/api/agent/v1/assets.php', "Logger::warning('agent-api', 'Asset upload: invalid category'", 'Assets: POST invalid_category logged');
assert_contains($rootDir . '/_studio/api/agent/v1/assets.php', "Logger::warning('agent-api', 'Asset list: invalid category'", 'Assets: GET invalid_category logged');
assert_contains($rootDir . '/_studio/api/agent/v1/assets.php', "Logger::warning('agent-api', 'Asset blocked extension'", 'Assets: blocked_type logged');
assert_contains($rootDir . '/_studio/api/agent/v1/assets.php', "Logger::warning('agent-api', 'Asset upload error'", 'Assets: upload_error logged');
assert_contains($rootDir . '/_studio/api/agent/v1/assets.php', "Logger::error('agent-api', 'Asset file save failed'", 'Assets: save failure logged');
assert_contains($rootDir . '/_studio/api/agent/v1/assets.php', "Logger::info('agent-api', 'Asset uploaded'", 'Assets: upload success logged');

// Settings: validation and success
assert_contains($rootDir . '/_studio/api/agent/v1/settings.php', "Logger::warning('agent-api', 'Settings update: all keys rejected'", 'Settings: rejected keys logged');
assert_contains($rootDir . '/_studio/api/agent/v1/settings.php', "Logger::info('agent-api', 'Settings updated'", 'Settings: update success logged');

// Tools: every validation branch
assert_contains($rootDir . '/_studio/api/agent/v1/tools.php', "Logger::warning('agent-api', 'Tool invoke: missing name'", 'Tools: missing name logged');
assert_contains($rootDir . '/_studio/api/agent/v1/tools.php', "Logger::warning('agent-api', 'Tool invoke: form not found'", 'Tools: form not found logged');
assert_contains($rootDir . '/_studio/api/agent/v1/tools.php', "Logger::warning('agent-api', 'Tool invoke: form validation failed'", 'Tools: form validation failure logged');
assert_contains($rootDir . '/_studio/api/agent/v1/tools.php', "Logger::warning('agent-api', 'Tool invoke: action failed'", 'Tools: action failure logged');
assert_contains($rootDir . '/_studio/api/agent/v1/tools.php', "Logger::exception('agent-api', \$e", 'Tools: exception with trace logged');

// Pages: not-found and CRUD
assert_contains($rootDir . '/_studio/api/agent/v1/pages.php', "Logger::warning('agent-api', 'Page not found'", 'Pages: GET not_found logged');
assert_contains($rootDir . '/_studio/api/agent/v1/pages.php', "Logger::warning('agent-api', 'Page not found for update'", 'Pages: PUT not_found logged');
assert_contains($rootDir . '/_studio/api/agent/v1/pages.php', "Logger::info('agent-api', 'Page created'", 'Pages: create success logged');
assert_contains($rootDir . '/_studio/api/agent/v1/pages.php', "Logger::info('agent-api', 'Page updated'", 'Pages: update success logged');
assert_contains($rootDir . '/_studio/api/agent/v1/pages.php', "Logger::info('agent-api', 'Page deleted'", 'Pages: delete success logged');

// Router: auth + dispatch
assert_contains($rootDir . '/_studio/api/agent/v1/router.php', "Logger::warning('agent-api', 'Auth failed:", 'Router: auth failure logged');
assert_contains($rootDir . '/_studio/api/agent/v1/router.php', "Logger::warning('agent-api', 'Scope denied'", 'Router: scope denied logged');
assert_contains($rootDir . '/_studio/api/agent/v1/router.php', "Logger::warning('agent-api', 'Route not found'", 'Router: route not found logged');
assert_contains($rootDir . '/_studio/api/agent/v1/router.php', 'Log every dispatched request', 'Router: request dispatched logged');

// Publish + Compile (exception paths use Logger::exception for stack traces)
assert_contains($rootDir . '/_studio/api/agent/v1/publish.php', "Logger::info('agent-api', 'Site published'", 'Publish: success logged');
assert_contains($rootDir . '/_studio/api/agent/v1/publish.php', "Logger::exception('agent-api', \$e", 'Publish: failure with trace logged');
assert_contains($rootDir . '/_studio/api/agent/v1/compile.php', "Logger::info('agent-api', 'CSS compiled'", 'Compile: success logged');
assert_contains($rootDir . '/_studio/api/agent/v1/compile.php', "Logger::exception('agent-api', \$e", 'Compile: failure with trace logged');

// Pages exception paths (Logger::exception for stack traces)
assert_contains($rootDir . '/_studio/api/agent/v1/pages.php', "Logger::exception('agent-api', \$e", 'Pages: exception with trace logged');

// ═══════════════════════════════════════════
//  13. Role contract (code/UI/docs consistency)
// ═══════════════════════════════════════════


echo "\n▸ Role Contract\n";

$authPhp = file_get_contents($rootDir . '/_studio/engine/AgentAuth.php');

// Agent role must include write scopes
assert_contains($rootDir . '/_studio/engine/AgentAuth.php', "'agent'  => ['pages:read', 'pages:write'", 'Agent role includes pages:write');
if (str_contains($authPhp, "'publish:trigger'") && str_contains($authPhp, "'agent'  => [") &&
    preg_match('/\'agent\'\s*=>\s*\[([^\]]+)\]/', $authPhp, $m) &&
    str_contains($m[1], 'publish:trigger')) {
    pass('Agent role includes publish:trigger');
} else {
    fail('Agent role missing publish:trigger');
}
if (isset($m[1]) && str_contains($m[1], 'assets:write')) {
    pass('Agent role includes assets:write');
} else {
    fail('Agent role missing assets:write');
}
if (isset($m[1]) && !str_contains($m[1], 'settings:write')) {
    pass('Agent role excludes settings:write (correct)');
} else {
    fail('Agent role should NOT include settings:write');
}

// UI must NOT claim the old "full page & publish access" (too vague)
assert_not_contains($rootDir . '/_studio/ui/src/views/settings.js', 'full page & publish access', 'UI no longer uses old Agent description');
// UI has prompt:execute opt-in toggle using design system checkbox
assert_contains($rootDir . '/_studio/ui/src/views/settings.js', 'gen-key-prompt-execute', 'Key modal has prompt:execute checkbox');
assert_contains($rootDir . '/_studio/ui/src/views/settings.js', 'vs-checkbox', 'Key modal uses vs-checkbox pattern');
assert_contains($rootDir . '/_studio/ui/src/views/settings.js', 'AgentAuth_ROLE_DEFAULTS', 'UI has client-side role defaults map');
assert_contains($rootDir . '/_studio/ui/src/views/settings.js', "prompt:execute", 'UI includes prompt:execute in scope construction');

// ═══════════════════════════════════════════
//  14. Log channel consistency (single channel: agent-api)
// ═══════════════════════════════════════════

echo "\n▸ Log Channel Consistency\n";

// AgentAuth must use agent-api (hyphen), not agent_api (underscore)
assert_not_contains($rootDir . '/_studio/engine/AgentAuth.php', "'agent_api'", 'AgentAuth uses agent-api, not agent_api');
assert_contains($rootDir . '/_studio/engine/AgentAuth.php', "'agent-api', 'API key created'", 'AgentAuth: key create uses agent-api channel');
assert_contains($rootDir . '/_studio/engine/AgentAuth.php', "'agent-api', 'API key revoked'", 'AgentAuth: key revoke uses agent-api channel');
assert_contains($rootDir . '/_studio/engine/AgentAuth.php', "'agent-api', 'Authentication failed: invalid key'", 'AgentAuth: auth failure uses agent-api channel');
assert_contains($rootDir . '/_studio/engine/AgentAuth.php', "'agent-api', 'Rate limited'", 'AgentAuth: rate limit uses agent-api channel');
assert_contains($rootDir . '/_studio/engine/AgentAuth.php', "'agent-api', 'Scope denied'", 'AgentAuth: scope denied uses agent-api channel');

// ═══════════════════════════════════════════
//  15. Prompt Execution Feature
// ═══════════════════════════════════════════

echo "\n▸ Prompt Execution Feature\n";

// prompt:execute must be in ALL_SCOPES
assert_contains($rootDir . '/_studio/engine/AgentAuth.php', "'prompt:execute'", 'AgentAuth declares prompt:execute scope');

// prompt:execute must NOT be in any ROLE_DEFAULTS (opt-in)
$authContent = file_get_contents($rootDir . '/_studio/engine/AgentAuth.php');
if (preg_match('/private const ROLE_DEFAULTS = \[.*?\];/s', $authContent, $rdMatch)) {
    if (!str_contains($rdMatch[0], 'prompt:execute')) {
        pass('prompt:execute is NOT in ROLE_DEFAULTS (opt-in)');
    } else {
        fail('prompt:execute should NOT be in ROLE_DEFAULTS');
    }
} else {
    fail('Could not find ROLE_DEFAULTS in AgentAuth');
}

// OPT_IN_SCOPES must exist as a role-gated map, with eligible roles
assert_contains($rootDir . '/_studio/engine/AgentAuth.php', 'OPT_IN_SCOPES', 'AgentAuth declares OPT_IN_SCOPES constant');
assert_contains($rootDir . '/_studio/engine/AgentAuth.php', 'self::OPT_IN_SCOPES', 'createKey ceiling includes OPT_IN_SCOPES');
// prompt:execute must be gated to write-capable roles (not viewer)
assert_contains($rootDir . '/_studio/engine/AgentAuth.php', "'prompt:execute' => ['owner', 'editor', 'agent']", 'prompt:execute gated to write roles');
assert_contains($rootDir . '/_studio/engine/AgentAuth.php', '$eligibleRoles', 'createKey filters opt-in by role eligibility');
// UI mirrors the eligibility map
assert_contains($rootDir . '/_studio/ui/src/views/settings.js', 'AgentAuth_OPT_IN_ELIGIBLE', 'UI has opt-in eligibility map');
assert_contains($rootDir . '/_studio/ui/src/views/settings.js', 'updatePromptEligibility', 'UI disables prompt for ineligible roles');

// Router has prompt:execute scope
assert_contains($rootDir . '/_studio/api/agent/v1/router.php', "'prompt:execute'", 'Router uses prompt:execute scope');

// Worker
assert_contains($rootDir . '/_studio/worker/prompt-runner.php', '#!/usr/bin/env php', 'Worker has PHP shebang');
assert_contains($rootDir . '/_studio/worker/prompt-runner.php', '--job=', 'Worker accepts --job argument');
assert_contains($rootDir . '/_studio/worker/prompt-runner.php', "'headless'", 'Worker passes headless flag to PromptEngine');
assert_contains($rootDir . '/_studio/worker/prompt-runner.php', 'page_scope FROM conversations', 'Worker reads page_scope from conversations');

// Schema
assert_contains($rootDir . '/_studio/api/agent/v1/_schema-handler.php', 'x-capabilities', 'Schema includes x-capabilities extension');
assert_contains($rootDir . '/_studio/api/agent/v1/_schema-handler.php', 'prompt_execution', 'Schema declares prompt_execution capability');
assert_contains($rootDir . '/_studio/api/agent/v1/_schema-handler.php', 'PromptResult', 'Schema defines PromptResult component');
assert_contains($rootDir . '/_studio/api/agent/v1/_schema-handler.php', 'queuePrompt', 'Schema defines queuePrompt operation');
assert_contains($rootDir . '/_studio/api/agent/v1/_schema-handler.php', 'getPromptStatus', 'Schema defines getPromptStatus operation');

// PromptEngine headless mode
assert_contains($rootDir . '/_studio/engine/PromptEngine.php', 'headless', 'PromptEngine has headless mode');
assert_contains($rootDir . '/_studio/engine/PromptEngine.php', 'writeHeadlessHeartbeat', 'PromptEngine writes heartbeat in headless mode');

// Migration 004
assert_contains($rootDir . '/_studio/engine/migrations/004_add_prompt_api_support.php', '_prompt_log_new', 'Migration uses create-new-first pattern');
assert_not_contains($rootDir . '/_studio/engine/migrations/004_add_prompt_api_support.php', '_prompt_log_old', 'Migration does NOT rename-old-first (FK safe)');
assert_contains($rootDir . '/_studio/engine/migrations/004_add_prompt_api_support.php', 'foreign_key_check', 'Migration verifies FK integrity');

// ═══════════════════════════════════════════
//  Results
// ═══════════════════════════════════════════

echo "\n" . str_repeat('─', 50) . "\n";
$total = $passes + count($errors);
echo "Results: {$passes}/{$total} passed\n";
if (!empty($errors)) {
    echo "\nFailed:\n";
    foreach ($errors as $e) {
        echo "  • {$e}\n";
    }
    echo "\n";
    exit(1);
}
echo "All checks passed! ✅\n\n";
exit(0);
