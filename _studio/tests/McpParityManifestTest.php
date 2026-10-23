<?php
declare(strict_types=1);

/**
 * Route/operation inventory integrity, not a claim of implemented MCP parity.
 *
 * Run without arguments while implementing milestones. The --release gate also
 * rejects pending operations, stale source reviews and missing runtime evidence.
 * No installation database, credentials, endpoint includes or network are used.
 */

$root = dirname(__DIR__, 2);
$release = in_array('--release', $argv, true);
$packageMode = false;
if (($packageArgument = array_search('--package-root', $argv, true)) !== false) {
    $packageRoot = $argv[$packageArgument + 1] ?? '';
    if ($release || !is_string($packageRoot) || !is_dir($packageRoot) || is_link($packageRoot)) {
        fwrite(STDERR, "FAIL Package inventory needs an existing staging root and cannot run the development release gate.\n"); exit(1);
    }
    $root = realpath($packageRoot); $packageMode = true;
}
$checks = 0;
$failures = [];

function manifestCheck(bool $condition, string $message): void
{
    global $checks, $failures;
    $checks++;
    if (!$condition) {
        $failures[] = $message;
    }
}

/** Ignore comments before extracting literal registered route tuples. */
function manifestRoutes(string $source, string $surface): array
{
    $code = '';
    foreach (token_get_all($source) as $token) {
        if (is_array($token)) {
            if (!in_array($token[0], [T_COMMENT, T_DOC_COMMENT], true)) {
                $code .= $token[1];
            }
        } else {
            $code .= $token;
        }
    }
    preg_match_all(
        '~\[\s*([\'"])(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\1\s*,\s*([\'"])(/[^\'"]*)\3\s*,\s*([\'"])([^\'"]+\.php)\5\s*,\s*(true|false|[\'"][^\'"]+[\'"])\s*\]~',
        $code,
        $matches,
        PREG_SET_ORDER
    );
    $routes = [];
    foreach ($matches as $match) {
        $base = $surface === 'studio' ? '_studio/api/endpoints/' : '_studio/api/agent/v1/';
        $key = $surface . ' ' . $match[2] . ' ' . $match[4];
        if (isset($routes[$key])) {
            throw new RuntimeException('Duplicate active route: ' . $key);
        }
        $routes[$key] = [
            'surface' => $surface,
            'method' => $match[2],
            'route' => $match[4],
            'handler' => $base . $match[6],
            'auth' => trim($match[7], "'\""),
        ];
    }
    // The existing public schema has an early dispatch before the route table.
    if ($surface === 'agent_rest'
        && str_contains($code, "\$earlyPathClean === 'schema'")
        && str_contains($code, "'/_schema-handler.php'")) {
        $routes['agent_rest GET /schema'] = [
            'surface' => 'agent_rest', 'method' => 'GET', 'route' => '/schema',
            'handler' => '_studio/api/agent/v1/_schema-handler.php', 'auth' => 'false',
        ];
    }
    return $routes;
}

/** Return inventory errors; separated to test the gate against deliberate gaps. */
function manifestInventoryErrors(array $manifest, array $routes): array
{
    $errors = [];
    $seenIds = [];
    $seenBranches = [];
    $coveredRoutes = [];
    $validEffects = ['read', 'prepare', 'draft_write', 'live_write', 'admin'];
    $validStatuses = ['pending', 'implemented', 'verified', 'boundary'];
    foreach ($manifest['operations'] ?? [] as $operation) {
        $id = $operation['id'] ?? '';
        if (!is_string($id) || !preg_match('/^[a-z][a-z0-9_.]+$/D', $id)) {
            $errors[] = 'Invalid operation ID.';
            continue;
        }
        if (isset($seenIds[$id])) {
            $errors[] = 'Duplicate operation ID: ' . $id;
        }
        $seenIds[$id] = true;
        $key = ($operation['surface'] ?? '') . ' ' . ($operation['method'] ?? '') . ' ' . ($operation['route'] ?? '');
        if (!isset($routes[$key])) {
            $errors[] = $id . ': no active route matches ' . $key;
        } elseif (($operation['handler'] ?? '') !== $routes[$key]['handler']) {
            $errors[] = $id . ': route handler changed; re-audit its operations.';
        }
        $coveredRoutes[$key] = true;
        $branch = $operation['branch'] ?? '';
        if (!is_string($branch) || $branch === '') {
            $errors[] = $id . ': branch identity is required.';
        }
        if (isset($seenBranches[$key . ' ' . $branch])) {
            $errors[] = $id . ': duplicate route/branch mapping.';
        }
        $seenBranches[$key . ' ' . $branch] = true;
        foreach (['current_roles', 'current_effects', 'service_seams'] as $field) {
            if (!is_array($operation[$field] ?? null)) {
                $errors[] = $id . ': missing ' . $field;
            }
        }
        if (!is_bool($operation['provider_dependent'] ?? null) || empty($operation['notes'])) {
            $errors[] = $id . ': provider dependence and review notes are required.';
        }
        $mcp = $operation['mcp'] ?? [];
        if (!in_array($mcp['status'] ?? '', $validStatuses, true)
            || !in_array($mcp['effect'] ?? '', $validEffects, true)
            || !preg_match('/^M[0-5]$/D', $mcp['milestone'] ?? '')) {
            $errors[] = $id . ': invalid status, effect or milestone.';
        }
        foreach (['proposed_scopes', 'planned_tools', 'tools', 'tests'] as $field) {
            if (!is_array($mcp[$field] ?? null)) {
                $errors[] = $id . ': missing MCP ' . $field;
            }
        }
        foreach (array_merge($mcp['planned_tools'] ?? [], $mcp['tools'] ?? []) as $tool) {
            if (!is_string($tool) || !preg_match('/^voxelsite_[a-z][a-z0-9_]*$/D', $tool)) {
                $errors[] = $id . ': invalid tool name.';
            }
        }
        if (($mcp['status'] ?? '') === 'boundary') {
            $boundary = $mcp['boundary'] ?? '';
            if (!is_string($boundary) || empty($manifest['boundaries'][$boundary])) {
                $errors[] = $id . ': boundary has no explicit explanation.';
            }
            if (($mcp['tools'] ?? []) !== []) {
                $errors[] = $id . ': an excluded operation cannot claim a registered MCP tool.';
            }
        } else {
            if (($mcp['boundary'] ?? null) !== null || ($mcp['planned_tools'] ?? []) === []
                || ($mcp['proposed_scopes'] ?? []) === []) {
                $errors[] = $id . ': applicable operation lacks a proposed tool/scope mapping.';
            }
            if (in_array($mcp['status'] ?? '', ['implemented', 'verified'], true)
                && (($mcp['tools'] ?? []) === [] || ($mcp['tests'] ?? []) === [])) {
                $errors[] = $id . ': implemented coverage needs actual tools and tests.';
            }
            // External generation equivalents may map a provider-backed Studio
            // workflow, but their actual registered handlers must be provider-free.
            if (($operation['provider_dependent'] ?? false)
                && !str_starts_with($branch, 'external_equivalent:')
                && in_array($mcp['status'] ?? '', ['implemented', 'verified'], true)) {
                $errors[] = $id . ': native provider execution cannot be registered as provider-free.';
            }
        }
    }
    foreach ($routes as $key => $route) {
        if (!isset($coveredRoutes[$key])) {
            $errors[] = 'Unexplained active route: ' . $key;
        }
    }
    return $errors;
}

/** Actual advertised contracts, not plausible tool names, establish a mapping. */
function manifestCapabilityErrors(array $manifest, \VoxelSite\Agent\CapabilityRegistry $catalog, string $root, bool $developmentEvidence = true): array
{
    $errors = [];
    foreach ($manifest['operations'] ?? [] as $operation) {
        $mapping = $operation['mcp'] ?? [];
        if (!in_array($mapping['status'] ?? '', ['implemented', 'verified'], true)) continue;
        foreach ($mapping['tools'] ?? [] as $name) {
            try {
                $definition = $catalog->get($name);
                if (!$definition->providerFree) $errors[] = $operation['id'] . ': mapped tool calls a provider.';
            } catch (\VoxelSite\Agent\OperationException) {
                $errors[] = $operation['id'] . ': mapped tool is not registered: ' . $name;
            }
        }
        if (($mapping['status'] ?? '') === 'verified') {
            $evidence = $mapping['evidence'] ?? '';
            if (!is_string($evidence) || !str_starts_with($evidence, 'docs/mcp/evidence/')
                || str_contains($evidence, '..') || ($developmentEvidence && !is_file($root . '/' . $evidence))) {
                $errors[] = $operation['id'] . ': verified mapping lacks a valid development evidence record.';
            }
        }
    }
    return $errors;
}

try {
    $manifest = json_decode(file_get_contents($root . '/_studio/agent-capabilities.json'), true, 512, JSON_THROW_ON_ERROR);
    manifestCheck(($manifest['manifest_version'] ?? null) === 1, 'Unknown manifest format.');
    manifestCheck(is_int($manifest['tool_schema_version'] ?? null), 'Tool schema version is separate from MCP protocol.');
    manifestCheck(($manifest['evidence_policy']['scope']??null)==='development_only'&&($manifest['evidence_policy']['shipped']??null)===false,'Evidence and qualification tests must be explicitly development-only references.');
    if ($packageMode) manifestCheck(!is_dir($root . '/docs')&&!is_dir($root . '/_studio/tests'),'Package must exclude development docs and executable tests.');
    $routes = [];
    foreach ($manifest['routers'] ?? [] as $surface => $path) {
        manifestCheck(in_array($surface, ['studio', 'agent_rest'], true), 'Unknown routed surface.');
        manifestCheck(is_file($root . '/' . $path), 'Missing router ' . $path);
        $routes += manifestRoutes(file_get_contents($root . '/' . $path), $surface);
    }
    manifestCheck(count($routes) > 100, 'The inventory must enumerate both active route tables.');
    foreach (manifestInventoryErrors($manifest, $routes) as $error) {
        manifestCheck(false, $error);
    }
    $reviewed = [];
    $staleReviews = [];
    foreach ($manifest['source_reviews'] ?? [] as $review) {
        $path = $review['path'] ?? '';
        manifestCheck(is_string($path) && !str_contains($path, '..') && !str_starts_with($path, '/'), 'Invalid reviewed source path.');
        manifestCheck(is_file($root . '/' . $path), 'Missing reviewed source: ' . $path);
        $reviewed[$path] = true;
        if (is_file($root . '/' . $path) && hash_file('sha256', $root . '/' . $path) !== ($review['sha256'] ?? null)) {
            $staleReviews[] = $path;
        }
    }
    $counts = [];
    foreach ($manifest['operations'] as $operation) {
        manifestCheck(isset($reviewed[$operation['handler']]), $operation['id'] . ': handler lacks branch review.');
        foreach ($operation['service_seams'] as $service) {
            manifestCheck(is_file($root . '/_studio/engine/' . $service . '.php'), $operation['id'] . ': nonexistent service seam ' . $service);
        }
        $status = $operation['mcp']['status'];
        $counts[$status] = ($counts[$status] ?? 0) + 1;
        foreach ($operation['mcp']['tests'] as $test) {
            manifestCheck(is_string($test) && str_starts_with($test, '_studio/tests/') && !str_contains($test, '..')
                && ($packageMode || is_file($root . '/' . $test)), $operation['id'] . ': missing or invalid development qualification test.');
        }
        if ($release) {
            manifestCheck(in_array($status, ['verified', 'boundary'], true), $operation['id'] . ': release requires verified coverage; status=' . $status);
            if ($status === 'verified') {
                manifestCheck(!empty($operation['mcp']['evidence']), $operation['id'] . ': release qualification evidence is missing.');
            }
        }
    }
    foreach ($staleReviews as $path) {
        if ($release) {
            manifestCheck(false, 'Re-audit changed endpoint/UI branch behavior: ' . $path);
        }
    }
    foreach ($manifest['unshipped'] ?? [] as $feature) {
        $prefix = '/' . $feature['id'];
        manifestCheck(!array_filter($routes, static fn(array $route): bool => str_starts_with($route['route'], $prefix)), $feature['id'] . ' activated: replace unshipped boundary with operation coverage.');
    }
    require_once $root . '/_studio/engine/bootstrap.php';
    $catalog = \VoxelSite\Agent\CapabilityCatalog::core();
    foreach (manifestCapabilityErrors($manifest, $catalog, $root, !$packageMode) as $error) {
        manifestCheck(false, $error);
    }
    try {
        \VoxelSite\Agent\CapabilityCatalog::core()->assertFutureFeatureParity($routes,$manifest['operations']);
        manifestCheck(true,'Future feature routes require verified registered capability coverage.');
    } catch (LogicException $error) { manifestCheck(false,$error->getMessage()); }

    // UI operations and authoring recipes share broad HTTP endpoints. Check
    // their vocabulary independently so a new workflow is not hidden by a
    // generic /files/content or /ai/prompt mapping.
    $operationIds = array_column($manifest['operations'], 'id');
    $visualSource = file_get_contents($root . '/_studio/ui/visual-editor-ops.js');
    preg_match('/export const OpType = Object\.freeze\(\{(.*?)\}\);/s', $visualSource, $visualTypes);
    preg_match_all('/[A-Z_]+:\s*\'([a-z_]+)\'/', $visualTypes[1] ?? '', $visualValues);
    foreach ($visualValues[1] as $type) {
        manifestCheck(in_array('workflow.visual_edit.' . $type, $operationIds, true), 'Unexplained visual-edit workflow: ' . $type);
    }
    $actionSource = file_get_contents($root . '/_studio/engine/ActionRegistry.php');
    preg_match_all('/^            \'([a-z_]+)\' => \[/m', $actionSource, $actionTypes);
    foreach ($actionTypes[1] as $type) {
        manifestCheck(in_array('workflow.authoring.' . $type, $operationIds, true), 'Unexplained authoring workflow: ' . $type);
    }

    $fixtureRoot = __DIR__ . '/fixtures/mcp/site-lifecycle';
    $fixture = json_decode(file_get_contents($fixtureRoot . '/fixture.json'), true, 32, JSON_THROW_ON_ERROR);
    manifestCheck(($fixture['synthetic'] ?? null) === true && count($fixture['pages'] ?? []) === 3, 'Fixture must identify its three pages as synthetic.');
    $fixtureFiles = array_merge($fixture['pages'], $fixture['partials'], $fixture['mutable_assets']);
    foreach ($fixtureFiles as $path) {
        $absolute = $fixtureRoot . '/site/' . $path;
        manifestCheck(is_file($absolute), 'Fixture file missing: ' . $path);
        if (str_ends_with($path, '.php')) {
            try {
                token_get_all(file_get_contents($absolute), TOKEN_PARSE);
                manifestCheck(true, 'Fixture PHP parses: ' . $path);
            } catch (ParseError $error) {
                manifestCheck(false, 'Fixture PHP parse error: ' . $path . ': ' . $error->getMessage());
            }
        } elseif (str_ends_with($path, '.json')) {
            json_decode(file_get_contents($absolute), true, 32, JSON_THROW_ON_ERROR);
        }
    }
    $image = getimagesize($fixtureRoot . '/site/assets/images/workshop.png');
    manifestCheck($image !== false && $image[0] === 32 && $image[1] === 24 && $image[2] === IMAGETYPE_PNG, 'Fixture uploaded image is invalid.');
    require_once $root . '/_studio/engine/FormValidator.php';
    $formValidator = new \VoxelSite\FormValidator($fixtureRoot . '/site/assets/forms', $fixtureRoot . '/site/assets/data');
    $formSchema = $formValidator->loadSchema('enquiry');
    manifestCheck($formSchema !== null, 'Fixture form schema is unavailable.');
    manifestCheck($formValidator->validate($formSchema, ['name' => 'Fixture Visitor', 'email' => 'visitor@example.test', 'message' => 'Repair question.'])['valid'], 'Fixture valid enquiry must validate without storage or delivery.');
    manifestCheck(!$formValidator->validate($formSchema, ['email' => 'not-an-email'])['valid'], 'Fixture required fields and email validation must reject malformed data.');

    // Verify the audit itself catches the regressions it is meant to prevent.
    $addedRoute = $routes + ['studio POST /new-unmapped-workflow' => ['handler' => '_studio/api/endpoints/site.php']];
    manifestCheck(in_array('Unexplained active route: studio POST /new-unmapped-workflow', manifestInventoryErrors($manifest, $addedRoute), true), 'Gate missed a newly registered route.');
    $duplicate = $manifest;
    $duplicate['operations'][] = $duplicate['operations'][0];
    manifestCheck(count(manifestInventoryErrors($duplicate, $routes)) >= 2, 'Gate missed duplicate operation/branch identities.');
    $badBoundary = $manifest;
    $badBoundary['operations'][0]['mcp'] = array_replace($badBoundary['operations'][0]['mcp'], ['status' => 'boundary', 'boundary' => 'unexplained']);
    manifestCheck(manifestInventoryErrors($badBoundary, $routes) !== [], 'Gate accepted an unexplained exclusion.');
    $unknown = $manifest;
    $unknown['operations'][0]['mcp']['effect'] = 'execute_anything';
    manifestCheck(manifestInventoryErrors($unknown, $routes) !== [], 'Gate accepted an unknown effect.');
    $invented = $manifest;
    $invented['operations'][0]['mcp'] = array_replace($invented['operations'][0]['mcp'],
        ['status' => 'implemented', 'tools' => ['voxelsite_invented_unregistered_operation']]);
    manifestCheck(manifestCapabilityErrors($invented, $catalog, $root, !$packageMode) !== [], 'Gate accepted an invented tool.');
    $absentEvidence = $manifest;
    $absentEvidence['operations'][0]['mcp'] = array_replace($absentEvidence['operations'][0]['mcp'],
        ['status' => 'verified', 'tools' => ['voxelsite_site_get'], 'evidence' => 'docs/mcp/evidence/not-a-record.json']);
    manifestCheck(manifestCapabilityErrors($absentEvidence, $catalog, $root) !== [], 'Gate accepted nonexistent qualification evidence.');
    manifestCheck(manifestCapabilityErrors($absentEvidence, $catalog, $root, false) === [], 'Package inventory incorrectly requires non-shipped development evidence.');
    $comments = "<?php\n// ['POST', '/hidden', 'hidden.php', true],\n/* ['GET', '/also-hidden', 'hidden.php', false] */\n\$routes = [[\"GET\", \"/visible\", \"visible.php\", true]];";
    manifestCheck(array_keys(manifestRoutes($comments, 'studio')) === ['studio GET /visible'], 'Route extraction confused comments with active routes.');

    echo 'Inventory: ' . count($routes) . ' active routes; ' . count($manifest['operations']) . " operation/branch rows.\n";
    echo 'Coverage status: ' . json_encode($counts, JSON_UNESCAPED_SLASHES) . ".\n";
    if ($staleReviews !== []) {
        echo count($staleReviews) . " source reviews need refresh before release.\n";
    }
    echo $packageMode ? "Mode: package inventory only; development evidence and tests are intentionally not shipped. This is not release or client qualification.\n"
        : ($release ? "Mode: release gate.\n" : "Mode: development inventory only. This is not a parity or client-compatibility qualification.\n");
} catch (Throwable $error) {
    manifestCheck(false, $error->getMessage());
}
foreach ($failures as $failure) {
    fwrite(STDERR, 'FAIL ' . $failure . "\n");
}
echo ($checks - count($failures)) . '/' . $checks . ' checks passed; ' . count($failures) . " failures.\n";
exit($failures === [] ? 0 : 1);
