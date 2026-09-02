<?php

declare(strict_types=1);

/**
 * Prompt contract tests.
 *
 * Run: php _studio/tests/PromptContractTest.php
 *
 * The system prompt is the most important file in the codebase, and the
 * bugs that hurt it most are contradictions between its layers: system.md
 * says one thing, an action prompt says another, the output contract says
 * a third, and PHP quietly injects a fourth. Frontier models read past
 * them; smaller models follow whichever rule they saw last.
 *
 * These tests assemble the prompt exactly as PromptEngine does for every
 * action type and assert the contradictions that were fixed in September
 * 2026 stay fixed:
 *
 * - one scroll-reveal class (`is-visible`), never a second system
 * - one PHP quoting rule (single quotes) in system.md AND the contract
 * - real token names (`--color-*`), never the legacy `--c-*` scales
 * - memory/DI merge examples in the `<file action="merge">` contract
 * - no gradient/blob mandates for new pages, no placeholder-service rule
 * - no hidden defaults in ActionRegistry (page list, "Modern Minimal")
 * - the compact prompt (visual editor actions) carries the fabrication ban
 *
 * They also cover the two engines added at the same time: the design
 * direction draw (constraints, distribution, rendering) and the design
 * critic (parsing, normalization, issue mapping, gating).
 *
 * No network, no database, no provider keys.
 */

require_once dirname(__DIR__, 2) . '/vendor/autoload.php';

use VoxelSite\ActionRegistry;
use VoxelSite\AIProviderInterface;
use VoxelSite\DesignCriticEngine;
use VoxelSite\DesignDirection;
use VoxelSite\PromptEngine;
use VoxelSite\StructuredSchemas;

$root   = dirname(__DIR__);
$passed = 0;
$failed = 0;
$errors = [];

function record(bool $condition, string $message, array &$errors, int &$passed, int &$failed): void
{
    if ($condition) {
        $passed++;
        return;
    }
    $failed++;
    $errors[] = $message;
}

echo "=== Prompt Contract Tests ===\n\n";

// ─── Assemble prompts the way PromptEngine does ──────────────────────

$re       = new ReflectionClass(PromptEngine::class);
$engine   = $re->newInstanceWithoutConstructor();
$compact  = $re->getMethod('getDefaultSystemPrompt')->invoke($engine);
$contract = $re->getMethod('getStructuredOutputContract')->invoke($engine);
$system   = (string) file_get_contents($root . '/prompts/system.md');

$fullActions    = ['create_site', 'edit_page', 'change_design', 'free_prompt', 'import_site', 'restyle_site', 'optimize_aeo', 'inline_edit'];
$compactActions = ['section_edit', 'add_section'];

$assembled = [];
foreach ($fullActions as $action) {
    $actionFile = $root . '/prompts/actions/' . $action . '.md';
    $addition   = file_exists($actionFile) ? (string) file_get_contents($actionFile) : '';
    $assembled[$action] = $system . "\n\n" . $addition . "\n\n" . $contract;
}
foreach ($compactActions as $action) {
    $addition = (string) file_get_contents($root . '/prompts/actions/' . $action . '.md');
    $assembled[$action] = $compact . "\n\n" . $addition . "\n\n" . $contract;
}

echo "--- Contradictions stay fixed ---\n";

$forbiddenEverywhere = [
    '[data-reveal].revealed'             => 'second scroll-reveal class name (content stays invisible when CSS and JS disagree)',
    'Delightful Animations'              => 'duplicate animation section',
    'ALWAYS use double-quoted strings'   => 'contract quoting rule that contradicted system.md',
    '/assets/images/backgrounds/'        => 'wrong image library path in an example',
    'blurred circles'                    => 'decorative-shape mandate for new pages',
    'If the last website you built'      => 'unactionable cross-site memory instruction',
    '"path": "assets/data/memory.json"'  => 'legacy JSON-envelope merge example',
    'fixed inset-0 z-[60]'               => 'mobile menu z-index that contradicts the .mobile-menu CSS rules',
    'placeholders with descriptive text instead of missing images' => 'placeholder-div rule that contradicts the image library rule',
    'update `--c-primary-*`'             => 'legacy foundation token scales the compiler cannot resolve',
    "\n## Icons\n"                       => 'duplicated Icons block in an action file (system.md and the compact prompt already cover icons)',
];
foreach ($assembled as $action => $prompt) {
    foreach ($forbiddenEverywhere as $needle => $why) {
        record(!str_contains($prompt, $needle), "FAIL {$action}: contains '{$needle}' ({$why})", $errors, $passed, $failed);
    }
}

$requiredInFull = [
    '[data-reveal].is-visible'              => 'canonical reveal class defined',
    '### Design Direction'                  => 'design direction section',
    '### One Signature Move'                => 'signature move section',
    '## WEBSITE COPY'                       => 'copy voice rules',
    '## THINGS THAT READ AS "AI MADE THIS"' => 'AI tells list',
    '## SUBTRACT BEFORE YOU SHIP'           => 'subtraction pass',
    'sample content: replace before publishing' => 'sample content label rule',
    '<file path="assets/data/memory.json" action="merge">' => 'merge example in the real contract',
];
foreach ($fullActions as $action) {
    foreach ($requiredInFull as $needle => $why) {
        record(str_contains($assembled[$action], $needle), "FAIL {$action}: missing '{$needle}' ({$why})", $errors, $passed, $failed);
    }
}

$requiredInCompact = [
    'Never invent contact details'             => 'fabrication ban on the compact prompt path',
    'sample content: replace before publishing' => 'sample content label on the compact prompt path',
    '/assets/library/'                          => 'image library rule on the compact prompt path',
    'z-index: 9999'                             => 'mobile menu z-index agrees with system.md',
];
foreach ($compactActions as $action) {
    foreach ($requiredInCompact as $needle => $why) {
        record(str_contains($assembled[$action], $needle), "FAIL {$action}: missing '{$needle}' ({$why})", $errors, $passed, $failed);
    }
}

// The quoting rule must be stated the same way in both layers.
record(str_contains($system, 'always use single quotes') && str_contains($contract, 'PHP strings use single quotes'),
    'FAIL PHP quoting rule: system.md and the output contract must both say single quotes', $errors, $passed, $failed);
record(!str_contains($contract, '"We\'re here to help"'),
    'FAIL contract still shows a double-quoted PHP example', $errors, $passed, $failed);

// Budget guard: the full prompt for the heaviest action stays under 30K tokens (~4 chars/token).
$heaviest = max(array_map('strlen', array_intersect_key($assembled, array_flip($fullActions))));
record($heaviest < 120000, 'FAIL system prompt budget: heaviest assembled prompt is ' . $heaviest . ' chars (limit 120000)', $errors, $passed, $failed);

echo "--- ActionRegistry hidden defaults ---\n";

$registry = new ActionRegistry();
$open = $registry->buildPromptContext('create_site', 'A bakery in Eindhoven with a forty-year-old starter', []);
record(!str_contains($open, 'Modern Minimal'), 'FAIL create_site with no wizard data injects a "Modern Minimal" style', $errors, $passed, $failed);
record(!str_contains($open, 'Home, About, Services, Contact'), 'FAIL create_site with no wizard data injects a fixed page list', $errors, $passed, $failed);
record(str_contains($open, 'Start lean'), 'FAIL create_site with no wizard data should state that pages are open and to start lean', $errors, $passed, $failed);
$chosen = $registry->buildPromptContext('create_site', 'x', ['style' => 'dark_premium', 'pages' => 'Home, Menu']);
record(str_contains($chosen, 'Dark & Premium') && str_contains($chosen, 'Home, Menu'), 'FAIL wizard choices must still pass through', $errors, $passed, $failed);

echo "--- DesignDirection ---\n";

$axes  = DesignDirection::axes();
$tagsOf = static function (string $axis, string $id) use ($axes): array {
    foreach ($axes[$axis] as $option) {
        if ($option['id'] === $id) {
            return $option['tags'];
        }
    }
    return [];
};

$n = 1500;
$accentCounts = [];
$typeCounts   = [];
$heroSeen     = [];
for ($i = 0; $i < $n; $i++) {
    $draw = DesignDirection::draw();
    $accentCounts[$draw['ids']['accent']] = ($accentCounts[$draw['ids']['accent']] ?? 0) + 1;
    $typeCounts[$draw['ids']['type']]     = ($typeCounts[$draw['ids']['type']] ?? 0) + 1;
    $heroSeen[$draw['ids']['hero']]       = true;
}
record(max($accentCounts) / $n < 0.20, 'FAIL accent hue distribution: one hue above 20%', $errors, $passed, $failed);
record(max($typeCounts) / $n < 0.30, 'FAIL type family distribution: one family above 30%', $errors, $passed, $failed);
record(count($heroSeen) === count($axes['hero']), 'FAIL not every hero archetype was drawn', $errors, $passed, $failed);

$holds = true;
for ($i = 0; $i < 200; $i++) {
    if (DesignDirection::draw(['style' => 'dark_premium'])['ids']['palette'] !== 'dark') { $holds = false; break; }
}
record($holds, 'FAIL dark_premium must always draw a dark palette', $errors, $passed, $failed);

$holds = true;
for ($i = 0; $i < 200; $i++) {
    if (!in_array('serif', $tagsOf('type', DesignDirection::draw(['style' => 'elegant_classic'])['ids']['type']), true)) { $holds = false; break; }
}
record($holds, 'FAIL elegant_classic must always draw a serif family', $errors, $passed, $failed);

$holds = true;
for ($i = 0; $i < 200; $i++) {
    if (!in_array(DesignDirection::draw(['style' => 'playful_creative'])['ids']['radius'], ['radius-lg', 'pill'], true)) { $holds = false; break; }
}
record($holds, 'FAIL playful_creative must always draw round corners', $errors, $passed, $failed);

$memory = ['rejected_direction_dark_theme' => ['value' => 'Tried dark theme and explicitly reverted', 'confidence' => 'stated']];
$holds = true;
for ($i = 0; $i < 200; $i++) {
    if (DesignDirection::draw(['memory' => $memory])['ids']['palette'] === 'dark') { $holds = false; break; }
}
record($holds, 'FAIL a rejected dark theme must never draw a dark palette', $errors, $passed, $failed);

$memory = ['rejected_direction_sans_serif' => ['value' => 'Wants serif fonts only', 'confidence' => 'stated']];
$noSans = true;
$serifSeen = false;
for ($i = 0; $i < 200; $i++) {
    $tags = $tagsOf('type', DesignDirection::draw(['memory' => $memory])['ids']['type']);
    if (in_array('sans', $tags, true)) { $noSans = false; }
    if (in_array('serif', $tags, true)) { $serifSeen = true; }
}
record($noSans && $serifSeen, 'FAIL a rejected sans-serif must leave only serif families', $errors, $passed, $failed);

$memory = ['brand_color' => ['value' => '#2563eb', 'confidence' => 'stated']];
record(str_contains(DesignDirection::draw(['memory' => $memory])['rendered'], '#2563eb'), 'FAIL a remembered brand colour must become the accent', $errors, $passed, $failed);

$holds = true;
for ($i = 0; $i < 400; $i++) {
    $draw = DesignDirection::draw();
    if ($draw['ids']['motion'] === 'hover' && $draw['ids']['signature'] === 'marquee') { $holds = false; break; }
}
record($holds, 'FAIL a near-static page must not draw the marquee device', $errors, $passed, $failed);

$sample = DesignDirection::draw();
record(str_starts_with($sample['rendered'], '=== DESIGN DIRECTION (drawn for this build, seed ' . $sample['seed'] . ') ==='), 'FAIL rendered block header', $errors, $passed, $failed);
record(strlen($sample['rendered']) < 1400, 'FAIL rendered block too long (' . strlen($sample['rendered']) . ' chars)', $errors, $passed, $failed);
foreach (['Hero:', 'Type:', 'Palette:', 'Accent hue:', 'Layout:', 'Corners:', 'Motion:', 'Signature move:'] as $label) {
    record(str_contains($sample['rendered'], "\n{$label} "), "FAIL rendered block missing '{$label}'", $errors, $passed, $failed);
}

echo "--- DesignCriticEngine ---\n";

$fake = new class implements AIProviderInterface {
    public string $reply = '';
    public array $lastOptions = [];
    public string $lastSystem = '';
    public string $lastUser = '';
    public function getId(): string { return 'fake'; }
    public function getName(): string { return 'Fake'; }
    public function getModels(): array { return [['id' => 'fake-1', 'name' => 'Fake', 'tier' => 'fast']]; }
    public function listModels(): array { return $this->getModels(); }
    public function testConnection(): array { return $this->getModels(); }
    public function getConfigFields(): array { return []; }
    public function validateConfig(array $config): bool { return true; }
    public function stream(string $systemPrompt, array $messages, callable $onToken, callable $onComplete, array $options = []): void { $onComplete($this->reply, []); }
    public function complete(string $systemPrompt, array $messages, array $options = []): string
    {
        $this->lastOptions = $options;
        $this->lastSystem  = $systemPrompt;
        $this->lastUser    = (string) ($messages[0]['content'] ?? '');
        return $this->reply;
    }
    public function estimateTokens(string $text): int { return intdiv(strlen($text), 4); }
    public function getContextWindow(string $model): int { return 128000; }
    public function estimateCost(int $inputTokens, int $outputTokens, string $model): array { return ['input_cost' => 0.0, 'output_cost' => 0.0, 'total_cost' => 0.0]; }
};

$fake->reply = json_encode([
    'score'   => 6,
    'verdict' => 'A competent template that could be any cafe.',
    'gaps'    => [
        ['area' => 'typography', 'observation' => 'Headings and body share one weight.', 'fix' => 'Push the display face to 700 and body to 400.'],
        ['area' => 'distinctiveness', 'observation' => 'No signature move.', 'fix' => 'Set the owner sentence at display size as its own section.'],
    ],
    'tells'   => ['icon badge on every card'],
]);
$critic = new DesignCriticEngine($fake, $root . '/prompts');
$review = $critic->review(
    ['index.php' => '<?php include "_partials/header.php"; ?><section>Hello</section>'],
    ":root { --color-primary: #123; }\n.component { color: red; }",
    '<nav>n</nav>',
    '<footer>f</footer>',
    "=== DESIGN DIRECTION (seed abc) ===\nHero: x"
);
record($review['score'] === 6 && count($review['gaps']) === 2 && count($review['tells']) === 1, 'FAIL critic did not parse a structured reply', $errors, $passed, $failed);
record(($fake->lastOptions['structured_output']['tool_name'] ?? '') === 'voxelsite_design_review_result', 'FAIL critic must request the designCritic structured schema', $errors, $passed, $failed);
record(str_contains($fake->lastSystem, 'design critic'), 'FAIL critic must load prompts/critic.md', $errors, $passed, $failed);
record(str_contains($fake->lastUser, 'THE BRIEF THE BUILDER WAS GIVEN') && str_contains($fake->lastUser, '--color-primary') && !str_contains($fake->lastUser, '.component'), 'FAIL critic context must carry the brief and only the :root block of the CSS', $errors, $passed, $failed);

$issues = DesignCriticEngine::toIssues($review, 'index.php');
record(count($issues) === 4, 'FAIL toIssues should produce summary + 2 gaps + 1 tell', $errors, $passed, $failed);
record(($issues[0]['severity'] ?? '') === 'warning' && str_starts_with($issues[0]['description'] ?? '', 'Design review: 6/10.'), 'FAIL toIssues summary row', $errors, $passed, $failed);
record(($issues[3]['category'] ?? '') === 'ai_tell' && ($issues[3]['severity'] ?? '') === 'info', 'FAIL toIssues tell row', $errors, $passed, $failed);

$fake->reply = "Here you go:\n```json\n" . json_encode(['score' => 9.4, 'verdict' => 'Studio-level.', 'gaps' => [], 'tells' => []]) . "\n```";
$second = $critic->review(['index.php' => '<section>x</section>']);
record($second['score'] === 9, 'FAIL critic must tolerate fenced JSON from the prompt-only fallback and round the score', $errors, $passed, $failed);
record((DesignCriticEngine::toIssues($second, 'index.php')[0]['severity'] ?? '') === 'info', 'FAIL a high score is a suggestion, not a warning', $errors, $passed, $failed);

$fake->reply = 'not json at all';
record($critic->review(['index.php' => '<section>x</section>'])['score'] === null, 'FAIL an unparseable reply must yield a null score, not an exception', $errors, $passed, $failed);
record(DesignCriticEngine::toIssues(['score' => null, 'verdict' => '', 'gaps' => [], 'tells' => []], 'index.php') === [], 'FAIL a null score must produce no issues', $errors, $passed, $failed);

record(DesignCriticEngine::appliesTo('create_site', [['path' => 'index.php', 'action' => 'write']]), 'FAIL appliesTo: create_site with a page', $errors, $passed, $failed);
record(DesignCriticEngine::appliesTo('change_design', [['path' => 'assets/css/style.css', 'action' => 'write']]), 'FAIL appliesTo: token-only design change', $errors, $passed, $failed);
record(!DesignCriticEngine::appliesTo('section_edit', [['path' => 'index.php', 'action' => 'write']]), 'FAIL appliesTo: snippet actions are excluded', $errors, $passed, $failed);
record(!DesignCriticEngine::appliesTo('free_prompt', [['path' => 'assets/data/memory.json', 'action' => 'merge']]), 'FAIL appliesTo: data-only edits are excluded', $errors, $passed, $failed);
record(!DesignCriticEngine::appliesTo('free_prompt', [['path' => 'about.php', 'action' => 'delete']]), 'FAIL appliesTo: deletes alone do not trigger a review', $errors, $passed, $failed);

echo "--- StructuredSchemas::designCritic ---\n";

$schema = StructuredSchemas::designCritic();
record(($schema['tool_name'] ?? '') === 'voxelsite_design_review_result', 'FAIL designCritic tool_name', $errors, $passed, $failed);
record(($schema['schema']['properties']['gaps']['maxItems'] ?? 0) === 3 && ($schema['schema']['properties']['tells']['maxItems'] ?? 0) === 6, 'FAIL designCritic caps', $errors, $passed, $failed);
record(!isset($schema['schema']['properties']['score']['minimum']), 'FAIL designCritic must not rely on numeric bounds providers may ignore', $errors, $passed, $failed);

$normalized = StructuredSchemas::normalizeResult('designCritic', [
    'score'   => 14,
    'verdict' => ' v ',
    'gaps'    => array_fill(0, 5, ['area' => 'copy', 'observation' => 'o', 'fix' => 'f']),
    'tells'   => array_fill(0, 8, 't'),
]);
record($normalized['score'] === 10 && count($normalized['gaps']) === 3 && count($normalized['tells']) === 6 && $normalized['verdict'] === 'v', 'FAIL normalizeResult(designCritic) clamps and caps', $errors, $passed, $failed);
record(StructuredSchemas::normalizeResult('design_critic', null)['score'] === null, 'FAIL normalizeResult(design_critic) null-safe', $errors, $passed, $failed);
record(StructuredSchemas::normalizeResult('designCritic', ['score' => 0])['score'] === 1, 'FAIL normalizeResult(designCritic) lower clamp', $errors, $passed, $failed);
$threw = false;
try {
    StructuredSchemas::normalizeResult('critic', []);
} catch (InvalidArgumentException $e) {
    $threw = true;
}
record($threw, 'FAIL unknown schema names must still throw', $errors, $passed, $failed);

// ─── Summary ─────────────────────────────────────────────────────────

echo "\n";
foreach ($errors as $error) {
    echo "  {$error}\n";
}
echo "\nTotal: " . ($passed + $failed) . " tests\n";
echo "Passed: {$passed}\n";
echo "Failed: {$failed}\n";

exit($failed === 0 ? 0 : 1);
