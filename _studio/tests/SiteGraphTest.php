<?php

declare(strict_types=1);

/**
 * SiteGraph + SiteGraphIndexer regression suite.
 *
 * Run: php _studio/tests/SiteGraphTest.php
 *
 * Covers the regressions found and fixed during Slice A:
 * - Recursive partial discovery (not top-level-only glob)
 * - Leading-slash include path resolution (__DIR__ . '/nav.php')
 * - Repeated link edges (no per-file deduplication)
 * - CSS asset token consumers (style.css var() usage)
 * - Token/asset blast radius (asset consumers → all pages)
 * - Homepage link capture (href="/")
 * - Per-link CTA context classification
 *
 * NOT covered here (verified by code review only):
 * - Page registry sync before indexing (would need stale-registry setup/teardown)
 */

require_once dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\SiteGraph;
use VoxelSite\SiteGraphIndexer;

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

echo "=== SiteGraph Test Suite ===\n\n";

// ═══════════════════════════════════════════
//  Unit Tests — SiteGraph data structure
// ═══════════════════════════════════════════

echo "--- SiteGraph: Node operations ---\n";

$g = new SiteGraph();
$g->addNode('page:index.php', 'page', 'Home', ['slug' => 'index']);
$g->addNode('page:about.php', 'page', 'About', ['slug' => 'about']);
$g->addNode('partial:_partials/nav.php', 'partial', 'nav.php', ['file_path' => '_partials/nav.php']);
$g->addNode('route:/', 'route', '/', ['path' => '/']);
$g->addNode('route:/about', 'route', '/about', ['path' => '/about']);
$g->addNode('token:--color-ink', 'token', '--color-ink', ['value' => '#111']);
$g->addNode('asset:assets/css/style.css', 'asset', 'style.css', ['file_path' => 'assets/css/style.css']);

record($g->getNode('page:index.php') !== null, 'getNode returns existing node', $errors, $passed, $failed);
record($g->getNode('page:nonexistent.php') === null, 'getNode returns null for missing', $errors, $passed, $failed);
record(count($g->getNodesByType('page')) === 2, 'getNodesByType: 2 pages', $errors, $passed, $failed);
record(count($g->getNodesByType('partial')) === 1, 'getNodesByType: 1 partial', $errors, $passed, $failed);
record(count($g->getNodesByType('asset')) === 1, 'getNodesByType: 1 asset', $errors, $passed, $failed);

// Duplicate node throws
$threw = false;
try {
    $g->addNode('page:index.php', 'page', 'Dup', []);
} catch (\RuntimeException $e) {
    $threw = true;
}
record($threw, 'addNode throws on duplicate ID', $errors, $passed, $failed);

echo "--- SiteGraph: Edge operations ---\n";

$g->addEdge('page:index.php', 'partial:_partials/nav.php', 'includes');
$g->addEdge('page:about.php', 'partial:_partials/nav.php', 'includes');
$g->addEdge('route:/', 'page:index.php', 'serves');
$g->addEdge('route:/about', 'page:about.php', 'serves');

record(count($g->getOutEdges('page:index.php', 'includes')) === 1, 'outEdges: 1 include from index', $errors, $passed, $failed);
record(count($g->getInEdges('partial:_partials/nav.php', 'includes')) === 2, 'inEdges: 2 includes to nav', $errors, $passed, $failed);
record(count($g->getConsumers('partial:_partials/nav.php')) === 2, 'getConsumers: 2 consumers of nav', $errors, $passed, $failed);

// Missing source/target throws
$threwSource = false;
try {
    $g->addEdge('page:missing.php', 'partial:_partials/nav.php', 'includes');
} catch (\RuntimeException $e) {
    $threwSource = true;
}
record($threwSource, 'addEdge throws on missing source', $errors, $passed, $failed);

echo "--- SiteGraph: Blast radius ---\n";

// Page blast radius = itself
$pageBlast = $g->getBlastRadius('page:index.php');
record(count($pageBlast) === 1, 'blast radius of page = 1 (itself)', $errors, $passed, $failed);
record($pageBlast[0]['id'] === 'page:index.php', 'blast radius of page = correct page', $errors, $passed, $failed);

// Partial blast radius = all includers that are pages
$navBlast = $g->getBlastRadius('partial:_partials/nav.php');
record(count($navBlast) === 2, 'blast radius of partial = 2 pages', $errors, $passed, $failed);

// Route blast radius = served page
$routeBlast = $g->getBlastRadius('route:/');
record(count($routeBlast) === 1, 'blast radius of route = 1 page', $errors, $passed, $failed);

// Asset blast radius = all pages (CSS is global)
$assetBlast = $g->getBlastRadius('asset:assets/css/style.css');
record(count($assetBlast) === 2, 'blast radius of asset = all pages (2)', $errors, $passed, $failed);

// Token blast radius with asset consumer → all pages
$g->addEdge('asset:assets/css/style.css', 'token:--color-ink', 'consumes_token');
$tokenBlast = $g->getBlastRadius('token:--color-ink');
record(count($tokenBlast) === 2, 'blast radius of token (via asset) = all pages (2)', $errors, $passed, $failed);

// Nonexistent node = empty
record(count($g->getBlastRadius('page:nope.php')) === 0, 'blast radius of missing node = 0', $errors, $passed, $failed);

echo "--- SiteGraph: Multiple link edges (no dedupe) ---\n";

// Multiple edges from same source to same target are allowed
$g->addEdge('page:index.php', 'route:/', 'links_to', ['lineNumber' => 10]);
$g->addEdge('page:index.php', 'route:/', 'links_to', ['lineNumber' => 50]);
$g->addEdge('page:index.php', 'route:/', 'links_to', ['lineNumber' => 120]);
$homeLinks = $g->getInEdges('route:/', 'links_to');
record(count($homeLinks) === 3, 'multiple links_to edges stored (3 edges)', $errors, $passed, $failed);

// Each has distinct line number
$lineNums = array_map(fn($e) => $e['meta']['lineNumber'] ?? null, $homeLinks);
sort($lineNums);
record($lineNums === [10, 50, 120], 'each edge has distinct line number', $errors, $passed, $failed);

echo "--- SiteGraph: Transitive consumers ---\n";

$g2 = new SiteGraph();
$g2->addNode('page:a.php', 'page', 'A', []);
$g2->addNode('partial:_partials/b.php', 'partial', 'B', []);
$g2->addNode('partial:_partials/c.php', 'partial', 'C', []);
$g2->addEdge('page:a.php', 'partial:_partials/b.php', 'includes');
$g2->addEdge('partial:_partials/b.php', 'partial:_partials/c.php', 'includes');

$transitiveC = $g2->getTransitiveConsumers('partial:_partials/c.php');
$transitiveIds = array_map(fn($n) => $n['id'], $transitiveC);
record(in_array('partial:_partials/b.php', $transitiveIds), 'transitive: B consumes C', $errors, $passed, $failed);
record(in_array('page:a.php', $transitiveIds), 'transitive: A consumes C (via B)', $errors, $passed, $failed);

$cBlast = $g2->getBlastRadius('partial:_partials/c.php');
record(count($cBlast) === 1, 'transitive blast: C affects 1 page', $errors, $passed, $failed);
record($cBlast[0]['id'] === 'page:a.php', 'transitive blast: C affects page A', $errors, $passed, $failed);

echo "--- SiteGraph: Summary ---\n";

$summary = $g->summary();
record($summary['pages'] === 2, 'summary pages=2', $errors, $passed, $failed);
record($summary['partials'] === 1, 'summary partials=1', $errors, $passed, $failed);
record($summary['routes'] === 2, 'summary routes=2', $errors, $passed, $failed);
record($summary['tokens'] === 1, 'summary tokens=1', $errors, $passed, $failed);
record($summary['assets'] === 1, 'summary assets=1', $errors, $passed, $failed);
record($summary['edges'] > 0, 'summary edges > 0', $errors, $passed, $failed);


// ═══════════════════════════════════════════
//  Unit Tests — Hierarchy resolution
//  (resolveParentMap + applyHierarchyMetadata)
// ═══════════════════════════════════════════

echo "\n--- Hierarchy: Explicit parent ---\n";

$h1 = new SiteGraph();
$h1->addNode('page:home.php', 'page', 'Home', ['slug' => 'index']);
$h1->addNode('page:services.php', 'page', 'Services', ['slug' => 'services']);

$rawParents1 = ['page:home.php' => null, 'page:services.php' => 1];
$dbIdToNodeId1 = [1 => 'page:home.php', 2 => 'page:services.php'];

$pm1 = SiteGraphIndexer::resolveParentMap($h1, $rawParents1, $dbIdToNodeId1);
SiteGraphIndexer::applyHierarchyMetadata($h1, $pm1);

$svcMeta = $h1->getNode('page:services.php')['meta'];
record($svcMeta['parentPageId'] === 'page:home.php', 'explicit parent: services → home', $errors, $passed, $failed);
record($svcMeta['hierarchySource'] === 'explicit', 'explicit parent: source=explicit', $errors, $passed, $failed);
record($svcMeta['level'] === 2, 'explicit parent: level=2', $errors, $passed, $failed);

$homeMeta = $h1->getNode('page:home.php')['meta'];
record($homeMeta['level'] === 1, 'explicit parent: home level=1', $errors, $passed, $failed);
record($homeMeta['childCount'] === 1, 'explicit parent: home childCount=1', $errors, $passed, $failed);

echo "--- Hierarchy: Three levels ---\n";

$h2 = new SiteGraph();
$h2->addNode('page:a.php', 'page', 'A', ['slug' => 'a']);
$h2->addNode('page:b.php', 'page', 'B', ['slug' => 'b']);
$h2->addNode('page:c.php', 'page', 'C', ['slug' => 'c']);

$pm2 = SiteGraphIndexer::resolveParentMap($h2,
    ['page:a.php' => null, 'page:b.php' => 1, 'page:c.php' => 2],
    [1 => 'page:a.php', 2 => 'page:b.php', 3 => 'page:c.php']
);
SiteGraphIndexer::applyHierarchyMetadata($h2, $pm2);

record($h2->getNode('page:c.php')['meta']['level'] === 3, 'three levels: C level=3', $errors, $passed, $failed);
record($h2->getNode('page:c.php')['meta']['hierarchySource'] === 'explicit', 'three levels: C source=explicit', $errors, $passed, $failed);

echo "--- Hierarchy: Over-depth cap ---\n";

$h3 = new SiteGraph();
$h3->addNode('page:a.php', 'page', 'A', ['slug' => 'a']);
$h3->addNode('page:b.php', 'page', 'B', ['slug' => 'b']);
$h3->addNode('page:c.php', 'page', 'C', ['slug' => 'c']);
$h3->addNode('page:d.php', 'page', 'D', ['slug' => 'd']);

$pm3 = SiteGraphIndexer::resolveParentMap($h3,
    ['page:a.php' => null, 'page:b.php' => 1, 'page:c.php' => 2, 'page:d.php' => 3],
    [1 => 'page:a.php', 2 => 'page:b.php', 3 => 'page:c.php', 4 => 'page:d.php']
);
SiteGraphIndexer::applyHierarchyMetadata($h3, $pm3);

$dMeta = $h3->getNode('page:d.php')['meta'];
record($dMeta['level'] === 3, 'over-depth: D level capped at 3', $errors, $passed, $failed);
record($dMeta['parentPageId'] === 'page:c.php', 'over-depth: D parent still C', $errors, $passed, $failed);

echo "--- Hierarchy: Self-parent ---\n";

$h4 = new SiteGraph();
$h4->addNode('page:self.php', 'page', 'Self', ['slug' => 'self']);

$pm4 = SiteGraphIndexer::resolveParentMap($h4,
    ['page:self.php' => 1],
    [1 => 'page:self.php']
);
SiteGraphIndexer::applyHierarchyMetadata($h4, $pm4);

$selfMeta = $h4->getNode('page:self.php')['meta'];
record($selfMeta['parentPageId'] === null, 'self-parent: flattened to null', $errors, $passed, $failed);
record($selfMeta['hierarchySource'] === null, 'self-parent: source=null', $errors, $passed, $failed);
record($selfMeta['level'] === 1, 'self-parent: level=1', $errors, $passed, $failed);

echo "--- Hierarchy: Cycle A→B→A ---\n";

$h5 = new SiteGraph();
$h5->addNode('page:a.php', 'page', 'A', ['slug' => 'a']);
$h5->addNode('page:b.php', 'page', 'B', ['slug' => 'b']);

$pm5 = SiteGraphIndexer::resolveParentMap($h5,
    ['page:a.php' => 2, 'page:b.php' => 1],
    [1 => 'page:a.php', 2 => 'page:b.php']
);
SiteGraphIndexer::applyHierarchyMetadata($h5, $pm5);

$aLevel = $h5->getNode('page:a.php')['meta']['level'];
$bLevel = $h5->getNode('page:b.php')['meta']['level'];
// At least one must be severed to level 1
record($aLevel === 1 || $bLevel === 1, 'cycle: at least one page severed to level 1', $errors, $passed, $failed);
// Both cannot be level 2 (that would mean cycle was not detected)
record(!($aLevel === 2 && $bLevel === 2), 'cycle: both cannot be level 2', $errors, $passed, $failed);

echo "--- Hierarchy: Missing parent ---\n";

$h6 = new SiteGraph();
$h6->addNode('page:orphan.php', 'page', 'Orphan', ['slug' => 'orphan']);

$pm6 = SiteGraphIndexer::resolveParentMap($h6,
    ['page:orphan.php' => 99],
    [1 => 'page:orphan.php']
);
SiteGraphIndexer::applyHierarchyMetadata($h6, $pm6);

$orphanMeta = $h6->getNode('page:orphan.php')['meta'];
record($orphanMeta['parentPageId'] === null, 'missing parent: flattened to null', $errors, $passed, $failed);
record($orphanMeta['level'] === 1, 'missing parent: level=1', $errors, $passed, $failed);

echo "--- Hierarchy: URL inference ---\n";

$h7 = new SiteGraph();
$h7->addNode('page:services.php', 'page', 'Services', ['slug' => 'services']);
$h7->addNode('page:services/web.php', 'page', 'Web', ['slug' => 'services/web']);

// No explicit parents — inference should kick in
$pm7 = SiteGraphIndexer::resolveParentMap($h7,
    ['page:services.php' => null, 'page:services/web.php' => null],
    [1 => 'page:services.php', 2 => 'page:services/web.php']
);
SiteGraphIndexer::applyHierarchyMetadata($h7, $pm7);

$webMeta = $h7->getNode('page:services/web.php')['meta'];
record($webMeta['parentPageId'] === 'page:services.php', 'URL inference: web → services', $errors, $passed, $failed);
record($webMeta['hierarchySource'] === 'inferred', 'URL inference: source=inferred', $errors, $passed, $failed);
record($webMeta['level'] === 2, 'URL inference: level=2', $errors, $passed, $failed);

echo "--- Hierarchy: URL inference miss ---\n";

$h8 = new SiteGraph();
$h8->addNode('page:services/web.php', 'page', 'Web', ['slug' => 'services/web']);
// no 'services' page exists

$pm8 = SiteGraphIndexer::resolveParentMap($h8,
    ['page:services/web.php' => null],
    [1 => 'page:services/web.php']
);
SiteGraphIndexer::applyHierarchyMetadata($h8, $pm8);

$webMeta8 = $h8->getNode('page:services/web.php')['meta'];
record($webMeta8['parentPageId'] === null, 'URL inference miss: parent=null', $errors, $passed, $failed);
record($webMeta8['level'] === 1, 'URL inference miss: level=1', $errors, $passed, $failed);

echo "--- Hierarchy: Flat (no parent) ---\n";

$h9 = new SiteGraph();
$h9->addNode('page:flat.php', 'page', 'Flat', ['slug' => 'flat']);

$pm9 = SiteGraphIndexer::resolveParentMap($h9,
    ['page:flat.php' => null],
    [1 => 'page:flat.php']
);
SiteGraphIndexer::applyHierarchyMetadata($h9, $pm9);

$flatMeta = $h9->getNode('page:flat.php')['meta'];
record($flatMeta['parentPageId'] === null, 'flat: parent=null', $errors, $passed, $failed);
record($flatMeta['hierarchySource'] === null, 'flat: source=null', $errors, $passed, $failed);
record($flatMeta['level'] === 1, 'flat: level=1', $errors, $passed, $failed);

echo "--- Hierarchy: Child count ---\n";

$h10 = new SiteGraph();
$h10->addNode('page:parent.php', 'page', 'Parent', ['slug' => 'parent']);
$h10->addNode('page:c1.php', 'page', 'C1', ['slug' => 'c1']);
$h10->addNode('page:c2.php', 'page', 'C2', ['slug' => 'c2']);
$h10->addNode('page:c3.php', 'page', 'C3', ['slug' => 'c3']);

$pm10 = SiteGraphIndexer::resolveParentMap($h10,
    ['page:parent.php' => null, 'page:c1.php' => 1, 'page:c2.php' => 1, 'page:c3.php' => 1],
    [1 => 'page:parent.php', 2 => 'page:c1.php', 3 => 'page:c2.php', 4 => 'page:c3.php']
);
SiteGraphIndexer::applyHierarchyMetadata($h10, $pm10);

record($h10->getNode('page:parent.php')['meta']['childCount'] === 3, 'child count: parent has 3 children', $errors, $passed, $failed);
// ═══════════════════════════════════════════
//  Integration Tests — SiteGraphIndexer on real site
// ═══════════════════════════════════════════

echo "\n--- Indexer: Build graph from real site ---\n";

$db = Database::getInstance();
$fileManager = new FileManager($db);
$indexer = new SiteGraphIndexer($db, $fileManager);
$graph = $indexer->buildGraph();
$realSummary = $graph->summary();

// Non-zero counts
record($realSummary['pages'] > 0, 'real graph: pages > 0 (got ' . $realSummary['pages'] . ')', $errors, $passed, $failed);
record($realSummary['partials'] > 0, 'real graph: partials > 0 (got ' . $realSummary['partials'] . ')', $errors, $passed, $failed);
record($realSummary['routes'] > 0, 'real graph: routes > 0 (got ' . $realSummary['routes'] . ')', $errors, $passed, $failed);
record($realSummary['tokens'] > 0, 'real graph: tokens > 0 (got ' . $realSummary['tokens'] . ')', $errors, $passed, $failed);
record($realSummary['assets'] > 0, 'real graph: assets > 0 (got ' . $realSummary['assets'] . ')', $errors, $passed, $failed);
record($realSummary['edges'] > 0, 'real graph: edges > 0 (got ' . $realSummary['edges'] . ')', $errors, $passed, $failed);

echo "--- Indexer: Partial discovery (recursive) ---\n";

// Regression: partials must be > 0 — the old top-level-only glob found zero
// FileManager::listPartialFiles() must recurse under _partials/
$partialNodes = $graph->getNodesByType('partial');
record(count($partialNodes) > 0, 'partial nodes discovered > 0 (got ' . count($partialNodes) . ')', $errors, $passed, $failed);

// Verify known partials exist
$knownPartials = ['partial:_partials/header.php', 'partial:_partials/footer.php', 'partial:_partials/nav.php'];
foreach ($knownPartials as $pId) {
    record($graph->getNode($pId) !== null, "known partial exists: {$pId}", $errors, $passed, $failed);
}

echo "--- Indexer: Include resolution (leading slash) ---\n";

// Regression: __DIR__ . '/nav.php' captured as '/nav.php', must strip leading /
// header.php includes nav.php — this edge must exist
$headerIncludes = $graph->getOutEdges('partial:_partials/header.php', 'includes');
$includeTargets = array_map(fn($e) => $e['target'], $headerIncludes);
record(in_array('partial:_partials/nav.php', $includeTargets),
    'header.php includes nav.php (leading-slash resolved)', $errors, $passed, $failed);

// nav.php's transitive consumers should reach all pages
$navTransitive = $graph->getBlastRadius('partial:_partials/nav.php');
record(count($navTransitive) === $realSummary['pages'],
    'nav.php blast radius = all pages (got ' . count($navTransitive) . ')', $errors, $passed, $failed);

echo "--- Indexer: Shared partial tagging ---\n";

// footer and header should be shared (5 pages include them)
$header = $graph->getNode('partial:_partials/header.php');
$footer = $graph->getNode('partial:_partials/footer.php');
record(($header['meta']['isShared'] ?? false) === true, 'header.php tagged as shared', $errors, $passed, $failed);
record(($footer['meta']['isShared'] ?? false) === true, 'footer.php tagged as shared', $errors, $passed, $failed);

echo "--- Indexer: Repeated link edges ---\n";

// Regression: every href occurrence must have its own edge
// _partials/nav.php links to /contact 3 times (lines 46, 101, 110)
$contactEdges = $graph->getInEdges('route:/contact', 'links_to');
$navContactEdges = array_filter($contactEdges, fn($e) => $e['source'] === 'partial:_partials/nav.php');
record(count($navContactEdges) >= 3,
    'nav.php → route:/contact has >= 3 edges (got ' . count($navContactEdges) . ')', $errors, $passed, $failed);

// Total /contact edges should be > 3 (pages also link)
record(count($contactEdges) >= 3,
    'total /contact inbound >= 3 (got ' . count($contactEdges) . ')', $errors, $passed, $failed);

echo "--- Indexer: Homepage link capture ---\n";

// Regression: href="/" must be captured
$homeEdges = $graph->getInEdges('route:/', 'links_to');
record(count($homeEdges) > 0, 'homepage links captured (got ' . count($homeEdges) . ')', $errors, $passed, $failed);

echo "--- Indexer: CSS token consumers ---\n";

// Regression: style.css must be an asset node and consume tokens
$cssAsset = $graph->getNode('asset:assets/css/style.css');
record($cssAsset !== null, 'style.css asset node exists', $errors, $passed, $failed);
record(($cssAsset['type'] ?? '') === 'asset', 'style.css node type is asset', $errors, $passed, $failed);

// style.css consumes at least one token via var()
$cssOutEdges = $graph->getOutEdges('asset:assets/css/style.css', 'consumes_token');
record(count($cssOutEdges) > 0,
    'style.css consumes tokens (got ' . count($cssOutEdges) . ' edges)', $errors, $passed, $failed);

echo "--- Indexer: Token blast radius (via asset) ---\n";

// Regression: token blast radius must go through asset consumers → all pages
// Find a token that style.css consumes
$sampleTokenId = null;
foreach ($cssOutEdges as $edge) {
    $sampleTokenId = $edge['target'];
    break;
}

if ($sampleTokenId !== null) {
    $tokenBlast = $graph->getBlastRadius($sampleTokenId);
    record(count($tokenBlast) === $realSummary['pages'],
        "token {$sampleTokenId} blast radius = all pages (got " . count($tokenBlast) . ')', $errors, $passed, $failed);
} else {
    record(false, 'no token consumed by style.css — cannot test token blast radius', $errors, $passed, $failed);
}

// Asset blast radius = all pages
$assetBlast = $graph->getBlastRadius('asset:assets/css/style.css');
record(count($assetBlast) === $realSummary['pages'],
    'style.css blast radius = all pages (got ' . count($assetBlast) . ')', $errors, $passed, $failed);

echo "--- Indexer: Per-link CTA context ---\n";

// Regression: nav.php line 46 has class="nav-cta" → context should be 'cta'
$navContactList = array_values($navContactEdges);
$ctaEdges = array_filter($navContactList, fn($e) => ($e['meta']['context'] ?? '') === 'cta');
record(count($ctaEdges) >= 1,
    'nav.php has >= 1 CTA-context /contact edge (got ' . count($ctaEdges) . ')', $errors, $passed, $failed);

// The other nav.php /contact edges should be 'nav'
$navContextEdges = array_filter($navContactList, fn($e) => ($e['meta']['context'] ?? '') === 'nav');
record(count($navContextEdges) >= 1,
    'nav.php has >= 1 nav-context /contact edge (got ' . count($navContextEdges) . ')', $errors, $passed, $failed);

echo "--- Indexer: Section summaries ---\n";

// SiteGraphIndexer::extractSectionSummaries is a standalone static method
$testHtml = '<section id="hero"><h1>Welcome</h1></section><section id="about" aria-label="About Us"><h2>Our Team</h2></section>';
$sections = SiteGraphIndexer::extractSectionSummaries($testHtml);
record(count($sections) === 2, 'extractSectionSummaries: 2 sections', $errors, $passed, $failed);
record(str_contains($sections[0] ?? '', 'Welcome'), 'section 1 has heading text', $errors, $passed, $failed);
record(str_contains($sections[1] ?? '', 'About Us'), 'section 2 has aria-label', $errors, $passed, $failed);

echo "--- Indexer: Hierarchy metadata on real site ---\n";

// All real page nodes should have hierarchy metadata (flat site = all level 1)
$pageNodes = $graph->getNodesByType('page');
foreach ($pageNodes as $pNode) {
    $pMeta = $pNode['meta'];
    record(array_key_exists('level', $pMeta), "hierarchy meta: {$pNode['id']} has level", $errors, $passed, $failed);
    record(array_key_exists('parentPageId', $pMeta), "hierarchy meta: {$pNode['id']} has parentPageId", $errors, $passed, $failed);
    record(array_key_exists('hierarchySource', $pMeta), "hierarchy meta: {$pNode['id']} has hierarchySource", $errors, $passed, $failed);
    record(array_key_exists('childCount', $pMeta), "hierarchy meta: {$pNode['id']} has childCount", $errors, $passed, $failed);
}
// Structural consistency: levels are valid and parent references exist
$allLevelsValid = true;
$allParentsValid = true;
foreach ($pageNodes as $pNode) {
    if (($pNode['meta']['level'] ?? 0) < 1) $allLevelsValid = false;
    $pid = $pNode['meta']['parentPageId'] ?? null;
    if ($pid !== null && $graph->getNode($pid) === null) $allParentsValid = false;
}
record($allLevelsValid, 'real site: all pages level >= 1', $errors, $passed, $failed);
record($allParentsValid, 'real site: all parentPageId references are valid nodes or null', $errors, $passed, $failed);


// ═══════════════════════════════════════════
//  Results
// ═══════════════════════════════════════════

echo "\n=== Results ===\n";
echo "Passed: {$passed}\n";
echo "Failed: {$failed}\n";

if (!empty($errors)) {
    echo "\n--- Failures ---\n";
    foreach ($errors as $error) {
        echo "  {$error}\n";
    }
}

echo "\nTotal: " . ($passed + $failed) . " tests\n";
exit($failed > 0 ? 1 : 0);
